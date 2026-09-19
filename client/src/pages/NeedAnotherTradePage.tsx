import { useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  HardHat,
  Loader2,
  Phone,
  ShieldCheck,
  Trash2,
  Upload,
  Wrench,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { trackPhoneCallClick } from "@/components/ConversionTracking";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { classifyServiceArea, validateAustralianPhone } from "@shared/leadValidation";
import {
  OTHER_TRADE_CATEGORIES,
  OTHER_TRADE_CONSENT_TEXT,
  OTHER_TRADE_CONSENT_VERSION,
  OTHER_TRADE_LIMITS,
  OTHER_TRADE_PAGE_VERSION,
  OTHER_TRADE_TIMEFRAMES,
  type OtherTradeCategory,
  type OtherTradeTimeframe,
} from "@shared/otherTrade";
import { GENERATED_OTHER_TRADE_CONSENT_TEXT_SHA256 } from "@/generated/otherTradeConfig";
import { submitOtherTradeFallback } from "@/lib/formFallback";

type FieldName = "name" | "mobile" | "email" | "location" | "trade" | "description" | "timeframe" | "consent";
type FieldErrors = Partial<Record<FieldName, string>>;
type PhotoState = {
  id: string;
  fileName: string;
  status: "uploading" | "uploaded" | "error";
  url?: string;
  error?: string;
};

const initialForm = {
  name: "",
  mobile: "",
  email: "",
  location: "",
  trade: "" as OtherTradeCategory | "",
  description: "",
  timeframe: "" as OtherTradeTimeframe | "",
  consent: false,
};

function fieldErrorId(field: FieldName) {
  return `${field}-error`;
}

export function otherTradeErrorFieldId(message: string) {
  if (/mobile|phone|\b04\b/i.test(message)) return "other-mobile";
  if (/email/i.test(message)) return "other-email";
  if (/Brisbane|South East Queensland|suburb|postcode|location/i.test(message)) return "other-location";
  if (/timeframe/i.test(message)) return "other-timeframe";
  if (/trade category|approved trade|select.*trade/i.test(message)) return "other-trade";
  if (/description|job detail/i.test(message)) return "other-description";
  if (/consent/i.test(message)) return "provider-consent";
  if (/name/i.test(message)) return "other-name";
  return "other-form-error";
}

export default function NeedAnotherTradePage() {
  const [form, setForm] = useState(initialForm);
  const [formExpanded, setFormExpanded] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [photos, setPhotos] = useState<PhotoState[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [website, setWebsite] = useState("");
  const formStartedAt = useRef(Date.now());
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLElement | null>>>({});

  const update = <K extends keyof typeof initialForm>(field: K, value: (typeof initialForm)[K]) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
    setSubmitError("");
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (form.name.trim().length < OTHER_TRADE_LIMITS.nameMin) next.name = "Enter your name.";
    const phone = validateAustralianPhone(form.mobile);
    if (!phone.valid || !("kind" in phone) || phone.kind !== "mobile") next.mobile = "Enter an Australian mobile number beginning with 04.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    const location = classifyServiceArea(form.location);
    if (!location.canSubmit) next.location = location.message;
    if (!form.trade) next.trade = "Select a trade category.";
    const descriptionLength = form.description.trim().length;
    if (descriptionLength < OTHER_TRADE_LIMITS.descriptionMin) next.description = "Add at least 20 characters about the work required.";
    if (descriptionLength > OTHER_TRADE_LIMITS.descriptionMax) next.description = "Keep the job description under 5,000 characters.";
    if (!form.timeframe) next.timeframe = "Select a timeframe.";
    if (!form.consent) next.consent = "Consent is required before CCG can review this request.";
    return next;
  };

  const focusFirstError = (nextErrors: FieldErrors) => {
    const first = (Object.keys(nextErrors) as FieldName[])[0];
    if (!first) return;
    requestAnimationFrame(() => fieldRefs.current[first]?.focus());
  };

  const fileToBase64 = async (file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let index = 0; index < bytes.length; index += 0x8000) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(index, index + 0x8000)));
    }
    return btoa(binary);
  };

  const uploadPhoto = async (id: string, file: File) => {
    try {
      const response = await fetch("/api/upload-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: await fileToBase64(file),
          contentType: file.type,
          fileName: file.name,
          purpose: "other-trade",
        }),
      });
      const result = await response.json().catch(() => ({})) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Upload failed.");
      setPhotos(current => current.map(photo => photo.id === id
        ? { ...photo, status: "uploaded", url: result.url, error: undefined }
        : photo));
    } catch (error) {
      setPhotos(current => current.map(photo => photo.id === id
        ? { ...photo, status: "error", error: error instanceof Error ? error.message : "Upload failed." }
        : photo));
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const accepted = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
    const remaining = Math.max(0, OTHER_TRADE_LIMITS.photoCountMax - photos.length);
    const selected = Array.from(event.target.files ?? []).slice(0, remaining);
    const next: Array<{ state: PhotoState; file: File }> = [];
    for (const file of selected) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      if (!accepted.has(file.type) || file.size > 10 * 1024 * 1024) {
        next.push({
          file,
          state: {
            id,
            fileName: file.name,
            status: "error",
            error: !accepted.has(file.type) ? "Use JPEG, PNG, WebP or HEIC." : "Photo is larger than 10 MB.",
          },
        });
      } else {
        next.push({ file, state: { id, fileName: file.name, status: "uploading" } });
      }
    }
    setPhotos(current => [...current, ...next.map(item => item.state)]);
    next.filter(item => item.state.status === "uploading").forEach(item => void uploadPhoto(item.state.id, item.file));
    event.target.value = "";
  };

  const removePhoto = (id: string) => setPhotos(current => current.filter(photo => photo.id !== id));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors);
      return;
    }
    if (photos.some(photo => photo.status === "uploading")) {
      setSubmitError("Wait for photo uploads to finish, or remove them and submit a photo-free request.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await submitOtherTradeFallback({
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        location: form.location,
        trade: form.trade as OtherTradeCategory,
        description: form.description,
        timeframe: form.timeframe as OtherTradeTimeframe,
        photoUrls: photos.filter(photo => photo.status === "uploaded" && photo.url).map(photo => photo.url as string),
        consent: true,
        consentVersion: OTHER_TRADE_CONSENT_VERSION,
        consentText: OTHER_TRADE_CONSENT_TEXT,
        consentTextSha256: GENERATED_OTHER_TRADE_CONSENT_TEXT_SHA256,
        pageVersion: OTHER_TRADE_PAGE_VERSION,
        source: "need-another-trade",
        landingPage: "/need-another-trade",
        website,
        formStartedAt: formStartedAt.current,
      });
      if (!result.success) {
        const message = result.error || "We couldn't confirm this request.";
        setSubmitError(message);
        requestAnimationFrame(() => document.getElementById(otherTradeErrorFieldId(message))?.focus());
        return;
      }
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn't confirm this request.";
      setSubmitError(message);
      requestAnimationFrame(() => document.getElementById(otherTradeErrorFieldId(message))?.focus());
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = "min-h-12 rounded-xl border-slate-300 bg-white px-4 text-base focus-visible:ring-brand-gold";

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-brand-charcoal">
      <SEOHead
        title="Need Another Trade? | CCG Review Request"
        description="Send a Brisbane or South East Queensland trade request to CCG for review. No provider, availability, price, workmanship or response is guaranteed."
        canonical="/need-another-trade"
        noindex
      />
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-brand-charcoal px-4 pb-16 pt-32 text-white md:pb-24 md:pt-40">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 15% 25%, #c8a55c 0, transparent 26%), radial-gradient(circle at 90% 80%, #c8a55c 0, transparent 20%)" }} />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-4 py-2 text-sm font-semibold text-brand-yellow">
              <ShieldCheck className="h-4 w-4" /> CCG review request
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl" style={{ fontFamily: "var(--font-heading)" }}>
              Need another trade?
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
              Choose the right path for your project. CCG handles concreting directly. Other trade requests are reviewed separately and are not a booking or guaranteed provider match.
            </p>
          </div>
        </section>

        <section className="px-4 py-10 md:py-16">
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
            <article className="flex min-h-72 flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-9">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow/20">
                <Building2 className="h-7 w-7 text-brand-gold" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-gold">Handled directly by CCG</p>
              <h2 className="mt-3 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Concreting quote</h2>
              <p className="mt-4 flex-1 leading-relaxed text-slate-600">For driveways, slabs, paths, patios, pool surrounds, concrete steps and retaining walls, continue to CCG's detailed five-step quote.</p>
              <Button asChild className="mt-7 min-h-12 w-full bg-brand-yellow text-base font-bold text-brand-charcoal hover:bg-brand-yellow/90">
                <Link href="/get-quote">Start detailed quote <ArrowRight /></Link>
              </Button>
            </article>

            <article className="flex min-h-72 flex-col rounded-3xl border border-brand-gold/40 bg-[#181b1d] p-7 text-white shadow-xl md:p-9">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/20">
                <Wrench className="h-7 w-7 text-brand-yellow" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-yellow">Separate review pathway</p>
              <h2 className="mt-3 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Another trade request</h2>
              <p className="mt-4 flex-1 leading-relaxed text-slate-300">Tell CCG what you need. We will review the request first; no provider, availability, price or response is guaranteed.</p>
              <Button type="button" onClick={() => setFormExpanded(true)} className="mt-7 min-h-12 w-full bg-white text-base font-bold text-brand-charcoal hover:bg-slate-100" aria-expanded={formExpanded} aria-controls="other-trade-form">
                Tell us about the work <ArrowRight />
              </Button>
            </article>
          </div>
        </section>

        {formExpanded && (
          <section id="other-trade-form" className="scroll-mt-24 px-4 pb-20">
            <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
              {submitted ? (
                <div role="status" className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
                  <h2 className="mt-5 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Request received for CCG review</h2>
                  <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-600">We will review the details you provided. If CCG identifies a suitable independent provider, CCG may share your request in line with the consent you gave. A provider or response is not guaranteed.</p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <div className="flex items-center gap-3 text-brand-gold"><HardHat className="h-5 w-5" /><span className="text-sm font-bold uppercase tracking-[0.15em]">For CCG review</span></div>
                    <h2 className="mt-3 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Describe your other-trade request</h2>
                    <p className="mt-3 leading-relaxed text-slate-600">Required fields are marked. Optional photos remain private and are initially available to CCG only.</p>
                  </div>

                  <form noValidate onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <Label htmlFor="other-name">Name *</Label>
                        <Input id="other-name" ref={node => { fieldRefs.current.name = node; }} value={form.name} onChange={event => update("name", event.target.value)} maxLength={OTHER_TRADE_LIMITS.nameMax} autoComplete="name" className={fieldClass} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? fieldErrorId("name") : undefined} />
                        {errors.name && <p id={fieldErrorId("name")} role="alert" className="mt-2 text-sm text-red-700">{errors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="other-mobile">Australian mobile *</Label>
                        <Input id="other-mobile" ref={node => { fieldRefs.current.mobile = node; }} value={form.mobile} onChange={event => update("mobile", event.target.value)} maxLength={OTHER_TRADE_LIMITS.mobileMax} autoComplete="tel" inputMode="tel" placeholder="04xx xxx xxx" className={fieldClass} aria-invalid={Boolean(errors.mobile)} aria-describedby={errors.mobile ? fieldErrorId("mobile") : undefined} />
                        {errors.mobile && <p id={fieldErrorId("mobile")} role="alert" className="mt-2 text-sm text-red-700">{errors.mobile}</p>}
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <Label htmlFor="other-email">Email *</Label>
                        <Input id="other-email" ref={node => { fieldRefs.current.email = node; }} value={form.email} onChange={event => update("email", event.target.value)} maxLength={OTHER_TRADE_LIMITS.emailMax} type="email" autoComplete="email" className={fieldClass} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? fieldErrorId("email") : undefined} />
                        {errors.email && <p id={fieldErrorId("email")} role="alert" className="mt-2 text-sm text-red-700">{errors.email}</p>}
                      </div>
                      <div>
                        <Label htmlFor="other-location">Suburb or postcode *</Label>
                        <Input id="other-location" ref={node => { fieldRefs.current.location = node; }} value={form.location} onChange={event => update("location", event.target.value)} maxLength={OTHER_TRADE_LIMITS.locationMax} autoComplete="postal-code" placeholder="e.g. Camp Hill 4152" className={fieldClass} aria-invalid={Boolean(errors.location)} aria-describedby={errors.location ? fieldErrorId("location") : undefined} />
                        {errors.location && <p id={fieldErrorId("location")} role="alert" className="mt-2 text-sm text-red-700">{errors.location}</p>}
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <Label htmlFor="other-trade">Trade *</Label>
                        <select id="other-trade" ref={node => { fieldRefs.current.trade = node; }} value={form.trade} onChange={event => update("trade", event.target.value as OtherTradeCategory)} className={`${fieldClass} w-full`} aria-invalid={Boolean(errors.trade)} aria-describedby={errors.trade ? fieldErrorId("trade") : undefined}>
                          <option value="">Select a trade</option>
                          {OTHER_TRADE_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                        </select>
                        {errors.trade && <p id={fieldErrorId("trade")} role="alert" className="mt-2 text-sm text-red-700">{errors.trade}</p>}
                      </div>
                      <div>
                        <Label htmlFor="other-timeframe">Timeframe *</Label>
                        <select id="other-timeframe" ref={node => { fieldRefs.current.timeframe = node; }} value={form.timeframe} onChange={event => update("timeframe", event.target.value as OtherTradeTimeframe)} className={`${fieldClass} w-full`} aria-invalid={Boolean(errors.timeframe)} aria-describedby={errors.timeframe ? fieldErrorId("timeframe") : "urgent-notice"}>
                          <option value="">Select a timeframe</option>
                          {OTHER_TRADE_TIMEFRAMES.map(timeframe => <option key={timeframe} value={timeframe}>{timeframe}</option>)}
                        </select>
                        {errors.timeframe && <p id={fieldErrorId("timeframe")} role="alert" className="mt-2 text-sm text-red-700">{errors.timeframe}</p>}
                      </div>
                    </div>

                    {form.timeframe === "Urgent" && (
                      <div id="urgent-notice" role="note" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">This is not an emergency service and no response time is guaranteed. If there is an immediate risk to life or property, call 000 or contact an appropriately licensed emergency provider.</div>
                    )}

                    <div>
                      <Label htmlFor="other-description">Job description *</Label>
                      <Textarea id="other-description" ref={node => { fieldRefs.current.description = node; }} value={form.description} onChange={event => update("description", event.target.value)} maxLength={OTHER_TRADE_LIMITS.descriptionMax} rows={6} placeholder="Describe the work, site conditions and what you need help with." className="mt-2 min-h-36 rounded-xl border-slate-300 bg-white p-4 text-base focus-visible:ring-brand-gold" aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? fieldErrorId("description") : "description-help"} />
                      <div className="mt-2 flex justify-between gap-4 text-sm text-slate-500"><span id="description-help">Minimum 20 characters.</span><span>{form.description.length}/{OTHER_TRADE_LIMITS.descriptionMax}</span></div>
                      {errors.description && <p id={fieldErrorId("description")} role="alert" className="mt-2 text-sm text-red-700">{errors.description}</p>}
                    </div>

                    <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <legend className="px-2 font-semibold">Optional private photos</legend>
                      <p className="mb-4 text-sm leading-relaxed text-slate-600">JPEG, PNG, WebP or HEIC, up to 10 MB each. A failed photo can be removed so you can continue with a photo-free request.</p>
                      <label className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 font-semibold hover:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold">
                        <Upload className="h-5 w-5" /> Add photos
                        <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={handlePhotoSelect} />
                      </label>
                      {photos.length > 0 && <ul className="mt-4 space-y-3">{photos.map(photo => (
                        <li key={photo.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border bg-white p-3">
                          <div className="min-w-0"><p className="truncate text-sm font-semibold">{photo.fileName}</p><p className={`text-xs ${photo.status === "error" ? "text-red-700" : "text-slate-500"}`}>{photo.status === "uploading" ? "Uploading privately…" : photo.status === "uploaded" ? "Ready" : photo.error}</p></div>
                          <button type="button" onClick={() => removePhoto(photo.id)} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Remove photo</button>
                        </li>
                      ))}</ul>}
                    </fieldset>

                    <div className="hidden" aria-hidden="true">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} />
                    </div>

                    <div className={`rounded-2xl border p-5 ${errors.consent ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox id="provider-consent" ref={node => { fieldRefs.current.consent = node; }} defaultChecked={false} checked={form.consent} onCheckedChange={checked => update("consent", checked === true)} className="mt-1 size-6" aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? fieldErrorId("consent") : "consent-version"} />
                        <Label htmlFor="provider-consent" className="cursor-pointer text-sm font-normal leading-relaxed text-slate-700">{OTHER_TRADE_CONSENT_TEXT}</Label>
                      </div>
                      <p id="consent-version" className="mt-3 pl-9 text-xs text-slate-500">Consent version: {OTHER_TRADE_CONSENT_VERSION}</p>
                      {errors.consent && <p id={fieldErrorId("consent")} role="alert" className="mt-2 pl-9 text-sm text-red-700">{errors.consent}</p>}
                    </div>

                    {submitError && (
                      <div id="other-form-error" role="alert" tabIndex={-1} className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-950">
                        <p className="font-semibold">Request not confirmed</p>
                        <p className="mt-1 text-sm leading-relaxed">{submitError}</p>
                        <p className="mt-2 text-sm">You can retry without losing the details above, or call 0424 463 268.</p>
                        <a className="mt-2 inline-flex min-h-11 items-center font-bold underline" href="tel:0424463268" onClick={() => trackPhoneCallClick()}><Phone className="mr-2 h-4 w-4" /> Call CCG</a>
                      </div>
                    )}

                    <Button type="submit" disabled={submitting} className="min-h-14 w-full bg-brand-yellow text-base font-bold text-brand-charcoal hover:bg-brand-yellow/90">
                      {submitting ? <><Loader2 className="animate-spin" /> Sending for CCG review…</> : <>Send request for CCG review <ArrowRight /></>}
                    </Button>
                    <p className="text-center text-sm text-slate-500">No provider receives this request automatically. Need help? <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="inline-flex items-center gap-1 font-semibold text-brand-charcoal underline"><Phone className="h-4 w-4" /> 0424 463 268</a></p>
                  </form>
                </>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
