/**
 * Form submission fallback — POSTs to the Cloudflare Pages Function at /api/quote-submit.
 * Used when the tRPC client fails (e.g., on the Cloudflare Pages static site).
 * A mail draft may open if delivery is unavailable, but it is never reported as sent.
 */

import {
  assessSubmissionSignals,
  classifyServiceArea,
  validateAustralianPhone,
} from "@shared/leadValidation";
import type { ComprehensiveQuote } from "@shared/quoteBrief";

const BUSINESS_EMAIL = "info@concreteconceptsgroup.com";
const BUSINESS_PHONE = "0424 463 268";

interface FormData {
  formType?: "hero_quick_quote";
  name: string;
  email?: string;
  phone: string;
  service?: string;
  suburb?: string;
  details?: string;
  source?: string;
  photoUrls?: string[];
  website?: string;
  formStartedAt?: number;
  jobBrief?: ComprehensiveQuote;
}

interface CallbackFallbackData {
  name: string;
  phone: string;
  suburb?: string;
  page?: string;
  source?: string;
  website?: string;
  formStartedAt?: number;
}

interface GuideFallbackData {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  website?: string;
  formStartedAt?: number;
}

type FallbackResult = {
  success: boolean;
  method: "api" | "mailto";
  error?: string;
};

/**
 * Submit form data by POSTing to the Pages Function.
 * Validation happens before delivery so invalid data cannot bypass tRPC.
 */
export async function submitFormFallback(data: FormData): Promise<FallbackResult> {
  const phoneValidation = validateAustralianPhone(data.phone);
  if (!phoneValidation.valid) throw new Error(phoneValidation.error);

  if (data.formType === "hero_quick_quote") {
    if (!("kind" in phoneValidation) || phoneValidation.kind !== "mobile") {
      throw new Error("Enter an Australian mobile number beginning with 04 so we can confirm the quote request.");
    }
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email) || /placeholder|not-provided|via-quick-form/i.test(data.email)) {
      throw new Error("Enter your email address so we can send and verify your quote details.");
    }
    if (!data.service || /^(general enquiry|quick quote|not specified)$/i.test(data.service)) {
      throw new Error("Select the concrete service you need.");
    }
    if (!data.details || data.details.trim().length < 10) {
      throw new Error("Add a short project description so we can assess the job before calling.");
    }
  }

  const serviceArea = classifyServiceArea(data.suburb || "Not specified");
  if (!serviceArea.canSubmit) throw new Error(serviceArea.message);

  const submissionSignals = assessSubmissionSignals({
    honeypot: data.website,
    startedAt: data.formStartedAt,
  });
  if (!submissionSignals.allowed) {
    throw new Error("We couldn't submit that request. Please check the form and try again.");
  }

  const normalizedData: FormData = {
    ...data,
    phone: phoneValidation.normalized,
    suburb: serviceArea.normalized,
  };

  try {
    const response = await fetch("/api/quote-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formType: normalizedData.formType,
        name: normalizedData.name,
        phone: normalizedData.phone,
        email: normalizedData.email || "not-provided@placeholder.com",
        suburb: normalizedData.suburb,
        service: normalizedData.service || "General Enquiry",
        details: normalizedData.details || "",
        photoUrls: normalizedData.photoUrls || [],
        leadSource: normalizedData.source || "cloudflare-pages",
        landingPage: window.location.pathname,
        website: normalizedData.website || "",
        formStartedAt: normalizedData.formStartedAt,
        jobBrief: normalizedData.jobBrief,
      }),
    });

    if (response.ok) return { success: true, method: "api" };

    let apiError = `Delivery endpoint returned ${response.status}`;
    try {
      const body = await response.json();
      apiError = body.error || body.message || apiError;
    } catch {
      // Preserve the status-based message for non-JSON responses.
    }

    if (response.status === 400 || response.status === 422 || response.status === 429) {
      throw new Error(apiError);
    }

    console.warn("[FormFallback] Pages Function returned error:", response.status);
    openMailtoFallback(normalizedData);
    return { success: false, method: "mailto", error: apiError };
  } catch (err) {
    if (
      err instanceof Error &&
      /Australian phone number|Australian mobile number|email address|concrete service|project description|South East Queensland|too many|already received|check the form/i.test(err.message)
    ) {
      throw err;
    }

    console.warn("[FormFallback] Pages Function unreachable, using mailto:", err);
    openMailtoFallback(normalizedData);
    return {
      success: false,
      method: "mailto",
      error: err instanceof Error ? err.message : "Delivery service unavailable",
    };
  }
}

/** Submit a callback lead without presenting it as a completed quote request. */
export async function submitCallbackFallback(data: CallbackFallbackData): Promise<FallbackResult> {
  const phoneValidation = validateAustralianPhone(data.phone);
  if (!phoneValidation.valid) throw new Error(phoneValidation.error);

  const serviceArea = classifyServiceArea(data.suburb || "Not specified");
  if (!serviceArea.canSubmit) throw new Error(serviceArea.message);

  const submissionSignals = assessSubmissionSignals({
    honeypot: data.website,
    startedAt: data.formStartedAt,
  });
  if (!submissionSignals.allowed) {
    throw new Error("We couldn't submit that request. Please check the form and try again.");
  }

  const normalizedData: CallbackFallbackData = {
    ...data,
    phone: phoneValidation.normalized,
    suburb: serviceArea.normalized,
  };

  try {
    const response = await fetch("/api/callback-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: normalizedData.name,
        phone: normalizedData.phone,
        suburb: normalizedData.suburb,
        page: normalizedData.page || window.location.pathname,
        leadSource: normalizedData.source || "callback-form",
        landingPage: window.location.pathname,
        website: normalizedData.website || "",
        formStartedAt: normalizedData.formStartedAt,
      }),
    });

    if (response.ok) return { success: true, method: "api" };

    let apiError = `Delivery endpoint returned ${response.status}`;
    try {
      const body = await response.json();
      apiError = body.error || body.message || apiError;
    } catch {
      // Preserve the status-based message for non-JSON responses.
    }

    if (response.status === 400 || response.status === 422 || response.status === 429) {
      throw new Error(apiError);
    }

    openCallbackMailtoFallback(normalizedData);
    return { success: false, method: "mailto", error: apiError };
  } catch (err) {
    if (
      err instanceof Error &&
      /Australian phone number|Australian mobile number|South East Queensland|too many|already received|check the form/i.test(err.message)
    ) {
      throw err;
    }

    openCallbackMailtoFallback(normalizedData);
    return {
      success: false,
      method: "mailto",
      error: err instanceof Error ? err.message : "Delivery service unavailable",
    };
  }
}

/** Submit a guide lead through the dedicated Cloudflare route. */
export async function submitGuideFallback(data: GuideFallbackData): Promise<FallbackResult> {
  if (data.name.trim().length < 2) throw new Error("Please enter your name.");
  if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) throw new Error("Please enter a valid email address.");

  let phone = "";
  if (data.phone?.trim()) {
    const phoneValidation = validateAustralianPhone(data.phone);
    if (!phoneValidation.valid) throw new Error(phoneValidation.error);
    phone = phoneValidation.normalized;
  }

  const submissionSignals = assessSubmissionSignals({
    honeypot: data.website,
    startedAt: data.formStartedAt,
  });
  if (!submissionSignals.allowed) {
    throw new Error("We couldn't submit that request. Please check the form and try again.");
  }

  try {
    const response = await fetch("/api/guide-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: phone || undefined,
        leadSource: data.source || "guide-download",
        landingPage: window.location.pathname,
        website: data.website || "",
        formStartedAt: data.formStartedAt,
      }),
    });

    if (response.ok) return { success: true, method: "api" };

    let apiError = `Delivery endpoint returned ${response.status}`;
    try {
      const body = await response.json();
      apiError = body.error || body.message || apiError;
    } catch {
      // Preserve status-based message.
    }
    if (response.status === 400 || response.status === 422 || response.status === 429) {
      throw new Error(apiError);
    }
    return { success: false, method: "mailto", error: apiError };
  } catch (err) {
    if (err instanceof Error && /valid email|Australian phone|too many|already received|check the form/i.test(err.message)) {
      throw err;
    }
    return {
      success: false,
      method: "mailto",
      error: err instanceof Error ? err.message : "Delivery service unavailable",
    };
  }
}

/** Opens a pre-filled email draft. The customer must still press Send. */
export function openMailtoFallback(data: FormData) {
  const subject = encodeURIComponent(
    `Quote Request: ${data.service || "Concreting"} - ${data.name}`
  );
  const body = encodeURIComponent(
    [
      `Hi Concrete Concepts Group,`,
      ``,
      `I'd like to request a quote for the following:`,
      ``,
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Email: ${data.email || "Not provided"}`,
      `Service: ${data.service || "Not specified"}`,
      `Suburb: ${data.suburb || "Not specified"}`,
      ``,
      `Details:`,
      `${data.details || "Please contact me to discuss my project."}`,
      ``,
      `Thank you.`,
    ].join("\n")
  );
  window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
}

/** Opens a pre-filled callback email draft. The customer must still press Send. */
export function openCallbackMailtoFallback(data: CallbackFallbackData) {
  const subject = encodeURIComponent(`Callback Request: ${data.name}`);
  const body = encodeURIComponent([
    "Hi Concrete Concepts Group,",
    "",
    "Please call me back about a concreting project.",
    "",
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Suburb: ${data.suburb || "Not specified"}`,
    `Page: ${data.page || "Website"}`,
  ].join("\n"));
  window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
}

export const CONTACT_INFO = {
  phone: BUSINESS_PHONE,
  phoneHref: `tel:+61424463268`,
  email: BUSINESS_EMAIL,
  emailHref: `mailto:${BUSINESS_EMAIL}`,
};
