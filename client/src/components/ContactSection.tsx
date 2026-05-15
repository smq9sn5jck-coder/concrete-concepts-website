/*
  DESIGN: Foreman's Blueprint — Contact / Quote Form
  Navy background, two-column: contact info left, form right
  Form uses Web3Forms (free, no backend) — sends to info@concreteconceptsgroup.com
  Google Ads conversion fires on successful submit
*/
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2 } from "lucide-react";

const CONTACT_INFO = [
  { icon: Phone, label: "Phone", value: "0424 463 268", href: "tel:0424463268" },
  { icon: Mail, label: "Email", value: "info@concreteconceptsgroup.com", href: "mailto:info@concreteconceptsgroup.com" },
  { icon: MapPin, label: "Service Area", value: "Brisbane & All SEQ", href: null },
  { icon: Clock, label: "Hours", value: "Mon–Fri 6am–5pm · Sat 7am–2pm", href: null },
];

const SERVICE_OPTIONS = [
  "Concrete Driveway",
  "Concrete Slab / Foundation",
  "Patio / Entertaining Area",
  "Pool Surround",
  "Retaining Wall",
  "Exposed Aggregate",
  "Coloured Concrete",
  "Covercrete",
  "Excavation",
  "Pathway / Footpath",
  "Stairs / Steps",
  "Commercial Project",
  "Other",
];

// Web3Forms access key — replace with your own from https://web3forms.com (free)
// This key sends to info@concreteconceptsgroup.com
const WEB3FORMS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", suburb: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New Quote Request — ${form.service || "General"} — ${form.suburb || "Brisbane"}`,
          from_name: form.name,
          ...form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        // Fire Google Ads conversion
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("set", "user_data", {
            email: form.email,
            phone_number: form.phone?.startsWith("0") ? "+61" + form.phone.slice(1) : form.phone,
          });
          (window as any).gtag("event", "conversion", {
            send_to: "AW-18007005419/quote_submission",
          });
        }
        // Fire Meta Pixel
        if (typeof window !== "undefined" && (window as any).fbq) {
          (window as any).fbq("track", "Lead", { content_name: form.service });
        }
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

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

          {/* Right — form */}
          <div className="bg-bone rounded-sm p-6 md:p-8">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <CheckCircle className="w-14 h-14 text-green-600" />
                <h3 className="text-navy text-xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
                  Quote Request Sent!
                </h3>
                <p className="text-charcoal/70 text-sm max-w-xs">
                  Jarrad will be in touch within a few hours. If it's urgent, call <a href="tel:0424463268" className="text-gold font-semibold">0424 463 268</a>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-navy text-xs font-semibold uppercase tracking-widest mb-1.5 mono-stamp">Your Name *</label>
                    <input
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      className="w-full border border-bone-dark bg-white rounded-sm px-3 py-2.5 text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-navy text-xs font-semibold uppercase tracking-widest mb-1.5 mono-stamp">Phone *</label>
                    <input
                      name="phone"
                      required
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0400 000 000"
                      className="w-full border border-bone-dark bg-white rounded-sm px-3 py-2.5 text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-navy text-xs font-semibold uppercase tracking-widest mb-1.5 mono-stamp">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@email.com"
                    className="w-full border border-bone-dark bg-white rounded-sm px-3 py-2.5 text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-navy text-xs font-semibold uppercase tracking-widest mb-1.5 mono-stamp">Service *</label>
                    <select
                      name="service"
                      required
                      value={form.service}
                      onChange={handleChange}
                      className="w-full border border-bone-dark bg-white rounded-sm px-3 py-2.5 text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    >
                      <option value="">Select service…</option>
                      {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-navy text-xs font-semibold uppercase tracking-widest mb-1.5 mono-stamp">Suburb *</label>
                    <input
                      name="suburb"
                      required
                      value={form.suburb}
                      onChange={handleChange}
                      placeholder="e.g. Ipswich"
                      className="w-full border border-bone-dark bg-white rounded-sm px-3 py-2.5 text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-navy text-xs font-semibold uppercase tracking-widest mb-1.5 mono-stamp">Project Details</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your project — size, finish, timeframe, anything relevant…"
                    className="w-full border border-bone-dark bg-white rounded-sm px-3 py-2.5 text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
                  />
                </div>
                {status === "error" && (
                  <p className="text-red-600 text-sm">Something went wrong. Please call us on 0424 463 268 instead.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn-gold w-full justify-center py-4 text-base"
                >
                  {status === "sending" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-5 h-5" /> Send Quote Request</>
                  )}
                </button>
                <p className="text-charcoal/50 text-xs text-center">
                  We respond within a few hours. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
