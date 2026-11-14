"""Explicit pagination and literal PostgREST search values."""

from fastapi import HTTPException


def literal_search(value: str) -> str:
    # Quote PostgREST's filter value so punctuation cannot become another
    # filter, and escape LIKE wildcards so a catalogue search stays literal.
    escaped = value.replace('\\', '\\\\').replace('"', '\\"')
    escaped = escaped.replace('%', '\\%').replace('_', '\\_')
    return '"%' + escaped + '%"'


def fetch_all(query_factory, page_size: int = 500, max_rows: int = 100000):
    """Do not confuse a server-capped page with the complete result."""
    rows = []
    while True:
        result = query_factory().range(len(rows), len(rows) + page_size - 1).execute()
        page = result.data or []
        total = result.count
        rows.extend(page)
        if total is not None and len(rows) >= total:
            return rows
        if not page:
            if total is not None and len(rows) < total:
                raise HTTPException(status_code=503, detail="The database result changed or was truncated. Retry the request.")
            return rows
        if len(rows) >= max_rows:
            raise HTTPException(status_code=413, detail="This result is too large for one response. Use a paginated export.")
        # A caller without an exact count needs one final empty page. Never
        # stop merely because the server returned fewer than page_size rows.


def fetch_up_to(query_factory, limit: int, page_size: int = 500):
    rows = []
    total = None
    while len(rows) < limit:
        result = query_factory().range(len(rows), min(limit, len(rows) + page_size) - 1).execute()
        page = result.data or []
        total = result.count
        rows.extend(page)
        if not page or (total is not None and len(rows) >= total): break
    return rows, total
