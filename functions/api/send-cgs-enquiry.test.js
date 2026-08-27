import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { onRequest } from "./send-cgs-enquiry.js";

const validEnquiry = {
  name: "Jordan Builder",
  businessName: "Jordan Builds Pty Ltd",
  email: "jordan@example.com",
  phone: "0412 345 678",
  businessType: "Residential Builder",
  website: "https://jordanbuilds.example",
  growthProblem: "Lead follow-up",
  notes: "We need a better website and automated follow-up.",
  company: "",
  requestId: "cgs-test-1234",
  attribution: {
    utmSource: "ccg-footer",
    landingPage:
      "https://concreteconceptsgroup.com/construction-growth-systems",
  },
};

function makeContext({
  method = "POST",
  origin = "https://concreteconceptsgroup.com",
  env = { RESEND_API_KEY: "test-resend-key" },
  body = validEnquiry,
} = {}) {
  const request = new Request(
    "https://concreteconceptsgroup.com/api/send-cgs-enquiry",
    {
      method,
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify(body) : undefined,
    }
  );

  return { request, env };
}

describe("CGS growth enquiry handler", () => {
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

  it("delivers a valid CGS enquiry through its own notification", async () => {
    const response = await onRequest(makeContext());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      channel: "email",
      requestId: validEnquiry.requestId,
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    const resendRequest = JSON.parse(fetch.mock.calls[0][1].body);
    expect(resendRequest.to).toBe("info@concreteconceptsgroup.com");
    expect(resendRequest.subject).toContain("New CGS Growth Enquiry");
    expect(resendRequest.html).toContain("Jordan Builds Pty Ltd");
    expect(resendRequest.html).toContain("Lead follow-up");
  });

  it("requires identity, business and contact fields", async () => {
    const response = await onRequest(
      makeContext({
        body: {
          ...validEnquiry,
          name: "",
          businessName: "",
          phone: "",
          businessType: "",
          growthProblem: "",
        },
      })
    );

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("requires a valid email address", async () => {
    const response = await onRequest(
      makeContext({ body: { ...validEnquiry, email: "invalid" } })
    );

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("requires a valid Australian phone number", async () => {
    const response = await onRequest(
      makeContext({ body: { ...validEnquiry, phone: "123" } })
    );

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects disallowed origins", async () => {
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
      makeContext({ body: { ...validEnquiry, company: "Spam Company" } })
    );

    expect(response.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("escapes customer-controlled HTML in the notification", async () => {
    const response = await onRequest(
      makeContext({
        body: {
          ...validEnquiry,
          name: "<script>alert(1)</script>",
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
