import type { CanonicalFinishId, FinishDefinition } from "./types";

export const RETIRED_TIER_PATTERN = /\b(classic|signature|prestige|standard|premium|good|better|best)(?:\s+(?:package|tier|option|collection))?\b/i;

export const FINISH_CATALOG: Record<CanonicalFinishId, FinishDefinition> = {
  plain: {
    id: "plain",
    customerName: "Plain Concrete — Broom Finish",
    automation: "automatic",
    defaultMix: "n32",
    premiumSeal: false,
    exposed: false,
  },
  oxide: {
    id: "oxide",
    customerName: "Coloured Concrete — Oxide Finish",
    automation: "owner_review",
    defaultMix: "n32",
    premiumSeal: true,
    exposed: false,
  },
  exposed_raven: {
    id: "exposed_raven",
    customerName: "Exposed Aggregate — Raven",
    automation: "automatic",
    defaultMix: "exposed_raven",
    premiumSeal: true,
    exposed: true,
  },
  exposed_sp: {
    id: "exposed_sp",
    customerName: "Exposed Aggregate — Salt & Pepper",
    automation: "automatic",
    defaultMix: "exposed_sp",
    premiumSeal: true,
    exposed: true,
  },
  exposed_jersey: {
    id: "exposed_jersey",
    customerName: "Exposed Aggregate — Jersey",
    automation: "automatic",
    defaultMix: "exposed_jersey",
    premiumSeal: true,
    exposed: true,
  },
  exposed_casper: {
    id: "exposed_casper",
    customerName: "Exposed Aggregate — Casper",
    automation: "automatic",
    defaultMix: "exposed_casper",
    premiumSeal: true,
    exposed: true,
  },
  stencil: {
    id: "stencil",
    customerName: "Stencilled / Stamped Concrete",
    automation: "owner_review",
    defaultMix: "n32",
    premiumSeal: true,
    exposed: false,
  },
  honed: {
    id: "honed",
    customerName: "Honed / Ground Concrete",
    automation: "owner_review",
    defaultMix: "n32",
    premiumSeal: true,
    exposed: false,
  },
  not_sure: {
    id: "not_sure",
    customerName: "Not Sure — Recommend a Finish",
    automation: "measure_first",
    premiumSeal: false,
    exposed: false,
  },
};

export function getFinishDefinition(value: string): FinishDefinition {
  const definition = FINISH_CATALOG[value as CanonicalFinishId];
  if (!definition) throw new Error(`A canonical finish is required; received ${value || "an empty value"}.`);
  return definition;
}
