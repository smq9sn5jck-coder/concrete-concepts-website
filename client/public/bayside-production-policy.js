import {
  GENERATED_BAYSIDE_SOUTHEAST_PREVIEW_ENABLED,
  GENERATED_BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED,
  GENERATED_BAYSIDE_SOUTHEAST_REVIEW_PATH,
  GENERATED_BAYSIDE_SOUTHEAST_BY_PATH,
  getBaysideSoutheastRouteAccess,
  getBaysideSoutheastMetadata,
  getBaysideSoutheastStructuredData,
  renderBaysideSoutheastContentShell,
} from './bayside-southeast-content.js';

export function isBaysideCustomerHost(host) {
  return ['concreteconceptsgroup.com','www.concreteconceptsgroup.com'].includes(String(host).toLowerCase().replace(/\.+$/, ''));
}
export function normalizeBaysidePath(path) {
  try { const decoded=decodeURIComponent(path); if (/[%\\\u0000-\u001f]/.test(decoded)) return null; return decoded.toLowerCase().replace(/\/+$/, '') || '/'; } catch { return null; }
}
export function isBaysideIsolatedArtifact(url) {
  return (GENERATED_BAYSIDE_SOUTHEAST_PREVIEW_ENABLED || GENERATED_BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED) && !isBaysideCustomerHost(url.hostname);
}
export function bypassBaysideScopedCache(url) {
  const path=normalizeBaysidePath(url.pathname);
  const access=path?getBaysideSoutheastRouteAccess(path,isBaysideCustomerHost(url.hostname)):'not-found';
  return isBaysideIsolatedArtifact(url) || access==='public' || access==='preview' || (path==='/get-quote' && url.searchParams.has('context'));
}
const escapeHtml=value=>String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
function unavailable(request) {
  return new Response(request.method==='HEAD'?null:'<!doctype html><html lang="en-AU"><head><title>Page not available</title><meta name="robots" content="noindex, nofollow"></head><body><main><h1>Page not available</h1><a href="/areas">View service areas</a></main></body></html>',{status:404,headers:{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store'}});
}
function refusal(url,path) {
  const previewCode='PREVIEW_SUBMISSION_DISABLED';
  const message='Submissions are unavailable in this review preview. Nothing has been sent.';
  let data={success:false,code:previewCode,error:message};
  if(path.startsWith('/api/trpc/')){
    const procedures=path.slice('/api/trpc/'.length).split(',');
    const error=procedure=>({error:{json:{message,code:-32003,data:{code:'FORBIDDEN',httpStatus:403,path:procedure,previewCode}}}});
    data=url.searchParams.get('batch')==='1'||procedures.length>1?procedures.map(error):error(procedures[0]);
  }
  return new Response(JSON.stringify(data),{status:403,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}
export function baysideRequestBoundary(request,url) {
  const path=normalizeBaysidePath(url.pathname);
  const customer=isBaysideCustomerHost(url.hostname);
  const read=request.method==='GET'||request.method==='HEAD';
  if (customer && path==='/bayside-southeast-content.js') return unavailable(request);
  if (isBaysideIsolatedArtifact(url) && request.method!=='OPTIONS') {
    const knownMutation=path?.startsWith('/api/') && /(?:\/(?:quote-submit|callback-submit|guide-submit|upload-photo|other-trade-submit)$|\.(?:submit|sendbookinglink|create|send|upload|qa|generate|timelapse|analyse)(?:,|$))/i.test(path);
    if (!read || knownMutation || path===null) return refusal(url,path || url.pathname.toLowerCase());
  }
  if (read && url.pathname.toLowerCase().startsWith(GENERATED_BAYSIDE_SOUTHEAST_REVIEW_PATH)) {
    if (path!==GENERATED_BAYSIDE_SOUTHEAST_REVIEW_PATH || getBaysideSoutheastRouteAccess(path,customer)==='not-found') return unavailable(request);
  }
  const access=path?getBaysideSoutheastRouteAccess(path,customer):'not-found';
  if(read && (access==='public'||access==='preview') && url.pathname!==path) return new Response(null,{status:308,headers:{Location:path+url.search,'Cache-Control':'no-store'}});
  return null;
}
export function applyBaysideProductionHtml(html,url) {
  const path=normalizeBaysidePath(url.pathname),customer=isBaysideCustomerHost(url.hostname);
  const access=path?getBaysideSoutheastRouteAccess(path,customer):'not-found';
  if(access==='preview'||access==='public') {
    const review=path===GENERATED_BAYSIDE_SOUTHEAST_REVIEW_PATH;
    const meta=review?{title:'Bayside and South-East Brisbane review | CCG',description:'Noindex review of five existing locality-page upgrades and local-only homeowner and builder quote paths.',canonical:path}:getBaysideSoutheastMetadata(path);
    if(meta){
      const put=(pattern,tag)=>{html=pattern.test(html)?html.replace(pattern,tag):html.replace(/<\/head>/i,tag+'</head>');};
      const robots=access==='preview'||review?'noindex, nofollow':'index, follow';
      const canonical='https://concreteconceptsgroup.com'+meta.canonical;
      put(/<title>[\s\S]*?<\/title>/i,'<title>'+escapeHtml(meta.title)+'</title>');
      put(/<meta\s+name=["']description["'][^>]*>/i,'<meta name="description" content="'+escapeHtml(meta.description)+'">');
      put(/<meta\s+name=["']robots["'][^>]*>/i,'<meta name="robots" content="'+robots+'">');
      put(/<link\s+rel=["']canonical["'][^>]*>/i,'<link rel="canonical" href="'+escapeHtml(canonical)+'">');
      for(const [name,value] of [['og:title',meta.title],['og:description',meta.description],['og:url',canonical]])put(new RegExp('<meta\\s+property=["\']'+name+'["\'][^>]*>','i'),'<meta property="'+name+'" content="'+escapeHtml(value)+'">');
      for(const [name,value] of [['twitter:title',meta.title],['twitter:description',meta.description]])put(new RegExp('<meta\\s+name=["\']'+name+'["\'][^>]*>','i'),'<meta name="'+name+'" content="'+escapeHtml(value)+'">');
      html=html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,'');
      const schemas=review?[]:getBaysideSoutheastStructuredData(path);
      html=html.replace(/<\/head>/i,schemas.map(schema=>'<script type="application/ld+json" data-seo-head="true">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script>').join('')+'</head>');
      const content=review?'<main data-edge-bayside-southeast-shell="true"><h1>Bayside and South-East Brisbane review</h1><p>Noindex review only. Submissions are unavailable; nothing is forwarded.</p><ul>'+Object.entries(GENERATED_BAYSIDE_SOUTHEAST_BY_PATH).map(([route,record])=>'<li><a href="'+escapeHtml(route)+'">'+escapeHtml(record.locality)+'</a><p>'+escapeHtml(record.description)+'</p></li>').join('')+'</ul></main>':renderBaysideSoutheastContentShell(path);
      html=html.replace(/(<div\s+id=["']root["'][^>]*>)[\s\S]*?<\/div>(\s*(?=<script\b))/i,'$1'+content+'</div>$2');
    }
  }
  if(isBaysideIsolatedArtifact(url)) {
    html=html.replace(/<head\b[^>]*>/i,'$&<script data-cfasync="false">window.__CCG_ISOLATED_PREVIEW=true;window.__CCG_CONTEXT_TRACKING_ALLOWED=false;</script>');
    html=html.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,'');
    html=html.replace(/<link\b[^>]*(?:googletagmanager\.com|connect\.facebook\.net)[^>]*>/gi,'');
  }
  if(path==='/get-quote' && url.searchParams.has('context'))html=html.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,'');
  return html;
}
export function finalizeBaysideArtifactResponse(response,url) {
  if(!isBaysideIsolatedArtifact(url)){
    const path=normalizeBaysidePath(url.pathname);
    if(response.ok && isBaysideCustomerHost(url.hostname) && path && getBaysideSoutheastRouteAccess(path,true)==='public'){
      const headers=new Headers(response.headers);
      headers.delete('X-Robots-Tag');
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
    }
    return response;
  }
  const headers=new Headers(response.headers);
  headers.set('X-Robots-Tag','noindex, nofollow');
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('X-Frame-Options','DENY');
  headers.set('Referrer-Policy','no-referrer');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
