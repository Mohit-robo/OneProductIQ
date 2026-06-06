# ── vLLM Server for Qwen3-VL-2B ─────────────────────────────────────────────
# Uses the official vLLM Docker image which ships with CUDA drivers and all
# required dependencies pre-installed.
#
# Reference: https://docs.vllm.ai/en/stable/deployment/docker/

FROM vllm/vllm-openai:latest

# Model is downloaded at runtime from HuggingFace Hub into a cache volume.
# Set via HF_TOKEN env var in docker-compose.yml.
ENV HF_HOME=/root/.cache/huggingface

COPY run.sh /run.sh
RUN chmod +x /run.sh

EXPOSE 5000

# The base vllm/vllm-openai image sets ENTRYPOINT=["vllm"].
# Override it so our CMD runs as a plain bash script, not as a vllm subcommand.
ENTRYPOINT ["/bin/bash"]
CMD ["/run.sh"]
