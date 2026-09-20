export const SOUTHSIDE_RETAIN_SLUGS = ["murarrie"] as const;

export const SOUTHSIDE_UPGRADE_SLUGS = [
  "wynnum",
  "cannon-hill",
  "morningside",
  "tingalpa",
  "camp-hill",
  "carina",
] as const;

export const SOUTHSIDE_CREATE_SLUGS = ["norman-park"] as const;

/**
 * Staging-first release boundary. The six upgrade replacements and Norman Park
 * stay off customer hosts until the director separately approves production.
 * Murarrie is already live through Batch 1 and remains available.
 */
export const SOUTHSIDE_PRODUCTION_UPGRADE_ALLOWLIST: readonly string[] = [];
export const SOUTHSIDE_PRODUCTION_CREATE_ALLOWLIST: readonly string[] = [];

export type SouthsideRouteAccess = "public" | "preview" | "legacy" | "not-found";

export function getSouthsideLocalityRouteAccess(
  slug: string,
  context: { customerHost: boolean; southsidePreviewEnabled: boolean },
): SouthsideRouteAccess {
  if ((SOUTHSIDE_RETAIN_SLUGS as readonly string[]).includes(slug)) {
    if (context.customerHost) return "public";
    return context.southsidePreviewEnabled ? "preview" : "not-found";
  }

  if ((SOUTHSIDE_UPGRADE_SLUGS as readonly string[]).includes(slug)) {
    if (context.customerHost) {
      return SOUTHSIDE_PRODUCTION_UPGRADE_ALLOWLIST.includes(slug) ? "public" : "legacy";
    }
    return context.southsidePreviewEnabled ? "preview" : "legacy";
  }

  if ((SOUTHSIDE_CREATE_SLUGS as readonly string[]).includes(slug)) {
    if (context.customerHost) {
      return SOUTHSIDE_PRODUCTION_CREATE_ALLOWLIST.includes(slug) ? "public" : "not-found";
    }
    return context.southsidePreviewEnabled ? "preview" : "not-found";
  }

  return "not-found";
}

export function isSouthsideLocalityAvailable(
  slug: string,
  context: { customerHost: boolean; southsidePreviewEnabled: boolean },
) {
  const access = getSouthsideLocalityRouteAccess(slug, context);
  return access === "public" || access === "preview";
}
