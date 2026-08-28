import { describe, it, expect } from "vitest";
import { FINISH_TYPES, FINISH_PROMPTS } from "./visualiser";

describe("Visualiser V3 — FINISH_TYPES", () => {
  it("exports all 8 finish types", () => {
    expect(Object.keys(FINISH_TYPES)).toHaveLength(8);
  });

  it("includes all required finishes", () => {
    const expected = [
      "exposed-aggregate",
      "broom-finish",
      "plain",
      "charcoal-oxide",
      "cove-finish",
      "honed",
      "saw-cut",
      "border-colour",
    ];
    for (const key of expected) {
      expect(FINISH_TYPES[key]).toBeDefined();
      expect(FINISH_TYPES[key].name).toBeTruthy();
      expect(FINISH_TYPES[key].prompt).toBeTruthy();
      expect(FINISH_TYPES[key].negative).toBeTruthy();
    }
  });

  it("each finish has a non-empty prompt and negative", () => {
    for (const [key, val] of Object.entries(FINISH_TYPES)) {
      expect(val.prompt.length).toBeGreaterThan(20);
      expect(val.negative.length).toBeGreaterThan(5);
    }
  });

  it("FINISH_PROMPTS is an alias for FINISH_TYPES (backward compat)", () => {
    expect(FINISH_PROMPTS).toBe(FINISH_TYPES);
  });
});
