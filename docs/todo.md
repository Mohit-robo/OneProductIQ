# Task Tracking: GenAI Clothing Store

This document tracks the step-by-step execution of the GenAI E-Commerce Platform project.

---

### Phase 1: Foundation Setup (Week 1)
**Goal:** Local environment working, tools installed

- [ ] Spin up MongoDB container using docker-compose
- [ ] Set up ChromaDB container using docker-compose
- [ ] Verify Qwen-VL:2B runs locally via docker (vLLM server on port 5000) | https://docs.vllm.ai/en/stable/deployment/docker/
- [ ] Create docker image for Python backend; install FastAPI, LangGraph, Pydantic
- [ ] Setup Node.js + Frontend docker containers
- [ ] **Deliverable:** `docker-compose.yml` with all services running locally

---

### Phase 2: Data Schema & Product Metadata (Week 1-2)
**Goal:** Define required metadata fields and extraction pipeline

- [ ] Define Pydantic schema for `ProductMetadata` (attributes, visual details, sizing, etc.)
- [ ] Create VLM inference wrapper (call Qwen-VL:2B API from FastAPI backend)
- [ ] Build data ingestion script (`ingest_products.py`) to process images in batch
- [ ] Ensure ingestion script runs *inside* the FastAPI container using `docker exec`
- [ ] Process and populate MongoDB with initial sample products
- [ ] **Deliverable:** `ProductMetadata.py`, `ingest_products.py`, and MongoDB populated with sample data

---

### Phase 3: RAG Pipeline (Week 2-3)
**Goal:** Embeddings in ChromaDB, semantic search working

- [ ] Configure ChromaDB persistent storage in the backend environment
- [ ] Setup text embeddings generation using `sentence-transformers` for product metadata
- [ ] Implement dual-sync logic: when a product is inserted/updated in MongoDB, embed its text and save to ChromaDB (using shared `product_id`)
- [ ] Implement `search_products(query)` retrieval logic using ChromaDB cosine similarity
- [ ] Write tests for semantic search functionality
- [ ] **Deliverable:** RAG pipeline module running inside the FastAPI container

---

### Phase 4: Agent Definition & Tools (Week 3-4)
**Goal:** LangGraph agent with tools (search, recommend, add_to_cart)

- [ ] Define `AgentState` schema (conversation history, current search results, cart, recommendations)
- [ ] Implement core tools: `search_products`, `get_recommendations`, `add_to_cart`, `get_inventory`
- [ ] Build LangGraph workflow nodes (Input Router, LLM/Agent Node, Tool Executor Node, Conditional routing)
- [ ] Integrate LangSmith for tracing, debugging, and monitoring the agent's reasoning flow
- [ ] Implement Guardrails and Human-in-the-Loop (HITL) flags for ambiguous or out-of-stock product requests
- [ ] **Deliverable:** `agent.py` defining the LangGraph ReAct agent and successful LangSmith traces

---

### Phase 5: FastAPI Integration (Week 4-5)
**Goal:** Expose agent as REST API, integrate with existing backend

- [ ] Create `/chat` POST endpoint as the main entry point for the LangGraph agent
- [ ] Create `/search` GET endpoint for direct RAG-powered semantic search
- [ ] Create `/cart/add` endpoint leveraging the agent's tool logic
- [ ] Integrate session memory (`MemorySaver`) so the agent remembers conversation context across `/chat` requests
- [ ] Test API endpoints via Swagger UI / Postman
- [ ] **Deliverable:** Updated `main.py` routing API requests to the LangGraph executor

---

### Phase 6: Frontend Integration & Chatbot Widget (Week 5-6)
**Goal:** React chatbot widget calls agent API, displays results

- [ ] Build/Update persistent `ChatbotWidget` React component
- [ ] Connect widget to the FastAPI `/chat` endpoint
- [ ] Render dynamic agent responses (text replies, product cards, recommendations) within the chat UI
- [ ] Update Product Detail page to fetch and display intelligent recommendations
- [ ] Test End-to-End flow: User Text/Image Query -> Agent -> Results -> Add to Cart
- [ ] **Deliverable:** Functional React application with agentic features live

---

### Phase 7: Deployment & CI/CD (Week 7-8)
**Goal:** Finalize Docker multi-container deployment and set up GitHub Actions

- [ ] Verify `docker-compose up --build` works seamlessly across all services (MongoDB, Chroma, VLM, FastAPI, Frontend)
- [ ] Configure `.github/workflows/ci-cd.yml` for automated testing and image building
- [ ] Finalize production-ready documentation (`README.md`, `ARCHITECTURE.md`, `SETUP.md`)
- [ ] **Deliverable:** CI/CD pipeline and polished documentation
