import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  SOUTHSIDE_LOCALITIES,
  SOUTHSIDE_LOCALITY_BY_SLUG,
  SOUTHSIDE_ROUTES,
  validateSouthsideLocalityContent,
} from "../shared/southsideLocalityContent";
import {
  SOUTHSIDE_CREATE_SLUGS,
  SOUTHSIDE_PRODUCTION_CREATE_ALLOWLIST,
  SOUTHSIDE_PRODUCTION_UPGRADE_ALLOWLIST,
  SOUTHSIDE_RETAIN_SLUGS,
  SOUTHSIDE_UPGRADE_SLUGS,
  isSouthsideLocalityAvailable,
} from "../shared/southsidePublication";
import {
  GENERATED_SOUTHSIDE_LOCALITIES,
  GENERATED_SOUTHSIDE_PREVIEW_ENABLED,
  getSouthsideLocalityRouteAccess,
} from "../client/public/locality-content.js";
import {
  getSeoMetadata,
  renderLocalityContentShell,
} from "../client/public/seo-manifest.js";
import { handoffLocalityQuote } from "../client/src/lib/localityQuoteHandoff";
import { BATCH_ONE_LOCALITY_BY_SLUG } from "../shared/localityContent";

const ROOT = resolve(import.meta.dirname, "..");
const SITE_ORIGIN = "https://concreteconceptsgroup.com";
const APPROVED = [
  ["murarrie", "retain"],
  ["wynnum", "upgrade"],
  ["cannon-hill", "upgrade"],
  ["norman-park", "create"],
  ["morningside", "upgrade"],
  ["tingalpa", "upgrade"],
  ["camp-hill", "upgrade"],
  ["carina", "upgrade"],
] as const;

function sitemapPaths() {
  const xml = readFileSync(resolve(ROOT, "client/public/sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>https:\/\/concreteconceptsgroup\.com([^<]*)<\/loc>/g)]
    .map(match => match[1] || "/");
}

function wordSet(text: string) {
  const stop = new Set([
    "the", "and", "for", "with", "that", "this", "from", "your", "are", "can", "into", "when",
    "before", "after", "concrete", "project", "projects", "locality", "property", "properties",
  ]);
  return new Set(text.toLowerCase().match(/[a-z]{4,}/g)?.filter(word => !stop.has(word)) ?? []);
}

function jaccard(left: string, right: string) {
  const a = wordSet(left);
  const b = wordSet(right);
  const intersection = [...a].filter(word => b.has(word)).length;
  return intersection / new Set([...a, ...b]).size;
}

function decodeVisibleHtml(html: string) {
  return html
    .replaceAll("&#039;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&");
}

const previewContext = {
  customerHost: false,
  southsidePreviewEnabled: true,
};

const productionContext = {
  customerHost: true,
  southsidePreviewEnabled: false,
};

describe("approved south-side locality source", () => {
  it("contains the exact eight-page register in approved order", () => {
    expect(SOUTHSIDE_LOCALITIES.map(({ slug, releaseAction }) => [slug, releaseAction])).toEqual(APPROVED);
    expect(SOUTHSIDE_ROUTES).toEqual(APPROVED.map(([slug]) => `/areas/${slug}`));
    expect(SOUTHSIDE_CREATE_SLUGS).toEqual(["norman-park"]);
    expect(SOUTHSIDE_UPGRADE_SLUGS).toEqual([
      "wynnum", "cannon-hill", "morningside", "tingalpa", "camp-hill", "carina",
    ]);
    expect(SOUTHSIDE_RETAIN_SLUGS).toEqual(["murarrie"]);
    expect(SOUTHSIDE_PRODUCTION_CREATE_ALLOWLIST).toEqual([]);
    expect(SOUTHSIDE_PRODUCTION_UPGRADE_ALLOWLIST).toEqual([]);
  });

  it("reuses Murarrie's approved Batch 1 record instead of duplicating it", () => {
    const { releaseAction: _releaseAction, ...murarrie } = SOUTHSIDE_LOCALITY_BY_SLUG.murarrie;
    expect(murarrie).toEqual(BATCH_ONE_LOCALITY_BY_SLUG.murarrie);
  });

  it("passes the strict eight-record validator", () => {
    expect(validateSouthsideLocalityContent(SOUTHSIDE_LOCALITIES)).toEqual(SOUTHSIDE_LOCALITIES);
  });

  it("contains complete, unique, evidence-backed customer content", () => {
    const uniqueFields = ["title", "description", "h1", "intro"] as const;
    for (const field of uniqueFields) {
      expect(new Set(SOUTHSIDE_LOCALITIES.map(record => record[field])).size).toBe(8);
    }

    for (const record of SOUTHSIDE_LOCALITIES) {
      expect(record.postcode).toMatch(/^\d{4}$/);
      expect(record.lga).toBe("Brisbane City");
      expect(record.region).toBe("Brisbane");
      expect(record.intro.length).toBeGreaterThan(110);
      expect(record.practicalConsiderations.length).toBeGreaterThan(140);
      expect(record.localityContext.attribution.length).toBeGreaterThan(100);
      expect(record.localityContext.sourceUrls.length).toBeGreaterThan(0);
      expect(record.localityContext.sourceUrls.every(url => /^https:\/\//.test(url))).toBe(true);
      expect(record.services.length).toBeGreaterThanOrEqual(3);
      expect(record.faqs.length).toBeGreaterThanOrEqual(3);
      expect(record.nearbyLocalitySlugs.length).toBeGreaterThanOrEqual(2);
      expect(record.verifiedProofIds).toEqual([]);
    }
  });

  it("contains no prohibited prices, proof claims, timing promises or fabricated activity", () => {
    const publicCopy = JSON.stringify(SOUTHSIDE_LOCALITIES);
    expect(publicCopy).not.toMatch(/\$\s?\d|\d+\s*(?:dollars|\/m²|per square metre)/i);
    expect(publicCopy).not.toMatch(/guarantee|guaranteed|fully insured|free quote|free on-site|within 24 hours|\b1-2 days\b|\b2-3 days\b|review score|aggregateRating|testimonial|projects completed|best concreter/i);
    expect(publicCopy).not.toMatch(/QBCC|licen[cs]ed/i);
    expect(publicCopy).not.toMatch(/we (?:regularly|often) (?:work|pour)|our most common jobs?|most popular choice/i);
    expect(publicCopy).not.toMatch(/Marcus/i);
  });

  it("links only to existing public localities or the Norman Park preview route", () => {
    const publicPaths = new Set(sitemapPaths());
    for (const record of SOUTHSIDE_LOCALITIES) {
      for (const slug of record.nearbyLocalitySlugs) {
        expect(publicPaths.has(`/areas/${slug}`) || slug === "norman-park", `${record.slug} -> ${slug}`).toBe(true);
      }
    }
  });

  it("keeps principal copy materially distinct instead of swapping suburb names", () => {
    const scores: number[] = [];
    for (let i = 0; i < SOUTHSIDE_LOCALITIES.length; i += 1) {
      for (let j = i + 1; j < SOUTHSIDE_LOCALITIES.length; j += 1) {
        const left = SOUTHSIDE_LOCALITIES[i];
        const right = SOUTHSIDE_LOCALITIES[j];
        scores.push(jaccard(
          `${left.intro} ${left.practicalConsiderations} ${left.localityContext.attribution}`,
          `${right.intro} ${right.practicalConsiderations} ${right.localityContext.attribution}`,
        ));
      }
    }
    expect(Math.max(...scores)).toBeLessThan(0.5);
  });
});

describe("south-side preview publication boundary", () => {
  it("keeps the default generated preview flag off", () => {
    expect(GENERATED_SOUTHSIDE_PREVIEW_ENABLED).toBe(false);
    expect(GENERATED_SOUTHSIDE_LOCALITIES).toEqual(SOUTHSIDE_LOCALITIES);
  });

  it("leaves customer production on legacy content except the already-live Murarrie record", () => {
    expect(isSouthsideLocalityAvailable("murarrie", productionContext)).toBe(true);
    expect(getSouthsideLocalityRouteAccess("murarrie", true, false)).toBe("public");
    for (const slug of SOUTHSIDE_UPGRADE_SLUGS) {
      expect(isSouthsideLocalityAvailable(slug, productionContext), slug).toBe(false);
      expect(getSouthsideLocalityRouteAccess(slug, true, false), slug).toBe("legacy");
    }
    expect(isSouthsideLocalityAvailable("norman-park", productionContext)).toBe(false);
    expect(getSouthsideLocalityRouteAccess("norman-park", true, false)).toBe("not-found");
  });

  it("makes all eight typed pages available only on the flagged non-customer preview", () => {
    for (const { slug } of SOUTHSIDE_LOCALITIES) {
      expect(isSouthsideLocalityAvailable(slug, previewContext), slug).toBe(true);
      expect(getSouthsideLocalityRouteAccess(slug, false, true), slug).toBe("preview");
    }
  });

  it.each(SOUTHSIDE_LOCALITIES)("renders preview metadata, raw content and FAQ parity for $slug", record => {
    const path = `/areas/${record.slug}`;
    const metadata = getSeoMetadata(path, undefined, previewContext);
    const html = renderLocalityContentShell(path, previewContext);
    const visibleHtml = decodeVisibleHtml(html);
    expect(metadata.title).toBe(record.title);
    expect(metadata.description).toBe(record.description);
    expect(metadata.canonical).toBe(`${SITE_ORIGIN}${path}`);
    expect((html.match(/<h1(?:\s|>)/g) ?? [])).toHaveLength(1);
    expect(visibleHtml).toContain(record.h1);
    expect(visibleHtml).toContain(record.intro);
    expect(visibleHtml).toContain(record.practicalConsiderations);
    for (const faq of record.faqs) {
      expect(visibleHtml).toContain(faq.question);
      expect(visibleHtml).toContain(faq.answer);
    }
    const structuredData = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map(match => JSON.parse(match[1]));
    expect(structuredData.map(item => item["@type"])).toEqual([
      "BreadcrumbList",
      "Service",
      "FAQPage",
    ]);
    expect(structuredData[0].itemListElement[1]).toMatchObject({
      name: record.locality,
      item: `${SITE_ORIGIN}${path}`,
    });
    expect(structuredData[1]).toMatchObject({
      name: `Residential concreting in ${record.locality}`,
      serviceType: record.services.map(service => service.name),
    });
    expect(structuredData[2].mainEntity).toHaveLength(record.faqs.length);
  });

  it("keeps Norman Park absent from the production sitemap during staging", () => {
    expect(sitemapPaths()).not.toContain("/areas/norman-park");
    expect(sitemapPaths()).toContain("/lp/exposed-aggregate-norman-park");
  });
});

describe("south-side quote and route isolation", () => {
  it("saves Norman Park to the existing draft and navigates without a submission", () => {
    const save = vi.fn();
    const navigate = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    handoffLocalityQuote(SOUTHSIDE_LOCALITY_BY_SLUG["norman-park"], { save, navigate });
    expect(save).toHaveBeenCalledWith({ suburb: "Norman Park", postcode: "4170" });
    expect(navigate).toHaveBeenCalledWith("/get-quote");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("build-gates the review route, denies customer hosts and adds no lead mutation", () => {
    const app = readFileSync(resolve(ROOT, "client/src/App.tsx"), "utf8");
    const suburbPage = readFileSync(resolve(ROOT, "client/src/pages/SuburbPage.tsx"), "utf8");
    const review = readFileSync(resolve(ROOT, "client/src/pages/SouthsideReviewPage.tsx"), "utf8");
    const handoff = readFileSync(resolve(ROOT, "client/src/lib/localityQuoteHandoff.ts"), "utf8");
    const packageJson = readFileSync(resolve(ROOT, "package.json"), "utf8");

    expect(app).toContain("VITE_SOUTHSIDE_PREVIEW");
    expect(app).toContain("/southside-review");
    expect(review).toContain("isCustomerWebsiteHost");
    expect(review).toContain("noindex");
    expect(review).toContain("record.releaseAction");
    expect(suburbPage).toContain("isSouthsideLocalityAvailable");
    expect(packageJson).toContain('"build:southside-preview": "tsx scripts/buildSouthsidePreview.ts"');
    expect(`${suburbPage}\n${handoff}`).not.toMatch(/trackQuoteConversion|quote\.submit|quote-submit/);
  });

  it("restores the checked-in south-side flag after every preview build outcome", () => {
    const previewBuild = readFileSync(resolve(ROOT, "scripts/buildSouthsidePreview.ts"), "utf8");
    expect(previewBuild).toContain("finally");
    expect(previewBuild).toContain('VITE_SOUTHSIDE_PREVIEW: "true"');
    expect(previewBuild).toContain('VITE_SOUTHSIDE_PREVIEW: "false"');
    expect(previewBuild).toContain('run("pnpm", ["locality:generate"]');
  });

  it("documents a read-only Ads final-URL gate before changing the Norman Park campaign page", () => {
    const spec = readFileSync(resolve(ROOT, "docs/superpowers/specs/2026-09-20-southside-locality-cluster-design.md"), "utf8");
    expect(spec).toContain("/lp/exposed-aggregate-norman-park");
    expect(spec).toContain("read-only Google Ads final-URL check");
    expect(spec).toContain("No Google Ads changes");
  });
});
