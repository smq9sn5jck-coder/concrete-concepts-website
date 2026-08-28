/*
  Breadcrumbs: Navigation breadcrumbs with BreadcrumbList schema markup
  Renders both visual breadcrumbs and JSON-LD structured data
*/
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const BASE_URL = "https://concreteconceptsgroup.com";

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const allItems = [{ label: "Home", href: "/" }, ...items];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 text-sm ${className}`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {allItems.map((item, index) => (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            )}
            {item.href ? (
              <Link href={item.href}>
                <span className="text-white/60 hover:text-brand-gold transition-colors cursor-pointer flex items-center gap-1">
                  {index === 0 && <Home className="w-3.5 h-3.5" />}
                  {item.label}
                </span>
              </Link>
            ) : (
              <span className="text-white/90 font-medium">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
