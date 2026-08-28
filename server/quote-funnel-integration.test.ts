import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const wizardPath = resolve(
  __dirname,
  "../client/src/components/quote/ComprehensiveQuoteWizard.tsx"
);

describe("comprehensive quote funnel instrumentation", () => {
  it("uses the privacy-safe funnel tracker without passing quote-form data", () => {
    const source = readFileSync(wizardPath, "utf8");

    expect(source).toContain("createQuoteFunnelTracker");
    expect(source).toContain("tracker.pageView");
    expect(source).toContain("tracker.stepReached");
    expect(source).toContain("tracker.validationBlocked");
    expect(source).toContain("tracker.submitStarted");
    expect(source).toContain("tracker.submitConfirmed");
    expect(source).toContain("tracker.submitFailed");
    expect(source).not.toMatch(/tracker\.[a-zA-Z]+\([^)]*data\./);
  });

  it("keeps the Google Ads quote conversion behind confirmed delivery", () => {
    const source = readFileSync(wizardPath, "utf8");
    const conversionCalls = source.match(/trackQuoteConversion\(/g) ?? [];

    expect(conversionCalls).toHaveLength(2);
    expect(source).not.toMatch(/trackQuoteConversion[\s\S]{0,120}submitStarted/);
    expect(source).toMatch(/onSuccess:[\s\S]{0,450}trackQuoteConversion/);
    expect(source).toMatch(/result\.success[\s\S]{0,450}trackQuoteConversion/);
  });
});
