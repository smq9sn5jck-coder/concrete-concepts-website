# Homepage Funnel Consolidation — Production Release

**Date:** 20 September 2026
**Author:** Manus AI
**Status:** Accepted in production after monitored verification

## Release scope

Release 1 makes the existing five-step detailed quote the homepage’s only primary quote path. It retains the separate callback and telephone options, removes the competing lower-page direct quote form, replaces the failing dynamic service-area map with a static linked area grid, removes live-looking activity and scarcity widgets, and replaces unsupported review, timing, insurance, price and absolute-quality statements with factual project-specific wording.

The service-area directory now displays clean locality names rather than repeating “Concreter” before every suburb. Natural “concreter in [locality]” language remains on relevant locality pages. The directory has one Home breadcrumb and uses address-specific coverage confirmation rather than universal service claims.

The five-step quote payload, Australian mobile validation, Brisbane and South East Queensland qualification, Gmail/Resend delivery, Jotform delivery, D1 lead backup, private R2 photo storage, quote-success sharing and primary conversion guard were not changed.

## Cloudflare release and rollback

| Control | Verified result |
|---|---|
| Canonical deployment | `0efbd29a-ed13-4662-891b-62d57446a6b2` |
| Immutable URL | `https://0efbd29a.concrete-concepts-group.pages.dev` |
| Immediate Pages rollback | `3139befa-3c30-4d10-92e6-8edb8e3fce0b` |
| Released source commit | `c2f217bf5130e187300284508e1bb03ce332406c` |
| Production D1 binding | `LEAD_BACKUP_DB`, preserved |
| Preview D1 binding | `LEAD_BACKUP_DB`, preserved |
| Production R2 binding | `LEAD_PHOTOS`, preserved |
| Preview R2 binding | `LEAD_PHOTOS`, preserved |

The release used a complete Pages static manifest with 59 files and a self-contained Worker bundle. The guarded deployment request first verified that the canonical baseline was still `3139befa-3c30-4d10-92e6-8edb8e3fce0b`, then published the exact tested build. Cloudflare reported a successful production deployment and made `0efbd29a-ed13-4662-891b-62d57446a6b2` canonical.

Rollback requires selecting deployment `3139befa-3c30-4d10-92e6-8edb8e3fce0b` as production. No binding rollback is required because Release 1 did not alter D1 or R2 configuration.

## Production acceptance

The established no-submit live quote-route verifier passed after one attempt across the customer and Pages hosts. HTTP acceptance returned 200 for the apex and `www` homepages, `/get-quote`, `/areas`, `/visualiser`, the paid retaining-wall landing page, `sitemap.xml`, `robots.txt`, stable Pages, the immutable release and the retained Partner Portal. The newly referenced JavaScript asset returned successfully and matched the locally verified build by SHA-256.

The rendered production `/areas` page contains one H1 and 139 area links including footer links. None begins with “Concreter”. It has one expected Home breadcrumb, no horizontal overflow, normal customer-host `index, follow` metadata, the correct CCG telephone link and none of the unsupported universal coverage, insurance or hidden-fee statements covered by the release contract. The immutable Pages host returns `X-Robots-Tag: noindex`.

The public sitemap remained at 202 URLs because Release 1 does not publish any new locality route. No quote, callback, Jotform record, D1 lead, email or Google Ads conversion was created during production acceptance.

## Monitoring

The release remained live beyond the required 15-minute window. A first monitor-script run exposed a brittle assertion against minified JavaScript, not a website failure. That assertion was replaced with an exact SHA-256 match against the built asset. A subsequent monitoring iteration passed all routes, the 202-URL sitemap, immutable-host noindex and asset hash before a later request received a transient peer reset (`curl` 56). The monitor was made retry-tolerant without weakening its HTTP or content checks.

The final checkpoint at `2026-09-19T19:28:50Z`, more than 18 minutes after deployment completed, passed the apex, `www`, quote, areas, stable Pages and immutable routes; confirmed the 202-URL sitemap; confirmed immutable-host noindex; and matched live asset `/assets/index-CjJB0s_X.js` to SHA-256 `9b9a39ea52668fbcdc13695f660cf8c26374a3feb9769273126239fefd8d7814`.

## Google Ads protected-setting readback

No Google Ads mutation was performed for this website release. The final readback confirmed:

| Protected control | Verified result |
|---|---|
| Search campaign | Enabled and serving |
| Search daily budget | A$330, unchanged |
| Search bid strategy | Maximise conversion value, unchanged |
| Search target return on ad spend | 300%, unchanged |
| Search location mode | Presence, unchanged |
| Search Content Network | Off |
| Performance Max daily budget | A$160, unchanged |
| Performance Max location mode | Presence, unchanged |
| Tradenet daily budget | A$0.20, unchanged |
| Auto-Apply `DISPLAY_EXPANSION_OPT_IN` | Paused |
| Auto-Apply `KEYWORD` | Paused |
| Auto-Apply `USE_BROAD_MATCH_KEYWORD` | Paused |
| Search and PMax goal configuration | Campaign-level custom goal `6458854572` |
| Quote-only custom goal membership | Only `Quote Form Submission` action `7546454804` |
| Click-to-call, SMS, visualiser, callback, WhatsApp and guide actions | Secondary |

Tradenet retains customer-level goal configuration and remains outside the quote-only protection applied to Search and Performance Max; this pre-existing risk was not changed in Release 1.

## Verification summary

Before deployment, the closing deterministic suite passed 53 files and 607 tests. The focused high-risk release suite passed 10 files and 86 tests. TypeScript, the production build, source and built quote guards, Worker syntax, diff hygiene, desktop/mobile visual review and the no-submit homepage-to-quote handoff all passed. Production verification then confirmed the canonical deployment, customer routes, complete asset delivery, service-area labels, sitemap count, preview noindex and protected Google Ads settings.

## References

[1]: https://concreteconceptsgroup.com/ "Concrete Concepts Group customer website"
[2]: https://0efbd29a.concrete-concepts-group.pages.dev/ "Immutable Release 1 deployment"
[3]: https://developers.cloudflare.com/pages/configuration/rollbacks/ "Cloudflare Pages rollbacks"
