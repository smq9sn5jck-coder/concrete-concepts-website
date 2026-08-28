/**
 * Weekly Google Ads Report
 * 
 * Fetches live Google Ads data from Windsor.ai and sends a formatted
 * performance summary email via Resend. Called by Heartbeat scheduler
 * every Monday at 8am AEST (Sunday 22:00 UTC).
 */

import { getCampaignSummary, getDailyMetrics, getDeviceBreakdown, getDayOfWeekBreakdown, getSuburbPerformance } from "./googleAds";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "Concrete Concepts Group <info@concreteconceptsgroup.com>";
const RECIPIENT_EMAIL = "info@concreteconceptsgroup.com";

export async function sendGoogleAdsWeeklyReport(): Promise<{ success: boolean; message: string }> {
  try {
    // Fetch last 7 days of data
    const [campaigns, daily, devices, dayOfWeek, suburbs] = await Promise.all([
      getCampaignSummary("last_7d"),
      getDailyMetrics("last_7d"),
      getDeviceBreakdown("last_7d"),
      getDayOfWeekBreakdown("last_7d"),
      getSuburbPerformance("last_7d"),
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

    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const costPerConversion = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
    const convRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

    // Find best/worst days
    const bestDay = dayOfWeek.reduce((best, d) => d.conversions > best.conversions ? d : best, dayOfWeek[0]);
    const worstDay = dayOfWeek
      .filter(d => d.spend > 5)
      .reduce((worst, d) => {
        const worstCost = worst.conversions > 0 ? worst.spend / worst.conversions : Infinity;
        const dCost = d.conversions > 0 ? d.spend / d.conversions : Infinity;
        return dCost > worstCost ? d : worst;
      }, dayOfWeek[0]);

    // Top converting suburbs
    const topSuburbs = suburbs.filter(s => s.conversions > 0).slice(0, 5);

    // Build email HTML
    const html = buildReportHtml({
      totals: { ...totals, cpc, ctr, costPerConversion, convRate },
      campaigns,
      devices,
      bestDay,
      worstDay,
      topSuburbs,
    });

    // Send via Resend
    if (!RESEND_API_KEY) {
      return { success: false, message: "RESEND_API_KEY not configured" };
    }

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const subject = `📊 Google Ads Weekly Report — ${weekAgo.toLocaleDateString("en-AU", { day: "numeric", month: "short" })} to ${today.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`;

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [RECIPIENT_EMAIL],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, message: `Resend error: ${err}` };
    }

    return { success: true, message: "Weekly Google Ads report sent successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

interface ReportData {
  totals: {
    clicks: number;
    impressions: number;
    spend: number;
    conversions: number;
    cpc: number;
    ctr: number;
    costPerConversion: number;
    convRate: number;
  };
  campaigns: { campaign: string; spend: number; clicks: number; conversions: number; costPerConversion: number | null }[];
  devices: { device: string; clicks: number; spend: number; conversions: number }[];
  bestDay: { dayOfWeek: string; conversions: number; costPerConversion: number | null } | undefined;
  worstDay: { dayOfWeek: string; conversions: number; spend: number } | undefined;
  topSuburbs: { city: string; conversions: number; clicks: number; spend: number }[];
}

function buildReportHtml(data: ReportData): string {
  const { totals, campaigns, devices, bestDay, worstDay, topSuburbs } = data;

  const campaignRows = campaigns
    .filter(c => c.spend > 0)
    .map(c => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;">${c.campaign}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;">$${c.spend.toFixed(2)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;">${c.clicks}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;font-weight:600;color:#16a34a;">${c.conversions}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;">${c.costPerConversion ? `$${c.costPerConversion.toFixed(2)}` : "—"}</td>
      </tr>
    `).join("");

  const deviceRows = devices
    .filter(d => d.clicks > 0)
    .map(d => `
      <tr>
        <td style="padding:6px 12px;font-size:13px;">${d.device}</td>
        <td style="padding:6px 12px;font-size:13px;text-align:right;">${d.clicks}</td>
        <td style="padding:6px 12px;font-size:13px;text-align:right;">$${d.spend.toFixed(2)}</td>
        <td style="padding:6px 12px;font-size:13px;text-align:right;font-weight:600;">${d.conversions}</td>
      </tr>
    `).join("");

  const suburbRows = topSuburbs.map(s => `
    <tr>
      <td style="padding:6px 12px;font-size:13px;">${s.city}</td>
      <td style="padding:6px 12px;font-size:13px;text-align:right;">${s.conversions}</td>
      <td style="padding:6px 12px;font-size:13px;text-align:right;">${s.clicks}</td>
      <td style="padding:6px 12px;font-size:13px;text-align:right;">$${(s.conversions > 0 ? s.spend / s.conversions : 0).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;padding:20px;margin:0;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#d97706,#b45309);padding:24px 32px;color:#fff;">
      <h1 style="margin:0;font-size:20px;font-weight:700;">📊 Google Ads Weekly Report</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:0.9;">Concrete Concepts Group — Last 7 Days</p>
    </div>

    <!-- KPI Cards -->
    <div style="padding:24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td width="25%" style="padding:8px;">
            <div style="background:#fef3c7;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:11px;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Spend</div>
              <div style="font-size:22px;font-weight:700;color:#d97706;margin-top:4px;">$${totals.spend.toFixed(0)}</div>
            </div>
          </td>
          <td width="25%" style="padding:8px;">
            <div style="background:#dbeafe;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:11px;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px;">Clicks</div>
              <div style="font-size:22px;font-weight:700;color:#2563eb;margin-top:4px;">${totals.clicks}</div>
              <div style="font-size:10px;color:#6b7280;margin-top:2px;">CPC: $${totals.cpc.toFixed(2)}</div>
            </div>
          </td>
          <td width="25%" style="padding:8px;">
            <div style="background:#dcfce7;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:11px;color:#166534;text-transform:uppercase;letter-spacing:0.5px;">Conversions</div>
              <div style="font-size:22px;font-weight:700;color:#16a34a;margin-top:4px;">${totals.conversions}</div>
              <div style="font-size:10px;color:#6b7280;margin-top:2px;">$${totals.costPerConversion.toFixed(2)}/conv</div>
            </div>
          </td>
          <td width="25%" style="padding:8px;">
            <div style="background:#f3e8ff;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:11px;color:#6b21a8;text-transform:uppercase;letter-spacing:0.5px;">CTR</div>
              <div style="font-size:22px;font-weight:700;color:#7c3aed;margin-top:4px;">${totals.ctr.toFixed(1)}%</div>
              <div style="font-size:10px;color:#6b7280;margin-top:2px;">${totals.impressions.toLocaleString()} impr</div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Insights -->
    <div style="padding:0 32px 24px;">
      <h3 style="font-size:14px;color:#374151;margin:0 0 12px;">💡 Key Insights</h3>
      <div style="background:#f0fdf4;border-left:3px solid #16a34a;padding:10px 14px;border-radius:4px;margin-bottom:8px;">
        <span style="font-size:12px;color:#166534;">
          ${bestDay ? `<strong>Best Day:</strong> ${bestDay.dayOfWeek} — ${bestDay.conversions} conversions${bestDay.costPerConversion ? ` at $${bestDay.costPerConversion.toFixed(0)}/conv` : ""}` : "No conversions this week"}
        </span>
      </div>
      ${worstDay && worstDay.dayOfWeek !== bestDay?.dayOfWeek ? `
      <div style="background:#fef2f2;border-left:3px solid #dc2626;padding:10px 14px;border-radius:4px;margin-bottom:8px;">
        <span style="font-size:12px;color:#991b1b;">
          <strong>Worst Day:</strong> ${worstDay.dayOfWeek} — $${worstDay.spend.toFixed(0)} spent, ${worstDay.conversions} conversions
        </span>
      </div>` : ""}
    </div>

    <!-- Campaign Table -->
    <div style="padding:0 32px 24px;">
      <h3 style="font-size:14px;color:#374151;margin:0 0 12px;">📈 Campaign Performance</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Campaign</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;">Spend</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;">Clicks</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;">Conv</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;">Cost/Conv</th>
          </tr>
        </thead>
        <tbody>${campaignRows}</tbody>
      </table>
    </div>

    <!-- Device Breakdown -->
    <div style="padding:0 32px 24px;">
      <h3 style="font-size:14px;color:#374151;margin:0 0 12px;">📱 Device Breakdown</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <th style="padding:6px 12px;text-align:left;font-size:11px;color:#6b7280;">Device</th>
            <th style="padding:6px 12px;text-align:right;font-size:11px;color:#6b7280;">Clicks</th>
            <th style="padding:6px 12px;text-align:right;font-size:11px;color:#6b7280;">Spend</th>
            <th style="padding:6px 12px;text-align:right;font-size:11px;color:#6b7280;">Conv</th>
          </tr>
        </thead>
        <tbody>${deviceRows}</tbody>
      </table>
    </div>

    ${topSuburbs.length > 0 ? `
    <!-- Top Suburbs -->
    <div style="padding:0 32px 24px;">
      <h3 style="font-size:14px;color:#374151;margin:0 0 12px;">📍 Top Converting Suburbs</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <th style="padding:6px 12px;text-align:left;font-size:11px;color:#6b7280;">Suburb</th>
            <th style="padding:6px 12px;text-align:right;font-size:11px;color:#6b7280;">Conv</th>
            <th style="padding:6px 12px;text-align:right;font-size:11px;color:#6b7280;">Clicks</th>
            <th style="padding:6px 12px;text-align:right;font-size:11px;color:#6b7280;">Cost/Conv</th>
          </tr>
        </thead>
        <tbody>${suburbRows}</tbody>
      </table>
    </div>` : ""}

    <!-- Footer -->
    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="font-size:11px;color:#9ca3af;margin:0;text-align:center;">
        Automated report from Concrete Concepts Group · Data via Windsor.ai + Google Ads
      </p>
      <p style="font-size:11px;color:#9ca3af;margin:4px 0 0;text-align:center;">
        <a href="https://concreteconceptsgroup.com/admin" style="color:#d97706;">View full dashboard →</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
