from pathlib import Path
import requests, re, json, hashlib

ROOT = Path(__file__).resolve().parent.parent
BASE = 'http://127.0.0.1:4176'
ROUTES = ['wynnum', 'manly', 'cannon-hill', 'mount-gravatt', 'mansfield']
rows = []
for host in ['concreteconceptsgroup.com', 'www.concreteconceptsgroup.com']:
    for slug in ROUTES:
        path = '/areas/' + slug
        r = requests.get(BASE + path, headers={'x-ccg-qa-host': host}, timeout=10)
        assert r.status_code == 200, (host, path, r.status_code)
        assert 'data-edge-bayside-southeast-shell' in r.text
        assert 'name="robots" content="index, follow"' in r.text
        assert 'noindex' not in r.headers.get('X-Robots-Tag', '')
        assert f'<link rel="canonical" href="https://concreteconceptsgroup.com{path}">' in r.text
        schemas = [json.loads(x) for x in re.findall(r'<script\b[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', r.text, re.S)]
        assert [x['@type'] for x in schemas] == ['BreadcrumbList', 'Service', 'FAQPage']
        assert len(re.findall(r'<h1\b', r.text)) == 1
        for audience in ['general', 'homeowner', 'builder']:
            assert f'context=bayside-{slug}-{audience}' in r.text
        assert not re.search(r'\b(?:guarantee|insured|QBCC|5.star|free quote)\b', re.sub(r'<script.*?</script>', '', r.text, flags=re.S), re.I)
        rows.append({'host':host, 'path':path, 'status':r.status_code, 'schemas':len(schemas), 'indexable':True})
    for path in ['/bayside-southeast-review', '/bayside-southeast-content.js']:
        r=requests.get(BASE+path,headers={'x-ccg-qa-host':host},timeout=10)
        assert r.status_code==404 and 'noindex' in r.headers.get('X-Robots-Tag','')
    sitemap=requests.get(BASE+'/sitemap.xml',headers={'x-ccg-qa-host':host},timeout=10)
    urls=re.findall(r'<loc>(.*?)</loc>',sitemap.text)
    assert len(urls)==214, len(urls)
    assert not any('/bayside-southeast-review' in x for x in urls)
    raw=requests.get(BASE+'/get-quote?context=bayside-manly-builder&utm_source=google',headers={'x-ccg-qa-host':host},timeout=10)
    plain=requests.get(BASE+'/get-quote',headers={'x-ccg-qa-host':host},timeout=10)
    assert '<noscript>' not in raw.text and '<noscript>' in plain.text
for path in ['/areas/manly','/','/sitemap.xml','/robots.txt','/bayside-southeast-review']:
    r=requests.get(BASE+path,timeout=10)
    assert 'noindex' in r.headers.get('X-Robots-Tag','')
    if r.headers.get('Content-Type','').startswith('text/html') and r.status_code==200:
        assert '__CCG_ISOLATED_PREVIEW=true' in r.text and '<noscript>' not in r.text
    rows.append({'host':'candidate-review.pages.dev','path':path,'status':r.status_code,'noindex':True})
result={'local_only':True,'built_publication':True,'preview_enabled':False,'route_checks':rows,'public_sitemap_count':214,'submissions_sent':0,'tracking_release_blocker':'Local build quote/phone labels differ from retained customer deployment; separate reconciliation required.'}
output=ROOT/'dist/bayside-production-local-edge-qa.json'
output.write_text(json.dumps(result,indent=2)+'\n')
print('PASS: ten indexable five-page alias checks, private review/corpus, 214 sitemap URLs, context noscript removal, noncustomer isolation. Local only; no submissions.')
