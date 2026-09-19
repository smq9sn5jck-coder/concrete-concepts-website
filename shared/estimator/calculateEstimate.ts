import { FINISH_CATALOG, getFinishDefinition } from "./finishCatalog";
import type {
  CanonicalFinishId,
  CostLine,
  PaymentSchedule,
  PricingOptionResult,
  PricingRequest,
  PricingResult,
  PricingScenarioId,
  RateCard,
  ScenarioResult,
  SlabScope,
} from "./types";
import { CALCULATION_VERSION } from "./types";

const SCENARIOS: PricingScenarioId[] = ["low", "expected", "high"];

function roundCents(value: number) {
  return Math.round(value);
}

function roundUp(value: number, step: number) {
  return Math.ceil(Math.round((value / step) * 1e9) / 1e9) * step;
}

function roundToIncrement(value: number, increment: number) {
  return Math.round(value / increment) * increment;
}

function roundUpToIncrement(value: number, increment: number) {
  return Math.ceil(value / increment) * increment;
}

function marginBps(priceExGstCents: number, costExGstCents: number) {
  if (priceExGstCents <= 0) return 0;
  return Math.round(((priceExGstCents - costExGstCents) / priceExGstCents) * 10_000);
}

function crewDayRate(crew: number, card: RateCard) {
  if (!Number.isInteger(crew) || crew < 1 || crew > 12) {
    throw new Error("Crew size must be a whole number from 1 to 12.");
  }
  if (crew >= 4) return card.fullCrewDayCents;
  return card.leadingHandDayCents + (crew - 1) * card.labourerAverageDayCents;
}

function addLine(lines: CostLine[], code: string, description: string, total: number) {
  lines.push({ code, description, totalExGstCents: roundCents(total) });
}

function validateScope(scope: SlabScope, scenarioId: PricingScenarioId, card: RateCard) {
  const finiteNonNegative: Array<[string, number]> = [
    ["areaM2", scope.areaM2],
    ["thicknessMm", scope.thicknessMm],
    ["formLm", scope.formLm],
    ["roadbaseT", scope.roadbaseT],
    ["distanceKm", scope.distanceKm],
    ["excavationHours", scope.excavationHours],
    ["tipperLoads", scope.tipperLoads],
    ["removalM2", scope.removalM2],
    ["cuttingLm", scope.cuttingLm],
    ["prepDays", scope.prepDays],
    ["pourDays", scope.pourDays],
  ];
  for (const [field, value] of finiteNonNegative) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${scenarioId}.${field} must be non-negative.`);
  }
  if (scope.areaM2 <= 0) throw new Error(`${scenarioId}.areaM2 must be positive.`);
  if (scope.thicknessMm <= 0) throw new Error(`${scenarioId}.thicknessMm must be positive.`);
  if (scope.targetMarginBps < card.minimumMarginBps || scope.targetMarginBps > card.maximumMarginBps) {
    throw new Error(`${scenarioId}.targetMarginBps must be between 1800 and 2600.`);
  }
  if (!(scope.mesh in card.meshCents)) throw new Error(`${scenarioId}.mesh is invalid.`);
  if (!(scope.pump in card.pumpCents)) throw new Error(`${scenarioId}.pump is invalid.`);
}

function buildPaymentSchedule(totalIncGstCents: number, card: RateCard): PaymentSchedule {
  const count = totalIncGstCents > 5_000_000 ? 3 : 2;
  const remaining = totalIncGstCents - card.depositCents;
  const base = Math.floor(remaining / count);
  const progressPaymentsCents = Array.from({ length: count }, () => base);
  progressPaymentsCents[count - 1] += remaining - base * count;
  return {
    depositCents: card.depositCents,
    progressPaymentsCents,
    totalIncGstCents,
  };
}

function calculateScenario(
  id: PricingScenarioId,
  requestedFinish: CanonicalFinishId,
  scope: SlabScope,
  card: RateCard
): ScenarioResult {
  validateScope(scope, id, card);
  const finish = getFinishDefinition(requestedFinish);
  if (requestedFinish === "not_sure") throw new Error("A priceable canonical finish is required.");

  const lines: CostLine[] = [];
  const volumeM3 = roundUp(
    scope.areaM2 * (scope.thicknessMm / 1000) * (1 + card.wasteBps / 10_000),
    0.2
  );
  const loads = Math.ceil(volumeM3 / card.loadSizeM3);
  const mix = scope.mix ?? finish.defaultMix ?? "n25";
  const mixRate = card.mixesCentsPerM3[mix];
  if (!mixRate) throw new Error(`No approved concrete rate exists for mix ${mix}.`);

  let concrete = volumeM3 * mixRate;
  if (scope.distanceKm > card.freeKm) {
    concrete += (scope.distanceKm - card.freeKm) * card.cartageCentsPerKmM3 * volumeM3;
  }
  if (volumeM3 >= 0.4 && volumeM3 <= 1.0) concrete += card.minimumLoadSmallCents;
  else if (volumeM3 >= 1.1 && volumeM3 <= 3.9) concrete += card.minimumLoadMediumCents;
  if (finish.exposed || requestedFinish === "oxide") concrete += card.handlingPerLoadCents * loads;
  if (scope.saturday) concrete += card.saturdayCentsPerM3 * volumeM3;
  addLine(lines, "concrete", `Concrete ${mix} ${volumeM3.toFixed(1)}m³ (${loads} loads)`, concrete);

  const sheets = Math.ceil(scope.areaM2 / card.meshNetCoverageM2);
  addLine(lines, "mesh", `Mesh ${scope.mesh.toUpperCase()} × ${sheets}`, sheets * card.meshCents[scope.mesh]);
  addLine(lines, "consumables", "Consumables (chairs, wire and ableflex)", scope.areaM2 * card.consumablesCentsPerM2);
  if (scope.membrane) {
    addLine(lines, "membrane", "Builders plastic membrane", scope.areaM2 * card.membraneCentsPerM2);
  }
  addLine(lines, "formwork", `Formwork ${scope.formLm} lm`, scope.formLm * card.formworkCentsPerLm);
  if (scope.roadbaseT > 0) addLine(lines, "roadbase", `Road base ${scope.roadbaseT} t`, scope.roadbaseT * card.roadbaseCentsPerT);
  addLine(
    lines,
    "seal",
    "Cure and seal",
    scope.areaM2 * (finish.premiumSeal ? card.sealPremiumCentsPerM2 : card.sealPlainCentsPerM2)
  );

  const pourCrew = finish.exposed ? Math.max(scope.pourCrew, 4) : scope.pourCrew;
  const labourBeforeMarkup =
    scope.prepDays * crewDayRate(scope.prepCrew, card) +
    scope.pourDays * crewDayRate(pourCrew, card);
  addLine(
    lines,
    "labour",
    `Labour ${scope.prepDays}d × ${scope.prepCrew} prep + ${scope.pourDays}d × ${pourCrew} pour`,
    labourBeforeMarkup * (1 + card.labourMarkupBps / 10_000)
  );

  if (scope.excavationHours > 0) {
    addLine(
      lines,
      "excavation",
      `Excavation ${scope.excavationHours} hours`,
      scope.excavationHours * card.excavationHourlyCents * (1 + card.excavationMarkupBps / 10_000)
    );
  }
  if (scope.tipperLoads > 0) addLine(lines, "tipping", `Tipping × ${scope.tipperLoads}`, scope.tipperLoads * card.tipperPerLoadCents);
  if (scope.removalM2 > 0) addLine(lines, "removal", `Concrete removal ${scope.removalM2} m²`, scope.removalM2 * card.removalCentsPerM2);
  if (scope.cuttingLm > 0) addLine(lines, "cutting", `Concrete cutting ${scope.cuttingLm} lm`, scope.cuttingLm * card.cuttingCentsPerLm);
  if (scope.pump !== "none") addLine(lines, "pump", `${scope.pump === "line" ? "Line" : "Boom"} pump`, card.pumpCents[scope.pump]);

  let totalCostExGstCents = lines.reduce((sum, line) => sum + line.totalExGstCents, 0);
  if (scope.difficultAccess) {
    const contingency = roundCents(totalCostExGstCents * (card.difficultContingencyBps / 10_000));
    addLine(lines, "difficult_contingency", "Difficult-site contingency", contingency);
    totalCostExGstCents += contingency;
  }

  const method1ExGstCents = roundCents(totalCostExGstCents / (1 - scope.targetMarginBps / 10_000));
  const siteWorksCents = roundCents(
    scope.excavationHours * card.excavationHourlyCents * (1 + card.excavationMarkupBps / 10_000) +
      scope.tipperLoads * card.tipperPerLoadCents +
      scope.removalM2 * card.removalCentsPerM2 +
      scope.cuttingLm * card.cuttingCentsPerLm +
      card.pumpCents[scope.pump]
  );
  const method2ExGstCents = roundCents(scope.areaM2 * card.baseRateCentsPerM2[requestedFinish as Exclude<CanonicalFinishId, "not_sure">] + siteWorksCents);
  const candidateQuoteExGstCents = Math.max(method1ExGstCents, method2ExGstCents, card.minimumJobExGstCents);
  let quoteExGstCents = roundToIncrement(candidateQuoteExGstCents, card.quoteRoundingExGstCents);
  while (
    marginBps(quoteExGstCents, totalCostExGstCents) < card.minimumMarginBps &&
    quoteExGstCents < candidateQuoteExGstCents + card.quoteRoundingExGstCents * 3
  ) {
    quoteExGstCents += card.quoteRoundingExGstCents;
  }

  const quoteIncGstCents = roundCents(quoteExGstCents * (1 + card.gstBps / 10_000));
  const displayedQuoteIncGstCents =
    id === "expected"
      ? quoteIncGstCents
      : roundUpToIncrement(quoteIncGstCents, card.displayRangeRoundingIncGstCents);
  const displayedQuoteExGstCents = roundCents(displayedQuoteIncGstCents / (1 + card.gstBps / 10_000));
  const calculatedMarginBps = marginBps(quoteExGstCents, totalCostExGstCents);
  const displayedMarginBps = marginBps(displayedQuoteExGstCents, totalCostExGstCents);
  const marginGuardPassed =
    displayedMarginBps >= card.minimumMarginBps && displayedMarginBps <= card.maximumMarginBps;
  const methodVarianceBps = method1ExGstCents
    ? Math.round(((method2ExGstCents - method1ExGstCents) / method1ExGstCents) * 10_000)
    : 0;
  const flags: string[] = [];
  if (Math.abs(methodVarianceBps) > 1500) flags.push("method_variance_over_15_percent");
  if (!marginGuardPassed) flags.push("margin_guard_failed");
  if (quoteIncGstCents > 3_000_000) flags.push("value_over_30000");

  const grossProfitExGstCents = quoteExGstCents - totalCostExGstCents;
  const crewDays = scope.prepDays + scope.pourDays;
  return {
    id,
    scope,
    costLines: lines,
    totalCostExGstCents,
    method1ExGstCents,
    method2ExGstCents,
    methodVarianceBps,
    methodVarianceFlag: Math.abs(methodVarianceBps) > 1500,
    candidateQuoteExGstCents,
    quoteExGstCents,
    quoteIncGstCents,
    displayedQuoteIncGstCents,
    grossProfitExGstCents,
    marginBps: calculatedMarginBps,
    displayedMarginBps,
    marginGuardPassed,
    profitPerCrewDayExGstCents: crewDays > 0 ? roundCents(grossProfitExGstCents / crewDays) : 0,
    paymentSchedule: buildPaymentSchedule(quoteIncGstCents, card),
    status: flags.length ? "needs_review" : "priced",
    flags,
  };
}

function stableHash(value: unknown) {
  const input = JSON.stringify(value);
  let hash = 2_166_136_261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function calculateOption(
  finishId: CanonicalFinishId,
  requested: boolean,
  request: PricingRequest,
  card: RateCard
): PricingOptionResult {
  const definition = getFinishDefinition(finishId);
  if (!request.scenarios) throw new Error("Complete low, expected and high scenarios are required.");
  const scenarios = Object.fromEntries(
    SCENARIOS.map((scenarioId) => {
      const scope = request.scenarios![scenarioId];
      const mix = definition.defaultMix ?? scope.mix;
      return [scenarioId, calculateScenario(scenarioId, finishId, { ...scope, mix }, card)];
    })
  ) as Record<PricingScenarioId, ScenarioResult>;

  const finishCostIncomplete =
    (finishId === "oxide" || finishId === "stencil" || finishId === "honed") &&
    !card.decorativeCostsConfirmed[finishId];
  const flags = Array.from(new Set(Object.values(scenarios).flatMap((scenario) => scenario.flags)));
  if (finishCostIncomplete) flags.push("finish_cost_incomplete");
  const marginGuardPassed = Object.values(scenarios).every((scenario) => scenario.marginGuardPassed);

  return {
    finish: { id: finishId, customerName: definition.customerName, requested },
    customerEligible: definition.automation === "automatic" && !finishCostIncomplete && marginGuardPassed,
    scenarios,
    displayRangeIncGstCents: {
      low: scenarios.low.displayedQuoteIncGstCents,
      high: scenarios.high.displayedQuoteIncGstCents,
    },
    flags,
  };
}

export function calculateEstimate(request: PricingRequest, card: RateCard): PricingResult {
  if (request.schemaVersion !== 1) throw new Error("Pricing schema version 1 is required.");
  if (!request.source.submissionId.trim()) throw new Error("A source submission ID is required.");
  if (request.alternativeFinishes.length > 2) throw new Error("No more than two alternatives may be requested.");
  if (new Set(request.alternativeFinishes).size !== request.alternativeFinishes.length) {
    throw new Error("Alternative finishes must be unique.");
  }
  if (request.service === "retaining_wall" || request.service === "stairs") {
    return {
      calculationVersion: CALCULATION_VERSION,
      rateCardVersion: card.version,
      normalizedInputHash: stableHash(request),
      routing: "rejected",
      reasonCodes: ["unsupported_service_pricing"],
      assumptions: request.evidence.notes,
      options: [],
    };
  }
  const requestedDefinition = getFinishDefinition(request.requestedFinish);

  if (!request.scenarios || request.evidence.measurementSource === "missing" || request.requestedFinish === "not_sure") {
    return {
      calculationVersion: CALCULATION_VERSION,
      rateCardVersion: card.version,
      normalizedInputHash: stableHash(request),
      routing: "measure_first",
      reasonCodes: ["measurement_required"],
      assumptions: request.evidence.notes,
      options: [],
    };
  }

  const optionIds = [request.requestedFinish, ...request.alternativeFinishes].filter(
    (value, index, values) => values.indexOf(value) === index
  );
  const options = optionIds.map((finishId, index) => calculateOption(finishId, index === 0, request, card));
  const reasonCodes = Array.from(new Set(options.flatMap((option) => option.flags)));
  if (requestedDefinition.automation === "owner_review" && !reasonCodes.includes("finish_cost_incomplete")) {
    reasonCodes.push("finish_requires_owner_review");
  }
  reasonCodes.push("owner_review_rollout");

  return {
    calculationVersion: CALCULATION_VERSION,
    rateCardVersion: card.version,
    normalizedInputHash: stableHash(request),
    routing: "owner_review",
    reasonCodes,
    assumptions: request.evidence.notes,
    options,
  };
}

export function toParityProjection(result: PricingResult) {
  return {
    normalizedInputHash: result.normalizedInputHash,
    rateCardVersion: result.rateCardVersion,
    calculationVersion: result.calculationVersion,
    routing: result.routing,
    reasonCodes: result.reasonCodes,
    options: result.options.map((option) => ({
      finish: option.finish,
      displayRangeIncGstCents: option.displayRangeIncGstCents,
      scenarios: SCENARIOS.map((id) => {
        const scenario = option.scenarios[id];
        return {
          id,
          totalCostExGstCents: scenario.totalCostExGstCents,
          quoteExGstCents: scenario.quoteExGstCents,
          quoteIncGstCents: scenario.quoteIncGstCents,
          displayedQuoteIncGstCents: scenario.displayedQuoteIncGstCents,
          marginBps: scenario.marginBps,
          displayedMarginBps: scenario.displayedMarginBps,
        };
      }),
    })),
  };
}
