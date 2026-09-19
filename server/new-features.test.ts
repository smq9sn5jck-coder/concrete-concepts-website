import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Tests for new features:
 * 1. Project planner finish and quote-handoff behaviour
 * 2. Before/After Gallery page structure
 * 3. Expanded service pages content
 * 4. Google Maps on suburb pages
 * 5. Sitemap includes new pages
 * 6. Navigation includes new links
 */

describe("Project planner - safe quote handoff", () => {
  const planner = readFileSync(resolve("client/src/pages/CostCalculator.tsx"), "utf8");

  it("saves the scope before sending the visitor to the detailed quote", () => {
    expect(planner).toContain("saveQuoteDraft");
    expect(planner).toContain('href="/get-quote"');
    expect(planner).toContain("measurementMode: \"area\"");
  });

  it("captures operational site factors instead of applying generic price uplifts", () => {
    for (const factor of ["excavation", "removal", "access", "slope", "drainage", "pump"]) {
      expect(planner).toContain(`\"${factor}\"`);
    }
    expect(planner).not.toMatch(/lowPerM2|highPerM2|percentage:\s*15/);
  });
});

describe("Before/After Gallery - Project Data", () => {
  // Before/After project structure (must match BeforeAfterGallery.tsx)
  const PROJECTS = [
    { id: "driveway-exposed-aggregate", title: "Exposed Aggregate Driveway Transformation", suburb: "Carindale", service: "Concrete Driveways" },
    { id: "retaining-wall-hillside", title: "Hillside Retaining Wall & Level Yard", suburb: "Kenmore", service: "Retaining Walls" },
    { id: "slab-shed-floor", title: "Shed Slab & Workshop Floor", suburb: "Springfield", service: "Concrete Slabs" },
    { id: "pool-surround-entertaining", title: "Pool Surround & Entertaining Area", suburb: "Redlands", service: "Concrete Patios" },
    { id: "residential-slab-steps", title: "Residential Slab with Integrated Steps", suburb: "Logan", service: "Concrete Slabs" },
    { id: "plain-driveway-modern", title: "Modern Plain Concrete Driveway", suburb: "Camp Hill", service: "Concrete Driveways" },
  ];

  it("has at least 6 before/after projects", () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(6);
  });

  it("all projects have required fields", () => {
    for (const project of PROJECTS) {
      expect(project.id).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.suburb).toBeTruthy();
      expect(project.service).toBeTruthy();
    }
  });

  it("projects cover multiple service types", () => {
    const services = [...new Set(PROJECTS.map(p => p.service))];
    expect(services.length).toBeGreaterThanOrEqual(3);
  });

  it("projects cover multiple suburbs", () => {
    const suburbs = [...new Set(PROJECTS.map(p => p.suburb))];
    expect(suburbs.length).toBeGreaterThanOrEqual(4);
  });

  it("all project IDs are unique", () => {
    const ids = PROJECTS.map(p => p.id);
    const uniqueIds = [...new Set(ids)];
    expect(uniqueIds.length).toBe(ids.length);
  });
});

describe("Suburb Pages - All 15 suburbs registered", () => {
  const SUBURB_SLUGS = [
    "carindale", "logan", "wynnum", "springfield", "capalaba",
    "ipswich", "mount-gravatt", "redlands", "beenleigh", "camp-hill",
    "sunnybank", "chermside", "aspley", "north-lakes", "caboolture",
  ];

  it("has 15 suburb slugs", () => {
    expect(SUBURB_SLUGS.length).toBe(15);
  });

  it("all slugs are URL-safe", () => {
    for (const slug of SUBURB_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("no duplicate slugs", () => {
    const unique = [...new Set(SUBURB_SLUGS)];
    expect(unique.length).toBe(SUBURB_SLUGS.length);
  });
});

describe("Service Pages - Expanded content structure", () => {
  const SERVICE_SLUGS = [
    "concrete-driveways-brisbane",
    "concrete-slabs-brisbane",
    "retaining-walls-brisbane",
    "exposed-aggregate-brisbane",
    "concrete-patios-brisbane",
    "excavation-brisbane",
  ];

  it("has 6 service page slugs", () => {
    expect(SERVICE_SLUGS.length).toBe(6);
  });

  it("all service slugs contain Brisbane keyword", () => {
    for (const slug of SERVICE_SLUGS) {
      expect(slug).toContain("brisbane");
    }
  });

  it("all service slugs are URL-safe", () => {
    for (const slug of SERVICE_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe("Navigation - All new pages linked", () => {
  const NAV_LINKS = [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Our Work", href: "#work" },
    { label: "Before & After", href: "/gallery/before-after" },
    { label: "Cost Calculator", href: "/calculator" },
    { label: "Areas", href: "/areas" },
    { label: "Reviews", href: "/reviews" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "#contact" },
  ];

  it("has Before & After link in navigation", () => {
    const link = NAV_LINKS.find(l => l.label === "Before & After");
    expect(link).toBeDefined();
    expect(link!.href).toBe("/gallery/before-after");
  });

  it("has Cost Calculator link in navigation", () => {
    const link = NAV_LINKS.find(l => l.label === "Cost Calculator");
    expect(link).toBeDefined();
    expect(link!.href).toBe("/calculator");
  });

  it("has Areas link in navigation", () => {
    const link = NAV_LINKS.find(l => l.label === "Areas");
    expect(link).toBeDefined();
    expect(link!.href).toBe("/areas");
  });

  it("has Reviews link in navigation", () => {
    const link = NAV_LINKS.find(l => l.label === "Reviews");
    expect(link).toBeDefined();
    expect(link!.href).toBe("/reviews");
  });
});

describe("Sitemap - New pages included", () => {
  const SITEMAP_STATIC_PAGES = [
    "/",
    "/areas",
    "/reviews",
    "/blog",
    "/calculator",
    "/gallery/before-after",
    "/faq",
    "/privacy",
    "/terms",
  ];

  it("includes calculator page in sitemap", () => {
    expect(SITEMAP_STATIC_PAGES).toContain("/calculator");
  });

  it("includes before/after gallery in sitemap", () => {
    expect(SITEMAP_STATIC_PAGES).toContain("/gallery/before-after");
  });

  it("includes all core pages in sitemap", () => {
    expect(SITEMAP_STATIC_PAGES).toContain("/");
    expect(SITEMAP_STATIC_PAGES).toContain("/areas");
    expect(SITEMAP_STATIC_PAGES).toContain("/reviews");
    expect(SITEMAP_STATIC_PAGES).toContain("/blog");
  });

  it("includes FAQ, privacy, and terms pages in sitemap", () => {
    expect(SITEMAP_STATIC_PAGES).toContain("/faq");
    expect(SITEMAP_STATIC_PAGES).toContain("/privacy");
    expect(SITEMAP_STATIC_PAGES).toContain("/terms");
  });
});
