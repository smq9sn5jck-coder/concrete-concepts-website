import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Tests for SEO features:
 * 1. Blog posts listing (public procedure)
 * 2. Blog post by slug (public procedure)
 * 3. Google reviews (public procedure)
 */

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

describe("SEO Features - Blog", () => {
  it("fetches published blog posts via public procedure", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const posts = await caller.blog.list({ publishedOnly: true });

    expect(Array.isArray(posts)).toBe(true);
    // We should have at least the seeded blog posts
    expect(posts.length).toBeGreaterThanOrEqual(1);

    // Each post should have required fields
    for (const post of posts) {
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("slug");
      expect(post).toHaveProperty("excerpt");
      expect(post).toHaveProperty("category");
    }
  });

  it("fetches a specific blog post by slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // First get all posts to find a valid slug
    const posts = await caller.blog.list({ publishedOnly: true });
    expect(posts.length).toBeGreaterThan(0);

    const firstSlug = posts[0]!.slug;
    const post = await caller.blog.getBySlug({ slug: firstSlug });

    expect(post).not.toBeNull();
    expect(post!.slug).toBe(firstSlug);
    expect(post!.title).toBeTruthy();
    expect(post!.content).toBeTruthy();
  });

  it("returns null for non-existent blog post slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const post = await caller.blog.getBySlug({ slug: "this-slug-does-not-exist-xyz" });
    expect(post).toBeNull();
  });
});

describe("SEO Features - Google Reviews", () => {
  it("fetches Google reviews via public procedure", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // The googleReviews.get procedure should return an object with reviews array
    const result = await caller.googleReviews.get();

    expect(result).toHaveProperty("reviews");
    expect(Array.isArray(result.reviews)).toBe(true);
    expect(result).toHaveProperty("rating");
    expect(result).toHaveProperty("totalReviews");
  });
});
