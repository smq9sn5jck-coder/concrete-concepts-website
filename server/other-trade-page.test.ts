import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  OTHER_TRADE_CONSENT_TEXT,
  OTHER_TRADE_CONSENT_VERSION,
  OTHER_TRADE_CATEGORIES,
  OTHER_TRADE_TIMEFRAMES,
} from "../shared/otherTrade";
import {
  GENERATED_OTHER_TRADE_CONSENT_TEXT,
  GENERATED_OTHER_TRADE_CONSENT_TEXT_SHA256,
  GENERATED_OTHER_TRADE_CONSENT_VERSION,
  GENERATED_OTHER_TRADE_PREVIEW_ENABLED,
} from "../client/public/other-trade-config.js";
import { getSeoMetadata, renderOtherTradeContentShell } from "../client/public/seo-manifest.js";
import { otherTradeErrorFieldId } from "../client/src/pages/NeedAnotherTradePage";

const read = (relativePath: string) => readFileSync(resolve(import.meta.dirname, "..", relativePath), "utf8");

describe("Release 3A Need Another Trade page contract", () => {
  it("maps custom validation failures to the relevant accessible control", () => {
    expect(otherTradeErrorFieldId("Enter an Australian mobile number beginning with 04.")).toBe("other-mobile");
    expect(otherTradeErrorFieldId("We currently review requests in Brisbane and South East Queensland.")).toBe("other-location");
    expect(otherTradeErrorFieldId("Confirm the current provider-sharing consent before submitting.")).toBe("provider-consent");
    expect(otherTradeErrorFieldId("We couldn't confirm this request.")).toBe("other-form-error");
  });

  it("defines exactly the approved categories, timeframes, consent wording, and version in one typed source", () => {
    expect(OTHER_TRADE_CATEGORIES).toEqual([
      "Plumbing",
      "Blockwork / bricklaying",
      "Electrical",
      "Excavation / earthworks",
      "Landscaping",
      "Carpentry",
      "Roofing",
      "Other",
    ]);
    expect(OTHER_TRADE_TIMEFRAMES).toEqual([
      "Urgent",
      "Within 1 week",
      "2–4 weeks",
      "1–3 months",
      "Flexible",
    ]);
    expect(OTHER_TRADE_CONSENT_TEXT).toBe("I consent to Concrete Concepts Group reviewing this request and, if CCG chooses, sharing the contact details, job information and photos I provided with one suitable independent service provider so that provider can contact me about this request. I understand that CCG has not guaranteed a provider, availability, price, licensing, workmanship or response time.");
    expect(OTHER_TRADE_CONSENT_VERSION).toBe("other-trade-consent-v1-2026-09-20");
  });

  it("generates Worker consent values and the build-time route flag from the shared source", () => {
    expect(GENERATED_OTHER_TRADE_CONSENT_TEXT).toBe(OTHER_TRADE_CONSENT_TEXT);
    expect(GENERATED_OTHER_TRADE_CONSENT_VERSION).toBe(OTHER_TRADE_CONSENT_VERSION);
    expect(GENERATED_OTHER_TRADE_CONSENT_TEXT_SHA256).toMatch(/^[a-f0-9]{64}$/);
    expect(GENERATED_OTHER_TRADE_PREVIEW_ENABLED).toBe(false);
    const generator = read("scripts/generateOtherTradeConfig.ts");
    expect(generator).toContain("VITE_OTHER_TRADE_PREVIEW");
    expect(generator).toContain("OTHER_TRADE_CONSENT_TEXT");
    expect(generator).toContain("createHash(\"sha256\")");
  });

  it("renders a premium two-choice form with exact copy and accessible validation targets", () => {
    const page = read("client/src/pages/NeedAnotherTradePage.tsx");
    expect(page).toContain("Need another trade?");
    expect(page).toContain("Concreting quote");
    expect(page).toContain("Another trade request");
    expect(page).toContain('href="/get-quote"');
    expect(page).toContain("OTHER_TRADE_CATEGORIES.map");
    expect(page).toContain("OTHER_TRADE_TIMEFRAMES.map");
    expect(page).toContain("This is not an emergency service and no response time is guaranteed. If there is an immediate risk to life or property, call 000 or contact an appropriately licensed emergency provider.");
    expect(page).toContain("Request received for CCG review");
    expect(page).toContain("A provider or response is not guaranteed.");
    expect(page).toContain("You can retry without losing the details above, or call 0424 463 268.");
    expect(page).toContain("aria-describedby");
    expect(page).toContain("aria-invalid");
    expect(page).toContain("focus()");
    expect(page).toContain('defaultChecked={false}');
    expect(page).toContain("formStartedAt");
    expect(page).toContain('name="website"');
    expect(page).toContain('purpose: "other-trade"');
    expect(page).toContain("Remove photo");
    expect(page).toContain("submitOtherTradeFallback");
  });

  it("keeps the form state on endpoint failure and never creates a PII mailto fallback", () => {
    const page = read("client/src/pages/NeedAnotherTradePage.tsx");
    const fallback = read("client/src/lib/formFallback.ts");
    expect(page).not.toMatch(/catch[\s\S]{0,500}setFormData\(/);
    expect(fallback).toContain("export async function submitOtherTradeFallback");
    expect(fallback).toContain('fetch("/api/other-trade-submit"');
    const helper = fallback.match(/export async function submitOtherTradeFallback[\s\S]*?\n}/)?.[0] ?? "";
    expect(helper).not.toContain("mailto:");
    expect(helper).not.toContain("openMailtoFallback");
    expect(helper).not.toContain("photoUrls.join");
  });

  it("gates both client routes behind the same generated preview flag while preserving production referral", () => {
    const app = read("client/src/App.tsx");
    expect(app).toContain("GENERATED_OTHER_TRADE_PREVIEW_ENABLED");
    expect(app).toContain('path={"/need-another-trade"}');
    expect(app).toContain('path={"/referral"}');
    expect(app).toContain("NeedAnotherTradePage");
    expect(app).toContain("ReferralPage");
    expect(app).toContain("ReferralPreviewRedirect");
  });

  it("provides explicit noindex metadata, a self canonical, and useful raw HTML without sitemap publication", () => {
    const meta = getSeoMetadata("/need-another-trade", true);
    expect(meta.title).toBe("Need Another Trade? | CCG Review Request");
    expect(meta.description).toMatch(/CCG review/i);
    expect(meta.canonical).toBe("https://concreteconceptsgroup.com/need-another-trade");
    expect(meta.robots).toBe("noindex, nofollow");
    const shell = renderOtherTradeContentShell("/need-another-trade", true);
    expect(shell).toContain("<h1>Need another trade?</h1>");
    expect(shell).toContain("Concreting quote");
    expect(shell).toContain("Another trade request");
    expect(shell).toContain("one suitable independent service provider");
    expect(read("client/public/sitemap.xml")).not.toContain("/need-another-trade");
    expect(read("client/public/sitemap.xml")).toContain("/referral");
    expect(renderOtherTradeContentShell("/need-another-trade", false)).toBe("");
  });

  it("updates privacy wording with consent-version parity and no automatic forwarding promise", () => {
    const privacy = read("client/src/pages/PrivacyPolicy.tsx");
    expect(privacy).toContain("OTHER_TRADE_CONSENT_VERSION");
    expect(privacy).toContain("optional photos");
    expect(privacy).toContain("one suitable independent service provider");
    expect(privacy).toContain("not automatically forwarded");
    expect(privacy).toContain("independent provider");
    expect(privacy).toContain("disclosure record");
    expect(privacy).toContain("withdraw consent before disclosure");
    expect(privacy).toContain("access, correction, or deletion");
    expect(privacy).toContain("retention");
  });
});
