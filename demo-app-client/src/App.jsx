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
  const [singleGT, setSingleGT] = useState(null);
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
      setSingleGT(null);
      setImages([]);
    } else {
      setImages(files);
      setSinglePreview(null);
      setSingleImage(null);
      setSingleGT(null);
    }
  };

  const handleSingleUpload = async (e) => {
    e.preventDefault();
    if (!singleImage) return;

    setSingleLoading(true);
    setError("");
    setSingleResult("");
    setSingleGT(null);

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
      
      const contentStr = result.metadata 
        ? JSON.stringify(result.metadata, null, 2) 
        : (result.description || "No output");
        
      setSingleResult(contentStr);
      setSingleGT(result.gt);
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
    const jsonMatch = text.match(/\{[\s\S]*\}/) || text.match(/\{[\s\S]*/);
    if (jsonMatch) {
      let rawJson = jsonMatch[0];
      
      const tryParse = (str) => {
        try { return JSON.parse(str); } catch (e) { return null; }
      };

      // 1. Try standard parse
      let parsed = tryParse(rawJson);
      if (parsed) return parsed;

      // 2. Heuristic repair
      let repaired = rawJson.trim();
      
      // Fix unclosed quotes in property values
      // Find the last instance of [ "value and check if it's unclosed
      if ((repaired.match(/"/g) || []).length % 2 !== 0) {
        repaired += '"';
      }

      // Fix dangling commas before closing characters
      repaired = repaired.replace(/,\s*([\}\]])/g, '$1');

      // Recursively close brackets and braces
      const balance = (str, openChar, closeChar) => {
        const count = (str.match(new RegExp(`\\${openChar}`, 'g')) || []).length - 
                      (str.match(new RegExp(`\\${closeChar}`, 'g')) || []).length;
        return str + closeChar.repeat(Math.max(0, count));
      };

      repaired = balance(repaired, '[', ']');
      repaired = balance(repaired, '{', '}');

      return tryParse(repaired);
    }
    return null;
  };

  const humanize = (str) => {
    if (!str) return "";
    return str.toString()
      .trim()
      .replace(/_/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderContent = (text) => {
    const data = extractJSON(text);
    if (!data) return <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>{text}</p>;

    const isBlank = (val) => {
      if (val === null || val === undefined) return true;
      if (typeof val === "string") return val.trim() === "" || ["n/a", "none", "unknown"].includes(val.toLowerCase());
      return Array.isArray(val) ? val.length === 0 : false;
    };

    const entries = [];
    for (const [k, v] of Object.entries(data)) {
        if (isBlank(v)) continue;
        const label = humanize(k);
        
        const formatValue = (val) => {
          if (val === null || val === undefined) return "";
          if (typeof val === 'object') {
            if (val.text) return humanize(val.text);
            // Join all non-object values (e.g. type + color)
            return Object.values(val)
              .filter(innerV => typeof innerV !== 'object')
              .map(innerV => humanize(innerV))
              .join(" ");
          }
          return humanize(val);
        };

        let value = "";
        if (Array.isArray(v)) {
          value = v.map(item => formatValue(item)).join(", ");
        } else {
          value = formatValue(v);
        }
        entries.push({ label, value: value.toString() });
    }

    return (
      <div className="metadata-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Detected Attribute</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <td className="row-label">{e.label}</td>
                <td className="row-value">{e.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderGTComparison = () => {
    if (!singleGT) return null;

    return (
      <div className="gt-panel-v2">
        <h3 className="section-title">Benchmark Validation</h3>
        <table className="modern-table gt-table">
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Reference (GT)</th>
              <th>VLM Prediction</th>
              <th style={{ textAlign: 'center' }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(singleGT).map(([key, data], i) => (
              <tr key={i}>
                <td className="row-label">{humanize(key)}</td>
                <td>{humanize(data.gt)}</td>
                <td>{humanize(data.vlm)}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`status-pill ${data.match ? 'match' : 'mismatch'}`}>
                    {data.match ? 'Match' : 'Diff'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '20px' }}
                >
                  {singleLoading ? 'AI Analyzing...' : 'Deep Analysis'}
                </button>
              </div>
            )}

            {images.length > 0 && !singleImage && (
              <div className="batch-controls">
                <p style={{ fontWeight: 600, fontSize: '13px' }}>{images.length} Images Ready</p>
                <button 
                  onClick={startBatchProcessing} 
                  disabled={uploading || processing} 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  {uploading ? 'Uploading...' : 'Launch Batch Analysis'}
                </button>
              </div>
            )}

            <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Operation Queue</h3>
                <QueueDisplay />
            </div>
          </div>

          <div className="panel central-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Analysis Output</h2>
                {results.length > 0 && (
                  <button 
                    onClick={() => window.location.href='/batch-results?format=csv'}
                    className="btn btn-secondary"
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
                   {renderGTComparison()}
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