export const BATCH_ONE_CREATE_SLUGS = [
  "moggill",
  "murarrie",
  "mermaid-waters",
  "clear-island-waters",
  "white-rock",
  "silkstone",
  "spring-mountain",
  "south-ripley",
  "flagstone",
  "crestmead",
  "yarrabilba",
  "clontarf",
] as const;

export const BATCH_ONE_UPGRADE_SLUGS = [
  "everton-park",
  "rochedale",
  "upper-coomera",
  "pimpama",
  "beenleigh",
  "strathpine",
  "caboolture",
  "morayfield",
] as const;

/**
 * Release 2 production activation. Only the director-approved Batch 1 create
 * routes are public; content presence alone never publishes future routes.
 */
export const BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST: readonly string[] =
  BATCH_ONE_CREATE_SLUGS;

export function isBatchOneLocalityAvailable(
  slug: string,
  context: { customerHost: boolean; previewEnabled: boolean },
) {
  if ((BATCH_ONE_UPGRADE_SLUGS as readonly string[]).includes(slug)) return true;
  if (!(BATCH_ONE_CREATE_SLUGS as readonly string[]).includes(slug)) return false;
  if (context.customerHost) {
    return BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST.includes(slug);
  }
  return context.previewEnabled;
}
