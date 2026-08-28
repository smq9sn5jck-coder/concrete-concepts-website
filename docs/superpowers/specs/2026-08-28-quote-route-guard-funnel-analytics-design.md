# CCG Quote-Route Guard and Funnel Analytics Design

**Date:** 28 August 2026  
**Status:** Design approved; written specification awaiting director review  
**Production site:** [concreteconceptsgroup.com](https://concreteconceptsgroup.com/)  
**Protected route:** [`/get-quote`](https://concreteconceptsgroup.com/get-quote)

## 1. Purpose

This change prevents an approved website release from silently replacing CCG's paid quote funnel with a client-side 404. It also records privacy-safe funnel events so the director can see whether prospective customers abandon the quote page at contact, location, job brief, measurements/photos, review or submission.

The incident on 28 August showed that an HTTP 200 response is not a sufficient health check. Deployment `2b75bf32` served the application shell successfully while the browser rendered `404 Page Not Found` at `/get-quote`. The guard must therefore render the application and verify a route-specific marker after JavaScript runs.

## 2. Confirmed source-of-truth finding

The managed project at `/home/ubuntu/concrete-concepts-landing`, current checkpoint commit `38840b3`, produces the same entry JavaScript and CSS asset fingerprints as restored Cloudflare production deployment `a98287a4`. It contains the five-step `ComprehensiveQuoteWizard`, authoritative form validation, primary/fallback delivery and confirmed-submit conversion handling.

The selected GitHub repository `smq9sn5jck-coder/concrete-concepts-website`, current commit `d87b90b`, is a separate, incomplete website source. It contains no `/get-quote`, `GetQuote` or `Step 1 of 5` reference. An ad-hoc Cloudflare deployment from that commit caused the route incident.

> **Source rule:** No production deployment may proceed unless its built application contains the comprehensive `/get-quote` route and passes the pre-deploy and post-deploy checks defined below.

The verified managed project remains the implementation base. The GitHub website repository must be brought back into line with the verified source before it can be treated as an approved production source. Until then, it must be marked as production-deploy blocked. This guard cannot prevent a person with a broad Cloudflare credential from deliberately bypassing the approved workflow; reducing that residual risk would require separate token and access-control work.

## 3. Scope

| Included | Excluded |
|---|---|
| Deterministic `/get-quote` route assertions | Google Ads budget, bidding, keyword, goal or status changes |
| Build-artifact verification | A new CCG analytics dashboard |
| Browser-rendered apex and www checks | Customer session replay, heatmaps or field-level recording |
| Automatic rollback to the captured prior deployment when an approved release fails live checks | Any weakening of phone, email, service-area, anti-spam or consent validation |
| Existing-analytics custom events for funnel stages | Names, phones, emails, addresses, job descriptions, photo URLs or click IDs in analytics |
| Tests for event allowlisting, deduplication and conversion non-duplication | A recurring five-minute monitoring service in this release |

## 4. Release-guard architecture

### 4.1 Source assertion

A small release manifest will identify the CCG production project and required route contract. The deploy command will refuse to run unless all of the following are present in source:

| Required contract | Evidence |
|---|---|
| Route registration | `App.tsx` registers `/get-quote` |
| Page component | `GetQuote.tsx` loads the comprehensive wizard |
| Wizard marker | `ComprehensiveQuoteWizard.tsx` contains `Step 1 of 5` and five configured steps |
| Confirmed conversion boundary | `trackQuoteConversion` remains inside primary or successful fallback completion handling |
| Worker/form contract | The production bundle contains the quote and photo routes used by the wizard |

### 4.2 Pre-deploy checks

The approved release workflow will run in this order:

1. Install locked dependencies.
2. Run deterministic Vitest suites, excluding only the existing external live-email checks.
3. Run TypeScript checking.
4. Build the production bundle.
5. Verify Worker syntax.
6. Inspect the built application for the `/get-quote` route, the `Step 1 of 5` marker and the quote submission endpoint contract.
7. Stop before upload if any assertion fails.

### 4.3 Post-deploy browser check

Immediately before upload, the release process records the current canonical Cloudflare deployment ID. After upload, it uses headless Chrome to render:

- `https://concreteconceptsgroup.com/get-quote`
- `https://www.concreteconceptsgroup.com/get-quote`

The check retries during normal alias propagation, then requires all of the following:

| Check | Pass condition |
|---|---|
| Network | Final response is HTTP 200 |
| Route | Browser URL remains `/get-quote` |
| Page identity | Title contains `Get a Free Concrete Quote` |
| Wizard identity | Rendered DOM contains `Step 1 of 5` and `How can we reach you?` |
| Required fields | Name, Australian mobile and email inputs exist |
| Route-error exclusion | Rendered DOM does not contain `Page Not Found` |

### 4.4 Automatic rollback

If either production hostname fails the rendered route contract, the release process calls Cloudflare's rollback endpoint using the deployment ID captured before upload. It then re-runs the browser contract against both hostnames. The workflow remains failed even when rollback succeeds, ensuring the defective release cannot be mistaken for a success.

The rollback routine does not change Google Ads. It only restores the prior Cloudflare Pages deployment.

## 5. Option A funnel analytics

The site already loads an Umami-compatible analytics collector. Umami's browser API supports named custom events and typed event properties through `umami.track(eventName, data)`.[1] [2] The implementation will extend that existing collector rather than creating a new database or dashboard.

### 5.1 Event contract

| Event | Trigger | Allowed properties | Deduplication |
|---|---|---|---|
| `quote_page_view` | Wizard mounts | `traffic_class`, `page_variant` | Once per page load |
| `quote_step_reached` | A numbered step becomes visible | `step`, `step_name`, `traffic_class` | Once per step per page load |
| `quote_validation_blocked` | Continue or submit is blocked | `step`, `validation_code` | Once per step/code per page load |
| `quote_submit_started` | Fully valid review is submitted | `traffic_class`, `photo_state` | Once per submission attempt |
| `quote_submit_confirmed` | Primary or fallback delivery reports success | `delivery_path`, `traffic_class` | Once per completed request |
| `quote_submit_failed` | Both accepted delivery paths fail | `failure_stage`, `traffic_class` | Once per failed attempt |

### 5.2 Privacy allowlist

The analytics helper accepts only enumerated values. It cannot receive the quote form object.

**Allowed values** are step numbers, fixed step names, generic validation codes, a broad traffic class, whether photos were absent/present/pending, and the primary/fallback delivery path.

**Forbidden values** are name, phone, email, company, street address, suburb, postcode, services selected, measurements, job description, access notes, photo filename or URL, consent values, referrer URL, UTM text, `gclid`, `fbclid`, IP address and raw error messages.

The broad `traffic_class` value may be `paid`, `organic`, `referral`, `direct` or `other`. Raw attribution identifiers are never forwarded to funnel analytics.

### 5.3 Reliability behaviour

Because the analytics script loads asynchronously, events will pass through a small in-memory queue with a short retry window. If the collector remains unavailable, analytics fails silently and never blocks navigation, validation, photo upload or form submission. At most 20 events are retained in the page session, preventing unbounded memory use.

### 5.4 Google Ads non-duplication rule

Funnel events are ordinary analytics events only. They never use the Google Ads `conversion` event name or a Google Ads conversion label. The existing `trackQuoteConversion` call remains the only quote-conversion trigger and runs only after primary delivery succeeds or the fallback explicitly reports success.

## 6. Component boundaries

| Unit | Responsibility | Must not do |
|---|---|---|
| `quoteFunnelAnalytics.ts` | Validate, deduplicate, queue and dispatch allowed custom events | Import form data types or receive customer-entered values |
| `ComprehensiveQuoteWizard.tsx` | Emit lifecycle events at existing validation and submit boundaries | Change field requirements or create a second conversion |
| Release guard script | Validate source and built route contract | Deploy or mutate Cloudflare during unit tests |
| Live verification script | Render apex/www after release and report contract failures | Submit a quote or interact with customer data |
| Rollback wrapper | Capture prior deployment, deploy, verify and restore on failure | Change DNS, domains or Ads settings |

## 7. Test design

Tests will be written before implementation and must initially fail for the missing behaviour.

| Test group | Required cases |
|---|---|
| Route contract | App route present; wizard marker present; five steps present; built bundle contains route contract |
| Event privacy | Allowed keys pass; every forbidden customer or attribution key is rejected/omitted; raw errors cannot be sent |
| Deduplication | Page view and each step fire once; back-navigation does not duplicate; repeated same validation block is deduplicated |
| Form flow | Steps emit only after becoming visible; invalid continue emits generic code; submit-started requires a valid review |
| Delivery | Primary success emits one confirmed event; fallback success emits one confirmed event with `fallback`; total failure emits failed, not confirmed |
| Conversion safety | `trackQuoteConversion` still appears only after confirmed primary/fallback success and is never called by funnel events |
| Release failure | A fixture missing `/get-quote` or `Step 1 of 5` fails the guard; a valid fixture passes |

## 8. Acceptance criteria

The implementation is ready for final publish approval only when:

1. Focused guard and analytics tests pass.
2. The complete deterministic test suite passes, except only the already-documented external Resend checks if they remain unavailable.
3. TypeScript passes.
4. Production build and Worker syntax pass.
5. The build guard passes against the generated release.
6. Desktop and 390 × 844 mobile checks can traverse the five-step wizard without creating a lead.
7. Captured event payloads contain no forbidden values.
8. One success-path test proves a single Google Ads quote conversion remains behind confirmed delivery.
9. The exact production diff and rollback target are presented to the director for confirmation.
10. After approved publication, apex and www pass the rendered route contract and Cloudflare reports the new deployment as canonical.

## 9. Rollout sequence

The work will be implemented first in the verified managed project. The incomplete GitHub website repository will remain blocked from production use until its main branch is synchronised with the verified release and the same guard. No production publication will occur during implementation. The director receives a final evidence pack and explicit confirmation request before upload.

## References

[1]: https://docs.umami.is/docs/track-events "Umami documentation — Track events"
[2]: https://docs.umami.is/docs/event-data "Umami documentation — Event data"
