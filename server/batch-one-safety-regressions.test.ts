import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BATCH_ONE_LOCALITIES, BATCH_ONE_LOCALITY_BY_SLUG } from "../shared/localityContent";
import { quoteServices, comprehensiveQuoteSchema } from "../shared/quoteBrief";
import * as localityHandoff from "../client/src/lib/localityQuoteHandoff";
import { scrollToServiceAreaHash } from "../client/src/lib/serviceAreaHash";
import { applySeoMetadata, renderLocalityContentShell } from "../client/public/seo-manifest.js";

const ROOT = resolve(import.meta.dirname, "..");

async function loadWorker(testName: string) {
  const workerUrl = `${pathToFileURL(resolve(ROOT, "client/public/_worker.js")).href}?batch-one-safety=${testName}-${Date.now()}-${Math.random()}`;
  const { default: edgeWorker } = await import(workerUrl);
  return edgeWorker;
}

function createCacheMock() {
  const stored = new Map<string, Response>();
  const key = (request: Request) => `${request.method}:${request.url}`;
  const match = vi.fn(async (request: Request) => stored.get(key(request))?.clone());
  const put = vi.fn(async (request: Request, response: Response) => {
    stored.set(key(request), response.clone());
  });
  return { cache: { match, put }, match, put, stored };
}

function htmlAssetFallback() {
  return {
    fetch: vi.fn(async () => new Response(
      '<!doctype html><html><head><title>Fallback</title><meta name="description" content=""><meta name="robots" content="index, follow"><link rel="canonical" href=""></head><body><div id="root"><div>loading</div></div><script id="app-module" type="module" src="/assets/app.js"></script><script id="analytics" src="/analytics.js"></script></body></html>',
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    )),
  };
}

function validQuoteWithServices(services: string[]) {
  return {
    version: 1 as const,
    contact: {
      name: "Test Client",
      mobile: "0412345678",
      email: "test@example.com",
      preferredContact: "sms" as const,
      company: "",
    },
    location: { streetAddress: "", suburb: "Moggill", postcode: "4070" },
    scope: {
      services,
      workType: "not_sure" as const,
      finish: "not_sure" as const,
      timeframe: "planning" as const,
      description: "A fictional residential concrete project for schema validation only.",
    },
    measurements: { mode: "not_sure" as const, separateAreaNotes: "" },
    siteConditions: { knownServices: "", specialRequirements: "" },
    photos: [],
    consents: { contact: true as const, privacy: true as const, marketing: false },
  };
}

describe("Batch 1 route-gate safety", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("denies both HEAD and GET for an unpublished create route before cache access", async () => {
    const edgeWorker = await loadWorker("head-cache-gate");
    const cache = createCacheMock();
    vi.stubGlobal("caches", { default: cache.cache });
    const assets = htmlAssetFallback();
    const env = { ASSETS: assets };
    const ctx = { waitUntil: vi.fn() };
    const url = "https://concreteconceptsgroup.com/areas/moggill";

    const head = await edgeWorker.fetch(new Request(url, { method: "HEAD" }), env, ctx);
    expect(head.status).toBe(404);
    expect(head.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(head.headers.get("Cache-Control")).toBe("no-store");
    expect(await head.text()).toBe("");
    expect(cache.put).not.toHaveBeenCalled();

    const get = await edgeWorker.fetch(new Request(url, { method: "GET" }), env, ctx);
    expect(get.status).toBe(404);
    expect(get.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(cache.put).not.toHaveBeenCalled();
  });

  it("uses the documented VITE_BATCH_ONE_PREVIEW flag as the generated edge preview gate", () => {
    const generator = readFileSync(resolve(ROOT, "scripts/generateLocalityEdgeData.ts"), "utf8");
    const generated = readFileSync(resolve(ROOT, "client/public/locality-content.js"), "utf8");
    const worker = readFileSync(resolve(ROOT, "client/public/_worker.js"), "utf8");
    expect(generator).toContain("process.env.VITE_BATCH_ONE_PREVIEW");
    expect(generated).toContain("GENERATED_BATCH_ONE_PREVIEW_ENABLED");
    expect(worker).toContain("GENERATED_BATCH_ONE_PREVIEW_ENABLED");
    expect(worker).not.toContain("env.BATCH_ONE_PREVIEW");
  });
});

describe("Batch 1 quote handoff safety", () => {
  it("maps every locality service route to a valid comprehensive-quote service", () => {
    const mapService = (localityHandoff as unknown as {
      quoteServiceForLocalitySlug?: (slug: string) => string | undefined;
    }).quoteServiceForLocalitySlug;
    expect(typeof mapService).toBe("function");

    const serviceSlugs = new Set(BATCH_ONE_LOCALITIES.flatMap(record => record.services.map(service => service.slug)));
    for (const slug of serviceSlugs) {
      const mapped = mapService?.(slug);
      expect(mapped, slug).toBeTruthy();
      expect(quoteServices).toContain(mapped);
      expect(comprehensiveQuoteSchema.safeParse(validQuoteWithServices([mapped!])).success, slug).toBe(true);
    }
  });

  it("preserves an existing valid partial draft while overriding locality and adding the selected service", () => {
    const save = vi.fn();
    const navigate = vi.fn();
    const existing = {
      name: "Existing Client",
      mobile: "0412345678",
      email: "existing@example.com",
      streetAddress: "1 Existing Street",
      suburb: "Old Suburb",
      postcode: "4000",
      services: ["patio"],
      description: "Keep this existing project description and every entered field.",
      contactConsent: true,
      privacyConsent: true,
    };

    localityHandoff.handoffLocalityQuote(BATCH_ONE_LOCALITY_BY_SLUG.moggill, {
      load: () => existing,
      save,
      navigate,
      serviceSlug: "concrete-driveways-brisbane",
    } as never);

    expect(save).toHaveBeenCalledWith({
      ...existing,
      suburb: "Moggill",
      postcode: "4070",
      services: ["patio", "driveway"],
    });
    expect(navigate).toHaveBeenCalledWith("/get-quote");
  });
});

describe("Batch 1 citation, anchor and raw-shell safety", () => {
  it("renders every cited source in the React page, staging review and raw edge shell", () => {
    const page = readFileSync(resolve(ROOT, "client/src/components/BatchOneLocalityPage.tsx"), "utf8");
    const review = readFileSync(resolve(ROOT, "client/src/pages/BatchOneReviewPage.tsx"), "utf8");
    expect(page).toMatch(/sourceUrls\.map/);
    expect(review).toMatch(/sourceUrls\.map/);

    for (const record of BATCH_ONE_LOCALITIES) {
      const html = renderLocalityContentShell(`/areas/${record.slug}`).replaceAll("&amp;", "&");
      for (const sourceUrl of record.localityContext.sourceUrls) {
        expect(html, `${record.slug}: ${sourceUrl}`).toContain(sourceUrl);
      }
    }
  });

  it("provides a matching service-area fragment target for every locality regional hub", () => {
    const areasPage = readFileSync(resolve(ROOT, "client/src/pages/ServiceAreasPage.tsx"), "utf8");
    const fragments = new Set(BATCH_ONE_LOCALITIES.map(record => record.regionalHub.path.split("#")[1]));
    for (const fragment of fragments) {
      expect(areasPage, fragment).toContain(`"${fragment}"`);
    }
    expect(areasPage).toContain("id={region.anchorId}");
  });

  it("scrolls to a promised regional fragment after the SPA target mounts", () => {
    const scrollIntoView = vi.fn();
    const documentRef = {
      getElementById: vi.fn((id: string) => id === "brisbane" ? { scrollIntoView } : null),
    };
    expect(scrollToServiceAreaHash("#brisbane", documentRef)).toBe(true);
    expect(documentRef.getElementById).toHaveBeenCalledWith("brisbane");
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    expect(scrollToServiceAreaHash("#unknown", documentRef)).toBe(false);
  });

  it("replaces only root contents and preserves every post-root application and analytics script", () => {
    const fixture = '<!doctype html><html><head><title>Old</title><meta name="description" content=""><meta name="robots" content="index, follow"><link rel="canonical" href=""></head><body><div id="root"><div><span>loading</span></div></div><script id="app-module" type="module" src="/assets/app.js"></script><script id="analytics" src="/analytics.js"></script></body></html>';
    const output = applySeoMetadata(fixture, "/areas/moggill", "noindex, nofollow");
    expect(output).toContain('data-edge-locality-shell="true"');
    expect(output).toContain('<script id="app-module" type="module" src="/assets/app.js"></script>');
    expect(output).toContain('<script id="analytics" src="/analytics.js"></script>');
    expect(output.match(/id="root"/g)).toHaveLength(1);
  });
});
