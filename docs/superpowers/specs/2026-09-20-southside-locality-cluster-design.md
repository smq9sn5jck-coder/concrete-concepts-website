# Brisbane South-Side Locality Cluster Design

**Date:** 20 September 2026
**Status:** Approved by the director

## Purpose

This release strengthens Concrete Concepts Group’s organic visibility for residential concreting work across a focused Brisbane south-east and bayside cluster. It covers eight canonical locality routes: Murarrie, Wynnum, Cannon Hill, Norman Park, Morningside, Tingalpa, Camp Hill and Carina.

The release must improve useful local relevance without creating doorway pages, duplicating URLs, adding unsupported claims or changing Google Ads. It preserves the existing five-step detailed quote funnel and the rule that only a confirmed detailed quote submission can fire the primary Google Ads conversion.

## Exact page register

| Locality | Canonical path | Action | Release treatment |
|---|---|---|---|
| Murarrie | `/areas/murarrie` | Retain | Keep the live Batch 1 page and strengthen cluster links |
| Wynnum | `/areas/wynnum` | Upgrade | Replace the legacy price, activity and unsupported locality claims |
| Cannon Hill | `/areas/cannon-hill` | Upgrade | Replace fixed-price and unverified licence language |
| Norman Park | `/areas/norman-park` | Create | Build a new canonical page; the route currently shows the noindex not-found experience |
| Morningside | `/areas/morningside` | Upgrade | Replace price, testimonial, aggregate-rating and unsupported engineering claims |
| Tingalpa | `/areas/tingalpa` | Upgrade | Replace testimonial, completion-time and prescriptive soil/reinforcement claims |
| Camp Hill | `/areas/camp-hill` | Upgrade | Replace unverified licence, popularity and activity claims |
| Carina | `/areas/carina` | Upgrade | Replace price ranges, licence language and unverified activity claims |

No alternate spellings, duplicate locality URLs or new campaign landing pages will be created.

## Content architecture

All eight pages use the typed locality-content model proven by Batch 1. Murarrie remains in that model. Norman Park receives a new record. The six legacy records are migrated into the typed model so metadata, raw crawlable content, visible content and structured data come from one source.

Each page contains a unique title, meta description, H1, introduction, practical site-planning section, relevant service links, visible FAQs, nearby-locality links and an evidence record for factual locality context. Access, levels, drainage, existing surfaces, placement constraints and finish suitability are presented only as matters to assess for the individual property.

The content must not suggest that one condition applies to every property in a suburb or that CCG worked on a cited development, council project or estate without verified first-party evidence.

## Locality-specific treatment

**Murarrie** keeps its current quality-controlled content and links clearly with Cannon Hill, Morningside and Tingalpa.

**Wynnum** removes price ranges, generic coastal guarantees and unsupported regular-work claims. It focuses on access, existing surfaces, levels, drainage and finish selection after property review.

**Cannon Hill** removes “from $65/m²”, free-quote promises, unverified licence wording and unsupported popularity or development statements. It focuses on the information needed for a useful site assessment.

**Norman Park** receives a new page with unique context and a clear separation between locality background and property conditions. The existing `/lp/exposed-aggregate-norman-park` page must be audited before production. It will not be redirected or altered until a read-only Google Ads final-URL check proves that doing so cannot affect advertising.

**Morningside** removes the unverified testimonial, locality aggregate rating, price anchor, unverified licence claim and guaranteed engineering or council-compliance wording.

**Tingalpa** removes the unverified testimonial, “common jobs” activity claim, one-to-two-day completion claim and suburb-wide reactive-clay or reinforcement prescription.

**Camp Hill** removes or qualifies unsupported claims about premium finishes, popularity, terrain, access, local activity, licensing and heritage-house experience. Any gallery or activity component displayed on the route must have auditable first-party evidence or be omitted.

**Carina** removes price ranges, typical project totals, unverified licence wording, regular-work claims and broad terrain statements.

## Truth and proof rules

The cluster prohibits fixed “from” prices, square-metre price ranges, typical project totals, unaudited testimonials or ratings, unverified licence/insurance/warranty/guarantee claims, promised response or completion times, fabricated local activity, universal soil/access/drainage assertions and any implication that a cited development is a CCG project.

Where first-party proof is unavailable, the proof component is omitted rather than replaced with generic or invented social proof.

## Internal-link cluster

Each page links to the service-area directory, relevant existing service pages and three to five nearby published localities.

| Locality | Preferred nearby links |
|---|---|
| Murarrie | Cannon Hill, Morningside, Tingalpa |
| Wynnum | Cannon Hill, Tingalpa, Manly, Lota |
| Cannon Hill | Murarrie, Morningside, Carina, Camp Hill, Tingalpa |
| Norman Park | Morningside, Camp Hill, Cannon Hill, Bulimba, Hawthorne |
| Morningside | Murarrie, Cannon Hill, Camp Hill, Norman Park |
| Tingalpa | Murarrie, Cannon Hill, Wynnum, Carina, Carindale |
| Camp Hill | Carina, Cannon Hill, Morningside, Norman Park, Coorparoo |
| Carina | Camp Hill, Morningside, Cannon Hill, Carindale, Coorparoo |

No page may link to a broken or unpublished route.

## Quote and conversion behavior

The primary page action is **Start a detailed quote**. It saves the locality and optional service into the existing draft, then opens `/get-quote`. It does not submit a lead and does not fire a primary conversion.

The release adds no short form, callback form, pop-up form or alternate lead endpoint. The existing five-step payload, Australian phone validation, Brisbane/SEQ qualification, anti-spam, Gmail delivery, Jotform backup, D1 backup and private optional photos remain unchanged.

Only confirmed detailed-quote completion may fire Quote Form Submission action `7546454804`. Page views, locality links, CTA clicks, calls, SMS, callbacks and tests remain non-primary.

## SEO requirements

Every route must have a unique title, unique description, exactly one visible H1, self-canonical, useful locality-specific raw HTML and matching visible FAQ/`FAQPage` content. `BreadcrumbList` and `Service` structured data remain present where appropriate.

Pairwise similarity tests must block suburb-name substitution or doorway-style duplication. The pages must follow Google’s people-first content guidance and spam policies.[1] [2]

The existing seven canonicals keep stable URLs. Their sitemap `lastmod` changes only when content is released. Norman Park enters the production sitemap only after customer-host publication approval. All staging and immutable preview hosts remain `noindex, nofollow`.

## Cloudflare staging and approval

The cluster will first run on a separate noindex Cloudflare Pages preview. `/southside-review` will list all eight pages and identify create, upgrade and retain actions. Customer production remains unchanged until a separate explicit release approval.

Before any production release, the current canonical deployment, project bindings and rollback target are read back. No real customer enquiry, email, Jotform record, D1 lead or Ads conversion is created during preview review.

## Acceptance criteria

The release is accepted only when tests prove the exact eight-page register, staging-only publication boundaries, stable existing URLs, removal of prohibited claims, unique content, raw HTML parity, structured-data parity, valid nearby links, five-step handoff without submission, no primary conversion side effects, mobile usability, zero browser errors, similarity below the approved threshold, source/build quote guards, full deterministic tests, TypeScript, production build and Worker syntax.

Google Ads receives read-only checks only. No keyword, location, budget, bidding, goal or landing-page setting is changed.

## Production release

After separate production approval, the guarded Cloudflare direct-upload process publishes the verified build. Acceptance includes the homepage, `/get-quote`, `/areas`, all eight locality routes, sitemap, robots controls, Partner Portal redirect, immutable deployment and at least fifteen minutes of monitoring.

The refreshed sitemap is submitted to Google Search Console after successful release monitoring. Indexing and rankings are not guaranteed and may take time.

## Out of scope

No Google Ads changes, Need Another Trade publication, Partner Portal changes, email-recipient changes, Jotform configuration changes or new trade services are included.

## References

[1]: https://developers.google.com/search/docs/fundamentals/creating-helpful-content "Google Search Central — Creating helpful, reliable, people-first content"
[2]: https://developers.google.com/search/docs/essentials/spam-policies "Google Search Central — Spam policies for Google web search"
