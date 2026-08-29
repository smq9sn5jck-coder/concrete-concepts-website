# Retaining-Wall Search Landing Release Design

**Status:** Approved by the director on 29 August 2026  
**Author:** Manus AI  
**Scope:** One paid retaining-wall landing experience and one isolated Google Ads ad group

## Objective

Improve the weak Google Ads quality diagnostics for the exact keyword `retaining wall brisbane` by replacing the current generic keyword-to-ad-to-page journey with a tightly matched, truthful and measurable experience. The release must improve relevance and usability without weakening the five-step quote funnel, geographic qualification, contact validation, attribution, lead delivery or conversion classification.

## Selected Approach

Use the existing noindex route `/lp/retaining-wall-brisbane` as a short prefill bridge into `/get-quote`. Do not rewrite the generic quote page for one service and do not send paid traffic to the long organic retaining-wall page unchanged.

The paid page will immediately confirm the retaining-wall and Brisbane intent, collect a complete contact prefill, preserve first-touch Google Ads attribution, save `retaining-wall` as the selected service and continue into the protected five-step quote wizard. The paid page itself remains **non-submitting and non-primary**: it must not create a lead or fire Quote Form Submission.

## Website Changes

### Attribution

`LandingPage` will initialise the existing `useLeadSource()` hook as soon as the paid page renders. This captures the original GCLID/UTM/referrer/landing-page values into the same session storage read later by `ComprehensiveQuoteWizard`. The same-origin handoff can remain `/get-quote`; the initial paid-click data must survive because it is stored before redirect.

Runtime coverage will start on the paid URL with representative GCLID and UTM values, perform the prefill handoff and prove the five-step wizard still exposes the original values to its submission payload. The test must also prove the paid page does not fire the primary conversion.

### Mobile Order and CTA

At phone widths, the headline and concise supporting copy will be followed by the quote-prefill card before the service-benefit cards. At desktop widths, the existing two-column layout remains. The form receives `id="quote-form"`; the fixed Quote control becomes a semantic anchor targeting that id. It must scroll to the form rather than page top and must not submit or track a primary conversion.

### Form Semantics

Each of the 5 controls receives a visible `<label>`, stable `id`, stable `name`, suitable `autocomplete` and an accessible error relationship. Validation remains unchanged in substance: name, Australian 04 mobile, valid email and service-area qualification are required; the project brief remains optional. The first invalid field receives focus, and the error summary is announced without recording entered values.

### Retaining-Wall Content

The generic benefit set will be shortened for the retaining-wall route to 3 practical, truthful points covering approximate wall dimensions/type, slope/drainage/site access and optional photos or measurements in the full quote. No price, guarantee, review, engineering approval, council threshold or universal-inclusion claim will be introduced.

## Ads Changes

Ads changes occur only after the website candidate passes local and production acceptance.

Create a dedicated retaining-wall Search ad group inside campaign `24184424558`. Move or isolate the exact keyword `retaining wall brisbane` so it no longer relies on the mixed-service ad group. Create one matching responsive Search ad whose assets describe retaining-wall quotes in Brisbane and point to `https://concreteconceptsgroup.com/lp/retaining-wall-brisbane`.

The mutation must preserve the Search budget at **A$60/day**, target ROAS at **300%**, Presence-only location targeting, existing negatives, quote-only primary goal and all 5 contact observations as secondary. PMax, Tradenet and unrelated Search keywords/ads are out of scope.

## Failure Handling and Rollback

The current canonical Cloudflare deployment is captured before upload and retained as immediate rollback. Publication fails closed if apex or www quote routes do not hydrate, the paid route is blank, the paid form loses AU/SEQ validation, attribution is not preserved, the sitemap changes from 202 public URLs, or a non-quote event can fire the primary conversion.

Ads mutations use validate-only first, then live execution, followed by an independent read-only Google Ads readback. If the dedicated ad group or final URL cannot be verified, the existing generic Search configuration remains serving and no broader setting is changed.

## Acceptance Criteria

| Area | Required Result |
|---|---|
| Message match | Edge title, description, H1 and first paragraph naturally identify retaining-wall quotes in Brisbane |
| Mobile order | At 390×844 the form heading or first field begins in the first viewport; benefit cards follow the form |
| Quote CTA | The fixed Quote control targets `#quote-form` and does not submit or fire a primary conversion |
| Accessibility | All 5 controls have visible labels, ids, names, accessible names and field-linked errors |
| Attribution | GCLID and UTM values from the first paid page remain available to the final quote submission after handoff |
| Funnel integrity | Prefill alone creates no lead; only confirmed complete quote delivery fires Quote Form Submission |
| Qualification | Existing Australian 04 mobile and Brisbane/SEQ validation behavior remains intact |
| SEO controls | Paid page remains `noindex, follow`, self-canonical and absent from the 202-URL public sitemap |
| Responsive UX | Verified at 390×844, 1280×720 and 1536×864 with no overlap or clipped controls |
| Production | Apex, www, stable Pages and immutable deployment routes return healthy content and pass the guarded quote verifier |
| Ads isolation | Only the retaining-wall ad group, keyword ownership, RSA and final URL change; all protected settings read back unchanged |
| Monitoring | Production is monitored for at least 15 minutes; Ads quality components are reviewed at 7, 14 and 30 days and after 20–30 retaining-wall clicks |

## Out of Scope

This release does not increase any budget, change bidding, alter PMax, publish supporting-trade services, add testimonials, change the organic retaining-wall page, relax qualification, create a new lead event, or claim that Quality Score will reach a particular number.
