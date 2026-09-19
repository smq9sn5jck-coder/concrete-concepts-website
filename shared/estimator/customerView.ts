import { QUOTE_BRAND } from "./brand";
import type { CustomerEstimateView, PricingResult } from "./types";

export function toCustomerEstimateView(result: PricingResult): CustomerEstimateView {
  const evidenceNote = result.assumptions.find((note) => /photo/i.test(note)) ??
    "No site photos were available. Access, levels, drainage and demolition require confirmation.";

  return {
    calculationVersion: result.calculationVersion,
    rateCardVersion: result.rateCardVersion,
    routing: result.routing,
    reasonCodes: result.reasonCodes,
    brand: { ...QUOTE_BRAND },
    options: result.options
      .filter((option) => option.customerEligible)
      .map((option) => ({
        finishId: option.finish.id,
        customerName: option.finish.customerName,
        requested: option.finish.requested,
        expectedIncGstCents: option.scenarios.expected.quoteIncGstCents,
        displayRangeIncGstCents: option.displayRangeIncGstCents,
        inclusions: [
          "Concrete supply and placement",
          "Reinforcement, formwork and finishing",
          "Site preparation allowances shown in the approved scope",
          "Cure and seal appropriate to the selected finish",
        ],
        assumptions: result.assumptions,
      })),
    evidenceNote,
    disclaimer: "Ballpark estimate only. Final pricing is subject to site inspection, final measure and confirmed site conditions.",
  };
}
