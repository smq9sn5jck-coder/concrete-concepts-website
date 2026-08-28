import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useSearch, Link } from "wouter";
import {
  Search,
  Phone,
  Clock,
  CheckCircle2,
  Circle,
  MessageSquare,
  FileText,
  Calendar,
  ArrowLeft,
  Loader2,
  Shield,
  ChevronRight,
  MapPin,
  Wrench,
  DollarSign,
  Download,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackPhoneCallClick } from "@/components/ConversionTracking";

// Status step configuration
const STATUS_STEPS = [
  { key: "new", label: "Enquiry Received", icon: MessageSquare, description: "We've received your enquiry" },
  { key: "contacted", label: "Under Review", icon: Phone, description: "Our team is reviewing your project" },
  { key: "quoted", label: "Quote Sent", icon: FileText, description: "Your detailed quote has been prepared" },
  { key: "won", label: "Confirmed", icon: CheckCircle2, description: "Project confirmed and scheduled" },
] as const;

const STATUS_ORDER = ["new", "contacted", "quoted", "won", "lost"];

function getStatusIndex(status: string): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getTimeSince(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(d);
}

// Status detail view — shown when a token is in the URL
function QuoteStatusDetail({ token }: { token: string }) {
  const { data: quote, isLoading, error } = trpc.status.byToken.useQuery({ token });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-brand-gold mb-4" />
        <p className="text-brand-silver font-body">Loading your quote status...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <AlertCircle className="w-16 h-16 text-brand-silver mx-auto mb-4" />
        <h2 className="text-2xl font-heading font-bold text-brand-charcoal mb-2">
          Quote Not Found
        </h2>
        <p className="text-brand-silver font-body mb-6">
          We couldn't find a quote with this tracking link. It may have expired or the link may be incorrect.
        </p>
        <Link href="/my-quote">
          <Button className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold">
            <Search className="w-4 h-4 mr-2" />
            Look Up by Phone Number
          </Button>
        </Link>
      </div>
    );
  }

  const currentStatusIdx = getStatusIndex(quote.status);
  const isLost = quote.status === "lost";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/my-quote">
          <span className="inline-flex items-center text-brand-silver hover:text-brand-gold transition-colors cursor-pointer text-sm font-body mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to lookup
          </span>
        </Link>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-charcoal mt-2">
          Your Quote Status
        </h1>
        <p className="text-brand-silver font-body mt-1">
          Hi {quote.name?.split(" ")[0]}, here's the latest on your project.
        </p>
      </div>

      {/* Project summary card */}
      <Card className="mb-8 border-brand-gold/20 shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Wrench className="w-5 h-5 text-brand-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-brand-silver font-body uppercase tracking-wider">Service</p>
                <p className="font-semibold text-brand-charcoal font-body">{quote.service}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-brand-silver font-body uppercase tracking-wider">Location</p>
                <p className="font-semibold text-brand-charcoal font-body">{quote.suburb}</p>
              </div>
            </div>
            {quote.quotedAmount && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-brand-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-brand-silver font-body uppercase tracking-wider">Quoted Amount</p>
                  <p className="font-semibold text-brand-charcoal font-body">
                    ${Number(quote.quotedAmount).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {quote.scheduledDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-brand-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-brand-silver font-body uppercase tracking-wider">Scheduled Date</p>
                  <p className="font-semibold text-brand-charcoal font-body">
                    {formatDate(quote.scheduledDate)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-brand-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-brand-silver font-body uppercase tracking-wider">Submitted</p>
                <p className="font-semibold text-brand-charcoal font-body">
                  {formatDate(quote.createdAt)}
                </p>
              </div>
            </div>
            {quote.pdfRef && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-brand-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-brand-silver font-body uppercase tracking-wider">Reference</p>
                  <p className="font-semibold text-brand-charcoal font-body">{quote.pdfRef}</p>
                </div>
              </div>
            )}
          </div>
          {quote.pdfUrl && (
            <div className="mt-4 pt-4 border-t border-brand-gold/10">
              <a
                href={quote.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-gold-dark font-semibold font-body transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Your Quote PDF
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status progress tracker */}
      {isLost ? (
        <Card className="mb-8 border-brand-silver/20">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-brand-silver mx-auto mb-3" />
            <h3 className="text-lg font-heading font-bold text-brand-charcoal mb-1">
              Enquiry Closed
            </h3>
            <p className="text-brand-silver font-body text-sm">
              This enquiry has been closed. If you'd like to discuss a new project, please{" "}
              <Link href="/get-quote">
                <span className="text-brand-gold hover:underline cursor-pointer">request a new quote</span>
              </Link>{" "}
              or call us on{" "}
              <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="text-brand-gold hover:underline">
                0424 463 268
              </a>
              .
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-brand-gold/20 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-heading text-brand-charcoal">Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="relative">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStatusIdx;
                const isCurrent = idx === currentStatusIdx;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {/* Vertical line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 w-0.5 h-12 ${
                          idx < currentStatusIdx ? "bg-brand-gold" : "bg-gray-200"
                        }`}
                      />
                    )}
                    {/* Icon circle */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isCompleted
                          ? "bg-brand-gold text-brand-charcoal"
                          : "bg-gray-100 text-gray-400"
                      } ${isCurrent ? "ring-4 ring-brand-gold/20" : ""}`}
                    >
                      {isCompleted ? (
                        <Icon className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    {/* Text */}
                    <div className={`pb-8 ${idx === STATUS_STEPS.length - 1 ? "pb-0" : ""}`}>
                      <p
                        className={`font-semibold font-body ${
                          isCompleted ? "text-brand-charcoal" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-brand-gold/10 text-brand-gold-dark font-medium">
                            Current
                          </span>
                        )}
                      </p>
                      <p className={`text-sm ${isCompleted ? "text-brand-silver" : "text-gray-300"} font-body`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline events */}
      {quote.timeline && quote.timeline.length > 0 && (
        <Card className="mb-8 border-brand-gold/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-heading text-brand-charcoal">Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="space-y-4">
              {quote.timeline.map((event: { id: number; eventType: string; toStatus: string | null; description: string | null; createdAt: Date | string }) => (
                <div key={event.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-gold mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-brand-charcoal font-body">
                      {event.description}
                    </p>
                    <p className="text-xs text-brand-silver font-body mt-0.5">
                      {getTimeSince(event.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact CTA */}
      <Card className="bg-brand-charcoal text-white border-0">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-heading font-bold mb-2">Have Questions?</h3>
          <p className="text-gray-300 font-body text-sm mb-4">
            Our team is here to help. Give us a call or request an updated quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:0424463268" onClick={() => trackPhoneCallClick()}>
              <Button className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold w-full sm:w-auto">
                <Phone className="w-4 h-4 mr-2" />
                Call 0424 463 268
              </Button>
            </a>
            <Link href="/get-quote">
              <Button variant="outline" className="border-brand-gold text-brand-gold hover:bg-brand-gold/10 w-full sm:w-auto">
                <FileText className="w-4 h-4 mr-2" />
                Request New Quote
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Phone lookup view — shown when no token is in the URL
function PhoneLookup() {
  const [phone, setPhone] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const { data: quotes, isLoading } = trpc.status.lookupByPhone.useQuery(
    { phone: searchPhone },
    { enabled: searchPhone.length >= 6 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 6) {
      setSearchPhone(phone);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-brand-gold" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-charcoal">
          Track Your Quote
        </h1>
        <p className="text-brand-silver font-body mt-2 max-w-md mx-auto">
          Enter the phone number you used when requesting your quote to see the latest status.
        </p>
      </div>

      {/* Search form */}
      <Card className="mb-8 border-brand-gold/20 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver" />
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 font-body border-brand-gold/20 focus:border-brand-gold"
              />
            </div>
            <Button
              type="submit"
              disabled={phone.length < 6 || isLoading}
              className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-6"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searchPhone && !isLoading && quotes && quotes.length === 0 && (
        <div className="text-center py-10">
          <AlertCircle className="w-12 h-12 text-brand-silver mx-auto mb-3" />
          <h3 className="text-lg font-heading font-bold text-brand-charcoal mb-1">
            No Quotes Found
          </h3>
          <p className="text-brand-silver font-body text-sm mb-4">
            We couldn't find any quotes matching that phone number. Please check the number and try again.
          </p>
          <Link href="/get-quote">
            <Button className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold">
              Request a Free Quote
            </Button>
          </Link>
        </div>
      )}

      {quotes && quotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-bold text-brand-charcoal">
            Your Quotes ({quotes.length})
          </h2>
          {quotes.map((q: { id: number; name: string; service: string; suburb: string; status: string; statusToken: string | null; quotedAmount: string | null; scheduledDate: Date | string | null; createdAt: Date | string }) => {
            const statusIdx = getStatusIndex(q.status);
            const isLost = q.status === "lost";

            return (
              <Card
                key={q.id}
                className="border-brand-gold/10 hover:border-brand-gold/30 transition-colors cursor-pointer"
              >
                {q.statusToken ? (
                  <Link href={`/my-quote?token=${q.statusToken}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-brand-charcoal font-body">
                              {q.service}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                isLost
                                  ? "bg-gray-100 text-gray-500"
                                  : q.status === "won"
                                  ? "bg-green-50 text-green-700"
                                  : q.status === "quoted"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-brand-gold/10 text-brand-gold-dark"
                              }`}
                            >
                              {isLost ? "Closed" : STATUS_STEPS[Math.min(statusIdx, STATUS_STEPS.length - 1)]?.label || q.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-brand-silver font-body">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {q.suburb}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(q.createdAt)}
                            </span>
                            {q.quotedAmount && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${Number(q.quotedAmount).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-brand-silver" />
                      </div>
                      {/* Mini progress bar */}
                      {!isLost && (
                        <div className="flex gap-1 mt-3">
                          {STATUS_STEPS.map((step, idx) => (
                            <div
                              key={step.key}
                              className={`h-1.5 flex-1 rounded-full ${
                                idx <= statusIdx ? "bg-brand-gold" : "bg-gray-100"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Link>
                ) : (
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-brand-charcoal font-body">
                            {q.service}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            {q.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-brand-silver font-body">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {q.suburb}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(q.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Trust signals */}
      <div className="mt-10 flex items-center justify-center gap-2 text-brand-silver font-body text-sm">
        <Shield className="w-4 h-4" />
        <span>Your information is secure and never shared with third parties.</span>
      </div>
    </div>
  );
}

export default function MyQuote() {
  const searchString = useSearch();
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const token = params.get("token");

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="container py-10 md:py-16 px-4">
        {token ? <QuoteStatusDetail token={token} /> : <PhoneLookup />}
      </main>
      <Footer />
    </div>
  );
}
