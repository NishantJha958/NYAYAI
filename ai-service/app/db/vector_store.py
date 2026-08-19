"""
app/db/vector_store.py
───────────────────────
High-level query interface over ChromaDB.
Used by rag_service.py to retrieve relevant legal chunks.

Usage:
    from app.db.vector_store import search_legal_context
    results = search_legal_context("breach of trust", top_k=5)
"""

from typing import Optional
from app.db.chroma_client import get_collection, Collections


def search_legal_context(
    query: str,
    top_k: int = 5,
    collection_name: Optional[str] = None,
    filter_act: Optional[str] = None,
) -> list[dict]:
    """
    Semantic search across ChromaDB collections.

    Args:
        query           : User's question in plain Hindi or English
        top_k           : Number of chunks to retrieve
        collection_name : Search a specific collection (None = search all)
        filter_act      : Filter by act name e.g. "BNS", "IPC_BNS"

    Returns:
        List of dicts: [{ text, metadata, distance }, ...]
        Sorted by relevance (lowest cosine distance first).
    """
    # Build metadata filter if requested
    where_filter = {}
    if filter_act:
        where_filter["act"] = {"$eq": filter_act}

    query_kwargs = {
        "query_texts" : [query],
        "n_results"   : top_k,
        "include"     : ["documents", "metadatas", "distances"],
    }
    if where_filter:
        query_kwargs["where"] = where_filter

    # Search one collection or all
    if collection_name:
        collections_to_search = [collection_name]
    else:
        collections_to_search = Collections.ALL

    all_results = []

    for name in collections_to_search:
        try:
            col      = get_collection(name)
            response = col.query(**query_kwargs)

            docs      = response["documents"][0]
            metas     = response["metadatas"][0]
            distances = response["distances"][0]

            for doc, meta, dist in zip(docs, metas, distances):
                all_results.append({
                    "text"      : doc,
                    "metadata"  : meta,
                    "distance"  : dist,
                    "collection": name,
                })
        except ValueError:
            # Collection not yet created — skip silently
            continue
        except Exception as e:
            print(f"[vector_store] Error querying '{name}': {e}")
            continue

    # Sort all results by cosine distance (lower = more similar)
    all_results.sort(key=lambda x: x["distance"])

    # Return top_k overall
    return all_results[:top_k]


def format_context_for_prompt(results: list[dict]) -> str:
    """
    Convert retrieved chunks into a formatted context string
    to inject into the LLM prompt.

    Example output:
        [Source: BNS 2023 | Section: 406 | Type: section_definition]
        BNS Section 406 — Criminal breach of trust
        Whoever commits criminal breach of trust shall be...

        [Source: BNS 2023 | Section: 406 | Type: qa_definitional_topic]
        Q: What is the punishment for breach of trust?
        A: Imprisonment up to 7 years and fine...
    """
    if not results:
        return "No relevant legal context found."

    parts = []
    for i, r in enumerate(results, 1):
        meta = r["metadata"]
        header = (
            f"[{i}] Source: {meta.get('source', 'Unknown')} | "
            f"Section: {meta.get('section', 'N/A')} | "
            f"Act: {meta.get('act', 'N/A')}"
        )
        parts.append(f"{header}\n{r['text']}")

    return "\n\n---\n\n".join(parts)
