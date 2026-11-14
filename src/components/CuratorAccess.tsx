import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { getAuthClient } from '../lib/auth';
import { fetchAPI } from '../lib/api';

export default function CuratorAccess({ children }: { children: ReactNode }) {
  const client = getAuthClient();
  const cache = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const access = useQuery({
    queryKey: ['curator-access', session?.user.id],
    queryFn: () => fetchAPI<{ allowed: boolean }>('/admin/access'),
    enabled: Boolean(session),
    retry: false,
  });

  useEffect(() => {
    if (!client) { setLoading(false); return; }
    let active = true;
    client.auth.getSession().then(({ data, error: authError }) => {
      if (!active) return;
      setSession(data.session); setLoading(false);
      if (authError) setError(authError.message);
    });
    const { data } = client.auth.onAuthStateChange((event, nextSession) => {
      if (active) setSession(nextSession);
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') cache.clear();
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [client, cache]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!client) return;
    setBusy(true); setError('');
    try {
      const { error: authError } = await client.auth.signInWithPassword({ email, password });
      if (authError) setError(authError.message);
      setPassword('');
    } finally { setBusy(false); }
  }

  if (loading) return <p>Checking curator session…</p>;
  if (!client) return <div className="card"><h1 className="text-xl font-bold">Curator access is not configured</h1><p className="mt-3">The portal administrator needs to configure sign-in before private review records can be accessed.</p></div>;
  if (!session) return (
    <form onSubmit={signIn} className="card mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Curator sign-in</h1>
      <p>Use your authorised curator account to access submissions and review data.</p>
      <label className="block">Email<input className="mt-1 w-full rounded border p-2" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label className="block">Password<input className="mt-1 w-full rounded border p-2" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="rounded bg-teal-700 px-4 py-2 text-white">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
  return <div><div className="mb-4 flex items-center justify-between"><span>Signed in as {session.user.email}</span><button type="button" onClick={() => { void client.auth.signOut(); }} className="text-teal-700 underline">Sign out</button></div>{access.isPending ? <p>Checking curator access…</p> : access.isError || !access.data?.allowed ? <p role="alert" className="rounded border border-red-200 bg-red-50 p-4">Curator access could not be confirmed. This account may lack permission, or the review service may be unavailable.</p> : children}</div>;
}
