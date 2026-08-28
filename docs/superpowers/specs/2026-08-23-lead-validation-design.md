# Fail-Safe Lead Validation Design

**Approved direction:** Greater Brisbane and surrounding South East Queensland service area, with plausible Queensland boundary enquiries accepted for manual review rather than rejected.

## Objective

Reduce overseas, automated, and clearly invalid quote submissions without losing genuine clients in Brisbane, Logan, Redlands, Ipswich, Moreton Bay, Caboolture, or nearby Queensland boundary areas.

## Validation architecture

A shared validation module will be used by the homepage callback forms, detailed `/get-quote` wizard, advertising landing pages, and server/worker submission handlers. Client validation provides immediate guidance; server and worker validation remain authoritative so requests cannot bypass the browser checks.

## Phone rules

Australian mobile numbers beginning with `04` or `+614` will pass. Australian geographic landlines beginning with `02`, `03`, `07`, or `08`, including `+61` format, will also pass because legitimate customers may enter a home or office number. Spaces, brackets, and hyphens will be normalized. Clearly overseas numbers, alphabetic values, repeated digits, and implausible lengths will be rejected with a correction message.

## Location rules

Known Greater Brisbane and surrounding SEQ suburbs or approved postcodes will receive an `in_area` classification. Recognizable Queensland postcodes outside or near the service boundary will receive `service_area_review` and will still submit. Missing, malformed, interstate, or overseas locations will be rejected only on forms where a suburb or postcode is required. Short callback forms will gain a required suburb/postcode field so location quality can be assessed before conversion tracking fires.

## Spam safeguards

Every public form will include an invisible honeypot field and a form-start timestamp. A human-readable error will be returned for requests completed implausibly quickly. The server will apply a bounded repeat-submission limit using normalized phone, email, and request address information. Legitimate retries after delivery failures will remain possible, while rapid duplicate submissions will be rejected before notifications and conversion events.

## Data flow

The browser validates and classifies the enquiry, then submits the normalized phone and location classification. The server recalculates validation independently, ignores any client-supplied trust decision, stores the classification, and includes `service_area_review` in owner notifications. Google Ads conversion tracking fires only after the primary endpoint or a confirmed fallback reports successful delivery.

## Customer experience

Local customers receive no additional friction beyond entering a suburb or postcode. Boundary-area customers see a short notice that the location will be reviewed, but can continue. Invalid phone numbers receive an example of an accepted Australian format. Generic “outside service area” hard blocks are avoided for plausible Queensland enquiries.

## Failure handling

No success screen or Google Ads conversion fires unless at least one authoritative delivery path confirms success. If the primary endpoint fails, the fallback must return an explicit successful response. Duplicate or bot-like requests receive a neutral error without revealing the honeypot or rate-limit mechanism.

## Verification

Vitest will cover valid mobile and landline formats, overseas and malformed numbers, local and boundary-area classifications, interstate rejection, honeypot detection, timing checks, and duplicate protection. The homepage, `/get-quote`, and a representative advertising landing page will be verified in desktop and mobile previews. Existing quote-submission tests and the production build must remain green.
