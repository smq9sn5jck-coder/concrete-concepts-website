import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { BATCH_ONE_LOCALITIES } from "../shared/localityContent";
import {
  BATCH_ONE_CREATE_SLUGS,
  BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST,
  BATCH_ONE_UPGRADE_SLUGS,
} from "../shared/batchOnePublication";
import { SOUTHSIDE_LOCALITIES } from "../shared/southsideLocalityContent";
import { buildLocalityStructuredData } from "../shared/localityStructuredData";
import {
  SOUTHSIDE_CREATE_SLUGS,
  SOUTHSIDE_PRODUCTION_CREATE_ALLOWLIST,
  SOUTHSIDE_PRODUCTION_UPGRADE_ALLOWLIST,
  SOUTHSIDE_RETAIN_SLUGS,
  SOUTHSIDE_UPGRADE_SLUGS,
} from "../shared/southsidePublication";

const outputPath = resolve(import.meta.dirname, "../client/public/locality-content.js");
const sitemapPath = resolve(import.meta.dirname, "../client/public/sitemap.xml");
const sitemap = await readFile(sitemapPath, "utf8");
const publicLocalitySlugs = [...sitemap.matchAll(/<loc>https:\/\/concreteconceptsgroup\.com\/areas\/([^<]+)<\/loc>/g)]
  .map(match => match[1])
  .sort();
const batchOnePreviewEnabled = process.env.VITE_BATCH_ONE_PREVIEW === "true";
const southsidePreviewEnabled = process.env.VITE_SOUTHSIDE_PREVIEW === "true";
const batchOneSerialized = JSON.stringify(BATCH_ONE_LOCALITIES, null, 2);
const southsideSerialized = JSON.stringify(SOUTHSIDE_LOCALITIES, null, 2);
const batchOneStructuredDataSerialized = JSON.stringify(Object.fromEntries(
  BATCH_ONE_LOCALITIES.map(record => [record.slug, buildLocalityStructuredData(record)]),
), null, 2);
const southsideStructuredDataSerialized = JSON.stringify(Object.fromEntries(
  SOUTHSIDE_LOCALITIES.map(record => [record.slug, buildLocalityStructuredData(record)]),
), null, 2);
const content = `// GENERATED FILE — run pnpm locality:generate. Do not edit by hand.\nexport const GENERATED_BATCH_ONE_LOCALITIES = ${batchOneSerialized};\n\nexport const GENERATED_BATCH_ONE_CREATE_SLUGS = ${JSON.stringify(BATCH_ONE_CREATE_SLUGS)};\nexport const GENERATED_BATCH_ONE_UPGRADE_SLUGS = ${JSON.stringify(BATCH_ONE_UPGRADE_SLUGS)};\nexport const GENERATED_BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST = ${JSON.stringify(BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST)};\nexport const GENERATED_BATCH_ONE_PREVIEW_ENABLED = ${JSON.stringify(batchOnePreviewEnabled)};\n\nexport const GENERATED_SOUTHSIDE_LOCALITIES = ${southsideSerialized};\nexport const GENERATED_SOUTHSIDE_RETAIN_SLUGS = ${JSON.stringify(SOUTHSIDE_RETAIN_SLUGS)};\nexport const GENERATED_SOUTHSIDE_CREATE_SLUGS = ${JSON.stringify(SOUTHSIDE_CREATE_SLUGS)};\nexport const GENERATED_SOUTHSIDE_UPGRADE_SLUGS = ${JSON.stringify(SOUTHSIDE_UPGRADE_SLUGS)};\nexport const GENERATED_SOUTHSIDE_PRODUCTION_CREATE_ALLOWLIST = ${JSON.stringify(SOUTHSIDE_PRODUCTION_CREATE_ALLOWLIST)};\nexport const GENERATED_SOUTHSIDE_PRODUCTION_UPGRADE_ALLOWLIST = ${JSON.stringify(SOUTHSIDE_PRODUCTION_UPGRADE_ALLOWLIST)};\nexport const GENERATED_SOUTHSIDE_PREVIEW_ENABLED = ${JSON.stringify(southsidePreviewEnabled)};\nexport const GENERATED_PUBLIC_LOCALITY_SLUGS = ${JSON.stringify(publicLocalitySlugs)};\n\nexport const GENERATED_BATCH_ONE_BY_SLUG = Object.fromEntries(\n  GENERATED_BATCH_ONE_LOCALITIES.map(record => [record.slug, record]),\n);\n\nexport const GENERATED_SOUTHSIDE_BY_SLUG = Object.fromEntries(\n  GENERATED_SOUTHSIDE_LOCALITIES.map(record => [record.slug, record]),\n);\n\nexport const GENERATED_BATCH_ONE_STRUCTURED_DATA_BY_SLUG = ${batchOneStructuredDataSerialized};\nexport const GENERATED_SOUTHSIDE_STRUCTURED_DATA_BY_SLUG = ${southsideStructuredDataSerialized};\n\nexport function getLocalityRouteAccess(slug, customerHost, previewEnabled) {\n  if (GENERATED_BATCH_ONE_UPGRADE_SLUGS.includes(slug)) return \"public\";\n  if (!GENERATED_BATCH_ONE_CREATE_SLUGS.includes(slug)) return \"not-found\";\n  if (customerHost) {\n    return GENERATED_BATCH_ONE_PRODUCTION_CREATE_ALLOWLIST.includes(slug) ? \"public\" : \"not-found\";\n  }\n  return previewEnabled ? \"preview\" : \"not-found\";\n}\n\nexport function getSouthsideLocalityRouteAccess(slug, customerHost, previewEnabled) {\n  if (GENERATED_SOUTHSIDE_RETAIN_SLUGS.includes(slug)) {\n    if (customerHost) return \"public\";\n    return previewEnabled ? \"preview\" : \"not-found\";\n  }\n  if (GENERATED_SOUTHSIDE_UPGRADE_SLUGS.includes(slug)) {\n    if (customerHost) {\n      return GENERATED_SOUTHSIDE_PRODUCTION_UPGRADE_ALLOWLIST.includes(slug) ? \"public\" : \"legacy\";\n    }\n    return previewEnabled ? \"preview\" : \"legacy\";\n  }\n  if (GENERATED_SOUTHSIDE_CREATE_SLUGS.includes(slug)) {\n    if (customerHost) {\n      return GENERATED_SOUTHSIDE_PRODUCTION_CREATE_ALLOWLIST.includes(slug) ? \"public\" : \"not-found\";\n    }\n    return previewEnabled ? \"preview\" : \"not-found\";\n  }\n  return \"not-found\";\n}\n`;

await writeFile(outputPath, content, "utf8");
console.log(`Generated ${BATCH_ONE_LOCALITIES.length} Batch 1 and ${SOUTHSIDE_LOCALITIES.length} south-side locality records at ${outputPath}`);
