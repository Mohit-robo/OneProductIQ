import React, { useState, useEffect } from 'react';

export const QueueDisplay = ({ isProcessing, resultCount }) => {
  const [status, setStatus] = useState({ 
    queueLength: 0, 
    paused: false, 
    processing: false,
    currentFileName: null,
    totalCount: 0
  });

  useEffect(() => {
    let interval;
    interval = setInterval(async () => {
      try {
        const res = await fetch('/batch-status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) { }
    }, 3000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const togglePause = async () => {
    const endpoint = status.paused ? '/batch-process/resume' : '/batch-process/pause';
    try {
      await fetch(endpoint, { method: 'POST' });
      setStatus(prev => ({ ...prev, paused: !prev.paused }));
    } catch (err) { }
  };

  const total = status.totalCount || (status.queueLength + resultCount);
  const percent = total > 0 ? (resultCount / total) * 100 : 0;

  return (
    <div className="status-container" style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: status.processing ? '#10b981' : '#cbd5e1' 
          }}></div>
          <span style={{ fontWeight: 600 }}>
            {status.paused ? 'Paused' : status.processing ? 'AI Status' : 'Idle'}
          </span>
        </div>
        <span style={{ color: '#64748b' }}>{resultCount} of {total} done</span>
      </div>

      <div style={{ 
        width: '100%', 
        height: '8px', 
        background: '#e2e8f0', 
        borderRadius: '4px', 
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{ 
          width: `${percent}%`, 
          height: '100%', 
          background: '#070707', 
          transition: 'width 1s ease-in-out' 
        }}></div>
      </div>

      <button
        onClick={togglePause}
        disabled={total === 0}
        className="primary-btn"
        style={{ width: '100%', opacity: total === 0 ? 0.3 : 1 }}
      >
        {status.paused ? 'Resume Batch' : 'Pause Batch'}
      </button>

      {status.processing && status.currentFileName && (
        <p style={{ 
          fontSize: '11px', 
          textAlign: 'center', 
          marginTop: '10px', 
          color: '#64748b',
          fontStyle: 'italic'
        }}>
          Analyzing: <span style={{ fontWeight: 600, color: '#070707' }}>{status.currentFileName}</span>
        </p>
      )}
    </div>
  );
};