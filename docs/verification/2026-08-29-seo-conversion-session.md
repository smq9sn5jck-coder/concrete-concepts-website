# CCG SEO, Conversion and Lead-Capture Session — 29 August 2026

## Live lead-path inventory

| Visitor path | Live behavior | Delivery | Current Ads attribution | Finding |
|---|---|---|---|---|
| Hero and paid landing-page quick forms | Prefill and hand off to `/get-quote` | No lead until five-step submit | No conversion on handoff | Correct |
| Five-step `/get-quote` wizard | Full contact, location, service, work details, measurements, site conditions, photos and review | Cloudflare Worker owner email + Jotform + Manus/Sheets backup | Genuine `Quote Form Submission` after confirmed API success | Correct primary lead path |
| Homepage contact form | Name, mobile, email, suburb, service, optional details/photos | Same Worker quote pipeline | Quote submission after success | Valid but less detailed than wizard |
| Homepage MiniQuoteForm | Name, phone and suburb; inserts placeholder email and generic service/details | Same Worker quote pipeline | Fires primary quote conversion after success | **Low-information lead can be counted as a full quote** |
| Blog quote forms | Name, phone and suburb; inserts placeholder email | Same Worker quote pipeline | Fires primary quote conversion after success | **Low-information lead can be counted as a full quote** |
| Suburb/projects callback popup | Name and phone only; inserts `callback@request.com` | Same Worker quote pipeline and Jotform | Fires the primary quote label after success | **Callback is misclassified as a submitted quote** |
| Standalone CallbackWidget | Dedicated callback procedure | Owner email/push/SMS/DB on Manus backend | Separate callback conversion function | Not mounted on any current live route |
| Visualiser lead gate | Name, phone and generated-project context | Worker quote pipeline | Fires primary quote conversion after success | Useful high-intent path, but email completeness requires further review |
| Referral form | Referrer/customer/job fields through quote procedure | Worker quote pipeline | Referral event label after success | Delivery path works; current label is not a real Ads action |
| Homeowner guide form | Name/email, optional phone | `/api/trpc/guide.submit` | Fires guide conversion **before** delivery | **Broken on Cloudflare:** Worker has no guide route; the page still unlocks download after failure |

All live quote routes handled by the Cloudflare Worker run Australian-phone, Brisbane/SEQ, honeypot, minimum-time, duplicate and address-rate checks. The Worker sends owner email, Manus/Google Sheets backup and Jotform in parallel and returns success when at least one destination confirms receipt. Jotform therefore remains a safety net, but client success does not prove the email channel succeeded on that individual request. Recent genuine submissions matched Gmail and Jotform; channel-level degradation is not currently exposed to the visitor or owner.

## Call and messaging inventory

The correct website phone-click label maps to Google Ads action `Click to call` (`7546769268`), which is enabled and secondary. Phone clicks are therefore measured without bidding on every tap. Mobile sticky bars expose Call, WhatsApp and Quote; desktop exposes a floating WhatsApp button and quote CTAs. The website has **no SMS/text CTA**.

The production WhatsApp label resolves to `AW-18007005419/whatsapp`, but no Google Ads conversion action has that label. Guide and referral labels similarly resolve to placeholder values (`labelguide ` and `referel`) with no matching account action. Those interactions cannot populate reliable Google Ads conversion rows. CallbackPopup avoids the missing callback label by incorrectly firing the genuine quote label instead.

The genuine Quote Form Submission action `7546454804` is enabled, primary and the only action inside `CCG Quote Form Only`. It always uses its Google Ads default value of $150, so the older `$5,000` client event value is ignored and does not distort current target-ROAS bidding. All local/directions/page-view/engagement actions remain outside the primary conversions metric.

## Initial conversion-integrity priorities

First, preserve the five-step quote submission as the only primary action. Second, stop callback-only and low-information mini/blog forms from claiming the full quote conversion; either hand them to the five-step wizard or classify a successfully delivered callback as secondary. Third, add a real mobile SMS CTA and real secondary Google Ads actions for qualified callback, WhatsApp and SMS intent only after each destination/event is tested. Fourth, fix the guide route and move guide tracking to confirmed delivery before creating a real secondary guide action. Page views, button taps, directions and guide downloads must not become primary campaign goals.

No website or Google Ads setting was changed during this inventory.

## Google Ads conversion-action audit

The conversion screen is not empty or broken. It shows account-default goal categories across four campaigns, but PMax and rebuilt Search deliberately use the campaign-specific custom goal `CCG Quote Form Only`. That custom goal is attached to two of four campaigns and contains only the genuine `Quote Form Submission` action `7546454804`. This is why generic Contact, Directions, Engagement and Page view cards show `0 of 4 campaigns`: they are intentionally not bidding goals.

| Action or signal | Current state | Safe role |
|---|---|---|
| Quote Form Submission `7546454804` | Enabled, primary, included in conversions, $150 fixed value | **Keep primary** |
| Website Click to call `7546769268` | Enabled, secondary, click-based | Keep secondary; a tap is not a confirmed call |
| Calls from ads `7569661581` | Enabled, 60-second threshold, not included in conversions | Candidate primary **qualified call** after campaign goal and call reporting are verified |
| PMax call asset | Enabled with `0424 463 268` | Working phone surface; only 60-second calls should influence bidding |
| Rebuilt Search call asset | None attached | Conversion opportunity: attach verified phone asset if approved |
| WhatsApp website event | Production label has no matching Ads action | Create a real secondary action before relying on it |
| SMS/text | No site CTA and no Ads action | Add a mobile SMS CTA and secondary action; do not make a tap primary |
| Callback request | Live popup fires the quote label | Must be reclassified to a real delivered-callback action |
| Guide download | Label invalid; tracking fires before failed Cloudflare delivery | Fix delivery/timing first; secondary only |
| Referral | Label invalid | Secondary or internal analytics only; not a CCG customer-quote goal |
| Page views, directions, engagement | Excluded from conversion metric | Keep excluded |

The account contains 14 enabled conversion actions, many inherited from Smart Campaign, Business Profile or older site setups. Their `primary_for_goal` label does not mean PMax/Search are bidding to them when a campaign-level custom goal overrides account defaults. Current campaign read-back confirms PMax and rebuilt Search retain the quote-only goal.

Historic 90-day action totals are heavily inflated because the old Search/PMax configuration once counted website phone taps as conversions. For example, the old Search campaign records 637 click-to-call actions and 141 quote actions, and PMax records 520 click-to-call actions and 197 quote actions. These historical counts should not be used as lead totals; current Gmail/Jotform reconciliation and the cleaned campaign goal are the reliable post-change baseline.

### Recommended goal architecture

The recommended balanced option is to keep submitted quotes primary and add only a **verified 60-second Calls from ads** action as a second primary lead type after call reporting is proven. This captures genuine phone enquiries without rewarding every click. Website phone, WhatsApp, SMS, callback and guide interactions should remain secondary observation events. Making all taps primary would increase Google’s reported conversions but would train bidding toward low-certainty actions and recreate the inflated history.

No Google Ads conversion action or campaign goal was changed during this audit.

## Live SEO baseline

The live XML sitemap at `https://concreteconceptsgroup.com/sitemap.xml` currently exposes 278 URLs: 15 core pages, nine service pages, 76 `/lp/` paid landing pages, 109 suburb/area pages and 69 blog posts.[1] All listed URLs use the main `.com` hostname. The checked-in last-modified date shown across the sitemap is 19 July 2026, so it does not communicate later mobile-speed, quote-funnel or content changes.

The live `robots.txt` permits normal search crawling, blocks `/admin` and `/api/`, and points to the correct `.com` sitemap.[2] Cloudflare’s managed content signals allow search indexing while disallowing listed AI-training crawlers; these directives do not block ordinary Google Search crawling.

The crawler-readable homepage contains substantial Brisbane service, area, process, project, FAQ and internal-link content, along with the primary quote and phone CTAs.[3] The `/get-quote` page has a focused title, one H1, licensing/rating/response trust proof, five clearly named steps and an explicit statement that no conversion is counted until delivery is confirmed.[4]

The first material inconsistency is that 76 paid `/lp/` URLs appear in the public sitemap even though server prerender logic intentionally skips `/lp/:slug` metadata. Those URLs require a full live canonical/indexability crawl before they can be treated as SEO pages; paid-only pages should not be mass-submitted to search if they are thin, duplicated or canonicalized elsewhere.

A real-browser check of `/areas/carindale` demonstrates the split rendering state. Before JavaScript, the response uses the generic homepage title and canonical. After hydration, it correctly renders `Concreting Carindale | Driveways & Slabs from $65/m² | Concrete Concepts`, a Carindale-specific H1, long local/service content, related service links, nearby-suburb links and supporting articles. Public search results also surface this Carindale page with a specific title and snippet, proving that at least some JavaScript-rendered routes are indexed. The risk is therefore **SEO reliability and crawl efficiency**, not a claim that all 278 pages are absent from Google.

### Complete raw-HTML crawl

A bounded crawl of all 278 sitemap URLs returned HTTP 200 with no network errors. Before JavaScript, however, every URL returned the same generic 69-character homepage title, 187-character description, homepage canonical, empty loading body and no H1. As a result, 277 sitemap URLs carry an incorrect raw canonical, and all 278 appear duplicated/thin to a non-rendering crawler. The median response time was 217 ms, so origin response speed is not the cause.

Rendered client pages do replace this metadata and content correctly, and public search results currently show the CCG homepage, reviews, visualiser, Carindale area page, before/after gallery and retaining-wall service page. Google documents that it can read dynamically injected JSON-LD, but route-specific title, canonical and useful HTML should still be made reliable at the Cloudflare response layer rather than depending entirely on a second rendering pass.[5]

Google’s sitemap guidance says to include URLs intended for search, use canonical URLs, and keep `<lastmod>` consistently accurate; Google ignores `<priority>` and `<changefreq>`.[6] The current sitemap violates that intent by listing 100 client-side `noindex` paid landing pages and stamping every URL with the same outdated 19 July date. The safe repair is to remove `/lp/` URLs from the SEO sitemap, generate accurate meaningful modification dates, and leave paid pages accessible to Ads but explicitly `noindex`.

The static LocalBusiness JSON-LD also includes `aggregateRating` and four embedded reviews about CCG itself. Google’s current LocalBusiness and review guidance states that review/rating properties are for sites capturing reviews about **other** local businesses and that self-controlled LocalBusiness reviews are ineligible for the star review feature. It also says not to aggregate ratings from other websites.[7][8] The safe SEO fix is to remove `aggregateRating` and `review` from CCG’s LocalBusiness schema while retaining only visible, source-verifiable reviews as ordinary page content. No new or fabricated review will be added.

A rendered check of sitemap URL `/lp/concrete-driveway-ascot` confirms the core sitemap conflict: its client metadata correctly sets `robots=noindex, nofollow` and a self-canonical, yet the URL is submitted in the public XML sitemap. Its form correctly hands the visitor to the detailed quote route rather than directly creating a lead. However, the page displays three highly specific customer-style endorsements and strong compliance/guarantee language. Those endorsements must be matched to verifiable source records or removed; no unverified testimonial can be retained or added as part of this work. The regulatory wording should also be qualified and reviewed for Queensland/QBCC accuracy rather than used as an absolute guarantee.

The primary `/services/concrete-driveways-brisbane` page is strong after hydration: it resolves to a specific 66-character title, a 204-character service description, self-canonical, index/follow directive, one service H1, Service/FAQ/Breadcrumb/LocalBusiness schema, 68 internal links, three quote links and five phone links. Its initial browser frame still shows only the generic title and loading screen before JavaScript completes, confirming that content quality is not the core problem; pre-render delivery is. The page has no SMS link and no embedded form, so visitors must call or move to `/get-quote`.

### Sitemap composition and priority

| Route family | Submitted URLs | Finding |
|---|---:|---|
| Core and utility pages | 15 | Valid overall; privacy/terms are low priority |
| Services | 9 | High-value and content-rich after hydration |
| Areas and area index | 109 | Broad local coverage; requires quality/index monitoring |
| Blog and posts | 69 | Strong topical coverage; route-specific raw metadata missing on Cloudflare |
| Paid `/lp/` pages | 76 | **Must be removed from sitemap because they are noindex** |

The public sitemap therefore should fall from **278 to 202 URLs** by removing the 76 paid noindex pages. The remaining 202 routes should retain service, suburb, blog, quote and core content. Accurate modification dates should be generated from real source/content dates; Google ignores `<priority>` and `<changefreq>`, and false uniform dates provide no useful crawl signal.[4]

### Technical SEO priority table

| Priority | Defect | Lead/SEO effect | Recommended correction |
|---:|---|---|---|
| 1 | All Cloudflare route HTML initially carries homepage title, description, canonical and empty body | Search engines must render JavaScript to discover every service/suburb/blog route; canonical discovery is delayed and fragile | Add route-specific metadata/noindex rewriting in the Cloudflare Worker and retain client metadata as hydration consistency |
| 2 | 76 noindex `/lp/` URLs are submitted in sitemap | Sends contradictory crawl/index signals and wastes crawl attention | Remove all `/lp/` entries from sitemap; keep them noindex and available only to Ads/internal links |
| 3 | Static LocalBusiness schema contains self-controlled aggregate rating and embedded reviews | Ineligible review-star markup and unnecessary structured-data risk | Remove `aggregateRating` and `review` from CCG LocalBusiness JSON-LD; keep verifiable reviews as visible page content only [7][8] |
| 4 | 278 URLs share one stale 19 July modification date | Reduces sitemap trust/usefulness | Generate real source/content modification dates and omit dates that cannot be proven [4] |
| 5 | Cloudflare Worker does not execute the existing Express SEO prerender | The correct server metadata map is bypassed in production | Reuse or generate a static route SEO manifest for the Worker rather than maintaining unrelated hand-written systems |
| 6 | Paid landing pages contain unverified customer-style endorsements and absolute compliance/value claims | Consumer-protection, Ads and trust risk | Remove unless source-verified; qualify legal/regulatory/value claims with Queensland/QBCC review |
| 7 | Service pages expose call and quote CTAs but no SMS CTA | Missed mobile lead preference | Add a tracked secondary SMS option without making every tap a primary conversion |

The site already has valuable assets to protect: nine detailed service pages, 109 suburb pages plus the index, 69 blog posts plus the index, strong internal navigation, FAQ/Service/Breadcrumb schema after hydration, phone/quote calls to action and public search evidence that at least the Carindale area page is indexed. The appropriate strategy is to improve delivery and trust of these pages, not create hundreds of additional thin URLs.

### External traffic benchmark

Similarweb estimates **4,571 worldwide visits for CCG in July 2026**, with 100% of its measured country traffic attributed to Australia. It estimates 106 visits for Jacks Concreting; QLD Concreters and Concreters Brisbane were below the provider’s available-data threshold. These are directional third-party estimates, not analytics or Search Console truth. Jacks’ low-volume country mix is geographically noisy, reinforcing that the competitor numbers should not drive budget decisions. The visual comparison is supplied with the audit as `similarweb-july-visits.png`.

The benchmark supports one useful conclusion: CCG already has meaningful visibility relative to several small local competitors, so fixing crawl signals, lead measurement and high-intent page conversion is likely higher value than publishing more unverified programmatic pages.

No sitemap, metadata, schema or indexability setting was changed during the audit phase.

## Recommended implementation decision

Three routes were compared. The recommended **Qualified-lead foundation** repairs attribution, adds a real mobile text option, fixes guide delivery and implements the highest-impact technical SEO corrections without changing budgets. An aggressive alternative that makes all call/text/message taps primary was rejected because it would recreate inflated conversion reporting. An SEO-only alternative was also rejected because it leaves known callback and guide failures in place.

The complete approval-ready design is recorded in `docs/superpowers/specs/2026-08-29-seo-conversion-lead-design.md`. Its first release keeps the detailed quote primary, reclassifies quick callback/visualiser paths as secondary, adds Call/Text/WhatsApp/Quote on mobile, fixes guide delivery, removes 76 noindex paid pages from the sitemap, removes self-review schema and adds route-specific Cloudflare metadata. Its second release makes qualified calls a candidate primary signal only after at least three verified 60-second calls match real business records.

[5]: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data "Google Search Central — Introduction to structured data"
[6]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google Search Central — Build and submit a sitemap"
[7]: https://developers.google.com/search/docs/appearance/structured-data/local-business "Google Search Central — LocalBusiness structured data"
[8]: https://developers.google.com/search/docs/appearance/structured-data/review-snippet "Google Search Central — Review snippet structured data"

The sitemap also contains closely overlapping blog topics, including duplicate patio-cost, concrete-vs-pavers, cure-time and property-preparation themes. These are potential keyword-cannibalization pairs and need content/canonical comparison rather than another round of indiscriminate page creation.

The homepage renders many review quotations as local application data rather than a live third-party review feed. Their source authenticity cannot be verified from the site response alone. No new review, rating or testimonial will be generated or added; existing review claims should be retained only where CCG can verify them against the named public source.

### SEO source references

[1]: https://concreteconceptsgroup.com/sitemap.xml "CCG live XML sitemap"
[2]: https://concreteconceptsgroup.com/robots.txt "CCG live robots.txt"
[3]: https://concreteconceptsgroup.com/ "CCG live homepage"
[4]: https://concreteconceptsgroup.com/get-quote "CCG five-step quote route"

## Release 1 implementation evidence

Five real Google Ads website observation actions were created through validation-only requests followed by live mutations. Every action was immediately changed to `primaryForGoal: false` and independently read back as enabled, secondary and excluded from the conversions metric. PMax and rebuilt Search therefore continue bidding only to the protected `CCG Quote Form Only` goal.

| Secondary action | Resource ID | Verified website label |
|---|---:|---|
| CCG Callback Request | `7738442356` | `NL8kCPSE_ekcEOuxtIpD` |
| CCG WhatsApp Click | `7738442359` | `weRUCPeE_ekcEOuxtIpD` |
| CCG SMS Click | `7738299269` | `26ZACIWn9OkcEOuxtIpD` |
| CCG Visualiser Lead | `7738299272` | `MyywCIin9OkcEOuxtIpD` |
| CCG Guide Download | `7738445479` | `nv9wCKed_ekcEOuxtIpD` |

The production tracking configuration now uses those verified labels instead of placeholder suffixes. The genuine quote and existing phone-click actions were not modified.

The callback reclassification exposed a Cloudflare defect: the callback route still called the strict full-quote handler, so email-free callback payloads could fail validation. A focused failing regression reproduced it. The Worker now has a dedicated callback validator and separately labelled email/Manus/Jotform delivery handler, preserving Australian phone, SEQ, honeypot, minimum-time, duplicate and address-rate controls without presenting the lead as a completed quote.

The first edge-SEO implementation placed sitemap and HTML transforms below the Worker’s early GET/cache return. A runtime Worker regression proved that route metadata did not reach actual GET responses. The transform now runs inside the real cache path and is tested against a Carindale title/canonical, paid-page `X-Robots-Tag`, and a 202-URL public sitemap with every `/lp/` entry removed.

The initial sitemap filter also overmatched across `<url>` blocks and removed 24 valid routes in addition to the 76 paid pages. A set-difference regression reproduced the error. The corrected filter removes exactly the 76 `/lp/` blocks and preserves all 202 public service, suburb, blog and core routes. The stale uniform 19 July modification dates are omitted until real source dates can be generated.

Paid landing pages now use a compact noindex renderer that preserves UTM/GCLID attribution, service/suburb context, Australian mobile and SEQ validation, and five-step quote handoff while removing fabricated customer testimonial records and unsupported price, guarantee, urgency, project-count and property-value claims. Referral submission remains available as non-biddable analytics and no longer sends an invalid Google Ads conversion label.

Two deterministic no-network Worker tests execute the callback and guide POST routes. The callback test proves email-free leads return success only after mocked owner email, Manus/Sheets backup and Jotform confirmation. The guide test proves owner email, customer guide email and backup confirmation before success. These tests create no live lead.

The final deterministic suite passed **48 files plus one skipped file, 545 tests plus one skipped test** after excluding only the three known external credential/email checks. The Release 1 contract itself passed 21 tests. TypeScript passed, the guarded Cloudflare build passed, the quote source/build contracts passed and Worker syntax passed. The built bundle contains all five verified secondary labels and no placeholder label suffix. Primary quote tracking remains only in the comprehensive wizard and complete homepage contact form.

Responsive visual checks passed on the homepage, five-step quote route, homeowner guide and representative Ascot driveway paid landing page. The guide retained its form and content; the paid page showed the compliant prefill-to-wizard flow plus Call/Text surfaces; and mobile homepage/quote content remained readable with no broken media. Full-page screenshots intentionally omit fixed mobile chrome, while source and regression coverage confirm the scroll-triggered Call, Text, WhatsApp and Quote bar.

The local Google Reviews request reported provider usage exhaustion and returned the existing stale cache. Review/rating content remained visible and this did not affect quote, callback, guide or SEO builds. It is an existing external-data freshness warning, not a Release 1 submission failure.

**Pre-publication status:** the Release 1 candidate passes code, Worker, bundle, SEO, lead-classification and visual safeguards. Production remains unchanged pending a fresh publication confirmation and guarded Cloudflare release.

The final Google Ads read-back confirmed `Quote Form Submission` (`7546454804`) remains enabled, primary and included in the conversions metric. Callback, WhatsApp, SMS, Visualiser and Guide actions remain enabled but explicitly secondary (`primaryForGoal: false`, `includeInConversionsMetric: false`). The website build therefore gains useful observation data without training PMax or Search toward button taps or partial leads.

The pre-publication release decision is **pass**. Post-deployment acceptance must still re-run apex/www quote guards, direct Cloudflare Pages checks, route-specific raw metadata, the 202-URL edge sitemap, paid-page noindex headers, mobile Call/Text/WhatsApp/Quote visibility and passive Gmail/Jotform reconciliation. No live form should be submitted unless it is clearly labelled and explicitly approved.

## Cloudflare production release

After fresh director confirmation, guarded build `827256d3` was uploaded to the existing Cloudflare Pages project `concrete-concepts-group` as deployment `0e49f104-d36c-4f88-9532-3cf10b7b42aa`. Cloudflare assigned both `concreteconceptsgroup.com` and `www.concreteconceptsgroup.com` to the new successful canonical deployment. The previously healthy partner-referral release `ee22dfe3-a989-47dd-b319-d92c186e6594` is the immediate rollback, with `65d0dde5` retained as the earlier mobile-speed fallback.

All eight raw homepage and quote-route combinations passed on their first attempt across apex, www, stable `pages.dev` and immutable `0e49f104.pages.dev`. The edge sitemap contains exactly **202 `<url>` entries and zero `/lp/` URLs**. The representative Ascot paid page returns `X-Robots-Tag: noindex, follow`; the driveway service response contains its route-specific title and self-canonical; and the Carindale response contains its route-specific title.

The apex `/get-quote` route initially displayed the application loading frame and then completed hydration normally. A wait-aware browser check showed the correct quote title, all five progress controls, `Step 1 of 5`, required full-name/mobile/email fields, preferred-contact controls and save/continue. No field was entered and no form was submitted.

The same wait-aware check passed independently on `https://www.concreteconceptsgroup.com/get-quote`: the initial loading frame hydrated to the complete five-step wizard with the required contact fields and no blank render. No field was entered and no form was submitted.

A separate production browser session was set to an actual **390×844** viewport. After scrolling beyond the hero, as intended by the component’s `scrollY > 300` display rule, the fixed bottom bar appeared with four distinct actions: **Call, Text, WhatsApp and Free Quote**. The screenshot shows readable labels, four separate tap targets, no horizontal overflow and no overlap with the main content other than the expected fixed-bar footprint. Source inspection confirms the destinations remain `tel:0424463268`, `sms:0424463268` with a prefilled Brisbane quote message, the CCG WhatsApp number and the internal `/get-quote` handoff. None of the actions was clicked.

The first raw HTTP acceptance command exited non-zero only because that temporary checker incorrectly asserted `noindex, nofollow`. The approved design, focused test and production response all intentionally use **`noindex, follow`** for paid `/lp/` routes. The production response therefore matches the release contract and does not justify rollback; the corrected acceptance check must use `noindex, follow`.

The stable direct project URL `https://concrete-concepts-group.pages.dev/get-quote` also hydrated successfully at 390×844 to the correct title and visible `Step 1 of 5`. Its single console error is Firefox rejecting Google Ads cookie `_gcl_au` because that cookie is configured for the custom `.com` domain while the page is being viewed on `pages.dev`. The public `.com` homepage check returned no current console errors, and the direct-host cookie rejection did not block route rendering, fields or lead-form code. It is therefore documented as a direct-host attribution limitation, not a Release 1 application regression.

The exact immutable deployment URL `https://0e49f104.concrete-concepts-group.pages.dev/get-quote` passed the same wait-aware 390×844 test: correct route title and visible `Step 1 of 5` after hydration. Its only reported console condition is the same expected custom-domain Google Ads cookie rejection on `pages.dev`; it did not affect rendering or the quote fields.

At the same production phone viewport, `https://concreteconceptsgroup.com/guide` hydrated to the specific guide title and visible **Download Free Guide** form. The acceptance session did not enter details, click the button or unlock the PDF. Its delivery behavior remains covered by the passing no-network Worker runtime test and confirmed-success tracking contract.

The representative paid route `https://concreteconceptsgroup.com/lp/concrete-driveway-ascot` hydrated with the route-specific **Concrete Driveway Quotes in Ascot** title and visible **Start Your Detailed Quote** handoff. The live page reported zero console errors after hydration. No field was entered and no handoff or submission was triggered. Raw acceptance independently confirmed the intended `noindex, follow` response header and sitemap exclusion.

The project’s strengthened `pnpm quote:verify:live` guard then passed the production apex and www quote routes on its first attempt under a 150-second hard timeout, exiting cleanly with status `0`. A preceding wrapper invocation also reported a passed route check but returned shell code `2` because the wrapper read an unsupported empty pipeline-status variable; the shell-neutral rerun confirms this was a command-wrapper defect, not an application failure.

The corrected raw production acceptance rechecked all eight homepage/quote host combinations at HTTP 200 with non-empty correct titles, retained exactly 202 sitemap URLs and zero `/lp/` entries, confirmed the paid-page `noindex, follow` header, verified representative service/area/paid titles and the service self-canonical, and confirmed static homepage HTML does not contain self-controlled `aggregateRating` or embedded `review` markup. The corrected acceptance completed with a clean pass.

## Passive delivery reconciliation after publication

The Gmail connector was explicitly switched to the named CCG business mailbox `info@concreteconceptsgroup.com`; a subsequent read-only result identifies that mailbox as the queried account. Message-by-message filtering from Brisbane midnight found **ten** messages inside broadly matching quote-related threads: four clearly labelled test notifications (`Test User` or `SEO Test User`) delivered at approximately 2:17–2:20 pm AEST before publication; three outbound CCG replies to genuine customer enquiries received on prior days; one manually forwarded tender request; one supplier newsletter; and one forwarded concrete test report. None is a new genuine website quote received today. A separate Gmail search from the Release 1 promotion timestamp returned **zero** quote, callback, guide or Jotform-related threads.

Jotform form `261986395364069`, **Get Your Instant Concrete Quote - Concrete Concepts Group**, remains `ENABLED` with **174 submissions**. Its newest record is submission `6637041392417676169`, created on 28 August in the form account’s unstated timezone; its content matches the Reece Flynn-O’Brien Caboolture South enquiry that Gmail received before today. Because that record is still the newest, Jotform has no submission after Release 1 publication and no new current-day customer submission. No Jotform form, submission or metadata was changed.

This passive evidence shows that the CCG mailbox and Jotform are reachable and previously matched on a genuine customer enquiry, while the labelled pre-release notifications prove the email code path had delivered earlier the same day. It does **not** prove a fresh production customer email after this release, because no approved labelled production test and no real customer submission occurred after promotion. Release readiness therefore rests on the passing no-network Worker callback/guide tests, passing complete-quote tests, live route acceptance and passive channel configuration—not on a fabricated or unlabelled lead.

## Google Ads state after publication

Direct Google Ads readback confirms `Quote Form Submission` action `7546454804` remains `ENABLED`, `primaryForGoal=true` and included in the conversions metric. `CCG SMS Click` `7738299269`, `CCG Visualiser Lead` `7738299272`, `CCG Callback Request` `7738442356`, `CCG WhatsApp Click` `7738442359` and `CCG Guide Download` `7738445479` are each `ENABLED` Contact actions with `primaryForGoal=false` and excluded from the conversions metric.

Custom goal `CCG Quote Form Only` `6458854572` remains enabled and contains only conversion action `7546454804`. Both Performance Max `23655153762` and rebuilt Search `24184424558` remain attached to that custom goal at campaign level. Presence-only positive and negative geo modes remain on for PMax, rebuilt Search and Tradenet.

The current configured daily budgets read back as **$160 PMax**, **$49.80 rebuilt Search** and **$0.20 Tradenet**, for **$210/day configured**; this is not an actual spend cap. PMax remains at the owner’s verified mobile-app change and was not reversed. Rebuilt Search remains at **300% target ROAS**. Its content-network setting remains enabled from the previously observed automatic change and was not disabled because that correction has not been approved. No Google Ads mutation was made as part of the website release or this readback.

## Post-promotion monitoring result

Cloudflare was checked again at `2026-08-29T11:06:13Z`, more than **23 minutes** after the production deployment was created at `2026-08-29T10:42:49Z`. Deployment `0e49f104-d36c-4f88-9532-3cf10b7b42aa` remained successful and canonical, with both apex and www aliases attached and commit hash `827256d3591fa38197f8ccd444ff4b85d7d76c62` recorded by Cloudflare.

The closing HTTP monitor made three rounds across homepage and `/get-quote` on apex, www, stable `pages.dev` and immutable `0e49f104.pages.dev`: **24 of 24 responses were HTTP 200 with non-empty correct titles**. The production browser evidence includes successful wait-aware custom-domain, stable Pages and immutable Pages quote hydration; a true 390×844 sticky-contact screenshot; and a paid-page render with zero console errors. The apex mobile homepage’s current error-level console readback was empty. The direct `pages.dev` hosts only reported the expected Google Ads custom-domain cookie rejection described above.

No new post-promotion Gmail lead or Jotform submission appeared during the monitoring window. This is an absence of customer activity, not proof of delivery failure. Because all required quote routes, edge SEO contracts, mobile contact controls, guide/paid surfaces and canonical deployment state remained healthy, rollback was **not** triggered. The immediate rollback remains `ee22dfe3-a989-47dd-b319-d92c186e6594` if a later genuine acceptance failure is observed.

## Concurrent partner-link preservation check

The refreshed GitHub `main` branch advanced to partner-release commit `f640d7f` before Release 1 source alignment. Its existing `Navbar.tsx` and `Footer.tsx` retain approved links to `https://partners.concreteconceptsgroup.com/partners`. The Release 1 production source and generated bundle do not contain that URL, and a hydrated live homepage evaluation at `2026-08-29T11:13Z` returned zero Trade Partners anchors and zero referral anchors. This means Release 1 preserved the internal `/referral` route but unintentionally displaced the separately approved public Trade Partners navigation.

This is a concurrent-change preservation regression, not a quote-funnel, lead-delivery or SEO failure. GitHub alignment must therefore merge Release 1 into the newer partner branch rather than overwrite it. The two existing external links should be restored to the verified Release 1 source, tested for conversion isolation, rebuilt, and republished through the same guarded Cloudflare path. No partner services, trade pages, customer-data sharing or advertising expansion is authorised by that restoration.

The approved partner-link contract was added to the Release 1 source first and reproduced the omission with two failing assertions and one passing conversion-isolation assertion. The existing desktop, conditional mobile-menu and footer links were then restored exactly from GitHub commit `f640d7f`; the contract passed **3/3**. In the refreshed GitHub working tree, the merged deterministic suite passed **49 files with one file skipped, 548 tests passed and one skipped**; TypeScript, the guarded source/build checks, production build and Worker syntax also passed. The built bundle contains exactly three approved partner-portal URL occurrences and all six verified Google Ads labels. The initial development accessibility snapshot exposed the restored `Trade Partners` link and exact destination without activating it, but subsequent production geometry—not that preliminary snapshot—was used to prove true phone-size visibility.

## GitHub alignment and partner-link repair

The verified Release 1 files were selectively merged onto refreshed GitHub `main` rather than copied over the repository wholesale. Commit `332a95a0c4f8170ea936c61b205ea8fa04d1c54a` has partner-release commit `f640d7f67976a4494c9522c8dac362732928d83b` as its direct parent. The merge preserved `Navbar.tsx`, `Footer.tsx`, `server/googleAdsReport.test.ts`, `server/partner-links.test.ts`, `docs/trade-partner-link-release.md`, `package.json`, `pnpm-lock.yaml` and `pnpm-workspace.yaml` from the newer partner branch before layering in Release 1. GitHub API readback confirmed the pushed commit and parent relationship.

Cloudflare first promoted merged deployment `e91e4983-4e70-424b-875b-6672e857ffe2`. Its quote guard, eight-host/path HTTP acceptance, 202-URL sitemap, paid-page `noindex, follow`, metadata/schema checks and three partner-URL bundle occurrences all passed. A corrected 390×844 geometry check then found the mobile Trade Partners link at 848–876 pixels, just below the viewport, while the fixed menu had a 1,025-pixel scroll height but computed `overflow-y: visible`. Because the fixed overlay could not scroll itself, the link was present in the DOM but not reliably reachable on that phone size.

A new regression assertion requiring a vertically scrollable fixed mobile menu failed first while the three existing partner-link assertions passed. The minimum change added `overflow-y-auto` to the existing overlay; the partner suite then passed **4/4**. The refreshed GitHub source passed the partner and Release 1 suites **25/25**, TypeScript, guarded source/build checks, production build, Worker syntax and the exact three-link artifact scan. Fix commit `83887b9` was pushed on top of `332a95a`.

Cloudflare then promoted final deployment `cbba98a6-47ff-4b5f-ad7d-f29c29cf7bdf` from commit `83887b9`. The bounded apex/www rendered quote guard passed on its first attempt. Raw acceptance returned HTTP 200 with correct non-empty titles for homepage and `/get-quote` across apex, www, stable Pages and immutable `cbba98a6`; it retained exactly 202 sitemap URLs and zero `/lp/` URLs, the intended paid-page `noindex, follow` header, representative service metadata/self-canonical output, removed self-review schema and exactly three partner-portal references in the canonical bundle.

The final production browser was explicitly set to **390×844**. After the fixed menu was opened and scrolled using its own container, computed `overflow-y` was `auto`, client height was 844 pixels, scroll height was 1,025 pixels and maximum scroll was 181 pixels. The Trade Partners link moved from 848–876 pixels to 667–695 pixels and became visible at the exact approved destination; Get a Free Quote was simultaneously visible at 776–812 pixels. The retained screenshot shows both controls readable, reachable and non-overlapping. Neither control was clicked, and no form value or submission was created.

## Final post-promotion monitoring closure

Cloudflare closing readback at `2026-08-29T11:59:57Z` was **17.10 minutes** after final deployment creation at `2026-08-29T11:42:51Z`. Deployment `cbba98a6-47ff-4b5f-ad7d-f29c29cf7bdf` remained successful and canonical, both custom-domain aliases remained attached, and commit `83887b9` remained recorded. Four timed rounds sampled homepage and `/get-quote` on apex, www, stable Pages and immutable `cbba98a6`: **32/32 responses were HTTP 200**, every response contained the expected non-empty title, and no route failure triggered rollback.

The closing passive Gmail search found no quote, callback, guide or Jotform-related message later than the four clearly labelled test notifications received at 04:17–04:20 UTC, well before the final deployment. Jotform still reports 174 submissions, with submission `6637041392417676169` from 28 August remaining newest. Therefore no new genuine customer lead appeared during the final repair window, no delivery channel was modified, and no production form was submitted. As before, this is an absence of customer activity rather than proof of a failure or proof of a fresh external email. The final release is accepted without rollback; `e91e4983-4e70-424b-875b-6672e857ffe2` is the immediate quote-route rollback and `0e49f104-d36c-4f88-9532-3cf10b7b42aa` is the earlier Release 1 fallback.

## Responsive navigation closure

The managed checkpoint preview and an independent canonical-production screenshot at **1280×720** exposed one final layout defect after the partner link was restored: the full desktop row appeared too early, several labels wrapped, Trade Partners split across lines, the quote button clipped beyond the right edge and the transparent navigation competed with the booking banner. The quote form itself remained functional, but the navigation was not accepted in that state.

Two new deterministic assertions were written first and failed against the affected source: the scrollable menu must remain active at 1280 pixels with the full no-wrap row reserved for the 2XL breakpoint, and the unscrolled homepage navigation must sit below the booking banner. The minimum repair changed the desktop row and CTA groups to `2xl:flex` with compact no-wrap gaps, kept the menu toggle active below 2XL, and applied a responsive top offset only while the homepage navigation is transparent. Existing partner destinations, mobile-menu scrolling and conversion isolation were unchanged. The partner/navigation suite then passed **6/6**; together with the Release 1 suite, **27/27** focused tests passed. TypeScript, the guarded production build, Worker syntax and the exact three-link artifact scan also passed.

GitHub code commit `1e2b959` was pushed on top of the accepted Release 1 and partner history. Cloudflare promoted deployment `d17220b7-999b-419e-87bc-19fe1cb4b695` from that commit at `2026-08-29T12:14:05Z`. The bounded apex/www rendered quote guard passed on its first attempt. Corrected raw acceptance again returned HTTP 200 with correct non-empty titles for homepage and `/get-quote` across apex, www, stable Pages and immutable `d17220b7`; it retained exactly 202 sitemap URLs, zero `/lp/` sitemap URLs, the intended paid-page `noindex, follow`, representative metadata/self-canonical output, removed self-review schema and exactly three partner-portal references.

Canonical production then passed all responsive checks without any navigation or form submission. At 1280×720 the booking banner has its own row and the logo/hamburger navigation sits below it with no wrapping or clipping. At 1536×864 the complete Services-to-Contact row, Trade Partners and Get a Free Quote appear on one line below the banner. At 390×844 the mobile menu still reports `overflow-y: auto`, scrolls the full 181 pixels and exposes both the approved Trade Partners destination and the quote action without overlap.

Closing Cloudflare readback at `2026-08-29T12:37:47Z` was **23.70 minutes** after `d17220b7` was created. It remained successful and canonical with both custom-domain aliases attached. The timed monitor recorded **12/12 custom-domain homepage/quote responses at HTTP 200 with non-empty correct titles** across three rounds. Its final round encountered a sandbox OpenSSL `SSL_ERROR_SYSCALL` only on Pages.dev. Follow-up reproduced that curl/OpenSSL condition for the stable, current and prior immutable Pages.dev hosts against both resolved Pages.dev IPv4 addresses, while apex and www remained healthy. A real browser independently loaded `https://d17220b7.concrete-concepts-group.pages.dev/get-quote` with the correct title, `Step 1 of 5`, required full-name/mobile/email fields and the confirmation that no conversion is counted until request confirmation. The Pages.dev condition is therefore classified as a sandbox curl/OpenSSL transport anomaly rather than a deployment or browser-route failure and did not trigger rollback.

Final production is accepted on `d17220b7`. Deployment `cbba98a6-47ff-4b5f-ad7d-f29c29cf7bdf` is the immediate rollback, followed by earlier Release 1 fallback `0e49f104-d36c-4f88-9532-3cf10b7b42aa`. No production form, call, text, WhatsApp, partner or quote action was activated during this final repair, and no Google Ads setting changed.
