"""GET /network — live-only network + camera metrics."""
from typing import Optional
from fastapi import APIRouter, Query, Depends

from app.routers.system_info import _resolve
from app.security import verify_dashboard_auth

router = APIRouter(tags=["network"])


@router.get("/network")
def get_network(device_id: Optional[str] = Query(None), _auth=Depends(verify_dashboard_auth)):
    live = _resolve(device_id)
    return {
        "network": live.get("network", {}),
        "cameras": live.get("cameras", []),
    }
