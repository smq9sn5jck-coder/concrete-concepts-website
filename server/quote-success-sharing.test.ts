import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const wizardPath = resolve(
  __dirname,
  "../client/src/components/quote/ComprehensiveQuoteWizard.tsx"
);
const sharePath = resolve(
  __dirname,
  "../client/src/components/quote/QuoteSuccessShare.tsx"
);

const wizardSource = readFileSync(wizardPath, "utf8");
const shareSource = existsSync(sharePath) ? readFileSync(sharePath, "utf8") : "";

describe("approved quote-success sharing experience", () => {
  it("renders a secondary Share CCG action only inside the verified-success branch", () => {
    expect(existsSync(sharePath)).toBe(true);
    expect(wizardSource).toContain('import QuoteSuccessShare from "./QuoteSuccessShare"');
    expect(wizardSource).toMatch(/if \(submitted\)[\s\S]*Need help sooner\?[\s\S]*<QuoteSuccessShare \/>/);
    expect(wizardSource.indexOf("<QuoteSuccessShare />")).toBeGreaterThan(
      wizardSource.indexOf("if (submitted)")
    );
  });

  it("shares only the approved truthful public homepage payload", () => {
    expect(shareSource).toContain('CCG_SHARE_URL = "https://concreteconceptsgroup.com/"');
    expect(shareSource).toContain('title: "Concrete Concepts Group"');
    expect(shareSource).toContain(
      'text: "Looking for concreting in Brisbane or South East Queensland? Take a look at Concrete Concepts Group."'
    );
    expect(shareSource).toContain("url: CCG_SHARE_URL");
    expect(shareSource).not.toMatch(/reward|discount|guarantee|quote data|customerFirstName/i);
  });

  it("prefers native Web Share and falls back to the canonical clipboard link", () => {
    expect(shareSource).toContain('typeof navigator.share === "function"');
    expect(shareSource).toContain("await navigator.share(SHARE_PAYLOAD)");
    expect(shareSource).toContain("navigator.clipboard?.writeText");
    expect(shareSource).toContain("await navigator.clipboard.writeText(CCG_SHARE_URL)");
    expect(shareSource).toContain("Link copied — you can paste it anywhere.");
  });

  it("treats cancellation neutrally and exposes an accessible manual-copy recovery", () => {
    expect(shareSource).toContain('error.name === "AbortError"');
    expect(shareSource).toContain('aria-live="polite"');
    expect(shareSource).toContain('role="alert"');
    expect(shareSource).toContain('aria-label="Concrete Concepts Group website link"');
    expect(shareSource).toContain("readOnly");
    expect(shareSource).toContain("Select and copy this link manually.");
    expect(shareSource).toContain('type="button"');
    expect(shareSource).toContain("focus-visible:ring-2");
  });

  it("creates no lead, referral or Ads conversion side effect", () => {
    expect(shareSource).not.toMatch(/trpc|fetch\(|trackQuoteConversion|trackReferralSubmission|trackPhoneCallClick|submitFormFallback/);
    expect(shareSource).not.toMatch(
      /\b(customerFirstName|mobile|email|suburb|postcode|gclid|utmSource|utmMedium|utmCampaign)\b/
    );

    const conversionCalls = wizardSource.match(/trackQuoteConversion\(/g) ?? [];
    expect(conversionCalls).toHaveLength(2);
  });
});
