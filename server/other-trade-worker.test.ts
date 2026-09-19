import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const CONSENT_TEXT = "I consent to Concrete Concepts Group reviewing this request and, if CCG chooses, sharing the contact details, job information and photos I provided with one suitable independent service provider so that provider can contact me about this request. I understand that CCG has not guaranteed a provider, availability, price, licensing, workmanship or response time.";
const CONSENT_VERSION = "other-trade-consent-v1-2026-09-20";
const CONSENT_HASH = "bc9d7e04519a7d9cafe0c163a2c9a27e7ed496a44e0eb42bd09f66c014aa917e";

type D1Result = { success?: boolean; meta?: { changes?: number } };

function createD1Mock(results: D1Result[] = [{ success: true, meta: { changes: 1 } }]) {
  const statements: string[] = [];
  const boundValues: unknown[][] = [];
  const run = vi.fn(async () => results[Math.min(run.mock.calls.length - 1, results.length - 1)]);
  const bind = vi.fn((...values: unknown[]) => {
    boundValues.push(values);
    return { run };
  });
  const prepare = vi.fn((sql: string) => {
    statements.push(sql);
    return { bind };
  });
  return { database: { prepare }, prepare, bind, run, statements, boundValues };
}

async function loadWorker(testName: string) {
  const workerUrl = `${pathToFileURL(resolve(import.meta.dirname, "../client/public/_worker.js")).href}?other-trade=${testName}-${Date.now()}-${Math.random()}`;
  return import(workerUrl);
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "Release Three Test",
    mobile: "0424 111 801",
    email: "release-three@example.test",
    location: "Camp Hill 4152",
    trade: "Plumbing",
    description: "Fictional labelled request to test the staging-only intake safely.",
    timeframe: "Within 1 week",
    photoUrls: [],
    consent: true,
    consentVersion: CONSENT_VERSION,
    consentText: CONSENT_TEXT,
    consentTextSha256: CONSENT_HASH,
    pageVersion: "need-another-trade-v1",
    source: "labelled-release-3a-test",
    landingPage: "/need-another-trade",
    website: "",
    formStartedAt: Date.now() - 5_000,
    ...overrides,
  };
}

function requestFor(payload: Record<string, unknown>, method = "POST", ip = `203.0.113.${Math.floor(Math.random() * 120) + 1}`) {
  return new Request("https://preview.example.test/api/other-trade-submit", {
    method,
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip },
    body: method === "POST" ? JSON.stringify(payload) : undefined,
  });
}

function assetFallback() {
  return { fetch: vi.fn(async () => new Response("asset fallback", { status: 418 })) };
}

async function callPreviewHandler(testName: string, payload: Record<string, unknown>, env: Record<string, unknown>) {
  const module = await loadWorker(testName);
  expect(module.handleOtherTradeSubmit).toBeTypeOf("function");
  return module.handleOtherTradeSubmit(env, {
    ...payload,
    _clientAddress: `203.0.113.${Math.floor(Math.random() * 120) + 121}`,
    _requestOrigin: "https://preview.example.test",
  });
}

describe("Release 3A other-trade Worker", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is build-gated off by default at the public endpoint without consuming the request body", async () => {
    const { default: worker } = await loadWorker("default-off");
    let bodyRead = false;
    const request = new Request("https://concreteconceptsgroup.com/api/other-trade-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload()),
    });
    Object.defineProperty(request, "json", { value: () => { bodyRead = true; throw new Error("must not parse"); } });
    const response = await worker.fetch(request, { ASSETS: assetFallback() }, { waitUntil: vi.fn() });
    expect(response.status).toBe(404);
    expect(bodyRead).toBe(false);
  });

  it.each([
    ["name", { name: "A" }, /name/i],
    ["mobile", { mobile: "0731234567" }, /mobile|04/i],
    ["email", { email: "not-an-email" }, /email/i],
    ["location", { location: "Sydney NSW 2000" }, /Brisbane|South East Queensland|location/i],
    ["trade", { trade: "Concreting" }, /trade/i],
    ["timeframe", { timeframe: "Tomorrow morning" }, /timeframe/i],
    ["description", { description: "Too short" }, /description|detail/i],
    ["consent false", { consent: false }, /consent/i],
    ["consent version", { consentVersion: "old-version" }, /consent/i],
    ["consent text", { consentText: `${CONSENT_TEXT} changed` }, /consent/i],
    ["consent hash", { consentTextSha256: "0".repeat(64) }, /consent/i],
    ["honeypot", { website: "bot value" }, /check the form/i],
    ["minimum completion time", { formStartedAt: Number.MAX_SAFE_INTEGER }, /check the form/i],
    ["description upper bound", { description: "x".repeat(5001) }, /description|detail/i],
    ["too many photos", { photoUrls: Array.from({ length: 9 }, (_, index) => `https://preview.example.test/api/lead-photo/other-trade/${String(index).padStart(36, "0")}.jpg?token=${"a".repeat(64)}`) }, /photo/i],
    ["photo URL shape", { photoUrls: ["https://evil.example/photo.jpg"] }, /photo/i],
    ["photo URL foreign origin", { photoUrls: [`https://evil.example/api/lead-photo/other-trade/${crypto.randomUUID()}.jpg?token=${"a".repeat(64)}`] }, /photo/i],
  ])("rejects invalid %s without inserting or emailing", async (_case, overrides, message) => {
    const d1 = createD1Mock();
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await callPreviewHandler(`invalid-${_case}`, validPayload(overrides), {
      LEAD_BACKUP_DB: d1.database,
      RESEND_API_KEY: "test-only-key",
    });
    expect(result).toMatchObject({ success: false, status: 400 });
    expect(result.error).toMatch(message);
    expect(d1.prepare).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("inserts exactly one authoritative lead before the owner email with exact consent evidence and no disclosure", async () => {
    const events: string[] = [];
    const d1 = createD1Mock([
      { success: true, meta: { changes: 1 } },
      { success: true, meta: { changes: 1 } },
    ]);
    d1.run.mockImplementation(async () => {
      events.push(d1.run.mock.calls.length === 1 ? "d1-insert" : "d1-update");
      return { success: true, meta: { changes: 1 } };
    });
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      events.push("owner-email");
      const email = JSON.parse(String(init?.body));
      expect(email.subject).toBe("[OTHER TRADE] Plumbing - Camp Hill 4152 (Release Three Test)");
      expect(email.to).toEqual(["info@concreteconceptsgroup.com"]);
      expect(email.html).toContain("CCG review required. Do not forward until provider suitability and consent scope are checked.");
      expect(email.html).toContain(CONSENT_TEXT);
      expect(email.html).toContain(CONSENT_VERSION);
      expect(email.html).toContain(CONSENT_HASH);
      return new Response('{"id":"test-email"}', { status: 200, headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await callPreviewHandler("d1-first", validPayload(), {
      LEAD_BACKUP_DB: d1.database,
      RESEND_API_KEY: "test-only-key",
    });

    expect(result).toMatchObject({ success: true, channels: { d1: "stored", email: "sent" }, serviceAreaStatus: "in_area" });
    expect(events[0]).toBe("d1-insert");
    expect(d1.statements.filter(sql => /INSERT\s+INTO\s+other_trade_leads/i.test(sql))).toHaveLength(1);
    expect(d1.statements.some(sql => /INSERT\s+INTO\s+other_trade_disclosures/i.test(sql))).toBe(false);
    expect(d1.boundValues[0]).toContain(CONSENT_VERSION);
    expect(d1.boundValues[0]).toContain(CONSENT_HASH);
    expect(d1.boundValues[0]).toContain("granted");
    expect(d1.boundValues[0]).toContain("in_area");
    expect(d1.boundValues[0]).toContain(null);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    ["exception", "throw"],
    ["zero changes", { success: true, meta: { changes: 0 } }],
    ["unsuccessful result", { success: false, meta: { changes: 1 } }],
  ])("returns retryable 503 and sends no owner email when D1 has %s", async (_case, outcome) => {
    const d1 = createD1Mock();
    if (outcome === "throw") d1.run.mockRejectedValueOnce(new Error("forced database failure containing no customer values"));
    else d1.run.mockResolvedValueOnce(outcome as D1Result);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await callPreviewHandler(`d1-${_case}`, validPayload(), {
      LEAD_BACKUP_DB: d1.database,
      RESEND_API_KEY: "test-only-key",
    });

    expect(result).toMatchObject({ success: false, status: 503, retryable: true });
    expect(JSON.stringify(result)).not.toContain("release-three@example.test");
    expect(JSON.stringify(result)).not.toContain("0424111801");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(d1.statements.some(sql => /other_trade_disclosures/i.test(sql))).toBe(false);
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("release-three@example.test");
    consoleError.mockRestore();
  });

  it("keeps the confirmed D1 row authoritative when owner email delivery fails", async () => {
    const d1 = createD1Mock([
      { success: true, meta: { changes: 1 } },
      { success: true, meta: { changes: 1 } },
    ]);
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"error":"forced"}', { status: 503 })));
    const result = await callPreviewHandler("email-failure", validPayload({ mobile: "0424 111 802" }), {
      LEAD_BACKUP_DB: d1.database,
      RESEND_API_KEY: "test-only-key",
    });
    expect(result).toMatchObject({ success: true, channels: { d1: "stored", email: "failed" } });
    expect(d1.statements.filter(sql => /INSERT\s+INTO\s+other_trade_leads/i.test(sql))).toHaveLength(1);
  });

  it("allows the same contact to retry after a failed authoritative D1 insert", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const module = await loadWorker("retry-after-d1-failure");
    const handler = module.handleOtherTradeSubmit as (env: unknown, body: Record<string, unknown>) => Promise<Record<string, unknown>>;
    const body = {
      ...validPayload({ mobile: "0424 111 805" }),
      _clientAddress: "203.0.113.245",
      _requestOrigin: "https://preview.example.test",
    };
    const failed = await handler({ LEAD_BACKUP_DB: createD1Mock([{ success: true, meta: { changes: 0 } }]).database }, body);
    const retried = await handler({ LEAD_BACKUP_DB: createD1Mock([{ success: true, meta: { changes: 1 } }]).database }, body);
    expect(failed).toMatchObject({ success: false, status: 503, retryable: true });
    expect(retried).toMatchObject({ success: true });
  });

  it("allows the same contact to retry after the authoritative D1 binding is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const module = await loadWorker("retry-after-missing-d1");
    const handler = module.handleOtherTradeSubmit as (env: unknown, body: Record<string, unknown>) => Promise<Record<string, unknown>>;
    const body = {
      ...validPayload({ mobile: "0424 111 806" }),
      _clientAddress: "203.0.113.246",
      _requestOrigin: "https://preview.example.test",
    };
    const failed = await handler({}, body);
    const retried = await handler({ LEAD_BACKUP_DB: createD1Mock().database }, body);
    expect(failed).toMatchObject({ success: false, status: 503, retryable: true });
    expect(retried).toMatchObject({ success: true });
  });

  it("escapes every customer-controlled value in owner HTML", async () => {
    const d1 = createD1Mock([
      { success: true, meta: { changes: 1 } },
      { success: true, meta: { changes: 1 } },
    ]);
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const email = JSON.parse(String(init?.body));
      expect(email.html).not.toContain("<script>");
      expect(email.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
      return new Response("{}", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await callPreviewHandler("escaping", validPayload({
      name: "Test <script>alert(1)</script>",
      mobile: "0424 111 803",
      description: "This is a fictional request with <script>alert(1)</script> content.",
    }), { LEAD_BACKUP_DB: d1.database, RESEND_API_KEY: "test-only-key" });
    expect(result.success).toBe(true);
  });

  it("rate-limits duplicate contacts and repeated client addresses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const module = await loadWorker("rate-limits");
    const handler = module.handleOtherTradeSubmit as (env: unknown, body: Record<string, unknown>) => Promise<Record<string, unknown>>;
    const first = await handler({ LEAD_BACKUP_DB: createD1Mock().database }, {
      ...validPayload({ mobile: "0424 111 804" }), _clientAddress: "203.0.113.240", _requestOrigin: "https://preview.example.test",
    });
    const duplicate = await handler({ LEAD_BACKUP_DB: createD1Mock().database }, {
      ...validPayload({ mobile: "0424 111 804" }), _clientAddress: "203.0.113.241", _requestOrigin: "https://preview.example.test",
    });
    expect(first.success).toBe(true);
    expect(duplicate).toMatchObject({ success: false, status: 429 });

    let limited: Record<string, unknown> | undefined;
    for (let index = 0; index < 9; index += 1) {
      limited = await handler({ LEAD_BACKUP_DB: createD1Mock().database }, {
        ...validPayload({ mobile: `04241118${String(10 + index).padStart(2, "0")}`, email: `ip-${index}@example.test` }),
        _clientAddress: "203.0.113.242",
        _requestOrigin: "https://preview.example.test",
      });
    }
    expect(limited).toMatchObject({ success: false, status: 429 });
  });

  it("implements preview referral redirect methods without reading, storing, or forwarding bodies", async () => {
    const { handleReferralRedirect } = await loadWorker("referral-methods");
    expect(handleReferralRedirect).toBeTypeOf("function");
    const assets = assetFallback();
    for (const method of ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]) {
      let bodyRead = false;
      const request = new Request("https://preview.example.test/referral?ignored=yes", {
        method,
        body: ["GET", "HEAD"].includes(method) ? undefined : "sensitive-body-must-not-be-read",
      });
      Object.defineProperty(request, "text", { value: () => { bodyRead = true; throw new Error("must not read"); } });
      Object.defineProperty(request, "json", { value: () => { bodyRead = true; throw new Error("must not read"); } });
      const response = handleReferralRedirect(request, true);
      expect(response.status).toBe(method === "GET" || method === "HEAD" ? 308 : 303);
      expect(response.headers.get("Location")).toBe("https://preview.example.test/need-another-trade");
      expect(bodyRead).toBe(false);
      expect(assets.fetch).not.toHaveBeenCalled();
    }
    expect(handleReferralRedirect(new Request("https://concreteconceptsgroup.com/referral"), false)).toBeNull();
  });

  it("guards the preview submit route to POST JSON and adds an HTTP noindex header to the preview page", () => {
    const workerSource = readFileSync(resolve(import.meta.dirname, "../client/public/_worker.js"), "utf8");
    expect(workerSource).toMatch(/path === ["']\/api\/other-trade-submit["'][\s\S]*request\.method !== ["']POST["']/);
    expect(workerSource).toMatch(/Content-Type["']\)\?\.includes\(["']application\/json["']\)/);
    expect(workerSource).toMatch(/path === ["']\/need-another-trade["'][\s\S]*X-Robots-Tag["'], ["']noindex, nofollow["']/);
  });

  it("keeps migration constraints and rollback explicit without applying production schema", () => {
    const migration = readFileSync(resolve(import.meta.dirname, "../cloudflare/d1/0002_other_trade_leads.sql"), "utf8");
    expect(migration).toContain("CREATE TABLE other_trade_leads");
    expect(migration).toContain("CREATE TABLE other_trade_disclosures");
    expect(migration).toMatch(/lead_id[^,]*UNIQUE|UNIQUE\s*\(lead_id\)/i);
    expect(migration).toMatch(/consent_status[\s\S]*granted[\s\S]*withdrawn[\s\S]*disclosed/i);
    expect(migration).toMatch(/provider_recipient[\s\S]*DEFAULT NULL/i);
    expect(migration).toContain("photo_urls_json");
    expect(migration).toContain("consent_text_sha256");
    expect(migration).toContain("delivery_status");
    expect(migration).toContain("review_status");
    expect(migration).toMatch(/production rollback[\s\S]*retain[\s\S]*audit/i);
    expect(migration).not.toMatch(/DROP TABLE/i);
  });
});
