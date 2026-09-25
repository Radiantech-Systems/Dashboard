"""GET /system-info — static/live device identity information."""
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, Depends

from app.websocket_manager import latest_store
from app.security import verify_dashboard_auth

router = APIRouter(tags=["system-info"])


def _resolve(device_id: Optional[str]):
    live = latest_store.get(device_id) if device_id else latest_store.first()
    if not live:
        raise HTTPException(status_code=404, detail="No telemetry received yet for this device")
    return live


@router.get("/system-info")
def get_system_info(device_id: Optional[str] = Query(None), _auth=Depends(verify_dashboard_auth)):
    live = _resolve(device_id)
    return live.get("system_info", {})
