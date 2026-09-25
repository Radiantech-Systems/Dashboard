from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets

from fastapi import APIRouter, Cookie, HTTPException, Response
from pydantic import BaseModel
from pwdlib import PasswordHash

from app.config import settings


router = APIRouter(prefix="/auth", tags=["authentication"])

password_hash = PasswordHash.recommended()

SESSION_COOKIE = "telemetry_session"
SESSION_MAX_AGE = 8 * 60 * 60  # 8 hours


class LoginRequest(BaseModel):
    username: str
    password: str


# In-memory sessions are intentional for the current single-operator setup.
# Sessions are lost when the backend container restarts.
_sessions: dict[str, datetime] = {}


def _cleanup_sessions() -> None:
    now = datetime.now(timezone.utc)

    expired = [
        session_id
        for session_id, expires_at in _sessions.items()
        if expires_at <= now
    ]

    for session_id in expired:
        _sessions.pop(session_id, None)


def _create_session() -> str:
    _cleanup_sessions()

    session_id = secrets.token_urlsafe(32)

    _sessions[session_id] = (
        datetime.now(timezone.utc)
        + timedelta(seconds=SESSION_MAX_AGE)
    )

    return session_id


def _valid_session(session_id: str | None) -> bool:
    if not session_id:
        return False

    _cleanup_sessions()

    expires_at = _sessions.get(session_id)

    if not expires_at:
        return False

    if expires_at <= datetime.now(timezone.utc):
        _sessions.pop(session_id, None)
        return False

    return True


@router.post("/login")
def login(payload: LoginRequest, response: Response):
    if not settings.AUTH_PASSWORD_HASH:
        raise HTTPException(
            status_code=500,
            detail="Authentication is not configured on the server",
        )

    username_valid = hmac.compare_digest(
        payload.username,
        settings.AUTH_USERNAME,
    )

    password_valid = password_hash.verify(
        payload.password,
        settings.AUTH_PASSWORD_HASH,
    )

    if not username_valid or not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    session_id = _create_session()

    response.set_cookie(
        key=SESSION_COOKIE,
        value=session_id,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
    )

    return {"authenticated": True}


@router.post("/logout")
def logout(
    response: Response,
    telemetry_session: str | None = Cookie(default=None),
):
    if telemetry_session:
        _sessions.pop(telemetry_session, None)

    response.delete_cookie(
        key=SESSION_COOKIE,
        path="/",
    )

    return {"authenticated": False}


@router.get("/me")
def me(
    telemetry_session: str | None = Cookie(default=None),
):
    if not _valid_session(telemetry_session):
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    return {"authenticated": True}


def verify_dashboard_session(
    telemetry_session: str | None = Cookie(default=None),
) -> None:
    if not _valid_session(telemetry_session):
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )
