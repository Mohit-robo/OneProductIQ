# Triton Inference Server Deployment Plan for FastVLM

## Goal
Replace the current transformers.js‑based inference with a locally hosted NVIDIA Triton Inference Server using only the FastVLM ONNX weights. This will enable:
- High‑throughput inference with proper batching.
- Flexible model versioning and easy cloud migration.
- Decoupling of preprocessing/post‑processing from the FastVLM model files.

---

## 1. Acquire ONNX Weights
1. Visit the model page: https://huggingface.co/onnx-community/FastVLM-0.5B-ONNX/tree/main/onnx  
2. Download the following files (or clone the repo):
   - `encoder.onnx` – vision encoder
   - `decoder.onnx` – language decoder
   - `embeddings.onnx` – token embedding matrix  
3. Verify SHA‑256 hashes to ensure integrity (optional but recommended).

---

## 2. Build a Model Repository
```
fastvlm_triton/
├── 1/
│   └── model.onnx          # or separate encoder/decoder files
├── 2/
│   └── model.onnx
└── config.pbtxt            # model configuration
```
- Each sub‑directory represents a version (e.g., `1` for v1.0, `2` for v2.0).  
- `config.pbtxt` defines:
  - **input** tensors:  
    - `image` (type `UINT8` or `FLOAT32` with shape `[3, H, W, C]` followed by reshape to expected dimensions).  
  - **output** tensors:  
    - `logits` (type `FLOAT32` with shape `[1, seq_len, vocab_size]`).  
  - Optional parameters: `dynamic_batches`, `max_batch_size`, `input_output_names`.

Example `config.pbtxt`:
```protobuf
name: "fastvlm"
platform: "onnxruntime_onnx"
max_batch_size: 4
input [
  {
    name: "image"
    data_type: TYPE_FP32
    dims: [3, 224, 224, 3]
  }
]
output [
  {
    name: "logits"
    data_type: TYPE_FP32
    dims: [1, -1, 50257]  # vocab size for FastVLM
  }
]
dynamic_batching {
  preferred_batch_size: [1, 2, 4, 8]
}
```

---

## 3. Install Triton Server
### Option A – Docker (quick start)
```bash
docker pull nvcr.io/nvidia/tritonserver:latest-py3
docker run -d --gpus all \
  -v$(pwd)/fastvlm_triton:/models \
  -p8000:8000 -p8001:8001 -p8002:8002 \
  nvcr.io/nvidia/tritonserver:latest-py3 \
  tritonserver --model-repository=/models --log-verbose=1
```

### Option B – Native Installation
1. Install dependencies (Ubuntu example):  
   ```bash
   sudo apt-get install -y libglib2.0-0 libsm6 libxext6 libxrender-dev
   ```
2. Download the appropriate Triton package from NVIDIA.  
3. Follow the installer script and set `--model-repository` to the path of the repo.

---

## 4. Pre‑ & Post‑Processing Logic
### Why external preprocessing?
- Triton’s built‑in ONNX model backend does **not** include the FastVLM image processor (resize, normalize, etc.).  
- Keep preprocessing in the client (or a thin Python wrapper) to preserve exact input distribution.

#### Client‑side preprocessing (Python example)
```python
import cv2
import numpy as np

def preprocess_image(image_path, target_size=(224, 224)):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, target_size)
    img = img.astype(np.float32) / 255.0          # scaling to [0,1]
    img = (img - np.array([0.485, 0.456, 0.406])) / np.array([0.229, 0.224, 0.225])  # normalize
    img = np.transpose(img, (2, 0, 1))[np.newaxis, ...]  # to NCHW
    return img
```

### Post‑processing the decoder output
1. **Gather logits** for the entire sequence.  
2. Apply the same sampling settings used during FastVLM training (e.g., `do_sample=False`, `max_new_tokens=128`).  
3. Use `torch.argmax` (or NumPy `argmax`) along the vocab dimension, then **merge** token ids into the final string using the same tokenizer (`transformers` processor).  
4. Return a JSON payload:
   ```json
   { "description": "A brief description of the image" }
   ```

---

## 5. Inference API Call
### HTTP Request Format
```
POST http://localhost:8000/v2/models/fastvlm/infer
{
  "inputs": [
    {
      "name": "image",
      "parameters": {},
      "shape": [1, 3, 224, 224],
      "datatype": "FP32",
      "contents": "< base64‑encoded raw float data >"
    }
  ],
  "outputs": [
    {
      "name": "logits",
      "parameters": {}
    }
  ]
}
```
- Triton automatically handles batching if multiple requests are sent in one call.  
- The response includes raw logits that we decode in the client.

### Python client snippet
```python
import requests, base64, json, numpy as np

def infer(image_path):
    img = preprocess_image(image_path)                # numpy array (1,3,224,224)
    payload = {
        "inputs": [{
            "name": "image",
            "shape": img.shape,
            "datatype": "FP32",
            "contents": base64.b64encode(img.tobytes()).decode()
        }],
        "outputs": [{"name": "logits"}]
    }
    r = requests.post("http://localhost:8000/v2/models/fastvlm/infer", json=payload)
    result = r.json()
    logits = np.frombuffer(base64.b64decode(result["outputs"][0]["contents"]), dtype=np.float32)
    # → decode logits → description string (use same tokenizer as FastVLM)
    return decode_fastvlm_logits(logits)
```

---

## 6. Integration with Existing `/upload` Endpoint
1. Keep the existing **Express** upload handler (it already stores the temporary file).  
2. Instead of calling FastVLM directly via `transformers.js`, forward the image data to the Triton server:  
   ```js
   const response = await fetch('http://localhost:8000/v2/models/fastvlm/infer', {
     method: 'POST',
     body: JSON.stringify(payload),
     headers: { 'Content-Type': 'application/json' }
   });
   const tritonResult = await response.json();
   const description = decodeTridentOutput(tritonResult); // tiny helper that runs the post‑process described above
   res.json({ description });
   ```
3. The frontend (`demo-app-client`) remains unchanged – it still sends a multipart `image` field and expects a JSON with a `description`.

---

## 7. Performance Profiling
| Metric               | Tool / Command                                    |
|----------------------|---------------------------------------------------|
| Latency (per request)| `curl -w "@curl-response.txt" -o /dev/null -s`   |
| Throughput           | `hey -m post -c 10 -n 100 http://localhost:8000/v2/models/fastvlm/infer` |
| GPU utilization      | `nvidia-smi`                                      |
| Batch size scaling   | Adjust `--config-file` in Triton config for higher `preferred_batch_size` |

Triton’s built‑in metrics endpoint (`/metrics`) can be scraped for real‑time stats.

---

## 8. Containerization & Cloud Migration Plan
1. **Dockerfile** (multi‑stage):
   ```Dockerfile
   FROM nvcr.io/nvidia/tritonserver:latest-py3 AS base
   COPY fastvlm_triton /models
   CMD ["tritonserver", "--model-repository=/models", "--log-verbose=1"]
   ```
2. Build & tag: `docker build -t fastvlm-triton:latest .`  
3. Run with GPU: `docker run -d --gpus all -p 8000:8000 -p 8001:8001 -p 8002:8002 fastvlm-triton:latest`  
4. **Cloud Options**:  
   - **AWS ECS** – Use Fargate platform, push image to ECR, define a service with port mappings.  
   - **GCP Cloud Run** – Requires Cloud Run for Anthos (GPU not yet supported; you could use Cloud Run with **Cloud Deploy** and a GPU‑enabled VM).  
   - **Azure Container Apps** – Supports GPU and auto‑scales.  
5. Update the **Kubernetes** deployment manifest to mount a Persistent Volume for model versions if you plan to hot‑swap models.

---

## 9. Documentation & Version Control
- Store this plan in `docs/triton-deployment-plan.md`.  
- Keep a `models/versions/` folder with git‑tracked releases.  
- Add a migration guide to `docs/memory.md` pointing to this plan for future engineers.

---

## 10. Next Actions
1. **Download ONNX files** and populate `fastvlm_triton/` according to step 1‑2.  
2. **Spin up Triton** via Docker (step 3).  
3. Implement the **pre‑processing** and **post‑processing** scripts (steps 4‑5).  
4. Modify the **Express upload handler** to forward to Triton (step 6).  
5. **Test end‑to‑end** with the same curl command used before, verifying that the JSON response still contains a `description`.  
6. Document the findings and update the project wiki / `MEMORY.md`.

---

### Risks & Mitigations
| Risk                         | Mitigation |
|------------------------------|------------|
| Triton version incompatibility with ONNX ops used by FastVLM | Pin a known‑good Triton version (e.g., 2.39.0) and test with sample ONNX files before full integration. |
| Large model size causing memory pressure on GPU | Use GPU with ≥ 12 GB VRAM, enable `dynamic_batching` with small max_batch_size, or run inference on CPU for prototyping. |
| Decoding logits correctly matches FastVLM’s tokenizer | Re‑use the exact tokenizer definition from `transformers` (`AutoProcessor`) in the Python post‑process layer; keep a copy of `processor.json` alongside the model repo for reference. |
| Cloud deployment GPU limits | Choose a cloud offering with GPU support (ECS Fargate with GPU, Azure Container Apps, or GCP GPU‑enabled Cloud Run alternatives). |

---

**Prepared by:** *OneProductIQ ML Team*  
**Date:** 2026‑05‑03  
