import { describe, expect, it } from "vitest";
import {
  formatQuoteProjectContextLines,
  validateQuoteProjectContext,
} from "../shared/quoteProjectContext";

const validBuilderContext = {
  audienceType: "builder_developer",
  structuralProjectType: "other_concrete",
  builderCompanyName: "Bayside Build Co",
  requiredConcreteScope: "Garage slab, driveway crossover and paths",
  indicativeProgramme: "Planning / site-ready timing to be confirmed",
};

describe("quote project context validation", () => {
  it("keeps project context optional for legacy callers", () => {
    expect(validateQuoteProjectContext(undefined, {
      streetAddress: "",
      services: ["driveway"],
    })).toEqual({ success: true, data: undefined });
  });

  it("requires truthful builder company, site address, concrete scope and programme", () => {
    const invalid = validateQuoteProjectContext(validBuilderContext, {
      streetAddress: "",
      services: ["driveway"],
    });

    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.issues.map((issue) => issue.path)).toEqual(expect.arrayContaining([
        "location.streetAddress",
      ]));
    }

    expect(validateQuoteProjectContext({
      ...validBuilderContext,
      builderCompanyName: " ",
      requiredConcreteScope: "short",
      indicativeProgramme: " ",
    }, {
      streetAddress: "12 Actual Project Street",
      services: ["driveway"],
    })).toMatchObject({
      success: false,
      issues: expect.arrayContaining([
        expect.objectContaining({ path: "projectContext.builderCompanyName" }),
        expect.objectContaining({ path: "projectContext.requiredConcreteScope" }),
        expect.objectContaining({ path: "projectContext.indicativeProgramme" }),
      ]),
    });
  });

  it("allows homeowner non-structural work with an explicit other-concrete default and no document fields", () => {
    expect(validateQuoteProjectContext({
      audienceType: "homeowner",
      structuralProjectType: "other_concrete",
    }, {
      streetAddress: "",
      services: ["driveway"],
    })).toEqual({
      success: true,
      data: {
        audienceType: "homeowner",
        structuralProjectType: "other_concrete",
        plansReadiness: undefined,
        engineeringReadiness: undefined,
        soilFoundationReadiness: undefined,
        certifierApprovalStatus: undefined,
        builderCompanyName: "",
        builderRole: "",
        numberOfSitesOrPours: "",
        requiredConcreteScope: "",
        indicativeProgramme: "",
        preferredFollowUp: "",
        region: "",
        landingRoute: "",
        partnerIntroductionInterest: false,
      },
    });
  });

  it("requires a slab for complete extensions and clears ineligible partner interest", () => {
    expect(validateQuoteProjectContext({
      audienceType: "homeowner",
      structuralProjectType: "complete_extension",
      partnerIntroductionInterest: true,
    }, {
      streetAddress: "",
      services: ["driveway"],
    })).toMatchObject({
      success: false,
      issues: expect.arrayContaining([
        expect.objectContaining({ path: "scope.services" }),
        expect.objectContaining({ path: "projectContext.partnerIntroductionInterest" }),
      ]),
    });

    expect(validateQuoteProjectContext({
      audienceType: "homeowner",
      structuralProjectType: "complete_extension",
      partnerIntroductionInterest: true,
    }, {
      streetAddress: "",
      services: ["slab"],
    })).toMatchObject({
      success: true,
      data: expect.objectContaining({ partnerIntroductionInterest: true }),
    });
  });

  it("rejects malformed, overlong, and unknown context fields rather than silently accepting them", () => {
    expect(validateQuoteProjectContext({
      audienceType: "homeowner",
      structuralProjectType: "other_concrete",
      builderCompanyName: "x".repeat(151),
      unexpected: "not accepted",
    }, { services: ["driveway"] })).toMatchObject({
      success: false,
      issues: expect.arrayContaining([
        expect.objectContaining({ path: "projectContext.builderCompanyName" }),
        expect.objectContaining({ path: "projectContext.unexpected" }),
      ]),
    });
  });
});

describe("quote project context delivery formatting", () => {
  it("formats safe, labelled owner-review context lines without provider-forwarding language", () => {
    const result = validateQuoteProjectContext({
      ...validBuilderContext,
      region: "Brisbane",
      landingRoute: "/areas/wynnum",
    }, { streetAddress: "12 Actual Project Street", services: ["driveway"] });
    if (!result.success || !result.data) throw new Error("Expected valid project context");

    expect(formatQuoteProjectContextLines(result.data)).toEqual(expect.arrayContaining([
      "Audience: Builder / developer",
      "Structural project: Other concrete project",
      "Builder company: Bayside Build Co",
      "Required concrete scope: Garage slab, driveway crossover and paths",
      "Indicative programme: Planning / site-ready timing to be confirmed",
      "Partner introduction interest: No",
    ]));
    expect(formatQuoteProjectContextLines(result.data).join("\n")).not.toContain("automatic forwarding");
  });
});
