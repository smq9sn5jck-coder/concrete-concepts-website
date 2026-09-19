/*
  WhyChooseUs: Non-comparative section highlighting Concrete Concepts Group's strengths
  Design: Navy background with gold accents, icon cards in a grid layout
  Positioned between ProcessSection and ProjectGallery on homepage
*/
import { motion } from "framer-motion";
import {
  Shield,
  MapPin,
  ClipboardList,
  Camera,
  HardHat,
  MessageSquareText,
  FileCheck,
  Layers3,
} from "lucide-react";

const reasons = [
  {
    icon: Shield,
    title: "QBCC licensed",
    description:
      "Concrete Concepts Group operates under QBCC licence 15299707 for the licensed work described in its project scope.",
  },
  {
    icon: MapPin,
    title: "Site-specific planning",
    description:
      "Location, access, existing surfaces, measurements, drainage and finish requirements are reviewed before the scope is confirmed.",
  },
  {
    icon: ClipboardList,
    title: "Clear quote inputs",
    description:
      "The guided form collects the practical project details needed for a more useful first assessment and written quote process.",
  },
  {
    icon: Camera,
    title: "Optional site photos",
    description:
      "Customers can add private site photos to show access, existing concrete and the proposed work area before CCG reviews the request.",
  },
  {
    icon: HardHat,
    title: "Practical scope review",
    description:
      "Preparation, reinforcement, concrete, pumping, finishing and access requirements are considered against the actual project information provided.",
  },
  {
    icon: MessageSquareText,
    title: "Direct project communication",
    description:
      "Customers can choose a detailed online request, a callback or a direct phone conversation depending on the information they have available.",
  },
  {
    icon: FileCheck,
    title: "Recorded job details",
    description:
      "Contact, site, service, measurement and access details are recorded together so the initial review is based on one consistent project brief.",
  },
  {
    icon: Layers3,
    title: "Concrete service options",
    description:
      "CCG reviews suitable driveways, slabs, paths, patios, pool surrounds, steps, retaining walls, excavation and finish options across Brisbane and SEQ.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  },
};

export default function WhyChooseUs() {
  return (
    <section className="py-24 lg:py-32 bg-brand-navy relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-px bg-brand-gold" />
            <span
              className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Why Choose Us
            </span>
            <div className="w-10 h-px bg-brand-gold" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Built on <span className="text-brand-gold italic">Trust</span>,
            Delivered with <span className="text-brand-gold italic">Pride</span>
          </h2>

          <p
            className="text-brand-silver-light/70 text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            When you choose Concrete Concepts Group, you're choosing a team that
            treats your property like their own. Here's what sets us apart.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {reasons.map((reason) => (
            <motion.div
              key={reason.title}
              variants={cardVariants}
              className="group relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.08] hover:border-brand-gold/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-brand-gold/10 flex items-center justify-center mb-4 group-hover:bg-brand-gold/20 transition-colors">
                <reason.icon className="w-6 h-6 text-brand-gold" />
              </div>

              {/* Content */}
              <h3
                className="text-white font-semibold text-base mb-2 leading-snug"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {reason.title}
              </h3>
              <p
                className="text-brand-silver-light/60 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {reason.description}
              </p>

              {/* Hover accent */}
              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-14"
        >
          <a
            href="/get-quote"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-gold text-brand-navy font-semibold rounded-lg hover:bg-brand-gold-light transition-colors shadow-lg shadow-brand-gold/20"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Get Your Free Quote Today
          </a>
        </motion.div>
      </div>
    </section>
  );
}
