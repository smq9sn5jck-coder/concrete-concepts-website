import { useEffect, useState } from "react";

/**
 * Lead source tracking hook.
 * Captures UTM parameters and referrer on first visit, stores in sessionStorage
 * so the data persists across page navigations but resets for new sessions.
 */

const STORAGE_KEY = "cc_lead_source";
const CUSTOMER_WEBSITE_HOSTS = new Set([
  "concreteconceptsgroup.com",
  "www.concreteconceptsgroup.com",
]);

export interface LeadSourceData {
  leadSource: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  fbclid: string | null;
  referrer: string | null;
  landingPage: string | null;
}

declare global {
  interface Window {
    __CCG_CONTEXT_TRACKING_ALLOWED?: boolean;
  }
}

const NEUTRAL_LEAD_SOURCE: LeadSourceData = {
  leadSource: "Direct",
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
  gclid: null,
  fbclid: null,
  referrer: null,
  landingPage: null,
};

function contextTrackingAllowed(): boolean {
  return typeof window === "undefined" || window.__CCG_CONTEXT_TRACKING_ALLOWED !== false;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** Remove preview-only context from persisted attribution without discarding campaigns. */
function removeContextParameter(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value, window.location.origin || "https://concreteconceptsgroup.com");
    if (!parsed.searchParams.has("context")) return value;
    parsed.searchParams.delete("context");
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return parsed.href;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    // An unparseable persisted location is not safe attribution data.
    return null;
  }
}

function sanitizeStoredLeadSource(value: unknown): LeadSourceData | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const landingPage = removeContextParameter(nullableString(record.landingPage));
  const referrer = removeContextParameter(nullableString(record.referrer));
  return {
    leadSource: nullableString(record.leadSource) ?? "Direct",
    utmSource: nullableString(record.utmSource),
    utmMedium: nullableString(record.utmMedium),
    utmCampaign: nullableString(record.utmCampaign),
    utmTerm: nullableString(record.utmTerm),
    utmContent: nullableString(record.utmContent),
    gclid: nullableString(record.gclid),
    fbclid: nullableString(record.fbclid),
    referrer,
    landingPage,
  };
}

function loadStoredLeadSource(): LeadSourceData | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const leadSource = sanitizeStoredLeadSource(JSON.parse(stored));
    if (!leadSource) return null;
    // Repair historical values containing context before they can be sent later.
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(leadSource));
    return leadSource;
  } catch {
    return null;
  }
}

function isInternalCustomerReferrer(referrer: string, currentHostname: string): boolean {
  if (!referrer) return false;
  try {
    const referrerHostname = new URL(referrer).hostname.toLowerCase();
    const normalizedCurrent = currentHostname.toLowerCase();
    return referrerHostname === normalizedCurrent || (
      CUSTOMER_WEBSITE_HOSTS.has(referrerHostname) &&
      CUSTOMER_WEBSITE_HOSTS.has(normalizedCurrent)
    );
  } catch {
    return false;
  }
}

function detectLeadSource(params: URLSearchParams, referrer: string, currentHostname: string): string {
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const gclid = params.get("gclid");
  const gbraid = params.get("gbraid");
  const wbraid = params.get("wbraid");
  const fbclid = params.get("fbclid");

  // Google Ads (paid) — gclid/gbraid/wbraid are auto-tagged by Google Ads
  if (gclid || gbraid || wbraid) {
    return "Google Ads";
  }

  // UTM-based detection
  if (utmSource) {
    const src = utmSource.toLowerCase();
    const med = (utmMedium || "").toLowerCase();

    if (src === "google" && (med === "cpc" || med === "ppc" || med === "paid")) {
      return "Google Ads";
    }
    if (src === "google" && med === "maps") {
      return "Google Maps";
    }
    if (src === "google" && (med === "organic" || med === "")) {
      return "Google Organic";
    }
    if (src === "facebook" || src === "fb" || src === "instagram" || src === "ig") {
      if (med === "cpc" || med === "paid" || med === "ad") {
        return `${src === "instagram" || src === "ig" ? "Instagram" : "Facebook"} Ads`;
      }
      return src === "instagram" || src === "ig" ? "Instagram" : "Facebook";
    }
    if (src === "whatsapp") {
      return "WhatsApp";
    }
    // Generic UTM source
    return `${utmSource}${utmMedium ? ` / ${utmMedium}` : ""}`;
  }

  // Facebook click ID
  if (fbclid) {
    return "Facebook";
  }

  // Referrer-based detection (no UTM params)
  if (referrer) {
    if (isInternalCustomerReferrer(referrer, currentHostname)) {
      return "Direct";
    }
    const ref = referrer.toLowerCase();
    if (ref.includes("google.com") || ref.includes("google.com.au")) {
      return "Google Organic";
    }
    if (ref.includes("facebook.com") || ref.includes("fb.com")) {
      return "Facebook";
    }
    if (ref.includes("instagram.com")) {
      return "Instagram";
    }
    if (ref.includes("bing.com")) {
      return "Bing";
    }
    if (ref.includes("yahoo.com")) {
      return "Yahoo";
    }
    if (ref.includes("maps.google")) {
      return "Google Maps";
    }
    // Other referrer
    return `Referral (${new URL(referrer).hostname})`;
  }

  // No UTM, no referrer — direct visit
  return "Direct";
}

function captureLeadSource(): LeadSourceData {
  const params = new URLSearchParams(window.location.search);
  const referrer = removeContextParameter(document.referrer || "") || "";

  const leadSource = detectLeadSource(params, referrer, window.location.hostname || "");

  return {
    leadSource,
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmTerm: params.get("utm_term"),
    utmContent: params.get("utm_content"),
    gclid: params.get("gclid") || params.get("gbraid") || params.get("wbraid") || null,
    fbclid: params.get("fbclid"),
    referrer: referrer || null,
    landingPage: removeContextParameter(window.location.pathname + window.location.search),
  };
}

export function useLeadSource(): LeadSourceData {
  const [data, setData] = useState<LeadSourceData>(() => {
    if (!contextTrackingAllowed()) return NEUTRAL_LEAD_SOURCE;
    // Check sessionStorage first (already captured this session)
    const stored = loadStoredLeadSource();
    if (stored) return stored;

    // First visit in this session — capture now
    const captured = captureLeadSource();

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
    } catch {
      // sessionStorage not available
    }

    return captured;
  });

  return data;
}

/**
 * Get lead source data without a hook (for use outside React components)
 */
export function getLeadSourceData(): LeadSourceData {
  if (!contextTrackingAllowed()) return NEUTRAL_LEAD_SOURCE;
  const stored = loadStoredLeadSource();
  if (stored) return stored;

  // Capture fresh if not stored
  const captured = captureLeadSource();
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
  } catch {
    // ignore
  }
  return captured;
}
