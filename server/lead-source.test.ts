import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { quoteRequests } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

describe("Lead Source Tracking", () => {
  it("saves lead source data with quote submission", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Skipping: no DB connection");
      return;
    }

    // Insert a test quote with lead source data
    await db.insert(quoteRequests).values({
      name: "Lead Source Test",
      phone: "0400000000",
      email: "leadsource@test.com",
      suburb: "Test Suburb",
      service: "Driveway",
      details: "Testing lead source tracking",
      leadSource: "Google Ads",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "brisbane-driveways-2026",
      utmTerm: "concrete driveway brisbane",
      referrer: "https://www.google.com.au/",
      landingPage: "/services/concrete-driveways-brisbane?utm_source=google&utm_medium=cpc",
    });

    // Verify the data was saved correctly
    const results = await db
      .select()
      .from(quoteRequests)
      .where(eq(quoteRequests.email, "leadsource@test.com"))
      .orderBy(desc(quoteRequests.id))
      .limit(1);

    expect(results.length).toBe(1);
    const quote = results[0];
    expect(quote.leadSource).toBe("Google Ads");
    expect(quote.utmSource).toBe("google");
    expect(quote.utmMedium).toBe("cpc");
    expect(quote.utmCampaign).toBe("brisbane-driveways-2026");
    expect(quote.utmTerm).toBe("concrete driveway brisbane");
    expect(quote.referrer).toBe("https://www.google.com.au/");
    expect(quote.landingPage).toContain("/services/concrete-driveways-brisbane");

    // Clean up test data
    await db.delete(quoteRequests).where(eq(quoteRequests.email, "leadsource@test.com"));
  });

  it("saves quote without lead source (backward compatible)", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Skipping: no DB connection");
      return;
    }

    // Insert a quote without lead source data (like old submissions)
    await db.insert(quoteRequests).values({
      name: "No Source Test",
      phone: "0400000001",
      email: "nosource@test.com",
      suburb: "Test Suburb",
      service: "Slab",
      details: "Testing backward compatibility",
    });

    const results = await db
      .select()
      .from(quoteRequests)
      .where(eq(quoteRequests.email, "nosource@test.com"))
      .orderBy(desc(quoteRequests.id))
      .limit(1);

    expect(results.length).toBe(1);
    const quote = results[0];
    expect(quote.leadSource).toBeNull();
    expect(quote.utmSource).toBeNull();
    expect(quote.utmMedium).toBeNull();

    // Clean up
    await db.delete(quoteRequests).where(eq(quoteRequests.email, "nosource@test.com"));
  });

  it("handles various lead source types", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Skipping: no DB connection");
      return;
    }

    const sources = [
      { leadSource: "Google Organic", utmSource: null },
      { leadSource: "Facebook Ads", utmSource: "facebook", utmMedium: "cpc" },
      { leadSource: "Instagram", utmSource: "instagram" },
      { leadSource: "Direct", utmSource: null },
      { leadSource: "WhatsApp", utmSource: "whatsapp" },
      { leadSource: "Google Maps", utmSource: "google", utmMedium: "maps" },
    ];

    for (const src of sources) {
      await db.insert(quoteRequests).values({
        name: `Source Test - ${src.leadSource}`,
        phone: "0400000002",
        email: `source-${src.leadSource.toLowerCase().replace(/\s/g, "-")}@test.com`,
        suburb: "Test",
        service: "Test",
        leadSource: src.leadSource,
        utmSource: src.utmSource,
        utmMedium: src.utmMedium ?? null,
      });
    }

    // Verify all were saved
    for (const src of sources) {
      const email = `source-${src.leadSource.toLowerCase().replace(/\s/g, "-")}@test.com`;
      const results = await db
        .select()
        .from(quoteRequests)
        .where(eq(quoteRequests.email, email))
        .limit(1);

      expect(results.length).toBe(1);
      expect(results[0].leadSource).toBe(src.leadSource);

      // Clean up
      await db.delete(quoteRequests).where(eq(quoteRequests.email, email));
    }
  });
});
