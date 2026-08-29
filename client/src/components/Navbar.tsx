/*
  DESIGN: Refined Craft — Concrete Concepts Group brand
  Navbar: Clean, minimal with logo on left, nav links center, CTA right
  Gold accent on hover, charcoal text, transparent -> white on scroll
*/
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Our Work", href: "/projects", isRoute: true },
  { label: "Before & After", href: "/gallery/before-after", isRoute: true },
  { label: "Cost Calculator", href: "/calculator", isRoute: true },
  { label: "Finishes", href: "/finishes", isRoute: true },
  { label: "Areas", href: "/areas", isRoute: true },
  { label: "Reviews", href: "/reviews", isRoute: true },
  { label: "Blog", href: "/blog", isRoute: true },
  { label: "AI Visualiser", href: "/visualiser", isRoute: true, badge: true },
  { label: "Free Guide", href: "/guide", isRoute: true, badge: true },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileOpen(false);
    // If we're not on the homepage, navigate there first
    if (location !== "/") {
      window.location.href = `/${href}`;
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${location === "/" && !scrolled ? "top-[60px] sm:top-10" : "top-0"} ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-20 lg:h-24">
          {/* Brand Logo — swap between light (transparent bg) and dark versions */}
          <Link href="/">
            <img
              src={scrolled
                ? "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-navbar_2520906a.png"
                : "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-hero_a3bbd489.png"
              }
              alt="Concrete Concepts Group"
              width={104}
              height={80}
              loading="eager"
              decoding="sync"
              className="h-12 lg:h-14 w-auto object-contain cursor-pointer transition-opacity duration-300"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden 2xl:flex items-center gap-4 whitespace-nowrap">
            {navLinks.map((link) => (
              'isRoute' in link && link.isRoute ? (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300 cursor-pointer relative ${
                      'badge' in link && link.badge
                        ? scrolled ? "text-brand-gold" : "text-brand-gold"
                        : scrolled
                          ? "text-brand-charcoal hover:text-brand-gold"
                          : "text-white/90 hover:text-brand-gold"
                    }`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {'badge' in link && link.badge && (
                      <span className="absolute -top-2.5 -right-3 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">NEW</span>
                    )}
                    {link.label}
                  </span>
                </Link>
              ) : (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${
                    scrolled
                      ? "text-brand-charcoal hover:text-brand-gold"
                      : "text-white/90 hover:text-brand-gold"
                  }`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {link.label}
                </button>
              )
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden 2xl:flex items-center gap-3 whitespace-nowrap">
            <a
              href="https://partners.concreteconceptsgroup.com/partners"
              className={`text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${
                scrolled
                  ? "text-brand-charcoal hover:text-brand-gold"
                  : "text-white/90 hover:text-brand-gold"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              Trade Partners
            </a>
            <Link href="/get-quote">
              <Button
                className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-6 py-2.5 text-sm tracking-wide uppercase shadow-lg shadow-brand-gold/20 transition-all duration-300 hover:shadow-xl hover:shadow-brand-gold/30"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Get a Free Quote
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`2xl:hidden p-2 transition-colors ${
              scrolled ? "text-brand-charcoal" : "text-white"
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-brand-charcoal pt-24 overflow-y-auto"
          >
            <div className="flex flex-col items-center gap-8 p-8">
              {navLinks.map((link) => (
                'isRoute' in link && link.isRoute ? (
                  <Link key={link.href} href={link.href}>
                    <span
                      onClick={() => setMobileOpen(false)}
                      className={`text-xl font-medium tracking-wide uppercase transition-colors cursor-pointer relative ${
                        'badge' in link && link.badge
                          ? "text-brand-gold"
                          : "text-white/90 hover:text-brand-gold"
                      }`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {'badge' in link && link.badge && (
                        <span className="absolute -top-2 -right-6 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">NEW</span>
                      )}
                      {link.label}
                    </span>
                  </Link>
                ) : (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="text-xl font-medium text-white/90 hover:text-brand-gold tracking-wide uppercase transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {link.label}
                  </button>
                )
              ))}
              <a
                href="https://partners.concreteconceptsgroup.com/partners"
                onClick={() => setMobileOpen(false)}
                className="text-xl font-medium text-brand-gold hover:text-white tracking-wide uppercase transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Trade Partners
              </a>
              <div className="w-16 h-px bg-brand-gold/40 my-2" />
              <Link href="/get-quote">
                <Button
                  onClick={() => setMobileOpen(false)}
                  className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-8 py-3 text-base tracking-wide uppercase"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Get a Free Quote
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
