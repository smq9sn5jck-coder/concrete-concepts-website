# Backup Reliability and Indexability Release

**Date:** 30 August 2026
**Author:** Manus AI
**Status:** Both releases accepted and monitored; source aligned to GitHub

## Protected Release Scope

The director approved two ordered releases: first replace the unreliable external database backup with a verified Cloudflare D1 record, then repair the sitemap/noindex conflict affecting 12 public pages. Gmail/Resend, Jotform, the five-step quote funnel, AU phone and Brisbane/SEQ validation, paid-page `noindex` controls and Google Ads conversion settings are protected throughout.

## Release 1 — Verified Cloudflare D1 Backup

Cloudflare D1 database `ccg-lead-backup` was created in the OC region and bound to the Pages project as `LEAD_BACKUP_DB` in both production and preview. Cloudflare requires a D1 resource binding before Pages Functions can access the database, and binding changes require a redeployment to take effect.[1]

The Worker now uses a prepared `INSERT` with bound parameters and accepts backup success only when D1 returns `success: true` and `meta.changes: 1`. Cloudflare documents that `run()` returns a `D1Result` containing both the success flag and write metadata.[2] An HTTP 200 HTML page, a missing binding, an exception or a zero-row result can no longer be reported as a stored backup.

| Control | Accepted result |
|---|---|
| Failing tests before code | The old HTML-200 behavior failed the new false-success contract, and the missing D1 implementation failed the confirmed-insert contract. |
| Focused tests after code | 25 of 25 backup, callback, guide and Release 1 delivery tests passed. |
| Deterministic project suite | 560 tests passed and one known live-deployment test was skipped. The three live external-provider tests were excluded after independently failing for Resend/report and Anthropic service responses rather than source regressions. |
| Build and static checks | TypeScript, guarded production build, built quote contract, Worker syntax and diff hygiene passed. |
| Cloudflare deployment | `87868f52-92f1-44de-8f93-6e09968803b8`, created 30 August 2026 at 17:33:55 UTC, completed successfully and became canonical for apex and www. |
| Immediate rollback | `c2c56e33-d43a-45a5-b375-b8bdc0430a00`. The D1 binding can also be removed independently without deleting the database. |
| Live route guard | Apex/www homepages, apex/www `/get-quote`, the retaining-wall paid page and the immutable deployment quote route returned HTTP 200 with their expected titles. A real browser rendered `Step 1 of 5` and the unchanged contact fields. |
| Live backup proof | One clearly labelled callback-system test returned HTTP 200 with email `sent`, D1 `logged` and Jotform `logged`. A direct D1 query found exactly one matching stored callback record. |
| Test-data cleanup | The synthetic D1 row was deleted by exact ID and source label; a follow-up count returned zero. The corresponding Gmail/Jotform test remains clearly labelled as not a customer lead. |

No Google Ads setting, public URL, SEO directive, primary conversion or customer-facing form step changed in Release 1.

## Release 2 — 12-Page Indexability Repair

A new parity contract first reproduced exactly 12 sitemap routes returning `noindex, follow`. It also applies the same Worker sitemap filter used in production, so paid `/lp/` pages are excluded from the public set instead of being mistaken for public-page failures. The edge manifest now has truthful, route-specific titles and descriptions for the seven core pages and five service pages below.

| Core pages | Service pages |
|---|---|
| `/calculator` | `/services/concrete-patios-brisbane` |
| `/faq` | `/services/crossover-permits-brisbane` |
| `/finishes` | `/services/excavation-brisbane` |
| `/gallery/before-after` | `/services/pool-surrounds-brisbane` |
| `/projects` | `/services/shed-slabs-brisbane` |
| `/referral` |  |
| `/reviews` |  |

| Control | Accepted result |
|---|---|
| Red phase | 13 assertions failed: one all-sitemap parity assertion plus the 12 exact public route checks. Each affected route returned `noindex, follow`. |
| Green phase | All 18 parity assertions passed. Every Worker-filtered public sitemap URL is indexable and self-canonical; paid `/lp/` pages remain outside the public sitemap and `noindex, follow`; `/admin`, `/my-quote` and `/404` remain noindexed. |
| Deterministic suite | 51 test files passed, one live-deployment file was skipped, and **578 tests passed with one skipped**. Only the three previously identified live external-provider suites were excluded. |
| Build and static checks | TypeScript, guarded production build, built quote contract, Worker syntax, route artifact checks and diff hygiene passed. |
| Cloudflare deployment | `09a1e236-1c78-45a9-98b2-b6af353c1644`, created 30 August 2026 at 17:43:06 UTC, completed successfully and became canonical for apex and www. |
| Immediate rollback | Backup-only deployment `87868f52-92f1-44de-8f93-6e09968803b8`. |
| Production metadata | All 24 apex/www route samples returned HTTP 200, `index, follow`, their apex self-canonical and a route-specific title. All 12 remain present in the public sitemap. |
| Paid-page protection | The public sitemap contains zero `/lp/` URLs and `/lp/retaining-wall-brisbane` remains `noindex, follow`. |
| Customer funnel guard | Apex/www homepages and five-step quote routes plus the immutable new deployment route returned HTTP 200 on their first bounded attempt. A real browser rendered the corrected calculator content and then rendered `Step 1 of 5` with the unchanged name, AU mobile, email and contact-method fields. No form data was entered or submitted. |

Release 2 changes only edge metadata for the 12 named public pages. It does not change page content, customer forms, D1/Gmail/Jotform delivery, Google Ads destinations, budgets, bidding or conversion actions.

## Closing Monitoring and Source Alignment

More than 20 minutes after Release 2, all 24 apex/www metadata samples still returned HTTP 200 with `index, follow`, an apex self-canonical and route-specific title. The homepage, five-step quote route and immutable deployment route also remained HTTP 200 on their first bounded attempt.

One stale apex sitemap cache object was detected during closing monitoring. The cached object exposed the old raw 278-URL file, including 76 paid `/lp/` URLs, while cache-busted apex, www and immutable deployment responses correctly returned the Worker-filtered 202-URL sitemap with zero paid pages. Only `https://concreteconceptsgroup.com/sitemap.xml` and its `www` equivalent were purged through Cloudflare's single-file purge API.[3] The complete verifier then passed again: all 12 corrected pages were present, all 24 apex/www metadata rows passed, and the public sitemap contained zero `/lp/` URLs.

The final D1 readback returned a successful aggregate query with zero stored rows and no remaining labelled synthetic record. Cloudflare deployment `09a1e236-1c78-45a9-98b2-b6af353c1644` remained successful and retained both customer aliases; the GitHub source push did not replace it. The approved source, migration, tests, design and evidence were pushed to GitHub commit `4ec33b6`.

The final Google Ads readback found that this website release did **not** change campaign goals, targeting or networks: Search remains Presence-only, Content Network remains off, target ROAS remains 300%, and PMax and Search still use enabled custom goal `CCG Quote Form Only` containing only `Quote Form Submission` action `7546454804`. PMax remains A$160/day and Tradenet remains A$0.20/day. The Search budget is now A$110/day. Google Ads change history attributes the A$60-to-A$110 update to the Google Ads mobile app at 21:39:01 on 30 August under the CCG account email, not to the API or this website release. The director subsequently confirmed that A$110/day should be retained, so no Ads mutation was required.

## References

[1]: https://developers.cloudflare.com/pages/functions/bindings/ "Cloudflare Pages Functions bindings"
[2]: https://developers.cloudflare.com/d1/worker-api/prepared-statements/ "Cloudflare D1 prepared statement methods"
[3]: https://developers.cloudflare.com/cache/how-to/purge-cache/purge-by-single-file/ "Cloudflare purge by single-file"
