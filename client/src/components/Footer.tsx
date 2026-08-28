/*
  DESIGN: Refined Craft — Concrete Concepts Group brand
  Footer: SEO-optimized with service links, suburb links, area pages, and structured content
*/
import { Link } from "wouter";
import { trackPhoneCallClick, trackEmailClick } from "@/components/ConversionTracking";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-navbar_2520906a.png";

const serviceLinks = [
  { name: "Concrete Driveways", href: "/services/concrete-driveways-brisbane" },
  { name: "Concrete Slabs", href: "/services/concrete-slabs-brisbane" },
  { name: "Retaining Walls", href: "/services/retaining-walls-brisbane" },
  { name: "Exposed Aggregate", href: "/services/exposed-aggregate-brisbane" },
  { name: "Concrete Patios", href: "/services/concrete-patios-brisbane" },
  { name: "Excavation", href: "/services/excavation-brisbane" },
];

const areaLinks = [
  { name: "Morningside", href: "/areas/morningside" },
  { name: "Coorparoo", href: "/areas/coorparoo" },
  { name: "Greenslopes", href: "/areas/greenslopes" },
  { name: "Annerley", href: "/areas/annerley" },
  { name: "Carindale", href: "/areas/carindale" },
  { name: "Holland Park", href: "/areas/holland-park" },
  { name: "Tarragindi", href: "/areas/tarragindi" },
  { name: "Moorooka", href: "/areas/moorooka" },
  { name: "Mt Gravatt", href: "/areas/mount-gravatt" },
  { name: "Camp Hill", href: "/areas/camp-hill" },
  { name: "Sunnybank", href: "/areas/sunnybank" },
  { name: "Indooroopilly", href: "/areas/indooroopilly" },
  { name: "Kenmore", href: "/areas/kenmore" },
  { name: "Chapel Hill", href: "/areas/chapel-hill" },
  { name: "Nundah", href: "/areas/nundah" },
  { name: "Stafford", href: "/areas/stafford" },
  { name: "Everton Park", href: "/areas/everton-park" },
  { name: "Chermside", href: "/areas/chermside" },
  { name: "Aspley", href: "/areas/aspley" },
  { name: "The Gap", href: "/areas/the-gap" },
  { name: "Ferny Grove", href: "/areas/ferny-grove" },
  { name: "North Lakes", href: "/areas/north-lakes" },
  { name: "Caboolture", href: "/areas/caboolture" },
  { name: "Logan", href: "/areas/logan" },
  { name: "Beenleigh", href: "/areas/beenleigh" },
  { name: "Wynnum", href: "/areas/wynnum" },
  { name: "Redlands", href: "/areas/redlands" },
  { name: "Capalaba", href: "/areas/capalaba" },
  { name: "Ipswich", href: "/areas/ipswich" },
  { name: "Springfield", href: "/areas/springfield" },
];

const suburbs = [
  "Brisbane CBD", "Southside", "Northside", "Ipswich", "Logan",
  "Redlands", "Moreton Bay", "Capalaba", "Cleveland", "Wynnum",
  "Manly", "Coorparoo", "Camp Hill", "Cannon Hill", "Bulimba",
  "Carindale", "Mount Gravatt", "Sunnybank", "Springwood", "Beenleigh",
  "Springfield", "Forest Lake", "Goodna", "Redbank Plains", "Marsden",
  "Morningside", "Greenslopes", "Holland Park", "Tarragindi", "Annerley",
  "Moorooka", "Kenmore", "Indooroopilly", "Chapel Hill", "The Gap",
  "Ferny Grove", "Everton Park", "Stafford", "Nundah", "North Lakes",
];

export default function Footer() {
  const scrollToSection = (href: string) => {
    if (href === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#1a1a1a] border-t border-white/5">
      <div className="container py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <img
              src={LOGO_URL}
              alt="Concrete Concepts Group - Brisbane Concreting Services"
              width={56}
              height={56}
              loading="lazy"
              decoding="async"
              className="h-14 w-auto mb-4 rounded-sm"
            />
            <p
              className="text-white/60 text-sm leading-relaxed max-w-xs"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Brisbane's trusted concreting professionals. From driveways and slabs 
              to retaining walls and excavation — QBCC Licensed, fully insured, 
              and committed to quality on every project.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Services", href: "#services" },
                { label: "About Us", href: "#about" },
                { label: "Our Work", href: "#work" },
                { label: "Service Areas", href: "#service-area" },
                { label: "Get a Quote", href: "/get-quote" },
              ].map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/60 hover:text-brand-gold text-sm transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <Link href="/reviews">
                  <span className="text-white/60 hover:text-brand-gold text-sm transition-colors cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                    Reviews
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <span className="text-white/60 hover:text-brand-gold text-sm transition-colors cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                    Blog
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/gallery/before-after">
                  <span className="text-white/60 hover:text-brand-gold text-sm transition-colors cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                    Before & After
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/calculator">
                  <span className="text-white/60 hover:text-brand-gold text-sm transition-colors cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                    Cost Calculator
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/finishes">
                  <span className="text-white/60 hover:text-brand-gold text-sm transition-colors cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                    Concrete Finishes
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <span className="text-white/60 hover:text-brand-gold text-sm transition-colors cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                    FAQ
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services with links */}
          <div>
            <h3
              className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Our Services
            </h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((service) => (
                <li key={service.name}>
                  <Link href={service.href}>
                    <span
                      className="text-white/60 hover:text-brand-gold text-sm transition-colors cursor-pointer"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {service.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas with links */}
          <div>
            <h3
              className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Service Areas
            </h3>
            <ul className="space-y-2.5">
              {areaLinks.map((area) => (
                <li key={area.name}>
                  <Link href={area.href}>
                    <span
                      className="text-white/60 hover:text-brand-gold text-sm transition-colors cursor-pointer"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {area.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Contact
            </h3>
            <ul className="space-y-2.5" style={{ fontFamily: "var(--font-body)" }}>
              <li>
                <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="text-white/60 hover:text-brand-gold text-sm transition-colors">
                  0424 463 268
                </a>
              </li>
              <li>
                <a href="mailto:info@concreteconceptsgroup.com" onClick={() => trackEmailClick()} className="text-white/40 hover:text-brand-gold text-sm transition-colors break-all">
                  info@concreteconceptsgroup.com
                </a>
              </li>
              <li className="text-white/40 text-sm">
                Brisbane &amp; All Surrounding Areas, QLD
              </li>
              <li className="text-white/40 text-sm">
                ABN: 61 695 485 593
              </li>
              <li className="text-white/40 text-sm">
                QBCC Licence: 15299707
              </li>
            </ul>
          </div>
        </div>

        {/* Service Areas — suburb keywords for local SEO */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <h3
            className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Proudly Serving
          </h3>
          <p
            className="text-white/40 text-xs leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {suburbs.join(" · ")}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/25 text-xs" style={{ fontFamily: "var(--font-body)" }}>
            &copy; {new Date().getFullYear()} Concrete Concepts Group Pty Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-white/25 hover:text-brand-gold text-xs transition-colors" style={{ fontFamily: "var(--font-body)" }}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/25 hover:text-brand-gold text-xs transition-colors" style={{ fontFamily: "var(--font-body)" }}>
              Terms of Service
            </Link>
            <Link href="/faq" className="text-white/25 hover:text-brand-gold text-xs transition-colors" style={{ fontFamily: "var(--font-body)" }}>
              FAQ
            </Link>
            <button
              onClick={() => scrollToSection("#top")}
              className="text-white/25 hover:text-brand-gold text-xs transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
