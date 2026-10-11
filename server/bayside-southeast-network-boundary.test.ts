import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const setup = readFileSync('server/safe-test-network.setup.ts', 'utf8')
  .replace(/^import .*;\n/gm, '')
  .replace(' as typeof fetch', '').replace(' as typeof net.Socket.prototype.connect', '').replace(' as typeof tls.connect', '');

describe('safe deterministic network boundary', () => {
  it('blocks fetch, raw sockets and TLS synchronously without invoking any original transport', () => {
    const transports = { fetch: vi.fn(), connect: vi.fn(), tls: vi.fn() };
    const context = vm.createContext({
      process: { env: { CCG_SAFE_TEST_MODE: '1' } },
      fetch: transports.fetch,
      net: { Socket: { prototype: { connect: transports.connect } } },
      tls: { connect: transports.tls },
    });
    vm.runInContext(setup, context);
    expect(() => vm.runInContext('fetch("https://unreachable.invalid")', context)).toThrow('forbid unmocked network');
    expect(() => vm.runInContext('net.Socket.prototype.connect(443, "unreachable.invalid")', context)).toThrow('forbid unmocked network');
    expect(() => vm.runInContext('tls.connect(443, "unreachable.invalid")', context)).toThrow('forbid unmocked network');
    expect(transports.fetch).not.toHaveBeenCalled();
    expect(transports.connect).not.toHaveBeenCalled();
    expect(transports.tls).not.toHaveBeenCalled();
  });
  it('allows explicitly substituted local fetch mocks, without opening underlying socket access', () => {
    const mock = vi.fn(() => ({ success: true }));
    const context = vm.createContext({ process: { env: { CCG_SAFE_TEST_MODE: '1' } }, net: { Socket: { prototype: {} } }, tls: {}, mock });
    vm.runInContext(setup, context);
    vm.runInContext('globalThis.fetch = mock; fetch("local-test-only")', context);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(() => vm.runInContext('net.Socket.prototype.connect()', context)).toThrow('forbid unmocked network');
  });
  it('installs the denial during safe-runner test setup and strips inherited credentials before spawning', () => {
    const runner = readFileSync('scripts/runSafeDeterministicTests.ts', 'utf8');
    const config = readFileSync('vitest.config.ts', 'utf8');
    expect(runner.indexOf("env.CCG_SAFE_TEST_MODE = '1'")).toBeLessThan(runner.indexOf('const result = spawnSync('));
    expect(config).toContain('setupFiles: process.env.CCG_SAFE_TEST_MODE === "1" ? ["server/safe-test-network.setup.ts"]');
    expect(runner).toContain('SECRET|TOKEN|API_KEY|DATABASE_URL|SMTP|PASSWORD|RUN_LIVE');
  });
  it('requires OS-level route-free isolation and has no fallback to an unisolated process', () => {
    const runner = readFileSync('scripts/runSafeDeterministicTests.ts', 'utf8');
    expect(runner).toContain("spawnSync('sudo'");
    expect(runner).toContain("'unshare', '--net', '--'");
    expect(runner).toContain("'runuser', '--preserve-environment'");
    expect(runner).not.toContain("spawnSync('pnpm'");
    expect(runner).toContain('process.exit(result.status ?? 1)');
  });
});
