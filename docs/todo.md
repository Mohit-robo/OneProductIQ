# OneProductIQ: Project Roadmap

## Phase 1: Core Analysis (Completed)
- [x] Basic image analysis UI
- [x] FastVLM-0.5B integration via ONNX
- [x] Real-time metadata extraction

## Phase 2: Design & Polish (Completed)
- [x] Premium CSS Design System
- [x] Interactive Single-Image Table
- [x] Model loading health checks

## Phase 3: Bulk Processing (Completed)
- [x] Sequential batch processing queue (CUDA)
- [x] ZIP archive and Folder intake support
- [x] Real-time polling and progress tracking
- [x] JSON data sanitization and deduplication

## Phase 4: Verification & Benchmarking (Completed)
- [x] Ground Truth (GT) dataset integration (`styles.csv`)
- [x] Automated VLM vs GT comparison engine
- [x] Visual benchmark dashboard/table
- [x] Performance sanitization & hallucination filtering

## Phase 5: Reliability & Advanced Research (Incoming)
- [ ] **KV Cache Control**: Investigate manual KV cache invalidation to prevent cross-image memory "contamination" during long batch jobs.
- [ ] **Constrained Decoding**: Research logit processors to force JSON schema adherence at the inference level (Guidance/Outlines equivalent for Transformers.js).
- [ ] **Model Orchestration**: CLIP + FastVLM consensus for high-accuracy zero-shot classification.
- [ ] **Performance Audit**: Quantization impact analysis (Q4 vs FP16) on classification precision.
- [ ] **Prompt Workbench**: Dynamic prompt testing environment for A/B testing output quality.
