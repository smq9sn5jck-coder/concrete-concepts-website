import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  REGIONAL_SLAB_NEW_PATHS,
  REGIONAL_SLAB_OFFICIAL_RESOURCES,
  REGIONAL_SLAB_PAGES,
  REGIONAL_SLAB_REVIEW_PATHS,
} from "../shared/regionalSlabContent";

const root = resolve(import.meta.dirname, "..");
const publicDirectory = resolve(root, "client/public");
const clientGeneratedDirectory = resolve(root, "client/src/generated");
const previewEnabled = process.env.VITE_REGIONAL_SLAB_PREVIEW === "true";
const publishedEnabled = process.env.VITE_REGIONAL_SLAB_PUBLISHED === "true";
const serialize = (value: unknown) => JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");

await Promise.all([
  mkdir(publicDirectory, { recursive: true }),
  mkdir(clientGeneratedDirectory, { recursive: true }),
]);

await writeFile(
  resolve(publicDirectory, "regional-slab-content.js"),
  `// GENERATED FILE — run pnpm regional-slab:generate. Do not edit by hand.\nexport const GENERATED_REGIONAL_SLAB_PREVIEW_ENABLED = ${previewEnabled};\nexport const GENERATED_REGIONAL_SLAB_PUBLISHED_ENABLED = ${publishedEnabled};\nexport const GENERATED_REGIONAL_SLAB_OFFICIAL_RESOURCES = ${serialize(REGIONAL_SLAB_OFFICIAL_RESOURCES)};\nexport const GENERATED_REGIONAL_SLAB_PAGES = ${serialize(REGIONAL_SLAB_PAGES)};\nexport const GENERATED_REGIONAL_SLAB_REVIEW_PATHS = ${serialize(REGIONAL_SLAB_REVIEW_PATHS)};\nexport const GENERATED_REGIONAL_SLAB_NEW_PATHS = ${serialize(REGIONAL_SLAB_NEW_PATHS)};\nexport const GENERATED_REGIONAL_SLAB_PAGE_BY_PATH = Object.fromEntries(GENERATED_REGIONAL_SLAB_PAGES.map(page => [page.path, page]));\n\nexport function getRegionalSlabRouteAccess(path, customerHost) {\n  if (path === "/regional-slab-review") return !customerHost && GENERATED_REGIONAL_SLAB_PREVIEW_ENABLED ? "preview" : "not-found";\n  if (!GENERATED_REGIONAL_SLAB_PAGE_BY_PATH[path]) return "not-found";\n  const existingCustomerRoute = path === "/services/concrete-slabs-brisbane";\n  if (customerHost) {\n    if (GENERATED_REGIONAL_SLAB_PUBLISHED_ENABLED) return "public";\n    return existingCustomerRoute ? "legacy" : "not-found";\n  }\n  if (GENERATED_REGIONAL_SLAB_PREVIEW_ENABLED) return "preview";\n  return existingCustomerRoute ? "legacy" : "not-found";\n}\n`,
  "utf8",
);

await writeFile(
  resolve(clientGeneratedDirectory, "regionalSlabConfig.ts"),
  `// GENERATED FILE — run pnpm regional-slab:generate. Do not edit by hand.\nexport const REGIONAL_SLAB_PREVIEW_ENABLED = ${previewEnabled};\nexport const REGIONAL_SLAB_PUBLISHED_ENABLED = ${publishedEnabled};\n`,
  "utf8",
);

console.log(`Generated regional slab flags (preview=${previewEnabled}, published=${publishedEnabled}).`);
