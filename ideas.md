# Design Brainstorm — Concrete Concepts Group (Lifeboat Static Site)

<response>
<text>
## Idea A — "Foreman's Blueprint" (CHOSEN)

**Design Movement:** Editorial industrial. Equal parts trade-magazine layout (think *Monocle* meets a quality builder's brochure) and the tactile honesty of raw concrete and steel.

**Core Principles**
1. **Honest materials** — the site looks like the work: rough, weighty, confident. Real photos, not stock. Visible texture in surfaces.
2. **Editorial pacing** — content reads top-to-bottom like a feature article, not a sales funnel of stacked cards. Generous whitespace, hard-edged section breaks, oversized numerals.
3. **Trust over hype** — QBCC licence, owner name (Jarrad), 4.9★ rating, named reviewers, and Brisbane suburbs are surfaced *constantly*, not hidden in a footer.
4. **Mobile-first lead capture** — a tradie's customer is on a phone; the call button and quote form are reachable from any scroll position.

**Color Philosophy**
- **Midnight Construction Navy** `#0F2A44` — primary background. Authoritative, not corporate.
- **Premium Gold** `#C9A44D` — accent, CTAs, the "expensive metal" feel of a finished exposed-aggregate driveway under afternoon light.
- **Concrete Bone** `#F2EFE9` — warm off-white, like cured concrete, for content sections that need to breathe.
- **Charcoal** `#1A1A1A` — body text on light, photo overlay darkening.
- Zero "trade purple", zero generic blue gradients.

**Layout Paradigm**
- 12-column desktop, but content sits in **asymmetric two-column splits**: oversized image left, dense type right (or reversed). No center-stack landing-page cliché.
- Section headers use a **slab numeral** ("01 / SERVICES") in gold against navy, like construction plans.
- Sticky bottom bar on mobile with **Call** + **Get Quote** — never more than a thumb's reach away.

**Signature Elements**
1. **Diagonal "form-board" dividers** between sections — a 4° slant in gold, mimicking the timber form-boards used to shape a slab.
2. **Imprinted-numeral statistics** — "150+ slabs poured / 4.9★ / QBCC #15299707" displayed in oversized condensed type, like stencilling on a tipper truck.
3. **Photo treatment** — full-bleed hero with a navy-to-transparent gradient overlay; gallery uses an irregular brick-pattern grid (some 2-up, some single, never all the same size).

**Interaction Philosophy**
- Confident, not flashy. The site shouldn't fidget.
- Buttons press inward (`scale(0.97)`, 140ms). Hover lifts cards 2px with a soft gold-tinted shadow.
- Form validation is plain English ("we need a phone so we can call you back") not red error icons.

**Animation Guidelines**
- Entrance: section content fades + rises 12px on first scroll-into-view, ease-out 320ms, staggered 60ms across siblings.
- Hero text: a 600ms left-to-right reveal with the gold underline drawing in afterwards.
- No parallax. No auto-rotating testimonial carousels (manual swipe only). Reduced-motion respected for everything.

**Typography System**
- **Display:** *Fraunces* (serif, optical-size enabled). For hero headline, section numerals, and reviewer names — gives the editorial gravity. Weight 600–900 only.
- **Body:** *Inter* 400/500 for paragraphs and UI. Tight tracking on small caps labels.
- **Mono accent:** *JetBrains Mono* for the QBCC licence number and phone number — gives them a "stamped/certified" feel.
- Hierarchy: H1 56–80px, H2 36–48px, body 17px (slightly larger than default — tradies read on phones in sunlight).

</text>
<probability>0.06</probability>
</response>

<response>
<text>
## Idea B — "Worksite Polaroid"

**Design Movement:** Documentary photography meets neo-brutalist web. Heavy reliance on bordered images that feel like film prints stuck to a site office wall. Hand-stamped typography accents.

**Color Philosophy:** Bone, navy, dust orange, and graphite. Less gold, more "honest dirt."

**Layout:** Scrapbook-grid hero with images rotated by 1–2°. Service blocks shown as taped-down polaroids with handwritten captions.

**Risk:** Could read as gimmicky, and risks the "AI-art-direction" trap. Rejected for a working trade business that needs to convert seriously.

</text>
<probability>0.03</probability>
</response>

<response>
<text>
## Idea C — "Architect's Specification Sheet"

**Design Movement:** Pure Swiss / International Typographic Style. Helvetica Now, monochrome grid, surgical use of one accent (gold).

**Color Philosophy:** White, black, single gold accent. No imagery dominant — typography-led.

**Layout:** Rigid 12-column grid, all content left-aligned, captions and dimensions everywhere like blueprint margins.

**Risk:** Beautiful but reads "architect", not "concreter who turns up on time with a pump truck." Wrong tone for the customer (homeowners + builders, not design firms). Rejected.

</text>
<probability>0.02</probability>
</response>

---

## Decision

**Going with Idea A — "Foreman's Blueprint."** It carries the brand's gold + navy system, looks expensive without looking precious, surfaces trust signals (QBCC, Jarrad, 4.9★) at the top of every section, and keeps the lead-capture path (Call + Get Quote) one thumb-tap away on mobile at all times. Every component built will be measured against the principles above.
