from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from backend.database import get_db
from backend.query_helpers import literal_search

router = APIRouter()
SEARCH = {
    "plants": ("plant_taxon", ["plant_id","plant_name_raw","genus","family"]),
    "compounds": ("v_compound_master", ["compound_id","compound_name_raw","compound_name_normalized","iupac_name","pubchem_cid"]),
    "targets": ("v_target_summary", ["target_key","display_name","gene_name","target_external_id"]),
    "references": ("reference", ["reference_id","title","authors","journal","doi"]),
}
ALIASES = {"plant":"plants","compound":"compounds","target":"targets","reference":"references"}


@router.get("/")
def global_search(q: str=Query(...,min_length=2,max_length=250),entity_type:Optional[str]=None,limit:int=Query(20,ge=1,le=100)):
    db=get_db(); result={}
    entity_type=ALIASES.get(entity_type,entity_type)
    if entity_type and entity_type not in SEARCH:
        raise HTTPException(422,"Search supports plants, compounds, targets and references in the current data release.")
    value=literal_search(q)
    for key in ([entity_type] if entity_type else SEARCH):
        table,fields=SEARCH[key]
        rows=db.table(table).select("*").or_(",".join(f"{field}.ilike.{value}" for field in fields)).order(fields[0]).limit(limit).execute()
        result[key]=rows.data or []
    return result


@router.get("/autocomplete")
def autocomplete(q:str=Query(...,min_length=1,max_length=250),entity_type:str="plants",limit:int=Query(10,ge=1,le=50)):
    entity_type=ALIASES.get(entity_type,entity_type)
    if entity_type not in SEARCH: raise HTTPException(422,"Unsupported autocomplete entity")
    table,fields=SEARCH[entity_type];value=literal_search(q)
    rows=get_db().table(table).select("*").or_(",".join(f"{field}.ilike.{value}" for field in fields)).order(fields[0]).limit(limit).execute().data or []
    labels={"plants":"plant_name_raw","compounds":"compound_name_raw","targets":"display_name","references":"title"}
    return [{"id":r[fields[0]],"label":r.get(labels[entity_type]) or r[fields[0]]} for r in rows]
