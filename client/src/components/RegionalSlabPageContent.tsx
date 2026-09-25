import { ArrowRight, CheckCircle, ExternalLink, MapPin, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { REGIONAL_SLAB_PUBLISHED_ENABLED } from "@/generated/regionalSlabConfig";
import { handoffRegionalSlabQuote } from "@/lib/regionalSlabQuoteHandoff";
import {
  REGIONAL_SLAB_OFFICIAL_RESOURCES,
  type RegionalSlabPage,
} from "@shared/regionalSlabContent";

const SITE_ORIGIN = "https://concreteconceptsgroup.com";

function structuredDataFor(page: RegionalSlabPage) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: page.breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: `${SITE_ORIGIN}${item.path ?? page.path}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.name,
      serviceType: "Site-specific concrete slab and footing quote review",
      areaServed: { "@type": "AdministrativeArea", name: page.regionLabel },
      provider: {
        "@type": "HomeAndConstructionBusiness",
        "@id": `${SITE_ORIGIN}/#business`,
        name: "Concrete Concepts Group Pty Ltd",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}

export default function RegionalSlabPageContent({ page }: { page: RegionalSlabPage }) {
  const startQuote = () => handoffRegionalSlabQuote(page.quotePrefill);
  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead title={page.title} description={page.description} canonical={page.path} noindex={!REGIONAL_SLAB_PUBLISHED_ENABLED} structuredData={structuredDataFor(page)} />
      <Navbar />
      <main>
        <section className="bg-brand-charcoal pb-16 pt-28 text-white lg:pb-20 lg:pt-32">
          <div className="container">
            <Breadcrumbs items={page.breadcrumbs.map(item => ({ label: item.label, href: item.path }))} />
            <div className="mt-8 max-w-4xl">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gold"><MapPin className="h-4 w-4" />{page.regionLabel} · site-specific review</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{page.h1}</h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75">{page.intro}</p>
              <button type="button" onClick={startQuote} className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-gold px-7 py-3 text-center font-bold text-brand-charcoal hover:bg-brand-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Request a site-specific concrete quote <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 lg:py-20">
          <div className="container grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-border bg-brand-offwhite p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-brand-charcoal">Suitable concrete scopes</h2>
              <ul className="mt-5 space-y-4">{page.scope.map(item => <li key={item} className="flex gap-3 text-gray-700"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" /><span>{item}</span></li>)}</ul>
            </article>
            <article className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-brand-charcoal">What CCG needs to quote</h2>
              <ul className="mt-5 space-y-4">{page.quoteInputs.map(item => <li key={item} className="flex gap-3 text-gray-700"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" /><span>{item}</span></li>)}</ul>
            </article>
          </div>
        </section>

        <section className="bg-brand-offwhite py-14 lg:py-20">
          <div className="container grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
            <article className="rounded-2xl bg-brand-charcoal p-6 text-white sm:p-8">
              <div className="flex items-center gap-3"><TriangleAlert className="h-6 w-6 text-brand-gold" /><h2 className="text-2xl font-bold">Project boundaries</h2></div>
              <ul className="mt-5 space-y-4 text-white/75">{page.cautions.map(item => <li key={item}>{item}</li>)}</ul>
            </article>
            <article className="rounded-2xl border border-border bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-brand-charcoal">Coverage considered</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Named locations guide initial review and do not promise project acceptance, local presence or immediate availability.</p>
              <div className="mt-5 flex flex-wrap gap-2">{page.coverage.map(area => <span key={area} className="rounded-full bg-brand-charcoal/5 px-4 py-2 text-sm font-semibold text-brand-charcoal">{area}</span>)}</div>
            </article>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="container grid gap-10 lg:grid-cols-2">
            <article><h2 className="text-2xl font-bold text-brand-charcoal">Official customer resources</h2><p className="mt-3 text-sm text-gray-600">General information only; not CCG engineering, approval, certification or legal advice.</p><div className="mt-5 space-y-3">{page.resources.map(key => { const resource = REGIONAL_SLAB_OFFICIAL_RESOURCES[key]; return <a key={key} href={resource.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-border p-4 hover:border-brand-gold"><span className="flex gap-2 font-bold text-brand-charcoal">{resource.label}<ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" /></span><span className="mt-2 block text-sm leading-relaxed text-gray-600">{resource.summary}</span></a>; })}</div></article>
            <article><h2 className="text-2xl font-bold text-brand-charcoal">Related pages</h2><div className="mt-5 grid gap-3">{page.relatedLinks.map(link => <Link key={link.path} href={link.path} className="flex min-h-12 items-center justify-between rounded-xl border border-border px-4 py-3 font-bold text-brand-charcoal hover:border-brand-gold"><span>{link.label}</span><ArrowRight className="h-4 w-4 text-brand-gold" /></Link>)}</div></article>
          </div>
        </section>

        <section className="bg-brand-offwhite py-14"><div className="container max-w-4xl"><h2 className="text-2xl font-bold text-brand-charcoal">Frequently asked questions</h2><div className="mt-6 space-y-4">{page.faqs.map(faq => <article key={faq.question} className="rounded-2xl border border-border bg-white p-5"><h3 className="font-bold text-brand-charcoal">{faq.question}</h3><p className="mt-2 leading-relaxed text-gray-600">{faq.answer}</p></article>)}</div></div></section>

        <section className="bg-brand-gold py-14"><div className="container max-w-3xl text-center"><h2 className="text-2xl font-bold text-brand-charcoal sm:text-3xl">Send the actual project details for review</h2><p className="mx-auto mt-4 max-w-2xl text-brand-charcoal/75">The existing five-step quote keeps contact, location, measurements, access, private-photo and consent safeguards in place. Starting here writes only local draft prefills.</p><button type="button" onClick={startQuote} className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-charcoal px-8 py-3 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Request a site-specific concrete quote <ArrowRight className="h-4 w-4" /></button></div></section>
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
