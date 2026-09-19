import type { LocalityContentRecord } from "@shared/localityContent.schema";
import { quoteServices } from "@shared/quoteBrief";
import { loadQuoteDraft, saveQuoteDraft, type QuoteDraftData } from "@/lib/quoteDraft";

type QuoteService = (typeof quoteServices)[number];

const LOCALITY_SERVICE_TO_QUOTE_SERVICE: Record<string, QuoteService> = {
  "concrete-driveways-brisbane": "driveway",
  "concrete-slabs-brisbane": "slab",
  "concrete-patios-brisbane": "patio",
  "pool-surrounds-brisbane": "pool-surround",
  "retaining-walls-brisbane": "retaining-wall",
  "exposed-aggregate-brisbane": "exposed-aggregate",
  "excavation-brisbane": "excavation",
};

export function quoteServiceForLocalitySlug(slug: string) {
  return LOCALITY_SERVICE_TO_QUOTE_SERVICE[slug];
}

interface LocalityQuoteHandoffDependencies {
  load?: typeof loadQuoteDraft;
  save?: typeof saveQuoteDraft;
  navigate?: (path: string) => void;
  serviceSlug?: string;
}

export function handoffLocalityQuote(
  locality: Pick<LocalityContentRecord, "locality" | "postcode">,
  dependencies: LocalityQuoteHandoffDependencies = {},
) {
  const load = dependencies.load ?? loadQuoteDraft;
  const save = dependencies.save ?? saveQuoteDraft;
  const navigate = dependencies.navigate ?? ((path: string) => window.location.assign(path));
  let existingDraft: QuoteDraftData = {};
  try {
    existingDraft = load() ?? {};
  } catch {
    // Storage can be unavailable in private browsing; a fresh draft remains safe.
  }
  const quoteService = dependencies.serviceSlug
    ? quoteServiceForLocalitySlug(dependencies.serviceSlug)
    : undefined;
  const existingServices = "services" in existingDraft && Array.isArray(existingDraft.services)
    ? existingDraft.services
    : [];
  const draft = {
    ...existingDraft,
    suburb: locality.locality,
    postcode: locality.postcode,
    ...(quoteService ? { services: Array.from(new Set([...existingServices, quoteService])) } : {}),
  };

  try {
    save(draft);
  } catch {
    // Storage can be unavailable in private browsing; navigation remains safe.
  }
  navigate("/get-quote");
}
