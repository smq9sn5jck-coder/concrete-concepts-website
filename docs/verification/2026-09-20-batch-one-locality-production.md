# Batch 1 Locality Pages and Partner Portal Production Release

**Release date:** 20 September 2026 (AEST)  
**Status:** Production release, monitoring, advertising readback, and source verification complete  
**Production deployment:** `87a8a2b1-a6f7-42ff-8b62-9d6ce1a120ae`  
**Immediate rollback:** `b0bcd192-4162-467d-8afa-1dfa7c3c907a`  
**Authorised GitHub release source:** `9df3d94`

## Executive result

The approved Batch 1 release is live on [Concrete Concepts Group](https://concreteconceptsgroup.com). All 20 locality pages are public and indexable, the 12 new localities appear in the service-area directory using suburb-only labels, and all 20 canonical URLs appear in the XML sitemap. The retained [CCG Trade Partner Portal](https://partners.concreteconceptsgroup.com/partners) is also accessible through the new main-domain `/partners` shortcut.

The five-step concreting quote funnel, lead-delivery architecture, private photo storage, and quote-only Google Ads conversion boundary were not changed. The separate Need Another Trade flow remains unpublished, HTTP 404, and noindex on the customer domain.

## SEO decision

All 20 reviewed pages were released together. Publishing 20 pages at once is not, by itself, a Google penalty trigger. Google's published spam policies focus on **doorway abuse** and **scaled content created primarily to manipulate rankings**, while its people-first guidance asks whether pages provide useful, original, audience-relevant information.[1][2]

The released set uses fixed, reviewed records with locality-specific site considerations, factual citations, distinct metadata, nearby live guides, and a useful handoff into CCG's existing detailed quote process. It does not mass-generate interchangeable pages, fabricate local offices or work, or create multiple thin funnels. A single controlled release was therefore safer than arbitrary drip publishing because every page had already passed the same route, metadata, citation, sitemap, usability, and conversion-isolation checks. Performance should now be reviewed in Google Search Console after crawling and indexing; weak pages should be improved or removed based on evidence.

## Released locality pages

| Type | Localities |
|---|---|
| New public routes | Moggill, Murarrie, Mermaid Waters, Clear Island Waters, White Rock, Silkstone, Spring Mountain, South Ripley, Flagstone, Crestmead, Yarrabilba, Clontarf |
| Upgraded existing routes | Everton Park, Rochedale, Upper Coomera, Pimpama, Beenleigh, Strathpine, Caboolture, Morayfield |

All 20 routes returned HTTP 200 on the customer domain without an `X-Robots-Tag: noindex` header. All 20 canonical URLs were present in the live XML sitemap. The service-area directory reported 121 listed localities and showed every new route in its intended region.

## Cloudflare production evidence

The first upload attempt, `b9cfbffc-2eb4-4a02-82e5-e824b59cae3f`, failed before promotion because the raw Worker source referenced a local module that had not been included in the upload. Cloudflare left the healthy prior production deployment in place. The existing Worker modules were then bundled into one self-contained ESM Worker, and syntax, embedded configuration, import resolution, and archive integrity were verified before retrying.

Deployment `87a8a2b1-a6f7-42ff-8b62-9d6ce1a120ae` completed successfully and became canonical for both the apex and `www` customer domains. Immediate checks confirmed HTTP 200 responses for the homepage, `/get-quote`, `/areas`, `/sitemap.xml`, and `/robots.txt`. The unreleased `/need-another-trade` route remained HTTP 404 with `X-Robots-Tag: noindex, nofollow`.

## Partner Portal release

Cloudflare redirect ruleset `4b3fae7136444aa1a1f197cd4037c1d6` was updated to version 2. It now sends `/partners`, nested `/partners/*`, retired `/trade-partners*` paths, and the retired `trade.` host to the retained portal.

GET and HEAD requests use HTTP 308. Other methods use HTTP 302 so request bodies are not replayed to the portal. Production checks confirmed the intended destination, a live HTTP 200 portal, and no redirect on the unrelated `/get-quote` route. A real-browser navigation through the new shortcut rendered the retained portal with its application, login, programme, tracking, reward, privacy, and terms paths. No application or referral was submitted.

## Quote and lead-delivery safety

No customer lead, provider request, email test, or advertising conversion was created during this release. The existing five-step quote route rendered its Step 1 contact controls, Australian `04` mobile placeholder, preferred-contact choices, optional site-photo messaging, autosave notice, and the statement that no conversion is counted until confirmation. The form was not advanced or submitted.

The Gmail/Jotform/D1 delivery architecture and private R2 photo flow were unchanged. A pre-release read-only Resend check found the CCG sending domain verified with sending enabled and recent production quote notifications marked delivered. Separate local-development 403 messages came from a sandbox credential and were not the Cloudflare production sender.

## Browser and production monitoring

A real-browser check rendered the live Moggill page with the expected title, breadcrumb, locality-specific H1 and site guidance, ABS source link, service cards, nearby guides, phone link, and existing five-step quote actions. The service-area directory retained suburb-only labels such as `Moggill`, `Murarrie`, and `Clontarf`, rather than repetitive `Concreter [suburb]` labels. Focused browser console checks reported **0 errors and 0 warnings** on both the Moggill page and the five-step quote page.

At 15 minutes 30 seconds after deployment, a bounded production monitor rechecked the homepage, quote page, service-area directory, representative new locality pages, sitemap, robots file, disabled other-trade route, Partner Portal shortcut, and retained portal. It also rechecked all 20 released locality URLs and sitemap entries. Every expected result passed: public routes remained HTTP 200 and indexable, `/need-another-trade` remained HTTP 404, `/partners` remained an HTTP 308 to the portal, and the portal remained HTTP 200.

## Post-release Google Ads readback

A fresh read-only GAQL audit confirmed that the website release made **no Google Ads configuration change**. Search campaign `24184424558` remains enabled with Maximise conversion value, 300% target ROAS, Google Search and Search Partners enabled, Content Network disabled, and Presence targeting. Performance Max `23655153762` remains enabled at A$160/day with Presence targeting. Tradenet `23706443928` remains enabled at A$0.20/day with Presence targeting.

Search remains at **A$330/day**, not the previously expected A$110/day. Change history shows that it was changed from A$110 to A$330 through the Google Ads mobile app by `info@concreteconceptsgroup.com` on 17 September 2026. That change predates and is unrelated to this website release. No budget, bid, campaign, keyword, or conversion mutation was made during this work.

Search and Performance Max remain assigned at campaign level to custom goal `6458854572`, `CCG Quote Form Only`. That goal remains enabled and contains only conversion action `7546454804`, `Quote Form Submission`, which remains enabled and primary for goal optimisation. The Display Expansion, Keyword, and Use Broad Match Keyword Auto-Apply subscriptions remain paused.

At the readback time, Performance Max had 549 impressions, 8 clicks, A$18.95 spend and 0 recorded conversions for the partial day; Search had 22 impressions, 1 click, A$1.26 spend and 0 recorded conversions; Tradenet had no activity. These are partial-day observations, not a performance conclusion.

Enabled Search ads still point to the existing CCG detailed quote, exposed aggregate, and retaining-wall landing routes. All three enabled Performance Max asset groups still point to the current CCG customer domain. The only asset group referencing the old `.org` address remains removed. No active ad was redirected to a locality page or the Partner Portal.

## Source and verification

The managed source passed **59 test files and 733 tests**, followed by TypeScript checking, a guarded production build, source and compiled quote-isolation guards, Worker syntax validation, diff hygiene, and confirmation that both checked-in preview flags remain off.

The authorised GitHub source, which contains additional booking and branding coverage, passed **65 test files and 756 tests** plus the same type, build, quote, Worker, and production-default checks. The release source was pushed through commit `9df3d94`, followed by this verification record. The GitHub push is source control only and was not represented as a second Cloudflare deployment.

## Sources

[1]: https://developers.google.com/search/docs/essentials/spam-policies
[2]: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
