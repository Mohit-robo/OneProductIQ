# OneProductIQ: Advanced Metadata Enrichment

![UI Demo](./architecture_planning/assets/UI_Demo.png)

## Overview
**OneProductIQ** is a high-performance system designed for bulk product metadata enrichment. It leverages a **VLM** model to transform raw product images into structured, clean, and actionable data.

The system supports two distinct workflows:
- **Deep Analysis**: A precise, single-image deep dive with live previews and immediate metadata extraction.
- **Batch Processing**: High-volume sequential processing of hundreds of images via ZIP uploads or Folder selection, featuring a real-time operation queue and CSV export.

---

## Architecture Overview

```
+-------------------+       +-------------------+       +-------------------+
|   Frontend (Vite) | <---> |   Backend (Node)  | <---> |   VLM   |
+-------------------+       +-------------------+       +-------------------+
        │                         │                           │
        │   • Hybrid UI Mode      │   • Sequential Queue      │   • ONNX Runtime
        │   • ZIP/Folder Intake   │   • ZIP Extraction        │   • CUDA Acceleration
        │   • Progress Polling    │   • Data Deduplication    │   • JSON Sanitization
        │   • Local CSV Export    │   • Session Persistence   │   • High-Performance VLM
        └──────────────────────────┘                       └───────────────────┘
```

### Key Components

| Layer | Responsibility | Main Files |
|-------|----------------|------------|
| **Frontend** | React-driven UI with hybrid analysis modes. Supports bulk intake via `webkitdirectory`. | `demo-app-client/src/App.jsx` |
| **Backend** | Sequential image queue, state-aware polling endpoints, for ZIP handling and deduplication logic. | `demo-app/server.cjs` |
| **ML Model** | FastVLM-0.5B-ONNX with custom generation parameters tuned for structured JSON output. | Integrated via `@huggingface/transformers` |

---

## Features

### 🚀 High-Volume Batching
- **ZIP Upload Support**: Upload thousands of product shots in a single high-compression archive.
- **Folder Selection**: Select entire local directories for immediate queueing.
- **Sequential Queueing**: Optimized model inference that prevents memory overflows by processing tasks one-by-one.

### 🧹 Premium Data Quality
- **Automated Deduplication**: Smart array cleaning that removes redundant AI-generated metadata (e.g., repeating style tags).
- **One-Click Export**: Download your entire session's results as a sanitized, spreadsheet-ready CSV.

### 🌓 Hybrid Workflow UI
- **Real-Time Progress**: Live progress bars and status indicators showing the exact file being analyzed.
- **Session Recovery**: UI automatically resumes tracking even after browser refreshes or server restarts.

---

## Setup & Development

### Prerequisites
- **Node.js** (v18+)
- **GPU with CUDA Support** (Recommended for performance)

### Fast Start
1. **Root Install**: `npm install` (Installs `adm-zip`, `transformers`, etc.)
2. **Backend**: `cd demo-app && node server.cjs`
3. **Frontend**: `cd demo-app-client && npm run dev`
4. **Access**: Navigate to `http://localhost:5173`

---

## Usage Flow

1. **Select Mode**: Use the "Folder Mode" toggle if you want to select a directory.
2. **Add Assets**: Select 1 image for **Deep Analysis** or multiple/ZIP for **Batch Analysis**.
3. **Queue**: Click *Launch Batch Analysis*. monitor progress via the **Operation Queue**.
4. **Export**: Click *Export Batch CSV* to download your structured product metadata.

---

## Roadmap

- [X] Phase 1: FastVLM Core Integration
- [X] Phase 2: Single-Image Demo App
- [X] Phase 3: Sequential Batch Processing & ZIP/Folder Support
- [ ] Phase 4: Multi-Model Orchestration & Data Verification Workflows

---

## Lessons Learned
Recorded in `docs/lessons.md`. Key insights include:
- The necessity of **session-aware polling** for high-latency AI tasks.
- The critical role of **server-side deduplication** for LLM/VLM outputs.
- Synchronizing **Vite Proxy rules** with backend router expansion.

---

## License
MIT License

*Updated by the OneProductIQ team on 2026-05-04.*