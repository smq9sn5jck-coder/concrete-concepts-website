# Site Inspection Booking Release Verification

**Author:** Manus AI

**Date:** 20 September 2026
**Status:** Verified

## Scope

This release adds an optional post-quote Calendly site-inspection action and an explicit one-time SMS booking-link action. It keeps the quote receipt, tracked telephone action, emergency external-form fallback and primary quote-conversion semantics intact.

## Automated Evidence

The focused quote and booking suite passes **44/44** tests across the booking token, SMS delivery, booking presentation, success receipt, sharing, comprehensive quote and funnel integration contracts. The router-level booking suite includes passing contracts for token-only access, malformed-token rejection and Twilio-unavailable behavior. The tests also verify that quick-quote submissions cannot receive a booking SMS token and that ambiguous provider outcomes cannot be retried. TypeScript passes and the guarded production build completes successfully with the quote build contract intact.

The full repository suite passes **611 tests across 54 test files**. The remaining 21 failures are existing environment- or seeded-data-dependent checks for missing Resend, Google Ads, Windsor.ai and BFL credentials, plus blog fixtures unavailable without the configured database. None of the new booking, quote, success, routing or migration tests fail.

## Calendly Evidence

The existing event **Free Site Inspection & Fixed Quote** remains active at 30 minutes in the `Australia/Brisbane` timezone. Its existing hours remain Monday to Friday from 7:00 am to 4:00 pm and Saturday from 8:00 am to 12:00 pm. The event now uses the invitee-supplied physical location and its description asks the customer to confirm the site address and access notes.

## Desktop Browser Evidence

The production build was served locally and the detailed quote workflow was completed with synthetic data. The final `quote.submit` network call was intercepted and replaced with a local success response, so the test created no lead, advertising conversion, email or SMS.

At 1366 pixels wide, the success receipt remained focused and announced as a polite status. The new optional panel appeared beneath the existing three next steps. It showed:

- **Book site inspection now**, opening the approved Calendly page in a new tab with only name and email prefilled.
- **Text me the booking link**, available only because the intercepted primary response contained a delivery token.
- The masked destination `04•• ••• 678`.
- The retained tracked call action and existing Share CCG action.

The Calendly URL contained no phone number, physical address, project notes, photos, material choice, quantity, tracking identifier or delivery token.

Desktop screenshot evidence was saved as `site-inspection-booking-desktop.png` in the Playwright workspace. The next responsive check uses a 390 × 844 pixel viewport.

## Mobile Browser Evidence

At 390 × 844 pixels, the receipt and booking panel remained within the 390-pixel viewport with no horizontal overflow in the accessibility bounds. Both booking actions remained full-width and at least 52 pixels tall. The masked destination, call action, Share CCG action and final confirmation copy wrapped without clipping. The success heading retained focus and the new feedback region remained polite and atomic. Mobile screenshot evidence was saved as `site-inspection-booking-mobile.png` in the Playwright workspace.

The local runtime had no Twilio credentials. Selecting **Text me the booking link** therefore exercised the real unavailable branch without sending a message. The interface displayed an accessible alert, retained the direct Calendly action and retained the call fallback.

For the success-state check, the `quote.sendBookingLink` network call was intercepted with a local `sent` response before selecting the retry action. This prevented any provider request or customer message.

The successful state changed the action to **Booking link sent**, disabled the button to prevent a duplicate click, and announced **Booking link sent to 04•• ••• 678** in the polite live region. The direct Calendly, call and sharing actions remained available. Screenshot evidence was saved as `site-inspection-booking-sms-sent-mobile.png` in the Playwright workspace.

The server state machine permits a retry only after a confirmed provider rejection. A transport exception, concurrent claim or post-provider persistence fault leaves the delivery non-retryable and tells the customer to check existing messages before using the direct booking or call fallback.

## Console and Network Review

The only browser-console errors were the existing local-build analytics placeholder attempting to load `%VITE_ANALYTICS_ENDPOINT%/umami` as a script. They are unrelated to the booking feature and do not occur when the production analytics environment is supplied. No booking-component exception, React error or accessibility runtime error appeared.

The intercepted quote submission created no request. The one deliberate real call was the local `quote.sendBookingLink` request used to verify the no-Twilio fallback; it returned HTTP 200 and did not contact a provider because all three local Twilio variables were confirmed unset. The successful SMS state was then tested with a browser-local intercepted response.

## Release Conclusion

The implementation satisfies the approved post-quote workflow. Final source diff review and repository commit are the only remaining release-preparation steps.
