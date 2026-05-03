import onnxruntime as ort
import numpy as np

session = ort.InferenceSession("checkpoints/decoder_model_merged_q4.onnx")

# -----------------------------------
# Example Inputs
# -----------------------------------

inputs = {}

for inp in session.get_inputs():

    print(f"Preparing: {inp.name} | {inp.shape} | {inp.type}")

    shape = []

    for dim in inp.shape:
        if isinstance(dim, str) or dim is None:
            shape.append(1)
        else:
            shape.append(dim)

    if "int64" in inp.type:
        dummy = np.zeros(shape, dtype=np.int64)

    elif "float16" in inp.type:
        dummy = np.zeros(shape, dtype=np.float16)

    else:
        dummy = np.zeros(shape, dtype=np.float32)

    inputs[inp.name] = dummy

outputs = session.run(None, inputs)

print("\nOutputs:")
for i, output in enumerate(outputs):
    print(f"Output {i}: {output.shape}")


'''
Preparing: inputs_embeds | ['batch_size', 'sequence_length', 896] | tensor(float)
Preparing: attention_mask | ['batch_size', 'total_sequence_length'] | tensor(int64)
Preparing: position_ids | ['batch_size', 'sequence_length'] | tensor(int64)
Preparing: past_key_values.0.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.0.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.1.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.1.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.2.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.2.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.3.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.3.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.4.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.4.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.5.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.5.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.6.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.6.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.7.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.7.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.8.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.8.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.9.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.9.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.10.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.10.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.11.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.11.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.12.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.12.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.13.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.13.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.14.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.14.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.15.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.15.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.16.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.16.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.17.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.17.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.18.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.18.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.19.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.19.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.20.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.20.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.21.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.21.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.22.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.22.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.23.key | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)
Preparing: past_key_values.23.value | ['batch_size', 2, 'past_sequence_length', 64] | tensor(float)

Outputs:
Output 0: (1, 1, 151646)
Output 1: (1, 2, 1, 64)
Output 2: (1, 2, 1, 64)
Output 3: (1, 2, 1, 64)
Output 4: (1, 2, 1, 64)
Output 5: (1, 2, 1, 64)
Output 6: (1, 2, 1, 64)
Output 7: (1, 2, 1, 64)
Output 8: (1, 2, 1, 64)
Output 9: (1, 2, 1, 64)
Output 10: (1, 2, 1, 64)
Output 11: (1, 2, 1, 64)
Output 12: (1, 2, 1, 64)
Output 13: (1, 2, 1, 64)
Output 14: (1, 2, 1, 64)
Output 15: (1, 2, 1, 64)
Output 16: (1, 2, 1, 64)
Output 17: (1, 2, 1, 64)
Output 18: (1, 2, 1, 64)
Output 19: (1, 2, 1, 64)
Output 20: (1, 2, 1, 64)
Output 21: (1, 2, 1, 64)
Output 22: (1, 2, 1, 64)
Output 23: (1, 2, 1, 64)
Output 24: (1, 2, 1, 64)
Output 25: (1, 2, 1, 64)
Output 26: (1, 2, 1, 64)
Output 27: (1, 2, 1, 64)
Output 28: (1, 2, 1, 64)
Output 29: (1, 2, 1, 64)
Output 30: (1, 2, 1, 64)
Output 31: (1, 2, 1, 64)
Output 32: (1, 2, 1, 64)
Output 33: (1, 2, 1, 64)
Output 34: (1, 2, 1, 64)
Output 35: (1, 2, 1, 64)
Output 36: (1, 2, 1, 64)
Output 37: (1, 2, 1, 64)
Output 38: (1, 2, 1, 64)
Output 39: (1, 2, 1, 64)
Output 40: (1, 2, 1, 64)
Output 41: (1, 2, 1, 64)
Output 42: (1, 2, 1, 64)
Output 43: (1, 2, 1, 64)
Output 44: (1, 2, 1, 64)
Output 45: (1, 2, 1, 64)
Output 46: (1, 2, 1, 64)
Output 47: (1, 2, 1, 64)
Output 48: (1, 2, 1, 64)

'''