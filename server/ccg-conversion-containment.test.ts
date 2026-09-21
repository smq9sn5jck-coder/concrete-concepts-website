import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getLeadSourceData } from "../client/src/hooks/useLeadSource";

const root = resolve(import.meta.dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

function createSessionStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    get length() { return values.size; },
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

describe("CCG customer conversion containment", () => {
  it("removes the partner portal from customer navigation and the homepage", () => {
    const navbar = source("client/src/components/Navbar.tsx");
    const footer = source("client/src/components/Footer.tsx");
    const home = source("client/src/pages/Home.tsx");

    expect(navbar).not.toMatch(/Trade Partners|partners\.concreteconceptsgroup\.com/);
    expect(footer).not.toMatch(/Trade Partners|partners\.concreteconceptsgroup\.com/);
    expect(home).not.toMatch(/TrustedPartners|partners\.concreteconceptsgroup\.com/);
  });

  it("treats CCG same-site navigation as internal instead of a referral", () => {
    Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: createSessionStorage() });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          hostname: "www.concreteconceptsgroup.com",
          pathname: "/get-quote",
          search: "",
        },
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { referrer: "https://concreteconceptsgroup.com/services/concrete-driveways-brisbane" },
    });

    expect(getLeadSourceData()).toMatchObject({
      leadSource: "Direct",
      referrer: "https://concreteconceptsgroup.com/services/concrete-driveways-brisbane",
    });
  });

  it("still records an unrelated external website as a referral", () => {
    Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: createSessionStorage() });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          hostname: "concreteconceptsgroup.com",
          pathname: "/get-quote",
          search: "",
        },
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { referrer: "https://example-builder.com/recommendations" },
    });

    expect(getLeadSourceData().leadSource).toBe("Referral (example-builder.com)");
  });
});
