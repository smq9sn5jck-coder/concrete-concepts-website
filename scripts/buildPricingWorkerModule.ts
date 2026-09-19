import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";

const outputDirectory = resolve("dist/public");
await mkdir(outputDirectory, { recursive: true });

await build({
  entryPoints: [resolve("server/pricing/workerEntry.ts")],
  outfile: resolve(outputDirectory, "pricing-api.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  sourcemap: false,
  minify: true,
  legalComments: "none",
});

console.log("Built dist/public/pricing-api.js");
