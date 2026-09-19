# Batch 1 Locality Pages and Partner Portal Production Release

**Release date:** 20 September 2026 (AEST)  
**Status:** Production release, monitoring, advertising readback, and source verification complete  
**Production deployment:** `87a8a2b1-a6f7-42ff-8b62-9d6ce1a120ae`  
**Immediate rollback:** `b0bcd192-4162-467d-8afa-1dfa7c3c907a`  
**Source checkpoint:** `910bd1af7f443671cfdefcd52b0703d415237fa8`

## Decision and SEO rationale

All 20 approved locality pages were released together. This is not inherently a Google penalty risk. Google's published spam policies focus on **doorway abuse** and **scaled content created primarily to manipulate rankings**, while its people-first guidance asks whether pages provide useful, original, audience-relevant information.[1][2] The released set uses fixed, reviewed records with locality-specific site considerations, factual citations, distinct metadata, nearby live guides, and a useful handoff into CCG's existing detailed quote process. It does not mass-generate interchangeable pages, fabricate local offices or work, or create multiple funnels that lead to the same thin destination.

A single controlled release was safer than arbitrary drip publishing because all pages had already passed the same quality, route, metadata, citation, sitemap, and conversion-isolation checks. Performance should be reviewed in Google Search Console after crawling and indexing; weak pages should be improved or removed based on evidence rather than an artificial publication schedule.

## Released locality pages

| Type | Localities |
|---|---|
| New public routes | Moggill, Murarrie, Mermaid Waters, Clear Island Waters, White Rock, Silkstone, Spring Mountain, South Ripley, Flagstone, Crestmead, Yarrabilba, Clontarf |
| Upgraded existing routes | Everton Park, Rochedale, Upper Coomera, Pimpama, Beenleigh, Strathpine, Caboolture, Morayfield |

All 20 routes returned HTTP 200 on the customer domain without an `X-Robots-Tag: noindex` header. All 20 canonical URLs were present in the live XML sitemap. The service-area directory showed 121 suburb-only entries, including all 12 new routes.

## Production deployment evidence

The first deployment attempt, `b9cfbffc-2eb4-4a02-82e5-e824b59cae3f`, failed before promotion because the raw Worker source imported `seo-manifest.js` without including its module bundle. Cloudflare's deployment log reported: `No such module "seo-manifest.js" imported from "worker.mjs".` The customer site therefore remained on the healthy prior deployment.

The Worker and its three existing local support modules were then bundled into one self-contained ESM Worker. Syntax, embedded publication configuration, absence of remaining relative imports, and archive integrity were verified before retrying. Deployment `87a8a2b1-a6f7-42ff-8b62-9d6ce1a120ae` completed successfully and became canonical for both `https://concreteconceptsgroup.com` and `https://www.concreteconceptsgroup.com`.

Immediate HTTP checks confirmed the homepage, `/get-quote`, `/areas`, `/sitemap.xml`, and `/robots.txt` return HTTP 200. The unreleased `/need-another-trade` route remains HTTP 404 with `X-Robots-Tag: noindex, nofollow`; no other-trade request flow was published.

A real-browser check rendered the live Moggill page with the expected title, breadcrumb, locality-specific H1 and site guidance, ABS source link, service cards, nearby guides, phone link, and existing five-step detailed quote actions. No lead was submitted during testing.

## Partner Portal release

The retained partner programme remains at [partners.concreteconceptsgroup.com/partners](https://partners.concreteconceptsgroup.com/partners). Cloudflare redirect ruleset `4b3fae7136444aa1a1f197cd4037c1d6` was updated to version 2. It now sends `/partners`, nested `/partners/*`, retired `/trade-partners*` paths, and the retired `trade.` host to the retained portal.

GET and HEAD requests use HTTP 308. Other methods use HTTP 302 so request bodies are not replayed to the portal. Production checks confirmed the intended redirect target, a live HTTP 200 partner portal, and no redirect on the unrelated `/get-quote` route.

## Lead-delivery safety

No customer lead, provider request, email test, or advertising conversion was created during this release. The five-step quote route, Gmail/Jotform/D1 delivery architecture, private R2 photos, and quote-only primary conversion boundary were not changed.

A read-only Resend account check found the CCG sending domain verified with sending enabled and recent production quote notifications marked delivered. Two local live-test failures were traced to a separate sandbox credential and do not represent the Cloudflare production sender.

## Final verification

The final deterministic source suite passed **59 test files and 733 tests**, followed by TypeScript checking, a guarded production build, source and compiled quote-isolation guards, Worker syntax validation, diff hygiene, and confirmation that both checked-in preview flags remain off.

At 15 minutes 30 seconds after the successful deployment, a bounded production monitor rechecked the homepage, five-step quote page, service-area directory, representative new locality pages, sitemap, robots file, disabled other-trade route, Partner Portal shortcut, and retained portal. It also rechecked all 20 released locality URLs and their sitemap membership. Every expected result passed: the public routes remained HTTP 200 and indexable, `/need-another-trade` remained HTTP 404, `/partners` remained an HTTP 308 to the retained portal, and the portal remained HTTP 200.

The authorised GitHub repository is aligned separately from the Cloudflare deployment; a GitHub commit is source control only and is not represented as a second production deployment.

## Sources

[1]: https://developers.google.com/search/docs/essentials/spam-policies
[2]: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

The live service-area directory was also rendered in a real browser. It reported 121 listed localities, showed all 12 new routes in their intended regions, and retained suburb-only link labels such as `Moggill`, `Murarrie`, and `Clontarf` rather than repetitive `Concreter [suburb]` labels.

The live `/get-quote` route rendered the unchanged five-step detailed enquiry with Step 1 contact controls, Australian `04` mobile placeholder, preferred-contact choices, optional site-photo messaging, autosave notice, and the explicit statement that no conversion is counted until confirmation. The shared test browser displayed previously autosaved audit-only placeholder values; the form was not advanced or submitted, and no lead or conversion was created.

A real-browser navigation to `https://concreteconceptsgroup.com/partners` followed the new edge redirect to `https://partners.concreteconceptsgroup.com/partners` and rendered the retained `CCG Trade Partner Portal` page with its application, login, programme, tracking, reward, privacy, and terms paths. No application or referral was submitted.

A focused browser console check on the live Moggill page reported **0 errors and 0 warnings**.

A focused browser console check on the live five-step quote page also reported **0 errors and 0 warnings**.

## Post-release Google Ads readback

A fresh read-only GAQL audit after production release confirmed that the website deployment made **no Google Ads configuration change**. Search campaign `24184424558` remains enabled with Maximise conversion value, 300% target ROAS, Google Search and Search Partners enabled, Content Network disabled, and Presence targeting. Performance Max `23655153762` remains enabled at A$160/day with Presence targeting. Tradenet `23706443928` remains enabled at A$0.20/day with Presence targeting.

Search remains at **A$330/day**, not the previously expected A$110/day. Change history shows that this was changed from A$110 to A$330 through the Google Ads mobile app by `info@concreteconceptsgroup.com` on 17 September 2026. It predates and is unrelated to this website release. No budget, bid, campaign, keyword, or conversion mutation was made during this work.

Search and Performance Max remain assigned at campaign level to custom goal `6458854572`, `CCG Quote Form Only`. That goal remains enabled and contains only conversion action `7546454804`, `Quote Form Submission`, which remains enabled and primary for goal optimisation. The Display Expansion, Keyword, and Use Broad Match Keyword Auto-Apply subscriptions remain paused.

At the readback time today, Performance Max had 549 impressions, 8 clicks, A$18.95 spend and 0 recorded conversions; Search had 22 impressions, 1 click, A$1.26 spend and 0 recorded conversions; Tradenet had no activity. These are partial-day observations, not a performance conclusion.

Enabled Search ads still point to the existing CCG detailed quote, exposed aggregate, and retaining-wall landing routes. All three enabled Performance Max asset groups still point to `https://concreteconceptsgroup.com`; the only asset group referencing the old `.org` address remains removed. No active ad was redirected to a locality page or the Partner Portal.
