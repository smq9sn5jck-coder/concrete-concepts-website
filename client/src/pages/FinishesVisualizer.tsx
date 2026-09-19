import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle,
  Eye,
  Layers,
  Phone,
  Shield,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { trackPhoneCallClick, trackRemarketingEvent } from "@/components/ConversionTracking";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Button } from "@/components/ui/button";
import { saveQuoteDraft } from "@/lib/quoteDraft";

interface ConcreteFinish {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  image: string;
  automation: "Ballpark eligible" | "Owner review" | "Measure first";
  bestFor: string[];
  characteristics: string[];
  considerations: string[];
}

const IMAGES = {
  plain: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/plain-broom_deeb2afb.jpg",
  coloured: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/coloured-concrete_b698e769.jpg",
  exposed: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate_cd1c28fa.jpg",
  exposedProject: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
  stamped: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/stamped-concrete_75630ce4.jpg",
  honed: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/honed-polished_18761be0.jpg",
  notSure: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-finished-slab_74e9f7cd.jpeg",
} as const;

const FINISHES: ConcreteFinish[] = [
  {
    id: "plain",
    name: "Plain Concrete — Broom Finish",
    shortName: "Plain broom",
    tagline: "Durable, practical and slip-conscious",
    description: "Natural-grey concrete finished with a consistent broom texture. It is a dependable choice for working surfaces where grip, durability and simple maintenance matter.",
    image: IMAGES.plain,
    automation: "Ballpark eligible",
    bestFor: ["Driveways", "Paths", "Shed slabs", "Utility areas"],
    characteristics: ["Broom texture for grip", "Natural concrete appearance", "Straightforward maintenance"],
    considerations: ["Final colour varies naturally", "Sealing and curing depend on the project", "Preparation and drainage still require review"],
  },
  {
    id: "oxide",
    name: "Coloured Concrete — Oxide Finish",
    shortName: "Oxide",
    tagline: "Integral colour selected for the property",
    description: "Oxide pigment is incorporated into the concrete mix to create a consistent coloured surface. Colour selection, dosage and sealing must be confirmed before a reliable estimate is issued.",
    image: IMAGES.coloured,
    automation: "Owner review",
    bestFor: ["Driveways", "Patios", "Pool surrounds", "Paths"],
    characteristics: ["Colour through the concrete", "Earth-tone palette", "Can be sealed for a richer appearance"],
    considerations: ["Oxide colour and dosage must be selected", "Batch and curing conditions affect appearance", "Finish-specific costs require owner review"],
  },
  {
    id: "exposed_raven",
    name: "Exposed Aggregate — Raven",
    shortName: "Raven",
    tagline: "A darker named exposed mix",
    description: "Raven is priced and presented as its own approved aggregate mix rather than as a generic exposed-aggregate package.",
    image: IMAGES.exposed,
    automation: "Ballpark eligible",
    bestFor: ["Driveways", "Front entries", "Paths", "Contemporary homes"],
    characteristics: ["Named supplier mix", "Textured aggregate surface", "Strong contemporary character"],
    considerations: ["Sample appearance can vary", "Exposure and wash timing are critical", "Sealing is included in the scoped finish"],
  },
  {
    id: "exposed_sp",
    name: "Exposed Aggregate — Salt & Pepper",
    shortName: "Salt & Pepper",
    tagline: "Balanced light-and-dark aggregate",
    description: "Salt & Pepper combines contrasting aggregate tones for a versatile exposed finish. It is costed as the specific named mix, not a broad finish category.",
    image: IMAGES.exposedProject,
    automation: "Ballpark eligible",
    bestFor: ["Driveways", "Pool surrounds", "Patios", "Entertaining areas"],
    characteristics: ["Balanced tonal contrast", "Textured surface", "Versatile architectural pairing"],
    considerations: ["Final mix sample should be reviewed", "Surface feel is more textured than honed concrete", "Maintenance includes periodic resealing"],
  },
  {
    id: "exposed_jersey",
    name: "Exposed Aggregate — Jersey",
    shortName: "Jersey",
    tagline: "A warm named exposed mix",
    description: "Jersey is a distinct exposed-aggregate option with its own approved supplier rate and scope assumptions.",
    image: IMAGES.exposed,
    automation: "Ballpark eligible",
    bestFor: ["Driveways", "Paths", "Patios", "Warm exterior palettes"],
    characteristics: ["Warm aggregate profile", "Named supplier mix", "Durable outdoor finish"],
    considerations: ["Confirm the current sample before selection", "Access and wash-off control affect delivery", "Sealing remains part of the finished scope"],
  },
  {
    id: "exposed_casper",
    name: "Exposed Aggregate — Casper",
    shortName: "Casper",
    tagline: "A lighter premium named mix",
    description: "Casper is treated as a separate aggregate mix with a distinct material basis. It is not bundled into a premium tier or generic exposed range.",
    image: IMAGES.exposedProject,
    automation: "Ballpark eligible",
    bestFor: ["Feature driveways", "Pool surrounds", "Light exterior palettes", "Entertaining areas"],
    characteristics: ["Lighter aggregate profile", "Named supplier mix", "High visual impact"],
    considerations: ["Confirm sample and availability", "Lighter surfaces may show some marks more readily", "Site preparation is priced from the actual scope"],
  },
  {
    id: "stencil",
    name: "Stencilled / Stamped Concrete",
    shortName: "Stencil / stamped",
    tagline: "Pattern and colour tailored to the design",
    description: "Patterned concrete combines a selected stencil or stamp with a specified colour system. The design, materials and labour sequence need owner review before pricing.",
    image: IMAGES.stamped,
    automation: "Owner review",
    bestFor: ["Patios", "Front entries", "Feature paths", "Decorative areas"],
    characteristics: ["Patterned appearance", "Custom colour combinations", "Continuous concrete base"],
    considerations: ["Pattern and colour system must be chosen", "Slip resistance needs project-specific review", "Resealing requirements depend on the system"],
  },
  {
    id: "honed",
    name: "Honed / Ground Concrete",
    shortName: "Honed / ground",
    tagline: "Mechanically finished for a refined surface",
    description: "Honed or ground concrete reveals aggregate through mechanical processing. Grinding level, edges, access and slip requirements must be confirmed for a defensible price.",
    image: IMAGES.honed,
    automation: "Owner review",
    bestFor: ["Modern patios", "Feature entries", "Covered outdoor areas", "Commercial spaces"],
    characteristics: ["Refined aggregate exposure", "Smooth contemporary appearance", "Mechanically processed finish"],
    considerations: ["Grinding specification must be defined", "Outdoor slip resistance requires care", "Finish-specific labour and tooling need review"],
  },
  {
    id: "not_sure",
    name: "Not Sure — Recommend a Finish",
    shortName: "Recommend a finish",
    tagline: "Start with use, appearance and maintenance priorities",
    description: "If you are unsure, record how the area will be used, the look you prefer and any maintenance priorities. Concrete Concepts can then recommend suitable real finish options.",
    image: IMAGES.notSure,
    automation: "Measure first",
    bestFor: ["Early planning", "Mixed-use areas", "Unclear design direction", "Renovation matching"],
    characteristics: ["Advice based on the actual project", "Real finish names in the response", "No invented package tiers"],
    considerations: ["A finish must be selected before final pricing", "Photos and site context improve recommendations", "Availability and samples are confirmed during review"],
  },
];

export default function FinishesVisualizer() {
  const [selectedFinish, setSelectedFinish] = useState("exposed_sp");
  const activeFinish = useMemo(
    () => FINISHES.find((finish) => finish.id === selectedFinish) ?? FINISHES[0],
    [selectedFinish]
  );

  const chooseForQuote = () => {
    saveQuoteDraft({
      finish: activeFinish.id,
      services: activeFinish.id.startsWith("exposed_") ? ["driveway", "exposed-aggregate"] : [],
      timeframe: "planning",
      workType: "not_sure",
      description: `Preferred finish: ${activeFinish.name}. Please confirm suitability, site preparation and final scope.`,
    });
    trackRemarketingEvent({ pageCategory: "service", serviceType: activeFinish.id });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Concrete finish options from Concrete Concepts Group",
    itemListElement: FINISHES.map((finish, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: finish.name,
    })),
  };

  return (
    <div className="min-h-screen bg-brand-charcoal">
      <Navbar />
      <SEOHead
        title="Concrete Finishes Brisbane | Compare Options | Concrete Concepts Group"
        description="Compare actual Concrete Concepts Group finish names including plain broom, oxide, Raven, Salt & Pepper, Jersey, Casper, stencilled and honed concrete."
        canonical="/finishes"
        keywords="concrete finishes Brisbane, Raven exposed aggregate, Salt and Pepper exposed aggregate, Jersey exposed aggregate, Casper exposed aggregate, oxide concrete, honed concrete"
        structuredData={structuredData}
      />

      <section className="pb-12 pt-28 lg:pb-16 lg:pt-36">
        <div className="container">
          <Breadcrumbs items={[{ label: "Concrete Finishes" }]} className="mb-8" />
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-brand-gold" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Actual finish catalogue</span>
              <div className="h-px w-10 bg-brand-gold" />
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Compare Concrete <span className="italic text-brand-gold">Finishes</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-white/65">
              Choose the real finish or named aggregate mix you want. Pricing is prepared from the full project scope, not from package tiers or a generic square-metre rate.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container">
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FINISHES.map((finish) => (
              <button
                key={finish.id}
                type="button"
                onClick={() => setSelectedFinish(finish.id)}
                className={`rounded-xl border p-4 text-left transition ${selectedFinish === finish.id ? "border-brand-gold bg-brand-gold/10" : "border-white/10 bg-white/5 hover:border-white/25"}`}
              >
                <span className="block text-sm font-bold text-white">{finish.name}</span>
                <span className="mt-1 block text-xs text-white/45">{finish.tagline}</span>
              </button>
            ))}
          </div>

          <motion.article
            key={activeFinish.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white"
          >
            <div className="grid lg:grid-cols-2">
              <div className="relative min-h-[320px] bg-slate-200 lg:min-h-[620px]">
                <img src={activeFinish.image} alt={`${activeFinish.name} example from Concrete Concepts`} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur">
                    <Eye className="h-4 w-4 text-brand-gold" /> Project photo example
                  </div>
                  <p className="mt-3 text-xs text-white/75">Photos show representative finished work. Colour and aggregate appearance vary with the selected mix, site and lighting.</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-brand-charcoal px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">{activeFinish.automation}</span>
                  {activeFinish.id.startsWith("exposed_") && <span className="rounded-full bg-brand-gold/20 px-3 py-1.5 text-xs font-bold text-brand-charcoal">Named aggregate mix</span>}
                </div>
                <h2 className="mt-5 text-3xl font-black text-brand-charcoal">{activeFinish.name}</h2>
                <p className="mt-2 font-semibold text-brand-gold-dark">{activeFinish.tagline}</p>
                <p className="mt-5 leading-relaxed text-brand-charcoal/70">{activeFinish.description}</p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <FinishList title="Often suited to" icon={<Layers className="h-5 w-5" />} items={activeFinish.bestFor} />
                  <FinishList title="Key characteristics" icon={<Sparkles className="h-5 w-5" />} items={activeFinish.characteristics} />
                </div>
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="flex items-center gap-2 font-bold text-brand-charcoal"><Shield className="h-5 w-5 text-brand-gold-dark" /> Confirm before pricing</h3>
                  <ul className="mt-3 space-y-2">
                    {activeFinish.considerations.map((item) => <li key={item} className="flex gap-2 text-sm text-brand-charcoal/70"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold-dark" />{item}</li>)}
                  </ul>
                </div>

                <Link href="/get-quote" onClick={chooseForQuote}>
                  <Button className="mt-8 w-full bg-brand-gold py-6 font-bold uppercase text-brand-charcoal hover:bg-brand-gold-dark">
                    Request this finish <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-brand-charcoal/65 hover:text-brand-gold-dark">
                  <Phone className="h-4 w-4" /> Discuss finishes: 0424 463 268
                </a>
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      <section className="bg-[#1a1a1a] py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-3xl font-bold text-white">How to choose with confidence</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                ["1", "Select actual options", "Use the named finishes above rather than a package label."],
                ["2", "Share site context", "Add measurements, access, drainage and optional photos to your quote brief."],
                ["3", "Confirm samples and scope", "Concrete Concepts reviews suitability, availability and the final measure before formal pricing."],
              ].map(([number, title, copy]) => (
                <div key={number} className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold font-black text-brand-charcoal">{number}</span>
                  <h3 className="mt-4 font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/calculator">
                <Button variant="outline" className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-charcoal">
                  Open the project planner <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}

function FinishList({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-bold text-brand-charcoal">{icon}{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => <li key={item} className="flex gap-2 text-sm text-brand-charcoal/65"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold-dark" />{item}</li>)}
      </ul>
    </div>
  );
}
