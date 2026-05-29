import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  Landmark,
  Leaf,
  Network,
  ShieldCheck,
  Users,
  Sparkles,
  Database,
  Dna,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <style>{`
        .about-title { font-family: Georgia, 'Times New Roman', serif; }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-14px) scale(1.025); }
        }
        @keyframes softPulse {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50% { opacity: 0.28; transform: scale(1.05); }
        }
        .float-logo { animation: floatLogo 7s ease-in-out infinite; }
        .soft-pulse { animation: softPulse 8s ease-in-out infinite; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="soft-pulse absolute left-[-140px] top-32 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="soft-pulse absolute right-[-120px] top-56 h-96 w-96 rounded-full bg-lime-200/30 blur-3xl" />
      </div>

      <section className="relative overflow-hidden rounded-[42px] border border-[#e8dccb] bg-gradient-to-br from-[#fffdf8] via-[#fbfcf6] to-[#eef8ec] px-8 py-14 shadow-[0_28px_80px_-42px_rgba(20,60,45,0.38)] lg:px-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-90px] top-[-120px] h-[320px] w-[320px] rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="absolute bottom-[-150px] right-[-140px] h-[420px] w-[420px] rounded-full bg-lime-100/70 blur-3xl" />
        </div>

        <div className="relative z-10 grid items-center gap-12 xl:grid-cols-[1.02fr_0.98fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800 shadow-sm">
              <Sparkles className="h-4 w-4" />
              About Algeria Phyto-Chem
            </div>

            <h1 className="about-title max-w-4xl text-[3rem] font-black leading-[1.02] tracking-tight text-[#143f35] md:text-[4rem] xl:text-[4.7rem]">
              A scientific platform for Algerian natural product discovery
            </h1>

            <p className="mt-7 max-w-3xl text-xl font-semibold leading-9 text-[#243a35]">
              The Algerian Chemogenomic Phytochemical Portal connects medicinal
              plants, phytochemicals, biological evidence, molecular targets, and
              reusable research data in one integrated environment.
            </p>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#61726d]">
              It helps transform scattered literature, chemical repositories,
              biological datasets, and curated expertise into structured,
              searchable, and interpretable knowledge.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/explore" className="inline-flex items-center gap-2 rounded-full bg-[#075c3d] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#064c33]">
                Explore portal
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link to="/graph" className="inline-flex items-center gap-2 rounded-full border border-[#d9cbb8] bg-white px-6 py-3.5 text-sm font-bold text-[#164236] shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300">
                View knowledge graph
                <Network className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-[34px] bg-white/30">
            <img src="/assets/logo.png" alt="Algeria Phyto-Chem" className="float-logo w-[560px] max-w-none object-contain drop-shadow-[0_30px_45px_rgba(20,60,45,0.20)]" onError={(e) => {(e.currentTarget as HTMLImageElement).style.display = 'none';}} />
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[38px] bg-[#12383b] p-9 text-white shadow-xl">
          <h2 className="about-title text-4xl font-black tracking-tight">Why this portal matters</h2>
          <p className="mt-6 text-lg leading-9 text-white/80">
            Algerian medicinal-plant knowledge is scientifically valuable, but it is
            often distributed across articles, chemical databases, transcriptomic
            resources, and local expertise. This portal organizes those layers into
            a usable research system.
          </p>
          <p className="mt-5 text-lg leading-9 text-white/80">
            The goal is to support discovery, institutional visibility, research
            prioritization, transparent evidence review, and reproducible reuse of
            curated phytochemical data.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <ValueBlock icon={Leaf} title="Research" text="Explore links between medicinal plants, compounds, and biological evidence." />
          <ValueBlock icon={Landmark} title="Leadership" text="Support institutions with a structured view of national scientific resources." />
          <ValueBlock icon={Network} title="Discovery" text="Reveal relationships, gaps, and candidate hypotheses for future validation." />
        </div>
      </section>

      <section className="mt-12 overflow-hidden rounded-[38px] border border-[#e8dccb] bg-white/90 p-9 shadow-xl">
        <div className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#5f873b]">Knowledge integration</p>
            <h2 className="about-title mt-4 text-4xl font-black tracking-tight text-[#143f35]">
              From biodiversity to biological interpretation
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#61726d]">
              The portal is not a static catalogue. It is organized as connected
              scientific layers that allow users to move from plants to compounds,
              from compounds to targets and signatures, and from records to
              relationship-level exploration.
            </p>
          </div>

          <div className="space-y-4">
            <LayerRow icon={Leaf} title="Plant knowledge" text="Medicinal flora, taxonomy, botanical context, and linked natural products." />
            <LayerRow icon={FlaskConical} title="Chemical knowledge" text="Phytochemicals, identifiers, descriptors, and compound-level evidence." />
            <LayerRow icon={Dna} title="Biological evidence" text="Targets, transcriptomic signatures, GEO/LINCS evidence, and pathway context." />
            <LayerRow icon={BookOpen} title="Literature provenance" text="References, source records, publications, and evidence traceability." />
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 xl:grid-cols-2">
        <LargePanel icon={ShieldCheck} title="Evidence transparency" text="The portal distinguishes evidence types instead of treating all records as equal. Some information is experimentally measured, some is computationally inferred, and some is contextual or literature-based. This reduces overclaiming and makes interpretation clearer." />
        <LargePanel icon={Users} title="Collaboration and partners" text="The platform is prepared to document participating universities, laboratories, supervisors, curators, pharmacologists, chemists, bioinformaticians, institutional partners, and funding bodies." note="Add confirmed collaborators and affiliations here once the final list is validated." />
      </section>

      <section className="mt-12 rounded-[38px] bg-gradient-to-r from-[#12383b] via-[#174b4f] to-[#5f873b] p-9 text-white shadow-xl">
        <h2 className="about-title text-4xl font-black tracking-tight">Intended impact</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Impact icon={Database} title="For researchers" text="Faster exploration of organized plant, compound, target, and evidence relationships." />
          <Impact icon={Landmark} title="For institutions" text="A structured digital resource supporting visibility, planning, and collaboration." />
          <Impact icon={Sparkles} title="For discovery" text="A foundation for hypothesis generation, candidate prioritization, and future validation." />
        </div>
      </section>
    </div>
  );
}

function ValueBlock({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-[32px] border border-[#e8dccb] bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-6 inline-flex rounded-2xl bg-emerald-50 p-4"><Icon className="h-7 w-7 text-emerald-800" strokeWidth={1.8} /></div>
      <h3 className="about-title text-2xl font-black text-[#143f35]">{title}</h3>
      <p className="mt-4 text-base leading-8 text-[#61726d]">{text}</p>
    </div>
  );
}

function LayerRow({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex items-start gap-5 rounded-[28px] border border-[#e8dccb] bg-gradient-to-r from-emerald-50 via-white to-lime-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
      <div className="rounded-2xl bg-white p-4 shadow-sm"><Icon className="h-6 w-6 text-emerald-800" strokeWidth={1.8} /></div>
      <div>
        <h3 className="about-title text-xl font-black text-[#143f35]">{title}</h3>
        <p className="mt-2 text-base leading-7 text-[#61726d]">{text}</p>
      </div>
    </div>
  );
}

function LargePanel({ icon: Icon, title, text, note }: { icon: LucideIcon; title: string; text: string; note?: string }) {
  return (
    <div className="rounded-[38px] border border-[#e8dccb] bg-gradient-to-br from-white via-[#fffdf8] to-[#eef8ec] p-8 shadow-lg">
      <div className="mb-6 inline-flex rounded-2xl bg-emerald-50 p-4"><Icon className="h-7 w-7 text-emerald-800" strokeWidth={1.8} /></div>
      <h2 className="about-title text-3xl font-black tracking-tight text-[#143f35]">{title}</h2>
      <p className="mt-4 text-base leading-8 text-[#61726d]">{text}</p>
      {note && <div className="mt-6 rounded-2xl border border-[#d9cbb8] bg-white/80 p-5 text-sm leading-7 text-[#61726d]">{note}</div>}
    </div>
  );
}

function Impact({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-6">
      <Icon className="h-7 w-7 text-white" strokeWidth={1.7} />
      <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/75">{text}</p>
    </div>
  );
}
