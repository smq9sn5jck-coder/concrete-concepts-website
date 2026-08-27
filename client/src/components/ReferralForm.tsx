import { useState } from "react";
import { CheckCircle2, Loader2, Phone, RotateCcw, Send } from "lucide-react";
import {
  captureAttribution,
  createRequestId,
  emitLeadEvent,
} from "@/lib/leads";
import {
  type ReferralErrors,
  type ReferralFormValues,
  type ReferrerType,
  validateReferral,
} from "@/lib/referral-validation";

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

const INITIAL_VALUES: ReferralFormValues = {
  referrerType: "private",
  referrerName: "",
  referrerBusiness: "",
  referrerPhone: "",
  referrerEmail: "",
  customerName: "",
  customerPhone: "",
  suburb: "",
  projectType: "",
  notes: "",
  consentConfirmed: false,
  company: "",
};

const REFERRER_OPTIONS: Array<{
  value: ReferrerType;
  label: string;
  description: string;
}> = [
  {
    value: "private",
    label: "Private Individual",
    description: "Friend, neighbour or past customer",
  },
  {
    value: "builder",
    label: "Builder",
    description: "Residential or commercial builder",
  },
  {
    value: "trade",
    label: "Trade Business",
    description: "Landscaper, plumber, electrician or other trade",
  },
];

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

function fieldClasses(hasError: boolean) {
  return `w-full rounded-sm border bg-white px-3 py-3 text-charcoal transition focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-500 focus:ring-red-200"
      : "border-bone-dark focus:border-gold focus:ring-gold/30"
  }`;
}

export default function ReferralForm() {
  const [values, setValues] = useState<ReferralFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ReferralErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [serverError, setServerError] = useState("");
  const [reference, setReference] = useState("");

  const updateValue = <K extends keyof ReferralFormValues>(
    key: K,
    value: ReferralFormValues[K]
  ) => {
    setValues(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: undefined }));
    setServerError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateReferral(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>(
        '[aria-invalid="true"]'
      );
      firstInvalid?.focus();
      return;
    }

    setStatus("sending");
    setServerError("");
    const requestId = createRequestId("referral");

    try {
      const response = await fetch("/api/send-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          requestId,
          leadType: "trade_referral",
          attribution: captureAttribution(),
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to submit the referral.");
      }

      const publicReference = result.reference || requestId;
      setReference(publicReference);
      setStatus("success");
      emitLeadEvent("trade_referral_submitted", {
        requestId,
        leadType: "trade_referral",
        reference: publicReference,
        referrerType: values.referrerType,
        projectType: values.projectType,
      });
    } catch (error) {
      setStatus("idle");
      setServerError(
        error instanceof Error
          ? error.message
          : "Unable to submit the referral. Please try again."
      );
    }
  };

  if (status === "success") {
    return (
      <div
        className="rounded-sm border border-green-200 bg-green-50 p-7 text-center sm:p-10"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-700" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-green-800">
          Referral received
        </p>
        <h3
          className="mt-2 text-2xl font-bold text-navy"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          We’ll contact the customer shortly.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal/75">
          Keep this referral reference: <strong>{reference}</strong>. The $100
          reward is payable after the referred job is completed and paid in
          full, subject to the program terms.
        </p>
        <button
          type="button"
          className="btn-navy-outline mx-auto mt-6 justify-center"
          onClick={() => {
            setValues(INITIAL_VALUES);
            setErrors({});
            setReference("");
            setStatus("idle");
          }}
        >
          <RotateCcw className="h-4 w-4" /> Refer another job
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm font-black text-navy">
            1
          </span>
          <div>
            <p className="mono-stamp text-xs uppercase tracking-widest text-gold-dark">
              Your details
            </p>
            <h3
              className="text-xl font-bold text-navy"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Who is making the referral?
            </h3>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 block text-xs font-semibold uppercase tracking-widest text-navy">
            Referrer type *
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {REFERRER_OPTIONS.map(option => {
              const selected = values.referrerType === option.value;
              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-sm border p-4 transition ${
                    selected
                      ? "border-gold bg-gold/10 shadow-[0_0_0_2px_rgba(201,164,77,0.18)]"
                      : "border-bone-dark bg-white hover:border-gold/70"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="referrerType"
                    value={option.value}
                    checked={selected}
                    onChange={() => updateValue("referrerType", option.value)}
                  />
                  <span className="block text-sm font-bold text-navy">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-charcoal/60">
                    {option.description}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="referrerName"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-navy"
            >
              Your name *
            </label>
            <input
              id="referrerName"
              value={values.referrerName}
              onChange={event =>
                updateValue("referrerName", event.target.value)
              }
              className={fieldClasses(Boolean(errors.referrerName))}
              autoComplete="name"
              aria-invalid={Boolean(errors.referrerName)}
              aria-describedby={
                errors.referrerName ? "referrerName-error" : undefined
              }
            />
            <FieldError id="referrerName-error" message={errors.referrerName} />
          </div>

          {(values.referrerType === "builder" ||
            values.referrerType === "trade") && (
            <div>
              <label
                htmlFor="referrerBusiness"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-navy"
              >
                Business name *
              </label>
              <input
                id="referrerBusiness"
                value={values.referrerBusiness}
                onChange={event =>
                  updateValue("referrerBusiness", event.target.value)
                }
                className={fieldClasses(Boolean(errors.referrerBusiness))}
                autoComplete="organization"
                aria-invalid={Boolean(errors.referrerBusiness)}
                aria-describedby={
                  errors.referrerBusiness ? "referrerBusiness-error" : undefined
                }
              />
              <FieldError
                id="referrerBusiness-error"
                message={errors.referrerBusiness}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="referrerPhone"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-navy"
            >
              Your phone *
            </label>
            <input
              id="referrerPhone"
              type="tel"
              value={values.referrerPhone}
              onChange={event =>
                updateValue("referrerPhone", event.target.value)
              }
              className={fieldClasses(Boolean(errors.referrerPhone))}
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(errors.referrerPhone)}
              aria-describedby={
                errors.referrerPhone ? "referrerPhone-error" : undefined
              }
            />
            <FieldError
              id="referrerPhone-error"
              message={errors.referrerPhone}
            />
          </div>

          <div>
            <label
              htmlFor="referrerEmail"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-navy"
            >
              Your email
            </label>
            <input
              id="referrerEmail"
              type="email"
              value={values.referrerEmail}
              onChange={event =>
                updateValue("referrerEmail", event.target.value)
              }
              className={fieldClasses(Boolean(errors.referrerEmail))}
              autoComplete="email"
              aria-invalid={Boolean(errors.referrerEmail)}
              aria-describedby={
                errors.referrerEmail ? "referrerEmail-error" : undefined
              }
            />
            <FieldError
              id="referrerEmail-error"
              message={errors.referrerEmail}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-bone-dark pt-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm font-black text-navy">
            2
          </span>
          <div>
            <p className="mono-stamp text-xs uppercase tracking-widest text-gold-dark">
              Customer and job
            </p>
            <h3
              className="text-xl font-bold text-navy"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Who should we contact?
            </h3>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="customerName"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-navy"
            >
              Customer name *
            </label>
            <input
              id="customerName"
              value={values.customerName}
              onChange={event =>
                updateValue("customerName", event.target.value)
              }
              className={fieldClasses(Boolean(errors.customerName))}
              autoComplete="off"
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={
                errors.customerName ? "customerName-error" : undefined
              }
            />
            <FieldError id="customerName-error" message={errors.customerName} />
          </div>

          <div>
            <label
              htmlFor="customerPhone"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-navy"
            >
              Customer phone *
            </label>
            <input
              id="customerPhone"
              type="tel"
              value={values.customerPhone}
              onChange={event =>
                updateValue("customerPhone", event.target.value)
              }
              className={fieldClasses(Boolean(errors.customerPhone))}
              inputMode="tel"
              autoComplete="off"
              aria-invalid={Boolean(errors.customerPhone)}
              aria-describedby={
                errors.customerPhone ? "customerPhone-error" : undefined
              }
            />
            <FieldError
              id="customerPhone-error"
              message={errors.customerPhone}
            />
          </div>

          <div>
            <label
              htmlFor="suburb"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-navy"
            >
              Project suburb *
            </label>
            <input
              id="suburb"
              value={values.suburb}
              onChange={event => updateValue("suburb", event.target.value)}
              className={fieldClasses(Boolean(errors.suburb))}
              autoComplete="address-level2"
              aria-invalid={Boolean(errors.suburb)}
              aria-describedby={errors.suburb ? "suburb-error" : undefined}
            />
            <FieldError id="suburb-error" message={errors.suburb} />
          </div>

          <div>
            <label
              htmlFor="projectType"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-navy"
            >
              Project type *
            </label>
            <select
              id="projectType"
              value={values.projectType}
              onChange={event => updateValue("projectType", event.target.value)}
              className={fieldClasses(Boolean(errors.projectType))}
              aria-invalid={Boolean(errors.projectType)}
              aria-describedby={
                errors.projectType ? "projectType-error" : undefined
              }
            >
              <option value="">Select a project type…</option>
              {SERVICE_OPTIONS.map(service => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            <FieldError id="projectType-error" message={errors.projectType} />
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="notes"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-navy"
          >
            Project notes
          </label>
          <textarea
            id="notes"
            rows={4}
            value={values.notes}
            onChange={event => updateValue("notes", event.target.value)}
            className={`${fieldClasses(false)} resize-y`}
            placeholder="Approximate size, preferred finish, timing or anything else that helps us understand the job."
          />
        </div>

        <label
          className={`mt-5 flex cursor-pointer items-start gap-3 rounded-sm border p-4 ${
            errors.consentConfirmed
              ? "border-red-400 bg-red-50"
              : "border-bone-dark bg-bone/50"
          }`}
        >
          <input
            type="checkbox"
            checked={values.consentConfirmed}
            onChange={event =>
              updateValue("consentConfirmed", event.target.checked)
            }
            className="mt-0.5 h-5 w-5 rounded border-bone-dark accent-[#C9A44D]"
            aria-invalid={Boolean(errors.consentConfirmed)}
            aria-describedby={
              errors.consentConfirmed ? "consentConfirmed-error" : undefined
            }
          />
          <span className="text-sm leading-relaxed text-charcoal/80">
            I confirm the customer has agreed for me to provide their details
            and for Concrete Concepts to contact them about this project. *
          </span>
        </label>
        <FieldError
          id="consentConfirmed-error"
          message={errors.consentConfirmed}
        />
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={event => updateValue("company", event.target.value)}
        />
      </div>

      {serverError && (
        <div
          className="rounded-sm border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <p className="font-bold">The referral could not be sent.</p>
          <p className="mt-1">{serverError}</p>
          <a
            href="tel:0424463268"
            className="mt-3 inline-flex items-center gap-2 font-bold underline"
          >
            <Phone className="h-4 w-4" /> Call 0424 463 268
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-gold w-full justify-center py-4 text-base disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Sending referral…
          </>
        ) : (
          <>
            <Send className="h-5 w-5" /> Submit $100 referral
          </>
        )}
      </button>
      <p className="text-center text-xs leading-relaxed text-charcoal/55">
        No bank details are required. If the referral qualifies, we’ll arrange
        the $100 reward privately after the completed job is paid in full.
      </p>
    </form>
  );
}
