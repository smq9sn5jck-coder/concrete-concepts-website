/**
 * Dedicated noindex Google Ads landing pages.
 * These pages collect a complete contact prefill and continue into the
 * protected five-step quote wizard; they never submit or count a lead here.
 */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "wouter";
import { ArrowRight, CheckCircle, Clock, FileText, MessageSquare, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { trackLandingPageView, trackPhoneCallClick, trackTextMessageClick } from "@/components/ConversionTracking";
import { useLeadSource } from "@/hooks/useLeadSource";
import { saveQuoteDraft } from "@/lib/quoteDraft";
import { classifyServiceArea, validateAustralianPhone } from "@shared/leadValidation";
import { toast } from "sonner";

const PHONE = "0424 463 268";
const PHONE_TEL = "tel:0424463268";
const PHONE_SMS = "sms:+61424463268?&body=Hi%20CCG%2C%20I%27d%20like%20a%20concrete%20quote.";

const SERVICE_PATTERNS = [
  { pattern: /exposed-aggregate/, service: "Exposed Aggregate Concrete", id: "exposed-aggregate" },
  { pattern: /retaining-wall/, service: "Retaining Wall", id: "retaining-wall" },
  { pattern: /concrete-driveway|driveway/, service: "Concrete Driveway", id: "driveway" },
  { pattern: /concrete-slab|slab/, service: "Concrete Slab", id: "slab" },
  { pattern: /pool-surround/, service: "Concrete Pool Surround", id: "pool-surround" },
  { pattern: /concrete-patio|patio/, service: "Concrete Patio", id: "patio" },
  { pattern: /concrete-path|footpath|pathway|path/, service: "Concrete Path", id: "pathway" },
  { pattern: /concrete-step|concrete-stair|step|stair/, service: "Concrete Steps", id: "stairs" },
  { pattern: /excavation/, service: "Excavation", id: "excavation" },
  { pattern: /crossover/, service: "Concrete Crossover", id: "crossover" },
  { pattern: /commercial/, service: "Commercial Concrete", id: "commercial" },
] as const;

function titleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getLandingConfig(slug: string) {
  const match = SERVICE_PATTERNS.find(item => item.pattern.test(slug));
  const service = match?.service ?? "Concreting";
  const serviceId = match?.id ?? "other";
  const locationSlug = slug
    .replace(match?.pattern ?? /$^/, "")
    .replace(/^-|-$/g, "")
    .replace(/^(brisbane|seq)$/, "");
  const location = titleCase(locationSlug) || "Brisbane";
  const isRetainingWall = serviceId === "retaining-wall";

  return {
    service,
    serviceId,
    location,
    headline: `${service} Quotes in ${location}`,
    description: `Tell Concrete Concepts Group about your ${service.toLowerCase()} project in ${location}. Continue to a detailed five-step quote request with optional measurements and photos.`,
    intro: isRetainingWall
      ? "Tell us where the wall is, its approximate size and the site conditions. We’ll carry your answers into the full five-step quote."
      : "Start with your contact and project details, then review the complete job scope in our five-step quote form. Add measurements and photos if available.",
    detailsPrompt: isRetainingWall
      ? "Approximate length, height, wall type, slope, drainage or access notes"
      : `Tell us about your ${service.toLowerCase()} project`,
    benefits: isRetainingWall
      ? [
          "Approximate wall length, height and preferred wall type",
          "Slope, drainage and site-access details",
          "Measurements and site photos can be added in the five-step quote",
        ]
      : [
          `Site-specific ${service.toLowerCase()} scope review`,
          "Plain, coloured and decorative finish options where suitable",
          "Access, preparation, drainage and reinforcement details captured",
          "Measurements and project photos can be added in the quote wizard",
          "Brisbane and surrounding SEQ service-area confirmation",
          "Clear written project information before a quote is prepared",
        ],
  };
}

type PrefillField = "name" | "phone" | "email" | "suburb" | "details";

export default function LandingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "concreting-brisbane";
  const config = useMemo(() => getLandingConfig(slug), [slug]);
  useLeadSource();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    suburb: "",
    details: "",
  });
  const [formError, setFormError] = useState<{ field: PrefillField; message: string } | null>(null);

  useEffect(() => {
    trackLandingPageView(config.service);
  }, [config.service]);

  const showFieldError = (field: PrefillField, message: string) => {
    setFormError({ field, message });
    toast.error(message);
    window.requestAnimationFrame(() => document.getElementById(`lp-${field}`)?.focus());
  };

  const updateField = (field: PrefillField, value: string) => {
    setFormData(current => ({ ...current, [field]: value }));
    if (formError?.field === field) setFormError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formData.name.trim().length < 2) {
      showFieldError("name", "Please enter your name.");
      return;
    }
    const phoneValidation = validateAustralianPhone(formData.phone);
    if (!phoneValidation.valid || phoneValidation.kind !== "mobile") {
      showFieldError("phone", "Enter an Australian mobile number beginning with 04.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      showFieldError("email", "Enter a valid email address.");
      return;
    }
    const serviceArea = classifyServiceArea(formData.suburb);
    if (!serviceArea.canSubmit) {
      showFieldError("suburb", serviceArea.message);
      return;
    }

    setFormError(null);

    saveQuoteDraft({
      name: formData.name.trim(),
      mobile: phoneValidation.normalized,
      email: formData.email.trim(),
      suburb: serviceArea.normalized,
      services: [config.serviceId],
      finish: config.serviceId === "exposed-aggregate" ? "exposed" : "not_sure",
      description: formData.details.trim(),
    });
    window.location.assign("/get-quote");
  };

  const handleCallClick = () => {
    trackPhoneCallClick();
    window.location.href = PHONE_TEL;
  };

  const handleSmsClick = () => {
    trackTextMessageClick();
    window.location.href = PHONE_SMS;
  };

  return (
    <>
      <SEOHead
        title={`${config.headline} | Concrete Concepts Group`}
        description={config.description}
        canonical={`/lp/${slug}`}
        noindex
      />
      <main className="min-h-screen bg-[#151515] pb-20 text-white md:pb-0">
        <header className="border-b border-white/10 bg-[#0f0f0f] px-4 py-3">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <a href="/" className="font-bold tracking-wide text-[#d2b06a]">CONCRETE CONCEPTS</a>
            <div className="flex gap-2">
              <Button onClick={handleSmsClick} variant="outline" className="border-[#d2b06a] text-[#d2b06a]">
                <MessageSquare className="mr-2 h-4 w-4" /> Text
              </Button>
              <Button onClick={handleCallClick} className="bg-[#d2b06a] font-bold text-[#151515] hover:bg-[#e1c17d]">
                <Phone className="mr-2 h-4 w-4" /> {PHONE}
              </Button>
            </div>
          </div>
        </header>

        <section className="px-4 py-12 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.05fr_.95fr] md:items-start md:gap-10">
            <div className="md:col-start-1 md:row-start-1">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#d2b06a]">
                <Shield className="h-5 w-5" /> QBCC Licence 15299707
              </div>
              <h1 className="mb-5 text-4xl font-bold leading-tight sm:text-5xl">{config.headline}</h1>
              <p className="max-w-2xl text-lg leading-relaxed text-gray-300">
                {config.intro}
              </p>
            </div>

            <div data-testid="quote-prefill-card" className="rounded-2xl bg-white p-6 text-[#171717] shadow-2xl md:col-start-2 md:row-span-2 md:row-start-1 md:p-8">
              <h2 className="text-2xl font-bold">Start Your Detailed Quote</h2>
              <p className="mt-2 text-gray-600">We aim to respond within 24 hours. No obligation.</p>
              <form id="quote-form" onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="lp-name" className="mb-1.5 block text-sm font-semibold">Your name <span aria-hidden="true">*</span></label>
                <input
                  id="lp-name"
                  name="name"
                  required
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Alex Smith"
                  value={formData.name}
                  onChange={event => updateField("name", event.target.value)}
                  aria-invalid={formError?.field === "name"}
                  aria-describedby="quote-prefill-error"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#b8953c] focus:ring-2 focus:ring-[#d2b06a]/30"
                />
                </div>
                <div>
                  <label htmlFor="lp-phone" className="mb-1.5 block text-sm font-semibold">Australian mobile <span aria-hidden="true">*</span></label>
                <input
                  id="lp-phone"
                  name="phone"
                  required
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="04xx xxx xxx"
                  value={formData.phone}
                  onChange={event => updateField("phone", event.target.value)}
                  aria-invalid={formError?.field === "phone"}
                  aria-describedby="quote-prefill-error"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#b8953c] focus:ring-2 focus:ring-[#d2b06a]/30"
                />
                </div>
                <div>
                  <label htmlFor="lp-email" className="mb-1.5 block text-sm font-semibold">Email address <span aria-hidden="true">*</span></label>
                <input
                  id="lp-email"
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={event => updateField("email", event.target.value)}
                  aria-invalid={formError?.field === "email"}
                  aria-describedby="quote-prefill-error"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#b8953c] focus:ring-2 focus:ring-[#d2b06a]/30"
                />
                </div>
                <div>
                  <label htmlFor="lp-suburb" className="mb-1.5 block text-sm font-semibold">Project suburb or postcode <span aria-hidden="true">*</span></label>
                <input
                  id="lp-suburb"
                  name="suburb"
                  required
                  type="text"
                  autoComplete="postal-code"
                  placeholder="e.g. Carindale or 4152"
                  value={formData.suburb}
                  onChange={event => updateField("suburb", event.target.value)}
                  aria-invalid={formError?.field === "suburb"}
                  aria-describedby="quote-prefill-error"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#b8953c] focus:ring-2 focus:ring-[#d2b06a]/30"
                />
                </div>
                {formData.suburb && classifyServiceArea(formData.suburb).status === "service_area_review" && (
                  <p className="text-xs text-amber-700">You can continue. Our team will confirm availability for this Queensland location.</p>
                )}
                <div>
                  <label htmlFor="lp-details" className="mb-1.5 block text-sm font-semibold">Project details <span className="font-normal text-gray-500">(optional for now)</span></label>
                <textarea
                  id="lp-details"
                  name="details"
                  rows={3}
                  placeholder={config.detailsPrompt}
                  value={formData.details}
                  onChange={event => updateField("details", event.target.value)}
                  aria-describedby="quote-prefill-error"
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#b8953c] focus:ring-2 focus:ring-[#d2b06a]/30"
                />
                </div>
                <p id="quote-prefill-error" role="alert" aria-live="polite" className={formError ? "text-sm font-medium text-red-700" : "sr-only"}>
                  {formError?.message ?? "Complete the required fields to continue."}
                </p>
                <Button type="submit" className="w-full bg-[#c8a55c] py-6 text-lg font-bold text-[#151515] hover:bg-[#d2b06a]">
                  Continue to the Five-Step Quote <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Response target: 24 hours</span>
                <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> Details saved for review</span>
              </div>
            </div>

            <div data-testid="landing-benefits" className="grid gap-3 sm:grid-cols-2 md:col-start-1 md:row-start-2">
              {config.benefits.map(benefit => (
                <div key={benefit} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#d2b06a]" />
                  <span className="text-gray-200">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#101010] px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold">What Happens Next</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {["Complete the five-step scope", "Add measurements or photos", "CCG reviews your project", "Site inspection if required"].map((step, index) => (
                <div key={step} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#d2b06a] font-bold text-[#151515]">{index + 1}</span>
                  <p className="text-gray-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 text-center">
          <h2 className="text-3xl font-bold">Prefer to Talk or Text?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-300">Contact CCG about your project, or continue the quote online when you have the details ready.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={handleCallClick} className="bg-[#d2b06a] font-bold text-[#151515] hover:bg-[#e1c17d]"><Phone className="mr-2 h-5 w-5" /> Call {PHONE}</Button>
            <Button onClick={handleSmsClick} variant="outline" className="border-[#d2b06a] text-[#d2b06a]"><MessageSquare className="mr-2 h-5 w-5" /> Text CCG</Button>
          </div>
        </section>

        <nav aria-label="Mobile contact options" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-white/15 bg-[#101010] p-2 md:hidden">
          <button onClick={handleCallClick} className="flex min-h-12 flex-col items-center justify-center gap-1 text-xs font-semibold text-white"><Phone className="h-5 w-5 text-[#d2b06a]" />Call</button>
          <button onClick={handleSmsClick} className="flex min-h-12 flex-col items-center justify-center gap-1 text-xs font-semibold text-white"><MessageSquare className="h-5 w-5 text-[#d2b06a]" />Text</button>
          <a href="#quote-form" className="flex min-h-12 flex-col items-center justify-center gap-1 text-xs font-semibold text-white"><FileText className="h-5 w-5 text-[#d2b06a]" />Quote</a>
        </nav>
      </main>
    </>
  );
}
