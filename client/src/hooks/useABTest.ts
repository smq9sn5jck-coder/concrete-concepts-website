import { useMemo } from "react";

/**
 * Lightweight A/B testing hook.
 * Assigns visitors to variant "A" or "B" per test, persisted in localStorage.
 * Returns the variant and a helper to get the winning copy.
 */
export function useABTest(testId: string): "A" | "B" {
  return useMemo(() => {
    const key = `ab_${testId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored === "A" || stored === "B") return stored;
      const variant: "A" | "B" = Math.random() < 0.5 ? "A" : "B";
      localStorage.setItem(key, variant);
      return variant;
    } catch {
      // SSR or localStorage unavailable — default to A
      return "A" as const;
    }
  }, [testId]);
}

/**
 * A/B test variations for the original 5 Google Ads landing pages.
 * Each has two headline variants and two CTA button text variants.
 */
export interface ABVariant {
  headline: string;
  ctaText: string;
  formTitle: string;
}

export const LANDING_AB_TESTS: Record<string, { A: ABVariant; B: ABVariant }> = {
  "concrete-driveways": {
    A: {
      headline: "New Concrete Driveway in Brisbane — From $75/m²",
      ctaText: "Get My Free Quote →",
      formTitle: "Get Your Free Quote",
    },
    B: {
      headline: "Brisbane Driveway Specialists — Save Up to 20% This Month",
      ctaText: "Claim My Free Quote Today →",
      formTitle: "Claim Your Free Quote — Limited Spots",
    },
  },
  "concrete-slabs": {
    A: {
      headline: "Concrete Slabs in Brisbane — Poured Right, First Time",
      ctaText: "Get My Free Quote →",
      formTitle: "Get Your Free Quote",
    },
    B: {
      headline: "Need a Concrete Slab? Brisbane's #1 Rated Team — From $65/m²",
      ctaText: "Get My Slab Quote Now →",
      formTitle: "Your Free Slab Quote — 24hr Response",
    },
  },
  "retaining-walls": {
    A: {
      headline: "Retaining Walls in Brisbane — Engineered to Last",
      ctaText: "Get My Free Quote →",
      formTitle: "Get Your Free Quote",
    },
    B: {
      headline: "Stop Your Slope From Sliding — Brisbane Retaining Wall Experts",
      ctaText: "Get My Wall Quote Free →",
      formTitle: "Free Retaining Wall Assessment",
    },
  },
  "exposed-aggregate": {
    A: {
      headline: "Exposed Aggregate Concrete in Brisbane — From $90/m²",
      ctaText: "Get My Free Quote →",
      formTitle: "Get Your Free Quote",
    },
    B: {
      headline: "Stunning Exposed Aggregate — Brisbane's Most Trusted Concreters",
      ctaText: "See My Price — Free Quote →",
      formTitle: "Get Your Price — No Obligation",
    },
  },
  "concrete-patios": {
    A: {
      headline: "Concrete Patios & Outdoor Areas — Built for Brisbane Living",
      ctaText: "Get My Free Quote →",
      formTitle: "Get Your Free Quote",
    },
    B: {
      headline: "Transform Your Backyard — Brisbane Patio Specialists From $80/m²",
      ctaText: "Start My Patio Quote →",
      formTitle: "Your Free Patio Quote — Respond in 24hrs",
    },
  },
};
