# Rebuilt Search campaign keyword and budget review

## Live baseline

Campaign `24184424558` is enabled with an A$49.80/day budget, Maximise conversion value bidding at 300% target ROAS, Google Search and Search Network enabled, Search Partners disabled, and the automatically enabled Content Network toggle still on. Actual delivery from 27–29 August was 46 Search impressions plus one Content impression; all seven clicks came from Search. Presence-only geographic targeting remains intact. No Ads setting was changed during this review.

## Performance since launch, 27–29 August 2026

The campaign generated 47 impressions, seven clicks, A$161.71 spend, A$23.10 average CPC and zero primary or all-conversions. Search impression share was 41.38%; 50.00% was lost to budget and 8.62% to rank. The paid search terms were commercially relevant Brisbane concreting queries rather than obvious overseas, job-seeker, DIY or material-supply waste. One `concrete supply brisbane` query received one impression and no click.

| Exact keyword | Impressions | Clicks | Spend | Primary conversions | Available quality signal |
|---|---:|---:|---:|---:|---|
| concreting brisbane | 19 | 4 | A$86.97 | 0 | 5/10; above-average ad relevance, below-average landing-page experience |
| retaining wall brisbane | 11 | 1 | A$53.40 | 0 | 1/10; below average for ad relevance, landing-page experience and expected CTR |
| concrete driveway brisbane | 2 | 1 | A$11.93 | 0 | Not yet populated |
| concrete contractors brisbane | 3 | 1 | A$9.41 | 0 | 4/10; average relevance/landing page, below-average expected CTR |
| concrete quote brisbane | 8 | 0 | A$0.00 | 0 | Not yet populated |
| concrete pathways brisbane | 2 | 0 | A$0.00 | 0 | Not yet populated |
| exposed aggregate driveway brisbane | 1 | 0 | A$0.00 | 0 | Not yet populated |
| remaining five exact keywords | 0 | 0 | A$0.00 | 0 | Not yet populated |

The top two keywords consumed 86.8% of spend. The A$53.40 retaining-wall click is the clearest efficiency concern, but one click is not enough evidence to pause a commercially relevant term. The keyword set should remain unchanged during this budget test; landing-page/ad-group refinement for retaining walls is a separate optimisation.

## Recommendation

Increase only the rebuilt Search campaign from **A$49.80/day to A$60.00/day**. This is a controlled 20.4% increase: large enough to recover some of the 50% budget-lost impression share while limiting additional exposure in a campaign with only seven clicks and no conversions. A larger jump is not justified yet. At the observed A$23.10 average CPC, A$60/day directionally supports about 2.59 clicks per day, although Google may spend more or less on individual days and conversion reporting may lag.

Preserve the 300% target ROAS, 12 exact keywords, negatives, Presence-only location setting, quote-only primary goal and all campaign statuses. Do not change PMax, Tradenet, Content Network or keyword statuses as part of this budget-only action. Monitor until the campaign reaches at least 20 total clicks or seven more days. If it still has zero submitted-quote conversions after that gate, restore A$49.80/day and fix keyword-to-ad/landing-page structure before adding further budget.

## Mutation reference and safeguards

The official Google Ads API `CampaignBudgetService.MutateCampaignBudgets` method creates, updates or removes campaign budgets and requires the Ads OAuth scope. Google’s mutation guidance recommends resource-specific grouped operations and supports a validate-only request before a live mutation. For this approved one-resource update, use campaign budget `customers/6553093174/campaignBudgets/15831697351`, update only `amount_micros` to `60000000`, validate first, then send the identical live operation and independently read the campaign back through the read-only Google Ads connector.

References: [MutateCampaignBudgets](https://developers.google.com/google-ads/api/reference/rpc/v25/CampaignBudgetService/MutateCampaignBudgets); [Google Ads API mutate best practices](https://developers.google.com/google-ads/api/docs/mutating/best-practices).

## Approved change and independent verification

The director explicitly confirmed **A$60.00/day**. At 23:33–23:34 AEST on 29 August 2026, the exact one-budget request was first sent with `validateOnly: true` and returned HTTP 200. The identical live request then returned HTTP 200 and the expected campaign-budget resource. Only `amountMicros` on budget `15831697351` was included in the update mask.

Independent readback through the read-only Google Ads connector confirmed Search at **A$60.00/day**, Maximise conversion value with the **300% target ROAS**, Search Partners off and campaign status enabled. Presence-only targeting remained unchanged. PMax remained **A$160.00/day** and Tradenet remained **A$0.20/day**, giving a configured total of **A$220.20/day**; this is not a strict daily spend cap.

The enabled `CCG Quote Form Only` custom goal still contains only conversion action `7546454804`. A direct six-action readback confirmed Quote Form Submission remains enabled, primary and included in conversions, while SMS, Visualiser, Callback, WhatsApp and Guide remain enabled secondary Contact actions excluded from the conversions metric. No keyword, negative, campaign status, bidding, location, network, conversion or PMax setting was changed.

Rollback amount: **A$49.80/day**. Measurement gate: at least 20 total Search clicks or seven additional days, whichever comes later. If no confirmed submitted-quote conversion exists at that gate, restore A$49.80/day and improve the retaining-wall and general-concreting ad/landing-page structure before adding more budget.

A fresh closing readback after documentation again returned Search at A$60.00/day, PMax at A$160.00/day and Tradenet at A$0.20/day, with all three campaigns enabled. The approved budget change is therefore confirmed live and stable at handoff.
