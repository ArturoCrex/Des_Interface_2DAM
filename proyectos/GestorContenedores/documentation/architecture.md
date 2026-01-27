# Arquitectura y Explicación del Código

## Visión General
La aplicación sigue un patrón **BFF (Backend for Frontend)** simplificado.

1.  **Frontend (React)**: Pide datos y mantiene websockets abiertos para datos en tiempo real.
2.  **Backend (Node)**: Traduce peticiones HTTP y eventos Socket.io a llamadas a la API de Docker Engine.

---

## 📂 Backend (`/server/index.js`)

Es el núcleo lógico. Sus responsabilidades principales son:

### 1. API REST (`/api/containers`)
Obtiene la lista de contenedores y, para cada uno, hace una inspección profunda (`inspect()`) para obtener límites de memoria y flags como `OOMKilled`.

```javascript
// server/index.js
app.get('/api/containers', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    // Hacemos inspect para sacar detalles como OOMKilled o límites de RAM
    const fullData = await Promise.all(containers.map(async (c) => {
      const formatted = formatContainer(c);
      try {
        const container = docker.getContainer(c.Id);
        const data = await container.inspect();
        formatted.oomKilled = data.State.OOMKilled; // <--- Detección OOM
        formatted.memoryLimit = data.HostConfig.Memory;
        formatted.cpuLimit = data.HostConfig.NanoCpus;
      } catch (e) { /* ... */ }
      return formatted;
    }));
    res.json(fullData);
  } catch (err) { /* ... */ }
});
```

*   **Transformación de Datos**: Normaliza el estado de Docker (que es complejo) a un semáforo sencillo: `green` (sano/running), `yellow` (starting/unhealthy), `red` (exited).

### 2. WebSockets (`Socket.io`)
Maneja 3 namespaces para separar el tráfico:

*   `/stats`: Usa `container.stats({stream: true})`. Docker envía un JSON continuo con métricas crudas. El servidor las parcea y emite al cliente solo lo necesario.

```javascript
// server/index.js (WebSocket Stats)
io.of('/stats').on('connection', (socket) => {
  const containerId = socket.handshake.query.id;
  container.stats({ stream: true }, (err, stream) => {
    // Docker envía datos crudos continuamente
    const onData = (chunk) => {
      try {
        const stats = JSON.parse(chunk.toString());
        socket.emit('stats', stats); // Reenviamos al frontend
      } catch (e) {}
    };
    stream.on('data', onData);
  });
});
```

*   `/logs`: Se conecta a los streams `stdout` y `stderr` del contenedor y los reenvía tal cual.
*   `/terminal`: Usa `container.exec()`. Crea una sesión interactiva.

---

## 📂 Frontend (`/client/src`)

### `App.jsx` (Controlador Principal)
Mantiene el estado global y gestiona el **Polling** para mantener la lista actualizada.

```javascript
// client/src/App.jsx
const fetchContainers = async () => {
    try {
        const res = await fetch(`${API_URL}/containers`);
        const data = await res.json();
        if (Array.isArray(data)) {
            setContainers(data); // Actualizamos estado
        }
        setLoading(false);
    } catch (err) { /* ... */ }
};

useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 3000); // Polling cada 3s
    return () => clearInterval(interval);
}, []);
```

### `components/Sidebar.jsx`
Lista de navegación izquierda.
*   Recibe la lista y el ID seleccionado.
*   Aplica la clase `.active` visualmente al elemento seleccionado.

### `components/ContainerDetail.jsx`
El panel derecho "inteligente". Muestra información estática (Header) y un sistema de pestañas dinámico.
*   **Importante**: Monta y desmonta componentes según la pestaña. Por ejemplo, `WebTerminal` solo se conecta cuando haces clic en la pestaña "Terminal", ahorrando recursos.

### `components/StatsGraph.jsx`
Visualización de datos `recharts`.
*   Calcula el % de CPU usando la fórmula diferencial de Docker (Delta CPU / Delta Sistema * Num CPUs).

```javascript
// client/src/components/StatsGraph.jsx
socket.on('stats', (stat) => {
    // Calculamos uso de CPU comparando el "tick" actual con el anterior
    if (stat.cpu_stats && stat.precpu_stats) {
        const cpuDelta = stat.cpu_stats.cpu_usage.total_usage - stat.precpu_stats.cpu_usage.total_usage;
        const systemCpuDelta = stat.cpu_stats.system_cpu_usage - stat.precpu_stats.system_cpu_usage;
        const numberCpus = stat.cpu_stats.online_cpus || 1;

        if (systemCpuDelta > 0 && cpuDelta > 0) {
            cpuPercent = (cpuDelta / systemCpuDelta) * numberCpus * 100.0;
        }
    }
    // ...
});
```

### `components/WebTerminal.jsx`
Implementación de `xterm.js`.
*   Es una emulación completa de terminal VT100.
*   Se ajusta al tamaño del contenedor div usando `xterm-addon-fit`.
