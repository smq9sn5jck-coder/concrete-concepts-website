import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import {
  GOLD_COAST_EXISTING_LOCALITIES,
  GOLD_COAST_SERVICE_PAGES,
} from "@shared/goldCoastContent";
import { REGIONAL_SLAB_PREVIEW_ENABLED } from "@/generated/regionalSlabConfig";

export default function GoldCoastReviewPage() {
  return <div className="min-h-screen bg-brand-offwhite">
    <SEOHead title="Gold Coast Release Candidate Review | CCG" description="Preview-only review index for the North and Central Gold Coast service hub, focused service pages and locality upgrades." canonical="/gold-coast-review" noindex />
    <Navbar />
    <main className="pb-20 pt-28">
      <section className="bg-brand-charcoal py-14 text-white"><div className="container max-w-5xl"><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gold"><MapPin className="h-4 w-4" />Noindex release candidate</p><h1 className="mt-4 text-3xl font-bold sm:text-4xl">North + Central Gold Coast review index</h1><p className="mt-4 max-w-3xl text-white/70">Use this isolated preview to review copy, internal links, mobile layout, crawlable edge output and the unchanged handoff into the existing detailed quote.</p><Link href="/areas/gold-coast" className="mt-7 min-h-12 inline-flex items-center gap-2 rounded-lg bg-brand-gold px-7 py-3 font-bold text-brand-charcoal">Open coverage hub <ArrowRight className="h-4 w-4" /></Link></div></section>
      <section className="container grid gap-8 py-12 lg:grid-cols-2"><article className="rounded-2xl border border-border bg-white p-6"><h2 className="text-2xl font-bold text-brand-charcoal">Focused service pages</h2><div className="mt-5 space-y-3">{GOLD_COAST_SERVICE_PAGES.map(page => <Link key={page.slug} href={`/gold-coast/${page.slug}`} className="min-h-12 flex items-center justify-between rounded-xl border border-border px-4 py-3 font-semibold text-brand-charcoal hover:border-brand-gold"><span>{page.serviceName}</span><ArrowRight className="h-4 w-4 text-brand-gold" /></Link>)}{REGIONAL_SLAB_PREVIEW_ENABLED && <><Link href="/gold-coast/house-slabs" className="min-h-12 flex items-center justify-between rounded-xl border border-brand-gold px-4 py-3 font-semibold text-brand-charcoal"><span>House slabs</span><ArrowRight className="h-4 w-4 text-brand-gold" /></Link><Link href="/gold-coast/extension-slabs" className="min-h-12 flex items-center justify-between rounded-xl border border-brand-gold px-4 py-3 font-semibold text-brand-charcoal"><span>Extension slabs</span><ArrowRight className="h-4 w-4 text-brand-gold" /></Link></>}</div></article><article className="rounded-2xl border border-border bg-white p-6"><h2 className="text-2xl font-bold text-brand-charcoal">Existing locality cluster</h2><div className="mt-5 grid grid-cols-2 gap-3">{GOLD_COAST_EXISTING_LOCALITIES.map(locality => <Link key={locality.slug} href={`/areas/${locality.slug}`} className="min-h-12 inline-flex items-center justify-center rounded-xl border border-border px-3 py-3 text-center font-semibold text-brand-charcoal hover:border-brand-gold">{locality.name}</Link>)}</div><p className="mt-5 text-sm leading-relaxed text-gray-600">Coomera, Nerang, Ormeau and Robina use the typed candidate content in this preview. Their existing customer-host content remains unchanged until a separate publication flag is explicitly enabled.</p></article></section>
    </main>
    <Footer />
  </div>;
}
