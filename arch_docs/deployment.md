# Deployment & CI/CD Strategy

### Phase 7: Local Deployment & Testing (Week 6-7)
**Goal:** Full stack working locally via Docker Compose
**Note:** The sequence has shifted slightly since Docker is utilized from Day 1 to ensure a seamless development experience for all services.

**7.1: docker-compose.yml**
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [./data/mongo:/data/db]

  chroma:
    image: chromadb/chroma:latest
    ports: ["8288:8288"]
    volumes: [./data/chroma:/chroma/chroma]

  vlm-service:
    build: ./services/vlm
    ports: ["5000:5000"]
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    command: python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen3-VL-2B-Instruct-FP8 --tensor-parallel-size 1 --max-model-len 2048 --trust-remote-code

  fastapi:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [mongodb, chroma, vlm-service]
    environment:
      MONGODB_URL: mongodb://mongodb:27017
      CHROMA_URL: http://chroma:8288
      VLM_URL: http://vlm-service:5000

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [fastapi]
```

**7.2: Testing Checklist**
- [ ] All containers start: `docker-compose up`
- [ ] API responds: `curl http://localhost:8000/docs`
- [ ] VLM inference works: Upload image, get metadata
- [ ] RAG search works: Query semantic → results returned
- [ ] Agent runs: `/chat` returns tool calls + results
- [ ] Frontend loads: `http://localhost:3000`
- [ ] E2E flow: User → chat query → agent → products → cart → checkout

**7.3: Performance Baselines**
- VLM inference latency (image → JSON): target <5s for 2B model
- Semantic search latency: target <500ms
- Agent decision latency: target <2s
- Chat API response: target <10s (VLM + search + LLM reasoning)

- [ ] **Deliverable:** `docker-compose.yml`, test suite, performance report

---

### Phase 8: CI/CD & Documentation (Week 7-8)
**Goal:** GitHub Actions pipeline, production-ready docs

**8.1: GitHub Actions Workflow**
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: docker-compose -f docker-compose.test.yml up --abort-on-container-exit

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build images
        run: docker-compose build
      - name: Push to registry (optional)
        run: docker push $REGISTRY/clothing-store:$TAG

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS (or local)
        run: # Your deploy script
```

**8.2: Documentation**
- [ ] Architecture diagram (system design)
- [ ] Agent workflow explanation (nodes, tools, state)
- [ ] API documentation (OpenAPI spec auto-generated)
- [ ] Setup instructions (local dev, Docker)
- [ ] Troubleshooting guide (VLM OOM, RAG no results, etc.)

- [ ] **Deliverable:** README.md, ARCHITECTURE.md, API_SPEC.md, GitHub Actions workflow
