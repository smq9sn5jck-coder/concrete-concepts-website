// @vitest-environment jsdom
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { submitMutationSpy, consumeCandidateHandoffSpy, handoffCandidateSpy, setLocationSpy } = vi.hoisted(() => ({
  submitMutationSpy: vi.fn(),
  consumeCandidateHandoffSpy: vi.fn(),
  handoffCandidateSpy: vi.fn(),
  setLocationSpy: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { error: vi.fn(), info: vi.fn() } }));
vi.mock("../client/src/lib/trpc", () => ({
  trpc: { quote: { submit: { useMutation: () => ({ mutate: submitMutationSpy, isPending: false }) } } },
}));
vi.mock("../client/src/hooks/useLeadSource", () => ({
  useLeadSource: () => ({ leadSource: "", landingPage: "/get-quote" }),
}));
vi.mock("../client/src/lib/quoteFunnelAnalytics", () => ({
  createQuoteFunnelTracker: () => ({ pageView: vi.fn(), stepReached: vi.fn(), validationBlocked: vi.fn(), submitStarted: vi.fn(), submitConfirmed: vi.fn(), submitFailed: vi.fn() }),
  deriveQuoteTrafficClass: () => "direct",
}));
vi.mock("../client/src/components/ConversionTracking", () => ({
  trackPhoneCallClick: vi.fn(), trackQuoteConversion: vi.fn(), trackRemarketingEvent: vi.fn(),
}));
vi.mock("../client/src/lib/quoteDraft", () => ({
  clearQuoteDraft: vi.fn(),
  loadQuoteDraft: () => null,
  saveQuoteDraft: vi.fn(),
  applyQuoteDraftUpdate: (current: Record<string, unknown>, key: string, value: unknown) => {
    const next = { ...current, [key]: value };
    if (next.structuralProjectType !== "complete_extension" || !Array.isArray(next.services) || !next.services.includes("slab")) {
      next.partnerIntroductionInterest = false;
    }
    return next;
  },
}));
vi.mock("../client/src/components/quote/QuoteSuccessBooking", () => ({ default: () => null }));
vi.mock("../client/src/components/quote/QuoteSuccessShare", () => ({ default: () => null }));
vi.mock("../client/src/lib/baysideSoutheastQuoteHandoff", () => ({
  consumeBaysideSoutheastQuoteContext: consumeCandidateHandoffSpy,
  handoffBaysideSoutheastQuote: handoffCandidateSpy,
  isBaysideSoutheastCandidateQuoteAccess: () => true,
}));
vi.mock("../client/src/components/Navbar", () => ({ default: () => React.createElement("nav", { "data-testid": "navbar" }) }));
vi.mock("../client/src/components/SEOHead", () => ({ default: () => null }));
vi.mock("../client/src/components/BaysideSoutheastChrome", () => ({
  BaysideSoutheastHeader: () => React.createElement("header"),
  BaysideSoutheastFooter: () => React.createElement("footer"),
}));
vi.mock("wouter", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => React.createElement("a", { href, ...props }, children),
  useLocation: () => ["/areas/wynnum", setLocationSpy],
}));
vi.mock("framer-motion", () => {
  const passthrough = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & Record<string, unknown>>(
    ({ initial: _initial, animate: _animate, exit: _exit, transition: _transition, ...props }, ref) => React.createElement("div", { ref, ...props }),
  );
  return {
    AnimatePresence: ({ children, onExitComplete }: { children: React.ReactNode; onExitComplete?: () => void }) => {
      React.useEffect(() => { onExitComplete?.(); }, [children, onExitComplete]);
      return children;
    },
    motion: new Proxy({}, { get: () => passthrough }),
    useReducedMotion: () => true,
  };
});

import ComprehensiveQuoteWizard from "../client/src/components/quote/ComprehensiveQuoteWizard";
import GetQuote from "../client/src/pages/GetQuote";
import BaysideSoutheastLocalJobsPage from "../client/src/components/BaysideSoutheastLocalJobsPage";

const candidateData = {
  name: "Jordan Client",
  mobile: "0412 345 678",
  email: "jordan@example.com",
  streetAddress: "12 Actual Project Street",
  suburb: "Wynnum",
  postcode: "4178",
  services: [] as string[],
  description: "A detailed concrete scope for the candidate project.",
  audienceType: "homeowner" as const,
  structuralProjectType: "other_concrete" as const,
  region: "Brisbane",
  landingRoute: "/areas/wynnum",
  partnerIntroductionInterest: false,
};

type CandidateHandoff = { candidateAccess: true; data: typeof candidateData & Record<string, unknown>; conflict?: { currentSuburb: string; incomingSuburb: string } };

let container: HTMLDivElement;
let root: Root;

async function render(ui: React.ReactElement) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(ui));
}

function textButton(text: string) {
  const button = [...container.querySelectorAll<HTMLButtonElement>("button")].find((candidate) => candidate.textContent?.replace(/\s+/g, " ").includes(text));
  if (!button) throw new Error(`Button not found: ${text}`);
  return button;
}

async function click(text: string) {
  await act(async () => textButton(text).click());
}

async function setValue(id: string, value: string | boolean) {
  const element = container.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`);
  if (!element) throw new Error(`Field not found: ${id}`);
  await act(async () => {
    if (typeof value === "boolean") {
      const input = element as HTMLInputElement;
      if (input.checked !== value) input.click();
      return;
    }
    const prototype = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(element, value);
    element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? "change" : "input", { bubbles: true }));
  });
}

async function advanceToJobBrief() {
  await setValue("quote-name", "Jordan Client");
  await setValue("quote-mobile", "0412 345 678");
  await setValue("quote-email", "jordan@example.com");
  await click("Save & continue");
  await setValue("quote-suburb", "Wynnum");
  await setValue("quote-postcode", "4178");
  await click("Save & continue");
}

async function completeBaselineQuote() {
  await advanceToJobBrief();
  await click("Driveway");
  await setValue("quote-description", "Replace the existing driveway with exposed aggregate concrete.");
  await click("Save & continue");
  await click("Save & continue");
  await setValue("quote-contact-consent", true);
  const privacyConsent = [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
    .find((input) => input.parentElement?.textContent?.includes("acknowledge that my details"));
  if (!privacyConsent) throw new Error("Privacy consent field not found");
  await act(async () => privacyConsent.click());
  await click("Submit quote request");
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  submitMutationSpy.mockReset();
  consumeCandidateHandoffSpy.mockReset();
  handoffCandidateSpy.mockReset();
  setLocationSpy.mockReset();
  consumeCandidateHandoffSpy.mockReturnValue(undefined);
  window.localStorage.clear();
  window.scrollTo = vi.fn();
  Object.defineProperty(globalThis.crypto, "randomUUID", { configurable: true, value: () => "123e4567-e89b-42d3-a456-426614174000" });
  window.requestAnimationFrame = (callback) => window.setTimeout(() => callback(Date.now()), 0);
});

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
  vi.clearAllMocks();
});

describe("Bayside production candidate quote wizard", () => {
  it("keeps an ordinary no-context request on the unchanged baseline payload", async () => {
    await render(React.createElement(ComprehensiveQuoteWizard));

    expect(container.textContent).not.toContain("Who is this enquiry for?");
    await completeBaselineQuote();

    expect(submitMutationSpy).toHaveBeenCalledTimes(1);
    expect(submitMutationSpy.mock.calls[0][0].jobBrief.projectContext).toBeUndefined();
  });

  it("shows homeowner and builder candidate UI while retaining the explicit non-structural default", async () => {
    await render(React.createElement(ComprehensiveQuoteWizard, { candidateHandoff: { candidateAccess: true, data: candidateData } as CandidateHandoff }));
    await click("Save & continue");
    await click("Save & continue");

    expect(container.textContent).toContain("Who is this enquiry for?");
    expect((container.querySelector("#quote-structural-project") as HTMLSelectElement).value).toBe("other_concrete");
    expect(container.textContent).toContain("Homeowner project type");

    await click("Builder, developer or construction company");
    expect(container.textContent).toContain("Company name *");
    expect(container.textContent).toContain("Required concrete scope *");
    expect((container.querySelector("#quote-structural-project") as HTMLSelectElement).value).toBe("other_concrete");
  });

  it("requires the builder company, street address, concrete scope and programme for non-structural work", async () => {
    const builderHandoff: CandidateHandoff = {
      candidateAccess: true,
      data: { ...candidateData, audienceType: "builder_developer", streetAddress: "", structuralProjectType: "other_concrete" },
    };
    await render(React.createElement(ComprehensiveQuoteWizard, { candidateHandoff: builderHandoff }));
    await click("Save & continue");
    await setValue("quote-street-address", "12 Actual Project Street");
    await click("Save & continue");
    await click("Save & continue");
    expect(container.textContent).toContain("Enter the builder or developer company name.");

    await setValue("quote-builder-company", "Bayside Build Co");
    await setValue("quote-builder-scope", "Garage slab, driveway crossover and paths");
    await click("Driveway");
    await setValue("quote-description", "Detailed builder concrete scope for the project.");
    await click("Save & continue");
    await click("Save & continue");
    expect(container.textContent).toContain("Add the indicative programme or site-ready timing.");

    await setValue("quote-builder-programme", "Planning; site-ready timing to be confirmed");
    await click("Save & continue");
    expect(container.textContent).toContain("Review your quote request");
  });

  it("limits structural documents and partner consent to an eligible complete-extension slab and clears consent only when eligibility ends", async () => {
    const extensionHandoff: CandidateHandoff = {
      candidateAccess: true,
      data: { ...candidateData, structuralProjectType: "complete_extension", services: ["slab"] },
    };
    await render(React.createElement(ComprehensiveQuoteWizard, { candidateHandoff: extensionHandoff }));
    await click("Save & continue");
    await click("Save & continue");
    await click("Save & continue");

    expect(container.textContent).toContain("Structural documents and readiness");
    await click("Save & continue");
    expect(container.textContent).toContain("reviewed partner for non-concrete extension work");
    const partnerConsent = [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
      .find((input) => input.parentElement?.textContent?.includes("reviewed partner"));
    expect(partnerConsent?.checked).toBe(false);

    await act(async () => partnerConsent?.click());
    expect(partnerConsent?.checked).toBe(true);
    const jobScopeEdit = [...container.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent === "Edit" && button.parentElement?.parentElement?.textContent?.includes("Job scope"));
    if (!jobScopeEdit) throw new Error("Job scope edit button not found");
    await act(async () => jobScopeEdit.click());
    await setValue("quote-structural-project", "other_concrete");
    await click("Save & continue");
    expect(container.textContent).not.toContain("reviewed partner for non-concrete extension work");

    await click("Back");
    await setValue("quote-structural-project", "complete_extension");
    await click("Save & continue");
    await click("Save & continue");
    expect(container.textContent).toContain("reviewed partner for non-concrete extension work");
    const restoredPartnerConsent = [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
      .find((input) => input.parentElement?.textContent?.includes("reviewed partner"));
    expect(restoredPartnerConsent?.checked).toBe(false);
  });

  it("resolves a local handoff suburb conflict without changing the stored job details until the user chooses", async () => {
    const conflictHandoff: CandidateHandoff = {
      candidateAccess: true,
      data: { ...candidateData, suburb: "Carindale", postcode: "4152" },
      conflict: { currentSuburb: "Carindale", incomingSuburb: "Manly" },
    };
    await render(React.createElement(ComprehensiveQuoteWizard, { candidateHandoff: conflictHandoff }));

    expect(container.textContent).toContain("Confirm the project suburb");
    await click("Use Manly instead");
    expect(container.textContent).not.toContain("Confirm the project suburb");
    expect(container.querySelector("#quote-locality-resolution")?.textContent).toContain("Project suburb updated to Manly");
    await click("Save & continue");
    expect((container.querySelector("#quote-suburb") as HTMLInputElement).value).toBe("Manly");
  });

  it("consumes the candidate handoff exactly once and leaves no-context page chrome unchanged", async () => {
    await render(React.createElement(GetQuote));
    await act(async () => root.render(React.createElement(GetQuote)));

    expect(consumeCandidateHandoffSpy).toHaveBeenCalledTimes(1);
    expect(container.querySelector("[data-testid='navbar']")).not.toBeNull();
    expect(container.textContent).toContain("Get Your Free Quote");
  });

  it("hands a regular candidate-link click to GetQuote once while retaining the raw href for a non-JavaScript fallback", async () => {
    handoffCandidateSpy.mockImplementation((_token: string, options: { navigate: (path: string) => void }) => {
      options.navigate("/get-quote?utm_source=google&gclid=abc");
    });
    const record = {
      slug: "wynnum",
      locality: "Wynnum",
      h1: "Concrete services in Wynnum",
      intro: "Share concrete project details for a factual review.",
      services: [],
      practicalSections: [],
      faqs: [],
      nearbyLocalitySlugs: [],
    };
    await render(React.createElement(BaysideSoutheastLocalJobsPage, { record: record as any }));

    const homeownerLink = [...container.querySelectorAll<HTMLAnchorElement>("a")]
      .find((anchor) => anchor.textContent?.includes("I am a homeowner or property owner"));
    expect(homeownerLink?.getAttribute("href")).toBe("/get-quote?context=bayside-wynnum-homeowner");
    if (!homeownerLink) throw new Error("Candidate homeowner link not found");
    await act(async () => homeownerLink.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 })));

    expect(handoffCandidateSpy).toHaveBeenCalledTimes(1);
    expect(handoffCandidateSpy).toHaveBeenCalledWith("bayside-wynnum-homeowner", { navigate: setLocationSpy });
    expect(setLocationSpy).toHaveBeenCalledWith("/get-quote?utm_source=google&gclid=abc");

    await act(async () => root.unmount());
    container.remove();
    consumeCandidateHandoffSpy.mockReturnValue({ candidateAccess: true, data: candidateData });
    await render(React.createElement(GetQuote));
    expect(consumeCandidateHandoffSpy).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Share your concrete project details");
  });
});
