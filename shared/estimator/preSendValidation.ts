import { QUOTE_BRAND } from "./brand";
import { FINISH_CATALOG, RETIRED_TIER_PATTERN } from "./finishCatalog";
import type { CustomerEstimateView } from "./types";

const INTERNAL_CONTENT_PATTERN = /\b(cost\s*lines?|supplier\s*rates?|labour\s*markup|gross\s*profit|profit\s*per\s*crew\s*day|commission|method\s*[12])\b/i;
const FABRICATED_PHOTO_PATTERN = /\b(visually confirmed|we inspected|photos confirm)\b/i;

export function validateCustomerEstimateView(view: CustomerEstimateView) {
  const issues: string[] = [];
  if (JSON.stringify(view.brand) !== JSON.stringify(QUOTE_BRAND)) issues.push("brand_contract_invalid");
  if (view.options.length > 3) issues.push("too_many_options");
  if (view.options.length > 0 && !view.options[0].requested) issues.push("requested_finish_not_first");

  for (const option of view.options) {
    if (FINISH_CATALOG[option.finishId]?.customerName !== option.customerName) {
      issues.push("noncanonical_finish_name");
    }
    if (option.customerName.match(RETIRED_TIER_PATTERN)) issues.push("retired_tier_name");
    if (!(option.displayRangeIncGstCents.low > 0) || !(option.displayRangeIncGstCents.high >= option.displayRangeIncGstCents.low)) {
      issues.push("invalid_display_range");
    }
  }

  const serialized = JSON.stringify(view);
  if (RETIRED_TIER_PATTERN.test(serialized)) issues.push("retired_tier_content");
  if (INTERNAL_CONTENT_PATTERN.test(serialized)) issues.push("internal_financial_content");
  if (FABRICATED_PHOTO_PATTERN.test(serialized)) issues.push("unsupported_photo_claim");

  return { valid: issues.length === 0, issues: Array.from(new Set(issues)) };
}
