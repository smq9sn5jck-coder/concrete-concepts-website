import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  CHROME_RENDER_TIMEOUT_MS,
  evaluateRenderedQuoteRoute,
  verifyLiveQuoteRoutesWithRetries,
} from "../scripts/verifyLiveQuoteRoute";

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

  it("uses a bounded Chromium process timeout", () => {
    const source = readFileSync(
      resolve(process.cwd(), "scripts/verifyLiveQuoteRoute.ts"),
      "utf8"
    );

    expect(CHROME_RENDER_TIMEOUT_MS).toBeLessThanOrEqual(30_000);
    expect(source).toContain("timeout: CHROME_RENDER_TIMEOUT_MS");
  });

  it("retries both domains after a transient propagation failure", async () => {
    const apex = "https://concreteconceptsgroup.com/get-quote";
    const www = "https://www.concreteconceptsgroup.com/get-quote";
    let wwwAttempts = 0;
    const render = vi.fn((url: string) => {
      if (url === www && ++wwwAttempts === 1) {
        return { ok: false, errors: ["Rendered page is blank"] };
      }
      return { ok: true, errors: [] };
    });
    const wait = vi.fn(async () => undefined);

    await expect(
      verifyLiveQuoteRoutesWithRetries([apex, www], {
        attempts: 3,
        delayMs: 1,
        render,
        wait,
      })
    ).resolves.toEqual({ ok: true, errors: [], attemptsUsed: 2 });

    expect(render).toHaveBeenCalledTimes(4);
    expect(wait).toHaveBeenCalledOnce();
  });
});
