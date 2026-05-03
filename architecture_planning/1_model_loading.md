# Load FastVLM model in browser using transformers.js.

## Model Loading
 
- [X] Install transformers.js and ONNX Runtime JS
 
- [X] Create model loader hook (useVLMModel)
 
- [ ] Implement model caching (avoid reload)
 
- [X] Add GPU/CPU device detection
 
- [X] Handle model loading states (loading, error, ready)

Subtasks:

- [X] Load FastVLM model (~1-2GB download)
    - [ ] Currently using onnx weight from transformers.js but instead use only onnx weights and run the inference. Host the model on a triton server.  

- [X] Benchmark CPU vs. GPU loading

- [ ] Create fallback to CPU if GPU unavailable

## Create Demo Node.js Frontend App

- [ ] Create a basic node.js app.

- [ ] Upload single image, enter prompt and run inference and show response on the application screen.

- [ ] Upload 10 image, enter prompt and run inference and show responses on the application screen.
        In this case, auto adjust the layout. Left Image -> Right response
