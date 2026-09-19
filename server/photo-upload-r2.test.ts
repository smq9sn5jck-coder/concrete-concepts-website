import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const JPEG_BYTES = Uint8Array.from([
  0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08,
  0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07,
  0xff, 0xd9,
]);

const PNG_BYTES = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x00,
]);

function toBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

async function loadWorker(testName: string) {
  const workerUrl = `${pathToFileURL(resolve(__dirname, "../client/public/_worker.js")).href}?photo-r2=${testName}-${Date.now()}-${Math.random()}`;
  const { default: edgeWorker } = await import(workerUrl);
  return edgeWorker;
}

type StoredObject = {
  bytes: Uint8Array;
  httpMetadata: { contentType?: string };
  customMetadata: Record<string, string>;
};

function createR2Mock(options: { rejectPut?: boolean } = {}) {
  const objects = new Map<string, StoredObject>();
  const put = vi.fn(async (
    key: string,
    value: Uint8Array | ArrayBuffer,
    metadata: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    },
  ) => {
    if (options.rejectPut) throw new Error("forced R2 failure");
    const bytes = value instanceof Uint8Array
      ? new Uint8Array(value)
      : new Uint8Array(value);
    objects.set(key, {
      bytes,
      httpMetadata: metadata.httpMetadata ?? {},
      customMetadata: metadata.customMetadata ?? {},
    });
    return { key };
  });
  const get = vi.fn(async (key: string) => {
    const stored = objects.get(key);
    if (!stored) return null;
    return {
      key,
      body: stored.bytes,
      size: stored.bytes.byteLength,
      customMetadata: stored.customMetadata,
      httpMetadata: stored.httpMetadata,
      httpEtag: '"test-etag"',
      writeHttpMetadata(headers: Headers) {
        if (stored.httpMetadata.contentType) {
          headers.set("Content-Type", stored.httpMetadata.contentType);
        }
      },
    };
  });
  const deleteObject = vi.fn(async (key: string) => {
    objects.delete(key);
  });

  return {
    bucket: { put, get, delete: deleteObject },
    put,
    get,
    deleteObject,
    objects,
  };
}

function uploadRequest(
  body: Record<string, unknown>,
  ip = `203.0.113.${Math.floor(Math.random() * 150) + 1}`,
) {
  return new Request("https://concreteconceptsgroup.com/api/upload-photo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CF-Connecting-IP": ip,
    },
    body: JSON.stringify(body),
  });
}

function validJpegBody(overrides: Record<string, unknown> = {}) {
  return {
    data: toBase64(JPEG_BYTES),
    contentType: "image/jpeg",
    fileName: "job-site.jpg",
    purpose: "quote",
    ...overrides,
  };
}

function assetFallback() {
  return {
    fetch: vi.fn(async () => new Response("asset fallback", { status: 418 })),
  };
}

describe("Cloudflare private R2 photo upload", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores a valid image in R2 and returns a protected URL without exposing the token in metadata", async () => {
    const r2 = createR2Mock();
    const edgeWorker = await loadWorker("valid-upload");

    const response = await edgeWorker.fetch(uploadRequest(validJpegBody(), "203.0.113.201"), {
      LEAD_PHOTOS: r2.bucket,
      ASSETS: assetFallback(),
    }, { waitUntil: vi.fn() });

    expect(response.status).toBe(200);
    const result = await response.json() as {
      url: string;
      fileName: string;
      contentType: string;
    };
    expect(result.fileName).toBe("job-site.jpg");
    expect(result.contentType).toBe("image/jpeg");

    const protectedUrl = new URL(result.url);
    expect(protectedUrl.origin).toBe("https://concreteconceptsgroup.com");
    expect(protectedUrl.pathname).toMatch(
      /^\/api\/lead-photo\/quote-photos\/[0-9a-f-]{36}\.jpg$/,
    );
    expect(protectedUrl.searchParams.get("token")).toMatch(/^[0-9a-f]{64}$/);

    expect(r2.put).toHaveBeenCalledOnce();
    const [key, storedBytes, metadata] = r2.put.mock.calls[0];
    expect(key).toMatch(/^quote-photos\/[0-9a-f-]{36}\.jpg$/);
    expect(Array.from(storedBytes as Uint8Array)).toEqual(Array.from(JPEG_BYTES));
    expect(metadata).toMatchObject({
      httpMetadata: { contentType: "image/jpeg" },
      customMetadata: {
        purpose: "quote",
      },
    });
    expect(metadata.customMetadata.accessTokenSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(metadata.customMetadata.accessTokenSha256).not.toBe(
      protectedUrl.searchParams.get("token"),
    );
    expect(JSON.stringify(metadata)).not.toContain("job-site.jpg");
  });

  it("stores the exact other-trade purpose under its isolated private prefix", async () => {
    const r2 = createR2Mock();
    const workerUrl = `${pathToFileURL(resolve(__dirname, "../client/public/_worker.js")).href}?photo-r2=other-trade-upload-${Date.now()}-${Math.random()}`;
    const module = await import(workerUrl);
    expect(module.handlePhotoUpload).toBeTypeOf("function");
    const result = await module.handlePhotoUpload(
      { LEAD_PHOTOS: r2.bucket },
      validJpegBody({ purpose: "other-trade" }),
      "https://preview.example.test",
      true,
    ) as { url: string };
    expect(new URL(result.url).pathname).toMatch(/^\/api\/lead-photo\/other-trade\/[0-9a-f-]{36}\.jpg$/);
    const [key, , metadata] = r2.put.mock.calls[0];
    expect(key).toMatch(/^other-trade\/[0-9a-f-]{36}\.jpg$/);
    expect(metadata.customMetadata.purpose).toBe("other-trade");
  });

  it("rejects the other-trade upload purpose at the public endpoint while the production flag is off", async () => {
    const r2 = createR2Mock();
    const edgeWorker = await loadWorker("other-trade-default-off");
    const response = await edgeWorker.fetch(
      uploadRequest(validJpegBody({ purpose: "other-trade" }), "203.0.113.213"),
      { LEAD_PHOTOS: r2.bucket, ASSETS: assetFallback() },
      { waitUntil: vi.fn() },
    );
    expect(response.status).toBe(404);
    expect(r2.put).not.toHaveBeenCalled();
  });

  it("does not treat unknown upload purposes as other-trade", async () => {
    const r2 = createR2Mock();
    const edgeWorker = await loadWorker("unknown-purpose");
    const response = await edgeWorker.fetch(
      uploadRequest(validJpegBody({ purpose: "provider" }), "203.0.113.212"),
      { LEAD_PHOTOS: r2.bucket, ASSETS: assetFallback() },
      { waitUntil: vi.fn() },
    );
    expect(response.status).toBe(400);
    expect(r2.put).not.toHaveBeenCalled();
  });

  it("serves the private image only with the matching token and secure no-store headers", async () => {
    const r2 = createR2Mock();
    const edgeWorker = await loadWorker("protected-read");
    const env = { LEAD_PHOTOS: r2.bucket, ASSETS: assetFallback() };

    const uploadResponse = await edgeWorker.fetch(
      uploadRequest(validJpegBody(), "203.0.113.202"),
      env,
      { waitUntil: vi.fn() },
    );
    const { url } = await uploadResponse.json() as { url: string };

    const readResponse = await edgeWorker.fetch(
      new Request(url, { method: "GET" }),
      env,
      { waitUntil: vi.fn() },
    );
    expect(readResponse.status).toBe(200);
    expect(readResponse.headers.get("Content-Type")).toBe("image/jpeg");
    expect(readResponse.headers.get("Cache-Control")).toBe("private, no-store");
    expect(readResponse.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(readResponse.headers.get("Content-Security-Policy")).toContain("default-src 'none'");
    expect(new Uint8Array(await readResponse.arrayBuffer())).toEqual(JPEG_BYTES);

    const headResponse = await edgeWorker.fetch(
      new Request(url, { method: "HEAD" }),
      env,
      { waitUntil: vi.fn() },
    );
    expect(headResponse.status).toBe(200);
    expect(await headResponse.text()).toBe("");

    const wrongToken = new URL(url);
    wrongToken.searchParams.set("token", "0".repeat(64));
    const forbidden = await edgeWorker.fetch(
      new Request(wrongToken, { method: "GET" }),
      env,
      { waitUntil: vi.fn() },
    );
    expect(forbidden.status).toBe(403);

    const missing = new URL(url);
    missing.pathname = missing.pathname.replace(/[0-9a-f-]{36}/, crypto.randomUUID());
    const notFound = await edgeWorker.fetch(
      new Request(missing, { method: "GET" }),
      env,
      { waitUntil: vi.fn() },
    );
    expect(notFound.status).toBe(404);
    expect(env.ASSETS.fetch).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "invalid base64",
      body: validJpegBody({ data: "%%%not-base64%%%" }),
    },
    {
      name: "empty content",
      body: validJpegBody({ data: "" }),
    },
    {
      name: "unsupported MIME type",
      body: validJpegBody({ contentType: "image/gif" }),
    },
    {
      name: "MIME and signature mismatch",
      body: validJpegBody({ data: toBase64(PNG_BYTES) }),
    },
    {
      name: "missing filename",
      body: validJpegBody({ fileName: "" }),
    },
    {
      name: "oversized encoded request",
      body: validJpegBody({ data: "A".repeat(14 * 1024 * 1024 + 1) }),
    },
  ])("rejects $name before writing to storage", async ({ name, body }) => {
    const r2 = createR2Mock();
    const edgeWorker = await loadWorker(`invalid-${name.replaceAll(" ", "-")}`);

    const response = await edgeWorker.fetch(uploadRequest(body), {
      LEAD_PHOTOS: r2.bucket,
      ASSETS: assetFallback(),
    }, { waitUntil: vi.fn() });

    expect(response.status).toBe(400);
    expect(r2.put).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ error: expect.any(String) });
  });

  it.each([
    { name: "missing binding", env: {} },
    { name: "rejected R2 write", env: { LEAD_PHOTOS: createR2Mock({ rejectPut: true }).bucket } },
  ])("returns a retryable service error for a $name", async ({ name, env }) => {
    const edgeWorker = await loadWorker(`storage-${name.replaceAll(" ", "-")}`);
    const response = await edgeWorker.fetch(
      uploadRequest(validJpegBody()),
      { ...env, ASSETS: assetFallback() },
      { waitUntil: vi.fn() },
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/upload|storage|temporarily/i),
    });
  });

  it("allows normal multi-photo use but rate-limits an obvious upload burst", async () => {
    const r2 = createR2Mock();
    const edgeWorker = await loadWorker("rate-limit");
    const env = { LEAD_PHOTOS: r2.bucket, ASSETS: assetFallback() };
    const ip = "203.0.113.250";

    for (let index = 0; index < 24; index += 1) {
      const response = await edgeWorker.fetch(
        uploadRequest(validJpegBody({ fileName: `site-${index}.jpg` }), ip),
        env,
        { waitUntil: vi.fn() },
      );
      expect(response.status).toBe(200);
    }

    const limited = await edgeWorker.fetch(
      uploadRequest(validJpegBody({ fileName: "site-25.jpg" }), ip),
      env,
      { waitUntil: vi.fn() },
    );
    expect(limited.status).toBe(429);
    expect(r2.put).toHaveBeenCalledTimes(24);
  });
});
