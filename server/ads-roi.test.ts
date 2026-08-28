import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { quoteRequests, callbackRequests } from "../drizzle/schema";
import { eq, and, like } from "drizzle-orm";

const TEST_PREFIX = "adsroi_test_";

describe("Google Ads ROI Report & Offline Conversion Export", () => {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Seed test data: quotes with various UTM/gclid/fbclid combinations
    const testQuotes = [
      {
        name: `${TEST_PREFIX}google_won`,
        phone: "0400000100",
        email: `${TEST_PREFIX}google_won@test.com`,
        suburb: "Brisbane",
        service: "Driveway",
        details: "Test",
        leadSource: "Google Ads",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "brisbane-driveways",
        utmTerm: "concrete driveway",
        utmContent: "ad-variant-a",
        gclid: "CjwKCAtest123abc",
        fbclid: null,
        referrer: "https://www.google.com.au/",
        landingPage: "/services/driveways",
        status: "won" as const,
        quotedAmount: "5500",
      },
      {
        name: `${TEST_PREFIX}google_quoted`,
        phone: "0400000101",
        email: `${TEST_PREFIX}google_quoted@test.com`,
        suburb: "Gold Coast",
        service: "Slab",
        details: "Test",
        leadSource: "Google Ads",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "brisbane-driveways",
        utmTerm: "concrete slab",
        utmContent: "ad-variant-b",
        gclid: "CjwKCAtest456def",
        fbclid: null,
        referrer: "https://www.google.com.au/",
        landingPage: "/services/slabs",
        status: "quoted" as const,
        quotedAmount: "8000",
      },
      {
        name: `${TEST_PREFIX}facebook_won`,
        phone: "0400000102",
        email: `${TEST_PREFIX}facebook_won@test.com`,
        suburb: "Ipswich",
        service: "Patio",
        details: "Test",
        leadSource: "Facebook Ads",
        utmSource: "facebook",
        utmMedium: "cpc",
        utmCampaign: "patio-special",
        utmTerm: null,
        utmContent: null,
        gclid: null,
        fbclid: "fb.1.test789ghi",
        referrer: "https://www.facebook.com/",
        landingPage: "/landing/patio-special",
        status: "won" as const,
        quotedAmount: "12000",
      },
      {
        name: `${TEST_PREFIX}organic_new`,
        phone: "0400000103",
        email: `${TEST_PREFIX}organic_new@test.com`,
        suburb: "Logan",
        service: "Retaining Wall",
        details: "Test",
        leadSource: "Google Organic",
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        gclid: null,
        fbclid: null,
        referrer: "https://www.google.com.au/",
        landingPage: "/",
        status: "new" as const,
        quotedAmount: null,
      },
      {
        name: `${TEST_PREFIX}direct_lost`,
        phone: "0400000104",
        email: `${TEST_PREFIX}direct_lost@test.com`,
        suburb: "Redlands",
        service: "Driveway",
        details: "Test",
        leadSource: "Direct",
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        gclid: null,
        fbclid: null,
        referrer: null,
        landingPage: "/get-quote",
        status: "lost" as const,
        quotedAmount: "3000",
      },
    ];

    for (const q of testQuotes) {
      await db.insert(quoteRequests).values(q);
    }

    // Seed test callbacks
    const testCallbacks = [
      {
        name: `${TEST_PREFIX}cb_google`,
        phone: "0400000200",
        page: "/services/driveways",
        leadSource: "Google Ads",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "brisbane-driveways",
        utmTerm: null,
        utmContent: null,
        gclid: "CjwKCAtest_cb_001",
        fbclid: null,
        referrer: "https://www.google.com.au/",
        landingPage: "/services/driveways",
        status: "completed" as const,
      },
      {
        name: `${TEST_PREFIX}cb_direct`,
        phone: "0400000201",
        page: "/",
        leadSource: "callback_widget",
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        gclid: null,
        fbclid: null,
        referrer: null,
        landingPage: "/",
        status: "pending" as const,
      },
    ];

    for (const cb of testCallbacks) {
      await db.insert(callbackRequests).values(cb);
    }
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Clean up all test data
    await db.delete(quoteRequests).where(like(quoteRequests.name, `${TEST_PREFIX}%`));
    await db.delete(callbackRequests).where(like(callbackRequests.name, `${TEST_PREFIX}%`));
  });

  it("stores gclid, fbclid, and utmContent in quote_requests", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const results = await db.select().from(quoteRequests)
      .where(eq(quoteRequests.email, `${TEST_PREFIX}google_won@test.com`))
      .limit(1);

    expect(results.length).toBe(1);
    expect(results[0].gclid).toBe("CjwKCAtest123abc");
    expect(results[0].utmContent).toBe("ad-variant-a");
    expect(results[0].fbclid).toBeNull();
  });

  it("stores fbclid in quote_requests", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const results = await db.select().from(quoteRequests)
      .where(eq(quoteRequests.email, `${TEST_PREFIX}facebook_won@test.com`))
      .limit(1);

    expect(results.length).toBe(1);
    expect(results[0].fbclid).toBe("fb.1.test789ghi");
    expect(results[0].gclid).toBeNull();
  });

  it("stores gclid in callback_requests", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const results = await db.select().from(callbackRequests)
      .where(eq(callbackRequests.name, `${TEST_PREFIX}cb_google`))
      .limit(1);

    expect(results.length).toBe(1);
    expect(results[0].gclid).toBe("CjwKCAtest_cb_001");
    expect(results[0].utmCampaign).toBe("brisbane-driveways");
  });

  it("can query quotes by campaign for ROI aggregation", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const allQuotes = await db.select().from(quoteRequests)
      .where(like(quoteRequests.name, `${TEST_PREFIX}%`));

    // Aggregate by campaign
    const campaignMap: Record<string, { leads: number; won: number; revenue: number }> = {};
    for (const q of allQuotes) {
      const campaign = q.utmCampaign || "(no campaign)";
      if (!campaignMap[campaign]) campaignMap[campaign] = { leads: 0, won: 0, revenue: 0 };
      campaignMap[campaign].leads++;
      if (q.status === "won") {
        campaignMap[campaign].won++;
        campaignMap[campaign].revenue += parseFloat(q.quotedAmount || "0");
      }
    }

    // brisbane-driveways campaign should have 2 leads, 1 won, $5500 revenue
    expect(campaignMap["brisbane-driveways"]).toBeDefined();
    expect(campaignMap["brisbane-driveways"].leads).toBe(2);
    expect(campaignMap["brisbane-driveways"].won).toBe(1);
    expect(campaignMap["brisbane-driveways"].revenue).toBe(5500);

    // patio-special campaign should have 1 lead, 1 won, $12000
    expect(campaignMap["patio-special"]).toBeDefined();
    expect(campaignMap["patio-special"].leads).toBe(1);
    expect(campaignMap["patio-special"].won).toBe(1);
    expect(campaignMap["patio-special"].revenue).toBe(12000);
  });

  it("can build conversion funnel from test data", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const allQuotes = await db.select().from(quoteRequests)
      .where(like(quoteRequests.name, `${TEST_PREFIX}%`));

    const total = allQuotes.length;
    const contacted = allQuotes.filter(q => ["contacted", "quoted", "won"].includes(q.status)).length;
    const quoted = allQuotes.filter(q => ["quoted", "won"].includes(q.status)).length;
    const won = allQuotes.filter(q => q.status === "won").length;
    const lost = allQuotes.filter(q => q.status === "lost").length;

    expect(total).toBe(5);
    expect(contacted).toBe(3); // google_won + google_quoted + facebook_won
    expect(quoted).toBe(3); // google_won + google_quoted + facebook_won
    expect(won).toBe(2); // google_won + facebook_won
    expect(lost).toBe(1); // direct_lost
  });

  it("can identify GCLID-attributed leads for offline conversion export", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    // Get all quotes with gclid
    const gclidQuotes = await db.select().from(quoteRequests)
      .where(and(
        like(quoteRequests.name, `${TEST_PREFIX}%`),
        // gclid is not null — we check in JS
      ));

    const withGclid = gclidQuotes.filter(q => q.gclid !== null);
    expect(withGclid.length).toBe(2); // google_won + google_quoted

    // Get won quotes with gclid (for Google Ads upload)
    const wonWithGclid = withGclid.filter(q => q.status === "won");
    expect(wonWithGclid.length).toBe(1);
    expect(wonWithGclid[0].gclid).toBe("CjwKCAtest123abc");
    expect(wonWithGclid[0].quotedAmount).toBe("5500");
  });

  it("can identify FBCLID-attributed leads for Meta conversion export", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const allQuotes = await db.select().from(quoteRequests)
      .where(like(quoteRequests.name, `${TEST_PREFIX}%`));

    const withFbclid = allQuotes.filter(q => q.fbclid !== null);
    expect(withFbclid.length).toBe(1);
    expect(withFbclid[0].fbclid).toBe("fb.1.test789ghi");
    expect(withFbclid[0].status).toBe("won");
  });

  it("can aggregate source/medium breakdown", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const allQuotes = await db.select().from(quoteRequests)
      .where(like(quoteRequests.name, `${TEST_PREFIX}%`));

    const sourceMap: Record<string, number> = {};
    for (const q of allQuotes) {
      const src = q.utmSource ? `${q.utmSource} / ${q.utmMedium || "(none)"}` : (q.leadSource || "Direct");
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    }

    expect(sourceMap["google / cpc"]).toBe(2);
    expect(sourceMap["facebook / cpc"]).toBe(1);
    expect(sourceMap["Google Organic"]).toBe(1);
    expect(sourceMap["Direct"]).toBe(1);
  });

  it("can aggregate landing page performance", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const allQuotes = await db.select().from(quoteRequests)
      .where(like(quoteRequests.name, `${TEST_PREFIX}%`));

    const lpMap: Record<string, { leads: number; won: number }> = {};
    for (const q of allQuotes) {
      const lp = q.landingPage || "(unknown)";
      if (!lpMap[lp]) lpMap[lp] = { leads: 0, won: 0 };
      lpMap[lp].leads++;
      if (q.status === "won") lpMap[lp].won++;
    }

    expect(lpMap["/services/driveways"]).toBeDefined();
    expect(lpMap["/services/driveways"].leads).toBe(1);
    expect(lpMap["/services/driveways"].won).toBe(1);

    expect(lpMap["/landing/patio-special"]).toBeDefined();
    expect(lpMap["/landing/patio-special"].won).toBe(1);
  });

  it("generates valid Google Ads CSV format for offline conversions", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const wonQuotes = await db.select().from(quoteRequests)
      .where(and(
        like(quoteRequests.name, `${TEST_PREFIX}%`),
        eq(quoteRequests.status, "won")
      ));

    // Build CSV rows for Google Ads format
    const rows = wonQuotes
      .filter(q => q.gclid)
      .map(q => ({
        gclid: q.gclid!,
        conversionName: "Quote Won",
        conversionTime: q.updatedAt.toISOString().replace("T", " ").replace(/\.\d+Z$/, "+10:00"),
        conversionValue: parseFloat(q.quotedAmount || "0"),
        conversionCurrency: "AUD",
      }));

    expect(rows.length).toBe(1);
    expect(rows[0].gclid).toBe("CjwKCAtest123abc");
    expect(rows[0].conversionValue).toBe(5500);
    expect(rows[0].conversionCurrency).toBe("AUD");
    expect(rows[0].conversionTime).toContain("+10:00");
  });

  it("handles callbacks in ROI aggregation", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const allCallbacks = await db.select().from(callbackRequests)
      .where(like(callbackRequests.name, `${TEST_PREFIX}%`));

    expect(allCallbacks.length).toBe(2);

    // Aggregate by campaign
    const campaignMap: Record<string, { callbacks: number; completed: number }> = {};
    for (const cb of allCallbacks) {
      const campaign = cb.utmCampaign || "(no campaign)";
      if (!campaignMap[campaign]) campaignMap[campaign] = { callbacks: 0, completed: 0 };
      campaignMap[campaign].callbacks++;
      if (cb.status === "completed") campaignMap[campaign].completed++;
    }

    expect(campaignMap["brisbane-driveways"]).toBeDefined();
    expect(campaignMap["brisbane-driveways"].callbacks).toBe(1);
    expect(campaignMap["brisbane-driveways"].completed).toBe(1);

    expect(campaignMap["(no campaign)"]).toBeDefined();
    expect(campaignMap["(no campaign)"].callbacks).toBe(1);
    expect(campaignMap["(no campaign)"].completed).toBe(0);
  });

  it("calculates win rate correctly", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const allQuotes = await db.select().from(quoteRequests)
      .where(like(quoteRequests.name, `${TEST_PREFIX}%`));

    const won = allQuotes.filter(q => q.status === "won").length;
    const total = allQuotes.length;
    const quoted = allQuotes.filter(q => ["quoted", "won"].includes(q.status)).length;
    const lost = allQuotes.filter(q => q.status === "lost").length;

    const conversionRate = Math.round((won / total) * 100);
    const winRate = Math.round((won / (quoted + lost)) * 100);

    expect(conversionRate).toBe(40); // 2 won out of 5 total
    expect(winRate).toBe(50); // 2 won out of 4 decided (3 quoted + 1 lost, but 2 of quoted are won)
  });

  it("calculates total revenue from won quotes", async () => {
    const db = await getDb();
    if (!db) { console.warn("Skipping: no DB"); return; }

    const wonQuotes = await db.select().from(quoteRequests)
      .where(and(
        like(quoteRequests.name, `${TEST_PREFIX}%`),
        eq(quoteRequests.status, "won")
      ));

    const totalRevenue = wonQuotes.reduce((sum, q) => sum + parseFloat(q.quotedAmount || "0"), 0);
    expect(totalRevenue).toBe(17500); // 5500 + 12000
  });
});
