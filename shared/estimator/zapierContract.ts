import { z } from "zod";
import { FINISH_CATALOG } from "./finishCatalog";
import type { CanonicalFinishId, PricingRequest, SlabScope } from "./types";

const canonicalFinishIds = Object.keys(FINISH_CATALOG) as [CanonicalFinishId, ...CanonicalFinishId[]];
const canonicalFinishSchema = z.enum(canonicalFinishIds);
const triStateSchema = z.enum(["yes", "no", "unknown"]);

export const zapierPricingEstimateRequestSchema = z
  .object({
    schema_version: z.literal(1),
    source: z.object({
      system: z.literal("zapier"),
      submission_id: z.string().trim().min(1).max(128),
      zap_run_id: z.string().trim().max(128).optional(),
    }),
    requested_finish: canonicalFinishSchema,
    alternative_finish_candidates: z.array(canonicalFinishSchema).max(2).default([]),
    job: z.object({
      service: z.enum([
        "driveway",
        "slab",
        "patio",
        "pool_surround",
        "pathway",
        "crossover",
        "retaining_wall",
        "stairs",
        "commercial",
      ]),
      work_type: z.enum(["new", "replacement", "extension", "repair"]),
      area_m2: z.number().finite().positive().max(10_000).optional(),
      length_m: z.number().finite().positive().max(2_000).optional(),
      width_m: z.number().finite().positive().max(2_000).optional(),
      thickness_mm: z.number().finite().min(50).max(500).optional(),
      concrete_strength_mpa: z.number().finite().min(20).max(50).optional(),
    }),
    site: z.object({
      existing_concrete_removal: triStateSchema,
      excavation: z.enum(["none", "required", "unknown"]),
      disposal: z.enum(["none", "required", "unknown"]),
      vehicle_access: z.enum(["easy", "restricted", "no_vehicle", "unknown"]),
      pump_access: z.enum(["direct_truck", "pump_likely", "unknown"]),
      slope: z.enum(["flat", "slight", "steep", "unknown"]),
      drainage: z.enum(["none_known", "existing_drain", "new_drainage_needed", "unknown"]),
      retaining_wall_height_m: z.number().finite().min(0).max(10).optional(),
    }),
    evidence: z
      .object({
        photos_provided: z.boolean().default(false),
        measurement_source: z
          .enum(["confirmed", "client_approximate", "photo_estimate", "missing"])
          .default("client_approximate"),
      })
      .default({ photos_provided: false, measurement_source: "client_approximate" }),
  })
  .strict()
  .superRefine((value, context) => {
    const alternatives = value.alternative_finish_candidates;
    if (new Set(alternatives).size !== alternatives.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alternative_finish_candidates"],
        message: "Alternative finishes must be unique.",
      });
    }
    if (alternatives.includes(value.requested_finish)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alternative_finish_candidates"],
        message: "The requested finish cannot also be an alternative.",
      });
    }
    if (value.job.area_m2 && value.job.length_m && value.job.width_m) {
      const calculated = value.job.length_m * value.job.width_m;
      const difference = Math.abs(calculated - value.job.area_m2) / value.job.area_m2;
      if (difference > 0.1) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["job", "area_m2"],
          message: "The stated area differs from length × width by more than 10%.",
        });
      }
    }
  });

export type ZapierPricingEstimateRequest = z.infer<typeof zapierPricingEstimateRequestSchema>;

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

function mixForStrength(strength?: number): SlabScope["mix"] {
  if (!strength || strength >= 32) return "n32";
  if (strength >= 25) return "n25";
  return "n20";
}

function inferArea(payload: ZapierPricingEstimateRequest) {
  if (payload.job.area_m2) return payload.job.area_m2;
  if (payload.job.length_m && payload.job.width_m) {
    return Number((payload.job.length_m * payload.job.width_m).toFixed(2));
  }
  return undefined;
}

function buildScope(
  payload: ZapierPricingEstimateRequest,
  areaM2: number,
  scenario: "low" | "expected" | "high"
): SlabScope {
  const formBase = Math.round(4 * Math.sqrt(areaM2));
  const needsExcavation = payload.site.excavation !== "none";
  const needsDisposal = payload.site.disposal !== "none";
  const removalM2 =
    payload.site.existing_concrete_removal === "yes"
      ? areaM2
      : payload.site.existing_concrete_removal === "unknown" && scenario === "high"
        ? areaM2
        : 0;
  const pump =
    payload.site.pump_access === "pump_likely" && scenario !== "low"
      ? "line"
      : payload.site.pump_access === "unknown" && scenario === "high"
        ? "line"
        : "none";

  const scenarioValues = {
    low: {
      roadbaseT: Math.round(areaM2 * 0.1273),
      excavationHours: Math.ceil(areaM2 / 20),
      tipperLoads: Math.ceil(areaM2 / 27.5),
      prepDays: roundToHalf(areaM2 / 44),
      formLm: formBase,
    },
    expected: {
      roadbaseT: Math.round(areaM2 * 0.1545),
      excavationHours: Math.ceil(areaM2 / 14),
      tipperLoads: Math.ceil(areaM2 / 22),
      prepDays: roundToHalf(areaM2 / 36.67),
      formLm: formBase,
    },
    high: {
      roadbaseT: Math.round(areaM2 * 0.1818),
      excavationHours: Math.ceil(areaM2 / 9.2),
      tipperLoads: Math.ceil(areaM2 / 15.72),
      prepDays: roundToHalf(areaM2 / 27.5),
      formLm: Math.ceil(formBase * 1.08),
    },
  }[scenario];

  return {
    areaM2,
    thicknessMm: payload.job.thickness_mm ?? 100,
    mix: mixForStrength(payload.job.concrete_strength_mpa),
    mesh: "sl72",
    membrane: false,
    formLm: scenarioValues.formLm,
    roadbaseT: needsExcavation ? scenarioValues.roadbaseT : 0,
    distanceKm: 12,
    saturday: false,
    excavationHours: needsExcavation ? scenarioValues.excavationHours : 0,
    tipperLoads: needsDisposal ? scenarioValues.tipperLoads : 0,
    removalM2,
    cuttingLm: removalM2 > 0 ? formBase : 0,
    pump,
    prepDays: scenarioValues.prepDays,
    prepCrew: 4,
    pourDays: payload.requested_finish.startsWith("exposed_") ? 2 : 1.5,
    pourCrew: 4,
    difficultAccess:
      payload.site.vehicle_access === "restricted" ||
      payload.site.vehicle_access === "no_vehicle" ||
      payload.site.slope === "steep",
    targetMarginBps: 2200,
  };
}

export function normalizeZapierPricingRequest(
  payload: ZapierPricingEstimateRequest
): PricingRequest {
  const areaM2 = inferArea(payload);
  const notes: string[] = [];
  if (!payload.evidence.photos_provided) notes.push("No site photos were available.");
  if (payload.site.drainage === "unknown") notes.push("Drainage and final levels require site confirmation.");
  if (payload.site.vehicle_access === "unknown") notes.push("Vehicle access requires site confirmation.");

  return {
    schemaVersion: 1,
    source: {
      system: "zapier",
      submissionId: payload.source.submission_id,
      zapRunId: payload.source.zap_run_id,
    },
    service: payload.job.service,
    workType: payload.job.work_type,
    requestedFinish: payload.requested_finish,
    alternativeFinishes: [...payload.alternative_finish_candidates],
    scenarios: areaM2
      ? {
          low: buildScope(payload, areaM2, "low"),
          expected: buildScope(payload, areaM2, "expected"),
          high: buildScope(payload, areaM2, "high"),
        }
      : undefined,
    evidence: {
      photosProvided: payload.evidence.photos_provided,
      measurementSource: areaM2 ? payload.evidence.measurement_source : "missing",
      notes,
    },
  };
}
