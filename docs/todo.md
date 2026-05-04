## Phase 1 – Test FastVLM with huggingface.js
- [X] Test the basic fastvlm model with image and prompt, using transformers.js
- [X] Test onnx weights input and outputs and document them for further usage. Saved under `triton_server_test`

## Phase 2 – Demo Node.js Frontend App
### Current Sprint
- [X] Task 1: Scaffold Vite + React app (`demo-app-client`)
- [X] Task 2: Add `ImageUpload` component that POSTs to `http://localhost:3000/upload`
- [X] Task 3: Show the returned `description` on the page
- [X] Task 4: Apply minimal Tailwind styling (optional but recommended)
- [X] Task 5: Verify end‑to‑end flow works in browser
    [X] Task 6: Implement Prompt Management System (2026-05-03) - Single fixed prompt selected
  - [X] Backend `/prompts` endpoint reads from `/prompts` folder
    [X] Task 6: Implement Prompt Management System (2026-05-03) - Single fixed prompt selected
  - [X] Vite proxy configured for `/prompts` route
  - [X] Image preview constrained to 128px height with aspect ratio preserved
- [X] Document CSS synchronization requirements for future UI changes (per lessons.md)

- [X] **Single Prompt Flow** – Continue using the fixed prompt for all image analyses.

### Dependencies
- Backend server (`demo-app/server.mjs`) must be running on port **3000**
- Front‑end dev server runs on **5173** (Vite default) – proxy configured to forward `/upload` to backend

### Blockers
- None

## Phase 3 - Sequential Batch Image Processing 
  
  ### Completed Tasks:
  
  - [X] Implementation of sequential image queue in `server.cjs`
  - [X] Integrated `FastVLM-0.5B` ONNX model with CUDA acceleration
  - [X] Created `QueueDisplay` component with real-time status polling
  - [X] Added progress bar and "Analyzing: [file]" live status indicators
  - [X] Implemented batch pause/resume control system
  - [X] Built robust CSV export with automated metadata deduplication
  - [X] Added support for Bulk ZIP uploads and Folder selection mode
  
  ### Acceptance Criteria Met:
  
  - [X] Sequential queue handles 500+ images reliably
  - [X] Frontend re-syncs state after refresh or server restart
  - [X] Redundant AI outputs are cleaned before file generation
  
## Phase 4 - Advanced Features & Scaling (Upcoming)
- [ ] Implement multi-model orchestration (e.g., CLIP + FastVLM)
- [ ] Add vector search integration for duplicate image detection
- [ ] Build a more comprehensive prompt engineering workbench

