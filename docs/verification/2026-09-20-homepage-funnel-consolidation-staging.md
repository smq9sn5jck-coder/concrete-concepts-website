# Homepage Funnel Consolidation — Staging Candidate

**Date:** 20 September 2026
**Author:** Manus AI
**Status:** Director-approved production candidate; deployment pending

## Executive conclusion

Release 1 is ready for director review on the managed preview.[1] It makes the existing five-step detailed quote the homepage’s only primary quote path, retains the separate callback option, replaces the failing map and unsupported activity widgets with static factual content, and removes unaudited rating, timing, insurance, scarcity and absolute-quality statements.

The work does **not** change the five-step quote payload, Australian mobile validation, Brisbane and South East Queensland qualification, Gmail or Jotform delivery, D1 backup, private R2 photo storage, quote-success sharing, primary Google Ads conversion branches, campaign budgets, bidding, keywords or targeting. No production deployment, customer lead, email or Google Ads conversion was created.

## Implemented staging scope

The homepage now presents one clear decision: start the detailed quote, request a callback, or call CCG. The old lower-page direct quote form is no longer rendered, which prevents a competing path from being treated as a completed detailed quote.

The service-area map was replaced with a static linked grid covering Brisbane, Logan, Ipswich and West, Moreton Bay, Gold Coast, and Bayside and Redlands. This removes the homepage’s dependency on the failing Google Maps proxy while keeping direct access to existing locality pages.

Dynamic quote counts, rotating activity notifications, review widgets and seasonal scarcity were removed from the homepage. The trust strip, About, process, service, project, FAQ, before-and-after and footer copy was rewritten to describe verified business facts and project-specific assessment rather than fixed promises.

The quote-page shell now shows **QBCC licence 15299707**, **Five guided steps** and **Optional site photos**. The old 4.9-rating and 24-hour-response badges were removed without changing the wizard itself.

All non-customer preview and immutable hosts are now noindex in both the shared client metadata component and the Cloudflare edge Worker. The customer apex and www hosts remain the only hosts eligible for normal indexable metadata after a future production release.

Following director review, the service-area directory was also corrected so each link displays only the locality name rather than repeating “Concreter” before every suburb. Natural phrases such as “concreter in [suburb]” remain on individual locality pages. The same pass removed a duplicate Home breadcrumb and replaced unsupported all-area and insurance statements with address-specific coverage confirmation language.

## Verification results

| Check | Result |
|---|---|
| Release 1 and high-risk quote/SEO/delivery/photo tests | **10 files, 86 tests passed** |
| Full deterministic regression suite | **53 files, 607 tests passed** |
| TypeScript check | **Passed** |
| Production build | **Passed** |
| Source quote-release contract | **Passed** |
| Built quote-release contract | **Passed** |
| Cloudflare Worker syntax | **Passed** |
| Diff hygiene | **Passed** |
| Desktop and mobile visual review | **Passed** |
| Homepage-to-five-step handoff | **Passed without submission** |
| Preview robots policy | **noindex, nofollow** |
| Lead endpoint requests during handoff | **None** |

The browser test used fictional draft values only. It carried `driveway`, Brisbane 4000 and a preview-only job description into the existing quote draft. Name, mobile and email remained blank. The live form stayed at Contact, Step 1 of 5, and no quote, callback, Jotform or conversion request was sent.

## Production and rollback state

The customer website remains on the previously accepted Cloudflare deployment. Release 1 has not been uploaded to Cloudflare and Google Ads was not modified.

The pre-Release 1 source baseline is commit `05588c346f335edae994e2c125378f7ff9ad2ddd`. After the staging commit is created, reverting that single commit will remove the Release 1 source changes. A future Cloudflare production release will require a fresh production baseline, explicit director approval, guarded direct upload, customer-route checks and at least 15 minutes of monitoring.

## Review focus

The director approved all three staged suggestions after reviewing the managed preview. Release 1 may proceed through its guarded Cloudflare deployment and monitoring gate. Batch 1 locality work starts only after that production gate completes successfully.

## References

[1]: https://3000-iruxhrayrsa3gdj4ht5dv-5ac7b973.sg2.manus.computer/ "CCG Release 1 managed staging preview"
[2]: https://concreteconceptsgroup.com/ "Current CCG customer website"
