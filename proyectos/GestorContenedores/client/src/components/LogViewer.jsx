import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { BASE_URL } from '../config';


const LogViewer = ({ containerId }) => {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);

    useEffect(() => {
        // Initialize xterm
        const term = new Terminal({
            theme: {
                background: '#0f172a',
                foreground: '#f8fafc',
                cursor: 'transparent', // Hide cursor for logs
            },
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 12,
            disableStdin: true, // Read-only
            convertEol: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();
        xtermRef.current = term;

        // Connect socket
        const socket = io(`${BASE_URL}/logs`, {

            query: { id: containerId }
        });

        socket.on('log', (data) => {
            term.write(data);
        });

        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        return () => {
            socket.disconnect();
            term.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [containerId]);

    return <div ref={terminalRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />;
};

export default LogViewer;
