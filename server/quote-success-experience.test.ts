import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const wizardPath = resolve(
  __dirname,
  "../client/src/components/quote/ComprehensiveQuoteWizard.tsx"
);

const source = readFileSync(wizardPath, "utf8");

describe("approved detailed quote success experience", () => {
  it("announces and focuses the verified success state", () => {
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-labelledby="quote-success-heading"');
    expect(source).toContain('id="quote-success-heading"');
    expect(source).toContain("successHeadingRef");
    expect(source).toMatch(/submitted[\s\S]{0,260}successHeadingRef\.current\?\.focus\(\)/);
    expect(source).toContain('tabIndex={-1}');
  });

  it("shows the approved receipt, personalisation and preferred-contact summary", () => {
    expect(source).toContain("Quote request received");
    expect(source).toContain("Thanks, {customerFirstName}");
    expect(source).toContain("preferredContactLabel");
    expect(source).toContain("We'll contact you by {preferredContactLabel}");
    expect(source).toContain("Your measurements, site notes and uploaded photos are safely included");
  });

  it("shows three clear next steps and the tracked CCG call action", () => {
    expect(source).toContain("We review your project details");
    expect(source).toContain("We confirm whether a site visit is needed");
    expect(source).toContain("We contact you to discuss your quote");
    expect(source).toContain('href="tel:0424463268"');
    expect(source).toContain("trackPhoneCallClick()");
  });

  it("uses restrained motion with a reduced-motion path", () => {
    expect(source).toContain("useReducedMotion");
    expect(source).toContain("prefersReducedMotion");
    expect(source).toContain('aria-hidden="true"');
    expect(source).toMatch(/prefersReducedMotion\s*\?\s*\{[^}]*opacity:\s*1/);
  });

  it("keeps the primary quote conversion in the two verified delivery branches only", () => {
    const conversionCalls = source.match(/trackQuoteConversion\(/g) ?? [];

    expect(conversionCalls).toHaveLength(2);
    expect(source).toMatch(/onSuccess:[\s\S]{0,450}trackQuoteConversion[\s\S]{0,180}setSubmitted\(true\)/);
    expect(source).toMatch(/result\.success[\s\S]{0,450}trackQuoteConversion[\s\S]{0,180}setSubmitted\(true\)/);
  });
});
