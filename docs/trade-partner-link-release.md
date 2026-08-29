# Trade Partner Link Production Release

## Scope

This release publishes discreet **Trade Partners** links in the public website’s desktop navigation, conditional mobile navigation, and footer. Every link targets `https://partners.concreteconceptsgroup.com/partners`. The release does not change customer quote conversion labels, conversion destinations, budgets, campaigns, or quote-form behavior.

## Source and Build

| Release property | Value |
|---|---|
| Source commit | `9c3a79e48c8b7b624877741fcb2ca7d533f5dada` |
| Cloudflare Pages project | `concrete-concepts-group` |
| Preview deployment | `03d808ff-8349-40c8-913e-b0a2893895fa` |
| Production deployment | `ee22dfe3-a989-47dd-b319-d92c186e6594` |
| Immediate rollback deployment | `65d0dde5-f4ea-4cfe-8a6e-54fcc7f57272` |

The release-critical partner-link and quote-guard tests, TypeScript check, fail-closed source guard, production build, Pages Worker syntax check, and built-artifact link assertion passed. The repository’s complete test suite also exposed unrelated integration tests that require retired managed-MySQL tables or deployment-only API credentials; these were classified separately and did not change the verified production artifact.

## Preview-First Verification

The first direct-upload production attempt used non-leading-slash Pages manifest paths. Deployment `aefdfd60-41aa-4a07-abc5-dc2bde73553f` was accepted by Cloudflare but failed both rendered quote-route checks. The release process immediately restored `65d0dde5-f4ea-4cfe-8a6e-54fcc7f57272`, cleared the stale apex quote-route cache entry, and confirmed both canonical quote routes recovered.

The upload was corrected to match Wrangler’s Pages format: BLAKE3 asset keys were finalized through `upsert-hashes`, and every manifest path used a leading slash. Preview deployment `03d808ff-8349-40c8-913e-b0a2893895fa` then passed the rendered quote-route verifier before the identical artifact was released to production.

## Live Verification

Production deployment `ee22dfe3-a989-47dd-b319-d92c186e6594` reached `success` on both `concreteconceptsgroup.com` and `www.concreteconceptsgroup.com`. The fail-closed rendered-DOM quote verifier passed for both `/get-quote` routes.

Live browser checks confirmed three conditional Trade Partners anchors after opening the mobile navigation: desktop, mobile, and footer. Each anchor points to `https://partners.concreteconceptsgroup.com/partners`, has no inline click handler, and generated zero Google Ads `conversion` calls and no quote conversion destination when clicked with navigation suppressed.

## Security Cleanup

A temporary Worker was used only to relay Cloudflare’s short-lived Pages asset-upload JWT because the authenticated connector rewrote nested authorization headers. The bridge required a separate high-entropy key, stored the short-lived JWT as an encrypted Worker binding, exposed no custom domain or zone route, and accepted only bounded asset API operations. After the release, the Worker `ccg-pages-upload-bridge` and its encrypted bindings were deleted successfully, and all local bridge keys, token requests, upload payloads, and deployment multipart inputs were removed.

## Rollback

If the public release affects the quote funnel, restore Pages deployment `65d0dde5-f4ea-4cfe-8a6e-54fcc7f57272` immediately. After restoration, verify both apex and `www` `/get-quote` routes using the rendered-DOM verifier. If a stale cached route remains, purge only the affected URLs and verify again. Do not promote failed deployment `aefdfd60-41aa-4a07-abc5-dc2bde73553f`.
