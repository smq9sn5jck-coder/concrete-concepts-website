import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { QUOTE_BRAND } from "../shared/estimator/brand";
import { calculateEstimate } from "../shared/estimator/calculateEstimate";
import { toCustomerEstimateView } from "../shared/estimator/customerView";
import { RETIRED_TIER_PATTERN } from "../shared/estimator/finishCatalog";
import { validateCustomerEstimateView } from "../shared/estimator/preSendValidation";
import { CCG_RATE_CARD_V1 } from "../shared/estimator/rateCard";
import type { PricingRequest } from "../shared/estimator/types";

const fixture = JSON.parse(
  readFileSync(resolve("server/fixtures/estimator/plain-110m2-driveway.json"), "utf8")
) as { request: PricingRequest };

describe("customer estimate golden contract", () => {
  it("uses the approved quote identity", () => {
    expect(QUOTE_BRAND).toEqual({
      customerName: "Concrete Concepts",
      legalName: "Concrete Concepts Group Pty Ltd",
      quoteSender: "Concrete Concepts <info@concreteconceptsgroup.com>",
      gold: "#C9A44D",
      navy: "#0F2A44",
      logoPath: "/ccg-logo-gold.png",
      logoSha256: "df059139196dfc2f9e09fb4107a09ef50bc6ab1e52a63945ac42b2c0bf9224a4",
    });
  });

  it("contains only customer-safe pricing fields and evidence-bound wording", () => {
    const view = toCustomerEstimateView(calculateEstimate(fixture.request, CCG_RATE_CARD_V1));
    const serialized = JSON.stringify(view);

    expect(serialized).not.toMatch(RETIRED_TIER_PATTERN);
    expect(serialized).not.toMatch(/costLines|supplier|labour markup|gross profit|margin|commission|method 1|method 2/i);
    expect(serialized).toContain("No site photos were available.");
    expect(serialized).not.toMatch(/visually confirmed|we inspected|photos confirm/i);
    expect(validateCustomerEstimateView(view)).toEqual({ valid: true, issues: [] });
  });

  it("fails closed when a retired tier name is injected", () => {
    const view = toCustomerEstimateView(calculateEstimate(fixture.request, CCG_RATE_CARD_V1));
    const mutated = {
      ...view,
      options: [{ ...view.options[0], customerName: "Prestige Package" }, ...view.options.slice(1)],
    };

    expect(validateCustomerEstimateView(mutated).valid).toBe(false);
  });
});
