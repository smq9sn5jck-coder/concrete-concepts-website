import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  isBookingGatewayConfigured: vi.fn(),
  sendBookingLinkViaGateway: vi.fn(),
  createBookingDeliveryViaGateway: vi.fn(),
}));

vi.mock("./quoteBookingGateway", () => ({
  isBookingGatewayConfigured: mocks.isBookingGatewayConfigured,
  sendBookingLinkViaGateway: mocks.sendBookingLinkViaGateway,
  createBookingDeliveryViaGateway: mocks.createBookingDeliveryViaGateway,
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
  mocks.isBookingGatewayConfigured.mockReturnValue(true);
  mocks.sendBookingLinkViaGateway.mockResolvedValue({ status: "sent" });
});

describe("quote.sendBookingLink", () => {
  it("accepts only an opaque token and delegates to the production gateway", async () => {
    const token = "a".repeat(64);
    const caller = appRouter.createCaller(createPublicContext("127.0.0.71"));

    await expect(caller.quote.sendBookingLink({ token })).resolves.toEqual({ status: "sent" });
    expect(mocks.sendBookingLinkViaGateway).toHaveBeenCalledWith({ token });
  });

  it("rejects malformed tokens before calling the gateway", async () => {
    const caller = appRouter.createCaller(createPublicContext("127.0.0.72"));

    await expect(caller.quote.sendBookingLink({ token: "bad-token" })).rejects.toThrow(/Invalid booking delivery token/i);
    expect(mocks.sendBookingLinkViaGateway).not.toHaveBeenCalled();
  });

  it("returns unavailable without calling the gateway when it is not configured", async () => {
    mocks.isBookingGatewayConfigured.mockReturnValue(false);
    const caller = appRouter.createCaller(createPublicContext("127.0.0.73"));

    await expect(caller.quote.sendBookingLink({ token: "b".repeat(64) })).resolves.toEqual({ status: "unavailable" });
    expect(mocks.sendBookingLinkViaGateway).not.toHaveBeenCalled();
  });
});
