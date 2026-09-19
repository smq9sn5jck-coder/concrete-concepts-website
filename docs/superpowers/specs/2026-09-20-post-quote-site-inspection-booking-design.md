# Post-Quote Site Inspection Booking Design

**Author:** Manus AI  
**Date:** 20 September 2026  
**Status:** Approved for implementation

## Goal

Add an optional **site inspection booking** step after a detailed quote has been successfully delivered. The feature must preserve the existing qualified-lead funnel, keep the quote receipt and conversion semantics unchanged, and let the customer either open the existing Calendly booking page or request the same booking link by SMS.

The public booking path will use the existing active Calendly event, **Free Site Inspection & Fixed Quote**. CalendarBridge will remain a back-office calendar synchronisation and scheduling-assistant layer rather than becoming a dependency of the customer-facing quote flow.

## Approved Customer Flow

The customer completes the existing five-step quote form first. The saved brief retains the customer’s contact details, physical site address when supplied, suburb and postcode, requested services, work type, concrete finish or material preference, measurements or approximate quantity, access conditions, requested project timeframe, notes and photos.

After the primary quote submission succeeds, the existing receipt displays three actions:

1. **Book site inspection now** opens the existing Calendly event in a new tab.
2. **Text me the booking link** sends one transactional SMS to the mobile number already supplied in the quote.
3. **Call 0424 463 268** retains the existing tracked telephone fallback.

The SMS action identifies its destination with a masked mobile number, such as `04•• ••• 268`. While the request is running, the action is disabled and reports progress. A successful request changes the message to **Booking link sent**. A duplicate request reports **Booking link already sent** and does not send a second message.

The external-form emergency fallback continues to show the direct Calendly and call actions. It does not show the SMS action because that branch has no locally persisted quote record or scoped delivery token.

## Calendly Configuration

The existing Calendly event remains active with its approved **30-minute** duration and current **Australia/Brisbane** availability schedule. The public destination is:

`https://calendly.com/concreteconceptsgroup-info/free-site-inspection-fixed-quote`

The booking screen will ask the invitee to confirm the physical site address. It should also invite concise access or appointment notes. The detailed work scope stays in the quote record; it must not be copied into the booking URL.

Name and email may be prefilled where Calendly supports standard query parameters. The implementation must not place the phone number, physical address, quote notes, photos, material choice, measurements, quantities, tracking identifiers or delivery token in the Calendly URL.

## SMS Content and Consent

The customer sends the SMS by deliberately selecting **Text me the booking link** after the quote is accepted. This is an explicit request for a one-time transactional message and is separate from the optional marketing checkbox.

The message will use this structure:

> Concrete Concepts: Thanks {firstName}. Your quote request is in. Book your free 30-minute site inspection here: https://calendly.com/concreteconceptsgroup-info/free-site-inspection-fixed-quote. Questions? Call 0424 463 268. Reply STOP to opt out.

The message identifies the sender, states the transactional purpose, uses the approved public booking URL, includes the business telephone number and includes an opt-out instruction. Twilio documents that standard opt-out keywords sent through a Messaging Service create enforceable opt-out records; later attempts are rejected while the opt-out remains active.[1]

## Server Data Flow

A successful primary quote submission will return an opaque delivery token only after the quote record has been persisted. The token will be random, scoped to the saved quote and valid for 24 hours. The browser stores it only in the active success-screen state.

A new public tRPC mutation will accept the delivery token. It will not accept a phone number, customer name or arbitrary message body. The server will:

1. Hash the supplied token and find the matching unexpired quote delivery record.
2. Reject unknown, malformed or expired tokens without exposing quote data.
3. Validate the stored Australian mobile number again.
4. Claim the one-time send before contacting Twilio so concurrent clicks cannot create duplicate messages.
5. Build the message from fixed server-side copy and the saved first name.
6. Send through the existing Twilio transport.
7. Record the final delivery state and a customer-originated timeline event.

The customer response contains only a status such as `sent`, `already_sent`, `unavailable` or `failed`. It never returns the stored phone number, quote details, Twilio credentials or provider message identifier.

## Persistence

A dedicated `quote_booking_deliveries` table will keep the delivery workflow separate from quote status and marketing follow-ups. Each row will contain:

| Field | Purpose |
|---|---|
| `quoteRequestId` | Associates the request with the saved detailed quote. |
| `tokenHash` | Stores a one-way hash rather than the browser token. |
| `expiresAt` | Enforces the 24-hour success-screen window. |
| `status` | Tracks `available`, `sending`, `sent`, `failed` or non-retryable `uncertain`. |
| `requestedAt` | Records the customer’s explicit click. |
| `sentAt` | Records successful provider acceptance. |
| `failedAt` | Records the latest failed attempt without customer data. |
| `attemptCount` | Supports bounded retries and abuse detection. |
| `providerMessageId` | Optional operational reference; never returned to the client. |
| `createdAt` and `updatedAt` | Support audit and troubleshooting. |

The table will enforce one booking-delivery row per quote and a unique token hash. Customer-facing retries may move a confirmed `failed` result back to `sending` within the token lifetime. Both `sent` and `uncertain` are terminal for customer retries. Twilio notes that duplicate messages almost always mean the application submitted multiple provider requests, so an ambiguous network result must not trigger an automatic or customer-initiated retry.[2]

## Security and Abuse Controls

The raw delivery token will never be logged or stored. The server will hash it with SHA-256 before lookup. The mutation will use strict Zod validation, the existing request context for an address fingerprint, a dedicated per-token limit, and an address-level rate limit.

The system will claim a delivery atomically before calling Twilio. A successful claim is required before any provider request. This prevents rapid double-clicks or parallel requests from sending duplicate texts.

Application logs will use only the quote identifier, final state and a redacted provider error class. They must not log the mobile number, raw token, message body, site address or quote details. No secret, sender number or account identifier will be added to client code.

## Failure Behaviour

A database, Twilio or network failure must not invalidate or duplicate the already submitted quote. The receipt, direct Calendly action and call action remain available.

| Condition | Customer behaviour |
|---|---|
| Twilio is not configured | Explain that text delivery is unavailable and keep the direct booking action visible. |
| Token is invalid or expired | Ask the customer to use the direct booking action or call the business. |
| First provider attempt fails | Show a concise retry option while the token remains valid. |
| Provider acceptance cannot be confirmed | Mark the delivery `uncertain`, disable SMS retry and ask the customer to check messages or use the direct booking action. |
| Message has already been sent | Report that it was already sent and do not contact Twilio again. |
| Emergency quote fallback succeeded | Omit the SMS action; retain direct booking and call actions. |
| Calendly is unavailable | The submitted quote remains safe and the call action remains available. |

## Component Boundaries

The customer interface will live in a small `QuoteSuccessBooking` component under `client/src/components/quote/`. It receives the customer’s name and email for approved Calendly prefilling, a masked display number, and the optional delivery token. It does not receive Twilio credentials, a provider identifier or an editable booking URL.

Server-side message composition will be isolated from the Twilio transport. Token creation, hashing, expiry, state transitions and customer-safe result mapping will be testable without a database or live provider call. The quote mutation will create the delivery record only after confirmed database persistence and return the raw token only in that branch.

## CalendarBridge Role

CalendarBridge remains connected to the business Google and Microsoft calendars. It can continue to synchronise busy time and support the active AI scheduling assistant for exceptions or email conversations. The public website will not call CalendarBridge directly, so a CalendarBridge outage cannot block quote submission or the existing Calendly booking page.

## Test-First Acceptance Criteria

Before implementation, failing tests will require the following behaviour:

1. The quote success screen shows the direct booking action and existing call action on both verified delivery branches.
2. Only the primary persisted branch receives and renders the SMS delivery token.
3. The booking URL contains only the approved Calendly destination plus permitted name and email prefill values.
4. The SMS component masks the mobile number and reports loading, sent, already-sent, retry and unavailable states accessibly.
5. Message composition uses fixed copy, the saved first name, the approved booking URL, the business phone number and the opt-out instruction.
6. Invalid or expired tokens never invoke the SMS transport.
7. A successful delivery is idempotent and parallel claims cannot send twice.
8. Failed sends can be retried within the token lifetime without losing the original quote.
9. Ambiguous provider outcomes become non-retryable so a persistence or network fault cannot produce a duplicate SMS.
10. The quote conversion tracker remains limited to the existing two confirmed-delivery branches.
11. No real SMS is sent by the automated test suite.

After implementation, focused tests, the full Vitest suite, TypeScript, database migration generation, the guarded production build and browser checks at mobile and desktop sizes must pass.

## Release and Rollback

The feature will be prepared as a focused website change. Before production release, the deployment environment must be checked for `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and `TWILIO_PHONE_NUMBER` without exposing their values. The active Calendly event and physical-address question will be re-read after configuration.

The deployment will be accepted only after the quote route, primary success screen, emergency fallback, direct Calendly action, SMS-disabled state and accessible feedback are verified. The preceding accepted production deployment remains the rollback point. The database migration is additive; rollback may leave the unused table in place while restoring the previous application build.

## References

[1]: https://www.twilio.com/docs/messaging/features/consent-api "Twilio Consent Management API"

[2]: https://www.twilio.com/docs/messaging/guides/debugging-common-issues "Twilio Debugging Common Messaging Issues"

[3]: https://calendly.com/concreteconceptsgroup-info/free-site-inspection-fixed-quote "Concrete Concepts Group Free Site Inspection and Fixed Quote"
