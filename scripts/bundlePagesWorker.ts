import { build } from "esbuild";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

await build({
  entryPoints: [resolve(root, "client/public/_worker.js")],
  outfile: resolve(root, "dist/public/_worker.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: false,
  legalComments: "none",
});

console.log("Bundled dist/public/_worker.js for Cloudflare Pages direct upload.");
