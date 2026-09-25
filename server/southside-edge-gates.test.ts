import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const ROOT = resolve(import.meta.dirname, "..");
const tempDirectories: string[] = [];

function htmlAssetFallback() {
  return {
    fetch: vi.fn(async () => new Response(
      '<!doctype html><html><head><title>Fallback</title><meta name="description" content=""><meta name="robots" content="index, follow"><link rel="canonical" href=""></head><body><div id="root"><div>loading</div></div><script id="app-module" type="module" src="/assets/app.js"></script></body></html>',
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    )),
  };
}

function createCacheMock() {
  const stored = new Map<string, Response>();
  const key = (request: Request) => `${request.method}:${request.url}`;
  return {
    match: vi.fn(async (request: Request) => stored.get(key(request))?.clone()),
    put: vi.fn(async (request: Request, response: Response) => {
      stored.set(key(request), response.clone());
    }),
  };
}

async function loadWorker(options: { southsidePreviewEnabled: boolean }) {
  const directory = mkdtempSync(resolve(tmpdir(), "ccg-southside-worker-"));
  tempDirectories.push(directory);
  const sourceFiles = [
    "_worker.js",
    "seo-manifest.js",
    "locality-content.js",
    "other-trade-config.js",
    "gold-coast-content.js",
    "blog-content.js",
  ];
  for (const filename of sourceFiles) {
    copyFileSync(resolve(ROOT, "client/public", filename), resolve(directory, filename));
  }
  const generatedPath = resolve(directory, "locality-content.js");
  const generated = readFileSync(generatedPath, "utf8").replace(
    /export const GENERATED_SOUTHSIDE_PREVIEW_ENABLED = (?:true|false);/,
    `export const GENERATED_SOUTHSIDE_PREVIEW_ENABLED = ${options.southsidePreviewEnabled};`,
  );
  writeFileSync(generatedPath, generated, "utf8");
  const workerUrl = `${pathToFileURL(resolve(directory, "_worker.js")).href}?southside=${basename(directory)}`;
  const { default: edgeWorker } = await import(workerUrl);
  return edgeWorker;
}

async function fetchHtml(edgeWorker: Awaited<ReturnType<typeof loadWorker>>, url: string) {
  const cache = createCacheMock();
  vi.stubGlobal("caches", { default: cache });
  const ctx = { waitUntil: vi.fn() };
  return edgeWorker.fetch(new Request(url), { ASSETS: htmlAssetFallback() }, ctx);
}

describe("south-side Cloudflare edge gates", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    while (tempDirectories.length) {
      rmSync(tempDirectories.pop()!, { recursive: true, force: true });
    }
  });

  it("keeps Norman Park unavailable and six upgrades on legacy production content by default", async () => {
    const edgeWorker = await loadWorker({ southsidePreviewEnabled: false });

    const normanPark = await fetchHtml(edgeWorker, "https://concreteconceptsgroup.com/areas/norman-park");
    expect(normanPark.status).toBe(404);
    expect(normanPark.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");

    const wynnum = await fetchHtml(edgeWorker, "https://concreteconceptsgroup.com/areas/wynnum");
    expect(wynnum.status).toBe(200);
    const wynnumHtml = await wynnum.text();
    expect(wynnumHtml).not.toContain("Residential Concreting in Wynnum");
    expect(wynnumHtml).not.toContain('data-edge-locality-shell="true"');
  });

  it("renders all staged replacements on a non-customer preview with noindex headers", async () => {
    const edgeWorker = await loadWorker({ southsidePreviewEnabled: true });

    for (const [slug, heading] of [
      ["norman-park", "Residential Concreting in Norman Park"],
      ["wynnum", "Residential Concreting in Wynnum"],
      ["murarrie", "Residential Concrete Planning in Murarrie"],
    ]) {
      const response = await fetchHtml(edgeWorker, `https://southside-preview.example.pages.dev/areas/${slug}`);
      expect(response.status, slug).toBe(200);
      expect(response.headers.get("X-Robots-Tag"), slug).toBe("noindex, nofollow");
      const html = await response.text();
      expect(html, slug).toContain(heading);
      expect(html, slug).toContain('<meta name="robots" content="noindex, nofollow"');
      expect(html, slug).toContain('data-edge-locality-shell="true"');
    }
  });

  it("refuses the preview index and Norman Park on customer hosts even if the preview build is uploaded there", async () => {
    const edgeWorker = await loadWorker({ southsidePreviewEnabled: true });

    const review = await fetchHtml(edgeWorker, "https://concreteconceptsgroup.com/southside-review");
    expect(review.status).toBe(404);
    expect(review.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");

    for (const path of [
      "/areas/norman-park",
      "/areas/Norman-Park",
      "/areas/%6Eorman-park",
      "/areas/norman-park/",
    ]) {
      const normanPark = await fetchHtml(edgeWorker, `https://concreteconceptsgroup.com${path}`);
      expect(normanPark.status, path).toBe(404);
      expect(normanPark.headers.get("X-Robots-Tag"), path).toBe("noindex, nofollow");
    }
  });

  it("redirects noncanonical south-side preview paths to one lowercase URL", async () => {
    const edgeWorker = await loadWorker({ southsidePreviewEnabled: true });

    for (const path of [
      "/areas/Norman-Park",
      "/areas/%6Eorman-park",
      "/areas/norman-park/",
    ]) {
      const response = await fetchHtml(edgeWorker, `https://southside-preview.example.pages.dev${path}`);
      expect(response.status, path).toBe(308);
      expect(response.headers.get("Location"), path).toBe("/areas/norman-park");
      expect(response.headers.get("X-Robots-Tag"), path).toBe("noindex, nofollow");
    }
  });

  it("keeps the staging review route out of the production sitemap", () => {
    const sitemap = readFileSync(resolve(ROOT, "client/public/sitemap.xml"), "utf8");
    expect(sitemap).not.toContain("/southside-review");
    expect(sitemap).not.toContain("/areas/norman-park");
  });
});
