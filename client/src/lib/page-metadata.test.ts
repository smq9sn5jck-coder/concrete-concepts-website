// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { applyPageMetadata } from "./page-metadata";

function addMeta(propertyOrName: "name" | "property", key: string) {
  const element = document.createElement("meta");
  element.setAttribute(propertyOrName, key);
  document.head.appendChild(element);
  return element;
}

describe("page metadata", () => {
  afterEach(() => {
    document.head.innerHTML = "";
  });

  it("updates title, description, canonical and open graph values", () => {
    addMeta("name", "description");
    addMeta("property", "og:title");
    addMeta("property", "og:description");
    addMeta("property", "og:url");
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);

    applyPageMetadata({
      title: "$100 Concreting Referral Program | Concrete Concepts",
      description: "Refer a concreting job and receive $100 after completion.",
      canonicalUrl: "https://concreteconceptsgroup.com/trade-referral-program",
    });

    expect(document.title).toBe(
      "$100 Concreting Referral Program | Concrete Concepts"
    );
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    ).toBe("Refer a concreting job and receive $100 after completion.");
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href")
    ).toBe("https://concreteconceptsgroup.com/trade-referral-program");
    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content")
    ).toBe("$100 Concreting Referral Program | Concrete Concepts");
    expect(
      document.querySelector('meta[property="og:url"]')?.getAttribute("content")
    ).toBe("https://concreteconceptsgroup.com/trade-referral-program");
  });

  it("creates missing metadata elements", () => {
    applyPageMetadata({
      title: "CGS | Construction Growth Systems",
      description: "Connected growth systems for construction businesses.",
      canonicalUrl:
        "https://concreteconceptsgroup.com/construction-growth-systems",
    });

    expect(document.querySelector('meta[name="description"]')).not.toBeNull();
    expect(document.querySelector('link[rel="canonical"]')).not.toBeNull();
    expect(document.querySelector('meta[property="og:title"]')).not.toBeNull();
  });
});
