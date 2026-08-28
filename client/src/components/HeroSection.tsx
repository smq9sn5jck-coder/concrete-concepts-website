import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, FileText, MapPin, Phone, Shield, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { saveQuoteDraft } from "@/lib/quoteDraft";
import { trackPhoneCallClick } from "@/components/ConversionTracking";
import { trackCTAClick, trackFormFieldComplete, trackFormFieldFocus } from "@/components/GodModeTracking";
import { classifyServiceArea } from "@shared/leadValidation";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-hero_a3bbd489.png";
const HERO_VIDEO_WEBM = "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-hero-video.webm";
const HERO_VIDEO_MP4 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-hero-video.mp4";
const HERO_POSTER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/static/hero-poster.jpg";

const SERVICES = [
  ["driveway", "Driveway"],
  ["slab", "Concrete slab"],
  ["patio", "Patio / entertaining area"],
  ["pool-surround", "Pool surround"],
  ["retaining-wall", "Retaining wall"],
  ["pathway", "Pathway / footpath"],
  ["exposed-aggregate", "Exposed aggregate"],
  ["stairs", "Stairs / steps"],
  ["excavation", "Excavation"],
  ["crossover", "Crossover / vehicle crossing"],
  ["commercial", "Commercial project"],
  ["other", "Other"],
] as const;

function getUrgencyText() {
  const month = new Intl.DateTimeFormat("en-AU", { month: "long" }).format(new Date());
  return `${month} Bookings Almost Full — Get Your Free Quote Before Slots Fill`;
}

function QuoteCounter() {
  const { data } = trpc.quote.monthlyCount.useQuery(undefined, {
    staleTime: 5 * 60 * 1_000,
    refetchOnWindowFocus: false,
  });
  if (!data) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-sm font-medium text-white/90">
        <strong className="text-white">{data.count}+ quotes</strong> requested in {data.month}
      </span>
    </motion.div>
  );
}

export default function HeroSection() {
  const [formData, setFormData] = useState({ service: "", location: "", description: "" });

  const handleContinue = (event: React.FormEvent) => {
    event.preventDefault();
    trackCTAClick("hero_quote_continue", "hero");
    if (!formData.service) {
      toast.error("Select the concrete service you need.");
      return;
    }
    if (formData.location.trim().length < 2) {
      toast.error("Enter the project suburb or postcode.");
      return;
    }
    const area = classifyServiceArea(formData.location);
    if (!area.canSubmit) {
      toast.error(area.message);
      return;
    }
    saveQuoteDraft({
      services: [formData.service],
      suburb: formData.location.trim(),
      description: formData.description.trim(),
    });
    window.location.assign("/get-quote");
  };

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-brand-charcoal">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-20 bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold px-4 py-2.5 text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-4 w-4 animate-pulse text-brand-charcoal" />
          <span className="text-sm font-bold tracking-wide text-brand-charcoal">{getUrgencyText()}</span>
        </div>
      </motion.div>

      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" poster={HERO_POSTER_URL}>
          <source src={HERO_VIDEO_WEBM} type="video/webm" />
          <source src={HERO_VIDEO_MP4} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-brand-charcoal/80" />
      </div>
      <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "48px 48px" }} />
      <div className="absolute left-0 top-0 z-[1] h-[600px] w-[600px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-gold/5 blur-[150px]" />
      <div className="absolute bottom-0 right-0 z-[1] h-[500px] w-[500px] translate-x-1/4 translate-y-1/4 rounded-full bg-brand-gold/5 blur-[120px]" />

      <div className="container relative z-10 flex flex-1 items-center pb-16 pt-28 lg:pb-24 lg:pt-32">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-6 animate-fade-in-scale lg:mb-8">
              <img src={LOGO_URL} alt="Concrete Concepts Group Brisbane concreting services" width={768} height={512} loading="eager" decoding="sync" fetchPriority="high" className="h-auto w-[220px] object-contain sm:w-[280px] md:w-[340px] lg:w-[400px]" />
            </div>
            <h1 className="mb-4 animate-fade-in-up text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl xl:text-6xl" style={{ animationDelay: "0.3s" }}>
              Your Concrete, <span className="italic text-brand-gold">Our Expertise</span>
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }} className="mb-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Driveways, slabs, patios and more — serving Brisbane and surrounding South East Queensland areas.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }} className="mb-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-brand-gold text-brand-gold" />)}</div>
                <span className="text-sm font-bold text-white">4.9/5 Google Reviews</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5">
                <Shield className="h-5 w-5 text-brand-gold" />
                <span className="text-sm font-bold text-white">QBCC Licensed #15299707</span>
              </div>
            </motion.div>
            <QuoteCounter />
            <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="inline-flex items-center gap-2 text-lg font-bold text-brand-gold transition-colors hover:text-brand-gold-light lg:hidden">
              <Phone className="h-5 w-5" />0424 463 268
            </a>
          </div>

          <motion.form initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.6 }} onSubmit={handleContinue} className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">
            <div className="mb-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">Start your detailed quote</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Tell us the basics</h2>
              <p className="mt-1 text-sm text-white/55">We’ll carry these answers into the full job form.</p>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="sr-only">Concrete service required</span>
                <select value={formData.service} onChange={(event) => setFormData((current) => ({ ...current, service: event.target.value }))} onFocus={() => trackFormFieldFocus("service", "hero_quote_prefill")} onBlur={(event) => event.target.value && trackFormFieldComplete("service", "hero_quote_prefill")} required className="w-full rounded-lg border border-white/15 bg-[#292929] px-4 py-4 text-base text-white outline-none transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/50">
                  <option value="">What concrete work do you need?</option>
                  {SERVICES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                </select>
              </label>
              <label className="relative block">
                <MapPin className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-white/35" />
                <span className="sr-only">Project suburb or postcode</span>
                <input value={formData.location} onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))} onFocus={() => trackFormFieldFocus("location", "hero_quote_prefill")} onBlur={(event) => event.target.value && trackFormFieldComplete("location", "hero_quote_prefill")} required placeholder="Project suburb or postcode" autoComplete="postal-code" className="w-full rounded-lg border border-white/15 bg-white/5 py-4 pl-12 pr-4 text-base text-white placeholder:text-white/35 outline-none transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/50" />
              </label>
              <label className="relative block">
                <FileText className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-white/35" />
                <span className="sr-only">Brief project description</span>
                <textarea value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Brief job description (optional for now)" className="w-full resize-y rounded-lg border border-white/15 bg-white/5 py-3 pl-12 pr-4 text-base text-white placeholder:text-white/35 outline-none transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/50" />
              </label>
              <Button type="submit" size="lg" className="flex w-full items-center justify-center gap-2 bg-brand-gold py-7 text-lg font-bold uppercase tracking-wide text-brand-charcoal shadow-xl shadow-brand-gold/25 transition hover:bg-brand-gold-dark hover:shadow-2xl hover:shadow-brand-gold/35">
                Continue to detailed quote<ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40"><Shield className="h-3.5 w-3.5" />No contact details required until the next step</div>
            <div className="mt-4 hidden items-center justify-center gap-2 border-t border-white/10 pt-4 lg:flex"><span className="text-sm text-white/40">Prefer to call?</span><a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="text-sm font-bold text-brand-gold">0424 463 268</a></div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
