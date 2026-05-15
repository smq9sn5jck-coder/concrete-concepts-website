/*
  DESIGN: Foreman's Blueprint — Navbar
  Sticky navy bar, CCG logo left, nav links centre, gold CTA right
  Mobile: hamburger drawer with full-width call + quote buttons
*/
import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "Service Areas", href: "#areas" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(9,30,48,0.97)" : "#0F2A44",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.35)" : "none",
        }}
      >
        <div className="container flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <img
              src="/manus-storage/ccg-full-navbar_2520906a_51166f62.png"
              alt="Concrete Concepts Group"
              className="h-9 w-auto object-contain"
            />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="text-sm font-medium text-bone/80 hover:text-gold transition-colors duration-150"
                style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.02em" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:0424463268"
              className="flex items-center gap-2 text-sm font-semibold text-bone/90 hover:text-gold transition-colors"
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).gtag) {
                  (window as any).gtag("event", "conversion", {
                    send_to: "AW-18007005419/phone_call_click",
                  });
                }
              }}
            >
              <Phone className="w-4 h-4 text-gold" />
              <span className="mono-stamp">0424 463 268</span>
            </a>
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); handleNavClick("#contact"); }}
              className="btn-gold text-sm py-2 px-5"
            >
              Free Quote
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-bone"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col"
          style={{ background: "#0F2A44" }}
        >
          <div className="h-16 flex items-center justify-between px-4">
            <img
              src="/manus-storage/ccg-full-navbar_2520906a_51166f62.png"
              alt="Concrete Concepts Group"
              className="h-9 w-auto object-contain"
            />
            <button className="p-2 text-bone" onClick={() => setOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col gap-1 px-6 py-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="text-xl font-semibold text-bone py-3 border-b border-white/10 hover:text-gold transition-colors"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="px-6 pb-8 mt-auto flex flex-col gap-3">
            <a
              href="tel:0424463268"
              className="btn-gold w-full justify-center text-base py-4"
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).gtag) {
                  (window as any).gtag("event", "conversion", {
                    send_to: "AW-18007005419/phone_call_click",
                  });
                }
              }}
            >
              <Phone className="w-5 h-5" /> Call 0424 463 268
            </a>
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); setOpen(false); handleNavClick("#contact"); }}
              className="btn-navy-outline w-full justify-center text-base py-4"
            >
              Get Free Quote
            </a>
          </div>
        </div>
      )}
    </>
  );
}
