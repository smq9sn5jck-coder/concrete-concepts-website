import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Tests for the new features:
 * 1. Abandoned quote follow-up system
 * 2. Customer satisfaction survey system
 * 3. Blog scheduling system
 */

// Mock the database module
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
    getDb: vi.fn(),
  };
});

// Mock email modules
vi.mock("./abandonedQuoteEmail", () => ({
  sendAbandonedQuoteEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock("./surveyEmail", () => ({
  sendSurveyEmail: vi.fn().mockResolvedValue(true),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

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
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("abandonedQuote.save", () => {
  it("validates email format", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.abandonedQuote.save({
        email: "not-an-email",
      })
    ).rejects.toThrow();
  });

  it("accepts valid email with optional fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    // This will try to hit the DB, which is mocked as undefined
    // The procedure should handle gracefully
    const result = await caller.abandonedQuote.save({
      email: "test@example.com",
      name: "John Doe",
      phone: "0412345678",
      suburb: "Brisbane",
      service: "Driveway",
      page: "/get-quote",
    });

    // getDb returns undefined (mocked), so success should be false
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(false);
  });

  it("accepts email-only input", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.abandonedQuote.save({
      email: "minimal@test.com",
    });

    expect(result).toHaveProperty("success");
  });
});

describe("abandonedQuote.list", () => {
  it("requires admin access", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.abandonedQuote.list()).rejects.toThrow();
  });

  it("returns array for admin user", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    // getDb returns undefined, so should return empty array
    const result = await caller.abandonedQuote.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("survey.getByToken", () => {
  it("returns null for non-existent token", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.survey.getByToken({
      token: "non-existent-token-12345",
    });

    expect(result).toBeNull();
  });

  it("requires a token string", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      // @ts-expect-error - testing invalid input
      caller.survey.getByToken({})
    ).rejects.toThrow();
  });
});

describe("survey.submit", () => {
  it("validates rating range (1-5)", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.survey.submit({
        token: "test-token",
        overallRating: 0, // below minimum
      })
    ).rejects.toThrow();

    await expect(
      caller.survey.submit({
        token: "test-token",
        overallRating: 6, // above maximum
      })
    ).rejects.toThrow();
  });

  it("accepts valid rating with optional fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    // getDb returns undefined, so should return { success: false }
    const result = await caller.survey.submit({
      token: "test-token",
      overallRating: 5,
      qualityRating: 4,
      communicationRating: 5,
      timelinessRating: 3,
      feedback: "Great work!",
      wouldRecommend: 1,
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(false);
  });
});

describe("survey.trackGoogleReviewClick", () => {
  it("handles missing survey gracefully", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.survey.trackGoogleReviewClick({
      token: "non-existent-token",
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(false);
  });
});

describe("survey.create", () => {
  it("requires admin access", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.survey.create({
        quoteRequestId: 1,
        customerName: "Test Customer",
        customerEmail: "test@example.com",
      })
    ).rejects.toThrow();
  });

  it("validates email format", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    await expect(
      caller.survey.create({
        quoteRequestId: 1,
        customerName: "Test Customer",
        customerEmail: "not-valid",
      })
    ).rejects.toThrow();
  });
});

describe("survey.list", () => {
  it("requires admin access", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.survey.list()).rejects.toThrow();
  });

  it("returns array for admin user", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const result = await caller.survey.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("blogSchedule.schedule", () => {
  it("requires admin access", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.blogSchedule.schedule({
        blogPostId: 1,
        scheduledPublishAt: new Date().toISOString(),
      })
    ).rejects.toThrow();
  });
});

describe("blogSchedule.list", () => {
  it("requires admin access", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.blogSchedule.list()).rejects.toThrow();
  });

  it("returns array for admin user", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const result = await caller.blogSchedule.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("blogSchedule.cancel", () => {
  it("requires admin access", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.blogSchedule.cancel({ id: 1 })
    ).rejects.toThrow();
  });
});
