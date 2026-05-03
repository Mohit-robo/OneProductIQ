# MEMORY.md

## Current Phase: Phase 2 – Demo Node.js Frontend App
**Status:** In Progress  
**Last Completed:** 2026-05-03  

### Recent Changes
- Created backend server (`demo-app/server.mjs`) that accepts image uploads and returns FastVLM generated descriptions.  
- Added `todo.md` to track front‑end tasks.  
- Initialized a Vite + React front‑end skeleton (`demo-app-client`).  
- Set up basic manual test flow stored in memory for later recall.  
- **Adjusted image preview to a fixed size (200×200 px, object‑fit:cover) so large thumbnails no longer overflow the UI.**  
- **Prompt Management System implemented (2026-05-03):**
  - Added `/prompts` GET endpoint to backend returning prompt titles and content from `/prompts` folder
  - Added prompt selector dropdown to frontend UI with 3 templates: product_identification, physical_attributes, style_and_audience  
  - Updated `/upload` to accept and use `prompt` body field in FastVLM message
  - Added Vite proxy rule for `/prompts` route
  - Image preview constrained to 128px height with `object-contain` to preserve aspect ratio

### Environment Setup
- **Node version:** v18.19.1  
- **Backend:** Running on `localhost:3000` (Express + Multer)  
- **Frontend:** Vite project scaffolded under `demo-app-client`  
- **Dependencies:** `react`, `react-dom`, `@huggingface/transformers`, `express`, `multer`  
- **GPU/ML:** FastVLM model loaded via ONNX Runtime JS (dynamic import used to avoid ESM‑exports issue)  

### Known Issues
- ESM export restrictions in `@huggingface/transformers` required dynamic `import()` to load the library.  
- Test image must be placed in a publicly reachable location (`demo-app/public/` or served statically).  
- CORS may need to be enabled if the front‑end runs on a different port.  

### Next Steps
1. Test prompt selection flow end-to-end in browser  
2. Add more prompt templates as needed  
3. Consider adding prompt preview/edit functionality  
