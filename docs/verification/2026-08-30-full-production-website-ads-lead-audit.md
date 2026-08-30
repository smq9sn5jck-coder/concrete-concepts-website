# Full Production Website, Ads and Lead Audit

**Author:** Manus AI
**Date:** 30 August 2026
**Status:** Completed — read-only audit; no Cloudflare, website or Google Ads setting changed

## Executive Summary

The main customer website is live, the five-step quote funnel is working, and genuine detailed quotes are currently reaching both `info@concreteconceptsgroup.com` and the enabled Jotform. Five genuine quotes were independently matched across Gmail, Jotform and Resend from 23–30 August, including two on 30 August. Google Ads also reports two PMax `Quote Form Submission` conversions on 30 August. The website, PMax call asset, SMS and WhatsApp actions all use the correct CCG number, **0424 463 268**. Actual connected phone calls cannot be confirmed from Ads because the account has click-to-call interactions but no August `call_view` records.

The acquisition system is therefore operational, but the audit found three urgent integrity problems: the Manus database backup falsely claims success while storing no records; 12 public/commercial sitemap pages are blocked from Google by `noindex`; and the homepage contains regulated/absolute claims plus a direct third-party phone/email that require director and professional review. These issues do not currently stop Gmail/Jotform delivery, but they create avoidable lead-loss, organic-visibility and trust risk.

| Area | Audit conclusion |
|---|---|
| Website availability | Healthy after a 212-URL crawl and final live sample; no persistent 404 or 5xx found |
| Detailed quote funnel | Healthy; validation, service-area controls and conversion isolation passed |
| Owner email and Jotform | Healthy; five genuine detailed quotes matched, including two on 30 August |
| Backup delivery | **Fault:** zero database records and false-success handling |
| Phone number | Correct across CCG website, schema, SMS, WhatsApp and approved PMax call asset |
| Connected phone calls | Not independently verifiable; Ads has no August call-detail rows |
| Google Ads | Main campaigns are Presence-only and quote-only; destinations are correct; PMax A$160 and Search A$60 unchanged |
| Technical SEO | **Fault:** 12 sitemap pages carry `noindex`; titles/descriptions and sitemap freshness also need improvement |
| Customer trust/content | **High risk:** licence wording, unsupported claims, stale review rating and direct third-party contact require review |

## Audit Objective

Verify the complete public CCG customer acquisition system from first click to delivered enquiry: Cloudflare routing, every public URL, navigation and contact link, responsive rendering, the detailed five-step quote funnel, secondary contact paths, technical SEO, Google Ads configuration and recent genuine lead evidence in Gmail and Jotform.

## Protected Business Rules

The audit will not submit an unlabelled production lead or enter customer data. Only a confirmed completed five-step quote may remain the primary Google Ads conversion. Phone, SMS, WhatsApp, callback, guide and visualiser interactions must remain secondary and non-biddable. The AU `04` mobile requirement, Brisbane/SEQ qualification, anti-spam controls, Gmail/Jotform/backup delivery, the owner-set A$160/day PMax budget, approved A$60/day Search budget, Search Content Network exclusion, PMax URL exclusions and the retained `partners.` portal must not be changed during this read-only audit.

## Systems in Scope

| Layer | Audit coverage |
|---|---|
| Cloudflare | Pages deployment, custom domains, DNS/Worker routes, Single Redirects, response status and performance |
| Customer website | Sitemap routes, direct routes, paid landing pages, legacy aliases, navigation, media, forms and responsive behavior |
| Lead delivery | Five-step quote, callbacks, guide, visualiser, Gmail, Jotform and backup behavior |
| Contact paths | Published phone number, `tel:`, `sms:` and WhatsApp destinations |
| SEO | Sitemap, robots, metadata, canonicals, noindex, schema, headings, links, duplicate/thin content and soft 404s |
| Google Ads | Campaign status, budgets, bidding, networks, geography, keywords/search terms, final URLs, PMax exclusions and conversion goals |

## Evidence Standard

Every problem must be reproduced or supported by production data before it is recommended for correction. Tests, monitoring probes, taps, page views and Ads-reported interactions will not be counted as genuine customer leads. No production mutation will be made without a separately validated rollback and explicit approval.

## Cloudflare Production Baseline

The active Pages project is `concrete-concepts-group`. Its canonical production deployment is `c2c56e33-d43a-45a5-b375-b8bdc0430a00`, created on 29 August 2026 at 15:39 UTC with a successful deployment stage. Both `concreteconceptsgroup.com` and `www.concreteconceptsgroup.com` are attached aliases and proxied CNAME records pointing to `concrete-concepts-group.pages.dev`.

| Production surface | Verified owner/routing |
|---|---|
| Customer apex and `www` | Cloudflare Pages deployment `c2c56e33` |
| `partners.concreteconceptsgroup.com/*` | Worker service `ccg-partner-portal` |
| Apex `/trade-partners*` | Legacy Worker route `ccg-trade-partners`, superseded before execution by the dynamic redirect ruleset |
| `trade.concreteconceptsgroup.com/*` | Proxied hostname covered by the dynamic redirect ruleset |
| `leads.concreteconceptsgroup.com` | Proxied hostname retained for the separate lead system |

The live redirect entrypoint remains ruleset `4b3fae7136444aa1a1f197cd4037c1d6`, version 1. It has exactly two enabled rules: GET/HEAD use 308 and all other methods use 302, both targeting `https://partners.concreteconceptsgroup.com/partners` without preserving query strings. The scope remains apex `/trade-partners*` plus all paths on `trade.`; it does not include the `www` counterpart or apex/www `/partners*` aliases identified in the earlier soft-404 audit. No Cloudflare setting changed during this baseline readback.

## Complete Production URL Crawl

The audit inventory contains all 202 live sitemap URLs plus ten direct routes covering the paid retaining-wall page, both customer hosts, the retired Trade Partners routes and all retained portal entry points. A passive concurrent HTTP crawl and a separate HTML metadata crawl were completed without form submission.

| Check | Result |
|---|---:|
| Sitemap URLs | 202 |
| Additional direct/legacy/portal URLs | 10 |
| Total audited URLs | 212 |
| Confirmed HTTP 200 after bounded retries | 210 direct pages plus two successfully retried pages |
| Valid redirects followed to retained portal | 2 direct legacy entries |
| Persistent hard 404/5xx | 0 |
| Canonical mismatches on sitemap URLs | 0 |
| Duplicate titles on sitemap URLs | 0 |
| Overlong titles above 60 characters | 73 |
| Duplicate generic descriptions | 12 pages |
| Sitemap URLs carrying `noindex, follow` | 12 |
| Server-rendered H1 elements in raw HTML | 0 of 202 sitemap pages |

Five URLs timed out or disconnected during the high-concurrency passes, but every one returned HTTP 200 when retried individually. This is not an availability failure, but it confirms variable response delay under audit pressure. In the metadata pass, median completion was 3.115 seconds, the 95th percentile was 5.586 seconds, 138 successful responses exceeded three seconds and the slowest completed response took 14.441 seconds. These are network completion measurements, not Core Web Vitals, and require interpretation alongside browser measurements.

The twelve sitemap/noindex conflicts are `/calculator`, `/faq`, `/finishes`, `/gallery/before-after`, `/projects`, `/referral`, `/reviews`, and five service pages: concrete patios, crossover permits, excavation, pool surrounds and shed slabs. The two initial metadata failures were transient; both blog pages returned HTTP 200 on immediate sequential retry. No production route was changed.

## Responsive Rendering and Link Findings

A 390×844 browser audit covered the apex and `www` homepages, five-step quote route, retaining-wall paid page, guide, referral, visualiser, representative service/area/blog pages, both uncovered partner aliases and the retained portal. The customer homepages and quote route hydrated with one H1, no horizontal overflow and no broken images. The two uncovered aliases still render the customer-site `Page Not Found` experience despite returning HTTP 200 at the edge: `https://www.concreteconceptsgroup.com/trade-partners` and `https://concreteconceptsgroup.com/partners`.

The production homepage contains a visible `Trusted Partners` section that is intentionally hardcoded in both the managed source and GitHub-aligned source. It publishes **Grime Away Exterior Cleaning**, Josh Ward, phone `0421 875 405` and `josh@grimeawayexteriorcleaning.com`. The CCG contact number `0424 463 268` remains present throughout the hero, quote CTA, footer and sticky actions, but the additional partner number creates a real lead-diversion risk on the customer homepage. The live bundle and matching source confirm this is an existing website feature rather than Google call-number substitution or an unexplained production injection. No call or email link was activated.

The retained portal hydrated correctly at `https://partners.concreteconceptsgroup.com/partners` with the expected partner-program heading. One portal image lacks alt text. The paid retaining-wall page reported horizontal overflow at the 390-pixel viewport and requires geometry-level confirmation. Several lazy-loaded service/area/blog/visualiser routes had not rendered content within the initial 1.2-second automated wait, while a fresh browser extraction subsequently found the complete service-page text but still captured the visible loading spinner at the first screenshot. This is being treated as a performance/hydration timing finding, not yet as a broken page.

The live mobile hamburger menu opens correctly and exposes Services, About, Our Work, Before & After, Cost Calculator, Finishes, Areas, Reviews, Blog, AI Visualiser, Free Guide, Contact, Trade Partners and Get a Free Quote. The Trade Partners item points to `https://partners.concreteconceptsgroup.com/partners`; the quote item points to `/get-quote`. A rendered-link check covered 70 unique HTTP destinations from the key pages. The only initial internal timeout, `/areas/carindale`, returned HTTP 200 on direct retry; the Google review link correctly redirects unauthenticated visitors to Google sign-in.

The retaining-wall page's 390-pixel horizontal overflow is reproducible but small: the header phone button ends at pixel 398, eight pixels outside the viewport. The form itself remains fully visible and reachable. This is a mobile polish issue, not a funnel blocker.

The live customer homepage also contains multiple claims that conflict with the current content-integrity safeguards and require owner/legal verification before continued publication: `August Bookings Almost Full`, `Before Slots Fill`, `500+ Projects Completed`, `Client Satisfaction`, `On Time, Every Time`, `no surprise delays`, `100% satisfied`, `within 24 hours`, `completely free`, `Fully Insured`, `Public Liability`, `workers' compensation insurance on every job`, and a displayed `4.9/5 Google Reviews` rating while the external Google Reviews refresh is currently returning quota-exhausted warnings. No claim was changed during the audit.

## Five-Step Quote Funnel

The production `/get-quote` route renders Step 1 of 5 with required full name, Australian mobile and email fields, an optional company field, preferred contact controls and the CCG phone number `0424 463 268`. Clicking `Save & continue` with every field empty produced `Enter your full name.` and remained on Step 1. No customer data was entered and no submit action was activated in this direct browser check.

Source tracing confirms sequential validation for all five steps: Step 1 requires a valid AU mobile beginning with `04` and a valid email; Step 2 requires suburb, four-digit postcode and an allowed/reviewable Queensland service area; Step 3 requires service, work type, finish, timeframe and at least 20 characters of job detail; Step 4 validates selected measurements while permitting `Not sure`; Step 5 requires contact and privacy consent. Up to eight JPEG, PNG, WebP, HEIC or HEIF photos of at most 10 MB each can be uploaded, and the final payload includes contact, location, job scope, measurements, access/site conditions, photo URLs and consent state.

The primary Google Ads quote conversion is called only after the tRPC submission reports success or the edge fallback confirms delivery. A rejected validation or total delivery failure does not fire it. The edge fallback independently revalidates honeypot timing, phone, service area and duplicate/rate limits, then attempts Resend email, Manus backup and Jotform in parallel. It returns success when at least one channel confirms delivery; otherwise it returns HTTP 503 with the CCG phone number. Thirteen focused suites passed **116/116 tests**, covering quote structure, validation, attribution, draft persistence, funnel events, fallback, live-route guard, partner links, retaining-wall handoff and conversion isolation.

## Secondary Contact and Lead Paths

The visualiser route initially displays the shared loading spinner, then hydrates to the complete upload/draw/customise/generate workflow on the next browser read. It publishes the correct CCG phone `0424 463 268`, email `info@concreteconceptsgroup.com` and retained Trade Partners portal link. No photo was uploaded and no visualiser lead was created.

The fixed mobile contact bar uses `tel:0424463268`, an SMS composer addressed to `0424463268`, WhatsApp number `61424463268` and `/get-quote`. The code maps phone, SMS, WhatsApp, callback, guide and visualiser events to their own conversion labels rather than the quote label. The homepage's separate Grime Away partner phone/email remains the only additional direct contact destination found on the customer acquisition surface.

Guide requests require name and valid email, accept only optional Australian phone numbers, enforce honeypot/timing and duplicate-rate controls, and deliver the PDF through owner email, customer email and a Manus backup. Callback requests require name, a valid Australian phone and an allowed/reviewable SEQ location, label the message explicitly as a callback rather than a completed quote, and attempt owner email, Manus backup and Jotform. Neither path is a substitute for the detailed quote submission.

## Lead Delivery Reconciliation

The active Gmail account is `info@concreteconceptsgroup.com`. From 23–30 August it contains five genuine complete quote notifications from the protected five-step flow: one each for Capalaba, Flagstone, Caboolture South, Haigslea and Silkstone. Two arrived on 30 August. Four additional 29 August messages are explicitly labelled test/SEO-test records and were excluded. Older overseas/invalid quick forms and callbacks visible on 23–24 August predate the current protected flow and are not counted as genuine leads.

Jotform `261986395364069`, **Get Your Instant Concrete Quote – Concrete Concepts Group**, is enabled with 12 questions and 176 lifetime submissions. Its latest six records are the same five genuine complete quotes plus the labelled CCG system test. Names, AU mobile numbers, email addresses, locations, services and detailed job descriptions match the Gmail notifications. This confirms the primary form is currently reaching both owner Gmail and Jotform.

Resend independently reports every one of those five owner quote notifications as **delivered**. Across all account email traffic from 23–30 August, 122 emails were sent, 120 delivered, two transiently bounced, none permanently bounced, none delayed and none failed: a 98.36% account-wide delivery rate. The two bounces were the deliberately invalid `test.internal` SEO-test customer acknowledgements, not owner notifications or genuine customer messages. The five genuine quote records therefore have confirmed owner-Gmail, Resend and Jotform evidence.

The Manus database backup is **not working as claimed**. The managed `quote_requests` and `callback_requests` tables contain zero records since 23 August. Both known Manus project aliases return an HTTP 200 `Site Unavailable` HTML page for an empty invalid webhook probe instead of the expected JSON validation error. Because `backupToManusBackend` treats any HTTP 2xx response as `logged` without checking response content, the Cloudflare Worker can falsely report the backup channel as successful. This does not explain a current missing Gmail lead—the five real quotes reached Gmail and Jotform—but it removes the intended third safety net and could permit a false success if both real delivery channels fail simultaneously.

Resend also shows separate partner-portal workflows forwarding named CCG leads to Jonathan Beretta, Outer Edge Concreting and Darkstone Group, including recent Grace, Reece, Rory and Bradley records. These are not generated by the customer Pages source audited here, but they are active lead-routing operations under the same email account. Their authorization, payment and recipient scope require a separate governance decision; no routing was changed in this audit.

## Technical SEO and Content Integrity

The public sitemap contains 202 absolute apex-domain URLs, and robots.txt permits public crawling while excluding `/admin` and `/api/` and correctly declares the sitemap. All crawled sitemap pages have matching self-canonicals. Google recommends listing the canonical URLs that the business wants shown in Search, so a sitemap URL carrying `noindex` is internally contradictory.[1] [2]

Twelve sitemap URLs currently receive `noindex, follow`: `/calculator`, `/faq`, `/finishes`, `/gallery/before-after`, `/projects`, `/referral`, `/reviews`, and five service pages covering patios, crossovers, excavation, pool surrounds and shed slabs. This is a live production defect, not a crawler interpretation. A direct comparison confirmed patios receives `noindex, follow` while driveways receives `index, follow`. The root cause is `client/public/seo-manifest.js`: these 12 routes are absent from `CORE_METADATA` or `SERVICE_METADATA`, so they fall through to the generic noindex branch even though the application sitemap intentionally includes them. Google states that `noindex` causes a crawled URL to be dropped entirely from Search.[2]

The remaining metadata is broadly sound: all 210 successful direct responses have titles, 204 have descriptions and customer pages carry self-canonicals. However, 75 titles exceed the audit’s 60-character review threshold, primarily because blog titles append the long boilerplate `| CCG Brisbane Concreting Guide`. This threshold is not a Google penalty, but Google advises descriptive, concise titles and avoiding repeated boilerplate because long titles may be truncated or rewritten.[4] Thirteen pages use the same generic description; 12 are the noindex defect group and the thirteenth is the uncovered `www /trade-partners` soft alias. The duplicate apex/www homepage and quote metadata are expected host variants, but `www` should redirect or canonicalize consistently rather than remain a parallel 200 route.

The raw HTML contains no server-rendered H1 on any of the 210 successful pages because headings arrive through client-side React hydration. Real-browser checks confirmed H1s and content on the key homepage, quote, service, area, blog, paid and portal routes, so this is a resilience/performance limitation rather than a blank-site fault. Six partner/redirect responses lack JSON-LD; the customer pages carry `LocalBusiness` and `Organization` markup. The homepage has no `aggregateRating` or self-authored `review` schema, and its structured-data phone is the correct `+61 424 463 268`.

The sitemap has no `<lastmod>` values or image entries. Google treats accurate last-modified dates as optional but useful and ignores unsupported `priority` and `changefreq` hints.[1] The server source builds fresh lastmod/image entries, but the deployed Pages sitemap does not expose them, showing that production is serving the static/edge-filtered sitemap rather than the server-generated version. This is an optimization gap, not an indexing outage.

The published company identity is partly verified and partly needs corrective wording. ABN 61 695 485 593 is active and belongs to **CONCRETE CONCEPTS GROUP PTY LTD**.[6] QBCC licence 15299707 appears in the official Queensland register dataset as an active individual trade-contractor licence for **Jarrod Ray Alford**, class **Concreting**, under a different individual ABN; it is not registered to Concrete Concepts Group Pty Ltd.[5] The site repeatedly describes the company itself as `QBCC Licensed #15299707`. That wording should be reviewed and changed to accurately identify the individual licence holder, or supported by formal nominee/company-licence documentation before it remains a company-level trust claim.

The claim scan found 315 matches across 38 current source files, including 19 absolute/on-time statements, 20 24-hour response statements, 32 insurance/WorkCover statements, 82 engineering/Australian-standards statements, nine guarantee/warranty statements and five `4.9` rating statements. Some may be legitimate, but the repository contains no evidence register linking those claims to policies, licences, engineering records, warranties or independently controlled review sources. The homepage also publishes a second clickable phone and email for **GrimeAway Exterior Cleaning** in `Trusted Partners`; the primary CCG number is correct, but the third-party contact can confuse customers or divert a visitor away from the quote funnel. Both the regulated claims and third-party contact should be treated as content-governance issues, not silently assumed true.

### SEO Priority Order

| Priority | Finding | Recommended action |
|---:|---|---|
| 1 | Twelve commercial/public sitemap pages are noindex | Add each intended public route to the SEO manifest and test sitemap/indexability parity before deployment |
| 2 | Company-level QBCC wording does not match the official licence holder | Replace with precise verified wording after director/legal confirmation |
| 3 | Unsupported absolute, insurance, engineering, guarantee and rating claims | Create an evidence register; remove or qualify any claim without current proof |
| 4 | GrimeAway phone/email on the customer homepage | Remove the direct contact or move it behind the retained partner experience unless the director explicitly wants customer traffic diverted |
| 5 | Seventy-five verbose titles and 13 generic descriptions | Shorten blog boilerplate and give each indexable route a distinct description |
| 6 | Sitemap lacks accurate lastmod/image entries | Generate production sitemap content from the authoritative route/content data rather than stripping stale values |

## References

[1]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google Search Central: Build and submit a sitemap"
[2]: https://developers.google.com/search/docs/crawling-indexing/block-indexing "Google Search Central: Block Search indexing with noindex"
[3]: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls "Google Search Central: Specify canonical URLs"
[4]: https://developers.google.com/search/docs/appearance/title-link "Google Search Central: Influencing title links"
[5]: https://www.data.qld.gov.au/dataset/qbcc-licensed-contractors-register/resource/25608781-b28c-44f8-8545-0ab18d84082f "Queensland Government: QBCC licensed contractors register"
[6]: https://abr.business.gov.au/ABN/View?id=61695485593 "Australian Government ABN Lookup: ABN 61 695 485 593"

## Google Ads Configuration and Traffic Integrity

The accessible Ads customer is 655-309-3174, `Concrete Concepts Group Pty Ltd`, AUD, Australia/Brisbane. The live readback found three enabled campaigns plus one paused Smart campaign:

| Campaign | Status | Daily budget | Bidding | Current qualification |
|---|---|---:|---|---|
| Performance Max-1 | Enabled, limited by asset policy | A$160.00 | Maximise conversion value, no target ROAS | Presence-only; Brisbane, Ipswich and Logan; quote-only custom goal |
| CCG Search – High Intent Concreting | Enabled, learning/budget constrained, some policy limitation | A$60.00 | Maximise conversion value at 300% target ROAS | Presence-only; six enabled Queensland targets; quote-only custom goal |
| Tradenet | Enabled | A$0.20 | Maximise conversions | Customer-default goals, including three biddable lead/quote categories |
| Concreting Smart campaign | Paused | A$10.30 | Target spend | No current delivery |

The configured enabled budgets total A$220.20/day but are settings, **not a hard account spend cap**. PMax and Search both use enabled custom goal `CCG Quote Form Only` with sole member action `Quote Form Submission` (7546454804). That action is enabled, primary and included in `Conversions`; SMS, WhatsApp, callback, visualiser and guide actions are enabled but secondary and excluded from bidding. Several legacy Google-hosted call, website-visit, direction and engagement actions still report `primaryForGoal=true` at the account object level, but they are excluded from the `Conversions` metric and are not members of either main campaign’s custom goal. Tradenet remains on customer-default goals, a separate governance risk even though its A$0.20 budget produced no impressions, clicks or spend in the completed-day lookback.

All active CCG Search ads use only `https://concreteconceptsgroup.com/get-quote` or the verified `https://concreteconceptsgroup.com/lp/retaining-wall-brisbane`. The enabled retaining-wall RSA is approved; two alternatives are paused. The general group’s two enabled RSAs are approved. PMax has three enabled asset groups, each with `https://concreteconceptsgroup.com` as its final URL. No active Search ad points to partner, referral, `.org`, `trade.` or `partners.` pages.

PMax retains eight enabled negative webpage exclusions: `/privacy`, `/terms`, `concreteconcepts.org`, `/admin`, `/survey/`, `/referral`, `/my-quote` and `/lp/`. Its legacy automatically created URL assets remain undeleted under the director-selected reversible option, but the active criteria isolate the legacy domain and non-commercial scopes. Search retains 13 exact keyword rows (12 enabled plus the paused duplicate retaining-wall keyword), 38 enabled negative keywords and six positive Australian location criteria. Its dedicated retaining-wall keyword is enabled in the matching ad group and the old mixed-group duplicate remains paused.

Current campaign settings show **Search Content Network off**. Reporting for 30 August still contains 1,414 Content impressions, four clicks and A$8.49 cost, all between midnight and 12:00 Brisbane time; no Content activity appears after 12:00. Google Search traffic on the same date was two clicks and A$63.25. This pattern is consistent with traffic accrued before the approved Content shutdown rather than evidence that the current off setting failed, but the next-day report should be checked for zero new Content activity.

The completed-day lookback records PMax at 88,661 impressions, 1,588 clicks, A$2,753.61 cost, 120.999 `Conversions` and 127.999 `All conversions`; Search recorded 77 impressions, seven clicks, A$161.71 cost and zero conversions. Those PMax totals span earlier configuration periods and must not be interpreted as 121 genuine current quotes. The conversion-action breakdown from 23–29 August shows only two attributed `Quote Form Submission` conversions (27 and 28 August); most other recorded actions were click-to-call events from the earlier goal setup. This distinction is essential when reconciling Ads with Gmail/Jotform.

On 30 August itself, PMax reports exactly two `Quote Form Submission` conversions with combined value A$300 and three click-to-call interactions only in `All conversions`; Search reports no conversion. Gmail and Jotform independently contain exactly two genuine five-step quote submissions dated 30 August. The daily count therefore reconciles at the system level, although Ads attribution does not reveal customer identity and should not be used to assert that any named enquiry came from an ad.

The 30-day user-location view contains six overseas PMax clicks costing A$15.59 in total: New Zealand three clicks/A$9.18 with two reported conversions, India one/A$3.95, Pakistan one/A$1.72 and Brazil one/A$0.74. Search traffic was entirely attributed to Australia. PMax remains Presence-only; Google states that Presence uses users likely located or regularly located in target areas, but location matching is based on multiple signals and is not guaranteed 100% accurate.[7] Google also warns that matched-location reporting can represent physical location or location of interest and may differ from other data sources.[8] The overseas PMax amount is small—about 0.57% of the completed-day PMax cost—but the two New Zealand reported conversions require reconciliation because no genuine overseas delivered quote was found in the reviewed inbox/form evidence.

Two approved call assets exist and both resolve to the correct CCG number, `0424 463 268`; PMax directly attaches one. No account-level call asset is active, and Search has no direct campaign-level call asset in the current readback. Therefore the website phone is correct and PMax’s attached phone is correct, but Search’s limited-policy reason should be reviewed in the UI before assuming it can display a call asset.

[7]: https://support.google.com/google-ads/answer/1722038?hl=en "Google Ads Help: Advanced location options"
[8]: https://support.google.com/google-ads/answer/2453994?hl=en "Google Ads Help: Measuring geographic performance"
[9]: https://support.google.com/google-ads/answer/7492954?hl=en "Google Ads Help: Matched locations and distance reports"

## Paid Activity, Genuine Leads and Limiting Factors

The production acquisition system is currently receiving real work enquiries. Five genuine complete quotes reached Gmail, Jotform and Resend between 23 and 30 August, including two on 30 August. Google Ads reports two PMax `Quote Form Submission` conversions on 30 August, matching the day’s genuine-delivery count at aggregate level. Ads attribution does not expose customer identity, so the audit does not claim that either named enquiry was definitely paid.

The published website number, SMS destination, WhatsApp destination, structured-data phone and both approved Ads call assets all resolve to **0424 463 268**. PMax directly attaches the approved number. However, Google Ads `call_view` contains no August call records even though click-to-call interactions appear in `All conversions`. A click or tap therefore cannot be presented as a verified connected phone lead. Verifying actual calls reaching the handset requires the director’s phone/carrier call history or a correctly configured Google forwarding-number call report; neither was available in this read-only audit.

| Priority | Finding | Business impact | Evidence-supported next action |
|---:|---|---|---|
| 1 | Manus backup channel falsely reports success while storing zero leads | A simultaneous Gmail/Resend and Jotform failure could be hidden by a false HTTP 200, causing silent lead loss | Make backup success require expected JSON and a created record; point it to a verified backend route; test with a clearly labelled synthetic record only after approval |
| 2 | Twelve intended public/commercial sitemap pages are live `noindex` | These pages cannot earn organic visibility despite being advertised in the sitemap | Add the 12 routes to the authoritative SEO manifest and deploy only after sitemap/indexability regression tests |
| 3 | Homepage contains unsupported or absolute claims and company-level QBCC wording inconsistent with the official register | Legal/trust risk and possible conversion harm if a customer challenges the claims | Build an evidence register; qualify/remove unsupported claims; confirm precise licence-holder wording with appropriate professional advice |
| 4 | Grime Away’s direct phone/email is embedded on the main customer homepage | Visitors can leave the CCG acquisition path or contact a third party instead of CCG | Remove direct third-party contact from the customer homepage or move it behind the retained Partner Portal, subject to director approval |
| 5 | Search Content traffic accrued before the approved shutdown | Four low-cost clicks on non-Search inventory did not convert | Verify the next full day contains zero Search `CONTENT` traffic; if new traffic appears after the off timestamp, investigate auto-apply/network state before any mutation |
| 6 | Small PMax overseas location rows remain | Six clicks/A$15.59 over the completed-day lookback, including two reported New Zealand conversions that do not correspond to an overseas delivered quote | Monitor country rows and genuine lead locations together; do not add broad exclusions based on 0.57% of spend unless the pattern continues |
| 7 | Search has low completed-day volume, no conversion and below-average landing-page experience on important terms | Limited learning and expensive clicks constrain qualified Search growth | Let the new retaining-wall structure collect data; improve relevance/landing experience and review at the documented click/day gates rather than changing budget or bidding immediately |
| 8 | Google Reviews refresh returns usage-exhausted warnings while a 4.9 rating is displayed | The live rating can become stale and lacks independently refreshed support | Restore review-source access or suppress/qualify the rating until freshness can be verified |
| 9 | Two partner aliases are soft 404s, 75 titles are verbose, 13 descriptions are generic and the production sitemap lacks lastmod/images | Crawling and user-navigation inefficiency, but no current outage | Apply the previously validated legacy alias expansion, then fix metadata/sitemap generation in a separate tested SEO release |
| 10 | Retaining-wall header overflows by eight pixels at 390 px and some routes hydrate slowly | Mobile polish and perceived-speed issues; the form remains usable | Correct the phone-button geometry and profile JavaScript/hydration after the lead-safety and indexability issues |

The primary limiting factor is **not that Gmail or Jotform are currently broken**. Both received genuine detailed quotes and Resend confirms owner delivery. The immediate reliability gap is the false backup success; the largest organic growth gap is the 12-page noindex conflict; and the largest trust/conversion risks are unsupported claims, licence wording and the third-party homepage contact. Google Ads’ current main-campaign goals and destinations are protected, but the reporting history still mixes earlier call events with current quote-only bidding, so only conversion-action-level data should be used during this transition.

## Final Verification

The closing verification passed 50 deterministic test files with one known skipped file: **557 tests passed and one was skipped**. TypeScript completed with no errors. The guarded production build passed both source and compiled quote-release contracts. Cloudflare Worker syntax and repository diff hygiene passed. No form was submitted, no contact link was activated and no customer data was entered during the live audit.

The final live health sample returned HTTP 200 for apex and `www` homepages, both five-step quote hosts, the retaining-wall paid page, guide, visualiser, sitemap, robots file and retained portal. Both retired Trade Partners addresses still resolved to `https://partners.concreteconceptsgroup.com/partners`. The only repeated runtime warning was the previously known Google Reviews/Maps usage-exhausted response, which affects review freshness rather than the quote funnel.

> **Overall conclusion:** the site and primary email/Jotform lead path are working today, but the backup false-positive should be repaired first, followed by the 12-page noindex defect and the content/licence/third-party-contact cleanup. Google Ads should be monitored rather than broadly changed: the current quote-only goals, budgets, Presence settings, Search Content exclusion and PMax URL exclusions are intact.
