import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export const CCG_SHARE_URL = "https://concreteconceptsgroup.com/";

const SHARE_PAYLOAD = {
  title: "Concrete Concepts Group",
  text: "Looking for concreting in Brisbane or South East Queensland? Take a look at Concrete Concepts Group.",
  url: CCG_SHARE_URL,
} as const;

type ShareFeedback = "idle" | "shared" | "copied" | "manual";

export default function QuoteSuccessShare() {
  const [feedback, setFeedback] = useState<ShareFeedback>("idle");

  const copyShareLink = async () => {
    if (!navigator.clipboard?.writeText) {
      setFeedback("manual");
      return;
    }

    try {
      await navigator.clipboard.writeText(CCG_SHARE_URL);
      setFeedback("copied");
    } catch {
      setFeedback("manual");
    }
  };

  const handleShare = async () => {
    setFeedback("idle");

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(SHARE_PAYLOAD);
        setFeedback("shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await copyShareLink();
  };

  return (
    <div className="mx-auto mt-3 w-full max-w-sm">
      <button
        type="button"
        onClick={() => void handleShare()}
        className="flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 text-center font-black text-slate-900 transition hover:border-brand-yellow hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2"
      >
        <Share2 aria-hidden="true" className="mr-2 h-5 w-5" />
        Share CCG
      </button>

      <div aria-live="polite" aria-atomic="true" className="mt-2 min-h-5 text-center text-sm font-semibold text-slate-700">
        {feedback === "shared" && (
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <Check aria-hidden="true" className="h-4 w-4" />
            Thanks for sharing Concrete Concepts Group.
          </span>
        )}
        {feedback === "copied" && (
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <Copy aria-hidden="true" className="h-4 w-4" />
            Link copied — you can paste it anywhere.
          </span>
        )}
      </div>

      {feedback === "manual" && (
        <div role="alert" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-left text-sm text-slate-800">
          <p className="font-bold">Select and copy this link manually.</p>
          <input
            aria-label="Concrete Concepts Group website link"
            readOnly
            value={CCG_SHARE_URL}
            onFocus={(event) => event.currentTarget.select()}
            onClick={(event) => event.currentTarget.select()}
            className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
          />
        </div>
      )}
    </div>
  );
}
