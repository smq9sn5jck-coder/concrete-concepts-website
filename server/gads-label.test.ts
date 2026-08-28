import { describe, it, expect } from "vitest";

describe("Google Ads Conversion Labels", () => {
  // Primary conversion labels — must be real Google Ads labels
  it("VITE_GADS_LABEL_QUOTE environment variable should be set", () => {
    const label = process.env.VITE_GADS_LABEL_QUOTE;
    expect(label).toBeDefined();
    expect(label).not.toBe("");
    expect(typeof label).toBe("string");
  });

  it("VITE_GADS_LABEL_QUOTE should match the expected format", () => {
    const label = process.env.VITE_GADS_LABEL_QUOTE;
    expect(label).toMatch(/^[a-zA-Z0-9_-]+$/);
  });

  it("VITE_GADS_LABEL_PHONE environment variable should be set", () => {
    const label = process.env.VITE_GADS_LABEL_PHONE;
    expect(label).toBeDefined();
    expect(label).not.toBe("");
    expect(typeof label).toBe("string");
  });

  it("VITE_GADS_LABEL_PHONE should match the expected format", () => {
    const label = process.env.VITE_GADS_LABEL_PHONE;
    expect(label).toMatch(/^[a-zA-Z0-9_-]+$/);
  });

  // Secondary conversion labels — set and non-empty (may be placeholder until real labels are created in Google Ads)
  it("VITE_GADS_LABEL_WHATSAPP environment variable should be set", () => {
    const label = process.env.VITE_GADS_LABEL_WHATSAPP?.trim();
    expect(label).toBeDefined();
    expect(label).not.toBe("");
  });

  it("VITE_GADS_LABEL_CALLBACK environment variable should be set", () => {
    const label = process.env.VITE_GADS_LABEL_CALLBACK?.trim();
    expect(label).toBeDefined();
    expect(label).not.toBe("");
  });

  it("VITE_GADS_LABEL_GUIDE environment variable should be set", () => {
    const label = process.env.VITE_GADS_LABEL_GUIDE?.trim();
    expect(label).toBeDefined();
    expect(label).not.toBe("");
  });

  it("VITE_GADS_LABEL_REFERRAL environment variable should be set", () => {
    const label = process.env.VITE_GADS_LABEL_REFERRAL?.trim();
    expect(label).toBeDefined();
    expect(label).not.toBe("");
  });
});
