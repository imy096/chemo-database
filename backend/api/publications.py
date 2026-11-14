from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.database import get_db
from backend.query_helpers import literal_search, fetch_all
router=APIRouter()

@router.get("/")
def list_publications(query:Optional[str]=None,year_from:Optional[int]=None,year_to:Optional[int]=None,journal:Optional[str]=None,limit:int=Query(50,ge=1,le=200),offset:int=Query(0,ge=0)):
    q=get_db().table("reference").select("*")
    if query:
        value=literal_search(query)
        q=q.or_(f"title.ilike.{value},authors.ilike.{value},doi.ilike.{value}")
    if year_from is not None: q=q.gte("year",str(year_from))
    if year_to is not None: q=q.lte("year",str(year_to))
    if journal: q=q.ilike("journal",f"%{journal}%")
    return q.order("reference_id").range(offset,offset+limit-1).execute().data or []

@router.get("/stats/overview")
def get_publications_stats():
    result=get_db().rpc("get_acpp_publication_stats").execute()
    return result.data

@router.get("/pubmed/{pubmed_id}")
def get_publication_by_pubmed(pubmed_id:str):
    raise HTTPException(501,"PubMed identifiers are not stored in this reference release. Search by DOI, title or reference ID.")

@router.get("/{reference_id}/related-data")
def get_publication_related_data(reference_id:str):
    db=get_db()
    # These are evidence-level reference links, not measured plant-compound
    # occurrences or molecular interactions.
    result={"reference_id":reference_id}
    for key,table in [("plant_evidence","plant_attribute_reference_link"),("genus_evidence","genus_attribute_reference_link"),("family_evidence","metabolite_family_reference_link")]:
        result[key]=fetch_all(lambda t=table:db.table(t).select("*",count="exact").eq("reference_id",reference_id).order("reference_id"))
    return result

@router.get("/{reference_id}")
def get_publication(reference_id:str):
    result=get_db().table("reference").select("*").eq("reference_id",reference_id).limit(1).execute()
    if not result.data: raise HTTPException(404,"Publication not found")
    return result.data[0]
