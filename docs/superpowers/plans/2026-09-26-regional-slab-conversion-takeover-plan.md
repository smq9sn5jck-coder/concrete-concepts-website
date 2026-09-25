# Regional Slab and Extension Conversion Takeover — Implementation Plan

**Date:** 26 September 2026  
**Branch:** `feature/regional-slab-takeover-preview`  
**Specification:** `docs/superpowers/specs/2026-09-26-regional-slab-conversion-takeover-design.md`  
**Release target:** isolated Cloudflare Pages noindex preview only

## Guardrails

- Keep customer production, the production sitemap and Google Ads unchanged.
- Preserve the existing five-step detailed quote and its successful conversion boundary.
- Extend the version-1 quote payload only with optional, defaulted structural fields so current payloads remain valid.
- Keep Australian `04` mobile validation, service-area review, anti-spam, D1-first persistence, Jotform backup, Resend/Gmail notification, private R2 photos and transaction-id deduplication.
- Record partner-introduction interest without forwarding any information to a provider.
- Keep partner-only requests secondary and non-biddable.
- Make every regional route unavailable on customer hosts while the production publication flag is off.
- Apply noindex and nofollow to every non-customer preview response.
- Use only truthful, source-backed claims. Do not add testimonials, reviews, project counts, guarantees, prices, licences, insurance statements or availability promises.

## Architecture

### Domain and content layer

Create `shared/regionalSlabContent.ts` for regional hub and structural-service content. This typed module will own route paths, page metadata, coverage statements, quote prefills, official resources and publication requirements. It will not import React, Cloudflare or browser APIs.

Extend `shared/quoteBrief.ts` with an optional `projectContext` object. The object will contain audience type, structural project type, document readiness, builder-specific fields and partner-introduction interest. Conditional validation will remain in the shared schema so both the client and backend enforce the same rules.

### Application layer

Create pure helpers for:

- preview and publication route access;
- regional quote draft handoff;
- audience-specific project questions;
- concrete-scope qualification for complete-extension enquiries; and
- readable quote-brief formatting.

These helpers will remain independent of React and network calls so tests can cover them deterministically.

### Interface layer

Create reusable page renderers for regional hubs, structural service pages and the review index. Extend the current quote wizard inside Step 3 and Step 4 without increasing the five-step count.

### Edge and build layer

Generate a preview configuration and edge content snapshot from the typed source. The Pages Worker will use the generated registry for raw crawlable content, metadata, route gating, canonical handling, strict 404s, noindex and security headers.

The default build will regenerate all flags off after every preview build. The self-contained Worker bundler will remain mandatory for direct Pages upload.

## Test-first work sequence

### Task 1: Add failing regional publication and route contracts

Create `server/regional-slab-preview.test.ts` with red tests for:

- preview routes present when preview is on;
- customer hosts rejecting unpublished routes;
- non-customer hosts returning noindex;
- exact hub, service and guide route registry;
- unique titles, descriptions, H1s and canonical URLs;
- Service, FAQPage and BreadcrumbList schema;
- raw HTML content before JavaScript;
- malformed nested routes returning true 404 responses;
- no regional routes in the production sitemap;
- default production build flags remaining off; and
- all existing Gold Coast preview routes remaining available.

Run the focused test and confirm it fails before adding implementation.

### Task 2: Add failing quote-domain contracts

Create `server/regional-quote-context.test.ts` covering:

- legacy version-1 quote payload still parses;
- homeowner and builder audience values;
- new-house, extension-slab, under-house/build-under and complete-extension project types;
- builder company and project-programme rules;
- optional plans, engineering and certifier readiness;
- complete-extension detailed quotes requiring a concrete slab scope;
- partner-introduction interest defaulting to false;
- partner-only requests remaining outside the detailed-quote schema;
- readable text and HTML sections include the new fields; and
- HTML formatting escapes all customer-entered values.

Run the focused test and confirm red.

### Task 3: Add failing draft and UI contracts

Create `server/regional-quote-handoff.test.ts` and extend quote-wizard contracts for:

- regional and service page CTAs writing only local draft values;
- no request sent by a CTA handoff;
- audience choice displayed in the job-brief step;
- builder fields shown only for builders;
- homeowner project types shown only for homeowners;
- extension partner-interest checkbox hidden unless relevant;
- partner checkbox unchecked by default;
- route to the separate other-trade request for non-concrete-only work;
- existing service, measurement and photo fields preserved;
- exactly five progress steps; and
- conversion tracking called only after confirmed detailed-quote success.

Run and record the expected failure.

### Task 4: Implement typed regional content and generated config

Add:

- `shared/regionalSlabContent.ts`
- `shared/regionalSlabPublication.ts`
- `scripts/generateRegionalSlabPreviewData.ts`
- `client/src/generated/regionalSlabConfig.ts`
- `client/public/regional-slab-content.js`

Define these preview routes:

- `/regional-slab-review`
- `/services/concrete-slabs-brisbane` as a preview-only upgraded rendering
- `/services/extension-slabs-brisbane`
- `/guides/how-house-slab-quotes-work`
- `/guides/extension-slab-readiness`
- `/areas/ipswich-ripley-house-slabs`
- `/gold-coast/house-slabs`
- `/gold-coast/extension-slabs`
- `/areas/sunshine-coast`

Keep existing Gold Coast routes and localities unchanged.

Run Tasks 1 and 4 focused tests until green.

### Task 5: Implement shared quote context

Extend `shared/quoteBrief.ts` and `client/src/lib/quoteDraft.ts` with optional project-context fields and labels. Preserve the current version literal and default behaviour.

Use conditional schema rules:

- builders require a company name;
- complete-extension detailed quotes require `slab` in selected services;
- partner-introduction interest is boolean and never implies provider disclosure; and
- optional readiness fields accept “not sure”.

Ensure `getQuoteBriefSections`, text formatting, HTML formatting and legacy payload conversion remain backward-compatible.

Run Task 2 tests until green.

### Task 6: Implement conditional five-step quote UI

Extend `ComprehensiveQuoteWizard.tsx` without adding steps:

- Step 3: audience, structural project type, concrete services and work description;
- Step 4: plans, engineering, certifier/approval readiness, builder programme and existing measurements/access/photos;
- Step 5: unchanged contact and privacy acknowledgements plus an optional, unchecked partner-introduction interest statement when relevant.

For non-concrete-only extension requests, show a clear link to the preview-only other-trade path rather than allowing a detailed quote conversion.

Keep the main submit button, endpoint and success tracking unchanged. Add the project context to both tRPC and fallback submissions.

Run Task 3 tests until green.

### Task 7: Build regional pages and internal linking

Add reusable components and pages:

- `client/src/pages/RegionalSlabReviewPage.tsx`
- `client/src/pages/RegionalSlabHubPage.tsx`
- `client/src/pages/RegionalSlabServicePage.tsx`
- `client/src/pages/RegionalSlabGuidePage.tsx`
- `client/src/lib/regionalSlabQuoteHandoff.ts`
- `client/src/lib/regionalSlabPreviewAccess.ts`

Update `client/src/App.tsx`, `ServiceAreasPage.tsx`, relevant service-page links and Gold Coast review navigation under the preview flag only.

Every page must provide:

- one primary detailed-quote CTA;
- truthful coverage and project boundaries;
- what CCG needs to quote;
- official-resource links where relevant;
- related regional, service and locality links;
- visible H1 and useful body content; and
- mobile-first accessible controls.

Run focused route, metadata and handoff tests until green.

### Task 8: Extend Worker routing and raw SEO

Update:

- `client/public/_worker.js`
- `client/public/seo-manifest.js`
- the regional generator output
- relevant Worker and header tests

Implement:

- route publication gates;
- customer-host isolation;
- preview noindex;
- raw HTML body content and schema;
- canonical path normalisation;
- strict unknown-route 404s;
- existing security-header application to success and error responses; and
- no changes to quote, callback, photo, Jotform, email or conversion endpoints beyond accepting the optional job-brief fields.

Run Worker syntax and focused security/SEO tests.

### Task 9: Add preview build and default-off restoration

Add:

- `scripts/buildRegionalSlabPreview.ts`
- package scripts for generation and preview build

The wrapper will set all prior preview flags false except the regional flag, enable the required existing Gold Coast and other-trade content only inside the regional artifact, build, bundle the Worker and then regenerate every checked-in output with production defaults off.

Verify:

- ordinary build has no regional routes;
- preview build has all regional routes;
- checked-in generated flags are false after both runs;
- no preview URL enters the customer sitemap; and
- the built Worker contains no unresolved local imports.

### Task 10: Full deterministic verification

Run all safe deterministic test files. Exclude only tests that send external email, consume paid third-party services, mutate live Cloudflare resources or submit production leads. Record every exclusion and inspect it before excluding it.

Then run:

- TypeScript checking;
- ordinary guarded build;
- regional preview build;
- Worker syntax check;
- quote source and built-artifact guards;
- diff hygiene;
- secret scan; and
- no-placeholder scan.

### Task 11: Browser and responsive QA

Serve the built artifact locally and test mobile and desktop for:

- review index;
- Brisbane house slab;
- Brisbane extension slab;
- Ipswich/Ripley hub;
- Gold Coast house slab;
- Sunshine Coast hub;
- homeowner quote handoff;
- builder quote handoff; and
- complete-extension partner-interest behaviour.

Confirm no horizontal overflow, console errors, dead links, form submission, email, Jotform record or Ads conversion.

### Task 12: Independent review

Have an independent reviewer inspect the complete diff for:

- production leakage;
- doorway-page risk;
- unsupported claims;
- consent ambiguity;
- schema backward compatibility;
- conversion leakage;
- edge routing and XSS;
- email/Jotform payload regressions; and
- accessibility or mobile issues.

Correct all blocking findings and rerun affected tests plus the full safe suite.

### Task 13: Commit and push isolated source

Commit the implementation with a focused Conventional Commit and push only `feature/regional-slab-takeover-preview`. Confirm the repository is clean and source-generated outputs are default-off.

### Task 14: Cloudflare preview preflight

Read the current Pages production deployment, aliases, rollback candidate and preview binding names. Confirm production has not moved unexpectedly.

Build the final isolated artifact. Use the established self-contained direct-upload method to deploy to branch `regional-slab-takeover-review`. Bind only the existing preview D1, preview R2 and dry-run delivery settings. Do not use production D1 or R2.

### Task 15: Live preview verification

Verify every route on the permanent preview alias:

- HTTP status and redirects;
- `X-Robots-Tag: noindex, nofollow`;
- CSP and other security headers;
- canonical and structured data;
- responsive rendering;
- quote handoff local draft;
- no submission network request;
- empty preview lead state; and
- no runtime errors.

Read Cloudflare again to confirm the customer production deployment and aliases remain unchanged. Read Google Ads only if necessary to confirm no mutation occurred.

### Task 16: Verification record and handoff

Write a privacy-safe deployment record with:

- preview URL;
- deployment ID;
- source commit;
- branch;
- test and build results;
- binding names only;
- production deployment readback;
- rollback reference;
- known limitations; and
- explicit production release gate.

Do not describe the preview as customer-live or indexable.
