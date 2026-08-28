import { trpc } from "@/lib/trpc";
import { useState, useMemo, useEffect } from "react";
import GoogleAdsDashboard from "@/components/GoogleAdsDashboard";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Download,
  TrendingUp,
  Target,
  DollarSign,
  MousePointerClick,
  BarChart3,
  Globe,
  FileDown,
  Filter,
  Calendar,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Send,
  Settings,
  Receipt,
  Zap,
  Clock,
  CheckCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

/* ── Date helpers ── */
function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}
function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000);
}

/* ── CSV Generator ── */
function generateGoogleAdsCsv(
  conversions: {
    gclid: string | null;
    gbraid: string | null;
    wbraid: string | null;
    conversionTime: string;
    conversionValue: number;
    conversionCurrency: string;
  }[]
) {
  const header = "Parameters:TimeZone=+1000\nGoogle Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency";
  const rows = conversions
    .filter((c) => c.gclid || c.gbraid || c.wbraid)
    .map((c) => {
      const clickId = c.gclid || c.gbraid || c.wbraid || "";
      return `${clickId},Quote Won,${c.conversionTime},${c.conversionValue},${c.conversionCurrency}`;
    });
  return header + "\n" + rows.join("\n");
}

function generateMetaCsv(
  conversions: {
    email: string;
    phone: string;
    fbclid: string | null;
    conversionTime: string;
    conversionValue: number;
    conversionCurrency: string;
  }[]
) {
  const header = "email,phone,event_name,event_time,value,currency";
  const rows = conversions
    .filter((c) => c.fbclid)
    .map((c) => {
      return `${c.email},${c.phone},Purchase,${c.conversionTime},${c.conversionValue},${c.conversionCurrency}`;
    });
  return header + "\n" + rows.join("\n");
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Funnel Bar ── */
function FunnelBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-20 text-right">{label}</span>
      <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700 flex items-center justify-end pr-2`}
          style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
        >
          {count > 0 && <span className="text-[10px] font-bold text-white">{count}</span>}
        </div>
      </div>
      <span className="text-xs text-gray-400 w-12">{pct.toFixed(0)}%</span>
    </div>
  );
}

/* ── Main Panel ── */
export default function AdsRoiPanel() {
  const [dateRange, setDateRange] = useState<"30" | "60" | "90" | "180" | "365" | "all">("90");
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [showGclids, setShowGclids] = useState(false);
  const [exportStatus, setExportStatus] = useState<"won" | "quoted" | "contacted" | "all">("won");
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "googleads" | "adspend" | "roi" | "digest">("overview");

  // Ad spend form state
  const [showSpendForm, setShowSpendForm] = useState(false);
  const [editingSpend, setEditingSpend] = useState<number | null>(null);
  const [spendForm, setSpendForm] = useState({
    platform: "google_ads" as "google_ads" | "meta_ads" | "other",
    campaignName: "",
    month: new Date().toISOString().slice(0, 7),
    spend: "",
    impressions: "",
    clicks: "",
    notes: "",
  });

  // Digest settings form
  const [digestForm, setDigestForm] = useState({
    enabled: true,
    recipientEmail: "info@concreteconceptsgroup.com",
    frequency: "weekly" as "weekly" | "monthly",
    dayOfWeek: 1,
  });

  const dateInput = useMemo(() => {
    if (dateRange === "all") return {};
    const days = parseInt(dateRange);
    return { dateFrom: formatDate(daysAgo(days)) };
  }, [dateRange]);

  const { data: roi, isLoading, error } = trpc.analytics.adsRoi.useQuery(dateInput, {
    staleTime: 60000,
  });

  const { data: exportData, isLoading: exportLoading } = trpc.analytics.offlineConversions.useQuery(
    { ...dateInput, statusFilter: exportStatus },
    { staleTime: 60000 }
  );

  // Ad spend queries
  const { data: adSpendList, isLoading: spendLoading } = trpc.analytics.listAdSpend.useQuery({}, { staleTime: 30000 });
  const { data: campaignRoi, isLoading: roiLoading } = trpc.analytics.campaignRoi.useQuery(dateInput, { staleTime: 60000 });
  const { data: digestSettings } = trpc.analytics.getDigestSettings.useQuery(undefined, { staleTime: 60000 });

  const utils = trpc.useUtils();

  const upsertSpend = trpc.analytics.upsertAdSpend.useMutation({
    onSuccess: () => {
      utils.analytics.listAdSpend.invalidate();
      utils.analytics.campaignRoi.invalidate();
      setShowSpendForm(false);
      setEditingSpend(null);
      resetSpendForm();
      toast.success(editingSpend ? "Ad spend updated" : "Ad spend added");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteSpend = trpc.analytics.deleteAdSpend.useMutation({
    onSuccess: () => {
      utils.analytics.listAdSpend.invalidate();
      utils.analytics.campaignRoi.invalidate();
      toast.success("Ad spend deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const saveDigest = trpc.analytics.upsertDigestSettings.useMutation({
    onSuccess: () => {
      utils.analytics.getDigestSettings.invalidate();
      toast.success("Digest settings saved");
    },
    onError: (e) => toast.error(e.message),
  });

  const sendDigestNow = trpc.analytics.sendDigestNow.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  // Load digest settings into form
  useEffect(() => {
    if (digestSettings) {
      setDigestForm({
        enabled: digestSettings.enabled === 1,
        recipientEmail: digestSettings.recipientEmail,
        frequency: digestSettings.frequency as "weekly" | "monthly",
        dayOfWeek: digestSettings.dayOfWeek,
      });
    }
  }, [digestSettings]);

  function resetSpendForm() {
    setSpendForm({
      platform: "google_ads",
      campaignName: "",
      month: new Date().toISOString().slice(0, 7),
      spend: "",
      impressions: "",
      clicks: "",
      notes: "",
    });
  }

  function handleEditSpend(row: any) {
    setEditingSpend(row.id);
    setSpendForm({
      platform: row.platform,
      campaignName: row.campaignName,
      month: row.month,
      spend: row.spend,
      impressions: row.impressions?.toString() || "",
      clicks: row.clicks?.toString() || "",
      notes: row.notes || "",
    });
    setShowSpendForm(true);
  }

  function handleSaveSpend() {
    if (!spendForm.campaignName || !spendForm.spend) {
      toast.error("Campaign name and spend are required");
      return;
    }
    upsertSpend.mutate({
      ...(editingSpend ? { id: editingSpend } : {}),
      platform: spendForm.platform,
      campaignName: spendForm.campaignName,
      month: spendForm.month,
      spend: spendForm.spend,
      impressions: spendForm.impressions ? parseInt(spendForm.impressions) : undefined,
      clicks: spendForm.clicks ? parseInt(spendForm.clicks) : undefined,
      notes: spendForm.notes || undefined,
    });
  }

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-3" />
        <p className="text-gray-500">Loading Ads ROI data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-2">Failed to load ROI data</p>
        <p className="text-gray-400 text-sm">{error.message}</p>
      </div>
    );
  }

  if (!roi) return null;

  const handleExportGoogleAds = () => {
    if (!exportData?.conversions.length) {
      toast.error("No conversions to export");
      return;
    }
    const csv = generateGoogleAdsCsv(exportData.conversions);
    const dateStr = formatDate(new Date());
    downloadCsv(csv, `google-ads-offline-conversions-${dateStr}.csv`);
    toast.success(`Exported ${exportData.summary.withGclid} Google Ads conversions`);
  };

  const handleExportMeta = () => {
    if (!exportData?.conversions.length) {
      toast.error("No conversions to export");
      return;
    }
    const csv = generateMetaCsv(exportData.conversions);
    const dateStr = formatDate(new Date());
    downloadCsv(csv, `meta-offline-conversions-${dateStr}.csv`);
    toast.success(`Exported ${exportData.summary.withFbclid} Meta conversions`);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {([
          { key: "overview" as const, label: "Overview", icon: BarChart3 },
          { key: "googleads" as const, label: "Google Ads Live", icon: Globe },
          { key: "adspend" as const, label: "Ad Spend", icon: Receipt },
          { key: "roi" as const, label: "Campaign ROI", icon: Zap },
          { key: "digest" as const, label: "Email Digest", icon: Mail },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSubTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all flex-1 justify-center ${
              activeSubTab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ═══════════════ GOOGLE ADS LIVE TAB ═══════════════ */}
      {activeSubTab === "googleads" && <GoogleAdsDashboard />}

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      {activeSubTab === "overview" && (
      <>
      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">Date Range:</span>
        {(["30", "60", "90", "180", "365", "all"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              dateRange === range
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {range === "all" ? "All Time" : `${range}d`}
          </button>
        ))}
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Leads</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{roi.funnel.total}</p>
          <p className="text-[10px] text-gray-400 mt-1">{'quotes' in roi.funnel ? roi.funnel.quotes : 0} quotes + {'callbacks' in roi.funnel ? roi.funnel.callbacks : 0} callbacks</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">Won</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{roi.funnel.won}</p>
          <p className="text-[10px] text-gray-400 mt-1">{roi.funnel.conversionRate}% conversion rate</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">Revenue</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            ${'revenue' in roi.funnel ? roi.funnel.revenue.toLocaleString("en-AU", { minimumFractionDigits: 0 }) : 0}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">from won quotes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-purple-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">Google Clicks</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{roi.gclids.length}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            {(roi.fbclidCount ?? 0) > 0 && `+ ${roi.fbclidCount} Meta clicks`}
          </p>
        </div>
      </div>

      {/* ── Conversion Funnel ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-500" />
          Conversion Funnel
        </h3>
        <div className="space-y-2">
          <FunnelBar label="Total" count={roi.funnel.total} total={roi.funnel.total} color="bg-blue-500" />
          <FunnelBar label="Contacted" count={roi.funnel.contacted} total={roi.funnel.total} color="bg-yellow-500" />
          <FunnelBar label="Quoted" count={roi.funnel.quoted} total={roi.funnel.total} color="bg-purple-500" />
          <FunnelBar label="Won" count={roi.funnel.won} total={roi.funnel.total} color="bg-green-500" />
          <FunnelBar label="Lost" count={roi.funnel.lost} total={roi.funnel.total} color="bg-red-400" />
        </div>
        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <span>Win Rate (of decided): <strong className="text-gray-800">{roi.funnel.winRate}%</strong></span>
          <span>Conversion Rate (overall): <strong className="text-gray-800">{roi.funnel.conversionRate}%</strong></span>
        </div>
      </div>

      {/* ── Campaign Performance Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          Campaign Performance
        </h3>
        {roi.campaigns.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No campaign data yet. UTM-tagged leads will appear here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Campaign</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Leads</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Callbacks</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Contacted</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Quoted</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Won</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Revenue</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Win %</th>
                </tr>
              </thead>
              <tbody>
                {roi.campaigns.map((c) => (
                  <tr
                    key={c.name}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedCampaign(expandedCampaign === c.name ? null : c.name)}
                  >
                    <td className="py-2.5 px-2 font-medium text-gray-800 max-w-[200px] truncate" title={c.name}>
                      <div className="flex items-center gap-1">
                        {expandedCampaign === c.name ? <ChevronUp className="w-3 h-3 text-gray-400 shrink-0" /> : <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />}
                        {c.name}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-semibold text-gray-800">{c.leads}</td>
                    <td className="py-2.5 px-2 text-right text-gray-600">{c.callbacks}</td>
                    <td className="py-2.5 px-2 text-right text-yellow-600">{c.contacted}</td>
                    <td className="py-2.5 px-2 text-right text-purple-600">{c.quoted}</td>
                    <td className="py-2.5 px-2 text-right text-green-600 font-semibold">{c.won}</td>
                    <td className="py-2.5 px-2 text-right text-amber-600 font-semibold">
                      {c.revenue > 0 ? `$${c.revenue.toLocaleString()}` : "—"}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        c.winRate >= 30 ? "bg-green-100 text-green-700" :
                        c.winRate >= 15 ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {c.winRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Source / Medium Breakdown ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-500" />
            Source / Medium
          </h3>
          {roi.sources.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No source data yet</p>
          ) : (
            <div className="space-y-2">
              {roi.sources.map((s) => {
                const max = Math.max(...roi.sources.map((x) => x.leads), 1);
                const pct = (s.leads / max) * 100;
                return (
                  <div key={s.name} className="group">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] text-gray-600 w-36 truncate text-right" title={s.name}>{s.name}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-500 flex items-center justify-end pr-1.5"
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        >
                          <span className="text-[9px] font-bold text-white">{s.leads}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 w-16 text-right">
                        {s.won > 0 ? `${s.won} won` : "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Top Landing Pages ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-purple-500" />
            Top Landing Pages
          </h3>
          {roi.topLandingPages.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No landing page data yet</p>
          ) : (
            <div className="space-y-1.5">
              {roi.topLandingPages.slice(0, 10).map((lp, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="text-gray-400 w-4 text-right">{i + 1}.</span>
                  <span className="text-gray-700 truncate flex-1" title={lp.page}>{lp.page}</span>
                  <span className="text-gray-500 font-medium w-12 text-right">{lp.leads} leads</span>
                  <span className={`w-12 text-right font-medium ${lp.won > 0 ? "text-green-600" : "text-gray-400"}`}>
                    {lp.won > 0 ? `${lp.won} won` : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Monthly Trend by Source ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          Monthly Leads by Source
        </h3>
        {roi.monthlyTrend.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No trend data yet</p>
        ) : (
          <>
            <div className="flex items-end gap-3 h-40">
              {roi.monthlyTrend.map((m, i) => {
                const total = m.google + m.facebook + m.organic + m.direct + m.other;
                const maxTotal = Math.max(...roi.monthlyTrend.map((x) => x.google + x.facebook + x.organic + x.direct + x.other), 1);
                const segments = [
                  { value: m.google, color: "bg-blue-500", label: "Google" },
                  { value: m.facebook, color: "bg-indigo-500", label: "Meta" },
                  { value: m.organic, color: "bg-green-500", label: "Organic" },
                  { value: m.direct, color: "bg-gray-400", label: "Direct" },
                  { value: m.other, color: "bg-amber-500", label: "Other" },
                ];
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group relative">
                    <div className="absolute -top-10 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {m.month}: {total} leads
                    </div>
                    <div className="w-full flex flex-col-reverse" style={{ height: `${Math.max((total / maxTotal) * 100, total > 0 ? 4 : 2)}%`, minHeight: "2px" }}>
                      {segments.map((seg, si) =>
                        seg.value > 0 ? (
                          <div
                            key={si}
                            className={`w-full ${seg.color} ${si === segments.length - 1 ? "rounded-t" : ""} transition-all duration-300`}
                            style={{ height: `${(seg.value / total) * 100}%`, minHeight: "2px" }}
                            title={`${seg.label}: ${seg.value}`}
                          />
                        ) : null
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 truncate w-full text-center">{m.month.split(" ")[0]}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 justify-center flex-wrap">
              {[
                { label: "Google", color: "bg-blue-500" },
                { label: "Meta", color: "bg-indigo-500" },
                { label: "Organic", color: "bg-green-500" },
                { label: "Direct", color: "bg-gray-400" },
                { label: "Other", color: "bg-amber-500" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                  <span className="text-[10px] text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── GCLID Tracking ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-purple-500" />
            Google Click IDs (GCLIDs)
            <span className="text-[10px] text-gray-400 font-normal">— tracks individual ad clicks to leads</span>
          </h3>
          <button
            onClick={() => setShowGclids(!showGclids)}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            {showGclids ? "Hide" : `Show ${roi.gclids.length} clicks`}
            {showGclids ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
        {showGclids && roi.gclids.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-1 text-gray-500 font-medium">GCLID</th>
                  <th className="text-left py-2 px-1 text-gray-500 font-medium">Lead</th>
                  <th className="text-left py-2 px-1 text-gray-500 font-medium">Type</th>
                  <th className="text-left py-2 px-1 text-gray-500 font-medium">Campaign</th>
                  <th className="text-left py-2 px-1 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-2 px-1 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {roi.gclids.map((g) =>
                  g.entries.map((entry, ei) => (
                    <tr key={`${g.gclid}-${ei}`} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-1.5 px-1 text-gray-500 font-mono max-w-[120px] truncate" title={g.gclid}>
                        {g.gclid.substring(0, 16)}...
                      </td>
                      <td className="py-1.5 px-1 text-gray-800 font-medium">{entry.name}</td>
                      <td className="py-1.5 px-1">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium ${
                          entry.type === "quote" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-1.5 px-1 text-gray-600 max-w-[140px] truncate" title={entry.campaign}>
                        {entry.campaign || "—"}
                      </td>
                      <td className="py-1.5 px-1">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          entry.status === "won" || entry.status === "completed" ? "bg-green-100 text-green-700" :
                          entry.status === "quoted" ? "bg-purple-100 text-purple-700" :
                          entry.status === "contacted" || entry.status === "called" ? "bg-yellow-100 text-yellow-700" :
                          entry.status === "lost" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-1.5 px-1 text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {showGclids && roi.gclids.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">
            No GCLID data yet. When visitors click your Google Ads, their click IDs will appear here.
          </p>
        )}
      </div>

      {/* ── Offline Conversion Export ── */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <FileDown className="w-4 h-4 text-blue-600" />
          Offline Conversion Export
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Upload these CSV files to Google Ads and Meta to feed conversion data back into Smart Bidding. 
          This helps the algorithms find more customers like your best ones.
        </p>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Export status:</span>
          {(["won", "quoted", "contacted", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setExportStatus(s)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-all ${
                exportStatus === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Export Summary */}
        {exportData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
              <p className="text-[10px] text-gray-500 uppercase">Total</p>
              <p className="text-lg font-bold text-gray-800">{exportData.summary.total}</p>
            </div>
            <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
              <p className="text-[10px] text-gray-500 uppercase">With GCLID</p>
              <p className="text-lg font-bold text-blue-600">{exportData.summary.withGclid}</p>
            </div>
            <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
              <p className="text-[10px] text-gray-500 uppercase">With FBCLID</p>
              <p className="text-lg font-bold text-indigo-600">{exportData.summary.withFbclid}</p>
            </div>
            <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
              <p className="text-[10px] text-gray-500 uppercase">Total Value</p>
              <p className="text-lg font-bold text-amber-600">${exportData.summary.totalValue.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleExportGoogleAds}
            disabled={exportLoading || !exportData?.summary.withGclid}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-2"
            size="sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export for Google Ads ({exportData?.summary.withGclid || 0} conversions)
          </Button>
          <Button
            onClick={handleExportMeta}
            disabled={exportLoading || !exportData?.summary.withFbclid}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-2"
            size="sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export for Meta ({exportData?.summary.withFbclid || 0} conversions)
          </Button>
        </div>

        {/* Upload Instructions */}
        <div className="mt-4 bg-white/60 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-[11px] text-gray-600 space-y-1.5">
              <p className="font-semibold text-gray-700">How to upload offline conversions:</p>
              <div>
                <p className="font-medium text-gray-700">Google Ads:</p>
                <p>1. Go to Google Ads → Tools → Conversions → Uploads</p>
                <p>2. Click "+ Upload" and select the CSV file</p>
                <p>3. Map columns and confirm the import</p>
                <p>4. Do this weekly for best Smart Bidding results</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Meta (Facebook/Instagram):</p>
                <p>1. Go to Meta Events Manager → Offline Events</p>
                <p>2. Upload the CSV with customer match data</p>
                <p>3. Meta will match conversions to ad clicks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* ═══════════════ AD SPEND TAB ═══════════════ */}
      {activeSubTab === "adspend" && (
      <>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-500" />
                Ad Spend Tracking
              </h3>
              <p className="text-xs text-gray-400 mt-1">Enter your monthly ad spend per campaign to calculate cost-per-lead and ROAS</p>
            </div>
            <Button
              size="sm"
              onClick={() => { resetSpendForm(); setEditingSpend(null); setShowSpendForm(true); }}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Spend
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showSpendForm && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-700">{editingSpend ? "Edit" : "Add"} Ad Spend</h4>
                <button onClick={() => { setShowSpendForm(false); setEditingSpend(null); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Platform</label>
                  <select
                    value={spendForm.platform}
                    onChange={(e) => setSpendForm({ ...spendForm, platform: e.target.value as any })}
                    className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2 bg-white"
                  >
                    <option value="google_ads">Google Ads</option>
                    <option value="meta_ads">Meta Ads</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    value={spendForm.campaignName}
                    onChange={(e) => setSpendForm({ ...spendForm, campaignName: e.target.value })}
                    placeholder="e.g. Concrete Driveways"
                    className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Month *</label>
                  <input
                    type="month"
                    value={spendForm.month}
                    onChange={(e) => setSpendForm({ ...spendForm, month: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Spend (AUD) *</label>
                  <input
                    type="text"
                    value={spendForm.spend}
                    onChange={(e) => setSpendForm({ ...spendForm, spend: e.target.value })}
                    placeholder="1500.00"
                    className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Impressions</label>
                  <input
                    type="number"
                    value={spendForm.impressions}
                    onChange={(e) => setSpendForm({ ...spendForm, impressions: e.target.value })}
                    placeholder="Optional"
                    className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Clicks</label>
                  <input
                    type="number"
                    value={spendForm.clicks}
                    onChange={(e) => setSpendForm({ ...spendForm, clicks: e.target.value })}
                    placeholder="Optional"
                    className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Notes</label>
                  <input
                    type="text"
                    value={spendForm.notes}
                    onChange={(e) => setSpendForm({ ...spendForm, notes: e.target.value })}
                    placeholder="Optional notes"
                    className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleSaveSpend} disabled={upsertSpend.isPending} className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5">
                  {upsertSpend.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                  {editingSpend ? "Update" : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setShowSpendForm(false); setEditingSpend(null); }} className="text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Spend Table */}
          {spendLoading ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" /></div>
          ) : !adSpendList || adSpendList.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No ad spend data yet</p>
              <p className="text-gray-400 text-xs mt-1">Click "Add Spend" to start tracking your advertising costs</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Month</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Platform</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Campaign</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium">Spend</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium">Impressions</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium">Clicks</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium">CTR</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium">CPC</th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adSpendList.map((row) => {
                    const ctr = row.impressions && row.impressions > 0 ? ((row.clicks || 0) / row.impressions * 100).toFixed(2) : "—";
                    const cpc = row.clicks && row.clicks > 0 ? (parseFloat(row.spend) / row.clicks).toFixed(2) : "—";
                    return (
                      <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-2 text-gray-700 font-medium">{row.month}</td>
                        <td className="py-2 px-2">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            row.platform === "google_ads" ? "bg-blue-50 text-blue-700" :
                            row.platform === "meta_ads" ? "bg-indigo-50 text-indigo-700" :
                            "bg-gray-50 text-gray-700"
                          }`}>
                            {row.platform === "google_ads" ? "Google" : row.platform === "meta_ads" ? "Meta" : "Other"}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-gray-700 max-w-[200px] truncate" title={row.campaignName}>{row.campaignName}</td>
                        <td className="py-2 px-2 text-right text-amber-600 font-semibold">${parseFloat(row.spend).toLocaleString()}</td>
                        <td className="py-2 px-2 text-right text-gray-600">{row.impressions?.toLocaleString() || "—"}</td>
                        <td className="py-2 px-2 text-right text-gray-600">{row.clicks?.toLocaleString() || "—"}</td>
                        <td className="py-2 px-2 text-right text-gray-500">{ctr}{ctr !== "—" ? "%" : ""}</td>
                        <td className="py-2 px-2 text-right text-gray-500">{cpc !== "—" ? `$${cpc}` : "—"}</td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleEditSpend(row)} className="p-1 text-gray-400 hover:text-amber-600 rounded">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => { if (confirm("Delete this spend entry?")) deleteSpend.mutate({ id: row.id }); }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
      )}

      {/* ═══════════════ CAMPAIGN ROI TAB ═══════════════ */}
      {activeSubTab === "roi" && (
      <>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">Date Range:</span>
          {(["30", "60", "90", "180", "365", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                dateRange === range
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {range === "all" ? "All Time" : `${range}d`}
            </button>
          ))}
        </div>

        {/* ROI Summary Cards */}
        {roiLoading ? (
          <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" /></div>
        ) : campaignRoi && typeof campaignRoi === "object" && "totals" in campaignRoi ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Spend</p>
                <p className="text-xl font-bold text-gray-900">${campaignRoi.totals.spend.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Leads</p>
                <p className="text-xl font-bold text-blue-600">{campaignRoi.totals.leads}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Won</p>
                <p className="text-xl font-bold text-green-600">{campaignRoi.totals.won}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Revenue</p>
                <p className="text-xl font-bold text-amber-600">${campaignRoi.totals.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Cost/Lead</p>
                <p className={`text-xl font-bold ${campaignRoi.totals.costPerLead > 100 ? "text-red-600" : campaignRoi.totals.costPerLead > 50 ? "text-amber-600" : "text-green-600"}`}>
                  ${campaignRoi.totals.costPerLead}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">ROAS</p>
                <p className={`text-xl font-bold ${campaignRoi.totals.roas >= 3 ? "text-green-600" : campaignRoi.totals.roas >= 1 ? "text-amber-600" : "text-red-600"}`}>
                  {campaignRoi.totals.roas}x
                </p>
              </div>
            </div>

            {/* Campaign ROI Table */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Campaign ROI Breakdown
                <span className="text-[10px] text-gray-400 font-normal ml-2">Ad spend matched to leads by campaign name</span>
              </h3>
              {campaignRoi.campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No data yet. Add ad spend and get leads with UTM campaign tags to see ROI.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 text-gray-500 font-medium">Campaign</th>
                        <th className="text-left py-2 px-2 text-gray-500 font-medium">Platform</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">Spend</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">Impr.</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">Clicks</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">CTR</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">CPC</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">Leads</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">Won</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">Revenue</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">CPL</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">CPA</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">ROAS</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">Win %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignRoi.campaigns.map((c) => (
                        <tr key={c.campaign} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium text-gray-800 max-w-[180px] truncate" title={c.campaign}>{c.campaign}</td>
                          <td className="py-2 px-2">
                            {c.platform && (
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                c.platform === "google_ads" ? "bg-blue-50 text-blue-700" :
                                c.platform === "meta_ads" ? "bg-indigo-50 text-indigo-700" :
                                c.platform ? "bg-gray-50 text-gray-700" : ""
                              }`}>
                                {c.platform === "google_ads" ? "Google" : c.platform === "meta_ads" ? "Meta" : c.platform || "—"}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right text-gray-600">{c.spend > 0 ? `$${c.spend.toLocaleString()}` : "—"}</td>
                          <td className="py-2 px-2 text-right text-gray-500">{c.impressions > 0 ? c.impressions.toLocaleString() : "—"}</td>
                          <td className="py-2 px-2 text-right text-gray-500">{c.clicks > 0 ? c.clicks.toLocaleString() : "—"}</td>
                          <td className="py-2 px-2 text-right text-gray-500">{c.ctr > 0 ? `${c.ctr}%` : "—"}</td>
                          <td className="py-2 px-2 text-right text-gray-500">{c.costPerClick > 0 ? `$${c.costPerClick}` : "—"}</td>
                          <td className="py-2 px-2 text-right font-semibold text-gray-800">{c.leads}</td>
                          <td className="py-2 px-2 text-right text-green-600 font-semibold">{c.won}</td>
                          <td className="py-2 px-2 text-right text-amber-600 font-semibold">{c.revenue > 0 ? `$${c.revenue.toLocaleString()}` : "—"}</td>
                          <td className={`py-2 px-2 text-right font-semibold ${c.costPerLead > 100 ? "text-red-600" : c.costPerLead > 50 ? "text-amber-600" : "text-green-600"}`}>
                            {c.costPerLead > 0 ? `$${c.costPerLead}` : "—"}
                          </td>
                          <td className={`py-2 px-2 text-right font-semibold ${c.costPerAcquisition > 500 ? "text-red-600" : c.costPerAcquisition > 200 ? "text-amber-600" : "text-green-600"}`}>
                            {c.costPerAcquisition > 0 ? `$${c.costPerAcquisition}` : "—"}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              c.roas >= 3 ? "bg-green-100 text-green-700" :
                              c.roas >= 1 ? "bg-yellow-100 text-yellow-700" :
                              c.roas > 0 ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {c.roas > 0 ? `${c.roas}x` : "—"}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              c.winRate >= 30 ? "bg-green-100 text-green-700" :
                              c.winRate >= 15 ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {c.winRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ROI Insights */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-500" />
                How to use this data
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-[11px] text-gray-600">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Cost Per Lead (CPL)</p>
                  <p>How much you spend to get one lead. Under $50 is great for concreting. Over $100 means the campaign needs optimization.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Cost Per Acquisition (CPA)</p>
                  <p>How much you spend to win one job. Compare this to your average profit margin to ensure profitability.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">ROAS (Return on Ad Spend)</p>
                  <p>Revenue generated per dollar spent. 3x+ is excellent. Under 1x means you're losing money on that campaign.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Campaign Matching</p>
                  <p>Campaign names are matched between your ad spend entries and UTM campaign tags on incoming leads. Use identical names for accurate tracking.</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Zap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Add ad spend data in the "Ad Spend" tab to see ROI calculations</p>
          </div>
        )}
      </>
      )}

      {/* ═══════════════ EMAIL DIGEST TAB ═══════════════ */}
      {activeSubTab === "digest" && (
      <>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            Weekly Performance Digest
          </h3>
          <p className="text-xs text-gray-400 mb-6">
            Automatically receive a comprehensive weekly email with leads, revenue, campaign performance, and action items.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Settings Form */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-600 font-medium">Enable Digest</label>
                <button
                  onClick={() => setDigestForm({ ...digestForm, enabled: !digestForm.enabled })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    digestForm.enabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    digestForm.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={digestForm.recipientEmail}
                  onChange={(e) => setDigestForm({ ...digestForm, recipientEmail: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Frequency</label>
                <select
                  value={digestForm.frequency}
                  onChange={(e) => setDigestForm({ ...digestForm, frequency: e.target.value as any })}
                  className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2 bg-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly (1st of month)</option>
                </select>
              </div>

              {digestForm.frequency === "weekly" && (
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Day of Week</label>
                  <select
                    value={digestForm.dayOfWeek}
                    onChange={(e) => setDigestForm({ ...digestForm, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2 bg-white"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => saveDigest.mutate(digestForm)}
                  disabled={saveDigest.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                >
                  {saveDigest.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Settings className="w-3 h-3" />}
                  Save Settings
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendDigestNow.mutate()}
                  disabled={sendDigestNow.isPending}
                  className="text-xs gap-1.5"
                >
                  {sendDigestNow.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Send Test Now
                </Button>
              </div>
            </div>

            {/* Preview / Info */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                What's included in the digest
              </h4>
              <div className="space-y-2 text-[11px] text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>KPI Summary</strong> — Total leads, won jobs, revenue, and week-over-week changes</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Conversion Funnel</strong> — New → Contacted → Quoted → Won breakdown</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Campaign Performance</strong> — Top campaigns with spend, revenue, and ROAS</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Source Breakdown</strong> — Where your leads are coming from</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Ad Spend Summary</strong> — Monthly spend, cost per lead, overall ROAS</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Action Items</strong> — Offline conversion upload reminders and lost lead follow-ups</span>
                </div>
              </div>

              {digestSettings?.lastSentAt && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Clock className="w-3 h-3" />
                    Last sent: {new Date(digestSettings.lastSentAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Offline Conversion Upload Routine */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-600" />
            Weekly Upload Routine
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Follow this checklist every Monday to keep your Google Ads Smart Bidding optimized.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-white/70 rounded-lg p-3 border border-green-100">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">1</div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Export won conversions</p>
                <p className="text-[11px] text-gray-500">Go to the Overview tab → Offline Conversion Export → filter by "Won" → download CSV</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/70 rounded-lg p-3 border border-green-100">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">2</div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Upload to Google Ads</p>
                <p className="text-[11px] text-gray-500">Google Ads → Tools & Settings → Conversions → Uploads → click "+ Upload" → select CSV</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/70 rounded-lg p-3 border border-green-100">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">3</div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Update ad spend</p>
                <p className="text-[11px] text-gray-500">Go to the Ad Spend tab → add this month's spend for each campaign</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/70 rounded-lg p-3 border border-green-100">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">4</div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Review Campaign ROI</p>
                <p className="text-[11px] text-gray-500">Check the Campaign ROI tab — pause campaigns with ROAS under 1x, increase budget on 3x+ campaigns</p>
              </div>
            </div>
          </div>
        </div>
      </>
      )}
    </div>
  );
}
