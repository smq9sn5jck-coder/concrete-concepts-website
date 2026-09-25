import { ArrowRight, ExternalLink, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { trackPhoneCallClick } from "@/components/ConversionTracking";
import { handoffGoldCoastQuote } from "@/lib/goldCoastQuoteHandoff";
import { GOLD_COAST_PUBLISHED_ENABLED } from "@/generated/goldCoastConfig";
import { REGIONAL_SLAB_PREVIEW_ENABLED, REGIONAL_SLAB_PUBLISHED_ENABLED } from "@/generated/regionalSlabConfig";
import {
  GOLD_COAST_COVERAGE_GROUPS,
  GOLD_COAST_EXISTING_LOCALITIES,
  GOLD_COAST_OFFICIAL_RESOURCES,
  GOLD_COAST_SERVICE_PAGES,
} from "@shared/goldCoastContent";

const structuredData = [
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Service Areas", item: "https://concreteconceptsgroup.com/areas" }, { "@type": "ListItem", position: 2, name: "Gold Coast", item: "https://concreteconceptsgroup.com/areas/gold-coast" }] },
  { "@context": "https://schema.org", "@type": "Service", name: "North and Central Gold Coast residential concreting review", serviceType: GOLD_COAST_SERVICE_PAGES.map(page => page.serviceName), areaServed: { "@type": "AdministrativeArea", name: "North and Central Gold Coast" }, provider: { "@type": "HomeAndConstructionBusiness", "@id": "https://concreteconceptsgroup.com/#business", name: "Concrete Concepts Group Pty Ltd" } },
];

export default function GoldCoastHubPage() {
  return <div className="min-h-screen bg-brand-offwhite">
    <SEOHead title="North + Central Gold Coast Concreting | CCG Review" description="Explore CCG's proposed North and Central Gold Coast residential concreting coverage, services, locality guides and property-specific quote requirements." canonical="/areas/gold-coast" noindex={!GOLD_COAST_PUBLISHED_ENABLED} structuredData={structuredData} />
    <Navbar />
    <main>
      <section className="bg-brand-charcoal pb-16 pt-28 text-white lg:pb-20 lg:pt-32"><div className="container"><Breadcrumbs items={[{ label: "Service Areas", href: "/areas" }, { label: "Gold Coast" }]} /><div className="mt-8 max-w-4xl"><p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-gold"><MapPin className="h-4 w-4" />Proposed service-area review</p><h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">North + Central Gold Coast concrete project review</h1><p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75">CCG is reviewing suitable residential driveway, exposed aggregate, patio, path, pool-surround, slab and small retaining-wall enquiries across the northern and central Gold Coast. Acceptance depends on the address, scope, access, site conditions and current scheduling; this preview does not imply every enquiry will be accepted.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => handoffGoldCoastQuote()} className="min-h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-7 py-3 font-bold uppercase tracking-wide text-brand-charcoal">Start a detailed quote <ArrowRight className="h-4 w-4" /></button><a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="min-h-12 inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-7 py-3 font-semibold text-white"><Phone className="h-4 w-4" />0424 463 268</a></div></div></div></section>

      <section className="bg-white py-14 lg:py-18"><div className="container"><div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-wider text-brand-gold-dark">Focused residential scopes</p><h2 className="mt-2 text-2xl font-bold text-brand-charcoal sm:text-3xl">Start with the work you are planning</h2><p className="mt-3 text-gray-600">Each page explains the scope inputs that help CCG review a detailed quote and the property-specific matters that may need separate professional or City advice.</p></div><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{GOLD_COAST_SERVICE_PAGES.map(page => <Link key={page.slug} href={`/gold-coast/${page.slug}`} className="group rounded-2xl border border-border bg-brand-offwhite p-6 hover:border-brand-gold"><h3 className="text-xl font-bold text-brand-charcoal">{page.serviceName}</h3><p className="mt-3 text-sm leading-relaxed text-gray-600">{page.intro}</p><span className="mt-5 inline-flex items-center gap-2 font-bold text-brand-gold-dark">Review service scope <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>)}</div></div></section>
      {(REGIONAL_SLAB_PREVIEW_ENABLED || REGIONAL_SLAB_PUBLISHED_ENABLED) && <section className="bg-brand-gold/10 py-12"><div className="container"><h2 className="text-2xl font-bold text-brand-charcoal">Structural slab review pages</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Link href="/gold-coast/house-slabs" className="rounded-2xl border border-border bg-white p-6 font-bold text-brand-charcoal hover:border-brand-gold">House slabs <ArrowRight className="ml-2 inline h-4 w-4" /></Link><Link href="/gold-coast/extension-slabs" className="rounded-2xl border border-border bg-white p-6 font-bold text-brand-charcoal hover:border-brand-gold">Extension slabs <ArrowRight className="ml-2 inline h-4 w-4" /></Link></div></div></section>}

      <section className="bg-brand-offwhite py-14 lg:py-18"><div className="container grid gap-8 lg:grid-cols-2">{GOLD_COAST_COVERAGE_GROUPS.map(group => <article key={group.label} className="rounded-2xl border border-border bg-white p-6 sm:p-8"><h2 className="text-2xl font-bold text-brand-charcoal">{group.label}</h2><p className="mt-3 text-gray-600">Addresses in and around these named areas can be submitted for service-area review. The list is intentionally concise and is not an automatic acceptance boundary.</p><div className="mt-5 flex flex-wrap gap-2">{group.areas.map(area => <span key={area} className="rounded-full bg-brand-charcoal/5 px-4 py-2 text-sm font-semibold text-brand-charcoal">{area}</span>)}</div></article>)}</div></section>

      <section className="bg-white py-14"><div className="container"><h2 className="text-2xl font-bold text-brand-charcoal sm:text-3xl">Existing Gold Coast locality guides</h2><p className="mt-3 max-w-3xl text-gray-600">Use these eight crawlable locality pages for area-specific quote preparation, then return here to compare related services.</p><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{GOLD_COAST_EXISTING_LOCALITIES.map(locality => <Link key={locality.slug} href={`/areas/${locality.slug}`} className="min-h-12 inline-flex items-center justify-center rounded-xl border border-border bg-brand-offwhite px-4 py-3 text-center font-bold text-brand-charcoal hover:border-brand-gold">{locality.name}</Link>)}</div></div></section>

      <section className="bg-brand-charcoal py-14 text-white"><div className="container grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><h2 className="text-2xl font-bold sm:text-3xl">Property checks remain site-specific</h2><p className="mt-4 leading-relaxed text-white/70">City resources can help customers investigate crossings, retaining walls, flood mapping and stormwater. They do not constitute CCG approval, engineering or certification advice.</p></div><div className="grid gap-3 sm:grid-cols-2">{Object.entries(GOLD_COAST_OFFICIAL_RESOURCES).map(([key, resource]) => <a key={key} href={resource.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/15 p-4 hover:border-brand-gold"><span className="flex items-start gap-2 font-bold text-brand-gold">{resource.label}<ExternalLink className="mt-1 h-4 w-4 shrink-0" /></span><span className="mt-2 block text-sm leading-relaxed text-white/65">{resource.summary}</span></a>)}</div></div></section>

      <section className="bg-brand-gold py-14"><div className="container max-w-3xl text-center"><h2 className="text-2xl font-bold text-brand-charcoal sm:text-3xl">Describe the property and proposed work</h2><p className="mx-auto mt-4 max-w-2xl text-brand-charcoal/75">Use the existing five-step quote to add the address, scope, measurements, access, site conditions and optional photos needed for review.</p><button type="button" onClick={() => handoffGoldCoastQuote()} className="mt-7 min-h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-charcoal px-8 py-3 font-bold uppercase tracking-wide text-white">Start a detailed quote <ArrowRight className="h-4 w-4" /></button></div></section>
    </main>
    <Footer /><StickyMobileCTA />
  </div>;
}
