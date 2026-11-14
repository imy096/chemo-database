import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

type Row = Record<string,string | number | null>;
export default function SearchResults() {
  const [params]=useSearchParams();const q=(params.get('q') || '').trim();
  const result=useQuery<Record<string,Row[]>>({queryKey:['global-search',q],queryFn:()=>api.search.global(q),enabled:q.length>=2});
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Search results</h1><p>Results for “{q}”</p>
    {q.length<2 ? <p>Enter at least two characters to search.</p> : result.isLoading ? <p>Searching…</p> : result.isError ? <p role="alert">Search could not be completed. Please retry when the data service is available.</p> : Object.entries(result.data || {}).map(([kind,rows])=><section className="card" key={kind}><h2 className="mb-3 text-xl font-bold capitalize">{kind}</h2>{rows.length ? <ul className="space-y-2">{rows.map((row,index)=>{
      const id=String(row.plant_id || row.compound_id || row.target_key || row.reference_id || '');
      const label=String(row.plant_name_raw || row.compound_name_raw || row.display_name || row.title || id);
      return <li key={`${id}-${index}`}>{kind==='references' ? <span>{label}{row.doi && <a className="ml-2 text-teal-700 underline" href={`https://doi.org/${encodeURIComponent(String(row.doi))}`} target="_blank" rel="noreferrer">DOI</a>}</span> : <Link className="text-teal-700 underline" to={`/${kind}/${encodeURIComponent(id)}`}>{label}</Link>}</li>;
    })}</ul>:<p>No matching records.</p>}</section>)}
  </div>;
}
