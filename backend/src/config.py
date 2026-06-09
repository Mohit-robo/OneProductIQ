"""
config.py — Centralised settings using Pydantic v2 BaseSettings.
All values are loaded from the .env file (or environment variables set in
docker-compose.yml, which take precedence over the .env file).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,   # MONGODB_URL and mongodb_url both work
        extra="ignore",         # ignore unknown env vars silently
    )

    # ── MongoDB ───────────────────────────────────────────────────────────────
    mongodb_url: str
    mongodb_db: str = "oneproductiq"

    # ── ChromaDB ─────────────────────────────────────────────────────────────
    chroma_host: str
    chroma_port: int
    chroma_collection_products: str = "products"

    # ── VLM service ──────────────────────────────────────────────────────────
    vlm_url: str = "http://host.docker.internal:11434/v1"
    vlm_model_name: str = "qwen3-vl:2b"

    # ── LLM Models & Keys ────────────────────────────────────────────────────
    groq_api_key: str
    groq_model_name: str = "groq:qwen/qwen3-32b"
    gemini_api_key: str
    gemini_model_name: str = "google_genai:gemma-4-31b-it" 

    # ── Embedding Model ──────────────────────────────────────────────────────
    embedding_model_name: str = "all-MiniLM-L6-v2"

    # ── LangSmith tracing ─────────────────────────────────────────────────────
    langchain_api_key: str
    langchain_tracing_v2: bool
    langchain_project: str
