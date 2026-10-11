import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Local QA only. No request can invoke delivery or a paid integration.
const root = path.resolve(import.meta.dirname, '../dist/public');
const worker = (await import(pathToFileURL(path.join(root, '_worker.js')).href)).default;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };
globalThis.fetch = async () => { throw new Error('Static QA denies every external request'); };
const env = {
  ASSETS: {
    async fetch(request) {
      const url = new URL(request.url);
      let relative;
      try { relative = decodeURIComponent(url.pathname); } catch { return new Response('Bad path', { status: 400 }); }
      let target = path.resolve(root, '.' + relative);
      if (!target.startsWith(root + path.sep) && target !== root) return new Response('Not found', { status: 404 });
      let body;
      try {
        if ((await fs.stat(target)).isDirectory()) target = path.join(target, 'index.html');
        body = await fs.readFile(target);
      } catch {
        if (path.extname(relative)) return new Response('Not found', { status: 404 });
        target = path.join(root, 'index.html');
        body = await fs.readFile(target);
      }
      return new Response(request.method === 'HEAD' ? null : body, { headers: { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' } });
    },
  },
};
const server = http.createServer(async (incoming, outgoing) => {
  try {
    const local = new URL(incoming.url, 'http://localhost');
    if (!['GET', 'HEAD'].includes(incoming.method) || local.pathname.startsWith('/api/')) {
      outgoing.writeHead(403, { 'Content-Type': 'application/json' });
      outgoing.end(JSON.stringify({ success: false, code: 'LOCAL_QA_NO_SUBMISSIONS' }));
      return;
    }
    const host = incoming.headers['x-ccg-qa-host'] || 'candidate-review.pages.dev';
    if (!['concreteconceptsgroup.com', 'www.concreteconceptsgroup.com', 'candidate-review.pages.dev'].includes(host)) {
      outgoing.writeHead(400); outgoing.end('Invalid QA host'); return;
    }
    const request = new Request('https://' + host + local.pathname + local.search, { method: incoming.method });
    const response = await worker.fetch(request, env, { waitUntil: () => {} });
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(incoming.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    outgoing.writeHead(500, { 'Content-Type': 'text/plain' });
    outgoing.end(error.message);
  }
});
server.listen(4176, '0.0.0.0', () => console.log('Static built-Worker QA ready on 4176; all APIs and external fetches denied.'));
