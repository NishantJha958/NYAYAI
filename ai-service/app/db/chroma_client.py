"""
app/db/chroma_client.py
────────────────────────
Singleton ChromaDB client + helper to get/create collections.
Used by rag_service.py and vector_store.py at runtime.

Usage:
    from app.db.chroma_client import get_collection
    col = get_collection("bns_sections")
    results = col.query(query_texts=["breach of trust"], n_results=5)
"""

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from app.core.config import settings
from functools import lru_cache


# ── Singleton client (one connection per process) ─────────────
@lru_cache(maxsize=1)
def get_chroma_client() -> chromadb.PersistentClient:
    """
    Returns a cached ChromaDB PersistentClient.
    Called once at startup — subsequent calls return the same instance.
    """
    return chromadb.PersistentClient(path=settings.CHROMA_PERSIST_PATH)


# ── Singleton embedding function ──────────────────────────────
@lru_cache(maxsize=1)
def get_embedding_function() -> SentenceTransformerEmbeddingFunction:
    """
    Returns a cached SentenceTransformer embedding function.
    Model is downloaded once (~90MB) and cached locally.
    """
    return SentenceTransformerEmbeddingFunction(
        model_name=settings.EMBEDDING_MODEL,
        device="cpu",
    )


# ── Collection names (single source of truth) ─────────────────
class Collections:
    BNS_SECTIONS    = "bns_sections"      # BNS 2023 section definitions
    LEGAL_QA        = "legal_qa"          # Q&A pairs (BNS/BNSS/BSA)
    IPC_BNS_MAPPING = "ipc_bns_mapping"  # Old IPC → New BNS cross-reference

    ALL = [BNS_SECTIONS, LEGAL_QA, IPC_BNS_MAPPING]


def get_collection(name: str) -> chromadb.Collection:
    """
    Get an existing ChromaDB collection by name.
    Raises ValueError if the collection doesn't exist yet
    (run ingest_legal_data.py first).
    """
    client       = get_chroma_client()
    embedding_fn = get_embedding_function()

    try:
        return client.get_collection(
            name               = name,
            embedding_function = embedding_fn,
        )
    except Exception:
        raise ValueError(
            f"Collection '{name}' not found in ChromaDB. "
            f"Run: python scripts/ingest_legal_data.py"
        )


def get_or_create_collection(name: str) -> chromadb.Collection:
    """
    Get or create a ChromaDB collection.
    Used during ingestion.
    """
    client       = get_chroma_client()
    embedding_fn = get_embedding_function()

    return client.get_or_create_collection(
        name               = name,
        embedding_function = embedding_fn,
        metadata           = {"hnsw:space": "cosine"},
    )


def collection_stats() -> dict:
    """
    Returns count of chunks in each collection.
    Useful for health checks / debugging.
    """
    stats = {}
    for name in Collections.ALL:
        try:
            col = get_collection(name)
            stats[name] = col.count()
        except ValueError:
            stats[name] = 0
    return stats
