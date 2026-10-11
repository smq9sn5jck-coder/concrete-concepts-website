import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateBaysideSoutheastData } from "../scripts/generateBaysideSoutheastData";
import {
  BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS,
  buildBaysideSoutheastProduction,
} from "../scripts/buildBaysideSoutheastProduction";

const ROOT = resolve(import.meta.dirname, "..");
const temporaryRoots: string[] = [];

function temporaryRoot() {
  const root = mkdtempSync(join(tmpdir(), "ccg-bayside-production-build-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  vi.restoreAllMocks();
  while (temporaryRoots.length) rmSync(temporaryRoots.pop()!, { recursive: true, force: true });
});

describe("Bayside Southeast generated flags and production build restoration", () => {
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
  });

  it("produces the isolated published-only state while every unrelated preview/publication flag is false", async () => {
    const root = temporaryRoot();
    const calls: Array<{ command: string; args: string[]; env: NodeJS.ProcessEnv }> = [];
    await buildBaysideSoutheastProduction({
      root,
      run: (command, args, env) => { calls.push({ command, args, env }); },
    });

    expect(calls.map(call => `${call.command} ${call.args.join(" ")}`)).toEqual([
      "pnpm run bayside-southeast:generate",
      "pnpm run build",
      "pnpm run bayside-southeast:generate",
    ]);
    expect(calls[0].env.VITE_BAYSIDE_SOUTHEAST_PREVIEW).toBe("false");
    expect(calls[0].env.VITE_BAYSIDE_SOUTHEAST_PUBLISHED).toBe("true");
    expect(calls[0].env.VITE_GOLD_COAST_PREVIEW).toBe("false");
    expect(calls[0].env.VITE_GOLD_COAST_PUBLISHED).toBe("false");
    expect(calls[0].env.VITE_REGIONAL_SLAB_PREVIEW).toBe("false");
    expect(calls[0].env.VITE_REGIONAL_SLAB_PUBLISHED).toBe("false");
    expect(calls[0].env.VITE_OTHER_TRADE_PREVIEW).toBe("false");
    expect(calls[0].env.VITE_SOUTHSIDE_PREVIEW).toBe("false");
    expect(calls[0].env.VITE_SOUTHSIDE_PUBLISHED).toBe("false");
    expect(calls[0].env.VITE_BATCH_ONE_PREVIEW).toBe("false");
    expect(calls[2].env.VITE_BAYSIDE_SOUTHEAST_PREVIEW).toBe("false");
    expect(calls[2].env.VITE_BAYSIDE_SOUTHEAST_PUBLISHED).toBe("false");
    expect(JSON.parse(readFileSync(join(root, "dist/bayside-southeast-production-provenance.json"), "utf8"))).toMatchObject({
      artifact: "bayside-southeast-production-candidate",
      previewEnabled: false,
      publishedEnabled: true,
      reviewIndexIncluded: false,
    });
  });

  it("snapshots and restores every source output, including after a build failure", async () => {
    const root = temporaryRoot();
    const baseline = new Map<string, string>();
    for (const output of BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS) {
      const path = join(root, output);
      mkdirSync(dirname(path), { recursive: true });
      const contents = `baseline:${output}`;
      writeFileSync(path, contents, "utf8");
      baseline.set(output, contents);
    }

    await expect(buildBaysideSoutheastProduction({
      root,
      run: (_command, args) => {
        if (args.join(" ") !== "run build") return;
        for (const output of BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS) {
          writeFileSync(join(root, output), `candidate-mutation:${output}`, "utf8");
        }
        throw new Error("candidate build failed");
      },
    })).rejects.toThrow("candidate build failed");

    for (const [output, contents] of baseline) {
      expect(readFileSync(join(root, output), "utf8"), output).toBe(contents);
    }
  });

  it("includes the optional quote-context bundle in restoration", () => {
    expect(BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS).toContain("client/public/quote-project-context.js");
  });

  it("removes an optional quote-context bundle that was absent before a failed build", async () => {
    const root = temporaryRoot();
    const optionalOutput = "client/public/quote-project-context.js";
    for (const output of BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS.filter(output => output !== optionalOutput)) {
      const path = join(root, output);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, `baseline:${output}`, "utf8");
    }

    await expect(buildBaysideSoutheastProduction({
      root,
      run: (_command, args) => {
        if (args.join(" ") !== "run build") return;
        for (const output of BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS) {
          const path = join(root, output);
          mkdirSync(dirname(path), { recursive: true });
          writeFileSync(path, `candidate:${output}`, "utf8");
        }
        throw new Error("candidate build failed");
      },
    })).rejects.toThrow("candidate build failed");

    expect(() => readFileSync(join(root, optionalOutput), "utf8")).toThrow();
  });
});
