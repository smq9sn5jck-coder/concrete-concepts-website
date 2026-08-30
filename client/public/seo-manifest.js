const SITE_ORIGIN = "https://concreteconceptsgroup.com";

const CORE_METADATA = {
  "/": {
    title: "Concrete Concepts Group | Brisbane Concreting & Concrete Services",
    description: "QBCC licensed Brisbane concreters for driveways, slabs, exposed aggregate, paths, patios, pool surrounds, steps and retaining walls across SEQ.",
  },
  "/get-quote": {
    title: "Get a Free Concrete Quote | Brisbane & SEQ | Concrete Concepts",
    description: "Request a detailed concrete quote in five guided steps. Add your Brisbane or SEQ location, job details, measurements, access information and optional photos.",
  },
  "/services": {
    title: "Concrete Services Brisbane | Driveways, Slabs, Paths & More",
    description: "Explore CCG concrete services across Brisbane and SEQ, including driveways, slabs, paths, patios, pool surrounds, exposed aggregate, stairs and retaining walls.",
  },
  "/areas": {
    title: "Brisbane & SEQ Concreting Service Areas | CCG",
    description: "Find Concrete Concepts Group concreting services across Brisbane, Ipswich, Logan, Moreton Bay, Redlands and surrounding South East Queensland suburbs.",
  },
  "/blog": {
    title: "Brisbane Concreting Advice & Project Guides | CCG Blog",
    description: "Read practical Brisbane concreting guides covering costs, finishes, driveways, slabs, site preparation, approvals, maintenance and project planning.",
  },
  "/gallery": {
    title: "Brisbane Concrete Project Gallery | Concrete Concepts Group",
    description: "View completed Brisbane and SEQ concrete driveways, slabs, paths, patios, pool surrounds, exposed aggregate and retaining wall projects by CCG.",
  },
  "/gallery/process-technology": {
    title: "Concrete Process & Technology | Concrete Concepts Group",
    description: "See how Concrete Concepts Group plans, prepares and delivers concrete projects across Brisbane and South East Queensland.",
  },
  "/visualiser": {
    title: "Concrete Finish Visualiser | Preview Your Brisbane Project",
    description: "Preview concrete finishes, stone mixes and border colours for your Brisbane or SEQ project, then request a detailed CCG quote.",
  },
  "/guide": {
    title: "Free Homeowner's Guide to Concreting | Concrete Concepts Group",
    description: "Download CCG's Brisbane homeowner guide covering concrete finishes, project planning, costs, approvals, maintenance and common mistakes.",
  },
  "/calculator": {
    title: "Concrete Cost Calculator Brisbane | CCG",
    description: "Estimate a starting range for a Brisbane concrete project, compare common options and request a detailed site-specific quote from Concrete Concepts Group.",
  },
  "/faq": {
    title: "Concreting FAQs Brisbane | Concrete Concepts Group",
    description: "Find practical answers about Brisbane concrete quotes, preparation, access, finishes, curing, approvals, maintenance and project planning.",
  },
  "/finishes": {
    title: "Concrete Finishes Brisbane | Compare Options with CCG",
    description: "Compare plain, coloured, exposed aggregate, honed and patterned concrete finishes for Brisbane and South East Queensland projects.",
  },
  "/gallery/before-after": {
    title: "Concrete Before & After Gallery Brisbane | CCG",
    description: "View before-and-after examples of concrete driveways, slabs, paths, patios and outdoor areas completed across Brisbane and surrounding SEQ.",
  },
  "/projects": {
    title: "Brisbane Concrete Projects | Concrete Concepts Group",
    description: "Explore selected Concrete Concepts Group driveway, slab, path, patio, pool surround and retaining wall projects across Brisbane and SEQ.",
  },
  "/referral": {
    title: "Concrete Project Referrals Brisbane | CCG",
    description: "Read how Concrete Concepts Group handles suitable concrete project referrals across Brisbane and surrounding South East Queensland areas.",
  },
  "/reviews": {
    title: "Concrete Concepts Group Reviews | Brisbane Projects",
    description: "Read published customer feedback about Concrete Concepts Group projects and request a detailed quote for concrete work in Brisbane and SEQ.",
  },
  "/privacy": {
    title: "Privacy Policy | Concrete Concepts Group",
    description: "Read how Concrete Concepts Group handles website enquiries and customer information.",
  },
  "/terms": {
    title: "Website Terms | Concrete Concepts Group",
    description: "Read the website terms for Concrete Concepts Group.",
  },
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

function titleCaseSlug(slug) {
  return decodeURIComponent(slug || "")
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getSeoMetadata(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  if (CORE_METADATA[path]) return { ...CORE_METADATA[path], canonical: `${SITE_ORIGIN}${path === "/" ? "" : path}`, robots: "index, follow" };
  if (SERVICE_METADATA[path]) {
    return { title: SERVICE_METADATA[path][0], description: SERVICE_METADATA[path][1], canonical: `${SITE_ORIGIN}${path}`, robots: "index, follow" };
  }
  if (path.startsWith("/areas/")) {
    const suburb = titleCaseSlug(path.split("/").pop());
    return {
      title: `Concreting ${suburb} | Local Concrete Quotes from CCG`,
      description: `Request a detailed concreting quote in ${suburb} for driveways, slabs, paths, patios, exposed aggregate and other concrete projects.`,
      canonical: `${SITE_ORIGIN}${path}`,
      robots: "index, follow",
    };
  }
  if (path.startsWith("/blog/")) {
    const topic = titleCaseSlug(path.split("/").pop());
    return {
      title: `${topic} | CCG Brisbane Concreting Guide`,
      description: `Read CCG's Brisbane and SEQ guide to ${topic.toLowerCase()}, with practical project planning information and quote options.`,
      canonical: `${SITE_ORIGIN}${path}`,
      robots: "index, follow",
    };
  }
  if (path.startsWith("/lp/")) {
    const topic = titleCaseSlug(path.split("/").pop());
    return {
      title: `${topic} | Concrete Concepts Group`,
      description: `Request a detailed CCG quote for ${topic.toLowerCase()} in Brisbane and surrounding South East Queensland.`,
      canonical: `${SITE_ORIGIN}${path}`,
      robots: "noindex, follow",
    };
  }
  const topic = titleCaseSlug(path.split("/").pop()) || "Concrete Concepts Group";
  return {
    title: `${topic} | Concrete Concepts Group Brisbane`,
    description: `Concrete Concepts Group provides detailed concreting information and quote options across Brisbane and South East Queensland.`,
    canonical: `${SITE_ORIGIN}${path}`,
    robots: "noindex, follow",
  };
}

function replaceOrInsert(html, pattern, replacement) {
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace("</head>", `  ${replacement}\n</head>`);
}

export function applySeoMetadata(html, pathname) {
  const meta = getSeoMetadata(pathname);
  let output = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);
  output = replaceOrInsert(output, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${meta.description}">`);
  output = replaceOrInsert(output, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${meta.canonical}">`);
  output = replaceOrInsert(output, /<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="${meta.robots}">`);
  output = replaceOrInsert(output, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${meta.title}">`);
  output = replaceOrInsert(output, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${meta.description}">`);
  output = replaceOrInsert(output, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${meta.canonical}">`);
  return output;
}

export function filterPublicSitemap(xml) {
  return xml
    .replace(/\s*<url>\s*<loc>https:\/\/concreteconceptsgroup\.com\/lp\/[^<]+<\/loc>[\s\S]*?<\/url>/g, "")
    .replace(/\s*<lastmod>2026-07-19<\/lastmod>/g, "");
}
