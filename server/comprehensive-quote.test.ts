import { describe, expect, it } from "vitest";
import {
  comprehensiveQuoteSchema,
  formatQuoteBriefText,
  toLegacyQuoteFields,
} from "../shared/quoteBrief";

const completeQuote = {
  version: 1 as const,
  contact: {
    name: "Jordan Client",
    mobile: "0412 345 678",
    email: "jordan@example.com",
    preferredContact: "sms" as const,
    company: "",
  },
  location: {
    streetAddress: "",
    suburb: "Camp Hill",
    postcode: "4152",
  },
  scope: {
    services: ["driveway"],
    workType: "replacement" as const,
    finish: "exposed" as const,
    timeframe: "within_1_month" as const,
    description: "Remove the existing driveway and replace it with exposed aggregate concrete.",
  },
  measurements: {
    mode: "dimensions" as const,
    lengthM: 10,
    widthM: 5,
    totalAreaM2: 50,
    separateAreaNotes: "Main driveway only",
  },
  siteConditions: {
    existingConcreteRemoval: true,
    accessWidthM: 3.2,
    vehicleAccess: "easy" as const,
    slope: "slight" as const,
    drainage: "existing_drain" as const,
    pumpAccess: "not_sure" as const,
    knownServices: "Water line near the garage",
    approvalStatus: "not_sure" as const,
    specialRequirements: "Keep access to the side gate",
  },
  photos: [
    {
      url: "https://files.example.com/quote/site-wide.jpg",
      fileName: "site-wide.jpg",
      contentType: "image/jpeg",
    },
  ],
  consents: {
    contact: true,
    privacy: true,
    marketing: false,
  },
};

describe("comprehensiveQuoteSchema", () => {
  it("accepts a complete structured concrete job brief", () => {
    const result = comprehensiveQuoteSchema.safeParse(completeQuote);

    expect(result.success).toBe(true);
  });

  it("accepts unknown measurements and no photos so genuine clients are not blocked", () => {
    const result = comprehensiveQuoteSchema.safeParse({
      ...completeQuote,
      measurements: { mode: "not_sure" },
      photos: [],
    });

    expect(result.success).toBe(true);
  });

  it("requires suburb and postcode but keeps the street address optional", () => {
    const missingPostcode = comprehensiveQuoteSchema.safeParse({
      ...completeQuote,
      location: { streetAddress: "", suburb: "Camp Hill", postcode: "" },
    });

    expect(missingPostcode.success).toBe(false);
    if (!missingPostcode.success) {
      expect(missingPostcode.error.issues.some((issue) => issue.path.join(".") === "location.postcode")).toBe(true);
    }
  });

  it("requires a useful project description", () => {
    const result = comprehensiveQuoteSchema.safeParse({
      ...completeQuote,
      scope: { ...completeQuote.scope, description: "driveway" },
    });

    expect(result.success).toBe(false);
  });

  it("rejects more than eight photos and non-image metadata", () => {
    const tooMany = comprehensiveQuoteSchema.safeParse({
      ...completeQuote,
      photos: Array.from({ length: 9 }, (_, index) => ({
        url: `https://files.example.com/quote/photo-${index}.jpg`,
        fileName: `photo-${index}.jpg`,
        contentType: "image/jpeg",
      })),
    });
    const invalidType = comprehensiveQuoteSchema.safeParse({
      ...completeQuote,
      photos: [{ url: "https://files.example.com/quote/file.pdf", fileName: "file.pdf", contentType: "application/pdf" }],
    });

    expect(tooMany.success).toBe(false);
    expect(invalidType.success).toBe(false);
  });

  it("requires contact and privacy consent but keeps marketing optional", () => {
    const result = comprehensiveQuoteSchema.safeParse({
      ...completeQuote,
      consents: { contact: false, privacy: false, marketing: false },
    });

    expect(result.success).toBe(false);
  });
});

describe("comprehensive quote delivery formatting", () => {
  it("creates compatible quote fields without losing structured requirements", () => {
    const parsed = comprehensiveQuoteSchema.parse(completeQuote);
    const legacy = toLegacyQuoteFields(parsed);

    expect(legacy).toMatchObject({
      name: "Jordan Client",
      phone: "0412345678",
      email: "jordan@example.com",
      suburb: "Camp Hill 4152",
    });
    expect(legacy.service).toContain("Driveway");
    expect(legacy.details).toContain("Measurements: 10 m × 5 m (50 m²)");
    expect(legacy.details).toContain("Existing concrete removal: Yes");
    expect(legacy.photoUrls).toEqual(["https://files.example.com/quote/site-wide.jpg"]);
  });

  it("formats a complete owner job brief with no false required-field placeholders", () => {
    const text = formatQuoteBriefText(comprehensiveQuoteSchema.parse(completeQuote));

    expect(text).toContain("CONTACT");
    expect(text).toContain("SITE ADDRESS");
    expect(text).toContain("JOB SCOPE");
    expect(text).toContain("MEASUREMENTS");
    expect(text).toContain("SITE CONDITIONS");
    expect(text).toContain("PHOTOS");
    expect(text).toContain("jordan@example.com");
    expect(text).toContain("Camp Hill QLD 4152");
    expect(text).not.toContain("Email: Not provided");
    expect(text).not.toContain("Suburb: Not specified");
  });
});
