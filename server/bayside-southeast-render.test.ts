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

vi.mock("@/components/SEOHead", () => ({ default: () => null }));
vi.mock("@/components/ConversionTracking", () => ({ trackPhoneCallClick: () => undefined }));
vi.mock("@/lib/baysideSoutheastQuoteHandoff", () => ({ handoffBaysideSoutheastQuote: () => undefined }));

const record = BAYSIDE_SOUTHEAST_BY_SLUG.wynnum;

describe("Bayside Southeast raw/SPA content presenter", () => {
  it("creates matching metadata, one meaningful H1, visible FAQs and three non-duplicated schema records", () => {
    const metadata = getBaysideSoutheastMetadata(record);
    const html = renderBaysideSoutheastContentShell(record);
    const schema = getBaysideSoutheastStructuredData(record);

    expect(metadata).toEqual({ title: record.title, description: record.description, canonical: "/areas/wynnum" });
    expect(html).toContain('data-edge-bayside-southeast-shell="true"');
    expect((html.match(/<h1(?:\s|>)/g) ?? [])).toHaveLength(1);
    expect(html).toContain(record.h1);
    expect(html).toContain('href="/get-quote?context=bayside-wynnum-general"');
    expect(html).toContain('href="/get-quote?context=bayside-wynnum-homeowner"');
    expect(html).toContain('href="/get-quote?context=bayside-wynnum-builder"');
    expect(schema.map(item => item["@type"])).toEqual(["BreadcrumbList", "Service", "FAQPage"]);
    expect(schema.filter(item => item["@type"] === "BreadcrumbList")).toHaveLength(1);
  });

  it("renders the approved candidate with one main/H1 and only the allowlisted quote choices", () => {
    vi.stubGlobal("location", { pathname: "/areas/wynnum", search: "", hash: "" });
    const html = renderToStaticMarkup(createElement(BaysideSoutheastLocalJobsPage, { record }));

    expect((html.match(/<main(?:\s|>)/g) ?? [])).toHaveLength(1);
    expect((html.match(/<h1(?:\s|>)/g) ?? [])).toHaveLength(1);
    expect(html).toContain(record.h1);
    expect(html).toContain("I am a homeowner or property owner");
    expect(html).toContain("I am a builder or developer");
    expect(html).not.toMatch(/QBCC|licen[cs]e|insured|free quote|testimonial|review score|\$\s?\d/i);
    expect(html).not.toContain('href="/areas/caboolture"');
  });
});
