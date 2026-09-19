export const CALCULATION_VERSION = "ccg-estimator-v1" as const;

export type CanonicalFinishId =
  | "plain"
  | "oxide"
  | "exposed_raven"
  | "exposed_sp"
  | "exposed_jersey"
  | "exposed_casper"
  | "stencil"
  | "honed"
  | "not_sure";

export type AutomaticFinishId = Exclude<
  CanonicalFinishId,
  "oxide" | "stencil" | "honed" | "not_sure"
>;

export type ConcreteMixId =
  | "n20"
  | "n25"
  | "n25_10"
  | "n32"
  | "n32_10"
  | "s25_rl"
  | "s32_rl"
  | "exposed_raven"
  | "exposed_sp"
  | "exposed_jersey"
  | "exposed_casper";

export type MeshId = "sl72" | "sl62" | "sl82";
export type PumpId = "none" | "line" | "boom";
export type PricingScenarioId = "low" | "expected" | "high";
export type PricingRouting = "automatic_draft" | "owner_review" | "measure_first" | "rejected";

export interface FinishDefinition {
  id: CanonicalFinishId;
  customerName: string;
  automation: "automatic" | "owner_review" | "measure_first";
  defaultMix?: ConcreteMixId;
  premiumSeal: boolean;
  exposed: boolean;
}

export interface SlabScope {
  areaM2: number;
  thicknessMm: number;
  mix?: ConcreteMixId;
  mesh: MeshId;
  membrane: boolean;
  formLm: number;
  roadbaseT: number;
  distanceKm: number;
  saturday: boolean;
  excavationHours: number;
  tipperLoads: number;
  removalM2: number;
  cuttingLm: number;
  pump: PumpId;
  prepDays: number;
  prepCrew: number;
  pourDays: number;
  pourCrew: number;
  difficultAccess: boolean;
  targetMarginBps: number;
}

export interface PricingRequest {
  schemaVersion: 1;
  source: {
    system: "test" | "website" | "zapier" | "admin";
    submissionId: string;
    zapRunId?: string;
  };
  service:
    | "driveway"
    | "slab"
    | "patio"
    | "pool_surround"
    | "pathway"
    | "crossover"
    | "retaining_wall"
    | "stairs"
    | "commercial";
  workType: "new" | "replacement" | "extension" | "repair";
  requestedFinish: CanonicalFinishId;
  alternativeFinishes: CanonicalFinishId[];
  scenarios?: Record<PricingScenarioId, SlabScope>;
  evidence: {
    photosProvided: boolean;
    measurementSource: "confirmed" | "client_approximate" | "photo_estimate" | "missing";
    notes: string[];
  };
}

export interface RateCard {
  version: string;
  effectiveFrom: string;
  source: string;
  approvedBy: string;
  mixesCentsPerM3: Record<ConcreteMixId, number>;
  cartageCentsPerKmM3: number;
  freeKm: number;
  minimumLoadSmallCents: number;
  minimumLoadMediumCents: number;
  handlingPerLoadCents: number;
  saturdayCentsPerM3: number;
  loadSizeM3: number;
  meshCents: Record<MeshId, number>;
  meshNetCoverageM2: number;
  consumablesCentsPerM2: number;
  membraneCentsPerM2: number;
  formworkCentsPerLm: number;
  roadbaseCentsPerT: number;
  sealPlainCentsPerM2: number;
  sealPremiumCentsPerM2: number;
  leadingHandDayCents: number;
  labourerAverageDayCents: number;
  fullCrewDayCents: number;
  labourMarkupBps: number;
  excavationHourlyCents: number;
  excavationMarkupBps: number;
  tipperPerLoadCents: number;
  removalCentsPerM2: number;
  cuttingCentsPerLm: number;
  pumpCents: Record<PumpId, number>;
  defaultMarginBps: number;
  minimumMarginBps: number;
  maximumMarginBps: number;
  minimumJobExGstCents: number;
  wasteBps: number;
  difficultContingencyBps: number;
  baseRateCentsPerM2: Record<Exclude<CanonicalFinishId, "not_sure">, number>;
  gstBps: number;
  depositCents: number;
  quoteRoundingExGstCents: number;
  displayRangeRoundingIncGstCents: number;
  decorativeCostsConfirmed: Record<"oxide" | "stencil" | "honed", boolean>;
}

export interface CostLine {
  code: string;
  description: string;
  totalExGstCents: number;
}

export interface PaymentSchedule {
  depositCents: number;
  progressPaymentsCents: number[];
  totalIncGstCents: number;
}

export interface ScenarioResult {
  id: PricingScenarioId;
  scope: SlabScope;
  costLines: CostLine[];
  totalCostExGstCents: number;
  method1ExGstCents: number;
  method2ExGstCents: number;
  methodVarianceBps: number;
  methodVarianceFlag: boolean;
  candidateQuoteExGstCents: number;
  quoteExGstCents: number;
  quoteIncGstCents: number;
  displayedQuoteIncGstCents: number;
  grossProfitExGstCents: number;
  marginBps: number;
  displayedMarginBps: number;
  marginGuardPassed: boolean;
  profitPerCrewDayExGstCents: number;
  paymentSchedule: PaymentSchedule;
  status: "priced" | "needs_review";
  flags: string[];
}

export interface PricingOptionResult {
  finish: {
    id: CanonicalFinishId;
    customerName: string;
    requested: boolean;
  };
  customerEligible: boolean;
  scenarios: Record<PricingScenarioId, ScenarioResult>;
  displayRangeIncGstCents: {
    low: number;
    high: number;
  };
  flags: string[];
}

export interface PricingResult {
  calculationVersion: typeof CALCULATION_VERSION;
  rateCardVersion: string;
  normalizedInputHash: string;
  routing: PricingRouting;
  reasonCodes: string[];
  assumptions: string[];
  options: PricingOptionResult[];
}

export interface CustomerEstimateOption {
  finishId: CanonicalFinishId;
  customerName: string;
  requested: boolean;
  expectedIncGstCents: number;
  displayRangeIncGstCents: { low: number; high: number };
  inclusions: string[];
  assumptions: string[];
}

export interface CustomerEstimateView {
  calculationVersion: string;
  rateCardVersion: string;
  routing: PricingRouting;
  reasonCodes: string[];
  brand: {
    customerName: string;
    legalName: string;
    quoteSender: string;
    gold: string;
    navy: string;
    logoPath: string;
    logoSha256: string;
  };
  options: CustomerEstimateOption[];
  evidenceNote: string;
  disclaimer: string;
}
