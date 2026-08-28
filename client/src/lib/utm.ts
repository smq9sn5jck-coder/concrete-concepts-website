/**
 * UTM Parameter Capture & Persistence
 *
 * Captures UTM parameters, gclid, fbclid, referrer, and landing page on first visit.
 * Persists in sessionStorage so the data survives page navigation within the same session.
 * Attached to every form submission for lead-to-revenue attribution.
 */

const UTM_STORAGE_KEY = "ccg_utm_data";

export interface UtmData {
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

/**
 * Capture UTM params from the current URL and store in sessionStorage.
 * Only captures on first page load (doesn't overwrite if already stored).
 * Call this once in your app root (e.g., App.tsx or main.tsx).
 */
export function captureUtmParams(): void {
  try {
    // Don't overwrite existing UTM data in this session
    const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (existing) return;

    const params = new URLSearchParams(window.location.search);

    const utmData: UtmData = {
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      utmTerm: params.get("utm_term"),
      utmContent: params.get("utm_content"),
      gclid: params.get("gclid"),
      fbclid: params.get("fbclid"),
      referrer: document.referrer || null,
      landingPage: window.location.pathname + window.location.search,
    };

    // Only store if there's at least some attribution data
    const hasData = Object.values(utmData).some((v) => v !== null && v !== "");
    if (hasData) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
    } else {
      // Still store referrer and landing page even without UTM params
      // This captures organic/direct traffic attribution
      sessionStorage.setItem(
        UTM_STORAGE_KEY,
        JSON.stringify({
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
          utmTerm: null,
          utmContent: null,
          gclid: null,
          fbclid: null,
          referrer: document.referrer || null,
          landingPage: window.location.pathname,
        })
      );
    }
  } catch {
    // sessionStorage might be unavailable (private browsing, etc.)
  }
}

/**
 * Retrieve stored UTM data for form submissions.
 * Returns an object with all UTM fields (null if not captured).
 */
export function getUtmData(): UtmData {
  const empty: UtmData = {
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

  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return empty;
    return { ...empty, ...JSON.parse(stored) };
  } catch {
    return empty;
  }
}
