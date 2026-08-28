import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerStorageProxy } from "./storageProxy";
import { getAllBlogPosts, getDb } from "../db";
import { quoteRequests } from "../../drizzle/schema";
import { storagePut } from "../storage";
import crypto from "crypto";
import {
  classifyServiceArea,
  createLeadFingerprint,
  SubmissionRateLimiter,
  validateAustralianPhone,
} from "../../shared/leadValidation";
import { comprehensiveQuoteSchema, toLegacyQuoteFields } from "../../shared/quoteBrief";

const webhookLeadLimiter = new SubmissionRateLimiter({ windowMs: 2 * 60_000, maxAttempts: 1 });
const webhookAddressLimiter = new SubmissionRateLimiter({ windowMs: 10 * 60_000, maxAttempts: 8 });

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust proxy headers (Cloudflare / Manus platform proxy)
  app.set("trust proxy", true);

  // 301 redirect: concreteconcepts.org → concreteconceptsgroup.com
  // Consolidates SEO authority to the primary domain
  // Uses req.headers.host (raw Host header) because behind the platform proxy,
  // req.hostname may resolve to the internal platform domain instead of the
  // original domain the visitor typed in their browser.
  app.use((req, res, next) => {
    const rawHost = (req.headers["x-forwarded-host"] || req.headers.host || "").toString().toLowerCase().split(":")[0];
    if (rawHost === "concreteconcepts.org" || rawHost === "www.concreteconcepts.org" || rawHost === "www.concreteconceptsgroup.com") {
      const targetUrl = `https://concreteconceptsgroup.com${req.originalUrl}`;
      return res.redirect(301, targetUrl);
    }
    next();
  });

  // 301 redirects: Consolidate duplicate blog posts to eliminate keyword cannibalization
  const blogRedirects: Record<string, string> = {
    "concrete-driveway-cost-brisbane-2026": "concrete-driveway-cost-brisbane-price-guide",
    "concrete-driveway-cost-brisbane-2026-price-guide": "concrete-driveway-cost-brisbane-price-guide",
    "retaining-wall-cost-brisbane-2026": "concrete-retaining-wall-cost-brisbane-price-guide",
    "retaining-wall-guide-brisbane-types-costs-council": "concrete-retaining-walls-brisbane-types-costs-council",
    "concrete-shed-slabs-brisbane-guide": "concrete-shed-slab-cost-brisbane-price-guide",
    "how-long-concrete-cure-brisbane-weather": "how-long-concrete-cure-brisbane-climate",
    "concrete-vs-pavers-brisbane-driveways": "concrete-vs-pavers-brisbane-driveway",
    "prepare-property-concreting-job-brisbane-checklist": "prepare-property-concrete-pour-brisbane",
  };
  app.get("/blog/:slug", (req, res, next) => {
    const target = blogRedirects[req.params.slug];
    if (target) {
      return res.redirect(301, `/blog/${target}`);
    }
    next();
  });

  // CORS — allow Cloudflare Pages static site to call the API
  const ALLOWED_ORIGINS = [
    "https://concreteconceptsgroup.com",
    "https://www.concreteconceptsgroup.com",
    "https://concreteconcepts.org",
    "https://www.concreteconcepts.org",
  ];
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  });

  // Security headers — improves trust signals and Lighthouse score
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
    next();
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Dynamic sitemap.xml with image sitemap support
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const baseUrl = "https://concreteconceptsgroup.com";
      const today = new Date().toISOString().split("T")[0];

      // Static pages (do NOT include /admin — it should not be indexed)
      const staticPages = [
        { url: "/", changefreq: "weekly", priority: "1.0" },
        { url: "/areas", changefreq: "weekly", priority: "0.9" },
        { url: "/reviews", changefreq: "weekly", priority: "0.8" },
        { url: "/blog", changefreq: "daily", priority: "0.8" },
        { url: "/calculator", changefreq: "monthly", priority: "0.8" },
        { url: "/gallery/before-after", changefreq: "weekly", priority: "0.8" },
        { url: "/projects", changefreq: "weekly", priority: "0.8" },
        { url: "/get-quote", changefreq: "monthly", priority: "0.9" },
        { url: "/referral", changefreq: "monthly", priority: "0.7" },
        { url: "/guide", changefreq: "monthly", priority: "0.8" },
        { url: "/faq", changefreq: "monthly", priority: "0.8" },
        { url: "/privacy", changefreq: "yearly", priority: "0.3" },
        { url: "/terms", changefreq: "yearly", priority: "0.3" },
        { url: "/finishes", changefreq: "monthly", priority: "0.8" },
      ];

      // Service landing pages
      const servicePages = [
        "concrete-driveways-brisbane",
        "concrete-slabs-brisbane",
        "retaining-walls-brisbane",
        "exposed-aggregate-brisbane",
        "concrete-patios-brisbane",
        "excavation-brisbane",
        "crossover-permits-brisbane",
        "pool-surrounds-brisbane",
        "shed-slabs-brisbane",
      ];

      // Suburb landing pages
      const suburbPages = [
        "carindale", "logan", "wynnum", "springfield", "capalaba",
        "ipswich", "mount-gravatt", "redlands", "beenleigh", "camp-hill", "sunnybank",
        "chermside", "aspley", "north-lakes", "caboolture",
        "morningside", "coorparoo", "greenslopes", "holland-park", "tarragindi",
        "annerley", "moorooka", "kenmore", "indooroopilly", "chapel-hill",
        "the-gap", "ferny-grove", "everton-park", "stafford", "nundah",
        "marsden", "shailer-park", "underwood", "robina", "nerang",
        "coomera", "ormeau", "burpengary", "redcliffe", "morayfield",
        "strathpine", "goodna", "brassall", "redbank-plains", "ripley",
        "bracken-ridge", "thornlands", "calamvale", "sunnybank-hills", "alexandra-hills",
        "redland-bay", "eight-mile-plains", "rochedale", "pimpama", "mango-hill",
        "bellbird-park", "victoria-point", "upper-coomera", "kallangur", "narangba",
      ];

      // Project images for image sitemap
      const projectImages = [
        { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg", title: "Exposed aggregate concrete driveway Brisbane" },
        { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-finished-slab_74e9f7cd.jpeg", title: "Concrete slab with steps Brisbane" },
        { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-1_942fd49e.jpeg", title: "Concrete retaining wall Brisbane" },
        { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-troweling_06ff9a7c.jpeg", title: "Concrete troweling finish Brisbane" },
        { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg", title: "Concrete driveway project Brisbane" },
        { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-4_c54657e7.jpeg", title: "Excavation and site preparation Brisbane" },
        { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-5_d25c6ec1.jpeg", title: "Site waste removal Brisbane" },
        { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-pouring_f7343992.jpeg", title: "Concrete pouring Brisbane residential" },
      ];

      // Get all published blog posts
      let blogPostEntries: Array<{ slug: string; updatedAt: Date | null; coverImage: string | null }> = [];
      try {
        const posts = await getAllBlogPosts(true);
        blogPostEntries = posts.map(p => ({ slug: p.slug, updatedAt: p.updatedAt, coverImage: p.coverImage }));
      } catch (err) {
        console.error("[Sitemap] Failed to fetch blog posts:", err);
      }

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

      // Static pages (homepage gets all project images)
      for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        if (page.url === "/") {
          for (const img of projectImages) {
            xml += `    <image:image>\n`;
            xml += `      <image:loc>${img.url}</image:loc>\n`;
            xml += `      <image:title>${img.title}</image:title>\n`;
            xml += `    </image:image>\n`;
          }
        }
        xml += `  </url>\n`;
      }

      // Service pages
      for (const slug of servicePages) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/services/${slug}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      }

      // Suburb landing pages
      for (const slug of suburbPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/areas/${slug}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }

      // Blog posts
      for (const post of blogPostEntries) {
        const lastmod = post.updatedAt
          ? post.updatedAt.toISOString().split("T")[0]
          : today;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        if (post.coverImage) {
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${post.coverImage}</image:loc>\n`;
          xml += `    </image:image>\n`;
        }
        xml += `  </url>\n`;
      }

      xml += `</urlset>`;

      res.set("Content-Type", "application/xml; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Error generating sitemap:", err);
      res.status(500).send("Error generating sitemap");
    }
  });

  // robots.txt
  app.get("/robots.txt", (_req, res) => {
    const robotsTxt = [
      "User-agent: *",
      "Allow: /",
      "",
      "# Disallow admin pages",
      "Disallow: /admin",
      "Disallow: /api/",
      "",
      "# Sitemap",
      "Sitemap: https://concreteconceptsgroup.com/sitemap.xml",
    ].join("\n");

    res.set("Content-Type", "text/plain");
    res.send(robotsTxt);
  });
  // IndexNow API key for Bing/Yandex instant indexing
  const INDEXNOW_KEY = "a8fe41e6eb7446678e392a6b010909a3";
  app.get(`/${INDEXNOW_KEY}.txt`, (_req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(INDEXNOW_KEY);
  });

  // IndexNow submission endpoint (call after publishing new content)
  app.post("/api/indexnow", async (req, res) => {
    try {
      const { urls } = req.body as { urls?: string[] };
      if (!urls || !urls.length) return res.status(400).json({ error: "No URLs provided" });
      const payload = {
        host: "concreteconceptsgroup.com",
        key: INDEXNOW_KEY,
        keyLocation: `https://concreteconceptsgroup.com/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 100),
      };
      const response = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(`[IndexNow] Submitted ${urls.length} URLs, status: ${response.status}`);
      res.json({ success: true, status: response.status, urlCount: urls.length });
    } catch (err) {
      console.error("[IndexNow] Error:", err);
      res.status(500).json({ error: "IndexNow submission failed" });
    }
  });

  // Photo upload endpoint for quote form
  app.post("/api/upload-photo", async (req, res) => {
    try {
      const { data, contentType, fileName } = req.body;
      if (!data || !contentType || !fileName) {
        return res.status(400).json({ error: "Missing data, contentType, or fileName" });
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
      if (!allowedTypes.includes(contentType)) {
        return res.status(400).json({ error: "Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed." });
      }

      // Decode base64 data
      const buffer = Buffer.from(data, "base64");

      // Validate file size (max 10MB)
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
      }

      // Generate unique key
      const suffix = crypto.randomBytes(6).toString("hex");
      const ext = fileName.split(".").pop() || "jpg";
      const key = `quote-photos/${Date.now()}-${suffix}.${ext}`;

      const { url } = await storagePut(key, buffer, contentType);
      res.json({ url });
    } catch (err) {
      console.error("[Upload] Failed to upload photo:", err);
      res.status(500).json({ error: "Failed to upload photo" });
    }
  });

  // Inbound webhook: CCG Voice Leads app pushes status updates back
  app.post("/api/webhooks/status-update", async (req, res) => {
    try {
      const { getDb: getDatabase } = await import("../db");
      const { quoteRequests: qr, jobTimelineEvents: jte } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      // Verify webhook secret (shared between systems)
      const webhookSecret = process.env.CCG_WEBHOOK_SECRET;
      if (webhookSecret) {
        const signature = req.headers["x-webhook-signature"] || req.headers["x-ccg-signature"];
        if (signature !== webhookSecret) {
          return res.status(401).json({ error: "Invalid webhook signature" });
        }
      }

      const {
        quoteId,      // quote_requests.id
        phone,        // fallback lookup by phone if no quoteId
        status,       // new status: contacted, quoted, won, lost
        quotedAmount, // dollar amount if quoted
        scheduledDate,// ISO date string if scheduled
        notes,        // any notes from the CCG app
        eventType,    // optional: specific event type
      } = req.body;

      const db = await getDatabase();
      if (!db) return res.status(500).json({ error: "Database unavailable" });

      // Find the quote by ID or phone
      let quote;
      if (quoteId) {
        const [found] = await db.select().from(qr).where(eq(qr.id, Number(quoteId))).limit(1);
        quote = found;
      } else if (phone) {
        // Match by last 8 digits of phone
        const digits = phone.replace(/\D/g, "");
        const last8 = digits.slice(-8);
        const allQuotes = await db.select().from(qr).orderBy(qr.createdAt);
        quote = allQuotes.find(q => q.phone.replace(/\D/g, "").slice(-8) === last8);
      }

      if (!quote) return res.status(404).json({ error: "Quote not found" });

      const previousStatus = quote.status;
      const updateData: Record<string, unknown> = {};

      // Update status if provided and valid
      const validStatuses = ["new", "contacted", "quoted", "won", "lost"];
      if (status && validStatuses.includes(status)) {
        updateData.status = status;

        // Track contactedAt on first contact
        if (status !== "new" && previousStatus === "new" && !quote.contactedAt) {
          updateData.contactedAt = new Date();
        }
        // Track completedAt on win
        if (status === "won" && !quote.completedAt) {
          updateData.completedAt = new Date();
        }
      }

      if (quotedAmount) updateData.quotedAmount = String(quotedAmount);
      if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
      if (notes) updateData.notes = notes;

      // Apply updates
      if (Object.keys(updateData).length > 0) {
        await db.update(qr).set(updateData).where(eq(qr.id, quote.id));
      }

      // Log timeline event
      const evType = eventType || (status && status !== previousStatus ? "status_change" : "webhook_update");
      await db.insert(jte).values({
        quoteRequestId: quote.id,
        eventType: evType,
        fromStatus: previousStatus,
        toStatus: status || previousStatus,
        description: notes || `Updated via CCG app${status ? `: ${previousStatus} → ${status}` : ""}`,
        metadata: JSON.stringify({ source: "ccg_voice_leads", ...req.body }),
        source: "ccg_app",
      });

      console.log(`[Webhook] Status update for quote #${quote.id}: ${previousStatus} → ${status || "(no change)"}`);
      res.json({ success: true, quoteId: quote.id, previousStatus, newStatus: status || previousStatus });
    } catch (err) {
      console.error("[Webhook] Status update failed:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Scheduled: Keep-alive ping to Cloudflare Pages (prevents cold starts)
  app.post("/api/scheduled/keep-alive", async (req, res) => {
    try {
      const response = await fetch("https://concreteconceptsgroup.com", { method: "GET" });
      console.log(`[Keep-Alive] Pinged CF Pages: status=${response.status}`);
      res.json({ success: true, status: response.status, timestamp: new Date().toISOString() });
    } catch (err: any) {
      console.error("[Keep-Alive] Ping error:", err.message);
      res.status(500).json({ error: err.message, timestamp: new Date().toISOString() });
    }
  });

  // Webhook: Receive leads from Cloudflare Worker and log to Google Sheets + Database
  app.post("/api/webhooks/lead-capture", async (req, res) => {
    try {
      let { name, phone, email, service, suburb, details } = req.body;
      const { leadSource, timestamp, jobBrief } = req.body;
      let photoUrls = Array.isArray(req.body.photoUrls) ? req.body.photoUrls : [];

      if (jobBrief) {
        const structured = comprehensiveQuoteSchema.safeParse(jobBrief);
        if (!structured.success) {
          res.status(400).json({ error: structured.error.issues[0]?.message || "The quote details are incomplete." });
          return;
        }
        const compatible = toLegacyQuoteFields(structured.data);
        name = compatible.name;
        phone = compatible.phone;
        email = compatible.email;
        service = compatible.service;
        suburb = compatible.suburb;
        details = compatible.details;
        photoUrls = compatible.photoUrls;
      }

      const phoneValidation = validateAustralianPhone(phone || "");
      if (!phoneValidation.valid) {
        res.status(400).json({ error: phoneValidation.error });
        return;
      }
      const serviceArea = classifyServiceArea(suburb || "Not specified");
      if (!serviceArea.canSubmit) {
        res.status(400).json({ error: serviceArea.message });
        return;
      }
      const leadFingerprint = createLeadFingerprint({
        phone: phoneValidation.normalized,
        email,
        location: serviceArea.normalized,
      });
      const addressFingerprint = createLeadFingerprint({ address: req.ip || "unknown" });
      if (!webhookLeadLimiter.attempt(leadFingerprint).allowed || !webhookAddressLimiter.attempt(addressFingerprint).allowed) {
        res.status(429).json({ error: "This lead was already captured or too many requests were received." });
        return;
      }

      const normalizedDetails = serviceArea.status === "service_area_review"
        ? `[SERVICE AREA REVIEW]\n${details || "No additional details provided"}`
        : details || "";

      // 1. Save to database
      const db = await getDb();
      if (db) {
        await db.insert(quoteRequests).values({
          name: name || "Unknown",
          phone: phoneValidation.normalized,
          email: email || "not-provided@via-quick-form.com",
          service: service || "General Enquiry",
          suburb: serviceArea.normalized,
          details: normalizedDetails,
          photoUrls: photoUrls.length ? JSON.stringify(photoUrls) : null,
          leadSource: leadSource || "Direct",
          status: "new",
          createdAt: timestamp ? new Date(timestamp) : new Date(),
        });
      }

      // 2. Append to Google Sheet via gws CLI (fire-and-forget)
      const { exec } = await import("child_process");
      const ts = timestamp || new Date().toISOString();
      const sheetId = "1Z57LdJ8mMlGErKyKuVh3tNFHbo2TfiZ1EFIwZf_-vBI";
      const rowData = [ts, name || "", phoneValidation.normalized, email || "", service || "", serviceArea.normalized, normalizedDetails, leadSource || "Direct", "New"];
      const valuesJson = JSON.stringify({ values: [rowData] });
      const escapedJson = valuesJson.replace(/'/g, "'" + "\\" + "'" + "'");
      const cmd = `gws sheets spreadsheets values append --params '{"spreadsheetId": "${sheetId}", "range": "Leads!A:I", "valueInputOption": "USER_ENTERED"}' --json '${escapedJson}'`;
      exec(cmd, (err, _stdout, stderr) => {
        if (err) console.error("[Lead-Capture] Sheets append error:", stderr);
        else console.log("[Lead-Capture] Sheets append OK");
      });

      console.log(`[Lead-Capture] Saved lead: ${name} - ${service} - ${serviceArea.normalized}`);
      res.json({ success: true, message: "Lead captured to DB + Sheets" });
    } catch (err: any) {
      console.error("[Lead-Capture] Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Scheduled: Weekly Google Ads report (called by Heartbeat cron)
  app.post("/api/scheduled/google-ads-report", async (req, res) => {
    try {
      const { sendGoogleAdsWeeklyReport } = await import("../googleAdsReport");
      const result = await sendGoogleAdsWeeklyReport();
      res.json(result);
    } catch (err: any) {
      console.error("[Scheduled] Google Ads report error:", err);
      res.status(500).json({
        error: err.message,
        stack: err.stack,
        context: { url: req.originalUrl },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
