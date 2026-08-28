import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface LiveRouteCheck {
  ok: boolean;
  errors: string[];
}

export function evaluateRenderedQuoteRoute(url: string, html: string): LiveRouteCheck {
  const errors: string[] = [];
  let pathname = "";
  try {
    pathname = new URL(url).pathname;
  } catch {
    errors.push("Browser returned an invalid URL");
  }

  if (pathname !== "/get-quote") errors.push("Browser did not remain on /get-quote");
  if (!/<title>[^<]*Get a Free Concrete Quote/i.test(html)) {
    errors.push("Rendered page title is not the comprehensive quote title");
  }
  if (!html.includes("Step 1 of 5")) errors.push("Rendered page is missing Step 1 of 5");
  if (!html.includes("How can we reach you?")) {
    errors.push("Rendered page is missing the contact-step heading");
  }
  for (const autocomplete of ["name", "tel", "email"]) {
    const pattern = new RegExp(`autocomplete=["']${autocomplete}["']`, "i");
    if (!pattern.test(html)) errors.push(`Rendered page is missing ${autocomplete} input`);
  }
  if (/Page Not Found/i.test(html)) errors.push("Rendered page contains Page Not Found");

  return { ok: errors.length === 0, errors };
}

function availableChromeCommand() {
  const candidates = [
    process.env.GOOGLE_CHROME_BIN,
    "google-chrome",
    "chromium",
    "chromium-browser",
  ].filter(Boolean) as string[];

  for (const command of candidates) {
    const probe = spawnSync(command, ["--version"], { encoding: "utf8" });
    if (probe.status === 0) return command;
  }
  throw new Error("No Chrome or Chromium executable is available for live route verification");
}

export function renderQuoteRoute(url: string, chromeCommand = availableChromeCommand()) {
  const rendered = spawnSync(
    chromeCommand,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--dump-dom",
      "--virtual-time-budget=12000",
      url,
    ],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
  );

  if (rendered.status !== 0 || !rendered.stdout) {
    throw new Error(
      `Unable to render ${url}: ${rendered.stderr?.trim() || "Chrome returned no DOM"}`
    );
  }
  return evaluateRenderedQuoteRoute(url, rendered.stdout);
}

export function verifyLiveQuoteRoutes(urls: string[]) {
  const errors: string[] = [];
  for (const url of urls) {
    const check = renderQuoteRoute(url);
    check.errors.forEach((error) => errors.push(`${url}: ${error}`));
  }
  return { ok: errors.length === 0, errors };
}

const isMain = process.argv[1]
  ? fileURLToPath(import.meta.url) === resolve(process.argv[1])
  : false;

if (isMain) {
  const urls = process.argv.slice(2);
  const check = verifyLiveQuoteRoutes(
    urls.length
      ? urls
      : [
          "https://concreteconceptsgroup.com/get-quote",
          "https://www.concreteconceptsgroup.com/get-quote",
        ]
  );
  if (!check.ok) {
    console.error("Live quote-route verification failed:");
    check.errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log("Live quote-route verification passed.");
  }
}
