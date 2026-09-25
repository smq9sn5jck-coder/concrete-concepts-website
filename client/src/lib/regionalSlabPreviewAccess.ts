import { getRegionalSlabRouteAccess } from "@shared/regionalSlabPublication";
import {
  REGIONAL_SLAB_PREVIEW_ENABLED,
  REGIONAL_SLAB_PUBLISHED_ENABLED,
} from "@/generated/regionalSlabConfig";
import { isCustomerWebsiteHost } from "@/lib/customerWebsiteHost";

export function getClientRegionalSlabRouteAccess(
  pathname: string,
  hostname = typeof window === "undefined" ? "" : window.location.hostname,
  flags = {
    preview: REGIONAL_SLAB_PREVIEW_ENABLED,
    published: REGIONAL_SLAB_PUBLISHED_ENABLED,
  },
) {
  const access = getRegionalSlabRouteAccess(pathname, {
    customerHost: isCustomerWebsiteHost(hostname),
    previewEnabled: flags.preview,
    publishedEnabled: flags.published,
  });
  return {
    access,
    available: access === "preview" || access === "public",
  };
}
