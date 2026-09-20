# Quote Conversion Deduplication Design

## Goal

Count one Google Ads `Quote Form Submission` conversion for each accepted, persisted quote. Retries, reloads, rejected submissions, delivery-only fallbacks, and duplicate client events must not create additional conversions.

## Chosen architecture

The application remains the source of quote truth. Every form attempt carries a client-generated UUID `submissionId` that is stable for the life of the form. The server validates the request, inserts at most one `quote_requests` row for that UUID, obtains the actual inserted primary key, and returns a non-personal transaction ID in the form `CCG-Q-<id>`. A duplicate retry returns the same stored quote and transaction ID.

The browser emits one `quote_submitted` data-layer event only after receiving that confirmed response. The event carries `ecommerce.transaction_id`, `currency`, a provisional lead value, and consent-gated user data. The Google Tag Manager web container transports the event to a first-party server container. The server container's Google Ads conversion tag fires only for `quote_submitted`.

The existing direct browser `gtag('event', 'conversion')` path is removed for quotes after server-side validation. Meta Lead tracking remains separate but uses the confirmed transaction ID as `eventID` for its own deduplication.

## Data model and API contracts

Add `submissionId varchar(64)` to `quote_requests` with a unique constraint. Add it to the primary tRPC quote input and the Cloudflare fallback input. The quote creation service must be idempotent by `submissionId` and return:

```ts
{
  success: true,
  quoteId: number,
  transactionId: `CCG-Q-${number}`,
  serviceAreaStatus: "in_area" | "service_area_review",
  duplicate: boolean,
}
```

Database persistence is mandatory. The endpoint must not return success if no database is available or the insert fails. The inserted ID must come from the insert result, never from `MAX(id)`.

The fallback route may emit a conversion only when it returns the same confirmed quote contract. A mail-app fallback is never a confirmed conversion.

## Error handling and privacy

Validation and rate-limit failures return no quote ID. Duplicate-key races are resolved by re-reading the existing record by `submissionId`. The transaction ID contains no personal data and stays under Google's 64-character limit. Email and Australian E.164 phone are passed only when advertising consent allows enhanced conversions. Notification, PDF, SMS, and downstream webhook failures are logged but do not create a second quote or second conversion.

## Testing

Tests cover schema uniqueness, the response contract, idempotent retry behaviour, insert failures, the removal of browser timestamp IDs, the single confirmed `quote_submitted` event, fallback contract parsing, and rejection/mailto non-conversions. Existing quote, validation, funnel, UTM, and release-guard tests remain green.

## External GTM work

Use a first-party server endpoint, the built-in GA4 client, an all-events Conversion Linker, and a Google Ads Conversion Tracking tag triggered only by `quote_submitted`. Configure conversion ID `AW-18007005419` and the exact production Quote Form Submission label. Remove the equivalent web Ads conversion tag after validation.
