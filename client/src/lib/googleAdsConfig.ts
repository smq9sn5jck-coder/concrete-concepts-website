/**
 * Google Ads Configuration
 * 
 * Centralizes all Google Ads tracking IDs and conversion labels.
 * Primary conversion labels come from environment variables. Approved
 * observation-only actions use their verified Google Ads labels directly.
 * 
 * HOW TO SET UP:
 * 1. Go to Google Ads → Tools & Settings → Conversions
 * 2. Create conversion actions for each event type
 * 3. Copy the conversion label (e.g., "AbCdEfGhIjKl") from the tag snippet
 * 4. Set the environment variables in your project settings:
 *    - VITE_GADS_LABEL_QUOTE = "AbCdEfGhIjKl"
 *    - VITE_GADS_LABEL_PHONE = "MnOpQrStUvWx"
 *    - etc.
 */

// Google Ads Account ID — already configured and verified
export const GOOGLE_ADS_ID = "AW-18007005419";

// Conversion labels — set via env vars in Settings → Secrets
// Format: "AW-{account_id}/{label}" for send_to parameter
export const CONVERSION_LABELS = {
  /** Quote form submission — highest value conversion */
  QUOTE_SUBMISSION: `${GOOGLE_ADS_ID}/${import.meta.env.VITE_GADS_LABEL_QUOTE || "quote_submission"}`,
  
  /** Phone call click — tel: link clicks */
  PHONE_CALL: `${GOOGLE_ADS_ID}/${import.meta.env.VITE_GADS_LABEL_PHONE || "phone_call_click"}`,
  
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

// Meta Pixel ID — set via env var (optional, only needed if running Meta/Facebook ads)
export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "";

/**
 * Helper to check if Google Ads tracking is properly configured
 * (i.e., at least one real conversion label has been set)
 */
export function isGoogleAdsConfigured(): boolean {
  return Object.values(CONVERSION_LABELS).some(
    (label) => !label.endsWith("_submission") && !label.endsWith("_click") && !label.endsWith("_request") && !label.endsWith("_download")
  );
}
