# Task Tracking: GenAI Clothing Store

This document tracks the step-by-step execution of the GenAI E-Commerce Platform project.

---

### Phase 1: Foundation Setup (Week 1)
**Goal:** Local environment working, tools installed

- [x] Spin up MongoDB container using docker-compose — `docker-compose.yml` → `mongodb` service
- [x] Set up ChromaDB container using docker-compose — `docker-compose.yml` → `chroma` service
- [x] Verify Qwen-VL:2B runs locally via docker (vLLM server on port 5000) — `services/vlm/Dockerfile` + `services/vlm/run.sh`
- [x] Create docker image for Python backend; install FastAPI, LangGraph, Pydantic — `backend/Dockerfile` + `backend/requirements.txt` + `backend/main.py` + `backend/config.py`
- [x] Setup Node.js + Frontend docker containers — `frontend/Dockerfile` (multi-stage Vite build)
- [x] **Deliverable:** `docker-compose up --build` — awaiting prompt to run

---

### Phase 2: Data Schema & Product Metadata (Week 1-2)
**Goal:** Define required metadata fields and extraction pipeline

- [x] Define Pydantic schema for `ProductMetadata` (attributes, visual details, sizing, etc.)
- [x] Create VLM inference wrapper (call Qwen-VL:2B API from FastAPI backend)
- [x] Build data ingestion script (`ingest_products.py`) to process images in batch
- [x] Ensure ingestion script runs *inside* the FastAPI container using `docker exec`
- [x] Process and populate MongoDB with initial sample products
- [x] **Deliverable:** `ProductMetadata.py`, `ingest_products.py`, and MongoDB populated with sample data

---

### Phase 3: RAG Pipeline (Week 2-3)
**Goal:** Embeddings in ChromaDB, semantic search working

- [x] Configure ChromaDB persistent storage in the backend environment
- [x] Setup text embeddings generation using `sentence-transformers` for product metadata
- [x] Implement dual-sync logic: when a product is inserted/updated in MongoDB, embed its text and save to ChromaDB (using shared `product_id`)
- [x] Implement `search_products(query)` retrieval logic using ChromaDB cosine similarity
- [x] Write tests for semantic search functionality
- [x] **Deliverable:** RAG pipeline module running inside the FastAPI container

---

### Phase 4: Agent Definition & Tools (Week 3-4)
**Goal:** LangGraph agent with tools (search, recommend, add_to_cart)

- [x] Define `AgentState` schema (conversation history, current search results, cart, recommendations)
- [x] Implement core tools: `search_products`, `get_recommendations`, `add_to_cart`, `get_inventory`
- [x] Build LangGraph workflow nodes (Input Router, LLM/Agent Node, Tool Executor Node, Conditional routing)
- [x] Integrate LangSmith for tracing, debugging, and monitoring the agent's reasoning flow
- [x] Implement Guardrails and Human-in-the-Loop (HITL) flags for ambiguous or out-of-stock product requests
- [x] **Deliverable:** `agent.py` defining the LangGraph ReAct agent and successful LangSmith traces

---

### Phase 5: FastAPI Integration (Week 4-5)
**Goal:** Expose agent as REST API, integrate with existing backend

- [x] Create `/chat` POST endpoint as the main entry point for the LangGraph agent
- [x] Create `/search` GET endpoint for direct RAG-powered semantic search
- [x] Create `/cart/add` endpoint leveraging the agent's tool logic (handled statefully client-side & in-agent state)
- [x] Integrate session memory (`MemorySaver`) so the agent remembers conversation context across `/chat` requests
- [x] Test API endpoints via Swagger UI / Postman / Frontend Widgets
- [x] **Deliverable:** Updated `main.py` routing API requests to the LangGraph executor

---

### Phase 6: Frontend Integration & Chatbot Widget (Week 5-6)
**Goal:** React chatbot widget calls agent API, displays results

- [x] Build/Update persistent `ChatbotWidget` React component
- [x] Connect widget to the FastAPI `/chat` endpoint
- [x] Render dynamic agent responses (text replies, product cards, recommendations) within the chat UI
- [x] Update Product Detail page to fetch and display intelligent recommendations
- [x] Test End-to-End flow: User Text/Image Query -> Agent -> Results -> Add to Cart
- [ ] **TODO:** Fix RAG retrieval mismatch bug: Frontend incorrectly reports "1 Products found" (bad grammar and inaccurate count) while actually rendering 5 products on screen. Investigate state desynchronization between the result counter and the rendered components.
- [x] **Deliverable:** Functional React application with agentic features live

---

### Phase 7: Deployment & CI/CD (Week 7-8)
**Goal:** Finalize Docker multi-container deployment and set up GitHub Actions

- [x] Verify `docker-compose up --build` works seamlessly across all services (MongoDB, Chroma, VLM, FastAPI, Frontend)
- [x] Configure `.github/workflows/ci-cd.yml` for automated testing and image building
- [x] Finalize production-ready documentation (`README.md`, `ARCHITECTURE.md`, `SETUP.md`)
- [x] **Deliverable:** CI/CD pipeline and polished documentation

---

### Phase 8: Pipeline Stabilization & Admin UX (Post-Launch)
**Goal:** Harden the multimodal search pipeline and improve the admin ingestion experience

#### Completed
- [x] Ghost vector cleanup: deleted 2 orphaned ChromaDB IDs that caused phantom search results
- [x] Atomic ingestion: `/upload` now immediately upserts to ChromaDB after MongoDB insert
- [x] Separate `/analyze` endpoint: search-bar image uploads are read-only (no DB write); fixes bug where visual search created new products in catalogue
- [x] `/search` empty-query fix: blank query returns `[]`; storefront starts clean on load
- [x] Image persistence on Admin upload: images saved to writable volume `./data/products/uploads/`; URL stored in `image_paths`
- [x] Writable uploads volume: separate Docker volume mount for uploads, dataset remains read-only
- [x] Image carousel: `<ImageCarousel>` with prev/next arrows + dot indicators across product grid, detail view, and recommendations
- [x] Admin panel — SKU input field before VLM analysis trigger
- [x] Admin panel — extra images: attach additional catalogue images; all saved under `image_paths`
- [x] Admin panel — editable extraction results with "Confirm & Save" button (`PUT /product/{id}`)
- [x] Admin panel — removed Ground Truth comparison block from UI
- [x] Search bar camera icon + animated cart badge polish
- [x] Startup empty state replaced with welcoming search prompt

#### Pending
- [ ] RAG relevance tuning: "1 Products found" counter mismatch + loosely relevant recommendations
- [ ] **Zip batch ingestion (future):** Allow admin to upload a `.zip` of product folders (images + `metadata.csv`). Backend unzips and calls `ingest_products.py` per entry. Note: `ingest_products.py` script already assumes `metadata.csv` is present — no manual file-check needed in admin UI.

---

### Phase 9: Evaluation Pipeline
**Goal:** Establish a robust framework to quantitatively measure VLM extraction, RAG retrieval, and Agent response quality against ground truth (`styles.csv`).

- [x] Create evaluation plan based on Confident AI guidelines (VLM, RAG, LLM, Agent metrics).
- [x] Create initial VLM evaluation script (`vlm_eval.py`) mapping dataset images to `styles.csv`.
- [x] Implement LLM-as-a-judge (Gemini) for semantic matching of VLM outputs against ground truth.
- [ ] Implement DeepEval test suite for RAG metrics (Contextual Precision, Recall, Relevancy).
- [ ] Implement DeepEval test suite for Agent/LLM metrics (Faithfulness, Answer Relevancy, Tool Correctness).
- [ ] Run full evaluation across the 750+ product catalog and establish baseline scores.
- [ ] Tune ChromaDB retrieval parameters and Agent prompts based on evaluation results.
