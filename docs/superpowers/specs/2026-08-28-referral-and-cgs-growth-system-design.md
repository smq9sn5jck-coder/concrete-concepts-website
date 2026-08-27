# Concrete Concepts Referral Program and CGS Growth System Design

**Author:** Manus AI  
**Date:** 28 August 2026  
**Status:** Approved design awaiting implementation

## 1. Purpose

This design adds two new lead journeys to the existing Concrete Concepts website while protecting the clarity of the core concreting customer journey:

| Journey | Audience | Primary outcome |
|---|---|---|
| Concrete quote | Homeowners, builders, and commercial customers seeking concreting work | A qualified concreting quote request |
| $100 referral program | Private individuals, builders, and trade businesses referring a potential concreting customer | A traceable referred opportunity |
| CGS growth enquiry | Construction and trade businesses seeking websites, lead generation, automation, and referral systems | A qualified Construction Growth Systems enquiry |

The design follows the approved **Clean Two-Brand Split**. Concrete Concepts remains the concreting brand. The referral program appears as a dedicated Concrete Concepts page because it directly supplies concreting work. **CGS — Construction Growth Systems** is presented as a separate marketing brand and destination.

> **Design rule:** one audience, one page, one form, and one conversion event.

## 2. Goals and Non-Goals

The implementation will create a mobile-first referral page, a referral submission flow, a distinct CGS marketing landing page, and isolated analytics events. It will preserve the existing Concrete Concepts homepage and quote journey.

The initial release will not include partner accounts, referral dashboards, automatic reward payments, bank-detail collection, complex CRM automation, or a standalone CGS domain. These may be added after the basic referral and CGS demand has been validated.

## 3. Brand and Information Architecture

| Brand or page | URL at initial launch | Visual identity | Primary call-to-action |
|---|---|---|---|
| Concrete Concepts homepage | `/` | Existing navy and gold | **Get a Concrete Quote** |
| Concrete Concepts referral program | `/trade-referral-program` | Existing navy and gold | **Refer a Job** |
| CGS landing page | `/construction-growth-systems` initially, designed for migration to a separate CGS domain | Charcoal, white, and construction gold | **Request a Growth Review** |

The main navigation or footer will contain a restrained **Referrals** or **For Referrers** link. A discreet footer attribution will read **Website and growth systems by CGS** and link to the CGS landing page. Neither link will compete with the quote call-to-action in the homepage hero or the principal paid-search journey.

Google recommends that landing pages closely match the associated ad, keyword, and call-to-action, and that visitors can quickly perform the intended action.[1] Consequently, the existing concreting pages will remain focused on concreting services and quote capture.

## 4. Referral Program Offer

The referral program will be available to **private individuals, builders, and trade businesses**. A valid referrer receives **$100** after the referred concreting job has been accepted, completed, and paid in full.

The page will communicate the process in three steps: submit the referral, Concrete Concepts contacts and quotes the customer, and the qualifying referrer receives $100 after completion and payment. It will state that duplicate or previously known opportunities do not qualify and that Concrete Concepts determines eligibility.

No bank or payment details will be requested publicly. Payment arrangements will occur privately after a referral qualifies.

## 5. Referral Page Structure

| Section | Purpose |
|---|---|
| Hero | State the $100 reward and identify eligible referrers immediately |
| How it works | Explain submission, quoting, and reward payment in three concise steps |
| Suitable projects | Reinforce the concreting work and service area sought |
| Referral form | Capture referrer, customer, project, consent, and attribution data |
| Terms summary | Set eligibility, duplicate-lead, completion, and payment expectations |
| Privacy note | Explain the handling of customer details and the referrer’s consent confirmation |
| Contact fallback | Provide the Concrete Concepts phone number if the form fails or the referral is urgent |

The design will reuse the established Concrete Concepts layout, typography, navy, gold, and trust signals. The page will use a single primary action and will not promote CGS above the referral form.

## 6. Referral Form

### 6.1 Visible Fields

| Field | Type | Requirement |
|---|---|---|
| Referrer type | Select or segmented control: Private Individual, Builder, Trade Business | Required |
| Referrer name | Text | Required |
| Referrer business name | Text | Required for Builder or Trade Business; optional for Private Individual |
| Referrer phone | Australian phone input | Required |
| Referrer email | Email | Optional but recommended |
| Customer name | Text | Required |
| Customer phone | Australian phone input | Required |
| Project suburb | Text | Required |
| Project type | Select using the existing Concrete Concepts service options | Required |
| Project notes | Text area | Optional |
| Consent confirmation | Checkbox confirming the customer has agreed to be contacted by Concrete Concepts | Required |

### 6.2 Captured Metadata

The client will also submit `lead_type`, timestamp, current URL, referring URL, UTM source, UTM medium, UTM campaign, UTM content, UTM term, and `gclid` when present. The referral `lead_type` will be `trade_referral` even though private individuals are eligible, because the route and conversion event are designed around referred trade work rather than a direct customer quote.

A unique human-readable reference will be returned after successful submission, for example `CCG-REF-8F4K2M`. The success state will remind the referrer that the reward is payable only after the referred job is completed and paid.

## 7. CGS Landing Page

The CGS page will lead with a broader offer rather than website design alone:

> **Construction Growth Systems turns a trade business into a consistent lead-generating and follow-up system.**

The page will present four connected capabilities: high-converting construction websites, lead capture, automated follow-up, and referral or enquiry tracking. Concrete Concepts may be presented as a live example of the system, without allowing the CGS message to appear on paid concreting landing pages.

| Section | Purpose |
|---|---|
| Hero | Explain the Construction Growth System and offer a growth review |
| Problem | Describe missed leads, slow follow-up, weak websites, and inconsistent referral tracking |
| System components | Present website, lead capture, follow-up, and tracking as one system |
| Concrete Concepts example | Demonstrate the concept through an authentic construction-business implementation |
| Qualification | Identify suitable builders, trades, and construction service businesses |
| Enquiry form | Capture a qualified CGS prospect |
| Closing call-to-action | Repeat the growth-review offer |

The CGS form will capture name, business name, email, phone, trade or construction category, current website, principal growth problem, and notes. Its `lead_type` will be `cgs_growth_enquiry`.

## 8. Data Flow and Submission Behaviour

Each form will submit to a dedicated application endpoint rather than sharing a generic route:

| Form | Endpoint | Lead type | Success event |
|---|---|---|---|
| Existing concrete quote | `/api/send-quote` | `concrete_quote` | `customer_quote_submitted` |
| Referral form | `/api/send-referral` | `trade_referral` | `trade_referral_submitted` |
| CGS form | `/api/send-cgs-enquiry` | `cgs_growth_enquiry` | `cgs_growth_enquiry_submitted` |

The server will validate all required fields, normalise phone numbers, generate the referral reference, and route the lead to the designated inbox or connected lead workflow. Public responses will never expose credentials or internal provider details.

The form will prevent repeated submission while a request is in flight. On success, the form will clear only after confirmation has been displayed. On failure, the visitor’s entered information will remain present and the page will offer **Try Again** plus a direct phone fallback.

## 9. Analytics and Google Ads Isolation

The existing Google Ads account will continue to optimise for genuine concreting quote submissions and qualified customer phone calls. The referral and CGS events will not fire the existing quote conversion action.

| Event | Analytics purpose | Google Ads treatment for concreting campaigns |
|---|---|---|
| `customer_quote_submitted` | Direct customer quote lead | Primary conversion |
| `trade_referral_submitted` | Referral-program demand and referred opportunity | Secondary or excluded |
| `cgs_growth_enquiry_submitted` | CGS demand | Excluded; later used in a separate CGS campaign or account |

Google defines primary conversions as the actions used for bidding, while secondary conversions are observation-only unless deliberately added to a custom goal.[2] Google also supports campaign-specific conversion goals when campaigns need to optimise for different outcomes.[3]

The implementation will use a central tracking helper so event names and payloads are consistent. It will verify the real Google Ads conversion ID and label rather than assuming a readable event name is a valid Google Ads conversion label.

## 10. Validation, Privacy, and Abuse Controls

The implementation will validate Australian mobile and landline formats leniently enough to accept common spaces and prefixes while rejecting clearly invalid numbers. Required consent must be checked before the customer’s details are accepted.

Basic abuse protection will include server-side validation, maximum field lengths, sanitisation, an invisible honeypot field, and request throttling where supported. Duplicate referrals will not be blocked purely in the browser; they will be reviewed against customer phone, suburb, timing, and existing lead records so legitimate resubmissions are not silently lost.

The referral terms will explain that the referrer confirms permission to supply the customer’s details, rewards apply only to new eligible opportunities, duplicate referrals are resolved by the earliest valid submission, and payment depends on job completion and full customer payment. These terms are operational guidance and should be reviewed before public launch.

## 11. Accessibility and Responsive Behaviour

All fields will have persistent labels, programmatic error associations, keyboard access, visible focus states, and touch targets appropriate for mobile use. Status messages will be announced through an accessible live region. The page will respect reduced-motion settings and preserve the current mobile call and quote access without allowing the sticky bar to hide form controls.

## 12. Error Handling

| Condition | Visitor experience | System behaviour |
|---|---|---|
| Missing or invalid field | Field-specific plain-English error | No request sent |
| Consent not checked | Clear request to confirm customer permission | No request sent |
| Network or provider failure | Form remains filled; retry and phone options appear | Error logged without sensitive content |
| Duplicate click | Button remains disabled while sending | One request processed |
| Successful submission | Confirmation, reference, reward reminder, and next step | Correct event fired once |
| Analytics unavailable | Submission still succeeds | Tracking failure does not block the lead |

## 13. Testing Strategy

The implementation will use component and integration tests for validation and event isolation, followed by a production-style build and manual route checks.

| Test area | Required verification |
|---|---|
| Referral validation | Referrer types, conditional business field, phone validation, required customer data, and consent |
| CGS validation | Required identity, business, contact, and growth-problem fields |
| Submission states | Idle, sending, success, server failure, and retry |
| Event isolation | Each form fires only its named event and never another journey’s conversion |
| Attribution | UTM parameters, `gclid`, current URL, and referrer are retained |
| Routing | Direct navigation and refresh work for both new routes |
| Regression | Existing quote form and homepage calls-to-action still work |
| Responsive layout | Key mobile, tablet, and desktop viewport checks |
| Accessibility | Labels, keyboard navigation, focus, errors, and status announcement |

## 14. Acceptance Criteria

The feature is complete when all three lead journeys have distinct pages or contexts, forms, endpoints, lead types, and success events; the $100 referral terms are visible and accurate; private individuals, builders, and trade businesses can submit referrals; customer name and phone are collected only after consent confirmation; the CGS page presents the complete growth-system offer; unrelated conversions do not contaminate the Concrete Concepts Google Ads bidding signal; all required tests pass; and the production build succeeds.

## 15. Implementation Sequence

Implementation will proceed in the following order: establish reusable attribution and tracking helpers; add route-aware metadata; build the referral page and form; add the referral endpoint; build the CGS page and form; add the CGS endpoint; add navigation and footer links; isolate events and conversions; write automated tests; run build, accessibility, and responsive checks; and then prepare deployment instructions.

## References

[1]: https://support.google.com/google-ads/answer/6238826?hl=en "Google Ads Help — Optimize your ads and landing pages"
[2]: https://support.google.com/google-ads/answer/11461796?hl=en "Google Ads Help — About primary and secondary conversion actions"
[3]: https://developers.google.com/google-ads/api/docs/conversions/goals/campaign-goals "Google Ads API — Campaign goals"
