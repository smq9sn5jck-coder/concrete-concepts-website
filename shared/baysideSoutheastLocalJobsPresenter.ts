import {
  BAYSIDE_SOUTHEAST_SERVICE_SCOPE_SUMMARY,
  type BaysideSoutheastLocalityRecord,
} from "./baysideSoutheastLocalJobsContent";

export type BaysideSoutheastMetadata = {
  title: string;
  description: string;
  canonical: string;
};

type StructuredData = Record<string, unknown>;

const SITE_ORIGIN = "https://concreteconceptsgroup.com";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function localityLabel(slug: string) {
  return slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export function getBaysideSoutheastMetadata(record: BaysideSoutheastLocalityRecord): BaysideSoutheastMetadata {
  return {
    title: record.title,
    description: record.description,
    canonical: `/areas/${record.slug}`,
  };
}

export function getBaysideSoutheastStructuredData(record: BaysideSoutheastLocalityRecord): StructuredData[] {
  const path = `/areas/${record.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Service areas", item: `${SITE_ORIGIN}/areas` },
        { "@type": "ListItem", position: 2, name: record.locality, item: `${SITE_ORIGIN}${path}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Concrete services in ${record.locality}`,
      serviceType: record.services.map(service => service.name),
      areaServed: record.locality,
      provider: { "@type": "Organization", name: "Concrete Concepts Group" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: record.faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}

/**
 * Static preview markup is deliberately limited to the typed candidate record.
 * It supplies meaningful pre-hydration content without carrying legacy widgets,
 * unverified proof blocks, or a submission behaviour.
 */
export function renderBaysideSoutheastContentShell(record: BaysideSoutheastLocalityRecord) {
  const token = (audience: "general" | "homeowner" | "builder") =>
    `/get-quote?context=bayside-${record.slug}-${audience}`;
  const serviceCards = record.services.map(service => `
    <li><a href="/services/${escapeHtml(service.slug)}">${escapeHtml(service.name)}</a><p>${escapeHtml(service.description)}</p></li>`).join("");
  const practicalSections = record.practicalSections.map(section => `
    <section><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p></section>`).join("");
  const faqs = record.faqs.map(faq => `
    <article><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></article>`).join("");
  const nearby = record.nearbyLocalitySlugs.map(slug =>
    `<li><a href="/areas/${escapeHtml(slug)}">${escapeHtml(localityLabel(slug))}</a></li>`,
  ).join("");

  return `<main data-edge-bayside-southeast-shell="true">
  <nav aria-label="Breadcrumb"><a href="/areas">Service areas</a> <span aria-hidden="true">/</span> <span>${escapeHtml(record.locality)}</span></nav>
  <header><h1>${escapeHtml(record.h1)}</h1><p>${escapeHtml(record.intro)}</p>
    <p><a href="${token("general")}">Start a detailed quote</a></p>
    <div aria-label="Choose your enquiry type">
      <a href="${token("homeowner")}">I am a homeowner or property owner</a>
      <a href="${token("builder")}">I am a builder or developer</a>
    </div>
  </header>
  <section><h2>Concrete services to discuss</h2><p>${escapeHtml(BAYSIDE_SOUTHEAST_SERVICE_SCOPE_SUMMARY)}</p><ul>${serviceCards}</ul></section>
  ${practicalSections}
  <section><h2>Helpful details for a site review</h2><ul><li>Project address and intended use</li><li>Dimensions or an indication that they are not yet known</li><li>Existing surface, access, timing and relevant documents</li></ul></section>
  <section><h2>Frequently asked questions</h2>${faqs}</section>
  <section><h2>Nearby locality guides</h2><ul>${nearby}</ul></section>
</main>`;
}
