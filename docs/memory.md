# OneProductIQ Memory Log

## Current Phase: Phase 4
**Status:** Planning  
**Last Completed:** 2026-05-04 (Phase 3 - Batch Processing Integration)

### Recent Changes (Phase 3)
- **Sequential Queue Engine**: Implemented a robust background queue in Node.js to handle high-volume image analysis without timeouts.
- **Bulk Intake Support**: Added logic to extract and process `.zip` archives and entire folders (via `webkitdirectory`).
- **Hybrid UI Workflow**: 
  - **Single Mode**: High-detail preview and metadata extraction for one-off tasks.
  - **Batch Mode**: Automated queueing with progress bars, pause/resume, and status polling.
- **Data Sanitization**: Integrated array-deduplication for AI JSON outputs and CSV export formatting.
- **GPU Optimization**: Migrated backend to CUDA execution provider for accelerated inference on supported hardware.

### Environment Context
- **Node:** v18.19.1
- **Model:** FastVLM-0.5B-ONNX (CUDA enabled)
- **State Management**: results.json written to disk; polling-based React UI for status recovery.
- **Port Mapping**:
  - Backend: 3000 (Express)
  - Frontend: 5173 (Vite + Proxy)

### Known Issues & Mitigations
- **Event Loop Blocking**: FastVLM generation is CPU/GPU intensive; sequential queueing prevents multi-request deadlock.
- **State Wipe**: Frontend re-syncs state on mount to handle browser refreshes during long batches.
- **Vite Proxy**: New endpoints MUST be added to `vite.config.js` to avoid silent 404s.

### Historical Context
- **ESM Issues**: Transformers.js requires dynamic `import()` in CommonJS environments (server.cjs).
- **Design System**: Strict reliance on `index.css` classes (`.panel`, `.layout-grid`) over utility-first frameworks to maintain custom branding.
