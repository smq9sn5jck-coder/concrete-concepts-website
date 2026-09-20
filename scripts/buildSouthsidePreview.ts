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
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with status ${result.status}`);
  }
}

try {
  run("pnpm", ["run", "build"], {
    VITE_BATCH_ONE_PREVIEW: "false",
    VITE_SOUTHSIDE_PREVIEW: "true",
    VITE_OTHER_TRADE_PREVIEW: "false",
  });
} finally {
  run("pnpm", ["locality:generate"], {
    VITE_BATCH_ONE_PREVIEW: "false",
    VITE_SOUTHSIDE_PREVIEW: "false",
  });
}
