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
  location: { hostname: string; search?: string; hash?: string };
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
  return { ...mergeBaysideSoutheastQuoteContext(existingDraft, context), candidateAccess: true };
}

function cleanQuotePath(search = "", hash = "") {
  const params = new URLSearchParams(search);
  params.delete("context");
  const suffix = params.toString();
  return `/get-quote${suffix ? `?${suffix}` : ""}${hash}`;
}

/** Consumes the pre-tracking raw context slot once; it is never persisted as access authority. */
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
    // Result remains usable in memory if browser persistence is unavailable.
  }
  const result = candidateResult(rawToken, existingDraft, hostname, flags);
  if (!result) return undefined;
  try {
    save(result.data);
  } catch {
    // No network, delivery, or conversion behavior is coupled to local storage.
  }
  return result;
}

/** Navigates without a raw token in history while retaining legitimate campaigns and the in-memory context slot. */
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
    // Continue with an empty draft; no storage failure blocks a manual quote.
  }
  const result = candidateResult(token, existingDraft, hostname, flags);
  if (!result) return undefined;
  try {
    save(result.data);
  } catch {
    // The result survives as component state after SPA navigation.
  }
  if (typeof window !== "undefined") {
    (window as unknown as ContextWindow).__CCG_QUOTE_CONTEXT_TOKEN = token;
  }
  navigate(cleanQuotePath(
    dependencies.search ?? (typeof window === "undefined" ? "" : window.location.search),
    dependencies.hash ?? (typeof window === "undefined" ? "" : window.location.hash),
  ));
  return result;
}

/** Candidate UI needs valid stored attribution and a current host/feature grant, not either alone. */
export function isBaysideSoutheastCandidateQuoteAccess(
  draft: Pick<QuoteDraftData, "region" | "landingRoute" | "audienceType"> | null | undefined,
  hostname = typeof window === "undefined" ? "" : window.location.hostname,
  flags: BaysideSoutheastFeatureFlags = defaultBaysideSoutheastFeatureFlags,
): boolean {
  const context = contextFromBaysideSoutheastDraft(draft);
  return Boolean(context && isBaysideSoutheastCandidateQuoteAvailable(context.landingRoute, hostname, flags));
}
