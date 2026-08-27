import { useEffect } from "react";

export interface PageMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
}

function getOrCreateMeta(
  selector: string,
  attribute: "name" | "property",
  value: string
) {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  if (existing) return existing;

  const element = document.createElement("meta");
  element.setAttribute(attribute, value);
  document.head.appendChild(element);
  return element;
}

function getOrCreateCanonical() {
  const existing = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );
  if (existing) return existing;

  const element = document.createElement("link");
  element.rel = "canonical";
  document.head.appendChild(element);
  return element;
}

export function applyPageMetadata(metadata: PageMetadata) {
  document.title = metadata.title;

  getOrCreateMeta('meta[name="description"]', "name", "description").content =
    metadata.description;
  getOrCreateMeta('meta[property="og:title"]', "property", "og:title").content =
    metadata.title;
  getOrCreateMeta(
    'meta[property="og:description"]',
    "property",
    "og:description"
  ).content = metadata.description;
  getOrCreateMeta('meta[property="og:url"]', "property", "og:url").content =
    metadata.canonicalUrl;
  getOrCreateMeta(
    'meta[name="twitter:title"]',
    "name",
    "twitter:title"
  ).content = metadata.title;
  getOrCreateMeta(
    'meta[name="twitter:description"]',
    "name",
    "twitter:description"
  ).content = metadata.description;
  getOrCreateCanonical().href = metadata.canonicalUrl;
}

export function usePageMetadata(metadata: PageMetadata) {
  useEffect(() => {
    applyPageMetadata(metadata);
  }, [metadata.canonicalUrl, metadata.description, metadata.title]);
}
