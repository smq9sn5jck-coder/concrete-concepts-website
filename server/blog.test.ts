import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => {
  const mockPosts = [
    {
      id: 1,
      title: "Test Blog Post",
      slug: "test-blog-post",
      excerpt: "This is a test excerpt",
      content: "# Test Content\n\nThis is test content.",
      category: "Tips & Guides",
      coverImage: "https://example.com/image.jpg",
      published: 1,
      authorName: "Concrete Concepts Group",
      readTimeMinutes: 5,
      metaTitle: "Test Blog Post | Concrete Concepts",
      metaDescription: "Test meta description",
      publishedAt: new Date("2026-03-01"),
      createdAt: new Date("2026-03-01"),
      updatedAt: new Date("2026-03-01"),
    },
    {
      id: 2,
      title: "Unpublished Post",
      slug: "unpublished-post",
      excerpt: "This post is not published",
      content: "Draft content",
      category: "Industry News",
      coverImage: null,
      published: 0,
      authorName: "Concrete Concepts Group",
      readTimeMinutes: 3,
      metaTitle: null,
      metaDescription: null,
      publishedAt: new Date("2026-02-28"),
      createdAt: new Date("2026-02-28"),
      updatedAt: new Date("2026-02-28"),
    },
    {
      id: 3,
      title: "Brisbane Living Post",
      slug: "brisbane-living-post",
      excerpt: "Brisbane living excerpt",
      content: "Brisbane living content",
      category: "Brisbane Living",
      coverImage: "https://example.com/brisbane.jpg",
      published: 1,
      authorName: "Concrete Concepts Group",
      readTimeMinutes: 4,
      metaTitle: null,
      metaDescription: null,
      publishedAt: new Date("2026-02-25"),
      createdAt: new Date("2026-02-25"),
      updatedAt: new Date("2026-02-25"),
    },
  ];

  let posts = [...mockPosts];

  return {
    getDb: vi.fn().mockResolvedValue({}),
    getAllBlogPosts: vi.fn((publishedOnly: boolean) => {
      if (publishedOnly) {
        return Promise.resolve(posts.filter((p) => p.published === 1));
      }
      return Promise.resolve([...posts]);
    }),
    getBlogPostBySlug: vi.fn((slug: string) => {
      return Promise.resolve(posts.find((p) => p.slug === slug) ?? undefined);
    }),
    getBlogPostById: vi.fn((id: number) => {
      return Promise.resolve(posts.find((p) => p.id === id) ?? undefined);
    }),
    getBlogPostsByCategory: vi.fn((category: string) => {
      return Promise.resolve(
        posts.filter((p) => p.category === category && p.published === 1)
      );
    }),
    createBlogPost: vi.fn((post: Record<string, unknown>) => {
      const newPost = { id: posts.length + 1, ...post };
      posts.push(newPost as (typeof posts)[0]);
      return Promise.resolve();
    }),
    updateBlogPost: vi.fn((id: number, data: Record<string, unknown>) => {
      const idx = posts.findIndex((p) => p.id === id);
      if (idx >= 0) posts[idx] = { ...posts[idx], ...data };
      return Promise.resolve();
    }),
    deleteBlogPost: vi.fn((id: number) => {
      posts = posts.filter((p) => p.id !== id);
      return Promise.resolve();
    }),
    // Other exports needed by routers.ts
    getAllQuoteRequests: vi.fn().mockResolvedValue([]),
    getQuoteRequestById: vi.fn().mockResolvedValue(undefined),
    upsertUser: vi.fn(),
    getUserByOpenId: vi.fn(),
  };
});

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("blog.list (public)", () => {
  it("returns only published posts when no category filter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const posts = await caller.blog.list();

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBe(2);
    expect(posts.every((p) => p.published === 1)).toBe(true);
  });

  it("filters by category when provided", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const posts = await caller.blog.list({ category: "Brisbane Living" });

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBe(1);
    expect(posts[0].category).toBe("Brisbane Living");
  });

  it("returns empty array for non-existent category", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const posts = await caller.blog.list({ category: "Nonexistent" });

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBe(0);
  });
});

describe("blog.getBySlug (public)", () => {
  it("returns a published post by slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const post = await caller.blog.getBySlug({ slug: "test-blog-post" });

    expect(post).not.toBeNull();
    expect(post!.title).toBe("Test Blog Post");
    expect(post!.slug).toBe("test-blog-post");
  });

  it("returns null for unpublished post", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const post = await caller.blog.getBySlug({ slug: "unpublished-post" });

    expect(post).toBeNull();
  });

  it("returns null for non-existent slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const post = await caller.blog.getBySlug({ slug: "does-not-exist" });

    expect(post).toBeNull();
  });
});

describe("blog.adminList (admin)", () => {
  it("returns all posts including unpublished for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const posts = await caller.blog.adminList();

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBe(3);
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.blog.adminList()).rejects.toThrow();
  });
});

describe("blog.create (admin)", () => {
  it("creates a new blog post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.blog.create({
      title: "New Test Post",
      slug: "new-test-post",
      excerpt: "A new test post excerpt",
      content: "New test content here",
      category: "Tips & Guides",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.blog.create({
        title: "Unauthorized Post",
        slug: "unauthorized-post",
        excerpt: "Should fail",
        content: "Should fail",
        category: "Tips & Guides",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid input (empty title)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.blog.create({
        title: "",
        slug: "empty-title",
        excerpt: "Excerpt",
        content: "Content",
        category: "Tips & Guides",
      })
    ).rejects.toThrow();
  });
});

describe("blog.update (admin)", () => {
  it("updates an existing blog post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.blog.update({
      id: 1,
      data: { title: "Updated Title" },
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.blog.update({ id: 1, data: { title: "Hacked" } })
    ).rejects.toThrow();
  });
});

describe("blog.delete (admin)", () => {
  it("deletes a blog post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.blog.delete({ id: 2 });

    expect(result).toEqual({ success: true });
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.blog.delete({ id: 1 })).rejects.toThrow();
  });
});
