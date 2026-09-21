# Focused Conversion-Readiness Preview Design

**Date:** 21 September 2026  
**Status:** Approved direction; written specification awaiting final implementation approval  
**Author:** Manus AI

## Purpose

This release will improve the customer site’s mobile speed, quote-form accessibility and browser hardening without changing the sales journey or advertising behaviour. It will be built and deployed first to a dedicated **noindex Cloudflare Pages preview**. The customer domains will remain unchanged until a separate production-release approval.

The release preserves the existing five-step detailed quote funnel, Australian mobile and service-area validation, Gmail/Jotform/D1 delivery, private R2 photo handling, quote-success experience and strict Google Ads conversion isolation. It also preserves the original mobile hero poster and desktop/tablet hero video behaviour.

## Approved scope

### Mobile and initial-load performance

The implementation will reduce avoidable initial network and main-thread work on the homepage and quote page. Existing approved responsive Cloudinary images will be reused where available. Below-the-fold sections and images will remain deferred or lazy-loaded. The site will avoid requesting high-density assets when a smaller responsive asset is sufficient.

The hero media behaviour will not change. Mobile will continue to receive the current static poster, while tablet and desktop will continue to receive the original video. The first viewport will keep the current layout, copy and detailed-quote entry point.

The release will add an appropriately sized, versioned logo asset rather than downloading the current 177 KB master image for small navigation and quote-page placements. The master logo may remain available for structured data and large presentation contexts. New assets must use explicit intrinsic dimensions, stable CDN URLs and transfer-size budgets enforced by tests.

The release will also inspect route-level JavaScript loading and apply only low-risk code splitting or deferred imports that do not alter form state, tracking order or route behaviour. If a proposed split creates a delivery or hydration risk, it will be excluded from this release.

### Quote-form accessibility

Each of the five sticky progress buttons will receive a stable accessible name that includes its step number, title and state. Completed steps will remain the only previous steps that can be selected. The current touch targets, progress calculation and navigation logic will remain unchanged.

Optional-field text and other low-contrast quote labels identified by Lighthouse will be adjusted to meet readable contrast while retaining the existing visual hierarchy. Focus indicators will remain visible. No field, validation rule, submission payload or success-state behaviour will change.

### Consistent security headers

Cloudflare Pages will apply the same baseline security headers to every HTML application route rather than only the root and literal `.html` paths. The baseline will include `X-Content-Type-Options`, frame protection, a strict referrer policy and a restrictive permissions policy.

A Content Security Policy will be staged in **Report-Only** mode first because the site uses Cloudinary, CloudFront, Google services, analytics, video and form integrations. The preview must prove that the policy describes every required origin before enforcement is considered. Strict Transport Security will be added only if the preview confirms that all customer-facing and subdomain dependencies are HTTPS-safe; it will not include `includeSubDomains` or preload in this release.

API responses, private photo responses and existing fail-closed endpoint headers will retain their current, stricter behaviour. The release will not relax upload validation, rate limits, private storage or no-store rules.

## Explicit exclusions

This release will not change Google Ads budgets, bidding, keywords, locations, final URLs, conversion goals or tracking actions. It will not add exit-intent pop-ups, urgency claims, reviews, guarantees, discounts or unsupported licensing statements.

It will not publish the staged south-side locality cluster, Need Another Trade flow or any other feature currently held behind a noindex gate. It will not add crawlable first-response body content to the remaining 194 public pages; that larger SEO change will be handled separately by page family.

It will not submit a real customer lead during automated testing. Any end-to-end delivery test would require a separately labelled synthetic submission and explicit approval.

## Architecture and change boundaries

The work will remain within existing components and Cloudflare configuration:

1. `HeroSection`, `Navbar`, the shared logo placements and existing performance asset manifest will provide responsive, budgeted media.
2. `DeferredSection` and below-the-fold components will retain their current rendering boundaries unless measurement proves a safe, focused improvement.
3. `ComprehensiveQuoteWizard` will add semantic labels and contrast corrections only.
4. `_headers` and the Pages Worker will share a tested header policy so custom-domain and preview responses remain consistent.
5. Existing quote delivery, conversion tracking, Worker endpoints, D1 bindings and R2 bindings will remain byte-for-byte or contract-equivalent unless a test demonstrates that a header-only wrapper is required.

## Test-first acceptance criteria

Before implementation, failing tests will define the required behaviour. The final candidate must prove all of the following:

- mobile and navigation logo assets have explicit dimensions, stable versioned CDN URLs and strict transfer budgets;
- the original mobile poster and desktop/tablet hero video sources remain unchanged;
- below-the-fold homepage images remain lazy-loaded and non-priority;
- every quote progress button has an accessible name and correct disabled/navigation semantics;
- optional-field text no longer uses the failing contrast class;
- all application HTML routes receive the baseline security headers;
- Content Security Policy is Report-Only in the preview, not enforced;
- lead, conversion and upload endpoints retain their existing validation and response contracts;
- checked-in feature flags remain production-safe after preview builds;
- no preview route is indexable and no preview URL appears in the production sitemap.

The full deterministic test suite, TypeScript, guarded production build, quote source/build guards and Worker syntax checks must pass. Browser acceptance will cover the homepage and all five quote steps at mobile and desktop widths without submitting a lead. Lighthouse will be rerun against the preview and compared with the 21 September baseline. A regression in form usability, lead isolation, search indexability or first-viewport appearance blocks release.

## Cloudflare preview and rollback

The verified bundle will deploy to a new Cloudflare Pages preview branch with `X-Robots-Tag: noindex, nofollow`. The production canonical deployment will be read back immediately before and after the preview deployment to prove it was not replaced.

The preview will use the project’s existing nonproduction binding strategy. It must not write to production D1 or production R2. The preview will be discarded or superseded without database rollback because this release contains no migration and creates no customer data.

## Success criteria

The preview is ready for director review when it meets four conditions. First, the homepage and quote page visibly match the current production experience. Second, the mobile Lighthouse scores and largest-content load improve without increasing cumulative layout shift. Third, the quote progress controls have accessible names and readable labels. Fourth, every preview HTML route carries the intended security and noindex headers while all lead and Ads settings remain unchanged.

## References

[1]: https://web.dev/articles/lcp "Largest Contentful Paint (LCP)"
[2]: https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html "Understanding Success Criterion 4.1.2: Name, Role, Value"
[3]: https://developers.cloudflare.com/pages/configuration/headers/ "Cloudflare Pages Headers"
[4]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP "Content Security Policy"
