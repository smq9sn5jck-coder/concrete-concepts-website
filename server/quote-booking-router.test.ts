import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  isTwilioConfigured: vi.fn(),
  deliverBookingLink: vi.fn(),
  createStore: vi.fn(),
  sendTransactionalSms: vi.fn(),
}));

vi.mock("./db", () => ({
  getDb: mocks.getDb,
}));

vi.mock("./smsFollowUp", () => ({
  isTwilioConfigured: mocks.isTwilioConfigured,
  sendTransactionalSms: mocks.sendTransactionalSms,
  sendNewQuoteSms: vi.fn(),
  sendCallbackSms: vi.fn(),
  sendDay3SmsFollowUp: vi.fn(),
  sendDay7SmsFollowUp: vi.fn(),
  sendReviewRequestSms: vi.fn(),
}));

vi.mock("./quoteBookingSms", async importOriginal => {
  const original = await importOriginal<typeof import("./quoteBookingSms")>();
  return {
    ...original,
    deliverBookingLink: mocks.deliverBookingLink,
  };
});

vi.mock("./quoteBookingDeliveryStore", () => ({
  createQuoteBookingDelivery: vi.fn(),
  createQuoteBookingDeliveryStore: mocks.createStore,
}));

vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn() }));
vi.mock("./pushNotification", () => ({
  addSubscription: vi.fn(),
  removeSubscription: vi.fn(),
  loadSubscriptionsFromDb: vi.fn(),
  sendQuotePushNotification: vi.fn(),
  sendCallbackPushNotification: vi.fn(),
  isPushConfigured: vi.fn().mockReturnValue(false),
}));

import { appRouter } from "./routers";

function createPublicContext(ip: string): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      ip,
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getDb.mockResolvedValue({});
  mocks.isTwilioConfigured.mockReturnValue(true);
  mocks.createStore.mockReturnValue({ kind: "booking-store" });
  mocks.deliverBookingLink.mockResolvedValue({ status: "sent" });
});

describe("quote.sendBookingLink", () => {
  it("accepts only an opaque token and delegates to the one-time delivery service", async () => {
    const token = "a".repeat(64);
    const caller = appRouter.createCaller(createPublicContext("127.0.0.71"));

    await expect(caller.quote.sendBookingLink({ token })).resolves.toEqual({ status: "sent" });
    expect(mocks.createStore).toHaveBeenCalledWith({});
    expect(mocks.deliverBookingLink).toHaveBeenCalledWith({
      rawToken: token,
      store: { kind: "booking-store" },
      send: mocks.sendTransactionalSms,
    });
  });

  it("rejects malformed tokens before reading customer data", async () => {
    const caller = appRouter.createCaller(createPublicContext("127.0.0.72"));

    await expect(caller.quote.sendBookingLink({ token: "bad-token" })).rejects.toThrow(/Invalid booking delivery token/i);
    expect(mocks.getDb).not.toHaveBeenCalled();
    expect(mocks.deliverBookingLink).not.toHaveBeenCalled();
  });

  it("returns unavailable without claiming a delivery when Twilio is not configured", async () => {
    mocks.isTwilioConfigured.mockReturnValue(false);
    const caller = appRouter.createCaller(createPublicContext("127.0.0.73"));

    await expect(caller.quote.sendBookingLink({ token: "b".repeat(64) })).resolves.toEqual({ status: "unavailable" });
    expect(mocks.getDb).not.toHaveBeenCalled();
    expect(mocks.deliverBookingLink).not.toHaveBeenCalled();
  });
});
