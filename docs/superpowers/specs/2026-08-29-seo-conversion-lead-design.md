# SEO, Conversion and Qualified-Lead Design — 29 August 2026

**Author:** Manus AI

## Goal

Increase genuine CCG enquiries without teaching Google Ads to optimize for page views, button taps, incomplete placeholder-email records or unverified testimonials. The five-step submitted quote remains the primary website lead, while calls, SMS, WhatsApp, callback, visualiser, guide and referral interactions receive truthful secondary classifications until evidence proves they deserve bidding weight.

## Options considered

| Option | Scope | Benefit | Risk | Decision |
|---|---|---|---|---|
| A. Qualified-lead foundation | Fix form classification/delivery, add mobile SMS, create secondary message/callback tracking, clean sitemap/schema and add edge metadata | Highest measurement and SEO integrity with controlled implementation | Requires coordinated website, Worker and Ads-label changes | **Recommended** |
| B. Make all call/text/message taps primary | Count phone, SMS and WhatsApp clicks as campaign conversions immediately | Reported conversion count rises quickly | Recreates inflated history and trains Ads toward unconfirmed actions | Reject |
| C. SEO-only release | Sitemap, schema and metadata fixes only | Low Ads risk | Leaves broken guide, callback misclassification and missing message tracking | Defer as insufficient |

## Recommended staged implementation

### Release 1 — Website lead integrity and technical SEO

The detailed `/get-quote` wizard and full homepage contact form remain submitted-quote paths. A quote conversion fires only after the server/Worker confirms delivery. The homepage mini form, blog CTA and 30-second callback popup become explicitly labelled callback requests. They may remain low-friction and continue reaching owner email/Jotform, but they fire a real secondary callback action—not the submitted-quote action. The visualiser gate similarly becomes a secondary visualiser lead rather than a completed quote.

The mobile sticky bar becomes **Call | Text | WhatsApp | Quote**. Text opens a prefilled `sms:` link to `0424 463 268`. Phone, SMS and WhatsApp clicks remain secondary. At 320–430px widths, each target must remain at least 44px high, labels must not wrap, and the bar must not cover quote-form controls.

The Cloudflare Worker gains a dedicated guide submission route. The guide page unlocks only after confirmed delivery or a truthful fallback and fires the guide event only afterward. Guide, referral and calculator events remain secondary/internal and do not enter PMax/Search bidding goals.

For SEO, the 76 noindex `/lp/` URLs are removed from the public sitemap, reducing it from 278 to 202 indexable URLs. The static LocalBusiness JSON-LD removes self-controlled `aggregateRating` and embedded review objects. The Cloudflare Worker rewrites crawler-visible title, description, canonical and robots directives for core, service, suburb, blog and paid-landing routes before JavaScript; `/lp/` receives `noindex, follow` at the edge. Existing client metadata remains as the hydrated source of rich page-specific schema.

All unverified testimonial-style content on paid landing pages is removed rather than replaced. No fabricated review, rating or customer identity may be created. Absolute legal, compliance, property-value or guaranteed-outcome language is retained only when source-verified and appropriately qualified.

### Release 2 — Measured Ads call expansion

Attach the verified `0424 463 268` call asset to rebuilt Search and retain the existing 60-second `Calls from ads` action outside the primary custom goal initially. After at least three verified 60-second calls match genuine business records, the director may approve a new `CCG Qualified Leads` goal containing submitted quotes plus 60-second calls. Website phone taps, SMS and WhatsApp remain secondary.

The previously identified account-control corrections remain separate explicit changes: restore PMax from $160/day to $100/day, disable Search content-network expansion and its auto-apply category, and add approved PMax noindex/non-commercial URL exclusions. No budget or campaign-goal change is bundled into the website release without confirmation.

## Data contracts

Each lead submission carries a `leadKind` value from `quote`, `callback`, `visualiser`, `guide` or `referral`. The visitor’s service, suburb, source, UTM and click IDs remain unchanged. Placeholder email values are permitted only for non-quote callback records and must be visibly labelled as unavailable in owner notifications and Jotform—not presented as customer emails.

The Worker response retains `success`, `message`, `channels` and `serviceAreaStatus`. Quote conversion fires only when `success=true` and `leadKind=quote`. Secondary callback/visualiser/guide events fire only after their own confirmed success. A mail-app draft never counts as delivery.

## Acceptance gates

| Area | Required proof before publication |
|---|---|
| Quote protection | Five-step and full homepage quote still require Australian mobile, real email, SEQ location, selected service and meaningful project details |
| Delivery | Quote and callback focused tests prove truthful Worker/tRPC success and fallback; no unlabelled production submission |
| Google Ads | Genuine quote label unchanged; new callback/SMS/WhatsApp labels map to real secondary account actions; no page-view/tap goal becomes primary |
| SEO | 202 sitemap URLs; no `/lp/`; route-specific edge canonical/title/robots; self-review schema absent; JSON-LD parses |
| Mobile UX | 320, 390 and 430px screenshots pass; call/text/WhatsApp/quote targets do not overlap or wrap |
| Build | Focused Vitest, full deterministic suite excluding known external-only tests, TypeScript, guarded build and Worker syntax pass |
| Release | Fresh director approval, Cloudflare rollback retained, apex/www/Pages quote-route guards and post-release Gmail/Jotform monitoring pass |

## Measurement

The release is judged on genuine submitted quotes, delivered callback requests, verified 60-second calls and matched Gmail/Jotform records. Secondary SMS/WhatsApp clicks are diagnostic only. SEO impact should be reviewed in Search Console after recrawl; Similarweb and public search are directional, not substitutes for first-party analytics.

## References

[1]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google Search Central — Build and submit a sitemap"
[2]: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics "Google Search Central — JavaScript SEO basics"
[3]: https://developers.google.com/search/docs/appearance/structured-data/local-business "Google Search Central — LocalBusiness structured data"
[4]: https://support.google.com/google-ads/answer/7684791?hl=en "Google Ads Help — Responsive Search Ads"
