import { ArrowRight, CheckCircle, ExternalLink, MapPin, Phone, TriangleAlert } from "lucide-react";
import { Link, useParams } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { trackPhoneCallClick } from "@/components/ConversionTracking";
import { handoffGoldCoastQuote } from "@/lib/goldCoastQuoteHandoff";
import { GOLD_COAST_PUBLISHED_ENABLED } from "@/generated/goldCoastConfig";
import {
  GOLD_COAST_EXISTING_LOCALITIES,
  GOLD_COAST_OFFICIAL_RESOURCES,
  GOLD_COAST_SERVICE_BY_SLUG,
} from "@shared/goldCoastContent";

const structuredDataFor = (page: NonNullable<ReturnType<typeof getPage>>) => [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Gold Coast", item: "https://concreteconceptsgroup.com/areas/gold-coast" },
      { "@type": "ListItem", position: 2, name: page.serviceName, item: `https://concreteconceptsgroup.com/gold-coast/${page.slug}` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${page.serviceName} — North and Central Gold Coast review`,
    serviceType: page.serviceName,
    areaServed: { "@type": "AdministrativeArea", name: "North and Central Gold Coast" },
    provider: { "@type": "HomeAndConstructionBusiness", "@id": "https://concreteconceptsgroup.com/#business", name: "Concrete Concepts Group Pty Ltd" },
  },
];

function getPage(slug: string) {
  return GOLD_COAST_SERVICE_BY_SLUG[slug];
}

export default function GoldCoastServicePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const page = getPage(slug);
  if (!page) return null;

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead title={page.title} description={page.description} canonical={`/gold-coast/${page.slug}`} noindex={!GOLD_COAST_PUBLISHED_ENABLED} structuredData={structuredDataFor(page)} />
      <Navbar />
      <main>
        <section className="bg-brand-charcoal pb-16 pt-28 text-white lg:pb-20 lg:pt-32">
          <div className="container">
            <Breadcrumbs items={[{ label: "Gold Coast", href: "/areas/gold-coast" }, { label: page.serviceName }]} />
            <div className="mt-8 max-w-4xl">
              <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-gold"><MapPin className="h-4 w-4" />North + Central Gold Coast · service-area review</p>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{page.h1}</h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75" style={{ fontFamily: "var(--font-body)" }}>{page.intro}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => handoffGoldCoastQuote(page.quoteService)} className="min-h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-7 py-3 font-bold uppercase tracking-wide text-brand-charcoal hover:bg-brand-gold-dark">
                  Start a detailed quote <ArrowRight className="h-4 w-4" />
                </button>
                <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="min-h-12 inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-7 py-3 font-semibold text-white hover:bg-white/10"><Phone className="h-4 w-4" />0424 463 268</a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 lg:py-18">
          <div className="container grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-border bg-brand-offwhite p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-brand-charcoal">Scope considered</h2>
              <ul className="mt-5 space-y-4">
                {page.scope.map(item => <li key={item} className="flex gap-3 text-gray-700"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" /><span>{item}</span></li>)}
              </ul>
            </article>
            <article className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-brand-charcoal">Information that helps the quote</h2>
              <ul className="mt-5 space-y-4">
                {page.quoteInputs.map(item => <li key={item} className="flex gap-3 text-gray-700"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" /><span>{item}</span></li>)}
              </ul>
            </article>
          </div>
        </section>

        <section className="bg-brand-offwhite py-14 lg:py-18">
          <div className="container grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <article className="rounded-2xl bg-brand-charcoal p-6 text-white sm:p-8">
              <div className="flex items-center gap-3"><TriangleAlert className="h-6 w-6 text-brand-gold" /><h2 className="text-2xl font-bold">Property-specific checks</h2></div>
              <ul className="mt-5 space-y-4 text-white/75">{page.cautions.map(item => <li key={item}>{item}</li>)}</ul>
            </article>
            <article className="rounded-2xl border border-border bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-brand-charcoal">Official customer resources</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">These links support your own checks. They are not CCG approval, certification, engineering or legal advice.</p>
              <div className="mt-5 space-y-4">
                {page.resources.map(key => {
                  const resource = GOLD_COAST_OFFICIAL_RESOURCES[key];
                  return <a key={key} href={resource.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-border p-4 hover:border-brand-gold"><span className="flex items-center gap-2 font-bold text-brand-charcoal">{resource.label}<ExternalLink className="h-4 w-4 text-brand-gold" /></span><span className="mt-2 block text-sm leading-relaxed text-gray-600">{resource.summary}</span></a>;
                })}
              </div>
            </article>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="container grid gap-10 lg:grid-cols-2">
            <div><h2 className="text-2xl font-bold text-brand-charcoal">Related Gold Coast areas</h2><div className="mt-5 flex flex-wrap gap-3">{page.relatedLocalitySlugs.map(localitySlug => { const locality = GOLD_COAST_EXISTING_LOCALITIES.find(item => item.slug === localitySlug); return <Link key={localitySlug} href={`/areas/${localitySlug}`} className="min-h-11 inline-flex items-center rounded-full border border-border px-5 py-2 font-semibold text-brand-charcoal hover:border-brand-gold">{locality?.name ?? localitySlug}</Link>; })}</div><Link href="/areas/gold-coast" className="mt-6 inline-flex items-center gap-2 font-bold text-brand-gold-dark">View the Gold Coast coverage hub <ArrowRight className="h-4 w-4" /></Link></div>
            <div><h2 className="text-2xl font-bold text-brand-charcoal">Related services</h2><div className="mt-5 flex flex-wrap gap-3">{page.relatedServiceSlugs.map(serviceSlug => { const service = GOLD_COAST_SERVICE_BY_SLUG[serviceSlug]; return <Link key={serviceSlug} href={`/gold-coast/${serviceSlug}`} className="min-h-11 inline-flex items-center rounded-full border border-border px-5 py-2 font-semibold text-brand-charcoal hover:border-brand-gold">{service?.serviceName ?? serviceSlug}</Link>; })}</div></div>
          </div>
        </section>

        <section className="bg-brand-gold py-14">
          <div className="container max-w-3xl text-center"><h2 className="text-2xl font-bold text-brand-charcoal sm:text-3xl">Add the details for your property</h2><p className="mx-auto mt-4 max-w-2xl text-brand-charcoal/75">The existing five-step quote collects location, scope, dimensions, site conditions and optional photos. Starting here adds only the selected service to your current draft.</p><button type="button" onClick={() => handoffGoldCoastQuote(page.quoteService)} className="mt-7 min-h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-charcoal px-8 py-3 font-bold uppercase tracking-wide text-white">Start a detailed quote <ArrowRight className="h-4 w-4" /></button></div>
        </section>
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
