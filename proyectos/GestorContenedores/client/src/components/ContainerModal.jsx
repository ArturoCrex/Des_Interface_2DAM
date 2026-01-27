import React from 'react';
import { X } from 'lucide-react';
import StatsGraph from './StatsGraph';
import LogViewer from './LogViewer';
import WebTerminal from './WebTerminal';

const ContainerModal = ({ container, mode, onClose }) => {
    if (!container || !mode) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: 'var(--bg-card)',
                width: '90%',
                maxWidth: '1000px',
                height: '80vh',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {mode === 'stats' && 'Resources Monitor'}
                        {mode === 'logs' && 'Container Logs'}
                        {mode === 'exec' && 'Terminal Access'}
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '1rem' }}>
                            / {container.name}
                        </span>
                    </h2>
                    <button onClick={onClose} className="btn" style={{ padding: '0.5rem' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', padding: '1rem', position: 'relative' }}>
                    {mode === 'stats' && (
                        <StatsGraph
                            containerId={container.id}
                            memoryLimit={container.memoryLimit}
                            cpuLimit={container.cpuLimit} // Note: This might be 0 if not set, handled in graph
                        />
                    )}
                    {mode === 'logs' && <LogViewer containerId={container.id} />}
                    {mode === 'exec' && <WebTerminal containerId={container.id} />}
                </div>
            </div>
        </div>
    );
};

export default ContainerModal;
