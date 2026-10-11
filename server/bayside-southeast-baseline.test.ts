import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import type { Root } from "react-dom/client";

const testState = vi.hoisted(() => ({
  mutation: {
    mutate: vi.fn(),
    isPending: false,
  },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    quote: {
      submit: {
        useMutation: () => testState.mutation,
      },
    },
  },
}));

vi.mock("@/lib/formFallback", () => ({
  submitFormFallback: vi.fn(),
}));

vi.mock("@/hooks/useLeadSource", () => ({
  useLeadSource: () => ({
    leadSource: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    gclid: "",
    fbclid: "",
    referrer: "",
    landingPage: "/get-quote",
  }),
}));

vi.mock("@/components/ConversionTracking", () => ({
  trackPhoneCallClick: vi.fn(),
  trackQuoteConversion: vi.fn(),
  trackRemarketingEvent: vi.fn(),
}));

vi.mock("@/lib/quoteFunnelAnalytics", () => ({
  createQuoteFunnelTracker: () => ({
    pageView: vi.fn(),
    stepReached: vi.fn(),
    validationBlocked: vi.fn(),
    submitStarted: vi.fn(),
    submitConfirmed: vi.fn(),
    submitFailed: vi.fn(),
  }),
  deriveQuoteTrafficClass: () => "direct",
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("framer-motion", async () => {
  const react = await import("react");
  const motion = new Proxy({}, {
    get: (_target, tag: string) => ({ children, ...props }: Record<string, unknown>) => {
      for (const key of ["initial", "animate", "exit", "transition"]) delete props[key];
      return react.createElement(tag, props, children as React.ReactNode);
    },
  });
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => react.createElement(react.Fragment, null, children),
    motion,
    useReducedMotion: () => true,
  };
});

vi.mock("@/components/quote/QuoteSuccessBooking", () => ({ default: () => null }));
vi.mock("@/components/quote/QuoteSuccessShare", () => ({ default: () => null }));
vi.mock("@/generated/baysideSoutheastConfig", () => ({
  BAYSIDE_SOUTHEAST_PREVIEW_ENABLED: true,
  BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED: false,
}));
vi.mock("@/components/Navbar", () => ({ default: () => React.createElement("div", { "data-testid": "customer-navbar" }) }));
vi.mock("@/components/SEOHead", () => ({ default: () => null }));
vi.mock("@/lib/baysideSoutheastQuoteHandoff", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/baysideSoutheastQuoteHandoff")>()),
  consumeBaysideSoutheastQuoteContext: vi.fn(),
}));

let dom: JSDOM;
let root: Root;
let container: HTMLDivElement;
let createRoot: typeof import("react-dom/client").createRoot;
let ComprehensiveQuoteWizard: typeof import("../client/src/components/quote/ComprehensiveQuoteWizard").default;
let GetQuote: typeof import("../client/src/pages/GetQuote").default;

function button(label: string) {
  const match = Array.from(container.querySelectorAll("button")).find((item) => item.textContent?.replace(/\s+/g, " ").includes(label));
  if (!match) throw new Error(`Expected button containing ${label}`);
  return match as HTMLButtonElement;
}

async function click(element: Element) {
  await act(async () => {
    element.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  });
}

async function change(selector: string, value: string | boolean) {
  const element = container.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | null;
  if (!element) throw new Error(`Expected ${selector}`);
  await act(async () => {
    if (typeof value === "boolean") {
      if (element.checked !== value) element.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    } else {
      const setter = Object.getOwnPropertyDescriptor(
        element instanceof window.HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : element instanceof window.HTMLSelectElement
            ? window.HTMLSelectElement.prototype
            : window.HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(element, value);
      element.dispatchEvent(new window.Event("input", { bubbles: true }));
      element.dispatchEvent(new window.Event("change", { bubbles: true }));
    }
  });
}

async function renderWizard(props: Record<string, unknown> = {}) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(ComprehensiveQuoteWizard, props));
  });
}

function usePreviewHost() {
  dom.reconfigure({ url: "https://review.example/get-quote" });
}

async function completeBaselineQuote() {
  await change("#quote-name", "Jordan Client");
  await change("#quote-mobile", "0424 001 122");
  await change("#quote-email", "jordan@example.com");
  await click(button("Save & continue"));

  await change("#quote-suburb", "Camp Hill");
  await change("#quote-postcode", "4152");
  await click(button("Save & continue"));

  await click(button("Driveway"));
  await change("#quote-description", "Replace the existing driveway with exposed aggregate concrete.");
  await click(button("Save & continue"));

  await click(button("Save & continue"));
  await change("#quote-contact-consent", true);
  const privacy = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))
    .find((input) => input !== container.querySelector("#quote-contact-consent"));
  if (!privacy) throw new Error("Expected privacy consent input");
  await act(async () => {
    privacy.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  });
  await click(button("Submit quote request"));
}

beforeEach(async () => {
  testState.mutation.mutate.mockReset();
  testState.mutation.isPending = false;
  dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://concreteconceptsgroup.com/get-quote" });
  vi.stubGlobal("window", dom.window);
  vi.stubGlobal("document", dom.window.document);
  vi.stubGlobal("navigator", dom.window.navigator);
  vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
  vi.stubGlobal("HTMLInputElement", dom.window.HTMLInputElement);
  vi.stubGlobal("HTMLTextAreaElement", dom.window.HTMLTextAreaElement);
  vi.stubGlobal("HTMLSelectElement", dom.window.HTMLSelectElement);
  vi.stubGlobal("Event", dom.window.Event);
  vi.stubGlobal("MouseEvent", dom.window.MouseEvent);
  vi.stubGlobal("File", dom.window.File);
  vi.stubGlobal("URL", dom.window.URL);
  vi.stubGlobal("crypto", { randomUUID: () => "quote-test-id" });
  Object.defineProperty(window, "scrollTo", { value: vi.fn(), configurable: true });
  Object.defineProperty(window, "requestAnimationFrame", { value: (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0), configurable: true });
  Object.defineProperty(window, "cancelAnimationFrame", { value: window.clearTimeout.bind(window), configurable: true });
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  window.localStorage.clear();
  ({ createRoot } = await import("react-dom/client"));
  ({ default: ComprehensiveQuoteWizard } = await import("../client/src/components/quote/ComprehensiveQuoteWizard"));
  ({ default: GetQuote } = await import("../client/src/pages/GetQuote"));
});

afterEach(async () => {
  if (root) {
    await act(async () => root.unmount());
  }
  dom?.window.close();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("Bayside/Southeast default-off customer quote baseline", () => {
  it("renders the deployed five-step customer flow without candidate audience controls", async () => {
    await renderWizard();
    expect(container.querySelectorAll('[aria-label^="Step "]')).toHaveLength(5);

    await change("#quote-name", "Jordan Client");
    await change("#quote-mobile", "0424 001 122");
    await change("#quote-email", "jordan@example.com");
    await click(button("Save & continue"));
    await change("#quote-suburb", "Camp Hill");
    await change("#quote-postcode", "4152");
    await click(button("Save & continue"));

    expect(container.textContent).not.toContain("Who is this enquiry for?");
    expect(container.textContent).not.toContain("Homeowner project type");
    expect(container.textContent).not.toContain("Builder, developer or construction company");
    expect(container.textContent).not.toContain("Structural documents and readiness");
  });

  it("does not trust a candidate prop on the default customer host", async () => {
    await renderWizard({
      candidateHandoff: {
        candidateAccess: true,
        data: {
          name: "Untrusted Candidate",
          suburb: "Wynnum",
          postcode: "4178",
          audienceType: "builder_developer",
          structuralProjectType: "new_house",
          landingRoute: "/areas/wynnum",
          region: "Brisbane",
        },
      },
    });

    expect((container.querySelector("#quote-name") as HTMLInputElement).value).toBe("");
    await change("#quote-name", "Jordan Client");
    await change("#quote-mobile", "0424 001 122");
    await change("#quote-email", "jordan@example.com");
    await click(button("Save & continue"));
    await change("#quote-suburb", "Camp Hill");
    await change("#quote-postcode", "4152");
    await click(button("Save & continue"));

    expect(container.textContent).not.toContain("Who is this enquiry for?");
    expect(container.querySelector("#quote-builder-company")).toBeNull();
  });

  it("uses the factual candidate quote shell without inherited licence or free-quote claims", async () => {
    const handoff = await import("@/lib/baysideSoutheastQuoteHandoff");
    vi.mocked(handoff.consumeBaysideSoutheastQuoteContext).mockReturnValue({
      candidateAccess: true,
      data: { suburb: "Wynnum", landingRoute: "/areas/wynnum", region: "Brisbane", audienceType: "homeowner" },
    });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root.render(React.createElement(GetQuote));
    });

    expect(container.querySelector("[data-testid='customer-navbar']")).toBeNull();
    expect(container.textContent).toContain("Share your concrete project details");
    expect(container.textContent).not.toContain("QBCC");
    expect(container.textContent).not.toContain("Free Quote");
  });

  it("submits the same valid baseline brief without candidate projectContext", async () => {
    await renderWizard();
    await completeBaselineQuote();

    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(testState.mutation.mutate).toHaveBeenCalledTimes(1);
    const submitted = testState.mutation.mutate.mock.calls[0][0];
    expect(submitted.jobBrief).toMatchObject({
      version: 1,
      contact: { name: "Jordan Client", mobile: "0424 001 122", email: "jordan@example.com" },
      location: { suburb: "Camp Hill", postcode: "4152" },
      scope: { services: ["driveway"] },
    });
    expect(submitted.jobBrief.projectContext).toBeUndefined();
    expect(submitted).not.toHaveProperty("projectContext");
  });

  it("renders validated candidate builder controls without structural documents for non-structural concrete", async () => {
    usePreviewHost();
    await renderWizard({
      candidateHandoff: {
        candidateAccess: true,
        data: {
          name: "Builder Contact",
          mobile: "0424 001 122",
          email: "builder@example.com",
          suburb: "Wynnum",
          postcode: "4178",
          audienceType: "builder_developer",
          structuralProjectType: "other_concrete",
          services: [],
          landingRoute: "/areas/wynnum",
          region: "Brisbane",
        },
      },
    });
    await click(button("Save & continue"));
    await change("#quote-street-address", "10 Example Street");
    await click(button("Save & continue"));

    expect(container.textContent).toContain("Builder, developer or construction company");
    expect(container.querySelector("#quote-builder-company")).not.toBeNull();
    expect(container.querySelector("#quote-builder-scope")).not.toBeNull();
    expect(container.querySelector("#quote-structural-project")).not.toBeNull();

    await change("#quote-builder-company", "Example Build Co");
    await change("#quote-builder-scope", "Commercial patio and driveway concrete package");
    await click(button("Driveway"));
    await change("#quote-description", "A non-structural concrete package for a staged builder project.");
    await click(button("Save & continue"));

    expect(container.querySelector("#quote-builder-programme")).not.toBeNull();
    expect(container.textContent).not.toContain("Structural documents and readiness");
  });

  it("shows document readiness only after a candidate homeowner selects a structural project type", async () => {
    usePreviewHost();
    await renderWizard({
      candidateHandoff: {
        candidateAccess: true,
        data: {
          name: "Homeowner Contact",
          mobile: "0424 001 122",
          email: "owner@example.com",
          suburb: "Manly",
          postcode: "4179",
          audienceType: "homeowner",
          structuralProjectType: "other_concrete",
          services: [],
          landingRoute: "/areas/manly",
          region: "Brisbane",
        },
      },
    });
    await click(button("Save & continue"));
    await click(button("Save & continue"));

    expect(container.querySelector("#quote-structural-project")).not.toBeNull();
    await change("#quote-structural-project", "new_house");
    await click(button("Driveway"));
    await change("#quote-description", "A concrete scope with structural documents still being prepared.");
    await click(button("Save & continue"));

    expect(container.textContent).toContain("Structural documents and readiness");
  });

  it("switches only the project suburb and announces the preserved-data result", async () => {
    usePreviewHost();
    await renderWizard({
      candidateHandoff: {
        candidateAccess: true,
        conflict: { currentSuburb: "Carindale", incomingSuburb: "Manly" },
        data: {
          name: "Jordan Client",
          mobile: "0424 001 122",
          email: "jordan@example.com",
          streetAddress: "22 Customer Road",
          suburb: "Carindale",
          postcode: "4152",
          services: ["patio"],
          description: "Keep the detailed patio scope and customer project notes.",
          audienceType: "homeowner",
          structuralProjectType: "other_concrete",
          landingRoute: "/areas/manly",
          region: "Brisbane",
        },
      },
    });

    expect(container.textContent).toContain("saved project suburb is Carindale");
    await click(button("Use Manly instead"));
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 0)); });
    expect(document.activeElement).toBe(container.querySelector("#quote-locality-resolution"));
    expect(container.querySelector("#quote-locality-resolution")?.textContent).toContain("postcode, address, services and contact details are unchanged");

    await click(button("Save & continue"));
    expect((container.querySelector("#quote-street-address") as HTMLInputElement).value).toBe("22 Customer Road");
    expect((container.querySelector("#quote-suburb") as HTMLInputElement).value).toBe("Manly");
    expect((container.querySelector("#quote-postcode") as HTMLInputElement).value).toBe("4152");
    await click(button("Save & continue"));
    expect(button("Patio / entertaining").getAttribute("aria-pressed")).toBe("true");
  });
});
