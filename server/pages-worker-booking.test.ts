import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// @ts-expect-error The production Pages Worker is intentionally shipped as plain JavaScript.
import worker from "../client/public/_worker.js";

const bookingToken = "a".repeat(64);

const completeQuote = {
  version: 1,
  contact: {
    name: "Jordan Client",
    mobile: "0498 887 766",
    email: "jordan@example.com",
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
    description: "Remove the existing driveway and replace it with exposed aggregate concrete.",
  },
  measurements: {
    mode: "dimensions",
    lengthM: 10,
    widthM: 5,
    totalAreaM2: 50,
    separateAreaNotes: "Main driveway only",
  },
  siteConditions: {
    existingConcreteRemoval: true,
    accessWidthM: 3.2,
    vehicleAccess: "easy",
    slope: "slight",
    drainage: "existing_drain",
    pumpAccess: "not_sure",
    knownServices: "Water line near the garage",
    approvalStatus: "not_sure",
    specialRequirements: "Keep access to the side gate",
  },
  photos: [],
  consents: {
    contact: true,
    privacy: true,
    marketing: false,
  },
};

function testEnv() {
  return {
    RESEND_API_KEY: "resend-test-key",
    BOOKING_GATE_URL: "https://leads.concreteconceptsgroup.com",
    BOOKING_GATE_SECRET: "booking-test-secret",
    LEAD_BACKUP_DB: {
      prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
          run: vi.fn(async () => ({ success: true, meta: { changes: 1 } })),
        })),
      })),
    },
    ASSETS: {
      fetch: vi.fn(async () => new Response("Method Not Allowed", { status: 405 })),
    },
  };
}

function testContext() {
  return { waitUntil: vi.fn() };
}

function post(path: string, json: unknown) {
  return new Request(`https://concreteconceptsgroup.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "CF-Connecting-IP": "203.0.113.24" },
    body: JSON.stringify({ json }),
  });
}

describe("production Pages Worker booking gateway", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates a one-time booking delivery token after a delivered detailed quote", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "https://leads.concreteconceptsgroup.com/api/public/booking-link/create") {
        return Response.json({ token: bookingToken, expiresAt: "2026-09-21T00:00:00.000Z" });
      }
      if (url.startsWith("https://api.resend.com/")) return Response.json({ id: "email-test" });
      if (url.startsWith("https://submit.jotform.com/")) return new Response("ok");
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await worker.fetch(
      post("/api/trpc/quote.submit", {
        submissionId: "123e4567-e89b-42d3-a456-426614174010",
        jobBrief: completeQuote,
        leadSource: "comprehensive-quote",
      }),
      testEnv(),
      testContext(),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result.data.json.bookingDeliveryToken).toBe(bookingToken);
    expect(body.result.data.json.transactionId).toBe("CCG-Q-123e4567-e89b-42d3-a456-426614174010");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://leads.concreteconceptsgroup.com/api/public/booking-link/create",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-booking-gate-secret": "booking-test-secret",
        }),
      }),
    );
  });

  it("does not issue booking tokens for the homepage quick quote", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("https://api.resend.com/")) return Response.json({ id: "email-test" });
      if (url.startsWith("https://submit.jotform.com/")) return new Response("ok");
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await worker.fetch(
      post("/api/trpc/quote.submit", {
        submissionId: "123e4567-e89b-42d3-a456-426614174011",
        name: "Quick Client",
        phone: "0497 776 655",
        email: "quick@example.com",
        service: "Driveway",
        suburb: "Carindale 4152",
        details: "Replace the existing driveway with exposed aggregate concrete.",
        formType: "hero_quick_quote",
      }),
      testEnv(),
      testContext(),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result.data.json.bookingDeliveryToken).toBeUndefined();
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes("/booking-link/create"))).toBe(false);
  });

  it("proxies the one-time SMS request through the authenticated booking gateway", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "https://leads.concreteconceptsgroup.com/api/public/booking-link/send") {
        return Response.json({ status: "invalid" });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await worker.fetch(
      post("/api/trpc/quote.sendBookingLink", { token: "0".repeat(64) }),
      testEnv(),
      testContext(),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ result: { data: { json: { status: "invalid" } } } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns unavailable without contacting a provider when the gateway is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const env = testEnv();
    delete env.BOOKING_GATE_SECRET;

    const response = await worker.fetch(
      post("/api/trpc/quote.sendBookingLink", { token: "0".repeat(64) }),
      env,
      testContext(),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      result: { data: { json: { status: "unavailable" } } },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
