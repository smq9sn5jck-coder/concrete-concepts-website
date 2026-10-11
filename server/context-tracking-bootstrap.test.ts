import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

const indexHtml = readFileSync(join(process.cwd(), "client/index.html"), "utf8");

function inlineScriptContaining(marker: string) {
  const scripts = [...indexHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1]);
  const script = scripts.find((candidate) => candidate.includes(marker));
  if (!script) throw new Error(`Inline script containing ${marker} was not found`);
  return script;
}

type BootstrapMode = "success" | "throws" | "noop";
type CandidateFlags = { preview?: boolean; published?: boolean; isolated?: boolean };

function executeBootstrap(mode: BootstrapMode, href: string, flags: CandidateFlags = {}) {
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
    ...(flags.isolated ? { __CCG_ISOLATED_PREVIEW: true } : {}),
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
  });

  vm.runInContext(
    inlineScriptContaining("__CCG_QUOTE_CONTEXT_TOKEN")
      .replaceAll("%VITE_BAYSIDE_SOUTHEAST_PREVIEW%", String(flags.preview))
      .replaceAll("%VITE_BAYSIDE_SOUTHEAST_PUBLISHED%", String(flags.published)),
    context,
  );
  vm.runInContext(inlineScriptContaining("AW-18007005419"), context);
  vm.runInContext(inlineScriptContaining("connect.facebook.net"), context);
  vm.runInContext(inlineScriptContaining("VITE_ANALYTICS_ENDPOINT"), context);
  for (const callback of listeners.get("load") ?? []) callback();

  return { window, location, history, document, externalLoads };
}

describe("context cleanup bootstrap before tracking", () => {
  it("removes one bounded context before loaders while preserving utm, gclid, and hash", () => {
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

  it("canonicalizes a trailing-slash context route before tracker loading", () => {
    const result = executeBootstrap("success", "https://concreteconceptsgroup.com/get-quote/?context=bayside-wynnum-homeowner&utm_source=google&gclid=abc#quote", { published: true });
    expect(result.location.href).toBe("https://concreteconceptsgroup.com/get-quote?utm_source=google&gclid=abc#quote");
    expect(result.window.__CCG_QUOTE_CONTEXT_TOKEN).toBe("bayside-wynnum-homeowner");
    expect(result.window.__CCG_CONTEXT_TRACKING_ALLOWED).toBe(true);
    expect(result.externalLoads).toContain("https://www.googletagmanager.com/gtag/js?id=AW-18007005419");
  });

  it.each(["throws", "noop"] as const)("keeps trailing-slash context tracking closed when history replacement %s", mode => {
    const result = executeBootstrap(mode, "https://concreteconceptsgroup.com/get-quote/?context=bayside-wynnum-homeowner&utm_source=google", { published: true });
    expect(result.window.__CCG_CONTEXT_TRACKING_ALLOWED).toBe(false);
    expect(result.window.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
    expect(result.externalLoads).toEqual([]);
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
    expect(result.window.addEventListener).not.toHaveBeenCalled();
  });

  it("removes malformed, duplicate, and unknown contexts while reserving only one bounded raw token", () => {
    const duplicate = executeBootstrap(
      "success",
      "https://preview.example/get-quote?context=bayside-wynnum-homeowner&context=bayside-manly-builder&utm_source=google",
    );
    const malformed = executeBootstrap(
      "success",
      "https://preview.example/get-quote?context=<script>&utm_source=google",
    );
    const unknown = executeBootstrap(
      "success",
      "https://preview.example/get-quote?context=unrecognised-token&utm_source=google",
    );

    expect(duplicate.location.href).toBe("https://preview.example/get-quote?utm_source=google");
    expect(duplicate.window.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
    expect(malformed.location.href).toBe("https://preview.example/get-quote?utm_source=google");
    expect(malformed.window.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
    expect(unknown.location.href).toBe("https://preview.example/get-quote?utm_source=google");
    expect(unknown.window.__CCG_QUOTE_CONTEXT_TOKEN).toBe("unrecognised-token");
  });

  it("keeps no-context customer tracking loader, configuration, campaign URL, and destinations unchanged", () => {
    const result = executeBootstrap(
      "success",
      "https://WWW.ConcreteConceptsGroup.com./get-quote?utm_source=google&gclid=abc#quote",
      { published: true },
    );

    expect(result.location.href).toBe("https://WWW.ConcreteConceptsGroup.com./get-quote?utm_source=google&gclid=abc#quote");
    expect(result.window.__CCG_CONTEXT_TRACKING_ALLOWED).toBe(true);
    expect(result.window.__CCG_QUOTE_CONTEXT_TOKEN).toBeUndefined();
    expect(result.externalLoads).toEqual(expect.arrayContaining([
      "https://www.googletagmanager.com/gtag/js?id=AW-18007005419",
      "https://connect.facebook.net/en_US/fbevents.js",
      "%VITE_ANALYTICS_ENDPOINT%/umami",
    ]));
    expect(Array.from((result.window.dataLayer as unknown[])[1] as ArrayLike<unknown>)).toEqual([
      "config",
      "AW-18007005419",
      expect.objectContaining({
        allow_enhanced_conversions: true,
        conversion_linker: true,
        send_page_view: false,
      }),
    ]);
  });

  it.each([
    { preview: true, published: false },
    { preview: false, published: true },
  ])("blocks every tracker on a noncustomer candidate artifact (%o)", (flags) => {
    const preview = executeBootstrap("success", "https://review.pages.dev/areas/wynnum", flags);

    expect(preview.window.__CCG_CONTEXT_TRACKING_ALLOWED).toBe(false);
    expect(preview.externalLoads).toEqual([]);
    expect(preview.window.gtag).toBeUndefined();
    expect(preview.window.fbq).toBeUndefined();
    expect(preview.window.dataLayer).toBeUndefined();
  });

  it("honours the parent edge isolation marker even without compile-time candidate flags", () => {
    const preview = executeBootstrap("success", "https://review.pages.dev/areas/wynnum", { isolated: true });

    expect(preview.window.__CCG_CONTEXT_TRACKING_ALLOWED).toBe(false);
    expect(preview.externalLoads).toEqual([]);
  });
});
