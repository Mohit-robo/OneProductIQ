"""
vlm_service.py — Python VLM inference microservice for OneProductIQ.
Handles image analysis using qwen3-vl:2b via the ollama Python library.
Node.js server.cjs calls this service via HTTP at localhost:8000.

Run:
    python demo-app/vlm_service.py
"""

import re
import json
import base64
import logging
from pathlib import Path
from io import BytesIO

import ollama
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# ─── Config ────────────────────────────────────────────────────────────────────
MODEL_NAME = "qwen3-vl:2b"
PROMPTS_DIR = Path(__file__).parent / "prompts"
PROMPT_FILE = PROMPTS_DIR / "product_identification.txt"

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
log = logging.getLogger(__name__)

app = FastAPI(title="OneProductIQ VLM Service", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Helpers ───────────────────────────────────────────────────────────────────
def load_prompt() -> str:
    try:
        return PROMPT_FILE.read_text(encoding="utf-8")
    except FileNotFoundError:
        return "Analyze this product image and return JSON."


def strip_thinking(text: str) -> str:
    """Remove Qwen3 <think>...</think> blocks from output."""
    return re.sub(r"<think>[\s\S]*?</think>", "", text, flags=re.IGNORECASE).strip()


def extract_json(text: str) -> dict | None:
    """Robustly extract the first JSON object from model output."""
    # Try verbatim first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try pulling out first {...} block
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return None

    raw = match.group(0)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Repair: balance brackets
    for _ in range(raw.count("[") - raw.count("]")):
        raw += "]"
    for _ in range(raw.count("{") - raw.count("}")):
        raw += "}"

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def analyze_image_b64(image_b64: str) -> dict:
    """Send a base64 image string to Qwen3-VL via ollama and return parsed JSON."""
    prompt = load_prompt()

    # The Ollama Python SDK requires a base64 STRING in the images list — not raw bytes.
    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt + "\n\nOutput valid JSON ONLY. No markdown formatting or extra text.",
                "images": [image_b64],
            }
        ]
    )

    raw_text = response["message"]["content"]

    # Strip any Qwen3 thinking blocks
    clean_text = strip_thinking(raw_text)
    if not clean_text and raw_text:
        clean_text = raw_text

    log.info("Raw response (first 300 chars): %s", clean_text[:300])

    parsed = extract_json(clean_text)
    if parsed is None:
        log.warning("JSON extraction failed. Raw output was: %s", clean_text[:500])
        return {"raw_output": clean_text}

    return parsed


# ─── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME}


class AnalyzeRequest(BaseModel):
    image_base64: str

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    """Analyze a product image. Returns structured JSON metadata."""
    if not req.image_base64:
        raise HTTPException(status_code=400, detail="Empty image data")

    try:
        # Pass the b64 string directly — do NOT decode to bytes first
        result = analyze_image_b64(req.image_base64)
    except Exception as e:
        log.error("Inference failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

    return {"metadata": result}


@app.post("/analyze-batch")
async def analyze_batch(reqs: list[AnalyzeRequest]):
    """Analyze multiple images and return a list of results."""
    results = []
    for i, req in enumerate(reqs):
        try:
            result = analyze_image_b64(req.image_base64)
        except Exception as e:
            result = {"error": str(e)}
        results.append({"index": i, "metadata": result})
    return results


# ─── Entry ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    log.info("Starting OneProductIQ VLM Service on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
