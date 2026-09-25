import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { REGIONAL_SLAB_PAGES } from "@shared/regionalSlabContent";

export default function RegionalSlabReviewPage() {
  const groups = ["Brisbane", "Ipswich", "Gold Coast", "Sunshine Coast", "Guides"] as const;
  const pagesFor = (group: typeof groups[number]) => REGIONAL_SLAB_PAGES.filter(page => {
    if (group === "Guides") return page.kind === "guide";
    return page.kind !== "guide" && page.regionLabel.includes(group);
  });
  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead title="Regional Slab Release Candidate Review | CCG" description="Preview-only review index for CCG regional house slab, extension slab, readiness guide and quote qualification candidates." canonical="/regional-slab-review" noindex />
      <Navbar />
      <main className="pb-20 pt-28">
        <section className="bg-brand-charcoal py-14 text-white"><div className="container max-w-5xl"><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gold"><MapPin className="h-4 w-4" />Noindex release candidate</p><h1 className="mt-4 text-3xl font-bold sm:text-4xl">Regional slab and extension review index</h1><p className="mt-4 max-w-3xl text-white/70">Review Brisbane, Ipswich/Ripley, Gold Coast and selected Sunshine Coast candidates, raw crawlable output, local-only quote handoffs and the unchanged five-step detailed quote boundary.</p></div></section>
        <section className="container grid gap-6 py-12 md:grid-cols-2">{groups.map(group => { const pages = pagesFor(group); return pages.length ? <article key={group} className="rounded-2xl border border-border bg-white p-6"><h2 className="text-2xl font-bold text-brand-charcoal">{group}</h2><div className="mt-5 space-y-3">{pages.map(page => <Link key={page.path} href={page.path} className="flex min-h-12 items-center justify-between rounded-xl border border-border px-4 py-3 font-semibold text-brand-charcoal hover:border-brand-gold"><span>{page.name}</span><ArrowRight className="h-4 w-4 text-brand-gold" /></Link>)}</div></article> : null; })}</section>
      </main>
      <Footer />
    </div>
  );
}
