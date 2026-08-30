# Main-Domain Partner Content Incident

**Author:** Manus AI
**Reported:** 30 August 2026
**User evidence:** iPhone screenshot showing the heading “Reliable concrete work. No chasing.” and partner referral CTAs while Safari displayed `concreteconceptsgroup.com` in its collapsed address bar.

## Initial Baseline

The canonical apex homepage currently hydrates to the correct customer site with title `Concreter Brisbane | Concrete Concepts Group`, H1 `Your Concrete, Our Expertise`, the customer quote prefill form and standard concreting services. It is not currently serving the trade page at `/`.

Raw mobile-user-agent checks returned 200 with no redirect for apex `/`, www `/`, apex `/partners`, partner-subdomain `/` and partner-subdomain `/partners`. Apex and www have the customer homepage title. Apex `/partners` exists as a separate route with title `Partners | Concrete Concepts Group Brisbane`. The partner subdomain has title `CCG Trade Partner Portal`.

The live source correctly points all three Trade Partners links in Navbar and Footer to `https://partners.concreteconceptsgroup.com/partners`, not to the main-domain `/partners` path.

The incident is therefore not yet proven to be an apex deployment replacement. The next check must compare the hydrated visual content of main-domain `/partners` and partner-subdomain `/partners`, then inspect DNS, Cloudflare aliases and navigation behavior to determine whether the screenshot reflects a hidden path, Safari host collapsing, an old cached route or a genuine redirect issue.

## Hydrated Route Comparison

The main-domain route `https://concreteconceptsgroup.com/partners` hydrates to the site’s standard **404 Page Not Found** and does not contain the screenshot’s referral copy. The external route `https://partners.concreteconceptsgroup.com/partners` hydrates to the current **CCG Trade Partner Portal** with the H1 `Build stronger networks. Share better opportunities.` It also does not match the screenshot’s H1 `Reliable concrete work. No chasing.`

This means the screenshot is neither the current apex homepage, the current main-domain `/partners` route nor the current partner-portal `/partners` content. The exact old copy must now be traced across source repositories, Cloudflare deployments and other domains. A stale browser/service-worker cache or an older deployment remains plausible, but is not yet proven.

## Cloudflare Pages Project Map

The connected Cloudflare account has one Pages project carrying the CCG customer domain: `concrete-concepts-group`. Its canonical deployment is `c2c56e33-d43a-45a5-b375-b8bdc0430a00`, created `2026-08-29T15:39:00.577357Z`, with only `https://concreteconceptsgroup.com` and `https://www.concreteconceptsgroup.com` as aliases. Both custom domains are active on that project. The canonical deployment metadata identifies the accepted retaining-wall landing release.

The `partners.concreteconceptsgroup.com` hostname is **not** attached as a custom domain to the main Pages project. No second CCG partner Pages project appeared in the connected account’s project list. This rules out the partner subdomain being an alias of the main Pages project within this account and makes DNS/Worker routing or a separately hosted service the next layer to inspect.

The main Pages deployment history remains consistent with the accepted customer site. No current deployment alias points the apex or `www` to a partner build. Historical CCG deployments include the partner-link releases, but their metadata describes adding links to the separate portal rather than replacing the customer homepage.

## Root Cause Identified

Cloudflare DNS and Worker routing reveal **two separate partner experiences**:

| Experience | Live address | Cloudflare service | Purpose |
|---|---|---|---|
| Public Trade Partner Network | `https://concreteconceptsgroup.com/trade-partners` and `https://trade.concreteconceptsgroup.com/trade-partners` | `ccg-trade-partners` | Public referral and subcontractor enquiry page |
| Trade Partner Portal | `https://partners.concreteconceptsgroup.com/partners` | `ccg-partner-portal` | Current application, login and referral-credit portal |

The screenshot is an exact match for the **public Trade Partner Network** Worker: H1 `Reliable concrete work. No chasing.`, CTAs `Refer a Job to CCG` and `Work With CCG`, and the `Trade priority docket` panel. Cloudflare explicitly routes `concreteconceptsgroup.com/trade-partners*` to Worker `ccg-trade-partners`; the same Worker is attached to `trade.concreteconceptsgroup.com`. Safari’s collapsed address bar shows only `concreteconceptsgroup.com`, hiding the `/trade-partners` path visible when the address field is expanded.

This is not the customer homepage replacing itself. Apex and www remain on Pages deployment `c2c56e33` and render the correct customer site. It is a duplicate/legacy partner route still mounted under the customer domain.

The current Navbar/Footer source is deliberately tested to link to `https://partners.concreteconceptsgroup.com/partners` and to reject `https://concreteconceptsgroup.com/trade-partners`. The public main-site source therefore does not intentionally send new visitors to the screenshot page. No partner/trade/referral URL appeared in the recent Google Ads landing-page or PMax expansion inventory, and none had measured paid clicks. The old route can still be reached from a bookmark, history, direct URL or external stale link.

## Decision Required

The technically smallest correction is a permanent redirect from both old Trade Partner Network addresses to the current portal. That would remove duplicate public experiences and user confusion while leaving the customer homepage, quote funnel and Google Ads destinations unchanged. Because the old Worker includes distinct referral and subcontractor forms, this redirect changes business workflow and should be approved explicitly rather than applied silently.

## Confirmed Destination Decision

The director confirmed that the newer portal at `https://partners.concreteconceptsgroup.com/partners` is the experience to retain. The screenshot/legacy public Trade Partner Network should be retired rather than linked from the customer site.

## Redirect Implementation Baseline

Cloudflare DNS maps apex and `www` by proxied CNAME to `concrete-concepts-group.pages.dev`. The partner portal uses a proxied `AAAA 100::` record and Worker custom domain mapped to service `ccg-partner-portal`. The legacy trade page is service `ccg-trade-partners`, attached both to custom domain `trade.concreteconceptsgroup.com` and zone route `concreteconceptsgroup.com/trade-partners*`.

The current route inventory contains no Worker route affecting apex `/` or `/get-quote`. The only main-domain legacy route is the scoped `/trade-partners*` pattern. No dynamic redirect ruleset currently exists in the zone; only managed security and cache settings are present.

Cloudflare’s Workers API supports immutable script versions and explicit deployments through `POST /accounts/{account_id}/workers/scripts/{script_name}/versions` and `POST /accounts/{account_id}/workers/scripts/{script_name}/deployments`. Existing deployments and deployable versions can be listed first, enabling the current Worker version ID to be retained as a direct rollback target before a redirect-only version is uploaded. The version upload accepts multipart Worker content and metadata; deployment is a separate operation. This is safer than deleting the Worker route or custom domain because both legacy addresses can continue resolving while the Worker returns a controlled redirect.

The tested redirect Worker passed three local contracts, but direct upload credentials lacked Worker-edit permission and the authenticated connector did not serialize multipart content as required. No Worker version or production deployment changed. The active legacy version remains `ca9c3bfe-b52f-45a4-b901-66a273169771` at 100%.

Cloudflare documents Single Redirects as the first URL-forwarding rule phase, before URL rewrites, configuration/origin rules and Bulk Redirects. Its API guide uses the zone `http_request_dynamic_redirect` entry-point ruleset for reversible redirect rules. This provides a safer JSON-based correction through the authenticated connector and executes before the legacy Worker route. Sources: [Cloudflare Redirects](https://developers.cloudflare.com/rules/url-forwarding/), [Single Redirects](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/), and [Create a redirect rule via API](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-api/).

## Redirect Applied

The director confirmed the newer `partners.` portal is the experience to retain. A Cloudflare zone Single Redirect ruleset `4b3fae7136444aa1a1f197cd4037c1d6` was created at `2026-08-30T08:36:31Z`. It has two enabled, narrowly scoped rules:

1. GET and HEAD requests for `concreteconceptsgroup.com/trade-partners*` or any `trade.concreteconceptsgroup.com` path receive a 308 redirect to `https://partners.concreteconceptsgroup.com/partners`.
2. Other methods receive a 302 redirect to the same portal so a legacy form body is not replayed to the new application route.

The ruleset is reversible by deleting `4b3fae7136444aa1a1f197cd4037c1d6`. No Worker, Pages deployment, DNS record or application source was changed. The legacy Worker remains intact behind the redirect rule.

Raw production acceptance passed: four legacy GET paths returned 308 with the exact portal destination; a labelled non-customer POST check returned 302; apex, www, both `/get-quote` routes and the retained portal remained HTTP 200. Browser navigation from both `https://concreteconceptsgroup.com/trade-partners` and `https://trade.concreteconceptsgroup.com/` resolved to `https://partners.concreteconceptsgroup.com/partners`, title `CCG Trade Partner Portal`, H1 `Build stronger networks. Share better opportunities.`

Post-change browser safeguards also passed. `https://concreteconceptsgroup.com/` retained the customer-site title `Concreter Brisbane | Concrete Concepts Group` and the normal concreting hero and quote entry. `https://concreteconceptsgroup.com/get-quote` retained title `Get a Free Concrete Quote | Brisbane & SEQ | Concrete Concepts` and hydrated to `Step 1 of 5` with the required name, Australian mobile and email fields. No production form was submitted and no customer data was entered.

## Final Readback and Monitoring

An independent Cloudflare entrypoint readback confirmed ruleset `4b3fae7136444aa1a1f197cd4037c1d6`, version 1, in phase `http_request_dynamic_redirect`. Exactly two rules are enabled. Their expressions cover only apex `/trade-partners*` and the `trade.` hostname; both target the retained portal, discard legacy query strings, and use the intended 308 GET/HEAD versus 302 other-method split. Apex `/`, `www`, `/get-quote` and paid landing routes are outside both expressions.

The focused redirect suite passed all five contracts, the deployed ruleset JSON parsed successfully, and `pnpm check` passed. A destination matrix returned HTTP 200 for homepage, `/get-quote` and `/lp/retaining-wall-brisbane` on apex, www, stable Pages and immutable deployment `c2c56e33`, plus the retained portal.

The final production sample ran at `2026-08-30T08:52:19Z`, more than 15 minutes after ruleset creation. Both legacy addresses still returned 308 to the exact portal URL. Apex and www homepages, apex and www quote routes, the retaining-wall paid landing page and the retained partner portal all returned HTTP 200. No production form was submitted, no customer data was entered and no Google Ads setting changed.

**Rollback:** delete only zone ruleset `4b3fae7136444aa1a1f197cd4037c1d6`. This immediately reveals the still-intact legacy Worker routes again without altering the customer Pages deployment, DNS, Worker code or Partner Portal.
