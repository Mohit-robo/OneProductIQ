# OneProductIQ Memory Log

## Current Phase: Phase 5
**Status:** In Progress (Researching Performance & KV Cache)  
**Last Completed:** 2026-05-06 (Phase 4 - Output Verification & Reliability Layer)

### Recent Changes (Phase 4)
- **Intelligent Benchmarking**: Integrated the Fashion Benchmark (`styles.csv`). Built an automated VLM vs. Ground Truth comparison engine.
- **Validation Dashboard**: Added a real-time accuracy panel with Match/Diff status pills for Gender, Category, Color, and Usage.
- **Reliability Layer**: 
    - Implemented a **Self-Healing JSON Engine** (Frontend/Backend) to repair truncated model outputs.
    - Added **Semantic Key Merging** to maintain a fixed schema (normalizing aliases like 'Brand Name' -> 'brand').
    - Hardened inference with **Greedy Decoding** and 1.5x Repetition Penalty.
- **Hallucination Shield**: Implemented array-capping and boolean stripping for cleaner metadata.

### Previous Changes (Phase 3)
- **Sequential Queue Engine**: Background queue in Node.js for high-volume analysis.
- **Bulk Intake Support**: Logic to process `.zip` archives and entire folders.
- **Hybrid UI Workflow**: Persistent polling and state recovery for batch mode.

### Environment Context
- **Node:** v18.19.1
- **Model:** FastVLM-0.5B-ONNX
- **Inference Config**: `do_sample: false`, `repetition_penalty: 1.5`, `max_new_tokens: 512`.
- **Benchmarking Dataset**: `ml-fastvlm/test_images/` mapped via numeric ID.

### Active Patterns
- **Modern Table Tables**: High-info-density tabular reporting for metadata and validation results.
- **Dual-Layer Sanitization**: Backend deduplication + Frontend heuristic JSON repair.
- **Numeric ID Mapping**: Filename numeric extraction for benchmark synchronization.

### Known Issues & Research Goals
- **KV Cache Invalidation**: Investigating memory "carryover" during continuous batch jobs.
- **Constrained Decoding**: Researching schema enforcement at the logit level.
- **Multi-Model Consensus**: Combining CLIP + FastVLM for high-accuracy zero-shot validation.
