# Hero Form Regression Verification — 23 August 2026

The production domain was confirmed to be serving version `8d7e977e`, not the newer validated checkpoint. Its HTML still contains `send_page_view: true`, and its entry bundle does not contain the new `Suburb or Postcode` field. This explains why the reported Google Ads lead used the legacy name-and-phone hero form and why its notification showed no email, suburb, or meaningful job information.

The corrected preview now shows six qualified lead fields: name, Australian mobile, email, suburb or postcode, concrete service, and a project description. Desktop preview at 1280×900 keeps the complete form readable above the fold. The iPhone preview at 390×844 renders without horizontal overflow; the form follows the hero content naturally and remains reachable by normal scrolling.

Regression tests now prove that a hero submission using `0794 483 241` is rejected as not being an Australian mobile, a placeholder email is rejected, and a complete mobile/email/location/service/details payload is accepted. The same requirements are enforced in the tRPC API, static fallback helper, and Cloudflare worker.

Focused verification passed with 17 tests across the quote and fallback suites. TypeScript, production build, and worker syntax checks passed. The full project suite passed 488 of 490 tests; the only two failures remain the pre-existing external Resend delivery checks associated with the unverified branded domain.
