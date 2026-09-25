import type { LocalityContentRecord } from "./localityContent.schema";

export const GOLD_COAST_OFFICIAL_RESOURCES = {
  driveways: {
    label: "City of Gold Coast — driveways and vehicular crossings",
    url: "https://www.goldcoast.qld.gov.au/Planning-building/Development-applications/DA-types/Driveways-vehicular-crossings",
    summary: "The City distinguishes a driveway on private land from a vehicular crossing on public land and provides a property-specific approval questionnaire. This is a customer resource, not CCG approval advice.",
  },
  retainingWalls: {
    label: "City of Gold Coast — retaining walls",
    url: "https://www.goldcoast.qld.gov.au/Planning-building/Building-applications/Domestic-building-works/Minor-domestic-building-works/Retaining-walls",
    summary: "The City lists several criteria that must all be met before a wall under 1 metre may avoid building approval. Height alone is not enough. This is a customer resource, not CCG approval or engineering advice.",
  },
  floodMaps: {
    label: "City of Gold Coast — flood maps",
    url: "https://www.goldcoast.qld.gov.au/Planning-building/Flood-maps",
    summary: "The City provides flood-risk and flood-depth mapping for awareness and planning. Mapping does not replace checks for the actual property or advice from the relevant professional.",
  },
  stormwater: {
    label: "City of Gold Coast — stormwater and sediment control",
    url: "https://www.goldcoast.qld.gov.au/Planning-building/Building-applications/Stormwater-and-sediment-control-on-building-sites",
    summary: "The City says site runoff must reach a lawful discharge point without adversely affecting surrounding land, and that homeowners share responsibility for erosion and sediment control.",
  },
  population: {
    label: "City of Gold Coast — population data",
    url: "https://www.goldcoast.qld.gov.au/About-our-city/Population-data",
    summary: "The City publishes population profiles and small-area mapping for community context. Population information does not indicate CCG project history or automatic service acceptance.",
  },
} as const;

export const GOLD_COAST_EXISTING_LOCALITIES = [
  { slug: "ormeau", name: "Ormeau" },
  { slug: "pimpama", name: "Pimpama" },
  { slug: "coomera", name: "Coomera" },
  { slug: "upper-coomera", name: "Upper Coomera" },
  { slug: "nerang", name: "Nerang" },
  { slug: "robina", name: "Robina" },
  { slug: "clear-island-waters", name: "Clear Island Waters" },
  { slug: "mermaid-waters", name: "Mermaid Waters" },
] as const;

export const GOLD_COAST_EXISTING_LOCALITY_SLUGS = GOLD_COAST_EXISTING_LOCALITIES.map(
  locality => locality.slug,
);

export const GOLD_COAST_COVERAGE_GROUPS = [
  {
    label: "Northern corridor",
    areas: ["Ormeau", "Pimpama", "Coomera", "Upper Coomera", "Helensvale", "Pacific Pines / Oxenford"],
  },
  {
    label: "Central corridor",
    areas: ["Molendinar", "Ashmore / Benowa", "Carrara / Nerang", "Robina", "Clear Island Waters", "Mermaid Waters"],
  },
] as const;

export interface GoldCoastServicePage {
  slug: string;
  serviceName: string;
  quoteService: "driveway" | "exposed-aggregate" | "patio" | "slab" | "retaining-wall";
  title: string;
  description: string;
  h1: string;
  intro: string;
  scope: readonly string[];
  quoteInputs: readonly string[];
  cautions: readonly string[];
  relatedLocalitySlugs: readonly string[];
  relatedServiceSlugs: readonly string[];
  resources: readonly (keyof typeof GOLD_COAST_OFFICIAL_RESOURCES)[];
}

export const GOLD_COAST_SERVICE_PAGES: readonly GoldCoastServicePage[] = [
  {
    slug: "driveways",
    serviceName: "Driveways",
    quoteService: "driveway",
    title: "Gold Coast Concrete Driveways | Detailed Quote Review | CCG",
    description: "Plan a North or Central Gold Coast driveway replacement, extension or access-preparation scope with property-specific crossing and drainage checks.",
    h1: "Concrete driveways for North + Central Gold Coast properties",
    intro: "CCG reviews residential driveway replacements, extensions and access preparation against the dimensions, existing surface, levels and intended vehicle use. The private driveway and the public-land vehicular crossing are separate parts of the route and may have different requirements.",
    scope: [
      "Replacement of suitable existing residential driveway areas, including removal details where known.",
      "Driveway extensions or additional private parking areas, subject to the property layout and relevant requirements.",
      "Preparation and concrete placement planning based on access, levels, sub-base needs and the selected finish.",
      "Clear separation between work on the private driveway and any public-land vehicular crossing work.",
    ],
    quoteInputs: [
      "Approximate length, width and a marked photo or sketch of the proposed area.",
      "Existing surface, removal needs, slope changes and garage or carport transitions.",
      "Street access, current crossing layout, drainage points and preferred finish.",
    ],
    cautions: [
      "A driveway is on private land; a vehicular crossing is on public land between the property boundary and road.",
      "City approval can apply to vehicular crossing work. The City questionnaire and current requirements should be checked for the address.",
      "Flood mapping, runoff paths, services and neighbouring levels can affect a property-specific scope.",
    ],
    relatedLocalitySlugs: ["ormeau", "coomera", "upper-coomera", "nerang"],
    relatedServiceSlugs: ["exposed-aggregate", "shed-garage-patio-slabs"],
    resources: ["driveways", "floodMaps", "stormwater"],
  },
  {
    slug: "exposed-aggregate",
    serviceName: "Exposed aggregate",
    quoteService: "exposed-aggregate",
    title: "Gold Coast Exposed Aggregate Concrete | Quote Review | CCG",
    description: "Compare exposed aggregate for suitable Gold Coast driveways, patios, paths and outdoor areas using site, drainage, edge and finish information.",
    h1: "Exposed aggregate for Gold Coast driveways and outdoor areas",
    intro: "Exposed aggregate can be considered for suitable driveways, patios, paths and outdoor areas. A useful quote identifies where the surface will be used, what it meets at each edge and how falls, drainage and expected wet use affect the selection.",
    scope: [
      "Suitable residential driveways and private parking areas.",
      "Patios, paths and outdoor areas where the finish is assessed against the intended use.",
      "Pool-surround enquiries reviewed with coping, drainage and wet-area considerations.",
      "Aggregate, colour and border choices considered with the surrounding property rather than in isolation.",
    ],
    quoteInputs: [
      "Photos of the work area and adjoining colours, materials, garden edges and structures.",
      "Dimensions, access route, existing surface and whether demolition is required.",
      "Wet-use areas, drainage points, preferred texture and any samples already shortlisted.",
    ],
    cautions: [
      "Finish suitability depends on use, texture, sealing approach, drainage and maintenance preferences.",
      "Pool edges and frequently wet areas need property-specific review; this page does not make a slip-rating or pool-certification claim.",
      "Driveway crossing and stormwater requirements should be checked separately where relevant.",
    ],
    relatedLocalitySlugs: ["pimpama", "coomera", "robina", "mermaid-waters"],
    relatedServiceSlugs: ["driveways", "patios-paths-pool-surrounds"],
    resources: ["driveways", "floodMaps", "stormwater"],
  },
  {
    slug: "patios-paths-pool-surrounds",
    serviceName: "Patios, paths and pool surrounds",
    quoteService: "patio",
    title: "Gold Coast Patios, Paths & Pool Surrounds | CCG",
    description: "Prepare a detailed North or Central Gold Coast quote for patios, paths and pool surrounds with access, levels, drainage and interface details.",
    h1: "Concrete patios, paths and pool surrounds on the Gold Coast",
    intro: "Patios, paths and pool surrounds connect doors, gardens, pool edges and existing hard surfaces. CCG reviews the proposed use, levels and access together so the quote can identify preparation, placement and finish inputs for the actual property.",
    scope: [
      "Residential patios and outdoor entertaining slabs.",
      "Side paths, garden access and connections between existing surfaces.",
      "Pool surrounds reviewed around coping interfaces, equipment zones, falls and drainage.",
      "Plain, coloured or exposed aggregate options where appropriate to the requested use.",
    ],
    quoteInputs: [
      "Separate dimensions for each patio, path or pool-side area.",
      "Door thresholds, weep holes, coping, drains and every adjoining surface.",
      "The narrowest access point, distance from the street and any finished landscaping to protect.",
    ],
    cautions: [
      "Falls and lawful stormwater discharge need to be considered for the individual site.",
      "Pool-related requirements and wet-area finish decisions can depend on the pool and property; CCG does not provide approval or certification advice on this page.",
      "Flood mapping is a planning resource and does not determine levels for a quote by itself.",
    ],
    relatedLocalitySlugs: ["robina", "clear-island-waters", "mermaid-waters", "nerang"],
    relatedServiceSlugs: ["exposed-aggregate", "shed-garage-patio-slabs"],
    resources: ["floodMaps", "stormwater"],
  },
  {
    slug: "shed-garage-patio-slabs",
    serviceName: "Shed, garage and patio slabs",
    quoteService: "slab",
    title: "Gold Coast Shed, Garage & Patio Slabs | CCG Quote",
    description: "Request a detailed Gold Coast slab review for a shed, garage or patio, including intended use, dimensions, site preparation, access and drainage.",
    h1: "Shed, garage and patio slabs for Gold Coast homes",
    intro: "A slab quote needs more than a square-metre figure. CCG reviews the intended structure or use, dimensions, site preparation, access and available engineering information before defining a suitable residential concrete scope.",
    scope: [
      "Suitable residential shed slabs based on the intended shed and supplied requirements.",
      "Garage or carport slab enquiries reviewed against vehicle use, levels and connected surfaces.",
      "Patio slabs coordinated with thresholds, posts, roof drainage and outdoor levels.",
      "Excavation, spoil, sub-base, reinforcement and placement access recorded as scope inputs.",
    ],
    quoteInputs: [
      "Plans or manufacturer information, intended use and confirmed slab dimensions.",
      "Existing ground condition, excavation needs, service locations and spoil-removal access.",
      "Engineering information where applicable, adjoining levels, drainage and concrete placement route.",
    ],
    cautions: [
      "Structural, engineering, building and siting requirements depend on the proposed structure and property.",
      "A quote review does not replace engineering, certification or approval advice.",
      "Stormwater from roofed structures and the surrounding site should be considered with the broader project design.",
    ],
    relatedLocalitySlugs: ["ormeau", "pimpama", "upper-coomera", "nerang"],
    relatedServiceSlugs: ["driveways", "patios-paths-pool-surrounds"],
    resources: ["stormwater", "floodMaps"],
  },
  {
    slug: "small-retaining-walls",
    serviceName: "Small retaining walls",
    quoteService: "retaining-wall",
    title: "Gold Coast Small Retaining Walls up to 1 m | CCG",
    description: "Screen a residential Gold Coast retaining-wall enquiry up to 1 metre for height, loads, boundaries, excavation, drainage and access requirements.",
    h1: "Residential retaining walls up to 1 metre on the Gold Coast",
    intro: "CCG's preview scope is limited to suitable residential retaining walls up to 1 metre. Every enquiry is screened for the actual height, loads, boundaries, nearby structures, services, excavation access and drainage before it can be considered for a detailed quote.",
    scope: [
      "Residential retaining-wall enquiries with a proposed maximum height of 1 metre.",
      "Replacement or new small-wall scopes where access, excavation and spoil handling can be assessed.",
      "Drainage, backfill, boundaries, nearby structures and loads recorded during initial screening.",
      "Related concrete areas considered only where the retaining and surface interfaces can be scoped clearly.",
    ],
    quoteInputs: [
      "Wall length, maximum and minimum height, photos from both sides and a simple property sketch.",
      "Distance to boundaries, buildings, pools, other walls, easements and known underground services.",
      "What the wall supports, access for excavation, spoil-removal route and current drainage conditions.",
    ],
    cautions: [
      "Being under 1 metre does not by itself remove approval, engineering, siting or site requirements.",
      "The City's published exemption criteria must all be considered, including loads, distances, services, easements, waterfront setbacks and structural requirements.",
      "Stormwater must not be concentrated onto neighbouring property. Relevant professionals or the City should be consulted for property-specific advice.",
    ],
    relatedLocalitySlugs: ["upper-coomera", "nerang", "robina", "clear-island-waters"],
    relatedServiceSlugs: ["driveways", "shed-garage-patio-slabs"],
    resources: ["retainingWalls", "stormwater", "floodMaps"],
  },
] as const;

export const GOLD_COAST_SERVICE_BY_SLUG = Object.fromEntries(
  GOLD_COAST_SERVICE_PAGES.map(page => [page.slug, page]),
) as Record<string, GoldCoastServicePage>;

const DRIVEWAYS = {
  name: "Concrete driveways",
  slug: "concrete-driveways-brisbane",
  description: "Residential driveway replacements, extensions and access preparation reviewed against levels, drainage and the private-driveway/public-crossing distinction.",
};
const SLABS = {
  name: "Concrete slabs",
  slug: "concrete-slabs-brisbane",
  description: "Shed, garage and patio slab enquiries assessed against intended use, preparation, reinforcement information, access and surrounding levels.",
};
const EXPOSED = {
  name: "Exposed aggregate",
  slug: "exposed-aggregate-brisbane",
  description: "Exposed aggregate considered for suitable residential driveways and outdoor areas with finish, edge, drainage and wet-use inputs documented.",
};
const PATIOS = {
  name: "Patios and outdoor concrete",
  slug: "concrete-patios-brisbane",
  description: "Patios and paths planned around thresholds, falls, drainage, access, landscaping and connections to existing surfaces.",
};
const RETAINING = {
  name: "Small retaining walls",
  slug: "retaining-walls-brisbane",
  description: "Suitable residential retaining-wall enquiries up to 1 metre screened for loads, boundaries, excavation, drainage and any approval or engineering requirements.",
};
const POOLS = {
  name: "Pool surrounds",
  slug: "pool-surrounds-brisbane",
  description: "Pool-surround enquiries reviewed for coping interfaces, access, drainage, expected wet use and the proposed finish without making a certification claim.",
};

export const GOLD_COAST_UPGRADE_LOCALITIES: readonly LocalityContentRecord[] = [
  {
    sequence: 1,
    slug: "coomera",
    locality: "Coomera",
    postcode: "4209",
    lga: "Gold Coast City",
    region: "Gold Coast",
    action: "upgrade",
    title: "Concreting Coomera | Residential Project Review | CCG",
    description: "Prepare a Coomera driveway, slab, patio, path or small retaining-wall enquiry with property-specific access, levels, drainage and scope details.",
    h1: "Residential concrete planning in Coomera",
    intro: "Coomera properties can present different access, level and project-stage conditions, so CCG begins with the actual work area rather than a suburb-wide assumption. A detailed quote records dimensions, existing surfaces, intended use and how the concrete connects to the home, street and drainage.",
    practicalConsiderations: "For driveway or side-access work, identify the current vehicular crossing, garage transition, gate widths and any completed landscaping. Slab and outdoor-area enquiries should include final levels, service locations and drainage points. City flood mapping can be checked as property context, but it does not replace site-specific level or design information.",
    localityContext: {
      claimDate: "2026-09",
      attribution: "City of Gold Coast publishes city-wide flood-risk and flood-depth maps that residents can use for planning awareness and property enquiries. The mapping is an official customer resource; it does not describe every Coomera site and is not evidence of CCG work in the locality.",
      sourceLabel: "City of Gold Coast flood maps",
      sourceUrls: [GOLD_COAST_OFFICIAL_RESOURCES.floodMaps.url],
    },
    services: [DRIVEWAYS, SLABS, PATIOS, RETAINING],
    faqs: [
      { question: "What helps with a Coomera driveway quote?", answer: "Provide dimensions, the existing surface, grade changes, garage transition, current crossing, drainage points, street access and photos from the road to the work area." },
      { question: "Can several post-build concrete areas be reviewed together?", answer: "Yes. List each driveway, path, patio or slab area separately so access, level transitions, preparation and drainage can be considered as one coordinated enquiry." },
      { question: "Does flood mapping decide the concrete scope?", answer: "No. City mapping is a customer planning resource. The scope still depends on the actual property, measurements, levels, drainage design and any professional or approval requirements." },
    ],
    regionalHub: { label: "Gold Coast service areas", path: "/areas#gold-coast" },
    nearbyLocalitySlugs: ["upper-coomera", "pimpama", "ormeau"],
    verifiedProofIds: [],
    evidenceNotes: "Use the official map only as conditional property context; make no claim about CCG work or uniform Coomera site conditions.",
  },
  {
    sequence: 2,
    slug: "nerang",
    locality: "Nerang",
    postcode: "4211",
    lga: "Gold Coast City",
    region: "Gold Coast",
    action: "upgrade",
    title: "Concreting Nerang | Slopes, Access & Drainage Review | CCG",
    description: "Plan a Nerang driveway, slab, outdoor area or residential retaining wall up to 1 metre with site-specific gradient, access and drainage details.",
    h1: "Concrete projects for Nerang properties",
    intro: "Nerang enquiries can involve flat, sloping or access-constrained work areas. CCG reviews the measured site, intended use and interfaces before preparing a detailed quote, with particular attention to driveway grades, excavation routes, drainage and nearby structures.",
    practicalConsiderations: "Show changes in gradient, the route for machinery or concrete placement and where water currently moves. Retaining-wall enquiries are limited to suitable residential walls up to 1 metre and still need screening for loads, boundaries, services, nearby structures, drainage and any property-specific approval or engineering requirements.",
    localityContext: {
      claimDate: "2026-09",
      attribution: "City of Gold Coast states that retaining walls under 1 metre avoid building approval only when all of its published criteria are met. The City page is a customer resource rather than CCG approval advice, and the requirements must be checked for the individual Nerang property.",
      sourceLabel: "City of Gold Coast retaining-wall guidance",
      sourceUrls: [GOLD_COAST_OFFICIAL_RESOURCES.retainingWalls.url],
    },
    services: [DRIVEWAYS, RETAINING, SLABS, EXPOSED],
    faqs: [
      { question: "What should be photographed on a sloping Nerang site?", answer: "Include views from the street, all grade changes, drainage paths, boundaries, nearby structures and the narrowest point on the access route to the work area." },
      { question: "Does CCG quote retaining walls over 1 metre here?", answer: "No. This preview scope is limited to suitable residential walls up to 1 metre, and approval, engineering, siting, drainage and other site requirements can still apply below that height." },
      { question: "Can the quote include excavation information?", answer: "Yes. Describe existing ground, likely cut, spoil-removal access, underground services and any surfaces or landscaping that need protection during the proposed work." },
    ],
    regionalHub: { label: "Gold Coast service areas", path: "/areas#gold-coast" },
    nearbyLocalitySlugs: ["robina", "clear-island-waters", "upper-coomera"],
    verifiedProofIds: [],
    evidenceNotes: "Keep the under-1-metre scope explicit and never imply that height alone removes approval, engineering or site requirements.",
  },
  {
    sequence: 3,
    slug: "ormeau",
    locality: "Ormeau",
    postcode: "4208",
    lga: "Gold Coast City",
    region: "Gold Coast",
    action: "upgrade",
    title: "Concreting Ormeau | Driveways, Slabs & Outdoor Areas | CCG",
    description: "Request an Ormeau concrete project review for driveways, slabs, patios or paths, using property-specific access, preparation, levels and drainage inputs.",
    h1: "Residential concrete work in Ormeau",
    intro: "For an Ormeau driveway, slab, patio or path, the useful starting point is a clear property brief: what is being added or replaced, how the area can be reached and how the proposed levels connect with the home, street, landscaping and existing drainage.",
    practicalConsiderations: "Driveway enquiries should distinguish the private driveway from the public-land vehicular crossing and identify whether either part changes. For slabs and outdoor areas, include intended use, plans where available, service locations and preparation needs. Site runoff and sediment controls should be considered with the actual work area.",
    localityContext: {
      claimDate: "2026-09",
      attribution: "City of Gold Coast explains that a private driveway ends at the property boundary while a vehicular crossing occupies public land to the road, and that crossing work can require approval. This official page is provided for customer review, not as CCG approval advice for an Ormeau address.",
      sourceLabel: "City of Gold Coast driveway and crossing guidance",
      sourceUrls: [GOLD_COAST_OFFICIAL_RESOURCES.driveways.url],
    },
    services: [DRIVEWAYS, SLABS, PATIOS, EXPOSED],
    faqs: [
      { question: "Is the driveway the same as the vehicular crossing?", answer: "No. The City describes the driveway as the private-land section and the vehicular crossing as the public-land section between the boundary and road. Address-specific requirements should be checked." },
      { question: "What information helps with an Ormeau slab enquiry?", answer: "Include dimensions, intended structure or use, plans or manufacturer details, current ground, excavation needs, access, service locations, drainage and any available engineering information." },
      { question: "Can CCG decide whether City approval is required?", answer: "No. CCG can record the proposed scope, while the City's official resources and relevant professionals should be used for property-specific approval or design advice." },
    ],
    regionalHub: { label: "Gold Coast service areas", path: "/areas#gold-coast" },
    nearbyLocalitySlugs: ["pimpama", "coomera", "upper-coomera"],
    verifiedProofIds: [],
    evidenceNotes: "Maintain the public/private land distinction and present the City link only as an official customer resource.",
  },
  {
    sequence: 4,
    slug: "robina",
    locality: "Robina",
    postcode: "4226",
    lga: "Gold Coast City",
    region: "Gold Coast",
    action: "upgrade",
    title: "Concreting Robina | Driveways & Outdoor Areas | CCG",
    description: "Prepare a Robina driveway, patio, path, pool-surround or slab enquiry with measured access, levels, drainage and connected-surface information.",
    h1: "Concrete planning for Robina homes",
    intro: "Robina concrete enquiries may connect driveways, outdoor living areas, paths, pools and established landscaping. CCG reviews the intended use and measured site, including access, existing surfaces, thresholds and drainage, before preparing a detailed quote scope.",
    practicalConsiderations: "For rear or pool-side areas, document the full route from the street, including gates, steps, overhead limits and surfaces to protect. Show coping, drains, door thresholds and adjoining finishes. Flood maps and stormwater guidance are useful property resources, but levels and requirements remain site-specific.",
    localityContext: {
      claimDate: "2026-09",
      attribution: "City of Gold Coast publishes flood maps for planning and risk awareness and explains that building-site runoff should reach a lawful discharge point without adverse off-site impacts. These official resources support customer checks only and do not describe CCG work or determine a Robina property's design.",
      sourceLabel: "City of Gold Coast property-planning resources",
      sourceUrls: [GOLD_COAST_OFFICIAL_RESOURCES.floodMaps.url, GOLD_COAST_OFFICIAL_RESOURCES.stormwater.url],
    },
    services: [PATIOS, POOLS, DRIVEWAYS, EXPOSED],
    faqs: [
      { question: "What helps with a Robina pool-surround enquiry?", answer: "Provide dimensions, pool coping and equipment details, drainage points, expected wet use, finish preference, access measurements and photos of every connected surface." },
      { question: "Can established landscaping affect the concrete scope?", answer: "Yes. Gates, gardens, walls and finished surfaces can change excavation and placement options, so the entire access route should be measured and photographed." },
      { question: "Are City resources the same as approval advice?", answer: "No. They are official customer resources for further checking. Approval, engineering, drainage and site requirements should be confirmed for the actual property with the relevant authority or professional." },
    ],
    regionalHub: { label: "Gold Coast service areas", path: "/areas#gold-coast" },
    nearbyLocalitySlugs: ["nerang", "clear-island-waters", "mermaid-waters"],
    verifiedProofIds: [],
    evidenceNotes: "Do not imply waterfront conditions, local project history or uniform flood status; all planning language remains property-specific.",
  },
];

export const GOLD_COAST_UPGRADE_BY_SLUG = Object.fromEntries(
  GOLD_COAST_UPGRADE_LOCALITIES.map(record => [record.slug, record]),
) as Record<string, LocalityContentRecord>;

export const GOLD_COAST_REVIEW_PATHS = [
  "/gold-coast-review",
  "/areas/gold-coast",
  ...GOLD_COAST_SERVICE_PAGES.map(page => `/gold-coast/${page.slug}`),
] as const;
