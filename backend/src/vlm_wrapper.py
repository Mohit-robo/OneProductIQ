import os 
import sys
from pathlib import Path

import httpx
import base64

import json
from io import BytesIO
from PIL import Image

ROOT_DIR = Path(__file__).parent / 'src'
sys.path.append(str(ROOT_DIR))

from config import Settings

settings = Settings()

# Connect to Ollama
# Determine correct URL depending on whether we are running inside Docker or on the host
if os.path.exists("/.dockerenv"):
    ollama_host = settings.vlm_url.replace("/v1", "") if settings.vlm_url.endswith("/v1") else settings.vlm_url
else:
    ollama_host = "http://localhost:11434"

def get_visual_description_from_image(image: Image.Image) -> str:
    """
    Passes a product image to the local Ollama VLM (Qwen-VL) to extract a detailed visual description.
    """
    buffered = BytesIO()
    if image.mode != "RGB":
        image = image.convert("RGB")
    image.save(buffered, format="JPEG")
    # Ollama API via HTTP requires base64 encoded images
    img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    prompt = (
        "You are an expert e-commerce fashion cataloger. "
        "Describe the visual appearance, color, pattern, and shape of this clothing item in a highly detailed paragraph. "
        "Focus purely on what you can see. Do not mention price, brand, or materials."
    )

    payload = {
        "model": settings.vlm_model_name,
        "messages": [
            {
                "role": "user",
                "content": prompt,
                "images": [img_b64]
            }
        ],
        "stream": False
    }

    # Using httpx (which is installed in backend/requirements.txt) instead of the ollama python client
    with httpx.Client(timeout=None) as client:
        response = client.post(f"{ollama_host}/api/chat", json=payload)
        response.raise_for_status()
        data = response.json()

    return data["message"]["content"]

if __name__ == "__main__":
    print("Testing get_visual_description_from_image with a dummy red image...")
    dummy_img = Image.new('RGB', (256, 256), color='red')
    
    try:
        desc = get_visual_description_from_image(dummy_img)
        print("✅ Success! Visual Description:")
        print(desc)
    except Exception as e:
        print(f"❌ Failed: {e}")
