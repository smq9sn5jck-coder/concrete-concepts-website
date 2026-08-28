/*
  DESIGN: Service Area Map — Concrete Concepts Group
  Interactive Google Map showing Brisbane & SEQ service areas
  Gold brand accents, charcoal background, suburb list + map
  Internal links to suburb landing pages for SEO
*/
import { motion } from "framer-motion";
import { MapView } from "@/components/Map";
import { MapPin, CheckCircle, ArrowRight } from "lucide-react";
import { useRef, useCallback } from "react";
import { Link } from "wouter";

// Brisbane CBD center
const BRISBANE_CENTER = { lat: -27.4698, lng: 153.0251 };

// Suburb slugs that have dedicated pages
const SUBURB_PAGES: Record<string, string> = {
  "Wynnum": "wynnum",
  "Capalaba": "capalaba",
  "Logan": "logan",
  "Springwood": "springwood",
  "Beenleigh": "beenleigh",
  "Springfield": "springfield",
  "Ipswich": "ipswich",
  "Mt Gravatt": "mount-gravatt",
  "Sunnybank": "sunnybank",
  "Carindale": "carindale",
  "Camp Hill": "camp-hill",
  "Redlands": "redlands",
  "Chermside": "chermside",
  "Aspley": "aspley",
  "North Lakes": "north-lakes",
  "Caboolture": "caboolture",
  "Morningside": "morningside",
  "Coorparoo": "coorparoo",
  "Greenslopes": "greenslopes",
  "Holland Park": "holland-park",
  "Tarragindi": "tarragindi",
  "Annerley": "annerley",
  "Moorooka": "moorooka",
  "Kenmore": "kenmore",
  "Indooroopilly": "indooroopilly",
  "Chapel Hill": "chapel-hill",
  "The Gap": "the-gap",
  "Ferny Grove": "ferny-grove",
  "Everton Park": "everton-park",
  "Stafford": "stafford",
  "Nundah": "nundah",
  "Marsden": "marsden",
  "Shailer Park": "shailer-park",
  "Underwood": "underwood",
  "Robina": "robina",
  "Nerang": "nerang",
  "Coomera": "coomera",
  "Ormeau": "ormeau",
  "Burpengary": "burpengary",
  "Redcliffe": "redcliffe",
  "Morayfield": "morayfield",
  "Strathpine": "strathpine",
  "Goodna": "goodna",
  "Brassall": "brassall",
  "Redbank Plains": "redbank-plains",
  "Ripley": "ripley",
};

// Service area suburbs with coordinates
const SERVICE_AREAS = [
  { name: "Brisbane CBD", lat: -27.4698, lng: 153.0251 },
  { name: "Chermside", lat: -27.3856, lng: 153.0311 },
  { name: "Aspley", lat: -27.3644, lng: 153.0150 },
  { name: "North Lakes", lat: -27.2333, lng: 153.0333 },
  { name: "Caboolture", lat: -27.0847, lng: 152.9511 },
  { name: "Manly West", lat: -27.4633, lng: 153.1567 },
  { name: "Wynnum", lat: -27.4417, lng: 153.1733 },
  { name: "Capalaba", lat: -27.5267, lng: 153.1917 },
  { name: "Cleveland", lat: -27.5267, lng: 153.2650 },
  { name: "Redland Bay", lat: -27.6167, lng: 153.3000 },
  { name: "Logan", lat: -27.6389, lng: 153.1094 },
  { name: "Springwood", lat: -27.6100, lng: 153.1283 },
  { name: "Beenleigh", lat: -27.7133, lng: 153.2017 },
  { name: "Ipswich", lat: -27.6167, lng: 152.7667 },
  { name: "Springfield", lat: -27.6667, lng: 152.9067 },
  { name: "Caboolture", lat: -27.0850, lng: 152.9500 },
  { name: "North Lakes", lat: -27.2300, lng: 153.0283 },
  { name: "Redcliffe", lat: -27.2283, lng: 153.1117 },
  { name: "Chermside", lat: -27.3867, lng: 153.0350 },
  { name: "Aspley", lat: -27.3633, lng: 153.0167 },
  { name: "Mt Gravatt", lat: -27.5433, lng: 153.0817 },
  { name: "Sunnybank", lat: -27.5783, lng: 153.0617 },
  { name: "Inala", lat: -27.5967, lng: 152.9733 },
  { name: "Kenmore", lat: -27.5067, lng: 152.9383 },
  { name: "Gold Coast", lat: -28.0167, lng: 153.4000 },
  { name: "Moreton Bay", lat: -27.1217, lng: 153.0350 },
  { name: "Bayside", lat: -27.4817, lng: 153.1800 },
  { name: "Lytton", lat: -27.4183, lng: 153.1700 },
  { name: "Carindale", lat: -27.5033, lng: 153.1017 },
  { name: "Camp Hill", lat: -27.4933, lng: 153.0783 },
];

// Split into columns for display
const REGIONS = [
  {
    title: "Brisbane Inner",
    areas: ["Brisbane CBD", "Morningside", "Coorparoo", "Greenslopes", "Annerley", "Camp Hill", "Nundah"],
  },
  {
    title: "Brisbane South",
    areas: ["Carindale", "Mt Gravatt", "Sunnybank", "Holland Park", "Tarragindi", "Moorooka"],
  },
  {
    title: "Brisbane West",
    areas: ["Indooroopilly", "Kenmore", "Chapel Hill", "The Gap"],
  },
  {
    title: "Brisbane North",
    areas: ["Chermside", "Aspley", "Stafford", "Everton Park", "Ferny Grove"],
  },
  {
    title: "Bayside & Redlands",
    areas: ["Wynnum", "Capalaba", "Cleveland", "Redland Bay"],
  },
  {
    title: "South & Logan",
    areas: ["Logan", "Beenleigh", "Marsden", "Shailer Park", "Underwood"],
  },
  {
    title: "North & Moreton",
    areas: ["Caboolture", "North Lakes", "Strathpine", "Burpengary", "Morayfield", "Redcliffe"],
  },
  {
    title: "Gold Coast",
    areas: ["Robina", "Nerang", "Coomera", "Ormeau"],
  },
  {
    title: "Ipswich & West",
    areas: ["Ipswich", "Springfield", "Goodna", "Brassall", "Redbank Plains", "Ripley"],
  },
];

function AreaItem({ area }: { area: string }) {
  const slug = SUBURB_PAGES[area];
  if (slug) {
    return (
      <Link href={`/areas/${slug}`}>
        <span
          className="flex items-center gap-2 text-brand-silver-light/70 text-sm hover:text-brand-gold transition-colors cursor-pointer"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <CheckCircle className="w-3.5 h-3.5 text-brand-gold/60 shrink-0" />
          {area}
        </span>
      </Link>
    );
  }
  return (
    <div
      className="flex items-center gap-2 text-brand-silver-light/70 text-sm"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <CheckCircle className="w-3.5 h-3.5 text-brand-gold/60 shrink-0" />
      {area}
    </div>
  );
}

export default function ServiceAreaMap() {
  const mapRef = useRef<google.maps.Map | null>(null);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    // Add markers for each service area
    SERVICE_AREAS.forEach((area) => {
      const pinElement = document.createElement("div");
      pinElement.style.width = "12px";
      pinElement.style.height = "12px";
      pinElement.style.borderRadius = "50%";
      pinElement.style.backgroundColor = "#D4A017";
      pinElement.style.border = "2px solid #FFFFFF";
      pinElement.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: area.lat, lng: area.lng },
        title: area.name,
        content: pinElement,
      });
    });

    // Draw a circle to show approximate service radius
    new google.maps.Circle({
      map,
      center: BRISBANE_CENTER,
      radius: 80000, // 80km radius
      fillColor: "#D4A017",
      fillOpacity: 0.06,
      strokeColor: "#D4A017",
      strokeOpacity: 0.3,
      strokeWeight: 2,
    });
  }, []);

  return (
    <section id="service-area" className="py-24 lg:py-32 bg-brand-charcoal overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-px bg-brand-gold" />
            <span
              className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Where We Work
            </span>
            <div className="w-10 h-px bg-brand-gold" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Our Service{" "}
            <span className="text-brand-gold italic">Area</span>
          </h2>

          <p
            className="text-brand-silver-light/70 text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Proudly servicing Brisbane and all surrounding areas across South East Queensland.
            From Caboolture to the Gold Coast, and everywhere in between.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Map - Takes 3 columns */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3 rounded-lg overflow-hidden shadow-2xl border border-white/10"
          >
            <MapView
              className="w-full h-[400px] lg:h-[520px]"
              initialCenter={BRISBANE_CENTER}
              initialZoom={9}
              onMapReady={handleMapReady}
            />
          </motion.div>

          {/* Suburb List - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2 flex flex-col justify-center"
          >
            <div className="space-y-6">
              {REGIONS.map((region, idx) => (
                <motion.div
                  key={region.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * idx }}
                >
                  <h3 className="text-brand-gold font-semibold text-sm tracking-[0.15em] uppercase mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {region.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {region.areas.map((area) => (
                      <AreaItem key={area} area={area} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 p-5 rounded-lg bg-white/5 border border-white/10">
              <p
                className="text-brand-silver-light/80 text-sm mb-3"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Don't see your suburb? We likely still service your area.
                Get in touch for a free quote.
              </p>
              <a
                href="/get-quote"
                className="inline-flex items-center gap-2 text-brand-gold font-semibold text-sm hover:text-brand-gold-light transition-colors"
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
