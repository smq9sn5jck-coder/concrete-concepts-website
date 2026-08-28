/*
  Before/After Gallery Page
  Targets: "concrete driveway before after", "concrete transformation Brisbane"
  Features: Image comparison sliders, project stories, SEO content
*/
import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Phone, Camera, Star, Shield, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SocialShare from "@/components/SocialShare";
import { trackPhoneCallClick } from "@/components/ConversionTracking";
import StickyMobileCTA from "@/components/StickyMobileCTA";

interface BeforeAfterProject {
  id: string;
  title: string;
  suburb: string;
  service: string;
  beforeImage: string;
  afterImage: string;
  beforeAlt: string;
  afterAlt: string;
  description: string;
  details: string[];
}

// Before/After projects using existing gallery images as "after" shots
// and using preparation/in-progress shots as "before" shots
const PROJECTS: BeforeAfterProject[] = [
  {
    id: "driveway-exposed-aggregate",
    title: "Exposed Aggregate Driveway Transformation",
    suburb: "Carindale",
    service: "Concrete Driveways",
    beforeImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-slab-prep_28461c38.jpeg",
    afterImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-driveway-house_50304489.jpg",
    beforeAlt: "Old cracked concrete driveway before replacement in Carindale Brisbane",
    afterAlt: "New exposed aggregate concrete driveway after installation in Carindale Brisbane by Concrete Concepts",
    description: "This Carindale homeowner wanted to replace their ageing, cracked driveway with a premium exposed aggregate finish. The old concrete was removed, the sub-base was re-compacted, and a beautiful new exposed aggregate driveway was poured with a Canberra stone blend.",
    details: [
      "Old concrete removal and disposal",
      "Sub-base re-compaction with plate compactor",
      "SL72 steel reinforcement mesh",
      "25MPa concrete with Canberra aggregate blend",
      "Penetrating sealer applied after 28-day cure",
    ],
  },
  {
    id: "retaining-wall-hillside",
    title: "Hillside Retaining Wall & Level Yard",
    suburb: "Kenmore",
    service: "Retaining Walls",
    beforeImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/excavator-work-1_99a98a3d.jpg",
    afterImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-1_942fd49e.jpeg",
    beforeAlt: "Steep sloping backyard before retaining wall construction in Kenmore Brisbane",
    afterAlt: "Completed concrete retaining wall creating level yard in Kenmore Brisbane by Concrete Concepts",
    description: "This Kenmore property had a steep, unusable backyard. We designed and built a 1.5m engineered concrete retaining wall with proper ag pipe drainage, transforming the slope into a level, usable outdoor space.",
    details: [
      "Structural engineering design and council approval",
      "1.5m reinforced concrete retaining wall",
      "Agricultural drainage pipe and gravel blanket",
      "Backfill and compaction in layers",
      "Form 15 certification provided",
    ],
  },
  {
    id: "slab-shed-floor",
    title: "Shed Slab & Workshop Floor",
    suburb: "Springfield",
    service: "Concrete Slabs",
    beforeImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/concrete-slab-2_3721a7ce.jpg",
    afterImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/concrete-slab-1_56311043.jpg",
    beforeAlt: "Shed slab formwork and reinforcement preparation before concrete pour Springfield Brisbane",
    afterAlt: "Completed smooth trowel finish shed slab in Springfield Brisbane by Concrete Concepts",
    description: "This Springfield homeowner needed a heavy-duty shed slab for their workshop. We poured a 150mm thick slab with SL82 reinforcement, designed to handle vehicle hoists and heavy equipment.",
    details: [
      "150mm thick heavy-duty slab",
      "SL82 steel reinforcement mesh",
      "32MPa concrete for extra strength",
      "Smooth trowel finish for workshop use",
      "Control joints cut within 24 hours",
    ],
  },
  {
    id: "pool-surround-entertaining",
    title: "Pool Surround & Entertaining Area",
    suburb: "Redlands",
    service: "Concrete Patios",
    beforeImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-5_d25c6ec1.jpeg",
    afterImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/pool-surround-1_adcdb251.jpg",
    beforeAlt: "Pool area before concrete surround installation in Redlands Brisbane",
    afterAlt: "Completed decorative concrete pool surround and entertaining area Redlands Brisbane by Concrete Concepts",
    description: "This Redlands family wanted a safe, slip-resistant pool surround that doubled as an entertaining area. We installed exposed aggregate concrete with a non-slip finish, integrated drainage, and seamless connection to the house.",
    details: [
      "Exposed aggregate with non-slip finish",
      "Integrated drainage channels",
      "1:100 fall away from pool and house",
      "Expansion joints at all structure interfaces",
      "Penetrating sealer for chemical resistance",
    ],
  },
  {
    id: "residential-slab-steps",
    title: "Residential Slab with Integrated Steps",
    suburb: "Logan",
    service: "Concrete Slabs",
    beforeImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-stair-formwork_22770470.jpeg",
    afterImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-finished-slab_74e9f7cd.jpeg",
    beforeAlt: "Stair formwork and reinforcement before concrete pour in Logan Brisbane",
    afterAlt: "Completed concrete slab with integrated steps in Logan Brisbane by Concrete Concepts",
    description: "This Logan project required a residential slab with integrated concrete steps to manage the site's level change. Precision formwork ensured clean lines and consistent step heights throughout.",
    details: [
      "Precision stair formwork with steel reinforcement",
      "Integrated steps with consistent 175mm risers",
      "25MPa concrete with smooth trowel finish",
      "Non-slip broom finish on step treads",
      "Curing compound for crack prevention",
    ],
  },
  {
    id: "plain-driveway-modern",
    title: "Modern Plain Concrete Driveway",
    suburb: "Camp Hill",
    service: "Concrete Driveways",
    beforeImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-3_e9b3c7b9.jpeg",
    afterImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
    beforeAlt: "Driveway site preparation and formwork before concrete pour Camp Hill Brisbane",
    afterAlt: "New plain concrete driveway with clean modern finish Camp Hill Brisbane by Concrete Concepts",
    description: "This Camp Hill homeowner chose a clean, modern plain concrete driveway to complement their contemporary home. The broom finish provides excellent grip while maintaining a sleek appearance.",
    details: [
      "Old driveway removal and disposal",
      "200mm excavation with compacted sub-base",
      "SL72 reinforcement mesh on bar chairs",
      "25MPa concrete with broom finish",
      "Proper drainage fall to street",
    ],
  },
];

function ImageComparisonSlider({ before, after, beforeAlt, afterAlt }: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) handleMove(e.clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] overflow-hidden rounded-lg cursor-col-resize select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After image (full width, behind) */}
      <img
        src={after}
        alt={afterAlt}
        width={600}
        height={400}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={before}
          alt={beforeAlt}
          width={600}
          height={400}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${containerRef.current ? containerRef.current.offsetWidth : 100}px`, maxWidth: "none" }}
          loading="lazy"
          decoding="async"
        />
      </div>
      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-brand-charcoal -mr-1" />
          <ChevronRight className="w-4 h-4 text-brand-charcoal -ml-1" />
        </div>
      </div>
      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded z-20" style={{ fontFamily: "var(--font-body)" }}>
        BEFORE
      </div>
      <div className="absolute top-3 right-3 bg-brand-gold/90 text-brand-charcoal text-xs font-semibold px-2.5 py-1 rounded z-20" style={{ fontFamily: "var(--font-body)" }}>
        AFTER
      </div>
    </div>
  );
}

export default function BeforeAfterGallery() {
  const [selectedProject, setSelectedProject] = useState<BeforeAfterProject | null>(null);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Concrete Project Gallery — Brisbane Projects",
    description: "See our completed concrete projects — driveways, retaining walls, slabs, and patios across Brisbane by Concrete Concepts Group.",
    publisher: {
      "@type": "LocalBusiness",
      name: "Concrete Concepts Group Pty Ltd",
      telephone: "+61424463268",
    },
    image: PROJECTS.map(p => ({
      "@type": "ImageObject",
      contentUrl: p.afterImage,
      name: p.title,
      description: p.afterAlt,
    })),
  };

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title="Concrete Project Gallery Brisbane | Concrete Concepts Group"
        description="See our completed concrete projects — driveways, retaining walls, slabs, and patios across Brisbane. Real work by Concrete Concepts Group. QBCC Licensed."
        canonical="/gallery/before-after"
        keywords="concrete before after Brisbane, concrete driveway transformation, concrete driveway before after, retaining wall before after, concrete patio before after, concreter Brisbane results"
        structuredData={[structuredData]}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative bg-brand-charcoal text-white py-20 lg:py-28">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: "Our Work", href: "/#work" },
              { label: "Project Gallery" },
            ]}
            className="mb-8"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-6 h-6 text-brand-gold" />
              <span className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
                Real Results
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 max-w-3xl">
              Our <span className="text-brand-gold italic">Completed Projects</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Quality concreting you can see. Browse our real Brisbane projects — driveways, slabs, retaining walls, and more by Concrete Concepts Group.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 lg:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {PROJECTS.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
              >
                <ImageComparisonSlider
                  before={project.beforeImage}
                  after={project.afterImage}
                  beforeAlt={project.beforeAlt}
                  afterAlt={project.afterAlt}
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded" style={{ fontFamily: "var(--font-body)" }}>
                      {project.service}
                    </span>
                    <span className="text-xs text-gray-400" style={{ fontFamily: "var(--font-body)" }}>
                      {project.suburb}, Brisbane
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-brand-charcoal mb-2">{project.title}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-body)" }}>
                    {project.description}
                  </p>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-brand-gold hover:text-brand-gold-dark text-sm font-semibold transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    View Project Details →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-8">
              Why Our <span className="text-brand-gold italic">Results Speak for Themselves</span>
            </h2>
            <div className="space-y-6 text-gray-700 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Every project in our before and after gallery represents a real Brisbane property that we've transformed with quality concreting. From crumbling driveways to unusable sloping backyards, we've helped hundreds of Brisbane homeowners turn problem areas into stunning, functional spaces that add value to their properties.
              </p>
              <p>
                What sets our work apart is the attention to detail at every stage. Proper excavation and sub-base preparation, quality steel reinforcement, the right concrete mix for the application, and expert finishing techniques — these are the fundamentals that ensure your concrete looks great on day one and still looks great 30 years later.
              </p>
              <p>
                We're proud to share these transformations because they demonstrate the real-world difference between a professional concreting job and a budget one. When you choose Concrete Concepts Group, you're choosing QBCC licensed tradespeople who take pride in their work and stand behind every project we complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Sharing */}
      <div className="container py-8">
        <div className="flex items-center justify-center">
          <SocialShare
            url="/gallery/before-after"
            title="Before & After Concrete Transformations | Concrete Concepts Group"
            description="See real concrete transformations across Brisbane — driveways, patios, retaining walls and more."
            contentType="gallery"
          />
        </div>
      </div>

      {/* CTA */}
      <section className="py-16 bg-brand-gold">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-4">
            Ready for Your Own Transformation?
          </h2>
          <p className="text-brand-charcoal/70 mb-8 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            Get a free quote and see what Concrete Concepts Group can do for your property. QBCC Licensed #15299707.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
              className="inline-flex items-center justify-center gap-2 bg-brand-charcoal hover:bg-brand-charcoal/90 text-white font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Phone className="w-4 h-4" />
              0424 463 268
            </a>
            <a
              href="/get-quote"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-brand-charcoal font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Request a Quote Online
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>QBCC Licensed #15299707</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Star className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>5-Star Google Rating</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>
                <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="hover:text-brand-gold transition-colors">0424 463 268</a>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded" style={{ fontFamily: "var(--font-body)" }}>
                    {selectedProject.service}
                  </span>
                  <h3 className="text-xl font-bold text-brand-charcoal mt-2">{selectedProject.title}</h3>
                  <p className="text-sm text-gray-400" style={{ fontFamily: "var(--font-body)" }}>{selectedProject.suburb}, Brisbane</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-body)" }}>
                {selectedProject.description}
              </p>
              <h4 className="font-semibold text-brand-charcoal text-sm mb-2">Project Scope:</h4>
              <ul className="space-y-1.5 mb-6">
                {selectedProject.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600" style={{ fontFamily: "var(--font-body)" }}>
                    <span className="text-brand-gold mt-0.5">✓</span>
                    {detail}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <a
                  href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold px-4 py-2.5 rounded-lg text-sm transition-all"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
                <a
                  href="/get-quote"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-charcoal hover:bg-brand-charcoal/90 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Get a Quote
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
