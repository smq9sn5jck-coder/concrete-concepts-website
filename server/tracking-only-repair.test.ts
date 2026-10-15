import { afterEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const BASE = "a2c3d2761d25e9d5cc5aa5ee9be4a6df607deac0";
const QUOTE = "AW-18007005419/oPHGCJSGt44cEOuxtIpD";
const PHONE = "AW-18007005419/KuCJCPSeyo4cEOuxtIpD";

async function load(quote: string | undefined = undefined, phone: string | undefined = undefined) {
  vi.resetModules();
  vi.stubEnv("VITE_GADS_LABEL_QUOTE", quote);
  vi.stubEnv("VITE_GADS_LABEL_PHONE", phone);
  return import("../client/src/lib/googleAdsConfig");
}

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules(); });

describe("approved tracking-only repair", () => {
  it.each([undefined, "", " ", "quote_submission", "phone_call_click", "wrong_action_123", "AW-999/wrong", "<invalid>", " oPHGCJSGt44cEOuxtIpD "])("uses only approved CCG destinations despite environment value %s", async candidate => {
    const { CONVERSION_LABELS, GOOGLE_ADS_ID, isGoogleAdsConfigured } = await load(candidate, candidate);
    expect(GOOGLE_ADS_ID).toBe("AW-18007005419");
    expect(CONVERSION_LABELS.QUOTE_SUBMISSION).toBe(QUOTE);
    expect(CONVERSION_LABELS.PHONE_CALL).toBe(PHONE);
    expect(isGoogleAdsConfigured()).toBe(true);
    expect(CONVERSION_LABELS).toMatchObject({
      WHATSAPP: "AW-18007005419/weRUCPeE_ekcEOuxtIpD",
      SMS: "AW-18007005419/26ZACIWn9OkcEOuxtIpD",
      CALLBACK: "AW-18007005419/NL8kCPSE_ekcEOuxtIpD",
      GUIDE_DOWNLOAD: "AW-18007005419/nv9wCKed_ekcEOuxtIpD",
      VISUALISER: "AW-18007005419/MyywCIin9OkcEOuxtIpD",
    });
  });

  it("keeps Meta configuration separate", async () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "unit-only-meta");
    const config = await load();
    expect(config.META_PIXEL_ID).toBe("unit-only-meta");
  });

  it("sends each confirmed quote once with the server transaction ID, using only a mock gtag", async () => {
    await load();
    const gtag = vi.fn(); const dataLayer: unknown[] = [];
    vi.stubGlobal("window", { gtag, dataLayer });
    const { trackQuoteConversion } = await import("../client/src/components/ConversionTracking");
    const confirmation = { quoteId: "unit-tracking-1", transactionId: "CCG-unit-tracking-1" };
    trackQuoteConversion(confirmation); trackQuoteConversion(confirmation);
    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith("event", "conversion", { send_to: QUOTE, value: 1, currency: "AUD", transaction_id: confirmation.transactionId });
    expect(dataLayer).toHaveLength(1);
  });

  it("sends call/callback/SMS/WhatsApp/guide/visualiser intents only to their distinct secondary destinations", async () => {
    const { CONVERSION_LABELS } = await load();
    const gtag = vi.fn(); const dataLayer: unknown[] = [];
    vi.stubGlobal("window", { gtag, dataLayer });
    const actions = await import("../client/src/components/ConversionTracking");
    actions.trackPhoneCallClick(); actions.trackCallbackConversion(); actions.trackTextMessageClick(); actions.trackWhatsAppClick(); actions.trackGuideDownload(); actions.trackVisualiserLeadConversion();
    const sent = gtag.mock.calls.filter(call => call[0] === "event" && call[1] === "conversion").map(call => call[2].send_to);
    expect(sent).toEqual([PHONE, CONVERSION_LABELS.CALLBACK, CONVERSION_LABELS.SMS, CONVERSION_LABELS.WHATSAPP, CONVERSION_LABELS.GUIDE_DOWNLOAD, CONVERSION_LABELS.VISUALISER]);
    expect(sent).not.toContain(QUOTE);
    expect(dataLayer).toHaveLength(0);
  });

  it("emits nothing when the existing preview/context gate is closed", async () => {
    await load(); const gtag = vi.fn(); const dataLayer: unknown[] = [];
    vi.stubGlobal("window", { gtag, dataLayer, __CCG_CONTEXT_TRACKING_ALLOWED: false });
    const actions = await import("../client/src/components/ConversionTracking");
    actions.trackQuoteConversion({ quoteId: "unit-denied", transactionId: "unit-denied" }); actions.trackPhoneCallClick();
    expect(gtag).not.toHaveBeenCalled(); expect(dataLayer).toHaveLength(0);
  });

  it.each([
    "client/src/components/ConversionTracking.tsx", "client/src/components/quote/ComprehensiveQuoteWizard.tsx",
    "client/src/lib/quoteDraft.ts", "client/src/lib/formFallback.ts", "client/src/lib/contextTrackingGate.ts",
    "client/index.html", "client/public/_worker.js", "client/public/bayside-production-policy.js",
    "server/routers.ts", "server/email.ts", "shared/quoteBrief.ts", "shared/leadValidation.ts",
    "client/public/sitemap.xml", "client/src/generated/baysideSoutheastConfig.ts", "shared/baysideSoutheastPublication.ts",
  ])("preserves protected source byte-for-byte: %s", path => {
    const baseline = execFileSync("git", ["show", `${BASE}:${path}`], { cwd: ROOT, encoding: "utf8" });
    expect(readFileSync(resolve(ROOT, path), "utf8")).toBe(baseline);
  });
});
