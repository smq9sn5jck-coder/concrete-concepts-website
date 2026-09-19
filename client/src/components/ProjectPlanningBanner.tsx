import { ArrowRight, Camera, ClipboardList } from "lucide-react";
import { trackCTAClick } from "@/components/GodModeTracking";

export default function ProjectPlanningBanner() {
  return (
    <section className="border-y border-brand-gold/15 bg-brand-charcoal-light py-12 lg:py-16">
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-7 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:flex-row lg:items-center lg:p-10">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-3 text-brand-gold">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">Plan the first review</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
              Planning a driveway, slab or outdoor concrete project?
            </h2>
            <p className="mt-3 flex items-start gap-2 text-base leading-relaxed text-white/65 sm:text-lg">
              <Camera className="mt-1 h-5 w-5 shrink-0 text-brand-gold" aria-hidden="true" />
              Add your site details and photos for a more useful first review.
            </p>
          </div>
          <a
            href="/get-quote"
            onClick={() => trackCTAClick("start_detailed_quote", "project_planning_banner", "/get-quote")}
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-brand-gold px-6 py-4 text-center font-bold text-brand-charcoal transition hover:bg-brand-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal-light sm:w-auto"
          >
            Start detailed quote
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
