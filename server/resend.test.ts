import { describe, it, expect } from "vitest";
import { sendQuoteNotificationEmail } from "./email";

describe("Resend API Key Validation", () => {
  it("should have RESEND_API_KEY environment variable set", () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiKey!.startsWith("re_")).toBe(true);
  });

  it("should be able to authenticate with Resend API", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    const response = await fetch("https://api.resend.com/domains", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    expect(response.status).toBe(200);
  }, 15000);

  it("should send a quote notification email successfully", async () => {
    const result = await sendQuoteNotificationEmail({
      name: "Test User",
      phone: "0400 000 000",
      email: "info@concreteconceptsgroup.com",
      suburb: "Brisbane CBD",
      service: "Concrete Driveway",
      details: "This is a test notification from vitest.",
    });
    expect(result).toBe(true);
  }, 15000);
});
