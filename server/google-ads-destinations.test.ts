import { afterEach, describe, expect, it, vi } from "vitest";

const quoteDestination = "AW-18007005419/oPHGCJSGt44cEOuxtIpD";
const phoneDestination = "AW-18007005419/KuCJCPSeyo4cEOuxtIpD";

async function loadConfig(quote = "", phone = "") {
  vi.resetModules();
  vi.stubEnv("VITE_GADS_LABEL_QUOTE", quote);
  vi.stubEnv("VITE_GADS_LABEL_PHONE", phone);
  return import("../client/src/lib/googleAdsConfig");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("Verified CCG Google Ads destinations", () => {
  it("uses the account-verified quote and phone destinations when build variables are absent", async () => {
    const { CONVERSION_LABELS, isGoogleAdsConfigured } = await loadConfig();
    expect(CONVERSION_LABELS.QUOTE_SUBMISSION).toBe(quoteDestination);
    expect(CONVERSION_LABELS.PHONE_CALL).toBe(phoneDestination);
    expect(isGoogleAdsConfigured()).toBe(true);
  });

  it.each(["quote_submission", "phone_call_click", "callback_request", "guide_download", "whatsapp_click", "sms_click", "visualiser_lead"])("never sends descriptive placeholder %s", async (placeholder) => {
    const { CONVERSION_LABELS } = await loadConfig(placeholder, placeholder);
    expect(CONVERSION_LABELS.QUOTE_SUBMISSION).toBe(quoteDestination);
    expect(CONVERSION_LABELS.PHONE_CALL).toBe(phoneDestination);
  });

  it.each([" ", "bad label", "AW-18007005419/wrong", "<invalid>"])("falls back safely for invalid build label %s", async (label) => {
    const { CONVERSION_LABELS } = await loadConfig(label, label);
    expect(CONVERSION_LABELS.QUOTE_SUBMISSION).toBe(quoteDestination);
    expect(CONVERSION_LABELS.PHONE_CALL).toBe(phoneDestination);
  });

  it("preserves a valid explicit deployment override and trims surrounding whitespace", async () => {
    const { CONVERSION_LABELS } = await loadConfig(" alternateQuote_123 ", "alternatePhone-456");
    expect(CONVERSION_LABELS.QUOTE_SUBMISSION).toBe("AW-18007005419/alternateQuote_123");
    expect(CONVERSION_LABELS.PHONE_CALL).toBe("AW-18007005419/alternatePhone-456");
  });

  it("sends one confirmed quote event to the verified destination with its stable transaction ID", async () => {
    await loadConfig();
    const gtag = vi.fn();
    const dataLayer: unknown[] = [];
    vi.stubGlobal("window", { gtag, dataLayer });
    const { trackQuoteConversion } = await import("../client/src/components/ConversionTracking");
    const confirmation = { quoteId: "unit-quote-1", transactionId: "CCG-unit-quote-1" };
    trackQuoteConversion(confirmation);
    trackQuoteConversion(confirmation);
    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith("event", "conversion", {
      send_to: quoteDestination, value: 1, currency: "AUD", transaction_id: confirmation.transactionId,
    });
    expect(dataLayer).toHaveLength(1);
  });
});
