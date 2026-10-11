# Bayside / South-East preview baseline — 10 October 2026

## Authority

Director authorised the approved implementation plan at 17:58 Queensland time. Implement/test and deploy a new isolated noindex preview only. No customer release, Ads change, lead/email/upload test or external resource modification is authorised.

## Fresh Cloudflare readback

- Customer canonical: `19ce3c2e-c4a6-44a7-bd8f-86b360e16451`; successful; branch `main`; source `a640076`, resolved in authorised Git history.
- Customer aliases: `https://concreteconceptsgroup.com`, `https://www.concreteconceptsgroup.com`.
- Preview `LEAD_BACKUP_DB`: `57820612-5691-4486-8191-0e48b94a8ae4`; `LEAD_PHOTOS`: `ccg-other-trade-preview-photos-20260920`; dry-run string verified true. No values from secrets retained.
- Production resources distinct: D1 `bdc72c31-6e44-4c26-b6b0-8b94a5a02393`; R2 `ccg-lead-photos`.

## Passive customer readback

Homepage, `/get-quote` and all five existing locality pages return HTTP 200, index/follow, no X-Robots noindex. The five locality raw shells contain no H1; this is pre-existing and not a rendering/indexing conclusion. Sitemap returns 200. `/partners` returns 308 to the retained partner portal. No POST, email or customer record read occurred.

## Inherited source classification

Base `1059a69` and documentation HEAD `f862fad` are separate from deployed `a640076`. Four high-risk files (Worker, wizard, quote draft, shared quote schema) differ by 828 additions/72 deletions before implementation.

- Dormant regional route/edge content and publication policies: preserve off; do not bundle unrelated preview availability.
- Shared version-1 context schema, body/photo/phone hardening and focus/hostname fixes: reusable tested capability; not evidence customer source changed.
- Inherited wizard audience UI/payload: must be gated to restore deployed ordinary customer behavior in this candidate. Executable UI/payload tests against deployed source are required.
- New candidate content/context/preview guard: necessary gated additions, default-off and noncustomer preview only.
- No inherited difference is customer publication authority. Any later customer release must reconcile the full diff afresh.

## Local verification procedure

Safe runner excludes exactly seven live tests (Anthropic, BFL, Cloudflare credential, Ads, live quote route, R2 upload, Resend), strips credentials from subprocess environment and installs an unmocked-network deny boundary. All actual delivery tests use local mocked providers. Focused candidate RED/GREEN and final full gate evidence will be recorded separately, using current totals.

## Newly discovered integration exclusions

Initial stripped-credential baseline ran 75 files / 878 tests: 870 passed, eight failed in three historical suites. Inspection—not failure alone—confirmed these are unmocked integration tests:

- `server/content-expansion.test.ts`: requires live seeded blog database via `appRouter` without a mocked database.
- `server/seo-features.test.ts`: requires live seeded blog reads and calls the reviews provider without mocks.
- `server/seo-conversion.test.ts`: requires live seeded blog reads, invokes real quote submit and attempts database deletion in cleanup. It is explicitly unsafe for this preview workflow.

All three now excluded by exact path in addition to the seven known live files. No test assertions weakened. The first run had credentials removed, no worktree `.env`, and failed the quote before delivery; no live lead or deletion succeeded. Subsequent safe runs additionally install a network-deny setup. Local comprehensive quote/Worker/photo/booking/conversion tests and generated published blog snapshot tests remain the deterministic coverage; these exclusions are not a claim to have tested live integrations.
