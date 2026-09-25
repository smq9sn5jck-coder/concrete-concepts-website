import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { REGIONAL_SLAB_PAGES, REGIONAL_SLAB_REVIEW_PATHS } from "../shared/regionalSlabContent";
import { getClientRegionalSlabRouteAccess } from "../client/src/lib/regionalSlabPreviewAccess";
import { isOtherTradePreviewAvailable } from "../client/src/lib/otherTradePreviewAccess";

const ROOT = resolve(import.meta.dirname, "..");
const tempDirectories: string[] = [];
const expectedPaths = [
  "/regional-slab-review",
  "/services/concrete-slabs-brisbane",
  "/services/extension-slabs-brisbane",
  "/guides/how-house-slab-quotes-work",
  "/guides/extension-slab-readiness",
  "/areas/ipswich-ripley-house-slabs",
  "/gold-coast/house-slabs",
  "/gold-coast/extension-slabs",
  "/areas/sunshine-coast",
] as const;
const newlyUnpublishedPaths = expectedPaths.filter(path => path !== "/services/concrete-slabs-brisbane");

function htmlAssetFallback() {
  return {
    fetch: vi.fn(async () => new Response(
      '<!doctype html><html><head><title>Fallback</title><meta name="description" content=""><meta name="robots" content="index, follow"><link rel="canonical" href=""><meta property="og:title" content=""><meta property="og:description" content=""><meta property="og:url" content=""></head><body><div id="root"><div>legacy content</div></div><script id="app-module" type="module" src="/assets/app.js"></script></body></html>',
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    )),
  };
}

function createCacheMock() {
  const stored = new Map<string, Response>();
  const key = (request: Request) => `${request.method}:${request.url}`;
  return {
    match: vi.fn(async (request: Request) => stored.get(key(request))?.clone()),
    put: vi.fn(async (request: Request, response: Response) => { stored.set(key(request), response.clone()); }),
  };
}

async function loadWorker(options: { regionalPreview: boolean; regionalPublished?: boolean; goldCoastPreview?: boolean; otherTradePreview?: boolean }) {
  const directory = mkdtempSync(resolve(tmpdir(), "ccg-regional-slab-worker-"));
  tempDirectories.push(directory);
  for (const filename of [
    "_worker.js", "seo-manifest.js", "locality-content.js", "other-trade-config.js",
    "gold-coast-content.js", "regional-slab-content.js", "blog-content.js",
  ]) copyFileSync(resolve(ROOT, "client/public", filename), resolve(directory, filename));

  const regionalPath = resolve(directory, "regional-slab-content.js");
  const regional = readFileSync(regionalPath, "utf8")
    .replace(/export const GENERATED_REGIONAL_SLAB_PREVIEW_ENABLED = (?:true|false);/, `export const GENERATED_REGIONAL_SLAB_PREVIEW_ENABLED = ${options.regionalPreview};`)
    .replace(/export const GENERATED_REGIONAL_SLAB_PUBLISHED_ENABLED = (?:true|false);/, `export const GENERATED_REGIONAL_SLAB_PUBLISHED_ENABLED = ${options.regionalPublished ?? false};`);
  writeFileSync(regionalPath, regional, "utf8");

  const goldCoastPath = resolve(directory, "gold-coast-content.js");
  const goldCoast = readFileSync(goldCoastPath, "utf8")
    .replace(/export const GENERATED_GOLD_COAST_PREVIEW_ENABLED = (?:true|false);/, `export const GENERATED_GOLD_COAST_PREVIEW_ENABLED = ${options.goldCoastPreview ?? false};`);
  writeFileSync(goldCoastPath, goldCoast, "utf8");

  const otherTradePath = resolve(directory, "other-trade-config.js");
  const otherTrade = readFileSync(otherTradePath, "utf8")
    .replace(/export const GENERATED_OTHER_TRADE_PREVIEW_ENABLED = (?:true|false);/, `export const GENERATED_OTHER_TRADE_PREVIEW_ENABLED = ${options.otherTradePreview ?? false};`);
  writeFileSync(otherTradePath, otherTrade, "utf8");

  const workerUrl = `${pathToFileURL(resolve(directory, "_worker.js")).href}?regional=${basename(directory)}`;
  return (await import(workerUrl)).default;
}

async function fetchWorker(worker: any, url: string, init?: RequestInit) {
  vi.stubGlobal("caches", { default: createCacheMock() });
  return worker.fetch(new Request(url, init), { ASSETS: htmlAssetFallback() }, { waitUntil: vi.fn() });
}

function validRegionalQuotePayload() {
  return {
    submissionId: "3f6de0dc-4c9b-4b52-b0e2-a0b9480f0567",
    website: "",
    formStartedAt: Date.now() - 5_000,
    jobBrief: {
      version: 1,
      contact: {
        name: "Preview Test",
        mobile: "0424001122",
        email: "preview@example.com",
        preferredContact: "sms",
        company: "",
      },
      location: { streetAddress: "10 Preview Street", suburb: "Camp Hill", postcode: "4152" },
      scope: {
        services: ["slab"],
        workType: "extension",
        finish: "not_sure",
        timeframe: "planning",
        description: "A preview-only extension slab request for validation testing.",
      },
      measurements: { mode: "not_sure", separateAreaNotes: "" },
      siteConditions: { knownServices: "", specialRequirements: "" },
      projectContext: {
        audienceType: "builder_developer",
        structuralProjectType: "complete_extension",
        builderCompanyName: "Preview Build Co",
        builderRole: "Estimator",
        plansReadiness: "not_sure",
        engineeringReadiness: "not_sure",
        soilFoundationReadiness: "not_sure",
        certifierApprovalStatus: "not_sure",
        numberOfSitesOrPours: "Two",
        requiredConcreteScope: "Extension slab and footings",
        indicativeProgramme: "Planning only",
        preferredFollowUp: "Email",
        region: "Brisbane",
        landingRoute: "/services/extension-slabs-brisbane",
        partnerIntroductionInterest: false,
      },
      photos: [],
      consents: { contact: true, privacy: true, marketing: false },
    },
  };
}

describe("regional slab publication and route contracts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    while (tempDirectories.length) rmSync(tempDirectories.pop()!, { recursive: true, force: true });
  });

  it("keeps preview-only client routes off customer hosts even when preview flags are enabled", () => {
    expect(getClientRegionalSlabRouteAccess(
      "/areas/sunshine-coast",
      "ConcreteConceptsGroup.com.",
      { preview: true, published: false },
    ).available).toBe(false);
    expect(getClientRegionalSlabRouteAccess(
      "/areas/sunshine-coast",
      "regional-slab-review.concrete-concepts-group.pages.dev",
      { preview: true, published: false },
    ).available).toBe(true);
    expect(isOtherTradePreviewAvailable("ConcreteConceptsGroup.com.", true)).toBe(false);
    expect(isOtherTradePreviewAvailable("regional-slab-review.concrete-concepts-group.pages.dev", true)).toBe(true);
    expect(getClientRegionalSlabRouteAccess(
      "/services/concrete-slabs-brisbane",
      "concreteconceptsgroup.com",
      { preview: false, published: false },
    ).access).toBe("legacy");
    const appSource = readFileSync(resolve(ROOT, "client/src/App.tsx"), "utf8");
    expect(appSource).toContain('if (routeAccess.access === "legacy") return <ServicePage />;');
  });

  it("defines exactly the approved review, hub, service, and guide routes", () => {
    expect(REGIONAL_SLAB_REVIEW_PATHS).toEqual(expectedPaths);
    expect(REGIONAL_SLAB_PAGES.map(page => page.path)).toEqual(expectedPaths.slice(1));
  });

  it("keeps checked-in generated publication flags off", () => {
    const edge = readFileSync(resolve(ROOT, "client/public/regional-slab-content.js"), "utf8");
    const client = readFileSync(resolve(ROOT, "client/src/generated/regionalSlabConfig.ts"), "utf8");
    expect(edge).toContain("GENERATED_REGIONAL_SLAB_PREVIEW_ENABLED = false");
    expect(edge).toContain("GENERATED_REGIONAL_SLAB_PUBLISHED_ENABLED = false");
    expect(client).toContain("REGIONAL_SLAB_PREVIEW_ENABLED = false");
    expect(client).toContain("REGIONAL_SLAB_PUBLISHED_ENABLED = false");
  });

  it("uses unique page metadata, headings, and canonical paths", () => {
    for (const key of ["title", "description", "h1"] as const) {
      expect(new Set(REGIONAL_SLAB_PAGES.map(page => page[key])).size, key).toBe(REGIONAL_SLAB_PAGES.length);
    }
    for (const page of REGIONAL_SLAB_PAGES) {
      expect(page.canonical).toBe(`https://concreteconceptsgroup.com${page.path}`);
      expect(page.title.length).toBeGreaterThan(20);
      expect(page.description.length).toBeGreaterThan(70);
      expect(page.faqs.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("serves raw crawlable regional content with required schema only on a non-customer preview", async () => {
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true });
    for (const page of REGIONAL_SLAB_PAGES) {
      const response = await fetchWorker(worker, `https://candidate.pages.dev${page.path}`);
      const html = await response.text();
      expect(response.status, page.path).toBe(200);
      expect(response.headers.get("X-Robots-Tag"), page.path).toBe("noindex, nofollow");
      expect(html, page.path).toContain(`<h1>${page.h1}</h1>`);
      expect(html, page.path).toContain('data-edge-regional-slab-shell="true"');
      expect(html, page.path).toContain("Request a site-specific concrete quote");
      expect(html, page.path).toContain(`rel="canonical" href="${page.canonical}"`);
      expect(html, page.path).toContain('"@type":"Service"');
      expect(html, page.path).toContain('"@type":"FAQPage"');
      expect(html, page.path).toContain('"@type":"BreadcrumbList"');
    }
  });

  it("rejects unpublished routes on customer hosts while preserving the existing Brisbane slab page", async () => {
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true });
    for (const path of newlyUnpublishedPaths) {
      const response = await fetchWorker(worker, `https://concreteconceptsgroup.com${path}`);
      expect(response.status, path).toBe(404);
      expect(response.headers.get("X-Robots-Tag"), path).toBe("noindex, nofollow");
    }
    const legacy = await fetchWorker(worker, "https://concreteconceptsgroup.com/services/concrete-slabs-brisbane");
    expect(legacy.status).toBe(200);
    expect(await legacy.text()).not.toContain('data-edge-regional-slab-shell="true"');
  });

  it("treats an equivalent trailing-dot customer hostname as production", async () => {
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true, otherTradePreview: true });
    for (const path of ["/areas/sunshine-coast", "/need-another-trade", "/api/other-trade-submit"]) {
      const response = await fetchWorker(worker, `https://concreteconceptsgroup.com.${path}`);
      expect(response.status, path).toBe(404);
      expect(response.headers.get("X-Robots-Tag"), path).toBe("noindex, nofollow");
    }
  });

  it("keeps new routes out of the customer sitemap", () => {
    const sitemap = readFileSync(resolve(ROOT, "client/public/sitemap.xml"), "utf8");
    for (const path of newlyUnpublishedPaths) expect(sitemap, path).not.toContain(`<loc>https://concreteconceptsgroup.com${path}</loc>`);
  });

  it.each([
    "/regional-slab-review/extra",
    "/guides/how-house-slab-quotes-work/extra",
    "/services/extension-slabs-brisbane/nope",
    "/areas/ipswich-ripley-house-slabs/nope",
    "/gold-coast/house-slabs/nope",
  ])("returns a true 404 for malformed regional route %s", async path => {
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true });
    const response = await fetchWorker(worker, `https://candidate.pages.dev${path}`);
    expect(response.status).toBe(404);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("keeps all existing Gold Coast preview routes functional in the regional artifact", async () => {
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true });
    for (const path of [
      "/areas/gold-coast", "/gold-coast/driveways", "/gold-coast/exposed-aggregate",
      "/gold-coast/patios-paths-pool-surrounds", "/gold-coast/shed-garage-patio-slabs",
      "/gold-coast/small-retaining-walls",
    ]) expect((await fetchWorker(worker, `https://candidate.pages.dev${path}`)).status, path).toBe(200);
  });

  it.each([
    ["unknown concrete service", (payload: any) => { payload.jobBrief.scope.services = ["plumbing"]; }],
    ["invalid work type", (payload: any) => { payload.jobBrief.scope.workType = "demolition"; }],
    ["invalid measurement mode", (payload: any) => { payload.jobBrief.measurements.mode = "guess"; }],
    ["invalid structural readiness", (payload: any) => { payload.jobBrief.projectContext.plansReadiness = "ready"; }],
    ["oversized builder company", (payload: any) => { payload.jobBrief.projectContext.builderCompanyName = "x".repeat(151); }],
    ["oversized structural scope", (payload: any) => { payload.jobBrief.projectContext.requiredConcreteScope = "x".repeat(1_501); }],
    ["repeated-digit mobile", (payload: any) => { payload.jobBrief.contact.mobile = "0444444444"; }],
    ["sequential dummy mobile", (payload: any) => { payload.jobBrief.contact.mobile = "0412345678"; }],
    ["missing builder project address", (payload: any) => { payload.jobBrief.location.streetAddress = ""; }],
    ["missing builder concrete scope", (payload: any) => { payload.jobBrief.projectContext.requiredConcreteScope = ""; }],
    ["missing builder programme", (payload: any) => { payload.jobBrief.projectContext.indicativeProgramme = ""; }],
    ["stale partner interest on a non-extension quote", (payload: any) => { payload.jobBrief.projectContext.structuralProjectType = "new_house"; payload.jobBrief.projectContext.partnerIntroductionInterest = true; }],
    ["photo without a filename", (payload: any) => { payload.jobBrief.photos = [{ url: "https://example.com/photo.jpg", fileName: "", contentType: "image/jpeg" }]; }],
    ["non-array photo collection", (payload: any) => { payload.jobBrief.photos = { url: "https://example.com/photo.jpg" }; }],
  ])("rejects direct-API schema bypass: %s", async (_label, mutate) => {
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true });
    const payload = validRegionalQuotePayload();
    mutate(payload);
    const response = await fetchWorker(worker, "https://candidate.pages.dev/api/quote-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(response.status).toBe(400);
    expect((await response.json()).success).toBe(false);
  });

  it.each(["0412345678", "0498765432"])("rejects legacy direct-quote dummy mobile %s before delivery", async mobile => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("External delivery must not be reached"); }));
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true });
    const response = await fetchWorker(worker, "https://candidate.pages.dev/api/quote-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionId: "36cc2e5b-45cc-4e9a-8b7f-96897bead812",
        website: "",
        formStartedAt: Date.now() - 5_000,
        name: "Legacy Test",
        phone: mobile,
        email: "legacy@example.com",
        suburb: "Camp Hill 4152",
        service: "Concrete slab",
        details: "A sufficiently detailed preview-only validation request.",
      }),
    });
    expect(response.status).toBe(400);
    expect((await response.json()).success).toBe(false);
  });

  it.each(["0412345678", "0498765432"])("rejects callback dummy mobile %s before delivery", async phone => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("External delivery must not be reached"); }));
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true });
    const response = await fetchWorker(worker, "https://candidate.pages.dev/api/callback-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Callback Test",
        phone,
        suburb: "Camp Hill 4152",
        website: "",
        formStartedAt: Date.now() - 5_000,
      }),
    });
    expect(response.status).toBe(400);
    expect((await response.json()).success).toBe(false);
  });

  it("rejects an oversized quote request before downstream delivery", async () => {
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true });
    const payload = validRegionalQuotePayload();
    payload.jobBrief.scope.description = "x".repeat(70_000);
    const response = await fetchWorker(worker, "https://candidate.pages.dev/api/quote-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(response.status).toBe(413);
    expect((await response.json()).success).toBe(false);
  });

  it.each([
    "/services/not-a-real-service",
    "/guides/not-a-real-guide",
  ])("returns a true 404 for an unknown dynamic route: %s", async path => {
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true });
    const response = await fetchWorker(worker, `https://candidate.pages.dev${path}`);
    expect(response.status).toBe(404);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it.each([
    "/need-another-trade",
    "/api/other-trade-submit",
    "/trade-request/referral/test-reference",
  ])("blocks preview-only other-trade surface on a customer host: %s", async path => {
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true, otherTradePreview: true });
    const response = await fetchWorker(worker, `https://concreteconceptsgroup.com${path}`);
    expect(response.status).toBe(404);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it.each([
    "/sitemap.xml",
    "/assets/app.js",
    "/favicon.ico",
  ])("adds route-independent noindex to every preview response: %s", async path => {
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true });
    const response = await fetchWorker(worker, `https://candidate.pages.dev${path}`);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("adds the security baseline to non-HTML redirects", async () => {
    const worker = await loadWorker({ regionalPreview: true, goldCoastPreview: true });
    const response = await fetchWorker(worker, "https://candidate.pages.dev/areas/SUNSHINE-COAST");
    expect(response.status).toBe(308);
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("Permissions-Policy")).toContain("camera=(self)");
  });
});
