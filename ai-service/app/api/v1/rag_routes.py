"""
app/api/v1/rag_routes.py
────────────────────────
Exposes the RAG Q&A service as a REST endpoint.
Protected by the Inter-Service Key.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.security import verify_inter_service_key
from app.services.rag_service import query_legal_assistant

router = APIRouter(
    prefix="/api/v1",
    tags=["RAG Q&A"],
    dependencies=[Depends(verify_inter_service_key)]
)

# ── Pydantic Request/Response Models ──────────────────────────────────
class QueryRequest(BaseModel):
    question: str = Field(..., description="The user's legal question.")

class SourceModel(BaseModel):
    act: Optional[str]
    section: Optional[str]
    source: Optional[str]
    type: Optional[str]

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceModel]

# ── Endpoint ────────────────────────────────────────────────────────
@router.post("/query", response_model=QueryResponse)
async def ask_legal_question(request: QueryRequest):
    """
    Accepts a legal question, retrieves context from the vector database, 
    and returns an AI-generated answer with legal citations.
    """
    try:
        result = await query_legal_assistant(request.question)
        return QueryResponse(
            answer=result.get("answer", ""),
            sources=result.get("sources", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
