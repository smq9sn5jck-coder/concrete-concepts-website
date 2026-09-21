import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

type Asset = {
  url: string;
  width: number;
  height: number;
  bytes: number;
};

type LogoVariants = {
  standard: Asset;
  highDensity: Asset;
};

type PerformanceManifest = {
  logos: {
    hero: LogoVariants;
    navbar: LogoVariants;
  };
};

describe("focused conversion-readiness preview", () => {
  const hero = read("client/src/components/HeroSection.tsx");
  const navbar = read("client/src/components/Navbar.tsx");
  const wizard = read("client/src/components/quote/ComprehensiveQuoteWizard.tsx");
  const index = read("client/index.html");
  const headers = read("client/public/_headers");
  const manifest = JSON.parse(
    read("client/src/config/performance-assets.json"),
  ) as PerformanceManifest;

  it("serves approved responsive logo variants within strict transfer budgets", () => {
    expect(manifest.logos).toBeDefined();

    for (const variants of Object.values(manifest.logos)) {
      expect(variants.standard.url).toMatch(
        /^https:\/\/res\.cloudinary\.com\/d92cmzyo\/image\/upload\/v\d+\/ccg-conversion-readiness-2026-09-21\/[A-Za-z0-9._/-]+\.webp$/,
      );
      expect(variants.highDensity.url).toMatch(
        /^https:\/\/res\.cloudinary\.com\/d92cmzyo\/image\/upload\/v\d+\/ccg-conversion-readiness-2026-09-21\/[A-Za-z0-9._/-]+\.webp$/,
      );
      expect(variants.standard.bytes).toBeLessThan(45_000);
      expect(variants.highDensity.bytes).toBeLessThan(90_000);
      expect(variants.standard.width).toBeGreaterThan(0);
      expect(variants.standard.height).toBeGreaterThan(0);
      expect(variants.highDensity.width).toBeGreaterThan(variants.standard.width);
    }
  });

  it("uses responsive logos while preserving the original mobile poster and desktop video", () => {
    expect(hero).toContain("performanceAssets.logos.hero.standard.url");
    expect(hero).toContain("HERO_VIDEO_WEBM");
    expect(hero).toContain("HERO_VIDEO_MP4");
    expect(hero).toContain("MOBILE_HERO_POSTER");
    expect(hero).toContain('loading="eager"');
    expect(hero).toContain('fetchPriority="high"');

    expect(navbar).toContain("performanceAssets.logos.hero");
    expect(navbar).toContain("performanceAssets.logos.navbar");
    expect(navbar).toContain("srcSet");

    expect(index).toContain(manifest.logos.hero.standard.url);
    expect(index).not.toContain(
      '<link rel="preload" as="image" href="https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-hero_a3bbd489.png"',
    );
  });

  it("gives every quote progress control an accessible name and state", () => {
    expect(wizard).toContain("stepAccessibleLabel");
    expect(wizard).toContain("aria-label={stepAccessibleLabel(number, title, active, complete)}");
    expect(wizard).toContain('aria-current={active ? "step" : undefined}');
    expect(wizard).toContain("disabled={!active && !complete}");
    expect(wizard).toContain('text-slate-600">(optional)</span>');
    expect(wizard).not.toContain('text-slate-400">(optional)</span>');
  });

  it("defines an application-wide security-header fallback without enforcing CSP", () => {
    expect(headers).toContain("/*");
    expect(headers).toContain("Strict-Transport-Security: max-age=31536000");
    expect(headers).toContain("Content-Security-Policy-Report-Only:");
    expect(headers).not.toMatch(/^\s*Content-Security-Policy:/m);
    expect(headers).toContain("Permissions-Policy: camera=(self), microphone=(), geolocation=()");
  });
});
