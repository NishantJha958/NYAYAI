"""
app/services/llm_service.py
────────────────────────────
Initializes and configures our LLMs using LangChain.
Implements a highly resilient fallback chain using LCEL (LangChain Expression Language).
If Gemini fails (rate limit, downtime), it instantly falls back to Groq, then Mistral.

Usage:
    from app.services.llm_service import resilient_llm
    
    # resilient_llm is a Runnable. You can invoke it directly or use it in chains.
    response = await resilient_llm.ainvoke("What is BNS Section 406?")
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_mistralai import ChatMistralAI
from langchain_core.language_models.chat_models import BaseChatModel
from app.core.config import settings


def get_gemini_llm() -> BaseChatModel:
    """Primary LLM: Fast, highly capable."""
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2, # Low temp for factual legal answers
        max_retries=1,   # Don't retry endlessly, failover quickly
    )

def get_groq_llm() -> BaseChatModel:
    """Fallback 1: Groq (Llama 3) - Extremely fast."""
    return ChatGroq(
        model=settings.GROQ_MODEL,
        groq_api_key=settings.GROQ_API_KEY,
        temperature=0.2,
        max_retries=1,
    )

def get_mistral_llm() -> BaseChatModel:
    """Fallback 2: Mistral - Reliable backup."""
    return ChatMistralAI(
        model=settings.MISTRAL_MODEL,
        mistral_api_key=settings.MISTRAL_API_KEY,
        temperature=0.2,
        max_retries=1,
    )

# ── Build the LCEL Fallback Runnable ───────────────────────────
# LangChain Runnables natively support fallbacks. 
# If 'gemini' throws an exception, it instantly routes to 'groq', and then 'mistral'.
# This makes our AI pipeline practically unkillable.

gemini = get_gemini_llm()
groq = get_groq_llm()
mistral = get_mistral_llm()

# Create the resilient runnable chain
resilient_llm = gemini.with_fallbacks(
    fallbacks=[groq, mistral],
    # Optional: We can add exception types here if we only want to fallback on specific errors,
    # but by default it falls back on any exception (rate limits, timeouts, API errors).
)
