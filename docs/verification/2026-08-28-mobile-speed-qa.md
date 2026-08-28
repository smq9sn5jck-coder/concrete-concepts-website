# CCG Mobile Speed QA

**Date:** 28 August 2026
**Status:** Proxy-dependent release rejected and rolled back; stable-CDN repair passes pre-publication verification and awaits fresh production approval

## Responsive visual checks

The development homepage was rendered at 390×844. The phone hero displayed the owner-approved static crop of the original video poster, retained the existing foreground CCG logo, gold/white heading, trust indicators, phone link and detailed-quote prefill card. No blank media state or broken responsive asset was visible.

The development `/get-quote` page was rendered at the same phone viewport. The existing quote header, `Step 1 of 5` progress state, trust signals and required contact fields remained readable and unchanged.

The development homepage was also rendered at 1440×900. The tablet/desktop media branch retained the original video treatment and the existing two-column hero layout, logo, heading, trust indicators and prefill form.

## Current verification evidence

| Check | Result |
|---|---|
| Versioned Cloudinary mobile poster | HTTP 200, WebP, 46,242 bytes, immutable public cache |
| Versioned Cloudinary responsive troweling image | HTTP 200, WebP, 72,324 bytes, immutable public cache |
| Versioned Cloudinary responsive excavation image | HTTP 200, WebP, 77,492 bytes, immutable public cache |
| Unreferenced Cloudinary logo variant | HTTP 200, WebP, 29,230 bytes, immutable public cache; intentionally not used after LCP regression |
| Focused speed/storage tests | 14 passed |
| Stable-CDN deterministic suite | 541 passed, 1 skipped; only the two known external Resend-dependent files excluded |
| TypeScript | Passed |
| Guarded production build | Passed |
| Cloudflare Worker syntax | Passed |

The initial proxy-dependent production upload was rejected and rolled back. The corrected stable-CDN repair has not yet been republished.

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

## Rejected Cloudflare production deployment and rollback

The first approved speed build was uploaded to Cloudflare Pages as production deployment `ab052b9f-18de-4429-90cc-90db06b61dc8`. Cloudflare initially assigned both `https://concreteconceptsgroup.com` and `https://www.concreteconceptsgroup.com` to this release. The prior clean deployment `fb579c3b-53da-41a3-9cc4-94717325c0b3` remained the immediate rollback point.

The browser-rendered quote-route guard passed on both apex and www `/get-quote`, but the required phone screenshot exposed a broken hero asset because the Cloudflare runtime could not access the Forge-backed proxy. The automatic rollback restored `fb579c3b`, and both apex and www quote-route guards passed after restoration.

## Stable-CDN repair

All seven approved responsive files were uploaded to versioned Cloudinary URLs. Every URL returned HTTP 200, `image/webp`, its expected byte count and an immutable public cache policy. New red-then-green regression tests require Cloudinary-only media and the complete removal of the unavailable Worker and Express `/manus-storage/*` proxies.

The first raw Chromium development screenshots after this repair were captured before asynchronous rendering completed, so the dark homepage frame and quote loading skeleton were not accepted visual evidence.

Wait-aware 390×844 recaptures then passed. The homepage displayed the original-video poster from Cloudinary, foreground CCG logo, immediately visible white/gold heading, supporting copy, ratings, QBCC signal, quote count, phone link and the start of the quote-prefill card without a broken-image state. The `/get-quote` page displayed the unchanged header, trust signals, progress control, `Step 1 of 5` marker and contact fields. No form was submitted.

At a 1280-pixel desktop viewport, the original hero video was present, displayed, fully ready and retained both existing WebM and MP4 sources. The two Cloudinary service-card images loaded completely with valid intrinsic dimensions. No Cloudinary or responsive-media error appeared in the browser console. The only warning was the pre-existing development Google Maps fallback, unrelated to the speed repair.

## Same-time performance safety control

An alternating three-run mobile Lighthouse control compared the preserved pre-speed bundle on port 4175 with the corrected CDN-only bundle on port 4174 under the same server, CPU and network conditions. The first CDN-only build reduced median transfer from approximately 5.06 MB to 2.68 MB and median blocking time from 2.27 s to 1.46 s, but increased median LCP from 6.35 s to 14.85 s. Investigation identified the Cloudinary logo as the new LCP element, so a failing regression was added and the mobile logo was returned to the proven original CloudFront URL.

The original-logo fix passed its red-green contracts and reduced the corrected build's median LCP to 10.38 s, but the same-time control still showed a material LCP regression versus the 6.48 s pre-speed median. Transfer remained approximately 47.7% lower and blocking time approximately 42.6% lower, and the new mobile build requested no hero video.

The corrected build's LCP element returned to the supporting paragraph. In that comparison, the versioned Cloudinary poster required roughly 4.3 seconds between request start and completion, the two below-fold Cloudinary service variants completed between approximately 6.1 and 7.2 seconds, and Lighthouse FCP was 8.15 s for the corrected run versus 3.18 s for the control.

Further diagnosis showed that comparison was not a valid release gate: the preserved bundle on port 4175 was served by the static `serve` process, which compressed JavaScript and CSS, while the corrected bundle on port 4174 was served by the Express production process without local compression. The mismatch inflated corrected script and stylesheet transfer by approximately four to seven times and delayed first paint. The result remains useful as a server-configuration warning, but not as evidence of a page-code LCP regression.

A fresh alternating three-run control then served both bundles with the identical static server:

| Metric | Preserved pre-speed bundle | Corrected CDN-only bundle | Direction |
|---|---:|---:|---:|
| Performance score | 39 | 46 | Improved |
| First Contentful Paint | 3.187 s | 3.187 s | No regression |
| Largest Contentful Paint | 6.485 s | 4.219 s | 34.9% faster |
| Total Blocking Time | 2.254 s | 1.734 s | 23.1% lower |
| Transfer size | 5.057 MB | 1.691 MB | 66.6% lower |
| Mobile hero video requests | 1 | 0 | Removed as designed |

The valid same-server result passes the pre-publication no-regression condition. The corrected build still requires the remaining functional, visual and full deterministic release checks before a checkpoint or any production publication decision. The live site remains safely on restored deployment `fb579c3b`; no corrected build has been published.

## Corrected-bundle release verification

The corrected production bundle passed 542 deterministic tests across 47 files with one existing skipped test when the two known external Resend-dependent files were excluded. TypeScript, the guarded source/build quote contract, production build and Cloudflare Worker syntax all passed.

At 1280×1100, the isolated corrected production bundle retained the original displayed hero video with ready state 4 and both existing WebM and MP4 sources. The foreground logo loaded completely from the proven CloudFront URL at its 768×512 intrinsic dimensions. Both responsive Cloudinary service images loaded completely with valid intrinsic dimensions. Ten `/get-quote` links were present, and no form was submitted.

The final 390×844 captures passed. The homepage showed the phone-only still poster, original foreground logo, hero heading and supporting copy, Google rating, QBCC badge, genuine monthly quote counter, click-to-call number and the beginning of the quote-prefill card without a broken-media state. The `/get-quote` route showed its unchanged header, trust row, five-step progress control, `Step 1 of 5` marker and required contact fields. No form was submitted.

## First approved Cloudflare publication attempt

After fresh director approval, the verified candidate was directly uploaded to the existing `concrete-concepts-group` Cloudflare Pages project as deployment `65d0dde5-f4ea-4cfe-8a6e-54fcc7f57272`. The previously verified canonical deployment `fb579c3b-53da-41a3-9cc4-94717325c0b3` remained the immediate rollback point.

The local live-route command exceeded its intended Chromium virtual-time window without returning a verdict. A wait-aware browser check confirmed the apex domain rendered the complete quote wizard, but the www domain remained a blank white page with an empty title on two immediate captures even though its raw route returned HTTP 200. This failed the required apex/www safeguard, so Cloudflare was immediately rolled back to `fb579c3b`. Independent post-rollback browser checks confirmed that both apex and www again rendered the complete five-step wizard, the correct quote title, `Step 1 of 5` and the required contact fields. No form was submitted.

The isolated `https://65d0dde5.concrete-concepts-group.pages.dev/get-quote` route subsequently rendered the complete wizard after waiting for the application to load. This indicates the new build itself was intact and the brief www failure was consistent with custom-domain propagation rather than a defective quote bundle. The release verifier was strengthened test-first with a 30-second hard Chromium process timeout and three bounded, wait-aware checks of both custom domains. Sixteen focused release tests and TypeScript passed after this guard repair.

## Controlled promotion and final live acceptance

After the propagation window, the already verified isolated deployment `65d0dde5-f4ea-4cfe-8a6e-54fcc7f57272` was promoted to production again. The strengthened browser-rendered release guard passed both apex and www quote routes on its first bounded attempt. Cloudflare then confirmed `65d0dde5-f4ea-4cfe-8a6e-54fcc7f57272` as the canonical deployment for all three project domains, with `fb579c3b-53da-41a3-9cc4-94717325c0b3` retained as the known-good rollback.

The final live 390×844 homepage capture displayed the phone-only still poster, proven CloudFront foreground logo, heading, supporting copy, rating, QBCC badge and quote-entry card without a broken-media state. The production entry bundle returned HTTP 200 with Brotli compression and a one-year immutable cache policy.

Three final mobile Lighthouse runs on the live apex domain produced the following median:

| Final live mobile metric | Original live baseline | Accepted live median | Change |
|---|---:|---:|---:|
| Lighthouse performance score | 33 | 38 | +5 points |
| First Contentful Paint | Not recorded in original scorecard | 2.560 s | Informational |
| Largest Contentful Paint | 8.785 s | 6.882 s | 21.7% faster |
| Total Blocking Time | 2.695 s | 1.374 s | 49.0% lower |
| Transfer size | 5.069 MB | 1.699 MB | 66.5% lower |

Every live mobile audit requested one responsive Cloudinary poster, the original CloudFront logo and the two Cloudinary service variants. None requested the hero video. The five-step lead funnel, apex/www routing and owner-approved desktop-video/mobile-still behavior therefore pass the final release safeguards. No test lead was submitted and no Google Ads setting was changed.
