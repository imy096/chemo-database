import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Leaf,
  FlaskConical,
  Dna,
  Network,
  ArrowRight,
  Target,
  FileText,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { api } from '../lib/api';

type StatsResponse = {
  plant_taxon?: number;
  compound?: number;
  gene?: number;
  publication?: number;
  literature_refs?: number;
};

export default function Home() {
  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ['stats'],
    queryFn: api.analytics.stats,
  });

  const statItems = [
    { label: 'Medicinal Plants', value: stats?.plant_taxon || 878, sublabel: 'Curated Algerian flora', icon: Leaf },
    { label: 'Phytochemicals', value: stats?.compound || 5850, sublabel: 'Chemical identifiers', icon: FlaskConical },
    { label: 'Molecular Targets', value: stats?.gene || 3240, sublabel: 'Biological evidence', icon: Target },
    { label: 'Publications', value: stats?.publication || stats?.literature_refs || 1260, sublabel: 'Scientific sources', icon: FileText },
  ];

  return (
    <div className="min-h-screen">
      <style>{`
        .hero-title {
          font-family: Georgia, 'Times New Roman', serif;
        }

        @keyframes softFloat {
          0%, 100% { transform: translateY(0px) scale(1.03); }
          50% { transform: translateY(-8px) scale(1.05); }
        }

        .soft-float {
          animation: softFloat 8s ease-in-out infinite;
        }
      `}</style>

      <section className="relative min-h-[760px] overflow-hidden rounded-[34px] border border-[#e8dccb] bg-gradient-to-br from-[#fffdf8] via-[#fbfcf6] to-[#eef8ec] px-7 py-10 shadow-[0_24px_70px_-40px_rgba(20,60,45,0.45)] md:px-10 lg:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="absolute right-[-160px] bottom-[-160px] h-[460px] w-[460px] rounded-full bg-lime-100/70 blur-3xl" />
        </div>

        {/* Right-side image as BACKGROUND, not separate block */}
        <div className="pointer-events-none absolute bottom-8 right-6 top-20 z-0 hidden w-[58%] overflow-hidden rounded-[32px] lg:block">
          <img
            src="/assets/hero_plant_molecule.png"
            alt=""
            className="soft-float h-full w-full object-contain object-right"
          />
        </div>

        {/* Soft white/cream veil behind text so title stays readable */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[64%] bg-gradient-to-r from-[#fffdf8] via-[#fffdf8]/96 to-[#fffdf8]/18" />

        <div className="relative z-20 max-w-[720px]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Explore. Discover. Advance.
          </div>

          <h1 className="hero-title text-[3rem] font-black uppercase leading-[0.94] tracking-tight text-[#143f35] sm:text-[4rem] lg:text-[4.7rem] xl:text-[5.15rem]">
            Algerian
            <br />
            Chemogenomic
          </h1>

          <h2 className="hero-title mt-2 text-[2.7rem] font-black uppercase leading-[0.94] tracking-tight text-[#5f873b] sm:text-[3.5rem] lg:text-[4.05rem] xl:text-[4.6rem]">
            Phytochemical
            <br />
            Portal
          </h2>

          <div className="mt-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-emerald-800 to-lime-600" />

          <p className="mt-7 max-w-xl text-lg font-semibold leading-8 text-[#243a35] sm:text-xl">
            Curated Algerian medicinal plants, phytochemicals, molecular targets,
            and biological evidence for discovery-oriented research.
          </p>

          <p className="mt-4 max-w-xl text-base leading-8 text-[#61726d]">
            A scientific database connecting Algerian flora, natural products,
            chemical identifiers, target evidence, and reusable research data.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full bg-[#075c3d] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#064c33]"
            >
              Explore portal
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/graph"
              className="inline-flex items-center gap-2 rounded-full border border-[#d9cbb8] bg-white px-6 py-3.5 text-sm font-bold text-[#164236] shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300"
            >
              View network graph
              <Network className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {['Curated', 'Evidence-based', 'Research-ready'].map((x) => (
              <span
                key={x}
                className="rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold text-[#315448]"
              >
                {x}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile image */}
        <div className="relative z-20 mt-10 overflow-hidden rounded-[28px] bg-white/40 lg:hidden">
          <img
            src="/assets/hero_plant_molecule.png"
            alt="Botanical molecule illustration"
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="relative z-20 mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-[#eadcc9] bg-white/95 p-5 shadow-[0_14px_38px_-28px_rgba(24,64,48,0.65)]"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-50 p-3.5">
                  <item.icon className="h-7 w-7 text-emerald-800" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-3xl font-extrabold tracking-tight text-[#163f35]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-base font-bold text-[#164236]">
                    {item.label}
                  </p>
                  <p className="text-sm text-[#61726d]">{item.sublabel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6">
          <h3 className="text-4xl font-bold tracking-tight text-[#153f35]">
            Explore the portal
          </h3>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-[#61726d]">
            Begin with the main scientific entry points: Algerian flora,
            phytochemical compounds, molecular targets, and biological signatures.
          </p>
        </div>

        <div className="grid gap-7 md:grid-cols-3">
          <FeatureCard
            to="/plants"
            title="Plants"
            value={`${stats?.plant_taxon || 878} Plants`}
            description="Browse Algerian medicinal flora with linked compounds, taxonomy, and scientific context."
            image="https://images.pexels.com/photos/4503267/pexels-photo-4503267.jpeg?auto=compress&cs=tinysrgb&w=1200"
            icon={Leaf}
            tone="emerald"
          />

          <FeatureCard
            to="/compounds"
            title="Compounds"
            value={`${stats?.compound || 5850} Compounds`}
            description="Explore phytochemicals, molecular identifiers, linked evidence, and chemical descriptors."
            image="https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1200"
            icon={FlaskConical}
            tone="lime"
          />

          <FeatureCard
            to="/signatures"
            title="Signatures"
            value="Signatures"
            description="Inspect biological signatures and expression-oriented evidence."
            image="https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=1200"
            icon={Dna}
            tone="teal"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  to,
  title,
  value,
  description,
  image,
  icon: Icon,
  tone,
}: {
  to: string;
  title: string;
  value: string;
  description: string;
  image: string;
  icon: LucideIcon;
  tone: 'emerald' | 'lime' | 'teal';
}) {
  const gradients: Record<string, string> = {
    emerald: 'from-emerald-500/90 to-emerald-800/90',
    lime: 'from-lime-500/90 to-emerald-700/90',
    teal: 'from-teal-500/90 to-cyan-700/90',
  };

  return (
    <Link
      to={to}
      className="group overflow-hidden rounded-[28px] border border-[#eadcc9] bg-white shadow-lg transition duration-500 hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className={`relative h-64 overflow-hidden bg-gradient-to-br ${gradients[tone]}`}>
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover opacity-35 mix-blend-overlay transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="absolute left-5 top-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-xl backdrop-blur-md">
          <Icon className="h-8 w-8 text-white" strokeWidth={1.6} />
        </div>

        <div className="absolute bottom-5 right-5 rounded-full bg-white/95 px-5 py-2.5 text-sm font-bold text-[#164236] shadow-xl">
          {value}
        </div>
      </div>

      <div className="p-6">
        <h4 className="text-3xl font-bold text-[#153f35]">{title}</h4>
        <p className="mt-3 text-base leading-7 text-[#61726d]">{description}</p>
      </div>
    </Link>
  );
}