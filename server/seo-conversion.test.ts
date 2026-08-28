import { describe, expect, it, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { quoteRequests } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Tests for SEO optimization and conversion features:
 * 1. Blog posts have SEO-rich content (long-tail keyword posts)
 * 2. Quote request submission works (conversion funnel)
 * 3. Blog categories for content clustering
 * 4. Google reviews for social proof
 *
 * NOTE: This test cleans up any DB entries it creates.
 */

const TEST_EMAIL = "seotest-cleanup@test.internal";

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

// Clean up any test data after all tests run
afterAll(async () => {
  try {
    const db = await getDb();
    if (db) {
      await db.delete(quoteRequests).where(eq(quoteRequests.email, TEST_EMAIL));
    }
  } catch {
    // Ignore cleanup errors
  }
});

describe("SEO - Long-tail keyword blog posts", () => {
  it("has blog posts targeting specific concreting keywords", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const posts = await caller.blog.list({ publishedOnly: true });

    // We should have at least 9 blog posts (4 original + 5 new SEO posts)
    expect(posts.length).toBeGreaterThanOrEqual(9);

    // Check that posts have SEO-essential fields
    for (const post of posts) {
      expect(post.title).toBeTruthy();
      expect(post.slug).toBeTruthy();
      expect(post.excerpt).toBeTruthy();
      expect(post.category).toBeTruthy();
    }
  });

  it("has posts with keyword-rich slugs", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const posts = await caller.blog.list({ publishedOnly: true });
    const slugs = posts.map((p) => p.slug);

    // Check for specific long-tail keyword posts we added
    const expectedKeywordSlugs = [
      "how-long-concrete-cure-brisbane-climate",
      "concrete-vs-pavers-brisbane-driveway",
      "how-to-maintain-concrete-driveway-brisbane",
    ];

    for (const expected of expectedKeywordSlugs) {
      expect(slugs).toContain(expected);
    }
  });
});

describe("SEO - Content categories for topical authority", () => {
  it("has posts across multiple categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const posts = await caller.blog.list({ publishedOnly: true });
    const categories = [...new Set(posts.map((p) => p.category))];

    // Should have at least 2 different categories
    expect(categories.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Conversion - Quote request submission", () => {
  it("submits a quote request successfully", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Use a unique test email that gets cleaned up in afterAll
    const result = await caller.quote.submit({
      name: "SEO Test User",
      phone: "0400000001",
      email: TEST_EMAIL,
      suburb: "Brisbane CBD",
      service: "Driveway",
      details: "Testing quote submission from SEO conversion test",
      leadSource: "Direct",
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  }, 15000);
});

describe("SEO - Google Reviews for social proof", () => {
  it("returns reviews data structure", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.googleReviews.get();

    // The procedure should return an object with the expected shape
    expect(result).toHaveProperty("reviews");
    expect(result).toHaveProperty("rating");
    expect(result).toHaveProperty("totalReviews");
    expect(Array.isArray(result.reviews)).toBe(true);
  });
});
