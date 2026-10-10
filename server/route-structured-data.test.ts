import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildRouteStructuredData,
  serializeStructuredData,
} from "../shared/routeStructuredData";
import { SCHEMA_ROUTES } from "../shared/generated/schemaRoutes";
import {
  applySeoMetadata,
  renderLocalityContentShell,
} from "../client/public/seo-manifest.js";

const root = resolve(import.meta.dirname, "..");
const origin = "https://concreteconceptsgroup.com";
const source = readFileSync(resolve(root, "client/index.html"), "utf8");
const scripts = (html: string) =>
  [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ].map(match => JSON.parse(match[1]));

function checkGraph(path: string) {
  const graph = buildRouteStructuredData(path)!;
  expect(graph).not.toBeNull();
  expect(graph["@context"]).toBe("https://schema.org");
  const nodes = graph["@graph"];
  expect(
    nodes.filter(node => node["@id"] === `${origin}/#business`)
  ).toHaveLength(1);
  expect(new Set(nodes.map(node => node["@id"])).size).toBe(nodes.length);
  const serialized = JSON.stringify(graph);
  for (const forbidden of [
    '"address"',
    '"geo"',
    '"aggregateRating"',
    '"review"',
    '"offers"',
    '"lowPrice"',
    '"highPrice"',
    '"InStock"',
    '"sameAs"',
    '"email"',
    '"hasCredential"',
    '"FAQPage"',
    '"HowTo"',
    '"Product"',
  ]) {
    expect(serialized, `${path}: ${forbidden}`).not.toContain(forbidden);
  }
  return nodes;
}

describe("CCG single route graph", () => {
  it("uses one stable address-free business identity and home Website", () => {
    const nodes = checkGraph("/");
    expect(
      nodes.find(node => node["@type"] === "HomeAndConstructionBusiness")
    ).toMatchObject({
      name: "Concrete Concepts Group Pty Ltd",
      telephone: "+61424463268",
    });
    expect(nodes.find(node => node["@type"] === "WebSite")).toMatchObject({
      "@id": `${origin}/#website`,
      publisher: { "@id": `${origin}/#business` },
    });
  });
  it("derives the nine service entities from the actual public source, not price or review literals", () => {
    const services = Object.entries(SCHEMA_ROUTES).filter(
      ([, record]) => record.kind === "service"
    );
    expect(services).toHaveLength(9);
    const page = readFileSync(
      resolve(root, "client/src/pages/ServicePage.tsx"),
      "utf8"
    );
    for (const [path, record] of services) {
      expect(page).toContain(record.name);
      expect(page).toContain(record.description);
      const node = checkGraph(path).find(node => node["@type"] === "Service");
      expect(node).toMatchObject({
        name: record.name,
        description: record.description,
        provider: { "@id": `${origin}/#business` },
        areaServed: { "@type": "City", name: "Brisbane" },
      });
      const breadcrumb = checkGraph(path).find(
        node => node["@type"] === "BreadcrumbList"
      )!;
      const trail = breadcrumb.itemListElement as { name: string }[];
      expect(trail.at(-1)?.name).toBe(record.serviceTypes![0]);
    }
  });
  it("marks the existing quote flow as ContactPage, never product/booking", () => {
    const nodes = checkGraph("/get-quote");
    expect(nodes.some(node => node["@type"] === "ContactPage")).toBe(true);
    expect(nodes.some(node => node["@type"] === "Service")).toBe(false);
  });
  it("reuses the same business for reviewed typed localities, never a suburb branch", () => {
    const nodes = checkGraph("/areas/beenleigh");
    const service = nodes.find(node => node["@type"] === "Service");
    expect(service).toMatchObject({
      areaServed: { "@type": "Place", name: "Beenleigh, Queensland" },
      provider: { "@id": `${origin}/#business` },
    });
    expect(
      nodes.some(node => String(node["@id"]).endsWith("/beenleigh#business"))
    ).toBe(false);
  });
  it("withholds new service claims from legacy localities and article graphs until editorial/source verification", () => {
    expect(
      checkGraph("/areas/carindale").some(node => node["@type"] === "Service")
    ).toBe(false);
    const breadcrumb = checkGraph("/areas/carindale").find(
      node => node["@type"] === "BreadcrumbList"
    )!;
    expect(
      (breadcrumb.itemListElement as { name: string }[]).at(-1)?.name
    ).toBe("Carindale");
    expect(
      buildRouteStructuredData(
        "/blog/concrete-driveway-cost-brisbane-price-guide"
      )
    ).toBeNull();
    expect(
      checkGraph("/blog").some(node =>
        ["BlogPosting", "Article", "ItemList"].includes(String(node["@type"]))
      )
    ).toBe(false);
  });
  it("fails closed on preview hosts, noindex routes and unknown slugs without laundering query data", () => {
    expect(buildRouteStructuredData("/", { customerHost: false })).toBeNull();
    expect(buildRouteStructuredData("/", { noindex: true })).toBeNull();
    for (const path of [
      "/lp/driveway",
      "/need-another-trade",
      "/admin",
      "/my-quote",
      "/survey/secret",
      "/api/trpc/blog.list",
      "/areas/norman-park",
      "/areas/unknown",
      "/services/unknown",
      "/services/footpaths-brisbane",
      "/areas/foo/beenleigh",
      "/areas/%62eenleigh",
      "https://evil.test/",
      "//evil.test/",
    ]) {
      expect(buildRouteStructuredData(path), path).toBeNull();
    }
    expect(buildRouteStructuredData("/get-quote?phone=secret#x")).toEqual(
      buildRouteStructuredData("/get-quote")
    );
    expect(buildRouteStructuredData("/get-quote/")).toEqual(
      buildRouteStructuredData("/get-quote")
    );
  });
  it("escapes script termination safely while preserving parsed JSON", () => {
    const value = { text: '</script><img src=x onerror="alert(1)"> & example' };
    const output = serializeStructuredData(value);
    expect(output).not.toContain("<");
    expect(JSON.parse(output)).toEqual(value);
  });
});

describe("first-response graph ownership", () => {
  it("removes the two static unlinked schema sources", () => {
    expect(scripts(source)).toHaveLength(0);
  });
  it("keeps the graph in head once, not inside the root; repeat transforms are idempotent", () => {
    const once = applySeoMetadata(source, "/areas/beenleigh");
    const twice = applySeoMetadata(once, "/areas/beenleigh");
    for (const output of [once, twice]) {
      const parsed = scripts(output);
      expect(parsed).toHaveLength(1);
      expect(scripts(output.split("</head>")[0])).toHaveLength(1);
      expect(output).toContain('data-ccg-schema="true"');
      expect(parsed[0]).toEqual(buildRouteStructuredData("/areas/beenleigh"));
      expect(output).toContain('data-edge-locality-shell="true"');
    }
    expect(
      scripts(renderLocalityContentShell("/areas/beenleigh"))
    ).toHaveLength(0);
  });
  it("preserves application/tracking scripts and suppresses public schema on explicit noindex responses", () => {
    const fixture =
      '<html><head><title>Old</title></head><body><div id="root"><p>Loading</p></div><script type="module" src="/app.js"></script><script src="/tracking.js"></script></body></html>';
    const output = applySeoMetadata(fixture, "/get-quote");
    expect(output).toContain('<script type="module" src="/app.js"></script>');
    expect(output).toContain('<script src="/tracking.js"></script>');
    expect(
      scripts(applySeoMetadata(output, "/get-quote", "noindex, nofollow"))
    ).toHaveLength(0);
    expect(scripts(applySeoMetadata(output, "/areas/unknown"))).toHaveLength(0);
  });
  it("has zero unsupported articles or graphs on removed/unknown routes for the entire sitemap", () => {
    const xml = readFileSync(
      resolve(root, "client/public/sitemap.xml"),
      "utf8"
    );
    const paths = [
      ...xml.matchAll(
        /<loc>https:\/\/concreteconceptsgroup\.com([^<]*)<\/loc>/g
      ),
    ].map(match => match[1] || "/");
    for (const path of paths) {
      const output = applySeoMetadata(source, path);
      if (SCHEMA_ROUTES[path]) {
        const parsed = scripts(output);
        expect(parsed, path).toHaveLength(1);
        expect(parsed[0], path).toEqual(buildRouteStructuredData(path));
        checkGraph(path);
      } else {
        expect(scripts(output), path).toHaveLength(0);
      }
    }
  });
});
