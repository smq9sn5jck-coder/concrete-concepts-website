# Concrete Concepts Referral and CGS Rollout

## Release scope

This release adds three deliberately separate lead journeys to the Concrete Concepts website.

| Journey           | Route                          | Server endpoint         | Analytics event                | Google Ads conversion                                            |
| ----------------- | ------------------------------ | ----------------------- | ------------------------------ | ---------------------------------------------------------------- |
| Customer quote    | `/`                            | `/api/send-quote`       | `customer_quote_submitted`     | Primary **Quote Form Submission** only after successful delivery |
| $100 referral     | `/trade-referral-program`      | `/api/send-referral`    | `trade_referral_submitted`     | None                                                             |
| CGS growth review | `/construction-growth-systems` | `/api/send-cgs-enquiry` | `cgs_growth_enquiry_submitted` | None                                                             |

The active high-intent Search and Performance Max campaigns use the campaign-level custom goal **CCG Quote Form Only**. The referral and CGS forms do not call any Google Ads conversion action and therefore cannot enter that bidding signal.

## Cloudflare Pages configuration

| Setting                | Verified value                                                   |
| ---------------------- | ---------------------------------------------------------------- |
| Pages project          | `concrete-concepts-group`                                        |
| Deployment mode        | Ad hoc/direct upload; GitHub pushes do not publish automatically |
| Local build command    | `pnpm build`                                                     |
| Build output directory | `dist/public`                                                    |
| Functions directory    | Repository-root `functions/` directory                           |
| Production secret      | `RESEND_API_KEY` is configured in the Pages project              |
| Production domains     | `concreteconceptsgroup.com` and `www.concreteconceptsgroup.com`  |

Build and verify the project locally, then publish the generated assets and Pages Functions as one direct-upload deployment to the existing `concrete-concepts-group` project. The production Resend account must have `concreteconceptsgroup.com` verified because all notifications use `noreply@concreteconceptsgroup.com` as the sender. Quote, referral, and CGS notifications are delivered to `info@concreteconceptsgroup.com`. User-supplied email addresses are used only as the reply-to address.

The built assets include `_redirects` with an SPA fallback so both new routes load directly. Pages Functions take precedence for matching `/api/` requests. The build also includes baseline HSTS, framing, MIME-sniffing, referrer, permissions, and immutable-asset cache headers.

## Pre-release evidence

| Check                                   | Result                                               |
| --------------------------------------- | ---------------------------------------------------- |
| Automated unit and API contract tests   | 62 passing                                           |
| TypeScript compilation                  | Passing                                              |
| Production bundle                       | Passing                                              |
| Google Ads live conversion-action query | Primary quote and click-to-call labels verified      |
| Campaign conversion-goal query          | Search and Performance Max use `CCG Quote Form Only` |
| Desktop visual review                   | Passing                                              |
| 390 px mobile visual review             | Passing                                              |
| Direct route and hash-link review       | Passing after tested post-render fix                 |
| Empty and conditional form validation   | Passing                                              |
| Browser console                         | No application errors observed                       |

## Post-deployment smoke test

After deployment, open each route directly in a private browser window. Confirm the route returns the application rather than a 404 and that the title changes correctly. On the referral page, select Builder and confirm that Business name appears. Attempt an empty referral and confirm all required errors appear without a page reload. Repeat the empty-state check on the CGS form.

Submit one clearly marked internal test through each form using authorised contact details. Confirm that the browser shows success only after the endpoint returns success and that each email arrives at `info@concreteconceptsgroup.com` with the correct subject and lead type. The referral email and success state must display the same `CCG-XXXXXX` public reference. No public form should request banking details.

Use browser developer tools to confirm the following `dataLayer` events appear only after successful delivery: `customer_quote_submitted`, `trade_referral_submitted`, and `cgs_growth_enquiry_submitted`. Confirm that the quote success also sends `AW-18007005419/oPHGCJSGt44cEOuxtIpD`, while referral and CGS success send no Google Ads conversion request.

## Monitoring and recovery

Monitor Cloudflare Pages Function errors and Resend delivery activity immediately after release. A failure from Resend returns a non-success response, preserves the visitor’s form data, and presents a direct contact alternative rather than displaying a false success state.

If errors appear, roll back to the previous successful Cloudflare Pages deployment or revert the release commit, rebuild, and publish a new direct-upload deployment. The referral and CGS routes are additive; reverting the release restores the original quote-only site without a data migration.

## Security posture

The endpoints apply origin allowlisting, JSON content-type enforcement, a 32 KB request limit, strict field validation and length limits, Australian phone normalisation, output-context HTML escaping, honeypot filtering, private server-side API credentials, and idempotent Resend keys. Personally identifying lead information is sent by HTTPS POST and is not placed in URLs or browser analytics payloads.

A distributed rate limit is not included because this static Pages project has no configured KV, Durable Object, or rate-limit binding. Cloudflare WAF/rate-limiting rules should be used if abusive traffic is observed. This does not block launch because the endpoints already reject off-origin requests, oversized payloads, malformed data, and honeypot submissions.
