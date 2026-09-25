import { REGIONAL_SLAB_PAGE_BY_PATH } from "./regionalSlabContent";

export type RegionalSlabRouteAccess = "public" | "preview" | "legacy" | "not-found";

export interface RegionalSlabPublicationContext {
  customerHost: boolean;
  previewEnabled: boolean;
  publishedEnabled: boolean;
}

export function getRegionalSlabRouteAccess(
  path: string,
  context: RegionalSlabPublicationContext,
): RegionalSlabRouteAccess {
  if (path === "/regional-slab-review") {
    return !context.customerHost && context.previewEnabled ? "preview" : "not-found";
  }
  if (!REGIONAL_SLAB_PAGE_BY_PATH[path]) return "not-found";

  const existingCustomerRoute = path === "/services/concrete-slabs-brisbane";
  if (context.customerHost) {
    if (context.publishedEnabled) return "public";
    return existingCustomerRoute ? "legacy" : "not-found";
  }
  if (context.previewEnabled) return "preview";
  return existingCustomerRoute ? "legacy" : "not-found";
}

export function isRegionalSlabCandidateAvailable(
  path: string,
  context: RegionalSlabPublicationContext,
) {
  const access = getRegionalSlabRouteAccess(path, context);
  return access === "public" || access === "preview";
}
