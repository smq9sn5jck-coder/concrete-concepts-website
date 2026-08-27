import { describe, expect, it } from "vitest";
import { type CGSFormValues, validateCGSEnquiry } from "./cgs-validation";

const validEnquiry: CGSFormValues = {
  name: "Jordan Builder",
  businessName: "Jordan Builds Pty Ltd",
  email: "jordan@example.com",
  phone: "0412 345 678",
  businessType: "Residential Builder",
  website: "https://jordanbuilds.example",
  growthProblem: "Lead follow-up",
  notes: "We need a better website and automated follow-up.",
  company: "",
};

describe("CGS enquiry validation", () => {
  it("accepts a complete growth enquiry", () => {
    expect(validateCGSEnquiry(validEnquiry)).toEqual({});
  });

  it("requires identity, business and contact fields", () => {
    expect(
      validateCGSEnquiry({
        ...validEnquiry,
        name: "",
        businessName: "",
        email: "",
        phone: "",
      })
    ).toMatchObject({
      name: expect.any(String),
      businessName: expect.any(String),
      email: expect.any(String),
      phone: expect.any(String),
    });
  });

  it("requires a business type and main growth problem", () => {
    expect(
      validateCGSEnquiry({
        ...validEnquiry,
        businessType: "",
        growthProblem: "",
      })
    ).toMatchObject({
      businessType: expect.any(String),
      growthProblem: expect.any(String),
    });
  });

  it("rejects an invalid email address", () => {
    expect(
      validateCGSEnquiry({ ...validEnquiry, email: "invalid" })
    ).toMatchObject({ email: expect.any(String) });
  });

  it("rejects an invalid Australian phone number", () => {
    expect(validateCGSEnquiry({ ...validEnquiry, phone: "123" })).toMatchObject(
      { phone: expect.any(String) }
    );
  });

  it("allows the current website and notes to be omitted", () => {
    expect(
      validateCGSEnquiry({ ...validEnquiry, website: "", notes: "" })
    ).toEqual({});
  });
});
