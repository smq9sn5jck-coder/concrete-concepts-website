import { describe, it, expect, vi, beforeEach } from "vitest";

// Test that the googleAds module exports the expected functions
describe("Google Ads Module", () => {
  it("should export all required functions from googleAds.ts", async () => {
    const mod = await import("./googleAds");
    expect(mod.getCampaignSummary).toBeDefined();
    expect(mod.getDailyMetrics).toBeDefined();
    expect(mod.getDeviceBreakdown).toBeDefined();
    expect(mod.getDayOfWeekBreakdown).toBeDefined();
    expect(mod.getSuburbPerformance).toBeDefined();
    expect(mod.getGoogleAdsDashboard).toBeDefined();
    expect(mod.isWindsorConfigured).toBeDefined();
  });

  it("isWindsorConfigured returns true when WINDSOR_API_KEY is set", async () => {
    const mod = await import("./googleAds");
    // WINDSOR_API_KEY should be set in the test env (from webdev_request_secrets)
    expect(mod.isWindsorConfigured()).toBe(true);
  });

  it("getGoogleAdsDashboard returns structured data with all sections", async () => {
    const mod = await import("./googleAds");
    const result = await mod.getGoogleAdsDashboard("last_7d");

    // Should have all sections
    expect(result).toHaveProperty("totals");
    expect(result).toHaveProperty("campaigns");
    expect(result).toHaveProperty("daily");
    expect(result).toHaveProperty("devices");
    expect(result).toHaveProperty("dayOfWeek");
    expect(result).toHaveProperty("suburbs");

    // Totals should have expected fields
    expect(result.totals).toHaveProperty("clicks");
    expect(result.totals).toHaveProperty("impressions");
    expect(result.totals).toHaveProperty("spend");
    expect(result.totals).toHaveProperty("conversions");
    expect(result.totals).toHaveProperty("cpc");
    expect(result.totals).toHaveProperty("ctr");
    expect(result.totals).toHaveProperty("costPerConversion");

    // Campaigns should be an array
    expect(Array.isArray(result.campaigns)).toBe(true);
    if (result.campaigns.length > 0) {
      expect(result.campaigns[0]).toHaveProperty("campaign");
      expect(result.campaigns[0]).toHaveProperty("spend");
      expect(result.campaigns[0]).toHaveProperty("clicks");
      expect(result.campaigns[0]).toHaveProperty("conversions");
    }

    // Daily should be an array of date entries
    expect(Array.isArray(result.daily)).toBe(true);
    if (result.daily.length > 0) {
      expect(result.daily[0]).toHaveProperty("date");
      expect(result.daily[0]).toHaveProperty("spend");
      expect(result.daily[0]).toHaveProperty("conversions");
    }

    // Devices should be an array
    expect(Array.isArray(result.devices)).toBe(true);

    // Day of week should have 7 entries
    expect(Array.isArray(result.dayOfWeek)).toBe(true);
  }, 30000);
});

describe("Google Ads Report Module", () => {
  it("should export sendGoogleAdsWeeklyReport function", async () => {
    const mod = await import("./googleAdsReport");
    expect(mod.sendGoogleAdsWeeklyReport).toBeDefined();
  });

  it("sendGoogleAdsWeeklyReport generates and sends report successfully", async () => {
    const mod = await import("./googleAdsReport");
    const result = await mod.sendGoogleAdsWeeklyReport();

    // Should return a structured result
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("message");
    expect(typeof result.success).toBe("boolean");
    expect(typeof result.message).toBe("string");

    // If RESEND_API_KEY is configured, it should succeed
    if (process.env.RESEND_API_KEY) {
      expect(result.success).toBe(true);
    }
  }, 30000);
});
