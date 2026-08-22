import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { onRequest } from "./send-quote.js";

const allowedOrigin = "https://concreteconceptsgroup.com";

function makeContext({
  method = "POST",
  origin = allowedOrigin,
  env = { RESEND_API_KEY: "test-resend-key" },
  body = {
    name: "Test Customer",
    email: "test@example.com",
    phone: "0412345678",
    service: "Driveway",
    suburb: "Brisbane",
    message: "Please call me",
    requestId: "oldrepo-test-1234",
  },
} = {}) {
  const headers = new Headers({ Origin: origin, "Content-Type": "application/json" });
  const request = new Request("https://concreteconceptsgroup.com/api/send-quote", {
    method,
    headers,
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
  return { request, env };
}

describe("legacy public repository lead handler", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "email-test-id" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("contains no Jotform credential or integration code", () => {
    const source = readFileSync(new URL("./send-quote.js", import.meta.url), "utf8");
    expect(source).not.toMatch(/JOTFORM|api\.jotform\.com|261984004033855/);
  });

  it("delivers a valid lead through Resend only", async () => {
    const response = await onRequest(makeContext());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({ success: true, channel: "email" });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe("https://api.resend.com/emails");
  });

  it("rejects requests from a disallowed origin", async () => {
    const response = await onRequest(makeContext({ origin: "https://example.invalid" }));
    expect(response.status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns a service-unavailable response when the Resend secret is absent", async () => {
    const response = await onRequest(makeContext({ env: {} }));
    expect(response.status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects missing required fields before any external request", async () => {
    const response = await onRequest(
      makeContext({ body: { name: "", phone: "", service: "", suburb: "" } }),
    );
    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("escapes customer-controlled HTML in the email body", async () => {
    const response = await onRequest(
      makeContext({
        body: {
          name: "<script>alert(1)</script>",
          email: "test@example.com",
          phone: "0412345678",
          service: "Driveway",
          suburb: "Brisbane",
          message: "<img src=x onerror=alert(1)>",
          requestId: "oldrepo-test-5678",
        },
      }),
    );

    expect(response.status).toBe(200);
    const resendRequest = JSON.parse(fetch.mock.calls[0][1].body);
    expect(resendRequest.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(resendRequest.html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(resendRequest.html).not.toContain("<script>alert(1)</script>");
  });
});
