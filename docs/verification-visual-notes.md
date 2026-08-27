# Visual Verification Notes

## Production Preview Pass 1

### Referral page

The `/trade-referral-program` route renders with the expected title, a strong navy-and-gold hierarchy, a prominent but credible $100 reward, clear three-step explanation, suitable-job list, complete form content, terms, privacy text, and restrained footer links. The hero and first content transition are visually balanced at the 891 × 768 browser viewport. The referral form fields and consent control are present in the accessibility tree. The local preview cannot resolve the production `/manus-storage/` logo asset because the production storage proxy is unavailable in the local server; this is a preview-environment limitation rather than a broken production asset.

### CGS page

The `/construction-growth-systems` route renders with a clearly distinct charcoal-and-gold identity, clear broad growth-system positioning, visible primary and secondary calls-to-action, four connected system components, Concrete Concepts proof context, qualification content, and the complete growth-review form. The hero is visually strong and the system diagram remains legible at the 891 × 768 browser viewport. The CGS route metadata is correct.

### Next verification actions

The next pass will inspect referral and CGS forms at their on-page positions, validate error focusing and conditional fields, verify mobile layouts, check browser console output, and verify route/navigation behaviour.

## Production Preview Pass 2

The CGS browser console is clear. The growth-review section renders as a balanced two-column layout with readable labels, consistent input sizing, a prominent single submission action, and appropriate contrast. Optional and required fields are visually distinguishable. The fixed header does not obscure the section when reached through the page anchor. No runtime or analytics errors were observed in the console.

## Production Preview Pass 3

Submitting the empty CGS growth-review form produces clear field-level errors for name, business name, email, phone, business type, and the main growth problem. The first invalid field receives the visible focus treatment, no server request is required for these errors, and optional website and notes fields remain unflagged. The referral route continues to load directly with the correct page title and complete accessible form structure. The next pass will move to the form location, test the conditional builder field and empty referral errors, then inspect narrow mobile viewports.

## Production Preview Pass 4

The referral hero call-to-action scrolls to the correct form location with the fixed navigation remaining clear of the section heading. The wide-screen form layout is compact and readable beside the suitable-project list. Selecting **Builder** adds the required business-name field immediately and reflows the contact fields without overlap or layout shift problems. The private-individual state correctly omits that field.

## Production Preview Pass 5

Submitting an empty Builder referral highlights all required fields, including the conditional business name, both phone fields, suburb, project type, and the customer-consent control. The form remains in place and the browser console remains clear. The responsive desktop form continues to hold alignment after error styling is applied.

## Production Preview Pass 6 — Mobile

At 390 × 844, the referral page stacks cleanly with a compact hamburger header, readable hero copy, a full-width primary action, and the $100 reward panel beginning naturally below the fold. No horizontal overflow or clipped text is present. The local-only missing Concrete Concepts logo remains attributable to unavailable `/manus-storage/` proxying in the production-style local server.

At the same phone viewport, the CGS header reduces correctly to the CGS mark and Growth Review action. The hero headline, badge, supporting copy, primary and secondary calls-to-action, and connected-system card all fit without horizontal overflow. CTA text remains legible, touch targets are substantial, and the charcoal-and-gold identity remains clearly distinct from Concrete Concepts.

## Production Preview Pass 7 — Direct Mobile Anchors

Direct initial loads of `/trade-referral-program#refer-a-job` and `/construction-growth-systems#growth-review` render the page correctly but remain at the top because the browser processes the hash before the React route content exists. This is a single-page application timing defect rather than a layout defect. A post-render hash-scroll helper will be added and regression-tested so externally shared form links open at the intended section.

## Direct-Anchor Root Cause

A fresh load of `/trade-referral-program?anchor-test=1#refer-a-job` consistently finishes with `document.readyState = complete`, `window.scrollY = 0`, and a valid `#refer-a-job` element positioned approximately 1,328 pixels below the viewport. This confirms that the route and element identifier are correct; the browser’s native hash scroll occurs before React has rendered the target. The fix must perform one post-render hash scroll from the application layer.

## Production Preview Pass 8 — Direct-Anchor Fix Verified

After the post-render application fix, fresh loads of `/trade-referral-program?anchor-test=2#refer-a-job` and `/construction-growth-systems?anchor-test=2#growth-review` open at the intended form sections. The referral target sits below the fixed navigation with the form heading visible, and the CGS target displays the full two-column growth-review section. The automated hash-scroll regression suite also passes.

## Final Release Verification

The final pipeline passes with **62 automated tests across nine suites**, a clean TypeScript check, a successful production build, verified Cloudflare `_redirects` and `_headers` output, no production occurrences of the obsolete Google Ads placeholder labels, and no whitespace errors.

The live Google Ads account confirms that the primary website quote action is `AW-18007005419/oPHGCJSGt44cEOuxtIpD` and the click-to-call action is `AW-18007005419/KuCJCPSeyo4cEOuxtIpD`. The active high-intent Search and Performance Max campaigns both use the custom goal **CCG Quote Form Only**, containing only the primary quote action. The referral and CGS forms emit isolated analytics events and no Google Ads conversions.
