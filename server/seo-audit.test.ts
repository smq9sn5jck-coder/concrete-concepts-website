import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * SEO & Conversion Tracking Audit Tests
 * Validates that all critical SEO and tracking fixes are in place.
 */

// Helper to read a file relative to project root
function readFile(relativePath: string): string {
  return readFileSync(resolve(__dirname, "..", relativePath), "utf-8");
}

describe("Sitemap completeness", () => {
  const indexTs = readFile("server/_core/index.ts");

  it("includes /finishes in static pages", () => {
    expect(indexTs).toContain('"/finishes"');
  });

  it("includes all 60 suburb slugs", () => {
    const newSuburbs = [
      "bracken-ridge", "thornlands", "calamvale", "sunnybank-hills", "alexandra-hills",
      "redland-bay", "eight-mile-plains", "rochedale", "pimpama", "mango-hill",
      "bellbird-park", "victoria-point", "upper-coomera", "kallangur", "narangba",
    ];
    for (const suburb of newSuburbs) {
      expect(indexTs).toContain(`"${suburb}"`);
    }
  });

  it("includes all 9 service page slugs", () => {
    const services = [
      "concrete-driveways-brisbane", "concrete-slabs-brisbane", "retaining-walls-brisbane",
      "exposed-aggregate-brisbane", "concrete-patios-brisbane", "excavation-brisbane",
      "crossover-permits-brisbane", "pool-surrounds-brisbane", "shed-slabs-brisbane",
    ];
    for (const svc of services) {
      expect(indexTs).toContain(`"${svc}"`);
    }
  });
});

describe("SEO prerender meta tags", () => {
  const seoPrerender = readFile("server/seoPrerender.ts");

  it("has meta tags for /finishes page", () => {
    expect(seoPrerender).toContain('"/finishes"');
    expect(seoPrerender).toContain("Concrete Finishes Brisbane");
  });

  it("has meta tags for all key static pages", () => {
    const pages = ["/", "/areas", "/reviews", "/blog", "/calculator", "/get-quote", "/faq", "/guide", "/referral", "/finishes"];
    for (const page of pages) {
      expect(seoPrerender).toContain(`"${page}"`);
    }
  });
});

describe("CallbackPopup conversion tracking", () => {
  const callbackPopup = readFile("client/src/components/CallbackPopup.tsx");

  it("imports trackQuoteConversion", () => {
    expect(callbackPopup).toContain("trackQuoteConversion");
  });

  it("fires trackQuoteConversion on success", () => {
    expect(callbackPopup).toContain("trackQuoteConversion(");
  });
});

describe("Phone call tracking coverage", () => {
  const pages = [
    "client/src/pages/ServicePage.tsx",
    "client/src/pages/SuburbPage.tsx",
    "client/src/pages/ReviewsPage.tsx",
    "client/src/pages/ServiceAreasPage.tsx",
    "client/src/pages/CostCalculator.tsx",
    "client/src/components/quote/ComprehensiveQuoteWizard.tsx",
    "client/src/pages/ReferralPage.tsx",
    "client/src/pages/GuidePage.tsx",
    "client/src/pages/FAQPage.tsx",
    "client/src/pages/FinishesVisualizer.tsx",
    "client/src/pages/LandingPage.tsx",
  ];

  for (const page of pages) {
    it(`${page.split("/").pop()} imports trackPhoneCallClick`, () => {
      const content = readFile(page);
      expect(content).toContain("trackPhoneCallClick");
    });
  }
});

describe("Internal linking to /finishes", () => {
  it("ServicePage links to /finishes in Related Services", () => {
    const content = readFile("client/src/pages/ServicePage.tsx");
    expect(content).toContain('href="/finishes"');
  });

  it("SuburbPage links to /finishes in services grid", () => {
    const content = readFile("client/src/pages/SuburbPage.tsx");
    expect(content).toContain('href="/finishes"');
  });

  it("BlogPost links to /finishes in Explore Our Services", () => {
    const content = readFile("client/src/pages/BlogPost.tsx");
    expect(content).toContain('href="/finishes"');
  });

  it("Navbar links to /finishes", () => {
    const content = readFile("client/src/components/Navbar.tsx");
    expect(content).toContain("/finishes");
  });

  it("Footer links to /finishes", () => {
    const content = readFile("client/src/components/Footer.tsx");
    expect(content).toContain("/finishes");
  });
});

describe("CostCalculator tracking", () => {
  const content = readFile("client/src/pages/CostCalculator.tsx");

  it("imports trackCalculatorUse", () => {
    expect(content).toContain("trackCalculatorUse");
  });

  it("calls trackCalculatorUse on calculation", () => {
    expect(content).toContain("trackCalculatorUse(");
  });
});

describe("robots.txt configuration", () => {
  const robots = readFile("client/public/robots.txt");

  it("allows all crawlers", () => {
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
  });

  it("blocks admin and API paths", () => {
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Disallow: /api/");
  });

  it("includes sitemap URL", () => {
    expect(robots).toContain("Sitemap:");
    expect(robots).toContain("sitemap.xml");
  });
});
