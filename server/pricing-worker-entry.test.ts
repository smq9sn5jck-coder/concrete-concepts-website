import { describe, expect, it } from "vitest";
import { handlePricingWorkerRequest } from "./pricing/workerEntry";

class FakePricingD1 {
  idempotency = new Map<string, Record<string, unknown>>();
  audits: Record<string, unknown>[] = [];
  limits = new Map<string, number>();

  prepare(sql: string) {
    let values: unknown[] = [];
    const statement = {
      bind: (...next: unknown[]) => {
        values = next;
        return statement;
      },
      first: async () => {
        if (sql.includes("FROM pricing_idempotency")) {
          return this.idempotency.get(String(values[0])) ?? null;
        }
        if (sql.includes("INSERT INTO pricing_rate_limits")) {
          const key = `${values[0]}:${values[1]}`;
          const request_count = (this.limits.get(key) ?? 0) + 1;
          this.limits.set(key, request_count);
          return { request_count };
        }
        return null;
      },
      run: async () => {
        if (sql.includes("INSERT OR IGNORE INTO pricing_idempotency")) {
          const key = String(values[0]);
          if (this.idempotency.has(key)) return { success: true, meta: { changes: 0 } };
          this.idempotency.set(key, {
            request_hash: values[1],
            state: "processing",
            http_status: null,
            response_json: null,
            expires_at: values[3],
          });
          return { success: true, meta: { changes: 1 } };
        }
        if (sql.includes("UPDATE pricing_idempotency")) {
          const key = String(values[0]);
          const row = this.idempotency.get(key);
          if (!row || row.request_hash !== values[1] || row.state !== "processing") {
            return { success: true, meta: { changes: 0 } };
          }
          this.idempotency.set(key, {
            ...row,
            state: "completed",
            http_status: values[2],
            response_json: values[3],
          });
          return { success: true, meta: { changes: 1 } };
        }
        if (sql.includes("INSERT INTO pricing_calculation_audit")) {
          this.audits.push({ request_id: values[0], source_submission_id: values[2] });
          return { success: true, meta: { changes: 1 } };
        }
        return { success: false, meta: { changes: 0 } };
      },
    };
    return statement;
  }
}

const payload = {
  schema_version: 1,
  source: { system: "zapier", submission_id: "worker-entry-test-001" },
  requested_finish: "plain",
  alternative_finish_candidates: [],
  job: { service: "driveway", work_type: "new", area_m2: 110 },
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

function request() {
  return new Request("https://concreteconceptsgroup.com/api/v1/pricing/estimate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer worker-entry-token-value-123456",
      "idempotency-key": "worker-entry-test-001",
    },
    body: JSON.stringify(payload),
  });
}

describe("pricing Worker entry", () => {
  it("persists one result and replays it through the D1 adapter", async () => {
    const database = new FakePricingD1();
    const env = {
      PRICING_API_TOKEN_CURRENT: "worker-entry-token-value-123456",
      PRICING_API_DB: database,
    };

    const first = await handlePricingWorkerRequest(request(), env);
    const replay = await handlePricingWorkerRequest(request(), env);

    expect(first.status).toBe(200);
    expect(replay.status).toBe(200);
    expect(replay.headers.get("idempotency-replayed")).toBe("true");
    expect(database.idempotency.size).toBe(1);
    expect(database.audits).toHaveLength(1);
  });

  it("fails closed when the D1 binding is absent", async () => {
    const response = await handlePricingWorkerRequest(request(), {
      PRICING_API_TOKEN_CURRENT: "worker-entry-token-value-123456",
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "pricing_not_configured" },
    });
  });
});
