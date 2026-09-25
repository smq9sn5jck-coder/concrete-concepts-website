import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  Phone,
  Ruler,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import QuoteSuccessBooking from "./QuoteSuccessBooking";
import QuoteSuccessShare from "./QuoteSuccessShare";
import { trpc } from "@/lib/trpc";
import { submitFormFallback } from "@/lib/formFallback";
import {
  applyQuoteDraftUpdate,
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

const STRUCTURAL_PROJECT_TYPES = [
  ["new_house", "New house"],
  ["extension_slab", "House extension slab"],
  ["under_house_build_under", "Under-house / build-under"],
  ["complete_extension", "Complete extension with a concrete component"],
  ["other_concrete", "Other concrete project"],
] as const;

const DOCUMENT_READINESS = [
  ["available", "Available"],
  ["in_progress", "In progress"],
  ["not_available", "Not available"],
  ["not_sure", "Not sure"],
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
  audienceType: "homeowner",
  structuralProjectType: "other_concrete",
  plansReadiness: "not_sure",
  engineeringReadiness: "not_sure",
  soilFoundationReadiness: "not_sure",
  certifierApprovalStatus: "not_sure",
  builderCompanyName: "",
  builderRole: "",
  numberOfSitesOrPours: "",
  requiredConcreteScope: "",
  indicativeProgramme: "",
  preferredFollowUp: "",
  region: "",
  landingRoute: "",
  partnerIntroductionInterest: false,
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

const PREFERRED_CONTACT_LABELS: Record<NonNullable<QuoteDraftData["preferredContact"]>, string> = {
  sms: "SMS",
  phone: "phone",
  email: "email",
};

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
  return children ? <p id="quote-field-error" role="alert" aria-live="polite" tabIndex={-1} className="mt-1.5 text-sm font-medium text-red-600">{children}</p> : null;
}

const VALIDATION_FOCUS_IDS: Record<string, string> = {
  name_missing: "quote-name",
  mobile_invalid: "quote-mobile",
  email_invalid: "quote-email",
  suburb_missing: "quote-suburb",
  postcode_invalid: "quote-postcode",
  outside_service_area: "quote-suburb",
  audience_missing: "quote-audience-homeowner",
  structural_project_missing: "quote-structural-project",
  builder_company_missing: "quote-builder-company",
  builder_address_missing: "quote-street-address",
  builder_scope_missing: "quote-builder-scope",
  service_missing: "quote-service-driveway",
  work_type_missing: "quote-work-type",
  finish_missing: "quote-finish",
  timeframe_missing: "quote-timeframe",
  description_short: "quote-description",
  complete_extension_without_slab: "quote-service-driveway",
  builder_programme_missing: "quote-builder-programme",
  dimensions_incomplete: "quote-length",
  area_missing: "quote-area",
  consent_missing: "quote-contact-consent",
};

export default function ComprehensiveQuoteWizard() {
  const leadSource = useLeadSource();
  const trackerRef = useRef(createQuoteFunnelTracker());
  const tracker = trackerRef.current;
  const trafficClass = useMemo(
    () => deriveQuoteTrafficClass(leadSource.leadSource),
    [leadSource.leadSource]
  );
  const formStartedAt = useRef(Date.now());
  const submissionId = useRef(crypto.randomUUID());
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuoteDraftData>(initialData);
  const [photos, setPhotos] = useState<QuotePhoto[]>([]);
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [bookingDeliveryToken, setBookingDeliveryToken] = useState<string | null>(null);
  const [fallbackSubmitting, setFallbackSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef(step);
  const pendingStepFocusRef = useRef(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const customerFirstName = data.name?.trim().split(/\s+/)[0] || "there";
  const preferredContactLabel = PREFERRED_CONTACT_LABELS[data.preferredContact ?? "sms"];

  useEffect(() => {
    const saved = loadQuoteDraft();
    if (!saved) return;
    const location = splitLocation(saved.suburb);
    setData((current) => ({
      ...current,
      ...saved,
      suburb: saved.postcode ? saved.suburb : location.suburb,
      postcode: saved.postcode || location.postcode,
      partnerIntroductionInterest: false,
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

  useEffect(() => {
    if (previousStepRef.current === step) return;
    previousStepRef.current = step;
    pendingStepFocusRef.current = true;
  }, [step]);

  const focusCurrentStepHeading = () => {
    if (!pendingStepFocusRef.current) return;
    pendingStepFocusRef.current = false;
    const animationFrame = window.requestAnimationFrame(() => {
      stepHeadingRef.current?.focus();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
    return () => window.cancelAnimationFrame(animationFrame);
  };

  useEffect(() => () => photos.forEach((photo) => URL.revokeObjectURL(photo.preview)), [photos]);

  useEffect(() => {
    if (!submitted) return;
    const animationFrame = window.requestAnimationFrame(() => {
      successHeadingRef.current?.focus();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
    return () => window.cancelAnimationFrame(animationFrame);
  }, [submitted, prefersReducedMotion]);

  const update = <K extends keyof QuoteDraftData>(key: K, value: QuoteDraftData[K]) => {
    setData((current) => applyQuoteDraftUpdate(current, key, value));
    setFieldError("");
  };

  const focusValidationIssue = (code: string) => {
    window.requestAnimationFrame(() => {
      const target = document.getElementById(VALIDATION_FOCUS_IDS[code] ?? "quote-field-error");
      target?.focus();
    });
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
      if (!data.audienceType) {
        return { code: "audience_missing", message: "Choose whether this enquiry is for a homeowner or a builder/developer." };
      }
      if (!data.structuralProjectType) {
        return { code: "structural_project_missing", message: "Select the project type." };
      }
      if (data.audienceType === "builder_developer" && (data.builderCompanyName?.trim().length ?? 0) < 2) {
        return { code: "builder_company_missing", message: "Enter the builder or developer company name." };
      }
      if (data.audienceType === "builder_developer" && (data.streetAddress?.trim().length ?? 0) < 2) {
        return { code: "builder_address_missing", message: "Enter the project street address for this builder or developer enquiry." };
      }
      if (data.audienceType === "builder_developer" && (data.requiredConcreteScope?.trim().length ?? 0) < 10) {
        return { code: "builder_scope_missing", message: "Add the required concrete scope for this builder project." };
      }
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
      if (data.structuralProjectType === "complete_extension" && !data.services?.includes("slab")) {
        return { code: "complete_extension_without_slab", message: "A complete-extension quote must include a concrete slab scope. For non-concrete-only help, use the separate other-trade request." };
      }
    }
    if (targetStep === 4) {
      if (data.audienceType === "builder_developer" && (data.indicativeProgramme?.trim().length ?? 0) < 2) {
        return { code: "builder_programme_missing", message: "Add the indicative programme or site-ready timing." };
      }
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
      focusValidationIssue(issue.code);
      return;
    }
    setFieldError("");
    setStep((current) => Math.min(5, current + 1));
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
      projectContext: {
        audienceType: data.audienceType,
        structuralProjectType: data.structuralProjectType,
        plansReadiness: data.plansReadiness,
        engineeringReadiness: data.engineeringReadiness,
        soilFoundationReadiness: data.soilFoundationReadiness,
        certifierApprovalStatus: data.certifierApprovalStatus,
        builderCompanyName: data.builderCompanyName,
        builderRole: data.builderRole,
        numberOfSitesOrPours: data.numberOfSitesOrPours,
        requiredConcreteScope: data.requiredConcreteScope,
        indicativeProgramme: data.indicativeProgramme,
        preferredFollowUp: data.preferredFollowUp,
        region: data.region,
        landingRoute: data.landingRoute,
        partnerIntroductionInterest: data.structuralProjectType === "complete_extension"
          && Boolean(data.services?.includes("slab"))
          && Boolean(data.partnerIntroductionInterest),
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
      window.requestAnimationFrame(() => document.getElementById("quote-field-error")?.focus());
      return null;
    }
    return parsed.data;
  };

  const submitQuote = trpc.quote.submit.useMutation({
    onSuccess: (result) => {
      clearQuoteDraft();
      tracker.submitConfirmed("primary", trafficClass);
      trackQuoteConversion(
        { quoteId: result.quoteId, transactionId: result.transactionId },
        { email: data.email, phone: data.mobile, name: data.name },
      );
      setBookingDeliveryToken(result.bookingDeliveryToken ?? null);
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
          submissionId: submissionId.current,
          ...legacy,
          source: leadSource.leadSource || "comprehensive-quote",
          website,
          formStartedAt: formStartedAt.current,
          jobBrief,
        });
        if (!result.success) throw new Error(result.error || "Fallback delivery failed");
        setBookingDeliveryToken(null);
        clearQuoteDraft();
        tracker.submitConfirmed("fallback", trafficClass);
        trackQuoteConversion(
          { quoteId: result.quoteId, transactionId: result.transactionId },
          { email: data.email, phone: data.mobile, name: data.name },
        );
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
      focusValidationIssue(issue.code);
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
      submissionId: submissionId.current,
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
      <motion.section
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-labelledby="quote-success-heading"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-6 pb-8 pt-9 text-center sm:px-10 md:pb-10 md:pt-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-brand-yellow to-emerald-500" />
          <motion.div
            aria-hidden="true"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.7 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: [0.7, 1.08, 1] }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.58, delay: prefersReducedMotion ? 0 : 0.08 }}
            className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center"
          >
            <motion.span
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: [0.35, 0.7, 0.35], scale: [0.94, 1.12, 0.94] }}
              transition={{ duration: prefersReducedMotion ? 0 : 1.3, repeat: prefersReducedMotion ? 0 : 1, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-emerald-200"
            />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-emerald-600 shadow-lg shadow-emerald-900/15">
              <CheckCircle2 className="h-11 w-11 text-white" strokeWidth={2.4} />
            </span>
          </motion.div>

          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-700">Sent successfully</p>
          <h2
            ref={successHeadingRef}
            id="quote-success-heading"
            tabIndex={-1}
            className="mt-2 scroll-mt-6 text-3xl font-black tracking-tight text-slate-950 outline-none sm:text-4xl"
          >
            Quote request received
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-700">
            Thanks, {customerFirstName}. Your detailed quote request has been sent to Concrete Concepts Group.
          </p>
          <div className="mx-auto mt-5 flex max-w-xl items-start gap-3 rounded-2xl border border-emerald-200 bg-white/85 p-4 text-left shadow-sm">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <p className="font-bold text-slate-950">We have your project brief</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">Your measurements, site notes and uploaded photos are safely included. We'll contact you by {preferredContactLabel} using the details you provided.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-7 sm:px-10 md:py-9">
          <h3 className="text-center text-xl font-black text-slate-950">What happens next</h3>
          <ol className="mx-auto mt-5 grid max-w-xl gap-3 text-left">
            {[
              "We review your project details",
              "We confirm whether a site visit is needed",
              "We contact you to discuss your quote",
            ].map((item, index) => (
              <li key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow font-black text-slate-950">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <QuoteSuccessBooking
            customerName={data.name ?? ""}
            customerEmail={data.email ?? ""}
            customerMobile={data.mobile ?? ""}
            deliveryToken={bookingDeliveryToken}
          />
          <a
            href="tel:0424463268"
            onClick={() => trackPhoneCallClick()}
            className="mx-auto mt-7 flex min-h-12 w-full max-w-sm items-center justify-center rounded-xl bg-brand-yellow px-6 py-3.5 text-center font-black text-slate-950 shadow-lg transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2"
          >
            <Phone aria-hidden="true" className="mr-2 h-5 w-5" />
            Need help sooner? Call 0424 463 268
          </a>
          <QuoteSuccessShare />
          <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">You can safely close this page. A confirmation copy is also sent when email delivery is available.</p>
        </div>
      </motion.section>
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
                disabled={!complete}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${number} of ${STEPS.length}: ${title}${active ? ", current" : complete ? ", completed" : ""}`}
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
        <AnimatePresence mode="wait" onExitComplete={focusCurrentStepHeading}>
          <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
            {step === 1 && (
              <section>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-yellow">Step 1 of 5</p>
                <h2 ref={stepHeadingRef} tabIndex={-1} className="mt-2 text-3xl font-bold text-slate-950 outline-none">How can we reach you?</h2>
                <p className="mt-2 text-slate-600">We use these details only to assess and respond to your quote request.</p>
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <label><span className={labelClass}>Full name *</span><input id="quote-name" className={inputClass} autoComplete="name" maxLength={100} value={data.name} onChange={(event) => update("name", event.target.value)} /></label>
                  <label><span className={labelClass}>Australian mobile *</span><input id="quote-mobile" className={inputClass} type="tel" autoComplete="tel" maxLength={30} placeholder="04xx xxx xxx" value={data.mobile} onChange={(event) => update("mobile", event.target.value)} /></label>
                  <label><span className={labelClass}>Email *</span><input id="quote-email" className={inputClass} type="email" autoComplete="email" maxLength={254} value={data.email} onChange={(event) => update("email", event.target.value)} /></label>
                  <label><span className={labelClass}>Company <span className="font-normal text-slate-400">(optional)</span></span><input className={inputClass} autoComplete="organization" maxLength={150} value={data.company} onChange={(event) => update("company", event.target.value)} /></label>
                </div>
                <fieldset className="mt-5">
                  <legend className={labelClass}>Preferred contact method *</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {([['sms', 'SMS'], ['phone', 'Phone call'], ['email', 'Email']] as const).map(([value, text]) => (
                      <button id={value === "sms" ? "quote-preferred-contact" : undefined} key={value} type="button" aria-pressed={data.preferredContact === value} onClick={() => update("preferredContact", value)} className={`rounded-xl border-2 px-3 py-3 text-sm font-bold ${data.preferredContact === value ? "border-brand-yellow bg-brand-yellow/10" : "border-slate-200"}`}>{text}</button>
                    ))}
                  </div>
                </fieldset>
              </section>
            )}

            {step === 2 && (
              <section>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-yellow">Step 2 of 5</p>
                <h2 ref={stepHeadingRef} tabIndex={-1} className="mt-2 text-3xl font-bold text-slate-950 outline-none">Where is the project?</h2>
                <p className="mt-2 text-slate-600">The street address is optional. Suburb and postcode help us confirm travel and availability.</p>
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <label className="md:col-span-2"><span className={labelClass}>Street address <span className="font-normal text-slate-400">(optional for homeowners)</span></span><input id="quote-street-address" className={inputClass} autoComplete="street-address" maxLength={250} value={data.streetAddress} onChange={(event) => update("streetAddress", event.target.value)} /></label>
                  <label><span className={labelClass}>Suburb *</span><input id="quote-suburb" className={inputClass} autoComplete="address-level2" maxLength={120} placeholder="Camp Hill" value={data.suburb} onChange={(event) => update("suburb", event.target.value)} /></label>
                  <label><span className={labelClass}>Postcode *</span><input id="quote-postcode" className={inputClass} inputMode="numeric" autoComplete="postal-code" maxLength={4} placeholder="4152" value={data.postcode} onChange={(event) => update("postcode", event.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
                </div>
                {data.suburb && data.postcode && serviceArea.status === "service_area_review" && (
                  <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">You can continue. We’ll review availability for this Queensland location rather than rejecting your enquiry.</div>
                )}
              </section>
            )}

            {step === 3 && (
              <section>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-yellow">Step 3 of 5</p>
                <h2 ref={stepHeadingRef} tabIndex={-1} className="mt-2 text-3xl font-bold text-slate-950 outline-none">Tell us about the job</h2>
                <p className="mt-2 text-slate-600">Select everything that applies. “Not sure” is always acceptable.</p>
                <fieldset className="mt-7">
                  <legend className={labelClass}>Who is this enquiry for? *</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {([['homeowner', 'Homeowner or property owner'], ['builder_developer', 'Builder, developer or construction company']] as const).map(([value, text]) => (
                      <button id={value === "homeowner" ? "quote-audience-homeowner" : undefined} key={value} type="button" aria-pressed={data.audienceType === value} onClick={() => update("audienceType", value)} className={`min-h-12 rounded-xl border-2 px-4 py-3 text-left text-sm font-bold ${data.audienceType === value ? "border-brand-yellow bg-brand-yellow/10" : "border-slate-200"}`}>{text}</button>
                    ))}
                  </div>
                </fieldset>
                {data.audienceType === "homeowner" && (
                  <label className="mt-5 block"><span className={labelClass}>Homeowner project type *</span><select id="quote-structural-project" className={inputClass} value={data.structuralProjectType} onChange={(event) => update("structuralProjectType", event.target.value as QuoteDraftData["structuralProjectType"])}>{STRUCTURAL_PROJECT_TYPES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
                )}
                {data.audienceType === "builder_developer" && (
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <label><span className={labelClass}>Company name *</span><input id="quote-builder-company" className={inputClass} autoComplete="organization" maxLength={150} value={data.builderCompanyName} onChange={(event) => update("builderCompanyName", event.target.value)} /></label>
                    <label><span className={labelClass}>Your role <span className="font-normal text-slate-400">(optional)</span></span><input className={inputClass} maxLength={150} value={data.builderRole} onChange={(event) => update("builderRole", event.target.value)} /></label>
                    <label className="md:col-span-2"><span className={labelClass}>Builder project type *</span><select id="quote-structural-project" className={inputClass} value={data.structuralProjectType} onChange={(event) => update("structuralProjectType", event.target.value as QuoteDraftData["structuralProjectType"])}>{STRUCTURAL_PROJECT_TYPES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
                    <label><span className={labelClass}>Number of sites or pours</span><input className={inputClass} maxLength={500} placeholder="e.g. 3 staged pours" value={data.numberOfSitesOrPours} onChange={(event) => update("numberOfSitesOrPours", event.target.value)} /></label>
                    <label><span className={labelClass}>Required concrete scope *</span><input id="quote-builder-scope" className={inputClass} maxLength={1500} placeholder="Slab, footings, preparation or placement" value={data.requiredConcreteScope} onChange={(event) => update("requiredConcreteScope", event.target.value)} /></label>
                  </div>
                )}
                <fieldset className="mt-7">
                  <legend className={labelClass}>Concrete services *</legend>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {SERVICES.map(([value, text]) => {
                      const selected = data.services?.includes(value);
                      return <button id={value === "driveway" ? "quote-service-driveway" : undefined} key={value} type="button" aria-pressed={Boolean(selected)} onClick={() => toggleService(value)} className={`rounded-xl border-2 p-3 text-left text-sm font-bold ${selected ? "border-brand-yellow bg-brand-yellow/10" : "border-slate-200"}`}>{selected && <Check aria-hidden="true" className="mr-1 inline h-4 w-4 text-brand-yellow" />}{text}</button>;
                    })}
                  </div>
                </fieldset>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <label><span className={labelClass}>Type of work *</span><select id="quote-work-type" className={inputClass} value={data.workType} onChange={(event) => update("workType", event.target.value)}><option value="new">New work</option><option value="replacement">Remove and replace</option><option value="extension">Extension</option><option value="repair">Repair</option><option value="not_sure">Not sure</option></select></label>
                  <label><span className={labelClass}>Preferred finish *</span><select id="quote-finish" className={inputClass} value={data.finish} onChange={(event) => update("finish", event.target.value)}>{FINISHES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
                  <label><span className={labelClass}>Timeframe *</span><select id="quote-timeframe" className={inputClass} value={data.timeframe} onChange={(event) => update("timeframe", event.target.value)}>{TIMEFRAMES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
                  <label><span className={labelClass}>Existing concrete removal</span><select className={inputClass} value={data.existingConcreteRemoval === undefined ? "unknown" : data.existingConcreteRemoval ? "yes" : "no"} onChange={(event) => update("existingConcreteRemoval", event.target.value === "unknown" ? undefined : event.target.value === "yes")}><option value="unknown">Not sure</option><option value="yes">Yes</option><option value="no">No</option></select></label>
                </div>
                <label className="mt-5 block"><span className={labelClass}>Describe the project *</span><textarea id="quote-description" className={`${inputClass} min-h-32 resize-y`} maxLength={5000} placeholder="What needs to be built or replaced? Include approximate size, finish, obstacles and anything important." value={data.description} onChange={(event) => update("description", event.target.value)} /></label>
                {data.structuralProjectType === "complete_extension" && !data.services?.includes("slab") && (
                  <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><p className="font-bold">A detailed CCG quote needs a concrete component.</p><p className="mt-1">If you need only non-concrete extension work, use the <a href="/need-another-trade" className="font-bold underline">separate other-trade request</a>. That request is secondary and does not create a detailed quote conversion.</p></div>
                )}
              </section>
            )}

            {step === 4 && (
              <section>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-yellow">Step 4 of 5</p>
                <h2 ref={stepHeadingRef} tabIndex={-1} className="mt-2 text-3xl font-bold text-slate-950 outline-none">Measurements, access and photos</h2>
                <p className="mt-2 text-slate-600">Estimates are helpful, but you can choose “Not sure” and we’ll measure on site.</p>
                <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="font-bold text-slate-950">Structural documents and readiness</h3>
                  <p className="mt-1 text-sm text-slate-600">Unknown documents do not block the enquiry. Choose Not sure where needed.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label><span className={labelClass}>Plans or drawings</span><select className={inputClass} value={data.plansReadiness} onChange={(event) => update("plansReadiness", event.target.value as QuoteDraftData["plansReadiness"])}>{DOCUMENT_READINESS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
                    <label><span className={labelClass}>Engineering</span><select className={inputClass} value={data.engineeringReadiness} onChange={(event) => update("engineeringReadiness", event.target.value as QuoteDraftData["engineeringReadiness"])}>{DOCUMENT_READINESS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
                    <label><span className={labelClass}>Soil / foundation information</span><select className={inputClass} value={data.soilFoundationReadiness} onChange={(event) => update("soilFoundationReadiness", event.target.value as QuoteDraftData["soilFoundationReadiness"])}>{DOCUMENT_READINESS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
                    <label><span className={labelClass}>Approval / certifier status</span><select className={inputClass} value={data.certifierApprovalStatus} onChange={(event) => update("certifierApprovalStatus", event.target.value as QuoteDraftData["certifierApprovalStatus"])}><option value="approved">Approved</option><option value="in_progress">In progress</option><option value="not_started">Not started</option><option value="not_required">Not required</option><option value="not_sure">Not sure</option></select></label>
                  </div>
                  {data.audienceType === "builder_developer" && <div className="mt-4 grid gap-4 md:grid-cols-2"><label><span className={labelClass}>Indicative programme or site-ready timing *</span><textarea id="quote-builder-programme" className={`${inputClass} min-h-24 resize-y`} maxLength={1500} value={data.indicativeProgramme} onChange={(event) => update("indicativeProgramme", event.target.value)} /></label><label><span className={labelClass}>Preferred follow-up</span><textarea className={`${inputClass} min-h-24 resize-y`} maxLength={500} value={data.preferredFollowUp} onChange={(event) => update("preferredFollowUp", event.target.value)} /></label></div>}
                </div>
                <fieldset className="mt-7">
                  <legend className={labelClass}>Measurements *</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {([['dimensions', 'Length × width'], ['area', 'Total m²'], ['not_sure', 'Not sure — measure on site']] as const).map(([value, text]) => <button key={value} type="button" aria-pressed={data.measurementMode === value} onClick={() => update("measurementMode", value)} className={`rounded-xl border-2 px-3 py-3 text-sm font-bold ${data.measurementMode === value ? "border-brand-yellow bg-brand-yellow/10" : "border-slate-200"}`}>{text}</button>)}
                  </div>
                </fieldset>
                {data.measurementMode === "dimensions" && <div className="mt-5 grid grid-cols-2 gap-3"><label><span className={labelClass}>Length (m) *</span><input id="quote-length" className={inputClass} inputMode="decimal" value={data.lengthM} onChange={(event) => update("lengthM", event.target.value)} /></label><label><span className={labelClass}>Width (m) *</span><input className={inputClass} inputMode="decimal" value={data.widthM} onChange={(event) => update("widthM", event.target.value)} /></label></div>}
                {data.measurementMode === "area" && <label className="mt-5 block"><span className={labelClass}>Approximate total area (m²) *</span><input id="quote-area" className={inputClass} inputMode="decimal" value={data.totalAreaM2} onChange={(event) => update("totalAreaM2", event.target.value)} /></label>}
                <label className="mt-5 block"><span className={labelClass}>Separate areas or measurement notes <span className="font-normal text-slate-400">(optional)</span></span><textarea className={`${inputClass} min-h-24 resize-y`} maxLength={1500} value={data.separateAreaNotes} onChange={(event) => update("separateAreaNotes", event.target.value)} /></label>

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
                  <label className="mt-4 block"><span className={labelClass}>Known underground services</span><input className={inputClass} maxLength={500} placeholder="Water, gas, electrical or NBN near the work area" value={data.knownServices} onChange={(event) => update("knownServices", event.target.value)} /></label>
                  <label className="mt-4 block"><span className={labelClass}>Other access or site requirements</span><textarea className={`${inputClass} min-h-24 resize-y`} maxLength={1500} value={data.specialRequirements} onChange={(event) => update("specialRequirements", event.target.value)} /></label>
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
                <h2 ref={stepHeadingRef} tabIndex={-1} className="mt-2 text-3xl font-bold text-slate-950 outline-none">Review your quote request</h2>
                <p className="mt-2 text-slate-600">Check the details below before sending them to Concrete Concepts Group.</p>
                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  <ReviewCard title="Contact" onEdit={() => setStep(1)} lines={[data.name || "", data.mobile || "", data.email || "", `Preferred: ${data.preferredContact || "Not provided"}`]} />
                  <ReviewCard title="Job location" onEdit={() => setStep(2)} lines={[data.streetAddress || "Street address not provided", `${data.suburb} QLD ${data.postcode}`]} />
                  <ReviewCard title="Job scope" onEdit={() => setStep(3)} lines={[(data.services ?? []).map((service) => optionLabel(SERVICES, service)).join(", "), optionLabel(FINISHES, data.finish), optionLabel(TIMEFRAMES, data.timeframe), data.description || ""]} />
                  <ReviewCard title="Measurements & site" onEdit={() => setStep(4)} lines={[data.measurementMode === "not_sure" ? "Measure on site" : data.measurementMode === "area" ? `${data.totalAreaM2} m² approximate` : `${data.lengthM} m × ${data.widthM} m`, `${photos.filter((photo) => photo.status === "uploaded").length} photos attached`]} />
                </div>
                <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5">
                  <label className="flex items-start gap-3 text-sm text-slate-700"><input id="quote-contact-consent" type="checkbox" className="mt-1 h-4 w-4 accent-brand-yellow" checked={Boolean(data.contactConsent)} onChange={(event) => update("contactConsent", event.target.checked)} /><span>I agree that Concrete Concepts Group may contact me about this quote request. *</span></label>
                  <label className="flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" className="mt-1 h-4 w-4 accent-brand-yellow" checked={Boolean(data.privacyConsent)} onChange={(event) => update("privacyConsent", event.target.checked)} /><span>I acknowledge that my details and uploaded photos will be used to assess this project. *</span></label>
                  <label className="flex items-start gap-3 text-sm text-slate-600"><input type="checkbox" className="mt-1 h-4 w-4 accent-brand-yellow" checked={Boolean(data.marketingConsent)} onChange={(event) => update("marketingConsent", event.target.checked)} /><span>Send me occasional project ideas and offers. Optional.</span></label>
                  {data.structuralProjectType === "complete_extension" && data.services?.includes("slab") && (
                    <label className="flex items-start gap-3 border-t border-slate-200 pt-3 text-sm text-slate-700"><input type="checkbox" className="mt-1 h-4 w-4 accent-brand-yellow" checked={Boolean(data.partnerIntroductionInterest)} onChange={(event) => update("partnerIntroductionInterest", event.target.checked)} /><span><strong>I would like CCG to introduce me to a reviewed partner for non-concrete extension work.</strong><span className="mt-1 block text-slate-600">Optional and unchecked by default. CCG reviews this request first. Nothing is forwarded automatically; a provider would be identified later, contract separately and receive information only after the applicable final consent.</span></span></label>
                  )}
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
