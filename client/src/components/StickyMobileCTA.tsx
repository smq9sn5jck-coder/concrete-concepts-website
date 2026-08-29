/*
  Sticky CTA Bar:
  - Mobile: Fixed bottom bar with Call + Text + WhatsApp + Get Quote
  - Desktop: Floating "Get Free Quote" button on right side
  Shows after scrolling past hero, hides near contact section
*/
import { useState, useEffect } from "react";
import { Phone, MessageSquare, FileText } from "lucide-react";
import { trackPhoneCallClick, trackTextMessageClick, trackWhatsAppClick } from "@/components/ConversionTracking";
import { trackCTAClick } from "@/components/GodModeTracking";
import { useLocation } from "wouter";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
      const contactEl = document.querySelector("#contact");
      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        setAtContact(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [, navigate] = useLocation();
  const goToQuote = () => {
    trackCTAClick("sticky_get_quote", "sticky_bar");
    navigate("/get-quote");
  };

  if (!visible || atContact) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="h-4 bg-gradient-to-t from-brand-charcoal to-transparent" />
        <div className="bg-brand-charcoal border-t border-brand-gold/20 px-2 py-2.5 grid grid-cols-4 gap-1.5">
          <a
            href="tel:0424463268"
            onClick={() => trackPhoneCallClick()}
            aria-label="Call Concrete Concepts Group"
            className="min-w-0 flex items-center justify-center gap-1 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold py-3 rounded-lg text-[10px] sm:text-xs tracking-wide uppercase transition-all duration-300 shadow-lg shadow-brand-gold/20"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            Call
          </a>
          <a
            href="sms:0424463268?&body=Hi%2C%20I%27d%20like%20a%20free%20quote%20for%20a%20concreting%20project%20in%20Brisbane."
            onClick={() => trackTextMessageClick()}
            aria-label="Text Concrete Concepts Group for a quote"
            className="min-w-0 flex items-center justify-center gap-1 bg-[#147EFB] hover:bg-[#0D6EDC] text-white font-bold py-3 rounded-lg text-[10px] sm:text-xs tracking-wide uppercase transition-all duration-300 shadow-lg"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            Text
          </a>
          <a
            href="https://wa.me/61424463268?text=Hi%2C%20I%27d%20like%20a%20free%20quote%20for%20a%20concreting%20project%20in%20Brisbane."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick()}
            aria-label="Message Concrete Concepts Group on WhatsApp"
            className="min-w-0 flex items-center justify-center gap-1 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-3 rounded-lg text-[10px] sm:text-xs tracking-wide uppercase transition-all duration-300 shadow-lg"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden min-[390px]:inline">WhatsApp</span>
            <span className="min-[390px]:hidden">Chat</span>
          </a>
          <button
            onClick={goToQuote}
            aria-label="Start a free concrete quote"
            className="min-w-0 flex items-center justify-center gap-1 bg-white hover:bg-white/90 text-brand-charcoal font-bold py-3 rounded-lg text-[10px] sm:text-xs tracking-wide uppercase transition-all duration-300 shadow-lg"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden min-[390px]:inline">Free Quote</span>
            <span className="min-[390px]:hidden">Quote</span>
          </button>
        </div>
      </div>

      <div className="hidden lg:block fixed bottom-8 right-8 z-50">
        <button
          onClick={goToQuote}
          className="group flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold px-6 py-4 rounded-full shadow-2xl shadow-brand-gold/30 transition-all duration-300 hover:shadow-3xl hover:scale-105"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <FileText className="w-5 h-5" />
          <span className="text-sm tracking-wide uppercase">Get Free Quote</span>
        </button>
      </div>
    </>
  );
}
