/**
 * Weekly ROI Digest Email
 * Generates and sends a comprehensive weekly performance summary
 * covering leads, conversions, revenue, ad spend, and ROI metrics.
 */
import { getDb } from "./db";
import { quoteRequests, callbackRequests, adSpend, digestSettings } from "../drizzle/schema";
import { and, gte, lte, desc, eq } from "drizzle-orm";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "Concrete Concepts Group <info@concreteconceptsgroup.com>";
const DEFAULT_RECIPIENT = "info@concreteconceptsgroup.com";

interface DigestData {
  period: { from: string; to: string };
  leads: {
    total: number;
    quotes: number;
    callbacks: number;
    newThisWeek: number;
    prevWeek: number;
    changePercent: number;
  };
  funnel: {
    contacted: number;
    quoted: number;
    won: number;
    lost: number;
    conversionRate: number;
    winRate: number;
  };
  revenue: {
    total: number;
    avgDealSize: number;
    prevWeekRevenue: number;
    changePercent: number;
  };
  topCampaigns: { name: string; leads: number; won: number; revenue: number; spend: number; roas: number; costPerLead: number }[];
  topSources: { name: string; leads: number; won: number }[];
  topLandingPages: { page: string; leads: number; won: number }[];
  adSpendSummary: {
    totalSpend: number;
    overallCostPerLead: number;
    overallRoas: number;
  };
  gclidCount: number;
  fbclidCount: number;
}

async function gatherDigestData(): Promise<DigestData | null> {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

  // This week's data
  const thisWeekQuotes = await db.select().from(quoteRequests)
    .where(gte(quoteRequests.createdAt, weekAgo))
    .orderBy(desc(quoteRequests.createdAt));

  const thisWeekCallbacks = await db.select().from(callbackRequests)
    .where(gte(callbackRequests.createdAt, weekAgo))
    .orderBy(desc(callbackRequests.createdAt));

  // Previous week's data (for comparison)
  const prevWeekQuotes = await db.select().from(quoteRequests)
    .where(and(gte(quoteRequests.createdAt, twoWeeksAgo), lte(quoteRequests.createdAt, weekAgo)));

  const prevWeekCallbacks = await db.select().from(callbackRequests)
    .where(and(gte(callbackRequests.createdAt, twoWeeksAgo), lte(callbackRequests.createdAt, weekAgo)));

  // Current month ad spend
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthSpend = await db.select().from(adSpend).where(eq(adSpend.month, currentMonth));

  // Leads
  const thisWeekTotal = thisWeekQuotes.length + thisWeekCallbacks.length;
  const prevWeekTotal = prevWeekQuotes.length + prevWeekCallbacks.length;
  const leadChangePercent = prevWeekTotal > 0 ? Math.round(((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100) : 0;

  // Funnel (this week quotes only)
  const contacted = thisWeekQuotes.filter(q => ["contacted", "quoted", "won"].includes(q.status)).length;
  const quoted = thisWeekQuotes.filter(q => ["quoted", "won"].includes(q.status)).length;
  const won = thisWeekQuotes.filter(q => q.status === "won").length;
  const lost = thisWeekQuotes.filter(q => q.status === "lost").length;

  // Revenue
  const thisWeekRevenue = thisWeekQuotes.filter(q => q.status === "won").reduce((s, q) => s + parseFloat(q.quotedAmount || "0"), 0);
  const prevWeekRevenue = prevWeekQuotes.filter(q => q.status === "won").reduce((s, q) => s + parseFloat(q.quotedAmount || "0"), 0);
  const revenueChangePercent = prevWeekRevenue > 0 ? Math.round(((thisWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100) : 0;

  // Top campaigns
  const campaignMap: Record<string, { leads: number; won: number; revenue: number }> = {};
  for (const q of thisWeekQuotes) {
    const c = q.utmCampaign || "(organic/direct)";
    if (!campaignMap[c]) campaignMap[c] = { leads: 0, won: 0, revenue: 0 };
    campaignMap[c].leads++;
    if (q.status === "won") { campaignMap[c].won++; campaignMap[c].revenue += parseFloat(q.quotedAmount || "0"); }
  }
  for (const cb of thisWeekCallbacks) {
    const c = cb.utmCampaign || "(organic/direct)";
    if (!campaignMap[c]) campaignMap[c] = { leads: 0, won: 0, revenue: 0 };
    campaignMap[c].leads++;
    if (cb.status === "completed") campaignMap[c].won++;
  }

  // Merge ad spend into campaigns
  const spendByCampaign: Record<string, number> = {};
  for (const s of monthSpend) {
    spendByCampaign[s.campaignName] = (spendByCampaign[s.campaignName] || 0) + parseFloat(s.spend);
  }

  const topCampaigns = Object.entries(campaignMap)
    .map(([name, data]) => {
      const spend = spendByCampaign[name] || 0;
      return {
        name,
        ...data,
        spend,
        roas: spend > 0 ? Math.round((data.revenue / spend) * 100) / 100 : 0,
        costPerLead: data.leads > 0 ? Math.round((spend / data.leads) * 100) / 100 : 0,
      };
    })
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 5);

  // Top sources
  const sourceMap: Record<string, { leads: number; won: number }> = {};
  for (const q of thisWeekQuotes) {
    const src = q.utmSource ? `${q.utmSource} / ${q.utmMedium || "(none)"}` : (q.leadSource || "Direct");
    if (!sourceMap[src]) sourceMap[src] = { leads: 0, won: 0 };
    sourceMap[src].leads++;
    if (q.status === "won") sourceMap[src].won++;
  }
  const topSources = Object.entries(sourceMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 5);

  // Top landing pages
  const lpMap: Record<string, { leads: number; won: number }> = {};
  for (const q of thisWeekQuotes) {
    const lp = q.landingPage || "(unknown)";
    if (!lpMap[lp]) lpMap[lp] = { leads: 0, won: 0 };
    lpMap[lp].leads++;
    if (q.status === "won") lpMap[lp].won++;
  }
  const topLandingPages = Object.entries(lpMap)
    .map(([page, data]) => ({ page, ...data }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 5);

  // Ad spend summary
  const totalSpend = monthSpend.reduce((s, r) => s + parseFloat(r.spend), 0);

  // Click IDs
  const gclidCount = thisWeekQuotes.filter(q => q.gclid).length + thisWeekCallbacks.filter(cb => cb.gclid).length;
  const fbclidCount = thisWeekQuotes.filter(q => q.fbclid).length + thisWeekCallbacks.filter(cb => cb.fbclid).length;

  return {
    period: { from: weekAgo.toLocaleDateString("en-AU"), to: now.toLocaleDateString("en-AU") },
    leads: {
      total: thisWeekTotal,
      quotes: thisWeekQuotes.length,
      callbacks: thisWeekCallbacks.length,
      newThisWeek: thisWeekTotal,
      prevWeek: prevWeekTotal,
      changePercent: leadChangePercent,
    },
    funnel: {
      contacted,
      quoted,
      won,
      lost,
      conversionRate: thisWeekQuotes.length > 0 ? Math.round((won / thisWeekQuotes.length) * 100) : 0,
      winRate: (quoted + lost) > 0 ? Math.round((won / (quoted + lost)) * 100) : 0,
    },
    revenue: {
      total: thisWeekRevenue,
      avgDealSize: won > 0 ? Math.round(thisWeekRevenue / won) : 0,
      prevWeekRevenue,
      changePercent: revenueChangePercent,
    },
    topCampaigns,
    topSources,
    topLandingPages,
    adSpendSummary: {
      totalSpend,
      overallCostPerLead: thisWeekTotal > 0 ? Math.round((totalSpend / thisWeekTotal) * 100) / 100 : 0,
      overallRoas: totalSpend > 0 ? Math.round((thisWeekRevenue / totalSpend) * 100) / 100 : 0,
    },
    gclidCount,
    fbclidCount,
  };
}

function buildDigestHtml(data: DigestData): string {
  const changeArrow = (pct: number) => pct > 0 ? `<span style="color:#16a34a">▲ ${pct}%</span>` : pct < 0 ? `<span style="color:#dc2626">▼ ${Math.abs(pct)}%</span>` : `<span style="color:#6b7280">→ 0%</span>`;

  const campaignRows = data.topCampaigns.map(c => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px">${c.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px">${c.leads}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px">${c.won}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px">$${c.revenue.toLocaleString()}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px">${c.spend > 0 ? `$${c.spend.toLocaleString()}` : "—"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;font-weight:600;color:${c.roas >= 3 ? '#16a34a' : c.roas >= 1 ? '#d97706' : '#dc2626'}">${c.roas > 0 ? `${c.roas}x` : "—"}</td>
    </tr>
  `).join("");

  const sourceRows = data.topSources.map(s => `
    <tr>
      <td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;font-size:13px">${s.name}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px">${s.leads}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px">${s.won}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:640px;margin:0 auto;padding:24px">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1f2937 0%,#374151 100%);border-radius:12px 12px 0 0;padding:32px 24px;text-align:center">
      <h1 style="color:#f59e0b;margin:0;font-size:22px;letter-spacing:-0.5px">CCG Weekly Performance Digest</h1>
      <p style="color:#9ca3af;margin:8px 0 0;font-size:13px">${data.period.from} — ${data.period.to}</p>
    </div>

    <!-- KPI Cards -->
    <div style="background:#fff;padding:24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="25%" style="padding:8px;text-align:center">
            <div style="background:#eff6ff;border-radius:8px;padding:16px 8px">
              <div style="font-size:28px;font-weight:700;color:#1e40af">${data.leads.total}</div>
              <div style="font-size:11px;color:#6b7280;margin-top:4px">Total Leads</div>
              <div style="font-size:11px;margin-top:2px">${changeArrow(data.leads.changePercent)}</div>
            </div>
          </td>
          <td width="25%" style="padding:8px;text-align:center">
            <div style="background:#f0fdf4;border-radius:8px;padding:16px 8px">
              <div style="font-size:28px;font-weight:700;color:#16a34a">${data.funnel.won}</div>
              <div style="font-size:11px;color:#6b7280;margin-top:4px">Won</div>
              <div style="font-size:11px;color:#6b7280;margin-top:2px">${data.funnel.winRate}% win rate</div>
            </div>
          </td>
          <td width="25%" style="padding:8px;text-align:center">
            <div style="background:#fffbeb;border-radius:8px;padding:16px 8px">
              <div style="font-size:28px;font-weight:700;color:#d97706">$${data.revenue.total.toLocaleString()}</div>
              <div style="font-size:11px;color:#6b7280;margin-top:4px">Revenue</div>
              <div style="font-size:11px;margin-top:2px">${changeArrow(data.revenue.changePercent)}</div>
            </div>
          </td>
          <td width="25%" style="padding:8px;text-align:center">
            <div style="background:#faf5ff;border-radius:8px;padding:16px 8px">
              <div style="font-size:28px;font-weight:700;color:#7c3aed">${data.gclidCount}</div>
              <div style="font-size:11px;color:#6b7280;margin-top:4px">Google Clicks</div>
              <div style="font-size:11px;color:#6b7280;margin-top:2px">+${data.fbclidCount} Meta</div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Funnel -->
      <div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px">
        <h3 style="margin:0 0 12px;font-size:14px;color:#374151">Conversion Funnel</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:12px;color:#6b7280;padding:4px 0">New Leads</td>
            <td style="text-align:right;font-size:13px;font-weight:600">${data.leads.quotes} quotes + ${data.leads.callbacks} callbacks</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#6b7280;padding:4px 0">Contacted</td>
            <td style="text-align:right;font-size:13px;font-weight:600">${data.funnel.contacted}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#6b7280;padding:4px 0">Quoted</td>
            <td style="text-align:right;font-size:13px;font-weight:600">${data.funnel.quoted}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#16a34a;padding:4px 0;font-weight:600">Won</td>
            <td style="text-align:right;font-size:13px;font-weight:700;color:#16a34a">${data.funnel.won}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#dc2626;padding:4px 0">Lost</td>
            <td style="text-align:right;font-size:13px;font-weight:600;color:#dc2626">${data.funnel.lost}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Campaign Performance -->
    <div style="background:#fff;padding:24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
      <h3 style="margin:0 0 16px;font-size:15px;color:#1f2937">Top Campaigns</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Campaign</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;color:#6b7280;text-transform:uppercase">Leads</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;color:#6b7280;text-transform:uppercase">Won</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase">Revenue</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase">Spend</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase">ROAS</th>
          </tr>
        </thead>
        <tbody>${campaignRows || '<tr><td colspan="6" style="padding:16px;text-align:center;color:#9ca3af;font-size:13px">No campaign data this week</td></tr>'}</tbody>
      </table>
    </div>

    <!-- Sources & Ad Spend -->
    <div style="background:#fff;padding:24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="55%" style="vertical-align:top;padding-right:12px">
            <h3 style="margin:0 0 12px;font-size:14px;color:#1f2937">Top Sources</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead><tr style="background:#f9fafb">
                <th style="padding:6px 12px;text-align:left;font-size:10px;color:#6b7280;text-transform:uppercase">Source</th>
                <th style="padding:6px 12px;text-align:center;font-size:10px;color:#6b7280;text-transform:uppercase">Leads</th>
                <th style="padding:6px 12px;text-align:center;font-size:10px;color:#6b7280;text-transform:uppercase">Won</th>
              </tr></thead>
              <tbody>${sourceRows}</tbody>
            </table>
          </td>
          <td width="45%" style="vertical-align:top;padding-left:12px">
            <h3 style="margin:0 0 12px;font-size:14px;color:#1f2937">Ad Spend (This Month)</h3>
            <div style="background:#f9fafb;border-radius:8px;padding:16px">
              <div style="margin-bottom:12px">
                <div style="font-size:11px;color:#6b7280">Total Spend</div>
                <div style="font-size:20px;font-weight:700;color:#1f2937">$${data.adSpendSummary.totalSpend.toLocaleString()}</div>
              </div>
              <div style="margin-bottom:12px">
                <div style="font-size:11px;color:#6b7280">Cost per Lead</div>
                <div style="font-size:16px;font-weight:600;color:#d97706">$${data.adSpendSummary.overallCostPerLead.toLocaleString()}</div>
              </div>
              <div>
                <div style="font-size:11px;color:#6b7280">ROAS</div>
                <div style="font-size:16px;font-weight:600;color:${data.adSpendSummary.overallRoas >= 3 ? '#16a34a' : data.adSpendSummary.overallRoas >= 1 ? '#d97706' : '#dc2626'}">${data.adSpendSummary.overallRoas > 0 ? `${data.adSpendSummary.overallRoas}x` : "—"}</div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Action Items -->
    <div style="background:#fff;padding:24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
      <h3 style="margin:0 0 12px;font-size:14px;color:#1f2937">⚡ Weekly Actions</h3>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px">
        <p style="margin:0 0 8px;font-size:13px;color:#92400e"><strong>Upload Offline Conversions:</strong> ${data.gclidCount > 0 ? `You have ${data.gclidCount} Google click IDs to upload to Google Ads for Smart Bidding optimization.` : "No new Google click IDs this week."}</p>
        <p style="margin:0;font-size:13px;color:#92400e"><strong>Review Lost Leads:</strong> ${data.funnel.lost > 0 ? `${data.funnel.lost} leads were lost this week — review and follow up where possible.` : "No lost leads this week — great job!"}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#1f2937;border-radius:0 0 12px 12px;padding:20px 24px;text-align:center">
      <p style="margin:0;font-size:12px;color:#9ca3af">Concrete Concepts Group — Weekly Performance Digest</p>
      <p style="margin:4px 0 0;font-size:11px;color:#6b7280">Manage digest settings in your admin dashboard → Ads ROI tab</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send the weekly digest email
 */
export async function sendWeeklyDigest(): Promise<{ success: boolean; message: string }> {
  if (!RESEND_API_KEY) {
    console.error("[Digest] RESEND_API_KEY is not set");
    return { success: false, message: "RESEND_API_KEY not configured" };
  }

  try {
    // Check digest settings
    const db = await getDb();
    let recipientEmail = DEFAULT_RECIPIENT;
    if (db) {
      const settings = await db.select().from(digestSettings).limit(1);
      if (settings.length > 0) {
        if (settings[0].enabled === 0) {
          return { success: false, message: "Digest is disabled in settings" };
        }
        recipientEmail = settings[0].recipientEmail;
      }
    }

    // Gather data
    const data = await gatherDigestData();
    if (!data) {
      return { success: false, message: "Failed to gather digest data" };
    }

    // Build email
    const html = buildDigestHtml(data);
    const subject = `CCG Weekly Digest: ${data.leads.total} leads, $${data.revenue.total.toLocaleString()} revenue (${data.period.from} — ${data.period.to})`;

    // Send via Resend
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Digest] Failed to send:", errorText);
      return { success: false, message: `Email send failed: ${response.status}` };
    }

    const result = await response.json();
    console.log("[Digest] Weekly digest sent successfully, id:", result.id);

    // Update lastSentAt
    if (db) {
      const settings = await db.select().from(digestSettings).limit(1);
      if (settings.length > 0) {
        await db.update(digestSettings).set({ lastSentAt: new Date() }).where(eq(digestSettings.id, settings[0].id));
      }
    }

    return { success: true, message: `Digest sent to ${recipientEmail}` };
  } catch (error: any) {
    console.error("[Digest] Error:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
}

/**
 * Check if digest should be sent (called from cron/interval)
 */
export async function checkAndSendDigest(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const settings = await db.select().from(digestSettings).limit(1);
  if (settings.length === 0 || settings[0].enabled === 0) return;

  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun, 1=Mon, ...

  if (settings[0].frequency === "weekly" && currentDay !== settings[0].dayOfWeek) return;
  if (settings[0].frequency === "monthly" && now.getDate() !== 1) return;

  // Check if already sent today
  if (settings[0].lastSentAt) {
    const lastSent = new Date(settings[0].lastSentAt);
    if (lastSent.toDateString() === now.toDateString()) return;
  }

  await sendWeeklyDigest();
}
