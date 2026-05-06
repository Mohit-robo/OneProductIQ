# Lessons Learned: UI Theme Synchronization & Batch Processing

## UI Redesign Coordination (2026-05-03)
**Critical dependency discovered**: All visual changes require synchronized updates across the CSS ecosystem.

### Key Files & Dependencies:
1. **demo-app-client/src/index.css**
   - Contains base theme definitions (slate-50 background, indigo accents)
   - Defines component styles (.panel, .field-group, .preview-box, .button-row)

2. **demo-app-client/src/App.jsx**
   - Main UI component that references CSS classes
   - Requires matching class names/structure from index.css

### Lessons Learned (UI):
- UI redesigns are **system-wide operations**, not isolated component changes.
- **index.css acts as the central theme registry** - all visual changes flow through it.
- Failing to synchronize CSS and Vite proxies causes **immediate visual/functional breakdowns**.

## Batch Processing & AI Infrastructure (2026-05-04)

### State Persistence & UI Sync:
- **Session Recovery**: High-latency batch tasks require the frontend to be "session-aware." By checking `/batch-status` on component mount, the UI can resume tracking an ongoing batch even after a refresh.
- **Vite Proxy Gaps**: All new backend endpoints (like `/batch-status` or `/pause`) must be explicitly added to `vite.config.js`.

### Data Quality & AI Behavior:
- **Redundancy Scrubbing**: Vision models (FastVLM) often repeat list entries. Implementing a server-side JSON deduplication step for arrays is essential before CSV export.
- **CSV Sanitization**: Internal newlines in AI-generated strings must be replaced with spaces to ensure CSV row integrity.

### GPU Utilization (CUDA):
- **Fast Cycles**: Small models (0.5B) often show 0% utilization in periodic loggers because inference finishes too quickly for the poll rate, even when memory is held.
- **Initial Load**: Always verify "FastVLM loaded on CUDA" in logs to confirm the GPU execution provider is active.

## Advanced Reliability & Benchmarking (2026-05-06)

### Model Reliability & Hallucination:
- **Deterministic Inference**: For categorization tasks, **greedy decoding** (`do_sample: false`) is significantly more stable than sampling. It prevents the model from "spiraling" into hallucinatory loops.
- **Repetition Spiral**: Small models require a high `repetition_penalty` (1.5+) to prevent them from repeating color lists or design elements indefinitely.
- **Signal-to-Noise Filtering**: Aggressive post-inference cleaning to strip redundant or false boolean keys (e.g., `IsWhite: false`) significantly improves data signal.
- **Dirty JSON Healing**: For fragmented AI outputs, a robust frontend extraction engine with basic regex-repair logic (dangling commas, unclosed braces) prevents UI failures.

### Benchmarking (GT Verification):
- **Numeric Map Alignment**: Tracking accuracy requires robust ID-extraction from filenames to map images to Ground Truth (GT) datasets like `styles.csv`.

> *Moving forward: Maintain a dual-layered cleaning approach (Backend sanitization + Frontend repair) for all AI metadata.*