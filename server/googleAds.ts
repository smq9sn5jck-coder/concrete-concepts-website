/**
 * Google Ads Dashboard — Windsor.ai Integration
 * 
 * Fetches live Google Ads performance data via Windsor.ai REST API.
 * Used by the admin dashboard and automated weekly reports.
 */

const WINDSOR_BASE_URL = "https://connectors.windsor.ai";
const WINDSOR_API_KEY = process.env.WINDSOR_API_KEY ?? "";

// Cache to reduce API calls (5 min TTL per query key)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

interface WindsorQueryParams {
  fields: string[];
  datePreset?: string;
  dateFrom?: string;
  dateTo?: string;
  filter?: any[];
}

async function queryWindsor<T = any[]>(params: WindsorQueryParams): Promise<T> {
  if (!WINDSOR_API_KEY) {
    throw new Error("WINDSOR_API_KEY not configured");
  }

  const url = new URL(`${WINDSOR_BASE_URL}/google_ads`);
  url.searchParams.set("api_key", WINDSOR_API_KEY);
  url.searchParams.set("fields", params.fields.join(","));

  if (params.datePreset) {
    url.searchParams.set("date_preset", params.datePreset);
  }
  if (params.dateFrom) {
    url.searchParams.set("date_from", params.dateFrom);
  }
  if (params.dateTo) {
    url.searchParams.set("date_to", params.dateTo);
  }
  if (params.filter) {
    url.searchParams.set("filter", JSON.stringify(params.filter));
  }

  const cacheKey = url.toString();
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  const response = await fetch(url.toString());
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Windsor API error (${response.status}): ${detail}`);
  }

  const json = await response.json();
  // Windsor returns { data: [...] } or just [...] depending on version
  const data = Array.isArray(json) ? json : (json.data ?? json);
  setCache(cacheKey, data);
  return data as T;
}

// ─── Data Types ───

export interface CampaignSummary {
  campaign: string;
  campaignId: string | null;
  clicks: number;
  impressions: number;
  spend: number;
  conversions: number;
  cpc: number | null;
  ctr: number;
  costPerConversion: number | null;
  conversionRate: number;
}

export interface DailyMetric {
  date: string;
  clicks: number;
  impressions: number;
  spend: number;
  conversions: number;
}

export interface DeviceBreakdown {
  device: string;
  clicks: number;
  impressions: number;
  spend: number;
  conversions: number;
  cpc: number | null;
  ctr: number;
}

export interface DayOfWeekBreakdown {
  dayOfWeek: string;
  clicks: number;
  impressions: number;
  spend: number;
  conversions: number;
  costPerConversion: number | null;
}

export interface SuburbPerformance {
  city: string;
  clicks: number;
  impressions: number;
  spend: number;
  conversions: number;
}

// ─── Public API Functions ───

/**
 * Get campaign-level summary for the given period
 */
export async function getCampaignSummary(datePreset: string = "last_30d"): Promise<CampaignSummary[]> {
  const raw = await queryWindsor<any[]>({
    fields: ["campaign", "campaign_id", "clicks", "impressions", "spend", "conversions", "cpc", "ctr", "cost_per_conversion", "conversion_rate"],
    datePreset,
  });

  return raw.map((r: any) => ({
    campaign: r.campaign ?? "Unknown",
    campaignId: r.campaign_id ?? null,
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    spend: r.spend ?? 0,
    conversions: r.conversions ?? 0,
    cpc: r.cpc ?? null,
    ctr: r.ctr ?? 0,
    costPerConversion: r.cost_per_conversion ?? null,
    conversionRate: r.conversion_rate ?? 0,
  }));
}

/**
 * Get daily metrics for trend chart
 */
export async function getDailyMetrics(datePreset: string = "last_30d"): Promise<DailyMetric[]> {
  const raw = await queryWindsor<any[]>({
    fields: ["date", "clicks", "impressions", "spend", "conversions"],
    datePreset,
  });

  // Aggregate by date (in case multiple campaigns per day)
  const byDate = new Map<string, DailyMetric>();
  for (const r of raw) {
    const date = r.date ?? "";
    const existing = byDate.get(date);
    if (existing) {
      existing.clicks += r.clicks ?? 0;
      existing.impressions += r.impressions ?? 0;
      existing.spend += r.spend ?? 0;
      existing.conversions += r.conversions ?? 0;
    } else {
      byDate.set(date, {
        date,
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        spend: r.spend ?? 0,
        conversions: r.conversions ?? 0,
      });
    }
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get device breakdown
 */
export async function getDeviceBreakdown(datePreset: string = "last_30d"): Promise<DeviceBreakdown[]> {
  const raw = await queryWindsor<any[]>({
    fields: ["device", "clicks", "impressions", "spend", "conversions", "cpc", "ctr"],
    datePreset,
  });

  // Aggregate by device (across campaigns)
  const byDevice = new Map<string, DeviceBreakdown>();
  for (const r of raw) {
    const device = r.device ?? "UNKNOWN";
    const existing = byDevice.get(device);
    if (existing) {
      existing.clicks += r.clicks ?? 0;
      existing.impressions += r.impressions ?? 0;
      existing.spend += r.spend ?? 0;
      existing.conversions += r.conversions ?? 0;
    } else {
      byDevice.set(device, {
        device,
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        spend: r.spend ?? 0,
        conversions: r.conversions ?? 0,
        cpc: null,
        ctr: 0,
      });
    }
  }

  // Recalculate CPC and CTR
  return Array.from(byDevice.values()).map(d => ({
    ...d,
    cpc: d.clicks > 0 ? d.spend / d.clicks : null,
    ctr: d.impressions > 0 ? d.clicks / d.impressions : 0,
  }));
}

/**
 * Get day-of-week breakdown
 */
export async function getDayOfWeekBreakdown(datePreset: string = "last_30d"): Promise<DayOfWeekBreakdown[]> {
  const raw = await queryWindsor<any[]>({
    fields: ["day_of_week", "clicks", "impressions", "spend", "conversions"],
    datePreset,
  });

  // Aggregate by day of week (across campaigns)
  const byDay = new Map<string, DayOfWeekBreakdown>();
  for (const r of raw) {
    const day = r.day_of_week ?? "UNKNOWN";
    const existing = byDay.get(day);
    if (existing) {
      existing.clicks += r.clicks ?? 0;
      existing.impressions += r.impressions ?? 0;
      existing.spend += r.spend ?? 0;
      existing.conversions += r.conversions ?? 0;
    } else {
      byDay.set(day, {
        dayOfWeek: day,
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        spend: r.spend ?? 0,
        conversions: r.conversions ?? 0,
        costPerConversion: null,
      });
    }
  }

  // Recalculate cost per conversion and sort by day order
  const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  return Array.from(byDay.values())
    .map(d => ({
      ...d,
      costPerConversion: d.conversions > 0 ? d.spend / d.conversions : null,
    }))
    .sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));
}

/**
 * Get top converting suburbs/cities
 */
export async function getSuburbPerformance(datePreset: string = "last_30d"): Promise<SuburbPerformance[]> {
  const raw = await queryWindsor<any[]>({
    fields: ["city", "clicks", "impressions", "spend", "conversions"],
    datePreset,
  });

  // Aggregate by city (across campaigns)
  const byCity = new Map<string, SuburbPerformance>();
  for (const r of raw) {
    const city = r.city ?? "Unknown";
    if (!city || city === "Unknown") continue;
    const existing = byCity.get(city);
    if (existing) {
      existing.clicks += r.clicks ?? 0;
      existing.impressions += r.impressions ?? 0;
      existing.spend += r.spend ?? 0;
      existing.conversions += r.conversions ?? 0;
    } else {
      byCity.set(city, {
        city,
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        spend: r.spend ?? 0,
        conversions: r.conversions ?? 0,
      });
    }
  }

  // Sort by conversions desc, then by clicks desc
  return Array.from(byCity.values())
    .sort((a, b) => b.conversions - a.conversions || b.clicks - a.clicks)
    .slice(0, 30); // Top 30 suburbs
}

/**
 * Get full dashboard data (combines all queries for a single request)
 */
export async function getGoogleAdsDashboard(datePreset: string = "last_30d") {
  const [campaigns, daily, devices, dayOfWeek, suburbs] = await Promise.all([
    getCampaignSummary(datePreset),
    getDailyMetrics(datePreset),
    getDeviceBreakdown(datePreset),
    getDayOfWeekBreakdown(datePreset),
    getSuburbPerformance(datePreset),
  ]);

  // Calculate totals
  const totals = campaigns.reduce(
    (acc, c) => ({
      clicks: acc.clicks + c.clicks,
      impressions: acc.impressions + c.impressions,
      spend: acc.spend + c.spend,
      conversions: acc.conversions + c.conversions,
    }),
    { clicks: 0, impressions: 0, spend: 0, conversions: 0 }
  );

  return {
    totals: {
      ...totals,
      cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
      ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
      costPerConversion: totals.conversions > 0 ? totals.spend / totals.conversions : 0,
      conversionRate: totals.clicks > 0 ? totals.conversions / totals.clicks : 0,
    },
    campaigns,
    daily,
    devices,
    dayOfWeek,
    suburbs,
  };
}

/**
 * Check if Windsor.ai is configured
 */
export function isWindsorConfigured(): boolean {
  return !!WINDSOR_API_KEY;
}
