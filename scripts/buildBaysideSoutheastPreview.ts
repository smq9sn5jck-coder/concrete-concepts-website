import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

export type BaysideSoutheastProcessRunner = (
  command: string,
  args: string[],
  environment: NodeJS.ProcessEnv,
) => void | Promise<void>;

const defaultRoot = resolve(import.meta.dirname, "..");
/**
 * Every checked-in source artifact written by a generator in the ordinary build.
 * Keep this explicit: a preview may generate all of them, but must leave the
 * worktree exactly as it found it once the preview artifact has been produced.
 */
export const BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS = [
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
] as const;

const isolatedPreviewEnvironment: NodeJS.ProcessEnv = {
  VITE_BAYSIDE_SOUTHEAST_PREVIEW: "true",
  VITE_BAYSIDE_SOUTHEAST_PUBLISHED: "false",
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
  ...isolatedPreviewEnvironment,
  VITE_BAYSIDE_SOUTHEAST_PREVIEW: "false",
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

async function snapshotManagedOutputs(root: string) {
  return Promise.all(BAYSIDE_SOUTHEAST_GENERATOR_MANAGED_OUTPUTS.map(async path => [path, await readFile(resolve(root, path), "utf8")] as const));
}

async function restoreManagedOutputs(root: string, snapshot: ReadonlyArray<readonly [string, string]>) {
  const failures: Error[] = [];
  for (const [path, contents] of snapshot) {
    try {
      await writeFile(resolve(root, path), contents, "utf8");
    } catch (error) {
      failures.push(error instanceof Error ? error : new Error(String(error)));
    }
  }
  return failures;
}

export async function buildBaysideSoutheastPreview(
  options: { root?: string; run?: BaysideSoutheastProcessRunner } = {},
) {
  const root = options.root ?? defaultRoot;
  const run = options.run ?? defaultRun(root);
  const snapshot = await snapshotManagedOutputs(root);
  let primaryFailure: Error | undefined;
  const restorationFailures: Error[] = [];

  try {
    await run("pnpm", ["run", "bayside-southeast:generate"], isolatedPreviewEnvironment);
    await run("pnpm", ["run", "build"], isolatedPreviewEnvironment);
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
    const messages = [
      ...(primaryFailure ? [primaryFailure.message] : []),
      ...restorationFailures.map(error => `restoration failed: ${error.message}`),
    ];
    throw new Error(messages.join("\n"));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await buildBaysideSoutheastPreview();
}
