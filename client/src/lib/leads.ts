export type LeadEventName =
  | "customer_quote_submitted"
  | "trade_referral_submitted"
  | "cgs_growth_enquiry_submitted";

export type LeadType =
  | "concrete_quote"
  | "trade_referral"
  | "cgs_growth_enquiry";

export interface LeadAttribution {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  gclid: string;
  landingPage: string;
  referringUrl: string;
  capturedAt: string;
}

export interface LeadEventDetail {
  requestId: string;
  leadType: LeadType;
  [key: string]: string | number | boolean | undefined;
}

const ATTRIBUTION_KEY = "ccg:first-touch-attribution";

function cleanParameter(value: string | null, maxLength = 500) {
  return (value || "").trim().slice(0, maxLength);
}

export function readAttribution(): LeadAttribution | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    return value ? (JSON.parse(value) as LeadAttribution) : null;
  } catch {
    return null;
  }
}

export function captureAttribution(): LeadAttribution {
  if (typeof window === "undefined") {
    return {
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      utmTerm: "",
      gclid: "",
      landingPage: "",
      referringUrl: "",
      capturedAt: new Date().toISOString(),
    };
  }

  const stored = readAttribution();
  if (stored) return stored;

  const params = new URLSearchParams(window.location.search);
  const attribution: LeadAttribution = {
    utmSource: cleanParameter(params.get("utm_source"), 200),
    utmMedium: cleanParameter(params.get("utm_medium"), 200),
    utmCampaign: cleanParameter(params.get("utm_campaign"), 200),
    utmContent: cleanParameter(params.get("utm_content"), 200),
    utmTerm: cleanParameter(params.get("utm_term"), 200),
    gclid: cleanParameter(params.get("gclid"), 300),
    landingPage: window.location.href.slice(0, 2000),
    referringUrl: document.referrer.slice(0, 2000),
    capturedAt: new Date().toISOString(),
  };

  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // Attribution should never block a lead form.
  }

  return attribution;
}

export function normalizeAustralianPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  const international = digits.startsWith("61")
    ? digits
    : digits.startsWith("0")
      ? `61${digits.slice(1)}`
      : "";

  if (!/^61[23478]\d{8}$/.test(international)) return null;
  if (/^(\d)\1+$/.test(international.slice(2))) return null;

  return `+${international}`;
}

export function createRequestId(prefix: "quote" | "referral" | "cgs") {
  const randomValue =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID().replaceAll("-", "")
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${randomValue}`;
}

export function emitLeadEvent(event: LeadEventName, detail: LeadEventDetail) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("ccg:lead", {
      detail: { event, ...detail },
    })
  );

  try {
    const analyticsWindow = window as Window & {
      dataLayer?: Array<Record<string, unknown>>;
    };
    analyticsWindow.dataLayer?.push({ event, ...detail });
  } catch {
    // Analytics failures must not affect lead delivery.
  }
}
