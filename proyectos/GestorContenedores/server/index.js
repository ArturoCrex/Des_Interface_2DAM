const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Docker = require('dockerode');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all for local dev
    methods: ['GET', 'POST']
  }
});

// Windows specific socket path usually works by default with Docker Desktop
// If fails, we might need socketPath: '//./pipe/docker_engine'
const docker = new Docker();

app.use(cors());
app.use(express.json());

// --- Helper Functions ---

const formatContainer = (containerInfo) => {
  // Determine Health Status Color
  // Green: Healthy
  // Yellow: Starting or Unhealthy (running but failing check)
  // Red: Exited or Dead
  
  let statusColor = 'red';
  let statusText = containerInfo.State; // e.g., 'running', 'exited'

  // Check if Healthcheck exists
  if (containerInfo.Status.includes('(healthy)')) {
    statusColor = 'green';
  } else if (containerInfo.Status.includes('(unhealthy)')) {
    statusColor = 'yellow';
  } else if (containerInfo.State === 'running') {
     // Running but no healthcheck or starting
    statusColor = 'green'; 
    if (containerInfo.Status.includes('(starting)')) statusColor = 'yellow';
  }

  if (containerInfo.State === 'exited' || containerInfo.State === 'dead') {
    statusColor = 'red';
  }
  
  // Note: OOMKilled is not in the list object by default, need inspect for detail, 
  // but we can infer or fetch detail on demand. 
  // For the list view, we'll return what we have.
  
  return {
    id: containerInfo.Id,
    name: containerInfo.Names[0].replace('/', ''),
    image: containerInfo.Image,
    state: containerInfo.State,
    status: containerInfo.Status,
    statusColor,
    ports: containerInfo.Ports
  };
};

// --- API Routes ---

// List Containers
app.get('/api/containers', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    // Fetch details for OOM check - could be heavy for many containers but ok for local
    const fullData = await Promise.all(containers.map(async (c) => {
      const formatted = formatContainer(c);
      
      // We need inspect to get OOMKilled and generic resource limits
      try {
        const container = docker.getContainer(c.Id);
        const data = await container.inspect();
        formatted.oomKilled = data.State.OOMKilled;
        formatted.memoryLimit = data.HostConfig.Memory; // 0 means no limit
        formatted.cpuLimit = data.HostConfig.NanoCpus; // 0 means no limit
      } catch (e) {
        console.error(`Error inspecting ${c.Id}`, e);
      }
      return formatted;
    }));
    
    res.json(fullData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Lifecycle Actions
app.post('/api/containers/:id/:action', async (req, res) => {
  const { id, action } = req.params;
  const container = docker.getContainer(id);

  try {
    switch (action) {
      case 'start': await container.start(); break;
      case 'stop': await container.stop(); break;
      case 'restart': await container.restart(); break;
      case 'pause': await container.pause(); break;
      case 'unpause': await container.unpause(); break;
      default: return res.status(400).json({ error: 'Invalid action' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- WebSockets ---

// Stats Stream
io.of('/stats').on('connection', (socket) => {
  const containerId = socket.handshake.query.id;
  if (!containerId) return socket.disconnect();

  const container = docker.getContainer(containerId);
  
  // Get stats stream
  container.stats({ stream: true }, (err, stream) => {
    if (err) return socket.emit('error', err.message);
    
    // Using a simple event listener for the stream
    const onData = (chunk) => {
      try {
        const stats = JSON.parse(chunk.toString());
        socket.emit('stats', stats);
      } catch (e) {
        // partial json, ignore
      }
    };

    stream.on('data', onData);

    socket.on('disconnect', () => {
      stream.destroy(); // Close stream on disconnect
    });
  });
});

// Logs Stream
io.of('/logs').on('connection', (socket) => {
  const containerId = socket.handshake.query.id;
  if (!containerId) return socket.disconnect();

  const container = docker.getContainer(containerId);

  // Get logs
  // tail: 100 to see recent logs
  const opts = {
    follow: true,
    stdout: true,
    stderr: true,
    tail: 100
  };

  container.logs(opts, (err, stream) => {
    if (err) return socket.emit('error', err.message);
    
    stream.on('data', (chunk) => {
      // Docker api sends header bytes, might need stripping if using raw stream, 
      // but usually for text logs it's readable enough or we strip headers.
      // 8-byte header: [STREAM_TYPE, 0, 0, 0, SIZE, SIZE, SIZE, SIZE]
      // For simplicity in this demo we send raw strings, user can clean if needed
      // or we just send the text payload.
      
      // Simple strip: removed header usually 8 chars if it looks like binary
      socket.emit('log', chunk.toString('utf8'));
    });

    socket.on('disconnect', () => {
      stream.destroy();
    });
  });
});

// Exec (Terminal)
io.of('/terminal').on('connection', (socket) => {
  const containerId = socket.handshake.query.id;
  if (!containerId) return socket.disconnect();

  const container = docker.getContainer(containerId);

  const execOpts = {
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Cmd: ['/bin/sh'] // Try sh first, widely available. fallbacks handled by frontend logic or retries? 
                     // Or we can simple use 'sh' or 'bash'
  };

  container.exec(execOpts, (err, exec) => {
    if (err) return;

    exec.start({ stdin: true, hijack: true }, (err, stream) => {
      if (err) return;

      // From web to container
      socket.on('data', (chunk) => {
        stream.write(chunk);
      });

      // From container to web
      stream.on('data', (chunk) => {
        socket.emit('data', chunk.toString('utf8'));
      });
      
      socket.on('resize', (size) => {
          exec.resize(size);
      });

      socket.on('disconnect', () => {
        stream.end();
      });
    });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
