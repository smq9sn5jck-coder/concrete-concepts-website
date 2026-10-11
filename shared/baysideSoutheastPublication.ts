import {
  BAYSIDE_SOUTHEAST_REVIEW_PATH,
  BAYSIDE_SOUTHEAST_ROUTES,
} from "./baysideSoutheastLocalJobsContent";

export type BaysideSoutheastRouteAccess = "baseline" | "preview" | "public" | "not-found";

/**
 * The five candidate URLs already have baseline customer pages. A registry entry
 * never grants a preview: host plus its own feature state are both required.
 */
export function getBaysideSoutheastRouteAccess(
  path: string,
  context: { customerHost: boolean; previewEnabled: boolean; publishedEnabled: boolean },
): BaysideSoutheastRouteAccess {
  if (path === BAYSIDE_SOUTHEAST_REVIEW_PATH) {
    return !context.customerHost && context.previewEnabled ? "preview" : "not-found";
  }

  if (!BAYSIDE_SOUTHEAST_ROUTES.includes(path)) return "not-found";

  if (context.customerHost) {
    return context.publishedEnabled ? "public" : "baseline";
  }

  return context.previewEnabled ? "preview" : "baseline";
}
