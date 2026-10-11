import {
  contextFromBaysideSoutheastDraft,
  mergeBaysideSoutheastQuoteContext,
  resolveBaysideSoutheastQuoteContext,
  type BaysideSoutheastQuoteContextConflict,
} from "@shared/baysideSoutheastQuoteContext";
import {
  loadQuoteDraft,
  saveQuoteDraft,
  type QuoteDraftData,
} from "@/lib/quoteDraft";
import {
  defaultBaysideSoutheastFeatureFlags,
  isBaysideSoutheastCandidateQuoteAvailable,
  type BaysideSoutheastFeatureFlags,
} from "@/lib/baysideSoutheastPreviewAccess";
import { navigate as navigateWithWouter } from "wouter/use-browser-location";

type ContextWindow = {
  __CCG_QUOTE_CONTEXT_TOKEN?: unknown;
  location: { hostname: string };
};

type HandoffDependencies = {
  load?: typeof loadQuoteDraft;
  save?: typeof saveQuoteDraft;
  navigate?: (path: string) => void;
  hostname?: string;
  flags?: BaysideSoutheastFeatureFlags;
};

export interface BaysideSoutheastQuoteHandoffResult {
  data: QuoteDraftData;
  conflict?: BaysideSoutheastQuoteContextConflict;
  candidateAccess: true;
}

function candidateResult(
  token: unknown,
  existingDraft: QuoteDraftData,
  hostname: string,
  flags: BaysideSoutheastFeatureFlags,
): BaysideSoutheastQuoteHandoffResult | undefined {
  const context = resolveBaysideSoutheastQuoteContext(token);
  if (!context || !isBaysideSoutheastCandidateQuoteAvailable(context.landingRoute, hostname, flags)) return undefined;
  const merged = mergeBaysideSoutheastQuoteContext(existingDraft, context);
  return { ...merged, candidateAccess: true };
}

function cleanQuotePath(search = "", hash = "") {
  const params = new URLSearchParams(search);
  params.delete("context");
  const suffix = params.toString();
  return `/get-quote${suffix ? `?${suffix}` : ""}${hash}`;
}

/**
 * Consume the page-local bootstrap slot exactly once. The slot is neither a
 * persisted grant nor valid on a customer/default-off quote page.
 */
export function consumeBaysideSoutheastQuoteContext(
  dependencies: HandoffDependencies & { window?: ContextWindow } = {},
): BaysideSoutheastQuoteHandoffResult | undefined {
  const contextWindow = dependencies.window ?? (typeof window === "undefined" ? undefined : window as unknown as ContextWindow);
  if (!contextWindow) return undefined;

  const rawToken = contextWindow.__CCG_QUOTE_CONTEXT_TOKEN;
  delete contextWindow.__CCG_QUOTE_CONTEXT_TOKEN;
  const load = dependencies.load ?? loadQuoteDraft;
  const save = dependencies.save ?? saveQuoteDraft;
  const hostname = dependencies.hostname ?? contextWindow.location.hostname;
  const flags = dependencies.flags ?? defaultBaysideSoutheastFeatureFlags;

  let existingDraft: QuoteDraftData = {};
  try {
    existingDraft = load() ?? {};
  } catch {
    // The browser adapter remains functional with an empty in-memory draft.
  }
  const result = candidateResult(rawToken, existingDraft, hostname, flags);
  if (!result) return undefined;
  try {
    save(result.data);
  } catch {
    // The wizard receives the result directly even when persistent storage fails.
  }
  return result;
}

/**
 * SPA candidate CTA adapter. It deliberately writes no raw context into the
 * address bar, preserving campaign parameters but preventing tracking leakage.
 */
export function handoffBaysideSoutheastQuote(
  token: unknown,
  dependencies: HandoffDependencies & { search?: string; hash?: string } = {},
): BaysideSoutheastQuoteHandoffResult | undefined {
  const load = dependencies.load ?? loadQuoteDraft;
  const save = dependencies.save ?? saveQuoteDraft;
  const hostname = dependencies.hostname ?? (typeof window === "undefined" ? "" : window.location.hostname);
  const flags = dependencies.flags ?? defaultBaysideSoutheastFeatureFlags;
  const navigate = dependencies.navigate ?? navigateWithWouter;
  let existingDraft: QuoteDraftData = {};
  try {
    existingDraft = load() ?? {};
  } catch {
    // Save/navigation below still leave a manually usable blank quote.
  }
  const result = candidateResult(token, existingDraft, hostname, flags);
  if (!result) return undefined;
  try {
    save(result.data);
  } catch {
    // No network or conversion behavior is coupled to local draft persistence.
  }
  // GetQuote consumes the same page-local token as a raw handoff, once. Keep it
  // out of location/history and let the consumer revalidate host and flags.
  if (typeof window !== "undefined") {
    (window as unknown as ContextWindow).__CCG_QUOTE_CONTEXT_TOKEN = token;
  }
  navigate(cleanQuotePath(
    dependencies.search ?? (typeof window === "undefined" ? "" : window.location.search),
    dependencies.hash ?? (typeof window === "undefined" ? "" : window.location.hash),
  ));
  return result;
}

/** Candidate UI is allowed only for a valid stored Bayside route plus current access. */
export function isBaysideSoutheastCandidateQuoteAccess(
  draft: Pick<QuoteDraftData, "region" | "landingRoute" | "audienceType"> | null | undefined,
  hostname = typeof window === "undefined" ? "" : window.location.hostname,
  flags: BaysideSoutheastFeatureFlags = defaultBaysideSoutheastFeatureFlags,
): boolean {
  const context = contextFromBaysideSoutheastDraft(draft);
  return Boolean(context && isBaysideSoutheastCandidateQuoteAvailable(context.landingRoute, hostname, flags));
}
