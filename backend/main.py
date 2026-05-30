```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from dotenv import load_dotenv

# =========================
# LOAD ENV
# =========================
PROJECT_ROOT = Path(__file__).resolve().parent
load_dotenv(PROJECT_ROOT / ".env")

# =========================
# IMPORT API ROUTES
# =========================
from api import (
    plants,
    compounds,
    genes,
    pathways,
    diseases,
    search,
    admin,
    analytics,
    graph,
    signatures,
    publications,
    therapeutics,
    collaboration,
    admin_collaboration,
    targets,
    submission_validation,
    curation,
)

from api.graph import router as graph_router

# =========================
# OTHER IMPORTS
# =========================
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import requests
import json
import re

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
# ROUTERS
# =========================
app.include_router(plants.router, prefix="/api/plants", tags=["Plants"])
app.include_router(compounds.router, prefix="/api/compounds", tags=["Compounds"])
app.include_router(genes.router, prefix="/api/genes", tags=["Genes"])
app.include_router(pathways.router, prefix="/api/pathways", tags=["Pathways"])
app.include_router(diseases.router, prefix="/api/diseases", tags=["Diseases"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(graph.router, prefix="/api/graph", tags=["Knowledge Graph"])
app.include_router(signatures.router, prefix="/api/signatures", tags=["Transcriptomic Signatures"])
app.include_router(publications.router, prefix="/api/publications", tags=["Publications"])
app.include_router(therapeutics.router, prefix="/api/therapeutics", tags=["Therapeutics"])
app.include_router(collaboration.router, prefix="/api/collaboration", tags=["Collaboration"])
app.include_router(graph_router, prefix="/api", tags=["Graph"])
app.include_router(targets.router, prefix="/api/targets", tags=["Targets"])

app.include_router(
    curation.router,
    prefix="/api/curation",
    tags=["Curation"],
)

app.include_router(
    admin_collaboration.router,
    prefix="/api/admin-collaboration",
    tags=["Admin Collaboration"],
)

app.include_router(
    submission_validation.router,
    prefix="/api/submission-validation",
    tags=["Submission Validation"],
)

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
```
