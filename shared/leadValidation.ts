export type PhoneKind = "mobile" | "landline";

export type PhoneValidationResult =
  | { valid: true; normalized: string; kind: PhoneKind }
  | { valid: false; normalized: string; error: string };

export type ServiceAreaStatus = "in_area" | "service_area_review" | "invalid";

export type ServiceAreaResult = {
  status: ServiceAreaStatus;
  canSubmit: boolean;
  normalized: string;
  message: string;
};

const IN_AREA_POSTCODE_RANGES: ReadonlyArray<readonly [number, number]> = [
  [4000, 4299], // Brisbane, Redlands, Logan and Gold Coast corridor
  [4300, 4314], // Ipswich and Springfield corridor
  [4500, 4519], // Moreton Bay and Caboolture corridor
  [4550, 4575], // Sunshine Coast corridor advertised on the website
];

const IN_AREA_NAMES = [
  "brisbane",
  "logan",
  "redlands",
  "redland bay",
  "ipswich",
  "moreton bay",
  "caboolture",
  "gold coast",
  "sunshine coast",
  "springfield",
  "beenleigh",
  "wynnum",
  "manly",
  "capalaba",
  "cleveland",
  "north lakes",
  "redcliffe",
  "morayfield",
  "burpengary",
  "strathpine",
  "carindale",
  "coorparoo",
  "camp hill",
  "cannon hill",
  "chermside",
  "aspley",
  "mount gravatt",
  "mt gravatt",
  "sunnybank",
  "springwood",
  "forest lake",
  "goodna",
  "redbank plains",
  "ripley",
  "robina",
  "nerang",
  "coomera",
  "ormeau",
  "kooralbyn",
  "cooroy",
] as const;

const CLEARLY_OUTSIDE_QUEENSLAND = [
  /\bNSW\b/i,
  /\bNEW SOUTH WALES\b/i,
  /\bVIC\b/i,
  /\bVICTORIA\b/i,
  /\bSA\b/i,
  /\bSOUTH AUSTRALIA\b/i,
  /\bWA\b/i,
  /\bWESTERN AUSTRALIA\b/i,
  /\bTAS\b/i,
  /\bTASMANIA\b/i,
  /\bNT\b/i,
  /\bNORTHERN TERRITORY\b/i,
  /\bACT\b/i,
  /\bPHILIPPINES?\b/i,
  /\bINDIA\b/i,
  /\bINDONESIA\b/i,
  /\bMEXICO\b/i,
  /\bARGENTINA\b/i,
  /\bBRAZIL\b/i,
  /\bPAKISTAN\b/i,
  /\bBANGLADESH\b/i,
  /\bAFGHANISTAN\b/i,
  /\bALGERIA\b/i,
  /\bEGYPT\b/i,
  /\bMOROCCO\b/i,
  /\bCOLOMBIA\b/i,
  /\bMOZAMBIQUE\b/i,
] as const;

const INVALID_PHONE_MESSAGE =
  "Enter an Australian phone number, for example 0424 463 268 or (07) 3123 4567.";

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizePhoneDigits(value: string): string {
  const trimmed = value.trim();
  let digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+") && !trimmed.startsWith("+61")) return digits;
  if (digits.startsWith("61") && digits.length === 11) digits = `0${digits.slice(2)}`;

  return digits;
}

export function validateAustralianPhone(value: string): PhoneValidationResult {
  const normalized = normalizePhoneDigits(value);
  const containsLetters = /[a-z]/i.test(value);
  const isRepeatedDigit = /^(\d)\1+$/.test(normalized);
  const isSequential = normalized === "0123456789" || normalized === "1234567890";

  if (containsLetters || isRepeatedDigit || isSequential) {
    return { valid: false, normalized, error: INVALID_PHONE_MESSAGE };
  }

  if (/^04\d{8}$/.test(normalized)) {
    return { valid: true, normalized, kind: "mobile" };
  }

  if (/^0[2378]\d{8}$/.test(normalized)) {
    return { valid: true, normalized, kind: "landline" };
  }

  return { valid: false, normalized, error: INVALID_PHONE_MESSAGE };
}

function postcodeInRange(postcode: number): boolean {
  return IN_AREA_POSTCODE_RANGES.some(([start, end]) => postcode >= start && postcode <= end);
}

export function classifyServiceArea(value: string): ServiceAreaResult {
  const normalized = normalizeWhitespace(value);
  if (!normalized) {
    return {
      status: "invalid",
      canSubmit: false,
      normalized,
      message: "Enter your Queensland suburb or postcode.",
    };
  }

  if (CLEARLY_OUTSIDE_QUEENSLAND.some(pattern => pattern.test(normalized))) {
    return {
      status: "invalid",
      canSubmit: false,
      normalized,
      message: "We currently service Brisbane and surrounding South East Queensland areas.",
    };
  }

  const postcodeMatch = normalized.match(/\b(\d{4})\b/);
  if (postcodeMatch) {
    const postcode = Number(postcodeMatch[1]);
    if (postcodeInRange(postcode)) {
      return {
        status: "in_area",
        canSubmit: true,
        normalized,
        message: "This location is in our service area.",
      };
    }

    if (postcode >= 4000 && postcode <= 4999) {
      return {
        status: "service_area_review",
        canSubmit: true,
        normalized,
        message: "This Queensland location is just outside our usual area. Submit your enquiry and our team will confirm availability.",
      };
    }

    return {
      status: "invalid",
      canSubmit: false,
      normalized,
      message: "We currently service Brisbane and surrounding South East Queensland areas.",
    };
  }

  const lower = normalized.toLowerCase();
  if (IN_AREA_NAMES.some(name => lower.includes(name))) {
    return {
      status: "in_area",
      canSubmit: true,
      normalized,
      message: "This location is in our service area.",
    };
  }

  if (/\bQLD\b/i.test(normalized) || /\bQUEENSLAND\b/i.test(normalized)) {
    return {
      status: "service_area_review",
      canSubmit: true,
      normalized,
      message: "Submit your enquiry and our team will confirm availability for your Queensland location.",
    };
  }

  return {
    status: "service_area_review",
    canSubmit: true,
    normalized,
    message: "We could not confirm this suburb automatically. You can still submit and our team will check the service area.",
  };
}

export function assessSubmissionSignals(input: {
  honeypot?: string | null;
  startedAt?: number | null;
  now?: number;
  minimumCompletionMs?: number;
}): { allowed: true } | { allowed: false; reason: "bot_detected" | "submitted_too_fast" } {
  if (input.honeypot?.trim()) return { allowed: false, reason: "bot_detected" };

  const now = input.now ?? Date.now();
  const minimumCompletionMs = input.minimumCompletionMs ?? 1_500;
  if (typeof input.startedAt === "number" && now - input.startedAt < minimumCompletionMs) {
    return { allowed: false, reason: "submitted_too_fast" };
  }

  return { allowed: true };
}

function fnv1a(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function createLeadFingerprint(input: {
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  address?: string | null;
}): string {
  const phone = input.phone ? normalizePhoneDigits(input.phone) : "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const location = normalizeWhitespace(input.location ?? "").toLowerCase();
  const address = input.address?.trim().toLowerCase() ?? "";
  return fnv1a([phone, email, location, address].join("|"));
}

type RateLimitOptions = {
  windowMs: number;
  maxAttempts: number;
  maxEntries?: number;
};

export class SubmissionRateLimiter {
  private readonly attempts = new Map<string, number[]>();
  private readonly options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = { maxEntries: 2_000, ...options };
  }

  attempt(
    fingerprint: string,
    now = Date.now()
  ): { allowed: true } | { allowed: false; reason: "duplicate_submission"; retryAfterMs: number } {
    const cutoff = now - this.options.windowMs;
    const recent = (this.attempts.get(fingerprint) ?? []).filter(timestamp => timestamp > cutoff);

    if (recent.length >= this.options.maxAttempts) {
      const retryAfterMs = Math.max(1, recent[0] + this.options.windowMs - now);
      this.attempts.set(fingerprint, recent);
      return { allowed: false, reason: "duplicate_submission", retryAfterMs };
    }

    recent.push(now);
    this.attempts.set(fingerprint, recent);
    this.prune(now);
    return { allowed: true };
  }

  private prune(now: number): void {
    if (this.attempts.size <= this.options.maxEntries) return;
    const cutoff = now - this.options.windowMs;
    this.attempts.forEach((timestamps: number[], key: string) => {
      if (this.attempts.size <= this.options.maxEntries) return;
      if (timestamps.every((timestamp: number) => timestamp <= cutoff)) this.attempts.delete(key);
    });
  }
}
