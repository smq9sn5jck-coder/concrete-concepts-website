/**
 * Google Ads Configuration
 *
 * Quote and phone destinations are fixed to CCG action tags verified on
 * 2026-10-15. These are public identifiers, not credentials. Historical
 * VITE_GADS_LABEL_QUOTE / VITE_GADS_LABEL_PHONE overrides are intentionally
 * ignored; destination changes require a reviewed source change.
 * Every build checks the actual quote and phone property mappings.
 */

// Google Ads Account ID — already configured and verified
export const GOOGLE_ADS_ID = "AW-18007005419";

// Format: "AW-{account_id}/{label}" for send_to parameter
export const CONVERSION_LABELS = {
  /** Complete server-confirmed quote — primary action */
  QUOTE_SUBMISSION: "AW-18007005419/oPHGCJSGt44cEOuxtIpD",

  /** Secondary telephone-link click — not proof of a connected call */
  PHONE_CALL: "AW-18007005419/KuCJCPSeyo4cEOuxtIpD",

  /** WhatsApp click — verified secondary Google Ads action */
  WHATSAPP: `${GOOGLE_ADS_ID}/weRUCPeE_ekcEOuxtIpD`,

  /** SMS/text click — verified secondary Google Ads action */
  SMS: `${GOOGLE_ADS_ID}/26ZACIWn9OkcEOuxtIpD`,

  /** Callback request — verified secondary Google Ads action */
  CALLBACK: `${GOOGLE_ADS_ID}/NL8kCPSE_ekcEOuxtIpD`,

  /** Guide download — verified secondary Google Ads action */
  GUIDE_DOWNLOAD: `${GOOGLE_ADS_ID}/nv9wCKed_ekcEOuxtIpD`,

  /** AI visualiser lead capture — verified secondary Google Ads action */
  VISUALISER: `${GOOGLE_ADS_ID}/MyywCIin9OkcEOuxtIpD`,
} as const;

// Meta Pixel ID — unchanged optional configuration
export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "";

/** At least one real conversion label has been set (existing helper semantics). */
export function isGoogleAdsConfigured(): boolean {
  return Object.values(CONVERSION_LABELS).some(
    (label) => !label.endsWith("_submission") && !label.endsWith("_click") && !label.endsWith("_request") && !label.endsWith("_download")
  );
}
