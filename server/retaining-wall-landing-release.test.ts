import * as fs from "fs";
import * as path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { getLeadSourceData } from "../client/src/hooks/useLeadSource";

const root = path.resolve(import.meta.dirname, "..");
const landingPath = path.join(root, "client/src/pages/LandingPage.tsx");
const landing = fs.readFileSync(landingPath, "utf-8");

function createSessionStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    get length() {
      return values.size;
    },
  } satisfies Storage;
}

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalSessionStorage = globalThis.sessionStorage;

afterEach(() => {
  Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  Object.defineProperty(globalThis, "document", { configurable: true, value: originalDocument });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: originalSessionStorage });
});

describe("retaining-wall paid landing release", () => {
  it("preserves first-touch Google Ads attribution across the quote handoff", () => {
    const storage = createSessionStorage();
    Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: storage });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          pathname: "/lp/retaining-wall-brisbane",
          search: "?gclid=test-click&utm_source=google&utm_medium=cpc&utm_campaign=retaining-walls&utm_term=retaining+wall+brisbane",
        },
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { referrer: "https://www.google.com/" },
    });

    const firstTouch = getLeadSourceData();
    expect(firstTouch).toMatchObject({
      leadSource: "Google Ads",
      gclid: "test-click",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "retaining-walls",
      utmTerm: "retaining wall brisbane",
      landingPage:
        "/lp/retaining-wall-brisbane?gclid=test-click&utm_source=google&utm_medium=cpc&utm_campaign=retaining-walls&utm_term=retaining+wall+brisbane",
    });

    window.location.pathname = "/get-quote";
    window.location.search = "";
    expect(getLeadSourceData()).toEqual(firstTouch);
  });

  it("initialises first-touch attribution on the paid page before redirecting", () => {
    expect(landing).toContain('import { useLeadSource } from "@/hooks/useLeadSource"');
    expect(landing).toContain("useLeadSource();");
    expect(landing.indexOf("useLeadSource();")).toBeLessThan(landing.indexOf("window.location.assign"));
  });

  it("places the prefill form before benefit cards on mobile while retaining desktop columns", () => {
    const formIndex = landing.indexOf('data-testid="quote-prefill-card"');
    const benefitsIndex = landing.indexOf('data-testid="landing-benefits"');
    expect(formIndex).toBeGreaterThan(-1);
    expect(benefitsIndex).toBeGreaterThan(-1);
    expect(formIndex).toBeLessThan(benefitsIndex);
    expect(landing).toContain("md:col-start-2 md:row-span-2 md:row-start-1");
  });

  it("targets the mobile Quote action at the prefill form", () => {
    expect(landing).toContain('id="quote-form"');
    expect(landing).toContain('href="#quote-form"');
    expect(landing).not.toContain('window.scrollTo({ top: 0, behavior: "smooth" })');
  });

  it("provides visible labels and stable semantics for all five controls", () => {
    for (const field of ["name", "phone", "email", "suburb", "details"]) {
      expect(landing).toContain(`htmlFor="lp-${field}"`);
      expect(landing).toContain(`id="lp-${field}"`);
      expect(landing).toContain(`name="${field}"`);
    }
    expect(landing).toContain('role="alert"');
    expect(landing).toContain("aria-describedby");
  });

  it("keeps the retaining-wall page concise, qualified and non-primary", () => {
    expect(landing).toContain('serviceId === "retaining-wall"');
    expect(landing).toContain("Approximate wall length, height and preferred wall type");
    expect(landing).toContain("Slope, drainage and site-access details");
    expect(landing).toContain("Measurements and site photos can be added in the five-step quote");
    expect(landing).toContain("validateAustralianPhone");
    expect(landing).toContain("classifyServiceArea");
    expect(landing).not.toContain("trackQuoteConversion");
  });
});
