# Concrete Concepts: Referral Website and Google Ads Structure

**Author:** Manus AI  
**Date:** 27 August 2026

## Recommendation

**Concrete Concepts can support customer enquiries, a trade referral program, and marketing referrals, but the three offers should not share one landing page or one Google Ads conversion event.** The main Concrete Concepts site should remain clearly focused on concreting customers. A trade referral program is close enough to the core business to sit on a dedicated page of the same domain. A “Want a website like this?” or “Want more leads?” offer is a different service and should normally lead to a separate marketing brand, domain, or subdomain.

Google Ads is not automatically confused merely because other pages exist on the website. The risk appears when the page reached from an ad contains mixed messages, the ad’s call-to-action does not match the landing page, or unrelated form submissions are reported to Smart Bidding as though they were concreting quote leads. Google states that ad, keyword, landing-page, and call-to-action alignment affects landing-page experience and the likelihood of conversion.[1] Google also allows campaigns to optimise for different conversion actions through campaign-specific goals.[2]

> **Best rule:** one audience, one page, one form, one conversion action.

## Recommended Website Architecture

| Audience and intent                        | Recommended destination                                                | Placement                                                                                   | Main call-to-action          |
| ------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| Homeowner or builder seeking concreting    | `/` and dedicated service pages such as `/concrete-driveways-brisbane` | Main navigation and Google Ads                                                              | **Request a Concrete Quote** |
| Trade sending a concreting job             | `/trade-referral-program`                                              | Small “For Trades” navigation or footer link; direct outreach and QR links                  | **Refer a Job**              |
| Trade wanting leads for their own business | Separate marketing website or `growth.concreteconceptsgroup.com`       | Link from the trade page or a discreet footer attribution—not from the main ad landing page | **Get More Leads**           |
| Business owner wanting a similar website   | Preferably a separate marketing website                                | Discreet “Want a website like this?” footer link opening the separate site                  | **Request a Website Review** |

The trade referral page may remain on the Concrete Concepts domain because it supports the core concreting operation. It should explain who can refer work, which projects qualify, service areas, how attribution works, when rewards are payable, and any program terms. The form should ask for referrer details and job/customer details separately.

The website-and-marketing offer should not become a prominent block on the homepage. Someone clicking an ad for a Brisbane driveway should immediately see driveway or concreting content and a quote action, not a second offer about websites or lead generation. Google specifically recommends pages that closely match the ad and keywords, present the expected action prominently, and avoid clutter.[1]

## Google Ads and Conversion Setup

| Conversion action          |  Concreting campaigns | Trade-referral campaign |                                      Marketing campaign |
| -------------------------- | --------------------: | ----------------------: | ------------------------------------------------------: |
| `customer_quote_submitted` |           **Primary** |   Excluded or secondary |                                                Excluded |
| `qualified_phone_call`     |           **Primary** |   Excluded or secondary |                                                Excluded |
| `trade_job_referred`       | Secondary or excluded |             **Primary** |                                                Excluded |
| `website_lead_submitted`   |              Excluded |                Excluded | **Primary in a separate marketing account or campaign** |
| `get_more_leads_enquiry`   |              Excluded |                Excluded | **Primary in a separate marketing account or campaign** |

Google defines **primary conversions** as actions used for bidding and shown in the Conversions column, while **secondary conversions** are observation-only unless included in a custom goal.[3] Accordingly, concreting campaigns should optimise only for real customer quote leads and qualified calls. Trade referrals and marketing enquiries should not inflate the lead count or train bidding toward people who are not buying concreting services.

If the trade program is advertised, it should have its own campaign, keywords, ads, landing page, budget, and campaign-specific conversion goal. If website or lead-generation services are advertised, the cleanest structure is a separate marketing brand and Google Ads account, or at minimum a separate campaign with its own landing page and conversion action.

## Tracking and Lead Routing

Every form should send a clear `lead_type`, such as `concrete_quote`, `trade_referral`, `website_enquiry`, or `marketing_lead`. It should also retain `gclid`, UTM parameters, landing-page URL, referring URL, and timestamp. The forms should have separate success events and preferably separate thank-you URLs.

The current Concrete Concepts code is already built around a single customer quote journey. Its quote form fires a Google Ads conversion after successful submission. **Do not copy that same conversion event into the trade or marketing forms.** Create a unique event and conversion action for each intent, then verify the real Google Ads conversion ID and label before launch.

Lead notifications should also be separated. Concrete quote requests should go into the existing sales/job workflow. Trade referrals should enter a referral register with the referrer attached. Website and marketing enquiries should go to the marketing provider’s CRM or inbox rather than the concreting quote pipeline.

## Safe Page and Navigation Design

On the main site, the customer path should remain dominant. A small **For Trades** link is appropriate in the navigation or footer. On the trade referral page, a secondary link may say **Need more jobs for your own trade business?** and send the visitor to the separate marketing site. A discreet footer attribution such as **Want a website like this?** can also link out, but it should not compete with **Get a Quote**, appear in the hero, or interrupt paid-search landing pages.

For maximum control, dedicated Google Ads landing pages may use simplified navigation. They should retain normal business identity, contact information, privacy information, and useful original content, while omitting unrelated promotional links from the principal conversion path.

## Decision

**Use one Concrete Concepts domain for concreting leads and the trade job-referral program, with separate pages and forms. Use a separate marketing destination for “Want a website like this?” and “Want more leads?” enquiries.** This structure will not confuse Google Ads when each campaign has a relevant landing page and only its intended conversion is used for bidding. Mixing all offers into the homepage or reporting all submissions as the same conversion would create the real performance risk.

## References

[1]: https://support.google.com/google-ads/answer/6238826?hl=en "Google Ads Help — Optimize your ads and landing pages"
[2]: https://developers.google.com/google-ads/api/docs/conversions/goals/campaign-goals "Google Ads API — Campaign goals"
[3]: https://support.google.com/google-ads/answer/11461796?hl=en "Google Ads Help — About primary and secondary conversion actions"
