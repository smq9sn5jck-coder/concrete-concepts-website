/*
  DESIGN: Foreman's Blueprint — Why Choose Us
  Navy background, gold accents, asymmetric two-column: big photo left, trust points right
*/
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Clock, Star, Wrench, MapPin, Award } from "lucide-react";

const POINTS = [
  { icon: ShieldCheck, title: "QBCC Licensed & Insured", body: "Licence #15299707. Every job is fully covered — you're protected from start to finish." },
  { icon: Clock, title: "On Time, Every Time", body: "Jarrad is on site every day. No subcontractors, no surprises, no excuses." },
  { icon: Star, title: "4.9★ Google Rating", body: "17 verified reviews from Brisbane homeowners and builders. Read them — they're real." },
  { icon: Wrench, title: "Full-Service Crew", body: "We handle excavation, formwork, pour, and finishing in-house. One call, one crew, one bill." },
  { icon: MapPin, title: "Brisbane & All SEQ", body: "Based in Brisbane, we cover Ipswich, Logan, Moreton Bay, Redlands, Gold Coast, and Sunshine Coast." },
  { icon: Award, title: "10+ Years Experience", body: "Residential, commercial, and civil — we've poured it all. No job too big or too small." },
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

export default function WhyChooseUs() {
  const { ref, inView } = useInView();

  return (
    <section className="bg-navy py-20 md:py-28" ref={ref}>
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Photo column */}
          <div
            className="relative"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateX(-24px)",
              transition: "opacity 0.55s ease, transform 0.55s ease",
            }}
          >
            <img
              src="/manus-storage/manly-concrete-pour-team_bc52e91e_9f401d8e.jpg"
              alt="Concrete Concepts Group team on site Brisbane"
              className="w-full h-80 md:h-[500px] object-cover rounded-sm"
              loading="lazy"
            />
            {/* Floating badge */}
            <div
              className="absolute -bottom-5 -right-5 bg-gold text-navy p-5 rounded-sm shadow-xl hidden md:block"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              <div className="text-3xl font-black leading-none">4.9★</div>
              <div className="text-xs font-bold mt-1 uppercase tracking-widest">Google Rating</div>
            </div>
          </div>

          {/* Points column */}
          <div
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateX(24px)",
              transition: "opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s",
            }}
          >
            <p className="section-stamp mb-3">03 / Why Choose Us</p>
            <h2
              className="text-bone mb-8"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
            >
              We Turn Up, We Do the Work, We Do It Right
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {POINTS.map((pt, i) => (
                <div
                  key={pt.title}
                  className="flex gap-3"
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? "none" : "translateY(10px)",
                    transition: `opacity 0.4s ease ${0.15 + i * 0.06}s, transform 0.4s ease ${0.15 + i * 0.06}s`,
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <pt.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="text-bone font-semibold text-sm mb-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{pt.title}</div>
                    <div className="text-bone/60 text-sm leading-relaxed">{pt.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
