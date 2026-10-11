export const QUOTE_PROJECT_AUDIENCES = ["homeowner", "builder_developer"] as const;
export const QUOTE_STRUCTURAL_PROJECT_TYPES = [
  "new_house",
  "extension_slab",
  "under_house_build_under",
  "complete_extension",
  "other_concrete",
] as const;
export const QUOTE_DOCUMENT_READINESS = [
  "available",
  "in_progress",
  "not_available",
  "not_sure",
] as const;
export const QUOTE_CERTIFIER_APPROVAL_STATUSES = [
  "approved",
  "in_progress",
  "not_started",
  "not_required",
  "not_sure",
] as const;

export type QuoteProjectAudience = (typeof QUOTE_PROJECT_AUDIENCES)[number];
export type QuoteStructuralProjectType = (typeof QUOTE_STRUCTURAL_PROJECT_TYPES)[number];
export type QuoteDocumentReadiness = (typeof QUOTE_DOCUMENT_READINESS)[number];
export type QuoteCertifierApprovalStatus = (typeof QUOTE_CERTIFIER_APPROVAL_STATUSES)[number];

export interface QuoteProjectContext {
  audienceType: QuoteProjectAudience;
  structuralProjectType: QuoteStructuralProjectType;
  plansReadiness?: QuoteDocumentReadiness;
  engineeringReadiness?: QuoteDocumentReadiness;
  soilFoundationReadiness?: QuoteDocumentReadiness;
  certifierApprovalStatus?: QuoteCertifierApprovalStatus;
  builderCompanyName: string;
  builderRole: string;
  numberOfSitesOrPours: string;
  requiredConcreteScope: string;
  indicativeProgramme: string;
  preferredFollowUp: string;
  region: string;
  landingRoute: string;
  partnerIntroductionInterest: boolean;
}

export interface QuoteProjectContextValidationIssue {
  path: string;
  message: string;
}

export type QuoteProjectContextValidationResult =
  | { success: true; data: QuoteProjectContext | undefined }
  | { success: false; issues: QuoteProjectContextValidationIssue[] };

export interface QuoteProjectContextValidationInput {
  streetAddress?: unknown;
  services?: readonly unknown[];
}

const projectContextKeys = new Set<keyof QuoteProjectContext>([
  "audienceType",
  "structuralProjectType",
  "plansReadiness",
  "engineeringReadiness",
  "soilFoundationReadiness",
  "certifierApprovalStatus",
  "builderCompanyName",
  "builderRole",
  "numberOfSitesOrPours",
  "requiredConcreteScope",
  "indicativeProgramme",
  "preferredFollowUp",
  "region",
  "landingRoute",
  "partnerIntroductionInterest",
]);

const projectContextLabels: Record<string, string> = {
  homeowner: "Homeowner / property owner",
  builder_developer: "Builder / developer",
  new_house: "New house",
  extension_slab: "Extension slab",
  under_house_build_under: "Under-house / build-under",
  complete_extension: "Complete extension with concrete scope",
  other_concrete: "Other concrete project",
  available: "Available",
  in_progress: "In progress",
  not_available: "Not available",
  not_sure: "Not sure",
  approved: "Approved",
  not_started: "Not started",
  not_required: "Not required",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === "string" && options.includes(value);
}

function text(
  value: unknown,
  path: string,
  maximumLength: number,
  issues: QuoteProjectContextValidationIssue[],
): string {
  if (value === undefined) return "";
  if (typeof value !== "string") {
    issues.push({ path, message: "Must be text" });
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length > maximumLength) {
    issues.push({ path, message: `Must be ${maximumLength} characters or fewer` });
  }
  return trimmed;
}

function optionalEnum<T extends readonly string[]>(
  value: unknown,
  path: string,
  options: T,
  issues: QuoteProjectContextValidationIssue[],
): T[number] | undefined {
  if (value === undefined) return undefined;
  if (isOneOf(value, options)) return value;
  issues.push({ path, message: "Has an invalid value" });
  return undefined;
}

/**
 * Validates only the optional version-1 project-context contract. The baseline
 * quote body remains a separate validation concern so legacy callers that omit
 * projectContext continue to be valid.
 */
export function validateQuoteProjectContext(
  value: unknown,
  requirements: QuoteProjectContextValidationInput = {},
): QuoteProjectContextValidationResult {
  if (value === undefined) return { success: true, data: undefined };

  const issues: QuoteProjectContextValidationIssue[] = [];
  if (!isPlainObject(value)) {
    return { success: false, issues: [{ path: "projectContext", message: "Must be an object" }] };
  }

  for (const key of Object.keys(value)) {
    if (!projectContextKeys.has(key as keyof QuoteProjectContext)) {
      issues.push({ path: `projectContext.${key}`, message: "Is not an accepted project context field" });
    }
  }

  const audienceType = value.audienceType;
  if (!isOneOf(audienceType, QUOTE_PROJECT_AUDIENCES)) {
    issues.push({ path: "projectContext.audienceType", message: "Select homeowner or builder / developer" });
  }
  const structuralProjectType = value.structuralProjectType;
  if (!isOneOf(structuralProjectType, QUOTE_STRUCTURAL_PROJECT_TYPES)) {
    issues.push({ path: "projectContext.structuralProjectType", message: "Select a concrete project type" });
  }

  const context: QuoteProjectContext = {
    audienceType: isOneOf(audienceType, QUOTE_PROJECT_AUDIENCES) ? audienceType : "homeowner",
    structuralProjectType: isOneOf(structuralProjectType, QUOTE_STRUCTURAL_PROJECT_TYPES)
      ? structuralProjectType
      : "other_concrete",
    plansReadiness: optionalEnum(value.plansReadiness, "projectContext.plansReadiness", QUOTE_DOCUMENT_READINESS, issues),
    engineeringReadiness: optionalEnum(value.engineeringReadiness, "projectContext.engineeringReadiness", QUOTE_DOCUMENT_READINESS, issues),
    soilFoundationReadiness: optionalEnum(value.soilFoundationReadiness, "projectContext.soilFoundationReadiness", QUOTE_DOCUMENT_READINESS, issues),
    certifierApprovalStatus: optionalEnum(value.certifierApprovalStatus, "projectContext.certifierApprovalStatus", QUOTE_CERTIFIER_APPROVAL_STATUSES, issues),
    builderCompanyName: text(value.builderCompanyName, "projectContext.builderCompanyName", 150, issues),
    builderRole: text(value.builderRole, "projectContext.builderRole", 150, issues),
    numberOfSitesOrPours: text(value.numberOfSitesOrPours, "projectContext.numberOfSitesOrPours", 500, issues),
    requiredConcreteScope: text(value.requiredConcreteScope, "projectContext.requiredConcreteScope", 1_500, issues),
    indicativeProgramme: text(value.indicativeProgramme, "projectContext.indicativeProgramme", 1_500, issues),
    preferredFollowUp: text(value.preferredFollowUp, "projectContext.preferredFollowUp", 500, issues),
    region: text(value.region, "projectContext.region", 150, issues),
    landingRoute: text(value.landingRoute, "projectContext.landingRoute", 250, issues),
    partnerIntroductionInterest: value.partnerIntroductionInterest === undefined
      ? false
      : typeof value.partnerIntroductionInterest === "boolean"
        ? value.partnerIntroductionInterest
        : false,
  };

  if (value.partnerIntroductionInterest !== undefined && typeof value.partnerIntroductionInterest !== "boolean") {
    issues.push({ path: "projectContext.partnerIntroductionInterest", message: "Must be true or false" });
  }

  if (context.audienceType === "builder_developer") {
    if (!context.builderCompanyName) {
      issues.push({ path: "projectContext.builderCompanyName", message: "Builder or developer company name is required" });
    }
    if (typeof requirements.streetAddress !== "string" || !requirements.streetAddress.trim()) {
      issues.push({ path: "location.streetAddress", message: "Project street address is required for builder or developer enquiries" });
    }
    if (context.requiredConcreteScope.length < 10) {
      issues.push({ path: "projectContext.requiredConcreteScope", message: "Add the required concrete scope for this builder project" });
    }
    if (context.indicativeProgramme.length < 2) {
      issues.push({ path: "projectContext.indicativeProgramme", message: "Add the indicative programme or site-ready timing" });
    }
  }

  const hasSlabScope = Array.isArray(requirements.services) && requirements.services.includes("slab");
  if (context.structuralProjectType === "complete_extension" && !hasSlabScope) {
    issues.push({ path: "scope.services", message: "A complete-extension detailed quote must include a concrete slab scope" });
  }
  if (context.partnerIntroductionInterest && (context.structuralProjectType !== "complete_extension" || !hasSlabScope)) {
    issues.push({
      path: "projectContext.partnerIntroductionInterest",
      message: "Partner introduction interest is available only for complete extensions with a concrete slab",
    });
  }

  return issues.length ? { success: false, issues } : { success: true, data: context };
}

function label(value: string | undefined): string {
  return value ? projectContextLabels[value] ?? value : "Not provided";
}

/** Safe, plain-text lines for existing quote delivery adapters; no forwarding occurs. */
export function formatQuoteProjectContextLines(context: QuoteProjectContext): string[] {
  return [
    `Audience: ${label(context.audienceType)}`,
    `Structural project: ${label(context.structuralProjectType)}`,
    `Region: ${context.region || "Not provided"}`,
    `Landing route: ${context.landingRoute || "Not provided"}`,
    `Plans: ${label(context.plansReadiness)}`,
    `Engineering: ${label(context.engineeringReadiness)}`,
    `Soil / foundation information: ${label(context.soilFoundationReadiness)}`,
    `Approval / certifier status: ${label(context.certifierApprovalStatus)}`,
    `Builder company: ${context.builderCompanyName || "Not provided"}`,
    `Builder role: ${context.builderRole || "Not provided"}`,
    `Sites / pours: ${context.numberOfSitesOrPours || "Not provided"}`,
    `Required concrete scope: ${context.requiredConcreteScope || "Not provided"}`,
    `Indicative programme: ${context.indicativeProgramme || "Not provided"}`,
    `Preferred follow-up: ${context.preferredFollowUp || "Not provided"}`,
    `Partner introduction interest: ${context.partnerIntroductionInterest ? "Yes — CCG review only" : "No"}`,
  ];
}
