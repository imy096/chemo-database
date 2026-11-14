from fastapi import APIRouter, HTTPException
router = APIRouter()
NOTE = "A separate curated gene catalogue is not installed. Protein interaction identifiers remain available through the Targets module."

@router.get("/")
def list_genes():
    return {"data": [], "available": False, "note": NOTE}

@router.get("/{gene_id}")
def gene_detail(gene_id: str):
    raise HTTPException(404, NOTE)

@router.get("/{gene_id}/pathways")
@router.get("/{gene_id}/signatures")
def gene_links(gene_id: str):
    return {"data": [], "available": False, "note": NOTE}
