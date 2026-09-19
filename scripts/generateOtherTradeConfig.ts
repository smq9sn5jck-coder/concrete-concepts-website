import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  OTHER_TRADE_CATEGORIES,
  OTHER_TRADE_CONSENT_TEXT,
  OTHER_TRADE_CONSENT_VERSION,
  OTHER_TRADE_LIMITS,
  OTHER_TRADE_PAGE_VERSION,
  OTHER_TRADE_TIMEFRAMES,
} from "../shared/otherTrade";

const previewEnabled = process.env.VITE_OTHER_TRADE_PREVIEW === "true";
const consentTextSha256 = createHash("sha256")
  .update(OTHER_TRADE_CONSENT_TEXT, "utf8")
  .digest("hex");

const values = {
  previewEnabled,
  consentText: OTHER_TRADE_CONSENT_TEXT,
  consentVersion: OTHER_TRADE_CONSENT_VERSION,
  consentTextSha256,
  pageVersion: OTHER_TRADE_PAGE_VERSION,
  categories: OTHER_TRADE_CATEGORIES,
  timeframes: OTHER_TRADE_TIMEFRAMES,
  limits: OTHER_TRADE_LIMITS,
};

const publicOutput = `// GENERATED FILE — run pnpm other-trade:generate. Do not edit by hand.\nexport const GENERATED_OTHER_TRADE_PREVIEW_ENABLED = ${JSON.stringify(values.previewEnabled)};\nexport const GENERATED_OTHER_TRADE_CONSENT_TEXT = ${JSON.stringify(values.consentText)};\nexport const GENERATED_OTHER_TRADE_CONSENT_VERSION = ${JSON.stringify(values.consentVersion)};\nexport const GENERATED_OTHER_TRADE_CONSENT_TEXT_SHA256 = ${JSON.stringify(values.consentTextSha256)};\nexport const GENERATED_OTHER_TRADE_PAGE_VERSION = ${JSON.stringify(values.pageVersion)};\nexport const GENERATED_OTHER_TRADE_CATEGORIES = ${JSON.stringify(values.categories)};\nexport const GENERATED_OTHER_TRADE_TIMEFRAMES = ${JSON.stringify(values.timeframes)};\nexport const GENERATED_OTHER_TRADE_LIMITS = ${JSON.stringify(values.limits)};\n`;

const clientOutput = `// GENERATED FILE — run pnpm other-trade:generate. Do not edit by hand.\nexport const GENERATED_OTHER_TRADE_PREVIEW_ENABLED = ${JSON.stringify(values.previewEnabled)};\nexport const GENERATED_OTHER_TRADE_CONSENT_TEXT_SHA256 = ${JSON.stringify(values.consentTextSha256)};\n`;

const publicPath = resolve(import.meta.dirname, "../client/public/other-trade-config.js");
const clientDir = resolve(import.meta.dirname, "../client/src/generated");
const clientPath = resolve(clientDir, "otherTradeConfig.ts");
await mkdir(clientDir, { recursive: true });
await Promise.all([
  writeFile(publicPath, publicOutput, "utf8"),
  writeFile(clientPath, clientOutput, "utf8"),
]);
console.log(`Generated other-trade config (preview=${previewEnabled})`);
