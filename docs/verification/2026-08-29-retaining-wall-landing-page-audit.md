# Retaining-Wall Search Landing-Page Audit

**Author:** Manus AI  
**Audit date:** 29 August 2026  
**Scope:** Read-only analysis; no website or Google Ads changes

## Executive Conclusion

The **1/10 is not primarily a visual-design failure**. Google rates all 3 components below average, and the verified journey is structurally mismatched: `retaining wall brisbane` sits inside a mixed-service ad group, the generic Poor-strength RSA received all 7 clicks, and every click landed on `/get-quote`, whose hydrated page and edge metadata contain no retaining-wall wording.

CCG already has the right technical foundation at `/lp/retaining-wall-brisbane`: it is concise, noindex, Brisbane-specific, preserves the retaining-wall service selection and does not fire the primary conversion. It is **not ready to receive Search traffic unchanged** because first-touch GCLID/UTM persistence is unproven, its mobile form begins 1,120 pixels down-page, the sticky Quote control scrolls to the wrong position and all 5 fields rely on placeholders instead of real labels.

The highest-return fix is a small retaining-wall release: repair that paid page, prove attribution and funnel integrity at runtime, then place the keyword in its own retaining-wall ad group with a matching RSA and final URL. Do not raise budget again or use the long organic service page unchanged. Quality Score improvement cannot be guaranteed or immediate because Google uses historical exact-search performance and the score also includes expected CTR and ad relevance.[1]

## 1. Exact Ad-to-Landing-Page Map

The exact-match keyword `retaining wall brisbane` is enabled in the general `Concreting Brisbane - High Intent` ad group. Google Ads reports a **1/10 Quality Score**, with all 3 diagnostic components below average: expected click-through rate, ad relevance and landing-page experience. The keyword has no keyword-level URL override.

Two approved responsive Search ads point to `https://concreteconceptsgroup.com/get-quote`. The original Poor-strength ad generated all 47 recorded ad impressions, 7 clicks and A$161.71 spend for the ad group during 27–29 August; it contains no retaining-wall headline. The newer Excellent-strength ad contains `Retaining Wall Quotes`, but recorded only 1 impression and no clicks in the same window. Both ads are enabled and approved.

Landing-page reporting confirms all 7 clicks went to `/get-quote`. Retaining-wall, driveway, calculator, projects and other linked URLs received sitelink impressions but no clicks. The paid experience being scored is therefore the generic 5-step quote page, not the existing retaining-wall service page.

| Layer | Current State | Quality Risk |
|---|---|---|
| Keyword | Exact `retaining wall brisbane` | High commercial intent |
| Ad group | Mixed concreting services | Weak keyword-to-ad specificity |
| Serving ad | Generic Poor-strength RSA | No retaining-wall headline in the ad that received all clicks |
| Final URL | Generic `/get-quote` | Minimal retaining-wall content before form interaction |
| Better existing content candidate | `/services/retaining-walls-brisbane` | Must be audited before recommending a destination change |

This mapping indicates a structural message-match problem: one mixed-service ad group is trying to serve retaining walls, driveways, slabs, paths and patios through one generic quote destination. The next phases test whether speed or usability also contributes.

## 2. Google’s Diagnostic Standard

Google describes Quality Score as a keyword-level diagnostic—not an auction input or standalone KPI—and bases it on expected CTR, ad relevance and landing-page experience. Landing-page experience is judged by how relevant and useful the page is to people who clicked the ad, compared with advertisers that showed for the same exact search during the previous 90 days.[1] Google’s improvement guidance specifically asks whether the page is useful, well organised, related to the search term and clear in its directions; it also recommends separating dissimilar keyword themes into distinct ad groups with matching ads.[2]

Google separately recommends evaluating mobile optimisation and speed because landing pages are central to conversion performance. Its guidance cites observed retail evidence that a 1-second mobile delay can affect mobile conversions by up to 20%, while noting results vary by advertiser.[3]

These standards support treating the 1/10 as a combined structural problem rather than a page-speed score alone. The current keyword has below-average ratings for all 3 components, the serving ad is generic, and the clicked page is generic. The audit therefore assesses relevance and clarity first, then performance and usability.

## 3. Live `/get-quote` Desktop Experience

The first browser frame showed only the site’s white loading skeleton; a wait-aware second capture hydrated successfully to the complete page. The final render is clean, readable and functional, with a visible H1, 5-step progress control, labelled contact fields, selectable contact preference and a clear Save & Continue button. The initial skeleton is brief, but it means useful keyword-specific content is not present in the first rendered frame.

The larger problem is relevance. The above-fold copy says `Get Your Free Quote`, `Detailed project enquiry` and generic instructions. It does not mention **retaining walls**, wall type, height, length, slope, drainage, engineering or site assessment. The first interaction asks for full name, Australian mobile and email before the visitor sees a retaining-wall option on Step 3. A person who searched `retaining wall brisbane` therefore receives neither immediate confirmation that they are on a retaining-wall page nor any retaining-wall guidance before surrendering contact information.

The page has useful trust and process signals—QBCC licence text, rating text, response timing, autosave and truthful conversion microcopy—but none is tailored to the retaining-wall decision. Desktop usability is acceptable; keyword-to-page message match is not.

For mobile verification, a fresh browser session was explicitly set to **390×844** and loaded the canonical `/get-quote` page with the correct production title. Hydration, viewport geometry and visible first-step content were checked separately before acceptance; no form field or CTA was activated.

The hydrated 390×844 accessibility tree contains the complete generic hero, all 5 progress controls, 4 labelled contact fields, 3 preferred-contact buttons, Save & Continue, truthful autosave/conversion microcopy and a telephone link. The tree contains **no retaining-wall phrase**. A viewport screenshot was captured as `retaining-wall-get-quote-mobile.png` for visual review; no form interaction occurred.

Visual review at 390×844 confirms a polished, legible layout with no overlap or horizontal clipping. The progress card is visible, but the primary Save & Continue action is below the first viewport; only the first contact field and part of the mobile field are visible. The hero consumes roughly the upper 380 pixels with generic wording and generic trust signals. A retaining-wall searcher must scroll and complete 2 contact fields plus email before reaching the service selector on Step 3. The screenshot therefore supports a **relevance and sequencing** diagnosis rather than a basic responsive-layout failure.

## 4. Live Performance Signals

Five uncached HTTP samples of `/get-quote` returned HTTP 200 with the correct edge title. Median TTFB was **2.235 seconds** and median total HTML time was **2.557 seconds**; the HTML response was only 28,394 bytes. The existing retaining-wall service page was similar at 2.168-second median TTFB and 2.466-second median total time. The small payload but slow first byte suggests edge/origin delivery latency rather than oversized HTML.

The 390×844 browser navigation recorded response start at 2.171 seconds, DOMContentLoaded at 2.515 seconds and load at 2.521 seconds. Because the session reused cached static assets, its 32.4 KB transfer total cannot be treated as a cold-load page-weight measurement. It does confirm that the route-specific chunk itself is compact at roughly 29.2 KB transferred. The Save & Continue button began at y=1,246 on a document 1,548 pixels tall, far below the 844-pixel first viewport.

Performance is therefore a **secondary but real** concern: there is no evidence of a heavy quote-page bundle, yet the roughly 2.2-second first byte delays the useful experience before hydration. Message mismatch remains the stronger explanation because the final page contains no retaining-wall phrase at all.

## 5. Existing Retaining-Wall Service Page

The existing `/services/retaining-walls-brisbane` page hydrated at 390×844 with a precise retaining-wall title, breadcrumb, H1, Brisbane terrain context, wall-type copy, visible Get a Free Quote and telephone actions, detailed drainage/engineering material, benefits, process, pricing and FAQs. It is dramatically stronger than `/get-quote` for keyword relevance and usefulness.

It should **not** be adopted unchanged as the paid landing page. The live content contains absolute or legally sensitive claims that require verification or qualification before promotion, including `From $300/lm`, categorical approval thresholds, `we handle the entire process`, universal drainage inclusions, `every type of Brisbane terrain`, long lifespan claims and specific engineering/council fee ranges. The page also sends the visitor from its CTA into the same generic quote page without carrying `retaining-wall` context or preselecting the service. One console error was present and requires classification, but the route itself hydrated correctly.

Visual review at 390×844 confirms the service page passes the 5-second message-match test: the breadcrumb, H1 and opening paragraph immediately identify Retaining Walls Brisbane and the visitor’s slope/erosion problem. The Get a Free Quote and phone actions are both visible in the first viewport, with no overlap or clipping. This is substantially stronger than the generic quote page. The opening paragraph is too long for a paid landing page, however, and the dark hero appears without a visible project image in the captured viewport despite the image being present in the accessibility tree. A dedicated paid variant should retain the immediate relevance and CTA placement while shortening the copy and preserving truthful imagery.

Google Ads returned 7 clicks and 58 landing-page-report impressions for `/get-quote`, but omitted both `mobile_friendly_clicks_percentage` and `valid_accelerated_mobile_pages_clicks_percentage` from the result. Those metrics are therefore unavailable for this small sample and must not be reported as zero. Independent 390×844 rendering confirms practical mobile compatibility, while speed and relevance remain separate issues.

The service page’s single console error was traced to `GET /api/trpc/blog.list` returning HTTP 403. It does not block the hero, retaining-wall copy, CTA, pricing or FAQ content, so it is not a landing-page outage. It likely prevents the dynamic related-blog cluster from loading, which removes a useful depth/internal-link signal and should be repaired if this page becomes a paid destination. This is separate from the known Google Reviews quota warning.

Edge delivery correctly returns HTTP 200, `index, follow`, self-canonicals and route-specific metadata for both pages. `/get-quote` is accurately described as a 5-step concrete quote page but has no retaining-wall term in its title or description. The service page’s edge title and description explicitly mention concrete retaining walls, Brisbane, site access, height and finish, giving Google materially stronger pre-hydration relevance.

The service page’s browser response start was 1.992 seconds, DOMContentLoaded 2.186 seconds and load 2.189 seconds. Its route chunk was approximately 29.5 KB transferred, comparable to `/get-quote`; the 12,382-pixel document is content-heavy but not bundle-heavy. The performance gap between the 2 pages is negligible relative to their large relevance gap. Phase 2 therefore concludes that the existing destination is mobile-compatible and technically healthy, but its **generic edge metadata, absent retaining-wall copy, delayed CTA position and roughly 2.2-second TTFB** weaken the landing experience.

## 6. Existing Paid Retaining-Wall Page

The already published noindex route `/lp/retaining-wall-brisbane` is a stronger paid-destination foundation than either `/get-quote` or the long organic service page. At 390×844 it hydrated with the exact H1 `Retaining Wall Quotes in Brisbane`, QBCC licence text, retaining-wall scope/drainage/reinforcement benefits, a retaining-wall-specific project-details prompt, direct Call/Text controls and a clear `Continue to the Five-Step Quote` action. Its form validates an Australian 04 mobile and Brisbane/SEQ location, then saves `services: ['retaining-wall']` into the protected quote draft before sending the visitor to `/get-quote`. It does not itself submit or fire the primary quote conversion.

This route solves the largest relevance problem without importing the organic service page’s unverified prices, absolute engineering claims or self-controlled testimonials. It also has purposeful noindex handling and is excluded from the public sitemap. Fourteen console errors and 1 warning were reported during the paid-page session; they require classification before this route can be recommended as the ad destination.

The 390×844 screenshot confirms excellent immediate message match: the exact retaining-wall/Brisbane promise, licence number and 4 service-relevant benefit cards are visible, and a fixed Call/Text/Quote bar remains reachable. However, the actual detailed-quote form begins below the first viewport because 6 benefit cards precede it on mobile. The sticky Quote button scrolls back to the top rather than directly to the form, so it does not remove this friction. The header phone button also extends to the viewport edge, although it remains readable.

The reported console events are **Content-Security-Policy Report-Only** diagnostics for Google Ads, analytics, Cloudflare and Facebook requests, plus an unused hero-logo preload warning. Because the policy is report-only and the page hydrated fully, these are not blocking form failures. They create avoidable noise and reveal a stale global logo preload on a paid page that renders a text wordmark; the header policy and preload should be cleaned up separately.

Measured at 390×844, the paid-page H1 begins at y=157 and the form begins at y=1,120; its submit button begins at y=1,499. The fixed Quote control remains visible at y=788 but is implemented as a button that scrolls to page top, not an anchor to the form. All 5 fields lack associated `<label>`, `aria-label`, `aria-labelledby`, `id` and `name` values; placeholders are the only accessible names. This is a material accessibility and form-quality defect under current interface guidelines, even though the browser accessibility tree derives names from placeholders.

The page was then resized to 1280×720 and a desktop viewport screenshot was captured as `retaining-wall-paid-desktop.png` to verify whether the two-column layout presents the message and form together without scrolling.

At 1280×720, the paid page performs well visually: the exact Brisbane retaining-wall H1, licence, 6 scope benefits, complete prefill form and Continue to the Five-Step Quote button are simultaneously visible. The hierarchy is clear, the form is not clipped and Call/Text alternatives remain prominent. The main desktop defects are semantic rather than visual: placeholder-only fields, no contextual project image, a duplicated contact-data step after handoff and the generic claim `No obligation` without supporting explanation.

## 7. Message Match, Trust and Conversion Friction

| Criterion | Current `/get-quote` | Organic retaining-wall page | Existing `/lp/retaining-wall-brisbane` |
|---|---|---|---|
| Exact keyword confirmation | None | Excellent | Excellent |
| Retaining-wall usefulness | None before Step 3 | Deep but overlong | Focused, concise benefits |
| Mobile CTA visibility | Primary action below first viewport | Quote and call visible | Call/Text/Quote fixed; form starts at y=1,120 |
| Service carried into quote | No | No | Yes, `retaining-wall` prefilled |
| Trust | Licence, rating and response text | Licence plus extensive claims/reviews | Licence and response target |
| Compliance risk | Low | High: prices, absolutes, regulatory/legal claims, testimonials | Low: no testimonials or price promises |
| Accessibility | Labelled quote fields | Core page readable | 5 form controls lack real labels and names |
| Technical issues | Roughly 2.2-second TTFB | Related-blog API 403 | Report-only CSP noise; stale unused preload |

The strongest quality-score improvement is therefore **not** rewriting the generic `/get-quote` page for every service. It is to use the existing paid-page architecture as a short, truthful retaining-wall bridge, improve its mobile order and form semantics, then route only a dedicated retaining-wall ad group to it. The protected five-step quote remains the sole submission and conversion destination.

One release-critical gap must be fixed before using the paid page for Search traffic. `LandingPage.tsx` does not invoke `useLeadSource()` or `getLeadSourceData()`, and its handoff uses `window.location.assign('/get-quote')` without carrying the incoming query string. On a first-session Google Ads click, the quote page would then capture a same-origin referrer with no GCLID/UTM parameters rather than the paid click. Existing regression coverage checks only that `saveQuoteDraft` and `/get-quote` appear in the source; it does not exercise UTM/GCLID persistence. The paid route therefore preserves contact/service prefill but is **not yet proven to preserve first-touch Ads attribution**.

This gap does not affect the current Search campaign because all recorded clicks still go directly to `/get-quote`. It becomes a blocking acceptance criterion for any final-URL change to `/lp/retaining-wall-brisbane`.

## 8. Prioritised Improvement Plan

| Priority | Change | Main Quality Component | Expected Impact | Risk if Skipped |
|---|---|---|---|---|
| P0 | Repair `/lp/retaining-wall-brisbane`, then use it only for a dedicated retaining-wall ad group | Landing-page experience, ad relevance | High | Generic `/get-quote` continues to show no retaining-wall relevance |
| P0 | Preserve first-touch GCLID/UTM through the paid-page handoff with a runtime regression test | Measurement integrity | High operational value | Leads may arrive but be misattributed as direct/referral |
| P0 | Move the form above most benefit cards on mobile and make the sticky Quote action scroll to `#quote-form` | Landing-page experience | High on mobile | Relevant message appears, but the conversion path remains 1,120 pixels down-page |
| P0 | Add real labels, ids, names, autocomplete and accessible error announcements to all 5 prefill controls | Landing-page experience | Medium–high | Placeholder-only fields remain less usable and fail interface guidance |
| P0 | Split `retaining wall brisbane` into its own tightly themed ad group with a retaining-wall RSA | Ad relevance, expected CTR | High | The generic Poor-strength RSA can continue winning delivery |
| P1 | Shorten the mobile value section to 3 retaining-wall-specific points and prompt for approximate length, height, wall type, slope/drainage and access in the optional project brief | Landing-page usefulness | Medium | The page remains relevant but does not answer the next practical question |
| P1 | Add 1 verified CCG retaining-wall project image with accurate alt text; do not add unverified testimonials or outcome claims | Trust and usefulness | Medium | The paid page remains credible but visually generic |
| P1 | Reduce median first-byte latency from the measured 2.235 seconds by auditing the Cloudflare Worker/cache path | Landing-page experience | Medium | Useful content continues to wait behind slow edge delivery |
| P2 | Remove the stale global logo preload from the paid route and rationalise the Report-Only CSP policy | Performance hygiene | Low–medium | Console noise and unnecessary preload remain |
| P2 | Repair the organic service page’s `blog.list` 403 and separately verify/qualify its prices, regulatory wording and absolute claims | Organic usefulness/compliance | Low for this paid page | Do not send paid traffic to the organic page unchanged |

Quality Score should not be promised to reach a particular number. Google calculates it from historical exact-search performance against competing advertisers over up to 90 days, so improvement can lag publication and also depends on expected CTR and ad relevance—not the page alone.[1] The realistic objective is to move all 3 components from below average toward average while improving confirmed quote rate.

## 9. Approval-Ready Implementation Scope

The safest implementation is a small, isolated retaining-wall release rather than a general site redesign. It should keep `/get-quote` unchanged for other campaigns and make the following scoped changes:

1. Update the existing paid-page template so first-touch Ads parameters are captured before handoff; retain the saved `retaining-wall` service selection and all current AU mobile/Brisbane-SEQ validation.
2. On mobile, render the short headline/subheadline and quote-prefill card before the benefit grid. Give the form `id="quote-form"`; make the sticky Quote action an anchor or semantic button that targets that form rather than page top.
3. Add visible labels plus stable `id`, `name` and appropriate autocomplete attributes for every prefill field. Preserve explicit inline errors and focus the first invalid field; do not count the prefill as a lead or conversion.
4. Use 3 concise, truthful retaining-wall points: wall type/options where suitable; approximate length/height and site access; slope/drainage/photos for review. Add 1 existing verified project image. Exclude prices, guarantees, universal inclusions, fabricated reviews and categorical council/QBCC advice.
5. Create a dedicated retaining-wall Search ad group and RSA after the page passes production acceptance. Route only that ad group to `https://concreteconceptsgroup.com/lp/retaining-wall-brisbane`; keep the quote-only custom goal, A$60 Search budget, 300% target ROAS, Presence-only targeting and all secondary action classifications unchanged.

### Acceptance Criteria

| Area | Required Evidence Before Ads Change |
|---|---|
| Message match | Edge title, description, H1, first paragraph and textarea prompt all contain natural retaining-wall/Brisbane context |
| Mobile conversion path | At 390×844 the form heading or first field begins within the first viewport; sticky Quote moves focus/scroll to `#quote-form`; no fixed-bar overlap |
| Accessibility | 5/5 controls have visible labels, ids, names and accessible names; keyboard focus remains visible; errors are announced and linked to fields |
| Attribution | Runtime test starts at the paid URL with GCLID plus UTMs, completes the prefill handoff and proves those original values remain available to the final quote submission |
| Funnel integrity | Prefill alone fires no primary conversion; only a confirmed complete quote fires Quote Form Submission; call/text remain secondary |
| Qualification | Non-04 phone and out-of-area inputs remain blocked/reviewed according to existing rules; no valid Brisbane/SEQ lead is discarded |
| Search-engine controls | Paid URL remains `noindex, follow`, self-canonical and absent from the public sitemap; public sitemap remains 202 URLs |
| Performance | Route stays HTTP 200 across apex/www; 5-sample median TTFB improves by at least 30% from the 2.235-second baseline or a documented Cloudflare limitation is accepted separately |
| Content integrity | No testimonials, star ratings, price guarantees, universal engineering/council claims or unsupported urgency are introduced |
| Ads isolation | Only the retaining-wall ad group final URL/ad copy changes; Search budget, tROAS, keywords outside the new group, negatives, geography, PMax and conversion goals remain unchanged |

## 10. Measurement Plan

Record the pre-change 1/10 and 3 below-average component ratings. After release, monitor the new ad group without drawing conclusions from the first few clicks. Review component history after 7, 14 and 30 days, and evaluate at a practical gate of at least 20–30 retaining-wall clicks. Track confirmed quote submissions and cost per confirmed quote separately from click-to-call or page-view observations. If message-match diagnostics improve but confirmed quotes do not, optimise the offer and form sequence rather than adding budget.

### Do Not Do

Do not raise the Search budget again to solve this score, keyword-stuff the generic quote page, send paid traffic to the organic service page unchanged, add invented reviews or price claims, or promote call/text taps to primary conversions. None addresses the verified structural mismatch, and several would weaken conversion integrity.

## References

[1]: https://support.google.com/google-ads/answer/6167118?hl=en "About Quality Score for Search campaigns — Google Ads Help"
[2]: https://business.google.com/uk/resources/articles/three-ways-to-improve-your-quality-score/ "How to improve your Google Ads Quality Score — Google"
[3]: https://support.google.com/google-ads/answer/7543502?hl=en "Evaluate the performance of your landing pages — Google Ads Help"
