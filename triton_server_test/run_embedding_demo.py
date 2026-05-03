import onnxruntime as ort
import numpy as np

session = ort.InferenceSession("checkpoints/embed_tokens_fp16.onnx")

print("\n===== INPUTS =====")
for inp in session.get_inputs():
    print(inp.name, inp.shape, inp.type)

print("\n===== OUTPUTS =====")
for out in session.get_outputs():
    print(out.name, out.shape, out.type)

# -----------------------------------
# Dummy Input
# -----------------------------------

# Example token ids
dummy_input_ids = np.array([[1, 100, 205, 300]], dtype=np.int64)

outputs = session.run(
    None,
    {
        session.get_inputs()[0].name: dummy_input_ids
    }
)

print("\nNumber of outputs:", len(outputs))

for i, output in enumerate(outputs):
    print(f"Output {i} shape:", output.shape)

'''
===== INPUTS =====
input_ids ['batch_size', 'sequence_length'] tensor(int64)

===== OUTPUTS =====
inputs_embeds ['batch_size', 'sequence_length', 896] tensor(float)

Number of outputs: 1
Output 0 shape: (1, 4, 896)

'''