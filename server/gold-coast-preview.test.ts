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
import {
  GOLD_COAST_EXISTING_LOCALITY_SLUGS,
  GOLD_COAST_SERVICE_PAGES,
  GOLD_COAST_UPGRADE_LOCALITIES,
} from "../shared/goldCoastContent";
import { STATIC_PUBLISHED_BLOG_POSTS } from "../client/src/generated/blogContent";

const ROOT = resolve(import.meta.dirname, "..");
const tempDirectories: string[] = [];

function htmlAssetFallback() {
  return {
    fetch: vi.fn(async () => new Response(
      '<!doctype html><html><head><title>Fallback</title><meta name="description" content=""><meta name="robots" content="index, follow"><link rel="canonical" href=""><meta property="og:title" content=""><meta property="og:description" content=""><meta property="og:url" content=""></head><body><div id="root"><div>loading</div></div><script>window.__ccgTest=true;</script><script id="app-module" type="module" src="/assets/app.js"></script></body></html>',
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      },
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

async function loadWorker(options: {
  previewEnabled: boolean;
  publishedEnabled?: boolean;
}) {
  const directory = mkdtempSync(resolve(tmpdir(), "ccg-gold-coast-worker-"));
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
  const generatedPath = resolve(directory, "gold-coast-content.js");
  const generated = readFileSync(generatedPath, "utf8")
    .replace(
      /export const GENERATED_GOLD_COAST_PREVIEW_ENABLED = (?:true|false);/,
      `export const GENERATED_GOLD_COAST_PREVIEW_ENABLED = ${options.previewEnabled};`,
    )
    .replace(
      /export const GENERATED_GOLD_COAST_PUBLISHED_ENABLED = (?:true|false);/,
      `export const GENERATED_GOLD_COAST_PUBLISHED_ENABLED = ${options.publishedEnabled ?? false};`,
    );
  writeFileSync(generatedPath, generated, "utf8");
  const workerUrl = `${pathToFileURL(resolve(directory, "_worker.js")).href}?gold-coast=${basename(directory)}`;
  const { default: edgeWorker } = await import(workerUrl);
  return edgeWorker;
}

async function fetchWorker(
  edgeWorker: Awaited<ReturnType<typeof loadWorker>>,
  url: string,
  init?: RequestInit,
) {
  vi.stubGlobal("caches", { default: createCacheMock() });
  return edgeWorker.fetch(
    new Request(url, init),
    { ASSETS: htmlAssetFallback() },
    { waitUntil: vi.fn() },
  );
}

describe("Gold Coast preview publication gates", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    while (tempDirectories.length) {
      rmSync(tempDirectories.pop()!, { recursive: true, force: true });
    }
  });

  it("keeps the checked-in preview and publication flags off", () => {
    const generated = readFileSync(resolve(ROOT, "client/public/gold-coast-content.js"), "utf8");
    const clientConfig = readFileSync(resolve(ROOT, "client/src/generated/goldCoastConfig.ts"), "utf8");
    expect(generated).toContain("GENERATED_GOLD_COAST_PREVIEW_ENABLED = false");
    expect(generated).toContain("GENERATED_GOLD_COAST_PUBLISHED_ENABLED = false");
    expect(clientConfig).toContain("GOLD_COAST_PREVIEW_ENABLED = false");
    expect(clientConfig).toContain("GOLD_COAST_PUBLISHED_ENABLED = false");
  });

  it("keeps the hub, review index, and five service routes unavailable by default", async () => {
    const worker = await loadWorker({ previewEnabled: false });
    for (const path of [
      "/gold-coast-review",
      "/areas/gold-coast",
      ...GOLD_COAST_SERVICE_PAGES.map(page => `/gold-coast/${page.slug}`),
    ]) {
      const response = await fetchWorker(worker, `https://candidate.pages.dev${path}`);
      expect(response.status, path).toBe(404);
      expect(response.headers.get("X-Robots-Tag"), path).toBe("noindex, nofollow");
    }
  });

  it("serves every approved route only on a non-customer preview with noindex", async () => {
    const worker = await loadWorker({ previewEnabled: true });
    for (const path of [
      "/gold-coast-review",
      "/areas/gold-coast",
      ...GOLD_COAST_SERVICE_PAGES.map(page => `/gold-coast/${page.slug}`),
    ]) {
      const preview = await fetchWorker(worker, `https://candidate.pages.dev${path}`);
      expect(preview.status, path).toBe(200);
      expect(preview.headers.get("X-Robots-Tag"), path).toBe("noindex, nofollow");
      expect(await preview.text(), path).toContain('<meta name="robots" content="noindex, nofollow"');

      const customer = await fetchWorker(worker, `https://concreteconceptsgroup.com${path}`);
      expect(customer.status, path).toBe(404);
      expect(customer.headers.get("X-Robots-Tag"), path).toBe("noindex, nofollow");
    }
  });

  it("keeps all new URLs out of the customer sitemap", () => {
    const sitemap = readFileSync(resolve(ROOT, "client/public/sitemap.xml"), "utf8");
    expect(sitemap).not.toContain("/gold-coast-review");
    expect(sitemap).not.toContain("/areas/gold-coast");
    for (const page of GOLD_COAST_SERVICE_PAGES) {
      expect(sitemap).not.toContain(`/gold-coast/${page.slug}`);
    }
  });

  it("keeps redirect-only legacy blog aliases out of the sitemap", () => {
    const sitemap = readFileSync(resolve(ROOT, "client/public/sitemap.xml"), "utf8");
    for (const slug of [
      "concrete-shed-slabs-brisbane-guide",
      "concrete-vs-pavers-brisbane-driveways",
      "how-long-concrete-cure-brisbane-weather",
      "prepare-property-concreting-job-brisbane-checklist",
      "retaining-wall-guide-brisbane-types-costs-council",
    ]) {
      expect(sitemap).not.toContain(`/blog/${slug}</loc>`);
    }
  });

  it("keeps every sitemap blog URL aligned to one canonical published snapshot record", () => {
    const sitemap = readFileSync(resolve(ROOT, "client/public/sitemap.xml"), "utf8");
    const sitemapSlugs = [...sitemap.matchAll(/<loc>https:\/\/concreteconceptsgroup\.com\/blog\/([a-z0-9-]+)<\/loc>/g)]
      .map(match => match[1])
      .sort();
    const snapshotSlugs = STATIC_PUBLISHED_BLOG_POSTS.map(post => post.slug).sort();
    expect(sitemapSlugs).toEqual(snapshotSlugs);
  });

  it("defines the real route-wide Pages security fallback alongside Worker enforcement", () => {
    const headers = readFileSync(resolve(ROOT, "client/public/_headers"), "utf8");
    expect(headers).toMatch(/^\/\*$/m);
    expect(headers).toContain("Content-Security-Policy-Report-Only:");
    expect(headers).toContain("X-Frame-Options: DENY");
  });

  it("removes page-level noindex only when the future publication flag is enabled", () => {
    for (const filename of ["GoldCoastHubPage.tsx", "GoldCoastServicePage.tsx"]) {
      const source = readFileSync(resolve(ROOT, "client/src/pages", filename), "utf8");
      expect(source, filename).toContain("noindex={!GOLD_COAST_PUBLISHED_ENABLED}");
    }
  });

  it("keeps the static blog fallback behind the preview flag in the client", () => {
    for (const filename of ["Blog.tsx", "BlogPost.tsx"]) {
      const source = readFileSync(resolve(ROOT, "client/src/pages", filename), "utf8");
      expect(source, filename).toContain("isGoldCoastBlogSnapshotEnabled");
      expect(source, filename).toContain("enabled: !staticBlogEnabled");
    }
  });
});

describe("Gold Coast preview content and crawlable edge output", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    while (tempDirectories.length) {
      rmSync(tempDirectories.pop()!, { recursive: true, force: true });
    }
  });

  it("clusters all eight existing Gold Coast localities and defines four typed upgrades", () => {
    expect(GOLD_COAST_EXISTING_LOCALITY_SLUGS).toEqual(expect.arrayContaining([
      "coomera",
      "nerang",
      "ormeau",
      "robina",
      "clear-island-waters",
      "mermaid-waters",
      "pimpama",
      "upper-coomera",
    ]));
    expect(GOLD_COAST_EXISTING_LOCALITY_SLUGS).toHaveLength(8);
    expect(GOLD_COAST_UPGRADE_LOCALITIES.map(record => record.slug).sort()).toEqual([
      "coomera",
      "nerang",
      "ormeau",
      "robina",
    ]);
    for (const record of GOLD_COAST_UPGRADE_LOCALITIES) {
      expect(record.intro).not.toMatch(/trusted local|years of local|projects? completed|testimonial/i);
      expect(record.practicalConsiderations.length).toBeGreaterThan(140);
    }
  });

  it("renders raw H1, body, canonical, CTA, and structured data for the hub and five services", async () => {
    const worker = await loadWorker({ previewEnabled: true });
    for (const [path, h1] of [
      ["/areas/gold-coast", "North + Central Gold Coast concrete project review"],
      ...GOLD_COAST_SERVICE_PAGES.map(page => [`/gold-coast/${page.slug}`, page.h1]),
    ] as const) {
      const response = await fetchWorker(worker, `https://candidate.pages.dev${path}`);
      const html = await response.text();
      expect(response.status, path).toBe(200);
      expect(html, path).toContain(`<h1>${h1}</h1>`);
      expect(html, path).toContain("Start a detailed quote");
      expect(html, path).toContain(`rel="canonical" href="https://concreteconceptsgroup.com${path}"`);
      expect(html, path).toContain('type="application/ld+json"');
      expect(html, path).toContain('data-edge-gold-coast-shell="true"');
    }
  });

  it("uses typed crawlable content for four preview upgrades while preserving customer legacy pages", async () => {
    const worker = await loadWorker({ previewEnabled: true });
    for (const record of GOLD_COAST_UPGRADE_LOCALITIES) {
      const preview = await fetchWorker(worker, `https://candidate.pages.dev/areas/${record.slug}`);
      const html = await preview.text();
      expect(preview.status, record.slug).toBe(200);
      expect(html, record.slug).toContain(`<h1>${record.h1}</h1>`);
      expect(html, record.slug).toContain('data-edge-locality-shell="true"');
      expect(html, record.slug).toContain("Start a detailed quote");
      expect(html, record.slug).toContain('type="application/ld+json"');

      const customer = await fetchWorker(worker, `https://concreteconceptsgroup.com/areas/${record.slug}`);
      expect(customer.status, record.slug).toBe(200);
      expect(await customer.text(), record.slug).not.toContain(`<h1>${record.h1}</h1>`);
    }
  });

  it("preserves asset security headers on noindex preview responses", async () => {
    const worker = await loadWorker({ previewEnabled: true });
    const response = await fetchWorker(worker, "https://candidate.pages.dev/areas/gold-coast");
    expect(response.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(response.headers.get("Content-Security-Policy")).toContain("script-src");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });
});

describe("Pages Worker technical SEO status behavior", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    while (tempDirectories.length) {
      rmSync(tempDirectories.pop()!, { recursive: true, force: true });
    }
  });

  it("returns true 404 responses for unknown area and blog slugs", async () => {
    const worker = await loadWorker({ previewEnabled: true });
    for (const path of ["/areas/molendinar", "/blog/not-a-published-article"]) {
      const response = await fetchWorker(worker, `https://candidate.pages.dev${path}`);
      expect(response.status, path).toBe(404);
      expect(response.headers.get("X-Robots-Tag"), path).toBe("noindex, nofollow");
    }
  });

  it("renders an authoritative published blog article in raw HTML and the static tRPC fallback", async () => {
    const worker = await loadWorker({ previewEnabled: true });
    const slug = "best-concrete-finishes-brisbane-driveways";
    const page = await fetchWorker(worker, `https://candidate.pages.dev/blog/${slug}`);
    const html = await page.text();
    expect(page.status).toBe(200);
    expect(html).toContain("Best Concrete Finishes");
    expect(html).not.toContain("Article Not Found");
    expect(html).toContain('data-edge-blog-shell="true"');
    expect(html).toContain(`rel="canonical" href="https://concreteconceptsgroup.com/blog/${slug}"`);

    const input = encodeURIComponent(JSON.stringify({ json: { slug } }));
    const trpc = await fetchWorker(worker, `https://candidate.pages.dev/api/trpc/blog.getBySlug?input=${input}`);
    expect(trpc.status).toBe(200);
    const payload = await trpc.json() as { result: { data: { json: { slug: string; content: string } } } };
    expect(payload.result.data.json.slug).toBe(slug);
    expect(payload.result.data.json.content.length).toBeGreaterThan(500);
  });

  it("renders every canonical sitemap blog URL as an authoritative preview document", async () => {
    const worker = await loadWorker({ previewEnabled: true });
    for (const post of STATIC_PUBLISHED_BLOG_POSTS) {
      const path = `/blog/${post.slug}`;
      const response = await fetchWorker(worker, `https://candidate.pages.dev${path}`);
      const html = await response.text();
      expect(response.status, path).toBe(200);
      expect(html, path).toContain('data-edge-blog-shell="true"');
      expect(html, path).toContain(`rel="canonical" href="https://concreteconceptsgroup.com${path}"`);
    }
  });

  it("canonicalizes the preview hub and service URL variants without creating invalid routes", async () => {
    const worker = await loadWorker({ previewEnabled: true });
    const publishedWorker = await loadWorker({ previewEnabled: false, publishedEnabled: true });
    for (const [source, expected] of [
      ["/areas/gold-coast/", "/areas/gold-coast"],
      ["/AREAS/GOLD-COAST", "/areas/gold-coast"],
      ["/gold-coast/driveways/", "/gold-coast/driveways"],
      ["/GOLD-COAST/DRIVEWAYS", "/gold-coast/driveways"],
      ["/gold-coast/%64riveways", "/gold-coast/driveways"],
    ]) {
      const response = await fetchWorker(worker, `https://preview.example.com${source}`);
      expect(response.status, source).toBe(308);
      expect(response.headers.get("Location"), source).toBe(expected);

      const customerResponse = await fetchWorker(
        publishedWorker,
        `https://concreteconceptsgroup.com${source}`,
      );
      expect(customerResponse.status, `customer ${source}`).toBe(308);
      expect(customerResponse.headers.get("Location"), `customer ${source}`).toBe(expected);
    }
  });

  it.each([
    "/blog/not-a-published-article/extra",
    "/blog/%2Fbad",
    "/blog//bad",
    "/areas/molendinar/extra",
    "/areas/gold-coast/nope",
    "/areas/%2Fbad",
    "/areas//bad",
  ])("returns a true 404 for malformed nested route %s", async path => {
    const worker = await loadWorker({ previewEnabled: true });
    const response = await fetchWorker(worker, `https://preview.example.com${path}`);
    expect(response.status).toBe(404);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("escapes hostile route metadata and applies a hash-based CSP itself", async () => {
    const worker = await loadWorker({ previewEnabled: true });
    const response = await fetchWorker(
      worker,
      "https://preview.example.com/x%3C%2Ftitle%3E%3Cscript%3Ealert%281%29%3C%2Fscript%3E",
    );
    const html = await response.text();
    const csp = response.headers.get("Content-Security-Policy") || "";

    expect(response.status).toBe(200);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("</title><script>");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src");
    expect(csp).toMatch(/'sha256-[A-Za-z0-9+/=]+'/);
    expect(csp.match(/script-src[^;]*/)?.[0]).not.toContain("'unsafe-inline'");
    expect(csp.match(/script-src[^;]*/)?.[0]).toContain("https://manus-analytics.com");
  });

  it("does not replace customer-host blog routing with the preview snapshot", async () => {
    const worker = await loadWorker({ previewEnabled: true });
    const page = await fetchWorker(
      worker,
      "https://concreteconceptsgroup.com/blog/best-concrete-finishes-brisbane-driveways",
    );
    const html = await page.text();
    expect(page.status).toBe(200);
    expect(html).not.toContain('data-edge-blog-shell="true"');

    const input = encodeURIComponent(JSON.stringify({ json: { slug: "best-concrete-finishes-brisbane-driveways" } }));
    const trpc = await fetchWorker(
      worker,
      `https://concreteconceptsgroup.com/api/trpc/blog.getBySlug?input=${input}`,
    );
    expect(trpc.status).toBe(200);
    const body = await trpc.text();
    expect(trpc.headers.get("Content-Type")).toContain("text/html");
    expect(body).not.toContain('"result":{"data"');
  });

  it("keeps legacy blog redirects and true missing-blog 404s active in the default build", async () => {
    const worker = await loadWorker({ previewEnabled: false });
    const redirect = await fetchWorker(
      worker,
      "https://concreteconceptsgroup.com/blog/concrete-vs-pavers-brisbane-driveways",
    );
    expect(redirect.status).toBe(301);
    expect(redirect.headers.get("Location")).toBe("/blog/concrete-vs-pavers-brisbane-driveway");

    const missing = await fetchWorker(
      worker,
      "https://concreteconceptsgroup.com/blog/not-a-published-article",
    );
    expect(missing.status).toBe(404);
    expect(missing.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });
});
