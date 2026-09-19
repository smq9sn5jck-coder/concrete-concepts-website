import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FINISH_CATALOG } from "../shared/estimator/finishCatalog";
import { normalizeQuoteFinish, quoteFinishes } from "../shared/quoteBrief";

function source(path: string) {
  return readFileSync(resolve(path), "utf8");
}

const customerFinishNames = Object.values(FINISH_CATALOG).map((finish) => finish.customerName);
const publicPricingFiles = [
  "client/src/pages/ServicePage.tsx",
  "client/src/pages/SuburbPage.tsx",
  "client/src/data/newSuburbs.ts",
  "client/src/data/moreSuburbs.ts",
  "client/src/components/FAQSection.tsx",
  "client/src/pages/FAQPage.tsx",
  "server/seoPrerender.ts",
];

describe("public pricing and finish surface contract", () => {
  it("uses the canonical finish enum in the detailed quote boundary", () => {
    expect(quoteFinishes).toEqual([
      "plain",
      "oxide",
      "exposed_raven",
      "exposed_sp",
      "exposed_jersey",
      "exposed_casper",
      "stencil",
      "honed",
      "not_sure",
    ]);
  });

  it("normalizes historical lead values without displaying them as priced finishes", () => {
    expect(normalizeQuoteFinish("plain")).toBe("plain");
    expect(normalizeQuoteFinish("coloured")).toBe("oxide");
    expect(normalizeQuoteFinish("exposed")).toBe("not_sure");
    expect(normalizeQuoteFinish("stencilled")).toBe("stencil");
    expect(normalizeQuoteFinish("CLASSIC")).toBe("not_sure");
  });

  it("turns the calculator into a no-price project planner", () => {
    const calculator = source("client/src/pages/CostCalculator.tsx");

    expect(calculator).toContain("Project brief ready");
    expect(calculator).toContain("saveQuoteDraft");
    expect(calculator).toContain("trackCalculatorUse(");
    expect(calculator).not.toMatch(/lowPerM2|highPerM2|pricePerM2|AggregateOffer|isPercentage|Calculate My Estimate/);
    expect(calculator).not.toMatch(/\$\d[\d,]*(?:\s*[–-]\s*\$?\d[\d,]*)?\s*(?:\/m²|per m²|per square metre)/i);
  });

  it("shows every actual finish name in the planner, wizard, and finish visualiser", () => {
    const calculator = source("client/src/pages/CostCalculator.tsx");
    const wizard = source("client/src/components/quote/ComprehensiveQuoteWizard.tsx");
    const visualiser = source("client/src/pages/FinishesVisualizer.tsx");

    for (const name of customerFinishNames) {
      expect(calculator).toContain(name);
      expect(wizard).toContain(name);
      expect(visualiser).toContain(name);
    }
    for (const file of [calculator, wizard, visualiser]) {
      expect(file).not.toMatch(/\b(CLASSIC|SIGNATURE|PRESTIGE)\b/);
    }
  });

  it("removes fixed construction-price claims from the audited public content sources", () => {
    const stalePricingPattern = /\$\d[\d,]*(?:\s*[–-]\s*\$?\d[\d,]*)?\s*(?:\/m²|\/m2|per m²|per square metre)|(?:from|starts? at)\s+\$\d[\d,]*|\$\d[\d,]*\s*[–-]\s*\$?\d[\d,]*/i;
    const failures = publicPricingFiles.filter((file) => stalePricingPattern.test(source(file)));

    expect(failures).toEqual([]);
  });

  it("does not publish numeric AggregateOffer construction prices", () => {
    const calculator = source("client/src/pages/CostCalculator.tsx");
    const seo = source("client/public/seo-manifest.js");

    expect(calculator).not.toContain('"@type": "AggregateOffer"');
    expect(seo).not.toContain("Estimate a starting range");
  });
});
