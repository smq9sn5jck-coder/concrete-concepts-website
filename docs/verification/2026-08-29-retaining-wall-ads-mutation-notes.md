# Retaining-Wall Google Ads Mutation Notes

**Captured:** 29 August 2026  
**API version:** Google Ads API v25

## Official Requirements

Google documents ad-group creation through `AdGroupService.MutateAdGroups`. The create resource sets `name`, `status`, `campaign` and `type`; a Search ad group uses `SEARCH_STANDARD`. Google recommends creating new campaign structures paused until targeting and ads are ready, but this release uses validate-only requests followed by controlled live creation and independent readback.

Google documents responsive Search ad creation through `AdGroupAdService.MutateAdGroupAds`. A responsive Search ad requires at least three headlines, at least two descriptions and at least one final URL. The ad-group ad resource sets the destination ad group and status, while the nested ad sets `finalUrls` and `responsiveSearchAd` assets. Optional `path1` and `path2` are display-path text.

Keyword criteria are created through `AdGroupCriterionService.MutateAdGroupCriteria`. The dedicated group will receive only exact keyword `retaining wall brisbane`. The existing mixed-service group will receive a phrase negative `retaining wall` and its current exact retaining-wall keyword will be paused, preventing overlap while preserving rollback.

All live operations must first pass `validateOnly: true`. Protected campaign budget, target ROAS, location mode, custom conversion goal and unrelated ads/keywords are not part of any update mask or create body.

Google’s `GoogleAdsService.Mutate` supports grouped operations across different resource types and temporary negative resource IDs. The new ad group, its exact keyword and its RSA can therefore be validated and created as one all-or-nothing package. Temporary names must be defined before they are referenced and cannot be reused. The dedicated package will initially create the ad group **paused** so it cannot compete with the serving mixed ad group while the new RSA is under policy review. Routing will switch only after an independent readback confirms the new ad is approved and eligible.

## References

[1]: https://developers.google.com/google-ads/api/docs/campaigns/create-ad-groups "Create Ad Groups | Google Ads API"
[2]: https://developers.google.com/google-ads/api/docs/responsive-search-ads/create-responsive-search-ads "Creating Responsive Search Ads | Google Ads API"
[3]: https://developers.google.com/google-ads/api/reference/rpc/v25/AdGroupAdService/MutateAdGroupAds "MutateAdGroupAds | Google Ads API"
[4]: https://developers.google.com/google-ads/api/docs/mutating/best-practices "Mutate Best Practices | Google Ads API"
[5]: https://developers.google.com/google-ads/api/docs/mutating/overview "Mutating Resources | Google Ads API"
[6]: https://developers.google.com/google-ads/api/rest/common/mutate "Mutate REST Requests | Google Ads API"
