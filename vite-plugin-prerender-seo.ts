/*
  vite-plugin-prerender-seo
  --------------------------
  After Vite emits the SPA bundle, this plugin writes ONE static HTML file per
  route listed in client/src/seo/routes.ts, with the correct <title>, meta
  description, canonical and Open Graph / Twitter tags injected directly into
  the served HTML <head>.

  WHY: The app is a client-rendered React SPA. Without this, every route serves
  the same generic <title> in the raw HTML and the per-page title is only
  applied after JS executes. Baking the tags into the HTML means crawlers,
  link unfurlers, and previews get the correct per-page SEO instantly — no JS
  execution required.

  The body/app markup is intentionally left as the standard SPA shell (the
  <div id="root"> mounts React as normal); only the <head> is specialised per
  route. This keeps hydration trivial and avoids a full SSR pipeline.

  Output layout (for outDir = dist/public):
    /index.html                 -> "/"
    /get-quote/index.html       -> "/get-quote"
    /blog/<slug>/index.html     -> "/blog/<slug>"   (when those routes are added)

  Cloudflare Pages / static hosts serve /foo/index.html for /foo automatically.
*/
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import {
  SEO_ROUTES,
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  type RouteMeta,
} from "./client/src/seo/routes";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHead(meta: RouteMeta): string {
  const canonical = `${SITE_URL}${meta.path === "/" ? "/" : meta.path}`;
  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const absImage = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;
  const robots = meta.noindex ? "noindex, nofollow" : "index, follow";
  const t = esc(meta.title);
  const d = esc(meta.description);
  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:locale" content="en_AU" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${absImage}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${absImage}" />`,
  ].join("\n  ");
}

/**
 * Replace the existing <title> + known meta/canonical tags in the base HTML
 * with the per-route block. Falls back to inserting before </head>.
 */
function injectHead(html: string, headBlock: string): string {
  let out = html;

  // Remove the static <title>…</title>
  out = out.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
  // Remove existing primary SEO meta/canonical that we will re-emit, so we
  // don't end up with duplicates.
  out = out.replace(/<meta\s+name="description"[^>]*>\s*/i, "");
  out = out.replace(/<meta\s+name="robots"[^>]*>\s*/i, "");
  out = out.replace(/<link\s+rel="canonical"[^>]*>\s*/i, "");
  out = out.replace(/<meta\s+property="og:(title|description|url|image|type|site_name|locale)"[^>]*>\s*/gi, "");
  out = out.replace(/<meta\s+name="twitter:(card|title|description|image)"[^>]*>\s*/gi, "");

  // Insert the per-route head block right after <head ...>
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, (m) => `${m}\n  ${headBlock}`);
  } else {
    out = `${headBlock}\n${out}`;
  }
  return out;
}

export function vitePluginPrerenderSeo(): Plugin {
  let outDir = "dist/public";
  return {
    name: "vite-plugin-prerender-seo",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) {
        this.warn(`[prerender-seo] ${indexPath} not found; skipping.`);
        return;
      }
      const baseHtml = fs.readFileSync(indexPath, "utf-8");
      let count = 0;

      for (const meta of SEO_ROUTES) {
        const headBlock = buildHead(meta);
        const html = injectHead(baseHtml, headBlock);

        if (meta.path === "/") {
          fs.writeFileSync(indexPath, html, "utf-8");
        } else {
          const dir = path.join(outDir, meta.path.replace(/^\//, ""));
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, "index.html"), html, "utf-8");
        }
        count++;
      }
      // eslint-disable-next-line no-console
      console.log(`[prerender-seo] wrote per-route <head> for ${count} route(s).`);
    },
  };
}
