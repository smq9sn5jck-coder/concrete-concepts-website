/**
 * Server-Side Meta Tag Injection for SEO Crawlers
 * 
 * Since this is a React SPA, search engine crawlers may not execute JavaScript
 * to see the dynamic meta tags set by SEOHead. This module injects critical
 * meta tags (title, description, OG, canonical, structured data) directly into
 * the HTML response on the server side, so crawlers see them immediately.
 * 
 * This is NOT full SSR — it only injects <head> meta tags into the HTML template.
 * The page body still renders client-side.
 */

import { getAllBlogPosts, getBlogPostBySlug } from "./db";

// In-memory cache to avoid DB calls on every request (5 min TTL)
const metaCache = new Map<string, { data: PageMeta | null; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedMeta(key: string): PageMeta | null | undefined {
  const entry = metaCache.get(key);
  if (!entry) return undefined; // cache miss
  if (Date.now() > entry.expires) {
    metaCache.delete(key);
    return undefined; // expired
  }
  return entry.data;
}

function setCachedMeta(key: string, data: PageMeta | null): void {
  // Limit cache size to prevent memory leaks
  if (metaCache.size > 500) {
    const firstKey = metaCache.keys().next().value;
    if (firstKey) metaCache.delete(firstKey);
  }
  metaCache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

const BASE_URL = "https://concreteconceptsgroup.com";
const DEFAULT_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-hero_a3bbd489.png";
const SITE_NAME = "Concrete Concepts Group";
const PHONE = "0424 463 268";

interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: Record<string, unknown>[];
  /** Visible body content for crawlers that don't execute JS */
  crawlerBodyContent?: string;
}

/**
 * Static page meta definitions — covers all key indexable pages
 */
const STATIC_PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "Concreter Brisbane | Concrete Concepts Group",
    description: `Brisbane's trusted concreter — driveways, slabs, exposed aggregate & retaining walls. QBCC Licensed #15299707. Free on-site quotes. Call ${PHONE}.`,
    canonical: "/",
  },
  "/areas": {
    title: "Service Areas Brisbane | Concrete Concepts Group",
    description: `Concrete Concepts Group services Brisbane Southside, Northside, Bayside, Logan, Ipswich & Gold Coast. Find your suburb for local concreting services. Call ${PHONE}.`,
    canonical: "/areas",
  },
  "/reviews": {
    title: "Reviews & Testimonials | Concrete Concepts Group Brisbane",
    description: "Read verified customer reviews for Concrete Concepts Group. 4.9★ Google rating. See what Brisbane homeowners say about our concreting work.",
    canonical: "/reviews",
  },
  "/blog": {
    title: "Concreting Blog & Guides | Concrete Concepts Group Brisbane",
    description: "Expert concreting tips, cost guides, and project inspiration for Brisbane homeowners. Learn about driveways, slabs, retaining walls and more.",
    canonical: "/blog",
  },
  "/calculator": {
    title: "Concrete Cost Calculator Brisbane | Free Instant Estimate",
    description: `Get an instant concrete cost estimate for your Brisbane project. Driveways, slabs, patios & retaining walls. Updated 2026 prices. Call ${PHONE}.`,
    canonical: "/calculator",
  },
  "/gallery/before-after": {
    title: "Before & After Gallery | Concrete Concepts Group Brisbane",
    description: "See real before and after photos of our Brisbane concreting projects. Driveways, slabs, retaining walls and more transformed by our team.",
    canonical: "/gallery/before-after",
  },
  "/projects": {
    title: "Project Gallery | Concrete Concepts Group Brisbane",
    description: "Browse our portfolio of completed concreting projects across Brisbane. Driveways, slabs, exposed aggregate, retaining walls and more.",
    canonical: "/projects",
  },
  "/get-quote": {
    title: "Get a Free Quote | Concrete Concepts Group Brisbane",
    description: `Request a free, no-obligation concreting quote. We'll visit your Brisbane property within 24 hours. QBCC Licensed #15299707. Call ${PHONE}.`,
    canonical: "/get-quote",
  },
  "/faq": {
    title: "Frequently Asked Questions | Concrete Concepts Group Brisbane",
    description: `Common questions about concreting in Brisbane — pricing, timelines, permits, finishes & maintenance. QBCC Licensed #15299707. Call ${PHONE}.`,
    canonical: "/faq",
  },
  "/guide": {
    title: "Free Concreting Guide Brisbane | Concrete Concepts Group",
    description: "Download our free 13-page Brisbane homeowner's guide to concreting. Covers finishes, costs, council requirements, and maintenance tips.",
    canonical: "/guide",
  },
  "/referral": {
    title: "Referral Program | Concrete Concepts Group Brisbane",
    description: "Refer a friend to Concrete Concepts Group and earn rewards. Our referral program thanks you for spreading the word about quality concreting.",
    canonical: "/referral",
  },
  "/privacy": {
    title: "Privacy Policy | Concrete Concepts Group",
    description: "Privacy policy for Concrete Concepts Group. Learn how we collect, use, and protect your personal information.",
    canonical: "/privacy",
  },
  "/terms": {
    title: "Terms of Service | Concrete Concepts Group",
    description: "Terms of service for Concrete Concepts Group. Read our terms and conditions for using our website and services.",
    canonical: "/terms",
  },
  "/finishes": {
    title: "Concrete Finishes Brisbane | Compare Styles & Colours | Concrete Concepts Group",
    description: `Explore and compare concrete finishes — standard, exposed aggregate, coloured, covercrete & polished. Interactive visualizer with ratings. Call ${PHONE}.`,
    canonical: "/finishes",
  },
};

/**
 * Service page meta — generated from slug
 */
const SERVICE_META: Record<string, { title: string; description: string }> = {
  "concrete-driveways-brisbane": {
    title: "Concrete Driveways Brisbane | | Free Quotes | Concrete Concepts Group",
    description: `Professional concrete driveway installation in Brisbane. Exposed aggregate, coloured and plain concrete, scoped to verified site requirements. QBCC Licensed #15299707. Call ${PHONE}.`,
  },
  "concrete-slabs-brisbane": {
    title: "Concrete Slabs Brisbane | House, Shed & Garage Slabs | Concrete Concepts Group",
    description: `Expert concrete slab installation in Brisbane. House slabs, shed slabs and garage slabs, reviewed against verified site and engineering requirements. QBCC Licensed #15299707. Call ${PHONE}.`,
  },
  "retaining-walls-brisbane": {
    title: "Retaining Walls Brisbane | Concrete & Sleeper Walls | Concrete Concepts Group",
    description: `Professional retaining wall construction in Brisbane. Concrete, timber & steel sleeper walls. QBCC Licensed #15299707. Free quotes. Call ${PHONE}.`,
  },
  "exposed-aggregate-brisbane": {
    title: "Exposed Aggregate Brisbane | Driveways & Paths | Concrete Concepts Group",
    description: `Premium exposed aggregate concrete in Brisbane. Driveways, paths and patios, planned around verified site conditions and finish selection. QBCC Licensed #15299707. Call ${PHONE}.`,
  },
  "concrete-patios-brisbane": {
    title: "Concrete Patios Brisbane | Outdoor Entertaining | Concrete Concepts Group",
    description: `Custom concrete patios and entertaining areas in Brisbane. Finish, drainage and site preparation verified before quoting. QBCC Licensed #15299707. Call ${PHONE}.`,
  },
  "excavation-brisbane": {
    title: "Excavation Brisbane | Site Prep & Earthworks | Concrete Concepts Group",
    description: `Professional excavation and site preparation in Brisbane. Residential & commercial earthworks. QBCC Licensed #15299707. Call ${PHONE}.`,
  },
  "crossover-permits-brisbane": {
    title: "Crossover Permits Brisbane | Council Approval | Concrete Concepts Group",
    description: `We handle Brisbane council crossover permits and driveway approvals. Full service from application to construction. Call ${PHONE}.`,
  },
  "pool-surrounds-brisbane": {
    title: "Pool Surrounds Brisbane | Concrete Pool Decks | Concrete Concepts Group",
    description: `Non-slip concrete pool surrounds in Brisbane. Exposed aggregate, coloured & textured finishes. QBCC Licensed #15299707. Call ${PHONE}.`,
  },
  "shed-slabs-brisbane": {
    title: "Shed Slabs Brisbane | Garage & Workshop Slabs | Concrete Concepts Group",
    description: `Quality shed and garage slabs in Brisbane, planned to verified engineering and site requirements. QBCC Licensed #15299707. Call ${PHONE}.`,
  },
};

/**
 * Get meta tags for a given URL path.
 * Returns null if no specific meta is defined (falls back to default index.html meta).
 */
export async function getPageMeta(urlPath: string): Promise<PageMeta | null> {
  // Clean the path
  const cleanPath = urlPath.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";

  // Check cache first (avoids DB calls on repeated requests)
  const cached = getCachedMeta(cleanPath);
  if (cached !== undefined) return cached;

  // 1. Check static pages
  if (STATIC_PAGE_META[cleanPath]) {
    const meta = { ...STATIC_PAGE_META[cleanPath] };
    if (cleanPath === "/") {
      meta.crawlerBodyContent = generateHomepageContent();
    } else if (cleanPath === "/blog") {
      meta.crawlerBodyContent = await generateBlogListContent();
    } else if (cleanPath === "/calculator") {
      meta.crawlerBodyContent = generateCalculatorContent();
    } else if (cleanPath === "/get-quote") {
      meta.crawlerBodyContent = generateQuotePageContent();
    } else if (cleanPath === "/faq") {
      meta.crawlerBodyContent = generateFAQContent();
    }
    setCachedMeta(cleanPath, meta);
    return meta;
  }

  // 2. Check service pages: /services/:slug
  const serviceMatch = cleanPath.match(/^\/services\/([a-z0-9-]+)$/);
  if (serviceMatch) {
    const slug = serviceMatch[1];
    const meta = SERVICE_META[slug];
    if (meta) {
      const result = {
        title: meta.title,
        description: meta.description,
        canonical: `/services/${slug}`,
        ogImage: DEFAULT_IMAGE,
      };
      setCachedMeta(cleanPath, result);
      return result;
    }
  }

  // 3. Check suburb pages: /areas/:slug
  const suburbMatch = cleanPath.match(/^\/areas\/([a-z0-9-]+)$/);
  if (suburbMatch) {
    const slug = suburbMatch[1];
    const name = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const result = {
      title: `Concreter ${name} | Driveways, Slabs & More | Concrete Concepts Group`,
      description: `Professional concreting services in ${name}, Brisbane. Driveways, slabs, retaining walls & exposed aggregate. QBCC Licensed #15299707. Call ${PHONE}.`,
      canonical: `/areas/${slug}`,
    };
    setCachedMeta(cleanPath, result);
    return result;
  }

  // 4. Check blog posts: /blog/:slug
  const blogMatch = cleanPath.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    try {
      const post = await getBlogPostBySlug(slug);
      if (post) {
        // Strip markdown to plain text for crawler body
        const plainContent = post.content
          ? post.content
              .replace(/#{1,6}\s+/g, "")
              .replace(/\*\*([^*]+)\*\*/g, "$1")
              .replace(/\*([^*]+)\*/g, "$1")
              .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
              .replace(/!\[([^\]]*?)\]\([^)]+\)/g, "")
              .replace(/\|[^\n]+\|/g, "")
              .replace(/[-*]\s+/g, "")
              .replace(/\n{3,}/g, "\n\n")
              .trim()
          : "";
        const result = {
          title: post.metaTitle || `${post.title} | Concrete Concepts Group`,
          description: post.metaDescription || post.excerpt || post.title,
          canonical: `/blog/${slug}`,
          ogImage: post.coverImage || DEFAULT_IMAGE,
          ogType: "article",
          crawlerBodyContent: `<article><h1>${escapeHtml(post.title)}</h1><p><em>Published by ${SITE_NAME}</em></p>${plainContent.split("\n\n").map(p => `<p>${escapeHtml(p)}</p>`).join("")}<p><a href="${BASE_URL}/get-quote">Get a Free Quote</a> | <a href="${BASE_URL}/blog">More Articles</a> | Call ${PHONE}</p></article>`,
        };
        setCachedMeta(cleanPath, result);
        return result;
      }
    } catch (err) {
      console.error("[SEO Prerender] Failed to fetch blog post:", err);
    }
  }

  // 5. Check landing pages: /lp/:slug (noindex, but still useful for OG tags)
  const lpMatch = cleanPath.match(/^\/lp\/([a-z0-9-]+)$/);
  if (lpMatch) {
    setCachedMeta(cleanPath, null);
    return null; // Landing pages are noindex, skip prerendering
  }

  setCachedMeta(cleanPath, null);
  return null;
}

/**
 * Inject server-side meta tags into the HTML template.
 * Replaces the default <title>, <meta name="description">, OG tags, and canonical URL.
 */
export function injectMetaTags(html: string, meta: PageMeta): string {
  const ogImage = meta.ogImage || DEFAULT_IMAGE;
  const ogType = meta.ogType || "website";
  const fullCanonical = `${BASE_URL}${meta.canonical}`;

  // Inject crawler-visible body content into <div id="root">
  if (meta.crawlerBodyContent) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root"><noscript>${meta.crawlerBodyContent}</noscript></div>`
    );
  }

  // Replace title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(meta.title)}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${escapeAttr(fullCanonical)}" />`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`
  );
  html = html.replace(
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="${escapeAttr(ogType)}" />`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${escapeAttr(ogImage)}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${escapeAttr(fullCanonical)}" />`
  );

  // Replace Twitter Card tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`
  );

  return html;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Generate visible body content for crawlers — key pages
 */
function generateHomepageContent(): string {
  return `<div>
<h1>Concrete Concepts Group — Brisbane's Trusted Concreter</h1>
<p>QBCC Licensed (#15299707) concreting contractor serving Brisbane Southside, Northside, Bayside, Logan, Ipswich and Gold Coast. We specialise in concrete driveways, slabs, exposed aggregate, retaining walls, pool surrounds, patios and excavation.</p>
<h2>Our Services</h2>
<ul>
<li><a href="${BASE_URL}/services/concrete-driveways-brisbane">Concrete Driveways</a> — | <a href="${BASE_URL}/calculator">Cost Calculator</a> | Call ${PHONE}</p>
</div>`;
}

async function generateBlogListContent(): Promise<string> {
  try {
    const posts = await getAllBlogPosts();
    const postLinks = posts.slice(0, 20).map(p =>
      `<li><a href="${BASE_URL}/blog/${p.slug}">${escapeHtml(p.title)}</a> — ${escapeHtml(p.excerpt || "")}</li>`
    ).join("");
    return `<div><h1>Concreting Blog &amp; Guides</h1><p>Expert concreting tips, cost guides, and project inspiration for Brisbane homeowners from Concrete Concepts Group.</p><ul>${postLinks}</ul><p><a href="${BASE_URL}/get-quote">Get a Free Quote</a> | Call ${PHONE}</p></div>`;
  } catch {
    return "";
  }
}

function generateCalculatorContent(): string {
  return `<div>
<h1>Concrete Cost Calculator Brisbane — Free Instant Estimate</h1>
<p>Use our project planner to explore dimensions and finishes for your Brisbane project. A detailed quote is prepared only after we verify scope on site.</p>
<h2>Project Types</h2>
<ul>
<li>Driveway — standard, coloured and exposed aggregate finishes</li>
<li>House Slab — engineering and site requirements reviewed</li>
<li>Shed/Garage Slab — thickness and reinforcement confirmed for intended use</li>
<li>Patio/Entertaining — finish, drainage and access considered</li>
<li>Pool Surround — non-slip finishes and drainage planned</li>
<li>Retaining Wall — height, drainage and engineering assessed</li>
<li>Footpath/Pathway — final measure and site preparation verified</li>
</ul>
<h2>Concrete Finishes Available</h2>
<p>Standard broom finish, exposed aggregate, coloured concrete, covercrete, and polished concrete. Each finish has different pricing and aesthetic qualities.</p>
<p>For an itemised written quote, <a href="${BASE_URL}/get-quote">complete the detailed quote form</a> or call ${PHONE}. We verify finish, access, excavation, disposal, drainage, pumping, thickness, reinforcement and final measure before quoting.</p>
</div>`;
}

function generateQuotePageContent(): string {
  return `<div>
<h1>Get a Free Concreting Quote — Concrete Concepts Group Brisbane</h1>
<p>Request a free, no-obligation quote for your concreting project. We provide on-site assessments within 24 hours across Brisbane, Logan, Ipswich, and the Gold Coast.</p>
<h2>What We Need</h2>
<ul>
<li>Your name and contact details</li>
<li>Project suburb and address</li>
<li>Type of concreting work required</li>
<li>Approximate area size (if known)</li>
<li>Photos of the site (optional but helpful)</li>
</ul>
<h2>What Happens Next</h2>
<p>1. Submit your details below. 2. We'll call you within 2 hours during business hours. 3. We'll arrange a free on-site visit within 24 hours. 4. You'll receive a detailed written quote within 48 hours of the site visit.</p>
<p>QBCC Licensed #15299707 | Call ${PHONE} | <a href="${BASE_URL}">Back to Home</a></p>
</div>`;
}

function generateFAQContent(): string {
  return `<div>
<h1>Frequently Asked Questions — Concrete Concepts Group Brisbane</h1>
<h2>How much does concrete cost in Brisbane?</h2>
<p>Standard concrete starts | Call ${PHONE}</p>
</div>`;
}
