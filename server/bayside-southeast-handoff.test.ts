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

const previewFlags = { preview: true, published: false };

describe("Bayside Southeast browser quote handoff", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearQuoteDraft();
  });

  it("consumes a raw bootstrap token exactly once on an allowed normalized preview host", () => {
    const contextWindow = {
      __CCG_QUOTE_CONTEXT_TOKEN: "bayside-wynnum-builder",
      location: { hostname: "Review.Example." },
    };
    const save = vi.fn();

    const result = consumeBaysideSoutheastQuoteContext({
      window: contextWindow,
      load: () => ({ name: "Jordan", services: ["driveway"], suburb: "" }),
      save,
      flags: previewFlags,
    });

    expect(result).toMatchObject({
      candidateAccess: true,
      data: {
        name: "Jordan",
        suburb: "Wynnum",
        services: ["driveway"],
        audienceType: "builder_developer",
        structuralProjectType: "other_concrete",
        landingRoute: "/areas/wynnum",
      },
    });
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ suburb: "Wynnum", services: ["driveway"] }));
    expect(contextWindow.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
    expect(consumeBaysideSoutheastQuoteContext({ window: contextWindow, flags: previewFlags })).toBeUndefined();
  });

  it("does not grant a candidate context to a customer host before publication and retains no draft mutation", () => {
    const contextWindow = {
      __CCG_QUOTE_CONTEXT_TOKEN: "bayside-wynnum-homeowner",
      location: { hostname: "WWW.ConcreteConceptsGroup.com." },
    };
    const save = vi.fn();

    expect(consumeBaysideSoutheastQuoteContext({ window: contextWindow, save, flags: previewFlags })).toBeUndefined();
    expect(save).not.toHaveBeenCalled();
    expect(contextWindow.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
  });

  it("keeps a locality conflict in the returned in-memory result if storage fails and strips context from SPA navigation", () => {
    const navigate = vi.fn();
    const result = handoffBaysideSoutheastQuote("bayside-manly-general", {
      hostname: "review.example",
      flags: previewFlags,
      load: () => ({ suburb: "Carindale", postcode: "4152", services: ["patio"], description: "Keep customer details." }),
      save: () => { throw new Error("storage unavailable"); },
      navigate,
      search: "?utm_source=google&context=old&gclid=abc",
      hash: "#quote",
    });

    expect(result?.conflict).toEqual({ currentSuburb: "Carindale", incomingSuburb: "Manly" });
    expect(result?.data).toMatchObject({ suburb: "Carindale", postcode: "4152", services: ["patio"], audienceType: "homeowner" });
    expect(navigate).toHaveBeenCalledWith("/get-quote?utm_source=google&gclid=abc#quote");
  });

  it("allows a saved candidate shell only for an approved route and currently allowed host/flag policy", () => {
    const draft = { region: "Brisbane", landingRoute: "/areas/mansfield", audienceType: "homeowner" as const };
    expect(isBaysideSoutheastCandidateQuoteAccess(draft, "review.example", previewFlags)).toBe(true);
    expect(isBaysideSoutheastCandidateQuoteAccess(draft, "concreteconceptsgroup.com", previewFlags)).toBe(false);
    expect(isBaysideSoutheastCandidateQuoteAccess({ ...draft, landingRoute: "/areas/unknown" }, "review.example", previewFlags)).toBe(false);
  });

  it("uses a current-document in-memory fallback when browser storage is denied or corrupt", () => {
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
