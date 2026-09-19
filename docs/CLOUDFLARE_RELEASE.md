# Cloudflare production release

The production source of truth is the `main` branch of:

`smq9sn5jck-coder/concrete-concepts-website`

Every push to `main` runs deterministic tests, TypeScript validation, the production build, and a Cloudflare Worker syntax check before deployment. A failed verification prevents deployment.

## Required GitHub settings

| Type | Name | Purpose |
|---|---|---|
| Actions secret | `CLOUDFLARE_API_TOKEN` | Cloudflare token with Pages edit permission for the production account |
| Repository variable | `CLOUDFLARE_ACCOUNT_ID` | Account containing the production Pages project |
| Repository variable | `CLOUDFLARE_PAGES_PROJECT` | Existing Pages project serving the production domain |

The workflow deliberately fails rather than claiming a deployment if any setting is absent. Existing Pages environment variables, bindings, custom domains, and secrets remain configured on the Cloudflare project and are not committed to GitHub.

## Protected pricing service requirements

The CCG estimator is exposed to Zapier only through `POST /api/v1/pricing/estimate`. The route is server-to-server, does not use permissive CORS, and fails closed when any required binding is absent.

| Cloudflare setting | Type | Purpose |
|---|---|---|
| `PRICING_API_TOKEN_CURRENT` | Encrypted Pages secret | Dedicated Bearer token for the active Zapier pricing connection |
| `PRICING_API_TOKEN_PREVIOUS` | Encrypted Pages secret, temporary | Short rotation overlap; remove after the Zapier connection is verified |
| `PRICING_API_DB` | D1 binding | Durable idempotency, rate limiting, and append-only calculation audit |

Apply `cloudflare/d1/0002_pricing_api.sql` to the bound D1 database before enabling the endpoint. Never place either token in a `VITE_*` variable, repository file, browser bundle, log entry, or screenshot.

Zapier must send the immutable source submission ID as `Idempotency-Key`. A transport, authentication, validation, D1, or pricing failure stops the Zap and creates an owner-review alert. It must not fall back to an LLM calculation or a public website rate.

The initial rollout is draft-only. Do not add a customer-send action until three varied test leads pass owner review without correction.

## First synchronization

The current GitHub repository and Manus project have unrelated histories. Before replacing GitHub `main`:

1. Preserve the old GitHub source in a dated backup branch.
2. Save a verified Manus checkpoint.
3. Push the verified checkpoint to GitHub `main` with `--force-with-lease`.
4. Watch the **Verify and deploy to Cloudflare Pages** workflow.
5. Confirm the live version, `/get-quote`, `/api/upload-photo`, and one controlled test enquiry.

Do not force-push before the backup branch and checkpoint both exist.
