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
    title: "Detailed project request",
    description: "Complete the five-step quote or call 0424 463 268. Site location, scope, access, measurements and optional photos help the CCG team review the project.",
  },
  {
    icon: ClipboardCheck,
    number: "02",
    title: "Free Site Visit",
    description: "Where a site visit is needed, CCG can assess conditions, confirm measurements and discuss practical preparation, access and finish requirements.",
  },
  {
    icon: HardHat,
    number: "03",
    title: "We Get to Work",
    description: "After the quote is accepted and scheduling is confirmed, the crew works through the agreed preparation, reinforcement, pour and finishing scope.",
  },
  {
    icon: ThumbsUp,
    number: "04",
    title: "Quality Handover",
    description: "At handover, the team reviews the completed scope and provides practical curing and aftercare information for the selected finish.",
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
            A clear sequence helps Brisbane homeowners and businesses understand what
            information is needed from first review through to handover.
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
