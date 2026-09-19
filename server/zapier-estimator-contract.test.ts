import { describe, expect, it } from "vitest";
import { calculateEstimate } from "../shared/estimator/calculateEstimate";
import { CCG_RATE_CARD_V1 } from "../shared/estimator/rateCard";
import {
  normalizeZapierPricingRequest,
  zapierPricingEstimateRequestSchema,
} from "../shared/estimator/zapierContract";

const basePayload = {
  schema_version: 1 as const,
  source: { system: "zapier" as const, submission_id: "jotform-110-driveway" },
  requested_finish: "plain" as const,
  alternative_finish_candidates: ["exposed_raven", "exposed_sp"] as const,
  job: {
    service: "driveway" as const,
    work_type: "new" as const,
    area_m2: 110,
    thickness_mm: 100,
    concrete_strength_mpa: 32,
  },
  site: {
    existing_concrete_removal: "no" as const,
    excavation: "unknown" as const,
    disposal: "unknown" as const,
    vehicle_access: "unknown" as const,
    pump_access: "direct_truck" as const,
    slope: "unknown" as const,
    drainage: "unknown" as const,
  },
  evidence: {
    photos_provided: false,
    measurement_source: "client_approximate" as const,
  },
};

describe("Zapier estimator contract", () => {
  it("normalizes the 110 m² driveway into three independently costed scopes", () => {
    const payload = zapierPricingEstimateRequestSchema.parse(basePayload);
    const request = normalizeZapierPricingRequest(payload);

    expect(request.alternativeFinishes).toEqual(["exposed_raven", "exposed_sp"]);
    expect(request.scenarios).toMatchObject({
      low: { roadbaseT: 14, excavationHours: 6, tipperLoads: 4, prepDays: 2.5 },
      expected: { roadbaseT: 17, excavationHours: 8, tipperLoads: 5, prepDays: 3 },
      high: { roadbaseT: 20, excavationHours: 12, tipperLoads: 7, prepDays: 4 },
    });

    const result = calculateEstimate(request, CCG_RATE_CARD_V1);
    expect(result.options[0].displayRangeIncGstCents).toEqual({ low: 2_200_000, high: 2_950_000 });
    expect(result.options.map((option) => option.finish.id)).toEqual([
      "plain",
      "exposed_raven",
      "exposed_sp",
    ]);
  });

  it("routes missing measurements to measure-first instead of guessing", () => {
    const payload = zapierPricingEstimateRequestSchema.parse({
      ...basePayload,
      source: { system: "zapier", submission_id: "missing-area" },
      job: { ...basePayload.job, area_m2: undefined },
    });
    const result = calculateEstimate(normalizeZapierPricingRequest(payload), CCG_RATE_CARD_V1);

    expect(result.routing).toBe("measure_first");
    expect(result.options).toEqual([]);
  });

  it("rejects generic exposed and retired package values at the schema boundary", () => {
    for (const requested_finish of ["exposed", "CLASSIC", "Prestige"] as const) {
      expect(
        zapierPricingEstimateRequestSchema.safeParse({ ...basePayload, requested_finish }).success
      ).toBe(false);
    }
  });

  it("keeps oxide as a distinct owner-review finish", () => {
    const payload = zapierPricingEstimateRequestSchema.parse({
      ...basePayload,
      requested_finish: "oxide",
      alternative_finish_candidates: [],
    });
    const result = calculateEstimate(normalizeZapierPricingRequest(payload), CCG_RATE_CARD_V1);

    expect(result.options[0].finish.customerName).toBe("Coloured Concrete — Oxide Finish");
    expect(result.options[0].customerEligible).toBe(false);
    expect(result.reasonCodes).toContain("finish_cost_incomplete");
  });
});
