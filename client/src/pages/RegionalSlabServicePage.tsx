import { useLocation } from "wouter";
import RegionalSlabPageContent from "@/components/RegionalSlabPageContent";
import { REGIONAL_SLAB_PAGE_BY_PATH } from "@shared/regionalSlabContent";

export default function RegionalSlabServicePage() {
  const [path] = useLocation();
  const page = REGIONAL_SLAB_PAGE_BY_PATH[path];
  return page ? <RegionalSlabPageContent page={page} /> : null;
}
