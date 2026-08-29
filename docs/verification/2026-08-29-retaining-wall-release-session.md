# Retaining-Wall Search Landing Release Verification

**Author:** Manus AI  
**Date:** 29 August 2026  
**Production baseline:** Cloudflare deployment `d17220b7-999b-419e-87bc-19fe1cb4b695`

## Approved Scope

The director approved the isolated retaining-wall release after reviewing the landing-page audit. The release repairs `/lp/retaining-wall-brisbane`, preserves the five-step quote funnel and first-touch Ads attribution, and permits a dedicated retaining-wall Search ad group only after production acceptance. Search remains A$60/day at 300% target ROAS. PMax, Tradenet, geography, conversion goals and unrelated Search delivery are protected.

## Test-First Implementation

The new `server/retaining-wall-landing-release.test.ts` contract was run before implementation and produced the expected RED result: 5 failed and 1 passed. The minimum implementation then passed all 6 tests. It verifies first-touch Google Ads attribution persistence, paid-page attribution initialisation, mobile form-before-benefits order, a `#quote-form` mobile target, labelled semantic fields and non-primary paid-page behavior.

The focused regression set passed **7 files and 117 tests**. Coverage included Release 1 conversion isolation, paid-page noindex behavior, sitemap filtering, attribution, AU phone/SEQ validation, quote drafts and tracking safeguards.

The broader deterministic suite passed **50 files**, skipped 1 known file, and passed **557 tests** with 1 existing skip. Known Resend domain-verification and Google Reviews quota warnings appeared in test logs but did not fail the suite.

TypeScript passed, the guarded production build passed its source and built quote contracts, Worker syntax passed, and the generated `LandingPage` chunk contains the retaining-wall content and `quote-form` target without a `trackQuoteConversion` call. The shared entry chunk contains the existing first-touch attribution storage key.

## Runtime Handoff Verification

A fresh development session opened the paid route with representative GCLID and UTM values. Before handoff, `cc_lead_source` contained `Google Ads`, `gclid=runtime-test`, campaign `retaining-walls`, term `retaining wall brisbane` and the original paid landing URL. The hydrated page exposed 5 visible labels, `#quote-form`, and no primary conversion reference.

Using clearly labelled synthetic values, the prefill form navigated only to `/get-quote`; no final quote was submitted. The exact draft key contained the name, Australian mobile, email, parsed Carindale/4152 location, description and `services: ['retaining-wall']`. The five-step page hydrated at **Step 1 of 5**, the final Submit Quote Request action was not present, and the original GCLID/UTM values remained unchanged in session storage.

An empty prefill attempt stayed on the paid page, focused `lp-name`, exposed `Please enter your name.` through a `role=alert` message and created no lead.

At exactly 390×844, activating the fixed Quote link changed the hash to `#quote-form`, moved the form top to 27.75 pixels, kept the form visible and remained on the paid page. It did not submit.

## Responsive Review

The updated page was reviewed at 390×844, 1280×720 and 1536×864. Mobile now presents the retaining-wall/Brisbane H1 and concise explanation followed immediately by the quote form; benefit cards follow the form. The fixed Call, Text and Quote controls remain readable without horizontal clipping. Desktop preserves the two-column layout with the complete form beside the message and three concise retaining-wall planning prompts.

## SEO and Conversion Safeguards

The paid page remains `noindex`, retains its self-canonical through `SEOHead`, remains absent from the 202-URL public sitemap under the existing Worker manifest contract, and does not fire the primary Quote Form Submission conversion. Existing Australian 04 mobile and Brisbane/SEQ qualification remain in the submit path. No review, rating, price, guarantee, universal engineering, council or approval claim was added.

## Publication Gate

The candidate is locally accepted. Publication must retain `d17220b7` as immediate rollback and pass apex/www quote-route checks, paid-page metadata and noindex checks, true 390×844 rendering, attribution-aware handoff and a minimum 15-minute monitoring window before any Google Ads final URL changes.

## Cloudflare Production Acceptance

The verified build was directly uploaded to Cloudflare Pages as deployment `c2c56e33-d43a-45a5-b375-b8bdc0430a00`, created at `2026-08-29T15:39:00.577357Z`. It became canonical on both custom domains. Deployment `d17220b7-999b-419e-87bc-19fe1cb4b695` remains the immediate rollback.

The bounded apex/www quote verifier passed on its first attempt. Raw HTTP acceptance returned 200 with non-empty route-specific titles for homepage, `/get-quote` and `/lp/retaining-wall-brisbane` across apex, www, stable Pages and immutable `c2c56e33` hosts: 12 of 12 checks passed. The paid route served `X-Robots-Tag: noindex, follow`, its self-canonical, and the retaining-wall edge title. The live sitemap retained exactly 202 public URLs and zero `/lp/` URLs. The canonical LandingPage chunk contained the improved retaining-wall prompts and `quote-form` target and did not contain a primary quote-conversion call.

At exactly 390×844 on canonical production, the hydrated title and H1 were `Retaining Wall Quotes in Brisbane`; the form began before the benefit cards, all five labels were present, the mobile Quote target was `#quote-form`, the labelled acceptance GCLID/UTM values were captured, and no primary conversion reference appeared. Visual inspection found no horizontal clipping or fixed-bar overlap.

A clearly labelled synthetic prefill then navigated only to Step 1 of 5. The draft contained the retaining-wall service, contact and Carindale/4152 test values, while original GCLID/UTM attribution persisted. The final Submit Quote Request action was not visible and no production lead was submitted.

Production monitoring ran past the minimum gate. Three rounds produced 36 successful responses across all four hosts and three critical routes through `2026-08-29T15:54:27Z`. Cloudflare reconfirmed `c2c56e33` successful and canonical at `2026-08-29T15:57:46.950Z`, more than 18 minutes after creation. No rollback condition occurred.

## Dedicated Search Structure

After production acceptance, Google Ads API v25 validation accepted an atomic cross-resource package with HTTP 200 and no errors. The live package then created paused ad group `198409264974` (`Retaining Walls Brisbane - Exact`) in Search campaign `24184424558`, enabled exact keyword `retaining wall brisbane` and enabled RSA `822626109720` with 15 retaining-wall headlines, four descriptions, display paths `retaining-wall/quote` and final URL `https://concreteconceptsgroup.com/lp/retaining-wall-brisbane`.

Independent Google Ads readback confirmed the ad group remains **PAUSED**, the exact keyword and RSA exist, and the RSA is `REVIEW_IN_PROGRESS` with approval status `UNKNOWN`. The existing mixed-service retaining-wall keyword remains enabled and serving; no routing switch, overlap negative or pause has been applied while policy review is incomplete. This fail-closed state avoids a retaining-wall delivery gap.

Google later reviewed the first RSA assets and disapproved only the description containing the phone number under `PHONE_NUMBER_IN_AD_TEXT`; the other 18 assets were approved. The ad group was still paused and never served. A replacement request using policy-safe text without a phone number passed `validateOnly` with HTTP 200. Live mutation created RSA `822669462910` and paused superseded RSA `822626109720`. Independent readback confirmed the replacement is enabled inside the still-paused ad group and remains `REVIEW_IN_PROGRESS`; no retaining-wall traffic has been switched while approval is pending.

The replacement copy remained under review, so a third RSA `822744781388` was validated and created using only the 15 headlines and three descriptions Google had already marked approved. RSA `822669462910` was paused; the ad group remained paused and the original mixed-group keyword continued serving. Both the forward routing request and its inverse rollback passed `validateOnly` before any switch.

The director selected automatic checks. The account already had one three-day CCG performance-review schedule, so its exact configuration was saved to `/home/ubuntu/ccg_seo_conversion_2026-08-29/ccg-performance-review-schedule-baseline.json` before temporary reuse. The active schedule now checks every three hours until the `2026-08-30T17:18:04Z` deadline. It is explicitly fail-closed: pending review leaves original routing untouched; approval triggers landing-page acceptance, the prevalidated atomic switch and protected-setting readback; any failure triggers the prevalidated rollback. A terminal approval, disapproval or deadline restores the prior performance-review schedule from the saved baseline. The temporary playbook prohibits unrelated SEO, negative-keyword, PMax, Tradenet, budget, bidding, geography or conversion-goal changes.
