import { describe, it, expect } from "vitest";
import { generateQuotePdf } from "./quotePdf";
import { isTwilioConfigured } from "./smsFollowUp";

describe("Quote PDF Generation", () => {
  it("blocks every legacy generic-rate estimate request", () => {
    expect(() => generateQuotePdf({
      name: "Other User",
      phone: "0411 111 111",
      email: "other@test.com",
      suburb: "Springfield",
      service: "Other",
    })).toThrow(/retired/i);
  });
});

describe("SMS Follow-Up Configuration", () => {
  it("reports Twilio as not configured when env vars are missing", () => {
    // In test environment, Twilio env vars should not be set
    expect(isTwilioConfigured()).toBe(false);
  });
});

describe("Callback Router Schema", () => {
  it("validates callback input schema requires name and phone", async () => {
    // Import zod for schema validation testing
    const { z } = await import("zod");

    const callbackSchema = z.object({
      name: z.string().min(1, "Name is required"),
      phone: z.string().min(1, "Phone is required"),
      page: z.string().optional(),
      leadSource: z.string().optional(),
    });

    // Valid input
    const valid = callbackSchema.safeParse({
      name: "John",
      phone: "0412345678",
      page: "/",
    });
    expect(valid.success).toBe(true);

    // Invalid: missing name
    const invalidName = callbackSchema.safeParse({
      name: "",
      phone: "0412345678",
    });
    expect(invalidName.success).toBe(false);

    // Invalid: missing phone
    const invalidPhone = callbackSchema.safeParse({
      name: "John",
      phone: "",
    });
    expect(invalidPhone.success).toBe(false);
  });
});
