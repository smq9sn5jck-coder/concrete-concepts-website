export const STRUCTURAL_PROJECT_TYPES = [
  "new_house",
  "extension_slab",
  "under_house_build_under",
  "complete_extension",
] as const;

export type StructuralProjectType = (typeof STRUCTURAL_PROJECT_TYPES)[number];
export type QuoteStructuralProjectType = StructuralProjectType | "other_concrete";
export type QuoteAudienceType = "homeowner" | "builder_developer";

export function isStructuralProjectType(value: unknown): value is StructuralProjectType {
  return typeof value === "string" && (STRUCTURAL_PROJECT_TYPES as readonly string[]).includes(value);
}

export function isPartnerIntroductionEligible(
  structuralProjectType: unknown,
  services: readonly string[] | undefined,
): boolean {
  return structuralProjectType === "complete_extension" && Boolean(services?.includes("slab"));
}

interface CandidateContextFields {
  audienceType?: unknown;
  structuralProjectType?: unknown;
  services?: unknown;
  plansReadiness?: unknown;
  engineeringReadiness?: unknown;
  soilFoundationReadiness?: unknown;
  certifierApprovalStatus?: unknown;
  builderCompanyName?: unknown;
  builderRole?: unknown;
  numberOfSitesOrPours?: unknown;
  requiredConcreteScope?: unknown;
  indicativeProgramme?: unknown;
  preferredFollowUp?: unknown;
  region?: unknown;
  landingRoute?: unknown;
  partnerIntroductionInterest?: unknown;
}

/** Shape-only adapter; the complete version-1 schema validates its output. */
export function projectContextForCandidate(data: CandidateContextFields) {
  const audienceType = data.audienceType;
  const structuralProjectType = data.structuralProjectType;
  if ((audienceType !== "homeowner" && audienceType !== "builder_developer")
    || (structuralProjectType !== "other_concrete" && !isStructuralProjectType(structuralProjectType))) {
    return undefined;
  }
  const services = Array.isArray(data.services) ? data.services.filter((value): value is string => typeof value === "string") : [];
  return {
    audienceType,
    structuralProjectType,
    plansReadiness: data.plansReadiness,
    engineeringReadiness: data.engineeringReadiness,
    soilFoundationReadiness: data.soilFoundationReadiness,
    certifierApprovalStatus: data.certifierApprovalStatus,
    builderCompanyName: data.builderCompanyName,
    builderRole: data.builderRole,
    numberOfSitesOrPours: data.numberOfSitesOrPours,
    requiredConcreteScope: data.requiredConcreteScope,
    indicativeProgramme: data.indicativeProgramme,
    preferredFollowUp: data.preferredFollowUp,
    region: data.region,
    landingRoute: data.landingRoute,
    partnerIntroductionInterest: isPartnerIntroductionEligible(structuralProjectType, services)
      && data.partnerIntroductionInterest === true,
  };
}
