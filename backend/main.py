from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import requests
import json
import re
import importlib

# =========================
# LOAD ENV
# =========================
PROJECT_ROOT = Path(__file__).resolve().parent
load_dotenv(PROJECT_ROOT / ".env")

# =========================
# FASTAPI APP
# =========================
app = FastAPI(
    title="Algerian Chemogenomic Phytochemical Database API",
    description="API for the National Algerian Chemogenomic Phytochemical Database",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# SAFE ROUTER LOADER
# =========================
def include_api_router(module_name: str, prefix: str, tags: List[str]) -> None:
    """
    Safely imports and includes an API router.
    If the module/file does not exist, the app will continue running.
    """
    try:
        module = importlib.import_module(f"api.{module_name}")

        if hasattr(module, "router"):
            app.include_router(
                module.router,
                prefix=prefix,
                tags=tags,
            )
            print(f"Loaded router: api.{module_name}")
        else:
            print(f"Skipped api.{module_name}: no router found")

    except ModuleNotFoundError as e:
        # Skip only if the missing module is the route file itself
        if e.name == f"api.{module_name}":
            print(f"Skipped missing router: api.{module_name}")
        else:
            raise

    except ImportError as e:
        print(f"Skipped api.{module_name} because of import error: {e}")


# =========================
# ROUTERS
# =========================
include_api_router("plants", "/api/plants", ["Plants"])
include_api_router("compounds", "/api/compounds", ["Compounds"])
include_api_router("genes", "/api/genes", ["Genes"])
include_api_router("pathways", "/api/pathways", ["Pathways"])
include_api_router("diseases", "/api/diseases", ["Diseases"])
include_api_router("search", "/api/search", ["Search"])

# Optional routers. If files are missing, backend will not crash.
include_api_router("admin", "/api/admin", ["Admin"])
include_api_router("analytics", "/api/analytics", ["Analytics"])
include_api_router("graph", "/api/graph", ["Knowledge Graph"])
include_api_router("signatures", "/api/signatures", ["Transcriptomic Signatures"])
include_api_router("publications", "/api/publications", ["Publications"])
include_api_router("therapeutics", "/api/therapeutics", ["Therapeutics"])
include_api_router("collaboration", "/api/collaboration", ["Collaboration"])
include_api_router("admin_collaboration", "/api/admin-collaboration", ["Admin Collaboration"])
include_api_router("targets", "/api/targets", ["Targets"])
include_api_router("submission_validation", "/api/submission-validation", ["Submission Validation"])
include_api_router("curation", "/api/curation", ["Curation"])

# =========================
# ROOT
# =========================
@app.get("/")
async def root():
    return {
        "message": "Algerian Chemogenomic Phytochemical Database API",
        "docs": "/api/docs",
        "version": "1.0.0",
    }

# =========================
# HEALTH CHECK
# =========================
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Algerian Chemogenomic Database API",
    }

# =========================
# CHATBOT
# =========================
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None


def _safe_get(url: str, params: Optional[Dict[str, Any]] = None) -> Any:
    try:
        response = requests.get(url, params=params, timeout=12)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {
            "error": str(e),
            "url": url,
            "params": params or {},
        }


def _clip(obj: Any, limit: int = 8000) -> str:
    text = json.dumps(obj, ensure_ascii=False, indent=2)

    if len(text) > limit:
        return text[:limit] + "\n... [truncated]"

    return text


def _extract_json(text: str) -> Dict[str, Any]:
    text = text.strip()

    match = re.search(r"\{.*\}", text, flags=re.DOTALL)

    if not match:
        return {}

    try:
        return json.loads(match.group(0))
    except Exception:
        return {}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    return {
        "answer": "Chat system active.",
        "message": req.message,
    }

# =========================
# START SERVER
# =========================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False,
    )
