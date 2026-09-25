import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  BATCH_ONE_LOCALITIES,
  BATCH_ONE_LOCALITY_BY_SLUG,
  BATCH_ONE_ROUTES,
} from "../shared/localityContent";
import {
  BATCH_ONE_CREATE_SLUGS,
  BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST,
  BATCH_ONE_UPGRADE_SLUGS,
  isBatchOneLocalityAvailable,
} from "../shared/batchOnePublication";
import { validateLocalityContent } from "../shared/localityContent.schema";
import {
  GENERATED_BATCH_ONE_LOCALITIES,
  getLocalityRouteAccess,
} from "../client/public/locality-content.js";
import {
  getSeoMetadata,
  renderLocalityContentShell,
} from "../client/public/seo-manifest.js";
import { handoffLocalityQuote } from "../client/src/lib/localityQuoteHandoff";

const ROOT = resolve(import.meta.dirname, "..");
const SITE_ORIGIN = "https://concreteconceptsgroup.com";
const APPROVED = [
  ["moggill", "create"],
  ["everton-park", "upgrade"],
  ["rochedale", "upgrade"],
  ["murarrie", "create"],
  ["mermaid-waters", "create"],
  ["clear-island-waters", "create"],
  ["upper-coomera", "upgrade"],
  ["pimpama", "upgrade"],
  ["white-rock", "create"],
  ["silkstone", "create"],
  ["spring-mountain", "create"],
  ["south-ripley", "create"],
  ["flagstone", "create"],
  ["beenleigh", "upgrade"],
  ["crestmead", "create"],
  ["yarrabilba", "create"],
  ["clontarf", "create"],
  ["strathpine", "upgrade"],
  ["caboolture", "upgrade"],
  ["morayfield", "upgrade"],
] as const;

function sitemapPaths() {
  const xml = readFileSync(resolve(ROOT, "client/public/sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>https:\/\/concreteconceptsgroup\.com([^<]*)<\/loc>/g)]
    .map(match => match[1] || "/");
}

function wordSet(text: string) {
  const stop = new Set(["the", "and", "for", "with", "that", "this", "from", "your", "are", "can", "into", "when", "before", "after", "concrete", "project", "projects", "locality"]);
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

describe("Batch 1 approved locality source", () => {
  it("contains the fixed paths in approved order with exactly 12 creates and 8 upgrades", () => {
    expect(BATCH_ONE_LOCALITIES.map(({ slug, action }) => [slug, action])).toEqual(APPROVED);
    expect(BATCH_ONE_ROUTES).toEqual(APPROVED.map(([slug]) => `/areas/${slug}`));
    expect(BATCH_ONE_CREATE_SLUGS).toHaveLength(12);
    expect(BATCH_ONE_UPGRADE_SLUGS).toHaveLength(8);
    expect(BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST).toEqual(BATCH_ONE_CREATE_SLUGS);
    expect(new Set(BATCH_ONE_ROUTES).size).toBe(20);
  });

  it("publishes every approved Batch 1 canonical exactly once in the sitemap", () => {
    const paths = sitemapPaths();
    const xml = readFileSync(resolve(ROOT, "client/public/sitemap.xml"), "utf8");
    for (const route of BATCH_ONE_ROUTES) {
      expect(paths.filter(path => path === route), route).toHaveLength(1);
      expect(xml, route).toMatch(
        new RegExp(`<loc>${SITE_ORIGIN}${route}</loc>\\s*<lastmod>2026-09-20</lastmod>`),
      );
    }
  });

  it("passes the strict typed content validator", () => {
    expect(validateLocalityContent(BATCH_ONE_LOCALITIES)).toEqual(BATCH_ONE_LOCALITIES);
  });

  it("has every required, unique customer-facing field and auditable evidence", () => {
    const uniqueFields = ["title", "description", "h1", "intro"] as const;
    for (const field of uniqueFields) {
      expect(new Set(BATCH_ONE_LOCALITIES.map(record => record[field])).size).toBe(20);
    }

    for (const record of BATCH_ONE_LOCALITIES) {
      expect(record.postcode).toMatch(/^\d{4}$/);
      expect(record.lga).toMatch(/City$/);
      expect(record.region).toMatch(/^(Brisbane|Gold Coast|Ipswich|Logan|Moreton Bay)$/);
      expect(record.intro.length).toBeGreaterThan(110);
      expect(record.practicalConsiderations.length).toBeGreaterThan(140);
      expect(record.localityContext.claimDate).toMatch(/^\d{4}(-\d{2})?$/);
      expect(record.localityContext.attribution.length).toBeGreaterThan(100);
      expect(record.localityContext.sourceUrls.length).toBeGreaterThan(0);
      expect(record.localityContext.sourceUrls.every(url => /^https:\/\//.test(url))).toBe(true);
      expect(record.services.length).toBeGreaterThanOrEqual(3);
      expect(record.faqs.length).toBeGreaterThanOrEqual(3);
      expect(record.regionalHub.path).toMatch(/^\/areas#/);
      expect(record.nearbyLocalitySlugs.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("uses the stable official ABS source for Moggill housing context", () => {
    const moggill = BATCH_ONE_LOCALITY_BY_SLUG.moggill;
    expect(moggill.localityContext.sourceLabel).toContain("Australian Bureau of Statistics");
    expect(moggill.localityContext.sourceUrls).toEqual([
      "https://abs.gov.au/census/find-census-data/quickstats/2021/304021086",
    ]);
    expect(JSON.stringify(moggill)).not.toContain("epbcpublicportal.environment.gov.au");
  });

  it("contains no prohibited claims or evidence-free locality testimonials", () => {
    const publicCopy = JSON.stringify(BATCH_ONE_LOCALITIES);
    expect(publicCopy).not.toMatch(/\$\s?\d|\d+\s*(?:dollars|\/m²|per square metre)/i);
    expect(publicCopy).not.toMatch(/guarantee|guaranteed|bookings? almost full|limited spots?|act now|within 24 hours|start within|fully insured|review score|testimonial|projects completed|best concreter/i);
    expect(publicCopy).not.toMatch(/we (?:built|delivered|completed|worked on|were contracted|partnered).*?(?:estate|development|infrastructure|community)/i);
    expect(publicCopy).not.toMatch(/Marcus/i);
    expect(BATCH_ONE_LOCALITIES.every(record => record.verifiedProofIds.length === 0)).toBe(true);
  });

  it("links only to live services, the areas hub, or existing public locality routes", () => {
    const paths = new Set(sitemapPaths());
    for (const record of BATCH_ONE_LOCALITIES) {
      expect(paths.has(record.regionalHub.path.split("#")[0])).toBe(true);
      for (const service of record.services) expect(paths.has(`/services/${service.slug}`)).toBe(true);
      for (const slug of record.nearbyLocalitySlugs) expect(paths.has(`/areas/${slug}`)).toBe(true);
    }
  });

  it("keeps principal copy materially distinct rather than swapping locality names", () => {
    const pairs: Array<{ left: string; right: string; score: number }> = [];
    for (let i = 0; i < BATCH_ONE_LOCALITIES.length; i += 1) {
      for (let j = i + 1; j < BATCH_ONE_LOCALITIES.length; j += 1) {
        const leftRecord = BATCH_ONE_LOCALITIES[i];
        const rightRecord = BATCH_ONE_LOCALITIES[j];
        const left = `${leftRecord.intro} ${leftRecord.practicalConsiderations} ${leftRecord.localityContext.attribution}`;
        const right = `${rightRecord.intro} ${rightRecord.practicalConsiderations} ${rightRecord.localityContext.attribution}`;
        pairs.push({ left: leftRecord.slug, right: rightRecord.slug, score: jaccard(left, right) });
      }
    }
    expect(pairs.sort((a, b) => b.score - a.score).slice(0, 5)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ score: expect.any(Number) }),
      ]),
    );
    expect(Math.max(...pairs.map(pair => pair.score))).toBeLessThan(0.5);
  });
});

describe("Batch 1 generated edge parity and SEO shell", () => {
  it("generates edge records exactly from the typed source", () => {
    expect(GENERATED_BATCH_ONE_LOCALITIES).toEqual(BATCH_ONE_LOCALITIES);
  });

  it.each(BATCH_ONE_LOCALITIES)("has explicit metadata, canonical, one H1, useful raw body and FAQ parity for $slug", record => {
    const path = `/areas/${record.slug}`;
    const metadata = getSeoMetadata(path);
    const html = renderLocalityContentShell(path);
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
  });

  it("escapes generated public copy before placing it in raw HTML", () => {
    const html = renderLocalityContentShell("/areas/moggill");
    expect((html.match(/<script type="application\/ld\+json">/g) ?? [])).toHaveLength(3);
    const withoutStructuredData = html.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
      "",
    );
    expect(withoutStructuredData).not.toMatch(/<script|onerror=|javascript:/i);
  });
});

describe("Batch 1 publication boundary", () => {
  it.each(BATCH_ONE_UPGRADE_SLUGS)("keeps upgraded canonical %s public", slug => {
    expect(isBatchOneLocalityAvailable(slug, { customerHost: true, previewEnabled: false })).toBe(true);
    expect(getLocalityRouteAccess(slug, true, false)).toBe("public");
  });

  it.each(BATCH_ONE_CREATE_SLUGS)("publishes approved new slug %s on customer hosts", slug => {
    expect(isBatchOneLocalityAvailable(slug, { customerHost: true, previewEnabled: false })).toBe(true);
    expect(getLocalityRouteAccess(slug, true, false)).toBe("public");
  });

  it.each(BATCH_ONE_CREATE_SLUGS)("keeps published new slug %s available on every host", slug => {
    expect(isBatchOneLocalityAvailable(slug, { customerHost: false, previewEnabled: false })).toBe(true);
    expect(isBatchOneLocalityAvailable(slug, { customerHost: false, previewEnabled: true })).toBe(true);
    expect(getLocalityRouteAccess(slug, false, false)).toBe("public");
    expect(getLocalityRouteAccess(slug, false, true)).toBe("public");
  });

  it("returns noindex metadata and no raw locality shell for an unknown slug", () => {
    expect(getSeoMetadata("/areas/not-a-real-locality").robots).toBe("noindex, follow");
    expect(renderLocalityContentShell("/areas/not-a-real-locality")).toBe("");
    expect(getLocalityRouteAccess("not-a-real-locality", true, false)).toBe("not-found");
  });
});

describe("Batch 1 quote handoff", () => {
  it("saves a locality draft and navigates to the existing quote route without a submission", () => {
    const save = vi.fn();
    const navigate = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    handoffLocalityQuote(BATCH_ONE_LOCALITY_BY_SLUG.moggill, { save, navigate });
    expect(save).toHaveBeenCalledWith({ suburb: "Moggill", postcode: "4070" });
    expect(navigate).toHaveBeenCalledWith("/get-quote");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("still navigates when draft storage fails", () => {
    const navigate = vi.fn();
    handoffLocalityQuote(BATCH_ONE_LOCALITY_BY_SLUG.moggill, {
      save: () => { throw new Error("storage blocked"); },
      navigate,
    });
    expect(navigate).toHaveBeenCalledWith("/get-quote");
  });

  it("keeps locality rendering isolated from lead mutation and primary conversion tracking", () => {
    const page = readFileSync(resolve(ROOT, "client/src/pages/SuburbPage.tsx"), "utf8");
    const handoff = readFileSync(resolve(ROOT, "client/src/lib/localityQuoteHandoff.ts"), "utf8");
    expect(`${page}\n${handoff}`).not.toMatch(/trackQuoteConversion|quote\.submit|quote-submit/);
    expect(page).toContain("BatchOneLocalityPage");
    expect(handoff).toContain("saveQuoteDraft");
    expect(handoff).toContain("/get-quote");
  });
});

describe("Batch 1 staging review route", () => {
  it("is build-gated, customer-host denied, and displays required review fields", () => {
    const app = readFileSync(resolve(ROOT, "client/src/App.tsx"), "utf8");
    const review = readFileSync(resolve(ROOT, "client/src/pages/BatchOneReviewPage.tsx"), "utf8");
    expect(app).toContain("VITE_BATCH_ONE_PREVIEW");
    expect(app).toContain("/batch-one-review");
    expect(review).toContain("isCustomerWebsiteHost");
    expect(review).toContain("record.action");
    expect(review).toContain("record.postcode");
    expect(review).toContain("record.localityContext.sourceUrls.map");
    expect(review).toContain("`/areas/${record.slug}`");
    expect(review).not.toContain("Map.groupBy");
  });

  it("lists approved create routes in the customer service-area directory", () => {
    const areasPage = readFileSync(resolve(ROOT, "client/src/pages/ServiceAreasPage.tsx"), "utf8");
    expect(areasPage).toContain("BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST");
  });
});
