/*
  DESIGN: Project Transformations — Before & After showcase
  Shows featured completed projects with descriptions of the transformation
  Uses existing project photos with detailed descriptions
*/
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const transformations = [
  {
    title: "Exposed Aggregate Driveway",
    location: "Brisbane Southside",
    description:
      "Replaced an old cracked concrete driveway with a premium exposed aggregate finish featuring black and white stone. The curved edge at the garage entrance adds a modern touch to the property's street appeal.",
    result: "Complete driveway transformation with a durable, non-slip exposed aggregate surface that will last 25+ years.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-driveway_803ff92a.jpeg",
    alt: "Exposed aggregate concrete driveway with curved edge at garage entrance Brisbane",
    service: "Exposed Aggregate",
  },
  {
    title: "Residential Slab & Steps",
    location: "Brisbane North",
    description:
      "Poured a full residential slab with integrated concrete steps for a new home build. The project included reinforcement mesh preparation, precision formwork, and a smooth power-floated finish.",
    result: "Solid structural slab with perfectly level steps, ready for the home build to continue.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-finished-slab_74e9f7cd.jpeg",
    alt: "Finished concrete slab with integrated steps for Brisbane home by Concrete Concepts Group",
    service: "Concrete Slabs",
  },
  {
    title: "New Concrete Driveway",
    location: "Brisbane West",
    description:
      "Removed the old damaged driveway and poured a brand new plain concrete driveway with a clean broom finish. The wide design provides ample parking space and a fresh, clean look for the property.",
    result: "A brand new driveway that transformed the front of the home, adding value and kerb appeal.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
    alt: "New plain concrete driveway installation with palm tree Brisbane residential property",
    service: "Driveways",
  },
  {
    title: "Retaining Wall System",
    location: "Brisbane Bayside",
    description:
      "Constructed a multi-level concrete retaining wall system along the fence line to manage a sloping block. Included proper drainage, reinforcement, and a clean finish that blends with the landscape.",
    result: "Stable, engineered retaining wall that prevents erosion and creates usable flat areas in the yard.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-1_942fd49e.jpeg",
    alt: "Concrete retaining wall installation along fence line in Brisbane suburb",
    service: "Retaining Walls",
  },
  {
    title: "Pool Surround & Entertaining",
    location: "Brisbane South",
    description:
      "Poured a new concrete pool surround and outdoor entertaining area. The smooth finish provides a safe, non-slip surface around the pool while creating a seamless flow from the house to the outdoor area.",
    result: "A stunning outdoor entertaining space that connects the home to the pool area beautifully.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-5_d25c6ec1.jpeg",
    alt: "Concrete pool surround installation Brisbane by Concrete Concepts Group",
    service: "Patios",
  },
  {
    title: "Side Path & Access Way",
    location: "Brisbane Inner City",
    description:
      "Installed a clean plain concrete side path leading from the front of the house to the backyard shed. The smooth broom finish provides safe footing in all weather conditions.",
    result: "A practical, low-maintenance access path that replaced an old muddy walkway.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/plain-concrete-sidepath_6ce5e329.jpeg",
    alt: "Plain concrete side path leading to shed with smooth broom finish Brisbane residential",
    service: "Pathways",
  },
];

export default function BeforeAfterSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = transformations[activeIndex];

  const navigate = (direction: number) => {
    const newIndex = activeIndex + direction;
    if (newIndex >= 0 && newIndex < transformations.length) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <section className="py-24 lg:py-32 bg-white" id="transformations">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-px bg-brand-gold" />
            <span
              className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Recent Work
            </span>
            <div className="w-10 h-px bg-brand-gold" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-charcoal leading-tight mb-5">
            Our Recent <span className="text-brand-gold italic">Projects</span>
          </h2>
          <p
            className="text-lg text-muted-foreground leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Real Brisbane projects completed by our team.
            Every job is finished to the highest standard.
          </p>
        </motion.div>

        {/* Showcase */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
            >
              {/* Image */}
              <div className="relative group">
                <div className="overflow-hidden rounded-2xl shadow-xl">
                  <img
                    src={active.image}
                    alt={active.alt}
                    width={600}
                    height={450}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {/* Service Badge */}
                <div className="absolute top-4 left-4 bg-brand-gold text-brand-charcoal px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  {active.service}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-2">
                    {active.title}
                  </h3>
                  <p className="text-sm text-amber-700 font-semibold uppercase tracking-wider">
                    {active.location}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4
                      className="text-sm font-semibold text-brand-charcoal uppercase tracking-wider mb-2"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      The Project
                    </h4>
                    <p
                      className="text-muted-foreground leading-relaxed"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {active.description}
                    </p>
                  </div>

                  <div className="bg-brand-gold/10 rounded-xl p-4 border border-brand-gold/20">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <h4
                          className="text-sm font-semibold text-brand-charcoal mb-1"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          The Result
                        </h4>
                        <p
                          className="text-sm text-muted-foreground leading-relaxed"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {active.result}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href="/get-quote"
                  className="inline-flex items-center gap-2 bg-brand-gold text-brand-charcoal px-6 py-3 rounded-lg font-semibold hover:bg-brand-gold/90 transition-colors shadow-md"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Get a Similar Quote
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => navigate(-1)}
              disabled={activeIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gray-100 text-brand-charcoal hover:bg-gray-200"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {transformations.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    i === activeIndex
                      ? "bg-brand-gold w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`View project ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => navigate(1)}
              disabled={activeIndex === transformations.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gray-100 text-brand-charcoal hover:bg-gray-200"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
