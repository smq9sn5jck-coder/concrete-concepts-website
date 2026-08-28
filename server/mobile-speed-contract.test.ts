import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("mobile hero delivery contract", () => {
  const hero = read("client/src/components/HeroSection.tsx");

  it("uses a responsive static poster on phones without mounting the video", () => {
    expect(hero).toContain("ResponsiveHeroMedia");
    expect(hero).toContain("MOBILE_HERO_POSTER");
    expect(hero).toContain('fetchPriority="high"');
    expect(hero).toContain('loading="eager"');
    expect(hero).toContain("srcSet");
  });

  it("retains the original video sources for tablet and desktop visitors", () => {
    expect(hero).toContain("HERO_VIDEO_WEBM");
    expect(hero).toContain("HERO_VIDEO_MP4");
    expect(hero).toContain("isTabletOrDesktop");
    expect(hero).toContain("<video");
  });

  it("renders the LCP copy immediately on phones while retaining desktop motion", () => {
    expect(hero).toContain('initial={isTabletOrDesktop ? "hidden" : false}');
    expect(hero).toContain('animate="visible"');
  });

  it("does not reference either newly supplied MOV file", () => {
    expect(hero).not.toMatch(/IMG_4816\.MOV|IMG_4817\.MOV/i);
  });
});

describe("responsive service media contract", () => {
  const services = read("client/src/components/ServicesSection.tsx");

  it("provides responsive sources and an explicit display-size hint", () => {
    expect(services).toContain("srcSet={service.srcSet}");
    expect(services).toContain("sizes={service.sizes}");
    expect(services).toContain("SERVICE_IMAGE_SIZES");
  });

  it("preserves the existing service image accessibility text", () => {
    expect(services).toContain('alt: "Concrete Concepts Group team hand troweling fresh concrete to a smooth finish on a Brisbane residential project"');
    expect(services).toContain('alt: "Excavation and site preparation for concrete project in Brisbane"');
  });
});

describe("clean Cloudflare production and deferred rendering contract", () => {
  const vite = read("vite.config.ts");
  const css = read("client/src/index.css");
  const home = read("client/src/pages/Home.tsx");

  it("excludes source-location instrumentation from Cloudflare builds", () => {
    expect(vite).toContain("const sourceLocationPlugins = isCfBuild ? [] : [jsxLocPlugin()]");
    expect(vite).toContain("...sourceLocationPlugins");
  });

  it("defines a browser-native below-fold rendering utility", () => {
    expect(css).toContain(".defer-below-fold");
    expect(css).toContain("content-visibility: auto");
    expect(css).toContain("contain-intrinsic-size:");
  });

  it("applies deferred rendering to substantial below-fold homepage groups", () => {
    expect(home).toContain("DeferredSection");
    expect(home.match(/<DeferredSection/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });
});
