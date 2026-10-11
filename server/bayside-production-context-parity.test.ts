import {copyFileSync,readdirSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {afterEach,describe,it,expect,vi} from 'vitest';
import {validateQuoteProjectContext} from '../shared/quoteProjectContext';
const root=resolve(import.meta.dirname,'..'),dirs:string[]=[];
async function load(){const dir=mkdtempSync(resolve(tmpdir(),'ccg-context-parity-'));dirs.push(dir);for(const f of readdirSync(resolve(root,'client/public')).filter(f=>f.endsWith('.js')))copyFileSync(resolve(root,'client/public',f),resolve(dir,f));return(await import(pathToFileURL(resolve(dir,'_worker.js')).href)).default;}
const context={audienceType:'builder_developer',structuralProjectType:'other_concrete',builderCompanyName:'Fixture Construction',requiredConcreteScope:'Replace a driveway, local mocked test only',indicativeProgramme:'Planning phase',partnerIntroductionInterest:false,landingRoute:'/areas/wynnum',region:'Brisbane'};
function brief(){return{version:1,contact:{name:'Local Fixture',mobile:'0424001122',email:'fixture@example.invalid'},location:{streetAddress:'Local test address',suburb:'Wynnum',postcode:'4178'},scope:{services:['driveway'],workType:'replacement',finish:'plain',timeframe:'planning',description:'Local mock only replace driveway and review drainage'},measurements:{mode:'not_sure'},siteConditions:{},photos:[],consents:{contact:true,privacy:true,marketing:false},projectContext:{...context}};}
afterEach(()=>{vi.unstubAllGlobals();while(dirs.length)rmSync(dirs.pop()!,{recursive:true,force:true})});
describe('optional context Worker/shared parity with no real delivery',()=>{
 it.each([
  {name:'missing company',changes:{builderCompanyName:''}},
  {name:'missing scope',changes:{requiredConcreteScope:''}},
  {name:'missing programme',changes:{indicativeProgramme:''}},
  {name:'unknown field',changes:{autoForward:true}},
  {name:'ineligible partner interest',changes:{partnerIntroductionInterest:true}},
  {name:'missing slab complete extension',changes:{structuralProjectType:'complete_extension'}},
  {name:'invalid audience',changes:{audienceType:'partner'}},
  {name:'malformed consent',changes:{partnerIntroductionInterest:'true'}},
 ])('rejects $name before external delivery',async({changes})=>{const w=await load(),b=brief();Object.assign(b.projectContext,changes);expect(validateQuoteProjectContext(b.projectContext,{streetAddress:b.location.streetAddress,services:b.scope.services}).success).toBe(false);const send=vi.fn(()=>{throw Error('Provider forbidden')});vi.stubGlobal('fetch',send);const r=await w.fetch(new Request('https://concreteconceptsgroup.com/api/quote-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({submissionId:crypto.randomUUID(),jobBrief:b,formStartedAt:Date.now()-6000})}),{},{});expect(r.status).toBe(400);expect(send).not.toHaveBeenCalled();});
 it('requires builder street address at both boundaries',async()=>{const w=await load(),b=brief();b.location.streetAddress='';expect(validateQuoteProjectContext(b.projectContext,{streetAddress:'',services:b.scope.services}).success).toBe(false);vi.stubGlobal('fetch',vi.fn(()=>{throw Error('Provider forbidden')}));const r=await w.fetch(new Request('https://concreteconceptsgroup.com/api/quote-submit',{method:'POST',body:JSON.stringify({submissionId:crypto.randomUUID(),jobBrief:b,formStartedAt:Date.now()-6000})}),{},{});expect(r.status).toBe(400);});
 it('retains context in existing D1 JSON and formats validated owner details with only local mocks',async()=>{
  const w=await load(),b=brief();b.projectContext.builderCompanyName='  Fixture Construction  ';
  const inputs:any[][]=[];
  const prepare=vi.fn(()=>({bind:(...args:any[])=>{inputs.push(args);return{first:async()=>null,run:async()=>({success:true,meta:{changes:1}})}}}));
  const send=vi.fn(async()=>new Response('{}',{status:200,headers:{'Content-Type':'application/json'}}));vi.stubGlobal('fetch',send);
  const r=await w.fetch(new Request('https://concreteconceptsgroup.com/api/quote-submit',{method:'POST',body:JSON.stringify({submissionId:crypto.randomUUID(),jobBrief:b,formStartedAt:Date.now()-6000})}),{LEAD_BACKUP_DB:{prepare},RESEND_API_KEY:'local-mock-not-a-credential'},{});
  expect(r.status).toBe(200);expect(await r.json()).toMatchObject({success:true,duplicate:false});const insert=inputs.find(args=>args.length===12)!;expect(insert).toBeDefined();
  expect(JSON.parse(insert[11]).projectContext.audienceType).toBe('builder_developer');
  expect(insert[8]).toContain('Audience: Builder / developer');expect(insert[8]).toContain('Indicative programme: Planning phase');expect(insert[8]).toContain('Partner introduction interest: No');
  expect(insert[8]).toContain('Builder company: Fixture Construction\n');expect(insert[8]).not.toContain('Builder company:   Fixture');
 });
});
