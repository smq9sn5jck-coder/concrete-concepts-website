import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { filterPublicSitemap, getSeoMetadata } from "../client/public/seo-manifest.js";

const SITE_ORIGIN = "https://concreteconceptsgroup.com";

const affectedPublicPaths = [
  "/calculator",
  "/faq",
  "/finishes",
  "/gallery/before-after",
  "/projects",
  "/referral",
  "/reviews",
  "/services/concrete-patios-brisbane",
  "/services/crossover-permits-brisbane",
  "/services/excavation-brisbane",
  "/services/pool-surrounds-brisbane",
  "/services/shed-slabs-brisbane",
] as const;

function sitemapPaths() {
  const sourceXml = readFileSync(
    resolve(import.meta.dirname, "../client/public/sitemap.xml"),
    "utf8",
  );
  const xml = filterPublicSitemap(sourceXml);

  return [...xml.matchAll(/<loc>(https:\/\/concreteconceptsgroup\.com[^<]*)<\/loc>/g)]
    .map(match => new URL(match[1]).pathname);
}

describe("public sitemap and edge indexability parity", () => {
  it("keeps every audited affected public route in the sitemap", () => {
    const paths = sitemapPaths();
    expect(affectedPublicPaths).toHaveLength(12);
    for (const path of affectedPublicPaths) expect(paths).toContain(path);
  });

  it("marks every public sitemap route indexable with its self-canonical", () => {
    const failures = sitemapPaths()
      .map(path => ({ path, metadata: getSeoMetadata(path) }))
      .filter(({ path, metadata }) => (
        metadata.robots !== "index, follow"
        || metadata.canonical !== `${SITE_ORIGIN}${path === "/" ? "" : path}`
      ));

    expect(failures).toEqual([]);
  });

  it.each(affectedPublicPaths)("gives %s truthful route-specific metadata", path => {
    const metadata = getSeoMetadata(path);
    expect(metadata.robots).toBe("index, follow");
    expect(metadata.title).not.toBe(`${path.split("/").pop()} | Concrete Concepts Group Brisbane`);
    expect(metadata.description).not.toBe(
      "Concrete Concepts Group provides detailed concreting information and quote options across Brisbane and South East Queensland.",
    );
  });

  it("keeps paid landing pages out of the public sitemap and noindexed", () => {
    expect(sitemapPaths().some(path => path.startsWith("/lp/"))).toBe(false);
    expect(getSeoMetadata("/lp/retaining-wall-brisbane").robots).toBe("noindex, follow");
  });

  it.each(["/admin", "/my-quote", "/404"])(
    "keeps the private or utility route %s noindexed",
    path => {
      expect(getSeoMetadata(path).robots).toBe("noindex, follow");
    },
  );
});
