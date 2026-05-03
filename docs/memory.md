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
1. Complete Vite + React app skeleton (`demo-app-client`).  
2. Implement `ImageUpload` component that POSTs to `http://localhost:3000/upload`.  
3. Display the returned `description` on the page.  
4. Add minimal Tailwind styling for a clean UI.  
5. Update `MEMORY.md` and `lessons.md` with outcomes.  