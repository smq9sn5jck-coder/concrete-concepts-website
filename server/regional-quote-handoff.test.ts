import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { handoffRegionalSlabQuote } from "../client/src/lib/regionalSlabQuoteHandoff";
import { applyQuoteDraftUpdate } from "../client/src/lib/quoteDraft";

const ROOT = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(ROOT, path), "utf8");

describe("regional slab quote handoff", () => {
  it("merges regional and structural prefills into local draft only before navigation", () => {
    const save = vi.fn();
    const navigate = vi.fn();
    const request = vi.fn();
    handoffRegionalSlabQuote(
      { service: "slab", region: "Ipswich / Ripley", structuralProjectType: "new_house", landingRoute: "/areas/ipswich-ripley-house-slabs" },
      {
        load: () => ({ name: "Existing Client", services: ["excavation"], description: "Keep this draft text." }),
        save,
        navigate,
      },
    );
    expect(save).toHaveBeenCalledWith(expect.objectContaining({
      name: "Existing Client",
      services: ["excavation", "slab"],
      region: "Ipswich / Ripley",
      structuralProjectType: "new_house",
      landingRoute: "/areas/ipswich-ripley-house-slabs",
    }));
    expect(navigate).toHaveBeenCalledWith("/get-quote");
    expect(request).not.toHaveBeenCalled();
  });

  it("keeps exactly five progress steps and conditional homeowner and builder questions", () => {
    const wizard = read("client/src/components/quote/ComprehensiveQuoteWizard.tsx");
    expect(wizard).toContain('const STEPS = [');
    expect(wizard.match(/title: "/g)).toHaveLength(5);
    expect(wizard).toContain('data.audienceType === "builder_developer"');
    expect(wizard).toContain('data.audienceType === "homeowner"');
    expect(wizard).toContain("Builder, developer or construction company");
    expect(wizard).toContain("Homeowner or property owner");
    expect(wizard).toContain("Company name *");
    expect(wizard).toContain("New house");
    expect(wizard).toContain("Under-house / build-under");
  });

  it("shows unchecked partner interest only for relevant complete extensions and routes partner-only work separately", () => {
    const wizard = read("client/src/components/quote/ComprehensiveQuoteWizard.tsx");
    const draft = read("client/src/lib/quoteDraft.ts");
    expect(draft).toContain("partnerIntroductionInterest?: boolean");
    expect(wizard).toContain("partnerIntroductionInterest: false");
    expect(wizard).toContain('data.structuralProjectType === "complete_extension"');
    expect(wizard).toContain("I would like CCG to introduce me to a reviewed partner for non-concrete extension work.");
    expect(wizard).toContain('href="/need-another-trade"');
    expect(wizard).toContain("CCG reviews this request first");
    expect(wizard).not.toMatch(/partnerIntroductionInterest[\s\S]{0,500}(fetch\(|submitFormFallback|submitQuote\.mutate)/);
  });

  it("clears stale partner interest when scope changes away from a complete extension with slab", () => {
    const completeExtension = {
      structuralProjectType: "complete_extension" as const,
      services: ["slab"],
      partnerIntroductionInterest: true,
    };
    expect(applyQuoteDraftUpdate(completeExtension, "structuralProjectType", "new_house").partnerIntroductionInterest).toBe(false);
    expect(applyQuoteDraftUpdate(completeExtension, "services", ["driveway"]).partnerIntroductionInterest).toBe(false);
  });

  it("uses stateful semantics for progress, single-choice and multi-choice button groups", () => {
    const wizard = read("client/src/components/quote/ComprehensiveQuoteWizard.tsx");
    expect(wizard).toContain('aria-current={active ? "step" : undefined}');
    expect(wizard.match(/aria-pressed=/g)?.length).toBeGreaterThanOrEqual(4);
    expect(wizard).toContain('role="alert"');
    expect(wizard).toContain('aria-live="polite"');
    expect(wizard).toContain("previousStepRef.current === step");
    expect(wizard).toContain("stepHeadingRef.current?.focus()");
    expect(wizard).toContain("pendingStepFocusRef.current = true");
    expect(wizard).toContain("onExitComplete={focusCurrentStepHeading}");
    expect(wizard.match(/ref=\{stepHeadingRef\} tabIndex=\{-1\}/g)).toHaveLength(5);
  });

  it("preserves measurements, access, photos, endpoints, and success-only conversion tracking", () => {
    const wizard = read("client/src/components/quote/ComprehensiveQuoteWizard.tsx");
    for (const marker of ["measurementMode", "accessWidthM", "pumpAccess", "uploadPhoto", "photos:", "submitQuote.mutate", "submitFormFallback"]) {
      expect(wizard).toContain(marker);
    }
    expect(wizard.match(/trackQuoteConversion\(/g)).toHaveLength(2);
    expect(wizard).toMatch(/onSuccess:[\s\S]{0,700}trackQuoteConversion/);
    expect(wizard).toMatch(/result\.success[\s\S]{0,700}trackQuoteConversion/);
    expect(read("client/src/pages/NeedAnotherTradePage.tsx")).not.toContain("trackQuoteConversion");
  });
});
