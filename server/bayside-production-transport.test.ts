import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PreviewSubmissionDisabledError } from "../shared/previewSubmission";

const state = vi.hoisted(() => ({
  disabled: false,
  transportFetch: undefined as undefined | ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>),
  createClient: vi.fn(),
  globalFetch: vi.fn(),
}));

vi.mock("@/lib/previewSubmissionAccess", () => ({
  previewSubmissionsDisabled: () => state.disabled,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: { createClient: state.createClient },
}));

vi.mock("@trpc/client", () => ({
  httpBatchLink: vi.fn((options: { fetch: typeof state.transportFetch }) => {
    state.transportFetch = options.fetch;
    return { kind: "mock-http-batch-link" };
  }),
  TRPCClientError: class TRPCClientError extends Error {},
}));

vi.mock("@tanstack/react-query", () => ({
  QueryClient: class QueryClient {
    getQueryCache() { return { subscribe: vi.fn() }; }
    getMutationCache() { return { subscribe: vi.fn() }; }
  },
  QueryClientProvider: ({ children }: { children: unknown }) => children,
}));

vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));

vi.mock("../client/src/App", () => ({ default: () => null }));
vi.mock("../client/src/const", () => ({ getLoginUrl: () => "/login" }));

async function loadMain() {
  await import("../client/src/main.tsx");
  if (!state.transportFetch) throw new Error("tRPC transport fetch was not registered");
  return state.transportFetch;
}

beforeEach(() => {
  state.disabled = false;
  state.transportFetch = undefined;
  state.createClient.mockClear();
  state.globalFetch.mockReset();
  vi.stubGlobal("React", { createElement: vi.fn(() => null) });
  vi.stubGlobal("window", { location: { hostname: "review.pages.dev", href: "" } });
  vi.stubGlobal("document", { getElementById: vi.fn(() => ({})) });
  vi.stubGlobal("navigator", {});
  vi.stubGlobal("fetch", state.globalFetch);
});

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("candidate tRPC transport terminal submission guard", () => {
  it("rejects a disabled-candidate POST before the first network request", async () => {
    state.disabled = true;
    const transportFetch = await loadMain();

    await expect(transportFetch("/api/trpc/quote.submit", { method: "POST" })).rejects
      .toBeInstanceOf(PreviewSubmissionDisabledError);
    expect(state.globalFetch).not.toHaveBeenCalled();
  });

  it("does not block ordinary customer GET and POST delivery and preserves credentials", async () => {
    state.globalFetch.mockResolvedValue({ ok: true });
    const transportFetch = await loadMain();

    await expect(transportFetch("/api/trpc/quote.submit", { method: "POST", headers: { "x-test": "1" } }))
      .resolves.toEqual({ ok: true });
    await expect(transportFetch("/api/trpc/quote.byId", { method: "GET" }))
      .resolves.toEqual({ ok: true });

    expect(state.globalFetch).toHaveBeenNthCalledWith(1, "/api/trpc/quote.submit", {
      method: "POST",
      headers: { "x-test": "1" },
      credentials: "include",
    });
    expect(state.globalFetch).toHaveBeenNthCalledWith(2, "/api/trpc/quote.byId", {
      method: "GET",
      credentials: "include",
    });
  });

  it("allows non-mutating GET inspection in a disabled candidate without creating a submission", async () => {
    state.disabled = true;
    state.globalFetch.mockResolvedValue({ ok: true });
    const transportFetch = await loadMain();

    await expect(transportFetch("/api/trpc/quote.byId", { method: "GET" })).resolves.toEqual({ ok: true });
    expect(state.globalFetch).toHaveBeenCalledOnce();
  });
});
