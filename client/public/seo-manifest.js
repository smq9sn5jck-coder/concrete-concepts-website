import {
  GENERATED_BATCH_ONE_BY_SLUG,
  GENERATED_BATCH_ONE_STRUCTURED_DATA_BY_SLUG,
  GENERATED_PUBLIC_LOCALITY_SLUGS,
  GENERATED_SOUTHSIDE_BY_SLUG,
  GENERATED_SOUTHSIDE_PREVIEW_ENABLED,
  GENERATED_SOUTHSIDE_STRUCTURED_DATA_BY_SLUG,
  getSouthsideLocalityRouteAccess,
} from "./locality-content.js";
import { GENERATED_OTHER_TRADE_PREVIEW_ENABLED } from "./other-trade-config.js";
import {
  GENERATED_GOLD_COAST_COVERAGE_GROUPS,
  GENERATED_GOLD_COAST_EXISTING_LOCALITIES,
  GENERATED_GOLD_COAST_OFFICIAL_RESOURCES,
  GENERATED_GOLD_COAST_PREVIEW_ENABLED,
  GENERATED_GOLD_COAST_PUBLISHED_ENABLED,
  GENERATED_GOLD_COAST_SERVICE_BY_SLUG,
  GENERATED_GOLD_COAST_STRUCTURED_DATA_BY_SLUG,
  GENERATED_GOLD_COAST_UPGRADE_BY_SLUG,
  getGoldCoastLocalityUpgradeAccess,
  getGoldCoastRouteAccess,
} from "./gold-coast-content.js";
import {
  GENERATED_BLOG_STRUCTURED_DATA_BY_SLUG,
  GENERATED_PUBLISHED_BLOG_BY_SLUG,
} from "./blog-content.js";
import {
  GENERATED_REGIONAL_SLAB_OFFICIAL_RESOURCES,
  GENERATED_REGIONAL_SLAB_PAGE_BY_PATH,
  GENERATED_REGIONAL_SLAB_PAGES,
  getRegionalSlabRouteAccess,
} from "./regional-slab-content.js";

const SITE_ORIGIN = "https://concreteconceptsgroup.com";

const CORE_METADATA = {
  "/": ["Concrete Concepts Group | Brisbane Concreting & Concrete Services", "QBCC licensed Brisbane concreters for driveways, slabs, exposed aggregate, paths, patios, pool surrounds, steps and retaining walls across SEQ."],
  "/get-quote": ["Get a Free Concrete Quote | Brisbane & SEQ | Concrete Concepts", "Request a detailed concrete quote in five guided steps. Add your Brisbane or SEQ location, job details, measurements, access information and optional photos."],
  "/services": ["Concrete Services Brisbane | Driveways, Slabs, Paths & More", "Explore CCG concrete services across Brisbane and SEQ, including driveways, slabs, paths, patios, pool surrounds, exposed aggregate, stairs and retaining walls."],
  "/areas": ["Brisbane & SEQ Concreting Service Areas | CCG", "Find Concrete Concepts Group concreting services across Brisbane, Ipswich, Logan, Moreton Bay, Redlands and surrounding South East Queensland suburbs."],
  "/blog": ["Brisbane Concreting Advice & Project Guides | CCG Blog", "Read practical Brisbane concreting guides covering costs, finishes, driveways, slabs, site preparation, approvals, maintenance and project planning."],
  "/gallery": ["Brisbane Concrete Project Gallery | Concrete Concepts Group", "View completed Brisbane and SEQ concrete driveways, slabs, paths, patios, pool surrounds, exposed aggregate and retaining wall projects by CCG."],
  "/gallery/process-technology": ["Concrete Process & Technology | Concrete Concepts Group", "See how Concrete Concepts Group plans, prepares and delivers concrete projects across Brisbane and South East Queensland."],
  "/visualiser": ["Concrete Finish Visualiser | Preview Your Brisbane Project", "Preview concrete finishes, stone mixes and border colours for your Brisbane or SEQ project, then request a detailed CCG quote."],
  "/guide": ["Free Homeowner's Guide to Concreting | Concrete Concepts Group", "Download CCG's Brisbane homeowner guide covering concrete finishes, project planning, costs, approvals, maintenance and common mistakes."],
  "/calculator": ["Concrete Cost Calculator Brisbane | CCG", "Estimate a starting range for a Brisbane concrete project, compare common options and request a detailed site-specific quote from Concrete Concepts Group."],
  "/faq": ["Concreting FAQs Brisbane | Concrete Concepts Group", "Find practical answers about Brisbane concrete quotes, preparation, access, finishes, curing, approvals, maintenance and project planning."],
  "/finishes": ["Concrete Finishes Brisbane | Compare Options with CCG", "Compare plain, coloured, exposed aggregate, honed and patterned concrete finishes for Brisbane and South East Queensland projects."],
  "/gallery/before-after": ["Concrete Before & After Gallery Brisbane | CCG", "View before-and-after examples of concrete driveways, slabs, paths, patios and outdoor areas completed across Brisbane and surrounding SEQ."],
  "/projects": ["Brisbane Concrete Projects | Concrete Concepts Group", "Explore selected Concrete Concepts Group driveway, slab, path, patio, pool surround and retaining wall projects across Brisbane and SEQ."],
  "/referral": ["Concrete Project Referrals Brisbane | CCG", "Read how Concrete Concepts Group handles suitable concrete project referrals across Brisbane and surrounding South East Queensland areas."],
  "/reviews": ["Concrete Concepts Group Reviews | Brisbane Projects", "Read published customer feedback about Concrete Concepts Group projects and request a detailed quote for concrete work in Brisbane and SEQ."],
  "/privacy": ["Privacy Policy | Concrete Concepts Group", "Read how Concrete Concepts Group handles website enquiries and customer information."],
  "/terms": ["Website Terms | Concrete Concepts Group", "Read the website terms for Concrete Concepts Group."],
};

const SERVICE_METADATA = {
  "/services/concrete-driveways-brisbane": ["Concrete Driveways Brisbane | Detailed Quotes from CCG", "Plan a concrete driveway in Brisbane or SEQ with options for plain, coloured and exposed aggregate finishes. Request a detailed quote from CCG."],
  "/services/exposed-aggregate-brisbane": ["Exposed Aggregate Concrete Brisbane | CCG", "Explore exposed aggregate concrete for Brisbane driveways, paths, patios and pool surrounds. Compare finishes and request a detailed CCG quote."],
  "/services/concrete-slabs-brisbane": ["Concrete Slabs Brisbane | Residential & Commercial CCG Quotes", "Request a detailed quote for concrete slabs across Brisbane and SEQ, including sheds, garages, extensions and commercial projects."],
  "/services/patios-pool-surrounds": ["Concrete Patios & Pool Surrounds Brisbane | CCG", "Plan a concrete patio, entertaining area or pool surround in Brisbane with finish options suited to your home and site."],
  "/services/retaining-walls-brisbane": ["Concrete Retaining Walls Brisbane | CCG Quotes", "Request a Brisbane retaining wall quote with site, access, height and finish details for review by Concrete Concepts Group."],
  "/services/concrete-paths-brisbane": ["Concrete Paths Brisbane | CCG", "Plan durable concrete paths and walkways for Brisbane homes, businesses and outdoor areas with a detailed CCG quote."],
  "/services/footpaths-brisbane": ["Concrete Footpaths Brisbane | CCG", "Request a quote for concrete footpaths, pedestrian access and property pathways across Brisbane and surrounding SEQ."],
  "/services/concrete-steps-stairs": ["Concrete Steps & Stairs Brisbane | CCG", "Plan concrete steps and stairs for sloping, split-level or raised Brisbane properties with site-specific quote information."],
  "/services/concrete-repairs-brisbane": ["Concrete Repairs Brisbane | CCG", "Request an assessment for suitable concrete repairs across Brisbane and SEQ, including damaged paths, slabs, edges and surfaces."],
  "/services/concrete-patios-brisbane": ["Concrete Patios Brisbane | Detailed Quotes from CCG", "Plan a Brisbane concrete patio or outdoor entertaining area with site-specific access, preparation, drainage and finish details for a CCG quote."],
  "/services/crossover-permits-brisbane": ["Driveway Crossover Permits Brisbane | CCG", "Understand common Brisbane driveway crossover planning and permit considerations, then request a detailed site-specific quote from CCG."],
  "/services/excavation-brisbane": ["Site Excavation Brisbane | Concrete Concepts Group", "Request a detailed quote for suitable excavation, site clearing and concrete preparation work across Brisbane and surrounding SEQ."],
  "/services/pool-surrounds-brisbane": ["Concrete Pool Surrounds Brisbane | CCG", "Plan a Brisbane concrete pool surround with practical finish, access, drainage and site-preparation information for a detailed CCG quote."],
  "/services/shed-slabs-brisbane": ["Concrete Shed Slabs Brisbane | CCG Quotes", "Request a detailed quote for a Brisbane or SEQ shed slab with dimensions, site access, preparation and intended-use information."],
};

const OTHER_TRADE_METADATA = {
  title: "Need Another Trade? | CCG Review Request",
  description: "Send a Brisbane or South East Queensland trade request for CCG review. No provider, availability, price, workmanship or response is guaranteed.",
  canonical: `${SITE_ORIGIN}/need-another-trade`,
  robots: "noindex, nofollow",
};

function titleCaseSlug(slug) {
  let decoded;
  try {
    decoded = decodeURIComponent(slug || "");
  } catch {
    return "";
  }
  return decoded.replace(/[^a-z0-9-]+/gi, "-").split("-").filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function escapeHtml(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function getBatchOneRecord(path) {
  if (!path.startsWith("/areas/")) return undefined;
  return GENERATED_BATCH_ONE_BY_SLUG[path.split("/").pop()];
}

function getSouthsideRecord(path, context = {}) {
  if (!path.startsWith("/areas/")) return undefined;
  const slug = path.split("/").pop();
  const record = GENERATED_SOUTHSIDE_BY_SLUG[slug];
  if (!record) return undefined;
  const access = getSouthsideLocalityRouteAccess(
    slug,
    context.customerHost ?? true,
    context.southsidePreviewEnabled ?? GENERATED_SOUTHSIDE_PREVIEW_ENABLED,
  );
  return access === "public" || access === "preview" ? record : undefined;
}

function getGoldCoastUpgradeRecord(path, context = {}) {
  if (!path.startsWith("/areas/")) return undefined;
  const slug = path.split("/").pop();
  const record = GENERATED_GOLD_COAST_UPGRADE_BY_SLUG[slug];
  if (!record) return undefined;
  const access = getGoldCoastLocalityUpgradeAccess(slug, context.customerHost ?? true);
  return access === "public" || access === "preview" ? record : undefined;
}

function getLocalityRecord(path, context = {}) {
  return getGoldCoastUpgradeRecord(path, context) || getSouthsideRecord(path, context) || getBatchOneRecord(path);
}

function getLocalityStructuredData(path, context = {}) {
  const goldCoastRecord = getGoldCoastUpgradeRecord(path, context);
  if (goldCoastRecord) {
    return GENERATED_GOLD_COAST_STRUCTURED_DATA_BY_SLUG[goldCoastRecord.slug] || [];
  }
  const southsideRecord = getSouthsideRecord(path, context);
  if (southsideRecord) {
    return GENERATED_SOUTHSIDE_STRUCTURED_DATA_BY_SLUG[southsideRecord.slug] || [];
  }
  const batchOneRecord = getBatchOneRecord(path);
  if (batchOneRecord) {
    return GENERATED_BATCH_ONE_STRUCTURED_DATA_BY_SLUG[batchOneRecord.slug] || [];
  }
  return [];
}

function serializeStructuredData(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function renderStructuredData(values) {
  return values.map(value => `<script type="application/ld+json">${serializeStructuredData(value)}</script>`).join("");
}

function regionalSlabStructuredData(page) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: page.breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: `${SITE_ORIGIN}${item.path || page.path}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.name,
      serviceType: "Site-specific concrete slab and footing quote review",
      areaServed: { "@type": "AdministrativeArea", name: page.regionLabel },
      provider: { "@type": "HomeAndConstructionBusiness", "@id": `${SITE_ORIGIN}/#business`, name: "Concrete Concepts Group Pty Ltd" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}

export function renderRegionalSlabContentShell(pathname, context = {}) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const access = getRegionalSlabRouteAccess(path, context.customerHost ?? true);
  if (access !== "public" && access !== "preview") return "";
  if (path === "/regional-slab-review") {
    const links = GENERATED_REGIONAL_SLAB_PAGES.map(page => `<li><a href="${escapeHtml(page.path)}">${escapeHtml(page.name)}</a>: ${escapeHtml(page.description)}</li>`).join("");
    return `<main data-edge-regional-slab-shell="true"><article><p>Noindex release candidate</p><h1>Regional slab and extension review index</h1><p>Review the approved regional pages, raw crawlable content, local-only quote handoffs and unchanged five-step detailed quote boundary.</p><ul>${links}</ul></article></main>`;
  }
  const page = GENERATED_REGIONAL_SLAB_PAGE_BY_PATH[path];
  if (!page) return "";
  const list = values => `<ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
  const coverage = page.coverage.map(value => `<li>${escapeHtml(value)}</li>`).join("");
  const related = page.relatedLinks.map(link => `<li><a href="${escapeHtml(link.path)}">${escapeHtml(link.label)}</a></li>`).join("");
  const resources = page.resources.map(key => GENERATED_REGIONAL_SLAB_OFFICIAL_RESOURCES[key]).filter(Boolean).map(resource => `<li><a href="${escapeHtml(resource.url)}">${escapeHtml(resource.label)}</a>: ${escapeHtml(resource.summary)}</li>`).join("");
  const faqs = page.faqs.map(faq => `<article><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></article>`).join("");
  return `${renderStructuredData(regionalSlabStructuredData(page))}<main data-edge-regional-slab-shell="true"><article><p>${escapeHtml(page.regionLabel)} · site-specific review</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.intro)}</p><p><a href="/get-quote">Request a site-specific concrete quote</a></p><h2>Suitable concrete scopes</h2>${list(page.scope)}<h2>What CCG needs to quote</h2>${list(page.quoteInputs)}<h2>Project boundaries</h2>${list(page.cautions)}<h2>Coverage considered</h2><ul>${coverage}</ul><h2>Official customer resources</h2><ul>${resources}</ul><h2>Related pages</h2><ul>${related}</ul><h2>Frequently asked questions</h2>${faqs}</article></main>`;
}

function goldCoastServiceStructuredData(page) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Gold Coast", item: `${SITE_ORIGIN}/areas/gold-coast` },
        { "@type": "ListItem", position: 2, name: page.serviceName, item: `${SITE_ORIGIN}/gold-coast/${page.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${page.serviceName} — North and Central Gold Coast review`,
      serviceType: page.serviceName,
      areaServed: { "@type": "AdministrativeArea", name: "North and Central Gold Coast" },
      provider: { "@type": "HomeAndConstructionBusiness", "@id": `${SITE_ORIGIN}/#business`, name: "Concrete Concepts Group Pty Ltd" },
    },
  ];
}

export function renderGoldCoastContentShell(pathname, context = {}) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  if (getGoldCoastRouteAccess(path, context.customerHost ?? true) === "not-found") return "";
  if (path === "/gold-coast-review") {
    const serviceLinks = Object.values(GENERATED_GOLD_COAST_SERVICE_BY_SLUG).map(page => `<li><a href="/gold-coast/${escapeHtml(page.slug)}">${escapeHtml(page.serviceName)}</a></li>`).join("");
    const localityLinks = GENERATED_GOLD_COAST_EXISTING_LOCALITIES.map(locality => `<li><a href="/areas/${escapeHtml(locality.slug)}">${escapeHtml(locality.name)}</a></li>`).join("");
    return `<main data-edge-gold-coast-shell="true"><article><p>Noindex release candidate</p><h1>North + Central Gold Coast review index</h1><p>Review the proposed coverage hub, focused service pages, typed locality upgrades and unchanged detailed quote handoff.</p><p><a href="/areas/gold-coast">Open coverage hub</a></p><h2>Focused service pages</h2><ul>${serviceLinks}</ul><h2>Existing locality cluster</h2><ul>${localityLinks}</ul></article></main>`;
  }
  if (path === "/areas/gold-coast") {
    const services = Object.values(GENERATED_GOLD_COAST_SERVICE_BY_SLUG).map(page => `<li><a href="/gold-coast/${escapeHtml(page.slug)}">${escapeHtml(page.serviceName)}</a>: ${escapeHtml(page.description)}</li>`).join("");
    const coverage = GENERATED_GOLD_COAST_COVERAGE_GROUPS.map(group => `<section><h2>${escapeHtml(group.label)}</h2><p>${group.areas.map(escapeHtml).join(", ")}. Addresses are reviewed against the actual scope and site; inclusion here is not automatic acceptance.</p></section>`).join("");
    const localities = GENERATED_GOLD_COAST_EXISTING_LOCALITIES.map(locality => `<li><a href="/areas/${escapeHtml(locality.slug)}">${escapeHtml(locality.name)}</a></li>`).join("");
    const resources = Object.values(GENERATED_GOLD_COAST_OFFICIAL_RESOURCES).map(resource => `<li><a href="${escapeHtml(resource.url)}">${escapeHtml(resource.label)}</a>: ${escapeHtml(resource.summary)}</li>`).join("");
    const schema = goldCoastServiceStructuredData({ slug: "", serviceName: "North and Central Gold Coast residential concreting review" });
    return `${renderStructuredData(schema)}<main data-edge-gold-coast-shell="true"><article><p>Proposed service-area review</p><h1>North + Central Gold Coast concrete project review</h1><p>CCG is reviewing suitable residential concrete enquiries across the northern and central Gold Coast. Acceptance depends on the address, scope, access, site conditions and current scheduling.</p><p><a href="/get-quote">Start a detailed quote</a></p><h2>Focused residential scopes</h2><ul>${services}</ul>${coverage}<h2>Existing Gold Coast locality guides</h2><ul>${localities}</ul><h2>Official customer resources</h2><p>These are customer resources, not CCG approval, engineering or certification advice.</p><ul>${resources}</ul></article></main>`;
  }
  const serviceSlug = path.match(/^\/gold-coast\/([a-z0-9-]+)$/)?.[1];
  const page = serviceSlug ? GENERATED_GOLD_COAST_SERVICE_BY_SLUG[serviceSlug] : undefined;
  if (!page) return "";
  const list = values => `<ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
  const localities = page.relatedLocalitySlugs.map(slug => { const locality = GENERATED_GOLD_COAST_EXISTING_LOCALITIES.find(item => item.slug === slug); return `<li><a href="/areas/${escapeHtml(slug)}">${escapeHtml(locality?.name || titleCaseSlug(slug))}</a></li>`; }).join("");
  const services = page.relatedServiceSlugs.map(slug => { const service = GENERATED_GOLD_COAST_SERVICE_BY_SLUG[slug]; return `<li><a href="/gold-coast/${escapeHtml(slug)}">${escapeHtml(service?.serviceName || titleCaseSlug(slug))}</a></li>`; }).join("");
  const resources = page.resources.map(key => GENERATED_GOLD_COAST_OFFICIAL_RESOURCES[key]).map(resource => `<li><a href="${escapeHtml(resource.url)}">${escapeHtml(resource.label)}</a>: ${escapeHtml(resource.summary)}</li>`).join("");
  return `${renderStructuredData(goldCoastServiceStructuredData(page))}<main data-edge-gold-coast-shell="true"><article><p>North + Central Gold Coast · service-area review</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.intro)}</p><p><a href="/get-quote">Start a detailed quote</a></p><h2>Scope considered</h2>${list(page.scope)}<h2>Information that helps the quote</h2>${list(page.quoteInputs)}<h2>Property-specific checks</h2>${list(page.cautions)}<h2>Related Gold Coast areas</h2><ul>${localities}</ul><h2>Related services</h2><ul>${services}</ul><h2>Official customer resources</h2><p>These links are customer resources, not CCG approval, engineering or certification advice.</p><ul>${resources}</ul></article></main>`;
}

function renderMarkdownForEdge(markdown) {
  const lines = String(markdown || "").split("\n");
  const parts = [];
  let listItems = [];
  const flushList = () => {
    if (listItems.length) parts.push(`<ul>${listItems.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { flushList(); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = heading[1].length === 1 ? 2 : Math.min(heading[1].length + 1, 4);
      parts.push(`<h${level}>${escapeHtml(heading[2].replaceAll("*", ""))}</h${level}>`);
    } else if (/^[-*]\s+/.test(line)) {
      listItems.push(line.replace(/^[-*]\s+/, "").replaceAll("*", ""));
    } else {
      flushList();
      parts.push(`<p>${escapeHtml(line.replaceAll("*", ""))}</p>`);
    }
  }
  flushList();
  return parts.join("");
}

export function renderBlogContentShell(pathname, context = {}) {
  if (!GENERATED_GOLD_COAST_PREVIEW_ENABLED || context.customerHost !== false) return "";
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const slug = path.match(/^\/blog\/([a-z0-9-]+)$/)?.[1];
  const post = slug ? GENERATED_PUBLISHED_BLOG_BY_SLUG[slug] : undefined;
  if (!post) return "";
  const schema = GENERATED_BLOG_STRUCTURED_DATA_BY_SLUG[slug];
  return `${renderStructuredData(schema ? [schema] : [])}<main data-edge-blog-shell="true"><article><p>${escapeHtml(post.category)} · ${escapeHtml(post.readTimeMinutes)} min read</p><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.excerpt)}</p>${renderMarkdownForEdge(post.content)}<p><a href="/get-quote">Request a detailed quote</a></p><p><a href="/blog">Back to all articles</a></p></article></main>`;
}

export function renderLocalityContentShell(pathname, context = {}) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const record = getLocalityRecord(path, context);
  if (!record) return "";
  const services = record.services.map(service => `<li><a href="/services/${escapeHtml(service.slug)}">${escapeHtml(service.name)}</a>: ${escapeHtml(service.description)}</li>`).join("");
  const faqs = record.faqs.map(faq => `<article><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></article>`).join("");
  const nearby = record.nearbyLocalitySlugs.map(slug => `<li><a href="/areas/${escapeHtml(slug)}">${escapeHtml(titleCaseSlug(slug))}</a></li>`).join("");
  const sources = record.localityContext.sourceUrls.map((sourceUrl, index) => `<li><a href="${escapeHtml(sourceUrl)}">${escapeHtml(record.localityContext.sourceLabel)}${record.localityContext.sourceUrls.length > 1 ? ` — source ${index + 1}` : ""}</a></li>`).join("");
  const structuredData = getLocalityStructuredData(path, context)
    .map(value => `<script type="application/ld+json">${serializeStructuredData(value)}</script>`)
    .join("");
  return `${structuredData}<main data-edge-locality-shell="true"><article><p>${escapeHtml(record.region)} · ${escapeHtml(record.lga)} · ${escapeHtml(record.postcode)}</p><h1>${escapeHtml(record.h1)}</h1><p>${escapeHtml(record.intro)}</p><h2>Practical site considerations</h2><p>${escapeHtml(record.practicalConsiderations)}</p><h2>Locality context</h2><p>${escapeHtml(record.localityContext.attribution)}</p><p>Sources reviewed: ${escapeHtml(record.localityContext.claimDate)}</p><ul>${sources}</ul><h2>Relevant concrete services</h2><ul>${services}</ul><h2>Frequently asked questions</h2>${faqs}<h2>Nearby live locality guides</h2><ul>${nearby}</ul><p><a href="${escapeHtml(record.regionalHub.path)}">${escapeHtml(record.regionalHub.label)}</a></p><p><a href="/get-quote">Start a detailed quote</a></p></article></main>`;
}

export function renderOtherTradeContentShell(pathname, previewEnabled = GENERATED_OTHER_TRADE_PREVIEW_ENABLED) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  if (path !== "/need-another-trade" || !previewEnabled) return "";
  return `<main data-edge-other-trade-shell="true"><article><p>Concrete Concepts Group · Brisbane and South East Queensland</p><h1>Need another trade?</h1><p>Choose a direct CCG concreting quote or send another-trade details to CCG for review.</p><section><h2>Concreting quote</h2><p>CCG handles concreting directly through its detailed five-step quote.</p><p><a href="/get-quote">Start a detailed concreting quote</a></p></section><section><h2>Another trade request</h2><p>Send a separate request for CCG to review. This is not a booking or guaranteed provider match.</p><p>With your separate consent, CCG may share the contact details, job information and optional photos you provide with one suitable independent service provider. Requests are not automatically forwarded.</p></section></article></main>`;
}

export function getSeoMetadata(pathname, otherTradePreviewEnabled = GENERATED_OTHER_TRADE_PREVIEW_ENABLED, localityContext = {}) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const regionalAccess = getRegionalSlabRouteAccess(path, localityContext.customerHost ?? true);
  if (regionalAccess === "public" || regionalAccess === "preview") {
    if (path === "/regional-slab-review") return { title: "Regional Slab Release Candidate Review | CCG", description: "Preview-only review index for CCG regional house slab, extension slab, readiness guide and quote qualification candidates.", canonical: `${SITE_ORIGIN}${path}`, robots: "noindex, nofollow" };
    const page = GENERATED_REGIONAL_SLAB_PAGE_BY_PATH[path];
    if (page) return { title: page.title, description: page.description, canonical: page.canonical, robots: regionalAccess === "preview" ? "noindex, nofollow" : "index, follow" };
  }
  if (path === "/need-another-trade" && otherTradePreviewEnabled) return OTHER_TRADE_METADATA;
  if (CORE_METADATA[path]) return { title: CORE_METADATA[path][0], description: CORE_METADATA[path][1], canonical: `${SITE_ORIGIN}${path === "/" ? "" : path}`, robots: "index, follow" };
  if (SERVICE_METADATA[path]) return { title: SERVICE_METADATA[path][0], description: SERVICE_METADATA[path][1], canonical: `${SITE_ORIGIN}${path}`, robots: "index, follow" };
  const goldCoastAccess = getGoldCoastRouteAccess(path, localityContext.customerHost ?? true);
  if (goldCoastAccess === "public" || goldCoastAccess === "preview") {
    if (path === "/gold-coast-review") return { title: "Gold Coast Release Candidate Review | CCG", description: "Preview-only review index for the North and Central Gold Coast service hub, focused service pages and locality upgrades.", canonical: `${SITE_ORIGIN}${path}`, robots: "noindex, nofollow" };
    if (path === "/areas/gold-coast") return { title: "North + Central Gold Coast Concreting | CCG Review", description: "Explore CCG's proposed North and Central Gold Coast residential concreting coverage, services, locality guides and property-specific quote requirements.", canonical: `${SITE_ORIGIN}${path}`, robots: goldCoastAccess === "preview" ? "noindex, nofollow" : "index, follow" };
    const page = GENERATED_GOLD_COAST_SERVICE_BY_SLUG[path.split("/").pop()];
    if (page) return { title: page.title, description: page.description, canonical: `${SITE_ORIGIN}${path}`, robots: goldCoastAccess === "preview" ? "noindex, nofollow" : "index, follow" };
  }
  const blogSlug = path.match(/^\/blog\/([a-z0-9-]+)$/)?.[1];
  const blogPost = blogSlug
    ? GENERATED_PUBLISHED_BLOG_BY_SLUG[blogSlug]
    : undefined;
  if (blogPost) return { title: `${blogPost.metaTitle || blogPost.title} | Concrete Concepts Group`, description: blogPost.metaDescription || blogPost.excerpt, canonical: `${SITE_ORIGIN}${path}`, robots: "index, follow" };
  const localityRecord = getLocalityRecord(path, localityContext);
  if (localityRecord) return { title: localityRecord.title, description: localityRecord.description, canonical: `${SITE_ORIGIN}${path}`, robots: "index, follow" };
  if (path.startsWith("/areas/")) {
    const slug = path.split("/").pop();
    if (GENERATED_PUBLIC_LOCALITY_SLUGS.includes(slug)) {
      const suburb = titleCaseSlug(slug);
      return { title: `Concreting ${suburb} | Local Concrete Quotes from CCG`, description: `Request a detailed concreting quote in ${suburb} for driveways, slabs, paths, patios, exposed aggregate and other concrete projects.`, canonical: `${SITE_ORIGIN}${path}`, robots: "index, follow" };
    }
    return { title: "Area Not Found | Concrete Concepts Group", description: "The requested Concrete Concepts Group service-area page could not be found.", canonical: `${SITE_ORIGIN}${path}`, robots: "noindex, follow" };
  }
  if (path.startsWith("/blog/")) {
    return { title: "Article Not Found | Concrete Concepts Group", description: "The requested Concrete Concepts Group article could not be found.", canonical: `${SITE_ORIGIN}${path}`, robots: "noindex, nofollow" };
  }
  if (path.startsWith("/lp/")) {
    const topic = titleCaseSlug(path.split("/").pop());
    return { title: `${topic} | Concrete Concepts Group`, description: `Request a detailed CCG quote for ${topic.toLowerCase()} in Brisbane and surrounding South East Queensland.`, canonical: `${SITE_ORIGIN}${path}`, robots: "noindex, follow" };
  }
  const topic = titleCaseSlug(path.split("/").pop()) || "Concrete Concepts Group";
  return { title: `${topic} | Concrete Concepts Group Brisbane`, description: "Concrete Concepts Group provides detailed concreting information and quote options across Brisbane and South East Queensland.", canonical: `${SITE_ORIGIN}${path}`, robots: "noindex, follow" };
}

function replaceOrInsert(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `  ${replacement}\n</head>`);
}

export function applySeoMetadata(html, pathname, robotsOverride, localityContext = {}) {
  const meta = getSeoMetadata(pathname, undefined, localityContext);
  const robots = robotsOverride || meta.robots;
  const safeTitle = escapeHtml(meta.title);
  const safeDescription = escapeHtml(meta.description);
  const safeCanonical = escapeHtml(meta.canonical);
  const safeRobots = escapeHtml(robots);
  let output = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);
  output = replaceOrInsert(output, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${safeDescription}">`);
  output = replaceOrInsert(output, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${safeCanonical}">`);
  output = replaceOrInsert(output, /<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="${safeRobots}">`);
  output = replaceOrInsert(output, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${safeTitle}">`);
  output = replaceOrInsert(output, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${safeDescription}">`);
  output = replaceOrInsert(output, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${safeCanonical}">`);
  const contentShell = renderRegionalSlabContentShell(pathname, localityContext)
    || renderGoldCoastContentShell(pathname, localityContext)
    || renderLocalityContentShell(pathname, localityContext)
    || renderBlogContentShell(pathname, localityContext)
    || renderOtherTradeContentShell(pathname);
  if (contentShell) {
    output = output.replace(
      /(<div\s+id=["']root["'][^>]*>)[\s\S]*?<\/div>(\s*(?=<script\b))/i,
      `$1${contentShell}</div>$2`,
    );
  }
  return output;
}

export function filterPublicSitemap(xml) {
  return xml.replace(/\s*<url>\s*<loc>https:\/\/concreteconceptsgroup\.com\/lp\/[^<]+<\/loc>[\s\S]*?<\/url>/g, "")
    .replace(/\s*<lastmod>2026-07-19<\/lastmod>/g, "");
}
