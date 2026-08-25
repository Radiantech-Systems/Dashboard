"""GET /dashboard — overall device status + quick summary cards."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import verify_api_key
from app.models import Device
from app.websocket_manager import latest_store

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), _auth=Depends(verify_api_key)):
    devices = db.query(Device).all()
    result = []
    for d in devices:
        live = latest_store.get(d.device_id) or {}
        result.append({
            "device_id": d.device_id,
            "device_name": d.device_name,
            "status": d.status,
            "last_seen": d.last_seen,
            "cpu_usage_percent": (live.get("cpu") or {}).get("usage_percent"),
            "gpu_usage_percent": (live.get("gpu") or {}).get("usage_percent"),
            "ram_usage_percent": (live.get("memory") or {}).get("ram_usage_percent"),
            "disk_usage_percent": (live.get("storage") or {}).get("disk_usage_percent"),
            "cpu_temperature_c": (live.get("cpu") or {}).get("temperature_c"),
            "gpu_temperature_c": (live.get("gpu") or {}).get("temperature_c"),
            "fan_rpm": (live.get("cooling") or {}).get("fan_rpm"),
            "power_consumption_mw": (live.get("power") or {}).get("power_consumption_mw"),
            "power_mode": (live.get("power") or {}).get("power_mode"),
        })
    return {"devices": result}
