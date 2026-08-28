import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Tests for the dedicated FAQ page:
 * 1. FAQPage component exists and exports default
 * 2. FAQ schema markup is properly structured
 * 3. Route is registered in App.tsx
 * 4. Footer links to FAQ page
 */

const FAQ_PAGE_PATH = resolve(__dirname, "../client/src/pages/FAQPage.tsx");
const APP_PATH = resolve(__dirname, "../client/src/App.tsx");
const FOOTER_PATH = resolve(__dirname, "../client/src/components/Footer.tsx");

describe("FAQ Page", () => {
  it("FAQPage component file exists", () => {
    const content = readFileSync(FAQ_PAGE_PATH, "utf-8");
    expect(content).toBeTruthy();
    expect(content).toContain("export default function FAQPage");
  });

  it("contains FAQPage JSON-LD schema markup", () => {
    const content = readFileSync(FAQ_PAGE_PATH, "utf-8");
    expect(content).toContain('"@type": "FAQPage"');
    expect(content).toContain('"@type": "Question"');
    expect(content).toContain('"@type": "Answer"');
    expect(content).toContain("https://schema.org");
  });

  it("contains BreadcrumbList schema markup", () => {
    const content = readFileSync(FAQ_PAGE_PATH, "utf-8");
    expect(content).toContain('"@type": "BreadcrumbList"');
    expect(content).toContain("concreteconceptsgroup.com/faq");
  });

  it("has SEOHead with proper meta tags", () => {
    const content = readFileSync(FAQ_PAGE_PATH, "utf-8");
    expect(content).toContain("<SEOHead");
    expect(content).toContain('canonical="/faq"');
    expect(content).toContain("Frequently Asked Questions");
    expect(content).toContain("concrete FAQ Brisbane");
  });

  it("contains at least 6 FAQ categories", () => {
    const content = readFileSync(FAQ_PAGE_PATH, "utf-8");
    const categoryMatches = content.match(/title:\s*"/g);
    // 6 categories in faqCategories array
    expect(categoryMatches).not.toBeNull();
    expect(categoryMatches!.length).toBeGreaterThanOrEqual(6);
  });

  it("contains at least 25 FAQ questions", () => {
    const content = readFileSync(FAQ_PAGE_PATH, "utf-8");
    const questionMatches = content.match(/question:\s*"/g);
    expect(questionMatches).not.toBeNull();
    expect(questionMatches!.length).toBeGreaterThanOrEqual(25);
  });

  it("includes CTA section with phone and quote links", () => {
    const content = readFileSync(FAQ_PAGE_PATH, "utf-8");
    expect(content).toContain("tel:0424463268");
    expect(content).toContain("/get-quote");
    expect(content).toContain("Still Have Questions?");
  });

  it("includes related resources section", () => {
    const content = readFileSync(FAQ_PAGE_PATH, "utf-8");
    expect(content).toContain("/calculator");
    expect(content).toContain("/blog");
    expect(content).toContain("/projects");
    expect(content).toContain("Helpful Resources");
  });
});

describe("FAQ Page Route", () => {
  it("route is registered in App.tsx", () => {
    const content = readFileSync(APP_PATH, "utf-8");
    expect(content).toContain('path={"/faq"}');
    expect(content).toContain("FAQPage");
  });

  it("FAQPage is lazy-loaded", () => {
    const content = readFileSync(APP_PATH, "utf-8");
    expect(content).toContain('lazy(() => import("./pages/FAQPage"))');
  });
});

describe("FAQ Page Footer Link", () => {
  it("footer contains link to /faq", () => {
    const content = readFileSync(FOOTER_PATH, "utf-8");
    expect(content).toContain('href="/faq"');
    expect(content).toContain("FAQ");
  });
});
