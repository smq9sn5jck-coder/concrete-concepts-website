# Concrete Concepts Estimator Alignment Implementation Plan

**Date:** 20 September 2026
**Branch:** `feat/ccg-estimator-alignment`
**Design:** `concrete-concepts-internal/docs/superpowers/specs/2026-09-20-ccg-estimator-alignment-design.md`

## Goal

Replace the competing Zapier, browser, and PDF calculations with one deterministic, versioned pricing core. The initial release remains draft-only and supports automatic pricing only for Plain Concrete — Broom Finish and the four named exposed aggregate mixes. Coloured/oxide, stencilled/stamped, honed/ground, generic exposed, and missing-scope requests route to owner review or measure-first.

## Non-negotiable acceptance rules

- Use actual finish names; never emit CLASSIC, SIGNATURE, PRESTIGE, Standard, Premium, or Good/Better/Best as packages.
- Show the requested finish first and no more than two fully costed, technically suitable alternatives.
- Calculate low, expected, and high as separate full scopes; never apply a percentage band around one midpoint.
- Recalculate the displayed rounded margin and require 18–26% inclusive.
- Use one rate-card version and one calculation version across core, API, website, documents, and Zapier.
- Use Gold `#C9A44D`, Navy `#0F2A44`, the first supplied CCG logo, and `info@concreteconceptsgroup.com` for quote emails.
- Do not expose internal costs, supplier rates, labour markup, margin, gross profit, crew-day profit, commission, or Method 1/2 in customer output.
- Fail closed. No language-model, stale website-table, or generic-PDF fallback may produce a customer price.
- Keep all results as owner-review drafts until three varied test leads pass without correction.

## Task 1 — Establish the frozen contract and failing tests

**Add:**

- `shared/estimator/types.ts`
- `shared/estimator/finishCatalog.ts`
- `shared/estimator/brand.ts`
- `server/fixtures/estimator/plain-110m2-driveway.json`
- `server/estimator-core.test.ts`
- `server/estimator-parity.test.ts`
- `server/quote-customer-golden.test.ts`

**Test first:**

1. Assert the exact canonical finish IDs and labels.
2. Reject retired package labels and generic `exposed` as a priceable finish.
3. Freeze the 110 m² plain-driveway anchor: raw low/high $21,967/$29,436 inc GST and displayed $22,000–$29,500.
4. Assert independently costed scenario inputs and outputs.
5. Assert displayed margin boundaries at 18% and 26%, plus fail-closed behaviour outside the band.
6. Assert decorative finish review holds and missing-measurement measure-first routing.
7. Assert customer-safe outputs use the approved identity and exclude internal financial fields.

**Red command:** `pnpm vitest run server/estimator-core.test.ts server/estimator-parity.test.ts server/quote-customer-golden.test.ts`

## Task 2 — Build the pure versioned pricing core

**Add:**

- `shared/estimator/rateCard.ts`
- `shared/estimator/calculateEstimate.ts`
- `shared/estimator/customerView.ts`
- `shared/estimator/preSendValidation.ts`

**Implementation:**

1. Port the verified Python rate card and arithmetic into integer-cent TypeScript.
2. Preserve volume rounding, load fees, handling, supplier extras, crew rules, labour and excavation markups, Method 1/2 comparison, GST, job minimums, and payment rules.
3. Inject the rate card rather than importing mutable state.
4. Calculate every scenario independently and return structured cost lines, methods, margin, profit, payment schedule, assumptions, and flags.
5. Revalidate the final displayed rounded amount. Step upward only when needed to satisfy the 18% floor; route above-26% results to owner review.
6. Keep oxide, stencil, honed, retaining-wall legacy calculations, and incomplete scopes out of automatic customer pricing.
7. Produce a redacted `CustomerEstimateView` with only canonical names, GST-inclusive ranges, inclusions, evidence-bound assumptions, versions, and routing.

**Green command:** `pnpm vitest run server/estimator-core.test.ts server/estimator-parity.test.ts server/quote-customer-golden.test.ts`

## Task 3 — Add the protected Cloudflare Worker pricing endpoint

**Add:**

- `shared/estimator/zapierContract.ts`
- `shared/estimator/http.ts`
- `server/pricing/workerEntry.ts`
- `scripts/buildPricingWorkerModule.ts`
- `scripts/pricingReleaseGuard.ts`
- `cloudflare/d1/0001_pricing_api.sql`
- `server/estimator-api.test.ts`
- `server/zapier-estimator-contract.test.ts`
- `server/pricing-release-guard.test.ts`

**Modify:**

- `client/public/_worker.js`
- `package.json`
- `docs/CLOUDFLARE_RELEASE.md`

**Test first:**

1. Require `POST /api/v1/pricing/estimate`, Bearer authentication, 16–128 character `Idempotency-Key`, JSON, and a 64 KiB maximum body.
2. Return stable no-store JSON error envelopes for 400, 401, 405, 409, 422, 429, 500, and 503.
3. Fail closed when the token or D1 binding is absent.
4. Test same-key/same-body replay, same-key/different-body conflict, in-progress conflict, durable rate limits, and append-only audit records with fake D1 bindings.
5. Verify secrets, contact data, raw notes, and raw keys are absent from logs and stored key fields.
6. Verify the Worker bundle is generated from the same TypeScript core and is present in `dist/public` before release.

**Implementation:**

- Add the Worker route before generic asset fallback.
- Bundle the Worker entry after Vite build; do not duplicate rates in `_worker.js`.
- Use `PRICING_API_TOKEN_CURRENT`, optional `PRICING_API_TOKEN_PREVIOUS`, and `PRICING_API_DB` bindings.
- Return internal review data only to the authenticated route. A later public adapter receives only `CustomerEstimateView`.

## Task 4 — Remove stale public calculations and preserve conversion paths

**Modify:**

- `client/src/pages/CostCalculator.tsx`
- `client/src/components/quote/ComprehensiveQuoteWizard.tsx`
- `client/src/lib/quoteDraft.ts`
- `shared/quoteBrief.ts`
- `client/src/pages/FinishesVisualizer.tsx`
- `client/src/pages/ServicePage.tsx`
- `client/src/pages/SuburbPage.tsx`
- `client/src/data/newSuburbs.ts`
- `client/src/data/moreSuburbs.ts`
- `client/src/components/FAQSection.tsx`
- `client/src/pages/FAQPage.tsx`
- `server/seoPrerender.ts`
- `client/src/hooks/useABTest.ts`

**Test first:**

1. Preserve `/calculator`, all affected service/area/FAQ/finish routes, self-canonicals, indexability, sitemap inclusion, tracking, and the `/get-quote` conversion path.
2. Prohibit local price arrays, `AggregateOffer` numeric construction prices, stale rate tables, and percentage access uplift.
3. Require the canonical finish catalogue in calculator, wizard, and visualiser.
4. Preserve legacy lead records only through explicit boundary normalization; never display a legacy finish label as a priced option.
5. Prohibit public indexed construction price claims until generated from the verified core.

**Implementation:**

- Turn `/calculator` into a project-planning and detailed-ballpark handoff while the customer-safe public endpoint remains deferred.
- Save service, area, finish, and site facts to the quote draft and open `/get-quote`.
- Remove fixed public construction prices while keeping useful project factors, preparation guidance, local content, and strong calls to action.

## Task 5 — Block legacy price PDFs and align quote identity

**Add:**

- `client/public/ccg-logo-gold.png` copied unchanged from the approved internal asset
- `server/estimateBrand.ts`
- `server/estimateDocument.ts`
- `server/estimate-document.test.ts`
- `server/quotePdfEmail.test.ts`

**Modify:**

- `server/quotePdf.ts`
- `server/quotePdfEmail.ts`
- `server/email.ts`
- `server/routers.ts`
- `functions/api/quote-submit.js`
- `functions/api/trpc/[[path]].js`
- `scripts/quoteReleaseGuard.ts`

**Test first:**

1. A website enquiry without a validated pricing snapshot cannot create or send a price PDF.
2. A legacy stored PDF cannot pass the customer-send gate.
3. Customer documents render only from `CustomerEstimateView` with fixed reference/date inputs.
4. Require the approved logo, Gold/Navy, Concrete Concepts customer name, legal entity footer, and quote sender.
5. Reject internal financial language, retired tiers, unsupported photo claims, and noncanonical finish labels.

**Implementation:**

- Retire `FINISH_PRICING`, `SERVICE_FINISH_MAP`, and `SERVICE_TYPICAL_SIZE` from customer estimate generation.
- Keep the custom formal-quote path separate and owner-controlled; it cannot masquerade as an automatic ballpark.
- Save customer estimates as drafts only. Record draft, approval, and send as separate audit events.

## Task 6 — Update the Zapier estimator definition

**Update saved Zapier skill:** `CCG AI Quote Estimator`

1. Remove all independent rate tables and arithmetic.
2. Remove CLASSIC, SIGNATURE, PRESTIGE, Standard, Premium, and all tier language.
3. Normalize the lead into `PricingEstimateRequestV1`.
4. Call `POST /api/v1/pricing/estimate` with the dedicated bearer token and immutable submission ID as `Idempotency-Key`.
5. Stop on transport, authentication, validation, guardrail, tracker, or email failures. Never fall back to model pricing.
6. Present requested finish first and up to two fully priced alternatives from the response.
7. Use the approved brand, logo, quote sender, and actual CCG photos.
8. Save as owner-review draft only. Do not send during the initial rollout.
9. Log rate-card version, calculation version, request ID, routing, and reason codes without logging secrets or internal costs to customer-visible fields.

**Validation:** use a plain automatic fixture, an exposed named-mix fixture, and an oxide review fixture. Confirm the customer draft equals `CustomerEstimateView` and contains no old tier names.

## Task 7 — Full verification and release preparation

Run:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm quote:verify:source
pnpm quote:verify:build
node --check dist/public/_worker.js
```

Then verify:

- git diff has no unrelated changes;
- no source or built output contains retired tier labels in customer estimate code;
- no source or built output contains the old calculator/PDF rate tables;
- no customer template uses legacy quote colours or a non-approved sender;
- the approved logo checksum is unchanged;
- the Worker endpoint passes local contract tests;
- Zapier remains draft-only;
- no pricing or customer send is deployed without the required Cloudflare bindings and secret.

Commit in small Conventional Commit units, push the branch, and open a pull request containing implementation summary, test evidence, operational prerequisites, rollback steps, and the three-lead owner-review rollout gate.
