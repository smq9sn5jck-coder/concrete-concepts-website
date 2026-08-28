import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MousePointerClick,
  Eye,
  Target,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Calendar,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

type DatePreset = "last_7d" | "last_14d" | "last_30d" | "last_90d";

export default function GoogleAdsDashboard() {
  const [datePreset, setDatePreset] = useState<DatePreset>("last_30d");

  const { data, isLoading, error, refetch, isFetching } = trpc.analytics.googleAds.useQuery(
    { datePreset },
    { staleTime: 5 * 60 * 1000 } // 5 min cache
  );

  const sendReport = trpc.analytics.sendGoogleAdsReport.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <span className="ml-2 text-sm text-gray-500">Loading Google Ads data...</span>
      </div>
    );
  }

  if (!data || !data.configured) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 font-medium">Windsor.ai API key not configured</p>
        <p className="text-xs text-gray-400 mt-1">Add WINDSOR_API_KEY in Settings → Secrets to enable live Google Ads data</p>
      </div>
    );
  }

  if ("error" in data && data.error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-600 font-medium">Error fetching Google Ads data</p>
        <p className="text-xs text-red-400 mt-1">{data.error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          <RefreshCw className="w-3 h-3 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  if (!("totals" in data)) return null;

  const { totals, campaigns, daily, devices, dayOfWeek, suburbs } = data;

  return (
    <div className="space-y-6">
      {/* Header with date selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            Google Ads — Live Dashboard
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Real-time data from Windsor.ai</p>
        </div>
        <div className="flex items-center gap-2">
          {(["last_7d", "last_14d", "last_30d", "last_90d"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setDatePreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                datePreset === preset
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {preset.replace("last_", "").replace("d", " days")}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="ml-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendReport.mutate()}
            disabled={sendReport.isPending}
            className="ml-1"
          >
            {sendReport.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Mail className="w-3.5 h-3.5 mr-1" />}
            Email Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Total Spend"
          value={`$${totals.spend.toFixed(2)}`}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <KpiCard
          icon={MousePointerClick}
          label="Clicks"
          value={totals.clicks.toLocaleString()}
          sub={`CPC: $${totals.cpc.toFixed(2)}`}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KpiCard
          icon={Target}
          label="Conversions"
          value={totals.conversions.toString()}
          sub={`Cost/Conv: $${totals.costPerConversion.toFixed(2)}`}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <KpiCard
          icon={Eye}
          label="Impressions"
          value={totals.impressions.toLocaleString()}
          sub={`CTR: ${(totals.ctr * 100).toFixed(2)}%`}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-800">Campaign Performance</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-2 font-medium text-gray-500">Campaign</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500">Spend</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500">Clicks</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500">Impr.</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500">Conv.</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500">CPC</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500">Cost/Conv</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500">Conv Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[200px] truncate">{c.campaign}</td>
                  <td className="text-right px-3 py-2.5 text-gray-600">${c.spend.toFixed(2)}</td>
                  <td className="text-right px-3 py-2.5 text-gray-600">{c.clicks.toLocaleString()}</td>
                  <td className="text-right px-3 py-2.5 text-gray-600">{c.impressions.toLocaleString()}</td>
                  <td className="text-right px-3 py-2.5 font-semibold text-green-700">{c.conversions}</td>
                  <td className="text-right px-3 py-2.5 text-gray-600">{c.cpc ? `$${c.cpc.toFixed(2)}` : "—"}</td>
                  <td className="text-right px-3 py-2.5 text-gray-600">{c.costPerConversion ? `$${c.costPerConversion.toFixed(2)}` : "—"}</td>
                  <td className="text-right px-3 py-2.5 text-gray-600">{(c.conversionRate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-column layout: Devices + Day of Week */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Device Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-800">Device Performance</h4>
          </div>
          <div className="p-4 space-y-3">
            {devices.map((d, i) => {
              const DeviceIcon = d.device === "MOBILE" ? Smartphone : d.device === "TABLET" ? Tablet : Monitor;
              const pctSpend = totals.spend > 0 ? (d.spend / totals.spend) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <DeviceIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 capitalize">{d.device.toLowerCase()}</span>
                      <span className="text-xs text-gray-500">{d.conversions} conv · ${d.spend.toFixed(0)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${pctSpend}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-400">{d.clicks} clicks</span>
                      <span className="text-[10px] text-gray-400">CPC: {d.cpc ? `$${d.cpc.toFixed(2)}` : "—"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day of Week */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-800">Day of Week Performance</h4>
          </div>
          <div className="p-4 space-y-2">
            {dayOfWeek.map((d, i) => {
              const maxConv = Math.max(...dayOfWeek.map(x => x.conversions), 1);
              const barWidth = (d.conversions / maxConv) * 100;
              const isBest = d.conversions === maxConv && d.conversions > 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-8 text-right font-medium">
                    {d.dayOfWeek.slice(0, 3)}
                  </span>
                  <div className="flex-1 h-5 bg-gray-50 rounded overflow-hidden relative">
                    <div
                      className={`h-full rounded transition-all ${isBest ? "bg-green-500" : "bg-amber-400"}`}
                      style={{ width: `${Math.max(barWidth, d.conversions > 0 ? 8 : 0)}%` }}
                    />
                    {d.conversions > 0 && (
                      <span className="absolute right-2 top-0.5 text-[10px] font-bold text-gray-700">
                        {d.conversions}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 w-16 text-right">
                    {d.costPerConversion ? `$${d.costPerConversion.toFixed(0)}/conv` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Spend Trend (simple bar chart) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-800">Daily Spend & Conversions</h4>
        </div>
        <div className="p-4">
          <DailyChart daily={daily} />
        </div>
      </div>

      {/* Top Suburbs */}
      {suburbs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              Top Converting Suburbs
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Suburb</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-500">Conv.</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-500">Clicks</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-500">Spend</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-500">Cost/Conv</th>
                </tr>
              </thead>
              <tbody>
                {suburbs.filter(s => s.conversions > 0 || s.clicks > 2).slice(0, 15).map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors">
                    <td className="px-4 py-2 font-medium text-gray-800">{s.city}</td>
                    <td className="text-right px-3 py-2 font-semibold text-green-700">{s.conversions}</td>
                    <td className="text-right px-3 py-2 text-gray-600">{s.clicks}</td>
                    <td className="text-right px-3 py-2 text-gray-600">${s.spend.toFixed(2)}</td>
                    <td className="text-right px-3 py-2 text-gray-600">
                      {s.conversions > 0 ? `$${(s.spend / s.conversions).toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bgColor,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4 border border-gray-100`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Simple Daily Chart (CSS-based) ── */
function DailyChart({ daily }: { daily: { date: string; spend: number; conversions: number }[] }) {
  const maxSpend = Math.max(...daily.map(d => d.spend), 1);
  const totalDays = daily.length;

  // Show every Nth label to avoid crowding
  const labelEvery = totalDays > 14 ? 7 : totalDays > 7 ? 3 : 1;

  return (
    <div className="space-y-2">
      {/* Bars */}
      <div className="flex items-end gap-[2px] h-32">
        {daily.map((d, i) => {
          const height = (d.spend / maxSpend) * 100;
          const hasConversion = d.conversions > 0;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 bg-gray-900 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap">
                {d.date}: ${d.spend.toFixed(0)} · {d.conversions} conv
              </div>
              <div
                className={`w-full rounded-t transition-all ${
                  hasConversion ? "bg-green-500" : "bg-amber-300"
                } group-hover:opacity-80`}
                style={{ height: `${Math.max(height, 2)}%` }}
              />
            </div>
          );
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex gap-[2px]">
        {daily.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            {i % labelEvery === 0 && (
              <span className="text-[8px] text-gray-400">
                {new Date(d.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 justify-center mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-amber-300" />
          <span className="text-[10px] text-gray-500">Spend (no conv)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-green-500" />
          <span className="text-[10px] text-gray-500">Spend (with conv)</span>
        </div>
      </div>
    </div>
  );
}
