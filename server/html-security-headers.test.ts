import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ROOT = resolve(import.meta.dirname, "..");
let tempDirectory = "";

function createCacheMock() {
  return {
    match: vi.fn(async () => undefined),
    put: vi.fn(async () => undefined),
  };
}

async function loadWorker() {
  tempDirectory = mkdtempSync(resolve(tmpdir(), "ccg-readiness-worker-"));
  for (const filename of [
    "_worker.js",
    "seo-manifest.js",
    "locality-content.js",
    "other-trade-config.js",
  ]) {
    copyFileSync(
      resolve(ROOT, "client/public", filename),
      resolve(tempDirectory, filename),
    );
  }
  const workerUrl = `${pathToFileURL(resolve(tempDirectory, "_worker.js")).href}?readiness=${basename(tempDirectory)}`;
  const { default: worker } = await import(workerUrl);
  return worker;
}

function htmlAssets(status = 200) {
  return {
    fetch: vi.fn(async () => new Response(
      '<!doctype html><html><head><title>Fallback</title><meta name="description" content=""><meta name="robots" content="index, follow"><link rel="canonical" href=""></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>',
      { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
    )),
  };
}

async function fetchWithWorker(
  worker: Awaited<ReturnType<typeof loadWorker>>,
  url: string,
  method = "GET",
  assets = htmlAssets(),
) {
  const ctx = { waitUntil: vi.fn() };
  return worker.fetch(new Request(url, { method }), { ASSETS: assets }, ctx);
}

function expectHtmlSecurityHeaders(response: Response) {
  expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  expect(response.headers.get("Permissions-Policy")).toBe("camera=(self), microphone=(), geolocation=()");
  expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
  expect(response.headers.get("Content-Security-Policy")).toBeNull();
  expect(response.headers.get("Content-Security-Policy-Report-Only")).toContain("default-src 'self'");
}

describe("Cloudflare HTML security headers", () => {
  beforeEach(() => {
    vi.stubGlobal("caches", { default: createCacheMock() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (tempDirectory) rmSync(tempDirectory, { recursive: true, force: true });
    tempDirectory = "";
  });

  it("applies the baseline to customer HTML GET and HEAD responses", async () => {
    const worker = await loadWorker();

    for (const method of ["GET", "HEAD"]) {
      const response = await fetchWithWorker(
        worker,
        "https://concreteconceptsgroup.com/get-quote",
        method,
      );
      expect(response.status).toBe(200);
      expectHtmlSecurityHeaders(response);
    }
  });

  it("keeps preview HTML noindex while applying the same header baseline", async () => {
    const worker = await loadWorker();
    const response = await fetchWithWorker(
      worker,
      "https://conversion-readiness.example.pages.dev/get-quote",
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expectHtmlSecurityHeaders(response);
  });

  it("applies the baseline to generated HTML 404 responses", async () => {
    const worker = await loadWorker();
    const response = await fetchWithWorker(
      worker,
      "https://concreteconceptsgroup.com/areas/norman-park",
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expectHtmlSecurityHeaders(response);
  });

  it.each([404, 500])("applies the baseline to asset-backed HTML status %s", async (status) => {
    const worker = await loadWorker();
    const response = await fetchWithWorker(
      worker,
      "https://concreteconceptsgroup.com/missing-page",
      "GET",
      htmlAssets(status),
    );

    expect(response.status).toBe(status);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expectHtmlSecurityHeaders(response);
  });

  it("declares each singleton security header once for additive Pages rules", () => {
    const headersFile = readFileSync(resolve(ROOT, "client/public/_headers"), "utf8");
    const securityHeaders = [
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Strict-Transport-Security",
      "Content-Security-Policy-Report-Only",
    ];

    for (const name of securityHeaders) {
      expect(headersFile.match(new RegExp(`^\\s+${name}:`, "gm")) ?? []).toHaveLength(1);
    }
  });
});
