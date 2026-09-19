# Google Ads Auto-Apply and Search Network Safeguards

**Date:** 20 September 2026  
**Author:** Manus AI  
**Status:** Implemented and verified

## Approved scope

The director approved the narrow Google Ads safeguards identified in the 19 September audit and instructed that advertising spend and pricing remain unchanged. This release therefore changed only four controls:

1. Pause Auto-Apply subscription `DISPLAY_EXPANSION_OPT_IN`.
2. Pause Auto-Apply subscription `KEYWORD`.
3. Pause Auto-Apply subscription `USE_BROAD_MATCH_KEYWORD`.
4. Turn Search Content Network off for Search campaign `24184424558`.

No campaign budget, bid strategy, target return on ad spend, keyword, location setting, conversion action, custom goal or Performance Max URL exclusion was included in either mutation request.

## Rollback baseline

Immediately before the change, all three named Auto-Apply subscriptions were `ENABLED`, and Search `targetContentNetwork` was `true`. Search was enabled and serving with a daily budget of **A$330**, Maximise conversion value, a 300% target return on ad spend and Presence targeting. Performance Max was enabled and serving with a daily budget of **A$160** and Presence targeting. Tradenet remained A$0.20 per day.

The enabled custom goal `CCG Quote Form Only` remained goal ID `6458854572` and contained only `Quote Form Submission` action `7546454804`.

## Validation and implementation

Both Google Ads API v25 requests were submitted first with `validateOnly: true`. Each returned HTTP 200 with no validation error. The approved production requests then returned HTTP 200 and identified exactly the three recommendation-subscription resources and the one Search campaign resource.

The recommendation-subscription request used one atomic, non-partial operation set. Each resource changed only its `status` field from `ENABLED` to `PAUSED`. The Search campaign request changed only `networkSettings.targetContentNetwork` from `true` to `false`.

## Verified result

| Protected control | Verified result after change |
|---|---|
| Search daily budget | A$330, unchanged |
| Search bid strategy | Maximise conversion value, unchanged |
| Search target return on ad spend | 300%, unchanged |
| Search location mode | Presence, unchanged |
| Search Google network | On, unchanged |
| Search Partners | On, unchanged |
| Search Content Network | **Off** |
| Performance Max daily budget | A$160, unchanged |
| Performance Max location mode | Presence, unchanged |
| Tradenet daily budget | A$0.20, unchanged |
| Quote-only custom goal | Enabled and still contains only action `7546454804` |
| Search keyword set | No keyword mutation was sent |

A before-and-after comparison of all 21 Auto-Apply subscriptions found exactly three differences. `DISPLAY_EXPANSION_OPT_IN`, `KEYWORD` and `USE_BROAD_MATCH_KEYWORD` moved from `ENABLED` to `PAUSED`; the other 18 subscriptions retained their previous state.

## Rollback

If rollback is required, set the three named recommendation subscriptions back to `ENABLED` and set Search campaign `24184424558` field `networkSettings.targetContentNetwork` back to `true`. Do not change any budget, bidding, target return on ad spend, keyword, location or conversion-goal field during rollback.

## References

[1]: https://googleads.googleapis.com/$discovery/rest?version=v25 "Google Ads API v25 REST discovery document"
[2]: https://developers.google.com/google-ads/api/rest/common/mutate "Google Ads API REST mutate operations"
