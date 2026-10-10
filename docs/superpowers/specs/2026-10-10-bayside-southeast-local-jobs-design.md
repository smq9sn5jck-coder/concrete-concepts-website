# Bayside and South-East Brisbane Local Jobs — SEO Design

**Date:** 10 October 2026

**Status:** Staged structure and final design section approved; written spec ready for director review

**Branch:** `feature/bayside-southeast-local-jobs-preview`

**Development base:** verified regional preview commit `1059a69c465d326d3ad2dee22472a023b9307b15`

**Authority:** Write this specification only. Implementation planning follows written-spec approval. Customer production and Google Ads changes are not authorised.

## Decision and commercial scope

Prioritise **Wynnum, Manly, Cannon Hill, Mount Gravatt and Mansfield** for all existing, directly delivered CCG concrete services. Upgrade their current URLs rather than creating competing locality or service-by-suburb pages. Give homeowners and builders/developers separate qualification paths inside the existing five-step detailed quote.

Stage 1 is a dedicated five-page noindex Cloudflare preview. Stage 2 is a separate North/Central Gold Coast review using the existing Gold Coast candidate. Neither stage is a customer publication approval. Ipswich–Ripley is paused, not cancelled. Caboolture expansion is not resumed. Sunshine Coast, new trade services and Partner Portal changes are excluded.

The service range includes driveway construction/replacement, exposed aggregate, patios, paths, pool surrounds, shed/garage/patio slabs, suitable house and extension-slab concrete, footings, concrete steps, associated site preparation, crossovers and suitable builder/commercial concrete packages within CCG's verified scope. Small retaining-wall enquiries stay within CCG's established up-to-1-metre scope, subject to site-specific engineering, approval, loading, drainage and access review. Do not imply that height alone removes engineering or approval requirements. Existing generic service selections do not prove authority or capacity for any new specialist service.

CCG quotes its concrete component, not an entire multi-trade extension. Availability and serviceability depend on the actual address, project scope, documentation, access and programme. No promised response time, guaranteed job volume, universal coverage or fixed travel charge is introduced.

## Checked starting point and approach

A passive customer-site check on 10 October found all five target locality URLs returning HTTP 200, with self-canonical, index/follow metadata and membership in the 214-URL sitemap. No raw H1 was present on those five responses. This identifies an opportunity to make useful main content available before JavaScript; it does not prove Google cannot render the existing pages or establish actual indexing or rankings.

The homepage and `/get-quote` returned HTTP 200. No lead was sent. Those checks do not establish current Gmail delivery, enquiry counts or advertising performance. Fresh production/deployment readback is required at release time; historical deployment identifiers are not a current release instruction.

Three approaches were considered:

1. **Chosen — improve the five existing Brisbane pages first:** stable URLs, bounded release and direct alignment with the director's priority areas. Reuse earlier reviewed content where appropriate without publishing its whole cluster.
2. **Gold Coast first:** useful subsequent work but postpones the five named Brisbane priorities. It remains a separate stage.
3. **Create many suburb/service permutations:** rejected because extra page count alone does not create useful local relevance. Substantially similar city pages can fall within Google's doorway-abuse policy.[1]

## Exact Stage 1 page register

| Locality | Existing canonical path | Action | Distinct practical emphasis |
|---|---|---|---|
| Wynnum | `/areas/wynnum` | Upgrade | Driveway replacement and connected outdoor areas; removal, placement access, drainage and connections |
| Manly | `/areas/manly` | Upgrade | Driveways, paths, patios and pool surrounds; finish selection, existing-surface interfaces and maintenance preferences |
| Cannon Hill | `/areas/cannon-hill` | Upgrade | Work beside existing structures; demolition, garage transitions, slab/footing scope and service locations |
| Mount Gravatt | `/areas/mount-gravatt` | Upgrade | Driveway grades, level transitions, placement/removal access and retaining interfaces where relevant to the actual property |
| Mansfield | `/areas/mansfield` | Upgrade | Coordinated driveway, slab and outdoor work; preparation responsibilities, separate work areas and construction sequence |

These emphases guide distinct content, not limitations on which CCG concrete jobs each page accepts. Do not assert that every property in a suburb has the same terrain, soil, access, flood exposure or construction needs.

The preview-only review index is `/bayside-southeast-review`. It lists the five candidates and their intended changes. It never enters the customer sitemap and returns a noindex 404 on customer hosts, including after a future approved five-page publication.

There are no new locality URLs, alternate spellings, `/lp/` pages or new regional hubs in Stage 1. Upper Mount Gravatt and other new surrounding-area pages remain outside this release.

## Page content and proof

Each candidate contains:

1. A clear, locality-specific H1 and introduction identifying CCG's direct concrete scope.
2. A concise service overview covering the relevant existing range, with links to valid customer-public service pages.
3. Distinct practical planning guidance based on the emphasis in the register, stated as questions/checks for the individual property.
4. Two accessible enquiry choices: homeowner/property owner and builder/developer. Neither choice submits anything.
5. A short checklist of information useful for review: address, intended use, dimensions or uncertainty, existing surface, access, timing and relevant documents.
6. Visible FAQs that answer genuine project-readiness questions and match structured data.
7. Useful nearby-locality links, not a hidden suburb list.
8. One primary detailed-quote action, with existing secondary phone/SMS controls allowed to remain.

Do not fill pages with demographic statistics merely to vary text. Include official locality or approval context only when relevant to the customer's decision, dated and cited. Council context must never imply a CCG project, property diagnosis or guaranteed demand. Final copy must be reviewed for distinct usefulness, not just automated similarity scores.

No unaudited testimonial, rating, review count, local-project count, recent-activity widget, scarcity claim, fixed price, “from” price, discount, reward, free-service promise, guarantee, warranty, licence, insurance, compliance or local-office claim is added. Retained legacy claims must meet the same evidence rule or be removed from the candidates. No Marcus references or exit-intent popup.

Photos may be used only with verified ownership/use permission and confirmed job facts. Do not infer a job suburb from appearance or disclose an address, number plate or customer identity. No new photo or review is required to ship: where evidence is absent, omit the proof block. Descriptive alt text and intrinsic media dimensions are required for retained assets. The existing homepage mobile poster and desktop/tablet video are untouched.

## Nearby links and page ownership

Use a restrained set of relevant, already-working nearby pages:

- **Wynnum and Manly:** each other plus suitable links to Wynnum West, Manly West, Lota and Tingalpa.
- **Cannon Hill:** Murarrie, Morningside, Tingalpa and relevant Carina/Carindale connections.
- **Mount Gravatt and Mansfield:** each other plus relevant Wishart, Carindale, Holland Park and Eight Mile Plains connections.

Choose three to five nearby links per candidate. Before inclusion, verify the destination's meaningful content, canonical and publication status; a generic HTTP 200 with not-found metadata is a failed destination. Omit rather than publish a broken link.

Surrounding localities are link destinations and coverage context only. This release does not silently upgrade them. No Stage 1 link points to an unpublished Gold Coast page, regional guide, extension service page, Norman Park candidate, Ipswich hub or Need Another Trade route. Where an extension service page is unavailable, explain the concrete scope on the candidate and hand off to the quote instead.

## Isolated content and publication architecture

Create a typed `shared/baysideSoutheastLocalJobsContent.ts` candidate registry owning the exact five routes, content roles, nearby links, review index and quote-context map. Generate client and Worker representations from this source; do not maintain a second editable HTML/content copy.

Reviewed Wynnum and Cannon Hill material may be composed from the existing Southside records plus explicit candidate additions. Do not copy those records into an independently editable duplicate or enable the Southside cluster merely to reuse them. Manly, Mount Gravatt and Mansfield use the existing locality model for typed candidate overlays. Existing legacy/customer renderers remain available when candidate access is off.

Independent generated flags are:

- `BAYSIDE_SOUTHEAST_PREVIEW_ENABLED = false` by default;
- `BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED = false` by default.

The dedicated preview build enables only this candidate's preview flag, bundles a self-contained Pages Worker and restores checked-in flags in a `finally` path, including failed builds. All other unpublished regional, Gold Coast, Southside and other-trade publication/preview flags remain off. Already-public Batch 1 content stays public; disabling unrelated candidates must not hide previously published pages.

Worker and SPA apply the same access policy to raw metadata, HTML, structured data, hydrated content and quote contexts:

| Request context | Five locality routes | Candidate quote enhancements | Review index |
|---|---|---|---|
| Normal default-off build | Current baseline versions | Baseline customer quote | Not found |
| Dedicated preview build on non-customer host | Five candidate versions | Enabled for an allowed candidate handoff/draft | Noindex review page |
| Customer host with publication off, even if preview artifact is served | Current customer versions | Baseline customer quote; candidate token ignored | Noindex 404 |
| Customer host after separate exact publication approval | Five candidate versions | Enabled for an allowed candidate handoff/draft | Noindex 404 |

A candidate registry entry or URL parameter must not grant access by itself. Use the central normalised customer-host helper, including case/trailing-dot equivalents. Unknown or malformed candidate/review paths return real HTTP 404 in the candidate build with the appropriate noindex/security controls.

Development starts from an existing regional-preview worktree to reuse tested source, but inheritance is not release authority. Test customer/default-off behavior against freshly fetched production source and readback. In particular, the base includes audience questions and `projectContext` changes that must not leak into the ordinary customer quote merely because all page flags are off. Gate or selectively integrate them for this release. Any unrelated default-off difference from the current customer baseline must be reconciled, removed from the candidate or explicitly documented for separate approval before customer release.

## One five-step quote with two audiences

No alternate form, new submission endpoint, short quote or extra funnel step is added. Keep contact → location → job brief → measurements/site details → review/consent.

### Allowlisted raw and hydrated handoff

Each locality has a generic CTA and two audience choices. The shared map defines exactly 15 token forms: `bayside-{slug}-{audience}`, where `slug` is one of `wynnum`, `manly`, `cannon-hill`, `mount-gravatt`, `mansfield`, and `audience` is `general`, `homeowner`, or `builder`. This is an enumerated allowlist, not acceptance of arbitrary strings matching a pattern.

The raw CTA points to `/get-quote?context={token}`. The hydrated CTA resolves through the same map. After access is granted, context carries only the locality, region `Brisbane`, original landing route and optional explicit audience. It does not select slab or structural work automatically. Generic handoff keeps an existing audience choice or the established homeowner default; builder handoff selects the builder branch. All choices remain editable.

Consume context once and strip it from the URL before analytics tracking while preserving unrelated legitimate campaign parameters. Unknown, duplicate, malformed or access-denied context values are ignored and removed; they cannot enable a preview or change consent. No personal data enters the URL.

Fill suburb only when blank. Never silently replace an entered address, postcode, contact data, service, measurements or job description. If the incoming locality conflicts with an existing draft suburb, preserve the draft and provide an accessible choice to keep it or switch the locality; do not erase other information. Landing route/region represent the originating candidate page, not a claim about the final job location. The submitted location always comes from the customer's confirmed project details. Explicit audience changes preserve entered data, hide inapplicable questions and apply the existing consent-eligibility reset.

Context handling may update the existing browser-local draft only. It must not upload, create a server record, notify anyone, book a service or fire a primary conversion. If localStorage is unavailable/corrupt/expired, use safe in-memory defaults and keep the quote usable.

### Homeowner/property-owner branch

Collect the existing required contact, locality, service, description, timeframe and consent fields. Allow dimensions/area or “not sure.” Photos stay optional. Structural project defaults to `other_concrete` unless the customer chooses a structural type.

Show structural document-readiness questions for `new_house`, `extension_slab`, `under_house_build_under` or `complete_extension` only. Missing documents may be “not sure,” unavailable or in progress; their absence alone does not block an enquiry. Ordinary driveway, patio, path or other non-structural enquiries must not be forced through structural/soil/engineering questions. General site-condition questions remain property-specific.

### Builder/developer branch

Require company name, actual project street address, useful concrete scope and indicative programme/site-ready timing, consistent with the existing shared/Worker validations. Accept “planning/not yet fixed” as truthful programme information rather than require a fabricated date. Role, sites/pours, available documents and preferred follow-up are optional. Keep builder programme questions outside the structural-only document block so non-structural builder packages can progress without hidden required fields.

Reuse the existing version-1 optional `projectContext` contract and enum values. For candidate non-structural work use `other_concrete`; do not introduce a new endpoint or mandatory context for baseline callers. Validate at UI, shared schema and Worker boundaries. Existing recipient/configuration, delivery integrations, D1 schema and conversion code are not redesigned.

### Complete-extension/partner boundary

A complete-extension detailed quote must include a concrete slab scope. Optional partner-introduction interest stays unchecked by default, visible only when eligible and cleared when the project/service becomes ineligible. It records owner-review interest, not authority to share data. A later provider would be identified and applicable final consent obtained before any disclosure. No provider promise, automatic forwarding or partner-only primary quote conversion.

If only non-concrete work is requested, show a clear scope explanation without linking to an unpublished other-trade form. The user can change the request to a genuine concrete scope; do not silently reclassify or promise referral delivery.

## Delivery, conversion and privacy contracts

For an eventual authorised customer candidate, preserve existing D1-backed quote acceptance, Jotform backup, Resend/Gmail notification, private token-protected R2 photos, Australian 04 mobile validation, SEQ qualification, anti-spam, bounded body parsing, structured photo validation, transaction-id deduplication, acknowledgement escaping and failure handling. Do not change recipients or send an email test.

Candidate context is formatted through the existing safe brief/legacy adapter; no new provider or marketing audience receives it. Baseline callers without `projectContext` remain valid. Persistence failure must not claim quote success. Downstream delivery failures remain available for existing reconciliation rather than being concealed.

Only a confirmed successful detailed quote may fire primary action `7546454804`. Preserve custom goal `6458854572` without an Ads mutation. Quote starts, CTA/audience selections, calls/SMS, callbacks, uploads, guides, shares, partner interest, other-trade requests and QA stay non-primary. Deterministic mocked tests—not live submissions—verify successful conversion semantics and duplicate protection.

No customer details, photo tokens, email bodies or secrets appear in reports, URLs or screenshots. Preview review is not authenticated private access: noindex prevents intended indexing but is not an access-control guarantee. Therefore publish no customer-private information in it.

## Preview delivery must fail closed

Before uploading, freshly read the exact Pages project, customer canonical deployment/commit and preview bindings. Historical expected preview resources are `LEAD_BACKUP_DB` → D1 `57820612-5691-4486-8191-0e48b94a8ae4` and `LEAD_PHOTOS` → private R2 `ccg-other-trade-preview-photos-20260920`, with `LEAD_PREVIEW_DRY_RUN` set to string `true`. These are expectations to verify, not permission to create or change resources. Stop for a mismatch; do not substitute production bindings.

In this candidate preview artifact, quote/callback/photo-upload/booking and any reachable partner/other-trade lead mutation route must return HTTP 403 with `success: false` and code `PREVIEW_SUBMISSION_DISABLED` before persistence, outbound delivery or a conversion-success response. This applies to legacy, REST and supported tRPC entry points. The build marker and non-customer host enforce the block even if the dry-run variable is missing, false or misconfigured; the variable is additionally required for deployment readiness. Do not depend on a disabled button alone. Existing signed-photo read security is retained, but QA reads/writes no customer photo.

Tests with valid mocked requests prove zero D1 preparations/writes, zero R2 writes and zero Jotform/Resend/Gmail/booking/provider fetches. Browser testing never presses the final submit button or uploads a photo. No real or synthetic lead, email, callback, booking or conversion is created. Read-only aggregate/resource checks may confirm the shared preview store counts are unchanged; it must not be assumed empty or deleted to make a test pass.

## SEO, accessibility and verification

All five pages require unique titles/descriptions, one meaningful H1, stable customer canonical, raw main-content visibility and equivalent hydrated content from the typed registry. Breadcrumb and Service schema must match scope. FAQPage is included only for visible matching FAQs; markup is not a promise of rich results. Preserve required application/analytics scripts and existing security controls.

For a repeatable duplicate-copy check, normalise NFKC/lowercase prose, replace punctuation with spaces, collapse whitespace and strip the five locality names plus approved nearby place-name tokens. Compare introduction, practical guidance and FAQ answers, excluding navigation, shared service labels, consent, CTA and footer. Assert no identical normalised paragraph of 30 or more words between candidates and compute set Jaccard similarity over five-word shingles for all ten pairs; every score must be below 0.45. Record corpus/normalisation version and scores. This is an engineering copy-reuse alarm, not Google's ranking threshold or a guarantee against doorway abuse. Manual review must still establish distinct customer value; do not manipulate prose merely to pass a score.

Every non-customer preview response—including assets, errors, redirects and sitemap—gets `X-Robots-Tag: noindex, nofollow` and the preview security policy/CSP. Customer pages retain current indexing behavior with publication off. The existing five sitemap URLs stay unchanged during preview; no new entry or misleading `lastmod` is added. Review paths and context URLs are never indexable canonical destinations.

Keyboard focus must reach the incoming step heading after its transition, validation errors must be announced and focusable, audience choices must expose their selected state, and touch controls must remain usable. Test 390×844 mobile plus desktop, no horizontal overflow and no first-party runtime errors. Separate third-party cookie/network diagnostics from actual application failures. No homepage hero changes or heavy new media are part of this release.

## Test-first acceptance register

Begin implementation with failing tests. Release readiness requires:

1. Exactly five candidate locality routes plus one preview-only review index, with no new suburb/service permutations.
2. Raw/client registry parity and no duplicate editable locality content source.
3. Access matrix coverage for both customer hosts, case/trailing-dot equivalents, preview/off and separately published states.
4. No unrelated Southside, Gold Coast, regional, Ipswich, Sunshine Coast or other-trade candidate rendered or linked; already-public pages still work.
5. Baseline quote UI/payload/delivery behavior preserved when candidate access is off, despite the development branch's inherited changes.
6. Unique metadata/H1, schema/visible-content parity, ten similarity checks and prohibited-claim removal.
7. All internal destinations verified as genuine working published/candidate pages, plus correct canonical redirects and 404s.
8. All 15 raw/hydrated context tokens, unknown/duplicate tokens, one-time removal, campaign-parameter preservation and access denial.
9. Draft conflicts, corrupted/expired/unavailable storage, editable audiences and protection of customer-entered fields.
10. Homeowner non-structural path without forced structural documents; structural unknown-document path; builder structural and non-structural paths without hidden required inputs.
11. Shared/UI/Worker validation parity and version-1 legacy-caller compatibility.
12. Partner eligibility/default/reset checks and no provider forwarding.
13. Preview mutation guards at every reachable lead entry point with valid mocked bodies, zero writes/fetches and no false success.
14. Mocked D1 failure, confirmed quote success and exactly-once conversion/notification regression checks; no live tests.
15. AU mobile, service-area, anti-spam, body/photo validation and private-photo access contracts.
16. Noindex/security coverage across response types, default-off customer metadata and unchanged sitemap.
17. Mobile/desktop rendering, keyboard/validation focus, no broken links, no first-party console errors and zero lead/upload network requests during QA.
18. Focused tests, safe deterministic suite, TypeScript, normal default-off build, isolated candidate build, quote source/build guards, self-contained Worker syntax and restoration of checked-in flags.

Known external/billable/live integration tests remain excluded and explicitly named in the implementation plan. A test failure is investigated and fixed minimally before continuing; no bypass or real lead submission substitutes for verification.

## Cloudflare preview release and director review

Use a new dedicated preview branch/alias, proposed `bayside-southeast-review`, after confirming availability. Do not overwrite any existing review alias or deploy to `main`. Verify source commit and `environment=preview` after upload. Worker direct upload must be self-contained with no local imports. Use fresh guarded credentials if required, and destroy temporary credential material afterward.

Passively verify review index, five candidates, context navigation, genuine linked destinations, assets, errors and redirects. Walk representative homeowner, structural and non-structural builder paths without submission. Clear browser diagnostic drafts. Re-read customer production identity and passively check homepage, quote page, existing locality content, sitemap and Partner Portal redirect remain unaffected.

Write a privacy-safe acceptance record containing branch/commit, deployment/URL, binding identifiers only, build/test evidence, route/header results, baseline isolation and limitations. Obtain director visual review. No production release or indexing follows automatically.

## Separate production boundary and measurement

A later approval must identify the exact five candidate pages, the conditional quote enhancements, publication flag transition and permitted sitemap `lastmod`/Search Console work. Gold Coast is not bundled. Rebuild the explicitly approved candidate with preview off, capture fresh customer deployment and usable rollback, verify diff against customer source and all unrelated flags, then follow guarded deployment, passive checks and at least fifteen minutes of monitoring. Stop if delivery, quote, indexing or baseline behavior fails a gate.

After authorised publication, distinguish project suburb from landing-page origin. Track completed/contactable/qualified enquiries, homeowner-builder mix, services, written quotes, wins, accepted value and commercial travel burden using existing data without a database migration in this scope. Review a practical 30-day early trend and a mature 60–90-day cohort. Impressions, clicks and starts are diagnostics, not jobs. No immediate-rank, lead-volume or profitability guarantee. Search Console evidence is needed to claim actual indexing; sitemap membership alone is not proof.

Google Business Profile content, reviews and photographs can be considered separately using genuine information. No profile edits, posts, fabricated offices or reviews are authorised here. Google identifies relevance, distance and prominence as local-ranking factors; adding suburbs to a page cannot remove distance limits.[2]

## Stage 2 — Gold Coast boundary

After Stage 1 preview review, separately revalidate and shape the existing North/Central Gold Coast candidate: `/areas/gold-coast`, driveway/exposed-aggregate/outdoor-concrete/shed-and-garage-slab/small-retaining-wall pages, plus the existing house- and extension-slab candidates where approved. Reuse them instead of competing URLs. Retain separate homeowner/builder qualification and confirmed direct service coverage.

Existing locality coverage includes Ormeau, Pimpama, Coomera, Upper Coomera, Nerang, Robina, Clear Island Waters and Mermaid Waters. Surrounding-area additions need real service capacity, distinct usefulness and their own bounded design; no opportunistic Helensvale/Southport or other page expansion during Stage 1. Stage 2 requires its own written acceptance scope, preview validation and separate production decision. This spec does not approve Gold Coast publishing, whole-coast availability or Ads expansion.

## References

[1]: https://developers.google.com/search/docs/essentials/spam-policies "Google Search Central — Spam policies and doorway abuse"
[2]: https://support.google.com/business/answer/7091?hl=en "Google Business Profile — Tips to improve your local ranking"
