# Need Another Trade — Staging Verification

**Date:** 20 September 2026
**Status:** Verified non-production Cloudflare preview
**Preview deployment:** `cef74831-95ba-48ca-b1c6-92fd18b45bb3`
**Preview branch:** `release-3-need-another-trade-review`
**Review URL:** https://release-3-need-another-trade.concrete-concepts-group.pages.dev/need-another-trade
**Production baseline retained:** `b0bcd192-4162-467d-8afa-1dfa7c3c907a`

## Outcome

The approved **Need Another Trade?** experience has been implemented as a non-production staging release. It presents a clear split between CCG concreting enquiries and other-trade requests. The concreting pathway enters the existing five-step quote funnel without submitting a lead. The other-trade pathway uses a separate request class, separate endpoint, explicit provider-sharing consent, private photo storage, and an owner-review-first workflow. The same permanent review branch also contains the approved 20-page Batch 1 locality review index at `/batch-one-review`.

The new route is **not published on the customer website**. It is excluded from the public sitemap, returns `X-Robots-Tag: noindex, nofollow`, renders a `noindex, nofollow` meta policy, and uses the customer-domain canonical only as a future production canonical. The live production deployment and its Google Ads settings were not changed.

## Customer experience

| Area | Verified behaviour |
|---|---|
| Initial choice | “Concreting quote” and “Another trade request” are clearly separated. |
| Concreting | “Start detailed quote” opens the existing five-step CCG quote flow. It creates no lead or conversion by itself. |
| Other trades | Plumbing, Blockwork / Bricklaying, Electrical, Excavation / Earthworks, Landscaping, Carpentry, Roofing, and Other are available. Concreting is deliberately excluded from this selector. |
| Required information | Name, Australian `04` mobile, email, suburb or postcode, trade, job description, timeframe, and explicit provider-sharing consent. |
| Photos | Optional; up to eight private images using the established validated R2 upload route with an `other-trade` storage prefix. |
| Urgent requests | The UI states that CCG is not an emergency service and guarantees no response time. |
| Success state | Appears only after authoritative D1 storage succeeds. It confirms CCG review only and does not promise a provider. |
| Failure state | Preserves entered information, focuses the relevant control or accessible error summary, and offers CCG’s phone number. |

## Delivery and privacy isolation

The other-trade endpoint is `POST /api/other-trade-submit`. It accepts JSON only and rejects unsupported methods, unsupported content types, oversized bodies, invalid service areas, invalid trade or timeframe values, incomplete contact details, missing or mismatched consent evidence, invalid photo URLs, honeypot activity, and submissions completed below the anti-spam minimum time.

A successful request is stored first in the separate `other_trade_leads` table. Only after that authoritative insert can the owner notification be attempted. The owner email is clearly marked as an **other-trade review request**, contains the exact consent wording, consent version, consent hash and timestamp, and warns that provider suitability and consent scope must be checked before any later disclosure.

No request is sent automatically to a provider. No provider directory, provider email, webhook, matching function, public provider endpoint or automatic disclosure operation exists in this release. The `other_trade_disclosures` table exists only as a future audit trail; the staging database contains zero disclosure records.

## Advertising and lead isolation

The new page and endpoint do not call the protected `trackQuoteConversion` function, the Quote Form Submission action, Jotform, the existing quote handler, callback handler, guide handler, Meta Lead tracking, or any provider-forwarding operation.

A browser audit initially detected Google’s automatic tag observing an invalid form click as a generic `form_submit` remarketing event. The form was hardened to stop submit-event propagation before validation. The closing browser check confirmed that an invalid submit now focuses the first invalid field while producing **no** Google automatic `form_submit`, other-trade endpoint, quote endpoint, callback endpoint or Jotform request. Both phone fallbacks use only the existing secondary phone-click tracking helper.

No Google Ads budget, target ROAS, bidding strategy, campaign goal, keyword, location, network or conversion action was changed.

## Cloudflare preview isolation

| Resource | Preview | Production |
|---|---|---|
| Pages deployment | `cef74831-95ba-48ca-b1c6-92fd18b45bb3` | `b0bcd192-4162-467d-8afa-1dfa7c3c907a` retained |
| D1 binding | `ccg-other-trade-preview-20260920` (`57820612-5691-4486-8191-0e48b94a8ae4`) | Existing production lead backup unchanged |
| D1 records after testing | 0 leads; 0 disclosures | Not queried or changed by this staging release |
| R2 binding | `ccg-other-trade-preview-photos-20260920` | `ccg-lead-photos` unchanged |
| R2 public access | `r2.dev` disabled; zero custom domains | Existing production state unchanged |
| R2 lifecycle | Automatic deletion after 90 days | Existing production lifecycle unchanged |
| Preview dry-run env | Existing `LEAD_PREVIEW_DRY_RUN=true` retained | No production environment change |

No real form was submitted during testing. No customer data, customer email, provider data or Google Ads conversion was created.

## HTTP and browser acceptance

The permanent Cloudflare review page returned HTTP 200 with `X-Robots-Tag: noindex, nofollow`. The old `/referral` route returns a 308 redirect for GET and HEAD and a 303 redirect for POST, preventing legacy form bodies from being replayed. The new endpoint returned 405 for GET, 415 for non-JSON POST, and 400 for an empty JSON validation request. The isolated D1 database remained at zero leads and zero disclosures afterward.

The preview-enabled production build passed mobile and desktop browser review. At 390×844 it had one H1, the correct title and canonical, all required labelled controls, unchecked consent, zero horizontal overflow, and accessible validation that focused `other-name`. At 1440×900 it retained the same metadata and zero overflow. The Urgent option displayed the exact no-emergency/no-response-time disclaimer. Mobile and desktop screenshots are held in the private release evidence folder.

## Verification evidence

The final deterministic suite passed **58 test files and 728 tests**. The Release 3 Worker test passed independently after its anti-spam timing fixture was made deterministic. TypeScript passed, the production-default build passed, quote source and build guards passed, both source and built Worker syntax checks passed, generated feature flags were verified off in the normal build, and repository diff hygiene passed.

An independent fresh-eyes review returned **pass** with no remaining findings. It confirmed D1 retry behaviour, photo-purpose gating, non-destructive rollback policy, exact consent evidence, POST/JSON guards, preview noindex, event isolation, secondary phone tracking, private R2 access, accessible error handling, and the absence of provider forwarding or primary quote conversion behaviour.

## Production gate and rollback

This staging deployment must remain non-production until the director reviews the page and the provider-sharing privacy wording receives the required Australian legal/privacy review. Production publication also requires a separate release approval. Release 3B provider disclosure controls remain out of scope.

Preview rollback is immediate and does not require touching production: delete or supersede deployment `cef74831-95ba-48ca-b1c6-92fd18b45bb3`, restore the prior Pages preview bindings if desired, and retain the isolated D1 tables as an empty audit-safe record unless their deletion is separately approved. The live customer website continues to use production deployment `b0bcd192-4162-467d-8afa-1dfa7c3c907a`.
