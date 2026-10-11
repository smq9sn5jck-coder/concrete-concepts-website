# Bayside/South-East local acceptance — 11 October 2026

## Authority and scope

Approved implementation and isolated noindex Cloudflare preview only. Five existing locality upgrades: Wynnum, Manly, Cannon Hill, Mount Gravatt and Mansfield, plus one review index. Gold Coast, customer publication, indexing, Ads changes, email tests, lead submissions and database changes are not included.

## Final local gate

- `pnpm test:safe`: **84 files / 974 tests passed**, 54.73 seconds. Runs inside a route-free Linux network namespace, removes credentials and denies unmocked fetch/HTTP/HTTPS/TCP/TLS connections. Integration/live suites are explicitly excluded by `scripts/safeTestSelection.ts`.
- TypeScript passed; source quote guard passed; whitespace passed.
- Normal default-off build and explicit five-page preview build passed, including built quote guard and self-contained Worker syntax. Preview wrapper restored source flags false/false, with unrelated preview/publication flags off in the artifact.
- Final read-only independent source review passed after test-first corrections.

## Corrected findings

- Preview tracking is disabled before all loaders, independently in HTML bootstrap and Worker injection; noscript pixels and tracker preconnects are removed from preview HTML. Customer tracking remains unchanged.
- Candidate corpus asset returns noindex 404 on customer hosts before asset access.
- Regional-only historical wizard behavior restored through normalized host + explicit preview/publication flags; no flag bypass.
- Default-off customer wizard mount retained.
- Candidate breadcrumb is visual-only; typed presenter is the sole candidate schema owner.
- Hydrated CTA passes a validated one-time page-local token to GetQuote before clean SPA navigation, preserving local draft/conflict behavior when storage is unavailable. Raw handoff removes context before tracking and is consumed once.

## Static browser QA

Vite static preview only; no connected Express backend. Worker routing/security verified separately with local mock harness.

- Six routes rendered at 390×844 and 1440×900: one H1 after hydration, no horizontal overflow. Desktop sweep reported zero page runtime errors.
- All preview tracking gates remained false. Browser recorder reported no API, Jotform, Ads, Meta pixel or Umami request.
- Homeowner Wynnum CTA reached clean `/get-quote`, candidate heading, Wynnum prefill; Step 2 focus landed on H2 after animation.
- Builder Manly CTA preselected builder, defaulted structural type to `other_concrete`, and exposed builder company/concrete scope controls.
- Complete-extension + slab review displayed optional partner introduction unchecked. No submit button was pressed and no photo was uploaded.
- Raw token handoff cleaned query, retained non-context parameters, and mounted candidate quote shell.
- Conflict switching/storage-unavailable behavior and consent eligibility/reset are covered by executable DOM/local adapter tests.
- Local diagnostic draft/storage cleared after walkthrough. No delivery or inbox health claim is made by this QA.

## Deployment gate

Fresh Cloudflare readback: customer canonical `19ce3c2e-c4a6-44a7-bd8f-86b360e16451`, source `a640076`, production branch `main`; 102 listed deployments have no branch conflict for `bayside-southeast-review`. Preview D1/R2 remain isolated and dry-run is true. No deployment completed at the time this local record was written. Final committed artifact and live verification are recorded separately after preview upload.
