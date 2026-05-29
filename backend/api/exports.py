from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
from fastapi import APIRouter, HTTPException, Response, Query
from supabase import create_client
import os
import csv
import io
import json

router = APIRouter(prefix="/api/exports", tags=["exports"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY/SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

TABLES = {
    "plants": "plant_taxon",
    "compounds": "compound",
    "plant_compounds": "plant_compound",
    "targets": "target",
    "signatures": "signature",
}


def fetch_rows(table_name: str, limit: int, offset: int):
    end = offset + limit - 1
    result = (
        supabase
        .table(table_name)
        .select("*")
        .range(offset, end)
        .execute()
    )
    return result.data or []


def rows_to_csv(rows):
    if not rows:
        return "message\nNo rows returned\n"

    output = io.StringIO()
    fieldnames = sorted({key for row in rows for key in row.keys()})
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()

    for row in rows:
        writer.writerow(row)

    return output.getvalue()


@router.get("/{dataset}.csv")
def export_csv(
    dataset: str,
    limit: int = Query(default=1000, ge=1, le=5000),
    offset: int = Query(default=0, ge=0),
):
    if dataset not in TABLES:
        raise HTTPException(status_code=404, detail=f"Dataset not available: {dataset}")

    rows = fetch_rows(TABLES[dataset], limit, offset)
    csv_text = rows_to_csv(rows)

    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{dataset}.csv"'
        },
    )


@router.get("/{dataset}.json")
def export_json(
    dataset: str,
    limit: int = Query(default=1000, ge=1, le=5000),
    offset: int = Query(default=0, ge=0),
):
    if dataset not in TABLES:
        raise HTTPException(status_code=404, detail=f"Dataset not available: {dataset}")

    rows = fetch_rows(TABLES[dataset], limit, offset)

    return Response(
        content=json.dumps(rows, ensure_ascii=False, indent=2, default=str),
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{dataset}.json"'
        },
    )