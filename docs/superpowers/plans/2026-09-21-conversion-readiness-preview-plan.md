# Focused Conversion-Readiness Preview Implementation Plan

**Date:** 21 September 2026
**Design:** `docs/superpowers/specs/2026-09-21-conversion-readiness-preview-design.md`
**Release target:** New noindex Cloudflare Pages preview branch only

## Phase 1: Establish regression contracts

Add focused Vitest contracts for the approved logo transfer budgets, unchanged mobile-poster and desktop-video sources, non-priority below-the-fold images, accessible five-step progress controls, readable optional labels, application-wide HTML security headers, preview-only Content Security Policy report mode, and unchanged lead/Ads tracking contracts.

Run the focused suite and record the expected failures before implementation.

## Phase 2: Optimise approved visual assets

Create transparent WebP variants from the two approved CCG logo masters. Keep the originals outside the repository, upload the optimised variants to the existing Cloudinary account, and record stable versioned URLs plus intrinsic dimensions and byte sizes in the performance asset manifest.

Use responsive `<picture>` or `srcSet` delivery in the hero and navigation. Keep the existing master image URLs for Open Graph, schema and email contexts where their current behaviour is deliberate. Preserve the mobile hero poster and desktop/tablet video sources exactly.

## Phase 3: Improve quote accessibility

Add accessible names and state metadata to all five progress buttons. Preserve completion-only back navigation and the existing visual layout. Increase optional-label contrast without changing validation, fields or submission data.

## Phase 4: Apply consistent HTML security headers

Create one tested baseline HTML header helper in the Cloudflare Pages Worker. Apply it to every HTML GET and HEAD response, including generated and asset-backed error pages. Keep non-HTML and private-object response headers unchanged.

Update the Pages `_headers` fallback to match the Worker policy. Stage Content Security Policy in Report-Only mode. Do not enforce a policy until preview browser and network checks prove every required origin is covered.

## Phase 5: Verify source and bundles

Run focused tests, the complete deterministic suite with established live-service exclusions, TypeScript, guarded production build, quote source/build guards and Worker syntax checks. Confirm generated locality and other-trade flags return to their default-off state.

Build the preview bundle, run mobile and desktop browser acceptance, inspect console/network errors, walk all five quote steps without submitting, and compare Lighthouse results against the 21 September baseline.

## Phase 6: Deploy noindex Cloudflare preview

Read back the current production canonical deployment and bindings. Upload the verified preview bundle to a new Cloudflare branch. Prove production remains unchanged, the preview carries `X-Robots-Tag: noindex, nofollow`, and no preview route enters the production sitemap.

Verify homepage, quote route, step controls, responsive media and security headers on the permanent preview. Perform only invalid-request endpoint guards; create no lead, email, Jotform record or Google Ads conversion.

## Phase 7: Record and hand off

Commit the verified source and staging evidence, push the authorised GitHub repository, save a restorable project checkpoint and provide the director with the Cloudflare review URL. Production publication remains a separate approval.
