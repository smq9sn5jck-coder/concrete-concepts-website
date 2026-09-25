import { loadQuoteDraft, saveQuoteDraft, type QuoteDraftData } from "@/lib/quoteDraft";
import { quoteServices } from "@shared/quoteBrief";

type QuoteService = (typeof quoteServices)[number];

export function handoffGoldCoastQuote(
  service?: QuoteService,
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
    // Storage can be unavailable. The existing quote route remains usable.
  }
  if (service) {
    const existingServices = Array.isArray(existingDraft.services) ? existingDraft.services : [];
    try {
      save({ ...existingDraft, services: Array.from(new Set([...existingServices, service])) });
    } catch {
      // Navigation remains safe if storage is unavailable.
    }
  }
  navigate("/get-quote");
}
