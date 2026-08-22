"""
app/api/v1/rag_routes.py
────────────────────────
Exposes the RAG Q&A service as a REST endpoint.
Protected by the Inter-Service Key.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.security import verify_inter_service_key
from app.services.rag_service import query_legal_assistant, stream_legal_assistant
from app.db.vector_store import search_legal_context

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

@router.post("/query/stream")
async def ask_legal_question_stream(request: QueryRequest):
    """
    Accepts a legal question and streams the AI-generated answer chunk by chunk.
    """
    try:
        return StreamingResponse(
            stream_legal_assistant(request.question), 
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

class SearchRequest(BaseModel):
    query: str = Field(..., description="The user's legal search query.")
    filters: Optional[dict] = None

class SearchResultModel(BaseModel):
    act: Optional[str]
    section: Optional[str]
    source: Optional[str]
    title: Optional[str]
    content: Optional[str]
    relevance: Optional[str]
    score: float

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultModel]

@router.post("/search", response_model=SearchResponse)
async def search_legal_db(request: SearchRequest):
    """
    Directly queries the vector database and returns raw results without LLM generation.
    """
    try:
        filter_act = None
        if request.filters and "act" in request.filters:
            filter_act = request.filters["act"]
        
        raw_results = search_legal_context(request.query, top_k=5, filter_act=filter_act)
        
        formatted_results = []
        for r in raw_results:
            meta = r["metadata"]
            # Convert cosine distance to a rough "score" (0 to 1, where higher is better)
            dist = r["distance"]
            score = max(0.0, 1.0 - (dist / 2.0))
            
            formatted_results.append(SearchResultModel(
                act=meta.get("act"),
                section=meta.get("section"),
                source=meta.get("source"),
                title=meta.get("title") or meta.get("heading"),
                content=r["text"],
                relevance="Matched from Vector DB",
                score=score
            ))
            
        return SearchResponse(query=request.query, results=formatted_results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
