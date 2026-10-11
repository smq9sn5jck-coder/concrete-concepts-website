import { describe, expect, it } from "vitest";
import {
  BAYSIDE_SOUTHEAST_QUOTE_CONTEXT_TOKENS,
  contextFromBaysideSoutheastDraft,
  mergeBaysideSoutheastQuoteContext,
  resolveBaysideSoutheastQuoteContext,
} from "../shared/baysideSoutheastQuoteContext";
import {
  isPartnerIntroductionEligible,
  isStructuralProjectType,
  projectContextForCandidate,
} from "../shared/quoteAudiencePolicy";

describe("Bayside Southeast candidate quote context", () => {
  it("uses the exact 15-token registry allowlist rather than accepting a token pattern", () => {
    expect(BAYSIDE_SOUTHEAST_QUOTE_CONTEXT_TOKENS).toEqual([
      "bayside-wynnum-general", "bayside-wynnum-homeowner", "bayside-wynnum-builder",
      "bayside-manly-general", "bayside-manly-homeowner", "bayside-manly-builder",
      "bayside-cannon-hill-general", "bayside-cannon-hill-homeowner", "bayside-cannon-hill-builder",
      "bayside-mount-gravatt-general", "bayside-mount-gravatt-homeowner", "bayside-mount-gravatt-builder",
      "bayside-mansfield-general", "bayside-mansfield-homeowner", "bayside-mansfield-builder",
    ]);
    expect(resolveBaysideSoutheastQuoteContext("bayside-wynnum-builder")).toEqual({
      locality: "Wynnum",
      region: "Brisbane",
      landingRoute: "/areas/wynnum",
      audienceType: "builder_developer",
    });
    expect(resolveBaysideSoutheastQuoteContext("bayside-wynnum-builder-extra")).toBeUndefined();
    expect(resolveBaysideSoutheastQuoteContext("bayside-not-a-place-builder")).toBeUndefined();
  });

  it("fills only a blank suburb, preserves customer fields, defaults other concrete, and reports a conflict", () => {
    const context = resolveBaysideSoutheastQuoteContext("bayside-manly-builder");
    if (!context) throw new Error("expected reviewed context");

    const blank = mergeBaysideSoutheastQuoteContext({
      streetAddress: "11 Existing Street",
      postcode: "4152",
      services: ["driveway"],
      description: "Keep the existing customer driveway project description.",
    }, context);
    expect(blank).toMatchObject({
      data: {
        suburb: "Manly",
        streetAddress: "11 Existing Street",
        postcode: "4152",
        services: ["driveway"],
        audienceType: "builder_developer",
        structuralProjectType: "other_concrete",
        region: "Brisbane",
        landingRoute: "/areas/manly",
        partnerIntroductionInterest: false,
      },
    });
    expect(blank.data.services).not.toContain("slab");

    const conflict = mergeBaysideSoutheastQuoteContext({
      suburb: "Carindale",
      streetAddress: "22 Customer Road",
      postcode: "4152",
      services: ["patio"],
      description: "Preserve the customer entered patio scope without replacement.",
    }, context);
    expect(conflict.data).toMatchObject({
      suburb: "Carindale",
      services: ["patio"],
      streetAddress: "22 Customer Road",
    });
    expect(conflict.conflict).toEqual({ currentSuburb: "Carindale", incomingSuburb: "Manly" });
  });

  it("keeps a generic handoff's valid existing audience or defaults homeowner without changing concrete scope", () => {
    const generic = resolveBaysideSoutheastQuoteContext("bayside-mansfield-general");
    if (!generic) throw new Error("expected reviewed context");

    expect(mergeBaysideSoutheastQuoteContext({ audienceType: "builder_developer", services: ["commercial"] }, generic).data)
      .toMatchObject({ audienceType: "builder_developer", services: ["commercial"], structuralProjectType: "other_concrete" });
    expect(mergeBaysideSoutheastQuoteContext({ services: ["pathway"] }, generic).data)
      .toMatchObject({ audienceType: "homeowner", services: ["pathway"], structuralProjectType: "other_concrete" });
  });

  it("only resumes persisted candidate UI from a valid Brisbane five-route attribution", () => {
    expect(contextFromBaysideSoutheastDraft({ region: "Brisbane", landingRoute: "/areas/mansfield", audienceType: "homeowner" }))
      .toMatchObject({ locality: "Mansfield", landingRoute: "/areas/mansfield" });
    expect(contextFromBaysideSoutheastDraft({ region: "Brisbane", landingRoute: "/areas/unknown", audienceType: "homeowner" })).toBeUndefined();
    expect(contextFromBaysideSoutheastDraft({ region: "Gold Coast", landingRoute: "/areas/mansfield", audienceType: "homeowner" })).toBeUndefined();
  });
});

describe("candidate quote audience policy", () => {
  it("limits structural documents and partner interest to the reviewed concrete boundary", () => {
    expect(isStructuralProjectType("new_house")).toBe(true);
    expect(isStructuralProjectType("other_concrete")).toBe(false);
    expect(isPartnerIntroductionEligible("complete_extension", ["slab"])).toBe(true);
    expect(isPartnerIntroductionEligible("complete_extension", ["driveway"])).toBe(false);
    expect(projectContextForCandidate({
      audienceType: "homeowner",
      structuralProjectType: "complete_extension",
      services: ["driveway"],
      partnerIntroductionInterest: true,
    })).toMatchObject({ partnerIntroductionInterest: false });
  });
});
