import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, ShoppingBag, ArrowRight } from "lucide-react";

export default function ChatbotWidget({ onAddToCart, onViewProduct }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I'm your AI Shopping Assistant. Ask me to find products, recommend items, or even add them to your cart!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: userText },
    ]);
    setLoading(true);

    try {
      // Send chat message to fastapi agent via proxy
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "test_user",
          message: userText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach assistant");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: data.response || "Here are some products matching your request:",
          products: data.products || [],
          recommendations: data.recommendations || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "I'm sorry, I ran into an issue connecting to the backend. Please ensure the agent service is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAction = (product, action) => {
    if (action === "cart") {
      onAddToCart(product);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "bot",
          text: `Added ${product.brand || "Product"} ${product.product_type || ""} to your cart.`,
        },
      ]);
    } else if (action === "view") {
      onViewProduct(product);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        className="chatbot-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-agent-info">
              <div className="agent-avatar">IQ</div>
              <div>
                <div className="agent-name">OneProductIQ Agent</div>
                <div className="agent-status">
                  <span className="status-dot"></span> Online
                </div>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "contents" }}>
                <div className={`chat-message ${msg.sender}`}>
                  <span>{msg.text}</span>
                  
                  {/* Embedded products list */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="chat-product-list">
                      {msg.products.map((prod) => (
                        <div key={prod.id || prod.sku} className="chat-product-card">
                          <img 
                            src={prod.image_path || "/data/products/placeholder.jpg"} 
                            alt={prod.product_type} 
                            className="chat-prod-img"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' fill='%231f2937'%3E%3Crect width='100%25' height='100%25'/%3E%3C/svg%3E";
                            }}
                          />
                          <div className="chat-prod-info">
                            <div className="chat-prod-name">{prod.brand} {prod.product_type}</div>
                            <div className="chat-prod-price">${prod.price}</div>
                          </div>
                          <button 
                            className="chat-prod-btn"
                            onClick={() => handleProductAction(prod, "view")}
                          >
                            View
                          </button>
                          <button 
                            className="chat-prod-btn"
                            onClick={() => handleProductAction(prod, "cart")}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message bot" style={{ width: "fit-content" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  <span className="status-dot" style={{ animationDelay: "0s" }}></span>
                  <span className="status-dot" style={{ animationDelay: "0.2s" }}></span>
                  <span className="status-dot" style={{ animationDelay: "0.4s" }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="chat-input"
              placeholder="Ask for red shoes, cotton tees..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button className="search-btn" type="submit" disabled={loading} style={{ padding: "0.75rem" }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
