import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const CCG_LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-navbar_2520906a.png";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("public CCG customer branding", () => {
  it("keeps official CCG identity in the global customer chrome", () => {
    const chrome = `${source("client/src/components/Navbar.tsx")}\n${source("client/src/components/Footer.tsx")}`;

    expect(chrome).toContain(CCG_LOGO_URL);
    expect(chrome).toContain("Concrete Concepts Group");
    expect(chrome).not.toMatch(/Trade Partners|partners\.concreteconceptsgroup\.com|Geminus/i);
  });
});
