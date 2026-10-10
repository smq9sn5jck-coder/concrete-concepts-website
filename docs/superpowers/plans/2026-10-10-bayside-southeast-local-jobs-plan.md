# Bayside and South-East Brisbane Local Jobs — Implementation Plan

**Date:** 10 October 2026

**Status:** Planning deliverable; no implementation or deployment performed by this plan.

**Approved specification:** `docs/superpowers/specs/2026-10-10-bayside-southeast-local-jobs-design.md`, committed as `430557c`; written-spec approval received 10 October 2026 at 17:40 Queensland time.

**Worktree:** `/home/ubuntu/ccg-bayside-southeast-preview`

**Branch:** `feature/bayside-southeast-local-jobs-preview`

**Scope of current authority:** Prepare this implementation plan. Do not start website implementation in this planning turn. The future execution described below is confined to an isolated noindex preview. Customer publication, indexing, Google Ads changes and live lead tests require separate authority.

## Plain-English outcome

Improve the **existing Wynnum, Manly, Cannon Hill, Mount Gravatt and Mansfield pages**, not add competing suburb URLs. Give each page useful project-specific guidance for CCG's existing concrete services and separate homeowner/builder enquiry choices within the same five-step quote. Produce a Cloudflare review preview where submissions are blocked, then stop for visual review. Gold Coast is a separate second stage.

This plan protects the live website and quote delivery through independent feature gates, baseline comparisons, mocked delivery tests and a preview-only deployment target. It does not promise extra jobs, immediate rankings or an improvement to today's Gmail delivery.

## 1. Non-negotiable boundaries

- Exactly five upgraded locality paths: `/areas/wynnum`, `/areas/manly`, `/areas/cannon-hill`, `/areas/mount-gravatt`, `/areas/mansfield`.
- One preview-only review index: `/bayside-southeast-review`. It always remains unavailable/noindex on customer hosts.
- No change to existing production deployment, recipient addresses, Jotform/Gmail/Resend settings, database schema, R2 permissions, Partner Portal or Ads settings during preview work.
- No production lead, synthetic submission, upload, callback, booking, email test or provider disclosure. All mutation tests run against local mocks.
- One existing five-step quote; no new endpoint, duplicate form or extra step.
- Existing detailed-quote confirmed-success conversion only: preserve primary action `7546454804` and custom goal `6458854572`. Do not change campaign goals, budgets, bidding, keywords or targeting.
- Homeowner non-structural work does not require structural paperwork. Builder non-structural work still has visible company, actual address, concrete scope and programme requirements.
- Complete-extension concrete enquiries require slab scope; partner interest is optional, unchecked, eligibility-cleared and never permission for immediate sharing.
- No fabricated reviews, local projects, licence/insurance claims, prices, scarcity, availability or performance guarantees. No exit popup or homepage hero change.
- Gold Coast, Ipswich–Ripley, Caboolture and all other unpublished clusters are not included. Already-public locality pages remain available.

## 2. Source findings and implementation strategy

The development branch inherits regional source commit `1059a69`. It is **not** identical to customer production. Inspection found approximately 845 additions and 77 removals across the Worker, wizard, draft, shared quote schema and locality renderer when compared with the currently available `origin/main` reference. This is a repository comparison, not proof that `origin/main` is today's deployed source. A fresh deployment/source check is Task 1.

Specific integration facts:

- `client/src/pages/SuburbPage.tsx` delegates typed candidates to `client/src/components/BatchOneLocalityPage.tsx`. The renderer is a **component**, not a page-path file.
- Existing `scripts/buildRegionalSlabPreview.ts` enables Gold Coast and other-trade previews. **Do not use it** for this five-page artifact.
- `ComprehensiveQuoteWizard.tsx` currently writes `projectContext` and shows inherited audience fields. Turning page flags off alone does not restore the customer quote. Explicit access gating and baseline tests are required.
- `shared/quoteBrief.ts` already supports optional version-1 `projectContext`, with builder street address, company, concrete scope and programme rules. Reuse it; do not invent a new schema version.
- `client/src/lib/regionalSlabQuoteHandoff.ts` adds slab to the draft. **Do not call it** for an all-services CTA that must not choose a service.
- `client/src/lib/quoteDraft.ts` handles versioned drafts but some browser storage calls can throw. Add safe adapters/in-memory fallback through test-first changes without weakening existing validation.
- `client/index.html` starts third-party tracking before the React app. URL-context removal in a React effect is too late for the first outbound tracking request. Task 5 places the narrowly scoped cleanup before tracking scripts.
- Vitest uses the Node environment and includes `server/**/*.test.ts` and `server/**/*.spec.ts`. New tests stay in those locations. Source-string checks alone do not prove conditional UI behavior.
- Three Worker test suites copy local imported modules into temporary directories. Adding a Worker import requires updating their fixture copies, not enabling the new feature in old tests.

### Small architecture, not a platform rewrite

| Boundary | Proposed owner | Responsibility |
|---|---|---|
| Typed content | `shared/baysideSoutheastLocalJobsContent.ts` | Five records, canonical paths, content sections, nearby links and exact 15-token map |
| Pure access policy | `shared/baysideSoutheastPublication.ts` | Baseline/preview/public decision, review-index restriction and candidate-draft eligibility |
| Pure quote rules | `shared/quoteAudiencePolicy.ts` | Structural visibility, builder requirements and partner eligibility; no browser or network dependencies |
| Pure context merge | `shared/baysideSoutheastQuoteContext.ts` | Resolve allowed token, preserve draft data, describe locality conflict; no persistence or network |
| Browser adapters | `client/src/lib/baysideSoutheastQuoteHandoff.ts`, `client/src/lib/baysideSoutheastPreviewAccess.ts` | Storage/in-memory adapter, navigation and host/flag wiring |
| UI | `client/src/components/BaysideSoutheastLocalJobsPage.tsx`, `client/src/pages/BaysideSoutheastReviewPage.tsx` | Candidate content and accessible actions; reuse stable visual primitives |
| Generated edge/client data | `scripts/generateBaysideSoutheastData.ts` | Deterministic output from shared owners, not another editable content source |
| Preview build | `scripts/buildBaysideSoutheastPreview.ts` | Only this preview enabled, self-contained Worker and all-source restoration |
| Worker integration | `client/public/_worker.js` | Early mutation block, route priority, raw HTML/schema, noindex and security finalization |

Names of **new** files above are planned; they are not claims that those files already exist. Avoid unrelated framework/auth/database refactors. Keep shared policy reusable rather than duplicating React and Worker business rules.

## 3. Work order and acceptance ownership

| Task | Purpose | Spec acceptance items |
|---|---|---|
| 1 | Establish customer/source baseline and safe test runner | 5, 11, 14, 15, 18 |
| 2 | Isolated access and exact route/context registry | 1–5, 8, 16 |
| 3 | Fail-closed preview mutation boundary | 13–16 |
| 4 | Typed truthful content and repeatable similarity checks | 2, 6, 7 |
| 5 | Raw/SPA handoff, early URL cleanup and safe drafts | 8, 9, 14 |
| 6 | Conditional audience UI and payload compatibility | 5, 10–12, 14, 15, 17 |
| 7 | Page renderers and narrow routing integration | 1–7, 17 |
| 8 | Worker raw SEO, canonical, schema and response controls | 2–7, 16 |
| 9 | Isolated build and default restoration | 4, 5, 16, 18 |
| 10 | Full deterministic gate and no-submit browser QA | All 18 |
| 11 | Independent release review and preview preflight | All 18 |
| 12 | Dedicated Cloudflare preview and passive verification | All 18 plus documented live isolation |

For every code task: **RED → GREEN → REFACTOR**. Run the named test first and record the intended behavioral failure; fix missing test setup before interpreting a module-not-found error as sufficient proof. Implement only the minimum change, then rerun the focused test and relevant existing regressions. A passing source-marker assertion alone is not an integration gate.

## Task 1 — Capture a current baseline and safe local test entry point

**Files:** new `docs/superpowers/verification/2026-10-10-bayside-southeast-baseline.md`; new `server/bayside-southeast-baseline.test.ts`; future new `scripts/runSafeDeterministicTests.ts`; package script `test:safe`.

1. Confirm clean branch and fetch authorised GitHub refs without rebasing or overwriting any worktree.
2. Inspect configured Cloudflare connection, then read the exact customer canonical deployment, source branch/commit, aliases and current preview binding identifiers. Use the matching connector; expose only names/IDs, never values.
3. Resolve the deployed source commit to available Git history. If it cannot be resolved, stop release preparation rather than silently use `origin/main`. Write a short privacy-safe baseline reference.
4. Passively record customer homepage, quote page, five locality pages, sitemap and existing Partner Portal redirect. Do not submit a form, log customer content or claim inbox delivery from these probes.
5. Compare inherited wizard/payload, Worker dispatch, routing, metadata and flags with deployed source. Classify each difference: already approved/live, reusable dormant capability, this candidate's necessary gated change, or unrelated difference to exclude before customer release.
6. Add red baseline tests for normal/customer builds: no candidate audience/context leakage, ordinary quote payload omits candidate context, five-step count unchanged, published locality visibility unchanged, conversion-success boundary preserved.
7. Inventory all test files for real network/database/secret side effects. Keep the seven known external/live files excluded (Section 4); inspect newly added files and transitive initialization before including them.
8. Add a small safe-runner with exact exclusions, fail-fast output/exit status and deterministic test-file discovery. Test the selection logic without spawning live tests; do not edit tests to skip failures. Then run the baseline safe suite and TypeScript to establish existing failures before feature work.

**Commands when implemented:** `pnpm test:safe`, `pnpm check`, `pnpm quote:verify:source`. All must report current results, not reuse historical 876-test totals.

**Done:** deployed source is traceable; baseline behaviors are executable local contracts; no real external mutation is possible from selected tests. An unrelated baseline blocker is reproduced and addressed separately, not hidden.

## Task 2 — Define access and route/token registries first

**Files:** new shared content/publication/context modules; new `server/bayside-southeast-publication.test.ts`; new `server/bayside-southeast-context.test.ts`; central `client/src/lib/customerWebsiteHost.ts` reused.

**RED:** assert the exact five paths and review index; 15 enumerated tokens; no new locality/service paths; preview false/publication false defaults. Cover both customer hosts, case/trailing-dot equivalents, non-customer hosts, preview off/on and publication off/on. Customer requests for the index always return not-found. Registered data or a query token alone never grants access.

**GREEN:** implement pure typed access and context maps. Separate candidate content access from the preview mutation guard: even a baseline-looking page on a non-customer candidate-preview artifact must not accept a lead. Do not use regional/Southside flags as aliases for candidate access.

**Draft access:** candidate fields may resume only when the current host/flags allow this candidate and its stored `landingRoute` belongs to the five-route map. Treat browser draft data as untrusted; normalize malformed fields. Denied or stale candidate context is omitted from the active baseline payload and UI, without erasing ordinary customer contact/address/scope fields. Keep the draft's stored values separate from the active permitted view if needed to avoid destructive normalization.

**Check:** `pnpm exec vitest run server/bayside-southeast-publication.test.ts server/bayside-southeast-context.test.ts server/homepage-funnel-consolidation.test.ts`.

**Done:** pure-policy tests cover the complete spec access table and cannot enable earlier clusters.

## Task 3 — Block preview mutations before any side effect

**Files:** `client/public/_worker.js`; `client/src/lib/formFallback.ts`; wizard and other reachable mutation callers; new small shared terminal-error contract; new `server/bayside-southeast-worker.test.ts`, `server/bayside-southeast-preview-refusal.test.ts`; generated candidate flag module from Task 9, initially represented by test fixtures; existing Worker fixture copies in `server/regional-slab-preview.test.ts`, `server/gold-coast-preview.test.ts`, `server/southside-edge-gates.test.ts`.

**RED:** create isolated Worker fixture imports with candidate preview on, unrelated flags off. Stub global `fetch` to fail on unexpected calls and spy on D1 `prepare`, R2 `put`, rate-limit/cache writes and `waitUntil`. Use structurally valid local request bodies, not malformed mobiles that would be rejected before the missing guard.

Cover the real Worker route inventory:

- `/api/quote-submit`: legacy direct and structured version-1 payloads;
- `/api/trpc/quote.submit` and batched/encoded tRPC variants;
- `/api/callback-submit`, `/api/trpc/callback.submit`;
- `/api/upload-photo` with local valid photo-shaped mock data;
- `/api/trpc/quote.sendBookingLink` and any other discovered booking creation/send route;
- `/api/guide-submit`, `/api/trpc/guide.submit`;
- `/api/other-trade-submit`, reachable partner/referral mutations and mutation fallthrough paths;
- supported aliases, encoded/trailing-slash forms and mixed tRPC batches that might evade an exact-path check.

**GREEN:** add an early candidate-preview/non-customer boundary, before body parsing, rate-limit persistence, external fetch and ASSETS mutation fallthrough. In this isolated artifact, deny `/api/` mutation requests by default, including unknown/batched mutation paths, rather than maintain only an easy-to-miss endpoint list. Keep safe GET/HEAD reads and OPTIONS behavior; known side-effect entry points called with a wrong method still must not reach a provider. Preserve signed-photo read authorization. Preview page callbacks/uploads/bookings show an honest unavailable-in-preview state rather than false success.

Return HTTP 403 and JSON `{ success: false, code: "PREVIEW_SUBMISSION_DISABLED" }`; tRPC clients must observe a failure, not a result envelope claiming success. UI/fallback tests must prove a rejected tRPC request cannot trigger a successful direct fallback or conversion. Add noindex/security headers through the final response wrapper.

**Terminal client refusal:** make `PREVIEW_SUBMISSION_DISABLED` an explicit typed terminal failure understood by REST and individual/batched tRPC error adapters. Recognise it before the wizard's generic fallback branch and before fallback helpers' mailto/error handling. For an active preview, reject in the client before any POST as well; the Worker remains the independent boundary against direct calls. If a mocked response or transport error reaches a client anyway, preview mode never treats an unrecognised 403/network failure as authority to open an email draft or retry through another endpoint.

On refusal, show only the unavailable-in-preview message. Do not call `submitFormFallback`, POST again, open `mailto:`, change location, clear the draft, display success or fire confirmed funnel/conversion events. Apply the same terminal handling to reachable callback/guide/photo/booking callers; ordinary non-preview fallback behavior must remain unchanged. For a direct fallback invoked in a local test, its first mocked 403 may be observed but no second fetch, mailto draft or generic catch recovery is allowed. Add tests for valid single and batch tRPC 403s, REST 403s, preview network failure and baseline genuine-delivery failures, with zero secondary fetch/navigation/success/conversion spies.

Test missing/false/malformed `LEAD_PREVIEW_DRY_RUN`, a production-looking binding in mocked env, publication off, customer-host artifact fallback and ordinary baseline Worker behavior. The guard is on only for the preview artifact/non-customer condition; it must not globally disable customer submissions.

**Check:** focused Worker suite plus `other-trade-worker`, `pages-worker-booking`, quote fallback and photo access/security mock regressions selected by the safe runner. No live endpoint POST.

**Done:** zero D1 preparations, zero R2 writes, zero provider fetches and zero quote-success signals for every preview mutation path.

## Task 4 — Write five useful typed records, not five rewritten templates

**Files:** `shared/baysideSoutheastLocalJobsContent.ts`; existing `shared/southsideLocalityContent.ts` read/composed but not broadly published; new `server/bayside-southeast-content.test.ts`.

**RED:** exact route set; unique title/description/H1; required practical sections; matching FAQs/schema inputs; allowed existing services; three to five genuine nearby links; no unpublished candidate link; no unaudited proof/price/licence/insurance/guarantee/project claim; test corpus rules and all ten similarity pairs.

**GREEN:** implement distinct content:

- Wynnum: removal/replacement, connected outdoor spaces, drainage and access checks;
- Manly: surface interfaces, intended use and finish/maintenance preferences;
- Cannon Hill: existing-structure interfaces, services, demolition and concrete package definition;
- Mount Gravatt: actual grades, transitions, access and retaining interfaces where relevant;
- Mansfield: multiple work areas, preparation responsibilities and construction sequencing.

Compose suitable reviewed Wynnum/Cannon Hill sections from their source owner; add typed candidate-specific sections without independent editable copies. Avoid carrying unsafe legacy page widgets/schema into a candidate renderer. No photos or proof blocks are required.

For nearby/service links, verify static publication status first and meaning/canonical in passive HTTP reads before preview release. Exact final links are recorded in the verification output. Existing customer page content is not permission to assert an individual property's soils, terrain or approval status.

**Similarity algorithm:** NFKC/lowercase, punctuation-to-space, whitespace collapse, removal of candidate and approved nearby names; corpus includes introduction/practical sections/FAQ answers only; set Jaccard over five-word shingles below 0.45 for all ten pairs; no identical normalized paragraph of at least 30 words. Record versioned normalization/corpus and pair scores. Manual useful-content review remains mandatory.

**Check:** `pnpm exec vitest run server/bayside-southeast-content.test.ts server/southside-locality-content.test.ts server/batch-one-locality-content.test.ts`.

**Done:** distinct, truthful, source-owned content and no added locality URLs. Existing publication records are not accidentally modified.

## Task 5 — Implement one-time raw and hydrated handoff safely

**Files:** shared context policy; new `client/src/lib/baysideSoutheastQuoteHandoff.ts`; `client/src/lib/quoteDraft.ts`; `client/src/main.tsx`; narrowly scoped early bootstrap and Google/Meta/Umami loading gates in `client/index.html`; `client/src/hooks/useLeadSource.ts` and location-derived tracking helpers; new `server/bayside-southeast-handoff.test.ts`, `server/bayside-southeast-context-bootstrap.test.ts`.

**RED:** each of the 15 tokens; generic preserves existing audience; explicit audience selection works and is editable; no automatic slab/structural service; fill blank suburb only; conflict produces a choice; all contact/address/postcode/services/measurements/descriptions retained; stale consent cleared only by eligibility rules. Zero fetch/upload/conversion calls. Storage throw/corruption/expiry and unavailable storage keep the wizard usable.

**Early bootstrap contract:** before tracking scripts, remove every `context` parameter from `/get-quote` with `history.replaceState`, preserving legitimate campaign parameters and fragment. Store only one syntactically bounded raw token in a page-local in-memory slot; missing, duplicate, malformed/oversized values become no pending token. It is not an access grant or a persisted consent. Resolve it once through the shared exact allowlist and host/flags before applying a draft. Avoid duplicating the full 15-token authority map in inline script.

Test execution of the inline bootstrap in an isolated mocked browser/VM before a tracking spy reads `location.href`; no token may remain in the first tracked location. Set a page-local cleanup gate before any tracker can initialize. After successful `replaceState`, verify the actual browser URL contains no `context` parameter before opening the gate. A thrown call, unchanged URL or verification failure leaves the gate closed for that document.

**Cleanup-failure behavior:** suppress all Google tag initialization/config/event queues and external loading, Meta initialization/load callbacks, and Umami loading for the affected document. Replace unconditional script loading with the narrowly scoped gate; supplying a sanitized location to React alone does not protect independently loaded trackers. Location-derived tracking helpers must also respect the closed gate and must not queue a later unsafe retry. Do not auto-reload or hard-navigate and lose the in-memory handoff. Keep the quote usable and campaign parameters in the real URL unchanged, but accept that this rare document has no analytics rather than leak the token. On a normal no-context document or successful cleanup, preserve baseline tracking and conversion behavior.

Make `useLeadSource` and `getLeadSourceData` obey the same gate **before** reading/capturing/writing URL-derived attribution. While closed, return an in-memory neutral source with no query-bearing `landingPage`/referrer and perform no new attribution session-storage write; do not reuse an unvalidated stored landing URL containing context. Extracted campaign parameters may remain in transient handoff memory but are not persisted or sent by trackers on this failed-cleanup page. Sanitize resumed attribution records and any location-bearing draft fields so context never enters a later payload.

For JavaScript-disabled raw handoffs, omit the existing Meta noscript tracking pixel from context-bearing quote responses at the Worker shell boundary; a script gate cannot protect a noscript resource. It does not change no-context customer tracking. Test this branch as well.

Force history failure and no-op replacement in VM/browser tests, dispatch the window `load` callback, and prove zero Google/Meta/Umami tracker loads/events, zero attribution writes and no captured landing URL with context. Test successful cleanup and ordinary no-context documents separately, preserving campaign parameters, fragment and normal tracking. Keep the gate/conditional loaders compatible with existing CSP; do not rewrite conversion labels or Ads goals.

**Hydrated CTA:** expose the same allowlisted token URL in the anchor for no-JS use, but intercept an ordinary SPA click to resolve the token before navigation. Carry allowed context in memory and navigate to the clean quote URL, preserving campaign parameters; never place `context` into an already-tracked document's location and expect the initial bootstrap to rerun. Prefer SPA navigation/in-memory draft merge so blocked localStorage does not lose the selected locality/audience. No full-page navigation dependency that silently discards the in-memory fallback. New-tab/unintercepted clicks follow the raw early-bootstrap path. Tests compare raw and SPA outcomes, including zero token-bearing tracked locations in either path.

**Conflict UI:** announce the original/new locality clearly, with explicit keep/switch actions and keyboard focus. Update only the selected suburb after a user choice; final submitted address remains the customer's confirmed project location. Keep `landingRoute` as origin attribution, not the job suburb.

**Check:** new handoff/bootstrap suites plus existing `quote-draft`, `quote-funnel-analytics`, `regional-quote-handoff` and `gold-coast-quote-handoff` regressions.

**Done:** raw pre-hydration clicks and SPA clicks converge safely, campaign parameters remain intact and context is absent from tracked URLs.

## Task 6 — Gate the inherited audience UI and payload

**Files:** `ComprehensiveQuoteWizard.tsx`; `GetQuote.tsx` only if entry wiring is needed; `shared/quoteAudiencePolicy.ts`; `shared/quoteBrief.ts` only for minimal parity adjustments; new `server/bayside-southeast-wizard.test.ts`; existing regional/shared quote tests.

**RED:** executable UI tests for baseline/default-off, permitted homeowner, structural homeowner, structural builder, non-structural builder and complete-extension paths. Do not rely solely on finding strings in the component source.

Use a minimal DOM-capable test environment if needed (e.g. a compatible dev-only `jsdom`, scoped to this test file); verify package compatibility before installation and keep the default test environment Node. Mock tRPC, uploads, tracking and storage; exercise rendered controls with React's test utilities. Do not launch a connected Express server to test forms.

**GREEN:** obtain effective candidate access from validated handoff/draft policy. For baseline access, match the captured customer UI/defaults/payload and omit candidate `projectContext`. New candidate audience/defaults are not mandatory for legacy callers. Preserve existing regional-preview behaviors when deliberately using their own build; the new isolated artifact keeps those flags off.

For candidate access:

- Keep five steps and unchanged core contact/service/measurement/photo/consent workflow.
- Default structural type to `other_concrete`; document-readiness controls render only for the four structural types.
- Builder company/address/scope/programme fields are visible and validated for both structural and non-structural builders. Use current bounds: company maximum 150, useful concrete scope minimum 10/maximum 1,500, programme minimum 2/maximum 1,500 characters; truthful “planning/not yet fixed” satisfies timing without an invented date.
- Unknown/not-available document readiness may progress. No silent service conversion to slab.
- Complete extension requires selected `slab`. Partner interest remains optional/unchecked, resets when ineligible and cannot forward data. Do not render a link to unavailable `/need-another-trade` in this artifact.
- Post-transition focus reaches the incoming H2. Errors have live/focus semantics and required hidden fields cannot trap either audience.

Share payload-building logic where possible, with identical tRPC/direct fallback output. Test version-1 no-context legacy input, valid candidate builder/homeowner input, rejected stale partner interest, D1 acceptance failure and confirmed exactly-once success using mocks. Preview mode never displays customer-confirmed success.

**Check:** new wizard suite plus `regional-quote-context`, `comprehensive-quote`, `quote-funnel-integration`, `quote-conversion-dedup`, `quote-success-experience`, `quote-release-guard` and relevant baseline tests.

**Done:** candidate conditional UI works, baseline callers still work and Google Ads events occur only at the unchanged confirmed success boundary.

## Task 7 — Render candidate pages and the review index

**Files:** new page component/index; `client/src/pages/SuburbPage.tsx`; `client/src/App.tsx`; shared schema/presenter helpers; new `server/bayside-southeast-render.test.ts`.

**RED:** candidate access takes precedence for the five slugs only; baseline rendering stays unchanged when access denied; one H1/main; full service range; audience actions exposed semantically; real links; no unsupported proof widgets; review index unavailable on customer hosts.

**GREEN:** add a narrow early candidate branch in `SuburbPage` and a gated review route before wildcard fallback. Use typed content to build visible sections and schema. Reuse navigation/style primitives, not the entire unsafe legacy/locality template. Two audience links/actions are choices, not submissions; generic primary CTA shares the same token map. Retain phone/SMS as secondary controls without changing labels/goals.

Verify permitted adjacent links in raw and hydrated versions. No customer homepage/service-directory link to a preview review route. Do not alter hero, global portal destination or unrelated suburb content.

**Check:** new render/publication/content suites plus homepage and existing locality regressions; server-rendered markup assertions are paired with Task 10 browser interaction checks.

**Done:** five focused candidate pages and index, no unintended cluster navigation or content.

## Task 8 — Add raw SEO and canonical handling in the Worker

**Files:** `_worker.js`; generated candidate edge module; shared content/schema helpers; `server/bayside-southeast-worker.test.ts`; renderer parity tests.

**RED:** raw meaningful content/H1 before JS for all five routes; expected canonical/meta; matching BreadcrumbList/Service/visible FAQ schema; escaped hostile content; app scripts retained; no duplicate schema/H1 after hydration; route variants, malformed slugs and errors; noindex/security on HTML, redirects, assets, sitemap and API failures.

**GREEN:** resolve the same access decision as SPA before older locality gate/404 logic. Candidate allowed paths must not be rejected because unrelated Southside preview is off. On denied customer access, keep baseline raw content/metadata rather than injecting candidate copy. Preserve customer indexing behavior and existing sitemap bytes during preview.

Use canonical normalization compatible with existing rules for slash/case variants and do not treat arbitrary unknown paths as valid. No redirect to a different new locality. Add real 404s for unknown/nested review/locality paths in the candidate Worker. If today's untouched production has a pre-existing generic SPA fallback, record it honestly in baseline checks instead of claiming it has been repaired by a preview.

Do not manually add five competing records to `seo-manifest.js`; candidate metadata priority comes from the typed-generated registry. Escape text/attributes and JSON `<` safely. No unaudited ratings/licence schema may survive inside the candidate response from the baseline shell.

**Check:** new Worker/render tests; existing southside/gold-coast/regional tests with their original flags; `node --check client/public/_worker.js` and final bundled check after Task 9.

**Done:** raw/hydrated SEO agrees; customer metadata, sitemap and delivery remain isolated.

## Task 9 — Build only the five-page preview and restore all sources

**Files:** new `scripts/generateBaysideSoutheastData.ts`, `scripts/buildBaysideSoutheastPreview.ts`; new `client/src/generated/baysideSoutheastConfig.ts`, `client/public/bayside-southeast-content.js`; `package.json`; new `server/bayside-southeast-build.test.ts`.

**RED:** deterministic generator; client/edge parity; false/false checked-in flags; ordinary build no candidate access; preview enables only this feature; old regional/Gold Coast/other-trade build commands not invoked. Build success, failure, child process error and restoration-error cases tested with injected process runner.

**GREEN:** add planned commands:

- `bayside-southeast:generate`: `tsx scripts/generateBaysideSoutheastData.ts`;
- `build:bayside-southeast-preview`: `tsx scripts/buildBaysideSoutheastPreview.ts`;
- `test:safe`: safe runner from Task 1.

Add generator to ordinary guarded `build`, with env flags `VITE_BAYSIDE_SOUTHEAST_PREVIEW` and `VITE_BAYSIDE_SOUTHEAST_PUBLISHED` default false. Explicit preview wrapper env forces all unrelated unpublished feature flags off and candidate publication off, candidate preview on. Preserve already-public Batch 1 content/publication values from the approved baseline; do not “turn off everything” indiscriminately.

Snapshot all generator-managed checked-in outputs before building and restore them in `finally`, including failure; independently assert default flag states. Restoration must attempt every output even if one restore fails and report a combined failure with nonzero exit. Do not overwrite `dist/public` with a default build during restoration. Build output remains the preview artifact, checked-in files remain default-off.

Reuse `scripts/bundlePagesWorker.ts` for self-contained `_worker.js`. Store build provenance (commit, feature flags, Worker hash, file count/size) outside public assets. Reject any worker artifact with unresolved imports or secret/config values.

**Done:** preview artifact contains only the five candidate upgrades, source restored clean; normal build preserves baseline and guarded quote contracts.

## Task 10 — Full gate and local no-submit browser QA

1. Run `pnpm test:safe`, `pnpm check`, `pnpm quote:verify:source`, normal `pnpm build`, `pnpm quote:verify:build`, `node --check dist/public/_worker.js`, and baseline artifact contracts.
2. Run `pnpm build:bayside-southeast-preview`; rerun built quote/Worker contracts and fingerprint artifact; check source flags restored and `git diff --check` clean.
3. The safe deterministic gate must include every new suite, not just the focused candidate tests. Record actual totals, duration and exclusions.
4. Start Vite's **static preview**, not the connected Express backend, bound to `0.0.0.0` on an available temporary port. Static Vite does not execute Pages Worker: use the local Worker harness for HTTP/security/guard assertions and Cloudflare for final real-edge checks. Do not claim static-local QA validates edge delivery.
5. Use a browser at 390×844 and desktop (e.g. 1440×900). Inspect all five pages and index: meaningful content, no overflow, correct headings, accessible links/actions and no first-party runtime errors. Distinguish blocked third-party/cookie diagnostics from code defects.
6. Before interaction, install a browser request recorder and deny lead/upload/booking mutation requests as an extra QA safeguard. Walk each raw/no-JS handoff outcome, representative hydrated homeowner and builder paths, non-structural builder and complete-extension consent default/reset. Do not press submit or upload.
7. Check post-animation H2 focus, error announcement, locality-conflict keep/switch and storage-disabled path. Leave browser-only synthetic diagnostics in memory/draft, not on a server; clear them afterward.
8. Confirm zero lead/callback/upload/booking/Jotform requests and zero primary quote conversions. A network failure or intercepted POST is a QA failure, not evidence that nothing was attempted.
9. Verify selected candidate links against meaningful published destinations. Prefer bounded passive HTTP script for uniform link checks; no independent research fan-out is required for mechanically checking known URLs.
10. Secret/placeholder scan, changed-files scope review and customer-default artifact comparison. Stop temporary local service when finished.

**Done:** current test/build/browser evidence meets all 18 spec acceptance items. Historical preview tests are context, not this release's proof.

## Task 11 — Independent review, source save and release preflight

- Have one read-only reviewer inspect the diff and current evidence for host/default-off leakage, preview mutation bypass, inherited quote UI/payload differences, context cleanup-before-tracking, builder hidden-field traps, draft loss, truth/schema duplication, canonical handling and conversion leakage.
- Fix blockers test-first and repeat focused/full gates. Review high-risk final fixes without restarting unrelated research.
- Commit focused implementation changes to the existing authorised feature branch using Conventional Commits. Push only this branch; verify clean tracking and source flags false/false. No merge to `main` or production publish.
- Fresh Cloudflare readback: verify customer canonical/aliases, source identity and dedicated new preview branch availability (`bayside-southeast-review` proposed). Confirm baseline has not moved unexpectedly; recompare if it has.
- Verify current preview D1/R2/dry-run settings against the approved expected identifiers. A mismatch is a permission/configuration stop, not authority to edit resources.
- Rebuild explicit preview artifact from the committed source and verify commit/flags/self-contained Worker/hash/file manifest. Reject ordinary/default build or stale artifact. No external live credential test; obtain release credential only through the established guarded upload flow when release actually proceeds.

**Done:** evidence and artifact correspond to one reviewed commit, exact preview-only target and verified isolated settings.

## Task 12 — Preview-only Cloudflare upload, validation and handoff

**Execution boundary:** only perform after implementation is authorised and all gates pass. This planning turn uploads nothing.

1. Deploy `dist/public` to the new dedicated preview branch using the established self-contained direct-upload/manifest method. Never `main`, a customer alias or an existing review branch. Use fresh short-lived credential material, do not reuse historical envelopes/tokens and destroy temporary keys/tokens/payloads after upload.
2. Read deployment result and stages, exact `environment=preview`, source commit and permanent/immutable URL. Do not guess the branch alias: Cloudflare may normalize/truncate it. Re-read binding identifiers and customer canonical deployment.
3. Passive real-edge matrix: index + five candidates + GET quote page + linked content + canonical redirects + malformed/unknown routes + sitemap/assets/errors. Assert raw content/schema/noindex/security and blocked-preview UI. Do not POST to prove delivery guards; those are covered locally.
4. Browser no-submit replay on preview for homeowner/non-structural builder/extension eligibility, focus and conflict; record no mutation or conversion request and clear local draft.
5. Read-only preview storage aggregate checks may compare counts with preflight if available; shared store need not be empty. Never display records or delete data. A query failure is an explicit limitation, not a reason to migrate/create a table.
6. Re-read customer canonical deployment/source/aliases and passively verify baseline homepage, quote, five existing locality paths, sitemap and Partner Portal redirect. Publication flag still off; no candidate markers/noindex leak into indexable customer pages.
7. At least fifteen minutes of finite, passive checks for deployment stability can run as a current-task job with progress and a fixed endpoint matrix. This is not a recurring automation. If used, wait for the finite result before handing off; do not launch a schedule. No claims about new live inbox delivery or Ads status without separate evidence.
8. Write `/home/ubuntu/ccg-bayside-southeast-preview-verification-2026-10-10.md` (use execution date if different), include exact preview URL/deployment/commit, names/IDs only, QA matrix, source restoration, unchanged customer identity, safe test exclusions, limitations and production gate. Verify and deliver it with the preview URL.
9. Stop for director visual review. **No customer production/indexing or Gold Coast publication is performed.**

**Preview rollback:** if defective, stop promoting/updating this branch; redeploy its previous verified preview commit if one exists, or report/disable the preview only within authorised reversible scope. Never roll back customer production in response to a preview defect. Customer canonical captured for isolation is not an instruction to mutate it.

## 4. Test commands and exact external exclusions

### Focused new acceptance suites (created during implementation)

```bash
pnpm exec vitest run \
  server/bayside-southeast-baseline.test.ts \
  server/bayside-southeast-publication.test.ts \
  server/bayside-southeast-context.test.ts \
  server/bayside-southeast-worker.test.ts \
  server/bayside-southeast-preview-refusal.test.ts \
  server/bayside-southeast-content.test.ts \
  server/bayside-southeast-handoff.test.ts \
  server/bayside-southeast-context-bootstrap.test.ts \
  server/bayside-southeast-wizard.test.ts \
  server/bayside-southeast-render.test.ts \
  server/bayside-southeast-build.test.ts
```

These commands are planned, not commands already run. Existing regression tests are selected through the safe full gate.

| Excluded existing file | Reason |
|---|---|
| `server/anthropic.test.ts` | Real external/billable AI integration |
| `server/bfl.test.ts` | Real external/billable image integration |
| `server/cloudflare-deploy-credential.live.test.ts` | Live deployment credential flow; not a unit test |
| `server/googleAds.test.ts` | Real Windsor/Google Ads connector request and secrets |
| `server/live-quote-route-guard.test.ts` | Live website integration, intentionally not part of local gate |
| `server/photo-upload-r2.test.ts` | Live R2/photo integration; no live upload authorised |
| `server/resend.test.ts` | Live email integration; no email send authorised |

Excluding these does not mean their integrations are verified. Maintain local/mock photo, quote, callback, D1 failure, booking and conversion tests. Test files mentioning an API name are **not** automatically excluded: inspect whether `fetch`/provider modules are mocked, and include deterministic coverage (e.g. `pages-worker-booking.test.ts`). Conversely, any newly discovered actual external side effect must be excluded with its exact path and reason recorded before execution.

### Final build sequence (future execution)

```bash
pnpm test:safe
pnpm check
pnpm quote:verify:source
pnpm build
pnpm quote:verify:build
node --check dist/public/_worker.js
# Verify default artifact flags/access and capture baseline evidence here.
pnpm build:bayside-southeast-preview
pnpm quote:verify:build
node --check dist/public/_worker.js
# Verify preview flags, isolated routes, source restoration and Worker fingerprint here.
git diff --check
```

Do not run `pnpm db:push`, `pnpm quote:cloudflare`, a live route test, an unrelated preview wrapper or a production publication command as part of a test shortcut. Managed/local preview is a review environment, not the customer site.

## 5. Evidence to retain

| Evidence | Minimum retained result |
|---|---|
| Baseline | Fresh deployed customer commit/ID/aliases; read-only route/sitemap behavior; inherited-diff classification |
| TDD | Meaningful failing scenario then passing focused result for every task |
| Full gate | Actual suites/tests, TypeScript, both builds, guards, Worker syntax, exclusions |
| Content | Five records, all ten pairwise similarity scores, truthful-copy review, final working link list |
| UI | Mobile/desktop render matrix, homeowner/builder paths, conflict/storage cases, focus/consent checks |
| Mutation isolation | Local request matrix and zero D1/R2/outbound/conversion spies; live QA zero attempted submits |
| Build | Committed source hash; artifact flags/hash/size; clean source defaults; unrelated previews off |
| Cloudflare | Exact new preview ID/commit/environment/URL; bindings names/IDs and dry-run presence verified |
| Production isolation | Same customer identity/aliases and baseline content/sitemap; no candidate leak |
| Limits | No live email/Jotform/Ads/lead test; no indexing/rank/volume guarantee; remaining unrelated issues separated |

No customer details or credentials belong in retained reports/screenshots. Planning verification is complete only when this document is checked, saved and delivered; feature verification is future work.

## 6. Stop conditions and next decision

Stop execution and report when the deployed source cannot be resolved, baseline differs unexpectedly, required access is denied, preview bindings/dry-run mismatch, unrelated candidate becomes available, a test can contact a real service, a preview mutation reaches a spy, a real mutation is attempted during QA, default source restoration fails, or any quote/delivery/conversion/customer-indexing guard fails. Do not repair external configuration, delete customer/synthetic records, migrate a database or release customer code without the appropriate authority.

The next step after the director authorises building is **Tasks 1–10: implement and verify locally**, followed by reviewed **preview-only** release Tasks 11–12. Separate explicit customer approval is required for publication of the exact five pages and conditional quote enhancements, sitemap date/indexing work and any future Gold Coast stage. No production or Ads approval is implied by accepting this plan.
