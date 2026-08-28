import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.55",
    } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("guide.submit validation", () => {
  it("accepts an email-only guide request", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.guide.submit({
      name: "Guide Reader",
      email: "reader@example.com",
      formStartedAt: Date.now() - 10_000,
    })).resolves.toMatchObject({ success: true });
  });

  it("accepts and normalizes an optional Australian phone", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.guide.submit({
      name: "Phone Reader",
      email: "phone-reader@example.com",
      phone: "+61 424 463 268",
      formStartedAt: Date.now() - 10_000,
    })).resolves.toMatchObject({ success: true, phone: "0424463268" });
  });

  it("rejects an overseas optional phone", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.guide.submit({
      name: "Overseas Reader",
      email: "overseas-reader@example.com",
      phone: "+52 55 1234 5678",
      formStartedAt: Date.now() - 10_000,
    })).rejects.toThrow(/Australian phone number/i);
  });

  it("rejects a filled guide honeypot", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.guide.submit({
      name: "Guide Bot",
      email: "guide-bot@example.com",
      website: "https://spam.example",
      formStartedAt: Date.now() - 10_000,
    })).rejects.toThrow(/try again/i);
  });
});
