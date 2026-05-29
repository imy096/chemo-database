import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Leaf,
  FlaskConical,
  Target,
  BookOpen,
  Database,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

type SearchType = 'all' | 'plant' | 'compound' | 'target' | 'publication' | 'module';

type SearchResult = {
  type: 'plant' | 'compound' | 'target' | 'publication' | 'module';
  title: string;
  subtitle: string;
  path: string;
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchType>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/explore', label: 'Explore' },
    { path: '/plants', label: 'Plants' },
    { path: '/compounds', label: 'Compounds' },
    { path: '/therapeutics', label: 'Therapeutics' },
    { path: '/targets', label: 'Targets' },
    { path: '/signatures', label: 'Signatures' },
    { path: '/publications', label: 'Publications' },
    { path: '/graph', label: 'Graph' },
    { path: '/data-access', label: 'Data Access' },
    { path: '/lab', label: 'Research Lab' },
    { path: '/collaborate', label: 'Collaborate' },
    { path: '/admin-collaboration-review', label: 'Review Center' },
  ];

  const filters: { key: SearchType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'plant', label: 'Plants' },
    { key: 'compound', label: 'Compounds' },
    { key: 'target', label: 'Targets' },
    { key: 'publication', label: 'Publications' },
    { key: 'module', label: 'Modules' },
  ];

  const moduleResults: SearchResult[] = [
    { type: 'module', title: 'Plants Explorer', subtitle: 'Medicinal plants, taxonomy, botanical records', path: '/plants' },
    { type: 'module', title: 'Compounds Explorer', subtitle: 'Phytochemicals, structures, identifiers, properties', path: '/compounds' },
    { type: 'module', title: 'Targets Explorer', subtitle: 'Molecular targets and interaction evidence', path: '/targets' },
    { type: 'module', title: 'Therapeutics Explorer', subtitle: 'Therapeutic and ethnobotanical concepts', path: '/therapeutics' },
    { type: 'module', title: 'Biological Signatures', subtitle: 'LINCS, GEO, and biological evidence', path: '/signatures' },
    { type: 'module', title: 'Publications', subtitle: 'Scientific literature and references', path: '/publications' },
    { type: 'module', title: 'Knowledge Graph', subtitle: 'Plant-compound-target relationships', path: '/graph' },
    { type: 'module', title: 'Data Access', subtitle: 'API, JSON, exports, data access', path: '/data-access' },
    { type: 'module', title: 'Research Lab', subtitle: 'Explainable chemogenomic workspace', path: '/lab' },
  ];

  const updateScrollButtons = () => {
    const el = navRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = navRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  useEffect(() => {
    updateScrollButtons();
  }, [location.pathname]);

  useEffect(() => {
    const q = searchQuery.trim();

    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      const lower = q.toLowerCase();

      const localModules =
        searchFilter === 'all' || searchFilter === 'module'
          ? moduleResults.filter(
              (item) =>
                item.title.toLowerCase().includes(lower) ||
                item.subtitle.toLowerCase().includes(lower)
            )
          : [];

      try {
        const requests: Promise<any[]>[] = [];

        if (searchFilter === 'all' || searchFilter === 'plant') {
          requests.push(safeFetch(`/api/plants?q=${encodeURIComponent(q)}&limit=6`));
        } else {
          requests.push(Promise.resolve([]));
        }

        if (searchFilter === 'all' || searchFilter === 'compound') {
          requests.push(safeFetch(`/api/compounds?q=${encodeURIComponent(q)}&limit=6`));
        } else {
          requests.push(Promise.resolve([]));
        }

        if (searchFilter === 'all' || searchFilter === 'target') {
          requests.push(safeFetch(`/api/targets?q=${encodeURIComponent(q)}&limit=6`));
        } else {
          requests.push(Promise.resolve([]));
        }

        if (searchFilter === 'all' || searchFilter === 'publication') {
          requests.push(safeFetch(`/api/publications?q=${encodeURIComponent(q)}&limit=6`));
        } else {
          requests.push(Promise.resolve([]));
        }

        const [plants, compounds, targets, publications] = await Promise.all(requests);

        const plantResults: SearchResult[] = plants.map((row: any) => ({
          type: 'plant',
          title: row.plant_name_raw || row.scientific_name || row.plant_id || 'Plant record',
          subtitle: [row.family, row.genus, row.species].filter(Boolean).join(' • ') || 'Plant record',
          path: row.plant_id ? `/plants/${encodeURIComponent(row.plant_id)}` : '/plants',
        }));

        const compoundResults: SearchResult[] = compounds.map((row: any) => ({
          type: 'compound',
          title:
            row.compound_name_raw ||
            row.compound_name_normalized ||
            row.name ||
            row.compound_id ||
            'Compound record',
          subtitle: row.pubchem_cid
            ? `PubChem CID: ${row.pubchem_cid}`
            : row.molecular_formula || 'Compound record',
          path: row.compound_id
            ? `/compounds/${encodeURIComponent(row.compound_id)}`
            : '/compounds',
        }));

        const targetResults: SearchResult[] = targets.map((row: any) => ({
          type: 'target',
          title:
            row.display_name ||
            row.gene_name ||
            row.target_external_id ||
            row.target_key ||
            'Target record',
          subtitle: row.target_external_id || row.target_status || 'Target record',
          path: row.target_key
            ? `/targets/${encodeURIComponent(row.target_key)}`
            : '/targets',
        }));

        const publicationResults: SearchResult[] = publications.map((row: any) => ({
          type: 'publication',
          title: row.title || row.publication_title || row.doi || 'Publication record',
          subtitle: [row.year, row.journal, row.doi].filter(Boolean).join(' • ') || 'Publication record',
          path: '/publications',
        }));

        setResults(
          [
            ...localModules,
            ...plantResults,
            ...compoundResults,
            ...targetResults,
            ...publicationResults,
          ].slice(0, 14)
        );
      } catch {
        setResults(localModules.slice(0, 8));
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchQuery, searchFilter]);

  const scrollNav = (dir: 'left' | 'right') => {
    const el = navRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === 'left' ? -260 : 260,
      behavior: 'smooth',
    });
  };

  const openResult = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery('');
    setResults([]);
  };

  const submitSearch = () => {
    const first = results[0];
    if (first) {
      openResult(first.path);
      return;
    }

    const q = searchQuery.trim();
    if (q) {
      navigate('/explore');
      setSearchOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#143f35]">
      <style>
        {`
          .brand-title {
            font-family: Georgia, 'Times New Roman', serif;
          }

          .header-ui {
            font-family: "Segoe UI", Inter, ui-sans-serif, system-ui, sans-serif;
          }

          @keyframes logoFloat {
            0%, 100% { transform: translateY(0px) rotate(-1deg); }
            50% { transform: translateY(-3px) rotate(1deg); }
          }

          .logo-float {
            animation: logoFloat 6s ease-in-out infinite;
          }

          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }

          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      <header className="sticky top-0 z-50 border-b border-[#eadfce] bg-[#fffdf8]/96 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 xl:flex-row xl:items-center xl:justify-between">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <img
                src="/assets/logo_2-removebg-preview.png"
                alt="Portal logo"
                className="logo-float h-14 w-auto object-contain md:h-16"
              />

              <div className="min-w-0">
                <div className="brand-title truncate text-[1.85rem] font-bold leading-tight tracking-tight text-[#143f35] md:text-[2.1rem]">
                  Algeria Phyto-Chem
                </div>
                <div className="header-ui truncate text-[0.82rem] font-medium uppercase tracking-[0.12em] text-[#5f873b] md:text-[0.88rem]">
                  Algerian Chemogenomic Portal
                </div>
              </div>
            </Link>

            <div className="relative w-full xl:max-w-3xl">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8c9875]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitSearch();
                    if (e.key === 'Escape') setSearchOpen(false);
                  }}
                  placeholder="Search by module, plant, compound, target, or publication..."
                  className="header-ui w-full rounded-full border border-[#e4d4c0] bg-white/95 px-12 py-3 text-sm font-normal text-[#143f35] shadow-sm outline-none transition placeholder:text-[#9ca3a0] focus:border-[#9fcf9a] focus:ring-2 focus:ring-[#dff3dc]"
                />
              </div>

              {searchOpen && searchQuery.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] overflow-hidden rounded-3xl border border-[#e4d4c0] bg-white shadow-2xl">
                  <div className="border-b border-stone-100 px-4 py-3">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Search filters
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {filters.map((filter) => (
                        <button
                          key={filter.key}
                          type="button"
                          onClick={() => setSearchFilter(filter.key)}
                          className={
                            searchFilter === filter.key
                              ? 'rounded-full bg-[#d9f7e7] px-3 py-1.5 text-xs font-medium text-[#075c3d] ring-1 ring-emerald-200'
                              : 'rounded-full bg-stone-100 px-3 py-1.5 text-xs font-normal text-stone-600 transition hover:bg-stone-200'
                          }
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-b border-stone-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    {searching ? 'Searching database...' : `${results.length} result(s)`}
                  </div>

                  {results.length === 0 && !searching ? (
                    <div className="px-5 py-6 text-sm text-stone-500">
                      No result found in this filter. Try “All” or another keyword.
                    </div>
                  ) : (
                    <div className="max-h-[420px] overflow-auto p-2">
                      {results.map((item, index) => (
                        <button
                          key={`${item.type}-${item.title}-${index}`}
                          type="button"
                          onClick={() => openResult(item.path)}
                          className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-emerald-50"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                            <ResultIcon type={item.type} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#143f35]">
                              {item.title}
                            </p>
                            <p className="truncate text-xs text-stone-500">
                              {item.subtitle}
                            </p>
                          </div>

                          <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-medium capitalize text-stone-600">
                            {item.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="relative border-t border-[#eadfce] py-2.5">
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollNav('left')}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#e0d0bd] bg-white p-2 shadow-md transition hover:bg-emerald-50"
              >
                <ChevronLeft className="h-4 w-4 text-[#6d5a48]" />
              </button>
            )}

            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollNav('right')}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#e0d0bd] bg-white p-2 shadow-md transition hover:bg-emerald-50"
              >
                <ChevronRight className="h-4 w-4 text-[#6d5a48]" />
              </button>
            )}

            <div
              ref={navRef}
              className="hide-scrollbar header-ui flex flex-nowrap items-center gap-2 overflow-x-auto px-10 whitespace-nowrap"
            >
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={
                      isActive
                        ? 'rounded-full bg-[#d9f7e7] px-4 py-2 text-sm font-medium text-[#075c3d] shadow-sm'
                        : 'rounded-full px-4 py-2 text-sm font-normal text-[#6d5a48] transition hover:bg-[#f3f8ef] hover:text-[#075c3d]'
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-[#d7e6d2] bg-[#12383b] text-white">
        <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="flex items-center gap-4">
                <img
                  src="/assets/logo_2-removebg-preview.png"
                  alt="Portal logo"
                  className="h-14 w-auto object-contain"
                />
                <div>
                  <p className="brand-title text-xl font-bold text-white">
                    Algeria Phyto-Chem
                  </p>
                  <p className="text-sm text-white/75">
                    Chemogenomic research portal
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-white/75">
                Curated Algerian medicinal plants, phytochemicals, biological evidence,
                and reusable research data for discovery-oriented research.
              </p>
            </div>

            <div>
              <h3 className="brand-title text-lg font-bold text-white">Database</h3>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                <li><Link to="/plants" className="hover:text-white">Plants</Link></li>
                <li><Link to="/compounds" className="hover:text-white">Compounds</Link></li>
                <li><Link to="/targets" className="hover:text-white">Targets</Link></li>
                <li><Link to="/signatures" className="hover:text-white">Signatures</Link></li>
                <li><Link to="/publications" className="hover:text-white">Publications</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="brand-title text-lg font-bold text-white">Research tools</h3>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                <li><Link to="/graph" className="hover:text-white">Knowledge Graph</Link></li>
                <li><Link to="/data-access" className="hover:text-white">Data Access</Link></li>
                <li><Link to="/lab" className="hover:text-white">Research Lab</Link></li>
                <li><Link to="/collaborate" className="hover:text-white">Collaborate</Link></li>
                <li><Link to="/admin-collaboration-review" className="hover:text-white">Review Center</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="brand-title text-lg font-bold text-white">Portal information</h3>
              <p className="mt-4 text-sm leading-7 text-white/75">
                Designed to support evidence-based natural product research and
                chemogenomic exploration.
              </p>

              <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-semibold text-white">Status</p>
                <p className="mt-1 text-sm text-white/75">
                  Portal online and accessible
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/15 pt-6 text-sm text-white/65">
            © 2026 Algerian Chemogenomic Phytochemical Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

async function safeFetch(url: string): Promise<any[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();

    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.results)) return json.results;

    return [];
  } catch {
    return [];
  }
}

function ResultIcon({ type }: { type: SearchResult['type'] }) {
  if (type === 'plant') return <Leaf className="h-5 w-5" />;
  if (type === 'compound') return <FlaskConical className="h-5 w-5" />;
  if (type === 'target') return <Target className="h-5 w-5" />;
  if (type === 'publication') return <BookOpen className="h-5 w-5" />;
  if (type === 'module') return <Database className="h-5 w-5" />;

  return <Search className="h-5 w-5" />;
}