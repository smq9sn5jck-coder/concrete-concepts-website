import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calculateEstimate, toParityProjection } from "../shared/estimator/calculateEstimate";
import { toCustomerEstimateView } from "../shared/estimator/customerView";
import { CCG_RATE_CARD_V1 } from "../shared/estimator/rateCard";
import type { PricingRequest } from "../shared/estimator/types";

const fixture = JSON.parse(
  readFileSync(resolve("server/fixtures/estimator/plain-110m2-driveway.json"), "utf8")
) as { request: PricingRequest };

describe("CCG estimator parity", () => {
  it("is deterministic for a pinned request and rate card", () => {
    const first = calculateEstimate(fixture.request, CCG_RATE_CARD_V1);
    const second = calculateEstimate(fixture.request, CCG_RATE_CARD_V1);

    expect(first).toEqual(second);
    expect(toParityProjection(first)).toEqual(toParityProjection(second));
  });

  it("keeps customer and internal projections on the same versions and option totals", () => {
    const internal = calculateEstimate(fixture.request, CCG_RATE_CARD_V1);
    const customer = toCustomerEstimateView(internal);

    expect(customer.rateCardVersion).toBe(internal.rateCardVersion);
    expect(customer.calculationVersion).toBe(internal.calculationVersion);
    expect(customer.options[0]).toMatchObject({
      finishId: internal.options[0].finish.id,
      customerName: internal.options[0].finish.customerName,
      requested: internal.options[0].finish.requested,
    });
    expect(customer.options[0].displayRangeIncGstCents).toEqual(
      internal.options[0].displayRangeIncGstCents
    );
  });
});
