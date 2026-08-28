import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Wrench,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
  Inbox,
  Shield,
  BarChart3,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  MessageSquare,
  DollarSign,
  CircleDot,
  PhoneCall,
  FileCheck,
  Trophy,
  Ban,
  StickyNote,
  Save,
  Download,
  Send,
  RefreshCw,
  Eye,
  Share2,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import QuoteBuilder from "@/components/QuoteBuilder";
import { usePushNotifications } from "@/hooks/usePushNotifications";
const SocialMediaPanel = lazy(() => import("@/components/SocialMediaPanel"));
const AdsRoiPanel = lazy(() => import("@/components/AdsRoiPanel"));

/* ── Status Config ── */
const STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-100 text-blue-800 border-blue-200", icon: CircleDot, dotColor: "bg-blue-500" },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: PhoneCall, dotColor: "bg-yellow-500" },
  quoted: { label: "Quoted", color: "bg-purple-100 text-purple-800 border-purple-200", icon: FileCheck, dotColor: "bg-purple-500" },
  won: { label: "Won", color: "bg-green-100 text-green-800 border-green-200", icon: Trophy, dotColor: "bg-green-500" },
  lost: { label: "Lost", color: "bg-red-100 text-red-800 border-red-200", icon: Ban, dotColor: "bg-red-500" },
} as const;

type QuoteStatus = keyof typeof STATUS_CONFIG;

/* ── PDF Actions ── */
function PdfActions({ quoteId, pdfUrl, pdfRef, pdfSentAt, customerEmail, onUpdate }: {
  quoteId: number;
  pdfUrl: string | null;
  pdfRef: string | null;
  pdfSentAt: Date | null;
  customerEmail: string;
  onUpdate: () => void;
}) {
  const sendPdf = trpc.quote.sendPdf.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      onUpdate();
    },
    onError: (err) => toast.error(err.message),
  });

  const regeneratePdf = trpc.quote.regeneratePdf.useMutation({
    onSuccess: () => {
      toast.success("PDF estimate regenerated");
      onUpdate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!pdfUrl) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500">No PDF generated yet.</p>
        <button
          onClick={(e) => { e.stopPropagation(); regeneratePdf.mutate({ id: quoteId }); }}
          disabled={regeneratePdf.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {regeneratePdf.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Generate PDF
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preview / Download */}
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 text-xs font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        Preview
      </a>
      <a
        href={pdfUrl}
        download={`Estimate-${pdfRef || quoteId}.pdf`}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Download
      </a>

      {/* Send to Customer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`Send PDF estimate to ${customerEmail}?`)) {
            sendPdf.mutate({ id: quoteId });
          }
        }}
        disabled={sendPdf.isPending}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
          pdfSentAt
            ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {sendPdf.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Send className="w-3.5 h-3.5" />
        )}
        {pdfSentAt ? "Resend to Customer" : "Send to Customer"}
      </button>

      {/* Regenerate */}
      <button
        onClick={(e) => { e.stopPropagation(); regeneratePdf.mutate({ id: quoteId }); }}
        disabled={regeneratePdf.isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {regeneratePdf.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        Regenerate
      </button>
    </div>
  );
}

/* ── Quote Card ── */
function QuoteCard({ quote, onStatusUpdate }: { quote: {
  id: number;
  name: string;
  phone: string;
  email: string;
  suburb: string;
  service: string;
  details: string | null;
  photoUrls: string | null;
  leadSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  fbclid: string | null;
  referrer: string | null;
  landingPage: string | null;
  status: string;
  notes: string | null;
  quotedAmount: string | null;
  pdfUrl: string | null;
  pdfRef: string | null;
  pdfSentAt: Date | null;
  customTerms: string | null;
  customNotes: string | null;
  validityDays: number | null;
  gstIncluded: number | null;
  createdAt: Date;
  updatedAt: Date;
}; onStatusUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(quote.notes || "");
  const [quotedAmountValue, setQuotedAmountValue] = useState(quote.quotedAmount || "");

  const updateStatus = trpc.quote.updateStatus.useMutation({
    onSuccess: () => {
      onStatusUpdate();
      toast.success("Quote updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const status = (quote.status as QuoteStatus) || "new";
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const photos = quote.photoUrls ? JSON.parse(quote.photoUrls) as string[] : [];

  const handleStatusChange = (newStatus: QuoteStatus) => {
    updateStatus.mutate({ id: quote.id, status: newStatus });
  };

  const handleSaveNotes = () => {
    updateStatus.mutate({
      id: quote.id,
      notes: notesValue,
      quotedAmount: quotedAmountValue || undefined,
    });
    setEditingNotes(false);
  };

  return (
    <div className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow ${status === "won" ? "border-green-300" : status === "lost" ? "border-red-200" : "border-gray-200"}`}>
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900">{quote.name}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                {quote.service}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              {quote.quotedAmount && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <DollarSign className="w-3 h-3" />
                  ${quote.quotedAmount}
                </span>
              )}
              {photos.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <ImageIcon className="w-3 h-3" />
                  {photos.length} photo{photos.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {quote.suburb}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {timeAgo(quote.createdAt)}
              </span>
              {quote.leadSource && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  {quote.leadSource}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-gray-400">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {/* Status Pipeline */}
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Status Pipeline</p>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map((s) => {
                const config = STATUS_CONFIG[s];
                const Icon = config.icon;
                const isActive = status === s;
                return (
                  <button
                    key={s}
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(s); }}
                    disabled={updateStatus.isPending}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isActive
                        ? `${config.color} ring-2 ring-offset-1 ring-current`
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Actions */}
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href={`tel:${quote.phone}`}
              className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Phone className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-green-600 font-medium">Phone</p>
                <p className="text-sm font-semibold text-green-800">{quote.phone}</p>
              </div>
            </a>
            <a
              href={`mailto:${quote.email}`}
              className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600 font-medium">Email</p>
                <p className="text-sm font-semibold text-blue-800">{quote.email}</p>
              </div>
            </a>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Project Details</p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {quote.details || "No additional details provided."}
            </p>
          </div>

          {/* Notes & Quoted Amount */}
          <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-amber-600" />
                <p className="text-xs text-amber-700 font-medium uppercase tracking-wider">Notes & Quote Amount</p>
              </div>
              {!editingNotes ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingNotes(true); }}
                  className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleSaveNotes(); }}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Quoted Amount ($)</label>
                  <input
                    type="text"
                    value={quotedAmountValue}
                    onChange={(e) => setQuotedAmountValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="e.g. 4,500"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Internal Notes</label>
                  <textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Add notes about this quote..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {quote.quotedAmount && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Quoted:</span> ${quote.quotedAmount}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  {quote.notes || "No notes yet. Click Edit to add notes."}
                </p>
              </div>
            )}
          </div>

          {/* Photos */}
          {photos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Customer Photos</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                        width={300}
                        height={200}
                        loading="lazy"
                        decoding="async"
                      alt={`Customer photo ${i + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Lead Source */}
          {quote.leadSource && (
            <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <p className="text-xs text-emerald-700 font-medium uppercase tracking-wider">Lead Source</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Source:</span>{" "}
                  <span className="font-medium text-gray-800">{quote.leadSource}</span>
                </div>
                {quote.utmCampaign && (
                  <div>
                    <span className="text-gray-500">Campaign:</span>{" "}
                    <span className="font-medium text-gray-800">{quote.utmCampaign}</span>
                  </div>
                )}
                {quote.utmSource && (
                  <div>
                    <span className="text-gray-500">UTM Source:</span>{" "}
                    <span className="font-medium text-gray-800">{quote.utmSource}{quote.utmMedium ? ` / ${quote.utmMedium}` : ""}</span>
                  </div>
                )}
                {quote.utmContent && (
                  <div>
                    <span className="text-gray-500">Ad Content:</span>{" "}
                    <span className="font-medium text-gray-800">{quote.utmContent}</span>
                  </div>
                )}
                {quote.gclid && (
                  <div>
                    <span className="text-gray-500">GCLID:</span>{" "}
                    <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-1 rounded">{quote.gclid.substring(0, 20)}...</span>
                  </div>
                )}
                {quote.fbclid && (
                  <div>
                    <span className="text-gray-500">FBCLID:</span>{" "}
                    <span className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-1 rounded">{quote.fbclid.substring(0, 20)}...</span>
                  </div>
                )}
                {quote.landingPage && (
                  <div>
                    <span className="text-gray-500">Landing Page:</span>{" "}
                    <span className="font-medium text-gray-800">{quote.landingPage}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quote Builder — editable line items, PDF generation & send */}
          <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100">
            <QuoteBuilder
              quoteId={quote.id}
              service={quote.service}
              customerName={quote.name}
              customerEmail={quote.email}
              pdfUrl={quote.pdfUrl}
              pdfRef={quote.pdfRef}
              pdfSentAt={quote.pdfSentAt}
              customTerms={quote.customTerms}
              customNotes={quote.customNotes}
              validityDays={quote.validityDays}
              gstIncluded={quote.gstIncluded}
              onUpdate={onStatusUpdate}
            />
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-400">
            Submitted: {new Date(quote.createdAt).toLocaleString("en-AU", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Simple Bar Chart ── */
function SimpleBarChart({ data, labelKey, valueKey, color = "bg-amber-500" }: {
  data: { name: string; count: number }[];
  labelKey: string;
  valueKey: string;
  color?: string;
}) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-28 truncate text-right" title={item.name}>
            {item.name}
          </span>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
              style={{ width: `${Math.max((item.count / max) * 100, 8)}%` }}
            >
              <span className="text-[10px] font-bold text-white">{item.count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Daily Sparkline Chart ── */
function DailyChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-px h-32 w-full">
      {data.map((d, i) => {
        const height = max > 0 ? (d.count / max) * 100 : 0;
        const dateObj = new Date(d.date);
        const label = dateObj.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
        return (
          <div
            key={i}
            className="flex flex-col items-center justify-end flex-1 group relative"
          >
            <div className="absolute -top-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {label}: {d.count} quote{d.count !== 1 ? 's' : ''}
            </div>
            <div
              className={`w-full rounded-t transition-all duration-300 ${d.count > 0 ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-200'}`}
              style={{ height: `${Math.max(height, d.count > 0 ? 4 : 2)}%`, minHeight: '2px' }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ── Analytics Tab ── */
function AnalyticsPanel() {
  const { data: stats, isLoading, error } = trpc.analytics.quoteStats.useQuery();

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-3" />
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-2">Failed to load analytics</p>
        <p className="text-gray-400 text-sm">{error.message}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.summary.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">Today</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.summary.today}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">This Week</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.summary.thisWeek}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">This Month</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.summary.thisMonth}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">Avg/Day</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.summary.avgPerDay}</p>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-500" />
          Quotes — Last 30 Days
        </h3>
        <DailyChart data={stats.dailyStats} />
        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
          <span>{new Date(stats.dailyStats[0]?.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
          <span>Today</span>
        </div>
      </div>

      {/* Service + Suburb Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500" />
            Quotes by Service
          </h3>
          {stats.serviceStats.length > 0 ? (
            <SimpleBarChart data={stats.serviceStats} labelKey="name" valueKey="count" color="bg-amber-500" />
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            Top 10 Suburbs
          </h3>
          {stats.suburbStats.length > 0 ? (
            <SimpleBarChart data={stats.suburbStats} labelKey="name" valueKey="count" color="bg-blue-500" />
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          Monthly Trend — Last 12 Months
        </h3>
        <div className="flex items-end gap-2 h-40">
          {stats.monthlyStats.map((m, i) => {
            const max = Math.max(...stats.monthlyStats.map(s => s.count), 1);
            const height = max > 0 ? (m.count / max) * 100 : 0;
            return (
              <div key={i} className="flex flex-col items-center flex-1 group relative">
                <div className="absolute -top-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {m.month}: {m.count}
                </div>
                <div
                  className={`w-full rounded-t transition-all duration-300 ${m.count > 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-200'}`}
                  style={{ height: `${Math.max(height, m.count > 0 ? 4 : 2)}%`, minHeight: '2px' }}
                />
                <span className="text-[9px] text-gray-400 mt-1 truncate w-full text-center">
                  {m.month.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Push Notification Toggle ── */
import { Bell, BellOff, BellRing } from "lucide-react";

function PushNotificationToggle() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const testPush = trpc.push.test.useMutation();

  if (!isSupported) return null;

  const handleToggle = async () => {
    if (isSubscribed) {
      const ok = await unsubscribe();
      if (ok) toast.success("Push notifications disabled");
      else toast.error("Failed to disable notifications");
    } else {
      const ok = await subscribe();
      if (ok) {
        toast.success("Push notifications enabled! You'll get alerts for new quotes.");
        // Send a test notification
        setTimeout(() => {
          testPush.mutate(undefined, {
            onSuccess: (result) => {
              if (result.sent > 0) {
                toast.success("Test notification sent!");
              }
            },
          });
        }, 1000);
      } else if (permission === "denied") {
        toast.error("Notifications blocked. Please enable them in your browser settings.");
      } else {
        toast.error("Failed to enable notifications");
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading || permission === "denied"}
      className={`flex items-center gap-1.5 ${
        isSubscribed
          ? "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100"
          : permission === "denied"
          ? "text-red-400 border-red-200"
          : "text-gray-500 hover:text-gray-700"
      }`}
      title={
        isSubscribed
          ? "Push notifications enabled — click to disable"
          : permission === "denied"
          ? "Notifications blocked in browser settings"
          : "Enable push notifications for new quotes"
      }
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isSubscribed ? (
        <BellRing className="w-3.5 h-3.5" />
      ) : permission === "denied" ? (
        <BellOff className="w-3.5 h-3.5" />
      ) : (
        <Bell className="w-3.5 h-3.5" />
      )}
      {isSubscribed ? "Alerts On" : "Alerts Off"}
    </Button>
  );
}

/* ── Main Admin Dashboard ── */
export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"quotes" | "analytics" | "adsroi" | "social">("quotes");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");

  const utils = trpc.useUtils();

  // Only fetch quotes if user is authenticated and admin
  const { data: quotes, isLoading: quotesLoading, error: quotesError } = trpc.quote.list.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const filteredQuotes = useMemo(() => {
    if (!quotes) return [];
    if (statusFilter === "all") return quotes;
    return quotes.filter(q => q.status === statusFilter);
  }, [quotes, statusFilter]);

  const statusCounts = useMemo(() => {
    if (!quotes) return {} as Record<string, number>;
    const counts: Record<string, number> = { all: quotes.length };
    quotes.forEach(q => {
      const s = q.status || "new";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [quotes]);

  const handleStatusUpdate = () => {
    utils.quote.list.invalidate();
  };

  // Loading auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
          <p className="text-gray-500 mb-6">
            Please sign in with your admin account to access the dashboard.
          </p>
          <a href={getLoginUrl()}>
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              Sign In
            </Button>
          </a>
          <Link href="/">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mt-4 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to website
            </span>
          </Link>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">
            Your account does not have admin privileges. Please contact the site owner.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to website
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-amber-600" />
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <PushNotificationToggle />
              <Link href="/">
                <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to site
                </span>
              </Link>
              <span className="text-sm text-gray-400">
                {user?.name || user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("quotes")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "quotes"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileText className="w-4 h-4" />
              Quotes
              {quotes && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === "quotes" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                }`}>
                  {quotes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "analytics"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("adsroi")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "adsroi"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Ads ROI
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "social"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Share2 className="w-4 h-4" />
              Social Media
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "quotes" && (
          <>
            {/* Status Filter Pills */}
            {quotes && quotes.length > 0 && (
              <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      statusFilter === "all"
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    All ({statusCounts.all || 0})
                  </button>
                  {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map((s) => {
                    const config = STATUS_CONFIG[s];
                    const Icon = config.icon;
                    const count = statusCounts[s] || 0;
                    return (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          statusFilter === s
                            ? `${config.color} ring-1 ring-current`
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {config.label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats Bar */}
            {quotes && quotes.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Enquiries</p>
                  <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-blue-200 p-4">
                  <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">New</p>
                  <p className="text-2xl font-bold text-blue-600">{statusCounts.new || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-purple-200 p-4">
                  <p className="text-xs text-purple-600 uppercase tracking-wider mb-1">Quoted</p>
                  <p className="text-2xl font-bold text-purple-600">{statusCounts.quoted || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-green-200 p-4">
                  <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Won</p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.won || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-red-200 p-4">
                  <p className="text-xs text-red-600 uppercase tracking-wider mb-1">Lost</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.lost || 0}</p>
                </div>
              </div>
            )}

            {/* Quote List */}
            {quotesLoading ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-3" />
                <p className="text-gray-500">Loading quote requests...</p>
              </div>
            ) : quotesError ? (
              <div className="text-center py-16">
                <p className="text-red-500 mb-2">Failed to load quotes</p>
                <p className="text-gray-400 text-sm">{quotesError.message}</p>
              </div>
            ) : filteredQuotes.length > 0 ? (
              <div className="space-y-3">
                {filteredQuotes.map((quote) => (
                  <QuoteCard key={quote.id} quote={quote} onStatusUpdate={handleStatusUpdate} />
                ))}
              </div>
            ) : quotes && quotes.length > 0 ? (
              <div className="text-center py-16">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No quotes with this status</h3>
                <p className="text-gray-400">
                  Try selecting a different status filter above.
                </p>
              </div>
            ) : (
              <div className="text-center py-16">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No quote requests yet</h3>
                <p className="text-gray-400">
                  When clients submit quote requests through your website, they&apos;ll appear here.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "analytics" && <AnalyticsPanel />}

        {activeTab === "adsroi" && (
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-amber-600" /></div>}>
            <AdsRoiPanel />
          </Suspense>
        )}

        {activeTab === "social" && (
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-amber-600" /></div>}>
            <SocialMediaPanel />
          </Suspense>
        )}
      </main>
    </div>
  );
}
