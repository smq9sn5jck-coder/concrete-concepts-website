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

The external-form emergency fallback continues to show the direct Calendly and call actions. It does not show the SMS action because that branch cannot receive a scoped delivery token from the production booking gateway.

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

Production discovery confirmed that the website is a direct-upload Cloudflare Pages project without a database or Twilio binding. The existing `ccg-lead-gate` Worker already owns the CCG D1 database and Twilio credentials. The implementation therefore uses that Worker as a narrow server-to-server booking gateway rather than duplicating customer data and provider secrets in the website project.

After a detailed quote has been accepted, the website server sends only the submitted name and validated mobile to the authenticated gateway creation endpoint. The gateway returns a random 24-hour opaque delivery token, stores only its SHA-256 hash and retains the destination in the existing CCG D1 environment. The browser stores the raw token only in the active success-screen state.

The public website tRPC mutation accepts only that opaque token. It forwards the token to the authenticated gateway send endpoint and never accepts a phone number, customer name or arbitrary message body. The gateway then:

1. Hashes the supplied token and finds the matching unexpired delivery record in D1.
2. Rejects unknown, malformed or expired tokens without exposing customer data.
3. Validates the stored Australian mobile number again.
4. Claims the one-time send atomically before contacting Twilio so concurrent clicks cannot create duplicate messages.
5. Builds the message from fixed Worker-side copy and the saved first name.
6. Sends through the existing `ccg-lead-gate` Twilio binding.
7. Records the final delivery state in D1.

Both website-to-gateway routes require a shared `BOOKING_GATE_SECRET` supplied as an encrypted Cloudflare environment variable and Worker secret. The customer response contains only a status such as `sent`, `already_sent`, `unavailable` or `failed`. It never returns the stored phone number, quote details, gateway secret, Twilio credentials or provider message identifier.

## Persistence

A dedicated `booking_link_deliveries` table in the existing `ccg-lead-gate` D1 database keeps the delivery workflow separate from lead status and marketing follow-ups. Each row contains:

| Field | Purpose |
|---|---|
| `tokenHash` | Stores a one-way hash rather than the browser token. |
| `customerName` | Supplies the first name for fixed transactional copy. |
| `customerPhone` | Stores the server-validated Australian mobile destination inside the existing CCG lead environment. |
| `expiresAt` | Enforces the 24-hour success-screen window. |
| `status` | Tracks `available`, `sending`, `sent`, `failed` or non-retryable `uncertain`. |
| `requestedAt` | Records the customer’s explicit click. |
| `sentAt` | Records successful provider acceptance. |
| `failedAt` | Records the latest failed attempt without customer data. |
| `attemptCount` | Supports bounded retries and abuse detection. |
| `providerMessageId` | Optional operational reference; never returned to the client. |
| `createdAt` and `updatedAt` | Support audit and troubleshooting. |

The table enforces a unique token hash. Customer-facing retries may move a confirmed `failed` result back to `sending` within the token lifetime. Both `sent` and `uncertain` are terminal for customer retries. Twilio notes that duplicate messages almost always mean the application submitted multiple provider requests, so an ambiguous network result must not trigger an automatic or customer-initiated retry.[2]

## Security and Abuse Controls

The raw delivery token will never be logged or stored. The gateway hashes it with SHA-256 before lookup. The website mutation uses strict Zod validation, the existing request context for an address fingerprint, a dedicated per-token limit and an address-level rate limit. The D1 routes additionally require the server-held shared secret.

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

Server-side message composition is isolated inside `ccg-lead-gate` from the public website. Token creation, hashing, expiry, state transitions and customer-safe result mapping are tested with an in-memory D1 double and mocked provider call. The quote mutation requests a delivery token only for the detailed quote branch and returns no token when the gateway is unavailable.

## CalendarBridge Role

CalendarBridge remains connected to the business Google and Microsoft calendars. It can continue to synchronise busy time and support the active AI scheduling assistant for exceptions or email conversations. The public website will not call CalendarBridge directly, so a CalendarBridge outage cannot block quote submission or the existing Calendly booking page.

## Test-First Acceptance Criteria

Before implementation, failing tests will require the following behaviour:

1. The quote success screen shows the direct booking action and existing call action on both verified delivery branches.
2. Only the detailed quote branch receives and renders an SMS delivery token from the production gateway.
3. The booking URL contains only the approved Calendly destination plus permitted name and email prefill values.
4. The SMS component masks the mobile number and reports loading, sent, already-sent, retry and unavailable states accessibly.
5. Message composition uses fixed copy, the saved first name, the approved booking URL, the business phone number and the opt-out instruction.
6. Invalid or expired tokens never invoke the SMS transport.
7. A successful delivery is idempotent and parallel claims cannot send twice.
8. Failed sends can be retried within the token lifetime without losing the original quote.
9. Ambiguous provider outcomes become non-retryable so a persistence or network fault cannot produce a duplicate SMS.
10. The quote conversion tracker remains limited to the existing two confirmed-delivery branches.
11. No real SMS is sent by the automated test suite.

After implementation, focused tests, the full Vitest suite, TypeScript, the additive D1 migration, the guarded production build and browser checks at mobile and desktop sizes must pass.

## Release and Rollback

The feature is split across the website and the versioned `ccg-lead-gate` Worker. Before production release, the Worker bindings must be checked for D1 and Twilio without exposing their values. The website receives only `BOOKING_GATE_URL` and encrypted `BOOKING_GATE_SECRET`; it does not receive Twilio credentials. The active Calendly event and physical-address question will be re-read after configuration.

The D1 migration is applied first, followed by the Worker and then the website. The deployment is accepted only after the gateway authentication boundary, quote route, primary success screen, emergency fallback, direct Calendly action, SMS-disabled state and accessible feedback are verified. The preceding accepted Worker version and Pages deployment remain the rollback points. The migration is additive; rollback may leave the unused table in place while restoring the previous Worker and website builds.

## References

[1]: https://www.twilio.com/docs/messaging/features/consent-api "Twilio Consent Management API"

[2]: https://www.twilio.com/docs/messaging/guides/debugging-common-issues "Twilio Debugging Common Messaging Issues"

[3]: https://calendly.com/concreteconceptsgroup-info/free-site-inspection-fixed-quote "Concrete Concepts Group Free Site Inspection and Fixed Quote"
