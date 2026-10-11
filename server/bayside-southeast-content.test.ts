import { describe, expect, it } from "vitest";
import {
  BAYSIDE_SOUTHEAST_BY_SLUG,
  BAYSIDE_SOUTHEAST_LOCALITIES,
  BAYSIDE_SOUTHEAST_QUOTE_CONTEXT_TOKENS,
  BAYSIDE_SOUTHEAST_ROUTES,
  BAYSIDE_SOUTHEAST_SERVICE_SCOPE_SUMMARY,
  BAYSIDE_SOUTHEAST_SIMILARITY_CORPUS_VERSION,
  getBaysideSoutheastSimilarityScore,
  normaliseBaysideSoutheastProse,
} from "../shared/baysideSoutheastLocalJobsContent";

const APPROVED_SLUGS = ["wynnum", "manly", "cannon-hill", "mount-gravatt", "mansfield"];
const PROHIBITED_CLAIMS = /\$\s?\d|guarantee|guaranteed|review score|testimonial|projects completed|licen[cs]ed|fully insured|free quote|within \d|Marcus/i;

describe("Bayside Southeast typed locality content", () => {
  it("contains exactly the five approved existing locality paths and all 15 enumerated quote tokens", () => {
    expect(BAYSIDE_SOUTHEAST_LOCALITIES.map(record => record.slug)).toEqual(APPROVED_SLUGS);
    expect(BAYSIDE_SOUTHEAST_ROUTES).toEqual(APPROVED_SLUGS.map(slug => `/areas/${slug}`));
    expect(Object.keys(BAYSIDE_SOUTHEAST_BY_SLUG)).toEqual(APPROVED_SLUGS);
    expect(BAYSIDE_SOUTHEAST_QUOTE_CONTEXT_TOKENS).toEqual(
      APPROVED_SLUGS.flatMap(slug => [
        `bayside-${slug}-general`,
        `bayside-${slug}-homeowner`,
        `bayside-${slug}-builder`,
      ]),
    );
  });

  it("keeps each candidate useful, truthful, and explicitly scoped to existing concrete work", () => {
    const uniqueFields = ["title", "description", "h1", "intro"] as const;
    for (const field of uniqueFields) {
      expect(new Set(BAYSIDE_SOUTHEAST_LOCALITIES.map(record => record[field])).size).toBe(5);
    }

    for (const record of BAYSIDE_SOUTHEAST_LOCALITIES) {
      expect(record.practicalSections).toHaveLength(2);
      expect(record.practicalSections.every(section => section.heading.length >= 8 && section.body.length >= 95)).toBe(true);
      expect(record.faqs).toHaveLength(3);
      expect(record.faqs.every(faq => faq.question.length >= 12 && faq.answer.length >= 45)).toBe(true);
      expect(record.nearbyLocalitySlugs.length).toBeGreaterThanOrEqual(3);
      expect(record.nearbyLocalitySlugs.length).toBeLessThanOrEqual(5);
      expect(record.services.length).toBeGreaterThanOrEqual(5);
      expect(record.services.some(service => service.slug === "retaining-walls-brisbane")).toBe(true);
      expect(JSON.stringify(record)).not.toMatch(PROHIBITED_CLAIMS);
    }
  });

  it("states the approved wider concrete scope without adding price, proof, office, or availability claims", () => {
    expect(BAYSIDE_SOUTHEAST_SERVICE_SCOPE_SUMMARY).toMatch(/paths/i);
    expect(BAYSIDE_SOUTHEAST_SERVICE_SCOPE_SUMMARY).toMatch(/footings/i);
    expect(BAYSIDE_SOUTHEAST_SERVICE_SCOPE_SUMMARY).toMatch(/steps/i);
    expect(BAYSIDE_SOUTHEAST_SERVICE_SCOPE_SUMMARY).toMatch(/commercial/i);
    expect(BAYSIDE_SOUTHEAST_SERVICE_SCOPE_SUMMARY).not.toMatch(PROHIBITED_CLAIMS);
  });

  it("uses the specified NFKC candidate/nearby-name normalisation and keeps all ten five-word-shingle pairs below 0.45", () => {
    expect(BAYSIDE_SOUTHEAST_SIMILARITY_CORPUS_VERSION).toBe("bayside-southeast-v1");
    expect(normaliseBaysideSoutheastProse("Wynnum — practical, concrete planning.")).toBe("practical concrete planning");

    const scores: number[] = [];
    for (let leftIndex = 0; leftIndex < BAYSIDE_SOUTHEAST_LOCALITIES.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < BAYSIDE_SOUTHEAST_LOCALITIES.length; rightIndex += 1) {
        const left = BAYSIDE_SOUTHEAST_LOCALITIES[leftIndex];
        const right = BAYSIDE_SOUTHEAST_LOCALITIES[rightIndex];
        scores.push(getBaysideSoutheastSimilarityScore(left, right));
      }
    }

    expect(scores).toHaveLength(10);
    expect(Math.max(...scores)).toBeLessThan(0.45);
  });
});
