import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  BAYSIDE_SOUTHEAST_BY_SLUG,
  BAYSIDE_SOUTHEAST_LOCALITIES,
  BAYSIDE_SOUTHEAST_REVIEW_PATH,
  BAYSIDE_SOUTHEAST_ROUTES,
} from "../shared/baysideSoutheastLocalJobsContent";
import {
  getBaysideSoutheastMetadata as getSharedBaysideSoutheastMetadata,
  getBaysideSoutheastStructuredData,
  renderBaysideSoutheastContentShell as renderSharedBaysideSoutheastContentShell,
} from "../shared/baysideSoutheastLocalJobsPresenter";

export type BaysideSoutheastGenerationOptions = {
  root?: string;
  previewEnabled?: boolean;
  publishedEnabled?: boolean;
};

const defaultRoot = resolve(import.meta.dirname, "..");
const serialize = (value: unknown) => JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");

export async function generateBaysideSoutheastData(options: BaysideSoutheastGenerationOptions = {}) {
  const root = options.root ?? defaultRoot;
  const previewEnabled = options.previewEnabled ?? process.env.VITE_BAYSIDE_SOUTHEAST_PREVIEW === "true";
  const publishedEnabled = options.publishedEnabled ?? process.env.VITE_BAYSIDE_SOUTHEAST_PUBLISHED === "true";
  const publicDirectory = resolve(root, "client/public");
  const clientGeneratedDirectory = resolve(root, "client/src/generated");
  const byPath = Object.fromEntries(BAYSIDE_SOUTHEAST_LOCALITIES.map(record => [`/areas/${record.slug}`, record]));
  const metadataByPath = Object.fromEntries(BAYSIDE_SOUTHEAST_LOCALITIES.map(record => [
    `/areas/${record.slug}`,
    getSharedBaysideSoutheastMetadata(record),
  ]));
  const structuredDataByPath = Object.fromEntries(BAYSIDE_SOUTHEAST_LOCALITIES.map(record => [
    `/areas/${record.slug}`,
    getBaysideSoutheastStructuredData(record),
  ]));
  const contentShellByPath = Object.fromEntries(BAYSIDE_SOUTHEAST_LOCALITIES.map(record => [
    `/areas/${record.slug}`,
    renderSharedBaysideSoutheastContentShell(record),
  ]));

  await Promise.all([
    mkdir(publicDirectory, { recursive: true }),
    mkdir(clientGeneratedDirectory, { recursive: true }),
  ]);

  await Promise.all([
    writeFile(
      resolve(clientGeneratedDirectory, "baysideSoutheastConfig.ts"),
      `// GENERATED FILE — run pnpm bayside-southeast:generate. Do not edit by hand.\nexport const BAYSIDE_SOUTHEAST_PREVIEW_ENABLED = ${previewEnabled};\nexport const BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED = ${publishedEnabled};\n`,
      "utf8",
    ),
    writeFile(
      resolve(publicDirectory, "bayside-southeast-content.js"),
      `// GENERATED FILE — run pnpm bayside-southeast:generate. Do not edit by hand.\nexport const GENERATED_BAYSIDE_SOUTHEAST_PREVIEW_ENABLED = ${previewEnabled};\nexport const GENERATED_BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED = ${publishedEnabled};\nexport const GENERATED_BAYSIDE_SOUTHEAST_REVIEW_PATH = ${serialize(BAYSIDE_SOUTHEAST_REVIEW_PATH)};\nexport const GENERATED_BAYSIDE_SOUTHEAST_ROUTES = ${serialize(BAYSIDE_SOUTHEAST_ROUTES)};\nexport const GENERATED_BAYSIDE_SOUTHEAST_LOCALITIES = ${serialize(BAYSIDE_SOUTHEAST_LOCALITIES)};\nexport const GENERATED_BAYSIDE_SOUTHEAST_BY_SLUG = ${serialize(BAYSIDE_SOUTHEAST_BY_SLUG)};\nexport const GENERATED_BAYSIDE_SOUTHEAST_BY_PATH = ${serialize(byPath)};\nexport const GENERATED_BAYSIDE_SOUTHEAST_METADATA_BY_PATH = ${serialize(metadataByPath)};\nexport const GENERATED_BAYSIDE_SOUTHEAST_STRUCTURED_DATA_BY_PATH = ${serialize(structuredDataByPath)};\nexport const GENERATED_BAYSIDE_SOUTHEAST_CONTENT_SHELL_BY_PATH = ${serialize(contentShellByPath)};\n\nexport function getBaysideSoutheastRouteAccess(path, customerHost) {\n  if (path === GENERATED_BAYSIDE_SOUTHEAST_REVIEW_PATH) {\n    return !customerHost && GENERATED_BAYSIDE_SOUTHEAST_PREVIEW_ENABLED ? \"preview\" : \"not-found\";\n  }\n  if (!GENERATED_BAYSIDE_SOUTHEAST_BY_PATH[path]) return \"not-found\";\n  if (customerHost) return GENERATED_BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED ? \"public\" : \"baseline\";\n  return GENERATED_BAYSIDE_SOUTHEAST_PREVIEW_ENABLED ? \"preview\" : \"baseline\";\n}\n\nexport function getBaysideSoutheastMetadata(path) {\n  return GENERATED_BAYSIDE_SOUTHEAST_METADATA_BY_PATH[path] || null;\n}\n\nexport function getBaysideSoutheastStructuredData(path) {\n  return GENERATED_BAYSIDE_SOUTHEAST_STRUCTURED_DATA_BY_PATH[path] || [];\n}\n\nexport function renderBaysideSoutheastContentShell(path) {\n  return GENERATED_BAYSIDE_SOUTHEAST_CONTENT_SHELL_BY_PATH[path] || \"\";\n}\n`,
      "utf8",
    ),
  ]);

  return { previewEnabled, publishedEnabled };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await generateBaysideSoutheastData();
  console.log("Generated Bayside Southeast client and edge data.");
}
