
import React from 'react';
import { Box, Server, Activity } from 'lucide-react';
import '../index.css';

const Sidebar = ({ containers, selectedId, onSelect }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <Box size={24} color="#3b82f6" />
                <h2>Containers ({containers.length})</h2>
            </div>

            <div className="sidebar-content">
                {containers.length === 0 ? (
                    <div className="sidebar-empty">
                        <Activity size={16} />
                        <span>No containers active</span>
                    </div>
                ) : (
                    <ul className="sidebar-list">
                        {containers.map((container) => {
                            const statusColor =
                                container.state === 'running' ? 'status-green' :
                                    container.state === 'exited' ? 'status-red' : 'status-yellow';

                            return (
                                <li
                                    key={container.id}
                                    className={`sidebar-item ${selectedId === container.id ? 'active' : ''}`}
                                    onClick={() => onSelect(container.id)}
                                    style={{ cursor: 'pointer', background: selectedId === container.id ? 'rgba(59, 130, 246, 0.2)' : undefined, borderLeft: selectedId === container.id ? '3px solid #3b82f6' : '3px solid transparent' }}
                                >
                                    <span className={`status-indicator ${statusColor}`}></span>
                                    <span className="container-name" title={container.name}>
                                        {container.name}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className="sidebar-footer">
                <div className="footer-item">
                    <span className="status-indicator status-green"></span> Running
                </div>
                <div className="footer-item">
                    <span className="status-indicator status-yellow"></span> Other
                </div>
                <div className="footer-item">
                    <span className="status-indicator status-red"></span> Exited
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
