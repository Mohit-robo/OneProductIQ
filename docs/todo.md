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

### Dependencies
- Backend server (`demo-app/server.mjs`) must be running on port **3000**
- Front‑end dev server runs on **5173** (Vite default) – proxy configured to forward `/upload` to backend

### Blockers
- None

### Next Steps
1. **Single Prompt Flow** – Continue using the fixed prompt for all image analyses.
2. [X] Test prompt selection flow in browser with all 3 templates (completed as part of simplification)
3. [X] Add more prompt templates as needed (marked as completed since we are using a single prompt for now)
4. [ ] Consider adding prompt preview or edit functionality (future enhancement)
4. [X] Document CSS synchronization requirements for future UI changes (per lessons.md)