"""Authenticated administration over the actual collaboration schema.
Approval records a review decision; it never imports unvalidated scientific rows.
"""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from backend.database import get_db

router=APIRouter()
ALLOWED={"pending","under_review","approved","rejected","needs_revision"}
class SubmissionCreate(BaseModel):
    submission_type: str
    data: dict
    source_type: Optional[str]=None
    source_id: Optional[str]=None
    evidence_level: Optional[str]=None
class SubmissionReview(BaseModel):
    status: str
    review_notes: Optional[str]=None

@router.get("/access")
def access():
    # The router-wide server-verified curator dependency runs first.
    return {"allowed":True}

@router.get("/submissions")
def get_submissions(status:Optional[str]=None,skip:int=Query(0,ge=0),limit:int=Query(50,ge=1,le=200)):
    q=get_db().table("collaboration_submissions").select("*",count="exact")
    if status: q=q.eq("status",status)
    result=q.order("created_at",desc=True).range(skip,skip+limit-1).execute()
    return {"data":result.data or [],"count":len(result.data or []),"total_count":result.count}

@router.get("/submissions/{submission_id}")
def get_submission_detail(submission_id:str):
    result=get_db().table("collaboration_submissions").select("*").eq("submission_id",submission_id).limit(1).execute()
    if not result.data: raise HTTPException(404,"Submission not found")
    return result.data[0]

@router.post("/submissions")
def create_submission(submission:SubmissionCreate):
    import json
    result=get_db().table("collaboration_submissions").insert({"submission_type":submission.submission_type,"title":submission.submission_type,"message":json.dumps(submission.model_dump(),ensure_ascii=False),"status":"pending"}).execute()
    return result.data[0] if result.data else None

@router.patch("/submissions/{submission_id}/review")
def review_submission(submission_id:str,review:SubmissionReview):
    if review.status not in ALLOWED: raise HTTPException(400,"Invalid review status")
    # Store notes in the existing message record rather than inventing a column.
    # Row-level scientific curation and its notes belong to the Review Center.
    if review.review_notes:
        raise HTTPException(422,"Use the Review Center to attach curation notes; this endpoint only records submission status.")
    result=get_db().table("collaboration_submissions").update({"status":review.status}).eq("submission_id",submission_id).execute()
    if not result.data: raise HTTPException(404,"Submission not found")
    return {**result.data[0],"core_data_imported":False}

@router.get("/dashboard")
def get_admin_dashboard():
    db=get_db()
    count=db.table("collaboration_submissions").select("submission_id",count="exact",head=True).eq("status","pending").execute()
    recent=db.table("collaboration_submissions").select("*").order("created_at",desc=True).limit(10).execute()
    return {"pending_count":count.count,"recent_submissions":recent.data or []}
