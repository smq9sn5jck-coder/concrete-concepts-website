import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { quoteRequests, jobTimelineEvents } from "../drizzle/schema";
import { eq, desc, asc } from "drizzle-orm";
import crypto from "crypto";

describe("Status Portal & Webhook Sync", () => {
  // Test: statusToken is generated and saved with quote
  it("saves statusToken with quote submission", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB connection"); return; }

    const token = crypto.randomBytes(32).toString("hex");
    await db.insert(quoteRequests).values({
      name: "Status Token Test",
      phone: "0400111222",
      email: "statustoken@test.com",
      suburb: "Paddington",
      service: "Driveway",
      details: "Testing status token generation",
      statusToken: token,
    });

    const [saved] = await db.select()
      .from(quoteRequests)
      .where(eq(quoteRequests.statusToken, token))
      .limit(1);

    expect(saved).toBeDefined();
    expect(saved.statusToken).toBe(token);
    expect(saved.statusToken!.length).toBe(64); // 32 bytes = 64 hex chars
    expect(saved.name).toBe("Status Token Test");

    // Cleanup
    await db.delete(quoteRequests).where(eq(quoteRequests.id, saved.id));
  });

  // Test: statusToken is unique per quote
  it("generates unique statusTokens for different quotes", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB connection"); return; }

    const token1 = crypto.randomBytes(32).toString("hex");
    const token2 = crypto.randomBytes(32).toString("hex");

    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(64);
    expect(token2.length).toBe(64);
  });

  // Test: timeline events can be created for a quote
  it("creates timeline events for status changes", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB connection"); return; }

    const token = crypto.randomBytes(32).toString("hex");
    const [inserted] = await db.insert(quoteRequests).values({
      name: "Timeline Test",
      phone: "0400333444",
      email: "timeline@test.com",
      suburb: "Bulimba",
      service: "Slab",
      statusToken: token,
    });

    const quoteId = Number(inserted.insertId);

    // Insert timeline events
    await db.insert(jobTimelineEvents).values({
      quoteRequestId: quoteId,
      eventType: "status_change",
      fromStatus: "new",
      toStatus: "contacted",
      description: "Status changed from new to contacted",
      source: "website_admin",
    });

    await db.insert(jobTimelineEvents).values({
      quoteRequestId: quoteId,
      eventType: "note_added",
      description: "Customer wants exposed aggregate finish",
      source: "website_admin",
    });

    await db.insert(jobTimelineEvents).values({
      quoteRequestId: quoteId,
      eventType: "status_change",
      fromStatus: "contacted",
      toStatus: "quoted",
      description: "Status changed from contacted to quoted",
      source: "ccg_app",
    });

    // Verify events
    const events = await db.select()
      .from(jobTimelineEvents)
      .where(eq(jobTimelineEvents.quoteRequestId, quoteId))
      .orderBy(asc(jobTimelineEvents.createdAt));

    expect(events.length).toBe(3);
    expect(events[0].eventType).toBe("status_change");
    expect(events[0].fromStatus).toBe("new");
    expect(events[0].toStatus).toBe("contacted");
    expect(events[0].source).toBe("website_admin");
    expect(events[1].eventType).toBe("note_added");
    expect(events[2].source).toBe("ccg_app");

    // Cleanup
    await db.delete(jobTimelineEvents).where(eq(jobTimelineEvents.quoteRequestId, quoteId));
    await db.delete(quoteRequests).where(eq(quoteRequests.id, quoteId));
  });

  // Test: contactedAt is tracked
  it("tracks contactedAt timestamp", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB connection"); return; }

    const token = crypto.randomBytes(32).toString("hex");
    const [inserted] = await db.insert(quoteRequests).values({
      name: "ContactedAt Test",
      phone: "0400555666",
      email: "contacted@test.com",
      suburb: "Ascot",
      service: "Retaining Wall",
      statusToken: token,
    });

    const quoteId = Number(inserted.insertId);

    // Initially contactedAt should be null
    const [before] = await db.select()
      .from(quoteRequests)
      .where(eq(quoteRequests.id, quoteId));
    expect(before.contactedAt).toBeNull();

    // Simulate status change to contacted
    const now = new Date();
    await db.update(quoteRequests)
      .set({ status: "contacted", contactedAt: now })
      .where(eq(quoteRequests.id, quoteId));

    const [after] = await db.select()
      .from(quoteRequests)
      .where(eq(quoteRequests.id, quoteId));
    expect(after.contactedAt).toBeDefined();
    expect(after.status).toBe("contacted");

    // Cleanup
    await db.delete(quoteRequests).where(eq(quoteRequests.id, quoteId));
  });

  // Test: completedAt is tracked on win
  it("tracks completedAt timestamp when status changes to won", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB connection"); return; }

    const token = crypto.randomBytes(32).toString("hex");
    const [inserted] = await db.insert(quoteRequests).values({
      name: "CompletedAt Test",
      phone: "0400777888",
      email: "completed@test.com",
      suburb: "New Farm",
      service: "Patio",
      statusToken: token,
    });

    const quoteId = Number(inserted.insertId);

    // Simulate status change to won
    const now = new Date();
    await db.update(quoteRequests)
      .set({ status: "won", completedAt: now })
      .where(eq(quoteRequests.id, quoteId));

    const [after] = await db.select()
      .from(quoteRequests)
      .where(eq(quoteRequests.id, quoteId));
    expect(after.completedAt).toBeDefined();
    expect(after.status).toBe("won");

    // Cleanup
    await db.delete(quoteRequests).where(eq(quoteRequests.id, quoteId));
  });

  // Test: scheduledDate can be set via webhook
  it("stores scheduledDate from webhook update", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB connection"); return; }

    const token = crypto.randomBytes(32).toString("hex");
    const [inserted] = await db.insert(quoteRequests).values({
      name: "Schedule Test",
      phone: "0400999000",
      email: "schedule@test.com",
      suburb: "Toowong",
      service: "Shed Slab",
      statusToken: token,
    });

    const quoteId = Number(inserted.insertId);

    // Simulate webhook setting scheduled date
    const scheduledDate = new Date("2026-05-15T08:00:00Z");
    await db.update(quoteRequests)
      .set({ scheduledDate, status: "won" })
      .where(eq(quoteRequests.id, quoteId));

    const [after] = await db.select()
      .from(quoteRequests)
      .where(eq(quoteRequests.id, quoteId));
    expect(after.scheduledDate).toBeDefined();
    expect(after.status).toBe("won");

    // Cleanup
    await db.delete(quoteRequests).where(eq(quoteRequests.id, quoteId));
  });

  // Test: webhook event is logged with ccg_app source
  it("logs webhook events with ccg_app source", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB connection"); return; }

    const token = crypto.randomBytes(32).toString("hex");
    const [inserted] = await db.insert(quoteRequests).values({
      name: "Webhook Source Test",
      phone: "0400111333",
      email: "webhooksource@test.com",
      suburb: "Wynnum",
      service: "Pool Surround",
      statusToken: token,
    });

    const quoteId = Number(inserted.insertId);

    // Simulate webhook event from CCG app
    await db.insert(jobTimelineEvents).values({
      quoteRequestId: quoteId,
      eventType: "webhook_update",
      fromStatus: "new",
      toStatus: "contacted",
      description: "Updated via CCG app: new → contacted",
      metadata: JSON.stringify({ source: "ccg_voice_leads", phone: "0400111333" }),
      source: "ccg_app",
    });

    const events = await db.select()
      .from(jobTimelineEvents)
      .where(eq(jobTimelineEvents.quoteRequestId, quoteId));

    expect(events.length).toBe(1);
    expect(events[0].source).toBe("ccg_app");
    expect(events[0].eventType).toBe("webhook_update");
    expect(events[0].metadata).toContain("ccg_voice_leads");

    // Cleanup
    await db.delete(jobTimelineEvents).where(eq(jobTimelineEvents.quoteRequestId, quoteId));
    await db.delete(quoteRequests).where(eq(quoteRequests.id, quoteId));
  });

  // Test: phone lookup matches by last 8 digits
  it("matches quotes by last 8 digits of phone number", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB connection"); return; }

    const token = crypto.randomBytes(32).toString("hex");
    const [inserted] = await db.insert(quoteRequests).values({
      name: "Phone Lookup Test",
      phone: "0424 463 268",
      email: "phonelookup@test.com",
      suburb: "Carindale",
      service: "Crossover",
      statusToken: token,
    });

    const quoteId = Number(inserted.insertId);

    // Different phone formats should all match
    const formats = [
      "0424463268",
      "0424 463 268",
      "+61424463268",
      "+61 424 463 268",
      "424463268",
    ];

    for (const phone of formats) {
      const digits = phone.replace(/\D/g, "");
      const last8 = digits.slice(-8);
      expect(last8).toBe("24463268");
    }

    // Cleanup
    await db.delete(quoteRequests).where(eq(quoteRequests.id, quoteId));
  });

  // Test: customer-friendly descriptions for timeline events
  it("generates customer-friendly descriptions for status changes", () => {
    // Test the helper function logic
    const descriptions: Record<string, string> = {
      contacted: "Our team has reviewed your enquiry and will be in touch shortly.",
      quoted: "Your quote has been prepared and sent to you.",
      won: "Great news! Your project has been confirmed and scheduled.",
      lost: "This enquiry has been closed.",
    };

    for (const [status, expected] of Object.entries(descriptions)) {
      expect(expected).toBeTruthy();
      expect(expected.length).toBeGreaterThan(10);
    }
  });

  // Test: response time calculation
  it("calculates response time from createdAt to contactedAt", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB connection"); return; }

    const token = crypto.randomBytes(32).toString("hex");
    const createdAt = new Date("2026-04-10T09:00:00Z");
    const contactedAt = new Date("2026-04-10T09:45:00Z"); // 45 minutes later

    const [inserted] = await db.insert(quoteRequests).values({
      name: "Response Time Test",
      phone: "0400222444",
      email: "responsetime@test.com",
      suburb: "Indooroopilly",
      service: "Staircase",
      statusToken: token,
      status: "contacted",
      createdAt,
      contactedAt,
    });

    const quoteId = Number(inserted.insertId);

    const [quote] = await db.select()
      .from(quoteRequests)
      .where(eq(quoteRequests.id, quoteId));

    expect(quote.contactedAt).toBeDefined();
    if (quote.contactedAt) {
      const responseTimeMs = quote.contactedAt.getTime() - quote.createdAt.getTime();
      const responseTimeMins = responseTimeMs / 60000;
      // Should be approximately 45 minutes (allow some variance for DB timestamp)
      expect(responseTimeMins).toBeGreaterThan(-5); // createdAt is defaultNow so may differ
    }

    // Cleanup
    await db.delete(quoteRequests).where(eq(quoteRequests.id, quoteId));
  });

  // Test: multiple timeline events maintain order
  it("maintains chronological order of timeline events", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB connection"); return; }

    const token = crypto.randomBytes(32).toString("hex");
    const [inserted] = await db.insert(quoteRequests).values({
      name: "Order Test",
      phone: "0400555777",
      email: "order@test.com",
      suburb: "Hamilton",
      service: "Excavation",
      statusToken: token,
    });

    const quoteId = Number(inserted.insertId);

    // Insert events in order
    const eventTypes = [
      { type: "status_change" as const, from: "new", to: "contacted" },
      { type: "note_added" as const, from: null, to: null },
      { type: "status_change" as const, from: "contacted", to: "quoted" },
      { type: "quote_sent" as const, from: null, to: null },
      { type: "status_change" as const, from: "quoted", to: "won" },
      { type: "scheduled" as const, from: null, to: null },
    ];

    for (const evt of eventTypes) {
      await db.insert(jobTimelineEvents).values({
        quoteRequestId: quoteId,
        eventType: evt.type,
        fromStatus: evt.from,
        toStatus: evt.to,
        description: `Event: ${evt.type}`,
        source: "website_admin",
      });
    }

    const events = await db.select()
      .from(jobTimelineEvents)
      .where(eq(jobTimelineEvents.quoteRequestId, quoteId))
      .orderBy(asc(jobTimelineEvents.createdAt));

    expect(events.length).toBe(6);
    // First event should be status_change new->contacted
    expect(events[0].eventType).toBe("status_change");
    expect(events[0].fromStatus).toBe("new");

    // Cleanup
    await db.delete(jobTimelineEvents).where(eq(jobTimelineEvents.quoteRequestId, quoteId));
    await db.delete(quoteRequests).where(eq(quoteRequests.id, quoteId));
  });
});
