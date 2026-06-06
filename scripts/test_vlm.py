#!/usr/bin/env python3
"""
test_vlm.py — Verify the local Ollama server is serving.
Tests: list models, text chat completion, vision chat completion.
Run from project root: python scripts/test_vlm.py
"""

import sys
import base64
from io import BytesIO
from PIL import Image

import ollama

MODEL = "qwen3-vl:2b"

def separator(title: str):
    print(f"\n{'─' * 50}")
    print(f"  {title}")
    print('─' * 50)

def test_health():
    separator("1. Server Health")
    try:
        # If list works, the server is healthy
        ollama.list()
        print("✅ Ollama is up and responding to requests")
    except Exception as e:
        print(f"⚠️  Ollama connection failed: {e}")
        sys.exit(1)

def test_models():
    separator("2. Available Models")
    try:
        res = ollama.list()
        for m in res.get("models", []):
            print(f"✅ Model: {m['model']}")
    except Exception as e:
        print(f"❌ Failed to list models: {e}")
        sys.exit(1)

def test_text_completion():
    separator("3. Text Chat Completion")
    try:
        res = ollama.chat(
            model=MODEL,
            messages=[{"role": "user", "content": "What is a product SKU? Answer in one sentence."}],
            options={"temperature": 0.1}
        )
        content = res["message"]["content"]
        print(f"✅ Response:\n   {content.strip()}")
    except Exception as e:
        print(f"❌ Text completion failed: {e}")

def test_vision_completion():
    separator("4. Vision Chat Completion")
    
    # Generate a valid 256x256 image dynamically to avoid PNG checksum issues
    # Note: Qwen-VL requires images to be at least 32x32, or Ollama's image processor will panic!
    img = Image.new('RGB', (256, 256), color='red')
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    valid_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    try:
        res = ollama.chat(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": "This is a product image from a fashion catalog. Describe the color in one short sentence.",
                    "images": [valid_b64]
                }
            ],
            options={"temperature": 0.1}
        )
        content = res["message"]["content"]
        print(f"✅ Vision response:\n   {content.strip()}")
    except Exception as e:
        print(f"❌ Vision completion failed: {e}")

def main():
    print("\n🤖 OneProductIQ — Ollama Local Test Suite")
    test_health()
    test_models()
    test_text_completion()
    test_vision_completion()

    separator("Done")
    print("✅ Ollama local checks complete!\n")

if __name__ == "__main__":
    main()
