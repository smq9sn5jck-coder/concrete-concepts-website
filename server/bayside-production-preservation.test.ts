import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
const root=resolve(import.meta.dirname,'..');
const base=resolve(root,'../ccg-production-audit-a640076');
const text=(name:string)=>readFileSync(resolve(root,name),'utf8');
const original=(name:string)=>readFileSync(resolve(base,name),'utf8');
describe('five-page production preserves off-scope live source',()=>{
 it.each(['client/public/sitemap.xml','client/public/seo-manifest.js','client/public/seo-manifest.json','shared/localityContent.ts','shared/southsideLocalityContent.ts','client/src/components/HeroSection.tsx','client/src/pages/Home.tsx','server/routers.ts','server/db.ts','server/email.ts','drizzle/schema.ts'])('preserves %s byte-for-byte',name=>expect(text(name)).toBe(original(name)));
 it('permits only the separately approved quote/phone destinations in tracking configuration',()=>{
  const maskApprovedEntries=(source:string)=>source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/(QUOTE_SUBMISSION|PHONE_CALL)\s*:\s*[^,\n]+,/g,'$1:APPROVED,').replace(/\s+/g,'');
  const source=text('client/src/lib/googleAdsConfig.ts');
  expect(source).toContain('QUOTE_SUBMISSION: "AW-18007005419/oPHGCJSGt44cEOuxtIpD"');
  expect(source).toContain('PHONE_CALL: "AW-18007005419/KuCJCPSeyo4cEOuxtIpD"');
  expect(maskApprovedEntries(source)).toBe(maskApprovedEntries(original('client/src/lib/googleAdsConfig.ts')));
 });
 it('preserves API, D1, Resend, Jotform and private-photo delivery implementation',()=>{
  const names=['handleQuoteSubmit','handleCallbackSubmit','handleGuideSubmit','handleProtectedPhotoRequest','handlePhotoUpload','handleOtherTradeSubmit','backupToManusBackend','backupToJotform','postBookingGateway','createBookingDeliveryToken','sendBookingLinkViaGateway','consumeWorkerRateLimit','releaseLatestWorkerRateLimit','validateWorkerQuoteSubmission'];
  const extract=(source:string,name:string)=>source.slice(source.indexOf(`function ${name}(`),source.indexOf('\n}',source.indexOf(`function ${name}(`))+2);
  for(const name of names){expect(text('client/public/_worker.js')).toContain(`function ${name}(`);expect(extract(text('client/public/_worker.js'),name)).not.toBe('');expect(extract(text('client/public/_worker.js'),name)).toBe(extract(original('client/public/_worker.js'),name));}
 });
 it('build integration is narrow and has an explicit production artifact command',()=>{
  const p=JSON.parse(text('package.json'));
  expect(p.scripts['build:bayside-southeast-production']).toBe('tsx scripts/buildBaysideSoutheastProduction.ts');
  expect(p.scripts.build).not.toMatch(/gold-coast|regional-slab/);
 });
 it('does not carry unrelated staged content registries',()=>{
  const worker=text('client/public/_worker.js');
  expect(worker).not.toContain('gold-coast-content.js');expect(worker).not.toContain('regional-slab-content.js');
 });
});
