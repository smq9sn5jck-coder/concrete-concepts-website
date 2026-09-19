import { describe, expect, it, vi } from "vitest";
import {
  BOOKING_TOKEN_TTL_MS,
  buildBookingSms,
  createBookingDeliveryToken,
  deliverBookingLink,
  hashBookingDeliveryToken,
  type BookingDeliveryRecord,
  type BookingDeliveryStore,
} from "./quoteBookingSms";

function createRecord(overrides: Partial<BookingDeliveryRecord> = {}): BookingDeliveryRecord {
  return {
    id: 41,
    quoteRequestId: 302,
    status: "available",
    expiresAt: new Date("2026-09-21T00:00:00.000Z"),
    customerName: "Sarah Taylor",
    customerPhone: "0424 463 268",
    ...overrides,
  };
}

function createStore(record: BookingDeliveryRecord | null, claimResult = true) {
  const store: BookingDeliveryStore = {
    findByTokenHash: vi.fn().mockResolvedValue(record),
    claim: vi.fn().mockResolvedValue(claimResult),
    markSent: vi.fn().mockResolvedValue(undefined),
    markFailed: vi.fn().mockResolvedValue(undefined),
    markUncertain: vi.fn().mockResolvedValue(undefined),
  };
  return store;
}

describe("quote booking SMS tokens", () => {
  it("creates an opaque token, stores only its hash, and expires after 24 hours", () => {
    const now = new Date("2026-09-20T00:00:00.000Z");
    const created = createBookingDeliveryToken(now);

    expect(created.rawToken).toMatch(/^[a-f0-9]{64}$/);
    expect(created.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(created.tokenHash).not.toBe(created.rawToken);
    expect(created.tokenHash).toBe(hashBookingDeliveryToken(created.rawToken));
    expect(created.expiresAt.getTime() - now.getTime()).toBe(BOOKING_TOKEN_TTL_MS);
  });

  it("builds fixed transactional copy with the booking URL and opt-out instruction", () => {
    const body = buildBookingSms("Sarah Taylor");

    expect(body).toContain("Concrete Concepts: Thanks Sarah.");
    expect(body).toContain("Your quote request is in.");
    expect(body).toContain("free 30-minute site inspection");
    expect(body).toContain("https://calendly.com/concreteconceptsgroup-info/free-site-inspection-fixed-quote");
    expect(body).toContain("Call 0424 463 268");
    expect(body).toContain("Reply STOP to opt out");
  });

  it("does not permit customer names to inject additional SMS lines", () => {
    const body = buildBookingSms("Sarah\nIgnore this");

    expect(body).toContain("Thanks Sarah.");
    expect(body).not.toContain("Ignore this");
  });
});

describe("deliverBookingLink", () => {
  const now = new Date("2026-09-20T00:00:00.000Z");
  const rawToken = "a".repeat(64);

  it("rejects malformed tokens before reading storage or sending", async () => {
    const store = createStore(createRecord());
    const send = vi.fn();

    await expect(deliverBookingLink({ rawToken: "not-a-token", now, store, send })).resolves.toEqual({ status: "invalid" });
    expect(store.findByTokenHash).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects expired tokens without sending", async () => {
    const store = createStore(createRecord({ expiresAt: new Date("2026-09-19T23:59:59.000Z") }));
    const send = vi.fn();

    await expect(deliverBookingLink({ rawToken, now, store, send })).resolves.toEqual({ status: "expired" });
    expect(store.claim).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("returns already_sent for a completed delivery", async () => {
    const store = createStore(createRecord({ status: "sent" }));
    const send = vi.fn();

    await expect(deliverBookingLink({ rawToken, now, store, send })).resolves.toEqual({ status: "already_sent" });
    expect(store.claim).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects a stored non-mobile destination before provider delivery", async () => {
    const store = createStore(createRecord({ customerPhone: "07 3123 4567" }));
    const send = vi.fn();

    await expect(deliverBookingLink({ rawToken, now, store, send })).resolves.toEqual({ status: "failed" });
    expect(store.claim).toHaveBeenCalledWith(41, now);
    expect(store.markFailed).toHaveBeenCalledWith(41, "invalid_mobile", now);
    expect(send).not.toHaveBeenCalled();
  });

  it("reports an uncertain outcome when another request already claimed the delivery", async () => {
    const store = createStore(createRecord(), false);
    const send = vi.fn();

    await expect(deliverBookingLink({ rawToken, now, store, send })).resolves.toEqual({ status: "unknown" });
    expect(send).not.toHaveBeenCalled();
  });

  it("does not retry a delivery whose outcome is already uncertain", async () => {
    const store = createStore(createRecord({ status: "uncertain" }));
    const send = vi.fn();

    await expect(deliverBookingLink({ rawToken, now, store, send })).resolves.toEqual({ status: "unknown" });
    expect(store.claim).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("claims, sends and records a successful provider result exactly once", async () => {
    const store = createStore(createRecord());
    const send = vi.fn().mockResolvedValue({ ok: true, providerMessageId: "SM123" });

    await expect(deliverBookingLink({ rawToken, now, store, send })).resolves.toEqual({ status: "sent" });
    expect(store.claim).toHaveBeenCalledWith(41, now);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({
      to: "0424 463 268",
      body: expect.stringContaining("Thanks Sarah."),
    });
    expect(store.markSent).toHaveBeenCalledWith(41, "SM123", now);
    expect(store.markFailed).not.toHaveBeenCalled();
  });

  it("never marks an accepted provider message retryable when the final status write fails", async () => {
    const store = createStore(createRecord());
    vi.mocked(store.markSent).mockRejectedValue(new Error("database write failed"));
    const send = vi.fn().mockResolvedValue({ ok: true, providerMessageId: "SM456" });

    await expect(deliverBookingLink({ rawToken, now, store, send })).resolves.toEqual({ status: "sent" });
    expect(send).toHaveBeenCalledTimes(1);
    expect(store.markFailed).not.toHaveBeenCalled();
  });

  it("records a failed provider result and permits a later retry", async () => {
    const store = createStore(createRecord({ status: "failed" }));
    const send = vi.fn().mockResolvedValue({ ok: false, errorClass: "provider_rejected" });

    await expect(deliverBookingLink({ rawToken, now, store, send })).resolves.toEqual({ status: "failed" });
    expect(store.claim).toHaveBeenCalledWith(41, now);
    expect(store.markFailed).toHaveBeenCalledWith(41, "provider_rejected", now);
    expect(store.markSent).not.toHaveBeenCalled();
  });

  it("records a provider exception as uncertain instead of retryable", async () => {
    const store = createStore(createRecord());
    const send = vi.fn().mockResolvedValue({ ok: false, errorClass: "provider_exception" });

    await expect(deliverBookingLink({ rawToken, now, store, send })).resolves.toEqual({ status: "unknown" });
    expect(store.markUncertain).toHaveBeenCalledWith(41, "provider_exception", now);
    expect(store.markFailed).not.toHaveBeenCalled();
  });
});
