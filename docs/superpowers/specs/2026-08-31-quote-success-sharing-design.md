# Quote Success Sharing Design

**Author:** Manus AI  
**Date:** 31 August 2026  
**Status:** Approved design; awaiting written-spec review before implementation

## Goal

Add a secondary **Share CCG** action to the verified detailed-quote success screen. The action should help a satisfied customer recommend Concrete Concepts Group without collecting another person’s details, promoting an unverified reward, or changing the quote receipt, Call action, lead-delivery flow or Google Ads conversion semantics.

## Approved Destination and Copy

The shared destination is the canonical customer homepage:

`https://concreteconceptsgroup.com/`

The native share payload will use:

| Field | Approved value |
|---|---|
| Title | `Concrete Concepts Group` |
| Text | `Looking for concreting in Brisbane or South East Queensland? Take a look at Concrete Concepts Group.` |
| URL | `https://concreteconceptsgroup.com/` |

The copy makes no reward, price, discount, urgency, guarantee, insurance, licensing or service-outcome claim. It does not link to the separate referral-program page.

## User Experience

The existing yellow **Call 0424 463 268** action remains the strongest button. A visually quieter outline button appears directly below it:

> **Share CCG**

Selecting the button follows this order:

1. If the browser exposes `navigator.share`, open the native device share sheet with the approved payload.
2. If native sharing is unavailable, copy the canonical homepage URL through `navigator.clipboard.writeText`.
3. If clipboard access is unavailable or fails, reveal a read-only canonical URL that the customer can select and copy manually.

Successful native sharing shows a short polite confirmation. Copy success shows `Link copied — you can paste it anywhere.` Cancelling the native share sheet is treated as a neutral customer choice and produces no error. A genuine share or clipboard error reveals the manual URL and a concise accessible instruction.

## Accessibility

The action is a real `type="button"` with a visible focus state and a decorative share icon hidden from assistive technology. Feedback uses a dedicated `aria-live="polite"` status region. Clipboard failure uses an alert message and exposes a labelled read-only URL field that selects its value on focus. The new content must not move focus away from the already focused `Quote request received` heading when the success screen first appears.

The button and feedback must fit without horizontal overflow at 390 pixels and remain legible on desktop. No continuous or new decorative animation is required; the feature inherits the existing reduced-motion-safe success experience.

## Data, Privacy and Tracking

The feature is client-only. It creates no API request, referral submission, D1 row, email, Jotform entry or customer-data record. The share payload contains no quote details, customer name, phone, email, suburb, project description, UTM values, GCLID or other attribution identifiers.

Version one adds no new analytics event. In particular, the action must never invoke `trackQuoteConversion`, `trackReferralSubmission`, `trackPhoneCallClick`, the quote mutation or the fallback delivery endpoint. The existing primary quote conversion remains limited to the two verified successful-delivery branches.

## Component Boundary

The sharing logic will be isolated in a small `QuoteSuccessShare` component under `client/src/components/quote/`. It receives no quote or customer data. Its only input is the fixed public homepage URL, supplied through an internal constant. `ComprehensiveQuoteWizard` renders the component only inside the existing `submitted` branch.

This boundary keeps browser-capability checks, feedback state and clipboard-error handling separate from the already high-risk quote submission logic.

## Error Handling

| Condition | Required behavior |
|---|---|
| Native sharing succeeds | Show a polite thank-you confirmation. |
| Customer cancels native sharing | Leave the screen unchanged; do not show an error. |
| Native sharing throws another error | Attempt the copy-link fallback. |
| Clipboard succeeds | Show the copied-link confirmation. |
| Clipboard is unavailable or fails | Reveal the labelled manual-copy URL and alert instruction. |

All failure paths remain on the success screen and preserve the receipt, next steps and Call action.

## Test-First Acceptance Criteria

Before implementation, failing contracts will require the following behavior:

1. The verified-success branch renders **Share CCG** after the existing Call action.
2. The share payload contains only the approved title, text and canonical homepage URL.
3. Native Web Share is preferred when available.
4. The fallback calls `navigator.clipboard.writeText` with the canonical URL.
5. `AbortError` is silent, while a real failure exposes a labelled manual-copy URL and accessible alert.
6. The component has a polite live region and keyboard-visible button styling.
7. The source still contains exactly two `trackQuoteConversion` calls in the verified delivery branches and no share/referral conversion call in the new component.
8. The feature creates no backend request and receives no customer or quote fields.

After implementation, deterministic tests, TypeScript, the guarded production build and Worker syntax must pass. A browser check will exercise native-share success, copy fallback and manual-copy failure on mobile and desktop. The quote submission itself will remain intercepted so no real lead or conversion is created.

## Release and Rollback

The tested build will be uploaded to the existing Cloudflare Pages project as a focused release. Acceptance will verify the customer homepage, apex and www five-step quote routes, retained paid landing page, native/copy/manual share states and unchanged primary conversion branches. Production will be monitored for at least 15 minutes.

The current accepted Cloudflare production deployment `a1d5e1b6-178b-4638-9495-3159592d1373` is the direct rollback point.
