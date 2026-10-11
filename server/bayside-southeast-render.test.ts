import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import BaysideSoutheastLocalJobsPage from "../client/src/components/BaysideSoutheastLocalJobsPage";
import { BAYSIDE_SOUTHEAST_BY_SLUG } from "../shared/baysideSoutheastLocalJobsContent";
import {
  getBaysideSoutheastMetadata,
  getBaysideSoutheastStructuredData,
  renderBaysideSoutheastContentShell,
} from "../shared/baysideSoutheastLocalJobsPresenter";

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/components/Navbar", () => ({ default: () => null }));
vi.mock("@/components/SEOHead", () => ({ default: () => null }));
vi.mock("@/components/StickyMobileCTA", () => ({ default: () => null }));
vi.mock("@/components/ConversionTracking", () => ({ trackPhoneCallClick: () => undefined }));

const record = BAYSIDE_SOUTHEAST_BY_SLUG.wynnum;

describe("Bayside Southeast raw/SPA content presenter", () => {
  it("creates matching metadata, one meaningful H1, visible FAQs and schema from the typed registry", () => {
    const metadata = getBaysideSoutheastMetadata(record);
    const html = renderBaysideSoutheastContentShell(record);
    const schema = getBaysideSoutheastStructuredData(record);

    expect(metadata).toEqual({
      title: record.title,
      description: record.description,
      canonical: "/areas/wynnum",
    });
    expect(html).toContain('data-edge-bayside-southeast-shell="true"');
    expect((html.match(/<h1(?:\s|>)/g) ?? [])).toHaveLength(1);
    expect(html).toContain(record.h1);
    expect(html).toContain(record.intro);
    expect(html).toContain('href="/get-quote?context=bayside-wynnum-general"');
    expect(html).toContain('href="/get-quote?context=bayside-wynnum-homeowner"');
    expect(html).toContain('href="/get-quote?context=bayside-wynnum-builder"');
    for (const faq of record.faqs) {
      expect(html).toContain(faq.question);
      expect(html).toContain(faq.answer);
    }
    expect(schema).toHaveLength(3);
    expect(schema.map(item => item["@type"])).toEqual(["BreadcrumbList", "Service", "FAQPage"]);
    expect(schema[2].mainEntity.map((faq: { name: string }) => faq.name)).toEqual(record.faqs.map(faq => faq.question));
  });

  it("renders the approved candidate content with one main/H1 and the three allowlisted quote choices", () => {
    vi.stubGlobal("location", { pathname: "/areas/wynnum", search: "", hash: "" });
    const html = renderToStaticMarkup(createElement(BaysideSoutheastLocalJobsPage, { record }));

    expect((html.match(/<main(?:\s|>)/g) ?? [])).toHaveLength(1);
    expect((html.match(/<h1(?:\s|>)/g) ?? [])).toHaveLength(1);
    expect(html).toContain(record.h1);
    expect(html).toContain('href="/get-quote?context=bayside-wynnum-general"');
    expect(html).toContain('href="/get-quote?context=bayside-wynnum-homeowner"');
    expect(html).toContain('href="/get-quote?context=bayside-wynnum-builder"');
    expect(html).toContain("I am a homeowner or property owner");
    expect(html).toContain("I am a builder or developer");

    for (const service of record.services) {
      expect(html).toContain(`href="/services/${service.slug}"`);
      expect(html).toContain(service.name);
    }
    for (const nearbySlug of record.nearbyLocalitySlugs) {
      expect(html).toContain(`href="/areas/${nearbySlug}"`);
    }

    expect(html).not.toMatch(/testimonial|review score|\$\s?\d/i);
  });
});
