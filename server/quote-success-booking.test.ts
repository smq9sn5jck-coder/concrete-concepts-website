import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const wizardPath = resolve(__dirname, "../client/src/components/quote/ComprehensiveQuoteWizard.tsx");
const bookingPath = resolve(__dirname, "../client/src/components/quote/QuoteSuccessBooking.tsx");
const routerPath = resolve(__dirname, "./routers.ts");
const schemaPath = resolve(__dirname, "../drizzle/schema.ts");

const wizardSource = readFileSync(wizardPath, "utf8");
const routerSource = readFileSync(routerPath, "utf8");
const schemaSource = readFileSync(schemaPath, "utf8");

describe("post-quote site inspection booking experience", () => {
  it("isolates the booking UI in a dedicated success component", () => {
    expect(existsSync(bookingPath)).toBe(true);
    const bookingSource = readFileSync(bookingPath, "utf8");

    expect(bookingSource).toContain("Book site inspection now");
    expect(bookingSource).toContain("Text me the booking link");
    expect(bookingSource).toContain("Booking link sent");
    expect(bookingSource).toContain('aria-live="polite"');
    expect(bookingSource).toContain("target=\"_blank\"");
    expect(bookingSource).toContain("rel=\"noopener noreferrer\"");
  });

  it("renders direct booking in both success branches but enables SMS only with a persisted token", () => {
    expect(wizardSource).toContain("QuoteSuccessBooking");
    expect(wizardSource).toContain("bookingDeliveryToken");
    expect(wizardSource).toMatch(/onSuccess:\s*\(result\)[\s\S]{0,500}setBookingDeliveryToken\(result\.bookingDeliveryToken/);
    expect(wizardSource).toMatch(/submitFormFallback[\s\S]{0,700}setBookingDeliveryToken\(null\)/);
  });

  it("keeps the original quote conversion semantics unchanged", () => {
    const conversionCalls = wizardSource.match(/trackQuoteConversion\(/g) ?? [];
    expect(conversionCalls).toHaveLength(2);
  });

  it("issues SMS delivery tokens only for persisted detailed quote submissions", () => {
    expect(routerSource).toMatch(/savedQuoteId > 0 && input\.jobBrief/);
    expect(routerSource).toMatch(/createQuoteBookingDelivery\(db, savedQuoteId\)/);
  });

  it("adds a token-only public mutation and an auditable one-time delivery table", () => {
    expect(routerSource).toContain("sendBookingLink");
    expect(routerSource).toContain("deliverBookingLink");
    expect(routerSource).toMatch(/sendBookingLink:\s*publicProcedure[\s\S]{0,500}token:\s*z\.string/);
    expect(schemaSource).toContain('mysqlTable("quote_booking_deliveries"');
    expect(schemaSource).toContain("tokenHash");
    expect(schemaSource).toContain("providerMessageId");
  });
});
