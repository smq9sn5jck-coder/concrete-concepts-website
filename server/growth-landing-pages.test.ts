import { describe, it, expect } from "vitest";
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

describe("Growth suburb landing pages", () => {
  const lpPath = path.resolve(
    import.meta.dirname,
    "../client/src/pages/LandingPage.tsx"
  );
  const lpContent = fs.readFileSync(lpPath, "utf-8");

  it("has all 20 new landing page entries", () => {
    for (const slug of NEW_LANDING_PAGES) {
      expect(lpContent).toContain(`"${slug}"`);
    }
  });

  it("has 75 total landing pages (55 existing + 20 new)", () => {
    const matches = lpContent.match(/^\s+"[a-z][a-z0-9-]+": \{$/gm);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(75);
  });

  for (const slug of NEW_LANDING_PAGES) {
    it(`${slug} has required fields (headline, service, benefits, testimonials, processSteps)`, () => {
      const entryStart = lpContent.indexOf(`"${slug}": {`);
      expect(entryStart).toBeGreaterThan(-1);

      const chunk = lpContent.slice(entryStart, entryStart + 3000);
      expect(chunk).toContain("headline:");
      expect(chunk).toContain("subheadline:");
      expect(chunk).toContain("service:");
      expect(chunk).toContain("benefits:");
      expect(chunk).toContain("priceFrom:");
      expect(chunk).toContain("heroImage:");
      expect(chunk).toContain("trustPoints:");
      expect(chunk).toContain("urgencyLine:");
      expect(chunk).toContain("testimonials:");
      expect(chunk).toContain("processSteps:");
    });
  }

  it("no duplicate landing page slugs", () => {
    const slugMatches = lpContent.match(/^\s+"[a-z][a-z0-9-]+": \{$/gm);
    expect(slugMatches).not.toBeNull();
    const slugs = slugMatches!.map((m) => m.trim().replace(/": \{$/, "").replace(/^"/, ""));
    const uniqueSlugs = new Set(slugs);
    expect(slugs.length).toBe(uniqueSlugs.size);
  });
});
