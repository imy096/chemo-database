from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
import uuid

from supabase import create_client, Client
from backend.database import get_db

router = APIRouter()


class CollaborationSubmission(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    institution: Optional[str] = None
    contribution_type: str
    message: str


def get_storage_client():
    return get_db()


@router.post("/submit")
async def submit_collaboration(payload: CollaborationSubmission):
    try:
        db = get_db()

        result = db.table("collaboration_submissions").insert({
            "submission_type": "quick_message",
            "full_name": payload.full_name,
            "email": payload.email,
            "institution": payload.institution,
            "title": payload.contribution_type,
            "message": payload.message,
            "status": "pending",
        }).execute()

        return {
            "success": True,
            "message": "Submission created successfully.",
            "data": result.data[0] if result.data else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-file")
async def upload_collaboration_file(
    file: UploadFile = File(...),
    submission_id: str = Form(...),
):
    try:
        allowed_types = {
            "text/csv",
            "application/pdf",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }

        extension = os.path.splitext(file.filename or "")[1].lower()
        if file.content_type not in allowed_types or extension not in {".csv", ".xls", ".xlsx", ".pdf"}:
            raise HTTPException(
                status_code=400,
                detail="Only CSV, XLS, XLSX, and PDF files are allowed.",
            )

        db = get_db()

        submission_check = db.table("collaboration_submissions").select("submission_id,status").eq(
            "submission_id", submission_id
        ).limit(1).execute()

        if not submission_check.data:
            raise HTTPException(status_code=404, detail="Submission not found.")

        max_size = 10 * 1024 * 1024
        file_bytes = await file.read(max_size + 1)
        if len(file_bytes) > max_size:
            raise HTTPException(413, "The upload exceeds the 10 MB limit.")
        if not file_bytes:
            raise HTTPException(422, "The uploaded file is empty.")
        file_size = len(file_bytes)

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        random_id = uuid.uuid4().hex[:8]
        import re
        safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", (file.filename or "upload").replace("\\", "/").split("/")[-1])
        storage_path = f"{submission_id}/{timestamp}_{random_id}_{safe_name}"

        supabase = get_storage_client()

        supabase.storage.from_("collaboration-uploads").upload(
            storage_path,
            file_bytes,
            {"content-type": file.content_type}
        )

        result = db.table("submission_files").insert({
            "submission_id": submission_id,
            "original_filename": file.filename,
            "storage_path": storage_path,
            "mime_type": file.content_type,
            "file_size": file_size,
        }).execute()

        return {
            "success": True,
            "message": "File uploaded successfully and linked to pending submission.",
            "data": result.data[0] if result.data else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
