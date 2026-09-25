import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function run(command: string, args: string[], env: NodeJS.ProcessEnv) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} exited with status ${result.status}`);
}

const productionDefaults = {
  VITE_BATCH_ONE_PREVIEW: "false",
  VITE_SOUTHSIDE_PREVIEW: "false",
  VITE_OTHER_TRADE_PREVIEW: "false",
  VITE_GOLD_COAST_PREVIEW: "false",
  VITE_GOLD_COAST_PUBLISHED: "false",
};

try {
  run("pnpm", ["run", "build"], {
    ...productionDefaults,
    VITE_GOLD_COAST_PREVIEW: "true",
  });
} finally {
  run("pnpm", ["gold-coast:generate"], productionDefaults);
  run("pnpm", ["locality:generate"], productionDefaults);
  run("pnpm", ["other-trade:generate"], productionDefaults);
}
