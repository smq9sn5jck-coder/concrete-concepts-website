import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock the db module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  getAllQuoteRequests: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "John Smith",
      phone: "0424 463 268",
      email: "john@example.com",
      suburb: "Manly West",
      service: "Driveway",
      details: "Need a new driveway",
      createdAt: new Date("2026-03-07T10:00:00Z"),
    },
    {
      id: 2,
      name: "Jane Doe",
      phone: "0400 000 000",
      email: "jane@example.com",
      suburb: "Runcorn",
      service: "Exposed Aggregate",
      details: null,
      createdAt: new Date("2026-03-06T08:00:00Z"),
    },
  ]),
  getQuoteRequestById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) {
      return {
        id: 1,
        name: "John Smith",
        phone: "0424 463 268",
        email: "john@example.com",
        suburb: "Manly West",
        service: "Driveway",
        details: "Need a new driveway",
        createdAt: new Date("2026-03-07T10:00:00Z"),
      };
    }
    return undefined;
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

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

function createRegularUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
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

describe("quote.list (admin)", () => {
  it("returns all quote requests for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quote.list();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("John Smith");
    expect(result[1].name).toBe("Jane Doe");
  });

  it("rejects non-admin users", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.quote.list()).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.quote.list()).rejects.toThrow();
  });
});

describe("quote.getById (admin)", () => {
  it("returns a single quote request for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quote.getById({ id: 1 });

    expect(result).not.toBeNull();
    expect(result?.name).toBe("John Smith");
    expect(result?.service).toBe("Driveway");
  });

  it("returns null for non-existent quote", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quote.getById({ id: 999 });

    expect(result).toBeNull();
  });

  it("rejects non-admin users", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.quote.getById({ id: 1 })).rejects.toThrow();
  });
});
