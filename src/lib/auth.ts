import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let authClient: SupabaseClient | null = null;

export function getAuthClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  authClient ??= createClient(url, key);
  return authClient;
}

export async function getAccessToken() {
  const client = getAuthClient();
  if (!client) return null;
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session?.access_token || null;
}
