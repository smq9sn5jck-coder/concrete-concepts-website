import { describe, expect, it } from "vitest";
import { evaluateRenderedQuoteRoute } from "../scripts/verifyLiveQuoteRoute";

describe("rendered production quote-route contract", () => {
  const validDom = `
    <html>
      <head><title>Get a Free Concrete Quote | Concrete Concepts Group</title></head>
      <body>
        <p>Step 1 of 5</p>
        <h2>How can we reach you?</h2>
        <input autocomplete="name" />
        <input autocomplete="tel" />
        <input autocomplete="email" />
      </body>
    </html>`;

  it("accepts the rendered comprehensive wizard", () => {
    expect(
      evaluateRenderedQuoteRoute(
        "https://concreteconceptsgroup.com/get-quote",
        validDom
      )
    ).toEqual({ ok: true, errors: [] });
  });

  it("rejects the incident state even when the application shell loaded", () => {
    const result = evaluateRenderedQuoteRoute(
      "https://concreteconceptsgroup.com/get-quote",
      "<html><head><title>Concrete Concepts</title></head><body><h1>404 Page Not Found</h1></body></html>"
    );

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Rendered page is missing Step 1 of 5");
    expect(result.errors).toContain("Rendered page contains Page Not Found");
  });

  it("rejects a redirect away from the protected route", () => {
    const result = evaluateRenderedQuoteRoute(
      "https://concreteconceptsgroup.com/",
      validDom
    );

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Browser did not remain on /get-quote");
  });
});
