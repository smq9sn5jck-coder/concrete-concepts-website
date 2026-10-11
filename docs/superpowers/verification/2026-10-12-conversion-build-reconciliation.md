# Five-page candidate — conversion build reconciliation blocker

Checked 12 October 2026 Queensland time. Step 3 local preparation only; no customer deployment or Google Ads mutation.

## Evidence

The retained customer entry asset `/assets/index-DSMgVMXp.js` uses Google Ads account `AW-18007005419`, with quote destination suffix `quote_submission` and phone suffix `phone_call_click`.

The normal local build, without editing `googleAdsConfig.ts`, inherited already-configured build variables and produced suffixes `oPHGCJSGt44cEOuxtIpD` (quote) and `KuCJCPSeyo4cEOuxtIpD` (phone). Observation-only WhatsApp/SMS/callback/guide/visualiser labels remained the same in the inspected source/build fragments.

These are public tag destination identifiers, not credentials. Their difference is material. A literal-string search for full `AW-ID/label` was initially inconclusive because the minifier retains template-string concatenation; direct inspection of `QUOTE_SUBMISSION` and `PHONE_CALL` object fragments establishes the mismatch.

## Required release treatment

- No live conversion or successful quote was sent to test either destination.
- `client/src/lib/googleAdsConfig.ts` remains byte-identical to the verified live source.
- Do not claim this build preserves the deployed primary destination merely because its source file is unchanged.
- The configured labels must be verified against the actual approved CCG actions and reconciled under the separately reviewed conversion-label change (PR #9), with explicit authority before a customer release. Do not silently merge that PR or silently inherit labels from an unrelated build environment.
- Preserving descriptive fallback labels is not presented as a production-quality solution. Likewise, replacing them silently is outside this five-location-only release.
- Local functional, SEO and no-submit QA may continue. Production deployment remains blocked pending this distinct decision and final fresh preflight.

## Limits

This evidence does not diagnose Google Ads account performance or prove which historical genuine conversions reached Ads. No Ads account query or mutation was performed for this inspection. The five-page candidate still requires final UI integration, full safe tests, build/edge/browser acceptance and independent review.
