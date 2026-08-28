/*
  Projects / Case Studies Page
  Showcases completed projects with before/after images, suburb location, scope of work, and details
  Targets long-tail searches like "exposed aggregate driveway Camp Hill"
  URL: /projects
*/
import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, Calendar, Ruler, Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CallbackPopup from "@/components/CallbackPopup";
import { trackPhoneCallClick } from "@/components/ConversionTracking";
import StickyMobileCTA from "@/components/StickyMobileCTA";

interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  suburb: string;
  suburbSlug: string;
  region: string;
  serviceType: string;
  serviceSlug: string;
  completedDate: string;
  area: string;
  duration: string;
  description: string;
  scope: string[];
  images: ProjectImage[];
  testimonial?: { name: string; text: string; rating: number };
}

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW";

const PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Exposed Aggregate Driveway — Camp Hill",
    slug: "exposed-aggregate-driveway-camp-hill",
    suburb: "Camp Hill",
    suburbSlug: "camp-hill",
    region: "Brisbane Inner-South",
    serviceType: "Exposed Aggregate",
    serviceSlug: "exposed-aggregate-brisbane",
    completedDate: "February 2025",
    area: "65 m²",
    duration: "3 days",
    description: "This Camp Hill homeowner wanted to replace their ageing plain concrete driveway with a premium exposed aggregate finish. The existing driveway had significant cracking and was detracting from the home's kerb appeal. We removed the old driveway, prepared the sub-base with proper compaction, and poured a beautiful exposed aggregate finish with a warm stone blend that complements the Queenslander-style home.",
    scope: [
      "Demolition and removal of existing driveway",
      "Sub-base preparation and compaction",
      "Steel reinforcement with SL82 mesh",
      "65 m² exposed aggregate pour with premium stone blend",
      "Expansion joints and edge finishing",
      "High-quality penetrating sealer application",
    ],
    images: [
      { src: `${CDN}/project-exposed-agg_3890c724.jpeg`, alt: "Completed exposed aggregate driveway in Camp Hill", caption: "Finished exposed aggregate driveway" },
      { src: `${CDN}/exposed-aggregate-closeup_e16c9248.jpeg`, alt: "Close-up of exposed aggregate stone texture", caption: "Premium stone blend close-up" },
      { src: `${CDN}/exposed-aggregate-driveway_803ff92a.jpeg`, alt: "Full view of exposed aggregate driveway", caption: "Full driveway view from street" },
    ],
    testimonial: { name: "Sarah W.", text: "The team from Concrete Concepts did a fantastic job on our new exposed aggregate driveway. It has completely transformed the look of our home. Professional, efficient, and the quality is outstanding.", rating: 5 },
  },
  {
    id: "proj-2",
    title: "Retaining Wall & Patio — Mount Gravatt",
    slug: "retaining-wall-patio-mount-gravatt",
    suburb: "Mount Gravatt",
    suburbSlug: "mount-gravatt",
    region: "Brisbane Southside",
    serviceType: "Retaining Walls",
    serviceSlug: "retaining-walls-brisbane",
    completedDate: "January 2025",
    area: "40 m²",
    duration: "5 days",
    description: "This Mount Gravatt property had a steeply sloping backyard that was unusable. The homeowners wanted to create a level entertaining area with a retaining wall to hold back the slope. We engineered a 1.2m high concrete block retaining wall with proper drainage, then poured a 40 m² patio slab behind it — transforming a wasted hillside into a beautiful outdoor living space.",
    scope: [
      "Site excavation and earthworks",
      "1.2m engineered concrete block retaining wall",
      "AG drainage pipe and gravel backfill",
      "40 m² reinforced concrete patio slab",
      "Broom finish with decorative border",
      "Retaining wall render and paint",
    ],
    images: [
      { src: `${CDN}/project-retaining-wall-1_942fd49e.jpeg`, alt: "Completed retaining wall in Mount Gravatt", caption: "Finished retaining wall" },
      { src: `${CDN}/project-retaining-wall-2_710ff4d5.jpeg`, alt: "Retaining wall with patio behind", caption: "Retaining wall and patio area" },
      { src: `${CDN}/project-retaining-wall-3_bb83bac8.jpeg`, alt: "Retaining wall drainage detail", caption: "Proper drainage installation" },
    ],
    testimonial: { name: "Myresh M.", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality finish. Our backyard is now completely usable.", rating: 5 },
  },
  {
    id: "proj-3",
    title: "House Slab & Driveway — Logan",
    slug: "house-slab-driveway-logan",
    suburb: "Logan",
    suburbSlug: "logan",
    region: "Logan City",
    serviceType: "Concrete Slabs",
    serviceSlug: "concrete-slabs-brisbane",
    completedDate: "December 2024",
    area: "180 m²",
    duration: "7 days",
    description: "A new build project in Logan requiring a full house slab and double driveway. The reactive clay soils in the area demanded careful engineering — we worked closely with the structural engineer to ensure the slab was designed to handle soil movement. The project included a 130 m² house slab with edge beams and internal stiffening beams, plus a 50 m² plain concrete driveway.",
    scope: [
      "Full site excavation to engineering specs",
      "Termite treatment barrier installation",
      "130 m² house slab with edge and stiffening beams",
      "SL82 mesh reinforcement throughout",
      "50 m² plain concrete driveway",
      "Power float finish to house slab",
    ],
    images: [
      { src: `${CDN}/project-finished-slab_74e9f7cd.jpeg`, alt: "Completed house slab in Logan", caption: "Finished house slab with steps" },
      { src: `${CDN}/project-slab-prep_28461c38.jpeg`, alt: "Slab preparation with steel reinforcement", caption: "Steel reinforcement ready for pour" },
      { src: `${CDN}/project-power-float_ca89df9c.jpeg`, alt: "Power floating the concrete slab", caption: "Power float finishing" },
    ],
    testimonial: { name: "Paul S.", text: "The price was what I had expected to pay and they came out to inspect the site before quoting. Would recommend them for any concreting work.", rating: 5 },
  },
  {
    id: "proj-4",
    title: "Pool Surround & Entertaining Area — Wynnum",
    slug: "pool-surround-entertaining-wynnum",
    suburb: "Wynnum",
    suburbSlug: "wynnum",
    region: "Brisbane Bayside",
    serviceType: "Concrete Patios",
    serviceSlug: "concrete-patios-brisbane",
    completedDate: "November 2024",
    area: "55 m²",
    duration: "4 days",
    description: "This bayside Wynnum property needed a complete pool surround upgrade. The existing pavers were uneven and becoming a trip hazard. We removed the old pavers, prepared the sub-base, and poured a slip-resistant exposed aggregate pool surround with an integrated entertaining area. The coastal-inspired stone blend was chosen to complement the bayside setting.",
    scope: [
      "Removal of existing paver surround",
      "Sub-base preparation and compaction",
      "55 m² exposed aggregate pour",
      "Slip-resistant finish for pool safety",
      "Salt-resistant penetrating sealer",
      "Coping edge detail around pool",
    ],
    images: [
      { src: `${CDN}/pool-surround-1_adcdb251.jpg`, alt: "Exposed aggregate pool surround in Wynnum", caption: "Completed pool surround" },
      { src: `${CDN}/pool-concrete-3_6085efa5.jpg`, alt: "Pool entertaining area with concrete finish", caption: "Entertaining area by the pool" },
      { src: `${CDN}/exposed-aggregate-2_0dfe95f7.jpg`, alt: "Exposed aggregate texture close-up", caption: "Slip-resistant aggregate finish" },
    ],
  },
  {
    id: "proj-5",
    title: "Concrete Driveway & Paths — Carindale",
    slug: "concrete-driveway-paths-carindale",
    suburb: "Carindale",
    suburbSlug: "carindale",
    region: "Brisbane Southside",
    serviceType: "Concrete Driveways",
    serviceSlug: "concrete-driveways-brisbane",
    completedDate: "October 2024",
    area: "75 m²",
    duration: "3 days",
    description: "A complete driveway and pathway replacement for an established Carindale home. The homeowner chose a classic plain concrete finish with a broom texture for excellent grip in wet weather. We also poured new side paths connecting the driveway to the backyard, creating a seamless flow around the property.",
    scope: [
      "Demolition of old cracked driveway",
      "New sub-base with road base compaction",
      "55 m² plain concrete driveway with broom finish",
      "20 m² side paths and garden edging",
      "Expansion joints at 3m intervals",
      "Cure compound application",
    ],
    images: [
      { src: `${CDN}/new-concrete-driveway_963e8b9e.png`, alt: "New concrete driveway in Carindale", caption: "Completed plain concrete driveway" },
      { src: `${CDN}/plain-concrete-sidepath_6ce5e329.jpeg`, alt: "Concrete side path connecting to backyard", caption: "Side path with broom finish" },
      { src: `${CDN}/project-troweling_06ff9a7c.jpeg`, alt: "Troweling the concrete surface", caption: "Hand troweling for smooth finish" },
    ],
  },
  {
    id: "proj-6",
    title: "Excavation & Slab — Springfield",
    slug: "excavation-slab-springfield",
    suburb: "Springfield",
    suburbSlug: "springfield",
    region: "Ipswich & Springfield",
    serviceType: "Excavation",
    serviceSlug: "excavation-brisbane",
    completedDate: "September 2024",
    area: "120 m²",
    duration: "6 days",
    description: "A large-scale excavation and slab project for a new granny flat in Springfield. The site required significant cut and fill to create a level pad on the sloping block. We handled all earthworks including excavation, compaction, and disposal of excess material, then poured a 120 m² engineered slab ready for the builder to start framing.",
    scope: [
      "Site clearing and set-out",
      "Cut and fill earthworks (150 m³)",
      "Compaction to 95% standard proctor",
      "Termite barrier installation",
      "120 m² engineered slab with edge beams",
      "Power float finish",
    ],
    images: [
      { src: `${CDN}/excavator-work-1_99a98a3d.jpg`, alt: "Excavation work in Springfield", caption: "Excavation in progress" },
      { src: `${CDN}/concrete-slab-1_56311043.jpg`, alt: "Concrete slab being poured", caption: "Slab pour in progress" },
      { src: `${CDN}/concrete-slab-2_3721a7ce.jpg`, alt: "Finished concrete slab", caption: "Completed slab ready for build" },
    ],
  },
  {
    id: "proj-7",
    title: "Exposed Aggregate Driveway & Steps — Sunnybank",
    slug: "exposed-aggregate-driveway-steps-sunnybank",
    suburb: "Sunnybank",
    suburbSlug: "sunnybank",
    region: "Brisbane Southside",
    serviceType: "Exposed Aggregate",
    serviceSlug: "exposed-aggregate-brisbane",
    completedDate: "August 2024",
    area: "70 m²",
    duration: "4 days",
    description: "This Sunnybank property had a steep approach from the street that required concrete steps integrated into the driveway design. We designed and built a set of exposed aggregate steps with handrail provisions, flowing seamlessly into a matching exposed aggregate driveway. The result is both functional and visually striking.",
    scope: [
      "Demolition of existing driveway and steps",
      "Formwork for integrated concrete steps",
      "Steel reinforcement for steps and driveway",
      "70 m² exposed aggregate with matching stone blend",
      "Step nosing detail for safety",
      "Penetrating sealer application",
    ],
    images: [
      { src: `${CDN}/project-stair-formwork_22770470.jpeg`, alt: "Formwork for concrete steps in Sunnybank", caption: "Step formwork preparation" },
      { src: `${CDN}/exposed-driveway-house_50304489.jpg`, alt: "Exposed aggregate driveway with house", caption: "Finished driveway and steps" },
      { src: `${CDN}/exposed-aggregate-3_af207e09.jpg`, alt: "Exposed aggregate finish detail", caption: "Aggregate finish close-up" },
    ],
  },
  {
    id: "proj-8",
    title: "Commercial Concrete Pour — North Lakes",
    slug: "commercial-concrete-pour-north-lakes",
    suburb: "North Lakes",
    suburbSlug: "north-lakes",
    region: "Moreton Bay",
    serviceType: "Concrete Slabs",
    serviceSlug: "concrete-slabs-brisbane",
    completedDate: "July 2024",
    area: "200 m²",
    duration: "4 days",
    description: "A large commercial concrete pour for a warehouse extension in North Lakes. This project required careful planning and coordination — 200 m² of heavy-duty concrete with increased thickness and reinforcement to handle forklift traffic. We completed the pour in a single day using two concrete trucks running continuously.",
    scope: [
      "Sub-base preparation for heavy traffic",
      "200mm thick slab with N12 bar reinforcement",
      "200 m² single-day pour",
      "Power float and burnish finish",
      "Saw-cut control joints",
      "Industrial-grade sealer application",
    ],
    images: [
      { src: `${CDN}/project-pouring_f7343992.jpeg`, alt: "Large commercial concrete pour in North Lakes", caption: "Concrete pour in progress" },
      { src: `${CDN}/new-gallery-4_c54657e7.jpeg`, alt: "Excavation for commercial slab", caption: "Site preparation" },
      { src: `${CDN}/new-gallery-5_d25c6ec1.jpeg`, alt: "Completed commercial concrete area", caption: "Finished commercial slab" },
    ],
  },
];

const SERVICE_FILTERS = [
  { label: "All Projects", value: "all" },
  { label: "Exposed Aggregate", value: "Exposed Aggregate" },
  { label: "Concrete Driveways", value: "Concrete Driveways" },
  { label: "Retaining Walls", value: "Retaining Walls" },
  { label: "Concrete Slabs", value: "Concrete Slabs" },
  { label: "Concrete Patios", value: "Concrete Patios" },
  { label: "Excavation", value: "Excavation" },
];

function ImageLightbox({ images, initialIndex, onClose }: { images: ProjectImage[]; initialIndex: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const img = images[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-50">
        <X className="w-8 h-8" />
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex - 1 + images.length) % images.length); }}
            className="absolute left-4 text-white/80 hover:text-white z-50"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex + 1) % images.length); }}
            className="absolute right-4 text-white/80 hover:text-white z-50"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </>
      )}
      <div className="max-w-5xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img src={img.src} alt={img.alt} width={800} height={600} loading="eager" decoding="async" className="max-h-[75vh] object-contain rounded-lg" />
        {img.caption && <p className="text-white/80 mt-3 text-sm">{img.caption}</p>}
        <p className="text-white/50 mt-1 text-xs">{currentIndex + 1} / {images.length}</p>
      </div>
    </motion.div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image Gallery */}
      <div className="grid grid-cols-3 gap-1">
        {project.images.slice(0, 3).map((img, i) => (
          <div
            key={i}
            className={`relative cursor-pointer overflow-hidden ${i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"}`}
            onClick={() => setLightboxIndex(i)}
          >
            <img
              src={img.src}
              alt={img.alt}
              width={400}
              height={300}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
            {i === 0 && (
              <div className="absolute top-3 left-3 bg-brand-yellow text-brand-charcoal text-xs font-bold px-3 py-1 rounded-full">
                {project.serviceType}
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <ImageLightbox
            images={project.images}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-brand-charcoal mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          {project.title}
        </h3>

        <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-brand-yellow" />
            <Link href={`/areas/${project.suburbSlug}`} className="hover:text-brand-yellow transition-colors">
              {project.suburb}
            </Link>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-brand-yellow" />
            {project.completedDate}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="w-4 h-4 text-brand-yellow" />
            {project.area}
          </span>
        </div>

        <p className="text-gray-600 mb-4 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          {project.description}
        </p>

        {/* Scope of Work */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-brand-charcoal mb-2 uppercase tracking-wider">Scope of Work</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {project.scope.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-brand-yellow mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        {project.testimonial && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex gap-1 mb-2">
              {Array.from({ length: project.testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-brand-yellow text-brand-yellow" />
              ))}
            </div>
            <p className="text-gray-600 text-sm italic mb-1" style={{ fontFamily: "var(--font-body)" }}>
              "{project.testimonial.text}"
            </p>
            <p className="text-xs text-gray-400 font-medium">— {project.testimonial.name}</p>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          <Link href={`/services/${project.serviceSlug}`}>
            <Button variant="outline" size="sm" className="text-brand-charcoal border-brand-charcoal/20 hover:bg-brand-yellow/10">
              View {project.serviceType} Services <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href={`/areas/${project.suburbSlug}`}>
            <Button variant="outline" size="sm" className="text-brand-charcoal border-brand-charcoal/20 hover:bg-brand-yellow/10">
              More in {project.suburb} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState("all");

  const filteredProjects = filter === "all"
    ? PROJECTS
    : PROJECTS.filter((p) => p.serviceType === filter);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Our Projects — Concrete Concepts Group",
    description: "Browse our completed concreting projects across Brisbane and all surrounding areas. Driveways, slabs, retaining walls, pool surrounds, and more.",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: PROJECTS.length,
      itemListElement: PROJECTS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        description: p.description,
        image: p.images[0]?.src,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title="Our Projects | Concrete Driveways, Slabs & Retaining Walls | Concrete Concepts"
        description="Browse our completed concreting projects across Brisbane and all surrounding areas. Exposed aggregate driveways, house slabs, retaining walls, pool surrounds, and more."
        keywords="concrete projects Brisbane, concreting portfolio, exposed aggregate driveway, retaining wall project, concrete slab project, before after concrete"
        structuredData={structuredData}
      />
      <Navbar />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Our Projects" }]} />

      {/* Hero */}
      <section className="bg-brand-charcoal py-16 md:py-24">
        <div className="container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Our <span className="text-brand-yellow italic">Projects</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-300 text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Real projects. Real results. Browse our completed work across Brisbane and all surrounding areas.
          </motion.p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SERVICE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f.value
                    ? "bg-brand-yellow text-brand-charcoal"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          <p className="text-sm text-gray-500 mb-6">
            Showing {filteredProjects.length} of {PROJECTS.length} projects
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatePresence mode="wait">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-charcoal py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to Start <span className="text-brand-yellow italic">Your Project?</span>
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            Get a free, no-obligation quote for your concreting project. We service all of Brisbane and surrounding areas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:0424463268" onClick={() => trackPhoneCallClick()}>
              <Button className="bg-brand-yellow text-brand-charcoal hover:bg-brand-yellow/90 font-bold px-8 py-3 text-lg">
                Call 0424 463 268
              </Button>
            </a>
            <Link href="/calculator">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                Get Instant Estimate
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <StickyMobileCTA />
      <CallbackPopup suburbName="Brisbane" />
    </div>
  );
}
