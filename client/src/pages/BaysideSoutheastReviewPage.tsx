import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "wouter";
import { BaysideSoutheastHeader, BaysideSoutheastFooter } from "@/components/BaysideSoutheastChrome";
import SEOHead from "@/components/SEOHead";
import NotFound from "@/pages/NotFound";
import { BAYSIDE_SOUTHEAST_PREVIEW_ENABLED, BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED } from "@/generated/baysideSoutheastConfig";
import { isCustomerWebsiteHost } from "@/lib/customerWebsiteHost";
import { getBaysideSoutheastRouteAccess } from "@shared/baysideSoutheastPublication";
import {
  BAYSIDE_SOUTHEAST_LOCALITIES,
  BAYSIDE_SOUTHEAST_REVIEW_PATH,
} from "@shared/baysideSoutheastLocalJobsContent";

/** A review-only index. It remains unavailable on every customer host, even after publication. */
export default function BaysideSoutheastReviewPage() {
  const customerHost = typeof window !== "undefined" && isCustomerWebsiteHost(window.location.hostname);
  const access = getBaysideSoutheastRouteAccess(BAYSIDE_SOUTHEAST_REVIEW_PATH, {
    customerHost,
    previewEnabled: BAYSIDE_SOUTHEAST_PREVIEW_ENABLED,
    publishedEnabled: BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED,
  });
  if (access !== "preview") return <NotFound />;

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title="Bayside & South-East Brisbane Locality Review | CCG"
        description="Noindex review index for five existing Bayside and South-East Brisbane locality page upgrades."
        canonical={BAYSIDE_SOUTHEAST_REVIEW_PATH}
        noindex
      />
      <BaysideSoutheastHeader />
      <main className="pb-20 pt-28">
        <section className="bg-brand-charcoal py-14 text-white">
          <div className="container max-w-5xl">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gold">
              <MapPin className="h-4 w-4" aria-hidden="true" /> Noindex release candidate
            </p>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Bayside &amp; South-East Brisbane review index</h1>
            <p className="mt-4 max-w-3xl leading-relaxed text-white/70" style={{ fontFamily: "var(--font-body)" }}>
              Review five upgrades to existing locality URLs. Each page uses the typed locality record, practical project guidance, accessible audience choices and the existing five-step detailed quote; this preview does not accept submissions.
            </p>
          </div>
        </section>

        <section className="container py-12">
          <h2 className="text-2xl font-bold text-brand-charcoal">Existing locality page candidates</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-gray-600" style={{ fontFamily: "var(--font-body)" }}>
            These are not new suburb URLs. The review focuses on useful project-planning content, existing service links and locality-specific quote handoffs.
          </p>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BAYSIDE_SOUTHEAST_LOCALITIES.map(record => (
              <article key={record.slug} className="rounded-2xl border border-border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-charcoal">{record.locality}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600" style={{ fontFamily: "var(--font-body)" }}>{record.description}</p>
                <Link
                  href={`/areas/${record.slug}`}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-gold-dark hover:underline"
                >
                  Review locality page <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <BaysideSoutheastFooter />
    </div>
  );
}
