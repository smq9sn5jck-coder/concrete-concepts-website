import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  CheckCircle,
  ClipboardCheck,
  Info,
  Layers,
  Phone,
  Ruler,
  Wrench,
} from "lucide-react";
import { Link } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { trackCalculatorUse, trackPhoneCallClick } from "@/components/ConversionTracking";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Button } from "@/components/ui/button";
import { saveQuoteDraft } from "@/lib/quoteDraft";

const FINISH_OPTIONS = [
  {
    id: "plain",
    name: "Plain Concrete — Broom Finish",
    description: "Durable natural-grey concrete with a practical broom texture for grip.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/plain-broom_deeb2afb.jpg",
  },
  {
    id: "oxide",
    name: "Coloured Concrete — Oxide Finish",
    description: "Integral oxide colour selected to complement the property and surrounding materials.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/coloured-concrete_b698e769.jpg",
  },
  {
    id: "exposed_raven",
    name: "Exposed Aggregate — Raven",
    description: "A named exposed-aggregate mix for a darker, contemporary surface.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate_cd1c28fa.jpg",
  },
  {
    id: "exposed_sp",
    name: "Exposed Aggregate — Salt & Pepper",
    description: "A balanced light-and-dark exposed-aggregate mix with strong visual texture.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
  },
  {
    id: "exposed_jersey",
    name: "Exposed Aggregate — Jersey",
    description: "A warm named exposed-aggregate mix suited to many Brisbane homes.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate_cd1c28fa.jpg",
  },
  {
    id: "exposed_casper",
    name: "Exposed Aggregate — Casper",
    description: "A premium named exposed-aggregate mix with a lighter stone profile.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
  },
  {
    id: "stencil",
    name: "Stencilled / Stamped Concrete",
    description: "A decorative patterned finish that requires design and site review.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/stamped-concrete_75630ce4.jpg",
  },
  {
    id: "honed",
    name: "Honed / Ground Concrete",
    description: "A mechanically finished surface that requires finish-specific review.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/honed-polished_18761be0.jpg",
  },
  {
    id: "not_sure",
    name: "Not Sure — Recommend a Finish",
    description: "Tell us how the area will be used and we will recommend suitable finishes.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-finished-slab_74e9f7cd.jpeg",
  },
] as const;

const PROJECT_TYPES = [
  ["driveway", "Driveway"],
  ["slab", "Concrete slab / foundation"],
  ["patio", "Patio / entertaining area"],
  ["pathway", "Pathway / footpath"],
  ["pool-surround", "Pool surround"],
  ["crossover", "Crossover"],
  ["retaining-wall", "Retaining wall"],
  ["other", "Other"],
] as const;

const SITE_FACTORS = [
  ["excavation", "Excavation may be required", "Ground preparation and levels need confirmation."],
  ["removal", "Existing concrete removal", "Demolition, cutting and disposal may be required."],
  ["access", "Restricted vehicle access", "A concrete pump or additional handling may be required."],
  ["slope", "Sloping site", "Levels, drainage and retaining requirements need review."],
  ["drainage", "Drainage work may be required", "Existing and proposed drainage must be confirmed."],
  ["pump", "Concrete pump may be required", "Placement access needs review before pricing."],
] as const;

export default function CostCalculator() {
  const [area, setArea] = useState("");
  const [finishId, setFinishId] = useState("");
  const [projectType, setProjectType] = useState("");
  const [siteFactors, setSiteFactors] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const selectedFinish = FINISH_OPTIONS.find((finish) => finish.id === finishId);
  const selectedProject = PROJECT_TYPES.find(([id]) => id === projectType);
  const areaNumber = Number(area);
  const ready = Boolean(projectType && finishId && Number.isFinite(areaNumber) && areaNumber > 0);

  const toggleFactor = (id: string) => {
    setSiteFactors((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setShowResult(false);
  };

  const prepareBrief = () => {
    if (!ready || !selectedFinish || !selectedProject) return;
    const factorNames = SITE_FACTORS.filter(([id]) => siteFactors.includes(id)).map(([, name]) => name);
    const factorSummary = factorNames.length ? factorNames.join(", ") : "No additional site factors selected";

    saveQuoteDraft({
      services: [projectType],
      workType: "not_sure",
      finish: finishId,
      timeframe: "planning",
      description: `${selectedProject[1]} project, approximately ${areaNumber} m², preferred finish: ${selectedFinish.name}. Site notes: ${factorSummary}.`,
      measurementMode: "area",
      totalAreaM2: String(areaNumber),
      existingConcreteRemoval: siteFactors.includes("removal"),
      vehicleAccess: siteFactors.includes("access") ? "restricted" : "not_sure",
      slope: siteFactors.includes("slope") ? "steep" : "not_sure",
      drainage: siteFactors.includes("drainage") ? "new_drainage_needed" : "not_sure",
      pumpAccess: siteFactors.includes("pump") || siteFactors.includes("access") ? "pump_likely" : "not_sure",
      specialRequirements: factorSummary,
    });
    trackCalculatorUse(selectedFinish.name, 0);
    setShowResult(true);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Concrete Project Planner Brisbane",
    description: "Prepare a structured Brisbane concrete project brief with area, finish and site details before requesting a site-specific ballpark estimate.",
    url: "https://concreteconceptsgroup.com/calculator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    provider: {
      "@type": "LocalBusiness",
      name: "Concrete Concepts Group Pty Ltd",
      telephone: "+61424463268",
      areaServed: "Brisbane, Queensland, Australia",
    },
  };

  return (
    <div className="min-h-screen bg-brand-charcoal">
      <Navbar />
      <SEOHead
        title="Concrete Project Planner Brisbane | Concrete Concepts Group"
        description="Plan your Brisbane concrete project by recording the area, actual finish choice and important site factors, then request a scope-based ballpark estimate from Concrete Concepts Group."
        canonical="/calculator"
        keywords="concrete project planner Brisbane, concrete driveway quote Brisbane, concrete finish options Brisbane, concrete site measure Brisbane"
        structuredData={structuredData}
      />

      <section className="pb-12 pt-28 lg:pb-16 lg:pt-36">
        <div className="container">
          <Breadcrumbs items={[{ label: "Project Planner" }]} className="mb-8" />
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-10 bg-brand-gold" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Free planning tool</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Concrete Project Planner <span className="italic text-brand-gold">Brisbane</span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-brand-silver-light/70">
              Build a useful project brief without relying on a generic square-metre rate. Concrete Concepts prices the full scope: finish, excavation, disposal, access, drainage, pumping, reinforcement, crew time and final measurements.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <PlannerCard number="1" title="What type of project?" icon={<ClipboardCheck className="h-5 w-5 text-brand-gold" />}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {PROJECT_TYPES.map(([id, name]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => { setProjectType(id); setShowResult(false); }}
                      className={`rounded-lg border p-4 text-left transition ${projectType === id ? "border-brand-gold bg-brand-gold/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:border-white/25"}`}
                    >
                      <span className="text-sm font-semibold">{name}</span>
                    </button>
                  ))}
                </div>
              </PlannerCard>

              <PlannerCard number="2" title="What is the approximate area?" icon={<Ruler className="h-5 w-5 text-brand-gold" />}>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={area}
                    onChange={(event) => { setArea(event.target.value); setShowResult(false); }}
                    placeholder="e.g. 110"
                    className="w-40 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-lg text-white outline-none transition placeholder:text-white/30 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50"
                  />
                  <span className="text-lg font-medium text-white/60">square metres (m²)</span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-white/40">
                  <Info className="h-4 w-4 shrink-0" /> An approximate area is useful; the final measure is confirmed before a formal quote.
                </p>
              </PlannerCard>

              <PlannerCard number="3" title="Choose the actual finish" icon={<Layers className="h-5 w-5 text-brand-gold" />}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {FINISH_OPTIONS.map((finish) => (
                    <button
                      key={finish.id}
                      type="button"
                      onClick={() => { setFinishId(finish.id); setShowResult(false); }}
                      className={`flex gap-4 rounded-lg border p-4 text-left transition ${finishId === finish.id ? "border-brand-gold bg-brand-gold/10" : "border-white/10 bg-white/5 hover:border-white/25"}`}
                    >
                      <img src={finish.image} width={160} height={160} alt={`${finish.name} example`} className="h-16 w-16 shrink-0 rounded-lg object-cover" loading="lazy" decoding="async" />
                      <span>
                        <span className="block text-sm font-semibold text-white">{finish.name}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-white/45">{finish.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </PlannerCard>

              <PlannerCard number="4" title="Which site factors may apply?" icon={<Wrench className="h-5 w-5 text-brand-gold" />}>
                <div className="space-y-3">
                  {SITE_FACTORS.map(([id, name, description]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleFactor(id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition ${siteFactors.includes(id) ? "border-brand-gold bg-brand-gold/10" : "border-white/10 bg-white/5 hover:border-white/25"}`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${siteFactors.includes(id) ? "border-brand-gold bg-brand-gold" : "border-white/30"}`}>
                        {siteFactors.includes(id) && <CheckCircle className="h-3.5 w-3.5 text-brand-charcoal" />}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-white">{name}</span>
                        <span className="block text-xs text-white/45">{description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </PlannerCard>

              <Button
                type="button"
                onClick={prepareBrief}
                disabled={!ready}
                size="lg"
                className="w-full bg-brand-gold py-6 text-lg font-bold uppercase tracking-wide text-brand-charcoal shadow-xl shadow-brand-gold/20 transition hover:bg-brand-gold-dark disabled:opacity-40"
              >
                <Calculator className="mr-2 h-5 w-5" /> Prepare My Project Brief
              </Button>
            </div>

            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-28">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:p-8">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                    <ClipboardCheck className="h-5 w-5 text-brand-gold" /> Your project brief
                  </h2>
                  {showResult && selectedFinish && selectedProject ? (
                    <div>
                      <div className="mb-5 rounded-xl border border-brand-gold/25 bg-brand-gold/10 p-5 text-center">
                        <CheckCircle className="mx-auto mb-3 h-10 w-10 text-brand-gold" />
                        <p className="text-xl font-bold text-white">Project brief ready</p>
                        <p className="mt-2 text-sm text-white/60">{selectedProject[1]} · {areaNumber} m²</p>
                        <p className="mt-1 text-sm font-semibold text-brand-gold">{selectedFinish.name}</p>
                      </div>
                      <p className="mb-5 text-sm leading-relaxed text-white/60">
                        Continue to add the property location, access details and optional photos. Your ballpark will be built from separately costed low, expected and high scopes—not a generic browser rate.
                      </p>
                      <Link href="/get-quote">
                        <Button className="w-full bg-brand-gold py-5 font-bold uppercase text-brand-charcoal hover:bg-brand-gold-dark">
                          Continue to detailed quote <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Calculator className="mx-auto mb-4 h-12 w-12 text-white/20" />
                      <p className="text-sm text-white/45">Choose a project, approximate area and finish to prepare your saved quote brief.</p>
                    </div>
                  )}
                </motion.div>

                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">What the estimate checks</h3>
                  <ul className="space-y-3">
                    {["Finish-specific concrete and sealing", "Preparation, reinforcement and formwork", "Access, excavation, disposal and pumping", "Final measure and site conditions", "GST-inclusive scope with owner review"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                        <CheckCircle className="h-4 w-4 shrink-0 text-brand-gold" /> {item}
                      </li>
                    ))}
                  </ul>
                  <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-brand-gold hover:underline">
                    <Phone className="h-4 w-4" /> Prefer to talk? 0424 463 268
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#1a1a1a] py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl">Why a scope-based estimate is more useful</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ["Preparation changes the job", "Excavation depth, spoil disposal, demolition and road base can materially change labour, equipment and quantities."],
                ["Access changes placement", "Truck access, pump requirements, slope and working room affect the planned crew and concrete placement method."],
                ["Finishes are not interchangeable", "Plain broom, named exposed mixes, oxide, patterned and honed finishes require different materials and processes."],
                ["Final measure protects both sides", "A site measure confirms levels, drainage, reinforcement, thickness, edges and the work included in the formal quote."],
              ].map(([title, copy]) => (
                <article key={title} className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="font-bold text-brand-gold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{copy}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 rounded-xl border border-brand-gold/20 bg-brand-gold/10 p-5 text-sm leading-relaxed text-white/70">
              <strong className="text-brand-gold">Ballpark first, formal quote after review.</strong> Concrete Concepts uses your project details to prepare a practical range, then confirms the final scope before work is booked.
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}

function PlannerCard({
  number,
  title,
  icon,
  children,
}: {
  number: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-brand-charcoal">{number}</span>
        {icon}
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}
