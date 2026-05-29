import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env.bak", override=True)

_supabase_client: Client | None = None


def get_db() -> Client:
    global _supabase_client

    if _supabase_client is None:
        supabase_url = (os.getenv("SUPABASE_URL") or "").strip()
        supabase_key = (os.getenv("SUPABASE_KEY") or "").strip()

        if not supabase_url:
            raise RuntimeError("Missing SUPABASE_URL")

        if not supabase_key:
            raise RuntimeError("Missing SUPABASE_KEY")

        _supabase_client = create_client(supabase_url, supabase_key)

    return _supabase_client


def get_supabase_admin_client() -> Client:
    return get_db()