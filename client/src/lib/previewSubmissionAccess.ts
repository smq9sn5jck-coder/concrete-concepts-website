import { BAYSIDE_SOUTHEAST_PREVIEW_ENABLED } from "@/generated/baysideSoutheastConfig";
import { isCustomerWebsiteHost } from "@/lib/customerWebsiteHost";

/**
 * Submission mutations are disabled only in the isolated non-customer Bayside
 * preview artifact. Customer-host and ordinary builds retain their existing
 * delivery behavior.
 */
export function previewSubmissionsDisabled(
  hostname = typeof window === "undefined" ? "" : window.location.hostname,
): boolean {
  return BAYSIDE_SOUTHEAST_PREVIEW_ENABLED && !isCustomerWebsiteHost(hostname);
}
