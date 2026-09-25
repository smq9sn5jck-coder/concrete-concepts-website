import { GOLD_COAST_PREVIEW_ENABLED } from "@/generated/goldCoastConfig";
import { isCustomerWebsiteHost } from "@/lib/customerWebsiteHost";

export function isGoldCoastBlogSnapshotEnabled(
  hostname = typeof window === "undefined" ? "" : window.location.hostname,
) {
  return GOLD_COAST_PREVIEW_ENABLED && !isCustomerWebsiteHost(hostname);
}
