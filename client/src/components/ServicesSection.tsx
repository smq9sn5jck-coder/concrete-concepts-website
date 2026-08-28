/*
  DESIGN: Refined Craft — Concrete Concepts Group brand
  Services: Two-tier layout — featured services with photos + full services grid
  Gold accent lines, warm off-white background, elegant typography
  Full service list from HiPages + excavation, covercrete, retaining walls
  Internal links to dedicated service pages for SEO
  PERF: Lazy loaded images with explicit dimensions
*/
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import performanceAssets from "@/config/performance-assets.json";

const SERVICE_IMAGE_SIZES = "(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 3rem), 400px";

const featuredServices = [
  {
    title: "Our Team at Work",
    description: "Our experienced crew brings skill, pride, and teamwork to every pour. From prep to finish, the Concrete Concepts team delivers quality results on every job across Brisbane and surrounding areas.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-troweling_06ff9a7c.jpeg",
    srcSet: `${performanceAssets.services.troweling.standard.url} ${performanceAssets.services.troweling.standard.width}w, ${performanceAssets.services.troweling.highDensity.url} ${performanceAssets.services.troweling.highDensity.width}w`,
    sizes: SERVICE_IMAGE_SIZES,
    alt: "Concrete Concepts Group team hand troweling fresh concrete to a smooth finish on a Brisbane residential project",
    link: null,
  },
  {
    title: "Concrete Slabs & Foundations",
    description: "Engineered slabs for residential and commercial builds. From house pads to shed slabs, we deliver level, durable foundations built to Australian standards.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-finished-slab_74e9f7cd.jpeg",
    srcSet: undefined,
    sizes: undefined,
    alt: "Finished concrete slab with integrated steps for a residential home in Brisbane",
    link: "/services/concrete-slabs-brisbane",
  },
  {
    title: "Driveways & Pathways",
    description: "Transform your property's entrance with exposed aggregate, coloured, or plain concrete driveways and pathways that combine beauty with lasting durability.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    srcSet: undefined,
    sizes: undefined,
    alt: "Exposed aggregate concrete driveway installation in Brisbane by Concrete Concepts Group",
    link: "/services/concrete-driveways-brisbane",
  },
  {
    title: "Retaining Walls",
    description: "Structural retaining walls that manage terrain and prevent erosion. Expertly designed and built to handle Queensland's unique soil and weather conditions.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-1_942fd49e.jpeg",
    srcSet: undefined,
    sizes: undefined,
    alt: "Concrete retaining wall installation along fence line in Brisbane suburb",
    link: "/services/retaining-walls-brisbane",
  },
  {
    title: "Excavation & Site Prep",
    description: "Full excavation services to get your site ready for concrete. We handle site clearing, trenching, and ground preparation with our own machinery for a seamless start to your project.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-4_c54657e7.jpeg",
    srcSet: `${performanceAssets.services.excavation.standard.url} ${performanceAssets.services.excavation.standard.width}w, ${performanceAssets.services.excavation.highDensity.url} ${performanceAssets.services.excavation.highDensity.width}w`,
    sizes: SERVICE_IMAGE_SIZES,
    alt: "Excavation and site preparation for concrete project in Brisbane",
    link: "/services/excavation-brisbane",
  },
  {
    title: "Site Waste Removal & Tipping",
    description: "Complete site waste removal, excavation clean-up, and tipping services across Brisbane. We handle dirt, rubble, concrete, and green waste removal so your site stays clean and compliant throughout the project.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-5_d25c6ec1.jpeg",
    srcSet: undefined,
    sizes: undefined,
    alt: "Site waste removal truck loaded with excavation dirt for tipping in Brisbane",
    link: "/services/excavation-brisbane",
  },
];

const allServices = [
  { name: "Footpaths", link: null },
  { name: "Pumping", link: null },
  { name: "Exposed Aggregate", link: "/services/exposed-aggregate-brisbane" },
  { name: "Reinforcement", link: null },
  { name: "Sealing", link: null },
  { name: "House Slabs", link: "/services/concrete-slabs-brisbane" },
  { name: "Grinding", link: null },
  { name: "Foundations", link: "/services/concrete-slabs-brisbane" },
  { name: "Formwork", link: null },
  { name: "Driveways", link: "/services/concrete-driveways-brisbane" },
  { name: "Cutting", link: null },
  { name: "Retaining Walls", link: "/services/retaining-walls-brisbane" },
  { name: "Concrete Removal", link: null },
  { name: "Concrete Pools", link: null },
  { name: "Coloured Concrete", link: null },
  { name: "Cleaning", link: null },
  { name: "Excavation", link: "/services/excavation-brisbane" },
  { name: "Covercrete", link: null },
  { name: "Stairs & Steps", link: null },
  { name: "Site Waste Removal & Tipping", link: "/services/excavation-brisbane" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

export default function ServicesSection() {
  const goToQuote = () => {
    window.location.href = "/get-quote";
  };

  return (
    <section id="services" className="py-24 lg:py-32 bg-background">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16 lg:mb-20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-px bg-brand-gold" />
            <span
              className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              What We Do
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-charcoal leading-tight mb-5">
            Brisbane Concreting
            <br />
            <span className="text-brand-gold italic">Services</span>
          </h2>
          <p
            className="text-lg text-muted-foreground leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            From concrete driveways and house slabs to exposed aggregate, retaining walls
            and excavation — we handle every aspect of concreting across Brisbane
            and all surrounding areas.
          </p>
        </motion.div>

        {/* Featured Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {featuredServices.map((service, i) => {
            const CardContent = (
              <motion.div
                key={service.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 h-full"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={service.image}
                    srcSet={service.srcSet}
                    sizes={service.sizes}
                    alt={service.alt}
                    width={400}
                    height={224}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-brand-charcoal mb-3 group-hover:text-brand-gold-dark transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p
                    className="text-muted-foreground text-sm leading-relaxed mb-4"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {service.description}
                  </p>
                  <div
                    className="flex items-center gap-2 text-brand-gold font-semibold text-sm group-hover:gap-3 transition-all duration-300"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <span>{service.link ? "Learn More" : "Get a Quote"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );

            if (service.link) {
              return (
                <Link key={service.title} href={service.link}>
                  {CardContent}
                </Link>
              );
            }

            return (
              <div key={service.title} onClick={goToQuote}>
                {CardContent}
              </div>
            );
          })}
        </div>

        {/* Full Services List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="bg-brand-charcoal rounded-2xl p-8 lg:p-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="lg:max-w-sm shrink-0">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Complete Range of
                <br />
                <span className="text-brand-gold italic">Concreting Services</span>
              </h3>
              <p
                className="text-white/60 leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Whatever your concreting needs, we have the expertise and equipment 
                to deliver outstanding results. If it involves concrete, we can do it.
              </p>
              <Link href="/get-quote">
                <button
                  className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-6 py-3 rounded-lg text-sm tracking-wide uppercase transition-all duration-300"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Request a Quote
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
              {allServices.map((service) => (
                <div key={service.name} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-gold shrink-0" />
                  {service.link ? (
                    <Link href={service.link}>
                      <span
                        className="text-white/80 text-sm hover:text-brand-gold transition-colors cursor-pointer"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {service.name}
                      </span>
                    </Link>
                  ) : (
                    <span
                      className="text-white/80 text-sm"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {service.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
