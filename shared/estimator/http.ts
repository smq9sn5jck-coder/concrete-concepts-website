import { calculateEstimate } from "./calculateEstimate";
import { CCG_RATE_CARD_V1 } from "./rateCard";
import {
  normalizeZapierPricingRequest,
  zapierPricingEstimateRequestSchema,
} from "./zapierContract";

const MAX_BODY_BYTES = 64 * 1024;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{16,128}$/;

interface StoredPricingResponse {
  requestHash: string;
  state: "processing" | "completed";
  status?: number;
  responseBody?: string;
  expiresAt: number;
}

export interface PricingRequestStore {
  get(keyHash: string): Promise<StoredPricingResponse | null>;
  begin(keyHash: string, requestHash: string, expiresAt: number): Promise<boolean>;
  complete(keyHash: string, requestHash: string, status: number, responseBody: string): Promise<void>;
  recordAudit(event: {
    requestId: string;
    keyHash: string;
    sourceSubmissionId: string;
    requestHash: string;
    rateCardVersion: string;
    calculationVersion: string;
    outcome: string;
    reasonCodes: string[];
    createdAt: number;
  }): Promise<void>;
  consumeRateLimit(bucketHash: string, now: number): Promise<boolean>;
}

export interface PricingHttpDependencies {
  currentToken?: string;
  previousToken?: string;
  store: PricingRequestStore;
  now: () => number;
  requestId: () => string;
}

function headers(requestId: string, extra: HeadersInit = {}) {
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-request-id": requestId,
    ...extra,
  };
}

function errorResponse(
  requestId: string,
  status: number,
  code: string,
  message: string,
  retryable = false,
  details?: unknown,
  extraHeaders: HeadersInit = {}
) {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
        ...(details ? { details } : {}),
        request_id: requestId,
        retryable,
      },
    }),
    { status, headers: headers(requestId, extraHeaders) }
  );
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function tokenMatches(candidate: string, expected: string) {
  const [candidateHash, expectedHash] = await Promise.all([sha256(candidate), sha256(expected)]);
  let difference = candidateHash.length ^ expectedHash.length;
  const length = Math.max(candidateHash.length, expectedHash.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (candidateHash.charCodeAt(index) || 0) ^ (expectedHash.charCodeAt(index) || 0);
  }
  return difference === 0;
}

async function authorized(request: Request, deps: PricingHttpDependencies) {
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const candidate = match[1];
  if (deps.currentToken && (await tokenMatches(candidate, deps.currentToken))) return true;
  return Boolean(deps.previousToken && (await tokenMatches(candidate, deps.previousToken)));
}

export async function handlePricingEstimateRequest(
  request: Request,
  deps: PricingHttpDependencies
): Promise<Response> {
  const requestId = deps.requestId();
  if (request.method !== "POST") {
    return errorResponse(requestId, 405, "method_not_allowed", "Use POST for pricing requests.", false, undefined, { Allow: "POST" });
  }
  if (!deps.currentToken) {
    return errorResponse(requestId, 503, "pricing_not_configured", "The pricing service is not configured.");
  }
  if (!(await authorized(request, deps))) {
    return errorResponse(requestId, 401, "unauthorized", "The pricing request could not be authenticated.");
  }

  const idempotencyKey = request.headers.get("idempotency-key") ?? "";
  if (!IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
    return errorResponse(requestId, 400, "invalid_idempotency_key", "Provide a valid Idempotency-Key header.");
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return errorResponse(requestId, 400, "payload_too_large", "The pricing request is too large.");
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse(requestId, 400, "invalid_json", "The pricing request body could not be read.");
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return errorResponse(requestId, 400, "payload_too_large", "The pricing request is too large.");
  }

  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(rawBody);
  } catch {
    return errorResponse(requestId, 400, "invalid_json", "The pricing request body must be valid JSON.");
  }
  const parsed = zapierPricingEstimateRequestSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return errorResponse(
      requestId,
      422,
      "invalid_request",
      "The pricing input could not be accepted.",
      false,
      parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        rule: issue.code,
        message: issue.message,
      }))
    );
  }

  const token = request.headers.get("authorization")!.replace(/^Bearer\s+/i, "");
  const [keyHash, requestHash, bucketHash] = await Promise.all([
    sha256(`pricing:${idempotencyKey}`),
    sha256(JSON.stringify(parsed.data)),
    sha256(`pricing-token:${token}`),
  ]);
  if (!(await deps.store.consumeRateLimit(bucketHash, deps.now()))) {
    return errorResponse(requestId, 429, "rate_limited", "Too many pricing requests were received.", true, undefined, { "Retry-After": "60" });
  }

  const existing = await deps.store.get(keyHash);
  if (existing) {
    if (existing.requestHash !== requestHash) {
      return errorResponse(requestId, 409, "idempotency_key_reused", "The Idempotency-Key was already used for another request.");
    }
    if (existing.state === "processing") {
      return errorResponse(requestId, 409, "idempotency_in_progress", "The original pricing request is still processing.", true, undefined, { "Retry-After": "5" });
    }
    return new Response(existing.responseBody, {
      status: existing.status ?? 200,
      headers: headers(requestId, { "Idempotency-Replayed": "true" }),
    });
  }

  const created = await deps.store.begin(keyHash, requestHash, deps.now() + 30 * 24 * 60 * 60 * 1000);
  if (!created) {
    return errorResponse(requestId, 409, "idempotency_in_progress", "The original pricing request is still processing.", true, undefined, { "Retry-After": "5" });
  }

  try {
    const normalized = normalizeZapierPricingRequest(parsed.data);
    const calculation = calculateEstimate(normalized, CCG_RATE_CARD_V1);
    const responseBody = JSON.stringify({
      api_version: "v1",
      request_id: requestId,
      idempotency: { replayed: false },
      calculation,
    });
    await deps.store.complete(keyHash, requestHash, 200, responseBody);
    await deps.store.recordAudit({
      requestId,
      keyHash,
      sourceSubmissionId: parsed.data.source.submission_id,
      requestHash,
      rateCardVersion: calculation.rateCardVersion,
      calculationVersion: calculation.calculationVersion,
      outcome: calculation.routing,
      reasonCodes: calculation.reasonCodes,
      createdAt: deps.now(),
    });
    return new Response(responseBody, { status: 200, headers: headers(requestId) });
  } catch {
    return errorResponse(requestId, 500, "internal_error", "The pricing request could not be completed.", false);
  }
}

export function createMemoryPricingRequestStore(): PricingRequestStore {
  const records = new Map<string, StoredPricingResponse>();
  const rateLimits = new Map<string, number[]>();
  const audits: unknown[] = [];
  return {
    async get(keyHash) {
      return records.get(keyHash) ?? null;
    },
    async begin(keyHash, requestHash, expiresAt) {
      if (records.has(keyHash)) return false;
      records.set(keyHash, { requestHash, state: "processing", expiresAt });
      return true;
    },
    async complete(keyHash, requestHash, status, responseBody) {
      const existing = records.get(keyHash);
      if (!existing || existing.requestHash !== requestHash) throw new Error("Idempotency record mismatch.");
      records.set(keyHash, { ...existing, state: "completed", status, responseBody });
    },
    async recordAudit(event) {
      audits.push(event);
    },
    async consumeRateLimit(bucketHash, now) {
      const cutoff = now - 60_000;
      const recent = (rateLimits.get(bucketHash) ?? []).filter((value) => value > cutoff);
      if (recent.length >= 60) return false;
      recent.push(now);
      rateLimits.set(bucketHash, recent);
      return true;
    },
  };
}
