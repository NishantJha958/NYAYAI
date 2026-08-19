"""
app/services/embedding_service.py
──────────────────────────────────
Utility service to generate raw vector embeddings for arbitrary text.
Reuses the cached local model from chroma_client to save memory.
"""

from app.db.chroma_client import get_embedding_function

def embed_text(text: str) -> list[float]:
    """
    Generates a high-dimensional vector for a given string.
    Useful for manual semantic similarity calculations outside of ChromaDB.
    """
    fn = get_embedding_function()
    
    # The SentenceTransformer function expects a list of strings and returns a list of vectors
    embeddings = fn([text])
    
    return embeddings[0]
