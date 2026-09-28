# Ipswich–Ripley Slab SEO Expansion Design

**Date:** 28 September 2026  
**Status:** Sectional design approved; written spec ready for director review  
**Branch:** `feature/ipswich-ripley-slab-seo-preview`  
**Base:** regional slab preview commit `1059a69c465d326d3ad2dee22472a023b9307b15`

## Decision

Concrete Concepts Group will run a **small, preview-first Ipswich–Ripley slab SEO expansion** focused on qualified house, structural and extension-slab concrete enquiries close to CCG’s Ipswich base.

The release will reuse the already built route `/areas/ipswich-ripley-house-slabs`. It will **not** create the competing `/services/house-slabs-ipswich-ripley` route proposed during early research. This resolves the known overlap risk before publication: one page will own combined Ipswich–Ripley structural-slab intent, while the existing Ipswich and Ripley locality pages will provide local context and route qualified visitors to it.

The first release remains a **dedicated Cloudflare noindex preview**. Customer production, sitemap indexing, Search Console and Google Ads are outside this implementation until the director gives separate production approval.

## Why this release

Ipswich Council recorded current residential growth across the city, including Ripley, Redbank Plains, Deebing Heights and Spring Mountain. Economic Development Queensland describes the Ripley Valley Priority Development Area as a long-term planned growth area.[1] [2] These sources support testing a useful corridor page; they do not prove CCG demand, project history, site readiness or guaranteed lead volume.

The corridor scored highest in the comparative research because it combines commercial fit, travel practicality and a credible residential construction context. The same research identified high overlap risk: the live site already contains Ipswich, Ripley, South Ripley, Redbank Plains, Springfield and Spring Mountain pages, plus the Brisbane slabs page and the noindex regional slab preview.

The controlled response is therefore **one transactional corridor page plus three existing-page upgrades**, not a new suburb-page rollout.

## Alternatives considered

### Chosen: reuse one corridor route and upgrade supporting pages

This approach gives combined house-slab intent a single owner, preserves stable URLs and improves genuinely useful qualification content on the existing locality pages.

### Rejected: create `/services/house-slabs-ipswich-ripley`

That URL would target substantially the same purpose as `/areas/ipswich-ripley-house-slabs`. Publishing both would risk keyword cannibalisation, duplicate intent and doorway-style routing.

### Rejected: create many corridor suburb pages

Separate slab pages for Deebing Heights, Yamanto, Flinders View, Springfield Lakes and similar locations would multiply near-identical destinations without enough distinct first-hand evidence or user value.

### Rejected: make Google Ads changes now

The purpose of this release is to build and verify the organic landing-page system. Ads keywords, budgets, bidding, locations, goals, final URLs and conversion settings remain unchanged.

## Exact page register

| Page role | Canonical path | Action | Search purpose |
|---|---|---:|---|
| Transactional corridor owner | `/areas/ipswich-ripley-house-slabs` | Upgrade existing noindex preview page | House slabs, structural residential slabs, footings and extension-slab concrete enquiries across the defined corridor |
| Broad technical authority | `/services/concrete-slabs-brisbane` | Restrained upgrade | Broad Brisbane and selected SEQ slab information; links once to the corridor owner |
| Geographic parent | `/areas/ipswich` | Truth-cleanup and typed-content upgrade | Ipswich locality context, site-specific qualification and routing to the corridor owner |
| Local growth-area page | `/areas/ripley` | Truth-cleanup and typed-content upgrade | Ripley locality/readiness context and routing to the corridor owner |

No alternate slug, campaign URL or duplicate canonical will be added.

### Dedicated candidate profile

This release will not reuse the existing all-regional preview switch. It will introduce an isolated Ipswich–Ripley candidate profile with this exact allowlist:

```text
/services/concrete-slabs-brisbane
/areas/ipswich
/areas/ripley
/areas/ipswich-ripley-house-slabs
```

The review index `/ipswich-ripley-slab-review` is preview-only and is not a production candidate.

The candidate profile has independent, generated `IPSWICH_RIPLEY_PREVIEW_ENABLED` and `IPSWICH_RIPLEY_PUBLISHED_ENABLED` flags. Both are `false` in checked-in source. Its dedicated build command enables only the Ipswich–Ripley preview flag. Regional-suite, Gold Coast, Southside and other-trade preview flags remain off.

On the dedicated preview host, the review index and four candidate versions return 200. Unpublished regional-suite pages, Gold Coast candidate pages, regional guides and Need Another Trade remain unavailable unless they are already customer-public for an unrelated approved release. Customer hosts continue to serve the current legacy versions of the three existing routes while the candidate publication flag is off; the new corridor route remains unavailable. A future publication flag may expose only the exact four-page allowlist.

## Intent ownership

### `/areas/ipswich-ripley-house-slabs`

This page owns the question:

> Can CCG assess and quote the concrete component of this house, structural or extension-slab project in the Ipswich–Ripley corridor?

Its scope includes suitable enquiries for:

- new-house slabs and structural residential slabs;
- footings and associated directly delivered concrete scope;
- garage, shed and related structural slabs where project information is sufficient for review;
- extension-slab concrete work, including relevant footings and interfaces with an existing structure; and
- larger or staged builder/developer packages that can be described through plans, programme and site information.

Every enquiry remains subject to the actual address, plans, engineering, approvals, access, levels, drainage, services, programme and CCG availability.

### `/areas/ipswich`

This page remains a broad Ipswich locality page. It will explain what CCG needs to assess concrete work at an Ipswich address and will link relevant house/structural slab visitors to the corridor owner. It will not duplicate the corridor page’s transactional sections.

### `/areas/ripley`

This page remains a Ripley locality page. It will focus on property-specific readiness: address and lot stage, handover status, documents, access, final levels, services, drainage and interfaces with other work. It will route slab intent to the corridor owner rather than claim ownership of the same search purpose.

### `/services/concrete-slabs-brisbane`

This page remains the broad technical slab authority. It will include one restrained contextual link to the Ipswich–Ripley corridor page and must not be rewritten into another corridor landing page.

## Geographic scope

The corridor page may naturally reference:

- Ipswich;
- Ripley and South Ripley;
- Deebing Heights;
- White Rock;
- Redbank Plains;
- Springfield, Springfield Central and Springfield Lakes; and
- Spring Mountain.

Named locations mean **address-review coverage**, not automatic acceptance, universal availability, a local depot, completed CCG work or a travel-fee promise.

Caboolture and Moreton Bay expansion remains outside this release. The director’s decision is to keep the next SEO work closer to Brisbane and Ipswich.

## Page content design

### Corridor page structure

1. **Hero:** “House and structural slabs across Ipswich and Ripley,” followed by a factual statement that CCG reviews site-specific concrete scope.
2. **Suitable projects:** concise descriptions of house slabs, structural slabs, footings, extension-slab concrete work and suitable builder packages.
3. **Homeowner pathway:** plans, engineering or soil/foundation information if available, approval/certifier status, dimensions or “not sure,” address, access, services and timing.
4. **Builder/developer pathway:** company, role, project address, drawings, required concrete scope, number of sites or pours, indicative programme and preferred follow-up.
5. **Corridor guidance:** useful sections for the named corridor without cloned suburb copy.
6. **Extension-scope boundary:** CCG directly quotes its concrete component. A complete-extension introduction remains optional and separately consented.
7. **Readiness checklist:** explain what helps CCG review the job without presenting a generic checklist as engineering or approval advice.
8. **Visible FAQs:** answer real qualification questions and match the `FAQPage` schema exactly.
9. **Primary CTA:** “Request a site-specific concrete quote.”

### Ipswich page treatment

The current legacy page contains price ranges, free-quote language, unverified licence/insurance language, local-experience claims, no-travel-fee claims, Australian Standards statements and an unaudited testimonial. The upgrade will remove these claims unless current evidence is approved for that exact statement.

The replacement content will focus on:

- useful categories of concrete enquiry;
- information needed for an address-specific review;
- the difference between locality guidance and the corridor slab page;
- internal links to the corridor owner and relevant existing services; and
- local planning context only where dated, cited and clearly unrelated to CCG delivery.

### Ripley page treatment

The current legacy page contains price ranges, fixed-price/free-quote language, unaudited licence/insurance and testimonial claims, estate familiarity, local-expert positioning, engineering/compliance claims and predicted completion times. These will be removed unless individually verified.

The replacement content will focus on:

- lot address, build or handover stage and available documents;
- levels, services, access, drainage and connected-work responsibilities;
- homeowner and builder preparation for an enquiry;
- property-specific review rather than suburb-wide assumptions; and
- a clear route to the corridor slab page.

## Truth and proof rules

The release prohibits:

- fixed “from” prices, square-metre price ranges or typical project totals;
- unaudited testimonials, reviews, ratings or local-project claims;
- unverified QBCC, licence, insurance, warranty or guarantee wording;
- claims of local-estate experience, builder relationships or completed corridor work without auditable first-party proof;
- promised response, quote or construction timeframes;
- universal soil, slope, flood, access, drainage, reinforcement or approval statements;
- claims that CCG supplies engineering, certification or complete-extension work unless a separate verified arrangement says so;
- no-travel-charge or universal-coverage promises; and
- language implying that a cited government development or statistic is a CCG project or guaranteed job source.

Where proof is unavailable, the claim or proof component is omitted rather than replaced with generic social proof.

## Quote and conversion behaviour

The existing five-step detailed quote funnel remains the only primary quote pathway. The release adds no short form, popup, exit-intent message, alternate quote endpoint or separate slab submission form.

Opening the CTA will save only the approved draft context and navigate to `/get-quote`:

- service: slab;
- region: Ipswich / Ripley;
- structural project: new house by default, adjustable by the customer; and
- landing route: `/areas/ipswich-ripley-house-slabs`.

The CTA must not submit data, upload a photo, send an email, create a Jotform record, write a lead to D1 or fire a Google Ads conversion.

### Raw and pre-hydration handoff

The raw corridor-page CTA will use the allowlisted URL `/get-quote?context=ipswich-ripley-house-slabs`. The quote page will map only that exact token to the approved four-field prefill. It will merge those fields without overwriting contact, address, measurements or other customer-entered draft data, consume the token once and remove it from the address bar before analytics page tracking.

The hydrated CTA and the raw CTA must resolve through the same allowlisted context map. Unknown, repeated or malformed context values are ignored. Reading or consuming the token must not trigger a request, upload, persistence operation or conversion. This preserves attribution when a visitor clicks the raw CTA before the regional page has hydrated.

### Homeowner and builder split

Homeowners and builders/developers continue through separate conditional questions. Missing plans or engineering may be recorded as unknown or in progress; unknown documents do not by themselves block an enquiry.

### Extension and partner interest

An extension enquiry must include a concrete component to remain in the detailed CCG quote flow. Partner-introduction interest is:

- optional;
- blank and unchecked by default;
- visible only for an eligible complete-extension-with-concrete context;
- cleared if the customer changes to an ineligible context;
- owner-review-first; and
- never automatic authority to disclose customer information.

Any final provider introduction requires the provider, role and information to be shared to be identified before the applicable final consent.

### Conversion isolation

Only a confirmed, successful detailed quote may fire the primary Quote Form Submission conversion. Page views, CTA clicks, quote starts, calls, SMS, callbacks, guide activity, uploads, partner interest, other-trade requests and tests remain secondary or non-conversion activity.

## Content architecture

A dedicated `shared/ipswichRipleySlabContent.ts` release registry will own the exact four candidate overlays, review-index definition, quote-context allowlist and required internal relationships. The existing regional registry may import the shared corridor record for backward-compatible regional review, but it cannot remain a second editable copy or control publication of this release.

Ipswich and Ripley will use a dedicated two-record locality-candidate model rather than being added as ordinary Batch 1 upgrades. Each record includes an explicit typed `corridorOwner` link. Metadata, raw crawlable content, hydrated visible content, FAQs, breadcrumbs and schema resolve from the candidate records only when the candidate access policy returns `preview` or `public`.

The Worker and SPA must apply the same access matrix:

| Host and flags | Corridor route | Brisbane slab, Ipswich and Ripley |
|---|---|---|
| Customer host; published off | Not found | Existing legacy/customer-public content |
| Dedicated preview host; preview on | Candidate content | Candidate overlay content |
| Other non-customer host; preview off | Not found | Existing baseline content, never the candidate overlay |
| Customer host; separately approved published on | Candidate content | Candidate overlay content |

Candidate rendering takes precedence only after access is granted. When access is `legacy`, the existing page object remains the renderer; candidate data must not partially alter metadata, raw HTML, schema or visible content. This coexistence preserves today’s live pages until written production approval while removing duplicate rendered sources from the candidate path.

The dedicated generator writes Worker and client data from the same registry. The dedicated preview build temporarily enables only `IPSWICH_RIPLEY_PREVIEW_ENABLED`, builds the self-contained Worker artifact and restores checked-in flags to `false`. It must not enable the all-regional, Gold Coast, Southside or other-trade preview flags.

## SEO requirements

Every page in the four-page register must have:

- a unique title under 60 characters where practical;
- a unique description under 160 characters;
- exactly one visible H1;
- a stable, single canonical URL;
- meaningful raw HTML before JavaScript hydration;
- matching visible and raw `BreadcrumbList`, `Service` and appropriate `FAQPage` data;
- truthful image alt text where images are retained;
- working internal links; and
- no hidden keyword lists or suburb-name substitution.

The corridor page and locality pages must pass an objective pairwise similarity gate. The comparison corpus is each page’s H1, introduction, scope or practical-consideration prose, locality-context attribution and visible FAQ answers. Navigation, breadcrumbs, CTA labels, standard cautions, schema wrappers and footer text are excluded.

The test normalises text with Unicode NFKC, lowercases it, replaces non-letter/digit characters with spaces, splits on whitespace, removes tokens shorter than three characters, removes a committed English stop-word list and removes the approved corridor place-name tokens. It then creates a set of remaining tokens and calculates Jaccard similarity as `intersection / union` for these pairs:

- corridor versus Ipswich;
- corridor versus Ripley; and
- Ipswich versus Ripley.

Every score must be **below 0.42** in the typed source and the generated raw main-content output. The test also asserts intent markers: the corridor page alone owns combined homeowner/builder structural-slab qualification, while each locality page contains its own property-readiness/routing purpose and its typed `corridorOwner` relationship. The acceptance record captures the three scores and the normalisation version.

Preview responses must return `X-Robots-Tag: noindex, nofollow` across HTML, redirects, assets and errors. The preview routes must not enter the customer sitemap. Publication requires a separate approved flag transition and sitemap change.

## Internal-link design

| Source page | Required relationship |
|---|---|
| `/services/concrete-slabs-brisbane` | One contextual link to the corridor page; keeps broad technical ownership |
| `/areas/ipswich` | Routes house/structural slab intent to the corridor page; links to useful nearby published localities only |
| `/areas/ripley` | Routes slab intent to the corridor page; links to relevant established corridor localities only |
| `/areas/ipswich-ripley-house-slabs` | Links back to Ipswich and Ripley, the allowlisted Brisbane slab technical page and carefully selected already-published corridor localities |

No link may point to an unpublished, redirected incorrectly or broken route. The default-off regional guides are deliberately excluded from this four-page candidate.

## Error handling and isolation

- Unknown or malformed regional paths return the established not-found response, not a misleading page shell.
- Customer hosts must not expose unpublished corridor content.
- Preview hosts must remain noindex even on redirects and error responses.
- Invalid, stale or ineligible partner-consent draft state is cleared before submission.
- Existing Australian mobile validation, location qualification, anti-spam, bounded request parsing and structured photo validation remain in force.
- D1 remains the source of truth for a confirmed detailed quote. A persistence failure must not show success or fire the primary conversion.
- Duplicate transaction identifiers must not generate duplicate notifications or Ads conversions.

## Test-first acceptance requirements

Implementation begins with failing tests for the new and changed contracts. Acceptance requires evidence for:

1. the exact four-page register and no alternate corridor URL;
2. the dedicated candidate allowlist, review index and independent default-off preview/publication flags;
3. all unrelated regional, Gold Coast, guide and other-trade candidate routes remain unavailable on the dedicated preview;
4. typed registry ownership, the candidate-versus-legacy access matrix and no duplicate rendered source;
5. unique title, description, H1, canonical, breadcrumbs and schema;
6. meaningful raw HTML parity with hydrated content;
7. truth-cleanup of the listed Ipswich and Ripley claims;
8. corridor/locality intent separation and all three specified Jaccard scores below 0.42;
9. valid internal links and malformed-route handling;
10. customer-host publication-off behaviour and unchanged legacy rendering;
11. preview-wide `noindex, nofollow` and production sitemap exclusion;
12. raw and hydrated CTA context-token parity, one-time merge and URL cleanup;
13. correct homeowner and builder draft prefill and conditional fields;
14. optional partner interest blank by default, eligibility-gated and cleared when ineligible;
15. zero lead, upload or conversion request from page navigation or preview QA;
16. fail-closed preview endpoint behaviour with a valid payload and mocked bindings;
17. exactly one primary conversion only after confirmed production detailed-quote success;
18. Australian mobile, service-area and anti-spam validation;
19. private photo token and `no-store` protections;
20. keyboard focus, mobile usability and no horizontal overflow;
21. no runtime errors or broken links;
22. source/build quote and conversion guards;
23. TypeScript, Worker syntax, focused tests and the full safe deterministic suite; and
24. an ordinary default-off build that preserves current customer behaviour.

External or billable live tests remain excluded unless separately authorised.

## Preview deployment and review

The verified artifact will be deployed only to a **new dedicated Cloudflare Pages preview branch**. It will not overwrite the existing regional, Gold Coast, Southside or conversion-readiness review aliases.

### Fail-closed preview environment contract

Immediately before deployment, Cloudflare readback must confirm the current approved preview resources or an explicitly approved replacement:

- `LEAD_BACKUP_DB` → preview D1 `57820612-5691-4486-8191-0e48b94a8ae4`;
- `LEAD_PHOTOS` → preview R2 bucket `ccg-other-trade-preview-photos-20260920`; and
- `LEAD_PREVIEW_DRY_RUN` present with the value `true` in the preview environment.

These identifiers are deployment expectations, not application secrets. They must be read again rather than assumed at release time.

On a non-customer preview host, the Worker requires `LEAD_PREVIEW_DRY_RUN === "true"` before accepting any quote, callback or photo-upload request. In dry-run mode it validates request shape but returns a clear preview-disabled response **before** D1 preparation, R2 writes, Jotform, Resend/Gmail, booking delivery or any conversion-success response. If the dry-run variable or isolated binding contract is absent, the preview fails closed with no persistence or outbound fetch.

Deterministic Worker tests will send a valid payload against mocked preview bindings and prove zero D1 calls, zero R2 writes and zero external fetches. Deployment readback—not customer data—proves the actual preview binding IDs. The isolated D1 aggregate count and preview R2 object count remain unchanged after browser QA.

Browser QA will inspect the four pages, representative homeowner and builder handoffs, keyboard focus, consent defaults, mobile layout and network activity without submitting a lead.

The acceptance record will contain only deployment identifiers, branch/commit, binding names/IDs, aggregate empty-state checks and privacy-safe route results. It will contain no customer details or credentials.

## Production boundary

Customer production currently remains separate from this work. Before any later publication, the current canonical Pages deployment, source commit, bindings and rollback deployment must be freshly read back.

A production release requires separate written approval for:

- the exact `IPSWICH_RIPLEY_PUBLISHED_ENABLED` transition while every unrelated preview/publication flag remains unchanged;
- customer Cloudflare deployment;
- sitemap and `lastmod` updates;
- Search Console submission; and
- any Google Ads final URL, keyword, location, budget, bid, asset, goal or campaign change.

The initial production candidate, if approved later, is the exact four-page register. No additional corridor pages may be added opportunistically during release.

## Measurement after any approved publication

The commercial funnel is:

> completed detailed quote → contactable → qualified concrete opportunity → document or site review → written quote → accepted work

Review a mature 60–90-day cohort using:

- completed detailed quotes by landing route and project type;
- contactable and qualified-opportunity rate;
- homeowner versus builder mix;
- written-quote rate;
- win rate and accepted-work value;
- travel or mobilisation burden; and
- cost per qualified opportunity where paid traffic is later approved.

Rankings, impressions, clicks, CTA clicks, quote starts and incomplete forms are diagnostic measures, not proof of commercial success.

Further suburb or service pages require both:

1. evidence that this controlled release produces useful, serviceable opportunities; and
2. distinct first-hand content or customer value that cannot be served by the existing corridor and locality pages.

## Explicitly out of scope

- Caboolture or Moreton Bay expansion;
- Deebing Heights, Yamanto, Flinders View, Springfield Lakes or other new suburb pages;
- customer production deployment or indexing;
- Google Ads changes;
- changes to quote recipients, Gmail, Resend or Jotform configuration;
- production D1 migrations;
- real or synthetic lead submissions;
- automatic partner forwarding;
- publication of partner identities;
- exit-intent popups;
- unsupported pricing, review, guarantee, licence, insurance or availability claims; and
- complete-extension contracting claims by CCG.

## Success criteria

The preview succeeds when:

- one clear URL owns Ipswich–Ripley slab intent;
- Ipswich and Ripley provide distinct, useful locality guidance;
- the legacy unsupported claims are absent from the preview;
- the five-step funnel and delivery/conversion contracts remain unchanged;
- no preview page becomes indexable or customer-live;
- no test lead, email, Jotform record, D1 lead or Ads conversion is created; and
- the director can review the complete four-page experience before deciding whether to approve production.

Publication success, if separately approved, means more qualified, directly serviceable and commercially useful slab opportunities—not merely more traffic.

## References

[1]: https://www.ipswich.qld.gov.au/News-Articles-Folder/2026/New-housing-accelerates-in-Ipswich-as-thousands-choose-citys-lifestyle "Ipswich City Council — New housing accelerates in Ipswich"

[2]: https://www.edq.qld.gov.au/projects/ripley-valley/ "Economic Development Queensland — Ripley Valley Priority Development Area"

[3]: https://developers.google.com/search/docs/essentials/spam-policies "Google Search Central — Spam policies for Google web search"

[4]: https://developers.google.com/search/docs/fundamentals/creating-helpful-content "Google Search Central — Creating helpful, reliable, people-first content"

[5]: https://www.qbcc.qld.gov.au/home-owner-hub/build-renovate/doing-work/building-approvals-certification "Queensland Building and Construction Commission — Building approvals and certification"

[6]: https://www.accc.gov.au/consumers/advertising-and-promotions/false-or-misleading-claims "Australian Competition and Consumer Commission — False or misleading claims"
