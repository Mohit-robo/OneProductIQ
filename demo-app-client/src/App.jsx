import React, { useState, useEffect } from "react";
import "./index.css";

const cleanPromptTitle = (rawTitle) => {
  return rawTitle.replace(/^\d+_/, "");
};

const App = () => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState("");

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const res = await fetch("/prompts");

        if (res.ok) {
          const data = await res.json();
          setPrompts(data.prompts || []);

          if (data.prompts?.length > 0) {
            setSelectedPrompt(data.prompts[0].content);
          }
        }
      } catch (err) {
        console.error("Prompt loading failed", err);
      }
    };

    fetchPrompts();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImageFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const extractJSON = (text) => {
  try {
      const match = text.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : null;
    } catch {
      return null;
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!imageFile) return;

    setLoading(true);
    setError("");
    setDescription("");

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("prompt", selectedPrompt || "");

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      setDescription(result.description || "No response returned");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setDescription("");
    setError("");
  };

  return (
    <div className="page-shell">
      <div className="app-card">
        <div className="header-section">
          <div>
            <h1>Product Intelligence</h1>
            <p>Upload an image and analyze ecommerce metadata</p>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="layout-grid">
          <div className="panel">
            <h2>Upload Product Image</h2>

            <form onSubmit={handleImageUpload}>
              <div className="field-group">
                <label>Select Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </div>

              {prompts.length > 0 && (
                <div className="field-group">
                  <label>Prompt Template</label>
                  <select
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    disabled={loading}
                  >
                    {prompts.map((prompt, idx) => (
                      <option key={idx} value={prompt.content}>
                        {cleanPromptTitle(prompt.title)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {previewUrl && (
                <div className="preview-wrapper">
                  <div className="preview-header">
                    <span>Preview</span>
                    <span>
                      {imageFile?.name} · {(imageFile?.size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="preview-box">
                    <img src={previewUrl} alt="preview" className="preview-image" />
                  </div>
                </div>
              )}

              <div className="button-row">
                <button
                  type="submit"
                  disabled={loading || !imageFile}
                  className="primary-btn"
                >
                  {loading ? "Processing..." : "Analyze Product"}
                </button>

                <button
                  type="button"
                  onClick={resetAll}
                  className="secondary-btn"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="panel">
            <h2>Results</h2>

            {!description && (
              <div className="placeholder-box">
                Upload an image and run analysis.
              </div>
            )}

            {description && (() => {
              const data = extractJSON(description);

              if (!data) {
                return (
                  <div className="result-box">
                    <p>{description}</p>
                  </div>
                );
              }

              return (
                <div className="result-grid">
                  
                  {/* Product Info */}
                  <div className="result-card">
                    <h3>Product Info</h3>
                    <p><strong>Type:</strong> {data.product_type || "-"}</p>
                    <p><strong>Category:</strong> {data.main_category || "-"}</p>
                    <p><strong>Subcategory:</strong> {data.subcategory || "-"}</p>
                    <p><strong>Brand:</strong> {data.brand || "-"}</p>
                  </div>

                  {/* Attributes */}
                  <div className="result-card">
                    <h3>Attributes</h3>
                    <p><strong>Primary Color:</strong> {data.primary_color || "-"}</p>
                    <p><strong>Pattern:</strong> {data.pattern || "-"}</p>
                    <p><strong>Fit:</strong> {data.fit || "-"}</p>
                  </div>

                  {/* Style */}
                  <div className="result-card">
                    <h3>Style & Usage</h3>
                    <p><strong>Occasion:</strong> {(data.occasions || []).join(", ")}</p>
                    <p><strong>Gender:</strong> {data.target_gender || "-"}</p>
                    <p><strong>Age Group:</strong> {data.age_demographic || "-"}</p>
                  </div>

                </div>
              );
            })()}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;