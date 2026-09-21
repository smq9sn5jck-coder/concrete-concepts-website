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

describe("CCG customer navigation containment", () => {
  it("does not send prospective customers to the partner portal", () => {
    expect(navbar).not.toMatch(/Trade Partners|partners\.concreteconceptsgroup\.com/);
    expect(footer).not.toMatch(/Trade Partners|partners\.concreteconceptsgroup\.com/);
  });

  it("keeps the fixed mobile menu vertically scrollable on phone screens", () => {
    expect(navbar).toMatch(
      /fixed inset-0 z-40 bg-brand-charcoal pt-24[^"\n]*overflow-y-auto/,
    );
  });

  it("uses the scrollable menu at 1280px and reserves the no-wrap desktop row for 2XL screens", () => {
    expect(navbar).toContain(
      'className="hidden 2xl:flex items-center gap-4 whitespace-nowrap"',
    );
    expect(navbar).toContain(
      'className="hidden 2xl:flex items-center gap-3 whitespace-nowrap"',
    );
    expect(navbar).toContain('className={`2xl:hidden p-2 transition-colors ${');
  });

  it("offsets the unscrolled homepage navigation below the booking banner", () => {
    expect(navbar).toContain(
      'location === "/" && !scrolled ? "top-[60px] sm:top-10" : "top-0"',
    );
  });

  it("keeps all customer-navigation CTAs focused on CCG", () => {
    expect(navbar).toContain("Get a Free Quote");
    expect(footer).toContain("Get a Quote");
    expect(`${navbar}\n${footer}`).not.toContain("https://concreteconceptsgroup.com/trade-partners");
  });
});
