/**
 * Cloudflare Pages Worker for Concrete Concepts Group
 * AI Concrete Visualiser V3 — Mask-First Architecture
 * 
 * Flow:
 * 1. Customer uploads photo + draws mask (binary: white=work area, black=preserve)
 * 2. Claude QA checks the mask + image → returns structured job brief JSON
 * 3. If READY → FLUX Fill inpaints ONLY the masked area with the selected finish
 * 4. Quality check pass validates output
 * 5. Result stored on S3
 */

// ═══════════════════════════════════════════════════════════════
// FINISH TYPES — expanded set with precise prompts
// ═══════════════════════════════════════════════════════════════
const FINISH_TYPES = {
  "exposed-aggregate": {
    name: "Exposed Aggregate",
    prompt: "professional photograph of freshly completed exposed aggregate concrete surface, smooth poured concrete with small decorative stones 5-10mm fully embedded and locked into wet cement matrix, polished wet-look polyurethane sealer finish with uniform glossy sheen, stones flush with surface not protruding, visible cream-coloured cement paste between all stones forming continuous integrated surface, uniform stone distribution across entire area, natural warm aggregate blend in cream and grey tones, sharp straight formed edges with clean 90-degree termination, professional residential concrete installation recently sealed with wet appearance, high quality finished work",
    negative: "loose rocks, scattered gravel, loose stones, river rocks on ground, rocks sitting on surface, protruding stones, uneven surface, rough texture, rock garden, landscaping stones, crushed rock, decomposed granite, loose fill, matte finish, dry concrete, unsealed concrete, powdery surface, curved edges, wavy edges, irregular borders, soft edges, blurred boundaries, unrealistic perspective, distorted geometry, warped lines, floating objects"
  },
  "broom-finish": {
    name: "Broom Finish",
    prompt: "professional photograph of freshly completed broom finish concrete surface, smooth poured concrete with fine parallel brush lines creating subtle anti-slip grip texture, uniform light grey colour throughout, clean professional broom strokes running in one consistent direction, smooth formed edges with sharp straight termination, natural concrete colour with very subtle variation, realistic fine shadows in the brush grooves, recently sealed residential driveway finish, sharp straight formed edges along all boundaries",
    negative: "rough uneven surface, deep grooves, dirty, stained, cracked, loose material, scattered debris, curved edges, wavy edges, irregular borders, soft edges, plastic look, cartoon, CGI, unrealistic perspective, distorted geometry"
  },
  "plain": {
    name: "Plain Concrete",
    prompt: "professional photograph of freshly completed plain concrete surface with clean steel-trowel finish, smooth poured concrete with uniform light grey colour, minimal surface texture with very subtle natural variation, professional flat finish, clean straight formed edges with sharp 90-degree termination at all boundaries, neat control joints, recently completed residential quality smooth concrete, slight natural sheen from fresh cure",
    negative: "rough texture, cracks, stains, discolouration, uneven surface, loose material, curved edges, wavy edges, irregular borders, soft edges, plastic look, cartoon, CGI, unrealistic perspective, distorted geometry"
  },
  "charcoal-oxide": {
    name: "Charcoal Oxide",
    prompt: "professional photograph of freshly completed charcoal oxide concrete surface, smooth poured concrete with deep dark grey-black integral oxide colour throughout, rich dark charcoal tone with subtle depth variation, smooth professional steel-trowel finish, clean straight formed edges with sharp 90-degree termination, modern dramatic look, premium residential oxide concrete, slight natural colour variation for realism, recently sealed with subtle sheen",
    negative: "flat black paint, unrealistic solid colour, loose material, faded, patchy colour, curved edges, wavy edges, irregular borders, soft edges, plastic look, cartoon, CGI, unrealistic perspective, distorted geometry"
  },
  "cove-finish": {
    name: "Cove Finish",
    prompt: "professional photograph of freshly completed cove finish concrete surface, smooth poured concrete with smooth rounded cove edges where the slab meets walls and borders, clean curved cove detail at perimeter transitioning smoothly to adjacent surfaces, smooth grey concrete surface with professional residential finish, neat rounded edge transitions, subtle natural concrete colour, recently completed quality work",
    negative: "sharp jagged edges, rough finish, cracked, stained, loose material, curved boundaries where straight expected, plastic look, cartoon, CGI, unrealistic perspective, distorted geometry"
  },
  "honed": {
    name: "Honed Concrete",
    prompt: "professional photograph of freshly completed honed polished concrete surface, smooth poured concrete ground and polished to semi-gloss finish revealing fine aggregate below the surface, modern sophisticated look, subtle stone flecks visible through the polished surface plane, clean professional finish with slight reflective quality, premium residential luxury concrete, natural colour variation, sharp straight formed edges at all boundaries",
    negative: "mirror polish, too shiny, fake marble, loose material, rough surface, curved edges, wavy edges, irregular borders, soft edges, plastic look, cartoon, CGI, unrealistic perspective, distorted geometry"
  },
  "saw-cut": {
    name: "Saw-Cut Pattern",
    prompt: "professional photograph of freshly completed concrete surface with clean precise saw-cut pattern creating geometric panels, straight thin cut lines forming rectangular sections, smooth grey concrete between the cuts, professional decorative saw-cut control joints, residential driveway pattern, clean lines with consistent spacing, sharp straight formed edges at all boundaries",
    negative: "uneven cuts, wobbly lines, cracked, dirty cuts, loose material, curved edges, wavy edges, irregular borders, soft edges, plastic look, cartoon, CGI, unrealistic perspective, distorted geometry"
  },
  "border-colour": {
    name: "Border Colour",
    prompt: "professional photograph of freshly completed concrete driveway with contrasting coloured border, main area in smooth plain grey concrete with a darker charcoal oxide coloured border strip running along the edges, clean straight border lines with sharp colour separation, professional two-tone concrete finish, neat colour transition, sharp straight formed edges at all boundaries, residential quality premium finish",
    negative: "painted lines, tape marks, uneven border, bleeding colours, loose material, curved edges, wavy edges, irregular borders, soft edges, plastic look, cartoon, CGI, unrealistic perspective, distorted geometry"
  }
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function trpcResponse(data, status = 200) {
  return jsonResponse({ result: { data: { json: data } } }, status);
}

function trpcErrorResponse(message, status = 400) {
  return jsonResponse({
    error: {
      json: {
        message,
        code: -32600,
        data: {
          code: status === 429 ? "TOO_MANY_REQUESTS" : "BAD_REQUEST",
          httpStatus: status,
        },
      },
    },
  }, status);
}

const leadRateLimits = new Map();

function normalizeWorkerPhone(value) {
  const raw = String(value || "").trim();
  let digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+") && !raw.startsWith("+61")) return digits;
  if (digits.startsWith("61") && digits.length === 11) digits = `0${digits.slice(2)}`;
  return digits;
}

function workerServiceArea(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  if (!normalized || normalized.toLowerCase() === "not specified") {
    return { allowed: true, status: "service_area_review", normalized: normalized || "Not specified" };
  }

  const outsidePattern = /\b(NSW|NEW SOUTH WALES|VIC|VICTORIA|SOUTH AUSTRALIA|WESTERN AUSTRALIA|TASMANIA|NORTHERN TERRITORY|ACT|PHILIPPINES?|INDIA|INDONESIA|MEXICO|ARGENTINA|BRAZIL|PAKISTAN|BANGLADESH|AFGHANISTAN|ALGERIA|EGYPT|MOROCCO|COLOMBIA|MOZAMBIQUE)\b/i;
  if (outsidePattern.test(normalized)) {
    return { allowed: false, status: "invalid", normalized };
  }

  const postcodeMatch = normalized.match(/\b(\d{4})\b/);
  if (postcodeMatch) {
    const postcode = Number(postcodeMatch[1]);
    const inArea =
      (postcode >= 4000 && postcode <= 4299) ||
      (postcode >= 4300 && postcode <= 4314) ||
      (postcode >= 4500 && postcode <= 4519) ||
      (postcode >= 4550 && postcode <= 4575);
    if (inArea) return { allowed: true, status: "in_area", normalized };
    if (postcode >= 4000 && postcode <= 4999) {
      return { allowed: true, status: "service_area_review", normalized };
    }
    return { allowed: false, status: "invalid", normalized };
  }

  return { allowed: true, status: "service_area_review", normalized };
}

function consumeWorkerRateLimit(key, windowMs, maxAttempts, now) {
  const cutoff = now - windowMs;
  const recent = (leadRateLimits.get(key) || []).filter(timestamp => timestamp > cutoff);
  if (recent.length >= maxAttempts) return false;
  recent.push(now);
  leadRateLimits.set(key, recent);
  if (leadRateLimits.size > 2000) {
    for (const [entryKey, timestamps] of leadRateLimits) {
      if (timestamps.every(timestamp => timestamp <= cutoff)) leadRateLimits.delete(entryKey);
      if (leadRateLimits.size <= 1500) break;
    }
  }
  return true;
}

function validateWorkerQuoteSubmission(formData) {
  const now = Date.now();
  if (formData.jobBrief) {
    const structured = validateWorkerJobBrief(formData.jobBrief);
    if (!structured.valid) return structured;
    Object.assign(formData, structured.legacy);
  }
  if (String(formData.website || "").trim()) {
    return { valid: false, status: 400, error: "Please check the form and try again." };
  }
  if (Number.isFinite(formData.formStartedAt) && now - formData.formStartedAt < 1500) {
    return { valid: false, status: 400, error: "Please check the form and try again." };
  }
  if (String(formData.name || "").trim().length < 2) {
    return { valid: false, status: 400, error: "Please enter your name." };
  }

  const phone = normalizeWorkerPhone(formData.phone);
  if (!/^04\d{8}$/.test(phone) && !/^0[2378]\d{8}$/.test(phone)) {
    return { valid: false, status: 400, error: "Enter an Australian phone number, for example 0424 463 268 or (07) 3123 4567." };
  }

  if (formData.formType === "hero_quick_quote") {
    if (!/^04\d{8}$/.test(phone)) {
      return { valid: false, status: 400, error: "Enter an Australian mobile number beginning with 04 so we can confirm the quote request." };
    }
    const email = String(formData.email || "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email) || /placeholder|not-provided|via-quick-form/i.test(email)) {
      return { valid: false, status: 400, error: "Enter your email address so we can send and verify your quote details." };
    }
    const service = String(formData.service || "").trim();
    if (!service || /^(general enquiry|quick quote|not specified)$/i.test(service)) {
      return { valid: false, status: 400, error: "Select the concrete service you need." };
    }
    if (String(formData.details || "").trim().length < 10) {
      return { valid: false, status: 400, error: "Add a short project description so we can assess the job before calling." };
    }
  }

  const serviceArea = workerServiceArea(formData.suburb);
  if (!serviceArea.allowed) {
    return { valid: false, status: 400, error: "We currently service Brisbane and surrounding South East Queensland areas." };
  }

  const leadKey = `lead:${phone}|${String(formData.email || "").toLowerCase()}|${serviceArea.normalized.toLowerCase()}`;
  const addressKey = `address:${formData._clientAddress || "unknown"}`;
  if (!consumeWorkerRateLimit(leadKey, 2 * 60_000, 1, now)) {
    return { valid: false, status: 429, error: "We've already received this enquiry. Please wait a moment before trying again." };
  }
  if (!consumeWorkerRateLimit(addressKey, 10 * 60_000, 8, now)) {
    return { valid: false, status: 429, error: "Too many requests were received. Please wait a few minutes and try again." };
  }

  return {
    valid: true,
    phone,
    suburb: serviceArea.normalized,
    serviceAreaStatus: serviceArea.status,
  };
}

function escapeWorkerHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const WORKER_SERVICE_LABELS = {
  driveway: "Driveway",
  slab: "Concrete Slab",
  patio: "Patio / Entertaining",
  "pool-surround": "Pool Surround",
  "retaining-wall": "Retaining Wall",
  pathway: "Pathway / Footpath",
  "exposed-aggregate": "Exposed Aggregate",
  stairs: "Stairs / Steps",
  excavation: "Excavation",
  crossover: "Crossover / Vehicle Crossing",
  commercial: "Commercial Project",
  other: "Other",
};

const WORKER_VALUE_LABELS = {
  phone: "Phone call", sms: "SMS", email: "Email",
  new: "New work", replacement: "Replacement", extension: "Extension", repair: "Repair", not_sure: "Not sure",
  plain: "Plain concrete", coloured: "Coloured concrete", exposed: "Exposed aggregate", stencilled: "Stencilled / stamped",
  asap: "ASAP — ready to go", within_1_month: "Within one month", one_to_three_months: "One to three months", three_plus_months: "Three or more months", planning: "Planning only",
  easy: "Easy vehicle access", restricted: "Restricted vehicle access", no_vehicle: "No vehicle access",
  flat: "Flat", slight: "Slight slope", steep: "Steep slope",
  none_known: "No known drainage", existing_drain: "Existing drain", new_drainage_needed: "New drainage may be needed",
  direct_truck: "Direct truck access", pump_likely: "Concrete pump likely",
  approved: "Approved", not_required: "Not required", not_started: "Not started",
};

function workerLabel(value) {
  return value ? WORKER_VALUE_LABELS[value] || value : "Not provided";
}

function workerMeasurementSummary(measurements) {
  if (!measurements || measurements.mode === "not_sure") return "Not sure — measure on site";
  if (measurements.mode === "area") return `${measurements.totalAreaM2} m² approximate total area`;
  const calculated = measurements.totalAreaM2 || Number((Number(measurements.lengthM || 0) * Number(measurements.widthM || 0)).toFixed(2));
  return `${measurements.lengthM} m × ${measurements.widthM} m (${calculated} m²)`;
}

function formatWorkerJobBrief(brief) {
  const contact = brief.contact || {};
  const location = brief.location || {};
  const scope = brief.scope || {};
  const measurements = brief.measurements || {};
  const site = brief.siteConditions || {};
  const photos = Array.isArray(brief.photos) ? brief.photos : [];
  const yesNo = value => value === undefined ? "Not provided" : value ? "Yes" : "No";
  return [
    "CONTACT",
    `Name: ${contact.name}`,
    `Mobile: ${normalizeWorkerPhone(contact.mobile)}`,
    `Email: ${contact.email}`,
    `Preferred contact: ${workerLabel(contact.preferredContact)}`,
    `Company: ${contact.company || "Not provided"}`,
    "",
    "SITE ADDRESS",
    `Street address: ${location.streetAddress || "Not provided"}`,
    `Suburb: ${location.suburb}`,
    `Postcode: ${location.postcode}`,
    "",
    "JOB SCOPE",
    `Services: ${(scope.services || []).map(service => WORKER_SERVICE_LABELS[service] || service).join(", ")}`,
    `Work type: ${workerLabel(scope.workType)}`,
    `Finish: ${workerLabel(scope.finish)}`,
    `Timeframe: ${workerLabel(scope.timeframe)}`,
    `Description: ${scope.description}`,
    "",
    "MEASUREMENTS",
    `Measurements: ${workerMeasurementSummary(measurements)}`,
    `Separate areas / notes: ${measurements.separateAreaNotes || "Not provided"}`,
    "",
    "SITE CONDITIONS",
    `Existing concrete removal: ${yesNo(site.existingConcreteRemoval)}`,
    `Access width: ${site.accessWidthM ? `${site.accessWidthM} m` : "Not provided"}`,
    `Vehicle access: ${workerLabel(site.vehicleAccess)}`,
    `Slope: ${workerLabel(site.slope)}`,
    `Drainage: ${workerLabel(site.drainage)}`,
    `Concrete placement access: ${workerLabel(site.pumpAccess)}`,
    `Known underground services: ${site.knownServices || "Not provided"}`,
    `Council / body corporate approval: ${workerLabel(site.approvalStatus)}`,
    `Special requirements: ${site.specialRequirements || "Not provided"}`,
    "",
    "PHOTOS",
    ...(photos.length ? photos.map((photo, index) => `Photo ${index + 1}: ${photo.url}`) : ["No photos attached"]),
  ].join("\n");
}

function validateWorkerJobBrief(brief) {
  if (!brief || typeof brief !== "object" || brief.version !== 1) {
    return { valid: false, status: 400, error: "The quote details are incomplete. Please review the form and try again." };
  }
  const contact = brief.contact || {};
  const location = brief.location || {};
  const scope = brief.scope || {};
  const measurements = brief.measurements || {};
  const photos = Array.isArray(brief.photos) ? brief.photos : [];
  const mobile = normalizeWorkerPhone(contact.mobile);
  if (String(contact.name || "").trim().length < 2) return { valid: false, status: 400, error: "Enter your full name." };
  if (!/^04\d{8}$/.test(mobile)) return { valid: false, status: 400, error: "Enter an Australian mobile number beginning with 04." };
  if (!/^\S+@\S+\.\S+$/.test(String(contact.email || ""))) return { valid: false, status: 400, error: "Enter a valid email address." };
  if (String(location.suburb || "").trim().length < 2 || !/^\d{4}$/.test(String(location.postcode || ""))) return { valid: false, status: 400, error: "Enter the project suburb and four-digit postcode." };
  if (!Array.isArray(scope.services) || scope.services.length < 1) return { valid: false, status: 400, error: "Select at least one concrete service." };
  if (String(scope.description || "").trim().length < 20) return { valid: false, status: 400, error: "Add a useful project description of at least 20 characters." };
  if (measurements.mode === "dimensions" && (!(Number(measurements.lengthM) > 0) || !(Number(measurements.widthM) > 0))) return { valid: false, status: 400, error: "Enter both length and width, or choose Not sure." };
  if (measurements.mode === "area" && !(Number(measurements.totalAreaM2) > 0)) return { valid: false, status: 400, error: "Enter the approximate total area, or choose Not sure." };
  if (!brief.consents || brief.consents.contact !== true || brief.consents.privacy !== true) return { valid: false, status: 400, error: "Contact consent and privacy acknowledgement are required." };
  if (photos.length > 8 || photos.some(photo => !photo || !/^https:\/\//.test(String(photo.url || "")) || !/^image\/(jpeg|png|webp|heic|heif)$/.test(String(photo.contentType || "")))) return { valid: false, status: 400, error: "One or more photo attachments are invalid." };

  const details = formatWorkerJobBrief(brief);
  return {
    valid: true,
    legacy: {
      name: String(contact.name).trim(),
      phone: mobile,
      email: String(contact.email).trim(),
      suburb: `${String(location.suburb).trim()} ${String(location.postcode).trim()}`,
      service: scope.services.map(service => WORKER_SERVICE_LABELS[service] || service).join(", "),
      details,
      photoUrls: photos.map(photo => photo.url),
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// ANTHROPIC CLAUDE — QA / Planning Brain
// ═══════════════════════════════════════════════════════════════

async function claudeQA(env, imageUrl, maskBase64, finishType, preserveGrassStrips, preserveStructures, customerNotes) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const finishData = FINISH_TYPES[finishType] || FINISH_TYPES["plain"];

  const systemPrompt = `You are the visual planning brain for a residential concrete visualisation app. You produce FLUX.1 Fill inpainting prompts that generate photorealistic concrete surfaces.

IMPORTANT: FLUX does NOT support negative prompts. Everything must be expressed positively in the generation_prompt.

You receive:
1. The original site photo
2. A binary mask (WHITE = proposed concrete area, BLACK = preserve)

Your job:
1. Analyse the scene geometry: dimensions, slope, perspective, camera angle
2. Identify ALL boundary edges and what material they meet (brick wall, grass, kerb, etc.)
3. Note lighting direction, shadow angles, and time of day
4. Generate a GEOMETRICALLY-SPECIFIC positive-only prompt for FLUX.1 Fill

CRITICAL PROMPT ENGINEERING RULES:
- The generation_prompt describes ONLY what appears inside the masked area
- FLUX has NO negative prompt support — express everything as what TO generate, not what to avoid
- You MUST include geometric anchoring: dimensions, slope direction, perspective vanishing point
- You MUST describe each boundary edge explicitly: "sharp straight formed edge running along [material] on [side]"
- You MUST use multi-scale description: [MACRO] surface type → [MESO] texture detail → [MICRO] material finish → [FINISH] sealer/sheen
- For exposed aggregate: ALWAYS include ALL of these phrases:
  * "small decorative stones 5-10mm permanently embedded and locked into wet cement matrix"
  * "polished wet-look polyurethane sealer finish with uniform glossy sheen"
  * "stones completely flush with surface forming one continuous solid plane"
  * "visible cream-coloured cement paste between all stones"
  * "monolithic poured concrete surface" (this prevents the loose-gravel interpretation)
- NEVER just say "exposed aggregate" — FLUX interprets that as loose gravel/rocks
- Include lighting consistency: "matching ambient lighting, same sunlight direction as surrounding area"
- Start with "professional photograph of freshly completed" to anchor photorealism
- End with "photorealistic finished job photograph, high resolution"
- The concrete MUST come off each side of any brickwork/retaining wall in perfectly straight lines

Rules:
- ${preserveGrassStrips ? "Preserve grass strips visible inside the driveway — do NOT concrete over them." : "Grass strips inside the work area should be concreted over."}
- ${preserveStructures ? "Preserve all walls, house structure, and garage even if partially inside the mask." : "Only concrete ground-level surfaces inside the mask."}
- If the work area is unclear or the mask covers critical structures, return NEEDS_USER_CONFIRMATION.

Return ONLY valid JSON (no markdown, no code blocks):

{
  "status": "READY" or "NEEDS_USER_CONFIRMATION",
  "work_area_description": "what area will be concreted, with estimated dimensions",
  "scene_geometry": {
    "dimensions_estimate": "e.g. 6m x 3.5m",
    "slope": "e.g. declining toward street, 1:20 gradient",
    "perspective": "e.g. camera at street level, two-point perspective"
  },
  "boundaries": {
    "left": "what material and edge type",
    "right": "what material and edge type",
    "top": "what material and edge type",
    "bottom": "what material and edge type"
  },
  "preserve_zones": ["list of areas that must not be changed"],
  "risk_notes": ["any concerns"],
  "generation_prompt": "FULL geometrically-specific POSITIVE-ONLY prompt for FLUX.1 Fill — include dimensions, slope, all boundary edges, material state, lighting. Must be detailed and specific.",
  "quality_checks": ["list of things to verify"]
}`;

  const userPrompt = `The customer wants ${finishData.name} concrete installed in the masked area.

Base finish prompt (use as foundation, expand with scene-specific geometry): ${finishData.prompt}

The first image is the original site photo. The second image is the binary mask (WHITE = area to concrete, BLACK = preserve).

Your generation_prompt MUST:
1. Start with "professional photograph of freshly completed"
2. Include the FULL material state description (not just the finish name)
3. Describe the exact geometry: estimated dimensions, slope direction, perspective
4. Describe EACH boundary edge: "sharp straight formed edge running Xm along [material] on [side]" — the concrete MUST come off each side of any brickwork/retaining wall in perfectly straight lines
5. Include lighting: "matching ambient [time of day] lighting from [direction]"
6. End with "photorealistic finished job photograph, high resolution"
7. The prompt must be POSITIVE ONLY (FLUX has no negative prompt support)

REMEMBER: For exposed aggregate, the #1 failure mode is generating "loose gravel" instead of "stones embedded in sealed cement matrix". Your prompt MUST emphasize: permanently embedded, locked into cement, flush with surface, cement visible between stones, wet-look polyurethane sealer, glossy sheen, monolithic poured concrete surface, one continuous solid plane.

The concrete edges must be perfectly straight where they meet brickwork, retaining walls, or any hard boundary. Describe this explicitly in the prompt.

CRITICAL UNIFORMITY RULE: The ENTIRE masked area must be treated as ONE SINGLE CONTINUOUS SURFACE. Every square inch of the white mask area must show the same consistent finish. There must be absolutely no patches of loose gravel, no unfinished spots, no texture variation within the masked area. Repeat the phrase "uniformly finished across the entire area" in your prompt.${customerNotes ? `\n\nCUSTOMER NOTES (incorporate into your prompt): ${customerNotes}` : ""}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: imageUrl } },
          { type: "image", source: { type: "base64", media_type: "image/png", data: maskBase64 } },
          { type: "text", text: userPrompt },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textBlock = data.content.find((block) => block.type === "text");
  if (!textBlock?.text) throw new Error("No text response from Anthropic");

  // Parse JSON response
  const cleaned = textBlock.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

// ═══════════════════════════════════════════════════════════════
// BFL FLUX.1 Fill — Inpainting (mask-first)
// ═══════════════════════════════════════════════════════════════

async function callFluxFill(env, prompt, imageBase64, maskBase64) {
  const apiKey = env.BFL_API_KEY;
  if (!apiKey) throw new Error("BFL_API_KEY not configured");

  // FLUX.1 Fill requires RAW base64 encoded image and mask (no data URL prefix)
  // Mask semantics: black = preserve, white = inpaint
  // Strip data URL prefix if present
  const cleanImage = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
  const cleanMask = maskBase64.includes(",") ? maskBase64.split(",")[1] : maskBase64;

  const body = {
    prompt,
    image: cleanImage,
    mask: cleanMask,
    steps: 35,
    guidance: 24,
    output_format: "jpeg",
    safety_tolerance: 2,
  };

  const submitResponse = await fetch("https://api.bfl.ai/v1/flux-pro-1.0-fill", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-key": apiKey },
    body: JSON.stringify(body),
  });

  if (!submitResponse.ok) {
    const errorText = await submitResponse.text();
    throw new Error(`BFL Fill API error (${submitResponse.status}): ${errorText}`);
  }

  const submitData = await submitResponse.json();
  const pollingUrl = submitData.polling_url;

  // Poll for result (max 120 seconds)
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollResponse = await fetch(pollingUrl, { headers: { "x-key": apiKey } });
    if (!pollResponse.ok) continue;
    const pollData = await pollResponse.json();
    if (pollData.status === "Ready" && pollData.result?.sample) return pollData.result.sample;
    if (pollData.status === "Error" || pollData.status === "Failed") {
      throw new Error(`FLUX Fill failed: ${JSON.stringify(pollData)}`);
    }
  }
  throw new Error("FLUX Fill generation timed out");
}

// Helper: Download image from URL and convert to base64
async function imageUrlToBase64(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download image from ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  // Process in chunks to avoid call stack overflow
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  return btoa(binary);
}

// ═══════════════════════════════════════════════════════════════
// STORAGE — S3 via Forge proxy
// ═══════════════════════════════════════════════════════════════

async function storagePut(env, relKey, data, contentType) {
  const baseUrl = env.BUILT_IN_FORGE_API_URL || "https://forge.manus.ai";
  const apiKey = env.BUILT_IN_FORGE_API_KEY;
  if (!apiKey) throw new Error("Storage credentials not configured");

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  const url = new URL("v1/storage/upload", normalizedBase);
  url.searchParams.set("path", relKey.replace(/^\/+/, ""));

  const blob = new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, relKey.split("/").pop() || "file");

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => response.statusText);
    throw new Error(`Storage upload failed (${response.status}): ${msg}`);
  }
  const result = await response.json();
  return { url: result.url };
}

// ═══════════════════════════════════════════════════════════════
// ROUTE HANDLERS
// ═══════════════════════════════════════════════════════════════

// Handle photo upload
async function handlePhotoUpload(env, body) {
  const { data, contentType, fileName } = body;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (!data || typeof data !== "string" || !fileName || !allowedTypes.includes(contentType)) {
    throw new Error("Invalid photo upload. Use JPEG, PNG, WebP or HEIC.");
  }
  if (data.length > 14 * 1024 * 1024) throw new Error("Photo is larger than 10 MB.");
  const binaryStr = atob(data);
  if (!binaryStr.length || binaryStr.length > 10 * 1024 * 1024) throw new Error("Photo is empty or larger than 10 MB.");
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : contentType.includes("hei") ? "heic" : "jpg";
  const prefix = body.purpose === "visualiser" ? "visualiser-uploads" : "quote-photos";
  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { url } = await storagePut(env, key, bytes, contentType);
  return { url, fileName: String(fileName).slice(0, 255), contentType };
}

// Handle visualiser.qa — Claude QA step
async function handleQA(env, input) {
  const { imageUrl, mask, finish, preserveGrassStrips, preserveStructures, customerNotes, stoneMix, borderConfig } = input;

  if (!imageUrl) return { success: false, error: "No image provided" };
  if (!mask) return { success: false, error: "No mask provided — please draw the area you want concreted" };
  if (!finish) return { success: false, error: "No finish type selected" };

  // Build enhanced notes with stone mix and border info
  let enhancedNotes = customerNotes || "";
  if (stoneMix) {
    enhancedNotes += ` Stone mix colour: ${stoneMix}.`;
  }
  if (borderConfig && borderConfig.enabled) {
    enhancedNotes += ` Add a ${borderConfig.width || '200mm'} contrasting ${borderConfig.colour || 'charcoal'} coloured border strip around the perimeter of the concrete.`;
  }

  try {
    const jobBrief = await claudeQA(env, imageUrl, mask, finish, preserveGrassStrips !== false, preserveStructures !== false, enhancedNotes);
    return { success: true, brief: jobBrief };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Handle visualiser.generate — FLUX Fill inpainting
async function handleGenerate(env, input) {
  const { imageUrl, mask, finish, generationPrompt, customerNotes, stoneMix, borderConfig } = input;
  const finishData = FINISH_TYPES[finish] || FINISH_TYPES["plain"];

  if (!imageUrl) return { success: false, error: "No image provided" };
  if (!mask) return { success: false, error: "No mask provided" };

  // Build enhanced notes with stone mix and border info
  let enhancedNotes = customerNotes || "";
  if (stoneMix) {
    enhancedNotes += ` Stone mix colour: ${stoneMix}.`;
  }
  if (borderConfig && borderConfig.enabled) {
    enhancedNotes += ` Add a ${borderConfig.width || '200mm'} contrasting ${borderConfig.colour || 'charcoal'} coloured border strip around the perimeter of the concrete.`;
  }

  // Build the prompt — prepend uniformity enforcement, then Claude's generation_prompt or fallback
  const uniformityPrefix = "Professional architectural photograph of a completed residential concrete installation. The ENTIRE marked area is now a single, continuous, uniformly finished surface. Every square inch shows consistent texture, color, and professional seal with no loose stones, no gravel, no unfinished patches, and no texture variation. ";
  
  const basePrompt = generationPrompt || `freshly completed ${finishData.name.toLowerCase()} concrete surface, professionally installed. ${finishData.prompt}. Seamlessly matching the perspective, lighting and shadows of the surrounding scene. Sharp straight formed edges at all boundaries.`;
  
  const customerContext = enhancedNotes ? ` Customer requirement: ${enhancedNotes}.` : "";
  
  const prompt = uniformityPrefix + basePrompt + customerContext + " Photorealistic finished job photograph, high resolution.";

  try {
    // Download original image and convert to base64
    const imageBase64 = await imageUrlToBase64(imageUrl);

    // Call FLUX Fill — mask is the source of truth
    const generatedImageUrl = await callFluxFill(env, prompt, imageBase64, mask);

    // Download result and store on S3
    const imageResponse = await fetch(generatedImageUrl);
    if (!imageResponse.ok) throw new Error("Failed to download generated image");

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";
    const key = `visualiser/${Date.now()}-${finish}.${ext}`;

    const { url } = await storagePut(env, key, imageBuffer, contentType);
    return { success: true, generatedUrl: url };
  } catch (err) {
    return { success: false, generatedUrl: "", error: err.message };
  }
}

// Handle visualiser.timelapse — Generate construction stage keyframes
async function handleTimelapse(env, input) {
  const { imageUrl, mask, finish, customerNotes } = input;

  if (!imageUrl) return { success: false, stages: [], error: "No image provided" };
  if (!mask) return { success: false, stages: [], error: "No mask provided" };
  if (!finish) return { success: false, stages: [], error: "No finish type selected" };

  const finishData = FINISH_TYPES[finish] || FINISH_TYPES["plain"];

  // Construction stage prompts (no machinery, just the ground transforming)
  const stagePrompts = [
    { id: "existing", label: "Existing", description: "Current state of your property", prompt: "" },
    { id: "excavated", label: "Excavated", description: "Ground excavated and prepared", prompt: "Professional photograph of a residential construction site showing freshly excavated ground. The area has been dug out to a depth of approximately 150mm, revealing compacted brown earth and subsoil. Clean straight excavation edges along all boundaries. Slight moisture visible on the exposed soil. Small mounds of removed material visible at the edges. The excavation is level and professionally done with a slight fall for drainage. Natural ambient lighting matching the surrounding scene. Photorealistic construction site photograph, high resolution." },
    { id: "formed", label: "Formed", description: "Timber formwork set in place", prompt: "Professional photograph of a residential concrete construction site with timber formwork (boxing) set in place. Clean straight pine timber boards (100mm x 25mm) held in place with timber pegs driven into the ground at regular intervals. The formwork creates clean straight edges defining the exact shape of the future concrete slab. Inside the forms, compacted crushed rock base (blue metal) is visible, levelled and ready for concrete. Steel reinforcement mesh (SL72) visible sitting on bar chairs above the base. The formwork is level and professionally installed with neat corners. Natural ambient lighting matching the surrounding scene. Photorealistic construction site photograph, high resolution." },
    { id: "poured", label: "Just Poured", description: "Fresh wet concrete placed", prompt: "Professional photograph of freshly poured wet concrete filling the formed area. The concrete is still wet and dark grey with a smooth but slightly textured surface from initial screeding. Visible moisture sheen on the surface. The wet concrete is level with the top of the timber formwork. A few subtle trowel marks visible from the initial levelling pass. The concrete has a uniform dark wet appearance throughout. Timber formwork still visible at the edges containing the wet concrete. Natural ambient lighting matching the surrounding scene. Photorealistic construction site photograph, high resolution." },
    { id: "finished", label: "Finished", description: `Completed ${finishData.name} surface`, prompt: `Professional architectural photograph of a completed residential concrete installation. The ENTIRE area is now a single, continuous, uniformly finished surface. ${finishData.prompt}. Every square inch shows consistent texture, color, and professional seal. Sharp straight formed edges at all boundaries. The concrete is fully cured and sealed, looking brand new and professionally completed. ${customerNotes ? `Customer notes: ${customerNotes}.` : ""} Photorealistic finished job photograph, high resolution.` },
  ];

  try {
    // Download original image to base64
    const imageBase64 = await imageUrlToBase64(imageUrl);
    const results = [];

    // Stage 1: Existing — use original photo
    results.push({
      id: stagePrompts[0].id,
      label: stagePrompts[0].label,
      description: stagePrompts[0].description,
      imageUrl: imageUrl,
    });

    // Stages 2-5: Generate each via FLUX Fill
    for (let i = 1; i < stagePrompts.length; i++) {
      const stage = stagePrompts[i];
      try {
        const generatedImageUrl = await callFluxFill(env, stage.prompt, imageBase64, mask);

        // Download and store on S3
        const imageResponse = await fetch(generatedImageUrl);
        if (!imageResponse.ok) throw new Error(`Failed to download stage ${stage.id}`);

        const imageBuffer = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
        const ext = contentType.includes("png") ? "png" : "jpg";
        const key = `timelapse/${Date.now()}-${stage.id}.${ext}`;

        const { url } = await storagePut(env, key, imageBuffer, contentType);
        results.push({
          id: stage.id,
          label: stage.label,
          description: stage.description,
          imageUrl: url,
        });
      } catch (stageErr) {
        console.error(`[Timelapse] Stage ${stage.id} failed:`, stageErr.message);
        // Continue with remaining stages
      }
    }

    if (results.length < 3) {
      return { success: false, stages: [], error: "Timelapse generation failed — too few stages completed" };
    }

    return { success: true, stages: results };
  } catch (err) {
    return { success: false, stages: [], error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// LEAD BACKUP: Manus Backend (saves to Database + Google Sheets)
// ═══════════════════════════════════════════════════════════════
async function backupToManusBackend(env, formData) {
  const backendUrl = env.MANUS_BACKEND_URL || "https://concreteconceptsgroup.manus.space";
  try {
    const response = await fetch(`${backendUrl}/api/webhooks/lead-capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        name: formData.name || "",
        phone: formData.phone || "",
        email: formData.email || "",
        service: formData.service || "",
        suburb: formData.suburb || "",
        details: formData.details || "",
        leadSource: formData.leadSource || "Direct",
        photoUrls: formData.photoUrls || [],
        jobBrief: formData.jobBrief || null,
      }),
    });
    if (!response.ok) {
      console.error("Manus backend backup failed:", response.status);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Manus backend backup failed:", e.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// LEAD BACKUP: Jotform
// ═══════════════════════════════════════════════════════════════
async function backupToJotform(env, formData) {
  const jotformId = env.JOTFORM_FORM_ID || "261986395364069";
  try {
    const params = new URLSearchParams();
    // Field 2: Full Name (first/last) - uses q2_fullname0 format for public submit
    const nameParts = (formData.name || "").trim().split(" ");
    params.append("q2_fullname0[first]", nameParts[0] || "");
    params.append("q2_fullname0[last]", nameParts.slice(1).join(" ") || "");
    // Field 13: Mobile Phone
    params.append("q13_mobilePhone", formData.phone || "");
    // Field 4: Email Address
    params.append("q4_email2", formData.email || "");
    // Field 5: Property Address including suburb
    params.append("q5_textbox3", formData.suburb || "");
    // Field 6: What do you need concreted?
    params.append("q6_dropdown4", formData.service || "");
    // Field 9: Tell us about your project
    params.append("q9_textarea7", formData.details || "");
    const response = await fetch(`https://submit.jotform.com/submit/${jotformId}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!response.ok) {
      console.error("Jotform backup failed:", response.status);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Jotform backup failed:", e.message);
    return false;
  }
}

// Handle quote form submission — multi-channel: Email + Google Sheets + Jotform
async function handleQuoteSubmit(env, formData) {
  const resendApiKey = env.RESEND_API_KEY;

  const validation = validateWorkerQuoteSubmission(formData);
  if (!validation.valid) return { success: false, error: validation.error, status: validation.status };

  formData.phone = validation.phone;
  formData.suburb = validation.suburb;
  if (validation.serviceAreaStatus === "service_area_review") {
    formData.details = `[SERVICE AREA REVIEW]\n${formData.details || "No additional details provided"}`;
  }

  const { name, phone, email, service, suburb, details, leadSource } = formData;
  const photoUrls = Array.isArray(formData.photoUrls) ? formData.photoUrls : [];
  const photoSection = photoUrls.length
    ? `<h3>Site Photos</h3><ul>${photoUrls.map((url, index) => `<li><a href="${escapeWorkerHtml(url)}" target="_blank" rel="noopener">Photo ${index + 1}</a></li>`).join("")}</ul>`
    : `<p><strong>Site Photos:</strong> None attached</p>`;

  const notificationHtml = `
    <h2>New Quote Request</h2>
    <table style="border-collapse:collapse;width:100%">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${escapeWorkerHtml(name || "Not provided")}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${escapeWorkerHtml(phone || "Not provided")}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${escapeWorkerHtml(email || "Not provided")}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Service</td><td style="padding:8px;border:1px solid #ddd">${escapeWorkerHtml(service || "Not specified")}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Suburb</td><td style="padding:8px;border:1px solid #ddd">${escapeWorkerHtml(suburb || "Not specified")}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;vertical-align:top">Details</td><td style="padding:8px;border:1px solid #ddd;white-space:pre-wrap">${escapeWorkerHtml(details || "None")}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Lead Source</td><td style="padding:8px;border:1px solid #ddd">${escapeWorkerHtml(leadSource || "Direct")}</td></tr>
    </table>
    ${photoSection}
  `;

  // Fire all channels in parallel — never lose a lead
  const results = { email: "pending", sheets: "pending", jotform: "pending" };
  try {
    const [emailRes, manusRes, jotformRes] = await Promise.allSettled([
      resendApiKey ? fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Concrete Concepts <info@concreteconceptsgroup.com>",
          to: ["info@concreteconceptsgroup.com"],
          subject: `New Quote: ${service || "General"} - ${suburb || "Unknown"} (${name || "Unknown"})`,
          html: notificationHtml,
        }),
      }) : Promise.resolve(null),
      backupToManusBackend(env, formData),
      backupToJotform(env, formData),
    ]);

    if (emailRes.status === "fulfilled" && emailRes.value?.ok) {
      results.email = "sent";
    } else {
      results.email = "failed";
      console.error("Resend error:", emailRes.reason || "non-ok response");
    }
    results.sheets = manusRes.status === "fulfilled" && manusRes.value ? "logged" : "failed";
    results.jotform = jotformRes.status === "fulfilled" && jotformRes.value ? "logged" : "failed";

    // Auto-reply to customer (non-blocking)
    if (resendApiKey && email && !email.includes("placeholder") && !email.includes("not-provided")) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Concrete Concepts <info@concreteconceptsgroup.com>",
          to: [email],
          subject: "We've received your quote request - Concrete Concepts Group",
          html: `<h2>Thanks ${name || ""}!</h2><p>We've received your quote request and will be in touch within 24 hours.</p><p>If you need to reach us sooner, call <a href="tel:0424463268">0424 463 268</a>.</p><p>— The Concrete Concepts Team</p>`,
        }),
      }).catch(() => {});
    }

    const delivered = results.email === "sent" || results.sheets === "logged" || results.jotform === "logged";
    return delivered
      ? { success: true, message: "Quote submitted successfully", channels: results, serviceAreaStatus: validation.serviceAreaStatus }
      : { success: false, error: "We couldn't confirm delivery. Please call 0424 463 268.", status: 503, channels: results };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Parse tRPC batch request body
function parseTrpcBody(body) {
  if (body && typeof body === "object") {
    if (body["0"] && body["0"].json) return body["0"].json;
    if (body.json) return body.json;
  }
  return body;
}

// ═══════════════════════════════════════════════════════════════
// MAIN WORKER EXPORT
// ═══════════════════════════════════════════════════════════════

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Static assets: use CF Cache API to avoid cold-start penalty on repeat visits
    if (request.method !== "POST" || !path.startsWith("/api/")) {
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), { method: "GET" });
      let response = await cache.match(cacheKey);
      if (!response) {
        response = await env.ASSETS.fetch(request);
        // Cache HTML for 60s at the edge, stale-while-revalidate for 5 min
        if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
          const cached = new Response(response.body, response);
          cached.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
          ctx.waitUntil(cache.put(cacheKey, cached.clone()));
          return cached;
        }
        // Cache other static assets at edge
        if (response.ok && (path.startsWith("/assets/") || path.endsWith(".js") || path.endsWith(".css") || path.endsWith(".png") || path.endsWith(".jpg"))) {
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
      }
      return response;
    }

    try {
      // Route: Quote submission (direct)
      if (path === "/api/quote-submit") {
        const body = await request.json();
        const result = await handleQuoteSubmit(env, {
          ...body,
          _clientAddress: request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown",
        });
        return jsonResponse(result, result.success ? 200 : result.status || 500);
      }

      // Route: Quote submission (tRPC format)
      if (path === "/api/trpc/quote.submit") {
        const body = await request.json();
        const formData = parseTrpcBody(body);
        const result = await handleQuoteSubmit(env, {
          ...formData,
          _clientAddress: request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown",
        });
        return result.success
          ? trpcResponse(result)
          : trpcErrorResponse(result.error || "Quote submission failed", result.status || 500);
      }

      // Route: Photo upload
      if (path === "/api/upload-photo") {
        const body = await request.json();
        const result = await handlePhotoUpload(env, body);
        return jsonResponse(result);
      }

      // Route: Visualiser QA (Claude planning brain)
      if (path === "/api/trpc/visualiser.qa") {
        const body = await request.json();
        const input = parseTrpcBody(body);
        const result = await handleQA(env, input);
        return trpcResponse(result);
      }

      // Route: Visualiser generate (FLUX Fill inpainting)
      if (path === "/api/trpc/visualiser.generate") {
        const body = await request.json();
        const input = parseTrpcBody(body);
        const result = await handleGenerate(env, input);
        return trpcResponse(result);
      }

      // Route: Visualiser timelapse (construction stage keyframes)
      if (path === "/api/trpc/visualiser.timelapse") {
        const body = await request.json();
        const input = parseTrpcBody(body);
        const result = await handleTimelapse(env, input);
        return trpcResponse(result);
      }

      // Route: Callback request
      if (path === "/api/trpc/callback.submit" || path === "/api/callback-submit") {
        const body = await request.json();
        const formData = parseTrpcBody(body);
        const result = await handleQuoteSubmit(env, {
          ...formData,
          _clientAddress: request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown",
          service: "Callback Request",
          details: `Callback requested: ${formData.name} - ${formData.phone}`,
        });
        return result.success
          ? trpcResponse(result)
          : trpcErrorResponse(result.error || "Callback submission failed", result.status || 500);
      }

      // Legacy: visualiser.analyse (redirect to QA)
      if (path === "/api/trpc/visualiser.analyse") {
        const body = await request.json();
        const input = parseTrpcBody(body);
        const result = await handleQA(env, input);
        return trpcResponse(result);
      }

    } catch (err) {
      console.error("Worker error:", err);
      return jsonResponse({ error: err.message || "Internal server error" }, 500);
    }

    // Fall through to static assets
    return env.ASSETS.fetch(request);
  },
};
