# Gen AI Powered Clothing Store - Project Plan

**Repo Base:** OneProductIQ (Qwen-VL:2B visual analysis)  
**Goal:** Convert to agentic e-commerce platform with intelligent product discovery, chatbot, and metadata extraction  
**Complexity:** Medium-High (VLM + RAG + Agentic workflows)

---

## Architecture Overview

> **Architecture Reference:** Based on `Ecommerece_pipeline.png` — extended with GenAI services (VLM, LLM, Agent, dual-DB RAG)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (React App + Chatbot Widget)                                                       │
│                                                                                              │
│ ┌─────────────────┐  ┌──────────┐  ┌────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│ │ Product Detail  │  │  Home    │  │   Search   │  │ Login/Register │  │ Admin Dashboard │ │
│ └─────────────────┘  └──────────┘  │ (text/img) │  └────────────────┘  └─────────────────┘ │
│                                     └────────────┘                                           │
│                                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Chatbot Widget (persistent – page updates without closing chatbot)                      │ │
│ │                                                                                          │ │
│ │ • Product search & recommendations   • Add to cart   • View product in-page            │ │
│ │ • Session memory (per-conversation)                                                     │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                            │
                              REST API / WebSocket
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ FASTAPI BACKEND (Port 8000)                                                                  │
│                                                                                              │
│ /products   /cart   /auth   /search   /chat   /ingest                                        │
│                                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ AGENT EXECUTOR (LangGraph — Port 8001)                                                   │ │
│ │                                                                                          │ │
│ │ ┌──────────────────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ INPUT ROUTER (rule-based, no LLM cost)                                               │ │ │
│ │ │                                                                                      │ │ │
│ │ │ Image only? ─► VLM (extract rich text & metadata) ─► Embed text ─►                   │ │ │
│ │ │                  ChromaDB & MongoDB                                                  │ │ │
│ │ │                                                                                      │ │ │
│ │ │ Text only?  ─► Embed text ─► ChromaDB ─► Filter in MongoDB                           │ │ │
│ │ │                                                                                      │ │ │
│ │ │ Text+Image? ─► VLM (rich text) ║ Embed Text ─► Merge & Re-rank                       │ │ │
│ │ └──────────────────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                                          │ │
│ │ Agent Tools:                                                                             │ │
│ │ search_products │ get_recommendations │ add_to_cart                                      │ │
│ │ get_inventory   │ view_product        │ chat_with_user                                   │ │
│ │                                                                                          │ │
│ │ Memory: MemorySaver (session) │ Guardrails (HITL) │ Checkpointing                        │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┬──────────────────────────────┘
                           │                                   │
        ┌──────────────────▼───────────┐     ┌────────────────▼────────────────────────────┐
        │ AI SERVICES                   │     │ DATA LAYER                                 │
        │                               │     │                                            │
        │ ┌───────────────────────────┐ │     │ ┌────────────────────────────────────────┐ │
        │ │ VLM Service               │ │     │ │ MongoDB (Port 27017)                   │ │
        │ │ (Qwen-VL:2B)              │ │     │ │                                        │ │
        │ │ Port: 5000                │ │     │ │ Collection 1 — products                │ │
        │ │ vLLM                      │ │     │ │ ┌────────────────────────────────────┐ │ │
        │ │                           │ │     │ │ │ product_id (shared with ChromaDB)  │ │ │
        │ │ • Image → metadata JSON ->│ │     │ │ │ category, sub_category, color,     │ │ │
        │ │   mongodb -> Sent Trans   │ │     │ │ │ pattern, brand, price, sizes,      │ │ │
        │ └─────────────┬─────────────┘ │     │ │ │ material, occasions                │ │ │
        │               │               │     │ │ │ availability_status                │ │ │
        │               │               │     │ │ │                                    │ │ │
        │ ┌─────────────▼─────────────┐ │     │ │ │                                    │ │ │
        │ │ LLM Service               │ │     │ │ └────────────────────────────────────┘ │ │
        │ │ (Groq / Gemini API)       │ │     │ │                                        │ │
        │ │                           │ │     │ │ Collection 2 — users & sessions        │ │
        │ │ • Text → reasoning        │ │     │ │ ┌────────────────────────────────────┐ │ │
        │ │ • Response generation     │ │     │ │ │ user_id, name, email, preferences  │ │ │
        │ └───────────────────────────┘ │     │ │ │ cart [{product_id, qty, size}]     │ │ │
        └───────────────────────────────┘     │ │ │ session_history                    │ │ │
                                              │ │ │ order_history                      │ │ │
                                              │ │ │ search_history                     │ │ │
                                              │ │ └────────────────────────────────────┘ │ │
                                              │ └────────────────────────────────────────┘ │
                                              │                                            │
                                              │ ┌────────────────────────────────────────┐ │
                                              │ │ ChromaDB (Port 8288)                   │ │
                                              │ │                                        │ │
                                              │ │ Collection — text_embeddings           │ │
                                              │ │ ┌───────────────────────────────────┐  │ │
                                              │ │ │ product_id                        │  │ │
                                              │ │ │ (FK → MongoDB Collection 1)       │  │ │
                                              │ │ │ text_embedding                    │  │ │
                                              │ │ │ (Sentence Transformer of          │  │ │
                                              │ │ │ VLM rich text)                    │  │ │
                                              │ │ │ image_path (local/S3 path)        │  │ │
                                              │ │ └───────────────────────────────────┘  │ │
                                              │ └────────────────────────────────────────┘ │
                                              │                                            │
                                              │ ┌────────────────────────────────────────┐ │
                                              │ │ Image Server                           │ │
                                              │ │ (static file serving)                  │ │
                                              │ │ Serves product images to frontend      │ │
                                              │ └────────────────────────────────────────┘ │
                                              └────────────────────────────────────────────┘
```
