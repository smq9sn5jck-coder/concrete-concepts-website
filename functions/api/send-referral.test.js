import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { onRequest } from "./send-referral.js";

const allowedOrigin = "https://concreteconceptsgroup.com";

const validReferral = {
  referrerType: "private",
  referrerName: "Alex Referrer",
  referrerBusiness: "",
  referrerPhone: "0412 345 678",
  referrerEmail: "alex@example.com",
  customerName: "Taylor Customer",
  customerPhone: "0400 123 456",
  suburb: "Ipswich",
  projectType: "Concrete Driveway",
  notes: "Around 80 square metres",
  consentConfirmed: true,
  company: "",
  requestId: "referral-test-1234",
  attribution: {
    utmSource: "google",
    utmMedium: "cpc",
    gclid: "test-click-id",
    landingPage: "https://concreteconceptsgroup.com/trade-referral-program",
  },
};

function makeContext({
  method = "POST",
  origin = allowedOrigin,
  env = { RESEND_API_KEY: "test-resend-key" },
  body = validReferral,
} = {}) {
  const request = new Request(
    "https://concreteconceptsgroup.com/api/send-referral",
    {
      method,
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify(body) : undefined,
    }
  );

  return { request, env };
}

describe("referral lead handler", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "email-test-id" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("delivers a valid private referral and returns a public reference", async () => {
    const response = await onRequest(makeContext());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      channel: "email",
      requestId: validReferral.requestId,
    });
    expect(payload.reference).toMatch(/^CCG-REF-[A-Z0-9]{6}$/);
    expect(fetch).toHaveBeenCalledTimes(1);

    const resendRequest = JSON.parse(fetch.mock.calls[0][1].body);
    expect(resendRequest.to).toBe("info@concreteconceptsgroup.com");
    expect(resendRequest.subject).toContain("New $100 Referral");
    expect(resendRequest.html).toContain("Taylor Customer");
    expect(resendRequest.html).toContain("test-click-id");
  });

  it.each(["builder", "trade"])(
    "accepts a valid %s referral with a business name",
    async referrerType => {
      const response = await onRequest(
        makeContext({
          body: {
            ...validReferral,
            referrerType,
            referrerBusiness: "Example Construction Pty Ltd",
          },
        })
      );

      expect(response.status).toBe(200);
      expect(fetch).toHaveBeenCalledTimes(1);
    }
  );

  it.each(["builder", "trade"])(
    "requires a business name for %s referrals",
    async referrerType => {
      const response = await onRequest(
        makeContext({
          body: { ...validReferral, referrerType, referrerBusiness: "" },
        })
      );
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload.error).toMatch(/business name/i);
      expect(fetch).not.toHaveBeenCalled();
    }
  );

  it("requires the referred customer name and phone", async () => {
    const response = await onRequest(
      makeContext({
        body: { ...validReferral, customerName: "", customerPhone: "" },
      })
    );

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("requires confirmation that the customer agreed to contact", async () => {
    const response = await onRequest(
      makeContext({ body: { ...validReferral, consentConfirmed: false } })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/permission|consent|agreed/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects a disallowed origin", async () => {
    const response = await onRequest(
      makeContext({ origin: "https://example.invalid" })
    );

    expect(response.status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns service unavailable when the Resend secret is absent", async () => {
    const response = await onRequest(makeContext({ env: {} }));

    expect(response.status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("acknowledges honeypot submissions without sending email", async () => {
    const response = await onRequest(
      makeContext({ body: { ...validReferral, company: "Spam Company" } })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({ success: true, channel: "email" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("escapes customer-controlled HTML in the notification", async () => {
    const response = await onRequest(
      makeContext({
        body: {
          ...validReferral,
          referrerName: "<script>alert(1)</script>",
          notes: "<img src=x onerror=alert(1)>",
        },
      })
    );

    expect(response.status).toBe(200);
    const resendRequest = JSON.parse(fetch.mock.calls[0][1].body);
    expect(resendRequest.html).toContain(
      "&lt;script&gt;alert(1)&lt;/script&gt;"
    );
    expect(resendRequest.html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(resendRequest.html).not.toContain("<script>alert(1)</script>");
  });
});
