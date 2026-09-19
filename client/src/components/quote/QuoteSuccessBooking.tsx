import { useState } from "react";
import { CalendarDays, CheckCircle2, Loader2, MessageSquareText } from "lucide-react";
import { buildSiteInspectionBookingUrl, maskAustralianMobile } from "@shared/siteInspectionBooking";
import { trpc } from "@/lib/trpc";

type BookingFeedback = "idle" | "sent" | "failed" | "expired" | "unavailable" | "unknown";

type QuoteSuccessBookingProps = {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  deliveryToken: string | null;
};

export default function QuoteSuccessBooking({
  customerName,
  customerEmail,
  customerMobile,
  deliveryToken,
}: QuoteSuccessBookingProps) {
  const [feedback, setFeedback] = useState<BookingFeedback>("idle");
  const bookingUrl = buildSiteInspectionBookingUrl(customerName, customerEmail);
  const maskedMobile = maskAustralianMobile(customerMobile);

  const sendBookingLink = trpc.quote.sendBookingLink.useMutation({
    onSuccess: result => {
      if (result.status === "sent" || result.status === "already_sent") {
        setFeedback("sent");
        return;
      }
      if (result.status === "invalid" || result.status === "expired") {
        setFeedback("expired");
        return;
      }
      if (result.status === "unavailable") {
        setFeedback("unavailable");
        return;
      }
      if (result.status === "unknown") {
        setFeedback("unknown");
        return;
      }
      setFeedback("failed");
    },
    onError: () => setFeedback("failed"),
  });

  const requestBookingLink = () => {
    if (!deliveryToken || feedback === "sent" || feedback === "unknown" || sendBookingLink.isPending) return;
    setFeedback("idle");
    sendBookingLink.mutate({ token: deliveryToken });
  };

  const smsButtonLabel = feedback === "failed"
    ? "Try text again"
    : feedback === "sent"
      ? "Booking link sent"
      : feedback === "unknown"
        ? "Check your messages"
      : "Text me the booking link";

  return (
    <section className="mx-auto mt-7 w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left sm:p-5" aria-labelledby="site-inspection-booking-heading">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">Optional next step</p>
      <h3 id="site-inspection-booking-heading" className="mt-1 text-xl font-black text-slate-950">
        Book your free site inspection
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Choose an available 30-minute time after your quote request. We will confirm the site details before attending.
      </p>

      <div className="mt-4 grid gap-3">
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-yellow px-5 py-3.5 text-center font-black text-slate-950 shadow-md transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2"
        >
          <CalendarDays aria-hidden="true" className="mr-2 h-5 w-5" />
          Book site inspection now
        </a>

        {deliveryToken && (
          <button
            type="button"
            onClick={requestBookingLink}
            disabled={sendBookingLink.isPending || feedback === "sent" || feedback === "unknown"}
            className={`flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-5 py-3.5 text-center font-black text-slate-900 transition hover:border-brand-yellow hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
              feedback === "sent"
                ? "disabled:border-emerald-300 disabled:bg-emerald-50 disabled:text-emerald-800"
                : "disabled:border-amber-300 disabled:bg-amber-50 disabled:text-amber-900"
            }`}
          >
            {sendBookingLink.isPending ? (
              <Loader2 aria-hidden="true" className="mr-2 h-5 w-5 animate-spin" />
            ) : feedback === "sent" ? (
              <CheckCircle2 aria-hidden="true" className="mr-2 h-5 w-5" />
            ) : (
              <MessageSquareText aria-hidden="true" className="mr-2 h-5 w-5" />
            )}
            {sendBookingLink.isPending ? "Sending booking link…" : smsButtonLabel}
          </button>
        )}
      </div>

      {deliveryToken && (
        <div aria-live="polite" aria-atomic="true" className="mt-3 min-h-5 text-center text-sm font-semibold text-slate-700">
          {feedback === "idle" && !sendBookingLink.isPending && `Send one booking text to ${maskedMobile}.`}
          {feedback === "sent" && <span className="text-emerald-700">Booking link sent to {maskedMobile}.</span>}
          {feedback === "failed" && <span role="alert" className="text-red-700">The text could not be sent. Try again or use the booking button above.</span>}
          {feedback === "expired" && <span role="alert" className="text-amber-800">This text link has expired. Use the booking button above or call us.</span>}
          {feedback === "unavailable" && <span role="alert" className="text-amber-800">Text delivery is unavailable. Use the booking button above or call us.</span>}
          {feedback === "unknown" && <span role="alert" className="text-amber-800">Delivery could not be confirmed. Check your messages, then use the booking button above or call us.</span>}
        </div>
      )}
    </section>
  );
}
