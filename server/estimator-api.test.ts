import { describe, expect, it } from "vitest";
import {
  createMemoryPricingRequestStore,
  handlePricingEstimateRequest,
  type PricingHttpDependencies,
} from "../shared/estimator/http";

const validPayload = {
  schema_version: 1,
  source: { system: "zapier", submission_id: "api-plain-110" },
  requested_finish: "plain",
  alternative_finish_candidates: ["exposed_raven"],
  job: {
    service: "driveway",
    work_type: "new",
    area_m2: 110,
    thickness_mm: 100,
    concrete_strength_mpa: 32,
  },
  site: {
    existing_concrete_removal: "no",
    excavation: "unknown",
    disposal: "unknown",
    vehicle_access: "unknown",
    pump_access: "direct_truck",
    slope: "unknown",
    drainage: "unknown",
  },
  evidence: { photos_provided: false, measurement_source: "client_approximate" },
};

function dependencies(overrides: Partial<PricingHttpDependencies> = {}): PricingHttpDependencies {
  return {
    currentToken: "test-pricing-token-that-is-long-enough",
    previousToken: undefined,
    store: createMemoryPricingRequestStore(),
    now: () => 1_795_000_000_000,
    requestId: () => "request-fixed-001",
    ...overrides,
  };
}

function request(payload: unknown = validPayload, headers: Record<string, string> = {}) {
  return new Request("https://concreteconceptsgroup.com/api/v1/pricing/estimate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer test-pricing-token-that-is-long-enough",
      "idempotency-key": "jotform-api-plain-110",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
}

describe("pricing HTTP contract", () => {
  it("fails closed when the service token is not configured", async () => {
    const response = await handlePricingEstimateRequest(request(), dependencies({ currentToken: undefined }));

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toMatchObject({
      error: { code: "pricing_not_configured", request_id: "request-fixed-001", retryable: false },
    });
  });

  it("rejects missing or invalid bearer authentication", async () => {
    const missing = request(validPayload, { authorization: "" });
    const invalid = request(validPayload, { authorization: "Bearer wrong-token-value" });

    expect((await handlePricingEstimateRequest(missing, dependencies())).status).toBe(401);
    expect((await handlePricingEstimateRequest(invalid, dependencies())).status).toBe(401);
  });

  it("returns the complete versioned internal review response to an authenticated caller", async () => {
    const response = await handlePricingEstimateRequest(request(), dependencies());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBe("request-fixed-001");
    expect(body).toMatchObject({
      api_version: "v1",
      request_id: "request-fixed-001",
      idempotency: { replayed: false },
      calculation: {
        calculationVersion: "ccg-estimator-v1",
        rateCardVersion: "ccg-rates-2026-02-q7831-v1",
        routing: "owner_review",
      },
    });
    expect(body.calculation.options[0].scenarios.expected.costLines.length).toBeGreaterThan(0);
  });

  it("replays the stored response and rejects an idempotency key reused with a changed body", async () => {
    const deps = dependencies();
    const first = await handlePricingEstimateRequest(request(), deps);
    const replay = await handlePricingEstimateRequest(request(), deps);
    const changed = await handlePricingEstimateRequest(
      request({ ...validPayload, job: { ...validPayload.job, work_type: "replacement" } }),
      deps
    );

    expect(first.status).toBe(200);
    expect(replay.status).toBe(200);
    expect(replay.headers.get("idempotency-replayed")).toBe("true");
    expect(await replay.json()).toEqual(await first.json());
    expect(changed.status).toBe(409);
    expect(await changed.json()).toMatchObject({ error: { code: "idempotency_key_reused" } });
  });

  it("rejects invalid methods, idempotency keys, and payloads without a fallback price", async () => {
    const getResponse = await handlePricingEstimateRequest(
      new Request("https://concreteconceptsgroup.com/api/v1/pricing/estimate", { method: "GET" }),
      dependencies()
    );
    const keyResponse = await handlePricingEstimateRequest(
      request(validPayload, { "idempotency-key": "short" }),
      dependencies()
    );
    const invalidPayload = await handlePricingEstimateRequest(
      request({ ...validPayload, requested_finish: "CLASSIC" }),
      dependencies()
    );

    expect(getResponse.status).toBe(405);
    expect(getResponse.headers.get("allow")).toBe("POST");
    expect(keyResponse.status).toBe(400);
    expect(invalidPayload.status).toBe(422);
    expect(JSON.stringify(await invalidPayload.json())).not.toMatch(/quoteIncGst|displayRange|costLines/);
  });
});
