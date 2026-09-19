import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calculateEstimate } from "../shared/estimator/calculateEstimate";
import { FINISH_CATALOG, RETIRED_TIER_PATTERN } from "../shared/estimator/finishCatalog";
import { CCG_RATE_CARD_V1 } from "../shared/estimator/rateCard";
import type { PricingRequest } from "../shared/estimator/types";

const fixture = JSON.parse(
  readFileSync(resolve("server/fixtures/estimator/plain-110m2-driveway.json"), "utf8")
) as { request: PricingRequest; expected: Record<string, number | string> };

describe("CCG estimator core", () => {
  it("uses only the approved customer-facing finish names", () => {
    expect(FINISH_CATALOG).toMatchObject({
      plain: { customerName: "Plain Concrete — Broom Finish", automation: "automatic" },
      oxide: { customerName: "Coloured Concrete — Oxide Finish", automation: "owner_review" },
      exposed_raven: { customerName: "Exposed Aggregate — Raven", automation: "automatic" },
      exposed_sp: { customerName: "Exposed Aggregate — Salt & Pepper", automation: "automatic" },
      exposed_jersey: { customerName: "Exposed Aggregate — Jersey", automation: "automatic" },
      exposed_casper: { customerName: "Exposed Aggregate — Casper", automation: "automatic" },
      stencil: { customerName: "Stencilled / Stamped Concrete", automation: "owner_review" },
      honed: { customerName: "Honed / Ground Concrete", automation: "owner_review" },
      not_sure: { customerName: "Not Sure — Recommend a Finish", automation: "measure_first" },
    });

    for (const finish of Object.values(FINISH_CATALOG)) {
      expect(finish.customerName).not.toMatch(RETIRED_TIER_PATTERN);
    }
  });

  it("matches the approved 110 m² independently costed scenario fixture", () => {
    const result = calculateEstimate(fixture.request, CCG_RATE_CARD_V1);
    const option = result.options[0];

    expect(result.rateCardVersion).toBe(fixture.expected.rateCardVersion ?? "ccg-rates-2026-02-q7831-v1");
    expect(result.calculationVersion).toBe("ccg-estimator-v1");
    expect(result.routing).toBe("owner_review");
    expect(option.finish.id).toBe("plain");
    expect(option.scenarios.low.quoteIncGstCents).toBe(fixture.expected.rawLowIncGstCents);
    expect(option.scenarios.expected.quoteIncGstCents).toBe(fixture.expected.rawExpectedIncGstCents);
    expect(option.scenarios.high.quoteIncGstCents).toBe(fixture.expected.rawHighIncGstCents);
    expect(option.displayRangeIncGstCents).toEqual({
      low: fixture.expected.displayLowIncGstCents,
      high: fixture.expected.displayHighIncGstCents,
    });
    expect(option.scenarios.low.totalCostExGstCents).not.toBe(option.scenarios.expected.totalCostExGstCents);
    expect(option.scenarios.expected.totalCostExGstCents).not.toBe(option.scenarios.high.totalCostExGstCents);
    expect(result.reasonCodes).toContain("owner_review_rollout");
  });

  it("checks every final displayed scenario margin inside the closed 18–26% band", () => {
    const result = calculateEstimate(fixture.request, CCG_RATE_CARD_V1);

    for (const scenario of Object.values(result.options[0].scenarios)) {
      expect(scenario.displayedMarginBps).toBeGreaterThanOrEqual(1800);
      expect(scenario.displayedMarginBps).toBeLessThanOrEqual(2600);
      expect(scenario.marginGuardPassed).toBe(true);
    }
  });

  it("routes missing measurement to measure-first without a price", () => {
    const request: PricingRequest = {
      ...fixture.request,
      source: { system: "test", submissionId: "missing-area" },
      requestedFinish: "not_sure",
      scenarios: undefined,
    };

    const result = calculateEstimate(request, CCG_RATE_CARD_V1);

    expect(result.routing).toBe("measure_first");
    expect(result.options).toEqual([]);
    expect(result.reasonCodes).toContain("measurement_required");
  });

  it("rejects retaining-wall work instead of applying slab pricing", () => {
    const result = calculateEstimate(
      {
        ...fixture.request,
        source: { system: "test", submissionId: "retaining-wall" },
        service: "retaining_wall",
      },
      CCG_RATE_CARD_V1
    );

    expect(result.routing).toBe("rejected");
    expect(result.options).toEqual([]);
    expect(result.reasonCodes).toContain("unsupported_service_pricing");
  });

  it.each(["oxide", "stencil", "honed"] as const)(
    "keeps %s in owner review while finish-specific costs are incomplete",
    (requestedFinish) => {
      const result = calculateEstimate(
        {
          ...fixture.request,
          source: { system: "test", submissionId: `review-${requestedFinish}` },
          requestedFinish,
        },
        CCG_RATE_CARD_V1
      );

      expect(result.routing).toBe("owner_review");
      expect(result.options[0].customerEligible).toBe(false);
      expect(result.reasonCodes).toContain("finish_cost_incomplete");
    }
  );

  it("rejects more than two alternatives and never accepts a generic exposed finish", () => {
    expect(() =>
      calculateEstimate(
        {
          ...fixture.request,
          alternativeFinishes: ["exposed_raven", "exposed_sp", "exposed_jersey"],
        },
        CCG_RATE_CARD_V1
      )
    ).toThrow(/two alternatives/i);

    expect(() =>
      calculateEstimate(
        { ...fixture.request, requestedFinish: "exposed" as never },
        CCG_RATE_CARD_V1
      )
    ).toThrow(/canonical finish/i);
  });

  it("keeps the requested finish first and fully recalculates two named alternatives", () => {
    const result = calculateEstimate(
      {
        ...fixture.request,
        alternativeFinishes: ["exposed_raven", "exposed_sp"],
      },
      CCG_RATE_CARD_V1
    );

    expect(result.options.map((option) => option.finish.customerName)).toEqual([
      "Plain Concrete — Broom Finish",
      "Exposed Aggregate — Raven",
      "Exposed Aggregate — Salt & Pepper",
    ]);
    expect(result.options[0].finish.requested).toBe(true);
    expect(result.options.slice(1).every((option) => !option.finish.requested)).toBe(true);
    expect(result.options[1].scenarios.expected.costLines[0].description).toContain("exposed_raven");
    expect(result.options[2].scenarios.expected.costLines[0].description).toContain("exposed_sp");
    expect(result.options[1].scenarios.expected.totalCostExGstCents).not.toBe(
      result.options[0].scenarios.expected.totalCostExGstCents
    );
  });

  it("flags high-value work for owner review and keeps progress payments cent-exact", () => {
    const result = calculateEstimate(
      {
        ...fixture.request,
        scenarios: {
          ...fixture.request.scenarios!,
          high: { ...fixture.request.scenarios!.high, pump: "boom", difficultAccess: true },
        },
      },
      CCG_RATE_CARD_V1
    );
    const high = result.options[0].scenarios.high;
    const paymentsTotal =
      high.paymentSchedule.depositCents +
      high.paymentSchedule.progressPaymentsCents.reduce((sum, payment) => sum + payment, 0);

    expect(high.quoteIncGstCents).toBeGreaterThan(3_000_000);
    expect(high.flags).toContain("value_over_30000");
    expect(result.routing).toBe("owner_review");
    expect(paymentsTotal).toBe(high.paymentSchedule.totalIncGstCents);
  });

  it("fails customer eligibility when a minimum-job floor creates a displayed margin above 26%", () => {
    const rateCard = {
      ...CCG_RATE_CARD_V1,
      minimumJobExGstCents: 10_000_000,
    };
    const result = calculateEstimate(fixture.request, rateCard);

    expect(result.options[0].scenarios.low.displayedMarginBps).toBeGreaterThan(2600);
    expect(result.options[0].scenarios.low.marginGuardPassed).toBe(false);
    expect(result.options[0].customerEligible).toBe(false);
    expect(result.reasonCodes).toContain("margin_guard_failed");
  });
});
