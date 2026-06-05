# Gen AI Powered Clothing Store - Project Plan

**Repo Base:** OneProductIQ (Qwen-VL:2B visual analysis)  
**Goal:** Convert to agentic e-commerce platform with intelligent product discovery, chatbot, and metadata extraction  
**Timeline:** Phased, 8-10 weeks  
**Complexity:** Medium-High (VLM + RAG + Agentic workflows)

---

## Phase 1: Architecture Overview

### 1. System Diagram

> **Architecture Reference:** Based on `Ecommerece_pipeline.png` — extended with GenAI services (VLM, LLM, Agent, dual-DB RAG)

```
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │  FRONTEND  (React App + Chatbot Widget)                                              │
 │                                                                                      │
 │  ┌─────────────┐  ┌────────┐  ┌───────────┐  ┌──────────────┐  ┌─────────────────┐ │
 │  │Product Detail│  │  Home  │  │   Search  │  │Login/Register│  │  Admin Dashboard│ │
 │  └─────────────┘  └────────┘  │ (text/img)│  └──────────────┘  └─────────────────┘ │
 │                                └───────────┘                                         │
 │  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
 │  │  Chatbot Widget  (persistent – page updates without closing chatbot)            │ │
 │  │  • Product search & recommendations  • Add to cart  • View product in-page     │ │
 │  │  • Session memory (per-conversation)                                            │ │
 │  └─────────────────────────────────────────────────────────────────────────────────┘ │
 └───────────────────────────────────────┬──────────────────────────────────────────────┘
                  REST API / WebSocket   │
                                         ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │  FASTAPI BACKEND  (Port 8000)                                                        │
 │                                                                                      │
 │  /products   /cart   /auth   /search   /chat   /ingest                               │
 │                                                                                      │
 │  ┌──────────────────────────────────────────────────────────────────────────────┐   │
 │  │  AGENT EXECUTOR  (LangGraph — Port 8001)                                     │   │
 │  │                                                                              │   │
 │  │  ┌─────────────────────────────────────────────────────────────────────┐    │   │
 │  │  │  INPUT ROUTER  (rule-based, no LLM cost)                            │    │   │
 │  │  │                                                                     │    │   │
 │  │  │   Image only? ──► VLM first ──► ChromaDB ──► MongoDB (metadata)    │    │   │
 │  │  │   Text only?  ──► LLM first ──► MongoDB  ──► ChromaDB (images)     │    │   │
 │  │  │   Text+Image? ──► VLM (embed) ║ LLM (parse) ─► Merge & Re-rank     │    │   │
 │  │  └─────────────────────────────────────────────────────────────────────┘    │   │
 │  │                                                                              │   │
 │  │  Agent Tools:  search_products │ get_recommendations │ add_to_cart          │   │
 │  │                get_inventory   │ view_product        │ chat_with_user        │   │
 │  │                                                                              │   │
 │  │  Memory: MemorySaver (session) │ Guardrails (HITL) │ Checkpointing          │   │
 │  └──────────────────────────────────────────────────────────────────────────────┘   │
 └──────────┬───────────────────────────┬───────────────────────────────────────────────┘
            │                           │
  ┌─────────▼────────┐       ┌──────────▼──────────────────────────────────────────────┐
  │  AI SERVICES     │       │  DATA LAYER                                             │
  │                  │       │                                                         │
  │ ┌──────────────┐ │       │  ┌──────────────────────────────────────────────────┐  │
  │ │  VLM Service │ │       │  │  MongoDB  (Port 27017)                           │  │
  │ │ (Qwen-VL:2B) │ │       │  │                                                  │  │
  │ │  Port: 5000  │ │       │  │  Collection 1 — products                        │  │
  │ │   vLL        │ │       │  │  ┌────────────────────────────────────────────┐  │  │
  │ │  • Image →   │ │       │  │  │ product_id  (shared key with ChromaDB)     │  │  │
  │ │    embedding │ │       │  │  │ category, sub_category, color, pattern     │  │  │
  │ │  • Image →   │ │       │  │  │ brand, price, sizes, material, occasions   │  │  │
  │ │    metadata  │ │       │  │  │ availability_status                        │  │  │
  │ │    JSON      │ │       │  │  │ text_embedding  (sentence-transformers)    │  │  │
  │ └──────┬───────┘ │       │  │  └────────────────────────────────────────────┘  │  │
  │        │ image   │       │  │                                                  │  │
  │        │ embeds  │       │  │  Collection 2 — users & sessions                 │  │
  │        │         │       │  │  ┌────────────────────────────────────────────┐  │  │
  │ ┌──────▼───────┐ │       │  │  │ user_id, name, email, preferences          │  │  │
  │ │  LLM Service │ │       │  │  │ cart  [ {product_id, qty, size} ]          │  │  │
  │ │(Groq / Gemini│ │       │  │  │ session_history  (chatbot memory)          │  │  │
  │ │    API)      │ │       │  │  │ order_history, search_history (from sessions) │  │
  │ │              │ │       │  │  └────────────────────────────────────────────┘  │  │
  │ │  • Text →    │ │       │  └──────────────────────────────────────────────────┘  │
  │ │   reasoning  │ │       │                                                        │
  │ │  • Response  │ │       │  ┌──────────────────────────────────────────────────┐  │
  │ │   generation │ │       │  │  ChromaDB  (Port 8288)                           │  │
  │ └──────────────┘ │       │  │                                                  │  │
  └──────────────────┘       │  │  Collection — image_embeddings                   │  │
                             │  │  ┌────────────────────────────────────────────┐  │  │
                             │  │  │ product_id  (FK → MongoDB Collection 1)    │  │  │
                             │  │  │ image_embedding  (VLM feature vector)      │  │  │
                             │  │  │ image_path  (local/S3 path)                │  │  │
                             │  │  └────────────────────────────────────────────┘  │  │
                             │  └──────────────────────────────────────────────────┘  │
                             │                                                        │
                             │  ┌──────────────────────────────────────────────────┐  │
                             │  │  Image Server  (static file serving)             │  │
                             │  │  Serves product images to Frontend               │  │
                             │  └──────────────────────────────────────────────────┘  │
                             └─────────────────────────────────────────────────────────┘
```

### Phase 1: Foundation Setup (Week 1)
**Goal:** Local environment working, tools installed

- [ ] Spin up MongoDB container using docker-compose
- [ ] Set up ChromaDB container using docker-compose
- [ ] Verify Qwen-VL:2B runs locally via docker (vLLM server on port 5000) | https://docs.vllm.ai/en/stable/deployment/docker/ 
- [ ] Create docker image for Python backend  install FastAPI, LangGraph, Pydantic
- [ ] Setup Node.js + Frontend docker containers
- [ ] **Deliverable:** `docker-compose.yml` with all services

**Resources:**
- vLLM docs: https://docs.vllm.ai/en/latest/
- LangGraph: https://langchain-ai.github.io/langgraph/
