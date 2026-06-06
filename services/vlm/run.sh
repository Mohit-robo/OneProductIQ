#!/usr/bin/env bash
# ── run.sh ────────────────────────────────────────────────────────────────────
# Convenience wrapper to start the vLLM server manually.
# Used for local debugging OUTSIDE of Docker.
# In production, Docker CMD is used directly.

set -e

MODEL="${VLM_MODEL:-Qwen/Qwen3-VL-2B}"
PORT="${VLM_PORT:-5000}"
MAX_LEN="${VLM_MAX_LEN:-2048}"

# Reduce fragmentation on small GPUs (<= 4 GiB VRAM)
export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True

echo "Starting vLLM server..."
echo "  Model : $MODEL"
echo "  Port  : $PORT"

python3 -m vllm.entrypoints.openai.api_server \
    --model "$MODEL" \
    --served-model-name vlm \
    --host 0.0.0.0 \
    --port "$PORT" \
    --tensor-parallel-size 1 \
    --max-model-len "$MAX_LEN" \
    --gpu-memory-utilization 0.80 \
    --enforce-eager \
    --trust-remote-code \
    --limit-mm-per-prompt '{"image": 5}'
