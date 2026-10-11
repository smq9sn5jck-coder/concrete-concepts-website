import { describe, expect, it } from "vitest";
import {
  comprehensiveQuoteSchema,
  formatQuoteBriefText,
} from "../shared/quoteBrief";

const completeQuote = {
  version: 1 as const,
  contact: {
    name: "Jordan Client",
    mobile: "0412 345 678",
    email: "jordan@example.com",
    preferredContact: "sms" as const,
  },
  location: { streetAddress: "12 Actual Project Street", suburb: "Wynnum", postcode: "4178" },
  scope: {
    services: ["driveway"],
    workType: "replacement" as const,
    finish: "exposed" as const,
    timeframe: "planning" as const,
    description: "Replace the existing driveway with exposed aggregate concrete and safe access.",
  },
  measurements: { mode: "not_sure" as const },
  siteConditions: {},
  photos: [],
  consents: { contact: true as const, privacy: true as const, marketing: false },
};

describe("optional candidate project context in comprehensive quote schema", () => {
  it("preserves baseline callers without a project context", () => {
    const parsed = comprehensiveQuoteSchema.parse(completeQuote);
    expect(parsed.projectContext).toBeUndefined();
    expect(formatQuoteBriefText(parsed)).not.toContain("PROJECT CONTEXT");
  });

  it("accepts and formats a truthful builder context while enforcing its candidate requirements", () => {
    const result = comprehensiveQuoteSchema.safeParse({
      ...completeQuote,
      projectContext: {
        audienceType: "builder_developer",
        structuralProjectType: "other_concrete",
        builderCompanyName: "Bayside Build Co",
        requiredConcreteScope: "Garage slab, driveway crossover and paths",
        indicativeProgramme: "Planning / site-ready timing to be confirmed",
        region: "Brisbane",
        landingRoute: "/areas/wynnum",
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(formatQuoteBriefText(result.data)).toContain("PROJECT CONTEXT");
      expect(formatQuoteBriefText(result.data)).toContain("Builder company: Bayside Build Co");
      expect(formatQuoteBriefText(result.data)).toContain("Partner introduction interest: No");
    }

    const missingBuilderRequirements = comprehensiveQuoteSchema.safeParse({
      ...completeQuote,
      location: { ...completeQuote.location, streetAddress: "" },
      projectContext: {
        audienceType: "builder_developer",
        structuralProjectType: "other_concrete",
        builderCompanyName: "",
        requiredConcreteScope: "short",
        indicativeProgramme: "",
      },
    });
    expect(missingBuilderRequirements.success).toBe(false);
    if (!missingBuilderRequirements.success) {
      expect(missingBuilderRequirements.error.issues.map((issue) => issue.path.join("."))).toEqual(expect.arrayContaining([
        "location.streetAddress",
        "projectContext.builderCompanyName",
        "projectContext.requiredConcreteScope",
        "projectContext.indicativeProgramme",
      ]));
    }
  });

  it("enforces complete-extension concrete slab and owner-review partner boundary without a forwarding path", () => {
    const invalid = comprehensiveQuoteSchema.safeParse({
      ...completeQuote,
      projectContext: {
        audienceType: "homeowner",
        structuralProjectType: "complete_extension",
        partnerIntroductionInterest: true,
      },
    });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues.map((issue) => issue.path.join("."))).toEqual(expect.arrayContaining([
        "scope.services",
        "projectContext.partnerIntroductionInterest",
      ]));
    }

    const valid = comprehensiveQuoteSchema.parse({
      ...completeQuote,
      scope: { ...completeQuote.scope, services: ["slab"] },
      projectContext: {
        audienceType: "homeowner",
        structuralProjectType: "complete_extension",
        partnerIntroductionInterest: true,
      },
    });
    expect(formatQuoteBriefText(valid)).toContain("Partner introduction interest: Yes — CCG review only");
    expect(formatQuoteBriefText(valid)).not.toContain("automatic forwarding");
  });
});
