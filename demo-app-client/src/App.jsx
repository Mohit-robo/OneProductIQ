import React, { useState, useEffect } from "react";

const App = () => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState("");

  // Load prompts on mount
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const res = await fetch("/prompts");
        if (res.ok) {
          const data = await res.json();
          setPrompts(data.prompts);
          if (data.prompts.length > 0) {
            setSelectedPrompt(data.prompts[0].content);
          }
        }
      } catch (err) {
        console.error("Failed to load prompts:", err);
      }
    };
    fetchPrompts();
    
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", imageFile);
    if (selectedPrompt) {
      formData.append("prompt", selectedPrompt);
    }

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Upload failed");
      }

      const result = await response.json();
      setDescription(result.description || "No description returned");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">FastVLM Image Description Demo</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-100 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleImageUpload} className="space-y-4">
        <div>
          <label className="block font-medium">Select an image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            className="mt-1 w-full p-2 border rounded"
          />
        </div>

        {prompts.length > 0 && (
          <div>
            <label className="block font-medium">Prompt Template</label>
            <select
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
              disabled={loading}
              className="mt-1 w-full p-2 border rounded"
            >
              {prompts.map((p, idx) => (
                <option key={idx} value={p.content}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {previewUrl && (
          <div className="mb-2">
            <img src={previewUrl} className="max-w-xs max-h-xs rounded" alt="preview" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !imageFile}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Upload & Describe"}
        </button>
      </form>

      {description && (
        <div className="mt-6 p-4 bg-white rounded shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Generated Description</h2>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

export default App;