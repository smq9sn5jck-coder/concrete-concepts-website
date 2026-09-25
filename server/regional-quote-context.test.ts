import { describe, expect, it } from "vitest";
import {
  comprehensiveQuoteSchema,
  formatQuoteBriefHtml,
  formatQuoteBriefText,
  getQuoteBriefSections,
} from "../shared/quoteBrief";

const legacyQuote = {
  version: 1 as const,
  contact: { name: "Taylor Client", mobile: "0424 001 122", email: "taylor@example.com", preferredContact: "sms" as const, company: "" },
  location: { streetAddress: "", suburb: "Camp Hill", postcode: "4152" },
  scope: { services: ["slab"] as const, workType: "extension" as const, finish: "not_sure" as const, timeframe: "planning" as const, description: "An extension slab requiring a site-specific concrete quote." },
  measurements: { mode: "not_sure" as const, separateAreaNotes: "" },
  siteConditions: { knownServices: "", specialRequirements: "" },
  photos: [],
  consents: { contact: true as const, privacy: true as const, marketing: false },
};

describe("regional structural quote context", () => {
  it("keeps legacy version-1 payloads valid without project context", () => {
    const parsed = comprehensiveQuoteSchema.parse(legacyQuote);
    expect(parsed.version).toBe(1);
    expect(parsed.projectContext).toBeUndefined();
  });

  it.each(["homeowner", "builder_developer"] as const)("accepts the %s audience", audienceType => {
    const projectContext = audienceType === "builder_developer"
      ? {
        audienceType,
        structuralProjectType: "new_house",
        builderCompanyName: "Example Build Co",
        requiredConcreteScope: "House slab and footings",
        indicativeProgramme: "Site-ready date to be confirmed",
      }
      : { audienceType, structuralProjectType: "extension_slab" };
    const location = audienceType === "builder_developer"
      ? { ...legacyQuote.location, streetAddress: "10 Example Street" }
      : legacyQuote.location;
    expect(comprehensiveQuoteSchema.safeParse({ ...legacyQuote, location, projectContext }).success).toBe(true);
  });

  it.each(["new_house", "extension_slab", "under_house_build_under", "complete_extension", "other_concrete"] as const)("accepts structural project type %s", structuralProjectType => {
    const result = comprehensiveQuoteSchema.safeParse({
      ...legacyQuote,
      projectContext: { audienceType: "homeowner", structuralProjectType },
    });
    expect(result.success).toBe(true);
  });

  it("requires builder company, site address, concrete scope and indicative programme while allowing not-sure readiness", () => {
    const missingCompany = comprehensiveQuoteSchema.safeParse({
      ...legacyQuote,
      projectContext: { audienceType: "builder_developer", structuralProjectType: "new_house" },
    });
    expect(missingCompany.success).toBe(false);

    const complete = comprehensiveQuoteSchema.safeParse({
      ...legacyQuote,
      location: { ...legacyQuote.location, streetAddress: "10 Example Street" },
      projectContext: {
        audienceType: "builder_developer",
        structuralProjectType: "new_house",
        builderCompanyName: "Safe <Build> & Co",
        builderRole: "Site manager",
        numberOfSitesOrPours: "Three staged pours",
        requiredConcreteScope: "House slab, footings and concrete placement",
        indicativeProgramme: "Foundations expected in November",
        preferredFollowUp: "Email first",
        plansReadiness: "not_sure",
        engineeringReadiness: "not_sure",
        soilFoundationReadiness: "not_sure",
        certifierApprovalStatus: "not_sure",
      },
    });
    expect(complete.success).toBe(true);
  });

  it("rejects stale partner interest outside a complete extension with slab scope", () => {
    expect(comprehensiveQuoteSchema.safeParse({
      ...legacyQuote,
      projectContext: {
        audienceType: "homeowner",
        structuralProjectType: "new_house",
        partnerIntroductionInterest: true,
      },
    }).success).toBe(false);
    expect(comprehensiveQuoteSchema.safeParse({
      ...legacyQuote,
      projectContext: {
        audienceType: "homeowner",
        structuralProjectType: "complete_extension",
        partnerIntroductionInterest: true,
      },
    }).success).toBe(true);
  });

  it("requires slab scope for a complete-extension detailed quote", () => {
    const projectContext = { audienceType: "homeowner" as const, structuralProjectType: "complete_extension" as const };
    expect(comprehensiveQuoteSchema.safeParse({
      ...legacyQuote,
      scope: { ...legacyQuote.scope, services: ["other"] },
      projectContext,
    }).success).toBe(false);
    expect(comprehensiveQuoteSchema.safeParse({ ...legacyQuote, projectContext }).success).toBe(true);
  });

  it("defaults partner introduction interest to false and excludes partner-only project types", () => {
    const parsed = comprehensiveQuoteSchema.parse({
      ...legacyQuote,
      projectContext: { audienceType: "homeowner", structuralProjectType: "complete_extension" },
    });
    expect(parsed.projectContext?.partnerIntroductionInterest).toBe(false);
    expect(comprehensiveQuoteSchema.safeParse({
      ...legacyQuote,
      projectContext: { audienceType: "homeowner", structuralProjectType: "partner_only" },
    }).success).toBe(false);
  });

  it("includes structural fields in readable text and HTML while escaping every customer value", () => {
    const quote = comprehensiveQuoteSchema.parse({
      ...legacyQuote,
      location: { ...legacyQuote.location, streetAddress: "10 Example Street" },
      projectContext: {
        audienceType: "builder_developer",
        structuralProjectType: "complete_extension",
        builderCompanyName: "<Builder & Sons>",
        builderRole: "Director <script>alert(1)</script>",
        numberOfSitesOrPours: "2 & then 3",
        requiredConcreteScope: "Footings < slab",
        indicativeProgramme: "Q4 > Q3",
        preferredFollowUp: "Email & phone",
        plansReadiness: "available",
        engineeringReadiness: "in_progress",
        soilFoundationReadiness: "not_sure",
        certifierApprovalStatus: "not_started",
        region: "Ipswich & Ripley",
        landingRoute: "/areas/ipswich-ripley-house-slabs",
        partnerIntroductionInterest: true,
      },
    });
    expect(getQuoteBriefSections(quote).map(section => section.title)).toContain("PROJECT CONTEXT");
    const text = formatQuoteBriefText(quote);
    expect(text).toContain("Builder / developer");
    expect(text).toContain("Partner introduction interest: Yes — CCG review only; no automatic forwarding");
    const html = formatQuoteBriefHtml(quote);
    expect(html).toContain("&lt;Builder &amp; Sons&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});
