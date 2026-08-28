# Comprehensive Quote Form and Cloudflare Deployment Design

**Author:** Manus AI  
**Date:** 24 August 2026  
**Status:** Approved design awaiting written-spec confirmation

## Objective

Replace fragmented or incomplete quote capture with one reliable customer journey that collects enough information to assess and schedule a concreting job. Keep the homepage concise, transfer initial answers into a detailed `/get-quote` wizard, and prevent the Cloudflare-hosted production site from remaining on an old version.

The form must collect complete customer and job information without rejecting genuine customers who do not know exact measurements or cannot provide photos immediately.

## Approved Customer Experience

The homepage remains short and conversion-focused. Its primary action sends the customer to `/get-quote` with any completed answers prefilled. The detailed quote wizard contains five sections and shows one section at a time on mobile.

| Section | Required information | Optional information |
|---|---|---|
| Contact | Full name, Australian 04 mobile, valid email, preferred contact method | Company name |
| Job location | Suburb and postcode | Street address |
| Job requirements | Service type, new/replacement work, preferred finish or “not sure,” timeframe, useful project description | Demolition/removal, access width, slope, drainage, pump access, approvals, special requirements |
| Measurements and photos | Measurement choice: dimensions, total square metres, or “not sure—measure on site” | Length, width, separate areas, up to eight site photos |
| Review and consent | Review of all answers, contact consent, privacy acknowledgement | Marketing consent remains separate and unticked by default |

Photos are optional but strongly encouraged. The upload section explains which images are useful: a wide view of the complete area, access from the street, existing concrete or structures to remove, drainage or slope, and close-ups of obstacles.

Measurements accept length × width, total m², multiple areas, or “not sure.” Unknown measurements never block submission.

## Form Behaviour

The form autosaves non-sensitive draft answers in the customer’s browser. It does not persist selected photo bytes in browser storage; selected photos remain in memory during the active session. The customer can move backwards without losing answers and sees a complete review before submitting.

Validation occurs at three layers: the browser for immediate guidance, the server API as the authoritative boundary, and the Cloudflare worker as a production fallback boundary. Greater Brisbane and the agreed surrounding SEQ service area pass normally. Plausible Queensland boundary locations submit with a service-area review flag. Clear interstate and overseas entries are rejected with correction guidance.

The existing honeypot, minimum completion time and bounded repeat-submission controls remain. The homepage cannot create a lead containing placeholder email, suburb, service or description values.

## Data Model

The quote payload uses structured fields rather than burying all information in one description string.

| Group | Fields |
|---|---|
| Customer | name, email, mobile, preferred contact, company |
| Location | street address, suburb, postcode, service-area status |
| Scope | selected services, work type, finish, description, timeframe |
| Measurements | measurement status, length, width, total area, units, separate-area notes |
| Site conditions | existing concrete removal, access width, vehicle access, slope, drainage, pump access, known services, approval status |
| Media | photo URLs, original filenames, content types, upload status |
| Attribution | lead source, landing page, referrer, UTM values, Google click ID and Meta click ID |
| Compliance | contact consent, privacy acknowledgement, optional marketing consent, submission timestamp |

Existing database compatibility is preserved by generating a complete formatted description for current consumers while also passing the structured job brief to delivery channels. A later database migration may expose each structured field as a separately queryable column without changing the customer form.

## Photo Handling

Each file is validated for supported image type and size before upload. Up to eight photos are accepted. Upload progress and per-file retry controls are shown. Successfully uploaded URLs are retained if another file fails.

If photos fail, the customer is told exactly which files failed and may retry or deliberately continue without them. The form never reports a photo as attached unless storage confirms the upload. Stored images use non-enumerable object keys. Email and backup destinations receive secure image links rather than embedded image bytes.

## Delivery Flow

After review, the customer submits one complete payload. The system validates the payload, confirms photo references, records the lead, and distributes the same normalized job brief to the owner notification email and available backup channels. A success screen appears only after at least one authoritative lead-recording channel confirms receipt.

| Outcome | Customer response | Internal handling |
|---|---|---|
| Complete success | Confirmation and expected response time | Record delivery channel outcomes and quote ID |
| Primary API unavailable, Cloudflare fallback succeeds | Normal confirmation | Mark fallback delivery source |
| Photo upload partly fails | Retry failed files or continue without them | Keep successful uploads and draft answers |
| All lead-recording channels fail | No false success; retain draft and offer retry/call | Log failure without firing a Google Ads conversion |
| Boundary service area | Confirmation that availability will be checked | Flag prominently in email and lead record |

## Owner Notification

The owner email is organized into Contact, Address, Job Scope, Measurements, Site Conditions, Photos, Timing and Attribution sections. Missing optional information is labelled “Not provided”; required fields cannot be missing. Phone, email, photo links and map search are clickable. The subject includes the service, suburb and customer name rather than “Not specified.”

Google Ads conversion tracking fires only after confirmed submission. Starting the form, progressing between sections, selecting files or opening a mail application never counts as a completed quote.

## Cloudflare and GitHub Deployment

The production website repository is `smq9sn5jck-coder/concrete-concepts-website`, not the internal operations repository. Cloudflare Pages should use that repository’s `main` branch as the production source, run `pnpm install --frozen-lockfile && pnpm build`, and publish `dist/public`.

| Approach | Trade-offs | Cost | Setup complexity |
|---|---|---:|---:|
| **Selected: GitHub-connected Cloudflare deployment** | Prevents manual version drift and preserves deployment history; requires one-time repository authorization and production secret configuration | Existing Cloudflare/GitHub plans | Medium one-time setup |
| Manual Cloudflare upload | Simple conceptually, but easy to forget and caused the current stale production version | Existing plans | Low each release, high ongoing risk |
| Manus origin with Cloudflare only as CDN/domain layer | Simple publication from the project UI, but changes the current hosting architecture and may require DNS/cache adjustments | Existing plans | Medium migration |

The release workflow runs tests, TypeScript checks and a production build before deployment. A failed check prevents production release. Required runtime secrets remain in Cloudflare; they are never committed to GitHub. The exact Cloudflare project cannot be changed until the connected account/project is confirmed. The currently exposed Cloudflare credential is not accepted by the account API, so the implementation will prepare the repository workflow and then use either Cloudflare’s GitHub connection screen or a corrected scoped deployment token for the one-time connection.

## Components

The implementation separates the feature into small units: a shared typed quote schema, reusable validation, browser draft storage, a photo uploader, five wizard sections, a review summary, a normalized delivery formatter, and Cloudflare/server adapters. This avoids adding more unrelated responsibility to the existing large `GetQuote.tsx` file.

The homepage form becomes a short intake step that validates and navigates to `/get-quote` with a temporary draft key. The detailed form owns final submission. Existing landing pages and blog/referral entry points link to the same wizard with source and service prefilled where appropriate.

## Testing and Acceptance Criteria

Vitest coverage must prove that a complete local lead succeeds; unknown measurements and zero photos succeed; invalid email, non-mobile phone, missing suburb/postcode and insufficient descriptions fail; Queensland boundary locations are accepted and flagged; uploads reject unsupported or excessive files; incomplete legacy hero payloads fail; and every delivery formatter includes the structured fields.

The production build, TypeScript check and Cloudflare worker syntax must pass. Desktop and iPhone previews must show no clipped controls, hidden required fields or unreachable submit buttons. A non-production end-to-end submission must produce a complete notification containing contact details, location, job description, measurements choice and photo status. The live domain version must match the released Git commit after deployment.

## Scope Boundary

This phase collects customer-provided measurements and requirements; it does not calculate an engineering design, final concrete quantity or binding price. Automated material calculations and estimator workflows can consume the structured data in a later phase after the lead-capture reliability is confirmed.
