/*
  DESIGN: Foreman's Blueprint — Service Areas
  Bone background, two-column: suburb grid left, photo right
  SEO-rich suburb list for Brisbane and SEQ
*/
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

const AREAS = [
  "Brisbane City", "Northside Brisbane", "Southside Brisbane", "Western Suburbs",
  "Ipswich", "Springfield", "Ripley", "Logan", "Beenleigh", "Browns Plains",
  "Moreton Bay", "Caboolture", "Redcliffe", "Redland City", "Cleveland",
  "Gold Coast", "Sunshine Coast", "Toowoomba", "Scenic Rim", "Lockyer Valley",
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function ServiceAreasSection() {
  const { ref, inView } = useInView();

  return (
    <section id="areas" className="bg-bone py-20 md:py-28" ref={ref}>
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text + suburb list */}
          <div
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateY(20px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          >
            <p className="section-stamp mb-3">06 / Where We Work</p>
            <h2
              className="text-navy mb-4"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
            >
              Brisbane & All Surrounding Areas
            </h2>
            <p className="text-charcoal/70 mb-8">
              Based in Brisbane, we travel across South East Queensland. If you're not sure whether we cover your area — just call. We almost certainly do.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {AREAS.map((area, i) => (
                <div
                  key={area}
                  className="flex items-center gap-2 text-sm text-charcoal/80"
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? "none" : "translateY(8px)",
                    transition: `opacity 0.35s ease ${0.1 + i * 0.03}s, transform 0.35s ease ${0.1 + i * 0.03}s`,
                  }}
                >
                  <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  {area}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}
                className="btn-gold text-sm py-3 px-7 inline-flex"
              >
                Check Your Suburb — Free Quote
              </a>
            </div>
          </div>

          {/* Photo */}
          <div
            className="relative"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateX(24px)",
              transition: "opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s",
            }}
          >
            <img
              src="/manus-storage/the-gap-excavation-prep_a1caa70f_97898bc3.jpg"
              alt="Concrete Concepts Group working in The Gap Brisbane"
              className="w-full h-80 md:h-[440px] object-cover rounded-sm"
              loading="lazy"
            />
            <div
              className="absolute -bottom-4 -left-4 bg-navy text-bone p-4 rounded-sm hidden md:block"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <div className="mono-stamp text-gold text-xs mb-1">QBCC LICENCE</div>
              <div className="mono-stamp text-bone font-bold">#15299707</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
