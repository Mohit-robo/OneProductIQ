import onnxruntime as ort
import numpy as np

session = ort.InferenceSession("checkpoints/vision_encoder_q4.onnx")

dummy = np.random.rand(1, 3, 384, 384).astype(np.float32)

outputs = session.run(
    None,
    {
        session.get_inputs()[0].name: dummy
    }
)

print(len(outputs))
print(outputs[0].shape)


'''
1
(1, 36, 896)

'''