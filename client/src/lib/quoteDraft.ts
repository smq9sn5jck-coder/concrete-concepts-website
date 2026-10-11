export const QUOTE_DRAFT_STORAGE_KEY = "ccg-comprehensive-quote-draft-v1";
export const QUOTE_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1_000;

let inMemoryDraft: string | null = null;

export interface QuoteDraftData {
  name?: string;
  mobile?: string;
  email?: string;
  preferredContact?: "phone" | "sms" | "email";
  company?: string;
  streetAddress?: string;
  suburb?: string;
  postcode?: string;
  services?: string[];
  workType?: string;
  finish?: string;
  timeframe?: string;
  description?: string;
  measurementMode?: string;
  lengthM?: string;
  widthM?: string;
  totalAreaM2?: string;
  separateAreaNotes?: string;
  existingConcreteRemoval?: boolean;
  accessWidthM?: string;
  vehicleAccess?: string;
  slope?: string;
  drainage?: string;
  pumpAccess?: string;
  knownServices?: string;
  approvalStatus?: string;
  specialRequirements?: string;
  contactConsent?: boolean;
  privacyConsent?: boolean;
  marketingConsent?: boolean;
  audienceType?: "homeowner" | "builder_developer";
  structuralProjectType?: "new_house" | "extension_slab" | "under_house_build_under" | "complete_extension" | "other_concrete";
  plansReadiness?: "available" | "in_progress" | "not_available" | "not_sure";
  engineeringReadiness?: "available" | "in_progress" | "not_available" | "not_sure";
  soilFoundationReadiness?: "available" | "in_progress" | "not_available" | "not_sure";
  certifierApprovalStatus?: "approved" | "in_progress" | "not_started" | "not_required" | "not_sure";
  builderCompanyName?: string;
  builderRole?: string;
  numberOfSitesOrPours?: string;
  requiredConcreteScope?: string;
  indicativeProgramme?: string;
  preferredFollowUp?: string;
  region?: string;
  landingRoute?: string;
  partnerIntroductionInterest?: boolean;
}

export function applyQuoteDraftUpdate<K extends keyof QuoteDraftData>(
  current: QuoteDraftData,
  key: K,
  value: QuoteDraftData[K],
): QuoteDraftData {
  const next = { ...current, [key]: value };
  const partnerEligible = next.structuralProjectType === "complete_extension"
    && Boolean(next.services?.includes("slab"));
  if (!partnerEligible) next.partnerIntroductionInterest = false;
  return next;
}

interface StoredQuoteDraft {
  version: 1;
  savedAt: number;
  data: QuoteDraftData;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createQuoteDraft(data: QuoteDraftData, savedAt = Date.now()) {
  return JSON.stringify({ version: 1, savedAt, data } satisfies StoredQuoteDraft);
}

export function parseQuoteDraft(raw: string | null, now = Date.now()): QuoteDraftData | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isPlainObject(value) || value.version !== 1 || typeof value.savedAt !== "number" || !isPlainObject(value.data)) {
      return null;
    }
    if (value.savedAt > now || now - value.savedAt > QUOTE_DRAFT_MAX_AGE_MS) return null;
    return value.data as QuoteDraftData;
  } catch {
    return null;
  }
}

export function saveQuoteDraft(data: QuoteDraftData) {
  const serialized = createQuoteDraft(data);
  inMemoryDraft = serialized;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, serialized);
  } catch {
    // Storage may be disabled; the current document keeps its local draft only.
  }
}

export function loadQuoteDraft() {
  if (typeof window === "undefined") return parseQuoteDraft(inMemoryDraft);
  try {
    // An available storage state, including an explicit clear, is authoritative.
    return parseQuoteDraft(window.localStorage.getItem(QUOTE_DRAFT_STORAGE_KEY));
  } catch {
    return parseQuoteDraft(inMemoryDraft);
  }
}

export function clearQuoteDraft() {
  inMemoryDraft = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(QUOTE_DRAFT_STORAGE_KEY);
  } catch {
    // The in-memory draft has already been cleared.
  }
}
