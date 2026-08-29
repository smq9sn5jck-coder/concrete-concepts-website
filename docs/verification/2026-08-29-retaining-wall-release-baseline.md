# Retaining-Wall Landing Release Baseline

**Captured:** 29 August 2026  
**Purpose:** Fail-closed website and Google Ads rollback record

## Source Baseline

The managed project began this release from checkpoint and Git commit `af50434cda6421d74faa5cc8b8a78ea4d87e4150`. The selected GitHub website repository was clean and aligned with `origin/main` at `33287d3f2a9ae9ec5dad89b85842b2be3a87c768` before implementation.

## Cloudflare Baseline

The canonical production deployment is `d17220b7-999b-419e-87bc-19fe1cb4b695`, created at `2026-08-29T12:14:05.489603Z`, with successful deployment status and aliases `https://concreteconceptsgroup.com` and `https://www.concreteconceptsgroup.com`. Its immutable URL is `https://d17220b7.concrete-concepts-group.pages.dev`.

Immediate rollback is canonical deployment `d17220b7`. The next previous successful deployment is `cbba98a6-47ff-4b5f-ad7d-f29c29cf7bdf` at `https://cbba98a6.concrete-concepts-group.pages.dev`.

## Google Ads Baseline

Campaign `24184424558` (`CCG Search - High Intent Concreting - Rebuilt 2026-08-27`) is enabled with A$60/day budget resource `15831697351`, Maximise conversion value bidding at 300% target ROAS, Google Search and Search Network enabled, Content Network enabled and Search Partners disabled.

Exact keyword `retaining wall brisbane` is enabled as criterion `309931182429` in mixed-service ad group `203212070521` (`Concreting Brisbane - High Intent`). Its current Quality Score is 1/10 and expected CTR, ad relevance and post-click experience are all below average. It has no keyword-level final URL.

Two approved enabled RSAs remain in that mixed ad group, both using `https://concreteconceptsgroup.com/get-quote`. The serving history and full assets are preserved in the read-only baseline result `/tmp/manus-mcp/mcp_result_b62fe303-edd3-4acf-a618-614f7189232e.json`.

## Protected Controls

This release must not change the A$60 Search budget, 300% target ROAS, PMax or Tradenet, Presence-only geographic targeting, existing negative keywords, quote-only primary conversion or the secondary classification of call, SMS, WhatsApp, callback, guide and visualiser observations.
