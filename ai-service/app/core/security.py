"""
app/core/security.py
─────────────────────
Inter-service API key guard.
Protects FastAPI endpoints so only the Node.js backend can call them.

Usage in a route:
    from app.core.security import verify_inter_service_key
    @router.post("/query")
    async def query(request: Request, _: None = Depends(verify_inter_service_key)):
        ...
"""

from fastapi import Header, HTTPException, status
from app.core.config import settings


async def verify_inter_service_key(
    x_inter_service_key: str = Header(
        ...,
        alias="X-Inter-Service-Key",
        description="Shared secret between Node.js and FastAPI"
    )
) -> None:
    """
    FastAPI Dependency — validates the inter-service key header.
    Node.js sends this in every request via aiBridge.js.

    Raises 403 if the key is missing or wrong.
    """
    if x_inter_service_key != settings.INTER_SERVICE_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid inter-service key. Access denied.",
        )
