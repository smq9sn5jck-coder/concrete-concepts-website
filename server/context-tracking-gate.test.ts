import { afterEach, describe, expect, it, vi } from "vitest";
import { contextTrackingAllowed } from "../client/src/lib/contextTrackingGate";
import { trackQuoteConversion } from "../client/src/components/ConversionTracking";
import { getLeadSourceData } from "../client/src/hooks/useLeadSource";

const originalWindow = globalThis.window;

afterEach(() => {
  Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  vi.unstubAllGlobals();
});

describe("context tracking gate", () => {
  it("allows ordinary customer documents unless the fail-closed bootstrap explicitly closes the gate", () => {
    vi.stubGlobal("window", {});
    expect(contextTrackingAllowed()).toBe(true);

    vi.stubGlobal("window", { __CCG_CONTEXT_TRACKING_ALLOWED: false });
    expect(contextTrackingAllowed()).toBe(false);

    vi.stubGlobal("window", { __CCG_CONTEXT_TRACKING_ALLOWED: true });
    expect(contextTrackingAllowed()).toBe(true);
  });

  it("preserves ordinary no-context first-touch campaign attribution", () => {
    const stored = new Map<string, string>();
    const storage = {
      getItem: vi.fn((key: string) => stored.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => stored.set(key, value)),
    };
    vi.stubGlobal("window", {
      __CCG_CONTEXT_TRACKING_ALLOWED: true,
      location: {
        pathname: "/get-quote",
        search: "?utm_source=google&utm_medium=cpc&gclid=customer-click",
        hostname: "concreteconceptsgroup.com",
      },
    });
    vi.stubGlobal("document", { referrer: "https://www.google.com.au/" });
    vi.stubGlobal("sessionStorage", storage);

    expect(getLeadSourceData()).toMatchObject({
      leadSource: "Google Ads",
      utmSource: "google",
      utmMedium: "cpc",
      gclid: "customer-click",
      landingPage: "/get-quote?utm_source=google&utm_medium=cpc&gclid=customer-click",
    });
    expect(storage.setItem).toHaveBeenCalledOnce();
  });

  it("does not read or write first-touch attribution or conversion data while cleanup is closed", () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn() };
    vi.stubGlobal("window", {
      __CCG_CONTEXT_TRACKING_ALLOWED: false,
      location: { pathname: "/get-quote", search: "?context=bayside-wynnum-homeowner", hostname: "preview.example" },
      dataLayer: undefined,
      gtag: vi.fn(),
      fbq: vi.fn(),
    });
    vi.stubGlobal("document", { referrer: "https://search.example/?context=unsafe" });
    vi.stubGlobal("sessionStorage", storage);

    expect(getLeadSourceData()).toMatchObject({ leadSource: "Direct", landingPage: null, referrer: null });
    trackQuoteConversion({ quoteId: "not-persisted", transactionId: "gate-closed" });

    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(window.dataLayer).toBeUndefined();
    expect(window.gtag).not.toHaveBeenCalled();
    expect(window.fbq).not.toHaveBeenCalled();
  });
});
