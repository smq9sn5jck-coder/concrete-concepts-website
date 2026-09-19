import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const CCG_LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-navbar_2520906a.png";

function trustedPartnersSource() {
  return readFileSync(
    resolve(process.cwd(), "client/src/components/TrustedPartners.tsx"),
    "utf8",
  );
}

describe("public partner-card branding", () => {
  it("uses the approved CCG mark instead of initial-based placeholder branding", () => {
    const source = trustedPartnersSource();

    expect(source).toContain(CCG_LOGO_URL);
    expect(source).toContain("CCG Trusted Partner");
    expect(source).not.toMatch(/>\s*GA\s*</);
  });
});
