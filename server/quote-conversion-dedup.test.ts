import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { trackQuoteConversion } from "../client/src/components/ConversionTracking";

const ROOT = resolve(__dirname, "..");

describe("confirmed quote conversion tracking", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pushes one quote_submitted event with the server-issued transaction ID", () => {
    const dataLayer: unknown[] = [];
    const fbq = vi.fn();
    vi.stubGlobal("window", { dataLayer, fbq });

    trackQuoteConversion(
      { quoteId: 5160001, transactionId: "CCG-Q-5160001" },
      { email: "Lead@Example.com ", phone: "0424 463 268", name: "Test Lead" },
      1,
    );

    expect(dataLayer).toHaveLength(1);
    expect(dataLayer[0]).toMatchObject({
      event: "quote_submitted",
      quote_id: 5160001,
      ecommerce: {
        transaction_id: "CCG-Q-5160001",
        value: 1,
        currency: "AUD",
      },
      user_data: {
        email: "lead@example.com",
        phone_number: "+61424463268",
      },
    });
    expect(fbq).toHaveBeenCalledWith(
      "track",
      "Lead",
      expect.objectContaining({ value: 1 }),
      { eventID: "CCG-Q-5160001" },
    );
  });

  it("contains no timestamp-generated quote transaction ID", () => {
    const source = readFileSync(
      resolve(ROOT, "client/src/components/ConversionTracking.tsx"),
      "utf8",
    );

    const quoteFunction = source.slice(
      source.indexOf("export function trackQuoteConversion"),
      source.indexOf("export function trackPhoneCallClick"),
    );

    expect(quoteFunction).not.toContain("Date.now()");
    expect(quoteFunction).toContain('event: "quote_submitted"');
    expect(quoteFunction).toContain("confirmation.transactionId");
  });
});

describe("quote idempotency schema", () => {
  it("defines a unique submissionId for database-backed quotes", () => {
    const schema = readFileSync(resolve(ROOT, "drizzle/schema.ts"), "utf8");
    expect(schema).toMatch(/submissionId:\s*varchar\("submissionId",\s*\{\s*length:\s*64\s*\}\)\.unique\(\)/);
  });
});
