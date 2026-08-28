import type { Express } from "express";
import { ENV } from "./env";

const PERFORMANCE_ASSET_KEYS = new Set([
  "hero-poster-mobile-480x854_e42a361f.webp",
  "hero-poster-mobile-960x1708_af6574b1.webp",
  "project-troweling-480_f279bc87.webp",
  "project-troweling-800_ad1d3719.webp",
  "new-gallery-4-480_f54f9734.webp",
  "new-gallery-4-800_de16f626.webp",
  "ccg-full-hero-480_4996102e.webp",
]);
const MAX_STORAGE_CACHE_ENTRIES = PERFORMANCE_ASSET_KEYS.size;
const assetCache = new Map<string, { body: Buffer; contentType: string; etag?: string }>();

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = String((req.params as Record<string, string | undefined>)[0] || "");
    if (!key || !/^[A-Za-z0-9._-]+$/.test(key) || !PERFORMANCE_ASSET_KEYS.has(key)) {
      res.status(400).send("Invalid storage key");
      return;
    }
    const cached = assetCache.get(key);
    if (cached) {
      res.set("Content-Type", cached.contentType);
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.set("X-Content-Type-Options", "nosniff");
      if (cached.etag) res.set("ETag", cached.etag);
      res.status(200).send(cached.body);
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResponse = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });
      if (!forgeResponse.ok) {
        res.status(502).send("Storage backend error");
        return;
      }

      const payload = (await forgeResponse.json()) as { url?: string };
      if (!payload.url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      const upstreamResponse = await fetch(payload.url);
      if (!upstreamResponse.ok) {
        res.status(502).send("Storage object unavailable");
        return;
      }
      const contentType = upstreamResponse.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        res.status(415).send("Unsupported storage object");
        return;
      }
      const body = Buffer.from(await upstreamResponse.arrayBuffer());
      const etag = upstreamResponse.headers.get("etag") || undefined;
      if (assetCache.size >= MAX_STORAGE_CACHE_ENTRIES) {
        const oldestKey = assetCache.keys().next().value;
        if (oldestKey) assetCache.delete(oldestKey);
      }
      assetCache.set(key, { body, contentType, etag });

      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.set("X-Content-Type-Options", "nosniff");
      if (etag) res.set("ETag", etag);
      res.status(200).send(body);
    } catch (error) {
      console.error("[StorageProxy] failed:", error);
      res.status(502).send("Storage proxy error");
    }
  });
}
