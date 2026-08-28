import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");

describe("quote release package scripts", () => {
  const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

  it("guards both source and built artifacts during every production build", () => {
    expect(packageJson.scripts["quote:verify:source"]).toContain("quoteReleaseGuard.ts source");
    expect(packageJson.scripts["quote:verify:build"]).toContain("quoteReleaseGuard.ts build");
    expect(packageJson.scripts.build).toContain("pnpm quote:verify:source");
    expect(packageJson.scripts.build).toContain("pnpm quote:verify:build");
  });

  it("exposes separate live-route and Cloudflare release commands", () => {
    expect(packageJson.scripts["quote:verify:live"]).toContain("verifyLiveQuoteRoute.ts");
    expect(packageJson.scripts["quote:cloudflare"]).toContain("cloudflarePagesRelease.ts");
  });
});

describe("Cloudflare production workflow", () => {
  it("keeps the credential-dependent workflow as a template when workflow permission is unavailable", () => {
    expect(existsSync(resolve(root, ".github/workflows/verify-and-deploy-cloudflare.yml"))).toBe(false);
    expect(existsSync(resolve(root, "docs/workflows/verify-and-deploy-cloudflare.yml"))).toBe(true);
  });

  const workflow = readFileSync(
    resolve(root, "docs/workflows/verify-and-deploy-cloudflare.yml"),
    "utf8"
  );

  it("runs source and build quote guards before the Cloudflare upload", () => {
    const sourceGuard = workflow.indexOf("pnpm quote:verify:source");
    const build = workflow.indexOf("pnpm build");
    const upload = workflow.indexOf("wrangler@4 pages deploy");

    expect(sourceGuard).toBeGreaterThan(-1);
    expect(sourceGuard).toBeLessThan(build);
    expect(build).toBeLessThan(upload);
  });

  it("captures the prior deployment before upload and verifies live routes afterwards", () => {
    const capture = workflow.indexOf("quote:cloudflare canonical");
    const upload = workflow.indexOf("wrangler@4 pages deploy");
    const liveVerify = workflow.indexOf("pnpm quote:verify:live");

    expect(capture).toBeGreaterThan(-1);
    expect(capture).toBeLessThan(upload);
    expect(liveVerify).toBeGreaterThan(upload);
  });

  it("rolls back the captured deployment whenever browser verification fails", () => {
    expect(workflow).toContain("continue-on-error: true");
    expect(workflow).toContain("steps.verify-quote-route.outcome == 'failure'");
    expect(workflow).toContain('quote:cloudflare rollback "$PREVIOUS_DEPLOYMENT_ID"');
    expect(workflow).toContain("exit 1");
  });
});
