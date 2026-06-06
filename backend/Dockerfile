# ── FastAPI Backend ───────────────────────────────────────────────────────────
# Python 3.11 slim image keeps the image small while supporting all required libs.

FROM python:3.11-slim

# Prevents Python from writing .pyc files and enables unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies needed by some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer caching)
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

RUN pip install torch==2.11.0 torchvision==0.26.0 torchaudio==2.11.0 --index-url https://download.pytorch.org/whl/cu130

# Copy application source
COPY . .

EXPOSE 8000

# Start the FastAPI server with hot-reload disabled (production mode)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
