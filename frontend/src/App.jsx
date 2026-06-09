import React, { useState, useEffect } from "react";
import { 
  Search, Image as ImageIcon, ShoppingBag, Plus, Upload, X,
  CheckCircle, AlertCircle, RefreshCw, Sparkles, SlidersHorizontal, ArrowLeft, ChevronLeft, ChevronRight
} from "lucide-react";
import ChatbotWidget from "./components/ChatbotWidget";

const ImageCarousel = ({ product, altClass, customStyle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Collect all valid images (fallback to image_path if no image_paths)
  const images = (product.image_paths && product.image_paths.length > 0) 
    ? product.image_paths 
    : (product.image_path ? [product.image_path] : ["/products/placeholder.jpg"]);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit" }}>
      <img 
        src={images[currentIndex]} 
        alt={product.product_type} 
        className={altClass || "product-image"}
        style={{ ...customStyle, width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => {
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' fill='%231f2937'%3E%3Crect width='100%25' height='100%25'/%3E%3C/svg%3E";
        }}
      />
      {images.length > 1 && (
        <>
          <button 
            onClick={prevImage} 
            style={{ position: "absolute", top: "50%", left: "8px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "white", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, backdropFilter: "blur(4px)" }}
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextImage} 
            style={{ position: "absolute", top: "50%", right: "8px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "white", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, backdropFilter: "blur(4px)" }}
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>
          <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 10 }}>
            {images.map((_, idx) => (
              <div key={idx} style={{ width: idx === currentIndex ? "16px" : "6px", height: "6px", borderRadius: "3px", background: idx === currentIndex ? "#fff" : "rgba(255,255,255,0.4)", transition: "all 0.2s ease" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState("shop");
  const [searchText, setSearchText] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [searchImagePreview, setSearchImagePreview] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Ingestion Workspace State
  const [ingestFile, setIngestFile] = useState(null);
  const [ingestPreview, setIngestPreview] = useState(null);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);
  const [ingestError, setIngestError] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  // Admin panel state
  const [ingestSku, setIngestSku] = useState("");
  const [extraImages, setExtraImages] = useState([]);        // extra File objects
  const [extraPreviews, setExtraPreviews] = useState([]);    // extra object URLs
  const [mongoId, setMongoId] = useState(null);             // ID returned by /upload
  const [editableMeta, setEditableMeta] = useState(null);   // editable copy of metadata
  const [saveStatus, setSaveStatus] = useState("");          // "saving"|"saved"|"error"|""

  useEffect(() => {
    if (selectedProduct) {
      const query = `${selectedProduct.product_type} ${selectedProduct.primary_color || ""}`;
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=4`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRecommendations(data.filter(p => p.sku !== selectedProduct.sku).slice(0, 4));
          }
        })
        .catch(err => console.error("Failed to fetch recommendations", err));
    } else {
      setRecommendations([]);
    }
  }, [selectedProduct]);

  // Storefront starts empty — products only appear after an explicit search

  const fetchProducts = async (query = "") => {
    setLoading(true);
    try {
      // Fetch products from `/search` endpoint or fallback if none exist
      const url = query ? `/api/search?q=${encodeURIComponent(query)}` : "/api/search?q=";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        console.error("Failed to fetch products:", res.statusText);
        setProducts([]);
      }
    } catch (e) {
      console.error("Error fetching products:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getMockProducts = () => [
    {
      sku: "PROD-001",
      product_type: "Sneaker",
      brand: "AeroForce",
      price: 120.00,
      primary_color: "White",
      pattern: "Solid",
      fit: null,
      occasions: ["casual wear", "gym", "travel"],
      image_path: "",
      material_composition: "Mesh & Leather",
      care_instructions: "Wipe with damp cloth"
    },
    {
      sku: "PROD-002",
      product_type: "Cotton Kurta",
      brand: "EthnicWear",
      price: 45.00,
      primary_color: "Red",
      pattern: "Embroidered",
      fit: "Regular",
      occasions: ["events", "casual wear", "work/office"],
      image_path: "",
      material_composition: "100% Cotton",
      care_instructions: "Hand wash cold"
    },
    {
      sku: "PROD-003",
      product_type: "Denim Jacket",
      brand: "RoughRoad",
      price: 85.00,
      primary_color: "Blue",
      pattern: "Textured",
      fit: "Oversized",
      occasions: ["casual wear", "travel"],
      image_path: "",
      material_composition: "Denim Cotton",
      care_instructions: "Machine wash cold"
    },
    {
      sku: "PROD-004",
      product_type: "Slim Fit Chinos",
      brand: "UrbanClass",
      price: 60.00,
      primary_color: "Beige",
      pattern: "Solid",
      fit: "Slim",
      occasions: ["work/office", "casual wear"],
      image_path: "",
      material_composition: "98% Cotton, 2% Spandex",
      care_instructions: "Wash with similar colors"
    }
  ];

  const handleImageSearchChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSearchImage(file);
      setSearchImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImageSearch = () => {
    setSearchImage(null);
    if (searchImagePreview) {
      URL.revokeObjectURL(searchImagePreview);
      setSearchImagePreview(null);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchImage) {
      // Visual search: analyze image with VLM but do NOT persist to DB
      setLoading(true);
      const formData = new FormData();
      formData.append("image", searchImage);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData
        });
        if (response.ok) {
          const data = await response.json();
          if (data.status === "error") {
            console.error("VLM Error:", data.detail);
            alert(`VLM Analysis Failed: ${data.detail}`);
            fetchProducts(searchText); // Fallback to just the text search
          } else {
            // Build query: combine user text + VLM-detected color + type
            const color = data.metadata?.primary_color || "";
            const type = data.metadata?.product_type || "";
            const queryStr = [searchText, color, type].filter(Boolean).join(" ");
            fetchProducts(queryStr);
          }
        }
      } catch (err) {
        console.error("Image analysis failed:", err);
        fetchProducts(searchText); // Fallback if network fails
      } finally {
        setLoading(false);
      }
    } else {
      fetchProducts(searchText);
    }
  };

  // Ingestion Workspace Actions
  const handleIngestFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIngestFile(file);
      setIngestPreview(URL.createObjectURL(file));
      setIngestResult(null);
      setIngestError("");
    }
  };

  const handleIngestSubmit = async (e) => {
    e.preventDefault();
    if (!ingestFile) return;
    setIngestLoading(true);
    setIngestError("");
    setMongoId(null);
    setEditableMeta(null);
    setSaveStatus("");

    const formData = new FormData();
    formData.append("image", ingestFile);
    formData.append("sku", ingestSku.trim());
    extraImages.forEach(f => formData.append("extra_images", f));

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error(`Server returned code ${response.status}`);
      const data = await response.json();
      if (data.status === "error") throw new Error(data.detail);
      setIngestResult(data);
      setMongoId(data.mongo_id || null);
      // Seed editable fields from extracted metadata
      setEditableMeta({ ...data.metadata });
    } catch (err) {
      setIngestError(err.message || "Failed to process image with VLM service");
    } finally {
      setIngestLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!mongoId || !editableMeta) return;
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/product/${mongoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editableMeta),
      });
      const data = await res.json();
      setSaveStatus(data.status === "success" ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    }
  };

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.sku === product.sku);
      if (existing) {
        return prev.map((item) => 
          item.sku === product.sku ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (sku) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku));
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-container" onClick={() => setActiveTab("shop")}>
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="12" x2="12" y2="22.08"></line>
          </svg>
          <span className="logo-text">OneProductIQ</span>
        </div>

        <nav className="nav-links">
          <span 
            className={`nav-link ${activeTab === "shop" ? "active" : ""}`}
            onClick={() => { setActiveTab("shop"); setSelectedProduct(null); }}
          >
            Storefront
          </span>
          <span 
            className={`nav-link ${activeTab === "ingest" ? "active" : ""}`}
            onClick={() => setActiveTab("ingest")}
          >
            VLM Ingestion (Admin)
          </span>
        </nav>

        <div className="header-actions">
          <button className="cart-button" onClick={() => setIsCartOpen(!isCartOpen)}>
            <ShoppingBag size={18} />
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="cart-count">
                {cart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {activeTab === "shop" ? (
          <>
            {selectedProduct ? (
              /* Product Details Page */
              <div className="glass-panel" style={{ padding: "2.5rem", marginTop: "1rem" }}>
                <button 
                  className="icon-btn" 
                  onClick={() => setSelectedProduct(null)}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-full)" }}
                >
                  <ArrowLeft size={16} /> Back to Catalog
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "3rem" }}>
                  <div className="card-image-wrapper" style={{ borderRadius: "var(--radius-md)" }}>
                    <ImageCarousel product={selectedProduct} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                      <span className="product-brand">{selectedProduct.brand || "Generics"}</span>
                      <h2 style={{ fontSize: "2rem", marginTop: "0.25rem" }}>{selectedProduct.brand} {selectedProduct.product_type}</h2>
                      <div className="glow-tag" style={{ marginTop: "0.75rem", fontSize: "0.75rem" }}>SKU: {selectedProduct.sku}</div>
                    </div>
                    <div style={{ fontSize: "1.75rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent-blue)" }}>
                      ${selectedProduct.price}
                    </div>

                    <div style={{ borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "1.25rem 0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div className="detail-row" style={{ border: "none", padding: 0 }}>
                        <span className="detail-label">Primary Color</span>
                        <span className="detail-value">{selectedProduct.primary_color || "Unknown"}</span>
                      </div>
                      <div className="detail-row" style={{ border: "none", padding: 0 }}>
                        <span className="detail-label">Pattern / Texture</span>
                        <span className="detail-value">{selectedProduct.pattern || "Solid"}</span>
                      </div>
                      {selectedProduct.fit && (
                        <div className="detail-row" style={{ border: "none", padding: 0 }}>
                          <span className="detail-label">Fit</span>
                          <span className="detail-value">{selectedProduct.fit}</span>
                        </div>
                      )}
                      <div className="detail-row" style={{ border: "none", padding: 0 }}>
                        <span className="detail-label">Material Composition</span>
                        <span className="detail-value">{selectedProduct.material_composition || "Cotton Blend"}</span>
                      </div>
                      <div className="detail-row" style={{ border: "none", padding: 0 }}>
                        <span className="detail-label">Care Instructions</span>
                        <span className="detail-value">{selectedProduct.care_instructions || "Machine wash"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="detail-label" style={{ display: "block", marginBottom: "0.5rem" }}>Suitable Occasions</span>
                      <div className="tag-container">
                        {(selectedProduct.occasions || ["casual wear"]).map((occ, idx) => (
                          <span key={idx} className="mini-tag" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#93c5fd", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                            {occ}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      className="search-btn" 
                      onClick={() => handleAddToCart(selectedProduct)}
                      style={{ padding: "1rem", fontSize: "1rem", justifyContent: "center", marginTop: "1rem" }}
                    >
                      <ShoppingBag size={20} /> Add to Shopping Bag
                    </button>
                  </div>
              </div>
              
              {/* Recommendations Section */}
              {recommendations.length > 0 && (
                <div style={{ marginTop: "3rem" }}>
                  <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>You Might Also Like</h3>
                  <div className="product-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                    {recommendations.map(prod => (
                      <div key={prod.sku} className="product-card" onClick={() => setSelectedProduct(prod)}>
                        <div className="card-image-wrapper">
                          <ImageCarousel product={prod} />
                        </div>
                        <div className="card-content">
                          <span className="product-brand">{prod.brand}</span>
                          <h3 className="product-title" style={{ fontSize: "1rem" }}>{prod.product_type}</h3>
                          <div className="product-footer">
                            <span className="product-price">${prod.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            ) : (
              /* Catalog Shop View */
              <>
                <div className="hero-section">
                  <span className="glow-tag">Agentic Multimodal Discovery</span>
                  <h1 className="hero-title">Elevate Your Shopping Flow</h1>
                  <p className="hero-subtitle">
                    Search using words, visual image matching, or chat directly with our AI agent to explore curated fashion.
                  </p>

                  {/* Multi-modal Search */}
                  <div className="search-container">
                    <form onSubmit={handleSearchSubmit}>
                      <div className="search-bar-wrapper">
                        <Search size={20} style={{ marginLeft: "1rem", color: "var(--text-muted)" }} />
                        <input 
                          type="text" 
                          placeholder="Search products ('cotton kurtas under $50', 'black leather bags')..." 
                          className="search-input"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                        
                        <input 
                          type="file" 
                          id="visual-search-upload" 
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleImageSearchChange}
                        />
                        <label 
                          htmlFor="visual-search-upload" 
                          title="Search by image"
                          style={{ 
                            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                            padding: "6px 14px", borderRadius: "var(--radius-full)",
                            background: searchImagePreview ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${searchImagePreview ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                            color: searchImagePreview ? "#a5b4fc" : "var(--text-muted)",
                            fontSize: "0.8rem", fontWeight: 600, transition: "all 0.2s",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 0 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          {searchImagePreview ? "Image set" : "Photo"}
                        </label>
                        
                        <button className="search-btn" type="submit">
                          <span>Search</span>
                        </button>
                      </div>

                      {searchImagePreview && (
                        <div className="image-preview-bar">
                          <div className="preview-thumbnail-container">
                            <img src={searchImagePreview} alt="Search Preview" className="preview-thumbnail" />
                            <div className="preview-info" style={{ textAlign: "left" }}>
                              <span className="preview-name">Visual search query loaded</span>
                              <span className="preview-size">Ready to search visually</span>
                            </div>
                          </div>
                          <button type="button" className="remove-img-btn" onClick={clearImageSearch}>
                            Remove
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Catalog Grid */}
                <div className="catalog-section">
                  <div className="section-header">
                    <h2 className="section-title">Product Catalog</h2>
                    <span className="results-count">
                      {products.length === 1 ? "1 Product Found" : `${products.length} Products Found`}
                    </span>
                  </div>

                  {loading ? (
                    <div className="loading-indicator">
                      <div className="loading-spinner"></div>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="empty-state">
                      <SlidersHorizontal className="empty-icon" />
                      {searchText || searchImagePreview ? (
                        <>
                          <h3>No results found</h3>
                          <p>Try different keywords, another image, or broaden your search.</p>
                        </>
                      ) : (
                        <>
                          <h3>Start exploring the catalogue</h3>
                          <p>Type a keyword, upload a photo, or chat with the AI agent below.</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="product-grid">
                      {products.map((prod) => (
                        <div 
                          key={prod.sku} 
                          className="product-card"
                          onClick={() => setSelectedProduct(prod)}
                        >
                          <div className="card-image-wrapper">
                            <ImageCarousel product={prod} />
                            <span className="card-badge">{prod.brand}</span>
                            <span className="card-price-tag">${prod.price}</span>
                          </div>
                          <div className="card-details">
                            <span className="product-brand">{prod.brand}</span>
                            <h3 className="product-name">{prod.brand} {prod.product_type}</h3>
                            <div className="tag-container">
                              <span className="mini-tag">{prod.primary_color}</span>
                              <span className="mini-tag">{prod.pattern}</span>
                              {prod.fit && <span className="mini-tag">{prod.fit}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          /* Ingestion Workspace View */
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div className="hero-section" style={{ padding: "2rem 1rem", marginBottom: "2rem" }}>
              <span className="glow-tag" style={{ border: "1px solid rgba(236, 72, 153, 0.3)", color: "#f472b6", background: "rgba(236, 72, 153, 0.08)" }}>VLM Extractor</span>
              <h1 className="hero-title" style={{ fontSize: "2.5rem" }}>Admin Ingestion Console</h1>
              <p className="hero-subtitle">Upload a product image, set a SKU, and optionally attach more catalogue images. VLM will extract metadata which you can edit before saving.</p>
            </div>

            <div className="ingest-grid">
              {/* ── Left panel: upload form ── */}
              <div className="glass-panel" style={{ padding: "2rem" }}>
                <h3 style={{ marginBottom: "1.25rem" }}>Image Upload</h3>
                <form onSubmit={handleIngestSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                  {/* SKU input */}
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Product SKU <span style={{ color: "var(--text-muted)" }}>(leave blank to auto-generate)</span></label>
                    <input
                      type="text"
                      value={ingestSku}
                      onChange={e => setIngestSku(e.target.value)}
                      placeholder="e.g. SKU-2024-001"
                      style={{ width: "100%", padding: "0.6rem 0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "0.9rem" }}
                    />
                  </div>

                  {/* Primary image picker */}
                  <input type="file" id="admin-ingest-upload" accept="image/*" style={{ display: "none" }} onChange={handleIngestFileChange} />
                  {ingestPreview ? (
                    <div style={{ position: "relative", width: "100%", aspectRatio: 1, background: "#181922", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                      <img src={ingestPreview} alt="Primary" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button type="button" className="remove-img-btn" style={{ position: "absolute", top: "10px", right: "10px" }}
                        onClick={() => { setIngestFile(null); setIngestPreview(null); setExtraImages([]); setExtraPreviews([]); setIngestResult(null); setEditableMeta(null); setMongoId(null); setSaveStatus(""); }}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="admin-ingest-upload" className="ingest-upload-card">
                      <Upload className="upload-icon" />
                      <span style={{ fontWeight: 600 }}>Click to select primary catalogue image</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>PNG, JPG, WEBP formats</span>
                    </label>
                  )}

                  {/* Extra images (shown only after primary is chosen) */}
                  {ingestFile && (
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                        Additional Catalogue Images <span style={{ color: "var(--text-muted)" }}>(optional — all saved under image_paths)</span>
                      </label>
                      <input type="file" id="admin-extra-upload" accept="image/*" multiple style={{ display: "none" }}
                        onChange={e => {
                          const files = Array.from(e.target.files);
                          setExtraImages(prev => [...prev, ...files]);
                          setExtraPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                        {extraPreviews.map((url, i) => (
                          <div key={i} style={{ position: "relative", width: "64px", height: "64px", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                            <img src={url} alt={`extra-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <button type="button" onClick={() => {
                              setExtraImages(prev => prev.filter((_, idx) => idx !== i));
                              setExtraPreviews(prev => prev.filter((_, idx) => idx !== i));
                            }} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", borderRadius: "50%", width: "18px", height: "18px", cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                          </div>
                        ))}
                        <label htmlFor="admin-extra-upload" style={{ width: "64px", height: "64px", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.5rem" }}>+</label>
                      </div>
                    </div>
                  )}

                  <button className="search-btn" type="submit" disabled={ingestLoading || !ingestFile} style={{ justifyContent: "center", width: "100%", padding: "0.85rem" }}>
                    {ingestLoading ? (
                      <><RefreshCw size={16} style={{ animation: "spin 1s infinite linear" }} /><span>Running VLM Inference…</span></>
                    ) : (
                      <><Sparkles size={16} /><span>Trigger VLM Analysis</span></>
                    )}
                  </button>
                </form>
              </div>

              {/* ── Right panel: editable extraction results ── */}
              <div className="glass-panel" style={{ padding: "2rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>Extraction Results</h3>

                {ingestError && (
                  <div style={{ display: "flex", gap: "0.5rem", color: "var(--error)", padding: "1rem", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius-md)" }}>
                    <AlertCircle size={18} /><span>{ingestError}</span>
                  </div>
                )}

                {editableMeta ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--success)" }}>
                      <CheckCircle size={20} /><span style={{ fontWeight: 700 }}>VLM Extraction Succeeded — edit fields below if needed</span>
                    </div>

                    {/* Editable fields */}
                    {[
                      ["product_type", "Product Type"],
                      ["brand", "Brand"],
                      ["primary_color", "Primary Color"],
                      ["pattern", "Pattern"],
                      ["fit", "Fit"],
                      ["material_composition", "Material Composition"],
                      ["price", "Price"],
                    ].map(([key, label]) => (
                      <div key={key} className="detail-row" style={{ alignItems: "center" }}>
                        <span className="detail-label" style={{ minWidth: "140px" }}>{label}</span>
                        <input
                          type={key === "price" ? "number" : "text"}
                          value={editableMeta[key] ?? ""}
                          onChange={e => setEditableMeta(prev => ({ ...prev, [key]: key === "price" ? parseFloat(e.target.value) : e.target.value }))}
                          style={{ flex: 1, padding: "0.4rem 0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "0.875rem" }}
                        />
                      </div>
                    ))}

                    {/* Confirm & Save */}
                    <button
                      className="search-btn"
                      onClick={handleConfirmSave}
                      disabled={saveStatus === "saving"}
                      style={{ justifyContent: "center", width: "100%", padding: "0.85rem", marginTop: "0.5rem",
                        background: saveStatus === "saved" ? "rgba(16,185,129,0.2)" : saveStatus === "error" ? "rgba(239,68,68,0.2)" : undefined }}
                    >
                      {saveStatus === "saving" && <><RefreshCw size={16} style={{ animation: "spin 1s infinite linear" }} /><span>Saving…</span></>}
                      {saveStatus === "saved" && <><CheckCircle size={16} /><span>Saved to MongoDB & ChromaDB</span></>}
                      {saveStatus === "error" && <><AlertCircle size={16} /><span>Save failed — try again</span></>}
                      {!saveStatus && <><CheckCircle size={16} /><span>Confirm &amp; Save</span></>}
                    </button>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: "2rem 0" }}>
                    <Sparkles className="empty-icon" />
                    <p>Trigger analysis to view and edit extracted product metadata before saving.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>


      {/* Cart Drawer */}
      {isCartOpen && (
        <div style={{ position: "fixed", top: 0, right: 0, width: "380px", height: "100vh", background: "var(--bg-secondary)", borderLeft: "1px solid var(--border-color)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", boxShadow: "var(--shadow-lg)", zIndex: 1000 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignNav: "center" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><ShoppingBag size={20} /> Shopping Bag</h3>
            <button className="icon-btn" onClick={() => setIsCartOpen(false)}><X size={20} /></button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: "3rem 0" }}>
                <ShoppingBag className="empty-icon" />
                <p>Your shopping bag is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.sku} style={{ display: "flex", gap: "1rem", background: "var(--bg-tertiary)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <img 
                    src={item.image_paths?.[0] || item.image_path || "/products/placeholder.jpg"} 
                    alt={item.product_type} 
                    style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "var(--radius-sm)", background: "#181922" }}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' fill='%231f2937'%3E%3Crect width='100%25' height='100%25'/%3E%3C/svg%3E";
                    }}
                  />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{item.brand} {item.product_type}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Qty: {item.qty}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--accent-blue)", fontWeight: 700 }}>${item.price * item.qty}</div>
                  </div>
                  <button 
                    className="remove-img-btn" 
                    style={{ alignSelf: "center" }}
                    onClick={() => handleRemoveFromCart(item.sku)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Total:</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                  ${cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2)}
                </span>
              </div>
              <button className="search-btn" style={{ width: "100%", justifyContent: "center", padding: "1rem" }} onClick={() => alert("Checkout not implemented in this demo phase!")}>
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Chatbot Widget */}
      <ChatbotWidget 
        onAddToCart={handleAddToCart}
        onViewProduct={(product) => {
          setSelectedProduct(product);
          setActiveTab("shop");
        }}
      />
    </div>
  );
}
