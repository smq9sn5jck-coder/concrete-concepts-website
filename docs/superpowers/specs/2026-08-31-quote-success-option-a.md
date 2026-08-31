# Detailed Quote Success Experience — Option A

**Status:** Approved for implementation
**Date:** 31 August 2026
**Scope:** `ComprehensiveQuoteWizard` success state only

## Purpose

Replace the current basic post-submit panel with a clearer, more reassuring confirmation after a detailed quote has been accepted by the primary server path or its verified fallback. The experience must not change validation, payloads, delivery channels, failure handling or Google Ads conversion semantics.

## Approved Customer Experience

After verified delivery, the wizard is replaced by a semantic `role="status"` region with `aria-live="polite"` and programmatic focus on its heading. It contains:

1. A restrained animated green check and confirmation glow.
2. The exact primary heading **“Quote request received”**.
3. A personalised thank-you using the customer's first name.
4. A truthful receipt statement explaining that the job details were received.
5. A preferred-contact summary using the selected SMS, phone-call or email label.
6. Three numbered next steps: review details, assess whether a site visit is required, then contact the customer to discuss the quote.
7. A CCG Call button linking only to `tel:0424463268` and retaining secondary call-click tracking.

## Motion and Accessibility

The confirmation card may fade and move upward slightly; the check may scale into place and its surrounding ring may pulse once. All motion must stop or reduce to opacity-only behavior when the user requests reduced motion. The success heading receives focus after confirmed delivery so keyboard and screen-reader users are moved to the new state. Decorative motion is hidden from assistive technology.

## Protected Business Rules

The success state appears only after `trpc.quote.submit` succeeds or after `submitFormFallback` returns `success: true`. Error and retry paths must never show it. The Google Ads `trackQuoteConversion` call remains in the two verified success branches only and fires once per accepted submission path. No phone, SMS, WhatsApp or page-view interaction becomes a primary quote conversion.

## Acceptance Tests

The test suite must require the exact heading, personalised thank-you, contact summary, three next steps, live-region semantics, focus target, reduced-motion handling and tracked CCG Call button. It must also preserve the two and only two source calls to `trackQuoteConversion` behind confirmed primary and fallback delivery.
