# Site Inspection Booking Release Verification

**Author:** Manus AI

**Date:** 20 September 2026
**Status:** Production verified

## Scope

This release adds an optional post-quote site-inspection booking workflow to the detailed quote form. After a verified quote submission, the client can either open the existing 30-minute Calendly booking page or explicitly request a one-time SMS containing the same booking link. Homepage quick quotes do not receive an SMS-delivery token. The existing quote receipt, tracked call action, sharing action, lead-delivery channels and primary conversion semantics remain intact.

## Production Architecture

The client-facing website is deployed through Cloudflare Pages. Its production Pages Worker creates and sends booking deliveries through the authenticated `ccg-lead-gate` Worker. The lead-gate service stores delivery state in its existing D1 database and sends the transactional message through its existing Twilio configuration. The shared server-to-server secret is configured in both Cloudflare services and is never exposed to the browser.

The D1 table records only the token hash, customer name, normalized mobile number, expiry and delivery state. The send operation uses an atomic state transition. Confirmed provider failures may be retried; concurrent claims, transport ambiguity and accepted-provider outcomes remain non-retryable to prevent duplicate messages.

## Automated Evidence

The exact production main branch passes TypeScript and the guarded production build. The focused production suite passes **64 tests across 12 files**, covering the Pages Worker, booking gateway, route authorization, success receipt, booking presentation, quote funnel, release workflow, live-route guard and concurrent homepage consolidation.

The Pages Worker runtime suite directly verifies four production-specific behaviors: successful detailed quotes receive a booking token, homepage quick quotes do not receive one, the SMS mutation is proxied through the authenticated gateway, and missing gateway configuration returns a safe unavailable state without contacting a provider. The release guard now rejects source or built artifacts that omit either booking-token creation or the SMS route.

The full repository baseline records **620 passing tests, 21 failures and one skipped test across 64 files**. The 21 failures are the established environment- or fixture-dependent checks for missing Resend, Google Ads, Windsor.ai and BFL credentials, together with blog data unavailable without the configured database. No booking, quote-success, routing, funnel, homepage or release-guard test fails.

## Calendly Evidence

The existing event **Free Site Inspection & Fixed Quote** remains active at 30 minutes in the `Australia/Brisbane` timezone. Its hours remain Monday to Friday from 7:00 am to 4:00 pm and Saturday from 8:00 am to 12:00 pm. The event uses the invitee-supplied physical location, and its description asks the client to confirm the site address and access notes.

## Browser Evidence

The production build was exercised locally with a fully synthetic, intercepted quote submission, so the browser checks created no lead, conversion, email or SMS. At 1366 pixels wide and at a 390 × 844 mobile viewport, the booking panel stayed within the page bounds and preserved the quote receipt hierarchy. Both actions remained full-width on mobile, the destination mobile number was masked, and the status feedback remained accessible through a polite live region.

The direct action opened Calendly with only the client name and email prefilled. The URL contained no phone number, physical address, project notes, photos, material choice, quantity, tracking identifier or delivery token. The unavailable state preserved direct booking and telephone fallbacks. An intercepted successful response changed the SMS action to **Booking link sent** and disabled it to prevent a duplicate click.

## Production Deployment Evidence

Cloudflare Pages production deployment `b0bcd192-4162-467d-8afa-1dfa7c3c907a` serves runtime commit `7bddaf3bccd76b7df24dbacf3152cd17c5e7cffe`. The deployment completed successfully with Pages Functions enabled, 57 static assets and both canonical aliases attached:

- `https://concreteconceptsgroup.com`
- `https://www.concreteconceptsgroup.com`

The canonical domains initially retained their prior 60-second HTML cache entry after deployment. Only the homepage and `/get-quote` URLs for both hosts were purged. Both domains then referenced the exact current-main assets `index-BhXYGrUU.js` and `GetQuote-B71ySgvN.js`.

The repository live-route verifier passed on both canonical `/get-quote` routes on its first attempt. The booking UI strings were present in the exact production quote asset. The authenticated website-to-gateway path was tested on both canonical domains and the immutable deployment URL with a deliberately invalid 64-character token. All three calls returned HTTP 200 with `{ status: "invalid" }`. A D1 query confirmed that the smoke-test token hash had no delivery record, so the test could not invoke Twilio or send a client message.

## Release History and Rollback

Website pull request [#4](https://github.com/smq9sn5jck-coder/concrete-concepts-website/pull/4) introduced the approved client workflow. Internal pull request [#2](https://github.com/smq9sn5jck-coder/concrete-concepts-internal/pull/2) versioned and released the lead-gate endpoint and D1 migration. Production smoke testing then identified that Cloudflare Pages handled API traffic through its own Worker rather than the Node router; website pull request [#5](https://github.com/smq9sn5jck-coder/concrete-concepts-website/pull/5) added the missing production route, executable regression tests and release guards.

The prior working Pages deployment `0bf847b2-a33f-4ac3-8995-a3afb13b0138` remains the immediate rollback point. The lead-gate Worker was deployed with existing bindings preserved, and the additive D1 migration was applied before the website release.

## Conclusion

The approved post-quote Calendly and one-time SMS workflow is live and verified in production. The final deployment contains the exact current main branch, including the concurrently merged homepage consolidation. Both canonical domains serve the current assets, the booking gateway authentication boundary is working, quick quotes remain excluded, and the no-side-effect production smoke test passed end to end.
