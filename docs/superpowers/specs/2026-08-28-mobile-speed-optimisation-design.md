# CCG Mobile Speed Optimisation Design

**Status:** Approved, implemented and deployed
**Author:** Manus AI
**Date:** 28 August 2026
**Production baseline:** Cloudflare Pages deployment `fb579c3b`

## Objective

This change will improve first-load performance on phones without altering the five-step quote workflow, required validation, Gmail/Jotform delivery, privacy-safe funnel analytics, Google Ads conversion timing, campaign settings or the Cloudflare quote-route rollback guard.

The owner’s final hero-media decision is authoritative: **phones will display a static crop of the original video poster; tablets and desktop devices will retain the original autoplay video**. The earlier finished-driveway alternatives remain audit-only and will not be added to the website.

## Evidence and root cause

The live homepage measured 5.07 MB of mobile transfer, 8.79 seconds Largest Contentful Paint and 2.70 seconds Total Blocking Time under Lighthouse simulation. The quote page measured 0.91 MB, 7.48 seconds LCP and 0.54 seconds TBT. These are repeatable lab measurements rather than real-user field data.

The primary homepage issue is media sizing. Two 1440×1920 JPEGs, displayed as approximately 400×224 service cards, transfer about 1.5–1.6 MB each. Lighthouse estimated approximately 2,965 KiB of avoidable image transfer. The mobile browser also receives a 647 KB autoplay hero video. Responsive image delivery is therefore the first priority; Google recommends correctly sized responsive images and making the LCP resource discoverable without unnecessary delay.[1] [2]

Cloudflare HTML caching is already operating with cache hits and a 60-second shared edge lifetime. Origin tuning is not the first lever. Production also ships 4,447 development source-location markers; removing them reduced uncompressed JavaScript by approximately 263 KB in an isolated build, although paired Lighthouse runs showed little initial-load improvement. This is worthwhile production clean-up, not the principal speed fix.

## Approved implementation

### 1. Phone hero: original poster only

At viewports below the Tailwind `md` breakpoint, the hero will render a semantic `<picture>`/`<img>` background instead of mounting the `<video>` element. The image will be eager, high-priority and dimensioned to prevent layout shift. The existing dark overlay, logo, headline, trust indicators and prefill form will remain unchanged.

| Variant | Dimensions | Measured size | Intended use |
|---|---:|---:|---|
| Standard phone poster | 480×854 WebP | 46,242 bytes | Normal-density phones |
| High-density phone poster | 960×1708 WebP | 118,052 bytes | High-density phones |

Both variants are derived from the existing 1280×720 `hero-poster.jpg` and centred on the worker and power float. The poster is a deterministic crop of the existing CCG media—not generated imagery. Tablets and desktop devices will continue to render the current WebM/MP4 sources with `preload="metadata"`.

The browser must not request either video source on a phone viewport. CSS-only hiding is insufficient because browser preload behaviour can vary; the React tree will conditionally mount the video only after a media-query check confirms the tablet/desktop breakpoint.

### 2. Responsive service-card images

The two largest service images will receive visually verified 480-pixel and 800-pixel WebP variants, delivered with `srcset` and `sizes`. Existing alt text, card links, copy and layout remain unchanged.

| Existing asset | Original | 480-pixel candidate | Measured reduction |
|---|---:|---:|---:|
| `project-troweling_06ff9a7c.jpeg` | 1,484,051 bytes | 72,324 bytes | 95.1% |
| `new-gallery-4_c54657e7.jpeg` | 1,635,525 bytes | 77,492 bytes | 95.3% |

The remaining service-card images will keep their existing sources unless a performance-budget test identifies another material offender. This incremental boundary avoids a broad gallery rewrite.

### 3. Responsive transparent logo

The 176,751-byte transparent logo will receive a visually equivalent optimised WebP variant measured at 29,230 bytes for mobile and card/header use. The original remains available as fallback where transparency or high-density rendering requires it.

### 4. Remove public source-location instrumentation

The Vite `jsxLocPlugin()` will remain available in development but will be excluded whenever `CF_BUILD=1`. A build regression test will fail if `data-loc` markers or project source paths reappear in the public Cloudflare bundle.

### 5. Defer below-fold rendering—not business tracking

Large homepage sections below the initial hero will use browser-native `content-visibility: auto` with a conservative intrinsic-size placeholder. This allows the browser to defer rendering work until sections approach the viewport without changing section order, copy, links or accessibility semantics.

Google Ads, Meta Pixel, the existing analytics collector and confirmed-form conversion events will **not** be delayed in this release. A controlled blocking experiment showed a directional gain from removing third-party scripts, but attribution risk is higher than the evidence supports. Third-party deferral may be reconsidered only after the lower-risk media and rendering changes are measured. Chrome guidance recommends reducing third-party JavaScript impact, but measurement and business requirements must guide the loading strategy.[3]

## Test-first requirements

Before production code changes, failing tests will prove the following contracts:

| Contract | Required assertion |
|---|---|
| Mobile hero | Phone render contains the responsive poster and no mounted video/source elements |
| Tablet/desktop hero | Video remains present with WebM, MP4 and poster fallback |
| Media privacy and provenance | Only approved CCG asset URLs are used; no newly supplied MOV is referenced |
| Responsive services | The two oversized card images use WebP `srcset`/`sizes` and preserve alt text |
| Production cleanliness | `CF_BUILD=1` excludes source-location markers and internal runtime scripts |
| Lead safety | Quote-form routes, delivery logic and confirmed-conversion boundaries remain unchanged |
| Performance budget | Guarded build remains below agreed bundle and image-size thresholds |

## Acceptance budgets

Three comparable mobile Lighthouse runs will be taken before and after the change. Medians will be used because individual lab runs vary.

| Metric | Required result |
|---|---|
| Homepage total transfer | At least 50% lower than the 5.07 MB baseline |
| Homepage LCP | At least 25% lower than the 8.79-second baseline |
| Homepage TBT | No more than 10% worse than the 2.70-second baseline; improvement preferred |
| `/get-quote` LCP and TBT | No material regression beyond run variance |
| Mobile hero media | No hero-video request below `md`; poster transfer under 125 KB at high density |
| Service images | Selected 480-pixel variants each under 100 KB |
| Layout stability | CLS remains below 0.10; current near-zero behaviour is preserved |
| Functional flow | Homepage prefill reaches `/get-quote`; all five steps render; no submission occurs during QA |
| Release protection | Apex and www rendered route guards pass after deployment or automatic rollback runs |

Google’s current Core Web Vitals guidance defines a good LCP as 2.5 seconds or less at the 75th percentile of page loads and good CLS as 0.1 or less.[4] The present acceptance target is deliberately incremental: this release must create a material improvement without risking the working lead funnel, after which real-user data and a second optimisation pass can be assessed.

## Exclusions

This release will not change Google Ads budgets, bidding, keywords, locations, conversion goals, PMax URL controls or campaign status. It will not alter quote-form questions, service-area rules, spam controls, Gmail/Jotform delivery, customer confirmation, storage, database schema or analytics event payloads. It will not publish the two newly supplied MOV files. It will not place the newly supplied exposed-aggregate close-up in the hero.

## Deployment and rollback

After tests, TypeScript, guarded build, Worker syntax, responsive screenshots and non-submitting quote navigation pass, the owner will receive the exact change set and before/after measurements for final publication approval. Deployment will use the validated Cloudflare credential. The release guard will preserve the current canonical deployment, render apex and www `/get-quote`, and restore the previous canonical release automatically if either route fails.

## References

[1]: https://web.dev/articles/optimize-lcp "Optimize Largest Contentful Paint"
[2]: https://web.dev/articles/responsive-images "Serve responsive images"
[3]: https://web.dev/articles/efficiently-load-third-party-javascript "Efficiently load third-party JavaScript"
[4]: https://web.dev/articles/vitals "Web Vitals"
