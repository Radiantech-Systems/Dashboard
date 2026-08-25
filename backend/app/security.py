"""
Minimal shared-secret authentication.

Since this dashboard is being exposed to the public internet (via a
tunnel or public IP), every REST call and the WebSocket connection
must present the API key configured in .env. This is intentionally
simple (a single shared key, not per-user accounts) — enough to stop
random internet traffic from reading your telemetry or posting fake
data, without the overhead of a full auth system for a single-operator
dashboard.
"""
from fastapi import Header, HTTPException, Query
from typing import Optional

from app.config import settings


def verify_api_key(x_api_key: Optional[str] = Header(None), api_key: Optional[str] = Query(None)) -> None:
    """Dependency for REST endpoints: checks the X-API-Key header, falling
    back to an ?api_key= query param (needed for the CSV export link,
    which browsers open as a plain navigation with no custom headers)."""
    if not settings.API_KEY:
        return  # auth disabled (local/dev use)
    if x_api_key != settings.API_KEY and api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


def verify_api_key_ws(api_key: Optional[str] = Query(None)) -> bool:
    """For the WebSocket endpoint: checks the ?api_key= query param
    (browsers can't set custom headers on a WebSocket handshake)."""
    if not settings.API_KEY:
        return True
    return api_key == settings.API_KEY
