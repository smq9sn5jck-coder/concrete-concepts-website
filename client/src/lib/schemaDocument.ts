import type { SchemaGraph } from "@shared/routeStructuredData.types";
import { serializeStructuredData } from "@shared/routeStructuredData";

/** Schema is centrally owned; legacy page props must not reintroduce ratings/addresses. */
export function replaceRouteSchema(
  documentRef: Document,
  graph: SchemaGraph | null
): HTMLScriptElement | null {
  documentRef
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach(script => script.remove());
  if (!graph) return null;
  const script = documentRef.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-ccg-schema", "true");
  script.textContent = serializeStructuredData(graph);
  documentRef.head.appendChild(script);
  return script;
}
