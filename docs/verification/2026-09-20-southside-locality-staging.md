# Brisbane South-Side Locality Cluster — Cloudflare Staging Verification

**Date:** 20 September 2026
**Status:** Deployed to a permanent noindex Cloudflare Pages preview
**Customer production:** Unchanged
**Google Ads:** Read-only checks only; unchanged

## Approved register

| Locality | Path | Staging action |
|---|---|---|
| Murarrie | `/areas/murarrie` | Retain the approved Batch 1 record and strengthen cluster links |
| Wynnum | `/areas/wynnum` | Upgrade |
| Cannon Hill | `/areas/cannon-hill` | Upgrade |
| Norman Park | `/areas/norman-park` | Create |
| Morningside | `/areas/morningside` | Upgrade |
| Tingalpa | `/areas/tingalpa` | Upgrade |
| Camp Hill | `/areas/camp-hill` | Upgrade |
| Carina | `/areas/carina` | Upgrade |

The six upgrades and the new Norman Park page remain staging-only. Murarrie is already public through the approved Batch 1 release.

## Official evidence sources

All seven new or upgraded records use official sources that returned HTTP 200 on 20 September 2026:

- Brisbane City Council, Wynnum Centre Suburban Renewal Precinct: https://www.brisbane.qld.gov.au/about-council/council-projects/wynnum-centre-suburban-renewal-precinct
- Australian Bureau of Statistics 2021 Census QuickStats, Cannon Hill: https://abs.gov.au/census/find-census-data/quickstats/2021/SAL30519
- Australian Bureau of Statistics 2021 Census QuickStats, Norman Park: https://www.abs.gov.au/census/find-census-data/quickstats/2021/SAL32164
- Australian Bureau of Statistics 2021 Census QuickStats, Morningside: https://www.abs.gov.au/census/find-census-data/quickstats/2021/SAL31922
- Australian Bureau of Statistics 2021 Census QuickStats, Tingalpa: https://abs.gov.au/census/find-census-data/quickstats/2021/301031018
- Australian Bureau of Statistics 2021 Census QuickStats, Camp Hill: https://www.abs.gov.au/census/find-census-data/quickstats/2021/303011047
- Australian Bureau of Statistics 2021 Census QuickStats, Carina: https://www.abs.gov.au/census/find-census-data/quickstats/2021/SAL30538

Each citation is presented only as dated locality context. No citation implies CCG work, current demand, work volume or property-specific soil, access, drainage or engineering conditions.

## Cloudflare deployment

The verified preview was deployed directly to the existing Cloudflare Pages project `concrete-concepts-group`:

- Branch: `southside-locality-review`
- Environment: `preview`
- Deployment: `64eeba6d-72b5-4f33-98a4-5aad091af2e0`
- Immutable URL: `https://64eeba6d.concrete-concepts-group.pages.dev`
- Permanent branch alias: `https://southside-locality-review.concrete-concepts-group.pages.dev`
- Review index: `https://southside-locality-review.concrete-concepts-group.pages.dev/southside-review`
- Source commit: `c0c9fa214e81af7d0aec599d9a54830dfcc222e8`

Cloudflare reported the deployment stage as successful. The Pages production branch remains `main`. The canonical customer deployment remains `87a8a2b1-a6f7-42ff-8b62-9d6ce1a120ae` at `https://87a8a2b1.concrete-concepts-group.pages.dev`; the preview did not replace it.

The project preview environment retains the isolated D1 binding `LEAD_BACKUP_DB` with database `57820612-5691-4486-8191-0e48b94a8ae4`, the private R2 `LEAD_PHOTOS` bucket `ccg-other-trade-preview-photos-20260920`, `LEAD_PREVIEW_DRY_RUN`, and the existing Turnstile configuration. No database migration was run and no test enquiry was submitted.

## Independent review and fixes

An independent review found three issues before Cloudflare deployment. All were corrected and covered by new regression tests:

1. The preview-build command could leave the generated south-side flag enabled in checked-in source. A dedicated build wrapper now restores production-safe false values in a `finally` block after either success or failure.
2. Raw crawler HTML lacked the locality JSON-LD emitted after hydration. A shared typed schema builder now feeds both the hydrated page and generated edge data. Raw responses contain `BreadcrumbList`, `Service` and `FAQPage` data matching the same locality record.
3. Case, percent-encoded and trailing-slash Norman Park variants could fall through to the SPA shell. The preview now redirects recognised variants to the single lowercase canonical URL. The future customer-host source gate rejects all Norman Park variants until production approval.

## Automated verification

| Check | Result |
|---|---|
| Focused Batch 1 and south-side content/edge regressions | 96/96 passed |
| Full deterministic website suite | 61 files / 761 tests passed |
| TypeScript | Passed |
| Guarded south-side preview build | Passed |
| Source and built quote-isolation guards | Passed |
| Cloudflare Worker syntax | Passed |
| Preview artefact feature flags | South-side true; other-trade false |
| Checked-in production defaults after preview build | South-side false; other-trade false |
| Diff hygiene | Passed |

The authorised GitHub source was then updated with the same feature delta while preserving its repository-specific package configuration. That source passed **67 files / 784 tests**, TypeScript, the guarded south-side preview build, the production-default build, source/build quote guards and Worker syntax. Both generated preview flags returned to false afterward.

The full suite emitted existing non-fatal test-environment warnings for Resend domain verification and exhausted Google Maps test quota. All tests still passed. These server-test warnings do not describe the Cloudflare production quote route, which was separately proven through the live end-to-end Jotform and Gmail test earlier on 20 September 2026.

## Live Cloudflare acceptance

HTTP checks passed for the permanent branch alias:

- `/southside-review`: HTTP 200 with `X-Robots-Tag: noindex, nofollow` and matching robots metadata.
- All eight locality routes: HTTP 200, self-canonical to the customer-domain URL, one raw H1, useful raw locality copy, `BreadcrumbList`, `Service` and `FAQPage` JSON-LD, and `X-Robots-Tag: noindex, nofollow`.
- `/areas/Norman-Park`, `/areas/%6Eorman-park` and `/areas/norman-park/`: HTTP 308 to `/areas/norman-park`, with noindex headers.
- `/need-another-trade`: HTTP 404/noindex; the unrelated other-trade feature remains off in this preview.

A real-browser review confirmed the review index displays exactly eight records with the expected retain, upgrade and create labels. A concurrent 390 × 844 check across all eight hydrated pages confirmed one H1 per page, unique titles, customer-domain canonicals, noindex metadata, the required structured-data types, zero forms and no horizontal overflow.

The Norman Park page was visually reviewed. Its primary action saved only `suburb: Norman Park` and `postcode: 4170` into the existing local draft, opened `/get-quote`, left all contact fields blank and left all consent values false. Browser resource timing contained no quote, Jotform or other-trade submission request. No lead, email or conversion was created. The browser console showed no runtime error.

## Customer production preservation

After the preview deployment, the customer homepage, `/get-quote`, Murarrie and Wynnum continued returning HTTP 200. The production sitemap remained HTTP 200 and still excludes `/areas/norman-park` and `/southside-review`.

Because production was deliberately not changed, Norman Park and its path variants retain the pre-existing customer behavior: HTTP 200 SPA shell with `Area Not Found`, `noindex, follow`, and no typed locality content. The corrected source would enforce a true 404/noindex gate when later deployed, but that production change requires separate approval.

## Read-only Google Ads verification

A fresh read-only GAQL check after the preview deployment confirmed:

| Campaign | Status | Daily budget | Bidding | Key safeguard |
|---|---|---:|---|---|
| CCG Search | Enabled | A$330.00 | Maximise conversion value, 300% target ROAS | Content Network off; Presence targeting |
| Performance Max | Enabled | A$160.00 | Maximise conversion value | Presence targeting |
| Tradenet | Enabled | A$0.20 | Maximise conversions | Presence targeting |

The Search budget remains the previously flagged out-of-band A$330/day value; this work did not change or repair it. The custom goal `CCG Quote Form Only` remains enabled and contains only Quote Form Submission action `7546454804`. That action remains enabled and primary. Auto-Apply subscriptions `DISPLAY_EXPANSION_OPT_IN`, `KEYWORD` and `USE_BROAD_MATCH_KEYWORD` remain paused. No Google Ads mutation was made.

## Release boundary

This is a review release only. Publishing the six upgrades and new Norman Park page to customer production, updating the sitemap and requesting Google indexing require a separate explicit approval after visual/content review. No Google Ads, Gmail, Jotform, D1, R2, lead-recipient or conversion setting is included in that future approval unless separately stated.
