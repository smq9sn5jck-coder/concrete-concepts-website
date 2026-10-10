export interface SchemaRouteRecord {
  kind: "page" | "home" | "contact" | "collection" | "service" | "locality";
  name: string;
  description: string;
  locality?: string;
  breadcrumbName?: string;
  serviceTypes?: string[];
  breadcrumbs?: { name: string; path: string }[];
}
export type SchemaNode = Record<string, unknown> & {
  "@id": string;
  "@type": string;
};
export interface SchemaGraph {
  "@context": string;
  "@graph": SchemaNode[];
}
export interface SchemaContext {
  customerHost?: boolean;
  noindex?: boolean;
}
