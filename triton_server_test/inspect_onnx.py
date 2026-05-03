import onnxruntime as ort
import numpy as np

MODEL_PATH = "checkpoints/embed_tokens_fp16.onnx"

session = ort.InferenceSession(
    MODEL_PATH,
    providers=["CPUExecutionProvider"]
)

print("\n===== INPUTS =====")

for inp in session.get_inputs():
    print(f"Name: {inp.name}")
    print(f"Shape: {inp.shape}")
    print(f"Type: {inp.type}")

print("\n===== OUTPUTS =====")

for out in session.get_outputs():
    print(f"Name: {out.name}")
    print(f"Shape: {out.shape}")
    print(f"Type: {out.type}")