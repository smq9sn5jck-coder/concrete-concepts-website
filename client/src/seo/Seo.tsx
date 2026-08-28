/*
  <Seo /> — runtime head manager.

  Applies the correct <title>, meta description, canonical, and Open Graph /
  Twitter tags for the current route. This handles CLIENT-SIDE navigation
  (the build-time prerender plugin handles the FIRST paint / crawler view).

  Usage: render <Seo /> once near the top of the app tree. It reads the current
  location from wouter and updates document head whenever the route changes.

  No external dependency (no react-helmet) — keeps the bundle lean.
*/
import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  resolveMeta,
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  type RouteMeta,
} from "./routes";

function setMetaByName(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaByProperty(property: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setRobots(noindex: boolean | undefined) {
  setMetaByName("robots", noindex ? "noindex, nofollow" : "index, follow");
}

export function applyMeta(meta: RouteMeta) {
  const canonical = `${SITE_URL}${meta.path === "/" ? "/" : meta.path}`;
  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const absImage = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  document.title = meta.title;
  setMetaByName("description", meta.description);
  setRobots(meta.noindex);
  setCanonical(canonical);

  // Open Graph
  setMetaByProperty("og:title", meta.title);
  setMetaByProperty("og:description", meta.description);
  setMetaByProperty("og:url", canonical);
  setMetaByProperty("og:image", absImage);
  setMetaByProperty("og:type", "website");
  setMetaByProperty("og:site_name", SITE_NAME);
  setMetaByProperty("og:locale", "en_AU");

  // Twitter
  setMetaByName("twitter:card", "summary_large_image");
  setMetaByName("twitter:title", meta.title);
  setMetaByName("twitter:description", meta.description);
  setMetaByName("twitter:image", absImage);
}

export default function Seo() {
  const [location] = useLocation();

  useEffect(() => {
    applyMeta(resolveMeta(location));
  }, [location]);

  return null;
}
