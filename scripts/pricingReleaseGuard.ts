import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface PricingSourceContract {
  worker: string;
  packageJson: string;
}

export interface PricingBuildPart {
  name: string;
  content: string;
}

export interface PricingReleaseResult {
  ok: boolean;
  errors: string[];
}

function result(errors: string[]): PricingReleaseResult {
  return { ok: errors.length === 0, errors };
}

export function verifyPricingSourceContract(files: PricingSourceContract): PricingReleaseResult {
  const errors: string[] = [];
  if (!files.worker.includes('/api/v1/pricing/estimate')) {
    errors.push("Worker pricing endpoint is missing");
  }
  if (!files.worker.includes('import("./pricing-api.js")')) {
    errors.push("Worker does not load the shared pricing bundle");
  }
  if (!files.packageJson.includes("buildPricingWorkerModule.ts")) {
    errors.push("Pricing Worker build step is missing");
  }
  return result(errors);
}

export function verifyPricingBuildContract(parts: PricingBuildPart[]): PricingReleaseResult {
  const errors: string[] = [];
  const worker = parts.find((part) => part.name === "_worker.js")?.content ?? "";
  const module = parts.find((part) => part.name === "pricing-api.js")?.content ?? "";
  if (!worker.includes('/api/v1/pricing/estimate')) errors.push("Built Worker pricing endpoint is missing");
  if (!module.includes("handlePricingWorkerRequest")) errors.push("Built pricing module is missing its handler");
  return result(errors);
}

export function verifyPricingSourceDirectory(root = process.cwd()) {
  return verifyPricingSourceContract({
    worker: readFileSync(resolve(root, "client/public/_worker.js"), "utf8"),
    packageJson: readFileSync(resolve(root, "package.json"), "utf8"),
  });
}

export function verifyPricingBuildDirectory(directory = resolve("dist/public")) {
  const files = ["_worker.js", "pricing-api.js"].map((name) => ({
    name,
    content: existsSync(resolve(directory, name)) ? readFileSync(resolve(directory, name), "utf8") : "",
  }));
  return verifyPricingBuildContract(files);
}

function printAndExit(check: PricingReleaseResult, label: string) {
  if (!check.ok) {
    console.error(`${label} failed:`);
    check.errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(`${label} passed.`);
}

const isMain = process.argv[1] ? fileURLToPath(import.meta.url) === resolve(process.argv[1]) : false;
if (isMain) {
  const mode = process.argv[2] ?? "source";
  if (mode === "source") printAndExit(verifyPricingSourceDirectory(process.argv[3]), "Pricing source contract");
  else if (mode === "build") printAndExit(verifyPricingBuildDirectory(resolve(process.argv[3] ?? "dist/public")), "Pricing build contract");
  else {
    console.error(`Unknown pricing release guard mode: ${mode}`);
    process.exitCode = 1;
  }
}
