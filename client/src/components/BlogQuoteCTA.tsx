/**
 * BlogQuoteCTA: Inline quote capture card for blog posts
 * 
 * A compact, high-converting CTA that appears mid-article in blog posts.
 * Captures name + phone directly without leaving the page.
 * Designed to convert readers who are in research mode into leads.
 */
import { useRef, useState } from "react";
import { Phone, ArrowRight, CheckCircle, Loader2, Shield, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { submitFormFallback, CONTACT_INFO } from "@/lib/formFallback";
import { useLeadSource } from "@/hooks/useLeadSource";
import { trackQuoteConversion, trackPhoneCallClick } from "@/components/ConversionTracking";
import { toast } from "sonner";
import {
  assessSubmissionSignals,
  classifyServiceArea,
  validateAustralianPhone,
} from "@shared/leadValidation";

interface BlogQuoteCTAProps {
  /** Service context from the blog post (e.g., "Concrete Driveways") */
  serviceContext?: string;
  /** Variant: "mid-article" shows between content, "sidebar" shows in a sidebar */
  variant?: "mid-article" | "sidebar";
}

export default function BlogQuoteCTA({ serviceContext, variant = "mid-article" }: BlogQuoteCTAProps) {
  const leadSource = useLeadSource();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("");
  const [website, setWebsite] = useState("");
  const formStartedAt = useRef(Date.now());

  const submitQuote = trpc.quote.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      trackQuoteConversion({ name: name.trim(), phone: phone.trim() });
      toast.success("We'll call you within 24 hours!");
    },
    onError: async (error) => {
      if (error.data?.code === "BAD_REQUEST" || error.data?.code === "TOO_MANY_REQUESTS") {
        toast.error(error.message);
        return;
      }
      try {
        const result = await submitFormFallback({
          name: name.trim(),
          phone: phone.trim(),
          suburb,
          service: serviceContext || "Blog Enquiry",
          source: "blog-quote-cta",
          website,
          formStartedAt: formStartedAt.current,
        });
        if (result.success) {
          setSubmitted(true);
          trackQuoteConversion({ name: name.trim(), phone: phone.trim() });
          toast.success("We'll call you within 24 hours!");
        } else if (result.method === "mailto") {
          toast.info("Your email app has opened. Please press Send to complete the enquiry.");
        }
      } catch (fallbackError) {
        toast.error(fallbackError instanceof Error ? fallbackError.message : `Something went wrong. Call us directly: ${CONTACT_INFO.phone}`);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Please enter your name.");
      return;
    }
    const phoneValidation = validateAustralianPhone(phone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error);
      return;
    }
    const serviceArea = classifyServiceArea(suburb);
    if (!serviceArea.canSubmit) {
      toast.error(serviceArea.message);
      return;
    }
    const signals = assessSubmissionSignals({ honeypot: website, startedAt: formStartedAt.current });
    if (!signals.allowed) {
      toast.error("Please check the form and try again.");
      return;
    }
    submitQuote.mutate({
      name: name.trim(),
      phone: phoneValidation.normalized,
      email: "not-provided@blog-enquiry.local",
      suburb: serviceArea.normalized,
      service: serviceContext || "Blog Enquiry",
      details: `Enquiry from blog post${serviceContext ? ` (${serviceContext})` : ""}`,
      website,
      formStartedAt: formStartedAt.current,
      leadSource: leadSource.leadSource || "Blog CTA",
      utmSource: leadSource.utmSource ?? undefined,
      utmMedium: leadSource.utmMedium ?? undefined,
      utmCampaign: leadSource.utmCampaign ?? undefined,
      utmTerm: leadSource.utmTerm ?? undefined,
      utmContent: leadSource.utmContent ?? undefined,
      gclid: leadSource.gclid ?? undefined,
      fbclid: leadSource.fbclid ?? undefined,
      referrer: leadSource.referrer ?? undefined,
      landingPage: leadSource.landingPage ?? undefined,
    });
  };

  if (submitted) {
    return (
      <div className={`${variant === "mid-article" ? "my-10" : ""} bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center`}>
        <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-green-800 mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          Thanks, {name}!
        </h3>
        <p className="text-green-700 text-sm" style={{ fontFamily: "var(--font-body)" }}>
          We'll call you on <strong>{phone}</strong> within 24 hours to discuss your project.
        </p>
      </div>
    );
  }

  return (
    <div className={`${variant === "mid-article" ? "my-10" : ""} bg-gradient-to-br from-brand-charcoal to-[#2a2a2a] rounded-xl p-6 md:p-8 text-white relative overflow-hidden`}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0yMCAwdjQwTTAgMjBoNDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')]" />
      
      <div className="relative z-10">
        {/* Trust badges */}
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center gap-1 text-brand-gold text-xs font-medium">
            <Star className="w-3.5 h-3.5 fill-brand-gold" />
            4.9/5 Google
          </span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span className="flex items-center gap-1 text-white/60 text-xs">
            <Shield className="w-3.5 h-3.5" />
            QBCC Licensed
          </span>
        </div>

        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Get a <span className="text-brand-gold">Free Quote</span> for Your Project
        </h3>
        <p className="text-white/60 text-sm mb-5" style={{ fontFamily: "var(--font-body)" }}>
          No obligation — we'll call you within 24 hours to discuss your needs.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-brand-gold transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-brand-gold transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
            required
          />
          <input
            type="text"
            placeholder="Suburb / Postcode"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            autoComplete="postal-code"
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-brand-gold transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
            required
          />
          <input
            type="text"
            name="website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
          />
          <button
            type="submit"
            disabled={submitQuote.isPending}
            className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-6 py-3 rounded-lg text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {submitQuote.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Get Quote
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Or call directly */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-white/40 text-xs" style={{ fontFamily: "var(--font-body)" }}>Or call directly:</span>
          <a
            href="tel:0424463268"
            onClick={() => trackPhoneCallClick()}
            className="flex items-center gap-1.5 text-brand-gold text-sm font-semibold hover:text-brand-gold-dark transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Phone className="w-3.5 h-3.5" />
            0424 463 268
          </a>
        </div>
      </div>
    </div>
  );
}
