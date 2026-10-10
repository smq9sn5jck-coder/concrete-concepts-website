/* Visible breadcrumb navigation. Route JSON-LD is owned by SEOHead and the edge. */
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem { label: string; href?: string }
interface BreadcrumbsProps { items: BreadcrumbItem[]; className?: string }

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const allItems = [{ label: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-sm ${className}`} style={{ fontFamily: "var(--font-body)" }}>
      {allItems.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-white/30" />}
          {item.href ? (
            <Link href={item.href}>
              <span className="text-white/60 hover:text-brand-gold transition-colors cursor-pointer flex items-center gap-1">
                {index === 0 && <Home className="w-3.5 h-3.5" />}{item.label}
              </span>
            </Link>
          ) : <span className="text-white/90 font-medium">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
