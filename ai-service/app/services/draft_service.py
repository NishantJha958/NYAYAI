"""
app/services/draft_service.py
──────────────────────────────
Generates legal drafts (RTI, Legal Notices, PIL) based on user prompts.
It also returns a simplified, plain-English explanation for the user.
Forces the LLM to output valid JSON using LangChain's JsonOutputParser.
"""

from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.services.llm_service import resilient_llm
from app.db.vector_store import search_legal_context, format_context_for_prompt
from app.core.config import settings

# ── Define the Output Schema ──────────────────────────────────────────
class DraftResponseSchema(BaseModel):
    draft: str = Field(description="The formal legal draft (RTI, Legal Notice, PIL) using proper legal terminology.")
    simplified_explanation: str = Field(description="A plain language explanation of what this document does and how the user should use it.")

# Instantiate the parser
parser = JsonOutputParser(pydantic_object=DraftResponseSchema)

# ── Define the System Prompt ──────────────────────────────────────────
DRAFT_PROMPT_TEMPLATE = """You are NYAYA, an expert AI legal draftsman in India.

Your task is to draft a {document_type} based on the user's situation and the provided legal context.

Legal Context (Indian Law):
{context}

User's Situation / Request:
{situation}

INSTRUCTIONS:
1. "draft": Write a professional, formal, and complete legal draft for the {document_type}. Include placeholders like [Name], [Date], [Address] where necessary. Use the legal context to cite specific sections (like BNS or IPC) if relevant.
2. "simplified_explanation": Write a simple, easy-to-understand explanation for a normal citizen detailing exactly what this document is, what they need to fill in, and what their next steps should be (e.g., "Take this to the post office and send it via registered post").
3. OUTPUT LANGUAGE: You MUST output the VALUES of BOTH the 'draft' and 'simplified_explanation' entirely in the requested language ({language}). If the language is 'hi', 'hindi', or 'Hindi', you MUST output the values completely in Hindi (Devanagari script).
4. CRITICAL JSON RULE: The JSON keys MUST REMAIN EXACTLY AS 'draft' and 'simplified_explanation'. DO NOT translate the keys into Hindi. ONLY translate the VALUES into Hindi. Do NOT output any conversational text outside the JSON.
5. DO NOT use any markdown formatting characters such as '#', '*', or '**' in the output. The output should be raw plain text.

{format_instructions}
"""

prompt = ChatPromptTemplate.from_template(
    template=DRAFT_PROMPT_TEMPLATE,
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# ── Construct the LCEL Chain ─────────────────────────────────────────
draft_chain = prompt | resilient_llm | parser


import PyPDF2
import io
from fastapi import UploadFile
from typing import List

async def generate_legal_draft(situation: str, document_type: str, language: str = "en", files: List[UploadFile] = None) -> dict:
    """
    1. Extracts text from uploaded files (if any) and appends to situation.
    2. Retrieves relevant legal chunks.
    3. Invokes the LCEL chain.
    4. Returns a parsed JSON dictionary containing the 'draft' and 'simplified_explanation', along with sources.
    """
    
    # 0. Extract text from uploaded files
    extracted_text = ""
    if files:
        for file in files:
            content = await file.read()
            if file.filename.lower().endswith(".pdf"):
                try:
                    pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
                    for page in pdf_reader.pages:
                        text = page.extract_text()
                        if text:
                            extracted_text += text + "\n"
                except Exception as e:
                    print(f"Error reading PDF {file.filename}: {e}")
            elif file.filename.lower().endswith(".txt"):
                extracted_text += content.decode("utf-8", errors="ignore") + "\n"
            
    if extracted_text.strip():
        situation += f"\n\n--- Information from attached documents ---\n{extracted_text}"
    
    # 1. Retrieve Context
    # We pass the situation string as the query to find relevant laws
    raw_results = search_legal_context(
        query=situation, 
        top_k=settings.RETRIEVAL_TOP_K
    )
    context_text = format_context_for_prompt(raw_results)
    
    # Map language code to explicit name to prevent LLM confusion
    lang_name = "Hindi (Devanagari)" if language.lower() in ["hi", "hindi"] else "English"
    
    # 2. Generate Draft & Explanation
    # The parser ensures we get a Python dictionary back, not a raw string.
    try:
        parsed_output = await draft_chain.ainvoke({
            "context": context_text,
            "situation": situation,
            "document_type": document_type,
            "language": lang_name
        })
    except Exception as e:
        # Fallback if parsing fails
        return {
            "draft": f"Error generating draft: {str(e)}",
            "simplified_explanation": "The system encountered an error. Please try again.",
            "sources": []
        }
    
    # 3. Extract Sources
    seen_sections = set()
    unique_sources = []
    for r in raw_results:
        meta = r["metadata"]
        sec_id = f"{meta.get('act')}_{meta.get('section')}"
        if sec_id not in seen_sections:
            seen_sections.add(sec_id)
            unique_sources.append({
                "act": meta.get("act"),
                "section": meta.get("section"),
                "source": meta.get("source"),
                "type": meta.get("doc_type")
            })
            
    # Bundle everything together
    return {
        "draft": parsed_output.get("draft", ""),
        "simplified_explanation": parsed_output.get("simplified_explanation", ""),
        "sources": unique_sources
    }
