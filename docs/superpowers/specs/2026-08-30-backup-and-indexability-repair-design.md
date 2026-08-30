# Backup Reliability and Public Indexability Repair Design

**Author:** Manus AI
**Date:** 30 August 2026
**Status:** Approved design; implementation pending

## Objective

Deliver two isolated production repairs in strict order. First, replace the unreliable outbound Manus backup call with a Cloudflare D1 record write whose success is verifiable. Second, remove unintended `noindex` directives from exactly 12 public sitemap routes. Neither release may weaken the five-step quote flow, Gmail/Resend or Jotform delivery, AU phone and service-area validation, anti-spam controls, paid-page `noindex` rules, or Google Ads conversion classification.

## Options Considered

| Approach | Trade-offs | Decision |
|---|---|---|
| Store backup records directly in Cloudflare D1 | Removes an unreliable cross-host request; requires one D1 database and Pages binding | **Selected** |
| Repair the separate Manus/MySQL endpoint | Preserves the old architecture but retains an additional network and hosting dependency that currently returns HTML instead of API JSON | Rejected |
| Remove the database backup and rely only on Jotform | Simplest, but does not provide the requested independent database safety net | Rejected |

## Release 1: Verified Cloudflare Database Backup

The existing Pages Worker will write quote, callback and guide backup records directly to a D1 binding named `LEAD_BACKUP_DB`. The table will store a generated record ID, lead type, submission timestamp, normalized contact and job fields, lead source, photo metadata and the complete structured job brief where available. The schema will avoid storing file bytes.

The backup helper will return a structured result only after D1 confirms one inserted row. A response, exception or result without a valid generated record ID and successful change count will be treated as failure. The submission handlers will continue attempting Gmail/Resend, Jotform and the database in parallel. A database failure will not block a quote when Gmail or Jotform confirms delivery, but it will no longer create a false success when both real delivery channels fail.

The existing primary-conversion rule remains unchanged: the confirmed quote conversion may fire only after the overall submission endpoint returns success. Callback, guide, visualiser, phone, SMS and WhatsApp actions remain secondary.

### D1 Record Contract

| Field | Purpose |
|---|---|
| `id` | Worker-generated unique record ID returned as proof of insertion |
| `lead_type` | `quote`, `callback` or `guide` |
| `created_at` | UTC submission timestamp |
| `name`, `phone`, `email` | Normalized contact data already collected by the relevant flow |
| `service`, `suburb`, `details` | Searchable job or request summary |
| `lead_source` | Existing attribution label |
| `photo_urls_json` | JSON metadata only; no file bytes |
| `job_brief_json` | Complete structured quote brief where present |

Tests will first reproduce the existing false-positive behavior. They will then require rejection of HTML `200`, malformed JSON, missing record IDs, unsuccessful D1 results and zero-change writes, while accepting a confirmed single-row insert. Existing email and Jotform success paths will remain green.

## Release 2: Twelve-Page Indexability Parity

The edge SEO manifest will receive explicit, truthful metadata for the 12 intended public routes currently falling through to generic `noindex`: `/calculator`, `/faq`, `/finishes`, `/gallery/before-after`, `/projects`, `/referral`, `/reviews`, `/services/concrete-patios-brisbane`, `/services/crossover-permits-brisbane`, `/services/excavation-brisbane`, `/services/pool-surrounds-brisbane` and `/services/shed-slabs-brisbane`.

Each route will receive a unique title, description, self-canonical and `index, follow`. A parity test will derive URLs from the public sitemap and assert that every intended public route is indexable at the edge. Separate tests will continue requiring `/lp/*`, `/admin`, `/privacy`, `/terms`, `/my-quote` and other intentionally non-commercial or protected scopes to retain their existing treatment. Paid landing pages must continue returning both meta `noindex, follow` and the `X-Robots-Tag` safeguard.

## Release and Rollback

Release 1 will be tested and deployed before Release 2 begins. The D1 schema and binding will be verified with a non-customer synthetic record that can be deleted after confirmation; no unlabelled lead will be created. Rollback is the immediately preceding Cloudflare Pages deployment, while retaining the D1 database for auditability.

Release 2 will use a separate deployment. Production acceptance will verify all 12 routes return HTTP 200, unique route metadata, self-canonicals and `index, follow`; paid `/lp/` routes must remain `noindex, follow`. Rollback is the verified Release 1 deployment.

After both releases, apex and `www` homepage, `/get-quote`, the retaining-wall paid landing page, sitemap, robots, Gmail/Jotform delivery configuration, Partner Portal routing and Google Ads destinations will be rechecked. No Ads campaign, budget, bidding, geography or conversion-goal setting will change.
