import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  RotateCcw,
} from "lucide-react";
import {
  captureAttribution,
  createRequestId,
  emitLeadEvent,
} from "@/lib/leads";
import {
  type CGSErrors,
  type CGSFormValues,
  validateCGSEnquiry,
} from "@/lib/cgs-validation";

const INITIAL_VALUES: CGSFormValues = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  businessType: "",
  website: "",
  growthProblem: "",
  notes: "",
  company: "",
};

const BUSINESS_TYPES = [
  "Residential Builder",
  "Commercial Builder",
  "Concreting Business",
  "Landscaping Business",
  "Electrical Business",
  "Plumbing Business",
  "Carpentry Business",
  "Earthmoving / Excavation",
  "Other Construction Trade",
];

const GROWTH_PROBLEMS = [
  "Website not generating leads",
  "Not enough qualified enquiries",
  "Slow or inconsistent follow-up",
  "No referral tracking system",
  "Quoting and admin are too manual",
  "Need the complete growth system",
];

function errorId(field: keyof CGSFormValues) {
  return `${field}-error`;
}

function FieldError({
  field,
  message,
}: {
  field: keyof CGSFormValues;
  message?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={errorId(field)}
      className="mt-1.5 text-sm font-medium text-amber-300"
    >
      {message}
    </p>
  );
}

function fieldClasses(hasError: boolean) {
  return `w-full rounded-sm border bg-white/5 px-3 py-3 text-white placeholder:text-white/35 transition focus:outline-none focus:ring-2 ${
    hasError
      ? "border-amber-400 focus:ring-amber-400/25"
      : "border-white/20 focus:border-[#D6A84B] focus:ring-[#D6A84B]/25"
  }`;
}

export default function CGSForm() {
  const [values, setValues] = useState<CGSFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<CGSErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [serverError, setServerError] = useState("");

  const updateValue = <K extends keyof CGSFormValues>(
    key: K,
    value: CGSFormValues[K]
  ) => {
    setValues(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: undefined }));
    setServerError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateCGSEnquiry(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      event.currentTarget
        .querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
      return;
    }

    setStatus("sending");
    setServerError("");
    const requestId = createRequestId("cgs");

    try {
      const response = await fetch("/api/send-cgs-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          requestId,
          leadType: "cgs_growth_enquiry",
          attribution: captureAttribution(),
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to send your growth enquiry.");
      }

      setStatus("success");
      emitLeadEvent("cgs_growth_enquiry_submitted", {
        requestId,
        leadType: "cgs_growth_enquiry",
        businessType: values.businessType,
        growthProblem: values.growthProblem,
      });
    } catch (error) {
      setStatus("idle");
      setServerError(
        error instanceof Error
          ? error.message
          : "Unable to send your growth enquiry. Please try again."
      );
    }
  };

  if (status === "success") {
    return (
      <div
        className="border border-emerald-400/30 bg-emerald-400/10 p-7 text-center sm:p-9"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Growth review requested
        </p>
        <h3 className="mt-2 text-2xl font-black text-white">
          We’ll review your current setup.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/65">
          Your CGS enquiry has been received. We’ll use the details you supplied
          to identify the strongest next step for your construction business.
        </p>
        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:border-[#D6A84B] hover:text-[#D6A84B]"
          onClick={() => {
            setValues(INITIAL_VALUES);
            setErrors({});
            setStatus("idle");
          }}
        >
          <RotateCcw className="h-4 w-4" /> Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="cgs-name"
            className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/70"
          >
            Your name *
          </label>
          <input
            id="cgs-name"
            value={values.name}
            onChange={event => updateValue("name", event.target.value)}
            className={fieldClasses(Boolean(errors.name))}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? errorId("name") : undefined}
          />
          <FieldError field="name" message={errors.name} />
        </div>

        <div>
          <label
            htmlFor="cgs-business"
            className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/70"
          >
            Business name *
          </label>
          <input
            id="cgs-business"
            value={values.businessName}
            onChange={event => updateValue("businessName", event.target.value)}
            className={fieldClasses(Boolean(errors.businessName))}
            autoComplete="organization"
            aria-invalid={Boolean(errors.businessName)}
            aria-describedby={
              errors.businessName ? errorId("businessName") : undefined
            }
          />
          <FieldError field="businessName" message={errors.businessName} />
        </div>

        <div>
          <label
            htmlFor="cgs-email"
            className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/70"
          >
            Email *
          </label>
          <input
            id="cgs-email"
            type="email"
            value={values.email}
            onChange={event => updateValue("email", event.target.value)}
            className={fieldClasses(Boolean(errors.email))}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? errorId("email") : undefined}
          />
          <FieldError field="email" message={errors.email} />
        </div>

        <div>
          <label
            htmlFor="cgs-phone"
            className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/70"
          >
            Phone *
          </label>
          <input
            id="cgs-phone"
            type="tel"
            value={values.phone}
            onChange={event => updateValue("phone", event.target.value)}
            className={fieldClasses(Boolean(errors.phone))}
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? errorId("phone") : undefined}
          />
          <FieldError field="phone" message={errors.phone} />
        </div>

        <div>
          <label
            htmlFor="cgs-business-type"
            className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/70"
          >
            Business type *
          </label>
          <select
            id="cgs-business-type"
            value={values.businessType}
            onChange={event => updateValue("businessType", event.target.value)}
            className={fieldClasses(Boolean(errors.businessType))}
            aria-invalid={Boolean(errors.businessType)}
            aria-describedby={
              errors.businessType ? errorId("businessType") : undefined
            }
          >
            <option value="" className="text-black">
              Select your business…
            </option>
            {BUSINESS_TYPES.map(type => (
              <option key={type} value={type} className="text-black">
                {type}
              </option>
            ))}
          </select>
          <FieldError field="businessType" message={errors.businessType} />
        </div>

        <div>
          <label
            htmlFor="cgs-website"
            className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/70"
          >
            Current website
          </label>
          <input
            id="cgs-website"
            type="url"
            value={values.website}
            onChange={event => updateValue("website", event.target.value)}
            className={fieldClasses(false)}
            placeholder="https://"
            autoComplete="url"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="cgs-problem"
          className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/70"
        >
          Main growth problem *
        </label>
        <select
          id="cgs-problem"
          value={values.growthProblem}
          onChange={event => updateValue("growthProblem", event.target.value)}
          className={fieldClasses(Boolean(errors.growthProblem))}
          aria-invalid={Boolean(errors.growthProblem)}
          aria-describedby={
            errors.growthProblem ? errorId("growthProblem") : undefined
          }
        >
          <option value="" className="text-black">
            Select the biggest issue…
          </option>
          {GROWTH_PROBLEMS.map(problem => (
            <option key={problem} value={problem} className="text-black">
              {problem}
            </option>
          ))}
        </select>
        <FieldError field="growthProblem" message={errors.growthProblem} />
      </div>

      <div>
        <label
          htmlFor="cgs-notes"
          className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/70"
        >
          What would you like the system to improve?
        </label>
        <textarea
          id="cgs-notes"
          rows={4}
          value={values.notes}
          onChange={event => updateValue("notes", event.target.value)}
          className={`${fieldClasses(false)} resize-y`}
          placeholder="Tell us where leads are being lost, what feels too manual, or what you want the business to achieve."
        />
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="cgs-company">Company</label>
        <input
          id="cgs-company"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={event => updateValue("company", event.target.value)}
        />
      </div>

      {serverError && (
        <div
          className="border border-red-400/35 bg-red-400/10 p-4 text-sm text-red-100"
          role="alert"
        >
          <p className="font-bold">Your enquiry could not be sent.</p>
          <p className="mt-1">{serverError}</p>
          <a
            href="mailto:info@concreteconceptsgroup.com"
            className="mt-3 inline-flex items-center gap-2 font-bold text-white underline"
          >
            <Mail className="h-4 w-4" /> Email us directly
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex w-full items-center justify-center gap-2 bg-[#D6A84B] px-6 py-4 text-base font-black text-[#171717] transition duration-150 hover:bg-[#e2ba63] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-65"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Sending enquiry…
          </>
        ) : (
          <>
            Request a growth review <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>
      <p className="text-center text-xs leading-relaxed text-white/45">
        No spam and no generic sales script. We’ll review the details you
        provide and discuss the most practical next step.
      </p>
    </form>
  );
}
