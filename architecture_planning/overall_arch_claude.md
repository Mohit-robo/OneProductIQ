# ClickUp Sprint Structure: OneProductIQ

## Workspace Overview

```
OneProductIQ
├─ Pre-Phase: Environment & Requirements
├─ Phase 1: FastVLM Testing Dashboard
├─ Phase 2: Product Intelligence Schema
├─ Phase 3: Storage Layer & Persistence
├─ Phase 4: Queue Architecture
├─ Phase 5: Local Worker Implementation
├─ Phase 6: Cost & Capacity Planning
├─ Phase 7: Dockerization
├─ Phase 8: RunPod Deployment & Scaling
├─ Phase 9: API Layer & Authentication
├─ Phase 10: Analytics & Search Layer
├─ Phase 11: Frontend Intelligence Dashboard
├─ Phase 12: Monitoring & Observability
├─ Phase 13: Performance Optimization
├─ Phase 14: Launch Readiness
└─ Backlog (Future Features)
```

---

## PRE-PHASE: Environment & Requirements

**Duration:** 3 days  
**Status:** 🔴 Not Started  
**Priority:** 🔴 Critical

### Milestone: Environment Validated

---

### Task 1: Define Hardware Requirements

**Type:** Documentation  
**Assigned to:** Tech Lead  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Determine hardware specifications for local development and RunPod deployment.

**Checklist:**
- [ ] Document minimum local GPU specs (8GB VRAM minimum)
- [ ] List recommended GPUs: RTX 4090, RTX 3090, A5000
- [ ] Define CPU/RAM for API server (8GB RAM, 4-core CPU)
- [ ] Calculate bandwidth requirements (image uploads, downloads)
- [ ] Document storage needs (FastVLM model cache: ~2GB)

**Acceptance Criteria:**
- Hardware spec doc approved by team
- Cost per config documented
- Local dev machine ready

---

### Task 2: FastVLM Version & Dependency Pinning

**Type:** Technical Setup  
**Assigned to:** ML Engineer  
**Due Date:** +1 day  
**Effort:** 1 hour  
**Priority:** 🔴 Critical

**Description:**
Lock FastVLM and ONNX Runtime versions to prevent breaking changes.

**Checklist:**
- [ ] Identify latest stable FastVLM version
- [ ] Pin ONNX Runtime version (e.g., 1.16.3)
- [ ] Test FastVLM compatibility with Node.js (via transformers.js)
- [ ] Document PyTorch/CUDA version compatibility
- [ ] Create requirements.txt / package.json with exact versions

**Acceptance Criteria:**
- package.json includes exact versions
- Tested locally on target GPU
- No version conflicts documented

---

### Task 3: Cost Estimation & RunPod Pricing Analysis

**Type:** Analysis  
**Assigned to:** Product Manager  
**Due Date:** +1.5 days  
**Effort:** 3 hours  
**Priority:** 🔴 Critical

**Description:**
Calculate RunPod costs and determine pricing model viability.

**Checklist:**
- [ ] Document RunPod GPU pricing (per hour rates)
- [ ] Estimate inference costs (RTX 4090 cost per image)
- [ ] Calculate expected monthly spend (100/1000/10000 jobs)
- [ ] Compare: auto-scaling 1-5 workers vs. single worker
- [ ] Determine break-even pricing ($0.05/product?)

**Subtasks:**
- [ ] RunPod API cost calculator spreadsheet
- [ ] Graph: Jobs/day vs. monthly cost
- [ ] Budget approval threshold

**Acceptance Criteria:**
- Spreadsheet with cost scenarios
- Decision: single worker or auto-scale group
- Budget approved by stakeholders

---

### Task 4: Team Access Setup

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Ensure all team members have necessary credentials and access.

**Checklist:**
- [ ] Create RunPod account & API key
- [ ] Create AWS account (if using RDS/S3)
- [ ] Set up GitHub repository with branch protection
- [ ] Create shared 1Password/Vault for secrets
- [ ] Document access procedures (wiki/README)

**Acceptance Criteria:**
- All team members can log in to RunPod
- GitHub repo initialized
- Secrets manager tested

---

### Task 5: Development Environment Validation

**Type:** QA  
**Assigned to:** ML Engineer  
**Due Date:** +3 days  
**Effort:** 4 hours  
**Priority:** 🟡 High

**Description:**
Test all dependencies on local machine.

**Checklist:**
- [ ] Clone repo, install dependencies
- [ ] Verify FastVLM loads without errors
- [ ] Test GPU detection (CUDA/Metal)
- [ ] Benchmark single inference (should be <2 sec)
- [ ] Document setup steps in README

**Acceptance Criteria:**
- Zero dependency conflicts
- Sample image processes end-to-end
- Setup takes <30 min for new developer

---

## PHASE 1: FastVLM Testing Dashboard

**Duration:** 1 week  
**Status:** 🔴 Not Started  
**Priority:** 🔴 Critical  
**Milestone:** Testing Dashboard Complete

---

### Task 1.1: React + Vite Scaffold

**Type:** Frontend Setup  
**Assigned to:** Frontend Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Create React project with Vite and Tailwind CSS.

**Checklist:**
- [ ] Create Vite project (`npm create vite`)
- [ ] Install Tailwind + configure
- [ ] Create folder structure (components/, pages/, utils/)
- [ ] Set up React Router for navigation
- [ ] Create basic layout (header, sidebar, main)

**Subtasks:**
- [ ] Install shadcn/ui components
- [ ] Create reusable Button, Card, Input components

**Acceptance Criteria:**
- App runs locally (`npm run dev`)
- Hot reload works
- Tailwind classes render correctly

---

### Task 1.2: Image Upload & Preview Component

**Type:** Frontend  
**Assigned to:** Frontend Engineer  
**Due Date:** +1 day  
**Effort:** 3 hours  
**Priority:** 🔴 Critical

**Description:**
Build drag-drop image upload with preview.

**Checklist:**
- [ ] Create ImageUpload component
- [ ] Implement drag-drop zone
- [ ] Add file validation (jpg, png, webp only)
- [ ] Display image preview
- [ ] Show image dimensions and file size

**Acceptance Criteria:**
- Can drag-drop 10 images
- File size validation works (<50MB)
- Preview displays correctly

---

### Task 1.3: FastVLM Integration via Transformers.js

**Type:** Frontend/ML  
**Assigned to:** ML Engineer  
**Due Date:** +2 days  
**Effort:** 4 hours  
**Priority:** 🔴 Critical

**Description:**
Load FastVLM model in browser using transformers.js.

**Checklist:**
- [ ] Install transformers.js and ONNX Runtime JS
- [ ] Create model loader hook (useVLMModel)
- [ ] Implement model caching (avoid reload)
- [ ] Add GPU/CPU device detection
- [ ] Handle model loading states (loading, error, ready)

**Subtasks:**
- [ ] Load FastVLM model (~1-2GB download)
- [ ] Benchmark CPU vs. GPU loading
- [ ] Create fallback to CPU if GPU unavailable

**Acceptance Criteria:**
- Model loads in <5 seconds
- Can detect GPU availability
- Memory usage reasonable (<6GB)

---

### Task 1.4: Prompt Management System

**Type:** Frontend  
**Assigned to:** Frontend Engineer  
**Due Date:** +2 days  
**Effort:** 3 hours  
**Priority:** 🟡 High

**Description:**
Create prompt library and selector.

**Checklist:**
- [ ] Create prompts folder (product_caption.txt, attributes.txt, etc.)
- [ ] Build prompt editor component
- [ ] Add prompt selector dropdown
- [ ] Allow inline editing of prompts
- [ ] Save prompts to localStorage

**Subtasks:**
- [ ] Create 5 base prompts for testing
- [ ] Implement prompt versioning (v1, v2, etc.)

**Acceptance Criteria:**
- Can switch between 5+ prompts
- Edits persist locally
- Prompts render correctly in inference

---

### Task 1.5: FastVLM Inference & Output Display

**Type:** Frontend/ML  
**Assigned to:** ML Engineer  
**Due Date:** +3 days  
**Effort:** 4 hours  
**Priority:** 🔴 Critical

**Description:**
Implement inference pipeline and JSON output viewer.

**Checklist:**
- [ ] Create inference function (image + prompt → text)
- [ ] Display raw FastVLM output
- [ ] Add JSON formatting/syntax highlighting
- [ ] Implement streaming output (show tokens as generated)
- [ ] Display inference timing metrics

**Subtasks:**
- [ ] Inference time tracker (breakdown by stage)
- [ ] Token/sec counter
- [ ] GPU memory usage monitor

**Acceptance Criteria:**
- Single image processes end-to-end
- Output displays in <5 seconds
- JSON viewer is readable

---

### Task 1.6: Metrics Dashboard

**Type:** Frontend  
**Assigned to:** Frontend Engineer  
**Due Date:** +3 days  
**Effort:** 3 hours  
**Priority:** 🟡 High

**Description:**
Show real-time performance metrics.

**Checklist:**
- [ ] Display inference latency (ms)
- [ ] Show GPU memory usage (MB)
- [ ] Show tokens per second
- [ ] Track cumulative stats (avg latency, total tokens)
- [ ] Add reset button

**Subtasks:**
- [ ] Create Metrics component with charts (Chart.js)
- [ ] Store metrics in state

**Acceptance Criteria:**
- Metrics update in real-time
- Charts render correctly
- Can reset metrics

---

### Task 1.7: Batch Processing UI

**Type:** Frontend  
**Assigned to:** Frontend Engineer  
**Due Date:** +4 days  
**Effort:** 3 hours  
**Priority:** 🟡 High

**Description:**
Allow processing multiple images sequentially.

**Checklist:**
- [ ] Create queue display (pending, processing, done)
- [ ] Add progress bar (X of N images)
- [ ] Display results per image
- [ ] Allow pause/resume
- [ ] Export batch results as CSV/JSON

**Acceptance Criteria:**
- Can upload 100 images
- Queue processes in order
- Results exportable

---

### Task 1.8: Quality Assessment & Hallucination Detection

**Type:** Frontend/ML  
**Assigned to:** ML Engineer  
**Due Date:** +4 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Add manual quality scoring and hallucination tracking.

**Checklist:**
- [ ] Create quality rating component (1-5 stars)
- [ ] Add hallucination checkbox (yes/no)
- [ ] Track: good outputs vs. hallucinations
- [ ] Calculate hallucination rate (%)
- [ ] Save feedback to localStorage

**Acceptance Criteria:**
- Can rate 100 images
- Hallucination rate calculated
- Feedback collected for later analysis

---

### Milestone Acceptance Criteria

**Dashboard is complete when:**
- ✅ Can upload 10+ images
- ✅ Single image processing <2 sec
- ✅ JSON output readable
- ✅ Batch processing 100 images works
- ✅ Metrics show latency, throughput, GPU usage
- ✅ Hallucination rate <5% (validated on sample)

---

## PHASE 2: Product Intelligence Schema

**Duration:** 4 days  
**Status:** 🔴 Not Started  
**Priority:** 🔴 Critical  
**Milestone:** Schema Finalized & Validated

---

### Task 2.1: E-Commerce Requirements Interview

**Type:** Discovery  
**Assigned to:** Product Manager  
**Due Date:** +0.5 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Talk to 3-5 e-commerce domain experts to understand what metadata matters.

**Checklist:**
- [ ] Interview Shopify seller (what do you struggle with?)
- [ ] Interview fashion marketplace manager (what drives sales?)
- [ ] Interview inventory manager (what data is useful?)
- [ ] Document key attributes that improve search/conversion
- [ ] Identify nice-to-have vs. must-have fields

**Acceptance Criteria:**
- 3+ interviews completed
- Top 20 required metadata fields identified
- Document: "E-Commerce Metadata Requirements.md"

---

### Task 2.2: Define JSON Schema Structure

**Type:** Technical Design  
**Assigned to:** Backend Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Create stable JSON schema for product metadata.

**Checklist:**
- [ ] Create schema.json file
- [ ] Define required fields (category, color, material, fit, etc.)
- [ ] Define optional fields (occasions, care_instructions, etc.)
- [ ] Add enums for categorical fields (colors, fits, genders)
- [ ] Add validation rules (string length, number ranges)
- [ ] Document field descriptions

**Subtasks:**
- [ ] Schema example for: casual shirt
- [ ] Schema example for: luxury handbag
- [ ] Schema example for: athletic shoes

**Acceptance Criteria:**
```json
{
  "category": "string (enum)",
  "subcategory": "string",
  "colors": ["string array"],
  "primary_color": "string",
  "material": "string (enum)",
  "fit": "string (enum)",
  "gender": "string (enum)",
  "style": ["string array"],
  "occasion": ["string array"],
  "season": ["string array"],
  "care_instructions": "string",
  "confidence": "number (0-1)",
  "quality_score": "number (0-1)"
}
```

Schema validates against provided examples.

---

### Task 2.3: Build Output Parser

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +2 days  
**Effort:** 3 hours  
**Priority:** 🔴 Critical

**Description:**
Convert raw FastVLM text output → structured JSON.

**Checklist:**
- [ ] Create parser.js module
- [ ] Implement text → field extraction (regex + NLP)
- [ ] Add color normalization (navy, navy blue → navy)
- [ ] Add material normalization (cotton, 100% cotton → cotton)
- [ ] Add category mapping (shirt → casual_top)
- [ ] Handle multi-value fields (colors, styles)

**Subtasks:**
- [ ] Color name normalization library (CSS colors)
- [ ] Material lookup table
- [ ] Category hierarchy mapping

**Example:**
```
Input: "Navy Cotton Slim Fit Casual Shirt"
Output: {
  "category": "shirts",
  "colors": ["navy"],
  "material": "cotton",
  "fit": "slim",
  "style": ["casual"]
}
```

**Acceptance Criteria:**
- Parser handles 20+ test cases
- No data loss during conversion
- Normalization rules consistent

---

### Task 2.4: Add Validation Layer

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Validate parsed output against schema and confidence thresholds.

**Checklist:**
- [ ] Implement schema validation (Zod or Joi)
- [ ] Add missing field detection
- [ ] Add confidence threshold logic (flag <80% confidence)
- [ ] Implement fallback logic (use defaults if missing)
- [ ] Add data quality score (% of fields filled)

**Subtasks:**
- [ ] Validator.js module
- [ ] Error messages for failed validations
- [ ] Confidence scoring algorithm

**Example:**
```
If confidence < 0.8
  → Mark as "requires_review": true
  → Store in "uncertain_products" collection
```

**Acceptance Criteria:**
- All invalid outputs are caught
- Confidence thresholds enforced
- Quality score calculated correctly

---

### Task 2.5: Test Parser & Validator on Phase 1 Dashboard

**Type:** Testing  
**Assigned to:** QA Engineer  
**Due Date:** +3 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Integrate parser/validator into dashboard and test on 100 images.

**Checklist:**
- [ ] Connect parser to dashboard output
- [ ] Validate 100 test images
- [ ] Measure validation pass rate (target: 95%+)
- [ ] Identify fields causing failures
- [ ] Document edge cases

**Acceptance Criteria:**
- 95%+ of outputs pass validation
- Parser handles all major fashion categories
- Edge cases documented

---

### Task 2.6: Create Example Schemas for Common Categories

**Type:** Documentation  
**Assigned to:** Product Manager  
**Due Date:** +3 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Document expected outputs for major fashion categories.

**Checklist:**
- [ ] Casual shirt schema example
- [ ] Luxury handbag schema example
- [ ] Athletic shoes schema example
- [ ] Dress schema example
- [ ] Jeans schema example

**Acceptance Criteria:**
- 5+ category examples documented
- Examples are realistic and validated

---

### Milestone Acceptance Criteria

**Schema complete when:**
- ✅ JSON schema approved by stakeholders
- ✅ Parser converts 100+ outputs correctly
- ✅ Validator catches 100% of invalid data
- ✅ 5+ category examples documented

---

## PHASE 3: Storage Layer & Persistence

**Duration:** 3 days  
**Status:** 🔴 Not Started  
**Priority:** 🔴 Critical  
**Milestone:** Database Ready for Production

---

### Task 3.1: PostgreSQL Setup

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Set up PostgreSQL locally and on AWS RDS (for cloud backup).

**Checklist:**
- [ ] Install PostgreSQL 15+ locally
- [ ] Create RDS instance (AWS)
- [ ] Set up connection pooling (pgBouncer)
- [ ] Configure backups (automated daily)
- [ ] Document connection strings (dev + prod)

**Subtasks:**
- [ ] Local: postgresql.conf tuning
- [ ] RDS: Parameter group configuration
- [ ] Test: Connection from API server

**Acceptance Criteria:**
- Local PostgreSQL running on port 5432
- RDS instance accessible
- Can connect via pgBouncer

---

### Task 3.2: Create Products Table Schema

**Type:** Database Design  
**Assigned to:** Backend Engineer  
**Due Date:** +1 day  
**Effort:** 1 hour  
**Priority:** 🔴 Critical

**Description:**
Design products table with JSONB metadata column.

**Checklist:**
- [ ] Create products table
- [ ] Add columns: id, image_path, metadata (JSONB), quality_score, created_at
- [ ] Add indexes: user_id, category, created_at
- [ ] Add JSONB index for faster querying
- [ ] Create migration script

**SQL:**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_path VARCHAR(2048),
  metadata JSONB DEFAULT '{}',
  quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 1),
  confidence FLOAT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_metadata_gin ON products USING gin(metadata);
```

**Acceptance Criteria:**
- Table created successfully
- Indexes created
- Can insert 1000 rows in <1 second

---

### Task 3.3: SQLAlchemy ORM Models

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Create Python ORM models for database access.

**Checklist:**
- [ ] Create Product model class
- [ ] Add metadata validation
- [ ] Add helper methods (to_dict, from_dict)
- [ ] Add timestamps (created_at, updated_at)
- [ ] Create database session manager

**Subtasks:**
- [ ] Alembic migrations setup
- [ ] Create User model (for multi-tenancy later)

**Acceptance Criteria:**
- Models created and tested
- Can insert/query products via ORM

---

### Task 3.4: Connection Pooling & Performance Tuning

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Optimize PostgreSQL for concurrent connections.

**Checklist:**
- [ ] Configure pgBouncer (min_pool_size, max_pool_size)
- [ ] Set connection timeouts
- [ ] Enable prepared statements caching
- [ ] Monitor active connections
- [ ] Load test: 100 concurrent connections

**Config:**
```
[databases]
fashion_db = host=localhost port=5432 dbname=products

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 25
min_pool_size = 5
```

**Acceptance Criteria:**
- Queries complete <100ms avg
- Connection pool stable under load
- No connection timeouts

---

### Task 3.5: Backup & Recovery Strategy

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Set up automated backups and recovery testing.

**Checklist:**
- [ ] Enable RDS automated backups (30-day retention)
- [ ] Create backup snapshot
- [ ] Test recovery procedure
- [ ] Document recovery steps
- [ ] Set up CloudWatch alerts for backup failure

**Acceptance Criteria:**
- Backups happen daily
- Recovery tested successfully
- RTO/RPO defined (4 hours recovery)

---

### Task 3.6: Load Testing (1000 Products)

**Type:** QA  
**Assigned to:** QA Engineer  
**Due Date:** +3 days  
**Effort:** 3 hours  
**Priority:** 🟡 High

**Description:**
Validate database performance with production-like data.

**Checklist:**
- [ ] Insert 1000 test products
- [ ] Query all products (<1 sec)
- [ ] Filter by category (<500ms)
- [ ] Search by color (<500ms)
- [ ] Update 100 products in batch
- [ ] Monitor CPU/memory usage

**Load Test Script:**
```python
# Load 1000 products
time_taken = load_products(1000)
assert time_taken < 5000  # ms

# Query tests
query_time = db.query(Product).all()
assert query_time < 1000  # ms
```

**Acceptance Criteria:**
- 1000 products insert in <5 seconds
- Queries <500ms avg
- No connection pool exhaustion

---

### Milestone Acceptance Criteria

**Storage ready when:**
- ✅ PostgreSQL running locally + RDS
- ✅ Products table created with indexes
- ✅ ORM models functional
- ✅ Connection pooling optimized
- ✅ Backups automated
- ✅ Load test passing (1000 products)

---

## PHASE 4: Queue Architecture

**Duration:** 4 days  
**Status:** 🔴 Not Started  
**Priority:** 🔴 Critical  
**Milestone:** Queue System Functional

---

### Task 4.1: Redis Setup

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Set up Redis locally and on AWS ElastiCache.

**Checklist:**
- [ ] Install Redis locally (6.0+)
- [ ] Create ElastiCache instance (AWS)
- [ ] Configure persistence (RDB snapshots)
- [ ] Set max memory policy (allkeys-lru)
- [ ] Enable AUTH (password protection)

**Config:**
```
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
```

**Acceptance Criteria:**
- Redis running on localhost:6379
- ElastiCache instance accessible
- AUTH credentials secure

---

### Task 4.2: Queue Schema & Job Definition

**Type:** Technical Design  
**Assigned to:** Backend Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Define job structure and queue format.

**Checklist:**
- [ ] Define job schema (job_id, image_url, status, result, created_at)
- [ ] Define queue structure (pending, processing, failed)
- [ ] Define status lifecycle (queued → processing → completed/failed)
- [ ] Define retry strategy (max 3 retries, exponential backoff)
- [ ] Define job TTL (keep for 7 days, then delete)

**Job Schema:**
```json
{
  "job_id": "uuid",
  "user_id": "uuid",
  "image_url": "string",
  "status": "queued|processing|completed|failed",
  "result": {},
  "error": "string or null",
  "retry_count": 0,
  "created_at": "timestamp",
  "started_at": "timestamp or null",
  "completed_at": "timestamp or null"
}
```

**Acceptance Criteria:**
- Schema documented
- Status transitions defined
- Retry logic clear

---

### Task 4.3: Queue Consumer (Node.js)

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +2 days  
**Effort:** 3 hours  
**Priority:** 🔴 Critical

**Description:**
Build queue listener that pulls jobs from Redis.

**Checklist:**
- [ ] Create queue_consumer.js module
- [ ] Implement Redis BLPOP (blocking pop)
- [ ] Add job status updater
- [ ] Implement retry logic (exponential backoff)
- [ ] Add dead-letter queue for failed jobs
- [ ] Add logging (every job state change)

**Code Structure:**
```javascript
class QueueConsumer {
  async start() {
    while (true) {
      const job = await redis.blpop('jobs:pending', 0);
      await this.processJob(job);
    }
  }
  
  async processJob(job) {
    await redis.hset(`job:${job.id}`, 'status', 'processing');
    // Run inference...
    await redis.hset(`job:${job.id}`, 'status', 'completed');
  }
}
```

**Acceptance Criteria:**
- Consumer can process 10 jobs/minute
- Retries work correctly
- Dead-letter queue receives failed jobs

---

### Task 4.4: Queue Publisher (Job Submission)

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Create API to submit jobs to queue.

**Checklist:**
- [ ] Create publish_job.js module
- [ ] Generate unique job IDs
- [ ] Push jobs to Redis queue
- [ ] Store job metadata
- [ ] Return job_id to caller
- [ ] Handle queue overflow (graceful error)

**Code:**
```javascript
async function submitJob(userId, imageUrl) {
  const jobId = generateUUID();
  const job = {
    id: jobId,
    user_id: userId,
    image_url: imageUrl,
    status: 'queued',
    created_at: new Date()
  };
  
  await redis.lpush('jobs:pending', JSON.stringify(job));
  return { job_id: jobId };
}
```

**Acceptance Criteria:**
- Can submit 100 jobs/sec
- Jobs persist in queue
- No data loss

---

### Task 4.5: Job Status Tracker

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Allow querying job status and results.

**Checklist:**
- [ ] Create getJobStatus() function
- [ ] Query Redis for job state
- [ ] Return current status and result (if complete)
- [ ] Handle missing jobs (404)
- [ ] Add caching (5-min cache)

**Acceptance Criteria:**
- Status queries <50ms
- Results accurate
- Caching reduces load

---

### Task 4.6: Queue Depth Monitoring

**Type:** Monitoring  
**Assigned to:** DevOps Engineer  
**Due Date:** +3 days  
**Effort:** 1 hour  
**Priority:** 🟡 High

**Description:**
Track queue depth for capacity planning.

**Checklist:**
- [ ] Create metrics: queue_depth, job_latency, failure_rate
- [ ] Push to CloudWatch every 30 seconds
- [ ] Set alarm: if queue_depth > 1000
- [ ] Set alarm: if failure_rate > 5%
- [ ] Create dashboard showing queue health

**Acceptance Criteria:**
- Metrics publishing to CloudWatch
- Alarms configured
- Dashboard created

---

### Task 4.7: Integration Test (100 Jobs)

**Type:** QA  
**Assigned to:** QA Engineer  
**Due Date:** +4 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
End-to-end test: submit 100 jobs, process them all.

**Checklist:**
- [ ] Submit 100 jobs to queue
- [ ] Monitor queue depth over time
- [ ] Verify all jobs complete
- [ ] Check zero job loss
- [ ] Check error handling for bad data

**Test:**
```javascript
const jobIds = [];
for (let i = 0; i < 100; i++) {
  const { job_id } = await submitJob(userId, testImageUrl);
  jobIds.push(job_id);
}

// Wait for all to complete
await waitForJobsCompletion(jobIds, timeout=10min);

// Verify
assert(allJobsCompleted(jobIds));
assert(queueEmpty());
```

**Acceptance Criteria:**
- All 100 jobs complete
- <5% failure rate
- Queue drains in <10 minutes

---

### Milestone Acceptance Criteria

**Queue ready when:**
- ✅ Redis running locally + ElastiCache
- ✅ Job publisher submitting jobs
- ✅ Queue consumer processing jobs
- ✅ Status tracking working
- ✅ Retry logic functional
- ✅ 100-job integration test passing

---

## PHASE 5: Local Worker Implementation

**Duration:** 4 days  
**Status:** 🔴 Not Started  
**Priority:** 🔴 Critical  
**Milestone:** Worker Processing Queue End-to-End

---

### Task 5.1: Model Loader Service

**Type:** Backend  
**Assigned to:** ML Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Load FastVLM once at startup, keep in memory.

**Checklist:**
- [ ] Create model_loader.js
- [ ] Load ONNX model at worker startup
- [ ] Cache model in memory
- [ ] Add error handling (model not found)
- [ ] Log load time and memory usage
- [ ] Test: model loads in <5 seconds

**Code:**
```javascript
class ModelLoader {
  async load() {
    console.log('Loading FastVLM model...');
    const start = Date.now();
    this.model = await loadONNXModel('models/fast_vlm.onnx');
    const loadTime = Date.now() - start;
    console.log(`Model loaded in ${loadTime}ms`);
  }
  
  getModel() {
    if (!this.model) throw new Error('Model not loaded');
    return this.model;
  }
}
```

**Acceptance Criteria:**
- Model loads in <5 seconds
- Memory usage <3GB
- Can run inference immediately after

---

### Task 5.2: Inference Pipeline

**Type:** Backend/ML  
**Assigned to:** ML Engineer  
**Due Date:** +2 days  
**Effort:** 3 hours  
**Priority:** 🔴 Critical

**Description:**
Run image through FastVLM inference.

**Checklist:**
- [ ] Create inference.js module
- [ ] Load image from URL
- [ ] Preprocess (resize, normalize)
- [ ] Run FastVLM inference
- [ ] Parse output text
- [ ] Return structured result

**Code:**
```javascript
async function runInference(imageUrl, prompt) {
  const image = await loadImage(imageUrl);
  const preprocessed = preprocessImage(image);
  
  const start = Date.now();
  const output = await model.generate({
    image: preprocessed,
    prompt: prompt
  });
  const latency = Date.now() - start;
  
  return {
    output,
    latency,
    tokens: output.split(' ').length
  };
}
```

**Subtasks:**
- [ ] Image loader (http, local file)
- [ ] Image preprocessor (resize to 1024x1024)
- [ ] Output parser (text → structured fields)

**Acceptance Criteria:**
- Single image processes <2 seconds
- Output quality consistent
- Error handling for bad images

---

### Task 5.3: Parser Integration

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Connect Phase 2 parser to worker.

**Checklist:**
- [ ] Import parser.js into worker
- [ ] Call parser on FastVLM output
- [ ] Add validation
- [ ] Catch parsing errors
- [ ] Return parsed + validated JSON

**Acceptance Criteria:**
- Parser runs automatically after inference
- Validation catches errors
- Output conforms to schema

---

### Task 5.4: Worker Queue Listener

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Listen to Redis queue, process jobs.

**Checklist:**
- [ ] Create worker_main.js
- [ ] Connect to Redis
- [ ] Implement job loop (BLPOP)
- [ ] Load and run inference
- [ ] Save result to database
- [ ] Update job status
- [ ] Handle errors gracefully

**Code:**
```javascript
class Worker {
  async start() {
    await modelLoader.load();
    while (true) {
      const jobStr = await redis.blpop('jobs:pending', 0);
      const job = JSON.parse(jobStr);
      
      try {
        await redis.hset(`job:${job.id}`, 'status', 'processing');
        
        const output = await runInference(job.image_url);
        const parsed = parser.parse(output);
        
        await db.products.insert({
          id: job.id,
          user_id: job.user_id,
          metadata: parsed,
          status: 'completed'
        });
        
        await redis.hset(`job:${job.id}`, 'status', 'completed');
      } catch (error) {
        await redis.hset(`job:${job.id}`, 'status', 'failed', 'error', error.message);
      }
    }
  }
}
```

**Acceptance Criteria:**
- Worker processes jobs continuously
- Results saved to database
- Errors handled without crashing

---

### Task 5.5: Error Handling & Dead-Letter Queue

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +3 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Implement retry logic and dead-letter queue for failed jobs.

**Checklist:**
- [ ] Implement retry counter (max 3 retries)
- [ ] Calculate exponential backoff (1s, 4s, 9s)
- [ ] Move failed jobs to dead-letter queue after 3 retries
- [ ] Log failures with error details
- [ ] Alert on dead-letter queue overflow

**Retry Logic:**
```javascript
async function handleJobFailure(job, error) {
  if (job.retry_count < 3) {
    const delay = Math.pow(job.retry_count + 1, 2) * 1000;
    job.retry_count++;
    setTimeout(() => {
      redis.lpush('jobs:pending', JSON.stringify(job));
    }, delay);
  } else {
    redis.lpush('jobs:dead_letter', JSON.stringify({...job, error}));
  }
}
```

**Acceptance Criteria:**
- Failed jobs retry correctly
- Dead-letter queue receives persistently failed jobs
- Retry delay increases exponentially

---

### Task 5.6: Logging & Debugging

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +3 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Add comprehensive logging for troubleshooting.

**Checklist:**
- [ ] Log job submission
- [ ] Log inference start/end
- [ ] Log parsing/validation
- [ ] Log database operations
- [ ] Log errors with stack traces
- [ ] Write logs to file (rolling)

**Log Format:**
```
[2024-01-15 10:30:45] INFO: Job submitted job_id=abc123
[2024-01-15 10:30:46] INFO: Inference started for job_id=abc123
[2024-01-15 10:30:47] INFO: Inference complete (latency=1200ms)
[2024-01-15 10:30:48] INFO: Parsing output...
[2024-01-15 10:30:48] INFO: Validation passed
[2024-01-15 10:30:49] INFO: Result saved to database
```

**Acceptance Criteria:**
- Logs contain all relevant info
- Log files rotate (don't fill disk)
- Can debug issues from logs

---

### Task 5.7: Performance Profiling

**Type:** QA  
**Assigned to:** QA Engineer  
**Due Date:** +4 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Profile worker performance: bottlenecks, memory usage.

**Checklist:**
- [ ] Measure inference latency distribution (p50, p95, p99)
- [ ] Measure memory usage over time
- [ ] Identify slowest stage (image load vs. inference vs. parsing)
- [ ] Check for memory leaks
- [ ] Create performance report

**Metrics:**
```
Inference latency:
- p50: 1200ms
- p95: 1500ms
- p99: 2000ms

Memory:
- Startup: 1200MB
- After 100 jobs: 1400MB (stable)
- Peak: 1600MB
```

**Acceptance Criteria:**
- Latency <2 sec consistently
- Memory stable (no leaks)
- Bottleneck identified

---

### Task 5.8: Integration Test (100 Jobs)

**Type:** QA  
**Assigned to:** QA Engineer  
**Due Date:** +4 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
End-to-end test: queue 100 images, worker processes all.

**Checklist:**
- [ ] Queue 100 test images
- [ ] Worker processes all jobs
- [ ] Verify 100% success rate
- [ ] Check results in database
- [ ] Verify parsing quality

**Test:**
```javascript
// Queue 100 jobs
for (let i = 0; i < 100; i++) {
  await submitJob(userId, testImages[i]);
}

// Wait for completion
await sleep(10 * 60 * 1000); // 10 minutes

// Verify
const results = await db.products.find({user_id: userId});
assert(results.length === 100);
assert(results.every(r => r.metadata.category));
```

**Acceptance Criteria:**
- All 100 jobs complete successfully
- Results stored in database
- Parsing passes validation

---

### Milestone Acceptance Criteria

**Worker ready when:**
- ✅ FastVLM model loads and runs
- ✅ Worker listens to Redis queue
- ✅ Inference + parsing working
- ✅ Results saved to database
- ✅ Retry logic functional
- ✅ 100-job test passing
- ✅ Latency <2 sec, memory stable

---

## PHASE 6: Cost & Capacity Planning

**Duration:** 2 days  
**Status:** 🔴 Not Started  
**Priority:** 🔴 Critical  
**Milestone:** Budget Approved, Scaling Strategy Defined

---

### Task 6.1: RunPod GPU Pricing Analysis

**Type:** Analysis  
**Assigned to:** Product Manager  
**Due Date:** +0.5 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Calculate exact RunPod costs for different GPU types.

**Checklist:**
- [ ] Research RunPod GPU pricing (RTX 4090, RTX 3090, A5000)
- [ ] Get hourly rates
- [ ] Calculate monthly cost for 1 worker running 24/7
- [ ] Calculate cost per image (jobs/day assumptions)
- [ ] Create pricing comparison spreadsheet

**Example:**
```
RTX 4090: $0.44/hour
- 1 worker 24/7 = $0.44 * 24 * 30 = $316/month
- Processing 100 images/day = 3000/month = $0.11/image
- Processing 10,000 images/day = $0.009/image
```

**Spreadsheet Outputs:**
- Cost per GPU type
- Cost per image (at various throughputs)
- Break-even customer count (if selling)

**Acceptance Criteria:**
- Pricing spreadsheet complete
- Decision: which GPU for launch?

---

### Task 6.2: Throughput Benchmarking

**Type:** Performance Testing  
**Assigned to:** ML Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Measure actual throughput: jobs/hour with one GPU worker.

**Checklist:**
- [ ] Run 1000 consecutive jobs on local GPU
- [ ] Measure: jobs/hour throughput
- [ ] Measure: queue latency (submit → complete)
- [ ] Identify bottleneck (GPU vs. I/O vs. queue)
- [ ] Document results

**Benchmark Test:**
```javascript
const start = Date.now();
for (let i = 0; i < 1000; i++) {
  await submitJob(userId, imageUrl);
}

// Wait for all to complete
await waitForCompletion(1000);

const duration = Date.now() - start;
const throughput = (1000 * 3600000) / duration; // jobs/hour
console.log(`Throughput: ${throughput} jobs/hour`);
```

**Expected Results:**
- RTX 4090: ~30-50 jobs/hour (2-3 min per job with queue latency)
- Queue latency: <100ms
- GPU inference: 1.2-2 sec

**Acceptance Criteria:**
- Throughput measured and documented
- Bottleneck identified

---

### Task 6.3: Capacity Planning Model

**Type:** Planning  
**Assigned to:** Product Manager  
**Due Date:** +1.5 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Build model: customer volume → required workers.

**Checklist:**
- [ ] Estimate launch customer volume
- [ ] Estimate images per customer/month
- [ ] Calculate total images/month
- [ ] Determine required workers (based on throughput)
- [ ] Calculate total cost

**Example Model:**
```
Launch month:
- 100 customers
- 100 images/customer/month
- 10,000 images/month

Throughput (RTX 4090): 40 jobs/hour
- Required hours/month: 10,000 / 40 = 250 hours
- Worker count: 250 / (24 * 30) = 0.35 workers
- → 1 worker sufficient

Monthly cost:
- 1 worker * $316 = $316
- Revenue (if $0.05/image): 10,000 * $0.05 = $500
- Gross margin: $184
```

**Spreadsheet:**
- Scenarios: 100/1000/10000 customers
- Cost vs. revenue for each scenario
- Break-even analysis

**Acceptance Criteria:**
- Capacity model created
- Multiple scenarios analyzed
- Break-even point clear

---

### Task 6.4: Scaling Strategy Decision

**Type:** Decision  
**Assigned to:** Tech Lead + Product Manager  
**Due Date:** +2 days  
**Effort:** 1 hour  
**Priority:** 🔴 Critical

**Description:**
Decide: launch with 1 worker or auto-scaling group?

**Checklist:**
- [ ] Review: throughput, cost, complexity
- [ ] Decision: single worker vs. auto-scaling
- [ ] If auto-scaling: define scaling rules
- [ ] If single: define manual scale points

**Options:**
```
Option A: Single Worker
- Cost: $316/month
- Reliability: lower (no redundancy)
- Max throughput: 40 jobs/hour
- Complexity: low
- Good for: <5000 images/month

Option B: Auto-scaling (1-5 workers)
- Cost: $316-1580/month
- Reliability: higher (redundancy)
- Max throughput: 40-200 jobs/hour
- Complexity: medium
- Good for: 5000+ images/month
```

**Recommendation for Launch:** Single worker initially, add auto-scaling at 5000 images/month.

**Acceptance Criteria:**
- Scaling strategy documented
- Decision approved by stakeholders
- Scaling triggers defined

---

### Task 6.5: Budget Approval

**Type:** Approval  
**Assigned to:** Finance  
**Due Date:** +2 days  
**Effort:** 1 hour  
**Priority:** 🔴 Critical

**Description:**
Get formal approval for infrastructure spending.

**Checklist:**
- [ ] Present cost model to finance
- [ ] Get approval for initial budget
- [ ] Set spending alerts (e.g., alert if >$500/month)
- [ ] Define approval process for scaling

**Budget Approval:**
```
Initial Monthly Budget: $500
- Infrastructure: $316 (1 GPU worker)
- Database: $50 (RDS)
- Cache: $20 (ElastiCache)
- Storage: $50 (S3)
- Monitoring: $64 (Datadog or CloudWatch)
Total: $500
```

**Acceptance Criteria:**
- CFO/Finance approval obtained
- Budget allocated
- Spending alerts set

---

### Milestone Acceptance Criteria

**Cost planning complete when:**
- ✅ RunPod pricing analyzed
- ✅ Throughput benchmarked
- ✅ Capacity model created
- ✅ Scaling strategy decided
- ✅ Budget approved

---

## PHASE 7: Dockerization

**Duration:** 3 days  
**Status:** 🔴 Not Started  
**Priority:** 🔴 Critical  
**Milestone:** Docker Image Built & Tested

---

### Task 7.1: Dockerfile Creation

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Write Dockerfile for GPU worker.

**Checklist:**
- [ ] Base image: nvidia/cuda:12.1.1-runtime-ubuntu22.04
- [ ] Install Node.js 18+
- [ ] Install dependencies (apt-get)
- [ ] Copy application code
- [ ] Install npm packages
- [ ] Add health check
- [ ] Document image size

**Dockerfile:**
```dockerfile
FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "worker_main.js"]
```

**Acceptance Criteria:**
- Dockerfile builds successfully
- Image size <2GB
- Health check works

---

### Task 7.2: Docker Compose for Local Testing

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +1 day  
**Effort:** 1 hour  
**Priority:** 🟡 High

**Description:**
Create docker-compose.yml for local development/testing.

**Checklist:**
- [ ] Define services: worker, redis, postgres
- [ ] Set environment variables
- [ ] Mount volumes for model cache
- [ ] Set resource limits (GPU, memory)
- [ ] Document how to run locally

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: products
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  worker:
    build: .
    environment:
      REDIS_URL: redis://redis:6379
      DATABASE_URL: postgresql://postgres:password@postgres:5432/products
    volumes:
      - ./models:/app/models
      - model_cache:/app/.cache
    depends_on:
      - redis
      - postgres
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  redis_data:
  postgres_data:
  model_cache:
```

**Acceptance Criteria:**
- `docker-compose up` runs all services
- Worker connects to Redis and PostgreSQL
- GPU available to container

---

### Task 7.3: Build & Push to Docker Hub

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +2 days  
**Effort:** 1 hour  
**Priority:** 🟡 High

**Description:**
Build image and push to Docker Hub registry.

**Checklist:**
- [ ] Create Docker Hub account
- [ ] Create repository (e.g., oneproductiq/worker)
- [ ] Build image locally (`docker build -t ...`)
- [ ] Push to Docker Hub (`docker push ...`)
- [ ] Tag with version (v1.0.0)
- [ ] Document push procedure

**Build Script (build.sh):**
```bash
#!/bin/bash
VERSION=$1
docker build -t oneproductiq/worker:$VERSION .
docker tag oneproductiq/worker:$VERSION oneproductiq/worker:latest
docker push oneproductiq/worker:$VERSION
docker push oneproductiq/worker:latest
```

**Acceptance Criteria:**
- Image pushed to Docker Hub
- Image pulls successfully
- Version tags applied

---

### Task 7.4: Local Docker Testing (100 Jobs)

**Type:** QA  
**Assigned to:** QA Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Run Docker container locally, process 100 jobs.

**Checklist:**
- [ ] Start docker-compose stack
- [ ] Queue 100 test jobs
- [ ] Monitor worker processing
- [ ] Verify 100% completion
- [ ] Check logs for errors
- [ ] Verify database results

**Test Procedure:**
```bash
docker-compose up -d
docker-compose logs -f worker

# In another terminal
npm run test:queue-100-jobs

# Wait for completion
# Check results
docker exec worker_postgres_1 psql -d products -c "SELECT COUNT(*) FROM products;"
```

**Acceptance Criteria:**
- All 100 jobs complete in container
- Results saved to PostgreSQL
- No errors in logs

---

### Task 7.5: Image Size & Optimization

**Type:** Performance  
**Assigned to:** DevOps Engineer  
**Due Date:** +3 days  
**Effort:** 1 hour  
**Priority:** 🟡 High

**Description:**
Reduce Docker image size (faster pulls).

**Checklist:**
- [ ] Check current image size
- [ ] Remove unnecessary files (node_modules, tests)
- [ ] Use .dockerignore
- [ ] Use multi-stage builds if needed
- [ ] Target size: <2GB

**.dockerignore:**
```
node_modules
npm-debug.log
.git
.gitignore
README.md
test
.env.local
```

**Acceptance Criteria:**
- Image size <2GB
- Build time <5 minutes
- Pulls fast on limited bandwidth

---

### Task 7.6: CI/CD Pipeline for Docker Builds

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +3 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Automate Docker builds on git push.

**Checklist:**
- [ ] Create GitHub Actions workflow
- [ ] Build image on every push to main
- [ ] Push to Docker Hub automatically
- [ ] Tag with git commit SHA
- [ ] Add build status badge

**.github/workflows/docker.yml:**
```yaml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            oneproductiq/worker:latest
            oneproductiq/worker:${{ github.sha }}
```

**Acceptance Criteria:**
- Workflow triggers on push
- Image builds automatically
- Image pushed to Docker Hub with tags

---

### Milestone Acceptance Criteria

**Dockerization complete when:**
- ✅ Dockerfile builds successfully
- ✅ Docker Compose runs all services
- ✅ Local Docker test (100 jobs) passes
- ✅ Image <2GB
- ✅ CI/CD pipeline automated

---

## PHASE 8: RunPod Deployment & Scaling

**Duration:** 3 days  
**Status:** 🔴 Not Started  
**Priority:** 🔴 Critical  
**Milestone:** Worker Running on RunPod

---

### Task 8.1: RunPod Account Setup

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +0.5 days  
**Effort:** 1 hour  
**Priority:** 🔴 Critical

**Description:**
Create RunPod account, configure billing.

**Checklist:**
- [ ] Create RunPod account
- [ ] Add payment method
- [ ] Create API key
- [ ] Set spending limit alert
- [ ] Document API credentials (secure vault)

**Acceptance Criteria:**
- Account active
- Can see GPU availability
- Credentials stored securely

---

### Task 8.2: RunPod Network Volume Setup

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +1 day  
**Effort:** 1 hour  
**Priority:** 🔴 Critical

**Description:**
Create persistent network volume for model cache.

**Checklist:**
- [ ] Create network volume (RunPod UI)
- [ ] Size: 5GB (for FastVLM model + cache)
- [ ] Mount at /app/models in container
- [ ] Pre-populate with FastVLM model
- [ ] Document mount procedure

**Why Network Volume:**
- Avoid downloading 2GB model on every pod start
- Cold start: 30 seconds (without) → 5 seconds (with volume)
- Shared across multiple workers

**Acceptance Criteria:**
- Network volume created
- FastVLM model uploaded
- Mounts correctly in containers

---

### Task 8.3: RunPod Pod Configuration

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Configure RunPod worker pods.

**Checklist:**
- [ ] Select GPU type (RTX 4090 recommended)
- [ ] Set docker image (oneproductiq/worker:latest)
- [ ] Configure environment variables
- [ ] Mount network volume
- [ ] Set resource requests (GPU, memory)
- [ ] Configure networking

**RunPod Pod Configuration:**
```json
{
  "image": "oneproductiq/worker:latest",
  "gpu_count": 1,
  "volume_mount_path": "/app/models",
  "env": [
    {
      "key": "REDIS_URL",
      "value": "redis://worker-redis:6379"
    },
    {
      "key": "DATABASE_URL",
      "value": "postgresql://user:pass@worker-db:5432/products"
    }
  ],
  "ports": ["3000:3000"],
  "resources": {
    "memory_gb": 16,
    "cpu_count": 4
  }
}
```

**Acceptance Criteria:**
- Pod configuration saved
- Can launch pod from configuration

---

### Task 8.4: Launch Single Worker Pod

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +1.5 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Deploy first worker pod to RunPod.

**Checklist:**
- [ ] Launch pod from UI
- [ ] Wait for pod to be "Running"
- [ ] SSH into pod, verify worker running
- [ ] Check GPU detection (nvidia-smi)
- [ ] Submit test job to queue
- [ ] Verify job completes
- [ ] Check pod logs

**Test:**
```bash
# SSH into pod
runpod-cli ssh pod-id

# Inside pod
nvidia-smi  # Verify GPU
ps aux | grep worker  # Verify process running
tail -f worker.log  # Monitor logs

# Test job submission (from local machine)
curl -X POST http://pod-ip:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"image_url": "..."}'
```

**Acceptance Criteria:**
- Pod running successfully
- Worker processing jobs
- GPU detected and used

---

### Task 8.5: Auto-scaling Worker Group

**Type:** DevOps  
**Assigned to:** DevOps Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Set up RunPod worker group with auto-scaling.

**Checklist:**
- [ ] Create worker group (`workers=(1,5)`)
- [ ] Set min workers: 1
- [ ] Set max workers: 5
- [ ] Define scale-up trigger (queue depth >10 jobs)
- [ ] Define scale-down trigger (queue depth <2 jobs)
- [ ] Monitor scaling behavior

**RunPod Worker Group Config:**
```
name: oneproductiq-workers
container_image: oneproductiq/worker:latest
min_workers: 1
max_workers: 5
gpu_type: "RTX_4090"
scale_up_threshold: 10  # jobs in queue
scale_down_threshold: 2
scale_up_cooldown: 60  # seconds
scale_down_cooldown: 300  # seconds
```

**Acceptance Criteria:**
- Worker group created
- Scaling triggers set
- Can monitor active workers

---

### Task 8.6: Load Testing on RunPod

**Type:** QA  
**Assigned to:** QA Engineer  
**Due Date:** +2.5 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Test scaling and performance on RunPod.

**Checklist:**
- [ ] Submit 100 jobs to queue
- [ ] Monitor auto-scaling (watch workers increase)
- [ ] Measure queue latency
- [ ] Measure job completion time
- [ ] Verify cost (jobs/hour * cost)
- [ ] Test scale-down (workers decrease)

**Load Test:**
```bash
# Submit 100 jobs
for i in {1..100}; do
  curl -X POST http://api:8000/api/jobs \
    -H "Content-Type: application/json" \
    -d "{\"image_url\": \"test_$i.jpg\"}" &
done

# Monitor RunPod (watch workers)
watch 'runpod-cli list-pods | grep oneproductiq'

# Wait for completion
# Check metrics:
# - Queue depth over time
# - Worker count over time
# - Job latency distribution
```

**Acceptance Criteria:**
- 100 jobs complete successfully
- Workers scale up to 3-4
- Workers scale down after completion
- Cost reasonable (<$5 for 100 jobs)

---

### Task 8.7: Monitoring & Alerting

**Type:** Monitoring  
**Assigned to:** DevOps Engineer  
**Due Date:** +3 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Set up monitoring for RunPod workers.

**Checklist:**
- [ ] Set up CloudWatch metrics (queue depth, job latency)
- [ ] Create alarms: queue_depth > 50
- [ ] Create alarms: pod crash
- [ ] Create alarms: cost > $20/hour
- [ ] Set up Slack notifications

**CloudWatch Alarms:**
```
1. Queue Depth > 50 jobs
   → Action: Scale to max workers
   → Notify: Slack #ops

2. Pod Crash
   → Action: Auto-restart pod
   → Notify: Slack #alerts

3. Hourly Cost > $20
   → Action: Scale down to 1 worker
   → Notify: Slack #billing
```

**Acceptance Criteria:**
- Metrics collected and displayed
- Alarms configured
- Notifications working

---

### Milestone Acceptance Criteria

**RunPod deployment complete when:**
- ✅ Single worker pod running successfully
- ✅ Auto-scaling worker group configured
- ✅ 100-job load test passing
- ✅ Monitoring and alerts active
- ✅ Cost acceptable

---

## PHASE 9: API Layer & Authentication

**Duration:** 5 days  
**Status:** 🔴 Not Started  
**Priority:** 🔴 Critical  
**Milestone:** API Ready for Frontend

---

### Task 9.1: Authentication System (JWT)

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +1 day  
**Effort:** 3 hours  
**Priority:** 🔴 Critical

**Description:**
Implement JWT-based authentication.

**Checklist:**
- [ ] Create User model (email, password_hash)
- [ ] Implement JWT token generation
- [ ] Implement token refresh logic (30-day expiry)
- [ ] Add middleware: verify JWT on protected routes
- [ ] Add password hashing (bcrypt)
- [ ] Create login endpoint

**Endpoints:**
```
POST /auth/register
  Input: email, password
  Output: user_id, token

POST /auth/login
  Input: email, password
  Output: token, refresh_token

POST /auth/refresh
  Input: refresh_token
  Output: new_token

GET /auth/me
  Headers: Authorization: Bearer token
  Output: user profile
```

**Acceptance Criteria:**
- JWT tokens issued and verified
- Password hashing secure
- Token refresh working

---

### Task 9.2: Upload Endpoint

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +1.5 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Create file upload endpoint.

**Checklist:**
- [ ] Accept multipart/form-data (images)
- [ ] Validate file type (jpg, png, webp)
- [ ] Validate file size (<50MB)
- [ ] Save to S3
- [ ] Generate job in queue
- [ ] Return job_id

**Endpoint:**
```
POST /api/v1/products/upload
Headers: Authorization: Bearer token
Content-Type: multipart/form-data

Input: image file

Output:
{
  "job_id": "uuid",
  "status": "queued",
  "image_url": "s3://bucket/..."
}
```

**Code:**
```javascript
app.post('/api/v1/products/upload', authenticate, async (req, res) => {
  const file = req.file;
  
  // Validate
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    return res.status(400).json({error: 'Invalid file type'});
  }
  
  if (file.size > 50 * 1024 * 1024) {
    return res.status(400).json({error: 'File too large'});
  }
  
  // Upload to S3
  const key = `products/${req.user.id}/${generateUUID()}`;
  await s3.upload({Bucket: 'bucket', Key: key, Body: file.buffer}).promise();
  
  // Queue job
  const jobId = await submitJob(req.user.id, `s3://bucket/${key}`);
  
  res.json({job_id: jobId, status: 'queued'});
});
```

**Acceptance Criteria:**
- Files upload successfully to S3
- Jobs queued automatically
- File validation working

---

### Task 9.3: Job Status Endpoint

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +1.5 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Create endpoint to check job status.

**Checklist:**
- [ ] GET /api/v1/jobs/{job_id}
- [ ] Return status (queued, processing, completed, failed)
- [ ] Return result (if completed)
- [ ] Return error (if failed)
- [ ] Add caching (5-min cache)

**Endpoint:**
```
GET /api/v1/jobs/{job_id}
Headers: Authorization: Bearer token

Output:
{
  "job_id": "uuid",
  "status": "completed",
  "result": {
    "category": "shirts",
    "colors": ["navy"],
    ...
  },
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:31:00Z"
}
```

**Acceptance Criteria:**
- Status tracking works
- Results returned after completion
- Caching reduces load

---

### Task 9.4: Product List & Search Endpoint

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +2 days  
**Effort:** 3 hours  
**Priority:** 🟡 High

**Description:**
Create endpoint to list and search products.

**Checklist:**
- [ ] GET /api/v1/products (list all user's products)
- [ ] Support pagination (limit, offset)
- [ ] Support filtering (category, color, material)
- [ ] Support sorting (created_at, quality_score)
- [ ] Add search (full-text on title/description)

**Endpoints:**
```
GET /api/v1/products?limit=20&offset=0&category=shirts&color=navy
  Returns: paginated list of products

GET /api/v1/products/search?q=casual+shirt
  Returns: search results
```

**Acceptance Criteria:**
- Pagination working
- Filters applied correctly
- Search returns relevant results

---

### Task 9.5: Product Detail Endpoint

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Get detailed product metadata.

**Checklist:**
- [ ] GET /api/v1/products/{product_id}
- [ ] Return full metadata + image URL
- [ ] Return quality scores + confidence
- [ ] Allow editing (PUT) for manual corrections
- [ ] Track edits (who edited what when)

**Endpoint:**
```
GET /api/v1/products/{product_id}

Output:
{
  "id": "uuid",
  "image_url": "s3://...",
  "metadata": {...},
  "quality_score": 0.92,
  "confidence": 0.88,
  "created_at": "...",
  "last_edited_by": "user123",
  "edits": [
    {"field": "category", "old": "shirts", "new": "tops", "by": "user123", "at": "..."}
  ]
}

PUT /api/v1/products/{product_id}
Input: metadata updates
```

**Acceptance Criteria:**
- Product detail retrieval working
- Editing working
- Edit history tracked

---

### Task 9.6: Bulk Operations Endpoint

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +3 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Support bulk operations (export, delete).

**Checklist:**
- [ ] GET /api/v1/products/export (download CSV)
- [ ] POST /api/v1/products/bulk-delete (delete multiple)
- [ ] POST /api/v1/products/bulk-update (update field on multiple)

**Endpoints:**
```
GET /api/v1/products/export?format=csv
  Returns: CSV file download

POST /api/v1/products/bulk-delete
Input: {product_ids: [...]}

POST /api/v1/products/bulk-update
Input: {product_ids: [...], updates: {category: "new_value"}}
```

**Acceptance Criteria:**
- CSV export working
- Bulk operations complete quickly (<5 sec for 1000)

---

### Task 9.7: Rate Limiting & Abuse Protection

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +4 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Prevent API abuse with rate limiting.

**Checklist:**
- [ ] Implement rate limiter (Redis)
- [ ] Limit: 100 requests/minute per user
- [ ] Limit: 10 uploads/minute per user
- [ ] Return 429 (Too Many Requests) when exceeded
- [ ] Add rate limit info to response headers

**Rate Limit Middleware:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  store: new RedisStore({...}),
  windowMs: 60 * 1000,  // 1 minute
  max: 100,  // 100 requests
  keyGenerator: (req) => req.user.id
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,  // 10 uploads
  keyGenerator: (req) => req.user.id
});

app.use('/api/', limiter);
app.post('/api/v1/products/upload', uploadLimiter, ...);
```

**Acceptance Criteria:**
- Rate limiter working
- Abuse attempts blocked
- Headers correct

---

### Task 9.8: API Documentation (OpenAPI/Swagger)

**Type:** Documentation  
**Assigned to:** Backend Engineer  
**Due Date:** +4 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Document API with OpenAPI/Swagger spec.

**Checklist:**
- [ ] Write OpenAPI 3.0 spec (openapi.yaml)
- [ ] Document all endpoints
- [ ] Include request/response examples
- [ ] Generate Swagger UI (interactive docs)
- [ ] Host at /api/docs

**OpenAPI Spec:**
```yaml
openapi: 3.0.0
info:
  title: OneProductIQ API
  version: 1.0.0

paths:
  /auth/login:
    post:
      summary: Login user
      requestBody:
        content:
          application/json:
            schema:
              properties:
                email: {type: string}
                password: {type: string}
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                properties:
                  token: {type: string}
```

**Acceptance Criteria:**
- API docs complete
- Swagger UI working
- Examples provided for all endpoints

---

### Task 9.9: Integration Test (API)

**Type:** QA  
**Assigned to:** QA Engineer  
**Due Date:** +5 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
End-to-end test: register, upload, check status, download result.

**Checklist:**
- [ ] Register user
- [ ] Login and get token
- [ ] Upload image
- [ ] Check job status (poll)
- [ ] Get product metadata
- [ ] Edit product
- [ ] Search products
- [ ] Export CSV

**Test:**
```javascript
// Register & login
const user = await register('test@example.com', 'password');
const {token} = await login('test@example.com', 'password');

// Upload
const {job_id} = await upload(token, imageFile);

// Poll status
while (true) {
  const {status, result} = await getJobStatus(token, job_id);
  if (status === 'completed') break;
  await sleep(2000);
}

// Verify result
assert(result.metadata.category);
assert(result.quality_score > 0.8);

// Export
const csv = await exportProducts(token);
assert(csv.includes(result.id));
```

**Acceptance Criteria:**
- All operations succeed
- API stable under 100 requests
- Response times <1 sec

---

### Milestone Acceptance Criteria

**API ready when:**
- ✅ Authentication working (JWT)
- ✅ Upload endpoint functional
- ✅ Job status tracking working
- ✅ Product retrieval working
- ✅ Rate limiting active
- ✅ API documented
- ✅ Integration test passing

---

## PHASE 10: Analytics & Search Layer

**Duration:** 4 days  
**Status:** 🔴 Not Started  
**Priority:** 🟡 High  
**Milestone:** Search & Analytics Live

---

### Task 10.1: PostgreSQL Search Implementation

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Implement full-text search using PostgreSQL.

**Checklist:**
- [ ] Create fulltext search index
- [ ] Implement tsvector columns for title + description
- [ ] Create search function
- [ ] Test search relevance

**SQL:**
```sql
ALTER TABLE products ADD COLUMN search_vector tsvector;

CREATE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('english', COALESCE(NEW.metadata->>'title', '') || ' ' || COALESCE(NEW.metadata->>'description', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_update BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE update_search_vector();

CREATE INDEX idx_products_search ON products USING gin(search_vector);
```

**Search Query:**
```sql
SELECT * FROM products
WHERE user_id = $1
  AND search_vector @@ plainto_tsquery('english', $2)
ORDER BY ts_rank(search_vector, plainto_tsquery('english', $2)) DESC
LIMIT 20;
```

**Acceptance Criteria:**
- Search returns relevant results
- Queries <500ms
- Ranking is good

---

### Task 10.2: Faceted Search (Filters)

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +1.5 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Implement filtering by category, color, material, etc.

**Checklist:**
- [ ] Extract available values for each facet
- [ ] Implement filter combinations
- [ ] Return facet counts (e.g., "15 navy items")
- [ ] Optimize with JSONB indexes

**Endpoint:**
```
GET /api/v1/products/facets?category=shirts
  Returns: {
    "facets": {
      "colors": [
        {"value": "navy", "count": 23},
        {"value": "white", "count": 15}
      ],
      "materials": [...]
    }
  }

GET /api/v1/products?category=shirts&color=navy&material=cotton
  Returns: filtered results
```

**Acceptance Criteria:**
- Filters work correctly
- Facet counts accurate
- Performance <500ms

---

### Task 10.3: Aggregations & Analytics

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +2 days  
**Effort:** 3 hours  
**Priority:** 🟡 High

**Description:**
Implement analytics queries (trend, distribution, quality metrics).

**Checklist:**
- [ ] Category distribution (how many products per category)
- [ ] Color trends (what colors appear most)
- [ ] Quality metrics (avg quality score, % with confidence > 80%)
- [ ] Missing data analysis (products missing size, care, etc.)
- [ ] Trend over time (uploads/day)

**Endpoint:**
```
GET /api/v1/analytics/dashboard
  Returns: {
    "total_products": 1000,
    "by_category": {
      "shirts": 300,
      "pants": 250,
      ...
    },
    "by_color": {...},
    "avg_quality_score": 0.87,
    "pct_complete": 94,
    "daily_uploads": [
      {"date": "2024-01-15", "count": 50},
      ...
    ]
  }
```

**SQL Examples:**
```sql
-- Category distribution
SELECT metadata->>'category' as category, COUNT(*) as count
FROM products
WHERE user_id = $1
GROUP BY category
ORDER BY count DESC;

-- Quality metrics
SELECT
  AVG(quality_score) as avg_quality,
  COUNT(*) FILTER (WHERE confidence > 0.8) as high_confidence_count,
  COUNT(*) as total
FROM products
WHERE user_id = $1;
```

**Acceptance Criteria:**
- All analytics queries working
- Performance <1 sec
- Numbers accurate

---

### Task 10.4: Search Performance Optimization

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +3 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Optimize search speed for large datasets.

**Checklist:**
- [ ] Add appropriate indexes
- [ ] Test with 10,000 products
- [ ] Measure query time <200ms
- [ ] Consider caching common queries
- [ ] Implement pagination (limit results)

**Indexes:**
```sql
CREATE INDEX idx_products_category ON products((metadata->>'category'));
CREATE INDEX idx_products_color ON products USING gin((metadata->'colors'));
CREATE INDEX idx_products_quality ON products(quality_score DESC);
```

**Caching Strategy:**
```javascript
// Cache popular searches (30-min TTL)
const cacheKey = `search:${userId}:${query}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const results = await db.search(userId, query);
await redis.setex(cacheKey, 30 * 60, JSON.stringify(results));
return results;
```

**Acceptance Criteria:**
- Search <200ms for 10,000 products
- Analytics <1 sec
- Cache hit rate >50%

---

### Task 10.5: Analytics Dashboard Endpoint

**Type:** Backend  
**Assigned to:** Backend Engineer  
**Due Date:** +4 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Create comprehensive analytics endpoint.

**Checklist:**
- [ ] Return all analytics in single request
- [ ] Precompute stats (cache for 5 min)
- [ ] Include trends over time
- [ ] Include data quality metrics
- [ ] Include recommendations (e.g., "50% missing care_instructions")

**Endpoint:**
```
GET /api/v1/analytics/dashboard
  Returns: comprehensive dashboard data
```

**Response:**
```json
{
  "metadata": {
    "total_products": 1000,
    "last_updated": "2024-01-15T10:30:00Z"
  },
  "distribution": {
    "by_category": {...},
    "by_color": {...},
    "by_material": {...}
  },
  "quality": {
    "avg_quality_score": 0.87,
    "avg_confidence": 0.89,
    "pct_high_quality": 78,
    "pct_complete": 94
  },
  "trends": {
    "daily_uploads": [...],
    "daily_completions": [...]
  },
  "gaps": {
    "missing_care_instructions": 120,
    "missing_size": 45,
    "low_quality_images": 23
  },
  "recommendations": [
    "Re-enrich 45 products missing size data",
    "Review 23 low-quality images"
  ]
}
```

**Acceptance Criteria:**
- Dashboard endpoint working
- All metrics accurate
- Response time <1 sec

---

### Milestone Acceptance Criteria

**Search & analytics ready when:**
- ✅ Full-text search working
- ✅ Faceted search working
- ✅ Analytics queries functional
- ✅ Performance optimized (<500ms)
- ✅ Dashboard endpoint live

---

## PHASE 11: Frontend Intelligence Dashboard

**Duration:** 5 days  
**Status:** 🔴 Not Started  
**Priority:** 🟡 High  
**Milestone:** Frontend MVP Complete

---

### Task 11.1: Dashboard Layout & Navigation

**Type:** Frontend  
**Assigned to:** Frontend Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Create main dashboard layout with navigation.

**Checklist:**
- [ ] Create sidebar navigation (Products, Analytics, Settings)
- [ ] Create top navbar (user menu, logout)
- [ ] Responsive layout (mobile-friendly)
- [ ] Add breadcrumb navigation
- [ ] Create loading skeleton screens

**Pages:**
1. Dashboard (overview stats)
2. Products (list, search, filter)
3. Product Detail (metadata, edit)
4. Analytics (charts, metrics)
5. Settings (account, preferences)

**Acceptance Criteria:**
- Navigation works smoothly
- Layout responsive
- Skeleton screens improve perceived speed

---

### Task 11.2: Product Upload Page

**Type:** Frontend  
**Assigned to:** Frontend Engineer  
**Due Date:** +1.5 days  
**Effort:** 3 hours  
**Priority:** 🔴 Critical

**Description:**
Create product upload interface.

**Checklist:**
- [ ] Drag-drop image upload
- [ ] Multiple file support
- [ ] Progress bar (file upload + processing)
- [ ] Real-time job status polling
- [ ] Success feedback
- [ ] Error handling with retry

**Features:**
```
Upload Area:
- Drag files here or click to select
- Supported: JPG, PNG, WebP (<50MB)

Progress:
- Upload progress: 50%
- Processing: Job #123 (Queued → Processing → Completed)
- Elapsed: 2m 30s

Results:
- [✓] image1.jpg - Processing
- [✓] image2.jpg - Completed
- [✗] image3.jpg - Failed (Retry)
```

**Acceptance Criteria:**
- Can upload 1-10 images
- Progress tracking works
- Results display correctly

---

### Task 11.3: Product List Page

**Type:** Frontend  
**Assigned to:** Frontend Engineer  
**Due Date:** +2 days  
**Effort:** 3 hours  
**Priority:** 🔴 Critical

**Description:**
Create product list with search & filters.

**Checklist:**
- [ ] Table view (image, title, category, color, quality, created date)
- [ ] Search bar (search by title/description)
- [ ] Filter sidebar (category, color, material)
- [ ] Pagination (20 per page)
- [ ] Sort options (date, quality, alphabetical)
- [ ] Bulk select (select multiple for bulk actions)

**Features:**
```
Filter Panel:
- Category (checkboxes)
- Color (color swatches)
- Material (checkboxes)
- Quality Score (slider)

Table:
- Thumbnail image
- Product title (truncated)
- Category
- Primary color
- Quality score (progress bar)
- Created date
- [Edit] [Delete] buttons
```

**Acceptance Criteria:**
- Filters work correctly
- Search returns relevant results
- Pagination smooth
- Can select & delete multiple

---

### Task 11.4: Product Detail & Edit Page

**Type:** Frontend  
**Assigned to:** Frontend Engineer  
**Due Date:** +2.5 days  
**Effort:** 3 hours  
**Priority:** 🟡 High

**Description:**
Create detailed product view with editing.

**Checklist:**
- [ ] Display large product image
- [ ] Show all metadata fields
- [ ] Display quality & confidence scores
- [ ] Allow inline editing
- [ ] Save changes to backend
- [ ] Show edit history
- [ ] Similar products recommendations

**Features:**
```
Left Panel:
- Large product image
- Zoom on hover
- Suggest alternative images (if available)

Right Panel:
- Title (editable)
- Description (editable textarea)
- Category/Subcategory (editable dropdown)
- Attributes (editable, with autocomplete)
- Colors (editable tag input)
- Quality score (read-only)
- Confidence (read-only)

Similar Products:
- Show 3-5 similar items (based on attributes)
```

**Acceptance Criteria:**
- All fields display correctly
- Editing works
- Changes saved to backend
- Similar products show

---

### Task 11.5: Analytics Dashboard

**Type:** Frontend  
**Assigned to:** Frontend Engineer  
**Due Date:** +3 days  
**Effort:** 3 hours  
**Priority:** 🟡 High

**Description:**
Create analytics visualization.

**Checklist:**
- [ ] KPI cards (total products, avg quality, % complete)
- [ ] Category distribution chart (bar chart)
- [ ] Color trends chart (pie or bar)
- [ ] Quality score distribution (histogram)
- [ ] Daily upload trend (line chart)
- [ ] Data quality gaps (what's missing)

**Charts:**
1. **KPI Cards:**
   - Total Products: 1,234
   - Avg Quality: 87%
   - % Complete: 94%
   - Daily Uploads: 42

2. **Category Distribution:**
   - Shirts: 300
   - Pants: 250
   - Dresses: 200
   - Etc.

3. **Quality Trends:**
   - X-axis: Upload date
   - Y-axis: Avg quality score
   - Shows improvement over time

**Acceptance Criteria:**
- Charts render correctly
- Data updates in real-time
- Charts responsive (mobile-friendly)

---

### Task 11.6: Settings & Account Page

**Type:** Frontend  
**Assigned to:** Frontend Engineer  
**Due Date:** +3.5 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Create user settings page.

**Checklist:**
- [ ] Display profile (email, name)
- [ ] Change password
- [ ] API key management
- [ ] Billing info
- [ ] Preferences (dark mode, language)
- [ ] Logout

**Settings Sections:**
1. **Account:**
   - Email (read-only)
   - Name (editable)
   - Change password

2. **API:**
   - API keys list
   - Generate new key
   - Revoke key

3. **Billing:**
   - Current plan
   - Usage (X images this month)
   - Upgrade/downgrade link

4. **Preferences:**
   - Theme (light/dark)
   - Language

**Acceptance Criteria:**
- Settings display correctly
- Changes save properly
- API key management works

---

### Task 11.7: Notifications & Toast Messages

**Type:** Frontend  
**Assigned to:** Frontend Engineer  
**Due Date:** +4 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Add user feedback messages.

**Checklist:**
- [ ] Success toast (file uploaded, settings saved)
- [ ] Error toast (upload failed, network error)
- [ ] Warning toast (unsaved changes)
- [ ] Info toast (job processing)
- [ ] Toast auto-dismiss (5 sec)
- [ ] Toast stack (multiple at once)

**Implementation:**
```javascript
// Toast examples
toast.success('Product uploaded successfully');
toast.error('Upload failed: File too large');
toast.warning('You have unsaved changes');
toast.info('Processing image...');

// With action
toast.loading('Uploading...', {
  action: 'Cancel',
  onClick: () => cancelUpload()
});
```

**Acceptance Criteria:**
- Toasts display correctly
- Auto-dismiss works
- Multiple toasts stack

---

### Task 11.8: Integration Test (Full Workflow)

**Type:** QA  
**Assigned to:** QA Engineer  
**Due Date:** +5 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
End-to-end test: register, upload, view results.

**Checklist:**
- [ ] Register new account
- [ ] Login
- [ ] Upload 5 images
- [ ] Wait for processing
- [ ] View product list
- [ ] Search for products
- [ ] View product detail
- [ ] Edit product
- [ ] View analytics
- [ ] Logout

**Test:**
```javascript
// Register & login
cy.visit('/register');
cy.get('[data-test=email]').type('test@example.com');
cy.get('[data-test=password]').type('password123');
cy.get('[data-test=submit]').click();

// Upload
cy.visit('/dashboard/upload');
cy.get('[data-test=dropzone]').selectFile(['image1.jpg', 'image2.jpg']);
cy.get('[data-test=upload-btn]').click();

// Wait for completion
cy.get('[data-test=job-status]').should('contain', 'Completed');

// View results
cy.visit('/dashboard/products');
cy.get('[data-test=product-row]').should('have.length', 2);
```

**Acceptance Criteria:**
- Full workflow works end-to-end
- No errors in console
- UI responsive and polished

---

### Milestone Acceptance Criteria

**Frontend complete when:**
- ✅ Dashboard layout responsive
- ✅ Upload page functional
- ✅ Product list working
- ✅ Product detail working
- ✅ Analytics charts displaying
- ✅ Settings page functional
- ✅ Full workflow test passing

---

## PHASE 12: Monitoring & Observability

**Duration:** 3 days  
**Status:** 🔴 Not Started  
**Priority:** 🟡 High  
**Milestone:** Production Monitoring Active

---

### Task 12.1: CloudWatch Metrics Setup

**Type:** Monitoring  
**Assigned to:** DevOps Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Set up CloudWatch metrics for all services.

**Checklist:**
- [ ] API metrics (request count, latency, errors)
- [ ] Queue metrics (depth, processing time, failure rate)
- [ ] Database metrics (connections, query time, replication lag)
- [ ] GPU metrics (utilization, temperature, memory)
- [ ] Custom metrics (jobs/hour, images/month)

**Metrics:**
```
API:
- api.requests_total (counter)
- api.request_duration_ms (histogram: p50, p95, p99)
- api.errors_total (counter by error type)

Queue:
- queue.depth (gauge)
- queue.job_latency_ms (histogram)
- queue.failure_rate (gauge: %)

GPU:
- gpu.utilization (gauge: %)
- gpu.memory_used_mb (gauge)
- gpu.temperature_celsius (gauge)

Business:
- products.total_count (gauge)
- products.images_processed_month (counter)
- products.avg_quality_score (gauge)
```

**Acceptance Criteria:**
- Metrics publishing to CloudWatch
- Dashboard displaying metrics
- Historical data available

---

### Task 12.2: CloudWatch Alarms & Alerts

**Type:** Monitoring  
**Assigned to:** DevOps Engineer  
**Due Date:** +1.5 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Set up alarms for critical issues.

**Checklist:**
- [ ] Alarm: Queue depth > 100 jobs
- [ ] Alarm: API error rate > 1%
- [ ] Alarm: Job latency > 5 minutes
- [ ] Alarm: Pod crash
- [ ] Alarm: Database replication lag > 10 sec
- [ ] Alarm: GPU temperature > 75°C
- [ ] Slack notifications

**Alarms:**
```
1. Queue Depth > 100
   Threshold: 100
   Duration: 5 min
   Action: Notify Slack #ops
           Scale workers to max

2. Error Rate > 1%
   Threshold: 1%
   Duration: 2 min
   Action: Notify Slack #alerts
           Page on-call engineer

3. Job Latency > 300 sec
   Threshold: 300s
   Duration: 5 min
   Action: Notify Slack #ops
```

**Slack Integration:**
```
CloudWatch Alarm → SNS Topic → Slack Webhook
```

**Acceptance Criteria:**
- Alarms configured
- Test alarms fire correctly
- Notifications working

---

### Task 12.3: Structured Logging (CloudWatch Logs)

**Type:** Monitoring  
**Assigned to:** DevOps Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Set up centralized logging.

**Checklist:**
- [ ] Ship logs from all services to CloudWatch
- [ ] Structured JSON logging (not plain text)
- [ ] Include request ID for tracing
- [ ] Include user ID for debugging
- [ ] Set log retention (30 days)
- [ ] Create log insights queries

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "request_id": "uuid",
  "service": "api",
  "message": "Product uploaded",
  "user_id": "uuid",
  "job_id": "uuid",
  "duration_ms": 1234,
  "tags": ["upload", "success"]
}
```

**Log Insights Queries:**
```
# Find slow requests
fields @duration | filter @duration > 2000 | stats avg(@duration) by service

# Error rate by endpoint
fields @message | filter @level = "ERROR" | stats count() by @message

# Job failures
fields job_id, error | filter @level = "ERROR" | filter tags = "job"
```

**Acceptance Criteria:**
- Logs flowing to CloudWatch
- JSON structured correctly
- Queries returning meaningful results

---

### Task 12.4: Distributed Tracing (Optional: Jaeger)

**Type:** Monitoring  
**Assigned to:** DevOps Engineer  
**Due Date:** +2.5 days  
**Effort:** 2 hours  
**Priority:** 🟡 Medium

**Description:**
Optional: Set up distributed tracing for request flows.

**Checklist:**
- [ ] Install OpenTelemetry SDK
- [ ] Add trace instrumentation to API
- [ ] Add trace instrumentation to worker
- [ ] Set up Jaeger backend
- [ ] Visualize request flows

**Tracing:**
```
Request: /api/products/upload
  │
  ├─ API Handler (100ms)
  │  ├─ File upload to S3 (200ms)
  │  ├─ Job submission to Redis (50ms)
  │  └─ Return response (5ms)
  │
  └─ Background: Job Processing (1200ms)
     ├─ Image load (100ms)
     ├─ Preprocessing (50ms)
     ├─ FastVLM inference (1000ms)
     └─ Save to database (50ms)
```

**Acceptance Criteria:**
- Traces capturing request flow
- Can trace end-to-end requests
- Performance bottlenecks visible

---

### Task 12.5: Uptime Monitoring

**Type:** Monitoring  
**Assigned to:** DevOps Engineer  
**Due Date:** +3 days  
**Effort:** 1 hour  
**Priority:** 🟡 High

**Description:**
Monitor API uptime and health.

**Checklist:**
- [ ] Create health check endpoint (/health)
- [ ] Set up external monitoring (StatusCake, Pingdom, or similar)
- [ ] Monitor from multiple regions
- [ ] Create public status page
- [ ] Alert on downtime

**Health Check:**
```
GET /health

Response:
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "gpu": "ok",
    "queue": "ok"
  }
}
```

**Acceptance Criteria:**
- Health endpoint working
- External monitoring active
- Uptime >99%

---

### Task 12.6: Dashboard Setup (Grafana)

**Type:** Monitoring  
**Assigned to:** DevOps Engineer  
**Due Date:** +3 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Create visual dashboards for operations team.

**Checklist:**
- [ ] Install Grafana
- [ ] Connect to CloudWatch data source
- [ ] Create ops dashboard (queue depth, errors, latency)
- [ ] Create business dashboard (products, quality scores)
- [ ] Set up dashboard alerts

**Dashboards:**
1. **Ops Dashboard:**
   - Queue depth (line chart)
   - Error rate (gauge)
   - Latency p99 (gauge)
   - Active workers (number)

2. **Business Dashboard:**
   - Products processed today (number)
   - Avg quality score (gauge)
   - % complete (gauge)
   - Daily revenue (line chart)

**Acceptance Criteria:**
- Dashboards created and displaying data
- Real-time updates working
- Team can monitor system health

---

### Milestone Acceptance Criteria

**Monitoring ready when:**
- ✅ CloudWatch metrics publishing
- ✅ Alarms configured and firing
- ✅ Structured logging working
- ✅ Grafana dashboards live
- ✅ Health checks passing
- ✅ Uptime >99%

---

## PHASE 13: Performance Optimization & Cost Reduction

**Duration:** 3 days  
**Status:** 🔴 Not Started  
**Priority:** 🟡 High  
**Milestone:** Optimized for Production

---

### Task 13.1: Inference Optimization (Batch Processing)

**Type:** Performance  
**Assigned to:** ML Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Batch images for faster GPU utilization.

**Checklist:**
- [ ] Collect jobs from queue in batches
- [ ] Process batch of 4-8 images at once
- [ ] Measure throughput improvement
- [ ] Benchmark: 1 image vs. batch

**Current (Single):**
```
1 image → GPU inference → 1 result
1200ms per image
```

**Optimized (Batch of 4):**
```
4 images → GPU inference → 4 results
400ms per image (3x speedup)
```

**Implementation:**
```javascript
async function processBatch() {
  const jobs = [];
  
  // Collect up to 8 jobs (max 2 sec wait)
  const timeout = setTimeout(() => processBatch(), 2000);
  
  while (jobs.length < 8) {
    const job = await redis.blpop('jobs:pending', 1);
    if (!job) break;
    jobs.push(JSON.parse(job));
  }
  
  if (jobs.length === 0) return;
  clearTimeout(timeout);
  
  // Load all images
  const images = await Promise.all(
    jobs.map(j => loadImage(j.image_url))
  );
  
  // Single GPU batch inference
  const results = await model.infer(images);
  
  // Save all results
  await Promise.all(
    results.map((r, i) => saveResult(jobs[i], r))
  );
}
```

**Acceptance Criteria:**
- Batch processing working
- 3x speedup achieved
- No job loss

---

### Task 13.2: Model Quantization

**Type:** Performance  
**Assigned to:** ML Engineer  
**Due Date:** +1.5 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Convert model from FP32 to INT8 (4x smaller, 2x faster).

**Checklist:**
- [ ] Quantize FastVLM model to INT8
- [ ] Test accuracy (should lose <0.5%)
- [ ] Measure memory reduction
- [ ] Measure speed improvement
- [ ] Benchmark: FP32 vs. INT8

**ONNX Quantization:**
```python
from onnxruntime.quantization import quantize_dynamic, QuantType

# Load FP32 model (2GB)
# Quantize to INT8
quantize_dynamic(
    'fast_vlm_fp32.onnx',
    'fast_vlm_int8.onnx',
    weight_type=QuantType.QInt8
)

# Result: 500MB model, 2x faster inference
```

**Benchmarks:**
```
FP32: 2.0GB, 1200ms
INT8: 500MB, 600ms

Speedup: 2x
Memory: 4x reduction
Accuracy loss: <0.5%
```

**Acceptance Criteria:**
- Model quantized successfully
- INT8 inference <700ms
- Accuracy maintained (>95%)

---

### Task 13.3: Image Preprocessing Optimization

**Type:** Performance  
**Assigned to:** ML Engineer  
**Due Date:** +2 days  
**Effort:** 1 hour  
**Priority:** 🟡 High

**Description:**
Optimize image preprocessing (resize, normalize).

**Checklist:**
- [ ] Use efficient image library (sharp)
- [ ] Resize to exact size (1024x1024)
- [ ] Cache preprocessing results
- [ ] Measure preprocessing time

**Current:**
```
Image load: 100ms
Resize: 150ms
Normalize: 50ms
Total: 300ms
```

**Optimized:**
```
Image load (streaming): 50ms
Resize (hardware-accelerated): 30ms
Normalize (GPU): 10ms
Total: 90ms (3x speedup)
```

**Code:**
```javascript
const sharp = require('sharp');

async function preprocessImage(imageUrl) {
  // Download and resize in one pass
  return sharp(await downloadImage(imageUrl))
    .resize(1024, 1024, {fit: 'contain'})
    .toBuffer();
    // GPU normalization happens during inference
}
```

**Acceptance Criteria:**
- Preprocessing <100ms
- Quality maintained
- Memory efficient

---

### Task 13.4: Caching Strategy

**Type:** Performance  
**Assigned to:** Backend Engineer  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Implement caching to avoid re-processing identical images.

**Checklist:**
- [ ] Hash images (MD5)
- [ ] Check cache before inference
- [ ] Store results in Redis
- [ ] Cache hit rate >30%

**Implementation:**
```javascript
async function inferenceWithCache(imageUrl) {
  // Hash image
  const imageHash = await hashImage(imageUrl);
  const cacheKey = `inference:${imageHash}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Process if not cached
  const result = await runInference(imageUrl);
  
  // Cache for 7 days
  await redis.setex(cacheKey, 7 * 86400, JSON.stringify(result));
  
  return result;
}
```

**Expected Savings:**
- Cache hit rate: 30%
- 30% fewer GPU jobs
- 30% cost reduction

**Acceptance Criteria:**
- Cache working
- Hit rate >20%
- Cost reduction measured

---

### Task 13.5: Database Query Optimization

**Type:** Performance  
**Assigned to:** Backend Engineer  
**Due Date:** +2.5 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Optimize slow database queries.

**Checklist:**
- [ ] Run EXPLAIN ANALYZE on slow queries
- [ ] Add missing indexes
- [ ] Optimize query plans
- [ ] Cache expensive aggregations

**Query Analysis:**
```sql
EXPLAIN ANALYZE
SELECT * FROM products
WHERE category = 'shirts'
ORDER BY quality_score DESC
LIMIT 20;

-- If slow, add index:
CREATE INDEX idx_products_category_quality
ON products(category, quality_score DESC)
WHERE status = 'published';
```

**Caching Aggregations:**
```javascript
// Cache category counts (update hourly)
async function getCategoryCounts() {
  const cacheKey = 'stats:categories';
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const counts = await db.query(`
    SELECT category, COUNT(*) as count
    FROM products
    WHERE status = 'published'
    GROUP BY category
  `);
  
  await redis.setex(cacheKey, 3600, JSON.stringify(counts));
  return counts;
}
```

**Acceptance Criteria:**
- All queries <200ms
- No full table scans
- Aggregations cached

---

### Task 13.6: Cost Analysis & Optimization

**Type:** Analysis  
**Assigned to:** Product Manager  
**Due Date:** +3 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Measure cost savings from optimizations.

**Checklist:**
- [ ] Measure GPU hours/month before optimization
- [ ] Measure GPU hours/month after optimization
- [ ] Calculate cost savings
- [ ] Measure latency improvement
- [ ] ROI analysis for each optimization

**Expected Savings:**
```
Before:
- GPU hours/month: 250 (RTX 4090 @ $0.44/hr)
- Monthly cost: $110

After:
- Batch processing (3x): 83 GPU hours
- Quantization (2x): 42 GPU hours
- Caching (30%): 29 GPU hours
- Preprocessing (3x): ~20 GPU hours

Total: ~60 GPU hours/month
Monthly cost: $26

Savings: $84/month (76% reduction!)
```

**Acceptance Criteria:**
- Cost metrics collected
- Savings documented
- Feasibility of further optimizations assessed

---

### Milestone Acceptance Criteria

**Optimization complete when:**
- ✅ Batch processing implemented (3x speedup)
- ✅ Model quantized (2x speedup, 4x smaller)
- ✅ Preprocessing optimized (3x faster)
- ✅ Caching active (30% hit rate)
- ✅ Queries optimized (<200ms)
- ✅ Cost reduced 50%+ from initial

---

## PHASE 14: Launch Readiness & Documentation

**Duration:** 2 days  
**Status:** 🔴 Not Started  
**Priority:** 🔴 Critical  
**Milestone:** Ready for Production Launch

---

### Task 14.1: API Documentation (OpenAPI/Swagger)

**Type:** Documentation  
**Assigned to:** Backend Engineer  
**Due Date:** +0.5 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Complete and finalize API documentation.

**Checklist:**
- [ ] Write full OpenAPI 3.0 spec
- [ ] Include all endpoints
- [ ] Document request/response schemas
- [ ] Add examples for each endpoint
- [ ] Deploy Swagger UI at /api/docs
- [ ] Export API spec for external sharing

**Documentation includes:**
- Authentication (JWT)
- Rate limits
- Error codes
- Examples in cURL, Python, JavaScript
- Webhooks (if applicable)

**Acceptance Criteria:**
- API docs complete
- Swagger UI working
- Examples accurate and tested

---

### Task 14.2: SDK/Client Libraries

**Type:** Documentation  
**Assigned to:** Backend Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Create client libraries for common languages.

**Checklist:**
- [ ] JavaScript/Node.js SDK
- [ ] Python SDK
- [ ] cURL examples
- [ ] Publish to npm, PyPI
- [ ] Document SDK usage

**SDK Example (JavaScript):**
```javascript
import { OneProductIQ } from '@oneproductiq/sdk';

const client = new OneProductIQ({
  apiKey: 'sk_...'
});

// Upload image
const {job_id} = await client.products.upload({
  file: imageFile
});

// Poll status
const product = await client.jobs.wait(job_id);
console.log(product.metadata);
```

**Acceptance Criteria:**
- SDKs published
- Examples working
- Documentation complete

---

### Task 14.3: Runbook & Operations Guide

**Type:** Documentation  
**Assigned to:** DevOps Engineer  
**Due Date:** +1 day  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Document how to operate the system.

**Checklist:**
- [ ] Runbook: How to scale workers
- [ ] Runbook: How to debug failures
- [ ] Runbook: How to rollback deployments
- [ ] Runbook: How to handle incidents
- [ ] Runbook: How to monitor health

**Runbook Topics:**
```
1. Scaling Workers
   - When: Queue depth > 100 for 5 min
   - How: RunPod worker group auto-scales
   - Manual: runpod-cli scale --workers=5

2. Debugging Job Failures
   - Check logs: CloudWatch Logs
   - Trace job: job_id in logs
   - Common errors: image too large, GPU OOM

3. Rolling Deployments
   - Automatic: GitHub Actions
   - Manual: docker push → RunPod pod restart

4. Incident Response
   - Page on-call: Slack alert
   - Triage: Check dashboards
   - Mitigation: Scale down queue, check GPU

5. Health Checks
   - Daily: CPU, GPU, Queue, Database metrics
   - Weekly: Spot-check product quality
   - Monthly: Cost review, optimization review
```

**Acceptance Criteria:**
- Runbook complete
- Team trained on procedures
- Tested in incident simulation

---

### Task 14.4: SLA & Support Process

**Type:** Documentation  
**Assigned to:** Product Manager  
**Due Date:** +1.5 days  
**Effort:** 2 hours  
**Priority:** 🟡 High

**Description:**
Define SLA and support process.

**Checklist:**
- [ ] Define API SLA (99% uptime)
- [ ] Define response time SLA (<5 sec per image)
- [ ] Create support ticket template
- [ ] Define escalation process
- [ ] Create FAQ document

**SLA Terms:**
```
API Availability: 99%
  - Measured monthly
  - Excludes scheduled maintenance
  - Compensation: service credit if breached

Processing Latency: P99 < 5 seconds
  - Measured per image
  - From upload to result available

Support Response:
  - Critical: <1 hour
  - High: <4 hours
  - Medium: <24 hours
  - Low: <48 hours
```

**Support Process:**
1. Customer submits ticket
2. Triaged by support team (1 hour)
3. Assigned to engineer if needed
4. Updates every 24 hours
5. Resolution confirmation

**Acceptance Criteria:**
- SLA documented
- Support process clear
- FAQ comprehensive

---

### Task 14.5: Security Checklist & Compliance

**Type:** Security  
**Assigned to:** DevOps Engineer  
**Due Date:** +1.5 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Complete security review before launch.

**Checklist:**
- [ ] All API endpoints require authentication
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Secrets not hardcoded (use environment variables)
- [ ] HTTPS enabled (SSL/TLS)
- [ ] CORS properly configured
- [ ] SQL injection prevention (parameterized queries)
- [ ] OWASP Top 10 review completed
- [ ] Penetration testing (optional)
- [ ] Privacy policy published

**Security Checklist:**
```
Authentication:
- [x] JWT tokens required
- [x] Token expiration (30 days)
- [x] Refresh token rotation

Data Security:
- [x] Passwords hashed (bcrypt)
- [x] Secrets encrypted
- [x] Data in transit (TLS)
- [x] Database encrypted at rest

Access Control:
- [x] Rate limiting
- [x] IP whitelisting (if applicable)
- [x] Role-based access
- [x] Audit logging

Compliance:
- [x] GDPR: Data retention policy
- [x] CCPA: Opt-out mechanism
- [x] Privacy policy
- [x] Terms of service
```

**Acceptance Criteria:**
- All security items checked
- No critical vulnerabilities
- Compliance documented

---

### Task 14.6: Launch Checklist

**Type:** Launch  
**Assigned to:** Product Manager  
**Due Date:** +2 days  
**Effort:** 2 hours  
**Priority:** 🔴 Critical

**Description:**
Final checklist before going live.

**Pre-Launch Checklist:**
```
Infrastructure:
- [x] API servers stable
- [x] Database backups automated
- [x] Monitoring active
- [x] Alerting configured
- [x] Runbooks tested

Application:
- [x] All features tested
- [x] No known bugs
- [x] Performance targets met
- [x] Cost acceptable

Documentation:
- [x] API docs complete
- [x] Runbook written
- [x] SLA defined
- [x] FAQ published

Marketing:
- [x] Landing page ready
- [x] Pricing page live
- [x] Product demo working
- [x] Twitter/social media prepped

Support:
- [x] Support email live
- [x] Support process trained
- [x] Ticketing system ready
- [x] FAQ accessible
```

**Launch Day:**
1. 8am: Team standup
2. 9am: Deploy to production (if not already)
3. 10am: Smoke tests
4. 11am: Open to first beta users
5. 12pm: Monitor metrics closely
6. EOD: Retrospective

**Acceptance Criteria:**
- All checklist items complete
- Team ready for support
- Monitoring showing all-green

---

### Task 14.7: Post-Launch Monitoring (First Week)

**Type:** Operations  
**Assigned to:** DevOps Engineer  
**Due Date:** +2 days  
**Effort:** Ongoing  
**Priority:** 🔴 Critical

**Description:**
Close monitoring during first week post-launch.

**Daily:**
- [ ] Check uptime (should be 100%)
- [ ] Review error logs
- [ ] Check queue depth
- [ ] Monitor cost
- [ ] Check customer feedback

**Weekly:**
- [ ] Quality report (% of products with >80% confidence)
- [ ] Performance report (avg latency, throughput)
- [ ] Cost review
- [ ] Customer satisfaction survey

**Acceptance Criteria:**
- Uptime >99%
- Error rate <0.5%
- Customer satisfaction >4.0/5.0

---

### Milestone Acceptance Criteria

**Launch ready when:**
- ✅ API documentation complete
- ✅ SDKs published
- ✅ Runbook tested
- ✅ Security review passed
- ✅ SLA defined
- ✅ Support process ready
- ✅ All systems monitoring
- ✅ Team trained

---

## Summary Table

| Phase | Duration | Key Deliverable | Milestone |
|-------|----------|------------------|-----------|
| Pre | 3 days | Environment ready | 🟢 Complete |
| 1 | 1 week | Testing Dashboard | Dashboard testing FastVLM |
| 2 | 4 days | JSON Schema | Schema validated |
| 3 | 3 days | PostgreSQL Setup | 1000 products queryable |
| 4 | 4 days | Queue System | 100-job queue test |
| 5 | 4 days | Local Worker | End-to-end working locally |
| 6 | 2 days | Cost Model | Budget approved |
| 7 | 3 days | Docker Image | Image <2GB |
| 8 | 3 days | RunPod Workers | 100-job scaling test |
| 9 | 5 days | REST API | Fully documented API |
| 10 | 4 days | Search/Analytics | Dashboard live |
| 11 | 5 days | Frontend | Product management UI |
| 12 | 3 days | Monitoring | Grafana dashboards |
| 13 | 3 days | Optimization | 50% cost reduction |
| 14 | 2 days | Launch Ready | ✅ Production ready |

**Total: 8 weeks to production**

---

Now you have a **complete, actionable ClickUp sprint structure** with:
- ✅ 14 phases with clear milestones
- ✅ 100+ specific tasks
- ✅ Effort estimates for each task
- ✅ Acceptance criteria
- ✅ Dependencies between phases
- ✅ Risk mitigation strategies

This structure is ready to import into ClickUp!