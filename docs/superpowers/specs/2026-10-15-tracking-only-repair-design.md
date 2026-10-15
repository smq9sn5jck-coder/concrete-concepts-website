# Approved website-only tracking repair preparation

The director approved preparation and testing on 15 October 2026. No publication, Google Ads mutation, real/synthetic submission, email send or native Ads-form activation is authorised.

## Exact design

Use fixed public CCG destinations in the existing central configuration:

- Confirmed detailed quote: `AW-18007005419/oPHGCJSGt44cEOuxtIpD` (action 7546454804; primary).
- Telephone-link click: `AW-18007005419/KuCJCPSeyo4cEOuxtIpD` (action 7546769268; secondary).

These identifiers are public tag configuration, not credentials. The source previously falls back to descriptive placeholders and accepts arbitrary build overrides. For this approved CCG release, the two destinations will be fixed to the verified account actions; `VITE_GADS_LABEL_QUOTE` / `VITE_GADS_LABEL_PHONE` will no longer alter them. This prevents an inherited environment from silently choosing another action. Any future destination change needs a new reviewed source change. Meta configuration and all other destinations remain unchanged.

A build guard must validate the actual QUOTE_SUBMISSION/PHONE_CALL property values in generated JavaScript, not just the presence of the verified strings somewhere. Fail on missing, ambiguous, legacy or wrong mappings. Wire it into the existing normal build so the five-page local candidate wrapper inherits the same guard. Leave feature defaults, content and publication state unchanged.

## Isolation and provenance

Dedicated branch/worktree: `fix/bayside-verified-tracking-preparation`, based on already prepared customer candidate `a2c3d2761d25e9d5cc5aa5ee9be4a6df607deac0`. The new diff is tracking configuration, guard, tests and records only. Existing five-page candidate content is inherited, not newly authorised for publication. PR #9 remains separate; its public verified labels were reviewed, but it is not merged and its arbitrary-valid-override behaviour is not adopted. No changes to the original worktrees or main.

## Test-first plan

1. Write red tests for missing/hostile/placeholder build overrides, exact actual property mappings, stable quote transaction-ID deduplication and secondary action separation, plus protected-file parity against the base commit.
2. Run under credential-scrubbed, route-free OS namespace and transport-denied safe test execution. No unisolated test fallback.
3. Change only the two central destinations and add the focused guard.
4. Run focused and complete safe tests, TypeScript, normal build, quote source/build guards, bundled Worker syntax and hygiene checks. Locally build the existing five-page publication candidate to confirm guard integration and source-flag restoration; it is not uploaded or published.
5. Check wrong build mappings fail and hostile environment overrides cannot redirect the real built mappings. Preserve Worker, routers, funnel payload, confirmed-success gate, consent, callback isolation, Gmail/Resend/Jotform/D1 delivery, private R2, tracking bootstrap and deduplication byte-for-byte against the base.
6. Save and push a clean separate source checkpoint; deliver a concise verification record with exact artifact/commit evidence. Seek distinct final publication approval only after fresh production baseline and rollback preparation.

No browser or service server is required to prove this configuration-only change. Actual Google receipt and Ads attribution remain unverified until a separately approved release is live and genuine confirmed customer activity occurs. No promise of immediate lead-volume recovery is made.
