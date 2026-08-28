import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const manifestPath = resolve(
  __dirname,
  "../client/src/config/performance-assets.json"
);

type Asset = {
  url: string;
  width: number;
  height: number;
  bytes: number;
};

type Manifest = {
  mobileHero: { standard: Asset; highDensity: Asset };
  services: Record<string, { standard: Asset; highDensity: Asset }>;
  logo: { standard: Asset };
};

describe("mobile performance asset budgets", () => {
  it("provides a committed asset manifest", () => {
    expect(existsSync(manifestPath)).toBe(true);
  });

  it("keeps every approved asset within its transfer budget", () => {
    if (!existsSync(manifestPath)) return;
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;

    expect(manifest.mobileHero.standard.bytes).toBeLessThan(60_000);
    expect(manifest.mobileHero.highDensity.bytes).toBeLessThan(125_000);
    expect(manifest.logo.standard.bytes).toBeLessThan(40_000);

    for (const variants of Object.values(manifest.services)) {
      expect(variants.standard.bytes).toBeLessThan(100_000);
      expect(variants.highDensity.bytes).toBeLessThan(220_000);
    }
  });

  it("uses web-hosted non-MOV assets with explicit intrinsic dimensions", () => {
    if (!existsSync(manifestPath)) return;
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
    const assets = [
      manifest.mobileHero.standard,
      manifest.mobileHero.highDensity,
      manifest.logo.standard,
      ...Object.values(manifest.services).flatMap((variants) => [
        variants.standard,
        variants.highDensity,
      ]),
    ];

    for (const asset of assets) {
      expect(asset.url).toMatch(/^\/manus-storage\//);
      expect(asset.url).not.toMatch(/\.mov(?:\?|$)/i);
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
      expect(asset.bytes).toBeGreaterThan(0);
    }
  });
});
