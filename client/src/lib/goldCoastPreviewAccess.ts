import { GOLD_COAST_PREVIEW_ENABLED } from "@/generated/goldCoastConfig";

const CUSTOMER_WEBSITE_HOSTS = new Set([
  "concreteconceptsgroup.com",
  "www.concreteconceptsgroup.com",
]);

export function isGoldCoastBlogSnapshotEnabled(
  hostname = typeof window === "undefined" ? "" : window.location.hostname,
) {
  return GOLD_COAST_PREVIEW_ENABLED && !CUSTOMER_WEBSITE_HOSTS.has(hostname.toLowerCase());
}
