/*
  Trust Bar: Horizontal strip showing key trust signals
  QBCC licence, ABN, detailed quote flow, service area
  Placed just below the hero for immediate credibility
*/
import { motion } from "framer-motion";
import { Shield, ClipboardList, FileCheck, MapPin } from "lucide-react";

const trustItems = [
  {
    icon: Shield,
    label: "QBCC licence",
    value: "#15299707",
  },
  {
    icon: FileCheck,
    label: "ABN",
    value: "61 695 485 593",
  },
  {
    icon: ClipboardList,
    label: "Detailed quote",
    value: "Five guided steps",
  },
  {
    icon: MapPin,
    label: "Service area",
    value: "Brisbane & SEQ",
  },
];

export default function TrustBar() {
  return (
    <section className="bg-brand-gold py-4 lg:py-5">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8"
        >
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 justify-center lg:justify-start"
            >
              <div className="w-10 h-10 rounded-full bg-brand-charcoal/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-brand-charcoal" />
              </div>
              <div>
                <div
                  className="text-xs font-semibold text-brand-charcoal/60 uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.label}
                </div>
                <div
                  className="text-sm font-bold text-brand-charcoal"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
