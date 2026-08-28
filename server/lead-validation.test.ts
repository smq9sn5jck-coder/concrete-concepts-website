import { describe, expect, it } from "vitest";
import {
  assessSubmissionSignals,
  classifyServiceArea,
  createLeadFingerprint,
  SubmissionRateLimiter,
  validateAustralianPhone,
} from "@shared/leadValidation";

describe("validateAustralianPhone", () => {
  it("accepts and normalizes an Australian mobile number", () => {
    expect(validateAustralianPhone("0424 463 268")).toMatchObject({
      valid: true,
      normalized: "0424463268",
      kind: "mobile",
    });
  });

  it("accepts an Australian mobile number in international format", () => {
    expect(validateAustralianPhone("+61 424 463 268")).toMatchObject({
      valid: true,
      normalized: "0424463268",
      kind: "mobile",
    });
  });

  it("accepts a Queensland landline", () => {
    expect(validateAustralianPhone("(07) 3123 4567")).toMatchObject({
      valid: true,
      normalized: "0731234567",
      kind: "landline",
    });
  });

  it.each([
    "+52 55 1234 5678",
    "+91 98765 43210",
    "123456",
    "phone number",
    "0000000000",
  ])("rejects an invalid or overseas number: %s", phone => {
    expect(validateAustralianPhone(phone).valid).toBe(false);
  });
});

describe("classifyServiceArea", () => {
  it.each(["Carindale 4152", "Brisbane", "Kooralbyn QLD 4285", "Cooroy QLD 4563"])(
    "classifies an approved Greater Brisbane or surrounding SEQ location as in area: %s",
    location => {
      expect(classifyServiceArea(location).status).toBe("in_area");
    }
  );

  it("allows a plausible Queensland boundary enquiry for manual review", () => {
    expect(classifyServiceArea("Toowoomba QLD 4350")).toMatchObject({
      status: "service_area_review",
      canSubmit: true,
    });
  });

  it.each(["Sydney NSW 2000", "Melbourne VIC 3000", "Manila Philippines"])(
    "rejects a clearly out-of-state or overseas location: %s",
    location => {
      expect(classifyServiceArea(location)).toMatchObject({
        status: "invalid",
        canSubmit: false,
      });
    }
  );

  it("rejects a missing location", () => {
    expect(classifyServiceArea("   ").status).toBe("invalid");
  });
});

describe("assessSubmissionSignals", () => {
  it("rejects a filled honeypot", () => {
    expect(
      assessSubmissionSignals({
        honeypot: "https://spam.example",
        startedAt: 10_000,
        now: 20_000,
      })
    ).toMatchObject({ allowed: false, reason: "bot_detected" });
  });

  it("rejects an implausibly fast submission", () => {
    expect(
      assessSubmissionSignals({
        honeypot: "",
        startedAt: 10_000,
        now: 11_000,
      })
    ).toMatchObject({ allowed: false, reason: "submitted_too_fast" });
  });

  it("allows a normally completed form", () => {
    expect(
      assessSubmissionSignals({
        honeypot: "",
        startedAt: 10_000,
        now: 18_000,
      })
    ).toEqual({ allowed: true });
  });
});

describe("createLeadFingerprint", () => {
  it("creates the same fingerprint for equivalent normalized lead details", () => {
    expect(
      createLeadFingerprint({
        phone: "0424 463 268",
        email: " Client@Example.com ",
        location: " Carindale 4152 ",
      })
    ).toBe(
      createLeadFingerprint({
        phone: "+61 424 463 268",
        email: "client@example.com",
        location: "carindale 4152",
      })
    );
  });
});

describe("SubmissionRateLimiter", () => {
  it("blocks a rapid repeat but permits a later retry", () => {
    const limiter = new SubmissionRateLimiter({ windowMs: 120_000, maxAttempts: 1 });
    const fingerprint = "lead-123";

    expect(limiter.attempt(fingerprint, 1_000)).toEqual({ allowed: true });
    expect(limiter.attempt(fingerprint, 60_000)).toMatchObject({
      allowed: false,
      reason: "duplicate_submission",
    });
    expect(limiter.attempt(fingerprint, 121_001)).toEqual({ allowed: true });
  });
});
