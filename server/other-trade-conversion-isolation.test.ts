import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(import.meta.dirname, "..", relativePath), "utf8");

function extractFunction(source: string, name: string) {
  const start = source.indexOf(`async function ${name}`);
  if (start < 0) return "";
  const next = source.indexOf("\nasync function ", start + 1);
  return source.slice(start, next < 0 ? source.length : next);
}

describe("Release 3A conversion and data isolation", () => {
  it("contains no quote, referral, Google Ads, or Meta Lead conversion marker in the new page and helper", () => {
    const page = read("client/src/pages/NeedAnotherTradePage.tsx");
    const sources = [
      page,
      read("shared/otherTrade.ts"),
      read("client/src/lib/formFallback.ts").match(/export async function submitOtherTradeFallback[\s\S]*?\n}/)?.[0] ?? "",
    ].join("\n");
    for (const marker of [
      "trackQuoteConversion",
      "trackReferralSubmission",
      "gtag('event', 'conversion')",
      'gtag("event", "conversion")',
      "7546454804",
      "Quote Form Submission",
      "fbq('track', 'Lead')",
      'fbq("track", "Lead")',
      "Meta Lead",
    ]) expect(sources).not.toContain(marker);
    expect(page).toContain("event.stopPropagation()");
    expect(page).toContain("event.nativeEvent.stopImmediatePropagation()");
  });

  it("uses a dedicated handler with no Jotform, quote, callback, guide, provider, webhook, or disclosure operation", () => {
    const worker = read("client/public/_worker.js");
    const handler = extractFunction(worker, "handleOtherTradeSubmit");
    expect(handler).toContain("INSERT INTO other_trade_leads");
    expect(handler).not.toContain("backupToJotform");
    expect(handler).not.toContain("handleQuoteSubmit");
    expect(handler).not.toContain("handleCallbackSubmit");
    expect(handler).not.toContain("handleGuideSubmit");
    expect(handler).not.toContain("other_trade_disclosures");
    expect(handler).not.toMatch(/provider[^\n]*(fetch|email|webhook)/i);
    expect(worker).toContain('path === "/api/other-trade-submit"');
  });

  it("keeps get-quote as the unchanged primary-conversion owner", () => {
    const app = read("client/src/App.tsx");
    const quotePage = read("client/src/pages/GetQuote.tsx");
    const wizard = read("client/src/components/quote/ComprehensiveQuoteWizard.tsx");
    expect(app).toContain('path={"/get-quote"} component={GetQuote}');
    expect(quotePage).toContain("ComprehensiveQuoteWizard");
    expect(wizard).toContain("trackQuoteConversion");
    expect(read("client/src/pages/NeedAnotherTradePage.tsx")).not.toContain("trackQuoteConversion");
  });

  it("normal and preview builds generate one shared gate with default production off", () => {
    const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
    expect(packageJson.scripts.build).toContain("other-trade:generate");
    expect(packageJson.scripts["build:other-trade-preview"]).toContain("VITE_OTHER_TRADE_PREVIEW=true");
    expect(packageJson.scripts["build:other-trade-preview"]).toContain("pnpm run build");
    expect(packageJson.scripts.build).not.toContain("VITE_OTHER_TRADE_PREVIEW=true");
    const generated = read("client/public/other-trade-config.js");
    expect(generated).toContain("GENERATED_OTHER_TRADE_PREVIEW_ENABLED = false");
  });

  it("does not add Release 3B disclosure behavior or public provider operations", () => {
    const worker = read("client/public/_worker.js");
    const app = read("client/src/App.tsx");
    for (const forbidden of [
      "/api/other-trade-disclose",
      "/api/provider",
      "handleOtherTradeDisclosure",
      "issueProviderPhotoToken",
      "sendProviderEmail",
    ]) {
      expect(worker).not.toContain(forbidden);
      expect(app).not.toContain(forbidden);
    }
  });
});
