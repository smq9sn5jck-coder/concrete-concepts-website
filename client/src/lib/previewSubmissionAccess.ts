import {
  BAYSIDE_SOUTHEAST_PREVIEW_ENABLED,
  BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED,
} from "@/generated/baysideSoutheastConfig";
import { isCustomerWebsiteHost } from "@/lib/customerWebsiteHost";

export interface BaysideProductionFeatureFlags {
  preview: boolean;
  published: boolean;
}

export const defaultBaysideProductionFeatureFlags: BaysideProductionFeatureFlags = {
  preview: BAYSIDE_SOUTHEAST_PREVIEW_ENABLED,
  published: BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED,
};

/**
 * Candidate artifacts must never submit from a noncustomer host. Customer
 * website hosts retain ordinary delivery even when the candidate is enabled;
 * builds with neither feature flag retain their baseline behaviour everywhere.
 */
export function previewSubmissionsDisabled(
  hostname = typeof window === "undefined" ? "" : window.location.hostname,
  flags: BaysideProductionFeatureFlags = defaultBaysideProductionFeatureFlags,
): boolean {
  return (flags.preview || flags.published) && !isCustomerWebsiteHost(hostname);
}
