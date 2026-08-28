import { describe, expect, it, vi } from "vitest";
import {
  createBufferedQuoteFunnelDispatch,
  createQuoteFunnelTracker,
  deriveQuoteTrafficClass,
  sanitizeQuoteFunnelEvent,
  type QuoteFunnelDispatch,
} from "../client/src/lib/quoteFunnelAnalytics";

describe("quote funnel analytics privacy contract", () => {
  it("keeps only allowlisted properties and values", () => {
    const event = sanitizeQuoteFunnelEvent("quote_step_reached", {
      step: 3,
      step_name: "job_brief",
      traffic_class: "paid",
      name: "Private Person",
      phone: "0412345678",
      email: "person@example.com",
      address: "1 Private Street",
      description: "Private project detail",
      photo_url: "https://private.example/photo.jpg",
      gclid: "secret-click-id",
    });

    expect(event).toEqual({
      name: "quote_step_reached",
      data: { step: 3, step_name: "job_brief", traffic_class: "paid" },
    });
    expect(JSON.stringify(event)).not.toMatch(
      /Private Person|0412345678|person@example|Private Street|project detail|photo\.jpg|secret-click-id/
    );
  });

  it("rejects unknown event names", () => {
    expect(() => sanitizeQuoteFunnelEvent("customer_details" as never, {})).toThrow(
      "Unsupported quote funnel event"
    );
  });

  it("normalizes invalid property values to safe enumerated defaults", () => {
    expect(
      sanitizeQuoteFunnelEvent("quote_validation_blocked", {
        step: 99,
        validation_code: "Enter email person@example.com",
        traffic_class: "gclid-123",
      })
    ).toEqual({
      name: "quote_validation_blocked",
      data: { step: 0, validation_code: "unknown", traffic_class: "other" },
    });
  });

  it("reduces detailed attribution to a broad traffic class", () => {
    expect(deriveQuoteTrafficClass("Google Ads")).toBe("paid");
    expect(deriveQuoteTrafficClass("Google Organic")).toBe("organic");
    expect(deriveQuoteTrafficClass("Referral (example.com)")).toBe("referral");
    expect(deriveQuoteTrafficClass("Direct")).toBe("direct");
    expect(deriveQuoteTrafficClass("Unclassified Campaign")).toBe("other");
  });
});

describe("quote funnel analytics availability", () => {
  it("drops queued events after a bounded retry window when the collector never loads", () => {
    const scheduled: Array<() => void> = [];
    const buffered = createBufferedQuoteFunnelDispatch({
      getCollector: () => undefined,
      schedule: (callback) => {
        scheduled.push(callback);
        return 1;
      },
      maxAttempts: 2,
    });

    buffered.dispatch("quote_page_view", { traffic_class: "paid" });
    expect(buffered.pendingCount()).toBe(1);
    scheduled.shift()?.();
    scheduled.shift()?.();

    expect(buffered.pendingCount()).toBe(0);
    expect(scheduled).toHaveLength(0);
  });
});

describe("quote funnel event deduplication", () => {
  function setup() {
    const events: Array<{ name: string; data: Record<string, string | number | boolean> }> = [];
    const dispatch: QuoteFunnelDispatch = vi.fn((name, data) => events.push({ name, data }));
    return { events, dispatch, tracker: createQuoteFunnelTracker(dispatch) };
  }

  it("records one page view and one event for each first-reached step", () => {
    const { events, tracker } = setup();

    tracker.pageView("paid");
    tracker.pageView("paid");
    tracker.stepReached(1, "contact", "paid");
    tracker.stepReached(1, "contact", "paid");
    tracker.stepReached(2, "location", "paid");

    expect(events.map((event) => event.name)).toEqual([
      "quote_page_view",
      "quote_step_reached",
      "quote_step_reached",
    ]);
  });

  it("deduplicates the same validation code but records a different block", () => {
    const { events, tracker } = setup();

    tracker.validationBlocked(1, "mobile_invalid");
    tracker.validationBlocked(1, "mobile_invalid");
    tracker.validationBlocked(1, "email_invalid");

    expect(events).toHaveLength(2);
    expect(events.map((event) => event.data.validation_code)).toEqual([
      "mobile_invalid",
      "email_invalid",
    ]);
  });

  it("records only one confirmed delivery event across primary and fallback callbacks", () => {
    const { events, tracker } = setup();

    tracker.submitConfirmed("primary", "paid");
    tracker.submitConfirmed("fallback", "paid");

    expect(events).toEqual([
      {
        name: "quote_submit_confirmed",
        data: { delivery_path: "primary", traffic_class: "paid" },
      },
    ]);
  });

  it("records each deliberate submit attempt while still deduplicating confirmation", () => {
    const { events, tracker } = setup();

    tracker.submitStarted("paid", "absent");
    tracker.submitStarted("paid", "absent");
    tracker.submitConfirmed("primary", "paid");
    tracker.submitConfirmed("primary", "paid");

    expect(events.map((event) => event.name)).toEqual([
      "quote_submit_started",
      "quote_submit_started",
      "quote_submit_confirmed",
    ]);
  });
});
