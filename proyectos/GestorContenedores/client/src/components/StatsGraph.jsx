import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BASE_URL } from '../config';


const StatsGraph = ({ containerId, memoryLimit, cpuLimit }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const socket = io(`${BASE_URL}/stats`, {

            query: { id: containerId }
        });

        socket.on('stats', (stat) => {
            // Calculate CPU percent
            // Docker stats calculation is complex, simplified version:
            // (cpuDelta / systemCpuDelta) * number_cpus * 100
            // But we receive raw object.

            let cpuPercent = 0;
            let memUsage = 0;

            if (stat.cpu_stats && stat.precpu_stats) {
                const cpuDelta = stat.cpu_stats.cpu_usage.total_usage - stat.precpu_stats.cpu_usage.total_usage;
                const systemCpuDelta = stat.cpu_stats.system_cpu_usage - stat.precpu_stats.system_cpu_usage;
                const numberCpus = stat.cpu_stats.online_cpus || 1;

                if (systemCpuDelta > 0 && cpuDelta > 0) {
                    cpuPercent = (cpuDelta / systemCpuDelta) * numberCpus * 100.0;
                }
            }

            if (stat.memory_stats) {
                memUsage = stat.memory_stats.usage;
                // Cache usage should sometimes be subtracted depending on version, keeping simple
            }

            const point = {
                name: new Date().toLocaleTimeString(),
                cpu: parseFloat(cpuPercent.toFixed(2)),
                // Convert to MB
                memory: parseFloat((memUsage / 1024 / 1024).toFixed(2))
            };

            setData(prev => [...prev.slice(-20), point]); // Keep last 20 points
        });

        return () => socket.disconnect();
    }, [containerId]);

    const memLimitMB = memoryLimit ? (memoryLimit / 1024 / 1024).toFixed(0) : 'Host';

    return (
        <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'row', gap: '1.5rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>CPU Usage (%)</h4>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" hide />
                            <YAxis domain={[0, 100]} stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Memory Usage (MB) / Limit: {memLimitMB}MB</h4>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" hide />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StatsGraph;
