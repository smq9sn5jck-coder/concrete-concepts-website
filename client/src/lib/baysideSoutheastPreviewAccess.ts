import {
  BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED,
  BAYSIDE_SOUTHEAST_PREVIEW_ENABLED,
} from "@/generated/baysideSoutheastConfig";
import { isCustomerWebsiteHost } from "@/lib/customerWebsiteHost";
import { getBaysideSoutheastRouteAccess } from "@shared/baysideSoutheastPublication";

export interface BaysideSoutheastFeatureFlags {
  preview: boolean;
  published: boolean;
}

export const defaultBaysideSoutheastFeatureFlags: BaysideSoutheastFeatureFlags = {
  preview: BAYSIDE_SOUTHEAST_PREVIEW_ENABLED,
  published: BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED,
};

export function getBaysideSoutheastCandidateQuoteAccess(
  landingRoute: string | undefined,
  hostname = typeof window === "undefined" ? "" : window.location.hostname,
  flags: BaysideSoutheastFeatureFlags = defaultBaysideSoutheastFeatureFlags,
) {
  if (!landingRoute) return "baseline" as const;
  return getBaysideSoutheastRouteAccess(landingRoute, {
    customerHost: isCustomerWebsiteHost(hostname),
    previewEnabled: flags.preview,
    publishedEnabled: flags.published,
  });
}

export function isBaysideSoutheastCandidateQuoteAvailable(
  landingRoute: string | undefined,
  hostname?: string,
  flags?: BaysideSoutheastFeatureFlags,
): boolean {
  const access = getBaysideSoutheastCandidateQuoteAccess(landingRoute, hostname, flags);
  return access === "preview" || access === "public";
}

/** Parent/page integration contract: route availability for candidate renderers. */
export function getClientBaysideSoutheastRouteAccess(
  pathname: string,
  hostname = typeof window === "undefined" ? "" : window.location.hostname,
  flags: BaysideSoutheastFeatureFlags = defaultBaysideSoutheastFeatureFlags,
) {
  const access = getBaysideSoutheastCandidateQuoteAccess(pathname, hostname, flags);
  return { access, available: access === "preview" || access === "public" };
}
