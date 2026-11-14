"""Server-verified access control for curation and private submissions."""

import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from backend.database import get_db

bearer = HTTPBearer(auto_error=False)


def require_curator(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Sign in with a curator account.", headers={"WWW-Authenticate": "Bearer"})
    try:
        user = get_db().auth.get_user(credentials.credentials).user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session.", headers={"WWW-Authenticate": "Bearer"})
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")
    # Only server-managed app_metadata or an explicit server allowlist grants
    # privileges. user_metadata is editable by the account and is never trusted.
    metadata = user.app_metadata or {}
    allowed_ids = {item.strip() for item in os.getenv("CURATOR_USER_IDS", "").split(",") if item.strip()}
    if metadata.get("role") not in {"admin", "curator"} and str(user.id) not in allowed_ids:
        raise HTTPException(status_code=403, detail="This account does not have curator access.")
    return user
