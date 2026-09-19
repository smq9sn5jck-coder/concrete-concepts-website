import { ArrowRight, CheckCircle, ClipboardList, ExternalLink, MapPin, Phone, Shield } from "lucide-react";
import { Link } from "wouter";
import type { LocalityContentRecord } from "@shared/localityContent.schema";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { trackPhoneCallClick } from "@/components/ConversionTracking";
import { handoffLocalityQuote } from "@/lib/localityQuoteHandoff";

const LOCALITY_NAMES: Record<string, string> = {
  "kenmore": "Kenmore", "chapel-hill": "Chapel Hill", "middle-park": "Middle Park",
  "stafford": "Stafford", "mitchelton": "Mitchelton", "the-gap": "The Gap",
  "eight-mile-plains": "Eight Mile Plains", "wishart": "Wishart", "mansfield": "Mansfield",
  "cannon-hill": "Cannon Hill", "morningside": "Morningside", "tingalpa": "Tingalpa",
  "robina": "Robina", "nerang": "Nerang", "victoria-point": "Victoria Point",
  "coomera": "Coomera", "pimpama": "Pimpama", "ormeau": "Ormeau", "upper-coomera": "Upper Coomera",
  "ripley": "Ripley", "redbank-plains": "Redbank Plains", "springfield": "Springfield",
  "ipswich": "Ipswich", "goodna": "Goodna", "brassall": "Brassall", "bellbird-park": "Bellbird Park",
  "browns-plains": "Browns Plains", "logan-reserve": "Logan Reserve", "beenleigh": "Beenleigh",
  "logan": "Logan", "shailer-park": "Shailer Park", "marsden": "Marsden", "woodridge": "Woodridge",
  "redcliffe": "Redcliffe", "deception-bay": "Deception Bay", "north-lakes": "North Lakes",
  "bray-park": "Bray Park", "kallangur": "Kallangur", "morayfield": "Morayfield",
  "burpengary": "Burpengary", "caboolture": "Caboolture", "narangba": "Narangba",
};

function batchOneStructuredData(record: LocalityContentRecord) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Service Areas", item: "https://concreteconceptsgroup.com/areas" },
        { "@type": "ListItem", position: 2, name: record.locality, item: `https://concreteconceptsgroup.com/areas/${record.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Residential concreting in ${record.locality}`,
      serviceType: record.services.map(service => service.name),
      areaServed: { "@type": "AdministrativeArea", name: `${record.locality}, ${record.lga}` },
      provider: {
        "@type": "HomeAndConstructionBusiness",
        "@id": "https://concreteconceptsgroup.com/#business",
        name: "Concrete Concepts Group Pty Ltd",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: record.faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}

export default function BatchOneLocalityPage({ record }: { record: LocalityContentRecord }) {
  const startQuote = (serviceSlug?: string) => {
    handoffLocalityQuote(record, { serviceSlug });
  };

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title={record.title}
        description={record.description}
        canonical={`/areas/${record.slug}`}
        keywords={`concreting ${record.locality}, concrete driveway ${record.locality}, concrete slabs ${record.locality}`}
        structuredData={batchOneStructuredData(record)}
      />
      <Navbar />

      <main>
        <section className="bg-brand-charcoal text-white pt-28 pb-16 lg:pt-32 lg:pb-20">
          <div className="container">
            <Breadcrumbs items={[{ label: "Service Areas", href: "/areas" }, { label: record.locality }]} />
            <div className="max-w-4xl mt-8">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-brand-gold font-semibold uppercase tracking-wide mb-5">
                <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" />{record.region}</span>
                <span>{record.lga}</span>
                <span>{record.postcode}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">{record.h1}</h1>
              <p className="text-lg text-white/75 max-w-3xl leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{record.intro}</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => startQuote()}
                  className="min-h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-7 py-3 font-bold uppercase tracking-wide text-brand-charcoal hover:bg-brand-gold-dark"
                >
                  Start a detailed quote <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="tel:0424463268"
                  onClick={() => trackPhoneCallClick()}
                  className="min-h-12 inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-7 py-3 font-semibold text-white hover:bg-white/10"
                >
                  <Phone className="w-4 h-4" /> 0424 463 268
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-white py-4">
          <div className="container flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-semibold text-brand-charcoal">
            <span className="inline-flex items-center gap-2"><Shield className="w-4 h-4 text-brand-gold" />QBCC licence 15299707</span>
            <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-gold" />Brisbane &amp; South East Queensland service-area review</span>
            <span className="inline-flex items-center gap-2"><ClipboardList className="w-4 h-4 text-brand-gold" />Detailed five-step quote</span>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-white">
          <div className="container grid gap-10 lg:grid-cols-2">
            <article className="rounded-2xl border border-border bg-brand-offwhite p-7">
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">Practical site considerations</h2>
              <p className="text-gray-700 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{record.practicalConsiderations}</p>
            </article>
            <article className="rounded-2xl border border-border bg-brand-offwhite p-7">
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">Locality context</h2>
              <p className="text-gray-700 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{record.localityContext.attribution}</p>
              <p className="mt-4 text-sm text-gray-500">Source reviewed: {record.localityContext.claimDate}</p>
              <div className="mt-3 flex flex-col items-start gap-2">
                {record.localityContext.sourceUrls.map((sourceUrl, index) => (
                  <a key={sourceUrl} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-gold-dark hover:underline" href={sourceUrl} target="_blank" rel="noopener noreferrer">
                    {record.localityContext.sourceLabel}{record.localityContext.sourceUrls.length > 1 ? ` — source ${index + 1}` : ""} <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-brand-offwhite">
          <div className="container">
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-4">Common residential projects in {record.locality}</h2>
              <p className="text-gray-600" style={{ fontFamily: "var(--font-body)" }}>The relevant option depends on the property and intended use. Select a service to read more, or include it in the detailed quote draft.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {record.services.map(service => (
                <article key={service.slug} className="rounded-xl border border-border bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-gold shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-brand-charcoal">{service.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600" style={{ fontFamily: "var(--font-body)" }}>{service.description}</p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                        <Link href={`/services/${service.slug}`} className="text-brand-gold-dark hover:underline">Service details</Link>
                        <button type="button" onClick={() => startQuote(service.slug)} className="text-brand-charcoal hover:text-brand-gold-dark">Add to quote draft</button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-white">
          <div className="container max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-8">Frequently asked questions</h2>
            <div className="space-y-5">
              {record.faqs.map(faq => (
                <article key={faq.question} className="rounded-xl border border-border p-6">
                  <h3 className="text-lg font-bold text-brand-charcoal">{faq.question}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600" style={{ fontFamily: "var(--font-body)" }}>{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-brand-offwhite">
          <div className="container max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-brand-charcoal mb-6">Nearby live locality guides</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {record.nearbyLocalitySlugs.map(slug => (
                <Link key={slug} href={`/areas/${slug}`} className="min-h-11 inline-flex items-center rounded-full border border-border bg-white px-5 py-2 font-medium text-brand-charcoal hover:border-brand-gold">
                  {LOCALITY_NAMES[slug] ?? slug}
                </Link>
              ))}
            </div>
            <Link href={record.regionalHub.path} className="mt-7 inline-flex items-center gap-2 font-semibold text-brand-gold-dark hover:underline">
              View {record.regionalHub.label} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="py-16 bg-brand-gold">
          <div className="container max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal">Add your {record.locality} site details</h2>
            <p className="mx-auto mt-4 max-w-2xl text-brand-charcoal/75" style={{ fontFamily: "var(--font-body)" }}>The detailed quote collects dimensions, access, site conditions and optional photos. Starting it here saves only the locality and opens the existing five-step form.</p>
            <button type="button" onClick={() => startQuote()} className="mt-7 min-h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-charcoal px-8 py-3 font-bold uppercase tracking-wide text-white hover:bg-brand-charcoal/90">
              Start a detailed quote <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
