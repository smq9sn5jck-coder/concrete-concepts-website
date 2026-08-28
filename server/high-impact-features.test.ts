import { describe, it, expect } from "vitest";
import { getPageMeta, injectMetaTags } from "./seoPrerender";

/**
 * Tests for high-impact features:
 * 1. Server-side meta tag prerendering (SEO)
 * 2. Sitemap completeness
 * 3. BlogQuoteCTA component structure
 * 4. StickyMobileCTA on all key pages
 */

// ===== SEO Prerendering Tests =====
describe("SEO Prerendering - getPageMeta", () => {
  it("returns meta for homepage", async () => {
    const meta = await getPageMeta("/");
    expect(meta).not.toBeNull();
    expect(meta!.title).toContain("Concrete Concepts Group");
    expect(meta!.canonical).toBe("/");
    expect(meta!.description).toBeTruthy();
  });

  it("returns meta for FAQ page", async () => {
    const meta = await getPageMeta("/faq");
    expect(meta).not.toBeNull();
    expect(meta!.title).toContain("Frequently Asked Questions");
    expect(meta!.canonical).toBe("/faq");
  });

  it("returns meta for service pages", async () => {
    const meta = await getPageMeta("/services/concrete-driveways-brisbane");
    expect(meta).not.toBeNull();
    expect(meta!.title).toContain("Driveways Brisbane");
    expect(meta!.canonical).toBe("/services/concrete-driveways-brisbane");
  });

  it("returns meta for suburb pages", async () => {
    const meta = await getPageMeta("/areas/carindale");
    expect(meta).not.toBeNull();
    expect(meta!.title).toContain("Carindale");
    expect(meta!.canonical).toBe("/areas/carindale");
  });

  it("returns null for unknown pages", async () => {
    const meta = await getPageMeta("/some-random-page");
    expect(meta).toBeNull();
  });

  it("returns null for landing pages (noindex)", async () => {
    const meta = await getPageMeta("/lp/some-landing-page");
    expect(meta).toBeNull();
  });

  it("returns meta for all static pages", async () => {
    const staticPages = [
      "/", "/areas", "/reviews", "/blog", "/calculator",
      "/gallery/before-after", "/projects", "/get-quote",
      "/faq", "/guide", "/referral", "/privacy", "/terms",
    ];
    for (const page of staticPages) {
      const meta = await getPageMeta(page);
      expect(meta).not.toBeNull();
      expect(meta!.title).toBeTruthy();
      expect(meta!.description).toBeTruthy();
      expect(meta!.canonical).toBe(page);
    }
  });

  it("handles query strings and fragments", async () => {
    const meta = await getPageMeta("/faq?source=google#pricing");
    expect(meta).not.toBeNull();
    expect(meta!.canonical).toBe("/faq");
  });

  it("handles trailing slashes", async () => {
    const meta = await getPageMeta("/faq/");
    expect(meta).not.toBeNull();
    expect(meta!.canonical).toBe("/faq");
  });
});

describe("SEO Prerendering - injectMetaTags", () => {
  const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Default Title</title>
  <meta name="description" content="Default description" />
  <link rel="canonical" href="https://concreteconceptsgroup.com/" />
  <meta property="og:title" content="Default OG Title" />
  <meta property="og:description" content="Default OG Description" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://example.com/default.png" />
  <meta property="og:url" content="https://concreteconceptsgroup.com/" />
  <meta name="twitter:title" content="Default Twitter Title" />
  <meta name="twitter:description" content="Default Twitter Description" />
  <meta name="twitter:image" content="https://example.com/default.png" />
</head>
<body></body>
</html>`;

  it("replaces title tag", () => {
    const result = injectMetaTags(sampleHtml, {
      title: "Test Page Title",
      description: "Test description",
      canonical: "/test",
    });
    expect(result).toContain("<title>Test Page Title</title>");
    expect(result).not.toContain("Default Title");
  });

  it("replaces meta description", () => {
    const result = injectMetaTags(sampleHtml, {
      title: "Test",
      description: "New description here",
      canonical: "/test",
    });
    expect(result).toContain('content="New description here"');
    expect(result).not.toContain("Default description");
  });

  it("replaces canonical URL with full URL", () => {
    const result = injectMetaTags(sampleHtml, {
      title: "Test",
      description: "Test",
      canonical: "/services/driveways",
    });
    expect(result).toContain('href="https://concreteconceptsgroup.com/services/driveways"');
  });

  it("replaces OG tags", () => {
    const result = injectMetaTags(sampleHtml, {
      title: "OG Test Title",
      description: "OG Test Description",
      canonical: "/test",
    });
    expect(result).toContain('og:title" content="OG Test Title"');
    expect(result).toContain('og:description" content="OG Test Description"');
  });

  it("replaces Twitter card tags", () => {
    const result = injectMetaTags(sampleHtml, {
      title: "Twitter Test",
      description: "Twitter Desc",
      canonical: "/test",
    });
    expect(result).toContain('twitter:title" content="Twitter Test"');
    expect(result).toContain('twitter:description" content="Twitter Desc"');
  });

  it("escapes HTML entities in title", () => {
    const result = injectMetaTags(sampleHtml, {
      title: "Driveways & Slabs <Best>",
      description: "Test",
      canonical: "/test",
    });
    expect(result).toContain("Driveways &amp; Slabs &lt;Best&gt;");
  });

  it("escapes quotes in meta attributes", () => {
    const result = injectMetaTags(sampleHtml, {
      title: "Test",
      description: 'Price from $75/m² — "Best" in Brisbane',
      canonical: "/test",
    });
    expect(result).toContain("&quot;Best&quot;");
  });
});

// ===== Service Page Meta Coverage =====
describe("SEO Prerendering - Service pages coverage", () => {
  const serviceSlugs = [
    "concrete-driveways-brisbane",
    "concrete-slabs-brisbane",
    "retaining-walls-brisbane",
    "exposed-aggregate-brisbane",
    "concrete-patios-brisbane",
    "excavation-brisbane",
    "crossover-permits-brisbane",
    "pool-surrounds-brisbane",
    "shed-slabs-brisbane",
  ];

  it("has meta for all service pages", async () => {
    for (const slug of serviceSlugs) {
      const meta = await getPageMeta(`/services/${slug}`);
      expect(meta).not.toBeNull();
      expect(meta!.title).toBeTruthy();
      expect(meta!.description).toBeTruthy();
      expect(meta!.canonical).toBe(`/services/${slug}`);
    }
  });
});

// ===== Component Integration Tests =====
describe("BlogQuoteCTA component file exists", () => {
  it("BlogQuoteCTA module is importable", async () => {
    // Verify the file exists and exports a default function
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(import.meta.dirname, "../client/src/components/BlogQuoteCTA.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("export default function BlogQuoteCTA");
    expect(content).toContain("trpc.quote.submit.useMutation");
    expect(content).toContain("trackQuoteConversion");
    expect(content).toContain("trackPhoneCallClick");
  });
});

describe("StickyMobileCTA on all key pages", () => {
  const pages = [
    { name: "Home", path: "client/src/pages/Home.tsx" },
    { name: "ServicePage", path: "client/src/pages/ServicePage.tsx" },
    { name: "SuburbPage", path: "client/src/pages/SuburbPage.tsx" },
    { name: "BlogPost", path: "client/src/pages/BlogPost.tsx" },
    { name: "CostCalculator", path: "client/src/pages/CostCalculator.tsx" },
    { name: "FAQPage", path: "client/src/pages/FAQPage.tsx" },
  ];

  for (const page of pages) {
    it(`${page.name} includes StickyMobileCTA`, async () => {
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.resolve(import.meta.dirname, "..", page.path);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("StickyMobileCTA");
      expect(content).toContain("<StickyMobileCTA");
    });
  }
});

describe("BlogQuoteCTA in BlogPost page", () => {
  it("BlogPost includes BlogQuoteCTA import and usage", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(import.meta.dirname, "../client/src/pages/BlogPost.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("import BlogQuoteCTA");
    expect(content).toContain("<BlogQuoteCTA");
    expect(content).toContain("serviceContext");
  });
});
