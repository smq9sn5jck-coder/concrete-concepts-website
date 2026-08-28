import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ImagePlus,
  Loader2,
  MapPin,
  Ruler,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { submitFormFallback } from "@/lib/formFallback";
import {
  clearQuoteDraft,
  loadQuoteDraft,
  saveQuoteDraft,
  type QuoteDraftData,
} from "@/lib/quoteDraft";
import { useLeadSource } from "@/hooks/useLeadSource";
import { trackPhoneCallClick, trackQuoteConversion, trackRemarketingEvent } from "@/components/ConversionTracking";
import {
  createQuoteFunnelTracker,
  deriveQuoteTrafficClass,
} from "@/lib/quoteFunnelAnalytics";
import {
  comprehensiveQuoteSchema,
  toLegacyQuoteFields,
  type ComprehensiveQuote,
} from "@shared/quoteBrief";
import { classifyServiceArea, validateAustralianPhone } from "@shared/leadValidation";

const STEPS = [
  { title: "Contact", icon: UserRound },
  { title: "Location", icon: MapPin },
  { title: "Job brief", icon: Building2 },
  { title: "Measure & photos", icon: Camera },
  { title: "Review", icon: ClipboardCheck },
] as const;

const STEP_EVENT_NAMES = [
  "contact",
  "location",
  "job_brief",
  "measure_photos",
  "review",
] as const;

const SERVICES = [
  ["driveway", "Driveway"],
  ["slab", "Concrete slab"],
  ["patio", "Patio / entertaining"],
  ["pool-surround", "Pool surround"],
  ["retaining-wall", "Retaining wall"],
  ["pathway", "Pathway / footpath"],
  ["exposed-aggregate", "Exposed aggregate"],
  ["stairs", "Stairs / steps"],
  ["excavation", "Excavation"],
  ["crossover", "Crossover"],
  ["commercial", "Commercial"],
  ["other", "Other"],
] as const;

const FINISHES = [
  ["plain", "Plain concrete"],
  ["coloured", "Coloured concrete"],
  ["exposed", "Exposed aggregate"],
  ["stencilled", "Stencilled / stamped"],
  ["not_sure", "Not sure — advise me"],
] as const;

const TIMEFRAMES = [
  ["asap", "ASAP — ready to go"],
  ["within_1_month", "Within one month"],
  ["one_to_three_months", "One to three months"],
  ["three_plus_months", "Three or more months"],
  ["planning", "Planning only"],
] as const;

const initialData: QuoteDraftData = {
  name: "",
  mobile: "",
  email: "",
  preferredContact: "sms",
  company: "",
  streetAddress: "",
  suburb: "",
  postcode: "",
  services: [],
  workType: "not_sure",
  finish: "not_sure",
  timeframe: "planning",
  description: "",
  measurementMode: "not_sure",
  lengthM: "",
  widthM: "",
  totalAreaM2: "",
  separateAreaNotes: "",
  accessWidthM: "",
  vehicleAccess: "not_sure",
  slope: "not_sure",
  drainage: "not_sure",
  pumpAccess: "not_sure",
  knownServices: "",
  approvalStatus: "not_sure",
  specialRequirements: "",
  contactConsent: false,
  privacyConsent: false,
  marketingConsent: false,
};

type PhotoStatus = "uploading" | "uploaded" | "error";

interface QuotePhoto {
  id: string;
  file: File;
  preview: string;
  status: PhotoStatus;
  url?: string;
  error?: string;
}

interface ValidationIssue {
  code: string;
  message: string;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/25";
const labelClass = "mb-2 block text-sm font-bold text-slate-800";

function optionalNumber(value?: string) {
  if (!value?.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function optionLabel(options: readonly (readonly [string, string])[], value?: string) {
  return options.find(([id]) => id === value)?.[1] ?? "Not provided";
}

function splitLocation(value?: string) {
  const trimmed = value?.trim() ?? "";
  const match = trimmed.match(/^(.*?)(?:\s+)?(\d{4})$/);
  return match ? { suburb: match[1].trim(), postcode: match[2] } : { suburb: trimmed, postcode: "" };
}

function FieldError({ children }: { children?: string }) {
  return children ? <p className="mt-1.5 text-sm font-medium text-red-600">{children}</p> : null;
}

export default function ComprehensiveQuoteWizard() {
  const leadSource = useLeadSource();
  const trackerRef = useRef(createQuoteFunnelTracker());
  const tracker = trackerRef.current;
  const trafficClass = useMemo(
    () => deriveQuoteTrafficClass(leadSource.leadSource),
    [leadSource.leadSource]
  );
  const formStartedAt = useRef(Date.now());
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuoteDraftData>(initialData);
  const [photos, setPhotos] = useState<QuotePhoto[]>([]);
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [fallbackSubmitting, setFallbackSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = loadQuoteDraft();
    if (!saved) return;
    const location = splitLocation(saved.suburb);
    setData((current) => ({
      ...current,
      ...saved,
      suburb: saved.postcode ? saved.suburb : location.suburb,
      postcode: saved.postcode || location.postcode,
    }));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => saveQuoteDraft(data), 250);
    return () => window.clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    trackRemarketingEvent({ pageCategory: "contact", serviceType: "comprehensive_quote" });
  }, []);

  useEffect(() => {
    tracker.pageView(trafficClass);
  }, [tracker, trafficClass]);

  useEffect(() => {
    tracker.stepReached(step, STEP_EVENT_NAMES[step - 1], trafficClass);
  }, [step, tracker, trafficClass]);

  useEffect(() => () => photos.forEach((photo) => URL.revokeObjectURL(photo.preview)), [photos]);

  const update = <K extends keyof QuoteDraftData>(key: K, value: QuoteDraftData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    setFieldError("");
  };

  const toggleService = (service: string) => {
    const selected = data.services ?? [];
    update("services", selected.includes(service) ? selected.filter((item) => item !== service) : [...selected, service]);
  };

  const serviceArea = useMemo(
    () => classifyServiceArea(`${data.suburb ?? ""} ${data.postcode ?? ""}`.trim()),
    [data.suburb, data.postcode]
  );

  const validateStep = (targetStep = step): ValidationIssue | null => {
    if (targetStep === 1) {
      if ((data.name?.trim().length ?? 0) < 2) {
        return { code: "name_missing", message: "Enter your full name." };
      }
      const phone = validateAustralianPhone(data.mobile ?? "");
      if (!phone.valid || phone.kind !== "mobile") {
        return { code: "mobile_invalid", message: "Enter an Australian mobile number beginning with 04." };
      }
      if (!/^\S+@\S+\.\S+$/.test(data.email ?? "")) {
        return { code: "email_invalid", message: "Enter a valid email address." };
      }
    }
    if (targetStep === 2) {
      if ((data.suburb?.trim().length ?? 0) < 2) {
        return { code: "suburb_missing", message: "Enter the project suburb." };
      }
      if (!/^\d{4}$/.test(data.postcode ?? "")) {
        return { code: "postcode_invalid", message: "Enter the four-digit project postcode." };
      }
      if (!serviceArea.canSubmit) {
        return { code: "outside_service_area", message: serviceArea.message };
      }
    }
    if (targetStep === 3) {
      if (!(data.services?.length)) {
        return { code: "service_missing", message: "Select at least one concrete service." };
      }
      if (!data.workType) {
        return { code: "work_type_missing", message: "Select whether this is new, replacement, extension or repair work." };
      }
      if (!data.finish) {
        return { code: "finish_missing", message: "Select a preferred finish or choose Not sure." };
      }
      if (!data.timeframe) {
        return { code: "timeframe_missing", message: "Select an expected timeframe." };
      }
      if ((data.description?.trim().length ?? 0) < 20) {
        return { code: "description_short", message: "Add a useful job description of at least 20 characters." };
      }
    }
    if (targetStep === 4) {
      if (data.measurementMode === "dimensions" && (!optionalNumber(data.lengthM) || !optionalNumber(data.widthM))) {
        return { code: "dimensions_incomplete", message: "Enter both length and width, or choose Not sure." };
      }
      if (data.measurementMode === "area" && !optionalNumber(data.totalAreaM2)) {
        return { code: "area_missing", message: "Enter the approximate total square metres, or choose Not sure." };
      }
    }
    if (targetStep === 5) {
      if (!data.contactConsent || !data.privacyConsent) {
        return { code: "consent_missing", message: "Accept the contact and privacy statements to submit." };
      }
    }
    return null;
  };

  const goNext = () => {
    const issue = validateStep();
    if (issue) {
      tracker.validationBlocked(step, issue.code, trafficClass);
      setFieldError(issue.message);
      toast.error(issue.message);
      return;
    }
    setFieldError("");
    setStep((current) => Math.min(5, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadPhoto = async (photo: QuotePhoto) => {
    setPhotos((current) => current.map((item) => (item.id === photo.id ? { ...item, status: "uploading", error: undefined } : item)));
    try {
      const buffer = await photo.file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(index, index + 0x8000)));
      }
      const response = await fetch("/api/upload-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: btoa(binary),
          contentType: photo.file.type || "image/jpeg",
          fileName: photo.file.name,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.url !== "string") throw new Error(result.error || "Upload failed");
      setPhotos((current) => current.map((item) => (item.id === photo.id ? { ...item, status: "uploaded", url: result.url } : item)));
    } catch (error) {
      setPhotos((current) => current.map((item) => (item.id === photo.id ? { ...item, status: "error", error: error instanceof Error ? error.message : "Upload failed" } : item)));
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
    const selected = Array.from(event.target.files ?? []);
    const remaining = Math.max(0, 8 - photos.length);
    const nextPhotos: QuotePhoto[] = [];

    for (const file of selected.slice(0, remaining)) {
      if (!acceptedTypes.has(file.type)) {
        toast.error(`${file.name} is not a supported image.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10 MB.`);
        continue;
      }
      nextPhotos.push({
        id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        status: "uploading",
      });
    }

    setPhotos((current) => [...current, ...nextPhotos]);
    nextPhotos.forEach((photo) => void uploadPhoto(photo));
    if (event.target) event.target.value = "";
  };

  const removePhoto = (id: string) => {
    setPhotos((current) => {
      const match = current.find((photo) => photo.id === id);
      if (match) URL.revokeObjectURL(match.preview);
      return current.filter((photo) => photo.id !== id);
    });
  };

  const createJobBrief = (): ComprehensiveQuote | null => {
    const raw = {
      version: 1,
      contact: {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        preferredContact: data.preferredContact,
        company: data.company,
      },
      location: {
        streetAddress: data.streetAddress,
        suburb: data.suburb,
        postcode: data.postcode,
      },
      scope: {
        services: data.services,
        workType: data.workType,
        finish: data.finish,
        timeframe: data.timeframe,
        description: data.description,
      },
      measurements: {
        mode: data.measurementMode,
        lengthM: optionalNumber(data.lengthM),
        widthM: optionalNumber(data.widthM),
        totalAreaM2: optionalNumber(data.totalAreaM2),
        separateAreaNotes: data.separateAreaNotes,
      },
      siteConditions: {
        existingConcreteRemoval: data.existingConcreteRemoval,
        accessWidthM: optionalNumber(data.accessWidthM),
        vehicleAccess: data.vehicleAccess || undefined,
        slope: data.slope || undefined,
        drainage: data.drainage || undefined,
        pumpAccess: data.pumpAccess || undefined,
        knownServices: data.knownServices,
        approvalStatus: data.approvalStatus || undefined,
        specialRequirements: data.specialRequirements,
      },
      photos: photos
        .filter((photo): photo is QuotePhoto & { url: string } => photo.status === "uploaded" && Boolean(photo.url))
        .map((photo) => ({ url: photo.url, fileName: photo.file.name, contentType: photo.file.type })),
      consents: {
        contact: data.contactConsent,
        privacy: data.privacyConsent,
        marketing: data.marketingConsent ?? false,
      },
    };
    const parsed = comprehensiveQuoteSchema.safeParse(raw);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Check the form and try again.";
      tracker.validationBlocked(step, "quote_schema_invalid", trafficClass);
      setFieldError(message);
      toast.error(message);
      return null;
    }
    return parsed.data;
  };

  const submitQuote = trpc.quote.submit.useMutation({
    onSuccess: () => {
      clearQuoteDraft();
      tracker.submitConfirmed("primary", trafficClass);
      trackQuoteConversion({ email: data.email, phone: data.mobile, name: data.name });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: async (error) => {
      if (error.data?.code === "BAD_REQUEST" || error.data?.code === "TOO_MANY_REQUESTS") {
        tracker.submitFailed("primary_rejected", trafficClass);
        toast.error(error.message);
        return;
      }
      const jobBrief = createJobBrief();
      if (!jobBrief) return;
      const legacy = toLegacyQuoteFields(jobBrief);
      setFallbackSubmitting(true);
      try {
        const result = await submitFormFallback({
          ...legacy,
          source: leadSource.leadSource || "comprehensive-quote",
          website,
          formStartedAt: formStartedAt.current,
          jobBrief,
        });
        if (!result.success) throw new Error(result.error || "Fallback delivery failed");
        clearQuoteDraft();
        tracker.submitConfirmed("fallback", trafficClass);
        trackQuoteConversion({ email: data.email, phone: data.mobile, name: data.name });
        setSubmitted(true);
      } catch {
        tracker.submitFailed("primary_and_fallback", trafficClass);
        toast.error("Your draft is saved. Please retry or call 0424 463 268.");
      } finally {
        setFallbackSubmitting(false);
      }
    },
  });

  const handleSubmit = () => {
    const issue = validateStep(5);
    if (issue) {
      tracker.validationBlocked(5, issue.code, trafficClass);
      setFieldError(issue.message);
      toast.error(issue.message);
      return;
    }
    if (photos.some((photo) => photo.status === "uploading")) {
      tracker.validationBlocked(5, "photo_upload_pending", trafficClass);
      toast.info("Please wait for the selected photos to finish uploading.");
      return;
    }
    const jobBrief = createJobBrief();
    if (!jobBrief) return;
    const legacy = toLegacyQuoteFields(jobBrief);
    tracker.submitStarted(
      trafficClass,
      photos.some((photo) => photo.status === "uploaded") ? "present" : "absent"
    );
    submitQuote.mutate({
      ...legacy,
      jobBrief,
      website,
      formStartedAt: formStartedAt.current,
      leadSource: leadSource.leadSource || "comprehensive-quote",
      utmSource: leadSource.utmSource || undefined,
      utmMedium: leadSource.utmMedium || undefined,
      utmCampaign: leadSource.utmCampaign || undefined,
      utmTerm: leadSource.utmTerm || undefined,
      utmContent: leadSource.utmContent || undefined,
      gclid: leadSource.gclid || undefined,
      fbclid: leadSource.fbclid || undefined,
      referrer: leadSource.referrer || undefined,
      landingPage: leadSource.landingPage || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl md:p-12">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-11 w-11 text-emerald-600" />
        </div>
        <h2 className="mb-3 text-3xl font-bold text-slate-950">Your complete quote request is in</h2>
        <p className="text-lg text-slate-600">
          Thanks {data.name?.split(" ")[0]}. We received your job details and will contact you using your preferred method.
        </p>
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left text-sm text-slate-700">
          <p className="font-bold text-slate-950">What happens next</p>
          <p className="mt-2">We review the measurements, access notes and photos, confirm whether a site visit is required, then contact you to discuss the quote.</p>
        </div>
        <a
          href="tel:0424463268"
          onClick={() => trackPhoneCallClick()}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-charcoal px-6 py-3 font-bold text-brand-yellow transition hover:bg-slate-800"
        >
          Need help sooner? Call 0424 463 268
        </a>
      </div>
    );
  }

  const isSubmitting = submitQuote.isPending || fallbackSubmitting;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="sticky top-0 z-20 mb-6 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur md:p-4">
        <div className="grid grid-cols-5 gap-1.5 md:gap-3">
          {STEPS.map(({ title, icon: Icon }, index) => {
            const number = index + 1;
            const active = step === number;
            const complete = step > number;
            return (
              <button
                key={title}
                type="button"
                onClick={() => complete && setStep(number)}
                className={`rounded-xl px-1 py-2 text-center transition md:px-3 ${active ? "bg-brand-charcoal text-white" : complete ? "bg-brand-yellow/20 text-slate-900" : "text-slate-400"}`}
              >
                <span className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full border border-current md:h-8 md:w-8">
                  {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span className="hidden text-xs font-bold sm:block">{title}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand-yellow transition-all" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:p-9">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
            {step === 1 && (
              <section>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-yellow">Step 1 of 5</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">How can we reach you?</h2>
                <p className="mt-2 text-slate-600">We use these details only to assess and respond to your quote request.</p>
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <label><span className={labelClass}>Full name *</span><input className={inputClass} autoComplete="name" value={data.name} onChange={(event) => update("name", event.target.value)} /></label>
                  <label><span className={labelClass}>Australian mobile *</span><input className={inputClass} type="tel" autoComplete="tel" placeholder="04xx xxx xxx" value={data.mobile} onChange={(event) => update("mobile", event.target.value)} /></label>
                  <label><span className={labelClass}>Email *</span><input className={inputClass} type="email" autoComplete="email" value={data.email} onChange={(event) => update("email", event.target.value)} /></label>
                  <label><span className={labelClass}>Company <span className="font-normal text-slate-400">(optional)</span></span><input className={inputClass} autoComplete="organization" value={data.company} onChange={(event) => update("company", event.target.value)} /></label>
                </div>
                <div className="mt-5">
                  <span className={labelClass}>Preferred contact method *</span>
                  <div className="grid grid-cols-3 gap-2">
                    {([['sms', 'SMS'], ['phone', 'Phone call'], ['email', 'Email']] as const).map(([value, text]) => (
                      <button key={value} type="button" onClick={() => update("preferredContact", value)} className={`rounded-xl border-2 px-3 py-3 text-sm font-bold ${data.preferredContact === value ? "border-brand-yellow bg-brand-yellow/10" : "border-slate-200"}`}>{text}</button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-yellow">Step 2 of 5</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">Where is the project?</h2>
                <p className="mt-2 text-slate-600">The street address is optional. Suburb and postcode help us confirm travel and availability.</p>
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <label className="md:col-span-2"><span className={labelClass}>Street address <span className="font-normal text-slate-400">(optional)</span></span><input className={inputClass} autoComplete="street-address" value={data.streetAddress} onChange={(event) => update("streetAddress", event.target.value)} /></label>
                  <label><span className={labelClass}>Suburb *</span><input className={inputClass} autoComplete="address-level2" placeholder="Camp Hill" value={data.suburb} onChange={(event) => update("suburb", event.target.value)} /></label>
                  <label><span className={labelClass}>Postcode *</span><input className={inputClass} inputMode="numeric" autoComplete="postal-code" maxLength={4} placeholder="4152" value={data.postcode} onChange={(event) => update("postcode", event.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
                </div>
                {data.suburb && data.postcode && serviceArea.status === "service_area_review" && (
                  <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">You can continue. We’ll review availability for this Queensland location rather than rejecting your enquiry.</div>
                )}
              </section>
            )}

            {step === 3 && (
              <section>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-yellow">Step 3 of 5</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">Tell us about the job</h2>
                <p className="mt-2 text-slate-600">Select everything that applies. “Not sure” is always acceptable.</p>
                <div className="mt-7">
                  <span className={labelClass}>Concrete services *</span>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {SERVICES.map(([value, text]) => {
                      const selected = data.services?.includes(value);
                      return <button key={value} type="button" onClick={() => toggleService(value)} className={`rounded-xl border-2 p-3 text-left text-sm font-bold ${selected ? "border-brand-yellow bg-brand-yellow/10" : "border-slate-200"}`}>{selected && <Check className="mr-1 inline h-4 w-4 text-brand-yellow" />}{text}</button>;
                    })}
                  </div>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <label><span className={labelClass}>Type of work *</span><select className={inputClass} value={data.workType} onChange={(event) => update("workType", event.target.value)}><option value="new">New work</option><option value="replacement">Remove and replace</option><option value="extension">Extension</option><option value="repair">Repair</option><option value="not_sure">Not sure</option></select></label>
                  <label><span className={labelClass}>Preferred finish *</span><select className={inputClass} value={data.finish} onChange={(event) => update("finish", event.target.value)}>{FINISHES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
                  <label><span className={labelClass}>Timeframe *</span><select className={inputClass} value={data.timeframe} onChange={(event) => update("timeframe", event.target.value)}>{TIMEFRAMES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
                  <label><span className={labelClass}>Existing concrete removal</span><select className={inputClass} value={data.existingConcreteRemoval === undefined ? "unknown" : data.existingConcreteRemoval ? "yes" : "no"} onChange={(event) => update("existingConcreteRemoval", event.target.value === "unknown" ? undefined : event.target.value === "yes")}><option value="unknown">Not sure</option><option value="yes">Yes</option><option value="no">No</option></select></label>
                </div>
                <label className="mt-5 block"><span className={labelClass}>Describe the project *</span><textarea className={`${inputClass} min-h-32 resize-y`} placeholder="What needs to be built or replaced? Include approximate size, finish, obstacles and anything important." value={data.description} onChange={(event) => update("description", event.target.value)} /></label>
              </section>
            )}

            {step === 4 && (
              <section>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-yellow">Step 4 of 5</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">Measurements, access and photos</h2>
                <p className="mt-2 text-slate-600">Estimates are helpful, but you can choose “Not sure” and we’ll measure on site.</p>
                <div className="mt-7">
                  <span className={labelClass}>Measurements *</span>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {([['dimensions', 'Length × width'], ['area', 'Total m²'], ['not_sure', 'Not sure — measure on site']] as const).map(([value, text]) => <button key={value} type="button" onClick={() => update("measurementMode", value)} className={`rounded-xl border-2 px-3 py-3 text-sm font-bold ${data.measurementMode === value ? "border-brand-yellow bg-brand-yellow/10" : "border-slate-200"}`}>{text}</button>)}
                  </div>
                </div>
                {data.measurementMode === "dimensions" && <div className="mt-5 grid grid-cols-2 gap-3"><label><span className={labelClass}>Length (m) *</span><input className={inputClass} inputMode="decimal" value={data.lengthM} onChange={(event) => update("lengthM", event.target.value)} /></label><label><span className={labelClass}>Width (m) *</span><input className={inputClass} inputMode="decimal" value={data.widthM} onChange={(event) => update("widthM", event.target.value)} /></label></div>}
                {data.measurementMode === "area" && <label className="mt-5 block"><span className={labelClass}>Approximate total area (m²) *</span><input className={inputClass} inputMode="decimal" value={data.totalAreaM2} onChange={(event) => update("totalAreaM2", event.target.value)} /></label>}
                <label className="mt-5 block"><span className={labelClass}>Separate areas or measurement notes <span className="font-normal text-slate-400">(optional)</span></span><textarea className={`${inputClass} min-h-24 resize-y`} value={data.separateAreaNotes} onChange={(event) => update("separateAreaNotes", event.target.value)} /></label>

                <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-950">Site access and conditions</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label><span className={labelClass}>Narrowest access width (m)</span><input className={inputClass} inputMode="decimal" placeholder="e.g. 2.4" value={data.accessWidthM} onChange={(event) => update("accessWidthM", event.target.value)} /></label>
                    <label><span className={labelClass}>Vehicle access</span><select className={inputClass} value={data.vehicleAccess} onChange={(event) => update("vehicleAccess", event.target.value)}><option value="not_sure">Not sure</option><option value="easy">Easy vehicle access</option><option value="restricted">Restricted access</option><option value="no_vehicle">No vehicle access</option></select></label>
                    <label><span className={labelClass}>Slope</span><select className={inputClass} value={data.slope} onChange={(event) => update("slope", event.target.value)}><option value="not_sure">Not sure</option><option value="flat">Flat</option><option value="slight">Slight slope</option><option value="steep">Steep slope</option></select></label>
                    <label><span className={labelClass}>Drainage</span><select className={inputClass} value={data.drainage} onChange={(event) => update("drainage", event.target.value)}><option value="not_sure">Not sure</option><option value="none_known">No known drainage</option><option value="existing_drain">Existing drain</option><option value="new_drainage_needed">New drainage may be needed</option></select></label>
                    <label><span className={labelClass}>Concrete placement access</span><select className={inputClass} value={data.pumpAccess} onChange={(event) => update("pumpAccess", event.target.value)}><option value="not_sure">Not sure</option><option value="direct_truck">Direct truck access</option><option value="pump_likely">Pump likely required</option></select></label>
                    <label><span className={labelClass}>Approvals</span><select className={inputClass} value={data.approvalStatus} onChange={(event) => update("approvalStatus", event.target.value)}><option value="not_sure">Not sure</option><option value="approved">Approved</option><option value="not_required">Not required</option><option value="not_started">Not started</option></select></label>
                  </div>
                  <label className="mt-4 block"><span className={labelClass}>Known underground services</span><input className={inputClass} placeholder="Water, gas, electrical or NBN near the work area" value={data.knownServices} onChange={(event) => update("knownServices", event.target.value)} /></label>
                  <label className="mt-4 block"><span className={labelClass}>Other access or site requirements</span><textarea className={`${inputClass} min-h-24 resize-y`} value={data.specialRequirements} onChange={(event) => update("specialRequirements", event.target.value)} /></label>
                </div>

                <div className="mt-7 rounded-2xl border-2 border-dashed border-slate-300 p-5">
                  <div className="flex items-start gap-3"><ImagePlus className="mt-0.5 h-6 w-6 text-brand-yellow" /><div><h3 className="font-bold text-slate-950">Site photos <span className="font-normal text-slate-400">(optional)</span></h3><p className="mt-1 text-sm text-slate-600">Useful photos show the whole area, street access, slope/drainage, existing concrete and obstacles.</p></div></div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {photos.map((photo) => <div key={photo.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"><img src={photo.preview} alt={photo.file.name} className="h-28 w-full object-cover" /><div className="p-2 text-xs"><p className="truncate font-medium">{photo.file.name}</p><p className={photo.status === "error" ? "text-red-600" : photo.status === "uploaded" ? "text-emerald-600" : "text-slate-500"}>{photo.status === "uploading" ? "Uploading…" : photo.status === "uploaded" ? "Uploaded" : "Upload failed"}</p>{photo.status === "error" && <button type="button" onClick={() => void uploadPhoto(photo)} className="mt-1 font-bold text-brand-yellow">Retry</button>}</div><button type="button" aria-label={`Remove ${photo.file.name}`} onClick={() => removePhoto(photo.id)} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
                  </div>
                  {photos.length < 8 && <Button type="button" variant="outline" className="mt-4 w-full border-brand-yellow text-slate-900" onClick={() => fileInputRef.current?.click()}><UploadCloud className="mr-2 h-4 w-4" />Add photos ({8 - photos.length} remaining)</Button>}
                  <input ref={fileInputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={handlePhotoSelect} />
                  {photos.some((photo) => photo.status === "error") && <p className="mt-3 text-sm text-amber-800">You can retry failed photos or continue without them. Failed files will not be listed as attached.</p>}
                </div>
              </section>
            )}

            {step === 5 && (
              <section>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-yellow">Step 5 of 5</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">Review your quote request</h2>
                <p className="mt-2 text-slate-600">Check the details below before sending them to Concrete Concepts Group.</p>
                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  <ReviewCard title="Contact" onEdit={() => setStep(1)} lines={[data.name || "", data.mobile || "", data.email || "", `Preferred: ${data.preferredContact || "Not provided"}`]} />
                  <ReviewCard title="Job location" onEdit={() => setStep(2)} lines={[data.streetAddress || "Street address not provided", `${data.suburb} QLD ${data.postcode}`]} />
                  <ReviewCard title="Job scope" onEdit={() => setStep(3)} lines={[(data.services ?? []).map((service) => optionLabel(SERVICES, service)).join(", "), optionLabel(FINISHES, data.finish), optionLabel(TIMEFRAMES, data.timeframe), data.description || ""]} />
                  <ReviewCard title="Measurements & site" onEdit={() => setStep(4)} lines={[data.measurementMode === "not_sure" ? "Measure on site" : data.measurementMode === "area" ? `${data.totalAreaM2} m² approximate` : `${data.lengthM} m × ${data.widthM} m`, `${photos.filter((photo) => photo.status === "uploaded").length} photos attached`]} />
                </div>
                <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5">
                  <label className="flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" className="mt-1 h-4 w-4 accent-brand-yellow" checked={Boolean(data.contactConsent)} onChange={(event) => update("contactConsent", event.target.checked)} /><span>I agree that Concrete Concepts Group may contact me about this quote request. *</span></label>
                  <label className="flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" className="mt-1 h-4 w-4 accent-brand-yellow" checked={Boolean(data.privacyConsent)} onChange={(event) => update("privacyConsent", event.target.checked)} /><span>I acknowledge that my details and uploaded photos will be used to assess this project. *</span></label>
                  <label className="flex items-start gap-3 text-sm text-slate-600"><input type="checkbox" className="mt-1 h-4 w-4 accent-brand-yellow" checked={Boolean(data.marketingConsent)} onChange={(event) => update("marketingConsent", event.target.checked)} /><span>Send me occasional project ideas and offers. Optional.</span></label>
                </div>
                <input type="text" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-10000px] h-px w-px overflow-hidden" />
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        <FieldError>{fieldError}</FieldError>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
          {step > 1 ? <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button> : <span />}
          {step < 5 ? <Button type="button" onClick={goNext} className="bg-brand-yellow font-bold text-slate-950 hover:bg-brand-yellow/90">Save & continue<ArrowRight className="ml-2 h-4 w-4" /></Button> : <Button type="button" disabled={isSubmitting} onClick={handleSubmit} className="bg-brand-yellow font-bold text-slate-950 hover:bg-brand-yellow/90">{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : <><ShieldCheck className="mr-2 h-4 w-4" />Submit quote request</>}</Button>}
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">Your answers autosave on this device. We do not count a conversion until the request is confirmed.</p>
      </div>
    </div>
  );
}

function ReviewCard({ title, lines, onEdit }: { title: string; lines: string[]; onEdit: () => void }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-950">{title}</h3><button type="button" onClick={onEdit} className="text-sm font-bold text-brand-yellow">Edit</button></div>
      <div className="mt-3 space-y-1 text-sm text-slate-600">{lines.filter(Boolean).map((line, index) => <p key={`${title}-${index}`} className="break-words">{line}</p>)}</div>
    </div>
  );
}
