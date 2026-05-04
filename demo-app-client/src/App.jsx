import React, { useState, useEffect } from "react";
import "./index.css";

const cleanPromptTitle = (rawTitle) => {
  return rawTitle
    .replace(/^\d+_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
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
    setDescription("");
    setError("");
  }, [selectedPrompt]);

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
    setPreviewUrl(URL.createObjectURL(file));
  };

  const extractJSON = (text) => {
    // 1. Try standard JSON extraction
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // Continue to resilient extraction if parse fails
      }
    }

    // 2. Resilient regex-based extraction (handles truncated or malformed JSON)
    const data = {};
    const keyValRegex = /"([^"]+)":\s*(?:"([^"]*)"|\[([^\]]*)\]|([0-9.]+)|(true|false|null))/g;
    let m;
    while ((m = keyValRegex.exec(text)) !== null) {
      const key = m[1];
      let value;
      if (m[2] !== undefined) value = m[2];
      else if (m[3] !== undefined) {
        value = m[3]
          .split(",")
          .map((s) => s.trim().replace(/^"|"$/g, ""))
          .filter((s) => s !== "");
      } else if (m[4] !== undefined) value = Number(m[4]);
      else if (m[5] !== undefined) {
        if (m[5] === "true") value = true;
        else if (m[5] === "false") value = false;
        else value = null;
      }

      if (value !== undefined && data[key] === undefined) {
        data[key] = value;
      }
    }

    return Object.keys(data).length > 0 ? data : null;
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

      if (!response.ok) throw new Error("Upload failed");

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


              {previewUrl && (
                <div className="preview-wrapper">
                  <div className="preview-header">
                    <span>Preview</span>
                    <span>
                      {imageFile?.name} · {(imageFile?.size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="preview-box">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="preview-image"
                    />
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

              const isBlank = (val) => {
                if (val === null || val === undefined) return true;
                if (typeof val === "string") {
                  const lower = val.trim().toLowerCase();
                  return (
                    lower === "" ||
                    lower === "n/a" ||
                    lower === "none" ||
                    lower === "unknown" ||
                    lower === "null" ||
                    lower === "not applicable"
                  );
                }
                if (Array.isArray(val)) return val.length === 0;
                if (typeof val === "object") return Object.keys(val).length === 0;
                return false;
              };

              const getEntries = (obj, prefix = "") => {
                let entries = [];
                for (const [key, value] of Object.entries(obj)) {
                  if (isBlank(value)) continue;

                  const label = key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase());
                  const fullLabel = prefix ? `${prefix} - ${label}` : label;

                  if (
                    typeof value === "object" &&
                    !Array.isArray(value) &&
                    value !== null
                  ) {
                    entries = entries.concat(getEntries(value, fullLabel));
                  } else {
                    // De-duplicate array values to handle AI loops
                    const finalValue = Array.isArray(value)
                      ? [...new Set(value)]
                      : value;
                    entries.push({ label: fullLabel, value: finalValue });
                  }
                }
                return entries;
              };

              const entries = getEntries(data);

              if (entries.length === 0) {
                return (
                  <div className="result-box">
                    No relevant structured data found.
                  </div>
                );
              }

              const selectedPromptObj = prompts.find(
                (p) => p.content === selectedPrompt
              );
              const title = selectedPromptObj
                ? cleanPromptTitle(selectedPromptObj.title)
                : "Analysis Results";

              return (
                <div className="result-grid">
                  <div className="result-card">
                    <h3>{title}</h3>

                    {entries.map((entry, idx) => (
                      <p key={idx}>
                        <strong>{entry.label}:</strong>{" "}
                        {Array.isArray(entry.value)
                          ? entry.value.join(", ")
                          : entry.value.toString()}
                      </p>
                    ))}
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