import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface ReleaseContractFiles {
  app: string;
  getQuote: string;
  wizard: string;
  worker: string;
}

export interface ReleaseContractResult {
  ok: boolean;
  errors: string[];
}

function result(errors: string[]): ReleaseContractResult {
  return { ok: errors.length === 0, errors };
}

export function verifySourceContract(files: ReleaseContractFiles): ReleaseContractResult {
  const errors: string[] = [];
  if (!files.app.includes("/get-quote")) {
    errors.push("Missing /get-quote route registration");
  }
  if (!files.getQuote.includes("ComprehensiveQuoteWizard")) {
    errors.push("GetQuote does not render ComprehensiveQuoteWizard");
  }
  if (!files.wizard.includes("Step 1 of 5")) {
    errors.push("Missing rendered Step 1 of 5 marker");
  }
  const stepTitles = ["Contact", "Location", "Job brief", "Measure & photos", "Review"];
  if (!stepTitles.every((title) => files.wizard.includes(title))) {
    errors.push("Wizard step contract is incomplete");
  }
  if (!files.wizard.includes("/api/upload-photo")) {
    errors.push("Wizard photo upload contract is missing");
  }
  if (!files.wizard.includes("trackQuoteConversion")) {
    errors.push("Confirmed quote conversion contract is missing");
  }
  if (!files.worker.includes("/api/upload-photo")) {
    errors.push("Worker photo route is missing");
  }
  if (!files.worker.includes("/api/trpc/quote.submit")) {
    errors.push("Worker quote submission route is missing");
  }
  return result(errors);
}

export function verifyBuiltContract(parts: string[]): ReleaseContractResult {
  const bundle = parts.join("\n");
  const errors: string[] = [];
  if (!bundle.includes("/get-quote")) errors.push("Built bundle is missing /get-quote");
  if (!bundle.includes("Step 1 of 5")) errors.push("Built bundle is missing Step 1 of 5");
  if (!bundle.includes("How can we reach you?")) {
    errors.push("Built bundle is missing quote contact heading");
  }
  if (!bundle.includes("/api/upload-photo")) {
    errors.push("Built bundle is missing photo upload endpoint");
  }
  if (!bundle.includes("/api/trpc/quote.submit")) {
    errors.push("Built bundle is missing quote submission endpoint");
  }
  return result(errors);
}

function readText(path: string) {
  return readFileSync(path, "utf8");
}

export function readSourceContract(root: string): ReleaseContractFiles {
  return {
    app: readText(resolve(root, "client/src/App.tsx")),
    getQuote: readText(resolve(root, "client/src/pages/GetQuote.tsx")),
    wizard: readText(resolve(root, "client/src/components/quote/ComprehensiveQuoteWizard.tsx")),
    worker: readText(resolve(root, "client/public/_worker.js")),
  };
}

function collectBuiltParts(directory: string): string[] {
  const parts: string[] = [];
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) {
      parts.push(...collectBuiltParts(path));
    } else if (/\.(html|js)$/i.test(entry)) {
      parts.push(readText(path));
    }
  }
  return parts;
}

export function verifySourceDirectory(root = process.cwd()) {
  return verifySourceContract(readSourceContract(root));
}

export function verifyBuildDirectory(directory: string) {
  return verifyBuiltContract(collectBuiltParts(directory));
}

function printAndExit(check: ReleaseContractResult, label: string) {
  if (!check.ok) {
    console.error(`${label} failed:`);
    check.errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(`${label} passed.`);
}

const isMain = process.argv[1]
  ? fileURLToPath(import.meta.url) === resolve(process.argv[1])
  : false;

if (isMain) {
  const mode = process.argv[2] ?? "source";
  if (mode === "source") {
    printAndExit(verifySourceDirectory(process.argv[3] ?? process.cwd()), "Quote source contract");
  } else if (mode === "build") {
    printAndExit(
      verifyBuildDirectory(resolve(process.argv[3] ?? "dist/public")),
      "Quote build contract"
    );
  } else {
    console.error(`Unknown quote release guard mode: ${mode}`);
    process.exitCode = 1;
  }
}
