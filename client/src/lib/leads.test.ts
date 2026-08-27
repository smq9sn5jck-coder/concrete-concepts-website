// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  captureAttribution,
  createRequestId,
  emitLeadEvent,
  normalizeAustralianPhone,
  readAttribution,
} from "./leads";

describe("lead utilities", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    window.sessionStorage.clear();
    delete (window as Window & { dataLayer?: unknown[] }).dataLayer;
  });

  it("captures UTM values and gclid from the landing URL", () => {
    window.history.replaceState(
      {},
      "",
      "/?utm_source=google&utm_medium=cpc&utm_campaign=driveways&utm_content=hero&utm_term=concreter&gclid=test-click-123"
    );

    const attribution = captureAttribution();

    expect(attribution).toMatchObject({
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "driveways",
      utmContent: "hero",
      utmTerm: "concreter",
      gclid: "test-click-123",
    });
    expect(readAttribution()).toEqual(attribution);
  });

  it("does not overwrite stored attribution when navigating to a clean URL", () => {
    window.history.replaceState(
      {},
      "",
      "/?utm_source=google&gclid=first-click"
    );
    const first = captureAttribution();

    window.history.replaceState({}, "", "/trade-referral-program");
    expect(captureAttribution()).toEqual(first);
  });

  it.each([
    ["0412 345 678", "+61412345678"],
    ["+61 412 345 678", "+61412345678"],
    ["07 3123 4567", "+61731234567"],
    ["(07) 3123-4567", "+61731234567"],
  ])("normalises %s", (input, expected) => {
    expect(normalizeAustralianPhone(input)).toBe(expected);
  });

  it.each(["123", "abcdefghij", "+61", "00000000"])(
    "rejects the invalid phone number %s",
    input => {
      expect(normalizeAustralianPhone(input)).toBeNull();
    }
  );

  it("creates URL-safe unique request identifiers", () => {
    const first = createRequestId("referral");
    const second = createRequestId("referral");

    expect(first).toMatch(/^referral-[A-Za-z0-9_-]{8,}$/);
    expect(second).not.toBe(first);
  });

  it("emits only the named lead event without requiring analytics", () => {
    const dispatch = vi.spyOn(window, "dispatchEvent");

    expect(() =>
      emitLeadEvent("trade_referral_submitted", {
        requestId: "referral-test-123",
        leadType: "trade_referral",
      })
    ).not.toThrow();

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0]).toMatchObject({
      type: "ccg:lead",
      detail: {
        event: "trade_referral_submitted",
        requestId: "referral-test-123",
        leadType: "trade_referral",
      },
    });
  });
});
