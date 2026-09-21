import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeLeadSourceForReporting } from "./leadSourceReporting";

describe("lead source reporting normalization", () => {
  it.each([
    "Referral (concreteconceptsgroup.com)",
    "Referral (www.concreteconceptsgroup.com)",
  ])("reports legacy CCG self-referral %s as Direct", (source) => {
    expect(normalizeLeadSourceForReporting(source)).toBe("Direct");
  });

  it("preserves real external referrals and paid sources", () => {
    expect(normalizeLeadSourceForReporting("Referral (example-builder.com)")).toBe("Referral (example-builder.com)");
    expect(normalizeLeadSourceForReporting("Google Ads")).toBe("Google Ads");
    expect(normalizeLeadSourceForReporting(null)).toBe("Direct");
  });

  it("uses the shared report-only normalizer in the weekly digest", () => {
    const weeklyDigest = readFileSync(resolve(process.cwd(), "server/weeklyDigest.ts"), "utf8");

    expect(weeklyDigest).toContain('import { normalizeLeadSourceForReporting } from "./leadSourceReporting"');
    expect(weeklyDigest).toContain("normalizeLeadSourceForReporting(q.leadSource)");
  });
});
