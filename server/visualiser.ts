/**
 * AI Concrete Visualiser V3 — Mask-First Architecture
 * 
 * Flow:
 * 1. User draws mask on their property photo (white = work area, black = preserve)
 * 2. Claude QA analyses image + mask → returns structured job brief JSON
 * 3. FLUX.1 Fill inpaints ONLY the masked area with the selected concrete finish
 * 4. Quality check validates the output
 */
import { storagePut } from "./storage";

// ═══════════════════════════════════════════════════════════════
// FINISH TYPES — expanded set with precise prompts + negative prompts
// ═══════════════════════════════════════════════════════════════

export const FINISH_TYPES: Record<string, { name: string; description: string; prompt: string; negative: string }> = {
  "exposed-aggregate": {
    name: "Exposed Aggregate",
    description: "Natural stone pebbles embedded in sealed cement with a glossy wet-look finish",
    prompt: "professional photograph of freshly completed exposed aggregate concrete surface, smooth poured concrete with small decorative stones 5-10mm permanently embedded and locked into wet cement matrix, polished wet-look polyurethane sealer finish with uniform glossy sheen, stones completely flush with surface forming one continuous solid plane, visible cream-coloured cement paste between all stones, monolithic poured concrete surface, uniform stone distribution across entire area, natural warm aggregate blend in cream and grey tones, sharp straight formed edges with clean 90-degree termination, professional residential concrete installation recently sealed with wet appearance, high quality finished work",
    negative: "loose rocks, scattered gravel, protruding stones, rock garden, crushed rock, loose fill, matte finish, dry concrete, unsealed concrete, curved edges, wavy edges, irregular borders"
  },
  "broom-finish": {
    name: "Broom Finish",
    description: "Fine parallel brush lines creating subtle grip texture, uniform light grey",
    prompt: "professional photograph of freshly completed broom finish concrete surface, smooth poured concrete with fine parallel brush lines creating subtle anti-slip grip texture, uniform light grey colour throughout, clean professional broom strokes running in one consistent direction, smooth formed edges with sharp straight termination, natural concrete colour with very subtle variation, realistic fine shadows in the brush grooves, recently sealed residential driveway finish, sharp straight formed edges along all boundaries",
    negative: "rough uneven surface, deep grooves, loose material, scattered debris, curved edges, wavy edges, irregular borders"
  },
  "plain": {
    name: "Plain Concrete",
    description: "Clean, smooth grey concrete with a steel-trowel finish",
    prompt: "professional photograph of freshly completed plain concrete surface with clean steel-trowel finish, smooth poured concrete with uniform light grey colour, minimal surface texture with very subtle natural variation, professional flat finish, clean straight formed edges with sharp 90-degree termination at all boundaries, neat control joints, recently completed residential quality smooth concrete, slight natural sheen from fresh cure",
    negative: "rough texture, cracks, stains, loose material, curved edges, wavy edges, irregular borders"
  },
  "charcoal-oxide": {
    name: "Charcoal Oxide",
    description: "Deep dark grey-black integral oxide colour throughout, modern dramatic look",
    prompt: "professional photograph of freshly completed charcoal oxide concrete surface, smooth poured concrete with deep dark grey-black integral oxide colour throughout, rich dark charcoal tone with subtle depth variation, smooth professional steel-trowel finish, clean straight formed edges with sharp 90-degree termination, modern dramatic look, premium residential oxide concrete, slight natural colour variation for realism, recently sealed with subtle sheen",
    negative: "flat black paint, unrealistic solid colour, loose material, faded, patchy colour, curved edges, wavy edges, irregular borders"
  },
  "cove-finish": {
    name: "Cove Finish",
    description: "Smooth rounded edges where the slab meets walls and borders",
    prompt: "professional photograph of freshly completed cove finish concrete surface, smooth poured concrete with smooth rounded cove edges where the slab meets walls and borders, clean curved cove detail at perimeter transitioning smoothly to adjacent surfaces, smooth grey concrete surface with professional residential finish, neat rounded edge transitions, subtle natural concrete colour, recently completed quality work",
    negative: "sharp jagged edges, rough finish, cracked, stained, loose material, curved boundaries where straight expected"
  },
  "honed": {
    name: "Honed Concrete",
    description: "Polished smooth concrete with a semi-gloss finish revealing fine aggregate",
    prompt: "professional photograph of freshly completed honed polished concrete surface, smooth poured concrete ground and polished to semi-gloss finish revealing fine aggregate below the surface, modern sophisticated look, subtle stone flecks visible through the polished surface plane, clean professional finish with slight reflective quality, premium residential luxury concrete, natural colour variation, sharp straight formed edges at all boundaries",
    negative: "mirror polish, too shiny, fake marble, loose material, rough surface, curved edges, wavy edges, irregular borders"
  },
  "saw-cut": {
    name: "Saw-Cut Pattern",
    description: "Clean precise saw-cut pattern creating geometric panels",
    prompt: "professional photograph of freshly completed concrete surface with clean precise saw-cut pattern creating geometric panels, straight thin cut lines forming rectangular sections, smooth grey concrete between the cuts, professional decorative saw-cut control joints, residential driveway pattern, clean lines with consistent spacing, sharp straight formed edges at all boundaries",
    negative: "uneven cuts, wobbly lines, cracked, dirty cuts, loose material, curved edges, wavy edges, irregular borders"
  },
  "border-colour": {
    name: "Border Colour",
    description: "Contrasting coloured border strip with plain grey main area",
    prompt: "professional photograph of freshly completed concrete driveway with contrasting coloured border, main area in smooth plain grey concrete with a darker charcoal oxide coloured border strip running along the edges, clean straight border lines with sharp colour separation, professional two-tone concrete finish, neat colour transition, sharp straight formed edges at all boundaries, residential quality premium finish",
    negative: "painted lines, tape marks, uneven border, bleeding colours, loose material, curved edges, wavy edges, irregular borders"
  }
};

// Legacy alias for backward compatibility
export const FINISH_PROMPTS = FINISH_TYPES;

// ═══════════════════════════════════════════════════════════════
// CLAUDE QA — Planning Brain
// ═══════════════════════════════════════════════════════════════

export interface JobBrief {
  status: "READY" | "NEEDS_USER_CONFIRMATION";
  work_area_description: string;
  scene_geometry?: {
    dimensions_estimate: string;
    slope: string;
    perspective: string;
  };
  boundaries?: {
    left: string;
    right: string;
    top: string;
    bottom: string;
  };
  preserve_zones: string[];
  risk_notes: string[];
  generation_prompt: string;
  quality_checks: string[];
}

export async function runQA(
  imageUrl: string,
  maskBase64: string,
  finishType: string,
  preserveGrassStrips: boolean = true,
  preserveStructures: boolean = true,
  customerNotes: string = ""
): Promise<JobBrief> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

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
          { type: "image", source: { type: "base64", media_type: "image/png", data: maskBase64.includes(",") ? maskBase64.split(",")[1] : maskBase64 } },
          { type: "text", text: userPrompt },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text?: string }> };
  const textBlock = data.content.find((block) => block.type === "text");
  if (!textBlock?.text) throw new Error("No text response from Anthropic");

  const cleaned = textBlock.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as JobBrief;
}

// ═══════════════════════════════════════════════════════════════
// FLUX.1 Fill — Inpainting (mask is source of truth)
// ═══════════════════════════════════════════════════════════════

async function callFluxFill(prompt: string, imageBase64: string, maskBase64: string): Promise<string> {
  const apiKey = process.env.BFL_API_KEY;
  if (!apiKey) throw new Error("BFL_API_KEY is not configured");

  // FLUX.1 Fill: black = preserve, white = inpaint
  // BFL API expects RAW base64 strings (no data URL prefix)
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

  const submitData = await submitResponse.json() as { id: string; polling_url: string };
  const pollingUrl = submitData.polling_url;

  // Poll for result (max 120 seconds)
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollResponse = await fetch(pollingUrl, { headers: { "x-key": apiKey } });
    if (!pollResponse.ok) continue;
    const pollData = await pollResponse.json() as { status: string; result?: { sample: string } };
    if (pollData.status === "Ready" && pollData.result?.sample) return pollData.result.sample;
    if (pollData.status === "Error" || pollData.status === "Failed") {
      throw new Error(`FLUX Fill generation failed`);
    }
  }
  throw new Error("FLUX Fill generation timed out after 120 seconds");
}

// ═══════════════════════════════════════════════════════════════
// GENERATE — Main generation function
// ═══════════════════════════════════════════════════════════════

export async function generateVisualisation(
  originalImageUrl: string,
  maskBase64: string,
  selectedFinish: string,
  generationPrompt?: string,
  customerNotes?: string
): Promise<{ url: string }> {
  const finish = FINISH_TYPES[selectedFinish] || FINISH_TYPES["plain"];

  // Build the prompt — prepend uniformity enforcement, then Claude's generation_prompt or fallback
  const uniformityPrefix = "Professional architectural photograph of a completed residential concrete installation. The ENTIRE marked area is now a single, continuous, uniformly finished surface. Every square inch shows consistent texture, color, and professional seal with no loose stones, no gravel, no unfinished patches, and no texture variation. ";
  const basePrompt = generationPrompt || `freshly completed ${finish.name.toLowerCase()} concrete surface, professionally installed. ${finish.prompt}. Seamlessly matching the perspective, lighting and shadows of the surrounding scene. Sharp straight formed edges at all boundaries.`;
  const customerContext = customerNotes ? ` Customer requirement: ${customerNotes}.` : "";
  const prompt = uniformityPrefix + basePrompt + customerContext + " Photorealistic finished job photograph, high resolution.";

  // Download original image and convert to base64
  const imgResp = await fetch(originalImageUrl);
  if (!imgResp.ok) throw new Error("Failed to fetch original image");
  const imgBuffer = Buffer.from(await imgResp.arrayBuffer());

  // Resize if needed (FLUX Fill has size limits)
  let imageBase64: string;
  const sizeKB = imgBuffer.length / 1024;
  if (sizeKB > 500) {
    const sharp = (await import('sharp')).default;
    const resizedBuffer = await sharp(imgBuffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    imageBase64 = resizedBuffer.toString('base64');
  } else {
    imageBase64 = imgBuffer.toString('base64');
  }

  // Call FLUX Fill — mask is the source of truth
  const generatedImageUrl = await callFluxFill(prompt, imageBase64, maskBase64);

  // Download result and store on S3 (BFL URLs are temporary)
  const imageResponse = await fetch(generatedImageUrl);
  if (!imageResponse.ok) throw new Error("Failed to download generated image from BFL");

  const resultBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : "jpg";

  const { url } = await storagePut(
    `visualiser/${Date.now()}-${selectedFinish}.${ext}`,
    resultBuffer,
    contentType
  );

  return { url };
}

// ═══════════════════════════════════════════════════════════════
// LEGACY COMPAT — analysePropertyPhoto (still used by old route)
// ═══════════════════════════════════════════════════════════════

export async function analysePropertyPhoto(imageUrl: string, selectedFinish: string): Promise<{
  sceneDescription: string;
  editPrompt: string;
  areaIdentified: string;
}> {
  const finish = FINISH_TYPES[selectedFinish] || FINISH_TYPES["plain"];
  return {
    sceneDescription: "Legacy analysis - please use the new mask-first workflow",
    areaIdentified: "User-drawn mask area",
    editPrompt: `Brand new ${finish.name.toLowerCase()} concrete surface. ${finish.prompt}`,
  };
}
