interface ServiceAreaHashDocument {
  getElementById(id: string): { scrollIntoView(options?: ScrollIntoViewOptions): void } | null;
}

export function scrollToServiceAreaHash(
  hash: string,
  documentRef: ServiceAreaHashDocument = document,
) {
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!fragment) return false;

  let id: string;
  try {
    id = decodeURIComponent(fragment);
  } catch {
    return false;
  }

  const target = documentRef.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ block: "start" });
  return true;
}
