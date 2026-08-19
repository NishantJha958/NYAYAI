"""
app/services/chunking_service.py
─────────────────────────────────
Provides text splitting utilities for real-time document ingestion.
If a user uploads a PDF or long document later, this service chunks it
using our highly-optimized Indian Legal separators.
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import settings

# Legal-specific separators that respect Indian law document structure
LEGAL_SEPARATORS = [
    "\n\n\n",         # Triple newline (section/chapter boundary)
    "\n\n",           # Double newline (paragraph boundary)
    "\nSection ",     # Explicit section start
    "\n\u0028",       # Opening parenthesis on new line (clause marker)
    "Provided that",  # Legal proviso marker
    "Explanation",    # Explanation clause in Indian laws
    "Illustration",   # Illustration clause
    ".\n",            # End of sentence on new line
    ". ",             # End of sentence
    "; ",             # Semicolon (clause separator in legal text)
    ", ",             # Comma separator
    " ",              # Word boundary (last resort)
    "",               # Character boundary (absolute last resort)
]

def chunk_document(text: str, metadata: dict = None) -> list[dict]:
    """
    Splits a long document into smaller, overlapping chunks suitable for embeddings.
    """
    metadata = metadata or {}
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size        = settings.CHUNK_SIZE,
        chunk_overlap     = settings.CHUNK_OVERLAP,
        separators        = LEGAL_SEPARATORS,
        length_function   = len,
        keep_separator    = True,
    )
    
    # Short text — no need to split
    if len(text) <= settings.CHUNK_SIZE:
        return [{"text": text, "metadata": metadata}]
        
    chunks = splitter.split_text(text)
    return [
        {"text": chunk, "metadata": {**metadata, "chunk_index": i, "total_chunks": len(chunks)}}
        for i, chunk in enumerate(chunks)
    ]
