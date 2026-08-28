/*
  FinishesVisualizer: Interactive concrete finishes selector & comparison tool
  SEO target: "concrete finishes Brisbane", "exposed aggregate vs coloured concrete"
  Helps customers visualise different finishes before requesting a quote
  Drives conversions by linking directly to quote form with pre-selected finish
*/
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  ArrowRight,
  Phone,
  CheckCircle,
  Star,
  Layers,
  Palette,
  Shield,
  DollarSign,
  Sparkles,
  ArrowLeftRight,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { trackPhoneCallClick } from "@/components/ConversionTracking";

/* ------------------------------------------------------------------ */
/*  Finish Data                                                        */
/* ------------------------------------------------------------------ */

interface ConcreteFinish {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  image: string;
  priceRange: string;
  pricePerM2Low: number;
  pricePerM2High: number;
  durability: number; // 1-5
  maintenance: number; // 1-5 (1 = low maintenance)
  slipResistance: number; // 1-5
  aesthetics: number; // 1-5
  popularity: number; // 1-5
  bestFor: string[];
  colours: string[];
  pros: string[];
  cons: string[];
  lifespan: string;
}

const FINISHES: ConcreteFinish[] = [
  {
    id: "plain",
    name: "Plain Concrete (Broom Finish)",
    shortName: "Plain",
    tagline: "The reliable all-rounder",
    description:
      "Standard grey concrete with a broom-swept texture for grip. The most cost-effective option that delivers excellent durability. Perfect for driveways, paths, and utility slabs where function matters most.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/plain-broom_deeb2afb.jpg",
    priceRange: "$75 – $95 per m²",
    pricePerM2Low: 75,
    pricePerM2High: 95,
    durability: 5,
    maintenance: 1,
    slipResistance: 4,
    aesthetics: 2,
    popularity: 3,
    bestFor: ["Driveways", "Paths", "Garage slabs", "Utility areas", "Sheds"],
    colours: ["Natural grey"],
    pros: [
      "Most affordable option",
      "Extremely durable",
      "Low maintenance",
      "Good slip resistance with broom finish",
      "Quick installation",
    ],
    cons: [
      "Limited aesthetic appeal",
      "Single colour only",
      "Can stain over time without sealing",
    ],
    lifespan: "30+ years",
  },
  {
    id: "coloured",
    name: "Coloured Concrete",
    shortName: "Coloured",
    tagline: "Colour that goes all the way through",
    description:
      "Integral oxide pigments are mixed throughout the concrete, creating a consistent colour that won't fade or peel. Available in a wide range of earth tones from charcoal to sandstone. A step up from plain concrete with minimal extra cost.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/coloured-concrete_b698e769.jpg",
    priceRange: "$85 – $120 per m²",
    pricePerM2Low: 85,
    pricePerM2High: 120,
    durability: 5,
    maintenance: 2,
    slipResistance: 4,
    aesthetics: 3,
    popularity: 4,
    bestFor: [
      "Driveways",
      "Patios",
      "Pool surrounds",
      "Paths",
      "Entertaining areas",
    ],
    colours: [
      "Charcoal",
      "Slate Grey",
      "Sandstone",
      "Terracotta",
      "Tan",
      "Dark Brown",
    ],
    pros: [
      "Colour throughout — won't chip or peel",
      "Wide range of natural tones",
      "Moderate cost increase over plain",
      "Pairs well with any home style",
      "Can be sealed for extra shine",
    ],
    cons: [
      "Colour may vary slightly between batches",
      "Limited to earth tones (no bright colours)",
      "Needs resealing every 3–5 years for best look",
    ],
    lifespan: "30+ years",
  },
  {
    id: "exposed",
    name: "Exposed Aggregate",
    shortName: "Exposed Agg",
    tagline: "Brisbane's most popular premium finish",
    description:
      "The top layer of cement is washed away to reveal the natural stone aggregate beneath — creating a stunning, textured surface with excellent grip. By far the most requested finish in South East Queensland for driveways and outdoor areas.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate_cd1c28fa.jpg",
    priceRange: "$110 – $160 per m²",
    pricePerM2Low: 110,
    pricePerM2High: 160,
    durability: 5,
    maintenance: 2,
    slipResistance: 5,
    aesthetics: 5,
    popularity: 5,
    bestFor: [
      "Driveways",
      "Pool surrounds",
      "Patios",
      "Entertaining areas",
      "Front paths",
    ],
    colours: [
      "Natural stone mix",
      "Gold/Tan blend",
      "Charcoal blend",
      "Cream blend",
    ],
    pros: [
      "Stunning natural stone appearance",
      "Excellent slip resistance (even when wet)",
      "Hides dirt and tyre marks well",
      "Adds significant property value",
      "Unique — no two surfaces are identical",
    ],
    cons: [
      "Higher cost than plain or coloured",
      "Requires sealing every 2–3 years",
      "Rough texture can be uncomfortable barefoot",
    ],
    lifespan: "30+ years",
  },
  {
    id: "stamped",
    name: "Stamped / Stencilled Concrete",
    shortName: "Stamped",
    tagline: "The look of stone at a fraction of the cost",
    description:
      "Freshly poured concrete is stamped with patterns that replicate natural stone, brick, slate, or tile. Combined with colour hardeners, it creates a decorative surface that looks like premium paving without the joints and weeds.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/stamped-concrete_75630ce4.jpg",
    priceRange: "$100 – $150 per m²",
    pricePerM2Low: 100,
    pricePerM2High: 150,
    durability: 4,
    maintenance: 3,
    slipResistance: 3,
    aesthetics: 5,
    popularity: 3,
    bestFor: [
      "Patios",
      "Entertaining areas",
      "Front entries",
      "Pool surrounds",
      "Feature paths",
    ],
    colours: [
      "Sandstone",
      "Slate Grey",
      "Terracotta",
      "Cobblestone",
      "Ashlar Stone",
    ],
    pros: [
      "Replicates expensive natural stone",
      "Huge range of patterns and colours",
      "No joints for weeds to grow through",
      "Impressive visual impact",
      "Customisable to match your home",
    ],
    cons: [
      "Requires resealing every 2–3 years",
      "Can be slippery when wet (needs anti-slip additive)",
      "Colour release agent can wear unevenly",
      "More complex installation process",
    ],
    lifespan: "25+ years",
  },
  {
    id: "honed",
    name: "Honed / Polished Concrete",
    shortName: "Honed",
    tagline: "Sleek, modern, and sophisticated",
    description:
      "The concrete surface is mechanically ground and polished to reveal the aggregate and create a smooth, semi-glossy finish. Popular for modern homes and commercial spaces. Can be combined with coloured concrete for striking results.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/honed-polished_18761be0.jpg",
    priceRange: "$120 – $180 per m²",
    pricePerM2Low: 120,
    pricePerM2High: 180,
    durability: 5,
    maintenance: 2,
    slipResistance: 2,
    aesthetics: 5,
    popularity: 3,
    bestFor: [
      "Indoor floors",
      "Modern patios",
      "Commercial spaces",
      "Feature driveways",
      "Showrooms",
    ],
    colours: [
      "Natural grey",
      "Charcoal",
      "Cream",
      "Salt & Pepper",
      "Custom oxide",
    ],
    pros: [
      "Ultra-modern, sleek appearance",
      "Extremely durable surface",
      "Easy to clean and maintain",
      "Reflective surface brightens spaces",
      "Pairs beautifully with modern architecture",
    ],
    cons: [
      "Can be slippery when wet (outdoor use needs anti-slip)",
      "Higher cost — labour-intensive grinding process",
      "Requires professional equipment",
    ],
    lifespan: "30+ years",
  },
];

/* ------------------------------------------------------------------ */
/*  Rating bar helper                                                  */
/* ------------------------------------------------------------------ */

function RatingBar({ value, max = 5, label }: { value: number; max?: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-sm text-brand-charcoal/70 w-28 shrink-0"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
      <div className="flex gap-1 flex-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 flex-1 rounded-full transition-colors ${
              i < value ? "bg-brand-gold" : "bg-brand-charcoal/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Comparison Table                                                   */
/* ------------------------------------------------------------------ */

function ComparisonModal({
  finishA,
  finishB,
  onClose,
}: {
  finishA: ConcreteFinish;
  finishB: ConcreteFinish;
  onClose: () => void;
}) {
  const rows = [
    { label: "Price Range", a: finishA.priceRange, b: finishB.priceRange },
    { label: "Lifespan", a: finishA.lifespan, b: finishB.lifespan },
    {
      label: "Durability",
      a: `${finishA.durability}/5`,
      b: `${finishB.durability}/5`,
    },
    {
      label: "Maintenance",
      a: finishA.maintenance <= 2 ? "Low" : finishA.maintenance <= 3 ? "Medium" : "High",
      b: finishB.maintenance <= 2 ? "Low" : finishB.maintenance <= 3 ? "Medium" : "High",
    },
    {
      label: "Slip Resistance",
      a: `${finishA.slipResistance}/5`,
      b: `${finishB.slipResistance}/5`,
    },
    {
      label: "Aesthetics",
      a: `${finishA.aesthetics}/5`,
      b: `${finishB.aesthetics}/5`,
    },
    {
      label: "Best For",
      a: finishA.bestFor.slice(0, 3).join(", "),
      b: finishB.bestFor.slice(0, 3).join(", "),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-brand-charcoal/10 flex items-center justify-between">
          <h3
            className="text-xl font-bold text-brand-charcoal"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <ArrowLeftRight className="w-5 h-5 inline mr-2 text-brand-gold" />
            {finishA.shortName} vs {finishB.shortName}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-charcoal/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-brand-charcoal/60" />
          </button>
        </div>

        {/* Images side by side */}
        <div className="grid grid-cols-2 gap-0">
          <div className="relative">
            <img
              src={finishA.image}
              alt={finishA.name}
              width={400}
              height={160}
              className="w-full h-40 object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <span className="text-white text-sm font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                {finishA.shortName}
              </span>
            </div>
          </div>
          <div className="relative">
            <img
              src={finishB.image}
              alt={finishB.name}
              width={400}
              height={160}
              className="w-full h-40 object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <span className="text-white text-sm font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                {finishB.shortName}
              </span>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-charcoal/10">
                <th
                  className="text-left text-sm font-semibold text-brand-charcoal/60 pb-3 w-1/3"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Feature
                </th>
                <th
                  className="text-center text-sm font-semibold text-brand-charcoal pb-3 w-1/3"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {finishA.shortName}
                </th>
                <th
                  className="text-center text-sm font-semibold text-brand-charcoal pb-3 w-1/3"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {finishB.shortName}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? "bg-brand-offwhite/50" : ""}
                >
                  <td
                    className="py-3 px-2 text-sm font-medium text-brand-charcoal/70"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {row.label}
                  </td>
                  <td
                    className="py-3 px-2 text-sm text-center text-brand-charcoal"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {row.a}
                  </td>
                  <td
                    className="py-3 px-2 text-sm text-center text-brand-charcoal"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {row.b}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href={`/get-quote?finish=${finishA.id}`} className="flex-1">
              <Button className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold">
                Quote for {finishA.shortName}
              </Button>
            </Link>
            <Link href={`/get-quote?finish=${finishB.id}`} className="flex-1">
              <Button className="w-full bg-brand-charcoal hover:bg-brand-charcoal-light text-white font-semibold">
                Quote for {finishB.shortName}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function FinishesVisualizer() {
  const [selectedFinish, setSelectedFinish] = useState<string>("exposed");
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const activeFinish = useMemo(
    () => FINISHES.find((f) => f.id === selectedFinish) || FINISHES[2],
    [selectedFinish]
  );

  const handleCompareToggle = (id: string) => {
    if (compareA === id) {
      setCompareA(compareB);
      setCompareB(null);
    } else if (compareB === id) {
      setCompareB(null);
    } else if (!compareA) {
      setCompareA(id);
    } else if (!compareB) {
      setCompareB(id);
    } else {
      // Both slots full — replace B
      setCompareB(id);
    }
  };

  const canCompare = compareA && compareB;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Concrete Finishes Visualizer — Compare Finishes | Concrete Concepts Group",
      description:
        "Explore and compare concrete finishes side by side. See exposed aggregate, coloured concrete, stamped, honed, and plain finishes with Brisbane pricing.",
      url: "https://concreteconceptsgroup.com/finishes",
      publisher: {
        "@type": "Organization",
        name: "Concrete Concepts Group",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Concrete Finish Types",
      itemListElement: FINISHES.map((f, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: f.name,
        description: f.description,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title="Concrete Finishes Visualizer — Compare Finishes | Concrete Concepts Group"
        description="Explore and compare concrete finishes side by side. See exposed aggregate, coloured concrete, stamped, honed, and plain finishes with Brisbane pricing and durability ratings."
        canonical="/finishes"
        keywords="concrete finishes Brisbane, exposed aggregate vs coloured concrete, stamped concrete Brisbane, honed concrete, concrete finish comparison, concrete driveway finishes"
        structuredData={structuredData}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-brand-charcoal pt-28 pb-16 lg:pt-36 lg:pb-20 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container relative z-10">
          <Breadcrumbs
            items={[{ label: "Concrete Finishes", href: undefined }]}
            className="mb-6"
          />

          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span
                className="inline-flex items-center gap-2 text-brand-gold text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Palette className="w-4 h-4" />
                Interactive Finish Guide
              </span>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Concrete Finishes{" "}
                <span className="text-brand-gold">Visualizer</span>
              </h1>
              <p
                className="text-lg text-white/70 leading-relaxed max-w-2xl"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Not sure which concrete finish is right for your project? Explore
                our interactive guide to compare finishes, see real photos, and
                understand pricing — then request a free quote for your favourite.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Finish Selector Tabs */}
      <section className="bg-white border-b border-brand-charcoal/10 sticky top-20 lg:top-24 z-30">
        <div className="container">
          <div className="flex overflow-x-auto gap-1 py-3 scrollbar-hide">
            {FINISHES.map((finish) => (
              <button
                key={finish.id}
                onClick={() => setSelectedFinish(finish.id)}
                className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  selectedFinish === finish.id
                    ? "bg-brand-gold text-brand-charcoal shadow-md"
                    : "bg-brand-charcoal/5 text-brand-charcoal/60 hover:bg-brand-charcoal/10 hover:text-brand-charcoal"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {finish.shortName}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content — Selected Finish Detail */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFinish.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-2 gap-8 lg:gap-12"
            >
              {/* Image */}
              <div className="relative rounded-xl overflow-hidden shadow-xl group">
                <img
                  src={activeFinish.image}
                  alt={`${activeFinish.name} concrete finish example in Brisbane`}
                  width={800}
                  height={480}
                  className="w-full h-72 sm:h-80 lg:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute top-4 left-4 bg-brand-gold text-brand-charcoal px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  {activeFinish.priceRange}
                </div>
                {activeFinish.id === "exposed" && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-brand-charcoal px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                    Most Popular
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                <span
                  className="text-brand-gold text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {activeFinish.tagline}
                </span>
                <h2
                  className="text-3xl lg:text-4xl font-bold text-brand-charcoal mt-2 mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {activeFinish.name}
                </h2>
                <p
                  className="text-brand-charcoal/70 leading-relaxed mb-6"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {activeFinish.description}
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-brand-offwhite rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-brand-gold" />
                      <span
                        className="text-xs font-semibold text-brand-charcoal/60 uppercase"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        Price Range
                      </span>
                    </div>
                    <span
                      className="text-lg font-bold text-brand-charcoal"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {activeFinish.priceRange}
                    </span>
                  </div>
                  <div className="bg-brand-offwhite rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-brand-gold" />
                      <span
                        className="text-xs font-semibold text-brand-charcoal/60 uppercase"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        Lifespan
                      </span>
                    </div>
                    <span
                      className="text-lg font-bold text-brand-charcoal"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {activeFinish.lifespan}
                    </span>
                  </div>
                </div>

                {/* Rating bars */}
                <div className="space-y-3 mb-6">
                  <RatingBar value={activeFinish.durability} label="Durability" />
                  <RatingBar value={activeFinish.maintenance} label="Maintenance" />
                  <RatingBar
                    value={activeFinish.slipResistance}
                    label="Slip Resistance"
                  />
                  <RatingBar value={activeFinish.aesthetics} label="Aesthetics" />
                  <RatingBar value={activeFinish.popularity} label="Popularity" />
                </div>

                {/* Best for */}
                <div className="mb-6">
                  <h3
                    className="text-sm font-semibold text-brand-charcoal/60 uppercase tracking-wider mb-2"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Best For
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeFinish.bestFor.map((use) => (
                      <span
                        key={use}
                        className="bg-brand-gold/10 text-brand-charcoal px-3 py-1 rounded-full text-sm font-medium"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available colours */}
                <div className="mb-6">
                  <h3
                    className="text-sm font-semibold text-brand-charcoal/60 uppercase tracking-wider mb-2"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Available Colours
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeFinish.colours.map((colour) => (
                      <span
                        key={colour}
                        className="bg-brand-charcoal/5 text-brand-charcoal/80 px-3 py-1 rounded-full text-sm"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <Palette className="w-3 h-3 inline mr-1" />
                        {colour}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/get-quote?finish=${activeFinish.id}`}>
                    <Button className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-6 py-3 text-base shadow-lg shadow-brand-gold/20">
                      Get a Free Quote
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <a
                    href="tel:0424463268"
                    onClick={() => trackPhoneCallClick()}
                  >
                    <Button
                      variant="outline"
                      className="border-brand-charcoal/20 text-brand-charcoal font-semibold px-6 py-3 text-base"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      0424 463 268
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Pros & Cons */}
      <section className="py-12 bg-white">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={`proscons-${activeFinish.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              <div className="bg-green-50 rounded-xl p-6">
                <h3
                  className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Pros
                </h3>
                <ul className="space-y-2">
                  {activeFinish.pros.map((pro) => (
                    <li
                      key={pro}
                      className="flex items-start gap-2 text-sm text-green-900/80"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 rounded-xl p-6">
                <h3
                  className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <Info className="w-5 h-5" />
                  Considerations
                </h3>
                <ul className="space-y-2">
                  {activeFinish.cons.map((con) => (
                    <li
                      key={con}
                      className="flex items-start gap-2 text-sm text-amber-900/80"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Compare Section */}
      <section className="py-12 lg:py-16 bg-brand-offwhite">
        <div className="container">
          <div className="text-center mb-8">
            <h2
              className="text-3xl lg:text-4xl font-bold text-brand-charcoal mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Compare Finishes{" "}
              <span className="text-brand-gold">Side by Side</span>
            </h2>
            <p
              className="text-brand-charcoal/60 max-w-xl mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Select two finishes to compare their features, pricing, and
              suitability for your project.
            </p>
          </div>

          {/* Finish selection grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto mb-8">
            {FINISHES.map((finish) => {
              const isSelected =
                compareA === finish.id || compareB === finish.id;
              return (
                <button
                  key={finish.id}
                  onClick={() => handleCompareToggle(finish.id)}
                  className={`relative rounded-xl overflow-hidden shadow-md transition-all duration-300 group ${
                    isSelected
                      ? "ring-3 ring-brand-gold scale-[1.02]"
                      : "hover:shadow-lg hover:scale-[1.01]"
                  }`}
                >
                  <img
                    src={finish.image}
                    alt={finish.name}
                    width={200}
                    height={128}
                    className="w-full h-28 sm:h-32 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span
                      className="text-white text-sm font-semibold"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {finish.shortName}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-brand-gold text-brand-charcoal w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      {compareA === finish.id ? "A" : "B"}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Compare button */}
          <div className="text-center">
            <Button
              onClick={() => canCompare && setShowComparison(true)}
              disabled={!canCompare}
              className="bg-brand-charcoal hover:bg-brand-charcoal-light text-white font-semibold px-8 py-3 text-base disabled:opacity-40"
            >
              <ArrowLeftRight className="w-5 h-5 mr-2" />
              {canCompare
                ? `Compare ${FINISHES.find((f) => f.id === compareA)?.shortName} vs ${FINISHES.find((f) => f.id === compareB)?.shortName}`
                : compareA
                  ? "Select one more finish to compare"
                  : "Select two finishes to compare"}
            </Button>
          </div>
        </div>
      </section>

      {/* All Finishes Overview Table */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container">
          <h2
            className="text-3xl lg:text-4xl font-bold text-brand-charcoal text-center mb-8"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            All Finishes at a Glance
          </h2>

          <div className="overflow-x-auto rounded-xl shadow-lg">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-brand-charcoal text-white">
                  <th
                    className="text-left py-4 px-4 text-sm font-semibold"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Finish
                  </th>
                  <th
                    className="text-center py-4 px-4 text-sm font-semibold"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Price / m²
                  </th>
                  <th
                    className="text-center py-4 px-4 text-sm font-semibold"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Durability
                  </th>
                  <th
                    className="text-center py-4 px-4 text-sm font-semibold"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Maintenance
                  </th>
                  <th
                    className="text-center py-4 px-4 text-sm font-semibold"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Slip Resistance
                  </th>
                  <th
                    className="text-center py-4 px-4 text-sm font-semibold"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Aesthetics
                  </th>
                  <th
                    className="text-center py-4 px-4 text-sm font-semibold"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Lifespan
                  </th>
                </tr>
              </thead>
              <tbody>
                {FINISHES.map((finish, i) => (
                  <tr
                    key={finish.id}
                    className={`border-b border-brand-charcoal/5 cursor-pointer transition-colors hover:bg-brand-gold/5 ${
                      i % 2 === 0 ? "bg-white" : "bg-brand-offwhite/50"
                    }`}
                    onClick={() => setSelectedFinish(finish.id)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={finish.image}
                          alt={finish.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        <div>
                          <span
                            className="text-sm font-semibold text-brand-charcoal block"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {finish.shortName}
                          </span>
                          {finish.id === "exposed" && (
                            <span className="text-[10px] text-brand-gold font-bold uppercase">
                              Most Popular
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td
                      className="py-4 px-4 text-center text-sm text-brand-charcoal"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      ${finish.pricePerM2Low}–${finish.pricePerM2High}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div
                            key={j}
                            className={`w-3 h-3 rounded-full ${
                              j < finish.durability
                                ? "bg-brand-gold"
                                : "bg-brand-charcoal/10"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          finish.maintenance <= 2
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {finish.maintenance <= 2 ? "Low" : "Medium"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div
                            key={j}
                            className={`w-3 h-3 rounded-full ${
                              j < finish.slipResistance
                                ? "bg-blue-400"
                                : "bg-brand-charcoal/10"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`w-3.5 h-3.5 ${
                              j < finish.aesthetics
                                ? "text-brand-gold fill-brand-gold"
                                : "text-brand-charcoal/15"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td
                      className="py-4 px-4 text-center text-sm text-brand-charcoal font-medium"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {finish.lifespan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-charcoal relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="container relative z-10 text-center">
          <Sparkles className="w-8 h-8 text-brand-gold mx-auto mb-4" />
          <h2
            className="text-3xl lg:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to Choose Your{" "}
            <span className="text-brand-gold">Perfect Finish?</span>
          </h2>
          <p
            className="text-white/70 max-w-xl mx-auto mb-8 text-lg"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Our team can help you select the ideal finish for your project. Get a
            free, no-obligation quote with finish recommendations tailored to your
            home and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-quote">
              <Button className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-8 py-3 text-lg shadow-lg shadow-brand-gold/20">
                Get a Free Quote
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a
              href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
            >
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call 0424 463 268
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <StickyMobileCTA />

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && compareA && compareB && (
          <ComparisonModal
            finishA={FINISHES.find((f) => f.id === compareA)!}
            finishB={FINISHES.find((f) => f.id === compareB)!}
            onClose={() => setShowComparison(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
