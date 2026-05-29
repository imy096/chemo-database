import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  Leaf,
  FlaskConical,
  HeartPulse,
  Target,
  Dna,
  BookOpen,
  Network,
  Database,
  Users,
  ClipboardCheck,
  Beaker,
} from 'lucide-react';

const items = [
  {
    title: 'Plants',
    desc: 'Explore Algerian medicinal plants, taxonomy, distribution, and linked data.',
    details:
      'This module contains curated Algerian medicinal plant records with taxonomy, family, genus, species information, and links to reported phytochemicals.',
    to: '/plants',
    icon: Leaf,
    color: 'emerald',
    art: 'plants',
  },
  {
    title: 'Compounds',
    desc: 'Browse phytochemicals, chemical identifiers, structures, and properties.',
    details:
      'This module stores phytochemical compounds with identifiers such as PubChem CID, SMILES, InChIKey, molecular formula, molecular weight, and chemical descriptors.',
    to: '/compounds',
    icon: FlaskConical,
    color: 'amber',
    art: 'compounds',
  },
  {
    title: 'Therapeutics',
    desc: 'Explore normalized therapeutic concepts and ethnobotanical evidence.',
    details:
      'This module summarizes therapeutic and ethnobotanical concepts derived from medicinal plant evidence while keeping traditional-use evidence separate from molecular evidence.',
    to: '/therapeutics',
    icon: HeartPulse,
    color: 'teal',
    art: 'therapeutics',
  },
  {
    title: 'Targets',
    desc: 'Discover molecular targets, interactions, and supporting evidence.',
    details:
      'This module presents molecular targets connected to compounds through interaction resources and biological enrichment outputs.',
    to: '/targets',
    icon: Target,
    color: 'purple',
    art: 'targets',
  },
  {
    title: 'Signatures',
    desc: 'Explore biological signatures and expression-based evidence.',
    details:
      'This module connects compounds to gene-expression signatures, perturbational evidence, GEO studies, and LINCS-style biological response data.',
    to: '/signatures',
    icon: Dna,
    color: 'cyan',
    art: 'signatures',
  },
  {
    title: 'Publications',
    desc: 'Access scientific literature, references, and evidence sources.',
    details:
      'This module preserves literature provenance so plant, compound, activity, and biological evidence can be traced back to scientific sources.',
    to: '/publications',
    icon: BookOpen,
    color: 'sand',
    art: 'publications',
  },
  {
    title: 'Graph',
    desc: 'Visualize and explore relationships across the knowledge network.',
    details:
      'This module provides a graph-based view of relationships between plants, compounds, targets, pathways, and evidence layers.',
    to: '/graph',
    icon: Network,
    color: 'blue',
    art: 'graph',
  },
  {
    title: 'Data Access',
    desc: 'Programmatic access, downloads, and data resources for researchers.',
    details:
      'This module explains access to structured data, downloadable outputs, and reusable resources for reproducible computational analysis.',
    to: '/data-access',
    icon: Database,
    color: 'green',
    art: 'data',
  },
  {
    title: 'Research Lab',
    desc: 'Use an explainable chemogenomic workspace for hypothesis building.',
    details:
      'This module provides a virtual research workspace where users can select plants, compounds, or targets, inspect evidence, compare candidates, detect evidence gaps, and build mechanistic hypotheses.',
    to: '/lab',
    icon: Beaker,
    color: 'violet',
    art: 'lab',
  },
  {
    title: 'Collaborate',
    desc: 'Contribute data, suggest updates, and collaborate with the community.',
    details:
      'This module allows researchers to submit corrections, missing records, publications, structured files, and collaboration requests.',
    to: '/collaborate',
    icon: Users,
    color: 'teal',
    art: 'collaborate',
  },
  {
    title: 'Review Center',
    desc: 'Review and manage submitted contributions and reports.',
    details:
      'This administrative module supports review of submitted contributions, curation requests, correction reports, and pending collaboration materials.',
    to: '/admin-collaboration-review',
    icon: ClipboardCheck,
    color: 'stone',
    art: 'review',
  },
];

const colors: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  violet: 'bg-violet-100 text-violet-800 border-violet-200',
  sand: 'bg-orange-100 text-orange-800 border-orange-200',
  stone: 'bg-stone-100 text-stone-700 border-stone-200',
};

const soft: Record<string, string> = {
  emerald: 'from-emerald-50 via-white to-lime-50',
  amber: 'from-amber-50 via-white to-yellow-50',
  teal: 'from-teal-50 via-white to-cyan-50',
  purple: 'from-purple-50 via-white to-violet-50',
  cyan: 'from-cyan-50 via-white to-teal-50',
  blue: 'from-blue-50 via-white to-sky-50',
  green: 'from-green-50 via-white to-emerald-50',
  violet: 'from-violet-50 via-white to-purple-50',
  sand: 'from-orange-50 via-white to-amber-50',
  stone: 'from-stone-50 via-white to-amber-50',
};

function ModuleArt({ type, color }: { type: string; color: string }) {
  const stroke =
    color === 'purple' || color === 'violet'
      ? '#a78bfa'
      : color === 'blue'
      ? '#60a5fa'
      : color === 'cyan'
      ? '#5cc7c7'
      : color === 'amber' || color === 'sand' || color === 'stone'
      ? '#d6a94f'
      : '#68b99f';

  return (
    <svg
      className="pointer-events-none absolute right-20 top-1/2 hidden h-28 w-[430px] -translate-y-1/2 opacity-35 md:block"
      viewBox="0 0 430 112"
      fill="none"
    >
      {type === 'plants' && (
        <>
          <path d="M70 88C138 34 216 28 330 72" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M142 66C118 34 136 12 174 20C178 54 166 72 142 66Z" fill={stroke} opacity=".35" />
          <path d="M220 55C202 25 226 8 258 18C260 50 244 66 220 55Z" fill={stroke} opacity=".28" />
          <path d="M286 68C270 40 292 22 326 30C326 62 310 78 286 68Z" fill={stroke} opacity=".24" />
          <path d="M118 80C106 56 122 42 148 48" stroke={stroke} strokeWidth="2" opacity=".75" />
        </>
      )}

      {type === 'compounds' && (
        <>
          <path d="M80 56L130 28L180 56L180 92L130 104L80 76V56Z" stroke={stroke} strokeWidth="2.5" />
          <path d="M130 28V104M80 56L130 84L180 56" stroke={stroke} strokeWidth="2" opacity=".75" />
          <circle cx="222" cy="42" r="10" stroke={stroke} strokeWidth="2.5" />
          <circle cx="278" cy="72" r="10" stroke={stroke} strokeWidth="2.5" />
          <circle cx="338" cy="44" r="10" stroke={stroke} strokeWidth="2.5" />
          <path d="M232 46L268 67M288 68L328 49" stroke={stroke} strokeWidth="2.5" />
          <path d="M214 74L194 96M346 36L366 18" stroke={stroke} strokeWidth="2" opacity=".7" />
        </>
      )}

      {type === 'therapeutics' && (
        <>
          <path d="M210 82C162 48 156 18 186 10C202 6 214 20 220 34C228 20 242 6 260 12C292 24 278 58 230 90L220 98L210 82Z" stroke={stroke} strokeWidth="3" />
          <path d="M220 38V70M204 54H236" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M74 74C112 40 144 44 174 66M270 66C312 40 350 44 386 74" stroke={stroke} strokeWidth="2" opacity=".65" />
        </>
      )}

      {type === 'targets' && (
        <>
          <circle cx="220" cy="56" r="42" stroke={stroke} strokeWidth="2.5" />
          <circle cx="220" cy="56" r="24" stroke={stroke} strokeWidth="2.5" />
          <circle cx="220" cy="56" r="8" fill={stroke} opacity=".65" />
          <path d="M220 14V0M220 112V98M178 56H150M290 56H262" stroke={stroke} strokeWidth="2.5" />
          <circle cx="86" cy="74" r="8" fill={stroke} opacity=".3" />
          <circle cx="120" cy="46" r="8" fill={stroke} opacity=".3" />
          <circle cx="350" cy="40" r="8" fill={stroke} opacity=".3" />
          <path d="M94 70L120 46L178 56M262 56L350 40" stroke={stroke} strokeWidth="2" opacity=".65" />
        </>
      )}

      {type === 'signatures' && (
        <>
          <path d="M70 22C150 90 250 90 350 22" stroke={stroke} strokeWidth="3" />
          <path d="M70 90C150 22 250 22 350 90" stroke={stroke} strokeWidth="3" />
          {[110, 155, 200, 245, 290, 335].map((x) => (
            <path key={x} d={`M${x} 34L${x} 78`} stroke={stroke} strokeWidth="2" opacity=".75" />
          ))}
          <path d="M372 42L392 42M382 32V52" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}

      {type === 'publications' && (
        <>
          <path d="M160 30C186 20 210 24 226 40V88C204 76 184 76 160 88V30Z" stroke={stroke} strokeWidth="3" />
          <path d="M226 40C244 24 268 20 292 30V88C268 76 248 76 226 88V40Z" stroke={stroke} strokeWidth="3" />
          <path d="M178 44H206M178 58H206M246 44H274M246 58H274" stroke={stroke} strokeWidth="2" opacity=".75" />
          <path d="M82 82C118 50 148 48 160 66M292 66C320 44 354 52 388 82" stroke={stroke} strokeWidth="2" opacity=".6" />
        </>
      )}

      {type === 'graph' && (
        <>
          {[80, 140, 205, 270, 342].map((x, i) => (
            <circle key={x} cx={x} cy={34 + (i % 2) * 44} r="11" fill={stroke} opacity=".34" />
          ))}
          <path d="M91 38L129 74L205 34L270 78L342 34M205 34L342 34M140 78L270 78" stroke={stroke} strokeWidth="2.3" />
          <circle cx="205" cy="34" r="5" fill={stroke} />
          <circle cx="270" cy="78" r="5" fill={stroke} />
        </>
      )}

      {type === 'data' && (
        <>
          <ellipse cx="220" cy="26" rx="54" ry="16" stroke={stroke} strokeWidth="3" />
          <path d="M166 26V82C166 92 190 102 220 102C250 102 274 92 274 82V26" stroke={stroke} strokeWidth="3" />
          <path d="M166 54C166 64 190 74 220 74C250 74 274 64 274 54" stroke={stroke} strokeWidth="2" />
          <path d="M306 34V86M286 68L306 88L326 68" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M86 76C116 48 142 48 164 66" stroke={stroke} strokeWidth="2" opacity=".6" />
        </>
      )}

      {type === 'lab' && (
        <>
          <path d="M170 20H260" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M195 20V54L160 94H270L235 54V20" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
          <path d="M180 78H250" stroke={stroke} strokeWidth="2.5" opacity=".75" />
          <circle cx="198" cy="88" r="5" fill={stroke} opacity=".35" />
          <circle cx="226" cy="84" r="7" fill={stroke} opacity=".3" />
          <path d="M82 76C118 44 142 46 166 68M264 68C302 40 350 44 388 78" stroke={stroke} strokeWidth="2" opacity=".55" />
          <path d="M308 36L326 54L350 26" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".6" />
        </>
      )}

      {type === 'collaborate' && (
        <>
          <path d="M152 60L196 26L230 60L212 82L196 68L180 84L152 60Z" stroke={stroke} strokeWidth="3" />
          <path d="M230 60L268 30L308 62L284 86L268 70L252 86L230 60Z" stroke={stroke} strokeWidth="3" opacity=".85" />
          <path d="M72 82C112 42 140 42 156 60M306 62C338 42 366 52 392 82" stroke={stroke} strokeWidth="2" opacity=".65" />
        </>
      )}

      {type === 'review' && (
        <>
          <rect x="180" y="18" width="92" height="80" rx="10" stroke={stroke} strokeWidth="3" />
          <path d="M204 44L216 56L246 34M204 72L216 84L248 60" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M210 18C212 8 240 8 242 18" stroke={stroke} strokeWidth="3" />
          <path d="M92 84C122 56 150 56 178 76M276 76C310 54 350 56 386 84" stroke={stroke} strokeWidth="2" opacity=".6" />
        </>
      )}
    </svg>
  );
}

export default function Explore() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6">
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isOpen = open === item.title;

          return (
            <article
              key={item.title}
              className={`group relative overflow-hidden rounded-[22px] border border-[#e9dcc8] bg-gradient-to-r ${soft[item.color]} shadow-[0_12px_30px_-26px_rgba(20,60,45,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(20,60,45,0.55)]`}
            >
              <ModuleArt type={item.art} color={item.color} />

              <div className="relative z-10 flex items-center gap-6 px-7 py-4">
                <div
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border shadow-sm ${colors[item.color]}`}
                >
                  <Icon className="h-10 w-10" strokeWidth={1.65} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-[2rem] font-black leading-tight text-[#143f35]">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-base leading-7 text-[#53625e]">
                    {item.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.title)}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition hover:scale-105 ${colors[item.color]}`}
                >
                  {isOpen ? (
                    <ChevronDown className="h-6 w-6" />
                  ) : (
                    <ChevronRight className="h-6 w-6" />
                  )}
                </button>
              </div>

              {isOpen && (
                <div className="relative z-10 border-t border-white/75 px-7 pb-5 pt-3">
                  <div className="rounded-[20px] border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
                    <p className="max-w-5xl text-base leading-8 text-[#415852]">
                      {item.details}
                    </p>

                    <Link
                      to={item.to}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#075c3d] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#064c33]"
                    >
                      Open {item.title}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}