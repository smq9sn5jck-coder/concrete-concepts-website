/*
  DESIGN: Refined Craft — Concrete Concepts Group brand
  Gallery: Clean uniform grid with lightbox, showcasing all real project photos
  Categories for filtering, gold accents, smooth transitions
*/
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const projects = [
  // Original 10 photos
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-pouring_f7343992.jpeg",
    alt: "Concrete Concepts Group team pouring concrete on a large residential slab in Brisbane",
    category: "Slabs",
    title: "Residential Slab Pour",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-finished-slab_74e9f7cd.jpeg",
    alt: "Finished concrete slab with integrated steps for Brisbane home by Concrete Concepts Group",
    category: "Slabs",
    title: "Finished Slab & Steps",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-slab-prep_28461c38.jpeg",
    alt: "Reinforcement mesh preparation for concrete slab pour in Brisbane",
    category: "Slabs",
    title: "Slab Preparation",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-troweling_06ff9a7c.jpeg",
    alt: "Hand troweling fresh concrete to a smooth finish on Brisbane residential project",
    category: "Finishing",
    title: "Hand Finishing",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-power-float_ca89df9c.jpeg",
    alt: "Power floating a large concrete slab for smooth finish in Brisbane",
    category: "Finishing",
    title: "Power Floating",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-stair-formwork_22770470.jpeg",
    alt: "Precision concrete stair formwork with steel reinforcement in Brisbane",
    category: "Stairs",
    title: "Stair Formwork",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    alt: "Exposed aggregate concrete driveway finish close-up Brisbane",
    category: "Driveways",
    title: "Exposed Aggregate",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-1_942fd49e.jpeg",
    alt: "Concrete retaining wall installation along fence line in Brisbane suburb",
    category: "Retaining",
    title: "Retaining Wall",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-2_710ff4d5.jpeg",
    alt: "Sleeper retaining wall construction Brisbane by Concrete Concepts Group",
    category: "Retaining",
    title: "Sleeper Retaining Wall",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-3_bb83bac8.jpeg",
    alt: "Retaining wall site preparation Brisbane with Concrete Concepts Group",
    category: "Retaining",
    title: "Site Preparation",
  },
  // New real project photos — March 2026 batch 2
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/commercial-slab-pour_264779c3.jpg",
    alt: "Large commercial concrete slab pour with steel poles and concrete truck Brisbane",
    category: "Slabs",
    title: "Commercial Slab Pour",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/concrete-driveway-narrow_2587888f.jpg",
    alt: "Freshly poured concrete driveway between fences with smooth finish Brisbane residential",
    category: "Driveways",
    title: "Narrow Driveway Pour",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-driveway-wash_89f1b54e.jpg",
    alt: "Exposed aggregate concrete driveway being washed next to dark brick house Brisbane",
    category: "Driveways",
    title: "Exposed Aggregate Wash",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/the-gap-excavation-prep_a1caa70f.jpg",
    alt: "Kubota mini excavator site preparation and excavation for concrete slab at The Gap Brisbane",
    category: "Excavation",
    title: "Excavation Prep — The Gap",
  },
  // New photos batch 2
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-closeup_e16c9248.jpeg",
    alt: "Close-up of exposed aggregate concrete finish showing black and white stone detail Brisbane",
    category: "Driveways",
    title: "Exposed Aggregate Detail",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-driveway_803ff92a.jpeg",
    alt: "Exposed aggregate concrete driveway with curved edge at garage entrance Brisbane",
    category: "Driveways",
    title: "Exposed Aggregate Driveway",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/plain-concrete-sidepath_6ce5e329.jpeg",
    alt: "Plain concrete side path leading to shed with smooth broom finish Brisbane residential",
    category: "Finishing",
    title: "Side Path & Access",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
    alt: "New plain concrete driveway installation with palm tree Brisbane residential property",
    category: "Driveways",
    title: "New Driveway Install",
  },
  // Merged from old site (concreteconcepts.manus.space)
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/concrete-slab-1_56311043.jpg",
    alt: "Smooth trowel finish concrete slab Brisbane residential project by Concrete Concepts",
    category: "Slabs",
    title: "Smooth Trowel Slab",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/concrete-slab-2_3721a7ce.jpg",
    alt: "Concrete slab formwork and reinforcement preparation Brisbane shed slab",
    category: "Slabs",
    title: "Shed Slab Prep",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/pool-surround-1_adcdb251.jpg",
    alt: "Decorative concrete pool surround installation Brisbane backyard by Concrete Concepts Group",
    category: "Patios",
    title: "Decorative Pool Surround",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/pool-concrete-3_6085efa5.jpg",
    alt: "Pool area concrete work with decorative finish Brisbane residential",
    category: "Patios",
    title: "Pool Area Concrete",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/excavator-work-1_99a98a3d.jpg",
    alt: "Excavation and site preparation earthworks Brisbane by Concrete Concepts Group",
    category: "Excavation",
    title: "Excavation Works",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/tipper-truck-1_fef8065c.png",
    alt: "Professional tipper truck material transport equipment fleet Concrete Concepts Brisbane",
    category: "Excavation",
    title: "Equipment Fleet",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-2_0dfe95f7.jpg",
    alt: "High quality exposed aggregate concrete close-up detail Brisbane driveway",
    category: "Driveways",
    title: "Aggregate Close-Up",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-3_af207e09.jpg",
    alt: "Durable exposed aggregate concrete surface finish Brisbane residential",
    category: "Driveways",
    title: "Aggregate Surface",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-driveway-house_50304489.jpg",
    alt: "Complete exposed aggregate driveway installation Brisbane home by Concrete Concepts",
    category: "Driveways",
    title: "Full Driveway Install",
  },
  // Real project photos — March 2026 batch
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/logan-exposed-aggregate-driveway_6d51814c.jpg",
    alt: "Exposed aggregate driveway being washed and finished by Concrete Concepts team in Logan Brisbane",
    category: "Driveways",
    title: "Exposed Aggregate — Logan",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/the-gap-concrete-slab_e8c1d11a.jpg",
    alt: "Large concrete slab pour for house extension at The Gap Brisbane with tropical garden setting",
    category: "Slabs",
    title: "House Extension Slab — The Gap",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-slab-carport_bfbe57bd.jpg",
    alt: "Freshly poured smooth concrete slab under carport at Manly Brisbane bayside",
    category: "Slabs",
    title: "Carport Slab — Manly",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-pour-team_bc52e91e.jpg",
    alt: "Concrete Concepts team pouring concrete with rebar mesh reinforcement at Manly Brisbane",
    category: "Slabs",
    title: "Team Pour — Manly",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-prep-rebar_2e944823.jpg",
    alt: "Patio slab preparation with formwork plastic membrane and rebar mesh reinforcement Brisbane",
    category: "Patios",
    title: "Patio Prep — Formwork & Rebar",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-poured-fresh_3fb4bb58.jpg",
    alt: "Freshly poured L-shaped concrete patio slab with smooth finish Brisbane residential",
    category: "Patios",
    title: "Patio Pour — Fresh Finish",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-finished_4b14e1e7.jpg",
    alt: "Completed small concrete patio slab with smooth finish and rock retaining wall Brisbane backyard",
    category: "Patios",
    title: "Patio Complete — Smooth Finish",
  },
];

const categories = ["All", "Slabs", "Finishing", "Stairs", "Driveways", "Retaining", "Patios", "Excavation"];

export default function ProjectGallery() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  const openLightbox = (index: number) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);

  const navigateLightbox = (direction: number) => {
    if (lightbox === null) return;
    const newIndex = lightbox + direction;
    if (newIndex >= 0 && newIndex < filtered.length) {
      setLightbox(newIndex);
    }
  };

  return (
    <section id="work" className="py-24 lg:py-32 bg-secondary">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-px bg-brand-gold" />
            <span
              className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Our Work
            </span>
            <div className="w-10 h-px bg-brand-gold" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-charcoal leading-tight mb-5">
            Recent <span className="text-brand-gold italic">Projects</span>
          </h2>
          <p
            className="text-lg text-muted-foreground leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Real photos from real jobs. See the quality and craftsmanship 
            that goes into every Concrete Concepts project.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === cat
                  ? "bg-brand-gold text-brand-charcoal shadow-md"
                  : "bg-white text-muted-foreground hover:bg-brand-gold/10 hover:text-brand-charcoal border border-border"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid — uniform 2/3/5 columns */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => (
              <motion.div
                key={project.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group relative overflow-hidden rounded-lg cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={project.src}
                    alt={project.alt}
                    width={300}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-body)" }}>
                      {project.title}
                    </p>
                    <p className="text-white/70 text-xs mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                      {project.category}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation */}
            {lightbox > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            )}
            {lightbox < filtered.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filtered[lightbox].src}
                  width={800}
                  height={600}
                  loading="eager"
                  decoding="async"
                alt={filtered[lightbox].alt}
                className="w-full h-full object-contain rounded-lg"
              />
              <div className="text-center mt-4">
                <p className="text-white font-semibold text-lg">{filtered[lightbox].title}</p>
                <p className="text-white/50 text-sm mt-1" style={{ fontFamily: "var(--font-body)" }}>
                  {filtered[lightbox].alt}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
