import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const regions = [
  {
    name: "Brisbane",
    links: [
      ["Everton Park", "everton-park"],
      ["Carindale", "carindale"],
      ["Wynnum", "wynnum"],
      ["Kenmore", "kenmore"],
    ],
  },
  {
    name: "Logan",
    links: [
      ["Beenleigh", "beenleigh"],
      ["Springwood", "springwood"],
      ["Marsden", "marsden"],
      ["Underwood", "underwood"],
    ],
  },
  {
    name: "Ipswich & West",
    links: [
      ["Ipswich", "ipswich"],
      ["Springfield", "springfield"],
      ["Goodna", "goodna"],
      ["Ripley", "ripley"],
    ],
  },
  {
    name: "Moreton Bay",
    links: [
      ["North Lakes", "north-lakes"],
      ["Caboolture", "caboolture"],
      ["Strathpine", "strathpine"],
      ["Morayfield", "morayfield"],
    ],
  },
  {
    name: "Gold Coast",
    links: [
      ["Upper Coomera", "upper-coomera"],
      ["Pimpama", "pimpama"],
      ["Robina", "robina"],
      ["Nerang", "nerang"],
    ],
  },
  {
    name: "Bayside & Redlands",
    links: [
      ["Capalaba", "capalaba"],
      ["Cleveland", "cleveland"],
      ["Redland Bay", "redland-bay"],
      ["Victoria Point", "victoria-point"],
    ],
  },
] as const;

export default function ServiceAreaGrid() {
  return (
    <section id="service-area" className="bg-brand-charcoal py-20 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-brand-gold" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Where we work</span>
            <div className="h-px w-10 bg-brand-gold" />
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Brisbane & South East Queensland
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/65">
            Browse established service-area pages below. Final location and access suitability are confirmed in the detailed quote review.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region, index) => (
            <motion.article
              key={region.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-5"
            >
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <MapPin className="h-5 w-5 text-brand-gold" aria-hidden="true" />
                {region.name}
              </h3>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {region.links.map(([label, slug]) => (
                  <li key={slug}>
                    <a
                      href={`/areas/${slug}`}
                      className="inline-flex min-h-11 items-center gap-2 py-2 text-sm text-white/70 transition hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brand-gold/70" aria-hidden="true" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/areas"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-brand-gold/40 px-6 py-3 font-bold text-brand-gold transition hover:bg-brand-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            View all listed service areas
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
