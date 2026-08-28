import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("stable CDN asset delivery contract", () => {
  const worker = read("client/public/_worker.js");
  const serverIndex = read("server/_core/index.ts");
  const storageProxyPath = resolve(root, "server/_core/storageProxy.ts");

  it("removes the unavailable Cloudflare Worker storage proxy", () => {
    expect(worker).not.toContain("handleStorageProxy");
    expect(worker).not.toContain("/manus-storage/");
    expect(worker).not.toContain("PERFORMANCE_ASSET_KEYS");
  });

  it("removes the development storage proxy and its registration", () => {
    expect(serverIndex).not.toContain("registerStorageProxy");
    expect(serverIndex).not.toContain('from "./storageProxy"');
    expect(existsSync(storageProxyPath)).toBe(false);
  });
});
