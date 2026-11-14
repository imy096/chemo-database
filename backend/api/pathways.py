from fastapi import APIRouter, HTTPException
router=APIRouter()
NOTE='A standalone curated pathway catalogue is not installed in this data release. Compound-level KEGG annotations remain available on compound records.'

@router.get("/")
def list_records():
    return {"data":[],"available":False,"note":NOTE}

@router.get("/{record_id}")
def get_record(record_id:str):
    raise HTTPException(404,NOTE)

@router.get("/{record_id}/compounds")
def get_compounds(record_id:str):
    return {"data":[],"available":False,"note":NOTE}

@router.get("/{record_id}/plants")
def get_plants(record_id:str):
    return {"data":[],"available":False,"note":NOTE}

@router.get("/{record_id}/genes")
def get_genes(record_id:str):
    return {"data":[],"available":False,"note":NOTE}
