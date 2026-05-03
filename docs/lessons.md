# Lessons Learned – Phase 2

## Backend‑Frontend Proxy Setup
- Vite's `server.proxy` forwards `/upload` to the Express backend (`localhost:3000`).
- Prevents CORS issues when front‑end runs on port 5173.

## Dynamic ESM Imports
- The HuggingFace `transformers` package uses `"exports"` fields that block direct `.default` imports.
- Solution: load via `await import("@huggingface/transformers")` and destructure the needed symbols.
- Keeps the server code compatible with Node 18 while avoiding ESM‑export errors.

## React Upload Component
- State handles selected file, loading flag, and error message.
- `FormData` attached to the image file and posted to `/upload`.
- Response JSON’s `description` field is displayed under “Generated Description”.

## Minimal Tailwind Styling (optional)
- Basic spacing, rounded corners, and button colors improve readability.
- No heavy UI framework required for a functional prototype.

## Testing Workflow
- Start backend: `node demo-app/server.mjs`.
- Run front‑end dev server: `npm run dev` inside `demo-app-client`.
- Open `http://localhost:5173` in a browser, select an image, and see the generated description instantly.

## Next Steps
- Move from Vite dev server to a production build (`npm run build` + static serve) for final integration testing.
- Add input validation and file size limits.
- Consider caching image uploads or batching multiple images for parallel inference.