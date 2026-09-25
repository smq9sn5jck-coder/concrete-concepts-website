import { describe, expect, it, vi } from "vitest";
import { handoffGoldCoastQuote } from "../client/src/lib/goldCoastQuoteHandoff";
import { comprehensiveQuoteSchema } from "../shared/quoteBrief";

describe("Gold Coast quote handoff", () => {
  it("preserves existing fields and adds only a supported service before opening the five-step quote", () => {
    const save = vi.fn();
    const navigate = vi.fn();
    const existing = {
      name: "Existing Client",
      mobile: "0424001122",
      email: "existing@example.com",
      suburb: "Coomera",
      postcode: "4209",
      services: ["patio"],
      description: "Keep every existing field in this draft.",
    };
    handoffGoldCoastQuote("driveway", { load: () => existing, save, navigate });
    expect(save).toHaveBeenCalledWith({ ...existing, services: ["patio", "driveway"] });
    expect(navigate).toHaveBeenCalledWith("/get-quote");
  });

  it("uses a service accepted by the unchanged comprehensive quote schema", () => {
    const parsed = comprehensiveQuoteSchema.safeParse({
      version: 1,
      contact: { name: "Test Client", mobile: "0424001122", email: "test@example.com", preferredContact: "sms", company: "" },
      location: { streetAddress: "", suburb: "Robina", postcode: "4226" },
      scope: { services: ["retaining-wall"], workType: "not_sure", finish: "not_sure", timeframe: "planning", description: "A residential retaining wall enquiry below one metre for initial screening." },
      measurements: { mode: "not_sure", separateAreaNotes: "" },
      siteConditions: { knownServices: "", specialRequirements: "" },
      photos: [],
      consents: { contact: true, privacy: true, marketing: false },
    });
    expect(parsed.success).toBe(true);
  });
});
