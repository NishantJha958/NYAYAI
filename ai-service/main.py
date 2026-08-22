"""
main.py
────────
Entry point for the NYAYA AI FastAPI microservice.
"""

import sys
import os

# Fix Windows console encoding for Unicode (emoji, Hindi, etc.)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if sys.stderr.encoding and sys.stderr.encoding.lower() != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.api.v1 import rag_routes, draft_routes, speech_routes

app = FastAPI(
    title="NYAYA AI Microservice",
    description="Handles Legal RAG Q&A and Legal Drafting using local ChromaDB and Gemini/Groq/Mistral fallbacks.",
    version="1.0.0"
)

# ── CORS Middleware ───────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ───────────────────────────────────────────────────
app.include_router(rag_routes.router)
app.include_router(draft_routes.router)
app.include_router(speech_routes.router)

@app.get("/health")
async def health_check():
    """Simple health check endpoint for the Node.js backend to ping."""
    return {"status": "ok", "service": "nyaya_ai"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
