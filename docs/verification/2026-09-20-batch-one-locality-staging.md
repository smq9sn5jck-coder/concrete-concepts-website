# Batch 1 Locality Pages — Staging Verification

**Date:** 20 September 2026

**Scope:** Release 2 tasks 2.1–2.10 only. This candidate is **staging-only**. It does not activate the 12 create routes on the customer domains and does not add them to the production sitemap.

**Permanent review:** https://release-3-need-another-trade.concrete-concepts-group.pages.dev/batch-one-review
**Unified preview deployment:** `cef74831-95ba-48ca-b1c6-92fd18b45bb3`

## Outcome

The fixed 20-page locality batch is implemented and verified in a private, noindex staging build. The customer website remains on the existing production release. No Google Ads campaign, budget, bidding, target ROAS, targeting, keyword or conversion-goal setting changed. No lead or Google Ads conversion was created during testing.

The register remains exactly 12 create routes and eight upgrade routes in the approved order: Moggill, Everton Park, Rochedale, Murarrie, Mermaid Waters, Clear Island Waters, Upper Coomera, Pimpama, White Rock, Silkstone, Spring Mountain, South Ripley, Flagstone, Beenleigh, Crestmead, Yarrabilba, Clontarf, Strathpine, Caboolture and Morayfield.

## Test-driven implementation

### Red phase

The first `server/batch-one-locality-content.test.ts` run failed because the typed locality source did not exist. The first renderer slice then produced 24 expected failures covering missing edge metadata, route gates, live links and the review index. A later independent review found seven material safety gaps. `server/batch-one-safety-regressions.test.ts` reproduced all seven failures before their fixes: HEAD/cache ordering, invalid service-prefill values, destructive draft overwrite, mismatched preview flags, incomplete source rendering, missing regional fragment targets and destructive raw-shell replacement.

A browser check found one additional SPA timing issue: `/areas#brisbane` retained the hash but did not scroll because the target mounted after the browser’s initial fragment jump. A separate failing regression was added before the post-render scroll helper was implemented.

### Green phase

The corrected focused suites passed **74/74 tests** across:

- `server/batch-one-locality-content.test.ts`
- `server/batch-one-safety-regressions.test.ts`

The complete deterministic suite passed **55 files and 681 tests** using the established live-provider exclusions and a 15-second load-tolerant test timeout. The only preceding default-timeout failure was `server/status-portal.test.ts`; it passed **11/11** immediately in isolation and passed in the complete 681-test rerun, confirming load-related timing rather than a Batch 1 regression.

`pnpm check`, `pnpm run build:batch-one-preview`, source and built quote guards, Worker syntax and `git diff --check` passed. The preview build generated `GENERATED_BATCH_ONE_PREVIEW_ENABLED = true` from the same documented `VITE_BATCH_ONE_PREVIEW` flag used by the client. The normal production build regenerates it as false.

## Closed safety findings

| Finding | Resolution |
|---|---|
| Unpublished create route could reach cache before the route gate, and HEAD was not gated | The Worker now evaluates Batch 1 route access for both GET and HEAD before any Cache API lookup or write. Denied routes return 404, `noindex, nofollow` and `no-store`; HEAD has no body. |
| Service buttons stored page slugs instead of quote enum values | Seven locality service slugs map to the authoritative `quoteServices` values. Every mapping passes the complete quote schema. |
| Locality handoff overwrote the existing quote draft | The handoff now loads and preserves existing contact, address, scope, description and consent data, then overrides locality/postcode and de-duplicates the selected service. |
| Client and edge preview flags could diverge | Both derive from `VITE_BATCH_ONE_PREVIEW`; the Worker consumes the generated build-time constant and no longer reads an unconfigured runtime variable. |
| Multi-source localities displayed only the first citation | The customer-facing React page, staging review and raw edge shell now render every URL in `localityContext.sourceUrls`. |
| Regional hub links had no fragment targets | `/areas` now exposes stable targets for Brisbane, Gold Coast, Ipswich, Logan and Moreton Bay. A post-render helper makes direct SPA fragment navigation scroll after mount. |
| Moggill cited a dead portal PDF | The 404 source was replaced by the official ABS 2021 Census QuickStats for Bellbowrie–Moggill, with the historical date and statistical-area limitation stated explicitly. |
| Raw edge shell replacement removed scripts after `#root` | Replacement is now limited to root contents. The built-shell verifier preserved all eight application/analytics scripts, one root element and both Spring Mountain source links. |

## Browser acceptance

The corrected staging build was reviewed at 390×844 and desktop width.

- The review index exposed exactly 20 review routes.
- All 20 routes rendered one H1, `noindex, nofollow`, at least one official source, at least three service-specific quote buttons and zero horizontal overflow.
- After allowing the shared SEO effect to settle, the 20 routes had 20 unique titles and no duplicate-title groups.
- Spring Mountain rendered both of its separate evidence URLs.
- Moggill rendered the replacement ABS source and its customer-domain canonical while remaining noindex on staging.
- A Moggill driveway handoff preserved a fictional existing name, Australian mobile, email, street address, description and consent state; replaced the locality with Moggill 4070; and merged valid `patio` and `driveway` enum values.
- The handoff reached the existing five-step `/get-quote` route with no quote, callback, conversion or other lead request.
- A fresh `/areas#brisbane` load scrolled to `scrollY=614` and positioned the section 92 pixels below the sticky header. All five regional targets existed.
- The corrected Moggill mobile screenshot is recorded as `ccg-r2-moggill-corrected-mobile.png` in the staging evidence folder.

The bounded link verifier passed all **49 unique internal** service/nearby-locality destinations and all **24 unique external** source URLs after the Moggill replacement. The Yarrabilba EDQ page blocks automated HTTP requests but was verified through both text extraction and a real browser.

## Publication controls

- The 12 create slugs remain customer-host Not Found until a separate activation release changes the explicit production allowlist.
- The eight upgrade URLs remain public at their existing canonical routes.
- The 12 create slugs remain absent from the production sitemap.
- `/batch-one-review` is build-gated and denied on customer production hosts.
- The private staging build and every reviewed locality page remain noindex.
- Production publication still requires a separate customer-domain activation, final sitemap/canonical parity checks and post-release monitoring.

## Independent review

The first independent review returned seven material findings, all reproduced and fixed test-first. A second independent review returned **pass**, confirmed all seven findings closed, found no new material issue, and reconfirmed no paid-media or primary-conversion scope change.

## Evidence

- Browser findings: `/home/ubuntu/ccg-r2-preview-2026-09-20/browser-findings.md`
- Edge-shell verification: `/home/ubuntu/ccg-r2-preview-2026-09-20/edge-shell-verification.json`
- Source verification: `/home/ubuntu/ccg-r2-preview-2026-09-20/source-verification.md`
- Link verification: `/home/ubuntu/ccg-r2-preview-2026-09-20/link-verification.json`
- Temporary local staging URL: `https://4174-iruxhrayrsa3gdj4ht5dv-5ac7b973.sg2.manus.computer/batch-one-review`
- Permanent noindex Cloudflare review URL: `https://release-3-need-another-trade.concrete-concepts-group.pages.dev/batch-one-review`
