# Private R2 Photo Upload Repair Design

**Author:** Manus AI  
**Date:** 19 September 2026  
**Status:** Approved through the director’s “Go” instruction after reviewing the proposed private R2 repair

## Objective

Repair the production photo path used by the five-step quote funnel, the homepage quote form and the AI concrete visualiser. The repair must not change the five-step questions, Australian phone validation, Brisbane/SEQ qualification, anti-spam controls, Gmail/Resend delivery, Jotform delivery, D1 backup or Google Ads conversion classification.

Cloudflare edge evidence shows that the current `/api/upload-photo` route receives real customer requests but fails while forwarding media to the external Forge storage proxy. The replacement will store uploaded and Worker-generated media directly in a private Cloudflare R2 bucket.[1]

## Approaches considered

| Approach | Trade-offs | Decision |
|---|---|---|
| Private Cloudflare R2 storage | Removes the failing cross-host storage dependency, keeps media in the existing Cloudflare account and supports automatic expiry. It requires a bucket, Pages binding and protected read route. | **Selected** |
| Repair or retry the external Forge storage proxy | Small code change, but keeps the production dependency that is currently returning failures and gives CCG less direct control over storage and retention. | Rejected |
| Public R2 bucket | Simple links, but exposes customer job-site photos to anyone who discovers an object URL and makes privacy control weaker. | Rejected |

## Architecture

The Pages Worker will receive the existing JSON upload request, validate the file, generate an unguessable object key and write the bytes to an R2 binding named `LEAD_PHOTOS`. Quote uploads will use the `quote-photos/` prefix and visualiser uploads will use `visualiser-uploads/`. Generated visualiser and timelapse images will also use the same R2 storage helper so the external storage proxy cannot break the later visualiser stages.

R2 will remain private. After a confirmed write, the Worker will return a same-origin URL under `/api/lead-photo/`. The URL will include an independent random access token, while only its SHA-256 hash will be stored in R2 custom metadata. The route will support `GET` and `HEAD`, return `404` for missing objects, return `403` for invalid tokens and never fall through to the application shell.

The protected media response will preserve the verified image content type and set `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff` and a restrictive Content Security Policy. Object keys will never contain customer names, phone numbers, email addresses or original filenames.

## Validation and abuse controls

The browser’s existing limits remain: eight files maximum and 10 MB maximum per file. The Worker will independently enforce a 10 MB decoded-byte limit and a conservative encoded-size limit. It will accept only JPEG, PNG, WebP, HEIC and HEIF MIME types.

The Worker will check file signatures rather than trusting the declared MIME type or extension. JPEG, PNG and WebP will use their standard magic bytes. HEIC and HEIF will require an ISO Base Media File Format `ftyp` header with an accepted HEIF brand. Invalid base64, empty content, MIME/signature mismatches and missing fields will return HTTP 400 with a customer-safe error. A missing R2 binding or failed write will return HTTP 503 rather than a false success.

Uploads will use the existing in-memory rate limiter keyed by a one-way representation of the request address. The limit will allow normal multi-photo quote use while rejecting obvious bursts. A storage failure must never prevent a customer from submitting a quote without photos.

## Data retention

A new private R2 bucket named `ccg-lead-photos` will be created in the OC location. A lifecycle rule will delete all objects after 90 days.[2] This reduces the amount of customer site imagery retained while keeping enough time for normal quoting and follow-up.

The bucket will be bound to both production and preview Pages configurations as `LEAD_PHOTOS`. Existing D1 and environment bindings will be preserved exactly. The bucket will not receive a public development URL or custom public domain.

## User experience

The five-step funnel will keep its current interface and optional-photo behavior. Successful uploads will appear in the review step and be included in the existing quote payload. If a file fails, the user will see a clear message identifying that file and can retry, remove it or submit the quote without it. No upload action will create a lead or fire any advertising conversion.

The AI visualiser will use the same private media route for its original and generated images. Its normal lead capture remains secondary and can occur only after the visualiser result is generated.

## Test-first implementation

The first failing Worker tests will require the following behavior:

1. A valid JPEG upload writes one object to `LEAD_PHOTOS` and returns a protected same-origin URL.
2. The storage call receives correct HTTP metadata and random token metadata.
3. A missing binding or rejected R2 write returns HTTP 503.
4. Invalid base64, an unsupported MIME type, a MIME/signature mismatch, an empty file and an oversized file return HTTP 400 without writing.
5. A valid access token returns the object with private security headers.
6. A missing object returns 404 and an invalid token returns 403.
7. The upload route cannot call quote, callback or conversion functions.
8. Existing quote, callback, guide, D1, Jotform and conversion-isolation tests remain green.

## Production release and rollback

The current canonical Pages deployment `87b75159-1bdf-47a9-8a1d-dfd93f4ca209` will be captured immediately before release and retained as the code rollback. The R2 bucket and binding are additive and can be removed independently without deleting any existing lead data.

After deploying the new Worker, a labelled one-pixel synthetic PNG will be uploaded through the live customer endpoint. The returned protected URL must return the same bytes and correct content type. The exact synthetic R2 object will then be deleted and verified absent. This test will not submit a quote, create a Gmail or Jotform record, write D1 lead data or fire a Google Ads conversion.

The apex and `www` homepages, five-step quote page, paid retaining-wall page, sitemap, legacy partner redirect and retained Partner Portal will be checked immediately and for at least 15 minutes. Cloudflare upload status analytics must show the successful synthetic request and no release-related error spike. Any failed acceptance check will trigger code rollback to the captured deployment, followed by removal of only the new binding if the binding itself is implicated.

No Google Ads campaign, budget, bidding, location, network, keyword, asset, URL exclusion or conversion-goal setting will change in this release.

## References

[1]: https://developers.cloudflare.com/r2/get-started/workers-api/ "Cloudflare R2 Workers API"
[2]: https://developers.cloudflare.com/r2/buckets/object-lifecycles/ "Cloudflare R2 object lifecycles"
