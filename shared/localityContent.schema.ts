import { z } from "zod";

export const localityActionSchema = z.enum(["create", "upgrade"]);
export const localityRegionSchema = z.enum([
  "Brisbane",
  "Gold Coast",
  "Ipswich",
  "Logan",
  "Moreton Bay",
]);

export const localityServiceSchema = z.object({
  name: z.string().min(3),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(45),
});

export const localityFaqSchema = z.object({
  question: z.string().min(12),
  answer: z.string().min(45),
});

export const localityContentRecordSchema = z.object({
  sequence: z.number().int().min(1).max(20),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  locality: z.string().min(3),
  postcode: z.string().regex(/^\d{4}$/),
  lga: z.string().min(5),
  region: localityRegionSchema,
  action: localityActionSchema,
  title: z.string().min(30).max(80),
  description: z.string().min(90).max(180),
  h1: z.string().min(24).max(100),
  intro: z.string().min(110),
  practicalConsiderations: z.string().min(140),
  localityContext: z.object({
    claimDate: z.string().regex(/^\d{4}(-\d{2})?$/),
    attribution: z.string().min(100),
    sourceLabel: z.string().min(3),
    sourceUrls: z.array(z.string().url()).min(1),
  }),
  services: z.array(localityServiceSchema).min(3).max(5),
  faqs: z.array(localityFaqSchema).min(3).max(5),
  regionalHub: z.object({
    label: z.string().min(3),
    path: z.string().regex(/^\/areas#[a-z0-9-]+$/),
  }),
  nearbyLocalitySlugs: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(2).max(6),
  verifiedProofIds: z.array(z.string().min(1)).max(3),
  evidenceNotes: z.string().min(30),
});

export type LocalityContentRecord = z.infer<typeof localityContentRecordSchema>;

export function validateLocalityContent(input: unknown): LocalityContentRecord[] {
  const records = z.array(localityContentRecordSchema).length(20).parse(input);
  const slugs = records.map(record => record.slug);
  if (new Set(slugs).size !== records.length) {
    throw new Error("Batch 1 locality slugs must be unique");
  }
  const sequences = records.map(record => record.sequence);
  if (new Set(sequences).size !== records.length) {
    throw new Error("Batch 1 locality sequence numbers must be unique");
  }
  return records;
}
