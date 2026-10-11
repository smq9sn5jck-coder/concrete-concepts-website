import { afterEach, describe, expect, it, vi } from "vitest";
import {
  consumeBaysideSoutheastQuoteContext,
  handoffBaysideSoutheastQuote,
  isBaysideSoutheastCandidateQuoteAccess,
} from "../client/src/lib/baysideSoutheastQuoteHandoff";
import {
  clearQuoteDraft,
  loadQuoteDraft,
  saveQuoteDraft,
} from "../client/src/lib/quoteDraft";

const testState = vi.hoisted(() => ({
  wouterNavigate: vi.fn(),
}));

vi.mock("wouter/use-browser-location", () => ({
  navigate: testState.wouterNavigate,
}));

describe("Bayside/Southeast browser quote handoff", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    testState.wouterNavigate.mockReset();
    clearQuoteDraft();
  });

  const previewFlags = { preview: true, published: false };

  it("passes hydrated CTA context to the next quote mount exactly once without using the tracked URL", () => {
    const browser = { location: { hostname: "review.example", search: "", hash: "" } };
    vi.stubGlobal("window", browser);
    const draft = { suburb: "Carindale", services: ["patio"] as "patio"[] };
    handoffBaysideSoutheastQuote("bayside-manly-builder", { flags: previewFlags, load: () => draft, save: vi.fn(() => { throw Error("storage unavailable"); }) });
    const consumed = consumeBaysideSoutheastQuoteContext({ flags: previewFlags, load: () => draft, save: vi.fn() });
    expect(consumed?.candidateAccess).toBe(true);
    expect(consumed?.conflict).toEqual({ currentSuburb: "Carindale", incomingSuburb: "Manly" });
    expect(consumed?.data.services).toEqual(["patio"]);
    expect(consumeBaysideSoutheastQuoteContext({ flags: previewFlags })).toBeUndefined();
    expect(testState.wouterNavigate).toHaveBeenCalledWith("/get-quote");
  });

  it("consumes one exact bootstrap token only on an allowed preview host and preserves customer data", () => {
    const contextWindow = {
      __CCG_QUOTE_CONTEXT_TOKEN: "bayside-wynnum-builder",
      location: { hostname: "review.example" },
    };
    const save = vi.fn();
    const result = consumeBaysideSoutheastQuoteContext({
      window: contextWindow,
      load: () => ({ name: "Jordan Client", services: ["driveway"], description: "Keep the detailed driveway scope.", suburb: "" }),
      save,
      flags: previewFlags,
    });

    expect(result?.candidateAccess).toBe(true);
    expect(result?.data).toMatchObject({
      name: "Jordan Client",
      suburb: "Wynnum",
      services: ["driveway"],
      audienceType: "builder_developer",
      structuralProjectType: "other_concrete",
      landingRoute: "/areas/wynnum",
    });
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ suburb: "Wynnum", services: ["driveway"] }));
    expect(contextWindow.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
    expect(consumeBaysideSoutheastQuoteContext({ window: contextWindow, flags: previewFlags })).toBeUndefined();
  });

  it("denies a raw token on the default-off customer host without altering a draft", () => {
    const contextWindow = {
      __CCG_QUOTE_CONTEXT_TOKEN: "bayside-wynnum-homeowner",
      location: { hostname: "concreteconceptsgroup.com" },
    };
    const save = vi.fn();
    expect(consumeBaysideSoutheastQuoteContext({ window: contextWindow, save, flags: { preview: true, published: false } })).toBeUndefined();
    expect(save).not.toHaveBeenCalled();
    expect(contextWindow.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
  });

  it("keeps a conflicting locality until the customer chooses while SPA handoff navigates without context and retains campaign parameters", () => {
    const save = vi.fn();
    const navigate = vi.fn();
    const result = handoffBaysideSoutheastQuote("bayside-manly-general", {
      hostname: "review.example",
      flags: previewFlags,
      load: () => ({
        name: "Jordan Client",
        suburb: "Carindale",
        postcode: "4152",
        streetAddress: "22 Customer Road",
        services: ["patio"],
        description: "Preserve the patio scope and customer project notes.",
      }),
      save,
      navigate,
      search: "?utm_source=google&gclid=abc",
      hash: "#quote",
    });

    expect(result?.conflict).toEqual({ currentSuburb: "Carindale", incomingSuburb: "Manly" });
    expect(result?.data).toMatchObject({ suburb: "Carindale", postcode: "4152", services: ["patio"], audienceType: "homeowner" });
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ suburb: "Carindale", landingRoute: "/areas/manly" }));
    expect(navigate).toHaveBeenCalledWith("/get-quote?utm_source=google&gclid=abc#quote");
    expect(navigate.mock.calls[0][0]).not.toContain("context=");
  });

  it("uses Wouter SPA navigation by default so an in-memory handoff survives without a document reload", () => {
    const result = handoffBaysideSoutheastQuote("bayside-wynnum-homeowner", {
      hostname: "review.example",
      flags: previewFlags,
      load: () => ({ name: "Jordan Client", services: ["driveway"] }),
      save: vi.fn(),
      search: "?utm_source=google&gclid=abc",
      hash: "#quote",
    });

    expect(result?.data).toMatchObject({ name: "Jordan Client", suburb: "Wynnum", landingRoute: "/areas/wynnum" });
    expect(testState.wouterNavigate).toHaveBeenCalledWith("/get-quote?utm_source=google&gclid=abc#quote");
  });

  it("allows a stored candidate context only when its route, host, and feature state remain valid", () => {
    const draft = { region: "Brisbane", landingRoute: "/areas/mansfield", audienceType: "homeowner" as const };
    expect(isBaysideSoutheastCandidateQuoteAccess(draft, "review.example", previewFlags)).toBe(true);
    expect(isBaysideSoutheastCandidateQuoteAccess(draft, "concreteconceptsgroup.com", previewFlags)).toBe(false);
    expect(isBaysideSoutheastCandidateQuoteAccess({ ...draft, landingRoute: "/areas/not-approved" }, "review.example", previewFlags)).toBe(false);
  });

  it("uses a safe in-memory draft if browser storage throws, is corrupt, or expires", () => {
    const brokenStorage = {
      getItem: vi.fn(() => { throw new Error("storage blocked"); }),
      setItem: vi.fn(() => { throw new Error("storage blocked"); }),
      removeItem: vi.fn(() => { throw new Error("storage blocked"); }),
    };
    vi.stubGlobal("window", { localStorage: brokenStorage });

    saveQuoteDraft({ name: "Storage-safe customer", services: ["driveway"] });
    expect(loadQuoteDraft()).toMatchObject({ name: "Storage-safe customer", services: ["driveway"] });
    clearQuoteDraft();
    expect(loadQuoteDraft()).toBeNull();
  });
});
