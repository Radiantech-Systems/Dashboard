"""
FastAPI application entrypoint.

- Creates DB tables on startup (idempotent; init.sql also does this for
  first-boot via docker-compose, this covers bare `uvicorn` runs too).
- Registers all REST routers.
- Exposes the /ws/telemetry WebSocket endpoint the dashboard connects to.
- Runs a background task that marks devices "offline" if no telemetry
  has arrived within DEVICE_OFFLINE_TIMEOUT_SECONDS.
"""
import asyncio
import os
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models import Device, PowerEvent
from app.websocket_manager import manager
from app.auth import router as auth_router, _valid_session
from app.logger import get_logger

from app.routers import (
    telemetry,
    dashboard,
    system_info,
    performance,
    power,
    network,
    temperature,
    footage,
    ai_snapshots,
)

logger = get_logger("main")


async def _offline_watcher():
    """Background loop: flips device.status to 'offline' if last_seen is stale."""
    while True:
        try:
            db = SessionLocal()
            cutoff = datetime.now(timezone.utc).timestamp() - settings.DEVICE_OFFLINE_TIMEOUT_SECONDS
            devices = db.query(Device).filter(Device.status == "online").all()
            for d in devices:
                if d.last_seen and d.last_seen.timestamp() < cutoff:
                    d.status = "offline"
                    db.add(PowerEvent(
                        device_id=d.device_id,
                        event_type="power_off",
                        reason=f"No telemetry received for over {settings.DEVICE_OFFLINE_TIMEOUT_SECONDS}s "
                               f"(device likely lost power, network, or crashed — no graceful shutdown signal received)",
                    ))
                    logger.warning(f"Device {d.device_id} marked OFFLINE (no telemetry received)")
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"offline_watcher error: {e}")
        await asyncio.sleep(1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured.")
    os.makedirs(settings.FOOTAGE_STORAGE_DIR, exist_ok=True)
    logger.info(f"Footage storage directory ensured at {settings.FOOTAGE_STORAGE_DIR}")
    
    os.makedirs(settings.AI_SNAPSHOT_STORAGE_DIR, exist_ok=True)
    logger.info(
       f"AI snapshot storage directory ensured at "
       f"{settings.AI_SNAPSHOT_STORAGE_DIR}" )
    

    task = asyncio.create_task(_offline_watcher())
    yield
    task.cancel()


app = FastAPI(title="Jetson Telemetry Dashboard API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(telemetry.router)
app.include_router(dashboard.router)
app.include_router(system_info.router)
app.include_router(performance.router)
app.include_router(power.router)
app.include_router(network.router)
app.include_router(temperature.router)
app.include_router(footage.router)
app.include_router(ai_snapshots.router)

# Serve recorded clips as static files for the <video> player.
# Not gated by API_KEY (same posture as the MediaMTX HLS stream) —
# only relevant once this is exposed beyond a trusted LAN.
os.makedirs(settings.FOOTAGE_STORAGE_DIR, exist_ok=True)
app.mount("/footage-files", StaticFiles(directory=settings.FOOTAGE_STORAGE_DIR), name="footage-files")

os.makedirs(settings.AI_SNAPSHOT_STORAGE_DIR, exist_ok=True)

app.mount(
    "/ai-snapshot-files",
    StaticFiles(directory=settings.AI_SNAPSHOT_STORAGE_DIR),
    name="ai-snapshot-files",
)

@app.get("/health")
def health():
    return {"status": "ok"}


@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """
    Dashboard WebSocket authentication.

    The browser sends the telemetry_session cookie automatically
    after successful dashboard login.
    """
    telemetry_session = websocket.cookies.get("telemetry_session")

    if not _valid_session(telemetry_session):
        await websocket.close(code=4401)
        return

    await manager.connect(websocket)

    try:
        while True:
            # Dashboard clients don't need to send anything;
            # keep the connection alive and drain client pings.
            await websocket.receive_text()

    except WebSocketDisconnect:
        await manager.disconnect(websocket)

    except Exception:
        await manager.disconnect(websocket)
