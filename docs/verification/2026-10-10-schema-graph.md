# CCG schema graph implementation — 10 October 2026

## Status

Implemented in an isolated branch, **not deployed or merged**. Base: `a640076fd3a424fd5a8e803cea597ff491b7afc7` (current main rechecked). Branch: `feat/ccg-schema-graph-2026-10-10`.

This implements the approved **schema accuracy and ownership layer**, not the complete R0–R3 body pre-rendering rollout. It does not repair the blog feed or claim that the 194 thin-page problem has disappeared.

## Implemented

- **One route-specific JSON-LD graph in `<head>`** for allowlisted public URLs. Edge and React navigation use the same generated data and pure shared builder.
- **One stable business identity**: `https://concreteconceptsgroup.com/#business`, typed `HomeAndConstructionBusiness`, retaining the existing public phone `+61424463268`.
- Removed static unlinked LocalBusiness/Organization JSON-LD, root-bound locality JSON-LD and competing inline breadcrumb/homepage FAQ scripts. Visible FAQs and breadcrumb navigation remain.
- Legacy page schema props are deliberately inert: no fake suburb branch, address/coordinates, self-controlled review stars, parsed prices, stock availability, unverified mailbox/profile/hours/licence credential is included in the new output. Existing visible page copy and old inert literals remain to avoid crossing into pricing/content ownership.
- Generated service/page names from existing visible H1s and exact literal public fields, rather than creating a second content factory. Nine service entities reuse actual source intro/title text; reviewed typed locality service graphs reuse the approved content records. Breadcrumb labels reflect visible navigation.
- **Fail-closed publication**: no graph for unknown services/areas, private quote/account/API paths, another-trade referrals, paid landing pages, encoded noncanonical inputs, noindex responses or non-customer hosts. Existing status/robots and staged locality flags are unchanged.
- Safe JSON serialization escapes `<` as `\u003c`; public snapshots include no customer or lead fields. Query/hash input is not copied to graph identifiers.
- `pnpm schema:generate` creates shared TypeScript data and an edge ESM bundle. The production build runs generation before Vite. No dependency or lockfile changes.

## Coverage of the 214-URL public sitemap

| Coverage | Count | Detail |
|---|---:|---|
| Homepage | 1 | Business + WebPage + WebSite |
| Quote page | 1 | Business + ContactPage + breadcrumb |
| Published direct services | 9 | Business + WebPage + Service + breadcrumb |
| Already-reviewed typed localities | 20 | Business + WebPage + locality Service + breadcrumb |
| Other published pages | 113 | Page/collection graph; 101 legacy localities get page/breadcrumb identity only, no new detailed locality service claims |
| **URLs with one allowlisted graph** | **144** | Same graph in edge response and settled client DOM |
| Unverified article URLs | 69 | No BlogPosting/Article graph until published source and ordinary visitor content are verified |
| Referral page | 1 | No graph snapshot of dynamic monetary offer heading |
| **Total** | **214** | Local HTTP matrix; not a production crawl of this branch |

No collection `ItemList` was invented. Article lists/author/dates/images remain withheld until derived from an authoritative, published, accessible source. The blog index gets `CollectionPage` identity only—not phantom article markup.

## Verification performed

| Check | Result |
|---|---|
| Tests written before implementation | Builder/document missing-module failures recorded; breadcrumb and inline FAQ parity failures reproduced before fixes |
| Focused schema + existing edge/publication regressions | **139 tests passed** across seven files |
| Final regression run excluding named live API/seeded-data prerequisites | **791 passed**, **1 existing skipped** across 70 files; no new skipped tests |
| Entire unfiltered suite attempted | **Not all green.** Missing Ads label/Windsor/Resend configuration, live-service validation and absent seeded database/article data were exposed; relevant new root-schema/fixture failures were corrected. No credentials, live integration tests or database seed data were fabricated to hide failures. |
| TypeScript | `pnpm check` passed |
| Production build + quote source/build guards | `pnpm build` passed |
| JS module syntax | Built Worker, edge metadata module and generated schema bundle passed `node --check` |
| Deterministic generation | Two runs produce identical SHA-256 hashes for shared manifest and edge module |
| Full HTTP sitemap matrix | **214 responses HTTP 200**, no duplicate graph or root-bound script; **144 with graph**, **70 without** |
| Customer-host public representative HTTP responses | Homepage, quote, service and typed locality each one head graph |
| Preview-host protection | Quote on non-customer host: `noindex, nofollow`, **zero graph** |
| Staged locality protection | Norman Park on customer host: **404**, noindex, **zero graph** |
| Browser/SPA parity | Service → Beenleigh → quote → home → legacy Carindale → blog → unavailable Norman Park; graph matches edge shared builder and visible H1 after settling, no stale business/page nodes |
| Diff/branch isolation | `git diff --check` passed; previous clone remains clean on main; main and existing PR #1/#3 were not modified |

### Browser method and limits

Tested the **built Worker locally**, routing a production-name host to loopback. Chromium was configured to treat this local HTTP origin as secure (equivalent to production HTTPS for the existing `crypto.randomUUID` quote behavior). This browser-only harness setting is **not shipped**. All API/mutation calls and external browser requests were blocked; no form was submitted. The test waited for route content and schema effects to settle. It does not verify real lead delivery, live PageSpeed or production search results.

### Final regression command

```bash
pnpm exec vitest run \
  --exclude server/anthropic.test.ts \
  --exclude server/bfl.test.ts \
  --exclude server/gads-label.test.ts \
  --exclude server/googleAds.test.ts \
  --exclude server/resend.test.ts \
  --exclude server/content-expansion.test.ts \
  --exclude server/seo-conversion.test.ts \
  --exclude server/seo-features.test.ts
pnpm check
pnpm build
node --check dist/public/_worker.js
node --check dist/public/seo-manifest.js
node --check dist/public/route-schema.js
```

The excluded files are **not modified or disabled** in the repository. They remain part of the normal full suite. The existing live Cloudflare credential test is already skipped by its own opt-in condition.

## Non-interference / merge coordination

- Existing PR **#1** (metadata pre-rendering): no changes to its App, SEO modules or Vite plugin/configuration files.
- Existing PR **#3** (estimator alignment): no changes to ServicePage, SuburbPage, quote wizard, estimator, Worker entry, pricing/D1 or PDF/server paths.
- Minimal shared-file overlap remains in **`package.json`, `client/public/seo-manifest.js` and `client/src/components/FAQSection.tsx`**. A separate draft PR makes this visible; it must be reconciled during any later merge, not force-applied over the estimator branch. Preserve schema generation and single graph ownership, and preserve estimator safeguards/content.
- No Cloudflare account/deployment, advertising, CRM, listing, email, connector settings or production content publication was changed.

## Release and remaining work

1. Review the isolated draft PR and coordinate the three shared-file overlaps before merging anything. No auto-merge or production release is configured by this work.
2. **R0:** Restore a verified published blog feed for ordinary visitors; then remove/update invalid sitemap articles as appropriate. Do not manufacture articles to satisfy schema tests.
3. **R1:** After review, stage the schema branch and test first-response/DOM fidelity with its actual HTTPS host. Continue the approved service/home/quote meaningful HTML content rollout; schema alone does not make the body crawlable.
4. **R2:** Editorially review legacy locality claims in batches before upgrading their page-only graphs into detailed Service graphs and body shells. Preserve current typed locality and southside gates.
5. **R3:** Build published-only article and collection data contracts; only then emit BlogPosting with real author, original published/modified timestamps and representative image, plus accurate visible collection items.
6. Validate generic graphs with Schema.org Validator and Google-supported features with Rich Results Test on the approved staging/public release. These third-party validators were **not run** in this local implementation. After an approved live release, use Search Console inspection and compare qualified leads by landing-page family.

**Intentional eligibility limit:** No full public physical address has been approved. This graph can be Schema.org-valid while Google's LocalBusiness rich-result test requires an address. Do not manufacture a suburb branch or expose a private residence to satisfy that field. Schema does not guarantee rankings, local-pack placement, rich results or leads.
