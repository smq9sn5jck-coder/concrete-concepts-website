/**
 * Construction Timelapse Generator
 * 
 * Generates 5 keyframe images showing the construction stages of a concrete job:
 * 1. Existing ground (original photo — no generation needed)
 * 2. Excavated — dirt/soil exposed, ground dug out
 * 3. Formed — timber formwork/boxing in place
 * 4. Freshly poured — wet concrete just placed
 * 5. Finished — final cured concrete with selected finish
 * 
 * Uses FLUX.1 Fill inpainting with stage-specific prompts.
 * Only the masked area changes — everything else stays the same.
 */

import { storagePut } from "./storage";
import { FINISH_TYPES } from "./visualiser";

// ═══════════════════════════════════════════════════════════════
// CONSTRUCTION STAGES — prompts for each phase
// ═══════════════════════════════════════════════════════════════

export interface TimelapseStage {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

function getTimelapseStages(finishType: string, customerNotes?: string): TimelapseStage[] {
  const finish = FINISH_TYPES[finishType] || FINISH_TYPES["plain"];

  return [
    {
      id: "existing",
      label: "Existing",
      description: "Current state of your property",
      prompt: "", // No generation needed — use original photo
    },
    {
      id: "excavated",
      label: "Excavated",
      description: "Ground excavated and prepared",
      prompt: `Professional photograph of a residential construction site showing freshly excavated ground. The area has been dug out to a depth of approximately 150mm, revealing compacted brown earth and subsoil. Clean straight excavation edges along all boundaries. Slight moisture visible on the exposed soil. Small mounds of removed material visible at the edges. The excavation is level and professionally done with a slight fall for drainage. Natural ambient lighting matching the surrounding scene. Photorealistic construction site photograph, high resolution.`,
    },
    {
      id: "formed",
      label: "Formed",
      description: "Timber formwork set in place",
      prompt: `Professional photograph of a residential concrete construction site with timber formwork (boxing) set in place. Clean straight pine timber boards (100mm x 25mm) held in place with timber pegs driven into the ground at regular intervals. The formwork creates clean straight edges defining the exact shape of the future concrete slab. Inside the forms, compacted crushed rock base (blue metal) is visible, levelled and ready for concrete. Steel reinforcement mesh (SL72) visible sitting on bar chairs above the base. The formwork is level and professionally installed with neat corners. Natural ambient lighting matching the surrounding scene. Photorealistic construction site photograph, high resolution.`,
    },
    {
      id: "poured",
      label: "Just Poured",
      description: "Fresh wet concrete placed",
      prompt: `Professional photograph of freshly poured wet concrete filling the formed area. The concrete is still wet and dark grey with a smooth but slightly textured surface from initial screeding. Visible moisture sheen on the surface. The wet concrete is level with the top of the timber formwork. A few subtle trowel marks visible from the initial levelling pass. The concrete has a uniform dark wet appearance throughout. Timber formwork still visible at the edges containing the wet concrete. Natural ambient lighting matching the surrounding scene. Photorealistic construction site photograph, high resolution.`,
    },
    {
      id: "finished",
      label: "Finished",
      description: `Completed ${finish.name} surface`,
      prompt: `Professional architectural photograph of a completed residential concrete installation. The ENTIRE area is now a single, continuous, uniformly finished surface. ${finish.prompt}. Every square inch shows consistent texture, color, and professional seal. Sharp straight formed edges at all boundaries. The concrete is fully cured and sealed, looking brand new and professionally completed. ${customerNotes ? `Customer notes: ${customerNotes}.` : ""} Photorealistic finished job photograph, high resolution.`,
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// FLUX.1 Fill — Inpainting for each stage
// ═══════════════════════════════════════════════════════════════

async function callFluxFillForStage(prompt: string, imageBase64: string, maskBase64: string): Promise<string> {
  const apiKey = process.env.BFL_API_KEY;
  if (!apiKey) throw new Error("BFL_API_KEY is not configured");

  const cleanImage = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
  const cleanMask = maskBase64.includes(",") ? maskBase64.split(",")[1] : maskBase64;

  const body = {
    prompt,
    image: cleanImage,
    mask: cleanMask,
    steps: 28, // Slightly fewer steps for speed (still good quality)
    guidance: 20, // Slightly lower guidance for more natural variation
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

  // Poll for result (max 90 seconds per image)
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollResponse = await fetch(pollingUrl, { headers: { "x-key": apiKey } });
    if (!pollResponse.ok) continue;
    const pollData = await pollResponse.json() as { status: string; result?: { sample: string } };
    if (pollData.status === "Ready" && pollData.result?.sample) return pollData.result.sample;
    if (pollData.status === "Error" || pollData.status === "Failed") {
      throw new Error(`FLUX Fill generation failed for timelapse stage`);
    }
  }
  throw new Error("FLUX Fill timelapse stage timed out");
}

// ═══════════════════════════════════════════════════════════════
// GENERATE TIMELAPSE — Produces array of stage image URLs
// ═══════════════════════════════════════════════════════════════

export interface TimelapseResult {
  stages: Array<{
    id: string;
    label: string;
    description: string;
    imageUrl: string;
  }>;
}

export async function generateTimelapse(
  originalImageUrl: string,
  maskBase64: string,
  selectedFinish: string,
  customerNotes?: string
): Promise<TimelapseResult> {
  const stages = getTimelapseStages(selectedFinish, customerNotes);

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

  const results: TimelapseResult["stages"] = [];

  // Stage 1: Existing — just use the original image URL directly
  results.push({
    id: stages[0].id,
    label: stages[0].label,
    description: stages[0].description,
    imageUrl: originalImageUrl,
  });

  // Stages 2-5: Generate each via FLUX Fill (sequentially to avoid rate limits)
  for (let i = 1; i < stages.length; i++) {
    const stage = stages[i];

    try {
      const generatedImageUrl = await callFluxFillForStage(
        stage.prompt,
        imageBase64,
        maskBase64
      );

      // Download and store on S3 (BFL URLs are temporary)
      const imageResponse = await fetch(generatedImageUrl);
      if (!imageResponse.ok) throw new Error(`Failed to download stage ${stage.id} image`);

      const resultBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
      const ext = contentType.includes("png") ? "png" : "jpg";

      const { url } = await storagePut(
        `timelapse/${Date.now()}-${stage.id}.${ext}`,
        resultBuffer,
        contentType
      );

      results.push({
        id: stage.id,
        label: stage.label,
        description: stage.description,
        imageUrl: url,
      });
    } catch (err: any) {
      console.error(`[Timelapse] Stage ${stage.id} failed:`, err.message);
      // If a middle stage fails, skip it but continue with the rest
      // The frontend will handle gaps gracefully
    }
  }

  // Must have at least 3 stages (existing + 2 generated) to be useful
  if (results.length < 3) {
    throw new Error("Timelapse generation failed — too few stages completed successfully");
  }

  return { stages: results };
}
