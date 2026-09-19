import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { BATCH_ONE_LOCALITIES } from "../shared/localityContent";
import {
  BATCH_ONE_CREATE_SLUGS,
  BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST,
  BATCH_ONE_UPGRADE_SLUGS,
} from "../shared/batchOnePublication";

const outputPath = resolve(import.meta.dirname, "../client/public/locality-content.js");
const sitemapPath = resolve(import.meta.dirname, "../client/public/sitemap.xml");
const sitemap = await readFile(sitemapPath, "utf8");
const publicLocalitySlugs = [...sitemap.matchAll(/<loc>https:\/\/concreteconceptsgroup\.com\/areas\/([^<]+)<\/loc>/g)]
  .map(match => match[1])
  .sort();
const previewEnabled = process.env.VITE_BATCH_ONE_PREVIEW === "true";
const serialized = JSON.stringify(BATCH_ONE_LOCALITIES, null, 2);
const content = `// GENERATED FILE — run pnpm locality:generate. Do not edit by hand.\nexport const GENERATED_BATCH_ONE_LOCALITIES = ${serialized};\n\nexport const GENERATED_BATCH_ONE_CREATE_SLUGS = ${JSON.stringify(BATCH_ONE_CREATE_SLUGS)};\nexport const GENERATED_BATCH_ONE_UPGRADE_SLUGS = ${JSON.stringify(BATCH_ONE_UPGRADE_SLUGS)};\nexport const GENERATED_BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST = ${JSON.stringify(BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST)};\nexport const GENERATED_BATCH_ONE_PREVIEW_ENABLED = ${JSON.stringify(previewEnabled)};\nexport const GENERATED_PUBLIC_LOCALITY_SLUGS = ${JSON.stringify(publicLocalitySlugs)};\n\nexport const GENERATED_BATCH_ONE_BY_SLUG = Object.fromEntries(\n  GENERATED_BATCH_ONE_LOCALITIES.map(record => [record.slug, record]),\n);\n\nexport function getLocalityRouteAccess(slug, customerHost, previewEnabled) {\n  if (GENERATED_BATCH_ONE_UPGRADE_SLUGS.includes(slug)) return \"public\";\n  if (!GENERATED_BATCH_ONE_CREATE_SLUGS.includes(slug)) return \"not-found\";\n  if (customerHost) {\n    return GENERATED_BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST.includes(slug) ? \"public\" : \"not-found\";\n  }\n  return previewEnabled ? \"preview\" : \"not-found\";\n}\n`;

await writeFile(outputPath, content, "utf8");
console.log(`Generated ${BATCH_ONE_LOCALITIES.length} locality records at ${outputPath}`);
