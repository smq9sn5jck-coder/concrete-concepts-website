# Google Ads Account Structure and Cross-Page Interference Audit

**Author:** Manus AI  
**Audit date:** 30 August 2026  
**Account:** 655-309-3174  
**Scope:** Full account audit plus director-approved reversible URL/network corrections and independent readback

## Executive Finding

No measured paid click in the last 30 days reached the trade program, partner portal, referral route, lead-resale pages, `.org` domains or any other external domain from the 2 main CCG campaigns. However, the deeper PMax `final_url_expansion_asset_view` found **hidden eligibility-level cross-domain interference**: 275 enabled asset-to-URL associations, representing 132 unique automatically created text assets, still point to 7 `concreteconcepts.org` URLs inside 2 actively spending PMax asset groups. Of those 132 assets, 84 appear only on `.org` URLs and 48 are also reused on valid `.com` URLs. Those 2 groups spent approximately A$1,085.55 and A$839.46 in the same 30-day window. The absence of a recent `.org` landing-page click therefore does not make the structure clean; legacy `.org` headlines/descriptions remain eligible.

There were 3 additional structural risks. First, PMax had functional Final URL expansion and no `WEBPAGE` URL exclusions, so future traffic could be sent to non-commercial pages on the main `.com` domain. Second, the separate Tradenet campaign has mixed cross-domain campaign-level sitelinks and uses customer-default goals, but its A$0.20/day budget produced 0 impressions, clicks, spend or conversions in the last 30 days. Third, the rebuilt Search campaign’s Display/Content Network expansion was enabled and generated today’s only click; this affected traffic quality, not cross-page routing. The director selected the reversible control path: retain all automatically created assets, add exact PMax URL exclusions and disable Search Content expansion.

## Live Campaign Map

| Campaign | Status | Type | Daily budget | Bidding | Key structural note |
|---|---|---|---:|---|---|
| Performance Max-1 | Enabled | Performance Max | A$160.00 | Maximise conversion value | Campaign-level quote-only custom goal; root `.com` asset-group URLs; functional Final URL expansion |
| CCG Search - High Intent Concreting - Rebuilt 2026-08-27 | Enabled | Search | A$60.00 | Maximise conversion value, 300% tROAS | Campaign-level quote-only custom goal; Content Network disabled after approval |
| Tradenet | Enabled | Search | A$0.20 | Maximise conversions | External Tradenet ad, mixed `.org`/`.com`/business-profile sitelinks; customer-default goals |
| Concreting | Paused | Smart | A$10.30 | Target spend | No 30-day activity; campaign cannot currently serve |

All 4 campaigns use Presence-only positive and negative geographic modes. Search Partners and Content Network are disabled on the rebuilt Search campaign. Google approved the final retaining-wall RSA, the dedicated `Retaining Walls Brisbane - Exact` ad group is enabled, its exact keyword is enabled, and the original duplicate exact keyword in the mixed general ad group is paused. The approved RSA points only to `/lp/retaining-wall-brisbane`.

## URL and Asset Findings

The rebuilt Search campaign has 2 enabled approved RSAs, both with `https://concreteconceptsgroup.com/get-quote` as their final URL. Its campaign-level sitelinks point only to `/get-quote`, `/calculator`, `/projects`, `/services/concrete-driveways-brisbane`, `/services/exposed-aggregate-brisbane` and `/services/retaining-walls-brisbane`. It has no ad-group-level URL assets and no keyword-level URL overrides.

The enabled PMax campaign has 3 enabled asset groups; all 3 now use `https://concreteconceptsgroup.com` as their configured final URL. Its current campaign asset automation includes `TEXT_ASSET_AUTOMATION: OPTED_IN`; image extraction is opted out. The 30-day expanded-landing report aggregates to 42 clean destination paths, all on the main `.com` domain. No partner, referral, lead, trade or `.org` destination received a measured click. The homepage dominated with 1,485 clicks; other measured paths included relevant quote, calculator, service and Brisbane-area pages.

The deeper expansion-asset inventory contains 1,732 enabled associations across 34 unique URLs. Of those, 275 associations and 132 unique headline/description assets point to 7 legacy `.org` URLs across asset groups `6688794972` and `6692088248`; another 53 associations use an insecure `http://` URL form. Asset-set comparison found 84 `.org`-only assets and 48 assets shared between `.org` and valid `.com` pages. Both affected groups are actively serving, with 428 and 707 clicks respectively in the last 30 days. This is the strongest hidden cross-page finding in the audit.

The exact legacy URLs are `http://concreteconcepts.org/`, `https://concreteconcepts.org/`, `https://concreteconcepts.org/#contact`, `/areas/coomera`, `/areas/coorparoo`, `/blog/retaining-wall-guide-brisbane-types-costs-council` and `/services/retaining-walls-brisbane` on the `.org` host. No `partners.concreteconceptsgroup.com`, `/partners`, `/referral`, `/lead` or `/trade` row exists in the PMax expansion inventory, and none produced a measured 30-day landing-page click.

Google documents that Final URL expansion is on by default for Performance Max and can replace the configured final URL with another page from the same domain. It also warns that unintended pages can serve unless URL exclusions are added.[1] Google’s API documentation states that `WEBPAGE` campaign criteria are used for PMax URL exclusions and that dynamically generated URL-expansion assets can be removed.[2] Before correction, the account had no `WEBPAGE` campaign criteria, and observed multi-path PMax delivery confirmed expansion was functionally active. The corrected account now has 8 enabled negative `WEBPAGE` criteria on PMax. Google Ads API v25 also provides `RemoveCampaignAutomaticallyCreatedAsset`, but the director chose not to use that irreversible campaign-wide control.[4]

For the director-selected reversible Option B, Google’s supported control is `WEBPAGE` campaign criteria rather than campaign-wide asset deletion. Google states that individual URLs and URL rules can prevent non-commercial pages from being served through PMax expansion; the configured campaign Final URL itself cannot be excluded.[3] This is compatible with CCG because all 3 configured PMax asset-group final URLs remain the main `.com` homepage, while the exclusions target legacy `.org` URLs and non-commercial subpaths only.

The Tradenet ad itself points to `https://tradenet.community/for-builders`. Its campaign-level sitelinks also include 4 enabled `concreteconcepts.org` URLs, `https://concreteconceptsgroup.com/get-quote`, `https://tradieos.construction/founding-member` and business-profile links. The same 4 `.org` sitelinks are paused at customer level but remain enabled at Tradenet campaign level. This mixed structure is isolated from the main Search and PMax campaign assets, and Tradenet recorded zero activity in the last 30 days.

## Conversion and Bidding Isolation

The only enabled custom goal is `CCG Quote Form Only`, containing only conversion action `7546454804` — Quote Form Submission. Both PMax and the rebuilt Search campaign explicitly use that campaign-level custom goal. The 5 Release 1 actions for SMS, Visualiser, Callback, WhatsApp and Guide remain secondary and excluded from the conversions metric.

Nineteen non-removed conversion actions still exist at account level, including legacy Smart/local/call actions with primary flags, but the main PMax and Search campaigns are protected by their campaign-level quote-only goal. Tradenet uses customer-default goals, where website and Google-hosted lead-form categories plus website request-quote are biddable. Because Tradenet has no 30-day delivery, this has no measured current effect, but it is not structurally isolated enough for future scale.

Thirty-day conversion-by-action reporting shows activity only in PMax: 27 Quote Form Submission conversions, approximately 94 Click-to-call conversions and 2 secondary Business profile call observations. This lookback crosses the date when click-to-call was reclassified, so historical `metrics.conversions` should not be used to infer the current bidding goal. The current live goal attachment and action flags are the authoritative protections.

| Action or goal layer | Current state | Effect on the 2 main campaigns |
|---|---|---|
| CCG Quote Form Only | Enabled; contains only Quote Form Submission `7546454804` | Explicitly attached to PMax and rebuilt Search |
| Quote Form Submission | Primary and included | Sole current bidding action in the attached custom goal |
| Click to call | Secondary and excluded | Observation-only now; older 30-day conversion rows remain historical |
| SMS, Visualiser, Callback, WhatsApp and Guide | Secondary and excluded | Observation-only |
| Smart/local call, direction, visit and engagement actions | Some retain primary flags but are excluded | Blocked from the 2 main campaigns by the custom goal; a risk only for customer-default campaigns |
| Tradenet goal config | Customer default | Potential cross-signal risk if this A$0.20/day campaign is ever funded |

## Evidence-Based Risk Register

| Risk | Current measured effect | Future risk | Recommended control |
|---|---|---|---|
| Main Search cross-page leakage | None observed; 7 paid clicks went to `/get-quote` | Low | Dedicated retaining-wall group now routes only to the verified paid page; the original duplicate keyword is paused |
| PMax legacy `.org` expansion assets | No measured `.org` click in 30 days; 275 enabled associations remain in 2 active groups | Reduced by reversible exclusion | `concreteconcepts.org` is now blocked by an enabled negative URL rule; all 132 assets remain intact under Option B |
| PMax Final URL expansion | 42 measured `.com` paths; projects, FAQ and gallery spent A$18.20 without a quote conversion | Reduced by 7 path rules | Private, legal, referral, survey and paid-template routes are excluded; useful commercial routes remain eligible |
| Search Display Expansion | Today’s only click came from Content, not Search | Corrected | `target_content_network` is now false; Google Search and Search Network remain enabled |
| Tradenet mixed sitelinks | 0 impressions/clicks/spend/conversions in 30 days | Medium if funded later | Keep at A$0.20 or pause; before scaling, remove CCG `.com`/`.org` cross-links and attach a trade-only conversion goal |
| Account-level legacy actions | No current main-campaign goal leakage | Medium if a new campaign inherits customer defaults | Require every future CCG lead campaign to use an explicit campaign-level goal |
| Paused Smart campaign | No 30-day activity | Low | Leave paused unless separately redesigned |

## References

[1]: https://support.google.com/google-ads/answer/14337539?hl=en "Google Ads Help — About Final URL expansion in Performance Max"
[2]: https://developers.google.com/google-ads/api/performance-max/optimizations "Google Ads API — Performance Max Optimizations"
[3]: https://support.google.com/google-ads/answer/14337773?hl=en "Google Ads Help — About URL exclusion in Performance Max"
[4]: https://developers.google.com/google-ads/api/reference/rpc/v25/AutomaticallyCreatedAssetRemovalService/RemoveCampaignAutomaticallyCreatedAsset "Google Ads API v25 — RemoveCampaignAutomaticallyCreatedAsset"

## Approval-Gated Correction Order

1. **Legacy asset deletion declined:** the director selected reversible Option B. All 132 `.org`-associated assets remain untouched because 48 are reused by valid `.com` URLs and Google provides no validate-only mode for campaign-wide automatic-asset removal.[4]
2. **PMax exclusions applied:** 8 enabled negative `WEBPAGE` criteria block `concreteconcepts.org`, `/admin`, `/referral`, `/survey/`, `/my-quote`, `/privacy`, `/terms` and `/lp/`. Homepage, quote, calculator, relevant service and Brisbane-area routes remain eligible.
3. **Search network isolation applied:** `target_content_network` is false on the rebuilt Search campaign. The A$60 budget, 300% tROAS, Google Search, Search Network, exact keywords, negatives, Presence-only targeting and quote-only custom goal are unchanged.
4. **Tradenet before scaling:** while it remains at A$0.20/day with zero 30-day traffic, leave it unchanged. Before any budget increase, remove CCG `.com`/`.org` and unrelated construction sitelinks, then attach a trade-only campaign goal.
5. **Future campaign rule:** every new funded CCG lead campaign must use an explicit campaign-level conversion goal; never inherit the current customer-default lead/request-quote categories without review.

The 8-rule PMax create request, Search Content disable request and Search Content inverse rollback all returned HTTP 200 in validate-only mode before live changes. Each live mutation was then applied narrowly and independently read back. The PMax criteria-removal rollback file was prepared from the 8 returned resource names; its optional validate-only check reached a connector timeout without a Google error, so no rollback was attempted because the live exclusion readback passed exactly.

## URL Scope Matrix

| Campaign layer | Configured destination | Measured 30-day landing traffic | Hidden eligibility finding |
|---|---|---|---|
| Rebuilt Search ads | `https://concreteconceptsgroup.com/get-quote` | Main `.com` quote and approved sitelink paths only | No partner, referral, `.org` or external final URL; Display Expansion is a network-quality issue, not cross-page routing |
| Retaining-wall Search group | Verified `.com` paid retaining-wall page | Newly enabled after Google approval | Dedicated group, exact keyword and RSA are enabled; RSA is reviewed/approved; original mixed-group duplicate keyword is paused |
| PMax asset groups | Main `.com` homepage on all 3 groups | 42 `.com` paths; no recent `.org` click | 132 unique enabled auto-created text assets remain associated with 7 legacy `.org` URLs; 84 are `.org`-only and 48 are shared with valid `.com` URLs |
| PMax campaign criteria | 482 positive Australian geo targets, 62 excluded geo targets and 8 new negative webpage criteria | Australian delivery in sampled reports | Legacy `.org` and private/non-commercial paths are blocked while useful commercial routes remain eligible |
| PMax/Tradenet campaign assets | 24 enabled URL-bearing campaign assets | 12 had measured activity; all active clicks remained on main `.com` paths | No URL-bearing account-level or ad-group-level asset exists; legacy cross-domain campaign sitelinks remain confined to the unfunded Tradenet campaign |
| Tradenet | Mixed `.com`, `.org` and external construction URLs | 0 impressions, 0 clicks and A$0 spend | Structural cross-domain risk exists only if this A$0.20/day campaign is later funded |

## Applied Corrections and Final Readback

At 14:29–14:37 AEST on 30 August 2026, the approved reversible corrections were applied. PMax campaign `23655153762` received 8 negative `WEBPAGE` criteria. Independent readback returned exactly 8 enabled negative rules with the approved arguments and no exclusion for `/get-quote`, `/services/`, `/areas/` or `/calculator`. All 3 PMax asset groups remain enabled on the main `.com` homepage; no automatically created asset was removed.

At 14:37 AEST, rebuilt Search campaign `24184424558` was updated only at `networkSettings.targetContentNetwork`, changing it from true to false. Independent readback confirmed the campaign remains enabled at A$60/day, Maximise conversion value with a 300% target ROAS, Google Search and Search Network on, Search Partners off and Content Network off. PMax remains A$160/day and Tradenet A$0.20/day.

During the same verification window, Google changed final RSA `822744781388` to `REVIEWED / APPROVED`. The previously validated atomic routing switch then enabled ad group `198409264974` and paused only the original mixed-group criterion `203212070521~309931182429`. Independent readback confirmed the dedicated exact keyword remains enabled, the new RSA remains enabled and approved at `https://concreteconceptsgroup.com/lp/retaining-wall-brisbane`, and the old duplicate exact keyword is paused. Before the switch, the paid page returned HTTP 200 with `noindex, follow`, and the apex/www five-step quote guard passed on its first attempt.

PMax and rebuilt Search remain attached to enabled custom goal `CCG Quote Form Only`, containing only Quote Form Submission `7546454804`. The quote action remains primary and included; SMS, Visualiser, Callback, WhatsApp and Guide remain enabled secondary observations excluded from conversions. Presence-only positive and negative geographic modes remain intact across all 4 campaigns. The temporary retaining-wall approval schedule was restored to the original 3-day `Concrete Concepts Performance Review` after the successful terminal condition.

These changes reduce hidden cross-page eligibility and low-intent Content delivery without changing the website, budgets, PMax asset groups, useful commercial URLs or automatically created assets. The first monitoring checkpoint should compare landing URLs and Search network delivery after one full Brisbane day; the next account-structure check should occur after 7 days.
