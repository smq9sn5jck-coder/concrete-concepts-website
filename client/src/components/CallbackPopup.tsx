/*
  CallbackPopup: "Request a Callback" popup for suburb landing pages
  Appears after 30 seconds on page, slides up from bottom-right
  Collects name + phone, submits via tRPC quote mutation
  Brand-consistent: gold accent, charcoal, clean typography
*/
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { submitFormFallback } from "@/lib/formFallback";
import { trackQuoteConversion } from "@/components/ConversionTracking";
import { useLeadSource } from "@/hooks/useLeadSource";
import {
  assessSubmissionSignals,
  classifyServiceArea,
  validateAustralianPhone,
} from "@shared/leadValidation";

interface CallbackPopupProps {
  suburbName: string;
  /** Delay in ms before showing popup. Default 30000 (30s) */
  delay?: number;
}

export default function CallbackPopup({ suburbName, delay = 30000 }: CallbackPopupProps) {
  const leadSource = useLeadSource();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [website, setWebsite] = useState("");
  const formStartedAt = useRef(Date.now());

  const submitQuote = trpc.quote.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      trackQuoteConversion({ phone: phone.trim() });
    },
    onError: async (mutationError) => {
      if (mutationError.data?.code === "BAD_REQUEST" || mutationError.data?.code === "TOO_MANY_REQUESTS") {
        setError(mutationError.message);
        return;
      }
      try {
        const result = await submitFormFallback({
          name: name.trim(),
          phone: phone.trim(),
          service: `Callback Request (${suburbName} page)`,
          suburb: suburbName,
          source: "callback-popup",
          website,
          formStartedAt: formStartedAt.current,
        });
        if (result.success) {
          setSubmitted(true);
          trackQuoteConversion({ phone: phone.trim() });
        } else {
          setError("Your email app has opened. Please press Send to complete the enquiry.");
        }
      } catch (fallbackError) {
        setError(fallbackError instanceof Error ? fallbackError.message : "Something went wrong. Please call us on 0424 463 268.");
      }
    },
  });

  useEffect(() => {
    // Check if user already dismissed this session
    const alreadyDismissed = sessionStorage.getItem("callback-popup-dismissed");
    if (alreadyDismissed) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem("callback-popup-dismissed", "true");
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      const phoneValidation = validateAustralianPhone(phone);
      if (!phoneValidation.valid) {
        setError(phoneValidation.error);
        return;
      }
      const serviceArea = classifyServiceArea(suburbName);
      if (!serviceArea.canSubmit) {
        setError(serviceArea.message);
        return;
      }
      const signals = assessSubmissionSignals({ honeypot: website, startedAt: formStartedAt.current });
      if (!signals.allowed) {
        setError("Please check the form and try again.");
        return;
      }

      submitQuote.mutate({
        name: name.trim(),
        phone: phoneValidation.normalized,
        email: "callback@request.com", // placeholder — phone callback
        suburb: serviceArea.normalized,
        service: "Callback Request",
        details: `Callback requested from ${suburbName} suburb page popup.`,
        website,
        formStartedAt: formStartedAt.current,
        leadSource: leadSource.leadSource || "suburb-popup",
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
    },
    [name, phone, suburbName, submitQuote, leadSource, website]
  );

  if (dismissed || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed bottom-4 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-brand-charcoal px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-brand-charcoal" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Request a Callback</p>
              <p className="text-white/60 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                We'll call you within 2 hours
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/50 hover:text-white transition-colors p-1"
            aria-label="Close callback popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-bold text-brand-charcoal text-lg mb-1">We'll Call You Soon!</p>
              <p
                className="text-gray-500 text-sm"
                style={{ fontFamily: "var(--font-body)" }}
              >
                A member of our team will call you within 2 hours to discuss your {suburbName} project.
              </p>
            </motion.div>
          ) : (
            <>
              <p
                className="text-gray-600 text-sm mb-4 leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Interested in concreting in <strong>{suburbName}</strong>? Leave your details and we'll call you back — no obligation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all bg-gray-50"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all bg-gray-50"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>
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

                {error && (
                  <p className="text-red-500 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={submitQuote.isPending}
                  className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold py-2.5 text-sm tracking-wide uppercase transition-all"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {submitQuote.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Me Back
                    </>
                  )}
                </Button>
              </form>

              <p
                className="text-gray-400 text-[11px] text-center mt-3"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Free, no-obligation quote · QBCC Licensed #15299707
              </p>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
