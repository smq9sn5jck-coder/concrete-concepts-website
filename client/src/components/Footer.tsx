/*
  DESIGN: Foreman's Blueprint — Footer
  Deep navy, gold accents, QBCC badge, social links, schema JSON-LD
*/
import { Phone, Mail, MapPin, Facebook } from "lucide-react";

const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://concreteconceptsgroup.com/#business",
  name: "Concrete Concepts Group Pty Ltd",
  alternateName: "Concrete Concepts Group",
  description: "Professional concreting services in Brisbane and all surrounding areas. Driveways, slabs, patios, retaining walls, exposed aggregate, and excavation. QBCC Licensed #15299707.",
  url: "https://concreteconceptsgroup.com",
  telephone: "+61424463268",
  email: "info@concreteconceptsgroup.com",
  image: "https://concreteconceptsgroup.com/manus-storage/ccg-full-hero_a3bbd489_51c9c0e6.png",
  logo: "https://concreteconceptsgroup.com/manus-storage/ccg-full-navbar_2520906a_51166f62.png",
  priceRange: "$$",
  currenciesAccepted: "AUD",
  paymentAccepted: "Cash, Credit Card, Bank Transfer",
  address: { "@type": "PostalAddress", addressLocality: "Brisbane", addressRegion: "QLD", postalCode: "4000", addressCountry: "AU" },
  geo: { "@type": "GeoCoordinates", latitude: -27.4698, longitude: 153.0251 },
  areaServed: [
    { "@type": "State", name: "South East Queensland" },
    { "@type": "City", name: "Brisbane" }, { "@type": "City", name: "Ipswich" },
    { "@type": "City", name: "Logan" }, { "@type": "City", name: "Moreton Bay" },
    { "@type": "City", name: "Gold Coast" }, { "@type": "City", name: "Sunshine Coast" },
  ],
  hasCredential: { "@type": "EducationalOccupationalCredential", credentialCategory: "QBCC Licence", identifier: "15299707", recognizedBy: { "@type": "Organization", name: "Queensland Building and Construction Commission" } },
  sameAs: ["https://www.facebook.com/share/14Z2spZfScB/", "https://www.concrete-concepts.com.au/"],
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "06:00", closes: "17:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "07:00", closes: "14:00" },
  ],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "17", bestRating: "5", worstRating: "1" },
};

export default function Footer() {
  return (
    <footer className="bg-navy-deep" style={{ background: "#091e30" }}>
      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* Pre-footer CTA strip */}
      <div style={{ background: "#C9A44D" }}>
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-navy font-bold text-base" style={{ fontFamily: "Fraunces, serif" }}>
            Ready to get started? Call Jarrad directly.
          </p>
          <a
            href="tel:0424463268"
            className="bg-navy text-bone font-bold py-3 px-7 rounded-sm flex items-center gap-2 hover:bg-navy-light transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).gtag) {
                (window as any).gtag("event", "conversion", { send_to: "AW-18007005419/phone_call_click" });
              }
            }}
          >
            <Phone className="w-4 h-4" />
            <span className="mono-stamp">0424 463 268</span>
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <img
              src="/manus-storage/ccg-full-navbar_2520906a_51166f62.png"
              alt="Concrete Concepts Group"
              className="h-10 w-auto mb-4 object-contain"
            />
            <p className="text-bone/60 text-sm leading-relaxed mb-4">
              Brisbane's trusted concreting specialists. QBCC Licensed, fully insured, and owner-operated by Jarrad.
            </p>
            <div className="mono-stamp text-gold text-xs">QBCC LICENCE #15299707</div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-bone font-semibold text-sm uppercase tracking-widest mb-4 mono-stamp">Services</h4>
            <ul className="space-y-2 text-bone/60 text-sm">
              {["Concrete Driveways", "Concrete Slabs", "Exposed Aggregate", "Patios & Entertaining", "Retaining Walls", "Excavation", "Pool Surrounds", "Coloured Concrete"].map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    onClick={(e) => { e.preventDefault(); document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" }); }}
                    className="hover:text-gold transition-colors"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-bone font-semibold text-sm uppercase tracking-widest mb-4 mono-stamp">Contact</h4>
            <div className="space-y-3">
              <a href="tel:0424463268" className="flex items-center gap-2 text-bone/70 hover:text-gold transition-colors text-sm">
                <Phone className="w-4 h-4 text-gold" />
                <span className="mono-stamp">0424 463 268</span>
              </a>
              <a href="mailto:info@concreteconceptsgroup.com" className="flex items-center gap-2 text-bone/70 hover:text-gold transition-colors text-sm">
                <Mail className="w-4 h-4 text-gold" />
                info@concreteconceptsgroup.com
              </a>
              <div className="flex items-center gap-2 text-bone/70 text-sm">
                <MapPin className="w-4 h-4 text-gold" />
                Brisbane & All SEQ
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <a
                href="https://www.facebook.com/share/14Z2spZfScB/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center text-bone/60 hover:text-gold hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.google.com/maps/place/Concrete+concepts+group+pty+Ltd/@-27.4479932,153.0574609,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center text-bone/60 hover:text-gold hover:bg-white/20 transition-colors text-xs font-bold"
              >
                G
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-bone/40 text-xs">
          <p>© {new Date().getFullYear()} Concrete Concepts Group Pty Ltd. All rights reserved.</p>
          <p className="mono-stamp">ABN · QBCC #15299707 · Brisbane QLD</p>
        </div>
      </div>
    </footer>
  );
}
