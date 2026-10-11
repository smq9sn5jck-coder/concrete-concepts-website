import { describe, expect, it } from "vitest";
import {
  BAYSIDE_SOUTHEAST_QUOTE_CONTEXT_TOKENS,
  mergeBaysideSoutheastQuoteContext,
  resolveBaysideSoutheastQuoteContext,
} from "../shared/baysideSoutheastQuoteContext";
import {
  isPartnerIntroductionEligible,
  isStructuralProjectType,
} from "../shared/quoteAudiencePolicy";

describe("Bayside/Southeast quote context allowlist", () => {
  it("enumerates exactly the approved 15 tokens rather than accepting a pattern", () => {
    expect(BAYSIDE_SOUTHEAST_QUOTE_CONTEXT_TOKENS).toEqual([
      "bayside-wynnum-general", "bayside-wynnum-homeowner", "bayside-wynnum-builder",
      "bayside-manly-general", "bayside-manly-homeowner", "bayside-manly-builder",
      "bayside-cannon-hill-general", "bayside-cannon-hill-homeowner", "bayside-cannon-hill-builder",
      "bayside-mount-gravatt-general", "bayside-mount-gravatt-homeowner", "bayside-mount-gravatt-builder",
      "bayside-mansfield-general", "bayside-mansfield-homeowner", "bayside-mansfield-builder",
    ]);
    expect(resolveBaysideSoutheastQuoteContext("bayside-wynnum-builder")).toMatchObject({
      locality: "Wynnum",
      region: "Brisbane",
      landingRoute: "/areas/wynnum",
      audienceType: "builder_developer",
    });
    expect(resolveBaysideSoutheastQuoteContext("bayside-wynnum-builder-extra")).toBeUndefined();
    expect(resolveBaysideSoutheastQuoteContext("bayside-not-a-place-builder")).toBeUndefined();
  });

  it("only fills an empty suburb, leaves concrete scope unchanged, and reports a locality conflict", () => {
    const builder = resolveBaysideSoutheastQuoteContext("bayside-wynnum-builder");
    if (!builder) throw new Error("Expected approved builder context");

    const blankSuburb = mergeBaysideSoutheastQuoteContext({
      name: "Existing customer",
      streetAddress: "11 Existing Street",
      postcode: "4152",
      services: ["driveway"],
      description: "Keep the existing driveway project description.",
    }, builder);
    expect(blankSuburb).toMatchObject({
      data: {
        suburb: "Wynnum",
        streetAddress: "11 Existing Street",
        postcode: "4152",
        services: ["driveway"],
        audienceType: "builder_developer",
        structuralProjectType: "other_concrete",
        region: "Brisbane",
        landingRoute: "/areas/wynnum",
      },
      conflict: undefined,
    });
    expect(blankSuburb.data.services).not.toContain("slab");

    const conflict = mergeBaysideSoutheastQuoteContext({
      suburb: "Carindale",
      postcode: "4152",
      streetAddress: "22 Customer Road",
      services: ["patio"],
      description: "Preserve customer-entered scope and all other information.",
    }, builder);
    expect(conflict.data).toMatchObject({
      suburb: "Carindale",
      postcode: "4152",
      streetAddress: "22 Customer Road",
      services: ["patio"],
    });
    expect(conflict.conflict).toEqual({ currentSuburb: "Carindale", incomingSuburb: "Wynnum" });
  });

  it("keeps a generic handoff's existing audience or defaults it to homeowner without a service conversion", () => {
    const generic = resolveBaysideSoutheastQuoteContext("bayside-manly-general");
    if (!generic) throw new Error("Expected approved general context");

    expect(mergeBaysideSoutheastQuoteContext({
      audienceType: "builder_developer",
      services: ["commercial"],
    }, generic).data).toMatchObject({
      audienceType: "builder_developer",
      services: ["commercial"],
      structuralProjectType: "other_concrete",
    });
    expect(mergeBaysideSoutheastQuoteContext({ services: ["pathway"] }, generic).data).toMatchObject({
      audienceType: "homeowner",
      services: ["pathway"],
      structuralProjectType: "other_concrete",
    });
  });
});

describe("quote audience policy", () => {
  it("limits document readiness to the four structural types and partner interest to an extension with slab", () => {
    expect(isStructuralProjectType("new_house")).toBe(true);
    expect(isStructuralProjectType("extension_slab")).toBe(true);
    expect(isStructuralProjectType("under_house_build_under")).toBe(true);
    expect(isStructuralProjectType("complete_extension")).toBe(true);
    expect(isStructuralProjectType("other_concrete")).toBe(false);
    expect(isPartnerIntroductionEligible("complete_extension", ["slab"])).toBe(true);
    expect(isPartnerIntroductionEligible("complete_extension", ["driveway"])).toBe(false);
    expect(isPartnerIntroductionEligible("new_house", ["slab"])).toBe(false);
  });
});
