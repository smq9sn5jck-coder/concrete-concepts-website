import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PREVIEW_SUBMISSION_DISABLED_MESSAGE,
  PreviewSubmissionDisabledError,
  isPreviewSubmissionDisabled,
} from "../shared/previewSubmission";

const previewState = vi.hoisted(() => ({ disabled: false }));

vi.mock("@/lib/previewSubmissionAccess", () => ({
  previewSubmissionsDisabled: () => previewState.disabled,
}));

import {
  submitCallbackFallback,
  submitFormFallback,
  submitGuideFallback,
} from "../client/src/lib/formFallback";

describe("preview submission disabled error contract", () => {
  it("recognises the explicit terminal error and REST refusal envelope", () => {
    expect(isPreviewSubmissionDisabled(new PreviewSubmissionDisabledError())).toBe(true);
    expect(isPreviewSubmissionDisabled({ success: false, code: "PREVIEW_SUBMISSION_DISABLED" })).toBe(true);
  });

  it("recognises individual and batch tRPC envelopes without treating success envelopes as refusals", () => {
    const singleTrpcEnvelope = {
      error: {
        json: {
          code: -32003,
          data: {
            code: "FORBIDDEN",
            previewCode: "PREVIEW_SUBMISSION_DISABLED",
          },
        },
      },
    };
    const batchTrpcEnvelope = [
      { result: { data: { json: { success: true } } } },
      {
        error: {
          json: {
            data: {
              code: "FORBIDDEN",
              previewCode: "PREVIEW_SUBMISSION_DISABLED",
            },
          },
        },
      },
    ];

    expect(isPreviewSubmissionDisabled(singleTrpcEnvelope)).toBe(true);
    expect(isPreviewSubmissionDisabled(batchTrpcEnvelope)).toBe(true);
    expect(isPreviewSubmissionDisabled({ result: { data: { success: true } } })).toBe(false);
  });

  it("recognises terminal marker messages nested in an error response without a fragile instance check", () => {
    expect(isPreviewSubmissionDisabled({
      response: {
        body: {
          message: "PREVIEW_SUBMISSION_DISABLED",
        },
      },
    })).toBe(true);
  });

  it("recognises tRPC-style Error messages and shape envelopes before callers choose a fallback", () => {
    expect(isPreviewSubmissionDisabled(Object.assign(
      new Error("PREVIEW_SUBMISSION_DISABLED"),
      { shape: { data: { code: "FORBIDDEN" } } },
    ))).toBe(true);
    expect(isPreviewSubmissionDisabled({
      shape: { data: { previewCode: "PREVIEW_SUBMISSION_DISABLED" } },
    })).toBe(true);
  });
});

describe("quote fallback terminal preview refusal", () => {
  beforeEach(() => {
    previewState.disabled = false;
    vi.stubGlobal("window", {
      location: { pathname: "/get-quote", href: "" },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const validQuote = () => ({
    name: "Preview-safe lead",
    phone: "0424 463 268",
    suburb: "Carindale 4152",
    formStartedAt: Date.now() - 10_000,
  });

  it("rejects an active preview before any fallback POST, mail draft, retry, success, or navigation", async () => {
    previewState.disabled = true;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitFormFallback(validQuote())).rejects.toMatchObject({
      name: "PreviewSubmissionDisabledError",
      message: PREVIEW_SUBMISSION_DISABLED_MESSAGE,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });

  it("turns a REST 403 terminal refusal into the typed error with one request and no mail draft", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: vi.fn().mockResolvedValue({
        success: false,
        code: "PREVIEW_SUBMISSION_DISABLED",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitFormFallback(validQuote())).rejects.toBeInstanceOf(PreviewSubmissionDisabledError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe("");
  });

  it("preserves ordinary non-preview mail fallback for genuine delivery failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ error: "Delivery failed" }),
    }));

    await expect(submitFormFallback(validQuote())).resolves.toMatchObject({
      success: false,
      method: "mailto",
    });
    expect(window.location.href).toContain("mailto:");
  });

  it("rejects an active preview callback or guide before a fallback request, mail draft, success, or conversion", async () => {
    previewState.disabled = true;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitCallbackFallback({
      name: "Preview callback",
      phone: "0424 463 268",
      suburb: "Carindale 4152",
      formStartedAt: Date.now() - 10_000,
    })).rejects.toBeInstanceOf(PreviewSubmissionDisabledError);
    await expect(submitGuideFallback({
      name: "Preview guide",
      email: "preview@example.com",
      formStartedAt: Date.now() - 10_000,
    })).rejects.toBeInstanceOf(PreviewSubmissionDisabledError);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });

  it("turns callback and guide REST terminal refusals into typed errors without mail fallback", async () => {
    const terminalResponse = () => ({
      ok: false,
      status: 403,
      json: vi.fn().mockResolvedValue({
        success: false,
        code: "PREVIEW_SUBMISSION_DISABLED",
      }),
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(terminalResponse())
      .mockResolvedValueOnce(terminalResponse());
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitCallbackFallback({
      name: "Preview callback",
      phone: "0424 463 268",
      suburb: "Carindale 4152",
      formStartedAt: Date.now() - 10_000,
    })).rejects.toBeInstanceOf(PreviewSubmissionDisabledError);
    await expect(submitGuideFallback({
      name: "Preview guide",
      email: "preview@example.com",
      formStartedAt: Date.now() - 10_000,
    })).rejects.toBeInstanceOf(PreviewSubmissionDisabledError);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(window.location.href).toBe("");
  });
});
