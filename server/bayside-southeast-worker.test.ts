import { copyFileSync, readdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
const root=resolve(import.meta.dirname,'..');
const dirs:string[]=[];
async function loadWorker(preview=true) {
 const dir=mkdtempSync(resolve(tmpdir(),'ccg-bayside-worker-'));dirs.push(dir);
 for(const f of readdirSync(resolve(root,'client/public')).filter(f=>f.endsWith('.js'))) copyFileSync(resolve(root,'client/public',f),resolve(dir,f));
 const data=resolve(dir,'bayside-southeast-content.js');
 if(!readdirSync(dir).includes('bayside-southeast-content.js')) writeFileSync(data,`export const GENERATED_BAYSIDE_SOUTHEAST_PREVIEW_ENABLED=${preview}; export const GENERATED_BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED=false; export const GENERATED_BAYSIDE_SOUTHEAST_BY_PATH={}; export const BAYSIDE_SOUTHEAST_REVIEW_PATH='/bayside-southeast-review';`);
 else writeFileSync(data,readFileSync(data,'utf8').replace(/GENERATED_BAYSIDE_SOUTHEAST_PREVIEW_ENABLED = (?:true|false)/,`GENERATED_BAYSIDE_SOUTHEAST_PREVIEW_ENABLED = ${preview}`));
 return (await import(pathToFileURL(resolve(dir,'_worker.js')).href)).default;
}
function mocks() {
 const asset=vi.fn(async()=>new Response('<!doctype html><html><head><title>Fallback</title><meta name="robots" content="index, follow"></head><body><div id="root"><div>legacy</div></div><script type="module" src="/assets/app.js"></script><noscript><img src="https://www.facebook.com/tr?ev=PageView"></noscript></body></html>',{headers:{'Content-Type':'text/html'}}));
 const spies={prepare:vi.fn(),put:vi.fn(),fetch:vi.fn(()=>{throw new Error('Provider forbidden')}),waitUntil:vi.fn(),cachePut:vi.fn()};
 vi.stubGlobal('fetch',spies.fetch);vi.stubGlobal('caches',{default:{match:vi.fn(),put:spies.cachePut}});
 return {spies,env:{ASSETS:{fetch:asset},LEAD_BACKUP_DB:{prepare:spies.prepare},LEAD_PHOTOS:{put:spies.put},LEAD_PREVIEW_DRY_RUN:'false'},ctx:{waitUntil:spies.waitUntil},asset};
}
afterEach(()=>{vi.unstubAllGlobals();while(dirs.length)rmSync(dirs.pop()!,{recursive:true,force:true});});
describe('candidate preview refuses mutations before side effects',()=>{
 const paths=['/api/quote-submit','/api/trpc/quote.submit','/api/trpc/quote.submit,callback.submit?batch=1','/api/trpc/%71uote.submit','/api/callback-submit','/api/upload-photo','/api/trpc/quote.sendBookingLink','/api/guide-submit','/api/trpc/guide.submit','/api/other-trade-submit','/api/unknown-mutation','/API/quote-submit','/api%2fquote-submit','/api/quote-submit/'];
 it.each(paths)('blocks %s with no persistence or delivery',async path=>{
  const w=await loadWorker();const m=mocks();
  const r=await w.fetch(new Request('https://review.pages.dev'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Local fixture',phone:'0424001122',email:'fixture@example.invalid',suburb:'Wynnum',service:'Driveway',details:'Local mock only sufficiently detailed concrete request',formStartedAt:Date.now()-6000})}),m.env,m.ctx);
  expect(r.status).toBe(403);expect(await r.text()).toContain('PREVIEW_SUBMISSION_DISABLED');
  for(const spy of Object.values(m.spies))expect(spy).not.toHaveBeenCalled();expect(m.asset).not.toHaveBeenCalled();
  expect(r.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');expect(r.headers.get('Content-Security-Policy')).toBeTruthy();
 });
 it.each(['/api/trpc/quote.submit','/api/trpc/quote.sendBookingLink','/api/upload-photo'])('wrong-method GET does not execute %s',async path=>{
  const w=await loadWorker();const m=mocks();const r=await w.fetch(new Request('https://review.pages.dev'+path),m.env,m.ctx);expect(r.status).toBe(403);for(const spy of Object.values(m.spies))expect(spy).not.toHaveBeenCalled();
 });
 it('preserves OPTIONS and static safe reads',async()=>{const w=await loadWorker();const m=mocks();expect((await w.fetch(new Request('https://review.pages.dev/api/quote-submit',{method:'OPTIONS'}),m.env,m.ctx)).status).toBe(204);expect((await w.fetch(new Request('https://review.pages.dev/get-quote'),m.env,m.ctx)).status).toBe(200);});
 it('does not block ordinary customer validation',async()=>{const w=await loadWorker();const m=mocks();const r=await w.fetch(new Request('https://ConcreteConceptsGroup.com./api/quote-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}),m.env,m.ctx);expect(r.status).toBe(400);expect(await r.text()).not.toContain('PREVIEW_SUBMISSION_DISABLED');});
 it('removes noscript tracking only from context-bearing quote response',async()=>{const w=await loadWorker();const m=mocks();const r=await w.fetch(new Request('https://review.pages.dev/get-quote?context=bayside-wynnum-general'),m.env,m.ctx);expect(await r.text()).not.toContain('<noscript>');});
 it.each([undefined, 'false', 'malformed', 'true'])('blocks before body reading even when dry-run is %s',async value=>{
  const w=await loadWorker();const m=mocks();m.env.LEAD_PREVIEW_DRY_RUN=value as string;
  const request=new Request('https://review.pages.dev/api/quote-submit',{method:'POST',body:'{}'});const read=vi.spyOn(request,'text');const json=vi.spyOn(request,'json');
  const r=await w.fetch(request,m.env,m.ctx);expect(r.status).toBe(403);expect(read).not.toHaveBeenCalled();expect(json).not.toHaveBeenCalled();for(const spy of Object.values(m.spies))expect(spy).not.toHaveBeenCalled();
 });
 it('returns actual tRPC error envelopes for individual and mixed batched requests',async()=>{
  const w=await loadWorker();const m=mocks();
  const single=await w.fetch(new Request('https://review.pages.dev/api/trpc/quote.submit',{method:'POST',body:'{}'}),m.env,m.ctx);expect(await single.json()).toMatchObject({error:{json:{data:{httpStatus:403,previewCode:'PREVIEW_SUBMISSION_DISABLED'}}}});
  const batch=await w.fetch(new Request('https://review.pages.dev/api/trpc/quote.submit,callback.submit?batch=1',{method:'POST',body:'{}'}),m.env,m.ctx);const errors=await batch.json();expect(errors).toHaveLength(2);for(const error of errors){expect(error).not.toHaveProperty('result');expect(error.error.json.data.previewCode).toBe('PREVIEW_SUBMISSION_DISABLED');}
 });
 it.each(['/api/trpc/visualiser.qa','/api/trpc/visualiser.generate','/api/trpc/visualiser.timelapse','/api/trpc/visualiser.analyse'])('blocks wrong-method paid entry %s',async path=>{
  const w=await loadWorker();const m=mocks();const r=await w.fetch(new Request('https://review.pages.dev'+path),m.env,m.ctx);expect(r.status).toBe(403);expect(m.asset).not.toHaveBeenCalled();for(const spy of Object.values(m.spies))expect(spy).not.toHaveBeenCalled();
 });
});

describe('candidate raw SEO and publication boundaries', () => {
 const paths=['/areas/wynnum','/areas/manly','/areas/cannon-hill','/areas/mount-gravatt','/areas/mansfield'];
 it.each(['/areas/wynnum','/get-quote','/bayside-southeast-review','/'])('closes tracking and removes all noscript pixels from preview %s',async path=>{
  const w=await loadWorker();const m=mocks();const r=await w.fetch(new Request('https://review.pages.dev'+path),m.env,m.ctx);const html=await r.text();
  expect(html).not.toContain('<noscript>');expect(html).toContain('window.__CCG_CONTEXT_TRACKING_ALLOWED=false');expect(html).toContain('window.__CCG_ISOLATED_PREVIEW=true');
 });
 it.each(['https://concreteconceptsgroup.com','https://WWW.ConcreteConceptsGroup.com.'])('blocks candidate corpus static asset on customer %s without asset fetch',async origin=>{
  for(const preview of [false,true]) {const w=await loadWorker(preview);const m=mocks();const r=await w.fetch(new Request(origin+'/bayside-southeast-content.js'),m.env,m.ctx);expect(r.status).toBe(404);expect(r.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');expect(m.asset).not.toHaveBeenCalled();}
 });
 it.each(paths)('renders exactly one typed raw main and matching three-schema set for %s',async path=>{
  const w=await loadWorker();const m=mocks();
  m.asset.mockImplementation(async()=>new Response('<html><head><title>Legacy</title><script type="application/ld+json">{"@type":"AggregateRating","ratingValue":5}</script></head><body><div id="root"><main><h1>Legacy heading</h1></main></div><script type="module" src="/assets/app.js"></script></body></html>',{headers:{'Content-Type':'text/html'}}));
  const r=await w.fetch(new Request('https://review.pages.dev'+path),m.env,m.ctx);const html=await r.text();
  expect(r.status).toBe(200);expect(html).toContain('data-edge-bayside-southeast-shell="true"');
  expect((html.match(/<h1(?:\s|>)/g)||[])).toHaveLength(1);expect((html.match(/<main(?:\s|>)/g)||[])).toHaveLength(1);
  expect(html).not.toContain('Legacy heading');expect(html).not.toContain('AggregateRating');expect(html).toContain('/assets/app.js');
  expect(html).toContain('href="https://concreteconceptsgroup.com'+path+'"');
  expect(html).toContain('name="robots" content="noindex, nofollow"');
  const schemas=[...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match=>JSON.parse(match[1]));
  expect(schemas.map(item=>item['@type'])).toEqual(['BreadcrumbList','Service','FAQPage']);
  expect((html.match(/data-seo-head="true"/g)||[])).toHaveLength(3);
  expect(html).toContain('context=bayside-'+path.split('/').pop()+'-builder');
  expect(r.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');expect(r.headers.get('Content-Security-Policy')).toBeTruthy();
 });
 it('shows only the five locality candidates on the review index',async()=>{
  const w=await loadWorker();const m=mocks();const r=await w.fetch(new Request('https://review.pages.dev/bayside-southeast-review'),m.env,m.ctx);const html=await r.text();
  expect(r.status).toBe(200);expect(html).toContain('Bayside and South-East Brisbane review');
  for(const path of paths)expect(html).toContain('href="'+path+'"');
  expect(html).not.toContain('href="/gold-coast/');expect(html).not.toContain('href="/regional-slab-review"');
 });
 it.each(['/bayside-southeast-review/unknown','/bayside-southeast-review-wrong','/areas/manly/nested','/areas/unknown-candidate'])('returns real noindex 404 for %s',async path=>{
  const w=await loadWorker();const m=mocks();const r=await w.fetch(new Request('https://review.pages.dev'+path),m.env,m.ctx);expect(r.status).toBe(404);expect(r.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
 });
 it.each(['https://concreteconceptsgroup.com','https://WWW.ConcreteConceptsGroup.com.'])('keeps review unavailable and candidate content out of customer %s',async origin=>{
  const w=await loadWorker();const m=mocks();expect((await w.fetch(new Request(origin+'/bayside-southeast-review'),m.env,m.ctx)).status).toBe(404);
  const r=await w.fetch(new Request(origin+'/areas/manly'),m.env,m.ctx);expect(r.status).toBe(200);expect(await r.text()).not.toContain('data-edge-bayside-southeast-shell');expect(r.headers.get('X-Robots-Tag')).toBeNull();
 });
 it('redirects locality and review variants on preview with query preserved and noindex security',async()=>{
  const w=await loadWorker();const m=mocks();for(const path of ['/AREAS/Manly/','/Bayside-Southeast-Review/']){
   const r=await w.fetch(new Request('https://review.pages.dev'+path+'?utm_source=google'),m.env,m.ctx);expect(r.status).toBe(308);expect(r.headers.get('Location')).toBe(path.toLowerCase().replace(/\/$/,'')+'?utm_source=google');expect(r.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');expect(r.headers.get('X-Frame-Options')).toBe('DENY');
  }
 });
 it('keeps source-default-off review unavailable on a noncustomer host',async()=>{
  const w=await loadWorker(false);const m=mocks();expect((await w.fetch(new Request('https://review.pages.dev/bayside-southeast-review'),m.env,m.ctx)).status).toBe(404);
 });
 it.each(['/assets/app.js','/sitemap.xml','/get-quote'])('finalizes safe preview response headers for %s',async path=>{
  const w=await loadWorker();const m=mocks();const r=await w.fetch(new Request('https://review.pages.dev'+path),m.env,m.ctx);expect(r.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');expect(r.headers.get('Content-Security-Policy')).toBeTruthy();
 });
});
