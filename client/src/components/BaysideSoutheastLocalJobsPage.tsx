import { ArrowRight, CheckCircle, ClipboardList, MapPin, MessageSquare, Phone } from "lucide-react";
import React from "react";
import { Link, useLocation } from "wouter";
import { BaysideSoutheastHeader, BaysideSoutheastFooter } from "@/components/BaysideSoutheastChrome";
import SEOHead from "@/components/SEOHead";
import { trackPhoneCallClick } from "@/components/ConversionTracking";
import { handoffBaysideSoutheastQuote } from "@/lib/baysideSoutheastQuoteHandoff";
import {
  BAYSIDE_SOUTHEAST_SERVICE_SCOPE_SUMMARY,
  type BaysideSoutheastLocalityRecord,
} from "@shared/baysideSoutheastLocalJobsContent";
import {
  getBaysideSoutheastMetadata,
  getBaysideSoutheastStructuredData,
} from "@shared/baysideSoutheastLocalJobsPresenter";

type Audience = "general" | "homeowner" | "builder";

const LOCALITY_NAMES: Record<string, string> = {
  "cannon-hill": "Cannon Hill",
  carina: "Carina",
  carindale: "Carindale",
  "eight-mile-plains": "Eight Mile Plains",
  "holland-park": "Holland Park",
  lota: "Lota",
  manly: "Manly",
  "manly-west": "Manly West",
  mansfield: "Mansfield",
  morningside: "Morningside",
  murarrie: "Murarrie",
  tingalpa: "Tingalpa",
  wishart: "Wishart",
  wynnum: "Wynnum",
  "wynnum-west": "Wynnum West",
};

function quotePath(slug: string, audience: Audience) {
  return `/get-quote?context=bayside-${slug}-${audience}`;
}

function interceptCandidateQuote(
  event: React.MouseEvent<HTMLAnchorElement>,
  token: string,
  setLocation: (path: string) => void,
) {
  if (
    event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
  ) return;

  event.preventDefault();
  handoffBaysideSoutheastQuote(token, { navigate: setLocation });
}

function CandidateQuoteLink({
  slug,
  audience,
  children,
  className,
}: {
  slug: string;
  audience: Audience;
  children: React.ReactNode;
  className: string;
}) {
  const [, setLocation] = useLocation();
  const token = `bayside-${slug}-${audience}`;
  return (
    <a
      href={quotePath(slug, audience)}
      onClick={event => interceptCandidateQuote(event, token, setLocation)}
      className={className}
    >
      {children}
    </a>
  );
}

/**
 * Candidate renderer for the five approved existing locality paths. It deliberately
 * reads only the typed record and avoids the legacy suburb widgets, reviews, prices,
 * maps, claims and callback prompt.
 */
export default function BaysideSoutheastLocalJobsPage({ record }: { record: BaysideSoutheastLocalityRecord }) {
  const metadata = getBaysideSoutheastMetadata(record);

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title={metadata.title}
        description={metadata.description}
        canonical={metadata.canonical}
        structuredData={getBaysideSoutheastStructuredData(record)}
        geo={{ placename: record.locality }}
      />
      <BaysideSoutheastHeader />

      <main>
        <section className="bg-brand-charcoal pb-16 pt-28 text-white lg:pb-20 lg:pt-32">
          <div className="container">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/70">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/areas">Service Areas</Link><span aria-hidden="true">/</span>
              <span aria-current="page">{record.locality}</span>
            </nav>
            <div className="mt-8 max-w-4xl">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gold">
                <MapPin className="h-4 w-4" aria-hidden="true" /> {record.locality}, Brisbane
              </p>
              <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{record.h1}</h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75" style={{ fontFamily: "var(--font-body)" }}>
                {record.intro}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <CandidateQuoteLink
                  slug={record.slug}
                  audience="general"
                  className="min-h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-7 py-3 font-bold uppercase tracking-wide text-brand-charcoal hover:bg-brand-gold-dark"
                >
                  Start a detailed quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </CandidateQuoteLink>
                <a
                  href="tel:0424463268"
                  onClick={() => trackPhoneCallClick()}
                  className="min-h-12 inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-7 py-3 font-semibold text-white hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" /> Call 0424 463 268
                </a>
                <a
                  href="sms:0424463268"
                  className="min-h-12 inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-7 py-3 font-semibold text-white hover:bg-white/10"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" /> SMS 0424 463 268
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-white py-5">
          <div className="container">
            <h2 className="text-center text-lg font-bold text-brand-charcoal">Choose how you are enquiring</h2>
            <p className="mx-auto mt-2 max-w-3xl text-center text-sm leading-relaxed text-gray-600" style={{ fontFamily: "var(--font-body)" }}>
              Both choices open the existing five-step detailed quote. They help present the relevant project questions; neither submits an enquiry.
            </p>
            <div className="mx-auto mt-5 grid max-w-4xl gap-4 sm:grid-cols-2">
              <CandidateQuoteLink
                slug={record.slug}
                audience="homeowner"
                className="min-h-16 rounded-xl border border-border bg-brand-offwhite p-5 font-semibold text-brand-charcoal hover:border-brand-gold hover:bg-brand-gold/10"
              >
                <span className="block">I am a homeowner or property owner</span>
                <span className="mt-1 block text-sm font-normal text-gray-600">Discuss a concrete project at your property.</span>
              </CandidateQuoteLink>
              <CandidateQuoteLink
                slug={record.slug}
                audience="builder"
                className="min-h-16 rounded-xl border border-border bg-brand-offwhite p-5 font-semibold text-brand-charcoal hover:border-brand-gold hover:bg-brand-gold/10"
              >
                <span className="block">I am a builder or developer</span>
                <span className="mt-1 block text-sm font-normal text-gray-600">Provide the actual address, concrete scope and programme.</span>
              </CandidateQuoteLink>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20">
          <div className="container">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-brand-charcoal sm:text-3xl">Concrete services to discuss</h2>
              <p className="mt-4 leading-relaxed text-gray-600" style={{ fontFamily: "var(--font-body)" }}>{BAYSIDE_SOUTHEAST_SERVICE_SCOPE_SUMMARY}</p>
            </div>
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {record.services.map(service => (
                <article key={service.slug} className="rounded-xl border border-border bg-brand-offwhite p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" aria-hidden="true" />
                    <div>
                      <h3 className="text-lg font-bold text-brand-charcoal">{service.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600" style={{ fontFamily: "var(--font-body)" }}>{service.description}</p>
                      <Link href={`/services/${service.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-gold-dark hover:underline">
                        Service details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-offwhite py-16 lg:py-20">
          <div className="container grid gap-6 lg:grid-cols-2">
            {record.practicalSections.map(section => (
              <article key={section.heading} className="rounded-2xl border border-border bg-white p-7">
                <h2 className="text-2xl font-bold text-brand-charcoal">{section.heading}</h2>
                <p className="mt-4 leading-relaxed text-gray-600" style={{ fontFamily: "var(--font-body)" }}>{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20">
          <div className="container grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)]">
            <div>
              <h2 className="text-2xl font-bold text-brand-charcoal sm:text-3xl">Frequently asked questions</h2>
              <div className="mt-8 space-y-5">
                {record.faqs.map(faq => (
                  <article key={faq.question} className="rounded-xl border border-border p-6">
                    <h3 className="text-lg font-bold text-brand-charcoal">{faq.question}</h3>
                    <p className="mt-2 leading-relaxed text-gray-600" style={{ fontFamily: "var(--font-body)" }}>{faq.answer}</p>
                  </article>
                ))}
              </div>
            </div>
            <aside className="h-fit rounded-2xl border border-border bg-brand-offwhite p-7" aria-labelledby="site-review-details">
              <ClipboardList className="h-7 w-7 text-brand-gold" aria-hidden="true" />
              <h2 id="site-review-details" className="mt-4 text-2xl font-bold text-brand-charcoal">Helpful details for a site review</h2>
              <ul className="mt-5 space-y-3 text-gray-700" style={{ fontFamily: "var(--font-body)" }}>
                <li>Project address and intended use</li>
                <li>Dimensions, or an indication that they are not yet known</li>
                <li>Existing surface, access and timing</li>
                <li>Relevant drawings or documents where available</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="bg-brand-offwhite py-14">
          <div className="container max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-brand-charcoal">Nearby locality guides</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {record.nearbyLocalitySlugs.map(slug => (
                <Link key={slug} href={`/areas/${slug}`} className="inline-flex min-h-11 items-center rounded-full border border-border bg-white px-5 py-2 font-medium text-brand-charcoal hover:border-brand-gold">
                  {LOCALITY_NAMES[slug] ?? slug}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-gold py-16">
          <div className="container max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-brand-charcoal sm:text-3xl">Add your {record.locality} project details</h2>
            <p className="mx-auto mt-4 max-w-2xl text-brand-charcoal/75" style={{ fontFamily: "var(--font-body)" }}>
              The existing detailed quote collects the information needed to review your concrete scope. Starting here records only the permitted locality handoff and opens the same five-step form.
            </p>
            <CandidateQuoteLink
              slug={record.slug}
              audience="general"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-charcoal px-8 py-3 font-bold uppercase tracking-wide text-white hover:bg-brand-charcoal/90"
            >
              Start a detailed quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </CandidateQuoteLink>
          </div>
        </section>
      </main>

      <BaysideSoutheastFooter />
    </div>
  );
}
