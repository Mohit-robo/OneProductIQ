import React, { useState, useEffect } from 'react';
import { QueueDisplay } from './components/QueueDisplay';

export default function App() {
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [folderMode, setFolderMode] = useState(false);
  
  // Single analysis state
  const [singleImage, setSingleImage] = useState(null);
  const [singlePreview, setSinglePreview] = useState(null);
  const [singleResult, setSingleResult] = useState("");
  const [singleLoading, setSingleLoading] = useState(false);
  const [error, setError] = useState("");

  // Check initial status and start polling if needed
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/batch-status');
        if (res.ok) {
          const data = await res.json();
          if (data.resultsCount > 0) {
            setResults(new Array(data.resultsCount).fill({}));
          }
          if (data.processing || data.queueLength > 0) {
            setProcessing(true);
          }
        }
      } catch (err) { }
    };
    checkStatus();
  }, []);

  // Poll for results if processing batch
  useEffect(() => {
    let interval;
    if (processing) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/batch-status');
          if (res.ok) {
            const data = await res.json();
            if (data.resultsCount > results.length) {
                setResults(new Array(data.resultsCount).fill({}));
            }
            if (!data.processing && data.queueLength === 0) {
              setProcessing(false);
            }
          }
        } catch (err) { }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [processing, results.length]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(f => 
      f.type.startsWith('image/') || 
      f.name.toLowerCase().endsWith('.zip') ||
      folderMode // Accept all if in folder mode (backend filters)
    );

    if (files.length === 1 && !folderMode && !files[0].name.toLowerCase().endsWith('.zip')) {
      setSingleImage(files[0]);
      setSinglePreview(URL.createObjectURL(files[0]));
      setSingleResult("");
      setImages([]);
    } else {
      setImages(files);
      setSinglePreview(null);
      setSingleImage(null);
    }
  };

  const handleSingleUpload = async (e) => {
    e.preventDefault();
    if (!singleImage) return;

    setSingleLoading(true);
    setError("");
    setSingleResult("");

    const formData = new FormData();
    formData.append("image", singleImage);
    formData.append("prompt", "");

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");
      const result = await response.json();
      setSingleResult(result.description || "No output");
    } catch (err) {
      setError(err.message);
    } finally {
      setSingleLoading(false);
    }
  };

  const startBatchProcessing = async () => {
    if (images.length === 0 || uploading) return;

    setUploading(true);
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));

    try {
      const res = await fetch('/batch-process', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setProcessing(true);
        setImages([]); 
      } else {
        const data = await res.json();
        setError(data.error || "Batch failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setUploading(false);
    }
  };

  const extractJSON = (text) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { }
    }
    return null;
  };

  const renderContent = (text) => {
    const data = extractJSON(text);
    if (!data) return <p>{text}</p>;

    const isBlank = (val) => {
      if (val === null || val === undefined) return true;
      if (typeof val === "string") return val.trim() === "" || ["n/a", "none"].includes(val.toLowerCase());
      return Array.isArray(val) ? val.length === 0 : false;
    };

    const entries = [];
    for (const [k, v] of Object.entries(data)) {
        if (isBlank(v)) continue;
        const label = k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        entries.push({ label, value: Array.isArray(v) ? v.join(", ") : v.toString() });
    }

    return (
      <div className="result-grid">
        {entries.map((e, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: '#64748b', fontSize: '12px', marginRight: '6px' }}>{e.label}:</span>
            <span style={{ fontSize: '13px' }}>{e.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-shell">
      <div className="app-card">
        <header className="header-section">
          <h1>OneProductIQ</h1>
          <p>Metadata Enrichment Station</p>
        </header>

        {error && <div className="error-box">{error}</div>}

        <div className="layout-grid">
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2>Source Selection</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span style={{ color: folderMode ? '#070707' : '#94a3b8', fontWeight: 600 }}>Folder Mode</span>
                <input 
                  type="checkbox" 
                  checked={folderMode} 
                  onChange={() => setFolderMode(!folderMode)} 
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
            
            <div className="field-group">
              <label>{folderMode ? 'Select Product Folder' : 'Product Images / ZIP'}</label>
              <input 
                type="file" 
                multiple={!folderMode}
                webkitdirectory={folderMode ? "true" : undefined}
                directory={folderMode ? "true" : undefined}
                onChange={handleFileChange} 
              />
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                {folderMode 
                  ? 'Note: All compatible images within the folder will be queued.' 
                  : 'Upload images or a .zip archive containing product shots.'}
              </p>
            </div>

            {singleImage && (
              <div className="preview-wrapper">
                <div className="preview-header">
                   <span>Selected: {singleImage.name}</span>
                </div>
                <div className="preview-box">
                   <img src={singlePreview} alt="Target" className="preview-image" />
                </div>
                <button 
                  onClick={handleSingleUpload} 
                  disabled={singleLoading} 
                  className="primary-btn" 
                  style={{ width: '100%', marginTop: '20px' }}
                >
                  {singleLoading ? 'AI Analyzing...' : 'Deep Analysis'}
                </button>
              </div>
            )}

            {images.length > 0 && (
              <div className="batch-controls">
                <p style={{ fontWeight: 600, fontSize: '13px' }}>{images.length} Images Ready</p>
                <button 
                  onClick={startBatchProcessing} 
                  disabled={uploading || processing} 
                  className="primary-btn" 
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  {uploading ? 'Uploading...' : 'Launch Batch Analysis'}
                </button>
              </div>
            )}

            <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Operation Queue</h3>
                <QueueDisplay isProcessing={processing} resultCount={results.length} />
            </div>
          </div>

          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Analysis Output</h2>
                {results.length > 0 && (
                  <button 
                    onClick={() => window.location.href='/batch-results?format=csv'}
                    className="secondary-btn"
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    Export Batch CSV ({results.length})
                  </button>
                )}
            </div>

            <div className="placeholder-box">
              {singleResult && (
                <div className="result-card" style={{ border: '2px solid #070707' }}>
                   <h3>Active Deep-Dive</h3>
                   {renderContent(singleResult)}
                </div>
              )}

              {!singleResult && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.3 }}>
                   <p>No processed data to display yet.</p>
                </div>
              )}

              {!singleResult && results.length > 0 && (
                <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
                   <p style={{ fontSize: '18px', fontWeight: 600 }}>Batch Processing Active</p>
                   <p style={{ fontSize: '13px', marginTop: '10px' }}>Individual results are hidden in batch mode. Use the Export button to download data.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}