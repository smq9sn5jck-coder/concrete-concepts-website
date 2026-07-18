/*
  Reusable Quote Form Component
  Uses Resend API to send emails to info@concreteconceptsgroup.com
  Maintains Google Ads and Meta Pixel tracking
*/
import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";

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

interface QuoteFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export default function QuoteForm({ onSuccess, compact = false }: QuoteFormProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", suburb: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      // Send email via Resend API through backend
      const res = await fetch("/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service,
          suburb: form.suburb,
          message: form.message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", service: "", suburb: "", message: "" });
        
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

        // Auto-close after 3 seconds
        setTimeout(() => {
          setStatus("idle");
          if (onSuccess) {
            onSuccess();
          }
        }, 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <CheckCircle className="w-14 h-14 text-green-600 animate-bounce" />
        <h3 className="text-navy text-xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          ✓ Quote Request Sent!
        </h3>
        <p className="text-charcoal/70 text-sm max-w-xs">
          We've received your enquiry and Jarrad will be in touch within a few hours.
        </p>
        <p className="text-charcoal/50 text-xs mt-2">
          For urgent matters, call <a href="tel:0424463268" className="text-gold font-semibold hover:underline">0424 463 268</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${compact ? "space-y-3" : ""}`}>
      <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
        <div className={compact ? "" : "col-span-2 sm:col-span-1"}>
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
        <div className={compact ? "" : "col-span-2 sm:col-span-1"}>
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
      <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
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
      {!compact && (
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
      )}
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
  );
}
