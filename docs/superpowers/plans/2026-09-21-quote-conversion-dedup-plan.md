# Quote Conversion Deduplication Implementation Plan

1. Add failing contract tests for `submissionId`, stable server-issued transaction IDs, database-required success, and one confirmed data-layer event.
2. Add a unique `submissionId` column to the Drizzle schema and generate a migration.
3. Extract an idempotent quote persistence helper that obtains the insert ID directly and resolves duplicate-key races.
4. Update the tRPC quote route to require `submissionId`, return the quote contract, and stop reporting success without persistence.
5. Update the Cloudflare fallback route and client helper to carry `submissionId` and return the same confirmed contract.
6. Update all quote forms to create one UUID per form session and fire a `quote_submitted` data-layer event with the server transaction ID.
7. Remove timestamp-generated Google Ads quote transaction IDs and prevent mailto/rejected flows from firing conversions.
8. Run focused tests, TypeScript, the full suite, production build, quote release guards, and dev/live smoke checks.
9. Configure the GTM web/server containers if existing access and a tagging-server endpoint are available; otherwise prepare exact import/configuration details without provisioning billable infrastructure.
10. Save a WebDev checkpoint with verification evidence.
