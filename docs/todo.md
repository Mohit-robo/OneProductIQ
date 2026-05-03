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
- [X] Task 6: Implement Prompt Management System (2026-05-03)
  - [X] Backend `/prompts` endpoint reads from `/prompts` folder
  - [X] Frontend prompt selector dropdown populated from `/prompts`
  - [X] Vite proxy configured for `/prompts` route
  - [X] Image preview constrained to 128px height with aspect ratio preserved

### Dependencies
- Backend server (`demo-app/server.mjs`) must be running on port **3000**
- Front‑end dev server runs on **5173** (Vite default) – proxy configured to forward `/upload` and `/prompts` to backend

### Blockers
- None

### Next Steps
1. Test prompt selection flow in browser with all 3 templates
2. Add more prompt templates as needed
3. Consider adding prompt preview or edit functionality
