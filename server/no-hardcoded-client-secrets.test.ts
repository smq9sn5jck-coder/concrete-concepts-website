import { readdirSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const clientRoot = resolve(__dirname, "../client/src");
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const googleApiKeyPattern = new RegExp(["AI", "za", "[0-9A-Za-z_-]{30,}"].join(""), "g");

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return sourceExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

describe("client-side credential safety", () => {
  it("does not contain hardcoded Google API keys", () => {
    const exposedFiles = collectSourceFiles(clientRoot).filter(path => {
      googleApiKeyPattern.lastIndex = 0;
      return googleApiKeyPattern.test(readFileSync(path, "utf8"));
    });

    expect(exposedFiles).toEqual([]);
  });
});
