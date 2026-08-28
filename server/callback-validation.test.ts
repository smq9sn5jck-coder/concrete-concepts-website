import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("./callbackEmail", () => ({
  sendCallbackNotificationEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock("./pushNotification", () => ({
  sendCallbackPushNotification: vi.fn().mockResolvedValue(true),
  sendQuotePushNotification: vi.fn().mockResolvedValue(true),
  isPushConfigured: vi.fn().mockReturnValue(false),
  addSubscription: vi.fn(),
  removeSubscription: vi.fn(),
  loadSubscriptionsFromDb: vi.fn(),
}));

vi.mock("./smsFollowUp", () => ({
  isTwilioConfigured: vi.fn().mockReturnValue(false),
  sendNewQuoteSms: vi.fn(),
  sendCallbackSms: vi.fn(),
  sendDay3SmsFollowUp: vi.fn(),
  sendDay7SmsFollowUp: vi.fn(),
  sendReviewRequestSms: vi.fn(),
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
      ip: "127.0.0.44",
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("callback.submit validation", () => {
  it("accepts a normally completed Australian callback request", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.callback.submit({
      name: "Local Callback",
      phone: "0424 463 268",
      suburb: "Carindale 4152",
      page: "/services/driveways",
      formStartedAt: Date.now() - 10_000,
    })).resolves.toMatchObject({ success: true });
  });

  it("rejects an overseas callback phone", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.callback.submit({
      name: "Overseas Callback",
      phone: "+52 55 1234 5678",
      formStartedAt: Date.now() - 10_000,
    })).rejects.toThrow(/Australian phone number/i);
  });

  it("rejects a filled callback honeypot", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.callback.submit({
      name: "Bot Callback",
      phone: "0412 111 222",
      website: "https://spam.example",
      formStartedAt: Date.now() - 10_000,
    })).rejects.toThrow(/try again/i);
  });

  it("rejects an implausibly fast callback request", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.callback.submit({
      name: "Fast Callback",
      phone: "0413 111 222",
      formStartedAt: Date.now() - 100,
    })).rejects.toThrow(/try again/i);
  });

  it("rejects a clearly interstate callback location", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.callback.submit({
      name: "Interstate Callback",
      phone: "0414 111 222",
      suburb: "Sydney NSW 2000",
      formStartedAt: Date.now() - 10_000,
    })).rejects.toThrow(/South East Queensland/i);
  });

  it("accepts a Queensland boundary callback and flags it for review", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.callback.submit({
      name: "Boundary Callback",
      phone: "0415 111 222",
      suburb: "Toowoomba QLD 4350",
      formStartedAt: Date.now() - 10_000,
    })).resolves.toMatchObject({
      success: true,
      serviceAreaStatus: "service_area_review",
    });
  });
});
