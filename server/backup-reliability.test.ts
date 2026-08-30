import { resolve } from "path";
import { pathToFileURL } from "url";
import { afterEach, describe, expect, it, vi } from "vitest";

type D1RunResult = {
  success?: boolean;
  meta?: { changes?: number };
};

function createD1Mock(result: D1RunResult) {
  const boundValues: unknown[][] = [];
  const sqlStatements: string[] = [];
  const run = vi.fn(async () => result);
  const bind = vi.fn((...values: unknown[]) => {
    boundValues.push(values);
    return { run };
  });
  const prepare = vi.fn((sql: string) => {
    sqlStatements.push(sql);
    return { bind };
  });

  return { database: { prepare }, prepare, bind, run, boundValues, sqlStatements };
}

async function loadWorker(testName: string) {
  const workerUrl = `${pathToFileURL(resolve(__dirname, "../client/public/_worker.js")).href}?backup=${testName}-${Date.now()}-${Math.random()}`;
  const { default: edgeWorker } = await import(workerUrl);
  return edgeWorker;
}

function callbackRequest(phone: string, ip: string) {
  return new Request("https://concreteconceptsgroup.com/api/callback-submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip },
    body: JSON.stringify({
      name: "CCG Backup Contract Test",
      phone,
      suburb: "Morningside",
      leadSource: "labelled-backup-contract-test",
      page: "Automated contract test",
      website: "",
      formStartedAt: Date.now() - 5_000,
    }),
  });
}

function completeQuoteRequest() {
  const jobBrief = {
    version: 1,
    contact: {
      name: "CCG Backup Contract Test",
      mobile: "0424 111 304",
      email: "backup-contract@example.com",
      preferredContact: "sms",
      company: "",
    },
    location: {
      streetAddress: "",
      suburb: "Camp Hill",
      postcode: "4152",
    },
    scope: {
      services: ["driveway"],
      workType: "replacement",
      finish: "exposed",
      timeframe: "within_1_month",
      description: "Labelled automated backup contract test for a replacement driveway.",
    },
    measurements: {
      mode: "dimensions",
      lengthM: 10,
      widthM: 5,
      totalAreaM2: 50,
      separateAreaNotes: "Contract test only",
    },
    siteConditions: {
      existingConcreteRemoval: true,
      accessWidthM: 3.2,
      vehicleAccess: "easy",
      slope: "slight",
      drainage: "existing_drain",
      pumpAccess: "not_sure",
      knownServices: "Contract test",
      approvalStatus: "not_sure",
      specialRequirements: "Do not treat as a customer lead",
    },
    photos: [{
      url: "https://files.example.com/quote/labelled-contract-test.jpg",
      fileName: "labelled-contract-test.jpg",
      contentType: "image/jpeg",
    }],
    consents: { contact: true, privacy: true, marketing: false },
  };

  return new Request("https://concreteconceptsgroup.com/api/quote-submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.34" },
    body: JSON.stringify({
      name: jobBrief.contact.name,
      phone: jobBrief.contact.mobile,
      email: jobBrief.contact.email,
      suburb: `${jobBrief.location.suburb} ${jobBrief.location.postcode}`,
      service: "Driveway",
      details: jobBrief.scope.description,
      photoUrls: jobBrief.photos.map(photo => photo.url),
      jobBrief,
      leadSource: "labelled-backup-contract-test",
      website: "",
      formStartedAt: Date.now() - 10_000,
    }),
  });
}

describe("Cloudflare lead backup reliability", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects an HTML 200 fallback response instead of falsely logging a backup", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("backup.example.test")) {
        return new Response("<!doctype html><title>Website shell</title>", {
          status: 200,
          headers: { "Content-Type": "text/html; charset=UTF-8" },
        });
      }
      return new Response('{"error":"forced delivery failure"}', {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }));

    const edgeWorker = await loadWorker("html-200");
    const response = await edgeWorker.fetch(callbackRequest("0424 111 301", "203.0.113.31"), {
      RESEND_API_KEY: "test-resend-key",
      MANUS_BACKEND_URL: "https://backup.example.test",
      JOTFORM_FORM_ID: "test-jotform-id",
    }, { waitUntil: (_promise: Promise<unknown>) => undefined });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      channels: { email: "failed", sheets: "failed", jotform: "failed" },
    });
  });

  it("logs a backup only after D1 confirms exactly one inserted record", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"error":"forced delivery failure"}', {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })));
    const d1 = createD1Mock({ success: true, meta: { changes: 1 } });

    const edgeWorker = await loadWorker("confirmed-insert");
    const response = await edgeWorker.fetch(callbackRequest("0424 111 302", "203.0.113.32"), {
      RESEND_API_KEY: "test-resend-key",
      JOTFORM_FORM_ID: "test-jotform-id",
      LEAD_BACKUP_DB: d1.database,
    }, { waitUntil: (_promise: Promise<unknown>) => undefined });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      channels: { email: "failed", sheets: "logged", jotform: "failed" },
    });
    expect(d1.prepare).toHaveBeenCalledOnce();
    expect(d1.sqlStatements[0]).toContain("INSERT INTO lead_backups");
    expect(d1.boundValues[0]).toHaveLength(12);
    expect(d1.boundValues[0][0]).toMatch(/^lead_[a-f0-9-]{36}$/);
  });

  it("does not log D1 responses that report zero changed rows", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"error":"forced delivery failure"}', {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })));
    const d1 = createD1Mock({ success: true, meta: { changes: 0 } });

    const edgeWorker = await loadWorker("zero-change");
    const response = await edgeWorker.fetch(callbackRequest("0424 111 303", "203.0.113.33"), {
      RESEND_API_KEY: "test-resend-key",
      JOTFORM_FORM_ID: "test-jotform-id",
      LEAD_BACKUP_DB: d1.database,
    }, { waitUntil: (_promise: Promise<unknown>) => undefined });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      channels: { email: "failed", sheets: "failed", jotform: "failed" },
    });
  });

  it("stores the complete quote brief and photo metadata in a confirmed D1 record", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"error":"forced delivery failure"}', {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })));
    const d1 = createD1Mock({ success: true, meta: { changes: 1 } });

    const edgeWorker = await loadWorker("complete-quote");
    const response = await edgeWorker.fetch(completeQuoteRequest(), {
      RESEND_API_KEY: "test-resend-key",
      JOTFORM_FORM_ID: "test-jotform-id",
      LEAD_BACKUP_DB: d1.database,
    }, { waitUntil: (_promise: Promise<unknown>) => undefined });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      channels: { email: "failed", sheets: "logged", jotform: "failed" },
      serviceAreaStatus: "in_area",
    });
    expect(d1.boundValues[0][1]).toBe("quote");
    expect(String(d1.boundValues[0][10])).toContain("labelled-contract-test.jpg");
    expect(String(d1.boundValues[0][11])).toContain('"totalAreaM2":50');
  });
});
