# CCG Quote Route Guard and Funnel Analytics — Release Summary

Date: 28 August 2026 (AEST)

## Ready for approval

The verified comprehensive CCG source now includes a fail-closed production release guard and privacy-safe quote-funnel events. Nothing in this change alters the Google Ads budget allocation, bidding, keywords, goals, campaign status, quote validation, Gmail delivery or Jotform backup.

| Control | Verified outcome |
|---|---|
| Source guard | Every production build fails if `/get-quote`, `ComprehensiveQuoteWizard`, `Step 1 of 5`, required contact fields, quote submit route or photo-upload route is missing. |
| Built-artifact guard | The final Cloudflare bundle is scanned again after build and fails closed if the route contract is absent. |
| Live browser guard | Both apex and www `/get-quote` routes are rendered in headless Chrome and checked for the real five-step wizard rather than trusting HTTP 200 alone. |
| Automatic rollback | The release workflow records the current Cloudflare canonical deployment before upload and restores it if either rendered production check fails. |
| Competing GitHub source lock | A tested prebuild guard is prepared in the incomplete selected website repository. Its production build intentionally fails until that repository is synchronised with the verified comprehensive source. |
| Funnel analytics | The existing analytics collector receives page view, step reached, generic validation block, submit start, confirmed delivery and failure events. |
| Privacy | Event payloads exclude names, mobile numbers, emails, addresses, descriptions, photos, URLs, click IDs and other customer-entered values. |
| Conversion integrity | The existing Google Ads conversion remains separate and fires only after primary or fallback delivery is confirmed. |

## Verification evidence

The managed project passed **525 deterministic tests across 43 test files**, TypeScript, the guarded production build, final build-contract validation and Cloudflare Worker syntax validation. The current live apex and www quote routes also passed the new browser-rendered verifier.

A development browser walkthrough reached `Step 5 of 5` without submitting. Its temporary collector recorded only allowlisted step and generic validation properties. No Gmail/Jotform record or Google Ads conversion was created during QA. Desktop and iPhone-width layouts were visually checked.

## Production actions requiring confirmation

1. Save the verified managed-project checkpoint. This automatically publishes the managed project version.
2. Upload the guarded `dist/public` bundle to Cloudflare Pages project `concrete-concepts-group`.
3. Render both production quote routes and verify the five-step wizard. If either fails, restore the captured prior canonical deployment.
4. Commit and push the tested fail-closed prebuild guard to the selected GitHub website repository so its incomplete branch cannot overwrite production again.

No Google Ads setting will be changed during these production actions.
