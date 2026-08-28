/**
 * EmergencyContactBanner: Prominent sticky banner with phone + email CTAs
 * Shows at the top of every page when backend may be unavailable
 * Ensures visitors can always reach the business directly
 */
import { Phone, Mail, X } from "lucide-react";
import { useState } from "react";
import { trackPhoneCallClick, trackEmailClick } from "@/components/ConversionTracking";

export default function EmergencyContactBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-[#0F2A44] to-[#1a3a5c] text-white shadow-lg">
      <div className="container flex items-center justify-between py-2.5 px-4 gap-3">
        {/* Left: Message */}
        <span className="text-xs sm:text-sm font-medium hidden sm:inline">
          Need a quote? Contact us directly:
        </span>
        <span className="text-xs font-medium sm:hidden">
          Get a free quote:
        </span>

        {/* Center: CTAs */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center">
          <a
            href="tel:+61424463268"
            onClick={() => trackPhoneCallClick()}
            className="flex items-center gap-1.5 bg-[#C9A44D] hover:bg-[#b8933c] text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm transition-all hover:scale-105 shadow-md"
          >
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>0424 463 268</span>
          </a>
          <a
            href="mailto:info@concreteconceptsgroup.com?subject=Quote%20Request"
            onClick={() => trackEmailClick()}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm transition-all"
          >
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">info@concreteconceptsgroup.com</span>
            <span className="sm:hidden">Email Us</span>
          </a>
        </div>

        {/* Right: Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white p-1 transition-colors flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
