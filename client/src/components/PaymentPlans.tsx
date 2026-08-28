/*
  DESIGN: Refined Craft — Concrete Concepts Group brand
  Payment Plans: Soft positioning as a potential offering
  Targets: "concrete driveway payment plan Brisbane", "concreting finance options"
  Non-committal language — "ask us about", "may be available"
*/
import { motion } from "framer-motion";
import { CreditCard, Phone, ArrowRight, DollarSign, Calendar, MessageCircle } from "lucide-react";
import { trackPhoneCallClick } from "@/components/ConversionTracking";

export default function PaymentPlans() {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-b from-brand-offwhite to-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-px bg-brand-gold" />
              <span
                className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Flexible Options
              </span>
              <div className="w-10 h-px bg-brand-gold" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-charcoal mb-4">
              Flexible Payment Options <span className="text-brand-gold italic">May Be Available</span>
            </h2>
            <p
              className="text-gray-600 max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              We understand that larger concreting projects are a significant investment. That's why we're happy to discuss flexible payment arrangements for qualifying projects. Ask us about potential options when you request your free quote.
            </p>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
            >
              <div className="w-12 h-12 bg-brand-gold/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-brand-gold" />
              </div>
              <h3 className="font-bold text-brand-charcoal mb-2">Progress Payments</h3>
              <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                For larger projects, we can structure payments across key milestones — deposit, mid-project, and completion.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
            >
              <div className="w-12 h-12 bg-brand-gold/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-brand-gold" />
              </div>
              <h3 className="font-bold text-brand-charcoal mb-2">Tailored Arrangements</h3>
              <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                Every project is different. We're open to discussing payment arrangements that work for both parties on a case-by-case basis.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
            >
              <div className="w-12 h-12 bg-brand-gold/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-brand-gold" />
              </div>
              <h3 className="font-bold text-brand-charcoal mb-2">Multiple Payment Methods</h3>
              <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                We accept cash, bank transfer, and card payments — making it easy to pay in the way that suits you best.
              </p>
            </motion.div>
          </div>

          {/* CTA */}
          <div className="bg-brand-charcoal rounded-xl p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-white">Interested in Payment Options?</h3>
            </div>
            <p
              className="text-white/60 text-sm mb-6 max-w-lg mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Mention it when you request your free quote and we'll discuss what arrangements may be available for your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:0424463268"
                onClick={() => trackPhoneCallClick()}
                className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold px-6 py-3 rounded-lg text-sm tracking-wide uppercase transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Phone className="w-4 h-4" />
                Call 0424 463 268
              </a>
              <a
                href="/get-quote"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector("#contact");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg text-sm tracking-wide uppercase transition-all border border-white/10"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Request a Quote
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
