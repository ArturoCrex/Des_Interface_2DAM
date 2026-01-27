import React from 'react';
import { Play, Square, RefreshCw, Pause, Activity, FileText, Terminal, AlertOctagon } from 'lucide-react';

const ContainerCard = ({ container, onAction, onOpenStats, onOpenLogs, onOpenTerm }) => {
  const { id, name, image, state, statusColor, oomKilled } = container;

  const shortId = id.substring(0, 12);

  return (
    <div className="card" style={{ borderColor: statusColor === 'red' ? 'rgba(239, 68, 68, 0.3)' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{name}</h3>
          <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{image}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div className={`status-indicator status-${statusColor}`} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{state}</span>
            {oomKilled && (
              <span style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                fontSize: '0.75rem',
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AlertOctagon size={12} /> OOM KILLED
              </span>
            )}
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
          {shortId}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className="btn"
          disabled={state === 'running'}
          onClick={() => onAction(id, 'start')}
          title="Start"
          style={{ justifyContent: 'center' }}
        >
          <Play size={16} fill="currentColor" />
        </button>
        <button
          className="btn"
          disabled={state !== 'running'}
          onClick={() => onAction(id, 'stop')}
          title="Stop"
          style={{ justifyContent: 'center' }}
        >
          <Square size={16} fill="currentColor" />
        </button>
        <button
          className="btn"
          onClick={() => onAction(id, 'restart')}
          title="Restart"
          style={{ justifyContent: 'center' }}
        >
          <RefreshCw size={16} />
        </button>
        <button
          className="btn"
          disabled={state !== 'running'}
          onClick={() => onAction(id, state === 'paused' ? 'unpause' : 'pause')}
          title={state === 'paused' ? "Resume" : "Pause"}
          style={{ justifyContent: 'center' }}
        >
          <Pause size={16} fill="currentColor" />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button className="btn" style={{ flex: 1, fontSize: '0.8rem' }} onClick={onOpenStats}>
          <Activity size={16} /> Stats
        </button>
        <button className="btn" style={{ flex: 1, fontSize: '0.8rem' }} onClick={onOpenLogs}>
          <FileText size={16} /> Logs
        </button>
        <button className="btn" style={{ flex: 1, fontSize: '0.8rem' }} onClick={onOpenTerm} disabled={state !== 'running'}>
          <Terminal size={16} /> Exec
        </button>
      </div>
    </div>
  );
};

export default ContainerCard;
