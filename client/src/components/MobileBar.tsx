/*
  DESIGN: Foreman's Blueprint — Mobile sticky bottom bar
  Always visible on mobile: Call (gold) + Get Quote (navy outline)
  Hidden on md+ (desktop has navbar CTA)
*/
import { Phone, FileText } from "lucide-react";

export default function MobileBar() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex"
      style={{
        background: "#0F2A44",
        borderTop: "1px solid rgba(201,164,77,0.3)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <a
        href="tel:0424463268"
        className="flex-1 flex items-center justify-center gap-2 py-4 font-bold text-navy bg-gold"
        style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem" }}
        onClick={() => {
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "conversion", {
              send_to: "AW-18007005419/phone_call_click",
            });
          }
        }}
      >
        <Phone className="w-5 h-5" />
        <span className="mono-stamp">Call Now</span>
      </a>
      <a
        href="#contact"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="flex-1 flex items-center justify-center gap-2 py-4 font-bold text-bone"
        style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem" }}
      >
        <FileText className="w-5 h-5 text-gold" />
        Free Quote
      </a>
    </div>
  );
}
