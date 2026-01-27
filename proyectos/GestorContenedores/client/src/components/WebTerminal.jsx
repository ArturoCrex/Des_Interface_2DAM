import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { BASE_URL } from '../config';


const WebTerminal = ({ containerId }) => {
    const terminalRef = useRef(null);

    useEffect(() => {
        const term = new Terminal({
            theme: {
                background: '#0f172a',
                foreground: '#f8fafc',
                cursor: '#10b981',
            },
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 13,
            cursorBlink: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        const socket = io(`${BASE_URL}/terminal`, {

            query: { id: containerId }
        });

        // Write data from server to terminal
        socket.on('data', (data) => {
            term.write(data);
        });

        // Write input from terminal to server
        term.onData((data) => {
            socket.emit('data', data);
        });

        // Handle resize
        const handleResize = () => {
            fitAddon.fit();
            // Ideally send resize to server here if supported
            // socket.emit('resize', { cols: term.cols, rows: term.rows }); 
        };
        window.addEventListener('resize', handleResize);

        return () => {
            socket.disconnect();
            term.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [containerId]);

    return <div ref={terminalRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />;
};

export default WebTerminal;
