# GenAI Clothing Store - OneProductIQ

**Goal:** Convert to agentic e-commerce platform with intelligent product discovery, chatbot, and metadata extraction  

## Summary

**Revised Architecture:** ✅ Qwen-VL:2B (local) + Groq/Gemini LLM (remote) + LangGraph Agent + Dual-DB RAG → GenAI E-commerce  
**Reference Design:** ✅ Extended from `Ecommerece_pipeline.png` (Frontend → FastAPI → MongoDB/AI Services)  
**Search Strategy:** ✅ Rule-based input routing (text→LLM→Mongo, image→VLM→Chroma, text+image→parallel merge)  
**Chatbot:** ✅ Persistent widget, in-page product view, session memory, cart actions from chat  
**Tech Stack:** ✅ Clean, purpose-built; VLM local, LLM remote, shared `product_id` key across both DBs  
**Timeline:** 8 weeks for MVP (local + Docker)  
**Complexity:** Medium (agent workflows) → High (VLM inference + multimodal merge)  

## System Architecture

![Architecture](docs/Ecommerece_pipeline.png)

## Success Criteria & Milestones

| Milestone | Definition | Week |
|-----------|-----------|------|
| **M1: Env Setup** | All services running, MongoDB + ChromaDB live | 1 |
| **M2: Metadata Pipeline** | 100 products with extracted metadata in DB | 2 |
| **M3: RAG Working** | Semantic search returns relevant products | 3 |
| **M4: Agent Functional** | `/chat` endpoint accepts query, returns results | 4 |
| **M5: Frontend Integration** | Chatbot widget displays agent recommendations | 5 |
| **M6: E2E Demo** | Full user journey: query → search → cart → checkout | 6 |
| **M7: Docker Stack** | `docker-compose up` brings entire system up | 7 |
| **M8: Documented** | README + architecture docs complete | 8 |

## Known Challenges & Mitigations

| Challenge | Risk | Mitigation |
|-----------|------|-----------|
| **VLM Memory (2B model on CPU)** | OOM, slow inference | Use vLLM with quantization; offload to GPU if available; batch requests |
| **Qwen-VL output inconsistency** | Metadata extraction variability | Validate JSON schema post-extraction; fallback to manual defaults |
| **RAG false positives** | Semantic search returns unrelated products | Add post-filtering (price range, size, brand filters); tune embedding model |
| **Agent hallucination** | Chat recommends non-existent products | Always validate tool results against DB; ground responses in search results |
| **Latency (VLM + search + LLM)** | Slow chat response | Cache embeddings; parallelize tool calls; use lighter LLM for reasoning |
| **MongoDB connection pooling** | Connection exhaustion | Configure connection limits; use async drivers |

## Directory Structure

```
OneProductIQ/
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── backend/
│   ├── Dockerfile
│   ├── main.py                 (FastAPI + agent integration)
│   ├── models/
│   │   ├── product.py         (ProductMetadata schema)
│   │   ├── agent_state.py     (AgentState definition)
│   │   └── cart.py
│   ├── services/
│   │   ├── rag_search.py      (ChromaDB search)
│   │   ├── vlm_inference.py   (Qwen-VL API calls)
│   │   ├── agent.py           (LangGraph definition)
│   │   └── tools.py           (Tool definitions)
│   ├── data/
│   │   └── ingest_products.py (Batch VLM extraction)
│   └── requirements.txt
├── services/
│   └── vlm/
│       ├── Dockerfile
│       └── run.sh             (vLLM server launch)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatbotWidget.jsx  (Updated for /chat endpoint)
│   │   └── pages/
│   │       └── ProductDetail.jsx  (Fetch recommendations)
│   └── Dockerfile
├── data/
│   ├── products/              (Sample product images)
│   ├── mongo/                 (MongoDB persistent storage)
│   └── chroma_data/           (ChromaDB persistent storage)
└── docs/
    ├── ARCHITECTURE.md
    ├── API_SPEC.md
    └── SETUP.md
```

## Quick Start Commands

```bash
# 1. Clone repo
git clone https://github.com/Mohit-robo/OneProductIQ
cd OneProductIQ

# 2. Build & launch
docker-compose up --build

# 3. Ingest sample products (one-time)
docker exec fastapi python data/ingest_products.py --dir /data/products

# 4. Test agent
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "message": "Show me blue shirts"}'

# 5. Frontend
open http://localhost:3000
```