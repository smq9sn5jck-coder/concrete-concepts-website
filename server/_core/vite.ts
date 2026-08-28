import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getPageMeta, injectMetaTags } from "../seoPrerender";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      let page = await vite.transformIndexHtml(url, template);

      // Server-side meta tag injection for SEO crawlers
      try {
        const meta = await getPageMeta(url);
        if (meta) {
          page = injectMetaTags(page, meta);
        }
      } catch (e) {
        console.error("[SEO] Meta injection error:", e);
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Serve hashed assets (JS/CSS) with long-term caching (1 year)
  app.use(
    "/assets",
    express.static(path.resolve(distPath, "assets"), {
      maxAge: "365d",
      immutable: true,
      etag: true,
    })
  );

  // Serve other static files with moderate caching (1 hour)
  app.use(
    express.static(distPath, {
      maxAge: "1h",
      etag: true,
    })
  );

  // fall through to index.html if the file doesn't exist
  // Inject server-side meta tags for SEO crawlers
  // Use aggressive edge caching for public pages (CF will cache HTML at edge)
  app.use("*", async (req, res) => {
    const url = req.originalUrl.split("?")[0].replace(/\/$/, "") || "/";
    const indexPath = path.resolve(distPath, "index.html");

    // Dynamic/authenticated pages: no caching
    const noCachePaths = ["/admin", "/api", "/get-quote", "/quote-status"];
    const isDynamic = noCachePaths.some(p => url.startsWith(p));

    if (isDynamic) {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    } else {
      // Public pages: cache at CF edge for 5 minutes, stale-while-revalidate for 1 hour
      // This means CF serves cached HTML instantly (~50ms) and refreshes in background
      res.set("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=3600");
      // CDN-Cache-Control tells Cloudflare specifically to cache
      res.set("CDN-Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    }

    try {
      const meta = await getPageMeta(req.originalUrl);
      if (meta) {
        let html = await fs.promises.readFile(indexPath, "utf-8");
        html = injectMetaTags(html, meta);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } else {
        res.sendFile(indexPath);
      }
    } catch (e) {
      console.error("[SEO] Production meta injection error:", e);
      res.sendFile(indexPath);
    }
  });
}
