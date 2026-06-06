# Tech Stack & Implementation Phases

## 2. Retrieval Strategy (Multi-Modal Search)

#### Case 1 — Text Only Prompt
```
User: "Show me red cotton kurtas under ₹500"
        │
        ▼
   LLM (Groq/Gemini) parses intent → keywords: [red, cotton, kurta, ≤500]
        │
        ▼
   MongoDB Collection 1 → filter by {category, color, price, material}
        │
        ▼
   ChromaDB → fetch image_paths for matched product_ids
        │
        ▼
   Return: product cards with metadata + images
```

#### Case 2 — Image Only Prompt
```
User: uploads a sneaker photo
        │
        ▼
   VLM Service (Ollama Qwen3-VL) → generates image embedding
        │
        ▼
   ChromaDB → cosine similarity search on text_embeddings
        │
        ▼
   Retrieve top-K product_ids from ChromaDB metadata
        │
        ▼
   MongoDB Collection 1 → fetch full metadata for those product_ids
        │
        ▼
   Return: visually similar products with full metadata
```

#### Case 3 — Text + Image Prompt  *(recommended approach)*
```
User: "Show me this type of sneaker in Red color" + [uploads sneaker image]
        │
        ├──────────────────────────────────────┐
        ▼                                      ▼
   VLM (parallel)                        LLM (parallel)
   Image → embedding                     Text → parsed attributes
   ChromaDB similarity search            {color: red, type: sneaker}
        │                                      │
        └──────────────┬───────────────────────┘
                       ▼
   MERGE STRATEGY: Intersect ChromaDB top-K product_ids
                   with MongoDB filter {color: red}
                   → Re-rank by combined score
        │
        ▼
   Agent returns: filtered + visually similar red sneakers
```
> **Why parallel?** VLM sets the visual similarity base; LLM refines with attribute filters.
> The image embedding anchors the "shape/style" space; the text filter trims by explicit attributes.
> This is cheaper than running sequentially and more accurate than either alone.

---

## 3. Agent Execution Design

> **Reference Repository:** See [genAI_Learning](https://github.com/Mohit-robo/genAI_Learning) for advanced RAG agent pipelines, coding standards (tools, messages, structured outputs, guardrails, middleware), and integrating agent flow debugging with LangGraph and LangSmith. Use agentic RAG capabilities wherever required in this design.

```
Incoming Request
      │
      ▼
 ┌────────────────────────────────────────────────┐
 │  INPUT CLASSIFIER  (rule-based, O(1), no LLM)  │
 │                                                │
 │  has_image AND has_text  ──► MULTIMODAL path   │
 │  has_image only          ──► VLM path          │
 │  has_text only           ──► LLM path          │
 └────────────────────────────────────────────────┘
      │              │               │
      ▼              ▼               ▼
  VLM Tool      LLM Tool       Both in parallel
 (ChromaDB)   (MongoDB)        (Merge + Re-rank)
      │              │               │
      └──────────────┴───────────────┘
                     │
                     ▼
          Agent (LangGraph ReAct)
          • Synthesizes results
          • Generates chat response
          • Calls: add_to_cart / view_product as needed
          • Guardrails: validates product exists in DB
          • HITL: flags low-confidence answers
          • LangSmith: Trace and debug agent flows natively
                     │
                     ▼
          Session Memory (MemorySaver)
          Logs conversation + cart state
```

---

## 4. Chatbot Design

| Feature | Implementation |
|---------|---------------|
| **Product Search** | Uses same RAG pipeline as main search bar |
| **Add to Cart** | Calls `add_to_cart` tool directly from chat |
| **View Product** | Page updates in-place; chatbot stays open |
| **Session Memory** | `MemorySaver` per session; user profile loaded from MongoDB Collection 2 |
| **Guardrails** | HITL flag for ambiguous queries; confidence threshold |
| **Persistent Widget** | Chatbot overlay does not close on navigation |

---

**Key Architectural Decisions:**
- ✅ **VLM local** (Qwen-VL:2B @ port 5000) — image embeddings never leave the machine
- ✅ **LLM remote** (Groq/Gemini API) — text reasoning offloaded; no GPU pressure
- ✅ **Dual-DB** (MongoDB + ChromaDB) — purpose-built for their respective workloads
- ✅ **Shared `product_id` key** — 1-to-1 linkage between Mongo and Chroma, no sync drift
- ✅ **Rule-based router** — zero LLM cost for input classification (Case 1/2/3)
- ✅ **Parallel VLM+LLM** for multimodal — fastest path for Case 3
- ✅ **LangGraph** for agent — persistent state, checkpointing, tool loops
- ✅ **LangSmith Integration** for debugging traces and analyzing agentic RAG performance
- ❌ Remove: Generic Ollama for text — Groq/Gemini API is faster and cheaper at this scale

---

## 5. Tech Stack (Finalized)

| Layer | Tool | Reasoning | Local Strategy |
|-------|------|-----------|-----------------|
| **Vision / Image Embedding** | Qwen-VL:2B (vLLM server) | Image → embedding + structured metadata JSON | Docker, port 5000 |
| **LLM / Text Reasoning** | Groq API (LLaMA 3) or Gemini API | Text intent parsing, response generation, agent orchestration | Remote API (no GPU needed) |
| **Agentic Orchestration** | LangGraph (ReAct) | Graph-based workflows, persistent state, tool use, HITL | Python library |
| **Data Validation** | Pydantic v2 | Type-safe schemas for products/cart/metadata/agent state | Python library |
| **Image Vector DB** | ChromaDB | Image embedding storage + cosine similarity search | Docker, port 8288 |
| **Document / Metadata DB** | MongoDB | products collection (metadata + text embeddings), users + cart | Docker, port 27017 |
| **Text Embeddings** | sentence-transformers (all-MiniLM-L6-v2) | Text embedding for MongoDB metadata_vectors field | Python library |
| **Backend Framework** | FastAPI | Async REST API, agent entry point, image/text routing | Docker, port 8000 |
| **Frontend** | React (existing) | Search bar, product pages, persistent chatbot widget | Docker, port 3000 |
| **Session Memory** | LangGraph MemorySaver | Per-session conversation state for chatbot | In-process |
| **Deployment** | Docker Compose (local) → MongoDB Atlas + AWS ECS (production) | Container orchestration → cloud migration | See deployment.md |

**Database Strategy:**
- **Local/Weeks 1-8:** MongoDB (metadata) + ChromaDB (vectors) — 2 separate systems
- **Production/Week 9+:** Migrate to MongoDB Atlas Vector Search — single managed database

**Not Needed:**
- Pydantic AI (use LangGraph instead; more mature)
- Tavily Search (only if you need real-time web data—skip for now)
- Kubernetes (Docker Compose sufficient for local/small scale)

---

## 6. Database Architecture Decision

### The Question: MongoDB Only vs. MongoDB + ChromaDB?

You asked: **Can we use just 1 DB instead of 2?**

**Short Answer:** YES, but with trade-offs. Recommendation: **Keep both for local dev, consolidate to single DB for production.**

---

### Option Analysis

#### Option A: MongoDB + ChromaDB (Current Plan) ✅ **RECOMMENDED for Local Dev**

```
MongoDB (collections)          ChromaDB (vector DB)
├── products                   ├── product_embeddings
├── users                      ├── metadata_embeddings
└── cart                       └── (fast similarity search)
```

**Pros:**
- ChromaDB optimized for vector similarity search (cosine, L2, dot product)
- Separate concerns (relational data vs. vector data)
- ChromaDB runs locally with zero cloud costs
- Easy to debug (separate systems = isolated failures)
- Flexible: swap ChromaDB for Weaviate/Milvus later without touching MongoDB

**Cons:**
- Two systems to manage locally
- Risk of data sync issues (product metadata in MongoDB, embeddings in ChromaDB)
- Adds complexity to deployment

**Use Case:** Perfect for your situation (local learning + MVP). Zero cloud costs.

---

#### Option B: MongoDB Atlas Vector Search (Single Cloud DB) ⭐ **RECOMMENDED for Production**

```
MongoDB Atlas (cloud)
├── products (with embeddings field)
│   {
│     "sku": "...",
│     "name": "...",
│     "embedding": [0.123, 0.456, ...]  ← Vector field
│   }
├── users
└── cart
```

**Pros:**
- Single database (no sync issues)
- MongoDB handles both relational + vector queries
- Fully managed (no infrastructure)
- Built-in vector indexing (HNSW)
- Production-grade reliability

**Cons:**
- Requires MongoDB Atlas ($$$ subscription, ~$57/month for M10 cluster)
- Not local (cloud-only)
- Vendor lock-in (MongoDB Atlas-specific syntax)
- Overkill for local learning phase

**Use Case:** Scale to production later (Week 9+).

---

### Recommendation for Your Project

| Phase | Duration | Database Setup | Rationale |
|-------|----------|---|---|
| **Local Dev** | Weeks 1-7 | **MongoDB + ChromaDB** | Cost-free, simple, learning-focused |
| **MVP/Demo** | Week 8 | **MongoDB + ChromaDB** | No cloud spend, self-contained |
| **Production Rollout** | Week 9+ | **Migrate to MongoDB Atlas Vector Search** | Single managed DB, production-grade |

**Action Items:**
- **Now (Weeks 1-7):** Use Option A (MongoDB + ChromaDB locally)
- **Phase 7 (Week 8):** Docker-compose includes both; test E2E
- **Post-MVP (Week 9+):** Set up MongoDB Atlas, migrate data, switch connection string
  - ChromaDB → MongoDB Atlas Vector Search is a simple migration (same queries, different backend)

---

### Data Sync Strategy (MongoDB + ChromaDB)

To avoid sync issues:

```python
# When product is ingested:
1. Extract metadata from image (VLM)
2. Store in MongoDB: db.products.insert_one({...metadata...})
3. Create embedding from metadata text
4. Store embedding in ChromaDB: collection.add(ids=[product_id], embeddings=[vector], metadatas=[...])

# When product is updated:
1. Update MongoDB
2. Update embedding in ChromaDB (delete old, add new)

# Safety mechanism:
- Add timestamp to both DBs
- Periodic sync check (every hour): MongoDB.count() == ChromaDB.count()
- If mismatch, rebuild ChromaDB from MongoDB
```

**Code Template:**
```python
async def ingest_product(image_path: str):
    # Step 1: VLM extraction
    metadata = await vlm_extract(image_path)
    
    # Step 2: MongoDB insert
    product_id = db.products.insert_one(metadata).inserted_id
    
    # Step 3: Embedding + ChromaDB
    text = f"{metadata['brand']} {metadata['color']} {metadata['product_type']}"
    embedding = embedder.encode(text)
    
    collection.add(
        ids=[str(product_id)],
        embeddings=[embedding.tolist()],
        documents=[text],
        metadatas=[metadata.dict()]
    )
    
    return product_id
```

---

### Migration Path: MongoDB + ChromaDB → MongoDB Atlas (Week 9+)

```python
# Step 1: Export from local MongoDB + ChromaDB
mongo_data = export_mongodb_products()
chroma_embeddings = collection.get(include=["embeddings", "documents"])

# Step 2: Combine (add embedding field to MongoDB documents)
for product in mongo_data:
    product['embedding'] = chroma_embeddings[product['_id']]['embedding']

# Step 3: Insert into MongoDB Atlas
atlas_client.db.products.insert_many(mongo_data)

# Step 4: Create vector index
atlas_client.db.command({
    "createSearchIndex": "default",
    "collection": "products",
    "definition": {
        "fields": [
            {"type": "vector", "path": "embedding", "similarity": "cosine"}
        ]
    }
})
```

---

### Final Verdict

| Scenario | Decision |
|----------|----------|
| **You: Learning + building local MVP** | ✅ Keep **MongoDB + ChromaDB** (this plan) |
| **You: Want single DB from day 1** | ⚠️ Wait for MongoDB Atlas setup (Week 8-9), then migrate |
| **You: Cloud budget available now** | ✅ Skip ChromaDB, use **MongoDB Atlas Vector Search** directly |
| **You: Production deployment in 3 months** | ✅ Use **MongoDB + ChromaDB locally**, migrate to Atlas before launch |

**Stick with the current plan: MongoDB + ChromaDB for local, migrate to Atlas later.**

---

### Phase 2: Data Schema & Product Metadata (Week 1-2)
**Goal:** Define 20 required metadata fields, extraction pipeline

**2.1: MongoDB Schema**
```python
# Product collection schema (Pydantic)
class ProductMetadata(BaseModel):
    # Essential
    sku: str
    product_type: str
    brand: str
    price: float
    currency: str
    stock_status: str  # in_stock, low, out
    
    # Visual (from VLM)
    primary_color: str
    secondary_colors: list[str]
    pattern: str
    design_elements: list[str]
    
    # Sizing/Fit
    available_sizes: list[str]
    size_range: str
    fit: str
    dimensions: dict  # W, H, D
    
    # Material & Care
    material_composition: str
    care_instructions: str
    weight: float
    
    # Social Proof
    rating_score: float
    review_count: int
    
    # Context
    occasions: list[str]
    target_gender: str
    season: str
```

**2.2: VLM Extraction Service** (separate from FastAPI)
```
Input: Product image → Qwen-VL:2B
Output: JSON (colors, design_elements, fit, occasions)
→ Stored in MongoDB as metadata
```

**2.3: Data Ingestion Pipeline**
- Batch upload clothing images to `/data/products/` folder
- **Execution:** Script must be run *inside* the FastAPI docker container (`docker exec`) to access internal network routing for DBs and VLM.
- Script loops: image → VLM → extract metadata → MongoDB insert
- Test with 20 sample clothing items (variety: shoes, tops, dresses, etc.)

- [ ] Define Pydantic schema for ProductMetadata
- [ ] Create VLM inference wrapper (call Qwen-VL:2B API)
- [ ] Build data ingestion script (batch process images)
- [ ] Populate MongoDB with 50+ sample products
- [ ] **Deliverable:** `ProductMetadata.py`, `ingest_products.py`, sample dataset

---

### Phase 3: RAG Pipeline (Week 2-3)
**Goal:** Embeddings in ChromaDB, semantic search working
**Execution Note:** All backend operations (generating text embeddings, data validation, running retrieval tools) will happen *inside* the `fastapi` Docker container to ensure consistent dependencies and network access.

**3.1: Embedding Strategy**
```
Product metadata → Text representation → Embedding
Example:
"Blue cotton t-shirt, casual wear, oversized fit, available in S/M/L, $25"
→ Vector (384-dim or 768-dim)
→ ChromaDB
```

**3.2: ChromaDB Setup**
```python
import chromadb
from chromadb.config import Settings

client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory="./chroma_data"
))

collection = client.get_or_create_collection(
    name="products",
    metadata={"hnsw:space": "cosine"}
)

# Insert embeddings during data ingestion
```

**3.3: Search Interface**
```python
async def search_products(query: str, top_k: int = 5):
    results = collection.query(
        query_texts=[query],
        n_results=top_k
    )
    return fetch_from_mongodb(results['ids'])
```

- [ ] Set up ChromaDB with persistent storage
- [ ] Embed product metadata using sentence-transformers
- [ ] Implement `search_products()` function
- [ ] Test semantic search ("blue shirts under $50")
- [ ] **Deliverable:** RAG pipeline module, tests

---

### Phase 4: Agent Definition & Tools (Week 3-4)
**Goal:** LangGraph agent with tools (search, recommend, add_to_cart)
**Execution Note:** The LangGraph agent runtime and all associated tools are hosted within the `fastapi` Docker container. When testing agent logic locally, use `docker exec fastapi python <script.py>`. Leverage **LangSmith** to monitor traces and agent states.

**4.1: Define Agent State** (LangGraph)
```python
from typing import TypedDict, Annotated
from operator import add

class AgentState(TypedDict):
    user_id: str
    conversation: Annotated[list, add]  # Chat history
    products: list[dict]  # Search results
    cart: list[dict]
    current_query: str
    recommendations: list[dict]
```

**4.2: Define Tools**
```python
@tool
def search_products(query: str) -> list[dict]:
    """Search products by semantic similarity"""
    return rag_search(query)

@tool
def get_recommendations(product_id: str) -> list[dict]:
    """Similar products based on metadata"""
    return find_similar(product_id)

@tool
def add_to_cart(user_id: str, product_id: str, size: str, qty: int) -> dict:
    """Add product to user cart"""
    return mongo_add_to_cart(user_id, product_id, size, qty)

@tool
def get_inventory(product_id: str) -> dict:
    """Check stock for specific size"""
    return get_stock_status(product_id)
```

**4.3: LangGraph Nodes**
```python
def agent_node(state: AgentState):
    """LLM decides which tool to use"""
    # Call Qwen2.5 or Claude
    # Return tool_calls
    pass

def tool_executor_node(state: AgentState):
    """Execute tool calls, update state"""
    pass

def should_continue(state: AgentState):
    """Route: continue or end"""
    pass

# Build graph
graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
graph.add_node("tools", tool_executor_node)
graph.add_edge("tools", "agent")
graph.add_conditional_edges("agent", should_continue)
graph.set_entry_point("agent")

agent = graph.compile(checkpointer=MemorySaver())
```

- [ ] Define AgentState (conversation, products, cart, recommendations)
- [ ] Implement 4 core tools (search, recommend, cart, inventory)
- [ ] Build LangGraph with 3 nodes (agent, tools, continuation logic)
- [ ] Test agent with sample queries and trace via LangSmith
- [ ] **Deliverable:** `agent.py` with LangGraph definition, tool tests

---

### Phase 5: FastAPI Integration (Week 4-5)
**Goal:** Expose agent as REST API, integrate with existing backend

**5.1: New Endpoints**
```python
@app.post("/chat")
async def chat(user_id: str, message: str):
    """Chat with agent"""
    state = AgentState(
        user_id=user_id,
        conversation=[{"role": "user", "content": message}],
        products=[],
        cart=[],
        current_query=message,
        recommendations=[]
    )
    output = await agent.ainvoke(state)
    return {
        "response": output["conversation"][-1],
        "products": output["products"],
        "recommendations": output["recommendations"]
    }

@app.get("/search")
async def search(q: str):
    """Semantic product search"""
    return await rag_search(q)

@app.post("/cart/add")
async def add_to_cart(user_id: str, product_id: str, size: str, qty: int):
    """Add to cart via agent"""
    return await agent_tool("add_to_cart", ...)
```

**5.2: Integrate with Existing Code**
- Existing `/products`, `/cart`, `/auth` endpoints → Keep as-is
- New `/chat` → Routes through agent
- `/search` → Both old (filter-based) + new (semantic) available

- [ ] Add `/chat` endpoint (agent entry point)
- [ ] Add `/search` endpoint (RAG-powered)
- [ ] Update FastAPI to handle async agent calls
- [ ] Connect MongoDB calls to existing models
- [ ] **Deliverable:** Updated `main.py`, integration tests

---

### Phase 6: Frontend Integration & Chatbot Widget (Week 5-6)
**Goal:** React chatbot widget calls agent API, displays results

**6.1: Chatbot Component Updates**
```javascript
// Call /chat endpoint
const response = await fetch('/chat', {
  method: 'POST',
  body: JSON.stringify({ user_id, message })
});

const { response: botReply, products, recommendations } = await response.json();

// Display:
// 1. Agent's text response
// 2. Product cards (search results)
// 3. Recommendations sidebar
```

**6.2: Product Detail Page**
- Show embeddings metadata (colors, material, care instructions)
- Fetch recommendations from agent
- Size chart from metadata

- [ ] Update ChatbotWidget component to call `/chat`
- [ ] Handle product card rendering from agent results
- [ ] Display recommendations panel
- [ ] Test E2E: user query → agent → product display
- [ ] **Deliverable:** Updated React components, E2E tests

