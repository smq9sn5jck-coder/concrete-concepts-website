import {
  handlePricingEstimateRequest,
  type PricingRequestStore,
} from "../../shared/estimator/http";

interface D1Result<T = unknown> {
  success?: boolean;
  meta?: { changes?: number };
  results?: T[];
}

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(sql: string): D1Statement;
}

interface PricingWorkerEnv {
  PRICING_API_TOKEN_CURRENT?: string;
  PRICING_API_TOKEN_PREVIOUS?: string;
  PRICING_API_DB?: D1Database;
}

function d1Store(database: D1Database): PricingRequestStore {
  return {
    async get(keyHash) {
      const row = await database
        .prepare(
          `SELECT request_hash, state, http_status, response_json, expires_at
           FROM pricing_idempotency
           WHERE idempotency_key_hash = ?1`
        )
        .bind(keyHash)
        .first<{
          request_hash: string;
          state: "processing" | "completed";
          http_status: number | null;
          response_json: string | null;
          expires_at: number;
        }>();
      if (!row) return null;
      return {
        requestHash: row.request_hash,
        state: row.state,
        status: row.http_status ?? undefined,
        responseBody: row.response_json ?? undefined,
        expiresAt: row.expires_at,
      };
    },
    async begin(keyHash, requestHash, expiresAt) {
      const result = await database
        .prepare(
          `INSERT OR IGNORE INTO pricing_idempotency
           (idempotency_key_hash, request_hash, state, created_at, expires_at)
           VALUES (?1, ?2, 'processing', ?3, ?4)`
        )
        .bind(keyHash, requestHash, Date.now(), expiresAt)
        .run();
      return result.success === true && result.meta?.changes === 1;
    },
    async complete(keyHash, requestHash, status, responseBody) {
      const result = await database
        .prepare(
          `UPDATE pricing_idempotency
           SET state = 'completed', http_status = ?3, response_json = ?4, completed_at = ?5
           WHERE idempotency_key_hash = ?1 AND request_hash = ?2 AND state = 'processing'`
        )
        .bind(keyHash, requestHash, status, responseBody, Date.now())
        .run();
      if (result.success !== true || result.meta?.changes !== 1) {
        throw new Error("Unable to complete the pricing idempotency record.");
      }
    },
    async recordAudit(event) {
      const result = await database
        .prepare(
          `INSERT INTO pricing_calculation_audit
           (request_id, idempotency_key_hash, source_submission_id, request_hash,
            rate_card_version, calculation_version, outcome, reason_codes_json, created_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
        )
        .bind(
          event.requestId,
          event.keyHash,
          event.sourceSubmissionId,
          event.requestHash,
          event.rateCardVersion,
          event.calculationVersion,
          event.outcome,
          JSON.stringify(event.reasonCodes),
          event.createdAt
        )
        .run();
      if (result.success !== true || result.meta?.changes !== 1) {
        throw new Error("Unable to record the pricing audit event.");
      }
    },
    async consumeRateLimit(bucketHash, now) {
      const windowStart = Math.floor(now / 60_000) * 60_000;
      const result = await database
        .prepare(
          `INSERT INTO pricing_rate_limits (bucket_hash, window_start, request_count)
           VALUES (?1, ?2, 1)
           ON CONFLICT(bucket_hash, window_start)
           DO UPDATE SET request_count = request_count + 1
           RETURNING request_count`
        )
        .bind(bucketHash, windowStart)
        .first<{ request_count: number }>();
      return Boolean(result && result.request_count <= 60);
    },
  };
}

function unavailable(requestId: string) {
  return new Response(
    JSON.stringify({
      error: {
        code: "pricing_not_configured",
        message: "The pricing service is not configured.",
        request_id: requestId,
        retryable: false,
      },
    }),
    {
      status: 503,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-request-id": requestId,
      },
    }
  );
}

export async function handlePricingWorkerRequest(request: Request, env: PricingWorkerEnv) {
  const requestId = crypto.randomUUID();
  if (!env.PRICING_API_DB) return unavailable(requestId);
  try {
    return await handlePricingEstimateRequest(request, {
      currentToken: env.PRICING_API_TOKEN_CURRENT,
      previousToken: env.PRICING_API_TOKEN_PREVIOUS,
      store: d1Store(env.PRICING_API_DB),
      now: () => Date.now(),
      requestId: () => requestId,
    });
  } catch {
    return new Response(
      JSON.stringify({
        error: {
          code: "pricing_unavailable",
          message: "The pricing service is temporarily unavailable.",
          request_id: requestId,
          retryable: true,
        },
      }),
      {
        status: 503,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
          "x-request-id": requestId,
        },
      }
    );
  }
}
