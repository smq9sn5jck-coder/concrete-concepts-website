import { describe, expect, it } from "vitest";
import {
  verifyBuiltContract,
  verifySourceContract,
  type ReleaseContractFiles,
} from "../scripts/quoteReleaseGuard";

const validSource: ReleaseContractFiles = {
  app: '<Route path={"/get-quote"} component={GetQuote} />',
  getQuote: "<ComprehensiveQuoteWizard />",
  wizard: [
    'const STEPS = [{ title: "Contact" }, { title: "Location" }, { title: "Job brief" }, { title: "Measure & photos" }, { title: "Review" }];',
    '<p>Step 1 of 5</p>',
    'fetch("/api/upload-photo")',
    "trackQuoteConversion({ email, phone, name });",
  ].join("\n"),
  worker: [
    'url.pathname === "/api/upload-photo"',
    'url.pathname.includes("/api/trpc/quote.submit")',
    'url.pathname.includes("/api/trpc/quote.sendBookingLink")',
    "createBookingDeliveryToken",
  ].join("\n"),
};

describe("quote release source contract", () => {
  it("accepts the comprehensive five-step quote source", () => {
    expect(verifySourceContract(validSource)).toEqual({ ok: true, errors: [] });
  });

  it("rejects the incident shape that has no get-quote route", () => {
    const result = verifySourceContract({
      ...validSource,
      app: '<Route path={"/"} component={Home} />',
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Missing /get-quote route registration");
  });

  it("rejects a route that renders a generic page instead of the wizard", () => {
    const result = verifySourceContract({
      ...validSource,
      getQuote: "<NotFound />",
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("GetQuote does not render ComprehensiveQuoteWizard");
  });

  it("rejects an incomplete wizard even when the route exists", () => {
    const result = verifySourceContract({
      ...validSource,
      wizard: '<p>Step 1 of 4</p> trackQuoteConversion({ email, phone, name });',
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Missing rendered Step 1 of 5 marker");
    expect(result.errors).toContain("Wizard step contract is incomplete");
  });

  it("rejects a production Worker without the booking gateway routes", () => {
    const result = verifySourceContract({
      ...validSource,
      worker: [
        'url.pathname === "/api/upload-photo"',
        'url.pathname.includes("/api/trpc/quote.submit")',
      ].join("\n"),
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Worker booking SMS route is missing");
    expect(result.errors).toContain("Worker booking token creation is missing");
  });
});

describe("quote release build contract", () => {
  it("accepts a built bundle containing the rendered route contract", () => {
    expect(
      verifyBuiltContract([
        'route:"/get-quote"',
        'children:"Step 1 of 5"',
        'children:"How can we reach you?"',
        'fetch("/api/upload-photo")',
        'path:"/api/trpc/quote.submit"',
        'path:"/api/trpc/quote.sendBookingLink"',
        "createBookingDeliveryToken",
      ])
    ).toEqual({ ok: true, errors: [] });
  });

  it("fails a successful application shell that only renders Page Not Found", () => {
    const result = verifyBuiltContract([
      'route:"/"',
      'children:"404 Page Not Found"',
    ]);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Built bundle is missing /get-quote");
    expect(result.errors).toContain("Built bundle is missing Step 1 of 5");
  });

  it("rejects a built Worker without the booking gateway route", () => {
    const result = verifyBuiltContract([
      'route:"/get-quote"',
      'children:"Step 1 of 5"',
      'children:"How can we reach you?"',
      'fetch("/api/upload-photo")',
      'path:"/api/trpc/quote.submit"',
    ]);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Built bundle is missing booking SMS endpoint");
    expect(result.errors).toContain("Built bundle is missing booking token creation");
  });
});
