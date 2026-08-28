/*
  SEOHead: Dynamic meta tags, canonical URLs, Open Graph, Twitter Cards, and structured data
  Updates document head on each page for maximum SEO coverage
*/
import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  geo?: { placename?: string; position?: string; icbm?: string };
}

const BASE_URL = "https://concreteconceptsgroup.com";
const DEFAULT_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/og-social-share_5e916781.png";
const SITE_NAME = "Concrete Concepts Group";

export default function SEOHead({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage,
  keywords,
  structuredData,
  noindex = false,
  geo,
}: SEOHeadProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Helper to set or create meta tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Helper to set or create link tags
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // Primary meta tags
    setMeta("name", "description", description);
    if (keywords) {
      setMeta("name", "keywords", keywords);
    }
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    // Canonical URL
    if (canonical) {
      setLink("canonical", `${BASE_URL}${canonical}`);
    }

    // Geo-targeting meta tags for local SEO
    setMeta("name", "geo.region", "AU-QLD");
    setMeta("name", "geo.placename", geo?.placename || "Brisbane");
    setMeta("name", "geo.position", geo?.position || "-27.4698;153.0251");
    setMeta("name", "ICBM", geo?.icbm || "-27.4698, 153.0251");

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:image", ogImage || DEFAULT_IMAGE);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "en_AU");
    if (canonical) {
      setMeta("property", "og:url", `${BASE_URL}${canonical}`);
    }

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage || DEFAULT_IMAGE);

    // Structured Data
    if (structuredData) {
      // Remove any existing dynamic structured data
      document.querySelectorAll('script[data-seo-head="true"]').forEach(el => el.remove());

      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      dataArray.forEach(data => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-head", "true");
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }

    // Cleanup on unmount
    return () => {
      document.querySelectorAll('script[data-seo-head="true"]').forEach(el => el.remove());
    };
  }, [title, description, canonical, ogType, ogImage, keywords, structuredData, noindex, geo]);

  return null;
}

export { BASE_URL, DEFAULT_IMAGE, SITE_NAME };
