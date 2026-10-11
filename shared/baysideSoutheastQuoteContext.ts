import {
  BAYSIDE_SOUTHEAST_BY_SLUG,
  BAYSIDE_SOUTHEAST_QUOTE_CONTEXT_TOKENS as CONTENT_QUOTE_CONTEXT_TOKENS,
} from "./baysideSoutheastLocalJobsContent";
import { isPartnerIntroductionEligible, isStructuralProjectType } from "./quoteAudiencePolicy";

export const BAYSIDE_SOUTHEAST_QUOTE_CONTEXT_TOKENS = CONTENT_QUOTE_CONTEXT_TOKENS;

export type BaysideSoutheastAudience = "homeowner" | "builder_developer";
export type BaysideSoutheastStructuralProjectType =
  | "new_house"
  | "extension_slab"
  | "under_house_build_under"
  | "complete_extension"
  | "other_concrete";

export interface BaysideSoutheastQuoteContext {
  locality: string;
  region: "Brisbane";
  landingRoute: string;
  audienceType?: BaysideSoutheastAudience;
}

const contextByToken: Readonly<Record<string, BaysideSoutheastQuoteContext>> = Object.freeze(
  Object.fromEntries(
    BAYSIDE_SOUTHEAST_QUOTE_CONTEXT_TOKENS.map((token) => {
      const prefix = "bayside-";
      const audienceIndex = token.lastIndexOf("-");
      const slug = token.startsWith(prefix) && audienceIndex > prefix.length
        ? token.slice(prefix.length, audienceIndex)
        : "";
      const audience = audienceIndex > prefix.length ? token.slice(audienceIndex + 1) : "";
      const locality = BAYSIDE_SOUTHEAST_BY_SLUG[slug];
      if (!locality) throw new Error(`Missing approved Bayside Southeast locality for ${token}`);
      return [token, {
        locality: locality.locality,
        region: "Brisbane" as const,
        landingRoute: `/areas/${slug}`,
        audienceType: audience === "builder"
          ? "builder_developer" as const
          : audience === "homeowner" ? "homeowner" as const : undefined,
      }];
    }),
  ),
);

/** Accepts only registry tokens; token-shaped strings are never trusted. */
export function resolveBaysideSoutheastQuoteContext(token: unknown): BaysideSoutheastQuoteContext | undefined {
  return typeof token === "string" ? contextByToken[token] : undefined;
}

export interface BaysideSoutheastDraftFields {
  suburb?: string;
  services?: string[];
  audienceType?: BaysideSoutheastAudience;
  structuralProjectType?: BaysideSoutheastStructuralProjectType;
  region?: string;
  landingRoute?: string;
  partnerIntroductionInterest?: boolean;
}

export interface BaysideSoutheastQuoteContextConflict {
  currentSuburb: string;
  incomingSuburb: string;
}

function isAudience(value: unknown): value is BaysideSoutheastAudience {
  return value === "homeowner" || value === "builder_developer";
}

function isKnownStructuralProjectType(value: unknown): value is BaysideSoutheastStructuralProjectType {
  return typeof value === "string" && (value === "other_concrete" || isStructuralProjectType(value));
}

/**
 * Adds only reviewed attribution and audience defaults to a local browser draft.
 * It never overwrites entered job details or silently adds a concrete slab.
 */
export function mergeBaysideSoutheastQuoteContext<T extends BaysideSoutheastDraftFields>(
  draft: T,
  context: BaysideSoutheastQuoteContext,
): {
  data: T & Required<Pick<BaysideSoutheastDraftFields, "audienceType" | "structuralProjectType" | "region" | "landingRoute">>;
  conflict?: BaysideSoutheastQuoteContextConflict;
} {
  const currentSuburb = draft.suburb?.trim() ?? "";
  const audienceType = context.audienceType
    ?? (isAudience(draft.audienceType) ? draft.audienceType : "homeowner");
  const structuralProjectType = isKnownStructuralProjectType(draft.structuralProjectType)
    ? draft.structuralProjectType
    : "other_concrete";
  const partnerIntroductionInterest = isPartnerIntroductionEligible(structuralProjectType, draft.services)
    ? Boolean(draft.partnerIntroductionInterest)
    : false;
  const conflict = currentSuburb && currentSuburb.localeCompare(context.locality, "en-AU", { sensitivity: "accent" }) !== 0
    ? { currentSuburb, incomingSuburb: context.locality }
    : undefined;

  return {
    data: {
      ...draft,
      ...(currentSuburb ? {} : { suburb: context.locality }),
      audienceType,
      structuralProjectType,
      region: context.region,
      landingRoute: context.landingRoute,
      partnerIntroductionInterest,
    },
    conflict,
  } as {
    data: T & Required<Pick<BaysideSoutheastDraftFields, "audienceType" | "structuralProjectType" | "region" | "landingRoute">>;
    conflict?: BaysideSoutheastQuoteContextConflict;
  };
}

/** Returns an untrusted saved attribution only when it maps to an exact approved route. */
export function contextFromBaysideSoutheastDraft(
  draft: Pick<BaysideSoutheastDraftFields, "region" | "landingRoute" | "audienceType"> | null | undefined,
): BaysideSoutheastQuoteContext | undefined {
  if (!draft || draft.region !== "Brisbane" || typeof draft.landingRoute !== "string") return undefined;
  const locality = Object.values(BAYSIDE_SOUTHEAST_BY_SLUG).find(
    (record) => `/areas/${record.slug}` === draft.landingRoute,
  );
  if (!locality) return undefined;
  return {
    locality: locality.locality,
    region: "Brisbane",
    landingRoute: draft.landingRoute,
    audienceType: isAudience(draft.audienceType) ? draft.audienceType : undefined,
  };
}
