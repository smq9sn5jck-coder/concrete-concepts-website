import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GOOGLE_ADS_CONVERSION_IDS } from "./google-ads";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const TRACKED_COMPONENTS = [
  "../components/Footer.tsx",
  "../components/HeroSection.tsx",
  "../components/MobileBar.tsx",
  "../components/Navbar.tsx",
  "../components/QuoteForm.tsx",
];

describe("lead event isolation", () => {
  it("uses the verified live Google Ads conversion labels", () => {
    expect(GOOGLE_ADS_CONVERSION_IDS.quoteForm).toBe(
      "AW-18007005419/oPHGCJSGt44cEOuxtIpD"
    );
    expect(GOOGLE_ADS_CONVERSION_IDS.clickToCall).toBe(
      "AW-18007005419/KuCJCPSeyo4cEOuxtIpD"
    );
  });

  it("removes all readable placeholder labels from tracked components", () => {
    const combinedSource = TRACKED_COMPONENTS.map(source).join("\n");

    expect(combinedSource).not.toContain("AW-18007005419/quote_submission");
    expect(combinedSource).not.toContain("AW-18007005419/phone_call_click");
  });

  it("keeps the existing quote form as the only source of the Google Ads quote conversion", () => {
    const quoteForm = source("../components/QuoteForm.tsx");
    const referralForm = source("../components/ReferralForm.tsx");
    const cgsForm = source("../components/CGSForm.tsx");
    const nonSubmissionComponents = [
      "../components/Footer.tsx",
      "../components/HeroSection.tsx",
      "../components/MobileBar.tsx",
      "../components/Navbar.tsx",
    ].map(source);

    expect(quoteForm).toContain("customer_quote_submitted");
    expect(quoteForm).toContain("GOOGLE_ADS_CONVERSION_IDS.quoteForm");
    expect(referralForm).not.toContain("GOOGLE_ADS_CONVERSION_IDS.quoteForm");
    expect(cgsForm).not.toContain("GOOGLE_ADS_CONVERSION_IDS.quoteForm");
    nonSubmissionComponents.forEach(componentSource => {
      expect(componentSource).not.toContain(
        "GOOGLE_ADS_CONVERSION_IDS.quoteForm"
      );
    });
  });

  it("uses separate success event names for each non-quote journey", () => {
    const referralForm = source("../components/ReferralForm.tsx");
    const cgsForm = source("../components/CGSForm.tsx");

    expect(referralForm).toContain("trade_referral_submitted");
    expect(referralForm).not.toContain("cgs_growth_enquiry_submitted");
    expect(cgsForm).toContain("cgs_growth_enquiry_submitted");
    expect(cgsForm).not.toContain("trade_referral_submitted");
  });
});
