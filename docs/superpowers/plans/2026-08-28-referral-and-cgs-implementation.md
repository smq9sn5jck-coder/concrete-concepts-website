# Referral Program and CGS Implementation Plan

**Design source:** `docs/superpowers/specs/2026-08-28-referral-and-cgs-growth-system-design.md`  
**Delivery inbox:** `info@concreteconceptsgroup.com`  
**Engineering method:** Red–Green–Refactor

## Milestone 1: Establish Test and Shared Lead Infrastructure

1. Add a `test` package script that runs Vitest once.
2. Add shared frontend lead utilities in `client/src/lib/leads.ts` for request IDs, attribution capture, phone normalisation, and isolated event emission.
3. Write `client/src/lib/leads.test.ts` first, covering UTM and `gclid` capture, valid and invalid Australian phone formats, stable request IDs, and event-name isolation.
4. Add shared Cloudflare handler utilities in `functions/api/_lead-utils.js` only after failing API tests define origin validation, input cleaning, HTML escaping, response generation, and Resend delivery.
5. Refactor `send-quote.js` to use shared utilities without changing its public request or response contract.

**Checkpoint:** all existing quote-handler tests and new shared utility tests pass.

## Milestone 2: Referral API and Form

1. Write failing contract tests in `functions/api/send-referral.test.js` for valid private, builder, and trade referrals; conditional business name; required customer name and phone; required consent; disallowed origins; missing secret; honeypot handling; escaped HTML; one Resend request; and `CCG-REF-` reference generation.
2. Implement `functions/api/send-referral.js` with server-side validation and idempotent Resend delivery to `info@concreteconceptsgroup.com`.
3. Write failing frontend validation tests in `client/src/lib/referral-validation.test.ts`.
4. Implement `client/src/lib/referral-validation.ts`.
5. Build `client/src/components/ReferralForm.tsx` with preserved values on failure, sending lock, accessible errors, success reference, retry, and phone fallback.
6. Build `client/src/pages/ReferralProgram.tsx` with the approved navy-and-gold structure, $100 offer, three-step process, project suitability, terms summary, and privacy note.

**Checkpoint:** referral contract and validation tests pass; route renders in a production build.

## Milestone 3: CGS API and Landing Page

1. Write failing contract tests in `functions/api/send-cgs-enquiry.test.js` for valid submissions, required fields, phone and email validation, origin restrictions, missing secret, honeypot handling, escaping, and isolated subject/content.
2. Implement `functions/api/send-cgs-enquiry.js` with idempotent Resend delivery to `info@concreteconceptsgroup.com`.
3. Write failing frontend validation tests in `client/src/lib/cgs-validation.test.ts`.
4. Implement `client/src/lib/cgs-validation.ts`.
5. Build `client/src/components/CGSForm.tsx` with accessible success, failure, retry, and loading states.
6. Build `client/src/pages/ConstructionGrowthSystems.tsx` using a related charcoal, white, navy, and gold design. Include the broad growth-system offer, four capability blocks, Concrete Concepts proof/example, qualification, and growth-review form.

**Checkpoint:** CGS contract and validation tests pass; route renders in a production build.

## Milestone 4: Routing, Metadata, Navigation, and Tracking

1. Add `/trade-referral-program` and `/construction-growth-systems` routes in `client/src/App.tsx`.
2. Add a reusable metadata hook for per-route title, description, canonical URL, and social metadata.
3. Update `Navbar.tsx` and `Footer.tsx` with a restrained referral link and discreet CGS attribution without weakening the quote call-to-action.
4. Update `QuoteForm.tsx` to use the shared attribution helper and emit `customer_quote_submitted` without altering the existing Google Ads quote conversion behaviour.
5. Configure referral and CGS forms to emit only `trade_referral_submitted` and `cgs_growth_enquiry_submitted`, respectively. Neither form may call the Google Ads quote conversion event.
6. Preserve attribution in session storage so form submissions retain UTM and `gclid` values after navigation.

**Checkpoint:** event-isolation tests pass and all direct routes survive a production build.

## Milestone 5: Verification and Delivery

1. Run `pnpm test`, `pnpm check`, and `pnpm build`.
2. Start the production-style server and verify `/`, `/trade-referral-program`, and `/construction-growth-systems` in desktop and mobile viewports.
3. Verify keyboard navigation, labels, focus visibility, error associations, live status regions, disabled submitting controls, and reduced-motion behaviour.
4. Verify no secret values are present in tracked files and only environment-bound `RESEND_API_KEY` is referenced.
5. Verify notification recipient is exactly `info@concreteconceptsgroup.com`.
6. Review the git diff for focused changes and commit using Conventional Commits.
7. Push only after local verification passes and provide the Cloudflare environment and Google Ads configuration checklist.

## Required Acceptance Tests

| Behaviour | Required result |
|---|---|
| Existing customer quote | Still submits and fires only the quote event and existing quote conversion |
| Private referral | Business name optional; valid customer details and consent required |
| Builder or trade referral | Business name required |
| Referral success | Returns and displays a `CCG-REF-` reference; sends one email |
| Referral failure | Keeps entered values and offers retry and phone contact |
| CGS enquiry | Sends one separate email and fires only the CGS event |
| Analytics unavailable | All forms still submit successfully |
| Paid-search integrity | Referral and CGS forms never fire the quote conversion action |
| Security | Origin, content type, payload size, honeypot, sanitisation, and secret checks pass |
| Responsive design | All primary actions and form fields remain usable on mobile, tablet, and desktop |
