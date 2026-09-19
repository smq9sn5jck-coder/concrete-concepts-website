export const OTHER_TRADE_CATEGORIES = [
  "Plumbing",
  "Blockwork / bricklaying",
  "Electrical",
  "Excavation / earthworks",
  "Landscaping",
  "Carpentry",
  "Roofing",
  "Other",
] as const;

export const OTHER_TRADE_TIMEFRAMES = [
  "Urgent",
  "Within 1 week",
  "2–4 weeks",
  "1–3 months",
  "Flexible",
] as const;

export const OTHER_TRADE_CONSENT_VERSION = "other-trade-consent-v1-2026-09-20";
export const OTHER_TRADE_PAGE_VERSION = "need-another-trade-v1";
export const OTHER_TRADE_CONSENT_TEXT =
  "I consent to Concrete Concepts Group reviewing this request and, if CCG chooses, sharing the contact details, job information and photos I provided with one suitable independent service provider so that provider can contact me about this request. I understand that CCG has not guaranteed a provider, availability, price, licensing, workmanship or response time.";

export const OTHER_TRADE_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  mobileMax: 32,
  emailMax: 254,
  locationMax: 160,
  descriptionMin: 20,
  descriptionMax: 5_000,
  sourceMax: 120,
  landingPageMax: 240,
  photoCountMax: 8,
  minimumCompletionMs: 1_500,
} as const;

export type OtherTradeCategory = (typeof OTHER_TRADE_CATEGORIES)[number];
export type OtherTradeTimeframe = (typeof OTHER_TRADE_TIMEFRAMES)[number];

export interface OtherTradeSubmission {
  name: string;
  mobile: string;
  email: string;
  location: string;
  trade: OtherTradeCategory;
  description: string;
  timeframe: OtherTradeTimeframe;
  photoUrls: string[];
  consent: true;
  consentVersion: typeof OTHER_TRADE_CONSENT_VERSION;
  consentText: typeof OTHER_TRADE_CONSENT_TEXT;
  consentTextSha256: string;
  pageVersion: typeof OTHER_TRADE_PAGE_VERSION;
  source: string;
  landingPage: string;
  website: string;
  formStartedAt: number;
}

export interface OtherTradeSubmissionResult {
  success: boolean;
  retryable?: boolean;
  error?: string;
  serviceAreaStatus?: "in_area" | "service_area_review";
  channels?: {
    d1: "stored" | "failed";
    email: "sent" | "failed";
  };
}

export function isOtherTradeCategory(value: string): value is OtherTradeCategory {
  return (OTHER_TRADE_CATEGORIES as readonly string[]).includes(value);
}

export function isOtherTradeTimeframe(value: string): value is OtherTradeTimeframe {
  return (OTHER_TRADE_TIMEFRAMES as readonly string[]).includes(value);
}
