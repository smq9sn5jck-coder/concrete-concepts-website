import { describe, expect, it } from "vitest";
import { replaceRouteSchema } from "../client/src/lib/schemaDocument";
import { buildRouteStructuredData } from "../shared/routeStructuredData";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function fakeDocument() {
  const elements: any[] = [];
  const doc = {
    head: {
      appendChild: (el: any) => {
        elements.push(el);
      },
    },
    querySelectorAll: () => [
      ...elements.filter(el => el.type === "application/ld+json"),
    ],
    createElement: () => {
      const el: any = {
        attrs: {},
        type: "",
        textContent: "",
        setAttribute: (k: string, v: string) => {
          el.attrs[k] = v;
        },
        remove: () => {
          const i = elements.indexOf(el);
          if (i >= 0) elements.splice(i, 1);
        },
      };
      return el;
    },
  };
  return { elements, doc: doc as unknown as Document };
}
describe("route graph document lifecycle", () => {
  it("replaces the same script on route changes and removes graph for private/noindex routes", () => {
    const { doc, elements } = fakeDocument();
    const first = replaceRouteSchema(
      doc,
      buildRouteStructuredData("/services/concrete-driveways-brisbane")
    );
    expect(elements).toHaveLength(1);
    expect(elements[0].attrs["data-ccg-schema"]).toBe("true");
    replaceRouteSchema(doc, buildRouteStructuredData("/get-quote"));
    expect(elements).toHaveLength(1);
    expect(
      JSON.parse(elements[0].textContent)["@graph"].some(
        (n: any) => n["@type"] === "ContactPage"
      )
    ).toBe(true);
    // A stale effect's cleanup must not delete the next route's script.
    first?.remove();
    expect(elements).toHaveLength(1);
    replaceRouteSchema(doc, null);
    expect(elements).toHaveLength(0);
  });
  it("does not touch application or tracking scripts", () => {
    const { doc, elements } = fakeDocument();
    const tracking = { type: "text/javascript", id: "analytics" };
    elements.push(tracking);
    replaceRouteSchema(doc, buildRouteStructuredData("/"));
    expect(elements).toContain(tracking);
  });
  it("makes SEOHead own the shared graph and removes competing inline breadcrumb JSON-LD", () => {
    const root = resolve(import.meta.dirname, "..");
    const head = readFileSync(
      resolve(root, "client/src/components/SEOHead.tsx"),
      "utf8"
    );
    const crumbs = readFileSync(
      resolve(root, "client/src/components/Breadcrumbs.tsx"),
      "utf8"
    );
    const faq = readFileSync(
      resolve(root, "client/src/components/FAQSection.tsx"),
      "utf8"
    );
    expect(head).toContain("buildRouteStructuredData");
    expect(head).toContain("replaceRouteSchema");
    expect(head).not.toContain("dataArray.forEach");
    expect(crumbs).not.toContain('type="application/ld+json"');
    expect(faq).not.toContain('type="application/ld+json"');
    expect(crumbs).toContain('aria-label="Breadcrumb"');
  });
});
