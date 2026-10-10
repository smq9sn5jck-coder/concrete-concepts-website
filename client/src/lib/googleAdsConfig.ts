/**
 * CCG Google Ads destinations. Conversion labels are public identifiers, not
 * credentials. Primary defaults were verified against account 6553093174 on
 * 2026-10-10; valid VITE_GADS_LABEL_* overrides remain supported.
 */
export const GOOGLE_ADS_ID = "AW-18007005419";

const PLACEHOLDER_LABEL = /^(quote_submission|phone_call_click|callback_request|guide_download|whatsapp_click|sms_click|visualiser_lead)$/;

function resolveConversionLabel(candidate: string | undefined, verifiedDefault: string): string {
  const label = candidate?.trim() ?? "";
  return /^[a-zA-Z0-9_-]+$/.test(label) && !PLACEHOLDER_LABEL.test(label)
    ? label
    : verifiedDefault;
}

// Exact public labels from the current Google Ads action tag snippets.
export const CONVERSION_LABELS = {
  /** Complete, server-confirmed quote submission. */
  QUOTE_SUBMISSION: `${GOOGLE_ADS_ID}/${resolveConversionLabel(import.meta.env.VITE_GADS_LABEL_QUOTE, "oPHGCJSGt44cEOuxtIpD")}`,

  /** Telephone-link click: contact intent, not proof of a connected call. */
  PHONE_CALL: `${GOOGLE_ADS_ID}/${resolveConversionLabel(import.meta.env.VITE_GADS_LABEL_PHONE, "KuCJCPSeyo4cEOuxtIpD")}`,

  /** Verified secondary contact and engagement actions. */
  WHATSAPP: `${GOOGLE_ADS_ID}/weRUCPeE_ekcEOuxtIpD`,
  SMS: `${GOOGLE_ADS_ID}/26ZACIWn9OkcEOuxtIpD`,
  CALLBACK: `${GOOGLE_ADS_ID}/NL8kCPSE_ekcEOuxtIpD`,
  GUIDE_DOWNLOAD: `${GOOGLE_ADS_ID}/nv9wCKed_ekcEOuxtIpD`,
  VISUALISER: `${GOOGLE_ADS_ID}/MyywCIin9OkcEOuxtIpD`,
} as const;

export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "";

/** Every configured destination must have a non-placeholder label. */
export function isGoogleAdsConfigured(): boolean {
  return Object.values(CONVERSION_LABELS).every((destination) => {
    const label = destination.slice(GOOGLE_ADS_ID.length + 1);
    return destination.startsWith(`${GOOGLE_ADS_ID}/`)
      && /^[a-zA-Z0-9_-]+$/.test(label)
      && !PLACEHOLDER_LABEL.test(label);
  });
}
