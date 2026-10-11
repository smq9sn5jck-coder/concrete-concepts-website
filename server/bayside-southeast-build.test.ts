import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateBaysideSoutheastData } from "../scripts/generateBaysideSoutheastData";
import {
  BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS,
  buildBaysideSoutheastPreview,
} from "../scripts/buildBaysideSoutheastPreview";

const ROOT = resolve(import.meta.dirname, "..");
const temporaryRoots: string[] = [];

function temporaryRoot() {
  const root = mkdtempSync(join(tmpdir(), "ccg-bayside-build-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  vi.restoreAllMocks();
  while (temporaryRoots.length) rmSync(temporaryRoots.pop()!, { recursive: true, force: true });
});

describe("Bayside Southeast generated flags and edge parity", () => {
  it("generates deterministic false-by-default client and edge artifacts from the one typed source", async () => {
    const root = temporaryRoot();
    await generateBaysideSoutheastData({ root });
    const client = readFileSync(join(root, "client/src/generated/baysideSoutheastConfig.ts"), "utf8");
    const edge = readFileSync(join(root, "client/public/bayside-southeast-content.js"), "utf8");

    expect(client).toContain("BAYSIDE_SOUTHEAST_PREVIEW_ENABLED = false");
    expect(client).toContain("BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED = false");
    expect(edge).toContain("GENERATED_BAYSIDE_SOUTHEAST_PREVIEW_ENABLED = false");
    expect(edge).toContain("GENERATED_BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED = false");
    expect(edge).toContain("GENERATED_BAYSIDE_SOUTHEAST_BY_PATH");
    expect(edge).toContain("GENERATED_BAYSIDE_SOUTHEAST_REVIEW_PATH");
    expect(edge).toContain('"/areas/wynnum"');
    expect(edge).toContain('"/areas/mansfield"');
  });

  it("can deterministically generate the isolated preview state without changing other feature flags", async () => {
    const root = temporaryRoot();
    await generateBaysideSoutheastData({ root, previewEnabled: true, publishedEnabled: false });
    const client = readFileSync(join(root, "client/src/generated/baysideSoutheastConfig.ts"), "utf8");
    const edge = readFileSync(join(root, "client/public/bayside-southeast-content.js"), "utf8");

    expect(client).toContain("BAYSIDE_SOUTHEAST_PREVIEW_ENABLED = true");
    expect(client).toContain("BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED = false");
    expect(edge).toContain("GENERATED_BAYSIDE_SOUTHEAST_PREVIEW_ENABLED = true");
  });
});

describe("Bayside Southeast preview build restoration", () => {
  it("snapshots and restores every source output managed by an ordinary build generator", async () => {
    const root = temporaryRoot();
    const baseline = new Map<string, string>();
    for (const output of BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS) {
      const path = join(root, output);
      mkdirSync(dirname(path), { recursive: true });
      const contents = `baseline:${output}`;
      writeFileSync(path, contents, "utf8");
      baseline.set(output, contents);
    }

    await buildBaysideSoutheastPreview({
      root,
      run: (_command, args) => {
        if (args.join(" ") !== "run build") return;
        for (const output of BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS) {
          writeFileSync(join(root, output), `preview-mutation:${output}`, "utf8");
        }
      },
    });

    for (const [output, contents] of baseline) {
      expect(readFileSync(join(root, output), "utf8"), output).toBe(contents);
    }
    expect(BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS).toEqual(expect.arrayContaining([
      "client/public/locality-content.js",
      "client/public/other-trade-config.js",
      "client/src/generated/otherTradeConfig.ts",
      "client/public/gold-coast-content.js",
      "client/src/generated/goldCoastConfig.ts",
      "client/public/blog-content.js",
      "client/src/generated/blogContent.ts",
      "client/public/regional-slab-content.js",
      "client/src/generated/regionalSlabConfig.ts",
      "client/src/generated/baysideSoutheastConfig.ts",
      "client/public/bayside-southeast-content.js",
    ]));
  });

  it("runs only the ordinary guarded build with isolated candidate flags and restores source generators after success", async () => {
    const calls: Array<{ command: string; args: string[]; env: NodeJS.ProcessEnv }> = [];
    await buildBaysideSoutheastPreview({
      root: ROOT,
      run: (command, args, env) => { calls.push({ command, args, env }); },
    });

    expect(calls.map(call => `${call.command} ${call.args.join(" ")}`)).toEqual([
      "pnpm run bayside-southeast:generate",
      "pnpm run build",
      "pnpm run bayside-southeast:generate",
    ]);
    expect(calls[0].env.VITE_BAYSIDE_SOUTHEAST_PREVIEW).toBe("true");
    expect(calls[0].env.VITE_BAYSIDE_SOUTHEAST_PUBLISHED).toBe("false");
    expect(calls[0].env.VITE_GOLD_COAST_PREVIEW).toBe("false");
    expect(calls[0].env.VITE_REGIONAL_SLAB_PREVIEW).toBe("false");
    expect(calls[0].env.VITE_OTHER_TRADE_PREVIEW).toBe("false");
    expect(calls[0].env.VITE_SOUTHSIDE_PREVIEW).toBe("false");
    expect(calls[0].env.VITE_SOUTHSIDE_PUBLISHED).toBe("false");
    expect(calls[0].env.VITE_BATCH_ONE_PREVIEW).toBe("false");
    expect(calls[2].env.VITE_BAYSIDE_SOUTHEAST_PREVIEW).toBe("false");
    expect(calls[2].env.VITE_BAYSIDE_SOUTHEAST_PUBLISHED).toBe("false");
  });

  it("attempts restoration after build and runner failures, reporting the primary failure", async () => {
    const calls: string[] = [];
    await expect(buildBaysideSoutheastPreview({
      root: ROOT,
      run: (_command, args) => {
        calls.push(args.join(" "));
        if (args.join(" ") === "run build") throw new Error("build failed");
      },
    })).rejects.toThrow("build failed");
    expect(calls).toEqual(["run bayside-southeast:generate", "run build", "run bayside-southeast:generate"]);
  });

  it("attempts every restoration command and reports restoration failures without masking a build failure", async () => {
    const calls: string[] = [];
    await expect(buildBaysideSoutheastPreview({
      root: ROOT,
      run: (_command, args, env) => {
        const call = `${args.join(" ")}:${env.VITE_BAYSIDE_SOUTHEAST_PREVIEW}`;
        calls.push(call);
        if (args.join(" ") === "run build") throw new Error("build failed");
        if (args.join(" ") === "run bayside-southeast:generate" && env.VITE_BAYSIDE_SOUTHEAST_PREVIEW === "false") {
          throw new Error("restore generated flags failed");
        }
      },
    })).rejects.toThrow(/build failed[\s\S]*restore generated flags failed/);
    expect(calls).toEqual([
      "run bayside-southeast:generate:true",
      "run build:true",
      "run bayside-southeast:generate:false",
    ]);
  });
});
