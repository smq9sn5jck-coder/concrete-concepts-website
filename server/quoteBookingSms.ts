import crypto from "node:crypto";
import { SITE_INSPECTION_BOOKING_URL } from "@shared/const";
import { validateAustralianPhone } from "@shared/leadValidation";

export { SITE_INSPECTION_BOOKING_URL };
export const BOOKING_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const BOOKING_TOKEN_PATTERN = /^[a-f0-9]{64}$/;

type BookingDeliveryStatus = "available" | "sending" | "sent" | "failed" | "uncertain";

export type BookingDeliveryRecord = {
  id: number;
  quoteRequestId: number;
  status: BookingDeliveryStatus;
  expiresAt: Date;
  customerName: string;
  customerPhone: string;
};

export type BookingSmsProviderResult =
  | { ok: true; providerMessageId: string | null }
  | { ok: false; errorClass: string };

export type BookingDeliveryStore = {
  findByTokenHash: (tokenHash: string) => Promise<BookingDeliveryRecord | null>;
  claim: (deliveryId: number, requestedAt: Date) => Promise<boolean>;
  markSent: (deliveryId: number, providerMessageId: string | null, sentAt: Date) => Promise<void>;
  markFailed: (deliveryId: number, errorClass: string, failedAt: Date) => Promise<void>;
  markUncertain: (deliveryId: number, errorClass: string, failedAt: Date) => Promise<void>;
};

export type BookingDeliveryResult =
  | { status: "sent" }
  | { status: "already_sent" }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "failed" }
  | { status: "unknown" };

export function hashBookingDeliveryToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function createBookingDeliveryToken(now = new Date()) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  return {
    rawToken,
    tokenHash: hashBookingDeliveryToken(rawToken),
    expiresAt: new Date(now.getTime() + BOOKING_TOKEN_TTL_MS),
  };
}

function safeFirstName(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] ?? "there";
  const sanitized = firstWord.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'-]/g, "").slice(0, 40);
  return sanitized || "there";
}

export function buildBookingSms(customerName: string): string {
  return [
    `Concrete Concepts: Thanks ${safeFirstName(customerName)}. Your quote request is in.`,
    `Book your free 30-minute site inspection here: ${SITE_INSPECTION_BOOKING_URL}.`,
    "Questions? Call 0424 463 268. Reply STOP to opt out.",
  ].join(" ");
}

export async function deliverBookingLink(input: {
  rawToken: string;
  now?: Date;
  store: BookingDeliveryStore;
  send: (message: { to: string; body: string }) => Promise<BookingSmsProviderResult>;
}): Promise<BookingDeliveryResult> {
  const now = input.now ?? new Date();

  if (!BOOKING_TOKEN_PATTERN.test(input.rawToken)) {
    return { status: "invalid" };
  }

  const record = await input.store.findByTokenHash(hashBookingDeliveryToken(input.rawToken));
  if (!record) {
    return { status: "invalid" };
  }
  if (record.expiresAt.getTime() <= now.getTime()) {
    return { status: "expired" };
  }
  if (record.status === "sent") {
    return { status: "already_sent" };
  }
  if (record.status === "sending" || record.status === "uncertain") {
    return { status: "unknown" };
  }

  const claimed = await input.store.claim(record.id, now);
  if (!claimed) {
    return { status: "unknown" };
  }

  const phone = validateAustralianPhone(record.customerPhone);
  if (!phone.valid || phone.kind !== "mobile") {
    await input.store.markFailed(record.id, "invalid_mobile", now);
    return { status: "failed" };
  }

  let providerResult: BookingSmsProviderResult;
  try {
    providerResult = await input.send({
      to: record.customerPhone,
      body: buildBookingSms(record.customerName),
    });
  } catch {
    try {
      await input.store.markUncertain(record.id, "provider_exception", now);
    } catch {
      // The row remains in the non-retryable sending state.
    }
    return { status: "unknown" };
  }

  if (!providerResult.ok) {
    if (providerResult.errorClass === "provider_exception") {
      try {
        await input.store.markUncertain(record.id, providerResult.errorClass, now);
      } catch {
        // The row remains in the non-retryable sending state.
      }
      return { status: "unknown" };
    }
    await input.store.markFailed(record.id, providerResult.errorClass, now);
    return { status: "failed" };
  }

  try {
    await input.store.markSent(record.id, providerResult.providerMessageId, now);
  } catch {
    // The provider accepted the message. Leave the row in the non-retryable
    // sending state rather than risk a duplicate SMS after a persistence fault.
  }
  return { status: "sent" };
}
