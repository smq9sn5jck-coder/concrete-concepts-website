import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getLeadSourceData } from "../client/src/hooks/useLeadSource";
import { createBufferedQuoteFunnelDispatch } from "../client/src/lib/quoteFunnelAnalytics";

const indexHtml = readFileSync(join(process.cwd(), "client/index.html"), "utf8");

function inlineScriptContaining(marker: string) {
  const scripts = [...indexHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1]);
  const script = scripts.find((candidate) => candidate.includes(marker));
  if (!script) throw new Error(`Inline script containing ${marker} was not found`);
  return script;
}

type BootstrapMode = "success" | "throws" | "noop";

function executeBootstrap(mode: BootstrapMode, href: string, preview = false) {
  const externalLoads: string[] = [];
  const listeners = new Map<string, Array<() => void>>();
  const location = { href };
  const document = {
    head: { appendChild: vi.fn((node: { src?: string }) => externalLoads.push(node.src ?? "")) },
    createElement: vi.fn(() => ({ async: false, defer: false, src: "", dataset: {} })),
    getElementsByTagName: vi.fn(() => [{ parentNode: { insertBefore: vi.fn((node: { src?: string }) => externalLoads.push(node.src ?? "")) } }]),
  };
  const window = {
    location,
    history: { state: { existing: true } },
    addEventListener: vi.fn((name: string, callback: () => void) => {
      const callbacks = listeners.get(name) ?? [];
      callbacks.push(callback);
      listeners.set(name, callbacks);
    }),
  } as Record<string, unknown>;
  const history = {
    state: window.history.state,
    replaceState: vi.fn((_state: unknown, _title: string, next: string) => {
      if (mode === "throws") throw new Error("history unavailable");
      if (mode !== "noop") location.href = new URL(next, href).href;
    }),
  };
  window.history = history;
  const context = vm.createContext({
    window,
    document,
    history,
    URL,
    Date,
    setTimeout: vi.fn(),
  });

  vm.runInContext(inlineScriptContaining("__CCG_QUOTE_CONTEXT_TOKEN").replaceAll("%VITE_BAYSIDE_SOUTHEAST_PREVIEW%", String(preview)), context);
  vm.runInContext(inlineScriptContaining("AW-18007005419"), context);
  vm.runInContext(inlineScriptContaining("connect.facebook.net"), context);
  vm.runInContext(inlineScriptContaining("VITE_ANALYTICS_ENDPOINT"), context);
  for (const callback of listeners.get("load") ?? []) callback();

  return { window, location, history, document, externalLoads };
}

describe("context cleanup bootstrap before tracking", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each(["/areas/wynnum", "/bayside-southeast-review", "/get-quote?context=bayside-wynnum-homeowner", "/get-quote", "/"])("never loads analytics for an isolated preview at %s", (path) => {
    const result = executeBootstrap("success", "https://review.pages.dev" + path, true);
    expect(result.window.__CCG_CONTEXT_TRACKING_ALLOWED).toBe(false);
    expect(result.externalLoads).toEqual([]);
    expect(result.window.gtag).toBeUndefined();
    expect(result.window.fbq).toBeUndefined();
    expect(result.window.dataLayer).toBeUndefined();
    expect(result.location.href).not.toContain("context=");
  });

  it("does not disable customer tracking when a preview artifact reaches an equivalent customer hostname", () => {
    const result = executeBootstrap("success", "https://WWW.ConcreteConceptsGroup.com./get-quote?utm_source=google", true);
    expect(result.window.__CCG_CONTEXT_TRACKING_ALLOWED).toBe(true);
    expect(result.externalLoads.length).toBeGreaterThan(0);
  });

  it("removes a single bounded quote context before loaders while preserving campaign parameters and fragment", () => {
    const result = executeBootstrap(
      "success",
      "https://preview.example/get-quote?utm_source=google&context=bayside-wynnum-homeowner&gclid=abc#quote",
    );

    expect(result.location.href).toBe("https://preview.example/get-quote?utm_source=google&gclid=abc#quote");
    expect(result.window.__CCG_QUOTE_CONTEXT_TOKEN).toBe("bayside-wynnum-homeowner");
    expect(result.window.__CCG_CONTEXT_TRACKING_ALLOWED).toBe(true);
    expect(result.externalLoads).toEqual(expect.arrayContaining([
      expect.stringContaining("googletagmanager.com"),
      expect.stringContaining("connect.facebook.net"),
      "%VITE_ANALYTICS_ENDPOINT%/umami",
    ]));
    expect((result.window.dataLayer as unknown[])?.length).toBeGreaterThan(0);
  });

  it.each(["throws", "noop"] as const)("fails closed when history replacement %s", (mode) => {
    const result = executeBootstrap(
      mode,
      "https://preview.example/get-quote?context=bayside-wynnum-homeowner&utm_source=google#quote",
    );

    expect(result.window.__CCG_CONTEXT_TRACKING_ALLOWED).toBe(false);
    expect(result.window.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
    expect(result.location.href).toContain("context=bayside-wynnum-homeowner");
    expect(result.externalLoads).toEqual([]);
    expect(result.window.dataLayer).toBeUndefined();
    expect(result.window.gtag).toBeUndefined();
    expect(result.window.fbq).toBeUndefined();
    expect(result.window.umami).toBeUndefined();
    expect(result.window.addEventListener).not.toHaveBeenCalled();
  });

  it("drops duplicate or malformed raw contexts rather than retaining an authority token", () => {
    const duplicate = executeBootstrap(
      "success",
      "https://preview.example/get-quote?context=bayside-wynnum-homeowner&context=bayside-manly-builder&utm_source=google",
    );
    const malformed = executeBootstrap(
      "success",
      "https://preview.example/get-quote?context=<script>&utm_source=google",
    );

    expect(duplicate.location.href).toBe("https://preview.example/get-quote?utm_source=google");
    expect(duplicate.window.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
    expect(malformed.location.href).toBe("https://preview.example/get-quote?utm_source=google");
    expect(malformed.window.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
  });

  it("keeps ordinary no-context quote tracking and campaign URLs unchanged", () => {
    const result = executeBootstrap(
      "success",
      "https://preview.example/get-quote?utm_source=google&gclid=abc#quote",
    );

    expect(result.location.href).toBe("https://preview.example/get-quote?utm_source=google&gclid=abc#quote");
    expect(result.window.__CCG_CONTEXT_TRACKING_ALLOWED).toBe(true);
    expect(result.window.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
    expect(result.externalLoads).toEqual(expect.arrayContaining([
      expect.stringContaining("googletagmanager.com"),
      expect.stringContaining("connect.facebook.net"),
      "%VITE_ANALYTICS_ENDPOINT%/umami",
    ]));
  });

  it("does not capture, persist, queue, or later retry context-bearing attribution while the gate is closed", () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn() };
    vi.stubGlobal("window", {
      __CCG_CONTEXT_TRACKING_ALLOWED: false,
      location: {
        pathname: "/get-quote",
        search: "?context=bayside-wynnum-homeowner&utm_source=google",
        hostname: "preview.example",
      },
    });
    vi.stubGlobal("document", { referrer: "https://search.example/?context=unsafe" });
    vi.stubGlobal("sessionStorage", storage);

    expect(getLeadSourceData()).toEqual({
      leadSource: "Direct",
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
      gclid: null,
      fbclid: null,
      referrer: null,
      landingPage: null,
    });
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();

    const scheduled = vi.fn();
    const collector = { track: vi.fn() };
    const dispatch = createBufferedQuoteFunnelDispatch({
      getCollector: () => collector,
      schedule: scheduled,
    });
    dispatch.dispatch("quote_page_view", { traffic_class: "paid" });
    expect(collector.track).not.toHaveBeenCalled();
    expect(scheduled).not.toHaveBeenCalled();
    expect(dispatch.pendingCount()).toBe(0);
  });

  it("sanitizes a resumed stored attribution record before it can be reused", () => {
    const storage = {
      getItem: vi.fn(() => JSON.stringify({
        leadSource: "Google Ads",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "safe-campaign",
        gclid: "abc",
        landingPage: "/get-quote?context=bayside-wynnum-homeowner&utm_source=google",
        referrer: "https://search.example/?context=unsafe",
      })),
      setItem: vi.fn(),
    };
    vi.stubGlobal("window", {
      __CCG_CONTEXT_TRACKING_ALLOWED: true,
      location: { origin: "https://preview.example", search: "", pathname: "/get-quote", hostname: "preview.example" },
    });
    vi.stubGlobal("document", { referrer: "" });
    vi.stubGlobal("sessionStorage", storage);

    expect(getLeadSourceData()).toMatchObject({
      leadSource: "Google Ads",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "safe-campaign",
      landingPage: "/get-quote?utm_source=google",
      referrer: "https://search.example/",
    });
    expect(storage.setItem).toHaveBeenCalledWith(
      "cc_lead_source",
      expect.not.stringContaining("context="),
    );
  });
});
