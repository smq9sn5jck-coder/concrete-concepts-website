/*
  Exit Intent Popup: Captures visitors about to leave the site
  Shows a compelling offer to get a free quote
  Only triggers once per session, desktop only (mouse leaves viewport)
*/
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackPhoneCallClick } from "@/components/ConversionTracking";

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      // Only trigger when mouse moves to top of viewport (leaving page)
      if (e.clientY <= 5 && !dismissed) {
        setShow(true);
        setDismissed(true);
      }
    },
    [dismissed]
  );

  useEffect(() => {
    // Check if already shown this session
    if (sessionStorage.getItem("exitIntentShown")) {
      setDismissed(true);
      return;
    }

    // Only on desktop (no touch devices)
    if ("ontouchstart" in window) return;

    // Delay adding listener so it doesn't fire immediately
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const close = () => {
    setShow(false);
    sessionStorage.setItem("exitIntentShown", "true");
  };

  const goToQuote = () => {
    close();
    window.location.href = "/get-quote";
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={close}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gold top bar */}
            <div className="h-1.5 bg-gradient-to-r from-brand-gold via-brand-gold-dark to-brand-gold" />

            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center">
              {/* Heading */}
              <h3 className="text-2xl font-bold text-brand-charcoal mb-2">
                Wait! Before You Go...
              </h3>
              <p
                className="text-brand-charcoal/70 mb-6 leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Get a <strong>free on-site quote</strong> for your concreting
                project. No obligation, no pressure — just honest pricing from
                Brisbane's trusted concreters.
              </p>

              {/* Offer highlights */}
              <div className="bg-brand-charcoal/5 rounded-xl p-4 mb-6 text-left">
                <div className="space-y-2" style={{ fontFamily: "var(--font-body)" }}>
                  {[
                    "Free on-site measure & quote",
                    "QBCC Licensed #15299707",
                    "No hidden fees — transparent pricing",
                    "Response within 24 hours",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-brand-charcoal/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <Button
                  onClick={goToQuote}
                  className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold py-6 text-base shadow-lg shadow-brand-gold/20"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Get My Free Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <a
                  href="tel:0424463268"
                  onClick={() => trackPhoneCallClick()}
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-brand-charcoal/70 hover:text-brand-gold transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <Phone className="w-4 h-4" />
                  Or call now: 0424 463 268
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
