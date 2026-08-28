import { describe, it, expect } from "vitest";
import { getPageMeta } from "./seoPrerender";
import * as fs from "fs";
import * as path from "path";

const NEW_SUBURBS = [
  { slug: "bracken-ridge", name: "Bracken Ridge", region: "Brisbane Northside" },
  { slug: "thornlands", name: "Thornlands", region: "Redlands & Bayside" },
  { slug: "calamvale", name: "Calamvale", region: "Brisbane Southside" },
  { slug: "sunnybank-hills", name: "Sunnybank Hills", region: "Brisbane Southside" },
  { slug: "alexandra-hills", name: "Alexandra Hills", region: "Redlands & Bayside" },
  { slug: "redland-bay", name: "Redland Bay", region: "Redlands & Bayside" },
  { slug: "eight-mile-plains", name: "Eight Mile Plains", region: "Brisbane Southside" },
  { slug: "rochedale", name: "Rochedale", region: "Brisbane Southside" },
  { slug: "pimpama", name: "Pimpama", region: "Gold Coast & Northern GC" },
  { slug: "mango-hill", name: "Mango Hill", region: "Moreton Bay & North" },
  { slug: "bellbird-park", name: "Bellbird Park", region: "Ipswich & Springfield" },
  { slug: "victoria-point", name: "Victoria Point", region: "Redlands & Bayside" },
  { slug: "upper-coomera", name: "Upper Coomera", region: "Gold Coast & Northern GC" },
  { slug: "kallangur", name: "Kallangur", region: "Moreton Bay & North" },
  { slug: "narangba", name: "Narangba", region: "Moreton Bay & North" },
];

describe("New suburb pages - SuburbPage.tsx data", () => {
  const suburbPagePath = path.resolve(
    import.meta.dirname,
    "../client/src/pages/SuburbPage.tsx"
  );
  const suburbPageContent = fs.readFileSync(suburbPagePath, "utf-8");

  for (const suburb of NEW_SUBURBS) {
    it(`has data entry for ${suburb.name} (${suburb.slug})`, () => {
      expect(suburbPageContent).toContain(`"${suburb.slug}"`);
    });

    it(`has geo coordinates for ${suburb.name}`, () => {
      // Check SUBURB_COORDS has the slug
      const coordsRegex = new RegExp(
        `"${suburb.slug}"\\s*:\\s*\\{\\s*lat:\\s*-?[\\d.]+,\\s*lng:\\s*[\\d.]+\\s*\\}`
      );
      expect(suburbPageContent).toMatch(coordsRegex);
    });
  }

  it("has 60 total suburb entries", () => {
    // Count top-level keys in SUBURBS object (lines starting with "  " followed by a quoted slug)
    const matches = suburbPageContent.match(/^  "[a-z][a-z0-9-]+":\s*\{$/gm);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(60);
  });
});

describe("New suburb pages - ServiceAreasPage regions", () => {
  const areasPagePath = path.resolve(
    import.meta.dirname,
    "../client/src/pages/ServiceAreasPage.tsx"
  );
  const areasPageContent = fs.readFileSync(areasPagePath, "utf-8");

  for (const suburb of NEW_SUBURBS) {
    it(`${suburb.name} is listed in ServiceAreasPage`, () => {
      expect(areasPageContent).toContain(`"${suburb.slug}"`);
      expect(areasPageContent).toContain(`"${suburb.name}"`);
    });
  }

  it("ServiceAreasPage has 60+ suburbs total", () => {
    const slugMatches = areasPageContent.match(/slug:\s*"[a-z][a-z0-9-]+"/g);
    expect(slugMatches).not.toBeNull();
    expect(slugMatches!.length).toBeGreaterThanOrEqual(60);
  });
});

describe("New suburb pages - SEO prerendering", () => {
  for (const suburb of NEW_SUBURBS) {
    it(`returns meta for /areas/${suburb.slug}`, async () => {
      const meta = await getPageMeta(`/areas/${suburb.slug}`);
      expect(meta).not.toBeNull();
      expect(meta!.title).toContain(suburb.name);
      expect(meta!.canonical).toBe(`/areas/${suburb.slug}`);
      expect(meta!.description).toBeTruthy();
    });
  }
});

describe("New suburb pages - required content structure", () => {
  const suburbPagePath = path.resolve(
    import.meta.dirname,
    "../client/src/pages/SuburbPage.tsx"
  );
  const suburbPageContent = fs.readFileSync(suburbPagePath, "utf-8");

  for (const suburb of NEW_SUBURBS) {
    it(`${suburb.name} has required fields (name, slug, postcode, region, description, services, faqs, nearbySuburbs)`, () => {
      // Find the suburb entry block
      const entryStart = suburbPageContent.indexOf(`"${suburb.slug}": {`);
      expect(entryStart).toBeGreaterThan(-1);

      // Get a chunk of content after the entry start (enough for the full entry)
      const chunk = suburbPageContent.slice(entryStart, entryStart + 5000);

      expect(chunk).toContain("name:");
      expect(chunk).toContain("slug:");
      expect(chunk).toContain("postcode:");
      expect(chunk).toContain("region:");
      expect(chunk).toContain("description:");
      expect(chunk).toContain("popularServices:");
      expect(chunk).toContain("faqs:");
      expect(chunk).toContain("nearbySuburbs:");
    });
  }
});
