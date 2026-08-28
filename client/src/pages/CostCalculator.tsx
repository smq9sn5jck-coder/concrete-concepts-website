/*
  CostCalculator: Interactive concrete cost estimator
  SEO target: "concrete driveway cost Brisbane", "concrete cost calculator"
  Mid-to-high Brisbane pricing with range-based estimates
  Strong CTA to drive quote conversions
*/
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Phone, ArrowRight, Info, CheckCircle, Ruler, Layers, Wrench, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { trackPhoneCallClick, trackCalculatorUse } from "@/components/ConversionTracking";

// Mid-to-high Brisbane pricing per m²
const FINISH_TYPES = [
  {
    id: "plain",
    name: "Plain Concrete",
    description: "Standard grey finish — durable and cost-effective",
    lowPerM2: 75,
    highPerM2: 95,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-finished-slab_74e9f7cd.jpeg",
  },
  {
    id: "coloured",
    name: "Coloured Concrete",
    description: "Oxide-tinted concrete in a range of earth tones",
    lowPerM2: 85,
    highPerM2: 120,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-troweling_06ff9a7c.jpeg",
  },
  {
    id: "exposed",
    name: "Exposed Aggregate",
    description: "Premium stone-finish — Brisbane's most popular choice",
    lowPerM2: 110,
    highPerM2: 160,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
  },
  {
    id: "stencilled",
    name: "Stencilled / Stamped",
    description: "Patterned finish replicating stone, brick, or tile",
    lowPerM2: 100,
    highPerM2: 150,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-pouring_f7343992.jpeg",
  },
  {
    id: "covercrete",
    name: "Covercrete / Resurfacing",
    description: "Overlay existing concrete with a decorative finish",
    lowPerM2: 80,
    highPerM2: 130,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
  },
];

const PROJECT_TYPES = [
  { id: "driveway", name: "Driveway", typicalSize: "40-80" },
  { id: "slab", name: "Concrete Slab / Foundation", typicalSize: "30-100" },
  { id: "patio", name: "Patio / Entertaining Area", typicalSize: "20-60" },
  { id: "pathway", name: "Pathway / Footpath", typicalSize: "10-30" },
  { id: "pool", name: "Pool Surround", typicalSize: "15-40" },
  { id: "other", name: "Other", typicalSize: "varies" },
];

const EXTRAS = [
  { id: "excavation", name: "Excavation Required", lowPerM2: 18, highPerM2: 28, description: "Site preparation and soil removal" },
  { id: "removal", name: "Old Concrete Removal", lowPerM2: 22, highPerM2: 35, description: "Demolish and dispose of existing concrete" },
  { id: "retaining", name: "Retaining Wall (per lineal metre)", lowPerM2: 250, highPerM2: 450, description: "Concrete block or poured retaining wall", isLineal: true },
  { id: "access", name: "Difficult Access (+15%)", isPercentage: true, percentage: 15, description: "Steep slopes, narrow access, or rear of property" },
];

export default function CostCalculator() {
  const [area, setArea] = useState<string>("");
  const [finishType, setFinishType] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [retainingMetres, setRetainingMetres] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const estimate = useMemo(() => {
    const areaNum = parseFloat(area) || 0;
    const finish = FINISH_TYPES.find((f) => f.id === finishType);
    if (!finish || areaNum <= 0) return null;

    let low = finish.lowPerM2 * areaNum;
    let high = finish.highPerM2 * areaNum;

    for (const extraId of selectedExtras) {
      const extra = EXTRAS.find((e) => e.id === extraId);
      if (!extra) continue;

      if ("isPercentage" in extra && extra.isPercentage) {
        low *= 1 + (extra.percentage || 0) / 100;
        high *= 1 + (extra.percentage || 0) / 100;
      } else if ("isLineal" in extra && extra.isLineal) {
        const metres = parseFloat(retainingMetres) || 0;
        low += extra.lowPerM2 * metres;
        high += extra.highPerM2 * metres;
      } else {
        low += (extra.lowPerM2 ?? 0) * areaNum;
        high += (extra.highPerM2 ?? 0) * areaNum;
      }
    }

    return {
      low: Math.round(low / 100) * 100,
      high: Math.round(high / 100) * 100,
      perM2Low: finish.lowPerM2,
      perM2High: finish.highPerM2,
    };
  }, [area, finishType, selectedExtras, retainingMetres]);

  const selectedFinish = FINISH_TYPES.find((f) => f.id === finishType);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Concrete Cost Calculator Brisbane",
    description: "Calculate the estimated cost of your concrete project in Brisbane. Get instant price ranges for driveways, slabs, patios, and more.",
    url: "https://concreteconceptsgroup.com/calculator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "AUD",
      lowPrice: "75",
      highPrice: "160",
      offerCount: FINISH_TYPES.length,
    },
    provider: {
      "@type": "LocalBusiness",
      name: "Concrete Concepts Group",
      telephone: "+61424463268",
      areaServed: "Brisbane, Queensland, Australia",
    },
  };

  return (
    <div className="min-h-screen bg-brand-charcoal">
      <Navbar />
      <SEOHead
        title="Concrete Cost Calculator Brisbane | Instant Price Estimate | Concrete Concepts"
        description="Calculate your concrete project cost in Brisbane. Instant estimates for driveways, slabs, patios & more. Plain concrete from $75/m², exposed aggregate from $110/m². Free quotes — call 0424 463 268."
        canonical="/calculator"
        keywords="concrete cost calculator Brisbane, concrete driveway cost Brisbane, how much does concrete cost per square metre Brisbane, exposed aggregate cost Brisbane, concrete slab cost Brisbane"
        structuredData={structuredData}
      />

      {/* Hero */}
      <section className="pt-28 pb-12 lg:pt-36 lg:pb-16">
        <div className="container">
          <Breadcrumbs
            items={[{ label: "Cost Calculator" }]}
            className="mb-8"
          />

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-px bg-brand-gold" />
              <span className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
                Free Estimate Tool
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Concrete Cost Calculator
              <span className="text-brand-gold italic"> Brisbane</span>
            </h1>
            <p className="text-brand-silver-light/70 text-lg leading-relaxed max-w-2xl" style={{ fontFamily: "var(--font-body)" }}>
              Get an instant estimate for your concrete project. Enter your area size, choose a finish, and see a realistic price range based on current Brisbane rates. For an exact quote, call us on{" "}
              <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="text-brand-gold hover:underline font-semibold">0424 463 268</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="pb-24">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left — Input Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1: Project Type */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 lg:p-8"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-charcoal font-bold text-sm">1</div>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                    What type of project?
                  </h2>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt.id}
                      onClick={() => setProjectType(pt.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        projectType === pt.id
                          ? "border-brand-gold bg-brand-gold/10 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                      }`}
                    >
                      <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-body)" }}>{pt.name}</p>
                      <p className="text-xs text-white/40 mt-1" style={{ fontFamily: "var(--font-body)" }}>
                        Typical: {pt.typicalSize} m²
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Step 2: Area Size */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 lg:p-8"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-charcoal font-bold text-sm">2</div>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                    <Ruler className="inline w-5 h-5 mr-2 text-brand-gold" />
                    How large is the area?
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-40 bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white text-lg placeholder:text-white/30 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                  <span className="text-white/60 text-lg font-medium" style={{ fontFamily: "var(--font-body)" }}>
                    square metres (m²)
                  </span>
                </div>
                <p className="text-white/30 text-sm mt-3 flex items-center gap-2" style={{ fontFamily: "var(--font-body)" }}>
                  <Info className="w-4 h-4 shrink-0" />
                  Not sure? A single-car driveway is typically 30-40m². A double is 50-70m².
                </p>
              </motion.div>

              {/* Step 3: Finish Type */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 lg:p-8"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-charcoal font-bold text-sm">3</div>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                    <Layers className="inline w-5 h-5 mr-2 text-brand-gold" />
                    Choose your finish
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {FINISH_TYPES.map((ft) => (
                    <button
                      key={ft.id}
                      onClick={() => setFinishType(ft.id)}
                      className={`flex gap-4 p-4 rounded-lg border text-left transition-all ${
                        finishType === ft.id
                          ? "border-brand-gold bg-brand-gold/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <img
                        src={ft.image}
                          width={300}
                          height={200}
                          decoding="async"
                        alt={`${ft.name} concrete finish Brisbane`}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                        loading="lazy"
                      />
                      <div>
                        <p className="font-semibold text-white text-sm" style={{ fontFamily: "var(--font-body)" }}>{ft.name}</p>
                        <p className="text-white/40 text-xs mt-0.5" style={{ fontFamily: "var(--font-body)" }}>{ft.description}</p>
                        <p className="text-brand-gold text-sm font-bold mt-1.5" style={{ fontFamily: "var(--font-body)" }}>
                          ${ft.lowPerM2} – ${ft.highPerM2} /m²
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Step 4: Extras */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 lg:p-8"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-charcoal font-bold text-sm">4</div>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                    <Wrench className="inline w-5 h-5 mr-2 text-brand-gold" />
                    Any extras? <span className="text-white/40 text-sm font-normal">(optional)</span>
                  </h2>
                </div>
                <div className="space-y-3">
                  {EXTRAS.map((extra) => (
                    <div key={extra.id}>
                      <button
                        onClick={() => toggleExtra(extra.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all ${
                          selectedExtras.includes(extra.id)
                            ? "border-brand-gold bg-brand-gold/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedExtras.includes(extra.id)
                              ? "border-brand-gold bg-brand-gold"
                              : "border-white/30"
                          }`}>
                            {selectedExtras.includes(extra.id) && (
                              <CheckCircle className="w-3.5 h-3.5 text-brand-charcoal" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm" style={{ fontFamily: "var(--font-body)" }}>{extra.name}</p>
                            <p className="text-white/40 text-xs" style={{ fontFamily: "var(--font-body)" }}>{extra.description}</p>
                          </div>
                        </div>
                        {"isPercentage" in extra && extra.isPercentage ? (
                          <span className="text-brand-gold text-sm font-bold shrink-0" style={{ fontFamily: "var(--font-body)" }}>
                            +{extra.percentage}%
                          </span>
                        ) : "isLineal" in extra && extra.isLineal ? (
                          <span className="text-brand-gold text-sm font-bold shrink-0" style={{ fontFamily: "var(--font-body)" }}>
                            ${extra.lowPerM2}–${extra.highPerM2}/lm
                          </span>
                        ) : (
                          <span className="text-brand-gold text-sm font-bold shrink-0" style={{ fontFamily: "var(--font-body)" }}>
                            +${extra.lowPerM2}–${extra.highPerM2}/m²
                          </span>
                        )}
                      </button>
                      {extra.id === "retaining" && selectedExtras.includes("retaining") && (
                        <div className="mt-2 ml-8 flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={retainingMetres}
                            onChange={(e) => setRetainingMetres(e.target.value)}
                            placeholder="e.g. 10"
                            className="w-28 bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none"
                            style={{ fontFamily: "var(--font-body)" }}
                          />
                          <span className="text-white/50 text-sm" style={{ fontFamily: "var(--font-body)" }}>lineal metres</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Calculate Button */}
              <Button
                onClick={() => {
                  setShowResult(true);
                  // Track calculator usage as high-intent engagement
                  const selectedFinish = FINISH_TYPES.find(ft => ft.id === finishType);
                  const areaNum = parseFloat(area) || 0;
                  const midPrice = selectedFinish ? ((selectedFinish.lowPerM2 + selectedFinish.highPerM2) / 2) * areaNum : 0;
                  trackCalculatorUse(selectedFinish?.name || 'Unknown', Math.round(midPrice));
                }}
                disabled={!area || !finishType || parseFloat(area) <= 0}
                size="lg"
                className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold py-6 text-lg tracking-wide uppercase shadow-xl shadow-brand-gold/20 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-gold/30 disabled:opacity-40"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calculate My Estimate
              </Button>
            </div>

            {/* Right — Results Panel (sticky) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-28">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 lg:p-8"
                >
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                    <TrendingUp className="w-5 h-5 text-brand-gold" />
                    Your Estimate
                  </h3>

                  {estimate && showResult ? (
                    <div>
                      <div className="text-center py-6 border-b border-white/10 mb-6">
                        <p className="text-white/50 text-sm mb-2" style={{ fontFamily: "var(--font-body)" }}>Estimated project cost</p>
                        <p className="text-3xl lg:text-4xl font-bold text-brand-gold" style={{ fontFamily: "var(--font-heading)" }}>
                          ${estimate.low.toLocaleString()} – ${estimate.high.toLocaleString()}
                        </p>
                        <p className="text-white/40 text-sm mt-2" style={{ fontFamily: "var(--font-body)" }}>
                          Based on {area}m² of {selectedFinish?.name}
                        </p>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                          <span className="text-white/50">Base rate</span>
                          <span className="text-white font-medium">${estimate.perM2Low}–${estimate.perM2High}/m²</span>
                        </div>
                        <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                          <span className="text-white/50">Area</span>
                          <span className="text-white font-medium">{area} m²</span>
                        </div>
                        {selectedExtras.length > 0 && (
                          <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                            <span className="text-white/50">Extras</span>
                            <span className="text-white font-medium">{selectedExtras.length} selected</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-lg p-4 mb-6">
                        <p className="text-white/70 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                          <Info className="w-3.5 h-3.5 inline mr-1 text-brand-gold" />
                          This is an indicative estimate only. Final pricing depends on site conditions, access, soil type, and specific requirements. Contact us for a free, accurate on-site quote.
                        </p>
                      </div>

                      <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="block w-full">
                        <Button
                          size="lg"
                          className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold py-5 text-base tracking-wide uppercase shadow-lg"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call for Exact Quote
                        </Button>
                      </a>
                      <Link href="/get-quote">
                        <span className="block w-full mt-3 text-center text-brand-gold hover:text-brand-gold-dark text-sm font-semibold cursor-pointer transition-colors" style={{ fontFamily: "var(--font-body)" }}>
                          Or fill out our quote form <ArrowRight className="w-3.5 h-3.5 inline" />
                        </span>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calculator className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                        Select your options and click "Calculate" to see your estimate.
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Trust signals */}
                <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h4 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-body)" }}>
                    Why Choose Us
                  </h4>
                  <ul className="space-y-3">
                    {[
                      "QBCC Licensed #15299707",
                      "Free on-site quotes within 24hrs",
                      "Fully insured — public liability",
                      "20+ years combined experience",
                      "Brisbane's trusted concreters",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-white/60 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                        <CheckCircle className="w-4 h-4 text-brand-gold shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Guide Section — SEO content */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8" style={{ fontFamily: "var(--font-heading)" }}>
              Concrete Pricing Guide Brisbane <span className="text-brand-gold">2025/2026</span>
            </h2>

            <div className="prose prose-invert max-w-none" style={{ fontFamily: "var(--font-body)" }}>
              <p className="text-white/70 leading-relaxed mb-6">
                The cost of concrete in Brisbane varies depending on the type of finish, the size of the area, site preparation requirements, and accessibility. Below is a comprehensive pricing guide based on current Brisbane market rates to help you budget for your next concreting project.
              </p>

              {/* Pricing Table */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-brand-gold font-semibold">Finish Type</th>
                      <th className="text-left py-3 px-4 text-brand-gold font-semibold">Price per m²</th>
                      <th className="text-left py-3 px-4 text-brand-gold font-semibold">50m² Estimate</th>
                      <th className="text-left py-3 px-4 text-brand-gold font-semibold">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { finish: "Plain Concrete", range: "$75 – $95", est50: "$3,750 – $4,750", best: "Slabs, paths, utility areas" },
                      { finish: "Coloured Concrete", range: "$85 – $120", est50: "$4,250 – $6,000", best: "Driveways, patios, pool surrounds" },
                      { finish: "Exposed Aggregate", range: "$110 – $160", est50: "$5,500 – $8,000", best: "Driveways, entertaining areas" },
                      { finish: "Stencilled / Stamped", range: "$100 – $150", est50: "$5,000 – $7,500", best: "Feature driveways, patios" },
                      { finish: "Covercrete", range: "$80 – $130", est50: "$4,000 – $6,500", best: "Resurfacing existing concrete" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 text-white font-medium">{row.finish}</td>
                        <td className="py-3 px-4 text-white/70">{row.range}</td>
                        <td className="py-3 px-4 text-brand-gold font-semibold">{row.est50}</td>
                        <td className="py-3 px-4 text-white/50">{row.best}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                What Affects Concrete Pricing in Brisbane?
              </h3>
              <p className="text-white/70 leading-relaxed mb-4">
                Several factors influence the final cost of your concrete project. <strong className="text-white">Site preparation</strong> is often the biggest variable — if your site needs excavation, soil removal, or old concrete demolition, this adds $18–$35 per square metre. <strong className="text-white">Access difficulty</strong> can add 10-15% if machinery can't reach the pour area easily.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">Reinforcement type</strong> also matters — standard SL72 mesh is included in most quotes, but thicker slabs or driveways may require SL82 or rebar, adding $5–$15/m². <strong className="text-white">Concrete strength</strong> varies by application: 20MPa for paths, 25MPa for residential driveways, and 32MPa+ for commercial or heavy-vehicle areas.
              </p>
              <p className="text-white/70 leading-relaxed mb-6">
                Brisbane's subtropical climate also plays a role — concrete poured in summer needs extra care with curing compounds and timing to prevent cracking. At Concrete Concepts Group, we factor all of these variables into our free on-site quotes so there are no surprises.
              </p>

              <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                How to Get the Best Value on Your Concrete Project
              </h3>
              <p className="text-white/70 leading-relaxed mb-4">
                The best way to save money on concreting is to <strong className="text-white">get multiple quotes</strong> from QBCC licensed concreters. Always check that quotes include GST, site preparation, formwork, reinforcement, concrete supply, finishing, and curing. Beware of quotes that seem too low — they often exclude essential items like excavation or reinforcement.
              </p>
              <p className="text-white/70 leading-relaxed mb-6">
                At Concrete Concepts Group, our quotes are fully inclusive with no hidden costs. We're QBCC Licensed (#15299707), fully insured, and back every project with a quality guarantee. Call <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="text-brand-gold hover:underline font-semibold">0424 463 268</a> for a free on-site quote.
              </p>
              <p className="text-white/70 leading-relaxed mt-4 p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-lg" style={{ fontFamily: "var(--font-body)" }}>
                <strong className="text-brand-gold">Flexible payment options may be available</strong> for larger projects. Ask us about progress payments and tailored arrangements when you request your free quote.
              </p>
            </div>

            {/* Internal links */}
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <Link href="/services/concrete-driveways-brisbane">
                <span className="block p-4 bg-white/5 border border-white/10 rounded-lg hover:border-brand-gold/30 transition-colors cursor-pointer">
                  <p className="text-brand-gold text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-body)" }}>Concrete Driveways</p>
                  <p className="text-white/50 text-xs" style={{ fontFamily: "var(--font-body)" }}>From $75/m² — expert installation & replacement</p>
                </span>
              </Link>
              <Link href="/services/exposed-aggregate-brisbane">
                <span className="block p-4 bg-white/5 border border-white/10 rounded-lg hover:border-brand-gold/30 transition-colors cursor-pointer">
                  <p className="text-brand-gold text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-body)" }}>Exposed Aggregate</p>
                  <p className="text-white/50 text-xs" style={{ fontFamily: "var(--font-body)" }}>Premium stone finishes from $110/m²</p>
                </span>
              </Link>
              <Link href="/services/concrete-slabs-brisbane">
                <span className="block p-4 bg-white/5 border border-white/10 rounded-lg hover:border-brand-gold/30 transition-colors cursor-pointer">
                  <p className="text-brand-gold text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-body)" }}>Concrete Slabs</p>
                  <p className="text-white/50 text-xs" style={{ fontFamily: "var(--font-body)" }}>House slabs, shed slabs & foundations</p>
                </span>
              </Link>
              <Link href="/areas">
                <span className="block p-4 bg-white/5 border border-white/10 rounded-lg hover:border-brand-gold/30 transition-colors cursor-pointer">
                  <p className="text-brand-gold text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-body)" }}>Service Areas</p>
                  <p className="text-white/50 text-xs" style={{ fontFamily: "var(--font-body)" }}>We service all of Brisbane & SEQ</p>
                </span>
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
