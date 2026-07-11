/*
  DESIGN: Foreman's Blueprint — Contact / Quote Form
  Navy background, two-column: contact info left, form right
  Form uses Jotform embed — sends to info@concreteconceptsgroup.com
  Google Ads conversion fires on successful submit
*/
import { useEffect } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const CONTACT_INFO = [
  { icon: Phone, label: "Phone", value: "0424 463 268", href: "tel:0424463268" },
  { icon: Mail, label: "Email", value: "info@concreteconceptsgroup.com", href: "mailto:info@concreteconceptsgroup.com" },
  { icon: MapPin, label: "Service Area", value: "Brisbane & All SEQ", href: null },
  { icon: Clock, label: "Hours", value: "Mon–Fri 6am–5pm · Sat 7am–2pm", href: null },
];

// Jotform ID for "Request a Free Quote" form
const JOTFORM_ID = "261575205702049";

export default function ContactSection() {
  useEffect(() => {
    // Load Jotform embed script
    const script = document.createElement("script");
    script.src = "https://cdn.jotfor.ms/s/umd/latest/for.js";
    script.async = true;
    document.body.appendChild(script);

    // Fire Google Ads conversion when form is submitted
    // Jotform fires a custom event on submission
    const handleJotformSubmit = () => {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "conversion", {
          send_to: "AW-18007005419/quote_submission",
        });
      }
      // Fire Meta Pixel
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", { content_name: "Quote Request" });
      }
    };

    // Listen for Jotform submission
    window.addEventListener("jotformSubmitted", handleJotformSubmit);

    return () => {
      window.removeEventListener("jotformSubmitted", handleJotformSubmit);
    };
  }, []);

  return (
    <section id="contact" className="bg-navy py-20 md:py-28">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left — contact info */}
          <div>
            <p className="section-stamp mb-3">08 / Get in Touch</p>
            <h2
              className="text-bone mb-4"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
            >
              Get Your Free Quote Today
            </h2>
            <p className="text-bone/70 mb-8 leading-relaxed">
              Fill in the form and Jarrad will be in touch within a few hours. No obligation, no pressure — just an honest price for your project.
            </p>

            <div className="space-y-5 mb-10">
              {CONTACT_INFO.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="text-bone/50 text-xs uppercase tracking-widest mono-stamp mb-0.5">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="text-bone font-semibold hover:text-gold transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <div className="text-bone font-semibold">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust strip */}
            <div className="border border-white/10 rounded-sm p-4 bg-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-gold font-bold text-2xl" style={{ fontFamily: "Fraunces, serif" }}>4.9★</div>
                <div>
                  <div className="text-bone text-sm font-semibold">Google Verified</div>
                  <div className="text-bone/50 text-xs mono-stamp">17 REVIEWS · QBCC #15299707</div>
                </div>
              </div>
              <p className="text-bone/60 text-xs leading-relaxed">
                "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish." — Myresh M
              </p>
            </div>
          </div>

          {/* Right — Jotform embed */}
          <div className="bg-bone rounded-sm p-6 md:p-8 overflow-hidden">
            <iframe
              id="JotFormIFrame"
              title="Request a Free Quote"
              onLoad={() => {
                // Jotform iframe loaded
              }}
              allowFullScreen
              allow="geolocation; microphone; camera; payment"
              src={`https://form.jotform.com/${JOTFORM_ID}`}
              frameBorder="0"
              style={{
                minWidth: "100%",
                height: "539px",
                border: "none",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
