/*
  DESIGN: Refined Craft — Concrete Concepts Group brand
  Process: Horizontal timeline showing 4-step process
  Gold numbered steps, clean layout, drives toward quote CTA
*/
import { motion } from "framer-motion";
import { MessageSquare, ClipboardCheck, HardHat, ThumbsUp } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Get in Touch",
    description: "Fill out our quick quote form or call 0424 463 268. Tell us about your concrete driveway, slab, retaining wall, or patio project and we'll get back to you within 24 hours.",
  },
  {
    icon: ClipboardCheck,
    number: "02",
    title: "Free Site Visit",
    description: "We'll visit your Brisbane property, assess the site conditions, take measurements, and discuss your concreting requirements in detail — completely free.",
  },
  {
    icon: HardHat,
    number: "03",
    title: "We Get to Work",
    description: "Once you approve the quote, our QBCC Licensed concrete crew gets to work. We keep you informed at every stage and maintain a clean, safe site across Brisbane and SEQ.",
  },
  {
    icon: ThumbsUp,
    number: "04",
    title: "Quality Handover",
    description: "We walk you through the finished work, ensure you're 100% satisfied, and provide aftercare advice to keep your concrete looking its best.",
  },
];

export default function ProcessSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 lg:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-px bg-brand-gold" />
            <span
              className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              How It Works
            </span>
            <div className="w-10 h-px bg-brand-gold" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-charcoal leading-tight mb-5">
            From Enquiry to
            <br />
            <span className="text-brand-gold italic">Completion</span>
          </h2>
          <p
            className="text-lg text-muted-foreground leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            We make the concreting process simple and stress-free for Brisbane homeowners 
            and businesses. Here&apos;s how we turn your project from concept to reality.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[calc(100%-20%)] h-px bg-border" />
              )}

              <div className="relative z-10">
                {/* Number + Icon */}
                <div className="flex items-start gap-4 mb-5">
                  <span className="text-5xl font-bold text-brand-gold/20 leading-none select-none">
                    {step.number}
                  </span>
                  <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mt-1 group-hover:bg-brand-gold/20 transition-colors duration-300">
                    <step.icon className="w-5 h-5 text-brand-gold" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-brand-charcoal mb-3">
                  {step.title}
                </h3>
                <p
                  className="text-muted-foreground text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
