import sys
sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv()

from app.db.vector_store import search_legal_context, format_context_for_prompt

print("Testing vector search...")
results = search_legal_context("tenant rights security deposit", top_k=3)
print(f"Results found: {len(results)}")
for r in results:
    col = r["collection"]
    dist = r["distance"]
    text = r["text"][:100]
    print(f"  [{col}] dist={dist:.3f}: {text}...")

print()
print("=== Formatted context ===")
print(format_context_for_prompt(results)[:800])
