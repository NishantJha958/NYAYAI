"""
app/core/config.py
──────────────────
Pydantic Settings — reads all values from .env automatically.
Import `settings` anywhere in the app to access config values.

Usage:
    from app.core.config import settings
    print(settings.GROQ_API_KEY)
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    """
    All configuration is loaded from the .env file.
    Pydantic validates types automatically.
    """

    # ── LLM API Keys ──────────────────────────────────────────
    GEMINI_API_KEY : str = Field(..., description="Google Gemini API key")
    GROQ_API_KEY   : str = Field(..., description="Groq API key (LLaMA 3)")
    MISTRAL_API_KEY: str = Field(..., description="Mistral API key")

    # ── HuggingFace ───────────────────────────────────────────
    HUGGINGFACEHUB_ACCESS_TOKEN: str = Field(..., description="HuggingFace token for model downloads")

    # ── FastAPI Server ────────────────────────────────────────
    PORT: int = Field(default=8000, description="FastAPI server port")

    # ── Inter-Service Security ────────────────────────────────
    INTER_SERVICE_KEY: str = Field(
        default="nyaya_supersecret_2026",
        description="Shared secret key between Node.js and FastAPI"
    )

    # ── ChromaDB ─────────────────────────────────────────────
    CHROMA_PERSIST_PATH: str = Field(
        default="./chroma_db",
        description="Folder where ChromaDB persists its data"
    )

    # ── Embedding Model ───────────────────────────────────────
    EMBEDDING_MODEL: str = Field(
        default="all-MiniLM-L6-v2",
        description="HuggingFace sentence-transformer model for embeddings"
    )

    # ── Node.js Backend ───────────────────────────────────────
    NODE_BACKEND_URL: str = Field(
        default="http://localhost:5000",
        description="URL of the Node.js Express backend"
    )

    # ── LLM Settings ─────────────────────────────────────────
    # Primary: Gemini | Fallback 1: Groq | Fallback 2: Mistral
    PRIMARY_LLM   : str = Field(default="gemini",  description="Primary LLM provider")
    FALLBACK_LLM_1: str = Field(default="groq",    description="First fallback LLM")
    FALLBACK_LLM_2: str = Field(default="mistral", description="Second fallback LLM")

    GEMINI_MODEL : str = Field(default="gemini-1.5-flash", description="Gemini model name")
    GROQ_MODEL   : str = Field(default="llama-3.1-8b-instant", description="Groq model name")
    MISTRAL_MODEL: str = Field(default="mistral-small-latest", description="Mistral model name")

    # ── RAG Settings ─────────────────────────────────────────
    RETRIEVAL_TOP_K       : int   = Field(default=5,    description="Number of chunks to retrieve from vector DB")
    CHUNK_SIZE            : int   = Field(default=800,  description="Max characters per text chunk")
    CHUNK_OVERLAP         : int   = Field(default=100,  description="Overlap between consecutive chunks")

    class Config:
        env_file         = ".env"
        env_file_encoding = "utf-8"
        case_sensitive   = False        # GOOGLE_API_KEY == google_api_key


@lru_cache()
def get_settings() -> Settings:
    """
    Returns a cached Settings instance.
    Use lru_cache so .env is only read once at startup.

    Example:
        from app.core.config import get_settings
        settings = get_settings()
    """
    return Settings()


# ── Convenience singleton ─────────────────────────────────────
# Most modules can just do: from app.core.config import settings
settings = get_settings()
