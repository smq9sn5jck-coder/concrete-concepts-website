import { SOUTHSIDE_LOCALITY_BY_SLUG } from "./southsideLocalityContent";

export type BaysideSoutheastService = {
  name: string;
  slug: string;
  description: string;
};

export type BaysideSoutheastLocalityRecord = {
  slug: string;
  locality: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  practicalSections: Array<{ heading: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  nearbyLocalitySlugs: string[];
  services: BaysideSoutheastService[];
};

export const BAYSIDE_SOUTHEAST_REVIEW_PATH = "/bayside-southeast-review";
export const BAYSIDE_SOUTHEAST_SIMILARITY_CORPUS_VERSION = "bayside-southeast-v1";
export const BAYSIDE_SOUTHEAST_SERVICE_SCOPE_SUMMARY = "The existing concrete service range includes driveways, exposed aggregate, patios, paths, pool surrounds, shed, garage, patio, house and suitable extension slabs, footings, concrete steps, associated preparation, crossovers, small retaining-wall enquiries and suitable builder or commercial concrete packages. The practical scope for each property depends on the actual address, documentation, access and programme.";

const SERVICES: BaysideSoutheastService[] = [
  {
    name: "Concrete driveways",
    slug: "concrete-driveways-brisbane",
    description: "New and replacement driveways considered with access, existing levels, drainage, street and garage connections, and the selected finish.",
  },
  {
    name: "Exposed aggregate",
    slug: "exposed-aggregate-brisbane",
    description: "Exposed aggregate for suitable driveways and outdoor areas, reviewed with edge details, adjoining materials, intended use and maintenance preferences.",
  },
  {
    name: "Concrete patios",
    slug: "concrete-patios-brisbane",
    description: "Patios and outdoor slabs planned around thresholds, falls, drainage, access and how they connect to completed landscaping or paths.",
  },
  {
    name: "Concrete slabs",
    slug: "concrete-slabs-brisbane",
    description: "Suitable house, extension, garage and patio slab enquiries assessed against use, dimensions, preparation, reinforcement and available engineering information.",
  },
  {
    name: "Shed slabs",
    slug: "shed-slabs-brisbane",
    description: "Shed and garage slab scopes reviewed with the proposed structure, dimensions, access, service locations and relevant project documentation.",
  },
  {
    name: "Pool surrounds",
    slug: "pool-surrounds-brisbane",
    description: "Pool surrounds considered with coping interfaces, drainage, wet-area use, access and the connection to nearby surfaces.",
  },
  {
    name: "Site preparation",
    slug: "excavation-brisbane",
    description: "Associated preparation and excavation considered with removal access, spoil handling, underground services and the planned concrete scope.",
  },
  {
    name: "Crossovers",
    slug: "crossover-permits-brisbane",
    description: "Crossover-related concrete planning reviewed against the actual street interface, levels, drainage and any approval requirements for the property.",
  },
  {
    name: "Retaining walls",
    slug: "retaining-walls-brisbane",
    description: "Small retaining-wall enquiries within CCG's established up-to-one-metre scope are reviewed for height, loading, drainage, access, engineering and approvals.",
  },
];

const reviewedWynnum = SOUTHSIDE_LOCALITY_BY_SLUG.wynnum;
const reviewedCannonHill = SOUTHSIDE_LOCALITY_BY_SLUG["cannon-hill"];

const records: BaysideSoutheastLocalityRecord[] = [
  {
    slug: "wynnum",
    locality: "Wynnum",
    title: "Concreting Wynnum | Driveways, Patios & Slabs | CCG",
    description: "Plan a Wynnum driveway replacement, patio, path, pool surround or slab with property-specific checks for removal, access, drainage and connections.",
    h1: "Concrete Planning for Wynnum Properties",
    intro: `${reviewedWynnum.intro} For replacement driveways and connected outdoor areas, the useful next step is to separate what will be removed from the surfaces that need to remain, then describe the proposed concrete work in the existing five-step quote.`,
    practicalSections: [
      {
        heading: "Replacing a driveway and joining outdoor areas",
        body: "Record the current surface, approximate dimensions, garage and street connections, and any paths, patios or garden edges that meet the work. Removal, disposal and new-concrete placement can require different access routes, so photographs from the street through to the work area help identify questions for the individual property.",
      },
      {
        heading: "Drainage, access and retaining interfaces",
        body: "Identify existing drainage points, visible level changes and areas that must stay protected before a scope is settled. If a small retaining wall is relevant, CCG's established scope is up to one metre; height does not remove the need to review loading, drainage, engineering, approvals, boundaries and access for the actual proposal.",
      },
    ],
    faqs: [
      {
        question: "What details help with a Wynnum driveway replacement enquiry?",
        answer: "Include approximate length and width, the current surface, garage and street connections, access constraints, drainage observations and the finish being considered. Photos can show the route to the work area and adjacent surfaces for a detailed site review.",
      },
      {
        question: "Can a driveway, path and patio be reviewed in one quote?",
        answer: "Yes. List each area separately with its intended use and dimensions where known. This helps identify how preparation, drainage, access and level transitions should be considered across the connected concrete areas.",
      },
      {
        question: "Do small retaining walls avoid engineering or approval checks?",
        answer: "No. CCG considers small retaining-wall enquiries within its established up-to-one-metre scope, but height alone does not determine the design. Loading, drainage, boundaries, access, site conditions, engineering and approval requirements remain property-specific.",
      },
    ],
    nearbyLocalitySlugs: ["manly", "wynnum-west", "manly-west", "lota", "tingalpa"],
    services: SERVICES,
  },
  {
    slug: "manly",
    locality: "Manly",
    title: "Concreting Manly | Driveways, Paths & Outdoor Areas | CCG",
    description: "Prepare a Manly concrete enquiry for driveways, paths, patios, pool surrounds or slabs with practical checks for surfaces, finishes, access and drainage.",
    h1: "Concrete Projects for Manly Homes",
    intro: "Manly concrete work can involve a driveway, path, patio or pool surround meeting an established home, landscaping or an earlier surface. CCG begins with the proposed use, dimensions and interfaces at the address, then uses the detailed quote to clarify access, drainage and the concrete scope rather than assuming one approach fits every property.",
    practicalSections: [
      {
        heading: "Existing surfaces and intended use",
        body: "Describe the material being replaced or joined, the edges that need to remain, and how each area will be used. A driveway, frequently wet pool surround and entertaining patio can have different practical requirements, so the selected finish, texture, cleaning preferences and surrounding materials should be considered together before the scope is defined.",
      },
      {
        heading: "Connections, maintenance and water movement",
        body: "Note door thresholds, garage entries, coping, paths, garden edges and visible drainage points so their level transitions can be reviewed for the individual property. Maintenance preferences are useful context, but any final finish, falls, preparation or drainage approach depends on the actual dimensions, condition, access and proposed work.",
      },
    ],
    faqs: [
      {
        question: "What information is useful for a Manly outdoor concrete quote?",
        answer: "Provide the address, approximate dimensions, intended use, current surface, nearby thresholds or pool coping, access route, drainage observations and finish preferences. These details help the team identify practical questions for the site review.",
      },
      {
        question: "Can different finishes be discussed before a concrete area is scoped?",
        answer: "Yes. The intended use, wet-area considerations, surrounding colours and materials, surface texture and cleaning preferences can be discussed before a finish is selected for the detailed concrete scope.",
      },
      {
        question: "Can an existing patio connect to new paths or a driveway?",
        answer: "It can be reviewed as a connected project. Listing each area and the surfaces it meets helps the team consider access, preparation, drainage routes and level transitions without assuming the existing construction suits the proposed work.",
      },
    ],
    nearbyLocalitySlugs: ["wynnum", "manly-west", "lota", "wynnum-west", "tingalpa"],
    services: SERVICES,
  },
  {
    slug: "cannon-hill",
    locality: "Cannon Hill",
    title: "Concreting Cannon Hill | Driveways, Slabs & Site Review | CCG",
    description: "Plan a Cannon Hill concrete package with property-specific detail on demolition, existing structures, garage transitions, services, access and drainage.",
    h1: "Concrete Planning for Cannon Hill Properties",
    intro: `${reviewedCannonHill.intro} A useful request also identifies whether the concrete is a replacement, a separate outdoor area, a garage or shed slab, or part of a suitable house or extension-slab scope, so the concrete component can be reviewed without representing an entire multi-trade project.`,
    practicalSections: [
      {
        heading: "Working beside existing structures",
        body: "Identify doors, garage floors, walls, fences, garden edges and finished surfaces close to the proposed work. Existing concrete removal, disposal and new placement may each have different practical constraints, while thresholds, clearances, drainage and the connection to existing surfaces need review for the particular address.",
      },
      {
        heading: "Services, demolition and concrete package scope",
        body: "Include known service locations, the current surface or slab, access widths and any drawings already available. For a suitable slab or footing enquiry, describe the proposed concrete scope, intended use and documentation rather than assuming structural requirements; engineering, approvals, reinforcement and site preparation are assessed from the actual project information.",
      },
    ],
    faqs: [
      {
        question: "Can removal of old concrete be included in a Cannon Hill enquiry?",
        answer: "Yes. Identify the area to remove, thickness or reinforcement if known, disposal access and nearby structures or finished surfaces that need protection. This gives useful context for reviewing demolition and the new concrete scope together.",
      },
      {
        question: "What should be checked at a garage transition?",
        answer: "The existing garage floor, doorway clearances, driveway levels, street connection and drainage should be described together. The suitable transition and falls depend on the individual property, measurements and planned work.",
      },
      {
        question: "Can a builder request a non-structural concrete package?",
        answer: "Yes. Builders and developers can use the detailed quote to provide the actual project address, useful concrete scope and indicative programme or site-ready timing. Structural documentation is relevant only where the proposed work requires it.",
      },
    ],
    nearbyLocalitySlugs: ["murarrie", "morningside", "tingalpa", "carina", "carindale"],
    services: SERVICES,
  },
  {
    slug: "mount-gravatt",
    locality: "Mount Gravatt",
    title: "Concreting Mount Gravatt | Driveways, Patios & Slabs | CCG",
    description: "Prepare a Mount Gravatt concrete enquiry with property-specific guidance on driveway grades, transitions, access, drainage and retaining interfaces.",
    h1: "Concrete Projects for Mount Gravatt Properties",
    intro: "Mount Gravatt enquiries can include driveway replacement, outdoor concrete, paths, patios, slabs and small retaining interfaces. CCG reviews the intended use, measurements, access and existing connections at the actual property before preparing a detailed concrete scope; a locality name does not determine terrain, drainage, soil or construction requirements.",
    practicalSections: [
      {
        heading: "Driveway grades and level transitions",
        body: "Provide the driveway length, width, visible grade changes, garage and street connections, current surface and drainage observations. Paths or patios that meet a house, gate or existing hard surface should be described separately so transitions, thresholds, preparation and water movement can be considered as one property-specific review.",
      },
      {
        heading: "Placement access and retaining interfaces",
        body: "The finished layout and the route needed for excavation, removal or concrete placement may not be the same. Record narrow points, steps, overhead restrictions and surfaces that need protection. Where small retaining is relevant, CCG's established up-to-one-metre guidance remains subject to site-specific loading, drainage, engineering, approvals and access review.",
      },
    ],
    faqs: [
      {
        question: "What should be measured for a Mount Gravatt driveway quote?",
        answer: "Include approximate length and width, garage and street transitions, visible level changes, current surface, drainage observations, access constraints and any section proposed for removal. Photos help clarify the work area and route from the street.",
      },
      {
        question: "Can a patio or path be planned around existing level changes?",
        answer: "Yes. Describe the intended use, dimensions, doors, gates, existing surfaces and drainage points. The detailed review considers the actual transitions and access rather than making assumptions from the suburb or a general site description.",
      },
      {
        question: "Does a retaining interface mean the whole proposal is within one trade?",
        answer: "Not necessarily. CCG quotes its concrete component. Retaining, engineering, approvals, drainage, access and any other trade work are considered against the actual scope and project information rather than treated as a universal package.",
      },
    ],
    nearbyLocalitySlugs: ["mansfield", "wishart", "carindale", "holland-park", "eight-mile-plains"],
    services: SERVICES,
  },
  {
    slug: "mansfield",
    locality: "Mansfield",
    title: "Concreting Mansfield | Driveways, Slabs & Outdoor Work | CCG",
    description: "Plan a Mansfield concrete project across driveways, slabs, paths and outdoor areas with clear preparation responsibilities, work areas, access and sequence.",
    h1: "Coordinated Concrete Planning for Mansfield Properties",
    intro: "Mansfield projects may include a driveway, slab, path, patio or several separate concrete areas around an established or new home. CCG uses the existing detailed quote to understand each area, its intended use, access and connection to the property, so the concrete component can be assessed in a practical construction sequence.",
    practicalSections: [
      {
        heading: "Separate work areas and preparation responsibilities",
        body: "List each driveway, path, slab, patio or outdoor area with dimensions where known, its current surface and the connections it must make. Where builders, owners or other trades have separate responsibilities, identify what is already complete, what documentation is available and which preparation or drainage items need clarification before concrete work is scoped.",
      },
      {
        heading: "Construction sequence and workable access",
        body: "Describe the route from the street, gates, steps, overhead constraints, completed surfaces and the timing of surrounding work. A driveway, slab and outdoor area may need to be reviewed in a sequence that protects access and completed finishes, while final levels, services and drainage remain matters for the actual address and proposal.",
      },
    ],
    faqs: [
      {
        question: "Can several Mansfield concrete areas be considered in one detailed quote?",
        answer: "Yes. Identify each area separately with its intended use, approximate dimensions, existing surface, access and the surfaces it will connect to. This helps review preparation, placement, drainage and sequence as a coordinated concrete scope.",
      },
      {
        question: "What should a builder include for a concrete package review?",
        answer: "Provide the actual project street address, useful concrete scope, available drawings or documents, access details and indicative programme or site-ready timing. Planning or not-yet-fixed timing can be stated honestly rather than replaced with a fabricated date.",
      },
      {
        question: "Can CCG quote an entire multi-trade extension project?",
        answer: "CCG quotes its concrete component rather than an entire multi-trade extension. Suitable house or extension-slab concrete can be reviewed with the relevant plans and information, while availability and serviceability depend on the address, scope, documentation, access and programme.",
      },
    ],
    nearbyLocalitySlugs: ["mount-gravatt", "wishart", "carindale", "holland-park", "eight-mile-plains"],
    services: SERVICES,
  },
];

export const BAYSIDE_SOUTHEAST_LOCALITIES = records;
export const BAYSIDE_SOUTHEAST_BY_SLUG = Object.fromEntries(
  BAYSIDE_SOUTHEAST_LOCALITIES.map(record => [record.slug, record]),
) as Record<string, BaysideSoutheastLocalityRecord>;
export const BAYSIDE_SOUTHEAST_ROUTES = BAYSIDE_SOUTHEAST_LOCALITIES.map(record => `/areas/${record.slug}`);
export const BAYSIDE_SOUTHEAST_QUOTE_CONTEXT_TOKENS = BAYSIDE_SOUTHEAST_LOCALITIES.flatMap(record => [
  `bayside-${record.slug}-general`,
  `bayside-${record.slug}-homeowner`,
  `bayside-${record.slug}-builder`,
]);

const PLACE_NAMES = [
  ...BAYSIDE_SOUTHEAST_LOCALITIES.map(record => record.locality),
  "Wynnum West", "Manly West", "Lota", "Tingalpa", "Murarrie", "Morningside", "Carina", "Carindale", "Wishart", "Holland Park", "Eight Mile Plains",
];

export function normaliseBaysideSoutheastProse(text: string) {
  let normalised = text.normalize("NFKC").toLocaleLowerCase("en-AU");
  for (const placeName of PLACE_NAMES) {
    const escaped = placeName.normalize("NFKC").toLocaleLowerCase("en-AU").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    normalised = normalised.replace(new RegExp(`\\b${escaped}\\b`, "gu"), " ");
  }
  return normalised.replace(new RegExp("[^\\p{L}\\p{N}]+", "gu"), " ").trim().replace(/\s+/g, " ");
}

function candidateCorpus(record: BaysideSoutheastLocalityRecord) {
  return [
    record.intro,
    ...record.practicalSections.map(section => section.body),
    ...record.faqs.map(faq => faq.answer),
  ];
}

function fiveWordShingles(text: string) {
  const words = normaliseBaysideSoutheastProse(text).split(" ").filter(Boolean);
  const shingles = new Set<string>();
  for (let index = 0; index <= words.length - 5; index += 1) {
    shingles.add(words.slice(index, index + 5).join(" "));
  }
  return shingles;
}

export function getBaysideSoutheastSimilarityScore(
  left: BaysideSoutheastLocalityRecord,
  right: BaysideSoutheastLocalityRecord,
) {
  const leftShingles = fiveWordShingles(candidateCorpus(left).join(" "));
  const rightShingles = fiveWordShingles(candidateCorpus(right).join(" "));
  const union = new Set(Array.from(leftShingles).concat(Array.from(rightShingles)));
  if (union.size === 0) return 0;
  const intersection = Array.from(leftShingles).filter(shingle => rightShingles.has(shingle)).length;
  return intersection / union.size;
}

function hasIdenticalNormalisedLongParagraph(
  left: BaysideSoutheastLocalityRecord,
  right: BaysideSoutheastLocalityRecord,
) {
  const leftParagraphs = candidateCorpus(left)
    .map(normaliseBaysideSoutheastProse)
    .filter(paragraph => paragraph.split(" ").length >= 30);
  const rightParagraphs = new Set(candidateCorpus(right)
    .map(normaliseBaysideSoutheastProse)
    .filter(paragraph => paragraph.split(" ").length >= 30));
  return leftParagraphs.some(paragraph => rightParagraphs.has(paragraph));
}

for (let leftIndex = 0; leftIndex < BAYSIDE_SOUTHEAST_LOCALITIES.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < BAYSIDE_SOUTHEAST_LOCALITIES.length; rightIndex += 1) {
    const left = BAYSIDE_SOUTHEAST_LOCALITIES[leftIndex];
    const right = BAYSIDE_SOUTHEAST_LOCALITIES[rightIndex];
    if (hasIdenticalNormalisedLongParagraph(left, right)) {
      throw new Error(`Bayside Southeast duplicate paragraph: ${left.slug}/${right.slug}`);
    }
    if (getBaysideSoutheastSimilarityScore(left, right) >= 0.45) {
      throw new Error(`Bayside Southeast copy similarity exceeds limit: ${left.slug}/${right.slug}`);
    }
  }
}
