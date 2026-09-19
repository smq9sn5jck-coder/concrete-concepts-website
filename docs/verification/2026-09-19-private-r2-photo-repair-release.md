# Private R2 Photo Upload Repair Release

**Date:** 19 September 2026  
**Author:** Manus AI  
**Status:** Accepted in production after monitored verification

## Release scope

The director approved replacing the broken quote-photo storage dependency with private Cloudflare R2 storage. The release preserves the five-step quote funnel, Australian mobile validation, Brisbane/SEQ qualification, Gmail/Resend delivery, Jotform delivery, D1 lead backup and quote-only Google Ads conversion isolation.

Cloudflare had recorded 172 `POST` attempts to `/api/upload-photo` from 1–19 September. Of those, 168 returned HTTP 500 and four were aborted with HTTP 499. No successful upload was observed. The failing Worker path sent images through the Manus Forge storage proxy even though the website is hosted on Cloudflare.

## Implementation

Cloudflare R2 bucket `ccg-lead-photos` is bound to the Pages project as `LEAD_PHOTOS` in production and preview. The Worker now writes accepted quote, visualiser and timelapse images directly to that binding. R2 has no custom domain, and its managed `r2.dev` domain is disabled.

The bucket applies enabled lifecycle rule `delete-lead-photos-after-90-days`, with an object age of 7,776,000 seconds. The protected Worker media route returns `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff`.

Each stored object receives a random access token. Only the SHA-256 hash of that token is stored as object metadata. The public URL contains the token, and the Worker checks the supplied hash in constant time before allowing `GET` or `HEAD`. Incorrect tokens return HTTP 403, and missing objects return HTTP 404.

Uploads are limited to JPEG, PNG, WebP, HEIC and HEIF with a maximum decoded size of 10 MB. The Worker checks the declared media type against the file signature, rejects malformed payloads before storage, and rate-limits obvious bursts. Photos remain optional, so storage failure does not block the rest of a quote request.

## Test-first verification

Seventeen focused tests reproduce the missing-binding and failed-upstream behavior of the former implementation and cover R2 writes, file signatures, supported media types, size limits, malformed data, token hashing, protected retrieval, missing objects, write failures and rate limiting.

The closing deterministic verification passed 52 test files and **596 tests**. TypeScript checking, the guarded production build, quote source and build contracts, Worker syntax and diff hygiene also passed. The production build contained the R2 implementation and no reference to the retired Forge upload endpoint.

## Cloudflare release

| Control | Accepted result |
|---|---|
| Canonical deployment | `3139befa-3c30-4d10-92e6-8edb8e3fce0b` |
| Immutable URL | `https://3139befa.concrete-concepts-group.pages.dev` |
| Immediate code rollback | `87b75159-1bdf-47a9-8a1d-dfd93f4ca209` |
| Binding rollback | Remove only `LEAD_PHOTOS` from production and preview after rolling code back |
| Data rollback | Retain or delete `ccg-lead-photos` only after confirming no required customer media remains |
| Configuration readback | `LEAD_PHOTOS` points to `ccg-lead-photos`; 90-day deletion is enabled; custom domains are empty; `r2.dev` is disabled |

The live quote route verifier passed against apex, `www`, stable Pages and the immutable deployment. The customer homepage, five-step quote page, sitemap, paid route, legacy partner redirect and retained Partner Portal all returned usable responses.

## Production photo-only proof

One clearly labelled synthetic PNG was uploaded to `/api/upload-photo`. The upload returned HTTP 200. Authenticated `GET` and `HEAD` returned HTTP 200, the correct `image/png` media type, `private, no-store`, `nosniff`, exact bytes and an empty `HEAD` body. An incorrect token returned HTTP 403, and a missing key returned HTTP 404.

The initial Python verification client received an HTML HTTP 403 because the edge security layer blocked Python's default user agent. The same signed URL returned HTTP 200 through ordinary browser-like clients. Re-running with an explicit labelled system-test user agent passed. No production source or security rule was loosened in response.

The synthetic R2 object and the temporary KV staging namespace were deleted. A list-based Cloudflare readback confirmed that both were absent. No quote was submitted, no customer data was entered, no Gmail or Jotform message was created, no D1 lead was inserted and no Google Ads conversion was fired.

## Closing monitor and protected settings

Six deterministic route checkpoints passed through 15 minutes and 35 seconds after release. Every checkpoint covered the customer homepage, apex and `www` quote routes, stable Pages, the immutable deployment, sitemap, legacy partner redirect and retained Partner Portal.

Cloudflare HTTP analytics for the post-release window showed one `POST` to `/api/upload-photo`, returning HTTP 200, and **zero upload HTTP 500 responses**.

The final Google Ads readback confirmed that the website release did not change campaign settings. Performance Max remains enabled at A$160 per day with Presence targeting. Search remains enabled at A$330 per day, 300% target return on ad spend and Presence targeting. Search Content Network remains enabled because no Ads mutation was authorized in this release. Tradenet remains A$0.20 per day.

## References

[1]: https://developers.cloudflare.com/r2/api/workers/workers-api-reference/ "Cloudflare R2 Workers API reference"
[2]: https://developers.cloudflare.com/r2/buckets/object-lifecycles/ "Cloudflare R2 object lifecycles"
[3]: https://developers.cloudflare.com/pages/functions/bindings/ "Cloudflare Pages Functions bindings"
