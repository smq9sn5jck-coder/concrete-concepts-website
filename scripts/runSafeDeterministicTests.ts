import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { userInfo } from 'node:os';
import { spawnSync } from 'node:child_process';
import { EXTERNAL_TEST_FILES, selectSafeTestFiles } from './safeTestSelection';
function discover(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? discover(join(directory, entry.name)) : [join(directory, entry.name)]);
}
const files = selectSafeTestFiles(discover('server'));
if (!files.length) throw new Error('No safe test files discovered');
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/(?:SECRET|TOKEN|API_KEY|DATABASE_URL|SMTP|PASSWORD|RUN_LIVE)/i.test(key)));
env.CCG_SAFE_TEST_MODE = '1';
const username = userInfo().username;
const nodeDirectory = dirname(process.execPath);
const pnpmCli = join(nodeDirectory, '../lib/node_modules/pnpm/bin/pnpm.cjs');
console.log(`Safe gate: ${files.length} files. Excluded ${EXTERNAL_TEST_FILES.length} live integrations: ${EXTERNAL_TEST_FILES.join(', ')}`);
console.log('Network protection: required route-free Linux namespace plus test-setup transport denial; no unisolated fallback.');
// Pass only the scrubbed environment through sudo, then drop privileges again
// inside a new namespace. The original sandbox/network remain unchanged.
const environmentArguments = Object.entries(env).filter((entry): entry is [string,string] => typeof entry[1] === 'string').map(([key,value]) => `${key}=${value}`);
const result = spawnSync('sudo', ['-n', 'unshare', '--net', '--', '/usr/bin/env', '-i', ...environmentArguments, 'runuser', '--preserve-environment', '-u', username, '--', process.execPath, pnpmCli, 'exec','vitest','run',...files], { stdio: 'inherit', env });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
