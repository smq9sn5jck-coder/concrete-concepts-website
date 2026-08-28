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

export const CONTACT_INFO = {
  phone: BUSINESS_PHONE,
  phoneHref: `tel:+61424463268`,
  email: BUSINESS_EMAIL,
  emailHref: `mailto:${BUSINESS_EMAIL}`,
};
