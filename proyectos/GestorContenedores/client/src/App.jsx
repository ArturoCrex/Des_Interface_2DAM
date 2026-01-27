import React, { useEffect, useState } from 'react';
import { Package, RefreshCw, AlertTriangle, Zap, Terminal as TermIcon, FileText } from 'lucide-react';
import './index.css';
import ContainerDetail from './components/ContainerDetail';
import Sidebar from './components/Sidebar';

import { API_URL } from './config';


function App() {
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContainerId, setSelectedContainerId] = useState(null);

    const fetchContainers = async () => {
        try {
            const res = await fetch(`${API_URL}/containers`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setContainers(data);
            } else {
                console.error("Failed to load containers:", data);
                // Optional: set an error state to show to user
            }
            setLoading(false);
        } catch (err) {
            console.error("Fetch error:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContainers();
        const interval = setInterval(fetchContainers, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id, action) => {
        try {
            await fetch(`${API_URL}/containers/${id}/${action}`, { method: 'POST' });
            fetchContainers();
        } catch (err) {
            console.error(err);
            alert('Action failed');
        }
    };

    const activeContainer = containers.find(c => c.id === selectedContainerId);

    return (
        <div className="app-container">
            <Sidebar
                containers={containers}
                selectedId={selectedContainerId}
                onSelect={setSelectedContainerId}
            />

            <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <header className="dashboard-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Zap size={32} color="#3b82f6" />
                        <h1 className="dashboard-title">Docker Pulse</h1>
                    </div>
                    <button className="btn" onClick={fetchContainers}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                </header>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {loading ? (
                        <p>Loading containers...</p>
                    ) : (
                        !activeContainer ? (
                            <div style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-secondary)',
                                opacity: 0.5
                            }}>
                                <Package size={64} style={{ marginBottom: '1rem' }} />
                                <h2>Select a container</h2>
                                <p>Choose a container from the sidebar to view details</p>
                            </div>
                        ) : (
                            <ContainerDetail
                                container={activeContainer}
                                onAction={handleAction}
                            />
                        )
                    )}
                </div>
            </main>
        </div>
    );
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: '#ef4444' }}>
                    <h1>Something went wrong.</h1>
                    <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function AppWrapper() {
    return (
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
}
