import net from 'node:net';
import tls from 'node:tls';
if (process.env.CCG_SAFE_TEST_MODE === '1') {
  const deny = () => { throw new Error('Safe deterministic tests forbid unmocked network access'); };
  globalThis.fetch = deny as typeof fetch;
  net.Socket.prototype.connect = deny as typeof net.Socket.prototype.connect;
  tls.connect = deny as typeof tls.connect;
}
