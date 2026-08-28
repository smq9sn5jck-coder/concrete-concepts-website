/**
 * MapFallback: Shows a static map image when Google Maps fails to load
 * Used as a graceful fallback in ServiceAreaMap
 */
import { MapPin } from "lucide-react";

export default function MapFallback({ className = "" }: { className?: string }) {
  return (
    <div className={`relative bg-brand-charcoal/50 flex items-center justify-center ${className}`}>
      {/* Static map background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F2A44] to-[#1a3a5c] opacity-80" />
      
      {/* Content overlay */}
      <div className="relative z-10 text-center p-8">
        <MapPin className="w-12 h-12 text-brand-gold mx-auto mb-4" />
        <h3 className="text-white text-lg font-semibold mb-2">
          Servicing All of Brisbane & SEQ
        </h3>
        <p className="text-brand-silver-light/70 text-sm max-w-xs mx-auto">
          From Caboolture to the Gold Coast — 80km radius from Brisbane CBD
        </p>
      </div>
    </div>
  );
}
