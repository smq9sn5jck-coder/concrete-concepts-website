import { describe, expect, it } from "vitest";
import {
  type ReferralFormValues,
  validateReferral,
} from "./referral-validation";

const validPrivateReferral: ReferralFormValues = {
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
};

describe("referral form validation", () => {
  it("accepts a valid private referral without a business name", () => {
    expect(validateReferral(validPrivateReferral)).toEqual({});
  });

  it.each(["builder", "trade"] as const)(
    "requires a business name for a %s referral",
    referrerType => {
      expect(
        validateReferral({
          ...validPrivateReferral,
          referrerType,
          referrerBusiness: "",
        })
      ).toMatchObject({ referrerBusiness: expect.any(String) });
    }
  );

  it.each(["builder", "trade"] as const)(
    "accepts a business name for a %s referral",
    referrerType => {
      expect(
        validateReferral({
          ...validPrivateReferral,
          referrerType,
          referrerBusiness: "Example Construction Pty Ltd",
        })
      ).toEqual({});
    }
  );

  it("requires referrer and customer contact details", () => {
    expect(
      validateReferral({
        ...validPrivateReferral,
        referrerName: "",
        referrerPhone: "",
        customerName: "",
        customerPhone: "",
      })
    ).toMatchObject({
      referrerName: expect.any(String),
      referrerPhone: expect.any(String),
      customerName: expect.any(String),
      customerPhone: expect.any(String),
    });
  });

  it("rejects invalid Australian phone numbers", () => {
    expect(
      validateReferral({
        ...validPrivateReferral,
        referrerPhone: "123",
        customerPhone: "abcdefghij",
      })
    ).toMatchObject({
      referrerPhone: expect.any(String),
      customerPhone: expect.any(String),
    });
  });

  it("rejects an invalid optional email address", () => {
    expect(
      validateReferral({ ...validPrivateReferral, referrerEmail: "invalid" })
    ).toMatchObject({ referrerEmail: expect.any(String) });
  });

  it("requires a suburb and project type", () => {
    expect(
      validateReferral({
        ...validPrivateReferral,
        suburb: "",
        projectType: "",
      })
    ).toMatchObject({
      suburb: expect.any(String),
      projectType: expect.any(String),
    });
  });

  it("requires customer contact consent", () => {
    expect(
      validateReferral({
        ...validPrivateReferral,
        consentConfirmed: false,
      })
    ).toMatchObject({ consentConfirmed: expect.any(String) });
  });
});
