/*
  DESIGN: Foreman's Blueprint — Services
  Bone background, numbered section stamp, 3-col grid of service cards
  Each card: real project photo, service name, short description, inline CTA
*/
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

const SERVICES = [
  {
    num: "01",
    name: "Concrete Driveways",
    desc: "Plain broom, exposed aggregate, coloured, and covercrete finishes. We build driveways that last and look great from day one.",
    img: "/manus-storage/exposed-aggregate-driveway_803ff92a_8503843f.jpeg",
    alt: "Exposed aggregate concrete driveway Brisbane",
  },
  {
    num: "02",
    name: "Concrete Slabs",
    desc: "House slabs, shed floors, garage slabs, and commercial foundations. Properly reinforced, correctly graded, built to spec.",
    img: "/manus-storage/concrete-slab-1_56311043_b3ab6964.jpg",
    alt: "Concrete slab pour Brisbane",
  },
  {
    num: "03",
    name: "Exposed Aggregate",
    desc: "Premium exposed aggregate finishes for driveways, patios, and pool surrounds. Durable, slip-resistant, and genuinely beautiful.",
    img: "/manus-storage/exposed-aggregate-closeup_e16c9248_b85a44aa.jpeg",
    alt: "Exposed aggregate concrete finish Brisbane",
  },
  {
    num: "04",
    name: "Patios & Entertaining",
    desc: "Outdoor entertaining areas built for Brisbane's lifestyle. Coloured, stamped, or exposed aggregate — we match your home.",
    img: "/manus-storage/patio-slab-finished_4b14e1e7_1b5a6bdf.jpg",
    alt: "Concrete patio Brisbane",
  },
  {
    num: "05",
    name: "Retaining Walls",
    desc: "Concrete block and sleeper retaining walls for sloping blocks. Engineered for Brisbane's clay soils and summer storms.",
    img: "/manus-storage/project-retaining-wall-1_942fd49e_733a9393.jpeg",
    alt: "Concrete retaining wall Brisbane",
  },
  {
    num: "06",
    name: "Excavation",
    desc: "Site preparation, cut and fill, and earthworks for residential and commercial projects. We bring the machine, you get a clean site.",
    img: "/manus-storage/excavator-work-1_99a98a3d_f444b6ec.jpg",
    alt: "Excavation Brisbane",
  },
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

export default function ServicesSection() {
  const { ref, inView } = useInView();

  return (
    <section id="services" className="bg-bone py-20 md:py-28" ref={ref}>
      <div className="container">
        {/* Header */}
        <div className="mb-12 md:mb-16 max-w-2xl">
          <p className="section-stamp mb-3">02 / What We Do</p>
          <h2
            className="text-navy mb-4"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Every Type of Concrete Work, Done Properly
          </h2>
          <p className="text-charcoal/70" style={{ fontSize: "1.05rem" }}>
            From a simple footpath to a full commercial slab — Concrete Concepts Group handles the whole job. QBCC Licensed, fully insured, and Jarrad is on site every day.
          </p>
        </div>

        {/* Service grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((svc, i) => (
            <div
              key={svc.num}
              className="card-lift bg-white rounded-sm overflow-hidden border border-bone-dark group"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(20px)",
                transition: `opacity 0.45s ease ${i * 0.07}s, transform 0.45s ease ${i * 0.07}s`,
              }}
            >
              {/* Photo */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={svc.img}
                  alt={svc.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Number stamp */}
                <div
                  className="absolute top-3 left-3 bg-navy/80 text-gold mono-stamp text-xs px-2 py-1"
                  style={{ backdropFilter: "blur(4px)" }}
                >
                  {svc.num}
                </div>
              </div>
              {/* Content */}
              <div className="p-5">
                <h3
                  className="text-navy mb-2"
                  style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "1.2rem" }}
                >
                  {svc.name}
                </h3>
                <p className="text-charcoal/70 text-sm mb-4 leading-relaxed">{svc.desc}</p>
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-navy transition-colors"
                >
                  Get a Quote <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
