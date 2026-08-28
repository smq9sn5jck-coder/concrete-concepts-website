import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const worker = readFileSync(
  resolve(__dirname, "../client/public/_worker.js"),
  "utf8"
);
const expressProxy = readFileSync(
  resolve(__dirname, "./_core/storageProxy.ts"),
  "utf8"
);

describe("Cloudflare responsive-media storage proxy", () => {
  it("handles immutable uploaded assets before the SPA fallback", () => {
    const route = worker.indexOf('path.startsWith("/manus-storage/")');
    const staticFallback = worker.indexOf("env.ASSETS.fetch(request)");

    expect(route).toBeGreaterThan(-1);
    expect(staticFallback).toBeGreaterThan(route);
    expect(worker).toContain("handleStorageProxy");
  });

  it("validates storage keys and uses the existing Forge presign endpoint", () => {
    expect(worker).toContain("Invalid storage key");
    expect(worker).toContain("PERFORMANCE_ASSET_KEYS.has(key)");
    expect(worker).toContain('new URL("v1/storage/presign/get"');
    expect(worker).toContain("env.BUILT_IN_FORGE_API_KEY");
    expect(worker).toContain("Authorization: `Bearer ${apiKey}`");
  });

  it("streams only successful image responses with long-lived immutable caching", () => {
    expect(worker).toContain('upstreamType.startsWith("image/")');
    expect(worker).toContain('Cache-Control", "public, max-age=31536000, immutable"');
    expect(worker).toContain('X-Content-Type-Options", "nosniff"');
  });

  it("keeps the Express proxy restricted and bounded for repeat local checks", () => {
    expect(expressProxy).toContain("PERFORMANCE_ASSET_KEYS.has(key)");
    expect(expressProxy).toContain("MAX_STORAGE_CACHE_ENTRIES");
    expect(expressProxy).toContain("assetCache.set(key");
    expect(expressProxy).toContain('res.set("Content-Type"');
  });
});
