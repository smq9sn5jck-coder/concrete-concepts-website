import { useEffect, useState } from "react";

/**
 * Lead source tracking hook.
 * Captures UTM parameters and referrer on first visit, stores in sessionStorage
 * so the data persists across page navigations but resets for new sessions.
 */

const STORAGE_KEY = "cc_lead_source";

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

function detectLeadSource(params: URLSearchParams, referrer: string): string {
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
  const referrer = document.referrer || "";

  const leadSource = detectLeadSource(params, referrer);

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
    landingPage: window.location.pathname + window.location.search,
  };
}

export function useLeadSource(): LeadSourceData {
  const [data, setData] = useState<LeadSourceData>(() => {
    // Check sessionStorage first (already captured this session)
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // sessionStorage not available
    }

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
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // sessionStorage not available
  }

  // Capture fresh if not stored
  const captured = captureLeadSource();
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
  } catch {
    // ignore
  }
  return captured;
}
