"""
app/api/v1/draft_routes.py
──────────────────────────
Exposes the Legal Drafting service as a REST endpoint.
Protected by the Inter-Service Key.
"""

from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.security import verify_inter_service_key
from app.services.draft_service import generate_legal_draft

router = APIRouter(
    prefix="/api/v1",
    tags=["Legal Drafting"],
    dependencies=[Depends(verify_inter_service_key)]
)

class SourceModel(BaseModel):
    act: Optional[str]
    section: Optional[str]
    source: Optional[str]
    type: Optional[str]

class DraftResponse(BaseModel):
    draft: str
    simplified_explanation: str
    sources: List[SourceModel]

# ── Endpoint ────────────────────────────────────────────────────────
@router.post("/draft", response_model=DraftResponse)
async def create_legal_draft(
    situation: str = Form(...),
    document_type: str = Form(...),
    language: str = Form("en"),
    files: List[UploadFile] = File([])
):
    """
    Accepts a situation and document type, retrieves legal context, 
    and returns a formal legal draft plus a plain-English explanation.
    """
    try:
        result = await generate_legal_draft(situation, document_type, language, files)
        return DraftResponse(
            draft=result.get("draft", ""),
            simplified_explanation=result.get("simplified_explanation", ""),
            sources=result.get("sources", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
