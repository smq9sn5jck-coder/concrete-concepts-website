import { SCHEMA_ROUTES } from "./generated/schemaRoutes";
import type {
  SchemaContext,
  SchemaGraph,
  SchemaNode,
} from "./routeStructuredData.types";
export type { SchemaGraph, SchemaContext } from "./routeStructuredData.types";

export const SCHEMA_ORIGIN = "https://concreteconceptsgroup.com";
export const BUSINESS_ID = `${SCHEMA_ORIGIN}/#business`;

export function normalizeSchemaPath(value: string): string | null {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[%\\\u0000-\u001f]/.test(value)
  )
    return null;
  const path = value.split(/[?#]/, 1)[0];
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/** Content and publication must both be allowlisted; do not infer entities from slugs. */
export function buildRouteStructuredData(
  value: string,
  context: SchemaContext = {}
): SchemaGraph | null {
  if (context.customerHost === false || context.noindex) return null;
  const path = normalizeSchemaPath(value);
  const record = path ? SCHEMA_ROUTES[path] : undefined;
  if (!record || !path) return null;
  const url = `${SCHEMA_ORIGIN}${path}`;
  const webpageId = `${url}#webpage`;
  const business: SchemaNode = {
    "@type": "HomeAndConstructionBusiness",
    "@id": BUSINESS_ID,
    name: "Concrete Concepts Group Pty Ltd",
    url: `${SCHEMA_ORIGIN}/`,
    telephone: "+61424463268",
    areaServed: { "@type": "City", name: "Brisbane" },
  };
  // Address, coordinates, mailbox, hours, credentials and profiles require owner verification.
  const webpage: SchemaNode = {
    "@type":
      record.kind === "contact"
        ? "ContactPage"
        : record.kind === "collection"
          ? "CollectionPage"
          : "WebPage",
    "@id": webpageId,
    url,
    name: record.name,
    about: { "@id": BUSINESS_ID },
    inLanguage: "en-AU",
    ...(record.description ? { description: record.description } : {}),
  };
  const nodes: SchemaNode[] = [business, webpage];
  if (record.kind === "home") {
    const websiteId = `${SCHEMA_ORIGIN}/#website`;
    nodes.push({
      "@type": "WebSite",
      "@id": websiteId,
      name: "Concrete Concepts Group",
      url: `${SCHEMA_ORIGIN}/`,
      publisher: { "@id": BUSINESS_ID },
      inLanguage: "en-AU",
    });
    webpage.isPartOf = { "@id": websiteId };
  }
  if (record.kind === "service" || record.kind === "locality") {
    const serviceId = `${url}#service`;
    webpage.mainEntity = { "@id": serviceId };
    nodes.push({
      "@type": "Service",
      "@id": serviceId,
      url,
      name: record.name,
      description: record.description,
      serviceType: record.serviceTypes || [],
      provider: { "@id": BUSINESS_ID },
      areaServed: record.locality
        ? { "@type": "Place", name: `${record.locality}, Queensland` }
        : { "@type": "City", name: "Brisbane" },
      mainEntityOfPage: { "@id": webpageId },
    });
  }
  if (path !== "/" && (record.breadcrumbs || record.kind === "contact")) {
    const breadcrumbId = `${url}#breadcrumb`;
    const trail = [
      { name: "Home", path: "/" },
      ...(record.breadcrumbs || []),
      { name: record.breadcrumbName || record.locality || record.name, path },
    ];
    webpage.breadcrumb = { "@id": breadcrumbId };
    nodes.push({
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: trail.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${SCHEMA_ORIGIN}${item.path}`,
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": nodes };
}

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
