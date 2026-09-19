import { ArrowRight, Clock, Mail, MapPin, Phone, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import { trackEmailClick, trackPhoneCallClick } from "@/components/ConversionTracking";
import { trackCTAClick } from "@/components/GodModeTracking";

const contactItems = [
  {
    icon: Phone,
    label: "Phone",
    value: "0424 463 268",
    href: "tel:0424463268",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@concreteconceptsgroup.com",
    href: "mailto:info@concreteconceptsgroup.com",
  },
  {
    icon: MapPin,
    label: "Service area",
    value: "Brisbane & South East Queensland",
  },
  {
    icon: Clock,
    label: "Office hours",
    value: "Monday to Saturday, 6am–5pm",
  },
] as const;

function focusCallbackForm() {
  const target = document.getElementById("callback");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const firstField = target.querySelector<HTMLElement>("input:not([aria-hidden='true']), button");
  window.setTimeout(() => firstField?.focus(), 350);
}

export default function ContactDecisionPanel() {
  return (
    <section id="contact" className="relative overflow-hidden bg-brand-charcoal py-20 lg:py-28">
      <div
        className="absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="container relative z-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-10 bg-brand-gold" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
                Choose your next step
              </span>
            </div>
            <h2 className="max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Give us the details we need to review your project properly.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">
              Start the guided five-step quote for a detailed review, or request a callback if you would rather discuss the project first.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <a
                href="/get-quote"
                onClick={() => trackCTAClick("start_detailed_quote", "contact_decision", "/get-quote")}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-brand-gold px-6 py-4 text-center text-base font-bold text-brand-charcoal shadow-xl shadow-brand-gold/20 transition hover:bg-brand-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal"
              >
                Start detailed quote
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => {
                  trackCTAClick("request_callback", "contact_decision", "#callback");
                  focusCallbackForm();
                }}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-4 text-base font-bold text-white transition hover:border-brand-gold/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal"
              >
                <PhoneCall className="h-5 w-5 text-brand-gold" aria-hidden="true" />
                Request a callback
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-6 sm:grid-cols-2 sm:p-8"
          >
            {contactItems.map((item) => (
              <div key={item.label} className="flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gold/10">
                  <item.icon className="h-4 w-4 text-brand-gold" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/45">{item.label}</p>
                  {"href" in item ? (
                    <a
                      href={item.href}
                      onClick={item.href.startsWith("tel:") ? () => trackPhoneCallClick() : () => trackEmailClick()}
                      className="mt-1 block break-words font-semibold text-white transition hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-1 font-semibold text-white">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
