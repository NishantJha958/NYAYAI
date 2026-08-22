import sys
sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv()

import chromadb
from app.core.config import settings

# Direct client without embedding function
client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_PATH)
colls = client.list_collections()
print(f"Collections: {[c.name for c in colls]}")

# Try getting bns_sections directly WITHOUT embedding function
col = client.get_collection("bns_sections")
print(f"bns_sections count: {col.count()}")

# Peek at a few items
peek = col.peek(3)
print("\nSample documents:")
for i, doc in enumerate(peek["documents"]):
    print(f"  [{i}]: {doc[:120]}...")

print("\nSample metadata:", peek["metadatas"][0] if peek["metadatas"] else "None")

# Now test querying with the embedding function
print("\nNow testing WITH embedding function...")
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
ef = SentenceTransformerEmbeddingFunction(
    model_name=settings.EMBEDDING_MODEL,
    device="cpu"
)
col_with_ef = client.get_collection("bns_sections", embedding_function=ef)
results = col_with_ef.query(
    query_texts=["tenant rights security deposit"],
    n_results=3,
    include=["documents", "metadatas", "distances"]
)
print(f"Query results count: {len(results['documents'][0])}")
for doc, dist in zip(results["documents"][0], results["distances"][0]):
    print(f"  dist={dist:.3f}: {doc[:100]}...")
