# Setup & Operations Guide

This guide explains how to configure, boot, ingest data, and test the OneProductIQ platform locally.

## Prerequisites

- Docker and Docker Compose installed.
- Valid API keys for remote LLMs (either Google Gemini or Groq).

---

## 1. Environment Configuration

Create a `.env` file in the root of the project:

```bash
# Database Ports & Credentials
MONGO_USER=admin
MONGO_PASS=secret123
MONGO_HOST=mongodb
MONGO_PORT=27017

CHROMA_HOST=chroma
CHROMA_PORT=8000

# Remote LLM Keys
# LangChain init_chat_model automatically uses the correct standard keys
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Remote LLM Config
# Examples: google_genai:gemini-2.5-flash or groq:llama3-8b-8192
GEMINI_MODEL_NAME=google_genai:gemini-2.5-flash
GROQ_MODEL_NAME=groq:llama3-8b-8192

# Embedding Model
EMBEDDING_MODEL_NAME=all-MiniLM-L6-v2
```

---

## 2. Booting the Multi-Container Stack

Run the following command from the root of the project to build and launch all microservices (MongoDB, ChromaDB, FastAPI Backend, React Frontend):

```bash
docker compose up --build -d
```

### Port Mappings:
- **FastAPI Backend**: `http://localhost:8000` (API Docs at `/docs`)
- **React Frontend**: `http://localhost:3000`
- **MongoDB**: `localhost:27017`
- **ChromaDB**: `localhost:8288` (Mapped internally from 8000)

---

## 3. Data Ingestion

To populate the databases with sample clothes:

1. Place raw product folders containing images and `metadata.csv` under `dataset/` (e.g. `dataset/1/entry_1/`).
2. Execute the batch ingestion pipeline inside the running FastAPI container:

```bash
docker exec -it fastapi python src/ingest_products.py --dir /data/products
```

This will run the local Qwen-VL service on the images to generate metadata, save them to MongoDB, and then trigger ChromaDB sync.

---

## 4. Running Test Suites

We provide a set of verification scripts in the `scripts/` directory. You can run them to assert service statuses:

```bash
# Run all tests sequentially
bash scripts/run_all_tests.sh

# Or test individual components:
python scripts/test_mongodb.py
python scripts/test_chromadb.py
python scripts/test_search.py
python scripts/test_vlm.py
```
