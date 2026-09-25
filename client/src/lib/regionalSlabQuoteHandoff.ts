import { loadQuoteDraft, saveQuoteDraft, type QuoteDraftData } from "@/lib/quoteDraft";
import type { RegionalQuotePrefill } from "@shared/regionalSlabContent";

export function handoffRegionalSlabQuote(
  prefill: RegionalQuotePrefill,
  dependencies: {
    load?: typeof loadQuoteDraft;
    save?: typeof saveQuoteDraft;
    navigate?: (path: string) => void;
  } = {},
) {
  const load = dependencies.load ?? loadQuoteDraft;
  const save = dependencies.save ?? saveQuoteDraft;
  const navigate = dependencies.navigate ?? ((path: string) => window.location.assign(path));
  let existingDraft: QuoteDraftData = {};
  try {
    existingDraft = load() ?? {};
  } catch {
    // Storage can be unavailable; navigation to the unchanged quote route remains safe.
  }

  const existingServices = Array.isArray(existingDraft.services) ? existingDraft.services : [];
  const nextDraft: QuoteDraftData = {
    ...existingDraft,
    services: Array.from(new Set([...existingServices, prefill.service])),
    region: prefill.region,
    structuralProjectType: prefill.structuralProjectType ?? existingDraft.structuralProjectType,
    landingRoute: prefill.landingRoute,
    partnerIntroductionInterest: false,
  };
  try {
    save(nextDraft);
  } catch {
    // A storage failure must never trigger a network request or block manual quote entry.
  }
  navigate("/get-quote");
}
