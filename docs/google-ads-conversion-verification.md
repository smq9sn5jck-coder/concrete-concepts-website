# Google Ads Conversion Verification

**Account:** Concrete Concepts Group Pty Ltd (`6553093174`)  
**Verified:** 28 August 2026  
**Method:** Read-only conversion-action query

| Conversion action                                          | Status  | Type             | Category         | Primary | Verified send-to value                |
| ---------------------------------------------------------- | ------- | ---------------- | ---------------- | ------: | ------------------------------------- |
| Quote Form Submission                                      | Enabled | Webpage          | Submit lead form |     Yes | `AW-18007005419/oPHGCJSGt44cEOuxtIpD` |
| Click to call                                              | Enabled | Click to call    | Phone call lead  |      No | `AW-18007005419/KuCJCPSeyo4cEOuxtIpD` |
| Quote form submission (https://concreteconceptsgroup.com/) | Enabled | Codeless webpage | Request quote    |      No | `AW-18007005419/gYGUCMP3-Y0cEOuxtIpD` |
| Submit lead form                                           | Enabled | Webpage          | Submit lead form |      No | `AW-18007005419/Fdc_CO_p2okcEOuxtIpD` |

The live primary website quote action is **Quote Form Submission**, using `AW-18007005419/oPHGCJSGt44cEOuxtIpD`. The previous source values `AW-18007005419/quote_submission` and `AW-18007005419/phone_call_click` are readable placeholders rather than the verified Google Ads labels and must not be deployed.

No referral-program or CGS conversion action exists in the account. This matches the approved strategy: those forms emit isolated analytics events but do not fire a Google Ads conversion in the concreting account.

**Source:** Google Ads account conversion-action query executed through the connected read-only Google Ads integration on 28 August 2026.

## Campaign optimisation verification

The enabled **CCG Search - High Intent Concreting - Rebuilt 2026-08-27** and **Performance Max-1** campaigns both use the enabled campaign-level custom conversion goal **CCG Quote Form Only** (`6458854572`). That custom goal contains exactly one conversion action: **Quote Form Submission** (`7546454804`).

The enabled **Tradenet** campaign uses customer-level conversion goals. Its biddable categories include website lead-form submissions and website request-quote actions. Because the referral and CGS forms do not fire any Google Ads conversion action, they cannot enter either the quote-only custom goal or Tradenet’s biddable Google Ads categories through the new code.

This configuration confirms that the new referral and CGS journeys will not contaminate the quote-optimisation signal when deployed as implemented.
