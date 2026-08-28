# CCG Mobile Speed QA

**Date:** 28 August 2026
**Status:** Cloudflare production deployed and verified

## Responsive visual checks

The development homepage was rendered at 390×844. The phone hero displayed the owner-approved static crop of the original video poster, retained the existing foreground CCG logo, gold/white heading, trust indicators, phone link and detailed-quote prefill card. No blank media state or broken responsive asset was visible.

The development `/get-quote` page was rendered at the same phone viewport. The existing quote header, `Step 1 of 5` progress state, trust signals and required contact fields remained readable and unchanged.

The development homepage was also rendered at 1440×900. The tablet/desktop media branch retained the original video treatment and the existing two-column hero layout, logo, heading, trust indicators and prefill form.

## Current verification evidence

| Check | Result |
|---|---|
| Uploaded mobile poster via development proxy | HTTP 200, WebP, 46,242 bytes |
| Uploaded responsive troweling image via development proxy | HTTP 200, WebP, 72,324 bytes |
| Uploaded responsive excavation image via development proxy | HTTP 200, WebP, 77,492 bytes |
| Uploaded responsive logo via development proxy | HTTP 200, WebP, 29,230 bytes |
| Focused speed/storage tests | 14 passed |
| Deterministic project suite | 540 passed, 1 skipped; known live Resend/BFL/weekly-email files excluded |
| TypeScript | Passed |
| Guarded production build | Passed |
| Cloudflare Worker syntax | Passed |

No production deployment has been performed for this speed change.

## Matched performance checks

The first after-change audit used the uncompressed Express preview and was rejected as an invalid comparison because the preserved baseline used a compressed static server. A second audit used the same compressed server method, followed by an alternating A/B control between the preserved pre-change quote bundle and the updated bundle.

| Mobile lab check | Before median | After median | Result |
|---|---:|---:|---|
| Quote-page Lighthouse score | 49 | 49 | No regression |
| Quote-page LCP | 5.769 s | 5.774 s | Effectively unchanged |
| Quote-page total blocking time | 696 ms | 689 ms | Slight improvement |
| Quote-page transfer weight | 894.3 KB | 895.1 KB | +0.1%; within budget |

The updated compressed homepage runs measured a median Lighthouse score of 37, median LCP of 8.008 seconds, median total blocking time of 1.110 seconds and median transfer weight of 1.331 MB. The original live baseline measured score 33, LCP 8.785 seconds, total blocking time 2.695 seconds and transfer weight 5.069 MB. Because the homepage before and after environments were not identical, these are directional rather than final production claims. They indicate approximately 74% lower transfer weight, 59% lower blocking time and 9% lower LCP in the pre-publication build.

The mobile network record contains the static original-poster image and responsive service/logo assets and contains no `ccg-hero-video` request. Final three-run production measurements remain required after publication to validate the owner-approved 50% transfer and 25% LCP targets under one live environment.

## Final pre-publication medians

After making the paragraph identified by Lighthouse as the homepage LCP element visible on the first phone frame, three final compressed mobile runs produced the following directional comparison against the preserved live baseline:

| Homepage mobile lab metric | Live baseline | Final build median | Directional change |
|---|---:|---:|---:|
| Lighthouse performance score | 33 | 37 | +4 points |
| Largest Contentful Paint | 8.785 s | 6.366 s | 27.5% faster |
| Total blocking time | 2.695 s | 1.340 s | 50.3% lower |
| Transfer weight | 5.069 MB | 1.331 MB | 73.7% lower |

The build therefore clears the pre-publication transfer and LCP targets directionally. The final mobile request log again contained no hero-video request. A matched alternating old/new quote-page control remained effectively unchanged, with median score 49 before and after, median LCP 5.769 s before versus 5.774 s after, and median TBT 696 ms before versus 689 ms after.

The final deterministic suite passed 543 tests across 47 files with one existing skipped test. TypeScript, the guarded build and Worker syntax all passed. The broad all-files run surfaced only the pre-existing live Resend notification test failure caused by the connected sending-domain condition; that live integration test is unrelated to the speed source changes and was excluded from the deterministic count.

## Final responsive visual pass

After the mobile LCP refinement, the 390×844 homepage again showed the original video poster as a static phone background with the existing foreground logo, headline, supporting copy, trust signals, phone link and quote-prefill card intact. The supporting copy was visible on the first frame rather than waiting for the desktop entrance animation.

The 390×844 `/get-quote` page still displayed the unchanged trust header, progress control, `Step 1 of 5` marker and required contact fields. No submission was made.

At 1440×900, the homepage retained the original tablet/desktop video treatment, two-column hero composition, foreground logo, trust signals and detailed-quote prefill form. No visual regression was observed in the final responsive captures.

## Cloudflare production deployment

The approved build was uploaded to Cloudflare Pages as production deployment `ab052b9f-18de-4429-90cc-90db06b61dc8`. Cloudflare assigned both `https://concreteconceptsgroup.com` and `https://www.concreteconceptsgroup.com` to this release. The prior clean deployment `fb579c3b-53da-41a3-9cc4-94717325c0b3` remains documented as the immediate rollback point.

The browser-rendered quote-route guard passed on both apex and www `/get-quote`. A subsequent rendered homepage check progressed from the intentional loading skeleton to the complete hero, navigation, logo, headline, trust signals and detailed-quote prefill form. No rollback was required.
