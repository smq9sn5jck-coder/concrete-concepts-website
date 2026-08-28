/*
  SEO route manifest — single source of truth for per-route <title> / meta tags.

  This is consumed in TWO places:
   1. At runtime by <Seo /> (client/src/seo/Seo.tsx) so client-side navigation
      updates document.title and meta tags.
   2. At build time by the Vite prerender plugin (vite-plugin-prerender-seo) which
      writes a static HTML file per route with the correct <title>/<meta> baked
      into the served HTML — so Googlebot reads them WITHOUT executing JavaScript.

  HOW TO ADD A NEW PAGE (blog post or service area):
   - Add a new entry to SEO_ROUTES with its `path`, `title`, and `description`.
   - The prerender plugin will automatically emit a static HTML file for it.

  NOTE: This static-snapshot repo currently only ships the "/" route in the React
  app. The same manifest pattern is designed to be ported directly into the live
  (private) repo that contains the /blog/* and /areas/* routes — see SEO_README.md.
*/

export const SITE_URL = "https://concreteconceptsgroup.com";
export const SITE_NAME = "Concrete Concepts Group";
export const DEFAULT_OG_IMAGE = "/manus-storage/og-social-share_5e916781_b24cf3cc.png";

export interface RouteMeta {
  /** Path relative to site root, always starting with "/". Use lowercase. */
  path: string;
  /** Full <title> string. Keep under ~60 chars where possible. */
  title: string;
  /** Meta description. Keep under ~155 chars. */
  description: string;
  /** Optional OG image override (absolute path from root). */
  ogImage?: string;
  /** Optional: set true to mark page noindex (e.g. thank-you pages). */
  noindex?: boolean;
}

/**
 * Brand suffix appended to page-specific titles for consistency.
 * Home uses the full brand title without the leading page label.
 */
const SUFFIX = "Concrete Concepts Group";

export const SEO_ROUTES: RouteMeta[] = [
  {
    path: "/",
    title: "Concrete Concepts Group | Brisbane Concreting Specialists",
    description:
      "Brisbane's trusted concreting specialists. Driveways, slabs, patios, exposed aggregate, retaining walls & excavation. QBCC Licensed. Call 0424 463 268 for a free quote.",
  },
  {
    path: "/get-quote",
    title: `Get a Free Concreting Quote in Brisbane | ${SUFFIX}`,
    description:
      "Request a fast, free quote for your Brisbane concreting project — driveways, slabs, patios, exposed aggregate and more. QBCC Licensed. We respond within hours.",
  },
];

/** Fallback meta used for any route not explicitly listed. */
export const FALLBACK_META: RouteMeta = {
  path: "*",
  title: "Concrete Concepts Group | Brisbane Concreting Specialists",
  description:
    "Brisbane's trusted concreting specialists. Driveways, slabs, patios, exposed aggregate, retaining walls & excavation. QBCC Licensed. Free quotes — call 0424 463 268.",
};

/** Normalise a pathname for lookup (strip trailing slash except root). */
export function normalisePath(pathname: string): string {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** Resolve the best-matching RouteMeta for a given pathname. */
export function resolveMeta(pathname: string): RouteMeta {
  const p = normalisePath(pathname);
  const exact = SEO_ROUTES.find((r) => r.path === p);
  if (exact) return exact;
  return { ...FALLBACK_META, path: p };
}
