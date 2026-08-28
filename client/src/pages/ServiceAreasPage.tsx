/*
  Service Areas Hub Page: Lists all suburbs/areas served
  Acts as a pillar page linking to all suburb landing pages
  Strong internal linking for SEO topical authority
*/
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Phone, Shield, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { trackPhoneCallClick, trackWhatsAppClick } from "@/components/ConversionTracking";
import StickyMobileCTA from "@/components/StickyMobileCTA";

const REGIONS = [
  {
    name: "Brisbane CBD & Inner City",
    suburbs: [
      { name: "Fortitude Valley", slug: "fortitude-valley" },
      { name: "New Farm", slug: "new-farm" },
      { name: "Teneriffe", slug: "teneriffe" },
      { name: "Newstead", slug: "newstead" },
      { name: "Bowen Hills", slug: "bowen-hills" },
      { name: "Spring Hill", slug: "spring-hill" },
      { name: "Herston", slug: "herston" },
      { name: "Kelvin Grove", slug: "kelvin-grove" },
      { name: "Woolloongabba", slug: "woolloongabba" },
    ],
  },
  {
    name: "Brisbane Inner-East & Bayside",
    suburbs: [
      { name: "Morningside", slug: "morningside" },
      { name: "Wynnum", slug: "wynnum" },
      { name: "Bulimba", slug: "bulimba" },
      { name: "Hawthorne", slug: "hawthorne" },
      { name: "Cannon Hill", slug: "cannon-hill" },
      { name: "Carina", slug: "carina" },
      { name: "Manly West", slug: "manly-west" },
      { name: "Wynnum West", slug: "wynnum-west" },
      { name: "Tingalpa", slug: "tingalpa" },
      { name: "Lota", slug: "lota" },
      { name: "Manly", slug: "manly" },
    ],
  },
  {
    name: "Brisbane Inner-South",
    suburbs: [
      { name: "Coorparoo", slug: "coorparoo" },
      { name: "Greenslopes", slug: "greenslopes" },
      { name: "Annerley", slug: "annerley" },
      { name: "Camp Hill", slug: "camp-hill" },
      { name: "West End", slug: "west-end" },
      { name: "Mansfield", slug: "mansfield" },
      { name: "Wishart", slug: "wishart" },
    ],
  },
  {
    name: "Brisbane Southside",
    suburbs: [
      { name: "Carindale", slug: "carindale" },
      { name: "Holland Park", slug: "holland-park" },
      { name: "Tarragindi", slug: "tarragindi" },
      { name: "Moorooka", slug: "moorooka" },
      { name: "Mount Gravatt", slug: "mount-gravatt" },
      { name: "Sunnybank", slug: "sunnybank" },
      { name: "Calamvale", slug: "calamvale" },
      { name: "Sunnybank Hills", slug: "sunnybank-hills" },
      { name: "Eight Mile Plains", slug: "eight-mile-plains" },
      { name: "Rochedale", slug: "rochedale" },
    ],
  },
  {
    name: "Brisbane Western Suburbs",
    suburbs: [
      { name: "Indooroopilly", slug: "indooroopilly" },
      { name: "Toowong", slug: "toowong" },
      { name: "Kenmore", slug: "kenmore" },
      { name: "Chapel Hill", slug: "chapel-hill" },
      { name: "Paddington", slug: "paddington" },
      { name: "Bardon", slug: "bardon" },
      { name: "Sherwood", slug: "sherwood" },
      { name: "Oxley", slug: "oxley" },
      { name: "Forest Lake", slug: "forest-lake" },
      { name: "Inala", slug: "inala" },
      { name: "Richlands", slug: "richlands" },
      { name: "Darra", slug: "darra" },
      { name: "Middle Park", slug: "middle-park" },
    ],
  },
  {
    name: "Brisbane Northside",
    suburbs: [
      { name: "Nundah", slug: "nundah" },
      { name: "Stafford", slug: "stafford" },
      { name: "Everton Park", slug: "everton-park" },
      { name: "Chermside", slug: "chermside" },
      { name: "Aspley", slug: "aspley" },
      { name: "Bracken Ridge", slug: "bracken-ridge" },
      { name: "The Gap", slug: "the-gap" },
      { name: "Ferny Grove", slug: "ferny-grove" },
      { name: "Albion", slug: "albion" },
      { name: "Ascot", slug: "ascot" },
      { name: "Clayfield", slug: "clayfield" },
      { name: "Mitchelton", slug: "mitchelton" },
      { name: "Kedron", slug: "kedron" },
      { name: "Sandgate", slug: "sandgate" },
      { name: "Carseldine", slug: "carseldine" },
      { name: "Banyo", slug: "banyo" },
      { name: "Northgate", slug: "northgate" },
    ],
  },
  {
    name: "Moreton Bay & North",
    suburbs: [
      { name: "North Lakes", slug: "north-lakes" },
      { name: "Caboolture", slug: "caboolture" },
      { name: "Strathpine", slug: "strathpine" },
      { name: "Burpengary", slug: "burpengary" },
      { name: "Morayfield", slug: "morayfield" },
      { name: "Redcliffe", slug: "redcliffe" },
      { name: "Mango Hill", slug: "mango-hill" },
      { name: "Kallangur", slug: "kallangur" },
      { name: "Narangba", slug: "narangba" },
      { name: "Deception Bay", slug: "deception-bay" },
    ],
  },
  {
    name: "Logan & Beenleigh",
    suburbs: [
      { name: "Logan", slug: "logan" },
      { name: "Beenleigh", slug: "beenleigh" },
      { name: "Marsden", slug: "marsden" },
      { name: "Shailer Park", slug: "shailer-park" },
      { name: "Underwood", slug: "underwood" },
      { name: "Woodridge", slug: "woodridge" },
      { name: "Springwood", slug: "springwood" },
      { name: "Daisy Hill", slug: "daisy-hill" },
      { name: "Logan Reserve", slug: "logan-reserve" },
      { name: "Browns Plains", slug: "browns-plains" },
    ],
  },
  {
    name: "Redlands & Bayside",
    suburbs: [
      { name: "Redlands", slug: "redlands" },
      { name: "Capalaba", slug: "capalaba" },
      { name: "Thornlands", slug: "thornlands" },
      { name: "Alexandra Hills", slug: "alexandra-hills" },
      { name: "Redland Bay", slug: "redland-bay" },
      { name: "Victoria Point", slug: "victoria-point" },
      { name: "Cleveland", slug: "cleveland" },
      { name: "Birkdale", slug: "birkdale" },
      { name: "Wellington Point", slug: "wellington-point" },
    ],
  },
  {
    name: "Gold Coast & Northern GC",
    suburbs: [
      { name: "Robina", slug: "robina" },
      { name: "Nerang", slug: "nerang" },
      { name: "Coomera", slug: "coomera" },
      { name: "Ormeau", slug: "ormeau" },
      { name: "Pimpama", slug: "pimpama" },
      { name: "Upper Coomera", slug: "upper-coomera" },
    ],
  },
  {
    name: "Ipswich & Springfield",
    suburbs: [
      { name: "Ipswich", slug: "ipswich" },
      { name: "Springfield", slug: "springfield" },
      { name: "Goodna", slug: "goodna" },
      { name: "Brassall", slug: "brassall" },
      { name: "Redbank Plains", slug: "redbank-plains" },
      { name: "Ripley", slug: "ripley" },
      { name: "Bellbird Park", slug: "bellbird-park" },
    ],
  },
];

const totalSuburbs = REGIONS.reduce((acc, r) => acc + r.suburbs.length, 0);

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Concrete Concepts Group Service Areas",
  description: `Professional concreting services across ${totalSuburbs}+ suburbs in Brisbane and all surrounding areas`,
  numberOfItems: totalSuburbs,
  itemListElement: REGIONS.flatMap((region) =>
    region.suburbs.map((suburb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Concreter ${suburb.name}`,
      url: `https://concreteconceptsgroup.com/areas/${suburb.slug}`,
    }))
  ),
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Service Areas" },
];

export default function ServiceAreasPage() {
  const goToQuote = () => {
    window.location.href = "/get-quote";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Concreting Service Areas Brisbane | All Suburbs We Cover | Concrete Concepts"
        description={`Professional concreting services across ${totalSuburbs}+ suburbs in Brisbane and all surrounding areas. Find your local concreter. QBCC Licensed #15299707. Free quotes — 0424 463 268.`}
        canonical="/areas"
        keywords="concreter near me, concreting brisbane suburbs, concrete driveway brisbane southside, concreter logan, concreter ipswich, concreter redlands, concreter north lakes, concreter chermside"
        structuredData={structuredData}
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-brand-charcoal pt-28 pb-16 lg:pt-32 lg:pb-20">
        <div className="container">
          <Breadcrumbs items={breadcrumbs} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
              Concreting Service Areas{" "}
              <span className="text-brand-gold italic">Brisbane & SEQ</span>
            </h1>
            <p
              className="text-lg text-white/70 leading-relaxed mb-8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Concrete Concepts Group provides professional concreting services
              across {totalSuburbs}+ suburbs in Brisbane and all surrounding
              areas. Find your local area below for suburb-specific information,
              or call us for a free on-site quote.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={goToQuote}
                className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold px-8 py-6 text-base uppercase tracking-wide shadow-xl shadow-brand-gold/25"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Get a Free Quote
              </Button>
              <a
                href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
                className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Phone className="w-4 h-4" />
                0424 463 268
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="bg-brand-gold py-3">
        <div className="container flex flex-wrap justify-center gap-6 lg:gap-12">
          {[
            { icon: Shield, text: "QBCC Licensed #15299707" },
            { icon: Award, text: "Fully Insured & GST Registered" },
            { icon: MapPin, text: `${totalSuburbs}+ Suburbs Covered` },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-brand-charcoal" />
              <span
                className="text-sm font-semibold text-brand-charcoal"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regions Grid */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {REGIONS.map((region, ri) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: ri * 0.1 }}
                className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden"
              >
                {/* Region header */}
                <div className="bg-brand-charcoal px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-gold" />
                    {region.name}
                  </h2>
                </div>

                {/* Suburb links */}
                <div className="p-6">
                  <ul className="space-y-3">
                    {region.suburbs.map((suburb) => (
                      <li key={suburb.slug}>
                        <Link
                          href={`/areas/${suburb.slug}`}
                          className="flex items-center justify-between group py-2 px-3 rounded-lg hover:bg-brand-gold/10 transition-colors"
                        >
                          <span
                            className="text-brand-charcoal font-medium group-hover:text-brand-gold-dark transition-colors"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            Concreter {suburb.name}
                          </span>
                          <ArrowRight className="w-4 h-4 text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 bg-brand-charcoal rounded-2xl p-8 lg:p-12 text-center"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Don't See Your Suburb?{" "}
              <span className="text-brand-gold italic">We Still Cover It</span>
            </h2>
            <p
              className="text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              We service all of Brisbane and surrounding areas. If your
              suburb isn't listed above, give us a call — we're happy to provide
              a free quote for concreting projects anywhere in the greater
              Brisbane region and beyond.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
                className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold px-8 py-4 rounded-lg text-base uppercase tracking-wide shadow-xl shadow-brand-gold/25 transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Phone className="w-5 h-5" />
                Call 0424 463 268
              </a>
              <a
                href="https://wa.me/61424463268?text=Hi%2C%20I%27d%20like%20a%20free%20quote%20for%20a%20concreting%20project."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick()}
                className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              >
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 lg:py-16 bg-brand-charcoal/5">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-brand-charcoal mb-6">
            Professional Concreting Across Brisbane & All Surrounding Areas
          </h2>
          <div
            className="prose prose-lg max-w-none text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <p>
              Concrete Concepts Group is a QBCC Licensed concreting company
              (Licence #15299707) providing professional concrete services across
              Brisbane and all surrounding areas. Our team of
              experienced concreters delivers high-quality driveways, house
              slabs, exposed aggregate, retaining walls, patios, and excavation
              services to residential and commercial clients.
            </p>
            <p>
              Whether you're in Brisbane's southside suburbs like Carindale,
              Mount Gravatt, and Sunnybank, the Logan and Beenleigh corridor,
              the Redlands and Bayside area, Ipswich and Springfield, or
              Brisbane's northside including Chermside, Aspley, North Lakes, and
              Caboolture — we provide the same professional service and quality
              workmanship.
            </p>
            <p>
              Every project starts with a free on-site measure and quote. We
              provide transparent pricing with no hidden fees, and our work is
              backed by our QBCC licence and full public liability insurance.
              Contact us today on{" "}
              <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="text-brand-gold font-semibold">
                0424 463 268
              </a>{" "}
              for your free concreting quote.
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
