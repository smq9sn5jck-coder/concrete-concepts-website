/*
  DESIGN: Foreman's Blueprint — Hero
  Full-bleed photo, navy-to-transparent overlay, Fraunces headline,
  gold underline draw-in, stats bar (150+ jobs / 4.9★ / QBCC), dual CTAs
  Background: exposed-aggregate driveway photo (real project)
*/
import { useEffect, useRef, useState } from "react";
import { Phone, ChevronDown } from "lucide-react";

const STATS = [
  { value: "150+", label: "Projects Completed" },
  { value: "4.9★", label: "Google Rating" },
  { value: "QBCC", label: "#15299707 Licensed" },
  { value: "10+", label: "Years Experience" },
];

export default function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "conversion", {
        send_to: "AW-18007005419/quote_submission",
      });
    }
  };

  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#091e30" }}
    >
      {/* Background photo */}
      <div className="absolute inset-0">
        <img
          src="/manus-storage/exposed-driveway-house_50304489_c95ab68f.jpg"
          alt="Concrete Concepts Group — Brisbane exposed aggregate driveway"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Gradient overlay — navy from left, transparent right on desktop; top-to-bottom on mobile */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(9,30,48,0.92) 0%, rgba(9,30,48,0.75) 55%, rgba(9,30,48,0.3) 100%)",
          }}
        />
        <div
          className="absolute inset-0 md:hidden"
          style={{ background: "rgba(9,30,48,0.65)" }}
        />
      </div>

      {/* Urgency banner */}
      <div
        className="relative z-10 text-center py-2.5 px-4"
        style={{ background: "#C9A44D" }}
      >
        <span
          className="text-sm font-bold text-navy"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.04em" }}
        >
          ✦ Brisbane & SEQ — Free Quotes, Fast Response, QBCC Licensed ✦
        </span>
      </div>

      {/* Main hero content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="container py-16 md:py-24">
          <div className="max-w-2xl">
            {/* Section stamp */}
            <p
              className="section-stamp mb-4"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(8px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              01 / Brisbane's Trusted Concreters
            </p>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="text-bone mb-6"
              style={{
                fontFamily: "Fraunces, serif",
                fontWeight: 900,
                fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
                lineHeight: 1.08,
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(16px)",
                transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
              }}
            >
              Concrete Done{" "}
              <span
                className={`gold-underline ${visible ? "animated" : ""}`}
                style={{ color: "#C9A44D" }}
              >
                Right
              </span>
              ,<br />First Time.
            </h1>

            {/* Sub-copy */}
            <p
              className="text-bone/80 mb-8 max-w-lg"
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.65,
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(12px)",
                transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
              }}
            >
              Driveways, slabs, patios, exposed aggregate, retaining walls & excavation across Brisbane and all surrounding areas. Owned and operated by Jarrad — on every job, every time.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(10px)",
                transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s",
              }}
            >
              <button onClick={scrollToContact} className="btn-gold text-base py-4 px-8">
                Get Free Quote
              </button>
              <a
                href="tel:0424463268"
                className="btn-navy-outline text-base py-4 px-8"
                onClick={() => {
                  if (typeof window !== "undefined" && (window as any).gtag) {
                    (window as any).gtag("event", "conversion", {
                      send_to: "AW-18007005419/phone_call_click",
                    });
                  }
                }}
              >
                <Phone className="w-5 h-5" />
                <span className="mono-stamp">0424 463 268</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="relative z-10"
        style={{ background: "rgba(9,30,48,0.92)", borderTop: "1px solid rgba(201,164,77,0.25)" }}
      >
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="py-5 px-4 text-center"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(8px)",
                  transition: `opacity 0.5s ease ${0.4 + i * 0.07}s, transform 0.5s ease ${0.4 + i * 0.07}s`,
                }}
              >
                <div
                  className="text-gold font-bold"
                  style={{ fontFamily: "Fraunces, serif", fontSize: "1.6rem", lineHeight: 1.1 }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-bone/60 mt-1"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 hidden md:block animate-bounce">
        <ChevronDown className="w-6 h-6 text-gold/60" />
      </div>
    </section>
  );
}
