# Pre-rendered Per-Route SEO — Implementation & Porting Guide

This document explains the SEO change shipped in PR #1 of `concrete-concepts-website`
and how to port the identical pattern into the **live** site (the private repo that
contains the `/blog/*` and `/areas/*` routes).

## The problem this fixes

The site is a client-rendered React (Vite + wouter) SPA. Before this change, the raw
HTML served for **every** URL contained the same generic `<title>`
(`Concrete Concepts Group | Brisbane Concreting Services | Free Quotes`). The correct
per-page title was only applied *after* JavaScript executed. Search engines can render
JS, but relying on it weakens per-page SEO signals (titles, descriptions, canonicals)
for the 100+ blog posts and 90+ service-area pages, and breaks link/social unfurling.

## The solution (two layers)

1. **Build-time pre-render (the important part for crawlers).**
   `vite-plugin-prerender-seo.ts` runs after the Vite build and writes one static
   HTML file per route (`/route/index.html`) with the correct `<title>`,
   `<meta name="description">`, `<link rel="canonical">`, Open Graph and Twitter tags
   baked directly into the `<head>`. Static hosts (Cloudflare Pages) serve
   `/route/index.html` for `/route` automatically, so crawlers get correct per-page
   SEO **without executing any JavaScript**.

2. **Runtime head manager (for client-side navigation).**
   `client/src/seo/Seo.tsx` is a tiny dependency-free component (rendered once near the
   app root) that updates `document.title` and the meta/canonical/OG tags whenever the
   route changes during in-app navigation.

Both layers read from a single source of truth: `client/src/seo/routes.ts`.

## Files added / changed

| File | Purpose |
| :--- | :--- |
| `client/src/seo/routes.ts` | Route → meta manifest (title, description, canonical, OG). Single source of truth. |
| `client/src/seo/Seo.tsx` | Runtime head manager for client-side navigation. |
| `vite-plugin-prerender-seo.ts` | Build-time plugin: emits per-route static HTML with correct `<head>`. |
| `client/src/App.tsx` | Renders `<Seo />` once near the root. |
| `vite.config.ts` | Registers `vitePluginPrerenderSeo()` in the plugins array. |

## How to add a new page going forward

Add one entry to `SEO_ROUTES` in `client/src/seo/routes.ts`:

```ts
{
  path: "/blog/your-new-slug",
  title: "Your Page Title | Concrete Concepts Group",
  description: "Up to ~155 characters describing the page for search results.",
}
```

The prerender plugin will automatically emit `/blog/your-new-slug/index.html` with the
correct head on the next build. No other changes required.

---

## Porting to the LIVE (private) repo with /blog and /areas

The live repo already has the route list (it generates the sitemap with 100+ blog and
90+ area URLs). To apply this fix there:

1. **Copy the three new files** (`client/src/seo/routes.ts`, `client/src/seo/Seo.tsx`,
   `vite-plugin-prerender-seo.ts`) into the live repo, keeping the same paths. Adjust the
   import path in the plugin if the live repo's `client` root differs.

2. **Populate `SEO_ROUTES` programmatically** instead of by hand. The live repo already
   has a content source for blog posts and areas (the same data that builds the sitemap).
   Generate the manifest from it, e.g.:

   ```ts
   import { BLOG_POSTS } from "@/content/blog";   // whatever the live source is
   import { SERVICE_AREAS } from "@/content/areas";

   export const SEO_ROUTES: RouteMeta[] = [
     { path: "/", title: "...", description: "..." },
     ...BLOG_POSTS.map((p) => ({
       path: `/blog/${p.slug}`,
       title: `${p.title} | Concrete Concepts Group`,
       description: p.excerpt ?? p.metaDescription,
     })),
     ...SERVICE_AREAS.map((a) => ({
       path: `/areas/${a.slug}`,
       title: `Concreting in ${a.name} | Concrete Concepts Group`,
       description: `Professional concreting services in ${a.name}, Brisbane — driveways, slabs, patios, exposed aggregate. QBCC Licensed. Free quotes.`,
     })),
   ];
   ```

   Because the sitemap and the SEO manifest are then driven by the **same data**, they can
   never drift out of sync.

3. **Register the plugin** in the live repo's `vite.config.*` plugins array:
   `vitePluginPrerenderSeo()`.

4. **Render `<Seo />` once** near the app root (it reads the current route via the router).
   If the live repo uses `react-router` instead of `wouter`, swap the `useLocation()`
   import in `Seo.tsx` accordingly (the rest is identical).

5. **Build & verify** (see below), then deploy via the existing Cloudflare Pages pipeline.

## Verification checklist

```bash
pnpm build            # plugin prints: [prerender-seo] wrote per-route <head> for N route(s).
# Check a sample of emitted files contain UNIQUE titles in raw HTML:
grep -o "<title>[^<]*</title>" dist/public/index.html
grep -o "<title>[^<]*</title>" dist/public/blog/<some-slug>/index.html
grep -o "<title>[^<]*</title>" dist/public/areas/<some-suburb>/index.html
# Confirm exactly one <title> per file (no duplicates):
grep -c "<title>" dist/public/blog/<some-slug>/index.html   # -> 1
pnpm check            # tsc passes
```

After deploy, validate live with:
`curl -s https://concreteconceptsgroup.com/blog/<slug> | grep -o "<title>[^<]*</title>"`
and re-submit the sitemap / request indexing in Google Search Console.
