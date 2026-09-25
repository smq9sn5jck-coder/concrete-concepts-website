import { GENERATED_OTHER_TRADE_PREVIEW_ENABLED } from "@/generated/otherTradeConfig";
import { isCustomerWebsiteHost } from "@/lib/customerWebsiteHost";

export function isOtherTradePreviewAvailable(
  hostname = typeof window === "undefined" ? "" : window.location.hostname,
  previewEnabled = GENERATED_OTHER_TRADE_PREVIEW_ENABLED,
) {
  return previewEnabled && !isCustomerWebsiteHost(hostname);
}
