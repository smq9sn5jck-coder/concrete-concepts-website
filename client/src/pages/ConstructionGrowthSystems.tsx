import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ClipboardList,
  Globe2,
  HardHat,
  MessageSquareText,
  Network,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import CGSForm from "@/components/CGSForm";
import { usePageMetadata } from "@/lib/page-metadata";

const SYSTEMS = [
  {
    icon: Globe2,
    number: "01",
    title: "Construction website",
    description:
      "A clear, mobile-first website built around the exact jobs and locations your business wants to win.",
  },
  {
    icon: ClipboardList,
    number: "02",
    title: "Lead capture",
    description:
      "Focused forms and call paths that collect the information required to qualify and respond to an enquiry.",
  },
  {
    icon: MessageSquareText,
    number: "03",
    title: "Automated follow-up",
    description:
      "Practical notifications and follow-up steps that reduce the chance of a valuable lead going cold.",
  },
  {
    icon: Network,
    number: "04",
    title: "Referral tracking",
    description:
      "A repeatable way to capture the referrer, customer, job source and reward status without relying on memory.",
  },
];

const PROBLEMS = [
  "The website looks acceptable but does not generate qualified enquiries.",
  "Leads arrive through too many channels and follow-up is inconsistent.",
  "Quoting, reminders and referral tracking depend on manual admin.",
  "Marketing reports clicks and forms but not which jobs become revenue.",
];

const FIT = [
  "Builders ready to improve lead quality and follow-up",
  "Concreters, landscapers and earthmoving businesses",
  "Electricians, plumbers, carpenters and service trades",
  "Construction businesses that want systems—not another disconnected tool",
];

export default function ConstructionGrowthSystems() {
  usePageMetadata({
    title: "CGS | Construction Growth Systems",
    description:
      "Construction websites, lead capture, automated follow-up and referral tracking connected into one practical growth system for builders and trades.",
    canonicalUrl:
      "https://concreteconceptsgroup.com/construction-growth-systems",
  });

  return (
    <div className="min-h-screen bg-[#111111] font-sans text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#111111]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="/construction-growth-systems"
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center bg-[#D6A84B] text-lg font-black text-[#111111]">
              CGS
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-black uppercase tracking-[0.16em]">
                Construction Growth
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.36em] text-white/45">
                Systems
              </span>
            </span>
          </a>
          <nav className="flex items-center gap-4">
            <a
              href="/"
              className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/55 transition hover:text-[#D6A84B] sm:flex"
            >
              <ArrowLeft className="h-4 w-4" /> Concrete Concepts
            </a>
            <a
              href="#growth-review"
              className="bg-[#D6A84B] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#111111] transition hover:bg-[#e2ba63] active:scale-[0.97]"
            >
              Growth review
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden pb-24 pt-32 sm:pb-28 sm:pt-38">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "54px 54px",
              maskImage:
                "linear-gradient(to bottom, black 0%, transparent 88%)",
            }}
          />
          <div className="pointer-events-none absolute -right-36 top-16 h-[32rem] w-[32rem] rounded-full bg-[#D6A84B]/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.12fr_.88fr] lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 border border-[#D6A84B]/35 bg-[#D6A84B]/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#D6A84B]">
                <HardHat className="h-4 w-4" /> Built for construction and trade
                businesses
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.97] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Turn your business into a
                <span className="block text-[#D6A84B]">growth system.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/65 sm:text-xl">
                CGS connects your website, lead capture, follow-up and referral
                tracking so more opportunities move from first click to real
                work.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#growth-review"
                  className="inline-flex items-center justify-center gap-2 bg-[#D6A84B] px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-[#111111] transition hover:bg-[#e2ba63] active:scale-[0.97]"
                >
                  Request a growth review <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="#system"
                  className="inline-flex items-center justify-center border border-white/20 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:border-white/50"
                >
                  See the system
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-5 -rotate-2 border border-[#D6A84B]/20" />
              <div className="relative border border-white/15 bg-[#171717] p-6 shadow-2xl sm:p-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D6A84B]">
                      The connected system
                    </p>
                    <p className="mt-1 text-sm text-white/45">
                      One journey, measured end to end
                    </p>
                  </div>
                  <Workflow className="h-8 w-8 text-[#D6A84B]" />
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    "Right customer finds the right page",
                    "Focused enquiry captures useful job details",
                    "Owner is notified and follow-up starts",
                    "Source and outcome remain traceable",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 bg-white/[0.04] p-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#D6A84B] text-xs font-black text-[#111111]">
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold text-white/80">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3 border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                  <BarChart3 className="h-5 w-5 shrink-0" />
                  Build the system around qualified jobs, not vanity traffic.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="system"
          className="scroll-mt-20 border-y border-white/10 bg-[#171717] py-20 sm:py-26"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D6A84B]">
                The CGS method
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-6xl">
                Four parts. One commercial outcome.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/55">
                A website alone cannot fix slow follow-up. Automation alone
                cannot fix weak positioning. CGS joins the critical parts into a
                simple operating system for growth.
              </p>
            </div>

            <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {SYSTEMS.map(system => {
                const Icon = system.icon;
                return (
                  <article
                    key={system.number}
                    className="group bg-[#171717] p-6 transition hover:bg-[#1d1d1d] sm:p-8"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-[#D6A84B]" />
                      <span className="text-sm font-black text-white/20">
                        {system.number}
                      </span>
                    </div>
                    <h3 className="mt-8 text-xl font-black">{system.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/50">
                      {system.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#f1eee6] py-20 text-[#171717] sm:py-26">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#876a27]">
                Where growth leaks
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-5xl">
                Good work does not guarantee a good lead system.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-black/60">
                Many capable construction businesses rely on referrals, delayed
                callbacks and a website that cannot explain why the customer
                should choose them. The problem is usually the connection
                between the parts.
              </p>
            </div>
            <div className="space-y-3">
              {PROBLEMS.map(problem => (
                <div
                  key={problem}
                  className="flex items-start gap-4 border border-black/10 bg-white p-5 shadow-sm"
                >
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center bg-[#171717] text-[#D6A84B]">
                    <Check className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold leading-relaxed text-black/70">
                    {problem}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#111111] py-20 sm:py-26">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[.88fr_1.12fr] lg:px-8">
            <div className="relative border border-[#D6A84B]/30 bg-[#D6A84B]/[0.06] p-7 sm:p-9">
              <div className="absolute -right-3 -top-3 h-12 w-12 border-r-2 border-t-2 border-[#D6A84B]" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D6A84B]">
                Live construction reference
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                Concrete Concepts is the working example.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-white/55">
                The Concrete Concepts customer journey keeps quote enquiries,
                referral opportunities and marketing enquiries separate. Each
                form has a clear purpose, secure delivery and its own measurable
                event.
              </p>
              <a
                href="/"
                className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[#D6A84B] hover:text-[#e2ba63]"
              >
                View Concrete Concepts <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D6A84B]">
                Built from operating reality
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-5xl">
                Systems that respect how construction businesses actually work.
              </h2>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: ShieldCheck,
                    text: "Clear lead ownership and privacy",
                  },
                  {
                    icon: Bot,
                    text: "Automation that supports—not complicates—the job",
                  },
                  {
                    icon: BarChart3,
                    text: "Tracking tied to real enquiry types",
                  },
                  {
                    icon: HardHat,
                    text: "Language and workflows made for trades",
                  },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.text}
                      className="flex items-center gap-3 border border-white/10 p-4 text-sm font-bold text-white/70"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-[#D6A84B]" />
                      {item.text}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#D6A84B] py-18 text-[#111111]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-black/55">
                  Best fit
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.035em] sm:text-5xl">
                  For construction businesses ready to operate with more
                  control.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {FIT.map(item => (
                  <div
                    key={item}
                    className="flex items-start gap-3 bg-black/10 p-4 text-sm font-bold leading-relaxed"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="growth-review"
          className="scroll-mt-18 bg-[#171717] py-20 sm:py-28"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.75fr_1.25fr] lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D6A84B]">
                Growth review
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-5xl">
                Find the strongest next system to build.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/55">
                Tell us what feels disconnected or too manual. We’ll review your
                current position and discuss the most practical improvement—
                whether that starts with the website, follow-up or the complete
                system.
              </p>
              <div className="mt-8 border-l-2 border-[#D6A84B] pl-5 text-sm leading-relaxed text-white/50">
                CGS is designed for real construction and trade businesses. The
                review is focused on commercial fit, not generic marketing
                theory.
              </div>
            </div>
            <div className="border border-white/12 bg-[#111111] p-5 shadow-2xl sm:p-8">
              <CGSForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#0b0b0b] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em]">
              CGS · Construction Growth Systems
            </p>
            <p className="mt-1 text-xs text-white/35">
              Websites, lead capture, follow-up and referral systems for
              construction businesses.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/45 transition hover:text-[#D6A84B]"
          >
            <ArrowLeft className="h-4 w-4" /> Concrete Concepts
          </a>
        </div>
      </footer>
    </div>
  );
}
