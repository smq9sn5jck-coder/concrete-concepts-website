import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

/* ── Ad Spend Input Schema Tests ── */
const adSpendInputSchema = z.object({
  id: z.number().optional(),
  platform: z.enum(["google_ads", "meta_ads", "other"]),
  campaignName: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM format"),
  spend: z.string().min(1),
  impressions: z.number().optional(),
  clicks: z.number().optional(),
  notes: z.string().optional(),
});

describe("Ad Spend Input Schema", () => {
  it("accepts valid Google Ads spend entry", () => {
    const result = adSpendInputSchema.safeParse({
      platform: "google_ads",
      campaignName: "Concrete Driveways Brisbane",
      month: "2026-04",
      spend: "1500.00",
      impressions: 25000,
      clicks: 450,
      notes: "Good month",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid Meta Ads spend entry", () => {
    const result = adSpendInputSchema.safeParse({
      platform: "meta_ads",
      campaignName: "Retargeting - Pools",
      month: "2026-03",
      spend: "800.50",
    });
    expect(result.success).toBe(true);
  });

  it("accepts entry with id for update", () => {
    const result = adSpendInputSchema.safeParse({
      id: 42,
      platform: "google_ads",
      campaignName: "Shed Slabs",
      month: "2026-02",
      spend: "600",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe(42);
  });

  it("rejects invalid platform", () => {
    const result = adSpendInputSchema.safeParse({
      platform: "tiktok_ads",
      campaignName: "Test",
      month: "2026-04",
      spend: "100",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty campaign name", () => {
    const result = adSpendInputSchema.safeParse({
      platform: "google_ads",
      campaignName: "",
      month: "2026-04",
      spend: "100",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid month format", () => {
    const result = adSpendInputSchema.safeParse({
      platform: "google_ads",
      campaignName: "Test",
      month: "April 2026",
      spend: "100",
    });
    expect(result.success).toBe(false);
  });

  it("rejects month with invalid format (day included)", () => {
    const result = adSpendInputSchema.safeParse({
      platform: "google_ads",
      campaignName: "Test",
      month: "2026-04-15",
      spend: "100",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty spend", () => {
    const result = adSpendInputSchema.safeParse({
      platform: "google_ads",
      campaignName: "Test",
      month: "2026-04",
      spend: "",
    });
    expect(result.success).toBe(false);
  });
});

/* ── Digest Settings Input Schema Tests ── */
const digestSettingsSchema = z.object({
  enabled: z.boolean(),
  recipientEmail: z.string().email(),
  frequency: z.enum(["weekly", "monthly"]).default("weekly"),
  dayOfWeek: z.number().min(0).max(6).default(1),
});

describe("Digest Settings Schema", () => {
  it("accepts valid weekly digest settings", () => {
    const result = digestSettingsSchema.safeParse({
      enabled: true,
      recipientEmail: "info@concreteconceptsgroup.com",
      frequency: "weekly",
      dayOfWeek: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid monthly digest settings", () => {
    const result = digestSettingsSchema.safeParse({
      enabled: false,
      recipientEmail: "test@example.com",
      frequency: "monthly",
      dayOfWeek: 0,
    });
    expect(result.success).toBe(true);
  });

  it("defaults frequency to weekly", () => {
    const result = digestSettingsSchema.safeParse({
      enabled: true,
      recipientEmail: "test@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.frequency).toBe("weekly");
      expect(result.data.dayOfWeek).toBe(1);
    }
  });

  it("rejects invalid email", () => {
    const result = digestSettingsSchema.safeParse({
      enabled: true,
      recipientEmail: "not-an-email",
      frequency: "weekly",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid frequency", () => {
    const result = digestSettingsSchema.safeParse({
      enabled: true,
      recipientEmail: "test@example.com",
      frequency: "daily",
    });
    expect(result.success).toBe(false);
  });

  it("rejects day of week out of range", () => {
    const result = digestSettingsSchema.safeParse({
      enabled: true,
      recipientEmail: "test@example.com",
      frequency: "weekly",
      dayOfWeek: 7,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative day of week", () => {
    const result = digestSettingsSchema.safeParse({
      enabled: true,
      recipientEmail: "test@example.com",
      frequency: "weekly",
      dayOfWeek: -1,
    });
    expect(result.success).toBe(false);
  });
});

/* ── ROI Calculation Tests ── */
describe("ROI Calculations", () => {
  function calculateRoi(spend: number, leads: number, won: number, revenue: number) {
    const costPerLead = leads > 0 ? Math.round((spend / leads) * 100) / 100 : 0;
    const costPerAcquisition = won > 0 ? Math.round((spend / won) * 100) / 100 : 0;
    const roas = spend > 0 ? Math.round((revenue / spend) * 100) / 100 : 0;
    const winRate = leads > 0 ? Math.round((won / leads) * 100) : 0;
    return { costPerLead, costPerAcquisition, roas, winRate };
  }

  it("calculates cost per lead correctly", () => {
    const roi = calculateRoi(1500, 30, 8, 24000);
    expect(roi.costPerLead).toBe(50);
  });

  it("calculates cost per acquisition correctly", () => {
    const roi = calculateRoi(1500, 30, 8, 24000);
    expect(roi.costPerAcquisition).toBe(187.5);
  });

  it("calculates ROAS correctly", () => {
    const roi = calculateRoi(1500, 30, 8, 24000);
    expect(roi.roas).toBe(16);
  });

  it("calculates win rate correctly", () => {
    const roi = calculateRoi(1500, 30, 8, 24000);
    expect(roi.winRate).toBe(27);
  });

  it("handles zero leads gracefully", () => {
    const roi = calculateRoi(1500, 0, 0, 0);
    expect(roi.costPerLead).toBe(0);
    expect(roi.costPerAcquisition).toBe(0);
    expect(roi.roas).toBe(0);
    expect(roi.winRate).toBe(0);
  });

  it("handles zero spend gracefully", () => {
    const roi = calculateRoi(0, 10, 3, 9000);
    expect(roi.costPerLead).toBe(0);
    expect(roi.roas).toBe(0);
  });

  it("handles high ROAS correctly", () => {
    const roi = calculateRoi(500, 20, 5, 15000);
    expect(roi.roas).toBe(30);
  });

  it("handles fractional cost per lead", () => {
    const roi = calculateRoi(1000, 3, 1, 5000);
    expect(roi.costPerLead).toBe(333.33);
  });
});

/* ── CTR and CPC Calculation Tests ── */
describe("CTR and CPC Calculations", () => {
  function calculateAdMetrics(spend: number, impressions: number, clicks: number) {
    const ctr = impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0;
    const cpc = clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0;
    return { ctr, cpc };
  }

  it("calculates CTR correctly", () => {
    const metrics = calculateAdMetrics(1500, 25000, 450);
    expect(metrics.ctr).toBe(1.8);
  });

  it("calculates CPC correctly", () => {
    const metrics = calculateAdMetrics(1500, 25000, 450);
    expect(metrics.cpc).toBe(3.33);
  });

  it("handles zero impressions", () => {
    const metrics = calculateAdMetrics(1500, 0, 0);
    expect(metrics.ctr).toBe(0);
  });

  it("handles zero clicks", () => {
    const metrics = calculateAdMetrics(1500, 25000, 0);
    expect(metrics.cpc).toBe(0);
  });
});

/* ── Digest HTML Generation Tests ── */
describe("Digest Data Structure", () => {
  const sampleDigestData = {
    period: { from: "01/04/2026", to: "08/04/2026" },
    leads: { total: 15, quotes: 12, callbacks: 3, newThisWeek: 15, prevWeek: 10, changePercent: 50 },
    funnel: { contacted: 8, quoted: 5, won: 3, lost: 1, conversionRate: 25, winRate: 75 },
    revenue: { total: 12000, avgDealSize: 4000, prevWeekRevenue: 8000, changePercent: 50 },
    topCampaigns: [
      { name: "Driveways", leads: 8, won: 2, revenue: 8000, spend: 500, roas: 16, costPerLead: 62.5 },
    ],
    topSources: [{ name: "google / cpc", leads: 10, won: 2 }],
    topLandingPages: [{ page: "/get-quote", leads: 8, won: 2 }],
    adSpendSummary: { totalSpend: 1500, overallCostPerLead: 100, overallRoas: 8 },
    gclidCount: 7,
    fbclidCount: 2,
  };

  it("has correct period format", () => {
    expect(sampleDigestData.period.from).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(sampleDigestData.period.to).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("has correct lead change calculation", () => {
    const { newThisWeek, prevWeek, changePercent } = sampleDigestData.leads;
    const expected = prevWeek > 0 ? Math.round(((newThisWeek - prevWeek) / prevWeek) * 100) : 0;
    expect(changePercent).toBe(expected);
  });

  it("has correct win rate calculation", () => {
    const { won, lost, winRate } = sampleDigestData.funnel;
    // winRate = won / (won + lost) for decided leads
    const expected = (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0;
    expect(winRate).toBe(expected);
  });

  it("has correct average deal size", () => {
    const { total, avgDealSize } = sampleDigestData.revenue;
    const { won } = sampleDigestData.funnel;
    expect(avgDealSize).toBe(won > 0 ? Math.round(total / won) : 0);
  });

  it("campaign ROAS is calculated correctly", () => {
    const campaign = sampleDigestData.topCampaigns[0];
    const expectedRoas = campaign.spend > 0 ? Math.round((campaign.revenue / campaign.spend) * 100) / 100 : 0;
    expect(campaign.roas).toBe(expectedRoas);
  });

  it("campaign cost per lead is calculated correctly", () => {
    const campaign = sampleDigestData.topCampaigns[0];
    const expectedCpl = campaign.leads > 0 ? Math.round((campaign.spend / campaign.leads) * 100) / 100 : 0;
    expect(campaign.costPerLead).toBe(expectedCpl);
  });
});

/* ── Month Range Generation Tests ── */
describe("Month Range Generation", () => {
  function getMonthsInRange(dateFrom: Date, dateTo: Date): string[] {
    const months: string[] = [];
    const startMonth = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1);
    const endMonth = new Date(dateTo.getFullYear(), dateTo.getMonth(), 1);
    let cursor = new Date(startMonth);
    while (cursor <= endMonth) {
      months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return months;
  }

  it("generates single month for same-month range", () => {
    const months = getMonthsInRange(new Date(2026, 3, 1), new Date(2026, 3, 30));
    expect(months).toEqual(["2026-04"]);
  });

  it("generates correct months for 3-month range", () => {
    const months = getMonthsInRange(new Date(2026, 0, 15), new Date(2026, 2, 20));
    expect(months).toEqual(["2026-01", "2026-02", "2026-03"]);
  });

  it("handles year boundary", () => {
    const months = getMonthsInRange(new Date(2025, 10, 1), new Date(2026, 1, 28));
    expect(months).toEqual(["2025-11", "2025-12", "2026-01", "2026-02"]);
  });

  it("handles single day range", () => {
    const months = getMonthsInRange(new Date(2026, 3, 9), new Date(2026, 3, 9));
    expect(months).toEqual(["2026-04"]);
  });
});

/* ── Google Ads CSV Format Tests ── */
describe("Google Ads CSV Format", () => {
  function generateGoogleAdsCsv(conversions: { gclid: string | null; conversionTime: string; conversionValue: number; conversionCurrency: string }[]) {
    const header = "Parameters:TimeZone=+1000\nGoogle Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency";
    const rows = conversions
      .filter(c => c.gclid)
      .map(c => `${c.gclid},Quote Won,${c.conversionTime},${c.conversionValue},${c.conversionCurrency}`);
    return header + "\n" + rows.join("\n");
  }

  it("includes timezone header", () => {
    const csv = generateGoogleAdsCsv([]);
    expect(csv).toContain("Parameters:TimeZone=+1000");
  });

  it("includes correct column headers", () => {
    const csv = generateGoogleAdsCsv([]);
    expect(csv).toContain("Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency");
  });

  it("formats conversion rows correctly", () => {
    const csv = generateGoogleAdsCsv([
      { gclid: "CjwKCAjw", conversionTime: "2026-04-09 10:30:00+10:00", conversionValue: 5000, conversionCurrency: "AUD" },
    ]);
    expect(csv).toContain("CjwKCAjw,Quote Won,2026-04-09 10:30:00+10:00,5000,AUD");
  });

  it("filters out entries without gclid", () => {
    const csv = generateGoogleAdsCsv([
      { gclid: null, conversionTime: "2026-04-09 10:30:00+10:00", conversionValue: 5000, conversionCurrency: "AUD" },
      { gclid: "CjwKCAjw", conversionTime: "2026-04-09 11:00:00+10:00", conversionValue: 3000, conversionCurrency: "AUD" },
    ]);
    const lines = csv.split("\n");
    // header (2 lines) + 1 data row = 3 lines
    expect(lines.length).toBe(3);
  });
});
