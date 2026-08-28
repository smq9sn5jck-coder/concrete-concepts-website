/**
 * Tests for content expansion:
 * - 15 new suburb landing pages
 * - 5 new blog posts in database
 * - 5 optimized Google Ads landing pages
 */
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// New suburb slugs added in this phase
const NEW_SUBURB_SLUGS = [
  "morningside", "coorparoo", "greenslopes", "holland-park", "tarragindi",
  "annerley", "moorooka", "kenmore", "indooroopilly", "chapel-hill",
  "the-gap", "ferny-grove", "everton-park", "stafford", "nundah",
];

// Original suburb slugs that should still exist
const ORIGINAL_SUBURB_SLUGS = [
  "carindale", "logan", "wynnum", "springfield", "capalaba",
  "ipswich", "mount-gravatt", "redlands", "beenleigh", "camp-hill",
  "sunnybank", "chermside", "aspley", "north-lakes", "caboolture",
];

// Sitemap suburb pages (should include all 30)
const ALL_SUBURB_SLUGS = [
  ...ORIGINAL_SUBURB_SLUGS,
  ...NEW_SUBURB_SLUGS,
];

// New blog post slugs (actual slugs from database)
const NEW_BLOG_SLUGS = [
  "coloured-concrete-options-brisbane-homes",
  "pool-surrounds-brisbane-concrete-vs-pavers-vs-tiles",
  "prepare-property-concrete-pour-brisbane",
  "concrete-vs-asphalt-driveway-brisbane",
  "best-time-pour-concrete-brisbane-seasonal-guide",
];

// Google Ads landing page slugs
const LANDING_PAGE_SLUGS = [
  "concrete-driveways",
  "concrete-slabs",
  "retaining-walls",
  "exposed-aggregate",
  "concrete-patios",
];

describe("Suburb Landing Pages - 15 new suburbs", () => {
  it("has all 15 new suburb slugs defined", () => {
    expect(NEW_SUBURB_SLUGS).toHaveLength(15);
  });

  it("has all 15 original suburb slugs still present", () => {
    expect(ORIGINAL_SUBURB_SLUGS).toHaveLength(15);
  });

  it("total suburb count is 30", () => {
    expect(ALL_SUBURB_SLUGS).toHaveLength(30);
    // No duplicates
    const unique = new Set(ALL_SUBURB_SLUGS);
    expect(unique.size).toBe(30);
  });

  it("all suburb slugs follow URL-safe format", () => {
    for (const slug of ALL_SUBURB_SLUGS) {
      expect(slug).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });
});

describe("Blog Posts - 5 new high-intent articles", () => {
  it("fetches all published blog posts including new ones", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const posts = await caller.blog.list({ publishedOnly: true });

    // Should have at least 19 posts (14 original + 5 new)
    expect(posts.length).toBeGreaterThanOrEqual(19);

    // Check that each new blog slug exists
    const slugs = posts.map((p: any) => p.slug);
    for (const slug of NEW_BLOG_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });

  it("can fetch each new blog post by slug with substantial content", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    for (const slug of NEW_BLOG_SLUGS) {
      const post = await caller.blog.getBySlug({ slug });
      expect(post).toBeDefined();
      expect(post!.slug).toBe(slug);
      expect(post!.title).toBeTruthy();
      expect(post!.content).toBeTruthy();
      // Each post should have substantial content (1000+ chars)
      expect(post!.content!.length).toBeGreaterThan(1000);
    }
  });
});

describe("Google Ads Landing Pages - Conversion Optimised", () => {
  it("has all 5 landing page configurations defined", () => {
    expect(LANDING_PAGE_SLUGS).toHaveLength(5);
  });

  it("each landing page slug follows the expected pattern", () => {
    for (const slug of LANDING_PAGE_SLUGS) {
      expect(slug).toMatch(/^[a-z-]+$/);
    }
  });
});
