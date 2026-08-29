import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";

const NEW_LANDING_PAGES = [
  "concrete-driveway-pimpama",
  "concrete-driveway-upper-coomera",
  "concrete-driveway-rochedale",
  "concrete-driveway-mango-hill",
  "concrete-driveway-thornlands",
  "exposed-aggregate-pimpama",
  "exposed-aggregate-upper-coomera",
  "exposed-aggregate-rochedale",
  "concrete-slab-pimpama",
  "concrete-slab-upper-coomera",
  "concrete-slab-narangba",
  "concrete-slab-bellbird-park",
  "retaining-wall-rochedale",
  "retaining-wall-narangba",
  "concrete-driveway-narangba",
  "concrete-driveway-kallangur",
  "concrete-driveway-bracken-ridge",
  "exposed-aggregate-thornlands",
  "concrete-patio-pimpama",
  "pool-surround-upper-coomera",
];

describe("Paid suburb landing pages", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const landing = fs.readFileSync(path.join(root, "client/src/pages/LandingPage.tsx"), "utf-8");
  const app = fs.readFileSync(path.join(root, "client/src/App.tsx"), "utf-8");
  const sitemap = fs.readFileSync(path.join(root, "client/public/sitemap.xml"), "utf-8");
  const paidSlugs = Array.from(
    sitemap.matchAll(/<loc>https:\/\/concreteconceptsgroup\.com\/lp\/([^<]+)<\/loc>/g),
    match => match[1]
  );

  it("keeps the 76 paid URLs reachable through the generic noindex route", () => {
    expect(app).toContain('path={"/lp/:slug"}');
    expect(paidSlugs).toHaveLength(76);
    expect(new Set(paidSlugs).size).toBe(76);
  });

  it("retains every approved growth slug without hardcoded customer claims", () => {
    for (const slug of NEW_LANDING_PAGES) expect(paidSlugs).toContain(slug);
    expect(landing).toContain("SERVICE_PATTERNS");
    expect(landing).toContain("getLandingConfig");
    expect(landing).toContain("saveQuoteDraft");
    expect(landing).toContain("/get-quote");
    expect(landing).not.toMatch(/testimonial|priceFrom|urgencyLine|guaranteed/i);
  });

  it("keeps paid pages noindex and requires complete contact prefill", () => {
    expect(landing).toContain("noindex");
    expect(landing).toContain("validateAustralianPhone");
    expect(landing).toContain("classifyServiceArea");
    expect(landing).toContain('type="email"');
    expect(landing).not.toContain("trackQuoteConversion");
  });
});
