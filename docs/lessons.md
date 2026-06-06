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
