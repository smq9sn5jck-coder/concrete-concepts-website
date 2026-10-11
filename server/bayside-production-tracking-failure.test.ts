import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PREVIEW_SUBMISSION_DISABLED_MESSAGE,
  PreviewSubmissionDisabledError,
  isPreviewSubmissionDisabled,
} from "../shared/previewSubmission";
import {
  type BaysideProductionFeatureFlags,
} from "../client/src/lib/previewSubmissionAccess";
import { captureUtmParams, getUtmData } from "../client/src/lib/utm";
import { createBufferedQuoteFunnelDispatch } from "../client/src/lib/quoteFunnelAnalytics";

const previewState = vi.hoisted(() => ({ disabled: false }));

vi.mock("@/lib/previewSubmissionAccess", () => ({
  previewSubmissionsDisabled: () => previewState.disabled,
}));

import {
  openCallbackMailtoFallback,
  openMailtoFallback,
  submitCallbackFallback,
  submitFormFallback,
  submitGuideFallback,
  submitOtherTradeFallback,
} from "../client/src/lib/formFallback";

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalSessionStorage = globalThis.sessionStorage;

function restoreBrowserGlobals() {
  Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  Object.defineProperty(globalThis, "document", { configurable: true, value: originalDocument });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: originalSessionStorage });
}

afterEach(() => {
  previewState.disabled = false;
  restoreBrowserGlobals();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("candidate preview submission access", () => {
  const noCandidate: BaysideProductionFeatureFlags = { preview: false, published: false };

  it.each([
    { flags: { preview: true, published: false }, hostname: "review.pages.dev" },
    { flags: { preview: false, published: true }, hostname: "review.pages.dev" },
  ])("denies noncustomer candidate submissions when either candidate flag is enabled (%o)", async ({ flags, hostname }) => {
    const { previewSubmissionsDisabled } = await vi.importActual<typeof import("../client/src/lib/previewSubmissionAccess")>(
      "../client/src/lib/previewSubmissionAccess",
    );
    expect(previewSubmissionsDisabled(hostname, flags)).toBe(true);
  });

  it("preserves normalized customer-host and ordinary no-candidate delivery", async () => {
    const { previewSubmissionsDisabled } = await vi.importActual<typeof import("../client/src/lib/previewSubmissionAccess")>(
      "../client/src/lib/previewSubmissionAccess",
    );
    expect(previewSubmissionsDisabled("WWW.ConcreteConceptsGroup.com.", { preview: true, published: true })).toBe(false);
    expect(previewSubmissionsDisabled("review.pages.dev", noCandidate)).toBe(false);
  });
});

describe("tracking failure closure", () => {
  it("does not read or write UTM attribution while the context cleanup gate is closed", () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn() };
    vi.stubGlobal("window", {
      __CCG_CONTEXT_TRACKING_ALLOWED: false,
      location: { pathname: "/get-quote", search: "?utm_source=unsafe&gclid=unsafe" },
    });
    vi.stubGlobal("document", { referrer: "https://unsafe.example/?context=unsafe" });
    vi.stubGlobal("sessionStorage", storage);

    captureUtmParams();

    expect(getUtmData()).toMatchObject({
      utmSource: null,
      gclid: null,
      referrer: null,
      landingPage: null,
    });
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("preserves ordinary customer UTM persistence when the context gate is open", () => {
    const stored = new Map<string, string>();
    const storage = {
      getItem: vi.fn((key: string) => stored.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => stored.set(key, value)),
    };
    vi.stubGlobal("window", {
      __CCG_CONTEXT_TRACKING_ALLOWED: true,
      location: { pathname: "/get-quote", search: "?utm_source=google&gclid=customer-click" },
    });
    vi.stubGlobal("document", { referrer: "https://www.google.com.au/" });
    vi.stubGlobal("sessionStorage", storage);

    captureUtmParams();

    expect(getUtmData()).toMatchObject({
      utmSource: "google",
      gclid: "customer-click",
      landingPage: "/get-quote?utm_source=google&gclid=customer-click",
    });
    expect(storage.setItem).toHaveBeenCalledOnce();
  });

  it("creates no Umami queue, schedule, or event while the context gate is closed", () => {
    const collector = { track: vi.fn() };
    const schedule = vi.fn(() => 1);
    vi.stubGlobal("window", { __CCG_CONTEXT_TRACKING_ALLOWED: false });

    const buffered = createBufferedQuoteFunnelDispatch({
      getCollector: () => collector,
      schedule,
    });
    buffered.dispatch("quote_page_view", { traffic_class: "paid" });

    expect(buffered.pendingCount()).toBe(0);
    expect(schedule).not.toHaveBeenCalled();
    expect(collector.track).not.toHaveBeenCalled();
  });
});

describe("terminal preview fallback refusal", () => {
  beforeEach(() => {
    previewState.disabled = false;
    vi.stubGlobal("window", {
      location: { pathname: "/get-quote", href: "" },
    });
  });

  it("recognizes terminal errors and bounded REST or tRPC envelopes", () => {
    expect(isPreviewSubmissionDisabled(new PreviewSubmissionDisabledError())).toBe(true);
    expect(isPreviewSubmissionDisabled({ error: { json: { data: { previewCode: "PREVIEW_SUBMISSION_DISABLED" } } } })).toBe(true);
    expect(isPreviewSubmissionDisabled({ result: { data: { success: true } } })).toBe(false);
  });

  it("throws before validation, fetch, or mailto for every fallback path in a disabled candidate", async () => {
    previewState.disabled = true;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitFormFallback({ name: "", phone: "invalid" })).rejects.toBeInstanceOf(PreviewSubmissionDisabledError);
    await expect(submitCallbackFallback({ name: "", phone: "invalid" })).rejects.toBeInstanceOf(PreviewSubmissionDisabledError);
    await expect(submitGuideFallback({ name: "", email: "invalid" })).rejects.toBeInstanceOf(PreviewSubmissionDisabledError);
    await expect(submitOtherTradeFallback({} as never)).rejects.toBeInstanceOf(PreviewSubmissionDisabledError);
    expect(() => openMailtoFallback({ name: "Preview", phone: "0424 463 268" })).toThrow(PreviewSubmissionDisabledError);
    expect(() => openCallbackMailtoFallback({ name: "Preview", phone: "0424 463 268" })).toThrow(PreviewSubmissionDisabledError);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });

  it("turns a terminal REST refusal into the typed error without a mail fallback", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: vi.fn().mockResolvedValue({ code: "PREVIEW_SUBMISSION_DISABLED" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitFormFallback({
      name: "Preview safe lead",
      phone: "0424 463 268",
      suburb: "Carindale 4152",
      formStartedAt: Date.now() - 10_000,
    })).rejects.toMatchObject({
      name: "PreviewSubmissionDisabledError",
      message: PREVIEW_SUBMISSION_DISABLED_MESSAGE,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(window.location.href).toBe("");
  });

  it("preserves ordinary delivery fallback when the candidate terminal gate is not active", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ error: "Delivery failed" }),
    }));

    await expect(submitFormFallback({
      name: "Customer lead",
      phone: "0424 463 268",
      suburb: "Carindale 4152",
      formStartedAt: Date.now() - 10_000,
    })).resolves.toMatchObject({ success: false, method: "mailto" });
    expect(window.location.href).toContain("mailto:");
  });
});
