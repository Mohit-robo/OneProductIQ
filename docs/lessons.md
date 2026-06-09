# Technical Lessons Learned

## Issue Name: Ollama Connection Refused inside Docker
**Issue Description:** 
The `vlm_wrapper.py` script running inside the `fastapi` docker container failed to connect to Ollama running on the host via `http://host.docker.internal:11434` with a `Connection refused` error.
**Answer:** 
By default on Linux, Ollama binds strictly to `127.0.0.1` (localhost). It actively drops traffic from the Docker bridge network. The fix is to configure Ollama to listen on all interfaces by setting the environment variable `OLLAMA_HOST=0.0.0.0` on the host machine before running `ollama serve` or by adding it to its `systemd` service configuration.

---

## Issue Name: Ollama API JSONDecodeError (Extra data)
**Issue Description:** 
Parsing the Ollama HTTP API response using `response.json()` crashed with `Extra data: line 2 column 1` because Ollama returned multiple lines instead of a single JSON object.
**Answer:** 
The Ollama `/api/chat` endpoint defaults to `stream: True`, which returns a Newline-Delimited JSON (NDJSON) stream. To get a single, standard JSON response compatible with `requests` or `httpx` `.json()` methods, you must explicitly include `"stream": False` in the POST payload.

---

## Issue Name: ChromaDB KeyError: '_type' during collection creation
**Issue Description:** 
Calling `chroma_client.get_or_create_collection()` failed with a `KeyError: '_type'` inside the ChromaDB Python client's configuration module.
**Answer:** 
This is caused by a version mismatch between the Python `chromadb` client (e.g., 0.6.3) and the `chromadb/chroma` Docker server image. Newer ChromaDB clients expect a `_type` field in the configuration JSON, which older server versions (like an older cached `latest` tag) don't return. The fix is to explicitly pin the `docker-compose.yml` image tag to match the Python client version (e.g., `chromadb/chroma:0.6.3`).

---

## Issue Name: Decoupling Metadata Ingestion and Vector Embedding
**Issue Description:** 
Deciding whether to process VLM data and generate ChromaDB embeddings in a single script or separate them into two scripts.
**Answer:** 
It is best practice to decouple them. VLM inference is extremely slow and prone to hallucination/failure, whereas vector embedding is heavily optimized for fast batch execution. Saving the VLM output to MongoDB first acts as a perfect data checkpoint. We can then run a separate sync script (`sync_chroma.py`) that batch-encodes all text at once. This separation of concerns also allows for easy database re-embedding in the future if the embedding model changes without re-running the expensive VLM.

---

## Issue Name: FastAPI Container Hangs on Eager Module-Level Imports
**Issue Description:** 
When starting up, the FastAPI container eagerly imports and instantiates the `SentenceTransformer` model and attempts DB connections on module import. This causes the worker process to block or hang before binding to the port, triggering Docker healthcheck failures and container restarts.
**Answer:** 
Implement lazy getters for DB clients and model loaders so that the modules can be imported instantly without any overhead. To avoid cold-start latencies on the first user query, trigger a preload sequence inside the FastAPI `lifespan` handler using `asyncio.to_thread()`. This allows the server to boot immediately and load models/connections asynchronously during the startup phase.

---

## Issue Name: Hardcoded API Models and LLM Name Validation Errors
**Issue Description:** 
Hardcoding LLM model names directly in the code (e.g. `ChatGoogleGenerativeAI(model="gemini-2.5-flash")`) prevents easy configurations. Furthermore, passing provider-specific strings like `gemma-4-31B` to standard libraries causes 400 Bad Request API errors due to strict name validation.
**Answer:** 
Centralize all model names (LLM, Embedding, and VLM) in the Pydantic `Settings` module in `config.py` so they are fully configurable via environment variables. Use LangChain's unified `init_chat_model()` helper, which dynamically routes the model to the appropriate provider (e.g. `google_genai:gemini-2.5-flash` or `groq:llama3-8b-8192`) and maps API keys to the expected environment variables automatically.

---

## Issue Name: Python Absolute vs Relative Imports in Docker
**Issue Description:**
When running scripts both locally and inside Docker, `ModuleNotFoundError` frequently occurs because the current working directory (`sys.path`) differs between environments (e.g. running from `/backend` vs `/backend/src`). Attempting to hack `sys.path.append("..")` creates unmaintainable paths and module shadowing issues.
**Answer:**
Avoid relative script executions. Always run the module from the root directory using the `-m` flag (e.g. `python -m src.llm_wrapper`) and strictly use absolute imports (`from src.config import settings`). This ensures Python resolves the module tree properly regardless of the environment.

---

## Issue Name: Ghost UI Elements (ChromaDB Duplicate Vector Mapping)
**Issue Description:**
The frontend sometimes shows a UI mismatch where the state length is mathematically disjointed from the physical mapping count, caused by ChromaDB returning multiple exact-duplicate vector hits for identical document IDs after multi-stage data ingestions.
**Answer:**
When zipping `distances` and `retrieved_ids` from ChromaDB into the full MongoDB object map, you must enforce a strict Set-based deduplication (`seen_ids`) to ensure identical object IDs are not double-appended into the final JSON array.

---

## Issue Name: Irrelevant RAG Matches (Semantic Search Threshold Tuning)
**Issue Description:**
The vector search endpoint successfully parses user queries but returns completely irrelevant products (e.g., retrieving shoes when searching for jackets).
**Answer:**
The L2 / Cosine distance threshold in the sentence-transformer retrieval (`hybrid_search`) dictates strictness. A permissive threshold (e.g. `1.1`) allows loosely-related latent space matches to bleed through. This must be tightened (e.g. `< 0.95` or `< 0.85`) to actively penalize and drop low-confidence vector matches, ensuring that the RAG pipeline is accurate.
