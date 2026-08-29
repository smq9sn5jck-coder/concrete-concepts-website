import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const navbar = readFileSync(
  resolve(process.cwd(), "client/src/components/Navbar.tsx"),
  "utf8",
);
const footer = readFileSync(
  resolve(process.cwd(), "client/src/components/Footer.tsx"),
  "utf8",
);

const portalUrl = "https://partners.concreteconceptsgroup.com/partners";

describe("CCG partner portal links", () => {
  it("sends both desktop and mobile Trade Partners navigation to the secure portal", () => {
    expect(navbar.match(new RegExp(portalUrl, "g"))).toHaveLength(2);
    expect(navbar).not.toContain("https://concreteconceptsgroup.com/trade-partners");
  });

  it("keeps the fixed mobile menu vertically scrollable on phone screens", () => {
    expect(navbar).toMatch(
      /fixed inset-0 z-40 bg-brand-charcoal pt-24[^"\n]*overflow-y-auto/,
    );
  });

  it("keeps a restrained partner-program link in the global footer", () => {
    expect(footer).toContain(portalUrl);
    expect(footer).not.toContain("https://concreteconceptsgroup.com/trade-partners");
  });

  it("does not attach Google Ads conversion callbacks to partner links", () => {
    expect(navbar).not.toMatch(/Trade Partners[\s\S]{0,160}trackGoogleAds/i);
    expect(footer).not.toMatch(/Trade Partners[\s\S]{0,160}trackPhoneCallClick/i);
  });
});
