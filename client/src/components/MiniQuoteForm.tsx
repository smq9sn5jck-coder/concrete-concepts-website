/*
  MiniQuoteForm: Lightweight 2-field inline quote form
  Placed mid-page after services section to capture visitors
  who are interested but haven't scrolled to the full contact form.
  Only asks for name + phone — minimum friction.
*/
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Send, Loader2, CheckCircle, Shield, Star, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { submitFormFallback, CONTACT_INFO } from "@/lib/formFallback";
import { useLeadSource } from "@/hooks/useLeadSource";
import { trackQuoteConversion, trackPhoneCallClick } from "@/components/ConversionTracking";
import { trackFormFieldFocus, trackFormFieldComplete, trackCTAClick } from "@/components/GodModeTracking";
import { toast } from "sonner";
import {
  assessSubmissionSignals,
  classifyServiceArea,
  validateAustralianPhone,
} from "@shared/leadValidation";

export default function MiniQuoteForm() {
  const leadSource = useLeadSource();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("");
  const [website, setWebsite] = useState("");
  const formStartedAt = useRef(Date.now());

  const submitQuote = trpc.quote.submit.useMutation({
    onSuccess: () => {
      trackQuoteConversion({ phone, name });
      setSubmitted(true);
      toast.success("We'll call you within 24 hours!");
    },
    onError: async (error) => {
      if (error.data?.code === "BAD_REQUEST" || error.data?.code === "TOO_MANY_REQUESTS") {
        toast.error(error.message);
        return;
      }
      console.warn("[MiniForm] Backend unavailable, trying fallback:", error.message);
      try {
        const result = await submitFormFallback({
          name: name.trim(),
          phone: phone.trim(),
          suburb,
          service: "General Enquiry (Mini Form)",
          source: "mini-quote-form",
          website,
          formStartedAt: formStartedAt.current,
        });
        if (result.success) {
          trackQuoteConversion({ phone, name });
          setSubmitted(true);
          toast.success("We'll call you within 24 hours!");
        } else if (result.method === "mailto") {
          toast.info("Your email app has opened. Please press Send to complete the enquiry.");
        }
      } catch (fallbackError) {
        toast.error(fallbackError instanceof Error ? fallbackError.message : `Something went wrong. Call us directly: ${CONTACT_INFO.phone}`);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackCTAClick("mini_quote_submit", "mid_page");
    if (name.trim().length < 2) {
      toast.error("Please enter your name.");
      return;
    }
    const phoneValidation = validateAustralianPhone(phone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error);
      return;
    }
    const serviceArea = classifyServiceArea(suburb);
    if (!serviceArea.canSubmit) {
      toast.error(serviceArea.message);
      return;
    }
    const signals = assessSubmissionSignals({ honeypot: website, startedAt: formStartedAt.current });
    if (!signals.allowed) {
      toast.error("Please check the form and try again.");
      return;
    }
    submitQuote.mutate({
      name: name.trim(),
      phone: phoneValidation.normalized,
      email: "not-provided@via-mini-form.com",
      suburb: serviceArea.normalized,
      service: "General Enquiry",
      details: "Quick quote from mid-page mini form — follow up for full details",
      website,
      formStartedAt: formStartedAt.current,
      leadSource: leadSource.leadSource,
      utmSource: leadSource.utmSource || undefined,
      utmMedium: leadSource.utmMedium || undefined,
      utmCampaign: leadSource.utmCampaign || undefined,
      utmTerm: leadSource.utmTerm || undefined,
      utmContent: leadSource.utmContent || undefined,
      gclid: leadSource.gclid || undefined,
      fbclid: leadSource.fbclid || undefined,
      referrer: leadSource.referrer || undefined,
      landingPage: leadSource.landingPage || undefined,
    });
  };

  return (
    <section className="relative py-16 lg:py-20 bg-brand-charcoal overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Heading */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-px bg-brand-gold" />
              <span className="text-brand-gold text-xs font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
                Takes 10 Seconds
              </span>
              <div className="w-8 h-px bg-brand-gold" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Want a <span className="text-brand-gold">Free Quote</span>? Just Leave Your Number.
            </h2>
            <p className="text-white/50 text-sm sm:text-base" style={{ fontFamily: "var(--font-body)" }}>
              Add your suburb so we can confirm we service your area — no email required.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-brand-gold/30 rounded-xl p-8"
            >
              <CheckCircle className="w-12 h-12 text-brand-gold mx-auto mb-3" />
              <p className="text-white font-bold text-lg mb-1">We&apos;ll Call You Soon!</p>
              <p className="text-white/50 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                Thanks {name}! A member of our team will be in touch within 24 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                onFocus={() => trackFormFieldFocus("name", "mini_quote")}
                onBlur={(e) => { if (e.target.value) trackFormFieldComplete("name", "mini_quote"); }}
                className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-3.5 text-white placeholder:text-white/35 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none text-base"
                style={{ fontFamily: "var(--font-body)" }}
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                required
                autoComplete="tel"
                onFocus={() => trackFormFieldFocus("phone", "mini_quote")}
                onBlur={(e) => { if (e.target.value) trackFormFieldComplete("phone", "mini_quote"); }}
                className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-3.5 text-white placeholder:text-white/35 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none text-base"
                style={{ fontFamily: "var(--font-body)" }}
              />
              <input
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="Suburb / Postcode"
                required
                autoComplete="postal-code"
                className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-3.5 text-white placeholder:text-white/35 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all outline-none text-base"
                style={{ fontFamily: "var(--font-body)" }}
              />
              <input
                type="text"
                name="website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
              />
              <Button
                type="submit"
                disabled={submitQuote.isPending}
                className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold px-6 py-3.5 text-sm tracking-wide uppercase shadow-lg shadow-brand-gold/20 transition-all duration-300 hover:shadow-xl whitespace-nowrap"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {submitQuote.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    Call Me Back
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-white/30 text-xs" style={{ fontFamily: "var(--font-body)" }}>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              QBCC Licensed
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" />
              4.9/5 Google Reviews
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              500+ Projects Completed
            </div>
          </div>

          {/* Or call directly */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-white/30 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              Or call now:
            </span>
            <a
              href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
              className="text-brand-gold hover:text-brand-gold-light transition-colors font-bold text-sm"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Phone className="w-3.5 h-3.5 inline mr-1" />
              0424 463 268
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
