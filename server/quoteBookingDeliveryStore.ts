import { and, eq, or, sql } from "drizzle-orm";
import { jobTimelineEvents, quoteBookingDeliveries, quoteRequests } from "../drizzle/schema";
import type { getDb } from "./db";
import {
  createBookingDeliveryToken,
  type BookingDeliveryStore,
} from "./quoteBookingSms";

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export async function createQuoteBookingDelivery(
  db: Database,
  quoteRequestId: number,
  now = new Date()
): Promise<string> {
  const created = createBookingDeliveryToken(now);
  await db.insert(quoteBookingDeliveries).values({
    quoteRequestId,
    tokenHash: created.tokenHash,
    expiresAt: created.expiresAt,
    status: "available",
  });
  return created.rawToken;
}

export function createQuoteBookingDeliveryStore(db: Database): BookingDeliveryStore {
  return {
    async findByTokenHash(tokenHash) {
      const rows = await db
        .select({
          id: quoteBookingDeliveries.id,
          quoteRequestId: quoteBookingDeliveries.quoteRequestId,
          status: quoteBookingDeliveries.status,
          expiresAt: quoteBookingDeliveries.expiresAt,
          customerName: quoteRequests.name,
          customerPhone: quoteRequests.phone,
        })
        .from(quoteBookingDeliveries)
        .innerJoin(quoteRequests, eq(quoteBookingDeliveries.quoteRequestId, quoteRequests.id))
        .where(eq(quoteBookingDeliveries.tokenHash, tokenHash))
        .limit(1);

      return rows[0] ?? null;
    },

    async claim(deliveryId, requestedAt) {
      const [result] = await db
        .update(quoteBookingDeliveries)
        .set({
          status: "sending",
          requestedAt,
          failedAt: null,
          lastErrorClass: null,
          attemptCount: sql`${quoteBookingDeliveries.attemptCount} + 1`,
        })
        .where(and(
          eq(quoteBookingDeliveries.id, deliveryId),
          or(
            eq(quoteBookingDeliveries.status, "available"),
            eq(quoteBookingDeliveries.status, "failed")
          )
        ));

      if (Number(result.affectedRows) !== 1) return false;

      const deliveryRows = await db
        .select({ quoteRequestId: quoteBookingDeliveries.quoteRequestId })
        .from(quoteBookingDeliveries)
        .where(eq(quoteBookingDeliveries.id, deliveryId))
        .limit(1);
      const quoteRequestId = deliveryRows[0]?.quoteRequestId;
      if (quoteRequestId) {
        try {
          await db.insert(jobTimelineEvents).values({
            quoteRequestId,
            eventType: "note_added",
            description: "Customer requested the site-inspection booking link by SMS.",
            metadata: JSON.stringify({ channel: "sms", purpose: "site_inspection_booking" }),
            source: "customer",
          });
        } catch {
          // Audit logging must not block an already-claimed customer delivery.
        }
      }

      return true;
    },

    async markSent(deliveryId, providerMessageId, sentAt) {
      await db
        .update(quoteBookingDeliveries)
        .set({
          status: "sent",
          sentAt,
          failedAt: null,
          providerMessageId,
          lastErrorClass: null,
        })
        .where(eq(quoteBookingDeliveries.id, deliveryId));
    },

    async markFailed(deliveryId, errorClass, failedAt) {
      await db
        .update(quoteBookingDeliveries)
        .set({
          status: "failed",
          failedAt,
          providerMessageId: null,
          lastErrorClass: errorClass.slice(0, 100),
        })
        .where(eq(quoteBookingDeliveries.id, deliveryId));
    },

    async markUncertain(deliveryId, errorClass, failedAt) {
      await db
        .update(quoteBookingDeliveries)
        .set({
          status: "uncertain",
          failedAt,
          providerMessageId: null,
          lastErrorClass: errorClass.slice(0, 100),
        })
        .where(eq(quoteBookingDeliveries.id, deliveryId));
    },
  };
}
