import { z } from "zod";
import { validateAustralianPhone } from "./leadValidation";

export const quoteServices = [
  "driveway",
  "slab",
  "patio",
  "pool-surround",
  "retaining-wall",
  "pathway",
  "exposed-aggregate",
  "stairs",
  "excavation",
  "crossover",
  "commercial",
  "other",
] as const;

export const quoteFinishes = ["plain", "coloured", "exposed", "stencilled", "not_sure"] as const;
export const quoteTimeframes = ["asap", "within_1_month", "one_to_three_months", "three_plus_months", "planning"] as const;

const optionalShortText = z.string().trim().max(500).optional().default("");
const optionalMeasurement = z.number().finite().positive().max(100_000).optional();

const photoSchema = z.object({
  url: z.string().url().refine((value) => value.startsWith("https://"), "Photo URL must use HTTPS"),
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]),
});

const measurementSchema = z
  .object({
    mode: z.enum(["dimensions", "area", "not_sure"]),
    lengthM: optionalMeasurement,
    widthM: optionalMeasurement,
    totalAreaM2: optionalMeasurement,
    separateAreaNotes: z.string().trim().max(1_500).optional().default(""),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "dimensions" && (!value.lengthM || !value.widthM)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [!value.lengthM ? "lengthM" : "widthM"],
        message: "Enter both length and width, or choose Not sure",
      });
    }
    if (value.mode === "area" && !value.totalAreaM2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["totalAreaM2"],
        message: "Enter the approximate total area, or choose Not sure",
      });
    }
  });

export const comprehensiveQuoteSchema = z
  .object({
    version: z.literal(1),
    contact: z.object({
      name: z.string().trim().min(2, "Full name is required").max(100),
      mobile: z.string().trim().min(1, "Mobile number is required").max(30),
      email: z.string().trim().email("Enter a valid email address").max(254),
      preferredContact: z.enum(["phone", "sms", "email"]),
      company: z.string().trim().max(150).optional().default(""),
    }),
    location: z.object({
      streetAddress: z.string().trim().max(250).optional().default(""),
      suburb: z.string().trim().min(2, "Suburb is required").max(120),
      postcode: z.string().trim().regex(/^\d{4}$/, "Enter a valid four-digit postcode"),
    }),
    scope: z.object({
      services: z.array(z.enum(quoteServices)).min(1, "Select at least one service").max(8),
      workType: z.enum(["new", "replacement", "extension", "repair", "not_sure"]),
      finish: z.enum(quoteFinishes),
      timeframe: z.enum(quoteTimeframes),
      description: z.string().trim().min(20, "Please add a useful description of the work").max(5_000),
    }),
    measurements: measurementSchema,
    siteConditions: z.object({
      existingConcreteRemoval: z.boolean().optional(),
      accessWidthM: optionalMeasurement,
      vehicleAccess: z.enum(["easy", "restricted", "no_vehicle", "not_sure"]).optional(),
      slope: z.enum(["flat", "slight", "steep", "not_sure"]).optional(),
      drainage: z.enum(["none_known", "existing_drain", "new_drainage_needed", "not_sure"]).optional(),
      pumpAccess: z.enum(["direct_truck", "pump_likely", "not_sure"]).optional(),
      knownServices: optionalShortText,
      approvalStatus: z.enum(["approved", "not_required", "not_started", "not_sure"]).optional(),
      specialRequirements: z.string().trim().max(1_500).optional().default(""),
    }),
    photos: z.array(photoSchema).max(8, "Upload no more than eight photos").default([]),
    consents: z.object({
      contact: z.literal(true, { message: "Contact consent is required" }),
      privacy: z.literal(true, { message: "Privacy acknowledgement is required" }),
      marketing: z.boolean().optional().default(false),
    }),
  })
  .superRefine((value, ctx) => {
    const phone = validateAustralianPhone(value.contact.mobile);
    if (!phone.valid || phone.kind !== "mobile") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contact", "mobile"],
        message: "Enter an Australian mobile number beginning with 04",
      });
    }
  });

export type ComprehensiveQuote = z.infer<typeof comprehensiveQuoteSchema>;

const serviceLabels: Record<(typeof quoteServices)[number], string> = {
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

const valueLabels: Record<string, string> = {
  phone: "Phone call",
  sms: "SMS",
  email: "Email",
  new: "New work",
  replacement: "Replacement",
  extension: "Extension",
  repair: "Repair",
  not_sure: "Not sure",
  plain: "Plain concrete",
  coloured: "Coloured concrete",
  exposed: "Exposed aggregate",
  stencilled: "Stencilled / stamped",
  asap: "ASAP — ready to go",
  within_1_month: "Within one month",
  one_to_three_months: "One to three months",
  three_plus_months: "Three or more months",
  planning: "Planning only",
  easy: "Easy vehicle access",
  restricted: "Restricted vehicle access",
  no_vehicle: "No vehicle access",
  flat: "Flat",
  slight: "Slight slope",
  steep: "Steep slope",
  none_known: "No known drainage",
  existing_drain: "Existing drain",
  new_drainage_needed: "New drainage may be needed",
  direct_truck: "Direct truck access",
  pump_likely: "Concrete pump likely",
  approved: "Approved",
  not_required: "Not required",
  not_started: "Not started",
};

const label = (value?: string) => (value ? valueLabels[value] ?? value : "Not provided");
const yesNoUnknown = (value?: boolean) => (value === undefined ? "Not provided" : value ? "Yes" : "No");

function normalizedMobile(value: string) {
  const result = validateAustralianPhone(value);
  return result.valid ? result.normalized : value.replace(/\D/g, "");
}

function measurementSummary(value: ComprehensiveQuote["measurements"]) {
  if (value.mode === "not_sure") return "Not sure — measure on site";
  if (value.mode === "area") return `${value.totalAreaM2} m² approximate total area`;
  const calculated = value.totalAreaM2 ?? Number(((value.lengthM ?? 0) * (value.widthM ?? 0)).toFixed(2));
  return `${value.lengthM} m × ${value.widthM} m (${calculated} m²)`;
}

export function getQuoteBriefSections(quote: ComprehensiveQuote) {
  const location = [quote.location.streetAddress, `${quote.location.suburb} QLD ${quote.location.postcode}`]
    .filter(Boolean)
    .join(", ");
  const photos = quote.photos.length
    ? quote.photos.map((photo, index) => `Photo ${index + 1}: ${photo.url}`).join("\n")
    : "No photos attached";

  return [
    {
      title: "CONTACT",
      lines: [
        `Name: ${quote.contact.name}`,
        `Mobile: ${normalizedMobile(quote.contact.mobile)}`,
        `Email: ${quote.contact.email}`,
        `Preferred contact: ${label(quote.contact.preferredContact)}`,
        `Company: ${quote.contact.company || "Not provided"}`,
      ],
    },
    {
      title: "SITE ADDRESS",
      lines: [
        `Address: ${location}`,
        `Street address: ${quote.location.streetAddress || "Not provided"}`,
        `Suburb: ${quote.location.suburb}`,
        `Postcode: ${quote.location.postcode}`,
      ],
    },
    {
      title: "JOB SCOPE",
      lines: [
        `Services: ${quote.scope.services.map((service) => serviceLabels[service]).join(", ")}`,
        `Work type: ${label(quote.scope.workType)}`,
        `Finish: ${label(quote.scope.finish)}`,
        `Timeframe: ${label(quote.scope.timeframe)}`,
        `Description: ${quote.scope.description}`,
      ],
    },
    {
      title: "MEASUREMENTS",
      lines: [
        `Measurements: ${measurementSummary(quote.measurements)}`,
        `Separate areas / notes: ${quote.measurements.separateAreaNotes || "Not provided"}`,
      ],
    },
    {
      title: "SITE CONDITIONS",
      lines: [
        `Existing concrete removal: ${yesNoUnknown(quote.siteConditions.existingConcreteRemoval)}`,
        `Access width: ${quote.siteConditions.accessWidthM ? `${quote.siteConditions.accessWidthM} m` : "Not provided"}`,
        `Vehicle access: ${label(quote.siteConditions.vehicleAccess)}`,
        `Slope: ${label(quote.siteConditions.slope)}`,
        `Drainage: ${label(quote.siteConditions.drainage)}`,
        `Concrete placement access: ${label(quote.siteConditions.pumpAccess)}`,
        `Known underground services: ${quote.siteConditions.knownServices || "Not provided"}`,
        `Council / body corporate approval: ${label(quote.siteConditions.approvalStatus)}`,
        `Special requirements: ${quote.siteConditions.specialRequirements || "Not provided"}`,
      ],
    },
    { title: "PHOTOS", lines: photos.split("\n") },
  ];
}

export function formatQuoteBriefText(quote: ComprehensiveQuote) {
  return getQuoteBriefSections(quote)
    .map((section) => `${section.title}\n${section.lines.join("\n")}`)
    .join("\n\n");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatQuoteBriefHtml(quote: ComprehensiveQuote) {
  return getQuoteBriefSections(quote)
    .map(
      (section) => `
        <div style="margin: 0 0 20px;">
          <h2 style="margin:0 0 8px;color:#D4A843;font-size:15px;letter-spacing:.08em;">${section.title}</h2>
          <div style="background:#242424;border-radius:6px;padding:12px 14px;color:#ffffff;line-height:1.6;white-space:pre-wrap;">${section.lines
            .map(escapeHtml)
            .join("<br>")}</div>
        </div>`
    )
    .join("");
}

export function toLegacyQuoteFields(quote: ComprehensiveQuote) {
  return {
    name: quote.contact.name,
    phone: normalizedMobile(quote.contact.mobile),
    email: quote.contact.email,
    suburb: `${quote.location.suburb} ${quote.location.postcode}`,
    service: quote.scope.services.map((service) => serviceLabels[service]).join(", "),
    details: formatQuoteBriefText(quote),
    photoUrls: quote.photos.map((photo) => photo.url),
  };
}
