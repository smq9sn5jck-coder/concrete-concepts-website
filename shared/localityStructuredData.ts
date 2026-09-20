import type { LocalityContentRecord } from "./localityContent.schema";

export function buildLocalityStructuredData(record: LocalityContentRecord) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Service Areas",
          item: "https://concreteconceptsgroup.com/areas",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: record.locality,
          item: `https://concreteconceptsgroup.com/areas/${record.slug}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Residential concreting in ${record.locality}`,
      serviceType: record.services.map(service => service.name),
      areaServed: {
        "@type": "AdministrativeArea",
        name: `${record.locality}, ${record.lga}`,
      },
      provider: {
        "@type": "HomeAndConstructionBusiness",
        "@id": "https://concreteconceptsgroup.com/#business",
        name: "Concrete Concepts Group Pty Ltd",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: record.faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];
}
