"""
scripts/ingest_legal_data.py
─────────────────────────────────────────────────────────────────
Reads downloaded legal datasets → chunks text → generates embeddings
→ stores in ChromaDB.

HOW IT WORKS:
  1. Reads all 3 datasets from data/raw/ (JSONL files)
  2. Normalizes each dataset's schema into a uniform format:
       { text, source, section, act, type }
  3. Splits long texts into overlapping chunks (800 chars, 100 overlap)
  4. Generates 384-dim embeddings using all-MiniLM-L6-v2 (local, free)
  5. Stores chunks + embeddings + metadata into ChromaDB collections

COLLECTIONS CREATED IN CHROMADB:
  - bns_sections      (from bns_definitions: 358 BNS sections)
  - legal_qa          (from indian_legal_qa: 8,502 Q&A pairs)
  - ipc_bns_mapping   (from ipc_bns_mapping: 563 IPC→BNS mappings)

Run from inside ai-service/:
    .\\venv\\Scripts\\python.exe scripts\\ingest_legal_data.py
"""

import os
import sys
import json
import time
import warnings
from pathlib import Path
from typing import Generator

# ── Suppress noisy warnings ────────────────────────────────────
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
warnings.filterwarnings("ignore")

# ── Allow imports from ai-service root ────────────────────────
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

# ── Paths ─────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent.parent
RAW_DIR    = BASE_DIR / "data" / "raw"
_chroma_rel = os.getenv("CHROMA_PERSIST_PATH", "./chroma_db")
CHROMA_DIR  = (BASE_DIR / _chroma_rel).resolve()   # absolute path, works on Windows

# ── Config ────────────────────────────────────────────────────
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
CHUNK_SIZE      = 800   # all-MiniLM-L6-v2 max = 256 tokens ≈ 1000 chars
                        # 800 is the safe sweet spot — going higher causes
                        # SILENT TRUNCATION and degrades retrieval accuracy
CHUNK_OVERLAP   = 150  # increased to 150 so context bleeds across chunks
BATCH_SIZE      = 50   # embed + store N chunks at a time

# Legal-specific separators — ordered from largest to smallest boundary.
# RecursiveCharacterTextSplitter tries each in order, falling back to next
# only if a chunk is still too large after splitting on the current one.
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


# ══════════════════════════════════════════════════════════════
# STEP 1 — NORMALISE DATASETS INTO UNIFORM ROWS
# Each raw dataset has a different schema. We normalise them all
# into:  { text, source, section, act, doc_type }
# ══════════════════════════════════════════════════════════════

def load_jsonl(path: Path) -> Generator[dict, None, None]:
    """Yield rows from a JSONL file one by one."""
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)


def normalise_bns_definitions(row: dict) -> dict:
    """
    Source schema: { Section, Title, Legal Definition }
    Example:
        Section: "1"
        Title: "Short title, commencement and application"
        Legal Definition: "This Act may be called the Bharatiya Nyaya Sanhita..."
    """
    text = f"BNS Section {row['Section']} — {row['Title']}\n\n{row['Legal Definition']}"
    return {
        "text"    : text,
        "source"  : "BNS 2023",
        "section" : str(row.get("Section", "")),
        "act"     : "BNS",
        "doc_type": "section_definition",
    }


def normalise_legal_qa(row: dict) -> dict:
    """
    Source schema: { chunk_id, act, section_number, section_title,
                     question, answer, question_type }
    We store question + answer together as one searchable chunk.
    """
    text = (
        f"Act: {row['act']} | Section {row['section_number']}: {row['section_title']}\n\n"
        f"Q: {row['question']}\n"
        f"A: {row['answer']}"
    )
    return {
        "text"    : text,
        "source"  : row.get("act", ""),
        "section" : str(row.get("section_number", "")),
        "act"     : row.get("act", "").split()[0],   # "BNS 2023" → "BNS"
        "doc_type": f"qa_{row.get('question_type', 'general')}",
    }


def normalise_ipc_bns_mapping(row: dict) -> dict:
    """
    Source schema: { prompts, response }
    response is a dict string: { IPC Section, IPC Heading, BNS Section, BNS Heading, ... }
    We combine prompt + response into searchable text.
    """
    resp = row.get("response", {})
    if isinstance(resp, str):
        try:
            resp = json.loads(resp.replace("'", '"'))
        except Exception:
            resp = {}

    ipc_sec = resp.get("IPC Section", "")
    bns_sec = resp.get("BNS Section", "")
    ipc_heading = resp.get("IPC Heading", "")
    bns_heading = resp.get("BNS Heading", "")
    changes = resp.get("Key Changes", "")

    text = (
        f"IPC Section {ipc_sec} ({ipc_heading}) → BNS Section {bns_sec} ({bns_heading})\n"
        f"{changes}\n\n"
        f"Q: {row.get('prompts', '')}\n"
        f"A: IPC {ipc_sec} maps to BNS {bns_sec}. {bns_heading}"
    )
    return {
        "text"    : text,
        "source"  : "IPC-BNS-Mapping",
        "section" : f"IPC-{ipc_sec}→BNS-{bns_sec}",
        "act"     : "IPC_BNS",
        "doc_type": "ipc_bns_mapping",
    }


# ══════════════════════════════════════════════════════════════
# STEP 2 — CHUNKING
# Split long texts into overlapping chunks so the embedding
# model captures local context (800 chars ≈ ~200 tokens).
# ══════════════════════════════════════════════════════════════

def chunk_text(text: str, metadata: dict) -> list[dict]:
    """
    Split text into overlapping chunks using legal-specific separators.

    Why NOT SemanticChunker here:
      - SemanticChunker runs the embedding model DURING chunking to detect
        meaning shifts — this doubles the embedding calls and slows ingestion.
      - Legal text already has strong structural signals (Section X, Provided
        that, Explanation, etc.) that character-based splitting handles well.
      - SemanticChunker is better for narrative prose; our data is structured.

    Why legal-specific separators:
      - Generic separators split on any newline/period, breaking legal clauses
        mid-thought. Our separators respect Indian law document structure:
        Sections → Provisos → Explanations → Illustrations → Sentences.
    """
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(
        chunk_size        = CHUNK_SIZE,
        chunk_overlap     = CHUNK_OVERLAP,
        separators        = LEGAL_SEPARATORS,
        length_function   = len,             # count characters (not tokens)
        keep_separator    = True,            # keep the separator in chunk text
    )

    # Short text — no need to split, return as-is
    if len(text) <= CHUNK_SIZE:
        return [{"text": text, "metadata": metadata}]

    chunks = splitter.split_text(text)
    return [
        {"text": chunk, "metadata": {**metadata, "chunk_index": i, "total_chunks": len(chunks)}}
        for i, chunk in enumerate(chunks)
    ]


# ══════════════════════════════════════════════════════════════
# STEP 3 — EMBEDDING + CHROMADB STORAGE
# ══════════════════════════════════════════════════════════════

def get_chroma_collection(collection_name: str):
    """Get or create a ChromaDB collection with Gemini embeddings."""
    import chromadb
    from app.db.chroma_client import get_embedding_function

    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    embedding_fn = get_embedding_function()
    collection = client.get_or_create_collection(
        name               = collection_name,
        embedding_function = embedding_fn,
        metadata           = {"hnsw:space": "cosine"},
    )
    return collection


def ingest_chunks(collection, chunks: list[dict], start_id: int = 0) -> int:
    """
    Add a batch of chunks to ChromaDB.
    ChromaDB auto-generates embeddings via the embedding_function we set.
    """
    if not chunks:
        return 0

    ids       = [f"{collection.name}_{start_id + i}" for i in range(len(chunks))]
    documents = [c["text"]     for c in chunks]
    metadatas = [c["metadata"] for c in chunks]

    collection.add(
        ids       = ids,
        documents = documents,
        metadatas = metadatas,
    )
    return len(chunks)


# ══════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ══════════════════════════════════════════════════════════════

PIPELINE = [
    {
        "jsonl"         : RAW_DIR / "bns_definitions" / "train.jsonl",
        "collection"    : "bns_sections",
        "normalise_fn"  : normalise_bns_definitions,
        "desc"          : "BNS Section Definitions (358 sections)",
    },
    {
        "jsonl"         : RAW_DIR / "indian_legal_qa" / "train.jsonl",
        "collection"    : "legal_qa",
        "normalise_fn"  : normalise_legal_qa,
        "desc"          : "Legal Q&A Pairs (8,502 entries)",
    },
    {
        "jsonl"         : RAW_DIR / "ipc_bns_mapping" / "train.jsonl",
        "collection"    : "ipc_bns_mapping",
        "normalise_fn"  : normalise_ipc_bns_mapping,
        "desc"          : "IPC to BNS Mapping (563 entries)",
    },
    {
        "jsonl"         : RAW_DIR / "indian_law_general" / "train.jsonl",
        "collection"    : "indian_law_general",
        "normalise_fn"  : normalise_legal_qa, # Reuse legal QA normalisation
        "desc"          : "General Indian Law (RTI, Consumer Protection, etc)",
    },
]


def run_pipeline(entry: dict) -> dict:
    """Process one dataset: read → normalise → chunk → embed → store."""
    jsonl_path  = entry["jsonl"]
    coll_name   = entry["collection"]
    normalise   = entry["normalise_fn"]
    desc        = entry["desc"]

    print(f"\n{'='*55}")
    print(f"  Processing: {desc}")
    print(f"  Collection: {coll_name}")
    print(f"{'='*55}")

    if not jsonl_path.exists():
        print(f"  [SKIP] File not found: {jsonl_path}")
        return {"collection": coll_name, "status": "skipped", "chunks": 0}

    # Check if collection already has data
    collection = get_chroma_collection(coll_name)
    existing   = collection.count()
    if existing > 0:
        print(f"  [SKIP] Already has {existing:,} chunks in ChromaDB")
        return {"collection": coll_name, "status": "already_done", "chunks": existing}

    # Read + normalise + chunk
    all_chunks  = []
    raw_count   = 0
    error_count = 0

    for row in load_jsonl(jsonl_path):
        raw_count += 1
        try:
            normalised = normalise(row)
            chunks     = chunk_text(normalised["text"], {
                "source"  : normalised["source"],
                "section" : normalised["section"],
                "act"     : normalised["act"],
                "doc_type": normalised["doc_type"],
            })
            all_chunks.extend(chunks)
        except Exception as e:
            error_count += 1

        if raw_count % 1000 == 0:
            print(f"  Processed {raw_count} rows, {len(all_chunks)} chunks so far...")

    print(f"  Raw rows   : {raw_count:,}")
    print(f"  Chunks     : {len(all_chunks):,}  (after splitting)")
    print(f"  Errors     : {error_count}")
    print(f"  Embedding + storing in ChromaDB (batch size={BATCH_SIZE})...")

    # Embed + store in batches
    total_stored = 0
    t0 = time.time()

    for i in range(0, len(all_chunks), BATCH_SIZE):
        batch = all_chunks[i : i + BATCH_SIZE]
        
        total_stored += ingest_chunks(collection, batch, start_id=i)

        pct  = (i + len(batch)) / len(all_chunks) * 100
        elapsed = time.time() - t0
        print(f"  [{pct:5.1f}%] Stored {total_stored:,}/{len(all_chunks):,} chunks"
              f"  ({elapsed:.0f}s)", end="\r")

    elapsed = time.time() - t0
    print(f"\n  DONE - {total_stored:,} chunks stored in {elapsed:.1f}s")
    return {"collection": coll_name, "status": "ok", "chunks": total_stored}


def main():
    print("=" * 55)
    print("  NYAYA - Legal Data Ingestion Pipeline")
    print("=" * 55)
    print(f"  Model      : {EMBEDDING_MODEL}")
    print(f"  Chunk size : {CHUNK_SIZE} chars, {CHUNK_OVERLAP} overlap")
    print(f"  ChromaDB   : {CHROMA_DIR}")
    print(f"  Batch size : {BATCH_SIZE}")
    print("=" * 55)
    print()
    print("  NOTE: First run downloads the embedding model (~90MB).")
    print("  Subsequent runs are instant (model cached).")
    print()

    # Create ChromaDB dir
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)

    results = []
    total_start = time.time()

    for entry in PIPELINE:
        result = run_pipeline(entry)
        results.append(result)

    total_time = time.time() - total_start

    # Summary
    print(f"\n{'='*55}")
    print("  INGESTION SUMMARY")
    print(f"{'='*55}")
    total_chunks = 0
    for r in results:
        status = r["status"].upper()
        chunks = r["chunks"]
        total_chunks += chunks
        print(f"  [{status:10s}] {r['collection']:20s} {chunks:>6,} chunks")

    print("-" * 55)
    print(f"  TOTAL CHUNKS IN CHROMADB : {total_chunks:,}")
    print(f"  TOTAL TIME               : {total_time:.1f}s")
    print(f"\n  ChromaDB saved at: {CHROMA_DIR}")
    print(f"\n  DONE! Your AI now has legal knowledge.")
    print(f"  Next: .\\venv\\Scripts\\python.exe -m uvicorn main:app --reload")


if __name__ == "__main__":
    main()
