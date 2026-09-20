# Brisbane South-Side Locality Cluster Implementation Plan

**Date:** 20 September 2026
**Design:** `docs/superpowers/specs/2026-09-20-southside-locality-cluster-design.md`
**Release target:** Noindex Cloudflare Pages preview only; customer production remains unchanged

## Release principles

This implementation is test-first, uses the existing typed locality renderer and preserves the production quote, email, Jotform, D1, R2 and Google Ads boundaries. The south-side preview gets a separate feature flag rather than reusing Batch 1’s production publication state. The default checked-in and production build state is off.

## Task 1 — Add south-side content and publication contracts

Create `shared/southsideLocalityContent.ts` containing the exact eight approved records. Murarrie reuses the existing Batch 1 record to avoid duplicate sources of truth. The remaining seven records use the existing `LocalityContentRecord` shape and a validator that enforces exactly eight unique records.

Create `shared/southsidePublication.ts` with the exact action lists and explicit preview/customer-host availability rules. Murarrie remains publicly available through Batch 1. The six upgrades remain on their current legacy production content while the noindex preview renders the typed replacements. Norman Park remains unavailable on customer hosts until separate production approval.

Add `server/southside-locality-content.test.ts` first. The failing tests must cover the exact register, action counts, unique content, prohibited claims, evidence URLs, internal links, material-copy similarity, quote-handoff isolation and production-off boundaries.

## Task 2 — Extend generated edge data

Update `scripts/generateLocalityEdgeData.ts` to emit south-side records, lookup maps, action lists, production allowlists and `GENERATED_SOUTHSIDE_PREVIEW_ENABLED` into `client/public/locality-content.js`.

Add `build:southside-preview` to `package.json`. The generator reads `VITE_SOUTHSIDE_PREVIEW`; the default generated value remains false after preview work.

Update `client/public/seo-manifest.js` so the raw HTML shell and metadata select the south-side typed record only when its route is available in the current host/preview context. Existing Batch 1 behavior remains unchanged.

Update `client/public/_worker.js` to enforce the new route boundary at the edge. On a noindex preview host, all eight typed pages render. On customer hosts before release, Norman Park remains a real 404/noindex route and the six upgrade paths continue to serve their existing public legacy pages.

## Task 3 — Add the preview-only browser route

Update `client/src/pages/SuburbPage.tsx` to select the approved south-side typed record only when `VITE_SOUTHSIDE_PREVIEW` is true, except Murarrie, which continues through the existing Batch 1 production path.

Create `client/src/pages/SouthsideReviewPage.tsx` using the existing Batch 1 review layout. It must be build-gated, denied on customer hosts, noindex and list all eight pages with action, postcode, evidence and review links.

Update `client/src/App.tsx` to lazy-load `/southside-review` only for south-side preview builds. Do not add the route to the production sitemap.

Update `client/src/components/BatchOneLocalityPage.tsx` only as necessary to add the approved nearby-locality display names and remove any unverified shared licence statement from the typed renderer. Preserve the existing five-step quote handoff and direct-call tracking.

## Task 4 — Preserve customer production and sitemap boundaries

Do not add Norman Park to the production sitemap or service-area directory during staging. Do not change the seven existing production sitemap canonicals or `lastmod` values during staging.

Keep `/lp/exposed-aggregate-norman-park` unchanged. Run a read-only Google Ads final-URL query before any later production redirect decision.

Regenerate locality edge data with no preview flags after every preview build so the checked-in default remains off.

## Task 5 — Automated verification

Run the focused south-side tests in red, implement the minimum code to turn them green, then run:

```bash
pnpm locality:generate
pnpm other-trade:generate
pnpm exec vitest run server/southside-locality-content.test.ts server/batch-one-locality-content.test.ts server/batch-one-safety-regressions.test.ts
pnpm check
VITE_SOUTHSIDE_PREVIEW=true pnpm run build
pnpm quote:verify:source
pnpm quote:verify:build
node --check client/public/_worker.js
```

Run the full deterministic suite with the established live-test exclusions. Confirm no skipped tests were added and both generated preview flags return false in checked-in source after verification.

## Task 6 — Browser acceptance

Serve the preview build and inspect `/southside-review` plus all eight locality routes at 390 × 844 and desktop size. Confirm one H1, readable content, working source/service/nearby links, no horizontal overflow, no browser console errors and no lead or primary conversion request.

Verify the locality CTA stores only draft data and opens `/get-quote`. Do not submit a real lead.

## Task 7 — Noindex Cloudflare preview

Read the current Cloudflare Pages project, production canonical deployment and bindings. Build with `VITE_SOUTHSIDE_PREVIEW=true`, then deploy to a dedicated nonproduction branch with `noindex, nofollow` headers. Reuse no production database migration and make no Google Ads mutation.

Verify the preview review page and all eight routes. Verify the customer homepage, `/get-quote`, `/areas/murarrie`, `/areas/wynnum` and `/areas/norman-park` retain their pre-release behavior. Confirm production sitemap and canonical deployment remain unchanged.

## Task 8 — Review handoff

Commit the implementation and verification record, align the authorised GitHub repository without claiming that GitHub push is a production deployment, then provide the permanent Cloudflare preview link. Request separate explicit approval before publishing the seven staged changes to customer production.
