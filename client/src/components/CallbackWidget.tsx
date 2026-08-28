/*
  CallbackWidget: "Call Me Back in 60 Seconds" floating widget
  - Floating button on all pages (bottom-left, above WhatsApp)
  - Expands to quick form: name + phone number
  - Sends instant notification to business owner
  - Tracks conversion for Google Ads
  - Mobile-friendly with smooth animations
*/
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, Loader2, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { submitFormFallback } from "@/lib/formFallback";
import { trackCallbackConversion } from "@/components/ConversionTracking";
import { useLeadSource } from "@/hooks/useLeadSource";
import {
  assessSubmissionSignals,
  classifyServiceArea,
  validateAustralianPhone,
} from "@shared/leadValidation";

export default function CallbackWidget() {
  const leadSource = useLeadSource();
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const formStartedAt = useRef(Date.now());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const callbackMutation = trpc.callback.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      trackCallbackConversion({ name: name.trim(), phone: phone.trim() });
    },
    onError: async (mutationError) => {
      if (mutationError.data?.code === "BAD_REQUEST" || mutationError.data?.code === "TOO_MANY_REQUESTS") {
        setError(mutationError.message);
        return;
      }
      // Backend down — try fallback
      try {
        const result = await submitFormFallback({
          name: name.trim(),
          phone: phone.trim(),
          suburb,
          service: "Callback Request (60-second widget)",
          source: "callback-widget",
          website,
          formStartedAt: formStartedAt.current,
        });
        if (result.success) {
          setSubmitted(true);
          trackCallbackConversion({ name: name.trim(), phone: phone.trim() });
        } else {
          setError("Your email app has opened. Please press Send to complete the enquiry.");
        }
      } catch (fallbackError) {
        setError(fallbackError instanceof Error ? fallbackError.message : "Please call us on 0424 463 268.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    const phoneValidation = validateAustralianPhone(phone);
    if (!phoneValidation.valid) {
      setError(phoneValidation.error);
      return;
    }
    const serviceArea = classifyServiceArea(suburb);
    if (!serviceArea.canSubmit) {
      setError(serviceArea.message);
      return;
    }
    const signals = assessSubmissionSignals({ honeypot: website, startedAt: formStartedAt.current });
    if (!signals.allowed) {
      setError("Please check the form and try again.");
      return;
    }

    callbackMutation.mutate({
      name: name.trim(),
      phone: phoneValidation.normalized,
      suburb: serviceArea.normalized,
      page: window.location.pathname,
      website,
      formStartedAt: formStartedAt.current,
      leadSource: "callback_widget",
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

  const handleClose = () => {
    setIsOpen(false);
    // Reset after animation
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setPhone("");
      setSuburb("");
      setWebsite("");
      setError("");
    }, 300);
  };

  // Don't show on admin pages
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Floating callback button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => {
              formStartedAt.current = Date.now();
              setIsOpen(true);
            }}
            className="fixed z-50 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            style={{
              bottom: isMobile ? "140px" : "100px",
              left: "20px",
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              color: "#fff",
              borderRadius: "50px",
              padding: isMobile ? "12px 18px" : "14px 22px",
              border: "none",
              fontSize: isMobile ? "13px" : "14px",
              fontWeight: 700,
              letterSpacing: "0.3px",
            }}
            aria-label="Request a callback"
          >
            <Phone size={isMobile ? 18 : 20} className="animate-pulse" />
            <span className="hidden sm:inline">Call Me Back in 60s</span>
            <span className="sm:hidden">Call Me Back</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded callback form */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-50"
                onClick={handleClose}
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden"
              style={{
                bottom: isMobile ? "auto" : "100px",
                top: isMobile ? "50%" : "auto",
                left: isMobile ? "50%" : "20px",
                transform: isMobile ? "translate(-50%, -50%)" : "none",
                width: isMobile ? "calc(100% - 40px)" : "340px",
                maxWidth: "380px",
              }}
            >
              {/* Header */}
              <div
                className="relative px-5 py-4"
                style={{
                  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                }}
              >
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close callback form"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight">
                      We'll Call You Back
                    </h3>
                    <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1">
                      <Clock size={12} />
                      Within 60 seconds during business hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label
                        htmlFor="callback-name"
                        className="block text-xs font-semibold text-gray-600 mb-1"
                      >
                        Your Name
                      </label>
                      <input
                        id="callback-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Smith"
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                        style={{ color: "#1a1a1a" }}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="callback-phone"
                        className="block text-xs font-semibold text-gray-600 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        id="callback-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0412 345 678"
                        required
                        autoComplete="tel"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                        style={{ color: "#1a1a1a" }}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="callback-suburb"
                        className="block text-xs font-semibold text-gray-600 mb-1"
                      >
                        Suburb or Postcode
                      </label>
                      <input
                        id="callback-suburb"
                        type="text"
                        value={suburb}
                        onChange={(e) => setSuburb(e.target.value)}
                        placeholder="e.g. Carindale 4152"
                        required
                        autoComplete="postal-code"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                        style={{ color: "#1a1a1a" }}
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
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <Button
                      type="submit"
                      disabled={callbackMutation.isPending}
                      className="w-full py-2.5 text-sm font-bold cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                        color: "#fff",
                        borderRadius: "8px",
                        border: "none",
                      }}
                    >
                      {callbackMutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Requesting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Phone size={16} />
                          Call Me Back Now
                        </span>
                      )}
                    </Button>
                    <p className="text-[11px] text-gray-400 text-center leading-tight">
                      Business hours: Mon–Sat 6am–5pm AEST.
                      <br />
                      After hours? We'll call first thing next morning.
                    </p>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle size={28} className="text-green-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-base mb-1">
                      We're on it!
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Jarrod or one of the team will call you back
                      <strong className="text-gray-700"> within 60 seconds</strong> during
                      business hours.
                    </p>
                    <button
                      onClick={handleClose}
                      className="mt-4 text-sm text-green-600 font-semibold hover:text-green-700 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
