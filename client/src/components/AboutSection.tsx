/*
  DESIGN: Refined Craft — Concrete Concepts Group brand
  About: Asymmetric two-column layout with real action photo
  Stats counters, gold accents, charcoal background section
*/
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const TEAM_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-troweling_06ff9a7c.jpeg";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

const stats = [
  { value: 200, suffix: "+", label: "Projects Completed" },
  { value: 100, suffix: "%", label: "Client Satisfaction" },
  { value: 6, suffix: "+", label: "Years Combined Experience" },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-brand-charcoal overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img
                src={TEAM_PHOTO}
                alt="Concrete Concepts Group team hand finishing concrete on a residential project in Brisbane, Queensland"
                width={600}
                height={520}
                loading="lazy"
                decoding="async"
                className="w-full h-[400px] lg:h-[520px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            {/* Accent border */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-brand-gold/30 rounded-lg -z-10" />
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-px bg-brand-gold" />
              <span
                className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-body)" }}
              >
                About Us
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Brisbane's Trusted
              <br />
              <span className="text-brand-gold italic">Concrete Contractor</span>
            </h2>

            <div className="space-y-4 mb-10" style={{ fontFamily: "var(--font-body)" }}>
              <p className="text-brand-silver-light/80 text-lg leading-relaxed">
                Concrete Concepts Group is a QBCC Licensed concreting company 
                servicing Brisbane and all surrounding areas across South East Queensland. 
                We specialise in concrete driveways, slabs, retaining walls, 
                exposed aggregate, patios, and excavation.
              </p>
              <p className="text-brand-silver-light/70 leading-relaxed">
                Our team brings together years of hands-on experience across 
                residential and commercial concreting projects throughout South East 
                Queensland. From complex house slab foundations and shed floors to 
                precision-finished exposed aggregate driveways, we approach every 
                concrete job with the same commitment to quality and professionalism.
              </p>
              <p className="text-brand-silver-light/70 leading-relaxed">
                Based in South East Queensland, we service Brisbane and all surrounding 
                suburbs and regions. As a QBCC Licensed concreter (Licence #15299707), 
                we are fully insured and GST-registered — giving you complete peace of mind 
                for your next concreting project.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl lg:text-4xl font-bold text-brand-gold mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div
                    className="text-sm text-brand-silver-light/60"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
