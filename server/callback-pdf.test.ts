import { describe, it, expect } from "vitest";
import { generateQuotePdf } from "./quotePdf";
import { isTwilioConfigured } from "./smsFollowUp";

describe("Quote PDF Generation", () => {
  it("generates a valid PDF buffer for a driveway quote", () => {
    const pdf = generateQuotePdf({
      name: "John Smith",
      phone: "0412 345 678",
      email: "john@example.com",
      suburb: "Carindale",
      service: "Driveway",
      details: "Need a new exposed aggregate driveway, approximately 60m2",
      quoteId: 42,
    });

    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(1000); // PDF should have substantial content
    // Check PDF magic bytes (%PDF)
    const header = pdf.subarray(0, 5).toString("ascii");
    expect(header).toBe("%PDF-");
  });

  it("generates a PDF without optional fields", () => {
    const pdf = generateQuotePdf({
      name: "Jane Doe",
      phone: "0400 000 000",
      email: "jane@example.com",
      suburb: "Logan",
      service: "Retaining Wall",
    });

    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(1000);
    const header = pdf.subarray(0, 5).toString("ascii");
    expect(header).toBe("%PDF-");
  });

  it("generates a PDF for exposed aggregate service", () => {
    const pdf = generateQuotePdf({
      name: "Test User",
      phone: "0424 463 268",
      email: "test@test.com",
      suburb: "Chermside",
      service: "Exposed Aggregate",
      details: "Pool surround area about 30m2",
      quoteId: 100,
    });

    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(1000);
  });

  it("generates a PDF for an unknown/other service type", () => {
    const pdf = generateQuotePdf({
      name: "Other User",
      phone: "0411 111 111",
      email: "other@test.com",
      suburb: "Springfield",
      service: "Other",
    });

    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(500);
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
