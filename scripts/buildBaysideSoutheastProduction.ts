import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

export type BaysideSoutheastProcessRunner = (
  command: string,
  args: string[],
  environment: NodeJS.ProcessEnv,
) => void | Promise<void>;

type ManagedOutputSnapshot = Readonly<{ path: string; contents?: string }>;

const defaultRoot = resolve(import.meta.dirname, "..");

/**
 * Checked-in/generated source artifacts the clean build can rewrite. This intentionally
 * excludes Gold Coast and regional files: the clean baseline does not generate them.
 * `quote-project-context.js` is optional until the separately-owned quote adapter is wired.
 */
export const BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS = [
  "client/public/locality-content.js",
  "client/public/other-trade-config.js",
  "client/src/generated/otherTradeConfig.ts",
  "client/src/generated/baysideSoutheastConfig.ts",
  "client/public/bayside-southeast-content.js",
  "client/public/quote-project-context.js",
] as const;

const isolatedProductionEnvironment: NodeJS.ProcessEnv = {
  VITE_BAYSIDE_SOUTHEAST_PREVIEW: "false",
  VITE_BAYSIDE_SOUTHEAST_PUBLISHED: "true",
  VITE_BATCH_ONE_PREVIEW: "false",
  VITE_SOUTHSIDE_PREVIEW: "false",
  VITE_SOUTHSIDE_PUBLISHED: "false",
  VITE_OTHER_TRADE_PREVIEW: "false",
  VITE_GOLD_COAST_PREVIEW: "false",
  VITE_GOLD_COAST_PUBLISHED: "false",
  VITE_REGIONAL_SLAB_PREVIEW: "false",
  VITE_REGIONAL_SLAB_PUBLISHED: "false",
};

const defaultEnvironment: NodeJS.ProcessEnv = {
  ...isolatedProductionEnvironment,
  VITE_BAYSIDE_SOUTHEAST_PUBLISHED: "false",
};

function defaultRun(root: string): BaysideSoutheastProcessRunner {
  return (command, args, environment) => {
    const result = spawnSync(command, args, {
      cwd: root,
      env: { ...process.env, ...environment },
      stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} exited with status ${result.status}`);
  };
}

async function snapshotManagedOutputs(root: string): Promise<ManagedOutputSnapshot[]> {
  return Promise.all(BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS.map(async path => {
    try {
      return { path, contents: await readFile(resolve(root, path), "utf8") };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { path };
      throw error;
    }
  }));
}

async function restoreManagedOutputs(root: string, snapshot: readonly ManagedOutputSnapshot[]) {
  const failures: Error[] = [];
  for (const output of snapshot) {
    try {
      const target = resolve(root, output.path);
      if (output.contents === undefined) await rm(target, { force: true });
      else await writeFile(target, output.contents, "utf8");
    } catch (error) {
      failures.push(error instanceof Error ? error : new Error(String(error)));
    }
  }
  return failures;
}

async function writeProductionProvenance(root: string) {
  const outputDirectory = resolve(root, "dist");
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    resolve(outputDirectory, "bayside-southeast-production-provenance.json"),
    `${JSON.stringify({
      artifact: "bayside-southeast-production-candidate",
      previewEnabled: false,
      publishedEnabled: true,
      reviewIndexIncluded: false,
      sourceFlagsRestored: true,
    }, null, 2)}\n`,
    "utf8",
  );
}

/**
 * Builds a local production candidate only: published Bayside pages on customer hosts,
 * never the preview index. No deploy/upload occurs; every generated source output is
 * restored even if generation or the guarded build fails.
 */
export async function buildBaysideSoutheastProduction(
  options: { root?: string; run?: BaysideSoutheastProcessRunner } = {},
) {
  const root = options.root ?? defaultRoot;
  const run = options.run ?? defaultRun(root);
  const snapshot = await snapshotManagedOutputs(root);
  let primaryFailure: Error | undefined;
  const restorationFailures: Error[] = [];

  try {
    await run("pnpm", ["run", "bayside-southeast:generate"], isolatedProductionEnvironment);
    await run("pnpm", ["run", "build"], isolatedProductionEnvironment);
    await writeProductionProvenance(root);
  } catch (error) {
    primaryFailure = error instanceof Error ? error : new Error(String(error));
  } finally {
    try {
      await run("pnpm", ["run", "bayside-southeast:generate"], defaultEnvironment);
    } catch (error) {
      restorationFailures.push(error instanceof Error ? error : new Error(String(error)));
    }
    restorationFailures.push(...await restoreManagedOutputs(root, snapshot));
  }

  if (primaryFailure || restorationFailures.length) {
    throw new Error([
      ...(primaryFailure ? [primaryFailure.message] : []),
      ...restorationFailures.map(error => `restoration failed: ${error.message}`),
    ].join("\n"));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await buildBaysideSoutheastProduction();
}
