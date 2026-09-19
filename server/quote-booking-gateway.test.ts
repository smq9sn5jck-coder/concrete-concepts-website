import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createBookingDeliveryViaGateway,
  isBookingGatewayConfigured,
  sendBookingLinkViaGateway,
} from "./quoteBookingGateway";

const ORIGINAL_ENV = { ...process.env };

describe("quote booking gateway", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.BOOKING_GATE_URL = "https://leads.concreteconceptsgroup.com/";
    process.env.BOOKING_GATE_SECRET = "test-shared-secret";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("is configured only when both the gateway URL and secret are present", () => {
    expect(isBookingGatewayConfigured()).toBe(true);
    delete process.env.BOOKING_GATE_SECRET;
    expect(isBookingGatewayConfigured()).toBe(false);
  });

  it("creates a delivery through the authenticated server-to-server endpoint", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      token: "a".repeat(64),
      expiresAt: "2026-09-21T00:00:00.000Z",
    }), { status: 200, headers: { "content-type": "application/json" } }));

    await expect(createBookingDeliveryViaGateway({
      customerName: "Sarah Taylor",
      customerPhone: "+61424463268",
      fetchImpl,
    })).resolves.toEqual({ token: "a".repeat(64) });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://leads.concreteconceptsgroup.com/api/public/booking-link/create",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "content-type": "application/json",
          "x-booking-gate-secret": "test-shared-secret",
        }),
        body: JSON.stringify({
          customerName: "Sarah Taylor",
          customerPhone: "+61424463268",
        }),
      })
    );
  });

  it("rejects malformed create responses instead of returning an unsafe token", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ token: "short" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));

    await expect(createBookingDeliveryViaGateway({
      customerName: "Sarah Taylor",
      customerPhone: "+61424463268",
      fetchImpl,
    })).rejects.toThrow(/invalid token/i);
  });

  it("forwards only the opaque token when sending the booking link", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "sent" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));

    await expect(sendBookingLinkViaGateway({
      token: "b".repeat(64),
      fetchImpl,
    })).resolves.toEqual({ status: "sent" });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://leads.concreteconceptsgroup.com/api/public/booking-link/send",
      expect.objectContaining({ body: JSON.stringify({ token: "b".repeat(64) }) })
    );
  });

  it("maps unavailable gateway responses to the safe direct-booking fallback", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "unavailable" }), {
      status: 503,
      headers: { "content-type": "application/json" },
    }));

    await expect(sendBookingLinkViaGateway({
      token: "c".repeat(64),
      fetchImpl,
    })).resolves.toEqual({ status: "unavailable" });
  });
});
