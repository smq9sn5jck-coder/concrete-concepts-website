const INTERNAL_CCG_REFERRALS = new Set([
  "referral (concreteconceptsgroup.com)",
  "referral (www.concreteconceptsgroup.com)",
]);

/** Normalize known legacy attribution noise for reports without rewriting lead records. */
export function normalizeLeadSourceForReporting(source: string | null | undefined): string {
  const value = source?.trim() || "Direct";
  return INTERNAL_CCG_REFERRALS.has(value.toLowerCase()) ? "Direct" : value;
}
