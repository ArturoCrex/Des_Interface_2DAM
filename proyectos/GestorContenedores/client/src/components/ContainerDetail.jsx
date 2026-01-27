import React, { useState } from 'react';
import { Play, Square, RefreshCw, Pause, Activity, FileText, Terminal, Info, AlertOctagon } from 'lucide-react';
import StatsGraph from './StatsGraph';
import LogViewer from './LogViewer';
import WebTerminal from './WebTerminal';

const ContainerDetail = ({ container, onAction }) => {
    const [activeTab, setActiveTab] = useState('info');
    const { id, name, image, state, statusColor, oomKilled, ports } = container;

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className="btn"
            style={{
                background: activeTab === id ? 'var(--color-info)' : 'transparent',
                borderBottom: activeTab === id ? '2px solid white' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                opacity: activeTab === id ? 1 : 0.7
            }}
        >
            <Icon size={16} /> {label}
        </button>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>

            {/* Header */}
            <div style={{
                background: 'var(--bg-card)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {name}
                        <span style={{
                            fontSize: '0.8rem',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: `var(--color-${statusColor === 'green' ? 'success' : statusColor === 'red' ? 'danger' : 'warning'})`,
                            color: '#000',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            {state}
                        </span>
                    </h2>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {image} <span style={{ opacity: 0.5 }}>|</span> {id.substring(0, 12)}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" disabled={state === 'running'} onClick={() => onAction(id, 'start')} title="Start">
                        <Play size={20} fill="currentColor" />
                    </button>
                    <button className="btn" disabled={state !== 'running'} onClick={() => onAction(id, 'stop')} title="Stop">
                        <Square size={20} fill="currentColor" />
                    </button>
                    <button className="btn" onClick={() => onAction(id, 'restart')} title="Restart">
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0' }}>
                <TabButton id="info" icon={Info} label="Overview" />
                <TabButton id="stats" icon={Activity} label="Stats" />
                <TabButton id="logs" icon={FileText} label="Logs" />
                <TabButton id="exec" icon={Terminal} label="Terminal" />
            </div>

            {/* Content Area */}
            <div style={{
                flex: 1,
                background: 'var(--bg-card)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative'
            }}>

                {activeTab === 'info' && (
                    <div style={{ padding: '2rem' }}>
                        <h3>Container Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                            <div className="info-item">
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Created</label>
                                <p>{container.created || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Status</label>
                                <p style={{ color: `var(--color-${statusColor === 'green' ? 'success' : statusColor === 'red' ? 'danger' : 'warning'})` }}>{container.status}</p>
                            </div>
                            <div className="info-item">
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>IP Address</label>
                                {/* This would need more detailed inspect data, placeholder for now */}
                                <p>{'172.17.0.x'}</p>
                            </div>
                        </div>

                        {oomKilled && (
                            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <AlertOctagon size={24} color="var(--color-danger)" />
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--color-danger)' }}>OOM Killed Detected</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>This container was previously killed by the system due to Out Of Memory errors.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div style={{ height: '100%' }}>
                        <StatsGraph containerId={id} memoryLimit={container.memoryLimit} cpuLimit={container.cpuLimit} />
                    </div>
                )}

                {activeTab === 'logs' && (
                    <LogViewer containerId={id} />
                )}

                {activeTab === 'exec' && (
                    state === 'running' ? (
                        <WebTerminal containerId={id} />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <Terminal size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>Container must be running to access terminal.</p>
                        </div>
                    )
                )}

            </div>
        </div>
    );
};

export default ContainerDetail;
