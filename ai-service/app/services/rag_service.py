"""
app/services/rag_service.py
────────────────────────────
Handles general Legal Q&A using Retrieval-Augmented Generation (RAG).
Uses LangChain Runnables (LCEL) for high performance execution.
"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.services.llm_service import resilient_llm
from app.db.vector_store import search_legal_context, format_context_for_prompt
from app.core.config import settings

# ── Define the System Prompt ──────────────────────────────────────────
# This prompt forces the LLM to rely strictly on retrieved context.
RAG_PROMPT_TEMPLATE = """You are NYAYA, an AI legal assistant for Indian citizens.

Answer the user's question based strictly on the provided legal context. 
If the context does not contain the answer, explicitly state: "I cannot provide a definitive answer based on the provided legal context." 
Do NOT invent or hallucinate laws.

For EVERY response, you MUST structure your answer exactly like this:

## ⚖️ Legal Answer
[Provide the formal legal answer. Cite specific sections (e.g., BNS, IPC) if available in the context. Use proper legal terminology.]

## 📖 Simple Explanation (सरल भाषा में)
[Explain the exact same thing in EXTREMELY simple, everyday language that anyone can understand. Do NOT use any legal jargon here. Explain it like you are talking to a friend.]

## 🔜 What To Do Next
[Give 2-3 actionable steps the person can take based on their situation, like 'Go to the police station' or 'Consult a lawyer'.]

Context from Indian Law Database:
{context}

User's Question:
{question}
"""

prompt = ChatPromptTemplate.from_template(RAG_PROMPT_TEMPLATE)
output_parser = StrOutputParser()

# ── Construct the LCEL Chain ─────────────────────────────────────────
# This is a highly optimized LangChain Runnable. 
# It expects a dictionary payload: {"context": str, "question": str}
rag_chain = prompt | resilient_llm | output_parser


async def query_legal_assistant(question: str) -> dict:
    """
    Executes the full RAG pipeline:
    1. Retrieves relevant legal chunks from ChromaDB.
    2. Formats chunks into a context string.
    3. Invokes the LCEL chain to get the AI response.
    
    Returns both the generated text and the exact source metadata 
    so the frontend can display legal citations.
    """
    
    # 1. Retrieve (Get top 5 most relevant chunks from the 9000+ we ingested)
    raw_results = search_legal_context(
        query=question, 
        top_k=settings.RETRIEVAL_TOP_K
    )
    
    # 2. Format Context
    context_text = format_context_for_prompt(raw_results)
    
    # 3. Generate Answer
    answer = await rag_chain.ainvoke({
        "context": context_text,
        "question": question
    })
    
    # 4. Extract Sources (Removing duplicate sections if multiple chunks came from the same section)
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
            
    return {
        "answer": answer,
        "sources": unique_sources
    }
