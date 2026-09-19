import { describe, expect, it } from "vitest";
import {
  verifyPricingBuildContract,
  verifyPricingSourceContract,
} from "../scripts/pricingReleaseGuard";

describe("pricing release guard", () => {
  it("requires the versioned Worker route and generated module build step", () => {
    expect(
      verifyPricingSourceContract({
        worker: 'if (path === "/api/v1/pricing/estimate") await import("./pricing-api.js")',
        packageJson: '"build:pricing-worker": "tsx scripts/buildPricingWorkerModule.ts"',
      })
    ).toEqual({ ok: true, errors: [] });
  });

  it("rejects missing source and build contracts", () => {
    expect(verifyPricingSourceContract({ worker: "", packageJson: "{}" }).ok).toBe(false);
    expect(verifyPricingBuildContract([]).ok).toBe(false);
  });

  it("requires both the Worker dispatcher and pricing bundle in the built artifact", () => {
    expect(
      verifyPricingBuildContract([
        { name: "_worker.js", content: 'path === "/api/v1/pricing/estimate"' },
        { name: "pricing-api.js", content: "handlePricingWorkerRequest" },
      ])
    ).toEqual({ ok: true, errors: [] });
  });
});
