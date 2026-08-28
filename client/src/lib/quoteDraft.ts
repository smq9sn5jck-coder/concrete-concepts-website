export const QUOTE_DRAFT_STORAGE_KEY = "ccg-comprehensive-quote-draft-v1";
export const QUOTE_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1_000;

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
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, createQuoteDraft(data));
}

export function loadQuoteDraft() {
  if (typeof window === "undefined") return null;
  return parseQuoteDraft(window.localStorage.getItem(QUOTE_DRAFT_STORAGE_KEY));
}

export function clearQuoteDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(QUOTE_DRAFT_STORAGE_KEY);
}
