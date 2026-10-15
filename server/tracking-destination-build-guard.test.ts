import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { verifyTrackingDestinations } from "../scripts/trackingDestinationGuard";

const QUOTE = "AW-18007005419/oPHGCJSGt44cEOuxtIpD";
const PHONE = "AW-18007005419/KuCJCPSeyo4cEOuxtIpD";
const valid = `const destinations={QUOTE_SUBMISSION:"${QUOTE}",PHONE_CALL:"${PHONE}"};`;

describe("exact built tracking destination guard", () => {
  it.each([valid, valid.replace(/QUOTE_SUBMISSION:/, '"QUOTE_SUBMISSION":').replace(/PHONE_CALL:/, "'PHONE_CALL':")])("accepts exact approved mappings", bundle => {
    expect(verifyTrackingDestinations([bundle])).toEqual({ ok: true, errors: [] });
  });
  it.each([
    valid.replace(QUOTE, "AW-18007005419/quote_submission"),
    valid.replace(PHONE, "AW-18007005419/phone_call_click"),
    valid.replace(QUOTE, "AW-18007005419/another-valid-label"),
    valid.replace(PHONE, "AW-999/KuCJCPSeyo4cEOuxtIpD"),
    `const decoys=["${QUOTE}","${PHONE}"];const mappings={QUOTE_SUBMISSION:"AW-18007005419/wrong",PHONE_CALL:"AW-18007005419/wrong"};`,
    `const decoys=["${QUOTE}","${PHONE}"];`,
    valid + valid,
    valid + 'const duplicate={QUOTE_SUBMISSION:"AW-18007005419/wrong"};',
    valid.replace(`"${QUOTE}"`, 'dynamicDestination'),
    `const diagnostic='QUOTE_SUBMISSION:"${QUOTE}"; PHONE_CALL:"${PHONE}"';`,
    `/* QUOTE_SUBMISSION:"${QUOTE}"; PHONE_CALL:"${PHONE}" */`,
    valid.replace('};', ',...unknownOverrides};'),
    valid.replace('};', ',[unknownKey]:"wrong"};'),
    valid + 'destinations.QUOTE_SUBMISSION="AW-18007005419/wrong";',
    valid + 'destinations["PHONE_CALL"]="AW-18007005419/wrong";',
    valid + 'this is invalid JavaScript ???',
  ])("rejects missing, wrong, ambiguous or decoy-only configuration", bundle => {
    expect(verifyTrackingDestinations([bundle]).ok).toBe(false);
  });
  it("ignores property-shaped text when real approved properties are present", () => {
    expect(verifyTrackingDestinations([valid + `const diagnostic='QUOTE_SUBMISSION:"wrong"; PHONE_CALL:"wrong"';`]).ok).toBe(true);
  });
  it("allows mappings split across entry chunks", () => {
    expect(verifyTrackingDestinations([`const quote={QUOTE_SUBMISSION:"${QUOTE}"};`, `const phone={PHONE_CALL:"${PHONE}"};`]).ok).toBe(true);
  });
  it("wires the guard into the normal build used by the candidate wrapper", () => {
    const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, "../package.json"), "utf8"));
    expect(pkg.scripts["tracking:verify:build"]).toBe("tsx scripts/trackingDestinationGuard.ts dist/public/assets");
    expect(pkg.scripts.build).toContain("pnpm tracking:verify:build");
  });
});
