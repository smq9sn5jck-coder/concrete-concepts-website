# Approved CCG schema graph implementation

User approval: “Go”, 10 October 2026, following the 26 September schema blueprint.
Base: a640076; isolated branch `feat/ccg-schema-graph-2026-10-10`.

## Boundaries

No merge, production deployment, new content publication, API/feed repair, customer submissions or changes to pricing/estimator, quote consent/attribution, other-trade or southside publication flags. Existing PR #1 and #3 stay untouched. Avoid changing their page files, Worker entry and Vite configuration; the edge change is narrowly confined to `seo-manifest.js`. Existing business phone is retained. Unverified email, premises, coordinates, social profiles, hours, licence credentials and review/price data are omitted from the new graph.

## Design

1. Deterministic build-time extractor reads only public display fields from existing service and locality content and the sitemap; it never executes TSX or copies reviews, prices or customer data. Nine services + homepage/quote use exact source copy. Twenty approved typed localities receive a reviewed service graph. Legacy localities get only a page entity pending editorial R2 review. Blog gets no article or phantom list until R0 source restoration. Collection routes get no fabricated item URLs.
2. Framework-free shared graph builder, generated data and edge bundle drive the same JSON-LD on HTTP first response and client navigation. Canonical `#business` is reused; home adds WebSite, quote adds ContactPage, service/locality gets Service + real breadcrumbs. No arbitrary slug graph. Fail closed on private, preview, unknown and noindex routes.
3. Remove legacy index HTML JSON-LD. Cloudflare edge places the sole graph in head, not React root. SEOHead replaces the same owned script on client navigation instead of appending existing legacy props; Breadcrumbs keeps visible navigation but emits no competing JSON-LD. Existing page literals can remain inert to avoid conflicting with PR #3; generated graph consumes none of their reviews/prices/fake addresses.
4. Typed/edge locality HTML retains all visible copy and links, but no root-bound JSON-LD. Preserve module/tracking scripts, robots/status and publication behavior.

## Red/green validation

- Tests first: identity uniqueness, graph references, exact service source names/copy, no fake locations or ratings/prices, unknown/protected hosts/routes, encoded and noncanonical variants, injection-safe serialization, no article without published source.
- Integration: sole head graph, zero root graph, deterministic repeated transformation, module/tracking preservation, full sitemap matrix, client script replacement and cleanup.
- Baseline existing tests, complete test suite, TypeScript, production build, Worker/module syntax checks, generated-output determinism, browser raw/settled graphs and SPA navigation without lead submission.
- Review diff, verify current remote main hasn't advanced, commit and create an isolated PR with clear compatibility notes for overlapping files in estimator PR #3. Do not deploy.

## Acceptance limits

This change is schema infrastructure and accuracy cleanup, not completion of the 194-page HTML/body rollout or blog recovery. Legacy locality/service-area editorial expansion and published-only blog graphs remain gated as designed. Google LocalBusiness rich results can require a public physical address; this branch intentionally does not manufacture or publish one.
