import { z } from "zod";
import {
  localityContentRecordSchema,
  type LocalityContentRecord,
} from "./localityContent.schema";
import { BATCH_ONE_LOCALITY_BY_SLUG } from "./localityContent";

const DRIVEWAYS = {
  name: "Concrete driveways",
  slug: "concrete-driveways-brisbane",
  description: "Driveway replacements and new driveway pours planned around access, levels, drainage and the finish selected for the property.",
};
const SLABS = {
  name: "Concrete slabs",
  slug: "concrete-slabs-brisbane",
  description: "Shed, garage and extension slabs assessed against the proposed use, site preparation, reinforcement and engineering information.",
};
const EXPOSED = {
  name: "Exposed aggregate",
  slug: "exposed-aggregate-brisbane",
  description: "Decorative exposed aggregate for suitable driveways and outdoor areas, with mix, edge and surrounding-surface choices reviewed together.",
};
const PATIOS = {
  name: "Concrete patios",
  slug: "concrete-patios-brisbane",
  description: "Outdoor slabs and entertaining areas planned around door thresholds, falls, drainage, adjoining landscaping and the intended finish.",
};
const RETAINING = {
  name: "Retaining walls",
  slug: "retaining-walls-brisbane",
  description: "Retaining-wall enquiries reviewed for height, boundaries, drainage, access and any engineering or approval requirements.",
};
const EXCAVATION = {
  name: "Site excavation",
  slug: "excavation-brisbane",
  description: "Site preparation and excavation considered with spoil removal, access limits, underground services and the planned concrete scope.",
};
const POOLS = {
  name: "Pool surrounds",
  slug: "pool-surrounds-brisbane",
  description: "Pool surrounds assessed for access, drainage, coping interfaces and a finish appropriate to a frequently wet outdoor area.",
};

export const southsideReleaseActionSchema = z.enum(["retain", "upgrade", "create"]);
export type SouthsideReleaseAction = z.infer<typeof southsideReleaseActionSchema>;
export type SouthsideLocalityRecord = LocalityContentRecord & {
  releaseAction: SouthsideReleaseAction;
};

const southsideLocalityRecordSchema = localityContentRecordSchema.extend({
  releaseAction: southsideReleaseActionSchema,
});

const records: SouthsideLocalityRecord[] = [
  {
    ...BATCH_ONE_LOCALITY_BY_SLUG.murarrie,
    releaseAction: "retain",
  },
  {
    sequence: 1,
    slug: "wynnum",
    locality: "Wynnum",
    postcode: "4178",
    lga: "Brisbane City",
    region: "Brisbane",
    action: "upgrade",
    releaseAction: "upgrade",
    title: "Concreting Wynnum | Driveways & Outdoor Concrete | CCG",
    description: "Plan a Wynnum driveway, patio, path or pool surround with a detailed review of access, existing surfaces, drainage, levels and finish needs.",
    h1: "Residential Concreting in Wynnum",
    intro: "Wynnum concrete enquiries can involve front driveways, side paths and outdoor areas that connect with established homes, gardens or pool edges. CCG begins with the intended use, dimensions and surrounding surfaces before preparing a detailed scope for the address.",
    practicalConsiderations: "The route from the street to the work area, existing thresholds, drainage points and surfaces that must remain protected should be recorded early. For outdoor and frequently wet areas, finish selection needs to be considered alongside falls, cleaning preferences and connections to adjoining materials.",
    localityContext: {
      claimDate: "2026-06",
      attribution: "Brisbane City Council's Wynnum Centre Suburban Renewal Precinct page, updated for the amendment effective in June 2026, lists the precinct in Wynnum and the Wynnum Manly Ward. This is locality context only and does not describe CCG work or any customer property.",
      sourceLabel: "Brisbane City Council — Wynnum Centre Suburban Renewal Precinct",
      sourceUrls: ["https://www.brisbane.qld.gov.au/about-council/council-projects/wynnum-centre-suburban-renewal-precinct"],
    },
    services: [DRIVEWAYS, PATIOS, POOLS, EXPOSED],
    faqs: [
      { question: "What information helps with a Wynnum driveway quote?", answer: "Include approximate dimensions, the current surface, garage and street connections, access limits, drainage points and the preferred finish. Photos can help identify details for site review." },
      { question: "Can an outdoor area and path be reviewed together?", answer: "Yes. Describing each area and how they connect helps the team consider level transitions, drainage routes, preparation access and a coordinated finish." },
      { question: "Does the Wynnum locality source determine my concrete design?", answer: "No. Council information is background context only. The scope depends on the actual address, dimensions, intended use, existing conditions and any relevant approvals." },
    ],
    regionalHub: { label: "Brisbane service areas", path: "/areas#brisbane" },
    nearbyLocalitySlugs: ["cannon-hill", "tingalpa", "manly", "lota"],
    verifiedProofIds: [],
    evidenceNotes: "Keep the council precinct reference separate from CCG services and from site-specific access, drainage or construction conclusions.",
  },
  {
    sequence: 2,
    slug: "cannon-hill",
    locality: "Cannon Hill",
    postcode: "4170",
    lga: "Brisbane City",
    region: "Brisbane",
    action: "upgrade",
    releaseAction: "upgrade",
    title: "Concreting Cannon Hill | Residential Site Review | CCG",
    description: "Prepare a Cannon Hill concrete enquiry for a driveway, slab, path or patio with practical detail on removal, access, levels and drainage.",
    h1: "Concrete Projects for Cannon Hill Homes",
    intro: "Cannon Hill projects may involve replacing an older surface, completing an outdoor area or adding concrete around existing structures. CCG reviews what is already on site, how the work area can be reached and how the proposed surface will meet the home, street or garden.",
    practicalConsiderations: "Demolition and disposal access can differ from the route needed for concrete placement, so both should be described. Garage transitions, door clearances, service locations and stormwater paths also need to be considered before the preparation depth, reinforcement and finish are settled.",
    localityContext: {
      claimDate: "2021",
      attribution: "The Australian Bureau of Statistics 2021 Census QuickStats reports a median age of 34 years for Cannon Hill. This historical population statistic is locality context only and does not describe CCG work, service demand or the conditions of an individual property.",
      sourceLabel: "Australian Bureau of Statistics — 2021 Cannon Hill QuickStats",
      sourceUrls: ["https://abs.gov.au/census/find-census-data/quickstats/2021/SAL30519"],
    },
    services: [DRIVEWAYS, SLABS, PATIOS, EXCAVATION],
    faqs: [
      { question: "Can existing concrete removal be included in a Cannon Hill quote?", answer: "Yes. Identify the area to remove, thickness if known, reinforcement, disposal route and nearby surfaces or structures that need protection." },
      { question: "What should be checked where a driveway meets a garage?", answer: "The existing threshold, garage floor, street connection, grade changes and drainage should be reviewed together so the proposed levels suit the individual site." },
      { question: "Does the Census information describe local concrete demand?", answer: "No. The Census figure is included as dated locality context only. It does not show CCG activity or determine the scope for a customer address." },
    ],
    regionalHub: { label: "Brisbane service areas", path: "/areas#brisbane" },
    nearbyLocalitySlugs: ["murarrie", "morningside", "carina", "camp-hill", "tingalpa"],
    verifiedProofIds: [],
    evidenceNotes: "Use the ABS median-age figure only as historical locality context; do not infer property type, work volume or CCG experience from it.",
  },
  {
    sequence: 3,
    slug: "norman-park",
    locality: "Norman Park",
    postcode: "4170",
    lga: "Brisbane City",
    region: "Brisbane",
    action: "create",
    releaseAction: "create",
    title: "Concreting Norman Park | Driveways, Paths & Patios | CCG",
    description: "Plan a Norman Park driveway, path, patio or slab with a property-specific review of access, existing levels, drainage and connections.",
    h1: "Residential Concreting in Norman Park",
    intro: "A useful Norman Park concrete quote begins with the actual area and what it needs to connect to, whether that is a garage, entry path, outdoor living space or existing slab. CCG records dimensions, intended use, access and surrounding finishes before defining the work.",
    practicalConsiderations: "Side passages, steps, garden edges and completed surfaces can affect removal and placement options on an individual site. Door thresholds, boundary clearances and water movement should be checked before excavation, while structural slabs or retaining elements may require project-specific engineering information.",
    localityContext: {
      claimDate: "2021",
      attribution: "The Australian Bureau of Statistics 2021 Census records 6,842 people in the Norman Park Suburbs and Localities geography. This population figure is locality context only and does not describe CCG work, service demand or any condition at a customer property.",
      sourceLabel: "Australian Bureau of Statistics — 2021 Norman Park QuickStats",
      sourceUrls: ["https://www.abs.gov.au/census/find-census-data/quickstats/2021/SAL32164"],
    },
    services: [DRIVEWAYS, PATIOS, SLABS, RETAINING],
    faqs: [
      { question: "What details help with a Norman Park concrete quote?", answer: "Provide the address, approximate dimensions, intended use, current surface, access route, level changes, drainage points and photos of the area and its connections." },
      { question: "Can work beside an established home be assessed?", answer: "Yes. Door and weep-hole clearances, existing foundations, services, garden edges and surfaces that must remain protected should be documented for review." },
      { question: "Is every Norman Park block treated the same way?", answer: "No. Locality information cannot determine site conditions. Preparation, placement, drainage and any engineering needs are assessed for the individual property and proposed work." },
    ],
    regionalHub: { label: "Brisbane service areas", path: "/areas#brisbane" },
    nearbyLocalitySlugs: ["morningside", "camp-hill", "cannon-hill", "bulimba", "hawthorne"],
    verifiedProofIds: [],
    evidenceNotes: "The ABS population figure is background context only; it cannot be used as evidence of demand, CCG activity or property conditions.",
  },
  {
    sequence: 5,
    slug: "morningside",
    locality: "Morningside",
    postcode: "4170",
    lga: "Brisbane City",
    region: "Brisbane",
    action: "upgrade",
    releaseAction: "upgrade",
    title: "Concreting Morningside | Access & Drainage Planning | CCG",
    description: "Request a detailed Morningside concrete review covering driveways, paths, patios and slabs, with attention to access, levels and drainage.",
    h1: "Concrete Planning for Morningside Properties",
    intro: "Morningside enquiries often involve concrete that must fit around an occupied home, garden, fence line or earlier improvement. CCG starts by separating each work area, recording its intended use and identifying the connections that influence preparation and placement.",
    practicalConsiderations: "Restricted access, multiple small areas and nearby services can change how excavation, spoil removal and concrete placement are planned. New work also needs suitable clearances and falls at doors, garages, walls and garden boundaries rather than relying on assumptions about the wider suburb.",
    localityContext: {
      claimDate: "2021",
      attribution: "The Australian Bureau of Statistics 2021 Census QuickStats records 11,755 people for Morningside in its Suburbs and Localities geography. This Census context does not describe CCG work, service demand or any site-specific condition at a customer property.",
      sourceLabel: "Australian Bureau of Statistics — 2021 Morningside QuickStats",
      sourceUrls: ["https://www.abs.gov.au/census/find-census-data/quickstats/2021/SAL31922"],
    },
    services: [DRIVEWAYS, PATIOS, EXPOSED, EXCAVATION],
    faqs: [
      { question: "Can several Morningside concrete areas be quoted together?", answer: "Yes. List the dimensions and use of each area so access, excavation, drainage and level transitions can be reviewed as one coordinated scope." },
      { question: "What access details should be included for a side or rear area?", answer: "Measure the narrowest passage, note gates, steps and overhead limits, and include photos from the street to the proposed work area." },
      { question: "Does locality population information determine the job scope?", answer: "No. The Census figure is background only. The detailed scope depends on the property, intended use, measurements, current surfaces and relevant project information." },
    ],
    regionalHub: { label: "Brisbane service areas", path: "/areas#brisbane" },
    nearbyLocalitySlugs: ["murarrie", "cannon-hill", "camp-hill", "norman-park"],
    verifiedProofIds: [],
    evidenceNotes: "Do not turn the Census figure into a demand, project-count or first-party activity statement. Property conditions remain address-specific.",
  },
  {
    sequence: 6,
    slug: "tingalpa",
    locality: "Tingalpa",
    postcode: "4173",
    lga: "Brisbane City",
    region: "Brisbane",
    action: "upgrade",
    releaseAction: "upgrade",
    title: "Concreting Tingalpa | Slabs, Driveways & Paths | CCG",
    description: "Prepare a Tingalpa concrete enquiry with clear dimensions, intended use, access, ground information, levels and drainage for site review.",
    h1: "Residential Concrete Work in Tingalpa",
    intro: "A Tingalpa project can range from a driveway or path to a shed slab or outdoor area, but the correct preparation cannot be selected from the suburb name alone. CCG reviews the proposed use, dimensions, access and available site information before defining the scope.",
    practicalConsiderations: "For slabs and longer concrete runs, identify services, structures, ground disturbance, level changes and the route for equipment and concrete. Drainage and reinforcement requirements should be based on the actual site, intended loads and engineering information where relevant, not a suburb-wide soil assumption.",
    localityContext: {
      claimDate: "2021",
      attribution: "The Australian Bureau of Statistics 2021 Census QuickStats records 8,881 people for the Tingalpa Statistical Area Level 2. This broader statistical-area figure is locality context only and does not describe CCG work or conditions at an individual address.",
      sourceLabel: "Australian Bureau of Statistics — 2021 Tingalpa QuickStats",
      sourceUrls: ["https://abs.gov.au/census/find-census-data/quickstats/2021/301031018"],
    },
    services: [SLABS, DRIVEWAYS, EXCAVATION, PATIOS],
    faqs: [
      { question: "What information is useful for a Tingalpa slab enquiry?", answer: "Include the slab's intended use, dimensions, access, known services, current surface, level information and any engineering or building documentation already available." },
      { question: "Can reinforcement be selected from the suburb alone?", answer: "No. Reinforcement and preparation depend on the proposed structure, loads, design information and site conditions. They should be reviewed for the actual project." },
      { question: "How should a long path or driveway be described?", answer: "Provide overall dimensions, changes in width or grade, drainage points, street and building connections, and obstacles along the preparation and placement route." },
    ],
    regionalHub: { label: "Brisbane service areas", path: "/areas#brisbane" },
    nearbyLocalitySlugs: ["murarrie", "cannon-hill", "wynnum", "carina", "carindale"],
    verifiedProofIds: [],
    evidenceNotes: "The ABS SA2 is broader statistical context. Do not use it to infer soil, access, work type, demand or CCG activity at a specific address.",
  },
  {
    sequence: 7,
    slug: "camp-hill",
    locality: "Camp Hill",
    postcode: "4152",
    lga: "Brisbane City",
    region: "Brisbane",
    action: "upgrade",
    releaseAction: "upgrade",
    title: "Concreting Camp Hill | Levels, Access & Finishes | CCG",
    description: "Plan a Camp Hill driveway, path, patio or retaining enquiry with site-specific information about levels, access, drainage and finishes.",
    h1: "Concrete Projects for Camp Hill Homes",
    intro: "Camp Hill concrete work can involve visible street connections, outdoor living areas or changes between existing levels. CCG prepares a detailed quote from the proposed use, dimensions and surrounding structures rather than assuming one construction approach suits every address.",
    practicalConsiderations: "Driveway grades, retaining interfaces, door clearances and connections to existing paths should be measured together. Access for excavation and concrete placement may need a different plan from the finished layout, while drainage and finish choices should be checked against the property's actual levels and use.",
    localityContext: {
      claimDate: "2021",
      attribution: "The Australian Bureau of Statistics 2021 Census QuickStats records 12,145 people for the Camp Hill Statistical Area Level 2. This dated statistical-area figure is locality context only and does not establish CCG work or conditions at any customer property.",
      sourceLabel: "Australian Bureau of Statistics — 2021 Camp Hill QuickStats",
      sourceUrls: ["https://www.abs.gov.au/census/find-census-data/quickstats/2021/303011047"],
    },
    services: [DRIVEWAYS, EXPOSED, PATIOS, RETAINING],
    faqs: [
      { question: "What should be measured for a Camp Hill driveway enquiry?", answer: "Record length, width, grade changes, the garage and street connections, existing drainage and any sections that need removal before replacement." },
      { question: "Can different finishes be reviewed for an outdoor area?", answer: "Yes. The intended use, surrounding colours and materials, surface texture, drainage and maintenance preferences can be discussed before a finish is selected." },
      { question: "When should retaining or level changes receive extra review?", answer: "Boundaries, loads, drainage, wall height and nearby structures can affect the approach. Engineering or approval requirements must be considered for the actual proposal." },
    ],
    regionalHub: { label: "Brisbane service areas", path: "/areas#brisbane" },
    nearbyLocalitySlugs: ["carina", "cannon-hill", "morningside", "norman-park", "coorparoo"],
    verifiedProofIds: [],
    evidenceNotes: "The Census figure is context only. Remove all unaudited gallery, activity, popularity and capability statements from this locality route.",
  },
  {
    sequence: 8,
    slug: "carina",
    locality: "Carina",
    postcode: "4152",
    lga: "Brisbane City",
    region: "Brisbane",
    action: "upgrade",
    releaseAction: "upgrade",
    title: "Concreting Carina | Driveways, Patios & Slabs | CCG",
    description: "Request a detailed Carina concreting review for driveways, patios, slabs and paths, based on the site's access, levels and drainage.",
    h1: "Residential Concreting in Carina",
    intro: "Carina enquiries may involve replacing a front driveway, connecting paths around a home or adding an outdoor slab beside completed landscaping. CCG reviews each area, its intended use and the existing surfaces it must meet before preparing a detailed quote.",
    practicalConsiderations: "Removal access, service locations, garage and door thresholds, garden protection and stormwater routes should be identified before work is scoped. If several areas are planned together, their level transitions and construction sequence need to be considered so one surface does not create a problem for another.",
    localityContext: {
      claimDate: "2021",
      attribution: "The Australian Bureau of Statistics 2021 Census QuickStats identifies Carina as a Suburbs and Localities area and reports a median age of 37 years. This historical statistic is locality context only and does not describe CCG work or any individual property.",
      sourceLabel: "Australian Bureau of Statistics — 2021 Carina QuickStats",
      sourceUrls: ["https://www.abs.gov.au/census/find-census-data/quickstats/2021/SAL30538"],
    },
    services: [DRIVEWAYS, PATIOS, SLABS, EXPOSED],
    faqs: [
      { question: "Can an existing Carina driveway be assessed for replacement?", answer: "Yes. Include dimensions, the existing material, removal access, garage and street transitions, drainage concerns and the finish being considered." },
      { question: "What should be checked before adding paths around a home?", answer: "Door and weep-hole clearances, service points, gate movement, usable widths, drainage direction and connections to existing surfaces should all be reviewed." },
      { question: "Can driveway and patio areas be included in one quote?", answer: "Yes. Listing each area separately helps the team assess different preparation, access, finish and drainage requirements within one coordinated project scope." },
    ],
    regionalHub: { label: "Brisbane service areas", path: "/areas#brisbane" },
    nearbyLocalitySlugs: ["camp-hill", "morningside", "cannon-hill", "carindale", "coorparoo"],
    verifiedProofIds: [],
    evidenceNotes: "The ABS median-age statistic must remain dated locality context and cannot support claims about work volume, property types or CCG activity.",
  },
];

export function validateSouthsideLocalityContent(input: unknown): SouthsideLocalityRecord[] {
  const validated = z.array(southsideLocalityRecordSchema).length(8).parse(input);
  const slugs = validated.map(record => record.slug);
  if (new Set(slugs).size !== validated.length) {
    throw new Error("South-side locality slugs must be unique");
  }
  const sequences = validated.map(record => record.sequence);
  if (new Set(sequences).size !== validated.length) {
    throw new Error("South-side locality sequence numbers must be unique");
  }
  return validated;
}

export const SOUTHSIDE_LOCALITIES = validateSouthsideLocalityContent(records);
export const SOUTHSIDE_LOCALITY_BY_SLUG = Object.fromEntries(
  SOUTHSIDE_LOCALITIES.map(record => [record.slug, record]),
) as Record<string, SouthsideLocalityRecord>;
export const SOUTHSIDE_ROUTES = SOUTHSIDE_LOCALITIES.map(record => `/areas/${record.slug}`);
