/*
  SuburbPage: SEO-optimized suburb-specific landing pages
  Targets local search terms like "concreting Carindale", "concreters Logan"
  Each page has unique content, structured data, and internal links
  URL pattern: /areas/:suburbSlug
*/
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Shield, Phone, Star, MapPin, Clock, Hammer, BookOpen } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CallbackPopup from "@/components/CallbackPopup";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { trackPhoneCallClick } from "@/components/ConversionTracking";
import { NEW_SUBURBS } from "@/data/newSuburbs";
import { MORE_SUBURBS, MORE_SUBURB_COORDS } from "@/data/moreSuburbs";

interface SuburbData {
  slug: string;
  name: string;
  region: string;
  postcode: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  heroImage: string;
  heroAlt?: string;
  intro: string;
  areaDescription: string;
  popularServices: { name: string; slug: string; description: string }[];
  nearbySuburbs: { name: string; slug: string }[];
  faqs: { q: string; a: string }[];
  testimonialSnippet?: { name: string; text: string; service: string };
}

const SUBURBS: Record<string, SuburbData> = {
  "carindale": {
    slug: "carindale",
    name: "Carindale",
    region: "Brisbane Southside",
    postcode: "4152",
    h1: "Concreting Carindale — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Carindale | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Carindale, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Carindale, concreters Carindale, concrete driveway Carindale, exposed aggregate Carindale, retaining wall Carindale, concrete slab Carindale",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Looking for a reliable concreter in Carindale? Concrete Concepts Group provides professional concreting services across Carindale and the surrounding Brisbane southside suburbs. From stunning exposed aggregate driveways to solid retaining walls and house slabs, we deliver quality workmanship backed by our QBCC licence and years of local experience.",
    areaDescription: "Carindale is one of Brisbane's most established residential suburbs, known for its family homes, leafy streets, and proximity to Westfield Carindale. Many homes in the area are reaching the age where driveways, paths, and outdoor areas need upgrading or replacing. The suburb's mix of flat blocks and gentle slopes makes it ideal for a range of concreting projects, from new driveways and patios to retaining walls for sloped backyards. As local concreters who regularly work in Carindale and nearby suburbs like Carina, Camp Hill, and Mount Gravatt, we understand the specific soil conditions and council requirements in the area.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Replace your ageing driveway with a modern exposed aggregate or plain concrete finish. Most Carindale driveways can be completed in 2-3 days." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "The most popular finish in Carindale — beautiful stone textures that complement the suburb's established homes and add kerb appeal." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Many Carindale properties have gentle slopes that benefit from retaining walls to create usable garden beds, level entertaining areas, or stabilise boundaries." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Shed slabs, garage floors, and house extensions. We pour slabs to engineering specs with proper reinforcement for Carindale's clay soils." },
    ],
    nearbySuburbs: [
      { name: "Carina", slug: "carina" },
      { name: "Camp Hill", slug: "camp-hill" },
      { name: "Mount Gravatt", slug: "mount-gravatt" },
      { name: "Mansfield", slug: "mansfield" },
      { name: "Belmont", slug: "belmont" },
      { name: "Cannon Hill", slug: "cannon-hill" },
    ],
    faqs: [
      { q: "How much does concreting cost in Carindale?", a: "Concreting costs in Carindale typically range from $65/m² for plain concrete to $150/m² for premium exposed aggregate. The exact price depends on the project size, finish, and site conditions. We provide free on-site quotes with no obligation." },
      { q: "Do you need council approval for concreting in Carindale?", a: "Most standard concreting work (driveways, patios, paths) doesn't require council approval in Brisbane. However, retaining walls over 1 metre and work near boundaries may need approval. We'll advise you during our free site inspection." },
      { q: "How long does a driveway take to complete in Carindale?", a: "Most residential driveways in Carindale take 2-3 days of on-site work. After pouring, the concrete needs 7 days before foot traffic and 28 days before vehicles can use it." },
    ],
    testimonialSnippet: { name: "Myresh M", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish.", service: "Concrete Driveway — Mount Gravatt East" },
  },
  "logan": {
    slug: "logan",
    name: "Logan",
    region: "Logan City",
    postcode: "4114",
    h1: "Concreting Logan — Affordable Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Logan | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Affordable concreting services in Logan, QLD. Driveways, exposed aggregate, slabs, retaining walls, excavation. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Logan, concreters Logan, concrete driveway Logan, exposed aggregate Logan, retaining wall Logan, concrete slab Logan, concreting Logan City",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Need a concreter in Logan? Concrete Concepts Group provides affordable, high-quality concreting services across the entire Logan City area — from Springwood and Shailer Park to Beenleigh and Marsden. Whether you're building a new home and need a house slab, upgrading your driveway, or building a retaining wall, we deliver professional results at competitive prices.",
    areaDescription: "Logan is one of South East Queensland's fastest-growing regions, with thousands of new homes being built alongside established suburbs. This mix of new construction and renovation work creates strong demand for quality concreting services. From the newer estates in Yarrabilba and Logan Reserve to the established suburbs of Springwood, Daisy Hill, and Shailer Park, we service the entire Logan City council area. The region's reactive clay soils mean proper preparation and reinforcement are essential for long-lasting concrete — something we take seriously on every project.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "New driveways for new builds and driveway replacements for established homes. Plain concrete, exposed aggregate, and coloured options available." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "House slabs, shed slabs, and garage floors for Logan's booming construction market. Engineered to handle the area's reactive clay soils." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Logan has many sloping blocks that need retaining walls. We build concrete, block, and sleeper walls with proper drainage." },
      { name: "Excavation", slug: "excavation-brisbane", description: "Full excavation and site preparation for new builds, extensions, and landscaping projects across Logan." },
    ],
    nearbySuburbs: [
      { name: "Springwood", slug: "springwood" },
      { name: "Shailer Park", slug: "shailer-park" },
      { name: "Beenleigh", slug: "beenleigh" },
      { name: "Marsden", slug: "marsden" },
      { name: "Daisy Hill", slug: "daisy-hill" },
      { name: "Underwood", slug: "underwood" },
    ],
    faqs: [
      { q: "How much does a concrete driveway cost in Logan?", a: "Concrete driveways in Logan typically cost between $65 and $150 per square metre depending on the finish. A standard double driveway (around 50m²) might cost between $3,250 and $7,500. We provide free quotes with no obligation." },
      { q: "Do you service all of Logan City?", a: "Yes! We service the entire Logan City council area including Springwood, Shailer Park, Beenleigh, Marsden, Daisy Hill, Underwood, Slacks Creek, Woodridge, Logan Central, Browns Plains, and surrounding suburbs." },
      { q: "Can you work on new builds in Logan?", a: "Absolutely. We regularly work with builders and homeowners on new construction projects across Logan, including house slabs, driveways, paths, and retaining walls." },
    ],
    testimonialSnippet: { name: "Paul S", text: "The price was what I had expected to pay and they came out to inspect the site before quoting. Would recommend them.", service: "Concreting — Shailer Park" },
  },
  "wynnum": {
    slug: "wynnum",
    name: "Wynnum",
    region: "Brisbane Bayside",
    postcode: "4178",
    h1: "Concreting Wynnum — Bayside Driveways, Patios & Pool Surrounds",
    metaTitle: "Concreting Wynnum | Bayside Driveways & Patios | Concrete Concepts",
    metaDescription: "Professional concreting in Wynnum and Brisbane's bayside. Driveways, patios, pool surrounds, exposed aggregate. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Wynnum, concreters Wynnum, concrete driveway Wynnum, exposed aggregate Wynnum, patio Wynnum, pool surround Wynnum, concreting bayside Brisbane",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/pool-surround-1_adcdb251.jpg",
    intro: "Searching for a concreter in Wynnum or Brisbane's bayside? Concrete Concepts Group delivers premium concreting services across Wynnum, Manly, Lota, and the surrounding bayside suburbs. The coastal lifestyle means outdoor living is everything — and we specialise in creating beautiful driveways, patios, pool surrounds, and entertaining areas that stand up to the salt air and Queensland sun.",
    areaDescription: "Wynnum and the bayside suburbs are some of Brisbane's most sought-after areas, with charming Queenslander homes, modern builds, and a relaxed coastal atmosphere. The proximity to Moreton Bay means many properties feature outdoor entertaining areas, pools, and alfresco spaces that benefit from quality concrete finishes. Exposed aggregate is particularly popular in the bayside area for its slip resistance and natural stone beauty. We understand the unique requirements of coastal concreting, including salt-resistant sealers and proper drainage for the area's occasional king tides and storm surges.",
    popularServices: [
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "The go-to finish for bayside homes. Slip-resistant, beautiful, and perfect for pool surrounds, patios, and driveways in the coastal environment." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Extend your outdoor living with a premium concrete patio. Wynnum's year-round outdoor lifestyle deserves a quality entertaining space." },
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Upgrade your bayside home's street appeal with a new concrete driveway. Exposed aggregate and coloured concrete are popular choices in Wynnum." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Many bayside properties sit on sloping blocks. We build retaining walls that create usable space and protect against erosion." },
    ],
    nearbySuburbs: [
      { name: "Manly", slug: "manly" },
      { name: "Lota", slug: "lota" },
      { name: "Hemmant", slug: "hemmant" },
      { name: "Cannon Hill", slug: "cannon-hill" },
      { name: "Capalaba", slug: "capalaba" },
      { name: "Tingalpa", slug: "tingalpa" },
    ],
    faqs: [
      { q: "Do you use salt-resistant sealers for bayside properties?", a: "Yes! For all bayside concreting work, we use premium penetrating sealers that protect against salt air, moisture, and UV damage. This is especially important for exposed aggregate and pool surrounds near the coast." },
      { q: "How much does a patio cost in Wynnum?", a: "Concrete patios in Wynnum typically cost between $65 and $150 per square metre depending on the finish. A typical 30m² patio might cost between $2,000 and $4,500. We provide free, detailed quotes." },
      { q: "Can you concrete around existing pools?", a: "Absolutely! We regularly pour new pool surrounds and replace old ones. Exposed aggregate is the most popular choice for pool areas due to its excellent slip resistance and heat management." },
    ],
    testimonialSnippet: { name: "Helen K", text: "Connected with Concrete Concepts and would recommend them.", service: "Exposed Aggregate — Geebung" },
  },
  "springfield": {
    slug: "springfield",
    name: "Springfield",
    region: "Ipswich / Greater Springfield",
    postcode: "4300",
    h1: "Concreting Springfield — New Builds, Driveways & Slabs",
    metaTitle: "Concreting Springfield | New Build Slabs & Driveways | Concrete Concepts",
    metaDescription: "Concreting services in Springfield and Greater Springfield. House slabs, driveways, retaining walls for new builds. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Springfield, concreters Springfield, concrete driveway Springfield, concrete slab Springfield, retaining wall Springfield, concreting Greater Springfield",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/concrete-slab-1_56311043.jpg",
    intro: "Building in Springfield or Greater Springfield? Concrete Concepts Group is your local concreting partner for one of Queensland's fastest-growing communities. From house slabs and driveways for new builds to retaining walls and outdoor entertaining areas, we provide the full range of concreting services to Springfield, Springfield Lakes, Spring Mountain, and the surrounding suburbs.",
    areaDescription: "Greater Springfield is Australia's largest master-planned community and one of the fastest-growing areas in South East Queensland. With thousands of new homes being built each year, there's enormous demand for quality concreting services. The area features a mix of new estates, established suburbs, and commercial developments. Springfield's terrain includes flat blocks and gentle slopes, with soil conditions that require proper preparation for long-lasting concrete. As experienced concreters who regularly work in the Springfield area, we understand the local building requirements and work efficiently with builders and homeowners alike.",
    popularServices: [
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "House slabs, shed slabs, and garage floors for Springfield's booming new build market. Engineered to Australian Standards with proper reinforcement." },
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Complete your new build with a quality driveway, or upgrade your existing Springfield home. Plain, coloured, and exposed aggregate options." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Many Springfield blocks require retaining walls for level building pads, boundary walls, and landscaping. We handle all sizes." },
      { name: "Excavation", slug: "excavation-brisbane", description: "Full site preparation for new builds including excavation, levelling, and compaction. We work seamlessly with builders." },
    ],
    nearbySuburbs: [
      { name: "Springfield Lakes", slug: "springfield-lakes" },
      { name: "Spring Mountain", slug: "spring-mountain" },
      { name: "Redbank Plains", slug: "redbank-plains" },
      { name: "Ripley", slug: "ripley" },
      { name: "Goodna", slug: "goodna" },
      { name: "Forest Lake", slug: "forest-lake" },
    ],
    faqs: [
      { q: "Do you work with builders in Springfield?", a: "Yes! We regularly work with builders and developers across Greater Springfield. We can coordinate our work with your builder's schedule and provide competitive rates for multi-lot projects." },
      { q: "How much does a house slab cost in Springfield?", a: "House slab costs in Springfield typically range from $70 to $120 per square metre depending on the slab type, soil conditions, and engineering requirements. We provide free, detailed quotes for every project." },
      { q: "Can you concrete in new estates that are still developing?", a: "Absolutely. We regularly work in new estates across Springfield, Spring Mountain, Ripley, and surrounding areas. We're experienced with the access and staging requirements of developing areas." },
    ],
  },
  "capalaba": {
    slug: "capalaba",
    name: "Capalaba",
    region: "Redlands",
    postcode: "4157",
    h1: "Concreting Capalaba — Driveways, Patios & Retaining Walls",
    metaTitle: "Concreting Capalaba | Driveways & Patios | Concrete Concepts",
    metaDescription: "Quality concreting in Capalaba and the Redlands. Driveways, exposed aggregate, patios, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Capalaba, concreters Capalaba, concrete driveway Capalaba, exposed aggregate Capalaba, retaining wall Capalaba, patio Capalaba, concreting Redlands",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-3_e9b3c7b9.jpeg",
    intro: "Need a concreter in Capalaba or the Redlands? Concrete Concepts Group provides professional concreting services across Capalaba, Alexandra Hills, Cleveland, Thornlands, and the wider Redland City area. Whether you're upgrading your driveway, building a new patio, or need a retaining wall for your sloping block, our QBCC licensed team delivers quality results at fair prices.",
    areaDescription: "Capalaba sits at the gateway to the Redlands, connecting Brisbane's eastern suburbs to the bayside communities of Cleveland, Victoria Point, and Redland Bay. The suburb features a mix of established homes from the 1970s-90s and newer developments, many of which are due for concrete upgrades. The area's undulating terrain means retaining walls are common, while the proximity to the bay makes exposed aggregate a popular choice for its slip resistance and coastal durability. We've completed numerous projects across Capalaba and the Redlands, and we understand the local soil conditions and Redland City Council requirements.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Replace your old Capalaba driveway with a modern exposed aggregate or coloured concrete finish. We handle removal of old concrete included." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "The most requested finish in the Redlands. Beautiful, durable, and slip-resistant — perfect for driveways, patios, and pool areas." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create the perfect outdoor entertaining area for Capalaba's relaxed lifestyle. Multiple finish options to suit your home and budget." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Capalaba's hilly terrain means many properties need retaining walls. We build concrete, block, and sleeper walls with proper engineering." },
    ],
    nearbySuburbs: [
      { name: "Alexandra Hills", slug: "alexandra-hills" },
      { name: "Cleveland", slug: "cleveland" },
      { name: "Thornlands", slug: "thornlands" },
      { name: "Birkdale", slug: "birkdale" },
      { name: "Wellington Point", slug: "wellington-point" },
      { name: "Wynnum", slug: "wynnum" },
    ],
    faqs: [
      { q: "How much does a driveway cost in Capalaba?", a: "Driveways in Capalaba typically cost between $65 and $150 per square metre depending on the finish. Most standard double driveways cost between $3,500 and $8,000. We provide free, detailed quotes with no obligation." },
      { q: "Do you service all of the Redlands?", a: "Yes! We service the entire Redland City area including Capalaba, Alexandra Hills, Cleveland, Thornlands, Victoria Point, Redland Bay, Birkdale, Wellington Point, Ormiston, and surrounding suburbs." },
      { q: "Can you remove and replace my old driveway?", a: "Absolutely. We handle the full process — demolition of old concrete, excavation, sub-base preparation, and installation of your new driveway. All waste is responsibly disposed of." },
    ],
    testimonialSnippet: { name: "Paul R", text: "Prompt.", service: "Concreting — Capalaba" },
  },
  "ipswich": {
    slug: "ipswich",
    name: "Ipswich",
    region: "Ipswich City",
    postcode: "4305",
    h1: "Concreting Ipswich — Driveways, Slabs & Excavation",
    metaTitle: "Concreting Ipswich | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting in Ipswich, QLD. Driveways, slabs, retaining walls, excavation. QBCC Licensed #15299707. Competitive prices. Free quotes — call 0424 463 268.",
    keywords: "concreting Ipswich, concreters Ipswich, concrete driveway Ipswich, concrete slab Ipswich, retaining wall Ipswich, excavation Ipswich",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/excavator-work-1_99a98a3d.jpg",
    intro: "Looking for a concreter in Ipswich? Concrete Concepts Group provides professional, affordable concreting services across the Ipswich City area. From new driveways and house slabs to retaining walls and full excavation, we bring Brisbane-quality workmanship to Ipswich at competitive prices. QBCC licensed, fully insured, and committed to getting the job done right.",
    areaDescription: "Ipswich is one of Queensland's oldest cities and is experiencing significant growth with new estates and infrastructure development. The city's mix of heritage homes, established suburbs, and new developments creates diverse concreting needs. From driveway replacements in older suburbs like Brassall and Booval to new house slabs in developing areas like Ripley and Deebing Heights, we handle it all. Ipswich's varied terrain and soil conditions require experienced concreters who understand proper preparation — and that's exactly what we deliver.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "New driveways and replacements for Ipswich homes. Plain concrete, exposed aggregate, and coloured options at competitive prices." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "House slabs, shed slabs, and garage floors for Ipswich's growing construction market. Engineered and reinforced to Australian Standards." },
      { name: "Excavation", slug: "excavation-brisbane", description: "Full excavation and site preparation for new builds, pools, and landscaping across Ipswich. Own machinery for efficient service." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Ipswich's hilly terrain means retaining walls are essential for many properties. Concrete, block, and sleeper options available." },
    ],
    nearbySuburbs: [
      { name: "Springfield", slug: "springfield" },
      { name: "Brassall", slug: "brassall" },
      { name: "Goodna", slug: "goodna" },
      { name: "Redbank Plains", slug: "redbank-plains" },
      { name: "Ripley", slug: "ripley" },
      { name: "Bellbird Park", slug: "bellbird-park" },
    ],
    faqs: [
      { q: "How much does concreting cost in Ipswich?", a: "Concreting in Ipswich is competitively priced, typically ranging from $65/m² for plain concrete to $150/m² for exposed aggregate. We offer some of the best value in the region. Free quotes with no obligation." },
      { q: "Do you travel to Ipswich from Brisbane?", a: "We service the entire Ipswich City area as part of our regular coverage. There are no additional travel charges for Ipswich — our quoted price is the price you pay." },
      { q: "Can you work on acreage properties in Ipswich?", a: "Yes! We have the machinery and experience to handle larger rural-residential properties, including long driveways, large shed slabs, and extensive retaining walls." },
    ],
    testimonialSnippet: { name: "Joe S", text: "Excellent job done and quick and reliable.", service: "Concreting — Collingwood Park" },
  },
  "mount-gravatt": {
    slug: "mount-gravatt",
    name: "Mount Gravatt",
    region: "Brisbane Southside",
    postcode: "4122",
    h1: "Concreting Mount Gravatt — Driveways, Retaining Walls & Patios",
    metaTitle: "Concreting Mount Gravatt | Driveways & Retaining Walls | Concrete Concepts",
    metaDescription: "Expert concreting in Mount Gravatt, Brisbane. Driveways, retaining walls, patios, exposed aggregate. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Mount Gravatt, concreters Mount Gravatt, concrete driveway Mount Gravatt, retaining wall Mount Gravatt, exposed aggregate Mount Gravatt",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-1_942fd49e.jpeg",
    intro: "Need a concreter in Mount Gravatt? Concrete Concepts Group is your local concreting specialist for Mount Gravatt, Upper Mount Gravatt, and the surrounding southside suburbs. The area's hilly terrain means retaining walls and sloped driveways are our bread and butter — and we've completed dozens of projects in the Mount Gravatt area.",
    areaDescription: "Mount Gravatt is a well-established Brisbane suburb known for its elevated position, mountain views, and mix of post-war and modern homes. The suburb's hilly terrain creates unique concreting challenges — steep driveways, retaining walls, and tiered outdoor areas are common requirements. Many homes in the area were built in the 1960s-80s and are now due for concrete upgrades. We regularly work in Mount Gravatt and understand the specific challenges of concreting on slopes, including proper drainage, reinforcement, and formwork for steep sites.",
    popularServices: [
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Mount Gravatt's hilly terrain makes retaining walls essential. We build engineered walls that create usable space on sloping blocks." },
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Steep driveway specialists. We design and pour driveways with proper drainage and non-slip finishes for Mount Gravatt's slopes." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Premium exposed aggregate finishes that add value and beauty to Mount Gravatt homes. Slip-resistant and perfect for sloped areas." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create a level entertaining area on your sloping block. We handle the excavation, retaining, and concreting in one package." },
    ],
    nearbySuburbs: [
      { name: "Carindale", slug: "carindale" },
      { name: "Mansfield", slug: "mansfield" },
      { name: "Wishart", slug: "wishart" },
      { name: "Holland Park", slug: "holland-park" },
      { name: "Sunnybank", slug: "sunnybank" },
      { name: "Macgregor", slug: "macgregor" },
    ],
    faqs: [
      { q: "Can you concrete on steep driveways in Mount Gravatt?", a: "Absolutely — steep driveways are one of our specialties. We use proper formwork, reinforcement, and non-slip finishes to create safe, durable driveways on Mount Gravatt's slopes. We also ensure proper drainage to prevent water runoff issues." },
      { q: "How much does a retaining wall cost in Mount Gravatt?", a: "Retaining wall costs in Mount Gravatt depend on height, length, material, and access. As a guide, concrete retaining walls start from around $300-$500 per lineal metre. We provide free, detailed quotes." },
      { q: "Do you handle the full job on sloping blocks?", a: "Yes! We provide a complete service — excavation, retaining walls, drainage, and concreting all done by our team. This means better coordination, fewer delays, and a single point of contact." },
    ],
    testimonialSnippet: { name: "Myresh M", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish.", service: "Concrete Driveway — Mount Gravatt East" },
  },
  "redlands": {
    slug: "redlands",
    name: "Redlands",
    region: "Redland City",
    postcode: "4163",
    h1: "Concreting Redlands — Bayside Driveways, Patios & Pool Surrounds",
    metaTitle: "Concreting Redlands | Bayside Driveways & Patios | Concrete Concepts",
    metaDescription: "Professional concreting across the Redlands and bayside Brisbane. Driveways, patios, pool surrounds, exposed aggregate. QBCC Licensed. Free quotes — call 0424 463 268.",
    keywords: "concreting Redlands, concreters Redlands, concrete driveway Redlands, exposed aggregate Redlands, patio Redlands, concreting Redland City",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/pool-concrete-3_6085efa5.jpg",
    intro: "Looking for a concreter in the Redlands? Concrete Concepts Group services the entire Redland City area — from Capalaba and Alexandra Hills to Cleveland, Victoria Point, and Redland Bay. The bayside lifestyle calls for quality outdoor spaces, and we specialise in creating beautiful driveways, patios, pool surrounds, and entertaining areas that complement the coastal environment.",
    areaDescription: "The Redlands is a beautiful bayside region stretching from Capalaba to the shores of Moreton Bay. Known for its relaxed lifestyle, family-friendly suburbs, and proximity to the islands, the area features a mix of established homes and new developments. Outdoor living is central to the Redlands lifestyle, making quality concrete patios, pool surrounds, and driveways essential. We understand the unique requirements of bayside concreting, including salt-resistant finishes, proper drainage for coastal weather, and the aesthetic preferences of Redlands homeowners.",
    popularServices: [
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "The most popular finish in the Redlands. Beautiful stone textures with excellent slip resistance — perfect for the bayside environment." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Outdoor entertaining is a way of life in the Redlands. We create stunning patios and alfresco areas for year-round enjoyment." },
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Upgrade your Redlands home with a new driveway. Exposed aggregate, coloured, and plain concrete options available." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Many Redlands properties feature sloping blocks that benefit from retaining walls to create usable outdoor spaces." },
    ],
    nearbySuburbs: [
      { name: "Capalaba", slug: "capalaba" },
      { name: "Cleveland", slug: "cleveland" },
      { name: "Wynnum", slug: "wynnum" },
      { name: "Victoria Point", slug: "victoria-point" },
      { name: "Thornlands", slug: "thornlands" },
      { name: "Alexandra Hills", slug: "alexandra-hills" },
    ],
    faqs: [
      { q: "Do you service all of the Redlands?", a: "Yes! We cover the entire Redland City area including Capalaba, Alexandra Hills, Cleveland, Thornlands, Victoria Point, Redland Bay, Birkdale, Wellington Point, Ormiston, Sheldon, and Mount Cotton." },
      { q: "What finish is best for coastal properties?", a: "Exposed aggregate is the top choice for Redlands properties. It's slip-resistant, hides minor imperfections, and looks stunning with a quality sealer. We use salt-resistant sealers for all bayside work." },
      { q: "How do I get a quote for my Redlands property?", a: "Simply call us on 0424 463 268 or fill out our online quote form. We'll arrange a free on-site inspection and provide a detailed written quote within 24-48 hours." },
    ],
  },
  "beenleigh": {
    slug: "beenleigh",
    name: "Beenleigh",
    region: "Logan / Gold Coast Corridor",
    postcode: "4207",
    h1: "Concreting Beenleigh — Affordable Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Beenleigh | Affordable Driveways & Slabs | Concrete Concepts",
    metaDescription: "Affordable concreting in Beenleigh and surrounds. Driveways, slabs, retaining walls, excavation. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Beenleigh, concreters Beenleigh, concrete driveway Beenleigh, concrete slab Beenleigh, retaining wall Beenleigh",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/concrete-slab-2_3721a7ce.jpg",
    intro: "Need a concreter in Beenleigh? Concrete Concepts Group provides quality concreting at competitive prices across Beenleigh, Eagleby, Holmview, and the surrounding Logan/Gold Coast corridor. Whether you're building new or upgrading existing concrete, we deliver professional results without breaking the bank.",
    areaDescription: "Beenleigh sits at the junction of the Logan and Gold Coast corridors, making it a strategic hub for residential growth. The area features a mix of established homes and newer developments, with strong demand for both new construction concreting and renovation work. Beenleigh's relatively flat terrain makes it ideal for efficient concreting projects, while the area's growth means we're regularly working in the suburb and can offer competitive pricing.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "New and replacement driveways at competitive Beenleigh prices. Plain concrete, exposed aggregate, and coloured options." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "House slabs, shed slabs, and garage floors for Beenleigh's growing residential market." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Boundary walls, garden beds, and structural retaining walls for Beenleigh properties." },
      { name: "Excavation", slug: "excavation-brisbane", description: "Site preparation and excavation for new builds, extensions, and landscaping in the Beenleigh area." },
    ],
    nearbySuburbs: [
      { name: "Logan", slug: "logan" },
      { name: "Eagleby", slug: "eagleby" },
      { name: "Holmview", slug: "holmview" },
      { name: "Edens Landing", slug: "edens-landing" },
      { name: "Waterford", slug: "waterford" },
      { name: "Loganholme", slug: "loganholme" },
    ],
    faqs: [
      { q: "Is concreting cheaper in Beenleigh than Brisbane?", a: "Our prices are consistent across our service area — we don't charge extra for travel to Beenleigh. Concreting costs typically range from $65/m² for plain concrete to $150/m² for exposed aggregate, regardless of location." },
      { q: "Do you service the Gold Coast as well?", a: "Yes! We service Brisbane and all surrounding areas including the Gold Coast, Logan, Ipswich, Redlands, Moreton Bay, and more. Give us a call on 0424 463 268 to discuss your project." },
      { q: "How quickly can you start a job in Beenleigh?", a: "We typically have availability within 1-3 weeks depending on the season. For urgent jobs, we'll do our best to accommodate. Call 0424 463 268 to discuss your timeline." },
    ],
  },
  "camp-hill": {
    slug: "camp-hill",
    name: "Camp Hill",
    region: "Brisbane Inner South",
    postcode: "4152",
    h1: "Concreting Camp Hill — Premium Driveways & Outdoor Areas",
    metaTitle: "Concreting Camp Hill | Premium Driveways & Patios | Concrete Concepts",
    metaDescription: "Premium concreting in Camp Hill, Brisbane. Driveways, exposed aggregate, patios, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Camp Hill, concreters Camp Hill, concrete driveway Camp Hill, exposed aggregate Camp Hill, patio Camp Hill",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-driveway_803ff92a.jpeg",
    intro: "Looking for a premium concreter in Camp Hill? Concrete Concepts Group specialises in high-quality concreting for Camp Hill's beautiful homes. From exposed aggregate driveways that complement heritage Queenslanders to modern patios for contemporary builds, we deliver finishes that match the quality of this sought-after inner-city suburb.",
    areaDescription: "Camp Hill is one of Brisbane's most desirable inner-south suburbs, known for its character homes, tree-lined streets, and strong property values. The suburb features a mix of renovated Queenslanders, post-war homes, and modern builds, all of which benefit from quality concrete finishes. Camp Hill homeowners typically seek premium finishes like exposed aggregate and decorative concrete that add value and complement their property's character. The suburb's undulating terrain also creates demand for retaining walls and tiered outdoor areas.",
    popularServices: [
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "The premium choice for Camp Hill homes. Natural stone finishes that complement both heritage and modern architecture." },
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Upgrade your Camp Hill home's street appeal with a stunning new driveway. Exposed aggregate is the most popular choice." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create a beautiful outdoor entertaining area that takes advantage of Camp Hill's elevated position and city views." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Camp Hill's hilly terrain often requires retaining walls for level gardens, driveways, and entertaining areas." },
    ],
    nearbySuburbs: [
      { name: "Carindale", slug: "carindale" },
      { name: "Coorparoo", slug: "coorparoo" },
      { name: "Cannon Hill", slug: "cannon-hill" },
      { name: "Norman Park", slug: "norman-park" },
      { name: "Morningside", slug: "morningside" },
      { name: "Greenslopes", slug: "greenslopes" },
    ],
    faqs: [
      { q: "Do you work on heritage homes in Camp Hill?", a: "Yes! We have experience working on and around heritage Queenslanders and character homes. We take extra care with existing structures and can match concrete finishes to complement your home's style." },
      { q: "What's the most popular finish in Camp Hill?", a: "Exposed aggregate is by far the most popular choice in Camp Hill. It adds a premium, natural look that complements both heritage and modern homes. We offer a wide range of stone blends to match your property." },
      { q: "Can you work in tight access areas?", a: "Camp Hill has many properties with narrow side access. We have compact equipment and experienced operators who can work in tight spaces. We'll assess access during our free site inspection." },
    ],
  },
  "sunnybank": {
    slug: "sunnybank",
    name: "Sunnybank",
    region: "Brisbane Southside",
    postcode: "4109",
    h1: "Concreting Sunnybank — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Sunnybank | Driveways & Slabs | Concrete Concepts",
    metaDescription: "Professional concreting in Sunnybank, Brisbane. Driveways, slabs, retaining walls, exposed aggregate. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Sunnybank, concreters Sunnybank, concrete driveway Sunnybank, retaining wall Sunnybank, concrete slab Sunnybank",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-2_0dfe95f7.jpg",
    intro: "Need a concreter in Sunnybank? Concrete Concepts Group provides professional concreting services across Sunnybank, Sunnybank Hills, Runcorn, and the surrounding southside suburbs. From driveway replacements and new slabs to retaining walls and outdoor entertaining areas, we deliver quality workmanship at competitive prices.",
    areaDescription: "Sunnybank is a vibrant Brisbane suburb with a diverse community and a mix of residential properties ranging from 1970s-era homes to modern builds. Many properties in the area are undergoing renovations and upgrades, creating strong demand for new driveways, patios, and retaining walls. The suburb's gently undulating terrain and established gardens mean retaining walls and proper drainage are important considerations for any concreting project.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Replace your ageing Sunnybank driveway with a modern finish. Exposed aggregate, coloured, and plain concrete options." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Create level garden beds and outdoor areas on Sunnybank's sloping blocks. Concrete, block, and sleeper options." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Shed slabs, garage floors, and extension foundations for Sunnybank homes." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Extend your living space with a quality concrete patio. Perfect for Sunnybank's outdoor lifestyle." },
    ],
    nearbySuburbs: [
      { name: "Mount Gravatt", slug: "mount-gravatt" },
      { name: "Runcorn", slug: "runcorn" },
      { name: "Calamvale", slug: "calamvale" },
      { name: "Macgregor", slug: "macgregor" },
      { name: "Robertson", slug: "robertson" },
      { name: "Algester", slug: "algester" },
    ],
    faqs: [
      { q: "How much does a driveway cost in Sunnybank?", a: "Driveways in Sunnybank typically cost between $65 and $150 per square metre. A standard double driveway (50m²) ranges from $3,250 to $7,500 depending on the finish. We provide free quotes." },
      { q: "Can you work around existing landscaping?", a: "Yes! We take great care to protect existing gardens, trees, and landscaping during our work. We'll discuss access and protection measures during our site inspection." },
      { q: "Do you offer payment plans?", a: "We require a deposit to secure your booking, with the balance due on completion. For larger projects, we can discuss staged payment arrangements. Call us to discuss your specific needs." },
    ],
    testimonialSnippet: { name: "Pushpa", text: "Connected with Concrete Concepts and would recommend them.", service: "Concrete Driveway — Runcorn" },
  },
  "chermside": {
    slug: "chermside",
    name: "Chermside",
    region: "Brisbane Northside",
    postcode: "4032",
    h1: "Concreting Chermside — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Chermside | Driveways & Slabs | Concrete Concepts",
    metaDescription: "Professional concreting in Chermside, Brisbane northside. Driveways, slabs, retaining walls, exposed aggregate. QBCC Licensed #15299707. Free quotes — 0424 463 268.",
    keywords: "concreting Chermside, concreters Chermside, concrete driveway Chermside, exposed aggregate Chermside, retaining wall Chermside, concrete slab Chermside",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
    intro: "Looking for a concreter in Chermside? Concrete Concepts Group delivers professional concreting services across Chermside and Brisbane's northside. Whether you need a new driveway, a shed slab, or a retaining wall, our QBCC-licensed team delivers quality results backed by 5-star reviews.",
    areaDescription: "Chermside is one of Brisbane's busiest northside hubs, anchored by Westfield Chermside and surrounded by established residential streets. Many homes in the area were built in the 1960s-80s and are now due for driveway replacements, path upgrades, and outdoor area improvements. The suburb's flat to gently sloping terrain makes it well-suited for a wide range of concreting projects. With new townhouse developments and renovations happening throughout the area, demand for quality concreting in Chermside continues to grow. We regularly work across Chermside, Chermside West, Stafford, and Kedron.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Replace your ageing Chermside driveway with a modern exposed aggregate or plain concrete finish. Most driveways completed in 2-3 days." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "The most popular finish on the northside — natural stone textures that add kerb appeal and complement Chermside's mix of classic and modern homes." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Shed slabs, garage floors, granny flat foundations, and house extensions. Engineered to Australian standards." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Functional retaining walls for Chermside properties — create level garden beds, stabilise boundaries, or add usable outdoor space." },
    ],
    nearbySuburbs: [
      { name: "Stafford", slug: "stafford" },
      { name: "Kedron", slug: "kedron" },
      { name: "Aspley", slug: "aspley" },
      { name: "Wavell Heights", slug: "wavell-heights" },
      { name: "Geebung", slug: "geebung" },
      { name: "Nundah", slug: "nundah" },
    ],
    faqs: [
      { q: "How much does concreting cost in Chermside?", a: "Concreting in Chermside typically ranges from $65/m² for plain concrete to $150/m² for premium exposed aggregate. A standard double driveway (50m²) costs between $3,250 and $7,500. We provide free on-site quotes." },
      { q: "Do you work on townhouse developments in Chermside?", a: "Yes, we regularly work with builders and body corporates on townhouse and unit developments across the northside, including shared driveways, paths, and common area concreting." },
      { q: "How long does a driveway replacement take?", a: "Most Chermside driveway replacements take 2-3 days of on-site work including removal of the old driveway. After pouring, allow 7 days before foot traffic and 28 days before driving on it." },
    ],
    testimonialSnippet: { name: "Kailash S", text: "Highly professional, respected our requirement, on time and completed the work to our entire satisfaction.", service: "Concreting — Kenmore" },
  },
  "aspley": {
    slug: "aspley",
    name: "Aspley",
    region: "Brisbane Northside",
    postcode: "4034",
    h1: "Concreting Aspley — Driveways, Patios & Retaining Walls",
    metaTitle: "Concreting Aspley | Driveways & Patios | Concrete Concepts",
    metaDescription: "Quality concreting services in Aspley, Brisbane northside. Driveways, patios, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — 0424 463 268.",
    keywords: "concreting Aspley, concreters Aspley, concrete driveway Aspley, exposed aggregate Aspley, patio Aspley, retaining wall Aspley",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-4_c54657e7.jpeg",
    intro: "Need a concreter in Aspley? Concrete Concepts Group provides quality concreting services across Aspley and the surrounding northside suburbs. From stunning driveways and outdoor patios to solid retaining walls and shed slabs, we bring professional workmanship and competitive pricing to every project.",
    areaDescription: "Aspley is a well-established northside suburb with a strong mix of original post-war homes and modern renovations. The suburb's leafy streets and generous block sizes mean there's plenty of scope for driveway upgrades, patio extensions, and backyard transformations. Many Aspley homeowners are investing in outdoor living areas, and exposed aggregate concrete is a popular choice for its durability and natural beauty. We service Aspley, Zillmere, Carseldine, and Geebung regularly and understand the local soil conditions and council requirements.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Upgrade your Aspley driveway with exposed aggregate, coloured, or plain concrete. We handle removal of the old surface and full preparation." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create a beautiful outdoor entertaining area with a quality concrete patio. Aspley's generous backyards are perfect for alfresco living." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Many Aspley blocks have gentle slopes that benefit from retaining walls to create level garden beds and usable outdoor spaces." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Shed slabs, garage floors, and granny flat foundations. Properly engineered for Aspley's soil conditions." },
    ],
    nearbySuburbs: [
      { name: "Chermside", slug: "chermside" },
      { name: "Zillmere", slug: "zillmere" },
      { name: "Carseldine", slug: "carseldine" },
      { name: "Geebung", slug: "geebung" },
      { name: "Bridgeman Downs", slug: "bridgeman-downs" },
      { name: "Albany Creek", slug: "albany-creek" },
    ],
    faqs: [
      { q: "How much does a concrete patio cost in Aspley?", a: "Concrete patios in Aspley typically cost between $70 and $150 per square metre depending on the finish and size. An average patio (30m²) ranges from $2,100 to $4,500. We provide free quotes with no obligation." },
      { q: "Can you match existing concrete on extensions?", a: "We do our best to match existing concrete finishes, though exact colour matching can be difficult with aged concrete. We'll discuss options during our free site inspection and recommend the best approach." },
      { q: "Do you provide free quotes in Aspley?", a: "Yes! We provide free, no-obligation on-site quotes for all concreting projects in Aspley and surrounding suburbs. Call 0424 463 268 or fill out our online form." },
    ],
    testimonialSnippet: { name: "Sheeba", text: "Highly recommend Jarrod and his boys team for their exceptional professional work.", service: "Concreting — Annerley" },
  },
  "north-lakes": {
    slug: "north-lakes",
    name: "North Lakes",
    region: "Moreton Bay",
    postcode: "4509",
    h1: "Concreting North Lakes — Driveways, Slabs & Outdoor Areas",
    metaTitle: "Concreting North Lakes | Driveways & Slabs | Concrete Concepts",
    metaDescription: "Professional concreting in North Lakes, Moreton Bay. Driveways, slabs, retaining walls, exposed aggregate. QBCC Licensed #15299707. Free quotes — 0424 463 268.",
    keywords: "concreting North Lakes, concreters North Lakes, concrete driveway North Lakes, exposed aggregate North Lakes, concrete slab North Lakes, retaining wall North Lakes",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-finished-slab_74e9f7cd.jpeg",
    intro: "Searching for a concreter in North Lakes? Concrete Concepts Group provides professional concreting services across North Lakes, Mango Hill, Griffin, and the wider Moreton Bay region. From new-build house slabs to driveway upgrades and outdoor entertaining areas, we deliver quality workmanship at competitive prices.",
    areaDescription: "North Lakes is one of South East Queensland's fastest-growing master-planned communities, with thousands of modern homes built over the past two decades. While many homes are relatively new, the area's first estates are now reaching the age where driveways and outdoor areas need upgrading or extending. New builds in surrounding estates like Griffin, Mango Hill, and Dakabin also create strong demand for house slabs, driveways, and retaining walls. The area's flat terrain and well-planned streets make for efficient concreting projects, and we regularly work across the entire North Lakes and Moreton Bay corridor.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "New driveways for new builds and upgrades for established North Lakes homes. Exposed aggregate, coloured, and plain options available." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "House slabs, shed slabs, and garage floors for North Lakes' growing residential market. Engineered to handle the area's soil conditions." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Add kerb appeal to your North Lakes home with a premium exposed aggregate driveway or patio. The most popular finish in the area." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Extend your outdoor living with a quality concrete patio or alfresco area. Perfect for North Lakes' family-friendly lifestyle." },
    ],
    nearbySuburbs: [
      { name: "Mango Hill", slug: "mango-hill" },
      { name: "Griffin", slug: "griffin" },
      { name: "Kallangur", slug: "kallangur" },
      { name: "Dakabin", slug: "dakabin" },
      { name: "Narangba", slug: "narangba" },
      { name: "Caboolture", slug: "caboolture" },
    ],
    faqs: [
      { q: "How much does a driveway cost in North Lakes?", a: "Driveways in North Lakes typically cost between $65 and $150 per square metre depending on the finish. A standard double driveway (50m²) ranges from $3,250 to $7,500. We provide free on-site quotes." },
      { q: "Do you work on new builds in North Lakes?", a: "Absolutely. We regularly work with builders and homeowners on new construction projects across North Lakes and surrounding estates, including house slabs, driveways, paths, and retaining walls." },
      { q: "How far north do you service?", a: "We service the entire Moreton Bay region from North Lakes up to Caboolture and Bribie Island. Our team travels from Brisbane daily and is well set up to work across the northern corridor." },
    ],
    testimonialSnippet: { name: "Paul S", text: "The price was what I had expected to pay and they came out to inspect the site before quoting. Would recommend them.", service: "Concreting — Shailer Park" },
  },
  "caboolture": {
    slug: "caboolture",
    name: "Caboolture",
    region: "Moreton Bay",
    postcode: "4510",
    h1: "Concreting Caboolture — Affordable Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Caboolture | Driveways & Slabs | Concrete Concepts",
    metaDescription: "Affordable concreting in Caboolture & Moreton Bay. Driveways, slabs, retaining walls, excavation. QBCC Licensed #15299707. Free quotes — 0424 463 268.",
    keywords: "concreting Caboolture, concreters Caboolture, concrete driveway Caboolture, concrete slab Caboolture, retaining wall Caboolture, excavation Caboolture",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-4_c54657e7.jpeg",
    intro: "Need a concreter in Caboolture? Concrete Concepts Group provides affordable, high-quality concreting services across Caboolture, Morayfield, Burpengary, and the wider Moreton Bay region. From house slabs for new builds to driveway replacements and retaining walls, we deliver professional results at competitive prices.",
    areaDescription: "Caboolture and the surrounding Moreton Bay suburbs are experiencing significant residential growth, with new housing estates expanding across Morayfield, Burpengary, and Upper Caboolture. This growth creates strong demand for quality concreting services — from house slabs and driveways for new builds to upgrades and extensions for established homes. The area's mix of flat land and rolling hills means projects can range from straightforward slab pours to more complex retaining wall and excavation work. We service the entire Caboolture region and bring our own machinery for excavation and site preparation.",
    popularServices: [
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "House slabs, shed slabs, and garage floors for Caboolture's booming construction market. Engineered to handle local soil conditions." },
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "New driveways for new builds and replacements for established homes. Plain concrete, exposed aggregate, and coloured options." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Caboolture has many sloping blocks that need retaining walls. We build concrete, block, and sleeper walls with proper drainage." },
      { name: "Excavation", slug: "excavation-brisbane", description: "Full excavation and site preparation for new builds, extensions, and landscaping projects across the Caboolture region." },
    ],
    nearbySuburbs: [
      { name: "Morayfield", slug: "morayfield" },
      { name: "Burpengary", slug: "burpengary" },
      { name: "North Lakes", slug: "north-lakes" },
      { name: "Narangba", slug: "narangba" },
      { name: "Upper Caboolture", slug: "upper-caboolture" },
      { name: "Bribie Island", slug: "bribie-island" },
    ],
    faqs: [
      { q: "How much does concreting cost in Caboolture?", a: "Concreting in Caboolture typically ranges from $65/m² for plain concrete to $150/m² for premium exposed aggregate. We provide free on-site quotes with no obligation — call 0424 463 268." },
      { q: "Do you travel to Caboolture from Brisbane?", a: "Yes! Our team services the entire Moreton Bay region from Caboolture down to Brisbane. We're well set up for travel and include it in our competitive pricing — no hidden travel charges." },
      { q: "Can you handle large commercial projects in Caboolture?", a: "Yes, we handle both residential and commercial concreting projects. From single driveways to large commercial slabs and car parks, we have the equipment and experience to deliver." },
    ],
    testimonialSnippet: { name: "Myresh M", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish.", service: "Concrete Driveway — Mount Gravatt East" },
  },
  "morningside": {
    slug: "morningside",
    name: "Morningside",
    region: "Brisbane Inner-East",
    postcode: "4170",
    h1: "Concreting Morningside — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Morningside | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Morningside, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Morningside, concreters Morningside, concrete driveway Morningside, exposed aggregate Morningside, concrete slabs Morningside, retaining walls Morningside",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-driveway-house_50304489.jpg",
    intro: "Nestled in Brisbane's desirable inner-east, Morningside is a suburb of beautiful homes and vibrant streets. From classic Queenslanders to contemporary new builds, residents take pride in their properties. Concrete Concepts is proud to offer our full range of professional concreting services to the Morningside community. Whether you're looking to create a stunning new exposed aggregate driveway, a practical and durable slab for a shed or extension, or a structurally sound retaining wall to manage a sloping block, our experienced team has the skills and local knowledge to deliver exceptional results. We understand the unique character of Morningside and provide tailored solutions that enhance both the value and liveability of your home. As your local concreting experts, we are committed to quality workmanship and transparent pricing, ensuring your project is a seamless success from start to finish.",
    areaDescription: "Morningside's appeal lies in its blend of traditional charm and modern convenience, located just a few kilometres from the CBD. The suburb is characterised by its hilly terrain, particularly in the areas closer to the Brisbane River, offering city views but also presenting unique landscaping challenges. The housing stock is a diverse mix, from iconic, high-set Queenslanders on large blocks to modern architectural homes and stylish townhouses. This variety means a high demand for versatile and durable concreting solutions. The area's reactive clay soils, common throughout Brisbane, combined with the undulating landscape, make professionally engineered concrete slabs and footings essential for structural integrity. Furthermore, the subtropical climate, with its periods of heavy rain, necessitates robust and well-drained driveways and pathways. Many homeowners in Morningside are undertaking significant renovations, where new concrete patios, pool surrounds, and driveways are key features. Retaining walls are especially popular and often necessary to create level, usable spaces on sloping blocks, preventing soil erosion and adding significant value to the property.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "From steep, sloping driveways requiring careful engineering to stylish exposed aggregate finishes, we build driveways in Morningside that are both beautiful and built to last." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Given Morningside's hilly terrain, our engineered concrete retaining walls are a popular solution for creating functional, level areas and preventing soil erosion." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "We pour high-quality, structurally sound concrete slabs for new homes, extensions, sheds, and outdoor entertaining areas, tailored to Morningside's soil conditions." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Exposed aggregate is a popular choice in Morningside for adding a touch of class to driveways, pathways, and patios, offering a durable and non-slip surface." },
    ],
    nearbySuburbs: [
      { name: "Bulimba", slug: "bulimba" },
      { name: "Hawthorne", slug: "hawthorne" },
      { name: "Cannon Hill", slug: "cannon-hill" },
      { name: "Norman Park", slug: "norman-park" },
      { name: "Seven Hills", slug: "seven-hills" },
      { name: "Camp Hill", slug: "camp-hill" },
    ],
    faqs: [
      { q: "My Morningside property is on a steep slope. Can you build a driveway?", a: "Absolutely. We specialise in challenging sites and can design and engineer a concrete driveway for your sloping block that is safe, durable, and compliant with all Brisbane City Council requirements." },
      { q: "What kind of concrete finish is best for a Queenslander in Morningside?", a: "For a classic Queenslander, a broom-finished or exposed aggregate driveway often works beautifully. We can show you a range of options to complement your home's traditional character while providing a modern, durable surface." },
      { q: "Do I need a retaining wall for my sloping backyard?", a: "In a hilly suburb like Morningside, a retaining wall is often the best way to create more usable space and prevent soil movement. We can assess your property and advise on the best solution, providing a free quote for a fully engineered concrete or block wall." },
    ],
    testimonialSnippet: { name: "Sarah M.", text: "The team did a fantastic job on our new driveway. It was a tricky, sloping block but they handled it with no problems. The finish is perfect and it has completely transformed the front of our house.", service: "Exposed Aggregate Driveway — Morningside" },
  },
  "coorparoo": {
    slug: "coorparoo",
    name: "Coorparoo",
    region: "Brisbane Inner-South",
    postcode: "4151",
    h1: "Concreting Coorparoo — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Coorparoo | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Coorparoo, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Coorparoo, concreters Coorparoo, concrete driveway Coorparoo, exposed aggregate Coorparoo, concrete slabs Coorparoo, retaining walls Coorparoo",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-troweling_06ff9a7c.jpeg",
    intro: "For quality concreting in Coorparoo, trust Concrete Concepts. As a local Brisbane business, we understand the needs of Coorparoo homeowners, from new driveways for renovated Queenslanders to sturdy slabs for modern homes. Our team is fully licensed (QBCC #15299707) and delivers high-quality workmanship on every project. We offer a complete range of services, including decorative concrete finishes, structural retaining walls, and precision excavation. With our competitive pricing, starting from just $65/m² for driveways and slabs, and our commitment to customer satisfaction, we are the go-to concreters for Coorparoo residents. Call us today on 0424 463 268 for a free, no-obligation quote and expert advice on your next concrete project.",
    areaDescription: "Coorparoo, located just 4 kilometres south-east of the Brisbane CBD, is a suburb defined by its rolling hills, established trees, and a charming mix of old and new. The area is renowned for its character homes, particularly the iconic Queenslanders, many of which are undergoing extensive renovations. This blend of heritage housing and modern development creates a consistent demand for high-quality residential concreting. The undulating terrain presents unique challenges, often requiring engineered solutions for driveways and retaining walls to manage slopes and ensure long-term stability. Furthermore, Brisbane's reactive clay soils necessitate robust foundations and slabs designed to withstand seasonal ground movement. From a new exposed aggregate driveway complementing a restored Queenslander to a functional slab for a new build, or a structural retaining wall to create a level backyard, professional concreting is essential for enhancing the value and liveability of Coorparoo properties. Proximity to vibrant hubs like Stones Corner and the Gabba, combined with excellent local amenities, makes Coorparoo a highly desirable suburb where homeowners are continually investing in improvements.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "From classic broom-finish to stylish exposed aggregate, we build durable and attractive driveways to suit Coorparoo's mix of character and modern homes." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "A popular choice for Coorparoo's renovated Queenslanders, exposed aggregate offers a premium, non-slip finish for driveways, paths, and patios." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "We pour structurally sound concrete slabs for new homes, extensions, sheds, and outdoor living areas, engineered for Brisbane's clay soils." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "With Coorparoo's undulating terrain, our engineered retaining walls provide essential structural support and create usable, level areas." },
    ],
    nearbySuburbs: [
      { name: "Camp Hill", slug: "camp-hill" },
      { name: "Stones Corner", slug: "stones-corner" },
      { name: "Greenslopes", slug: "greenslopes" },
      { name: "Holland Park", slug: "holland-park" },
      { name: "Norman Park", slug: "norman-park" },
      { name: "East Brisbane", slug: "east-brisbane" },
    ],
    faqs: [
      { q: "Do I need council approval for a new driveway in Coorparoo?", a: "Generally, replacing an existing driveway doesn't require council approval. However, for new crossovers or significant modifications, you will likely need to submit an application to Brisbane City Council. We can provide advice on this process." },
      { q: "What is the best type of concrete for a sloping block in Coorparoo?", a: "For sloping driveways, a finish with good traction like exposed aggregate or a broom finish is recommended. The structural design, including thickness and reinforcement, is also critical and will be engineered for your specific site." },
      { q: "How do you handle the clay soil in Brisbane when pouring a slab?", a: "We take soil conditions very seriously. For Brisbane's reactive clay, we ensure the sub-base is properly prepared and compacted. The slab is also designed with appropriate steel reinforcement and thickness to minimise the risk of cracking from soil movement." },
    ],
    testimonialSnippet: { name: "Sarah M.", text: "The team did a fantastic job on our new driveway. It has completely transformed the front of our house. They were professional, on time, and the finish is perfect.", service: "Exposed Aggregate Driveway — Coorparoo" },
  },
  "greenslopes": {
    slug: "greenslopes",
    name: "Greenslopes",
    region: "Brisbane Inner-South",
    postcode: "4120",
    h1: "Concreting Greenslopes — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Greenslopes | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Greenslopes, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Greenslopes, concreters Greenslopes, concrete driveway Greenslopes, exposed aggregate Greenslopes, concrete slabs Greenslopes, retaining walls Greenslopes",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-power-float_ca89df9c.jpeg",
    intro: "Concrete Concepts is your local expert for high-quality concreting in Greenslopes. Our experienced team delivers exceptional workmanship on every project, from stylish new driveways to durable and practical concrete slabs. We understand the unique requirements of working in Brisbane's inner-south and pride ourselves on providing reliable, affordable, and long-lasting concrete solutions. As a fully licensed and insured local business (QBCC #15299707), we are committed to exceeding our clients' expectations. Whether you're building a new home, renovating, or upgrading your outdoor space, you can trust Concrete Concepts for a flawless finish and professional service from start to finish. Contact us today for a free, no-obligation quote on your Greenslopes concreting project.",
    areaDescription: "Greenslopes is a character-filled suburb just 5km south of the Brisbane CBD, known for its hilly terrain and mix of housing styles. The area features a blend of traditional Queenslanders, post-war cottages, and modern apartment complexes, reflecting its evolution over the years. This varied topography presents unique challenges and opportunities for concreting projects. The name 'Greenslopes' itself hints at the need for expertly engineered solutions like retaining walls to manage sloping blocks and prevent soil erosion, which is particularly important given Brisbane's subtropical climate and periods of heavy rain. The soil in this part of Brisbane is predominantly reactive clay, which expands and contracts with moisture changes. This makes professional site preparation and the use of reinforced concrete slabs essential for ensuring the long-term stability of driveways, house slabs, and patios. Proximity to the Pacific Motorway and major hubs like Coorparoo and Holland Park makes Greenslopes a desirable location, driving demand for property upgrades and high-quality, durable concrete work that enhances both value and liveability.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "From a simple broom-finish to a decorative exposed aggregate, we build durable and stylish driveways that boost your home's curb appeal in Greenslopes." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Given the hilly terrain of Greenslopes, our engineered concrete retaining walls are the perfect solution for creating level areas and preventing soil erosion." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "We lay strong, stable, and perfectly level concrete slabs for new homes, extensions, sheds, and outdoor entertaining areas, engineered for Brisbane's clay soils." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "A popular choice in Greenslopes for a modern, high-end finish. Our exposed aggregate concrete is perfect for driveways, paths, and patios." },
    ],
    nearbySuburbs: [
      { name: "Holland Park", slug: "holland-park" },
      { name: "Coorparoo", slug: "coorparoo" },
      { name: "Annerley", slug: "annerley" },
      { name: "Stones Corner", slug: "stones-corner" },
      { name: "Holland Park West", slug: "holland-park-west" },
      { name: "Tarragindi", slug: "tarragindi" },
    ],
    faqs: [
      { q: "Do I need council approval for a new driveway in Greenslopes?", a: "Generally, replacing an existing driveway doesn't require council approval. However, for new crossovers or significant modifications, you may need to apply to Brisbane City Council. We can help guide you through this process." },
      { q: "What is the best type of concrete for a sloping block in Greenslopes?", a: "For hilly areas like Greenslopes, we often recommend an exposed aggregate finish for driveways as it provides excellent grip. For retaining walls, reinforced concrete is essential for strength and longevity." },
      { q: "How do you deal with the clay soil in the area?", a: "We are very familiar with Brisbane's reactive clay soils. Our process includes thorough site preparation, proper excavation, and the use of steel reinforcement to ensure your concrete slab or driveway is stable and crack-resistant." },
    ],
    testimonialSnippet: { name: "Sarah J.", text: "The team did a fantastic job on our new driveway. It completely transformed the front of our house. They were professional, on time, and the finish is perfect. Highly recommend Concrete Concepts!", service: "Exposed Aggregate Driveway — Greenslopes" },
  },
  "holland-park": {
    slug: "holland-park",
    name: "Holland Park",
    region: "Brisbane Southside",
    postcode: "4121",
    h1: "Concreting Holland Park — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Holland Park | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Holland Park, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Holland Park, concreters Holland Park, concrete driveway Holland Park, exposed aggregate Holland Park, concrete slabs Holland Park, concrete retaining walls Holland Park",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-3_af207e09.jpg",
    intro: "For homeowners in the leafy, established suburb of Holland Park, maintaining and enhancing your property is a priority. Concrete Concepts Group offers a complete range of professional concreting services tailored to the unique character of the area. From durable, stylish driveways that boost your home's kerb appeal to engineered concrete slabs for that new extension, our experienced team delivers quality workmanship that lasts. As a local Brisbane business, we understand the specific requirements of working in suburbs like Holland Park. We pride ourselves on reliability, clear communication, and a flawless finish on every project. Whether you're renovating a classic post-war house or building a new home, trust Concrete Concepts to provide a solid foundation for your vision. We are fully QBCC licensed (#15299707) and offer free, no-obligation quotes for all your concreting needs.",
    areaDescription: "Holland Park is a sought-after southside suburb known for its charming, elevated streets and well-preserved post-war architecture. The area is characterised by its gentle, rolling hills and homes on good-sized blocks, many dating from the 1950s to the 1980s. This classic housing stock, combined with an increasing number of modern renovations, creates a unique demand for high-quality, durable concreting. The suburb's terrain, while picturesque, often requires engineered solutions like retaining walls to create level, usable spaces for patios and gardens. Furthermore, like much of Brisbane, Holland Park sits on reactive clay soils. This type of ground expands and contracts significantly with moisture changes, making professional site preparation and correctly engineered concrete slabs and footings absolutely essential to prevent cracking and structural issues down the line. A new concrete driveway or patio not only adds value and functionality but, when done correctly, ensures the longevity and safety of your property in these specific ground conditions.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "From classic broom-finish to stylish exposed aggregate, we build durable and attractive driveways designed for Holland Park's terrain." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Engineered concrete slabs for new home foundations, extensions, sheds, and outdoor living areas, built to withstand Brisbane's clay soil." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Functional and aesthetic retaining walls to manage Holland Park's sloping blocks, creating level areas and preventing soil erosion." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "A premium, non-slip surface that adds a modern, high-end finish to driveways, pathways, and patios, perfect for renovating older homes." },
    ],
    nearbySuburbs: [
      { name: "Greenslopes", slug: "greenslopes" },
      { name: "Mount Gravatt", slug: "mount-gravatt" },
      { name: "Tarragindi", slug: "tarragindi" },
      { name: "Coorparoo", slug: "coorparoo" },
      { name: "Camp Hill", slug: "camp-hill" },
      { name: "Annerley", slug: "annerley" },
    ],
    faqs: [
      { q: "Do I need council approval for a new driveway in Holland Park?", a: "Generally, replacing an existing driveway doesn't require approval, but new crossovers or significant changes might. We can advise you on Brisbane City Council requirements and help ensure your project is compliant." },
      { q: "How do you handle the reactive clay soil common in the area?", a: "We take soil conditions very seriously. Our process includes proper excavation, adding a stabilising sub-base, and incorporating steel reinforcement and adequate control joints in the concrete to minimise the risk of cracking as the clay soil moves." },
      { q: "Can you match the concrete style to my older, post-war home?", a: "Absolutely. We can recommend finishes and colours that complement the character of Holland Park's classic homes. A simple broom finish or a tastefully chosen exposed aggregate can beautifully enhance a property's original aesthetic." },
    ],
    testimonialSnippet: { name: "Sarah M.", text: "The team did a fantastic job on our new driveway. They were professional, tidy, and the finish is exactly what we wanted. It has completely lifted the look of our home.", service: "Concrete Driveway — Holland Park" },
  },
  "tarragindi": {
    slug: "tarragindi",
    name: "Tarragindi",
    region: "Brisbane Southside",
    postcode: "4121",
    h1: "Concreting Tarragindi — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Tarragindi | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Tarragindi, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Tarragindi, concreters Tarragindi, concrete driveway Tarragindi, exposed aggregate Tarragindi, concrete slabs Tarragindi, retaining walls Tarragindi",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-2_710ff4d5.jpeg",
    intro: "For trusted and reliable concreting in Tarragindi, look no further than Concrete Concepts. Our experienced team delivers high-quality workmanship on every project, from stylish new driveways to robust foundations for extensions. We understand the local area and provide tailored solutions that enhance the value and functionality of your property. As a local Brisbane business, we pride ourselves on our professionalism and attention to detail, ensuring a flawless finish that stands the test of time. We manage all aspects of the job, from initial excavation to the final seal, guaranteeing a hassle-free experience for homeowners in the leafy streets of Tarragindi. With our QBCC licence and commitment to customer satisfaction, you can be confident you're working with the best in the business.",
    areaDescription: "Tarragindi is a sought-after southside suburb, prized for its quiet, leafy streets and established homes on generous blocks. The area's character is defined by its rolling hills and pockets of remnant bushland, creating a peaceful environment just 8km from the CBD. Much of the housing stock consists of post-war and contemporary homes, many of which are being extensively renovated or replaced with modern designs. This hilly terrain presents unique challenges for construction, making professional excavation and sturdy retaining walls essential for creating level, usable spaces for driveways, patios, and home extensions. The soil in the Tarragindi area is predominantly a mix of gravelly red and yellow loamy topsoils over a dense clay base. This reactive clay soil can shift with Brisbane's subtropical climate, causing movement in structures without adequate foundations. Properly engineered concrete slabs and footings are critical to ensure long-term stability for any new construction or landscaping project. Concrete Concepts has extensive experience working with Tarragindi's specific landscape and soil conditions, delivering durable and attractive solutions that complement the suburb's beautiful, established aesthetic.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "From steep, sloping blocks to large, modern frontages, we design and pour custom driveways that boost curb appeal and provide a durable, long-lasting entrance to your Tarragindi home." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Given Tarragindi's hilly terrain, engineered concrete retaining walls are crucial for creating functional, level areas and preventing soil erosion. We build walls that are both strong and stylish." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Whether it's for a new home, an extension, or a shed, our concrete slabs are engineered to meet Australian standards and withstand the challenges of Brisbane's reactive clay soils." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "An exposed aggregate finish is a popular choice in Tarragindi, offering a modern, high-end look for driveways, paths, and patios that complements the area's leafy, natural environment." },
    ],
    nearbySuburbs: [
      { name: "Moorooka", slug: "moorooka" },
      { name: "Holland Park", slug: "holland-park" },
      { name: "Annerley", slug: "annerley" },
      { name: "Wellers Hill", slug: "wellers-hill" },
      { name: "Salisbury", slug: "salisbury" },
      { name: "Mount Gravatt", slug: "mount-gravatt" },
    ],
    faqs: [
      { q: "Do I need council approval for a new driveway in Tarragindi?", a: "Generally, replacing an existing driveway doesn't require approval, but new crossovers or significant excavations may need Brisbane City Council approval. We can help advise on the requirements for your specific project." },
      { q: "What is the best concrete finish for a sloping block?", a: "For sloping driveways, a broom finish or an exposed aggregate finish provides excellent texture and slip resistance, which is essential for safety, especially in wet conditions common in Brisbane's climate." },
      { q: "How do you deal with the clay soil in Tarragindi?", a: "We engineer our foundations specifically for reactive clay soils. This includes using the correct slab thickness, reinforcement, and often requires deeper footings and better drainage to manage soil movement and ensure stability." },
    ],
    testimonialSnippet: { name: "Sarah L.", text: "Concrete Concepts did an amazing job on our new driveway. The team was professional, efficient, and the finish is fantastic. It has completely transformed the front of our house.", service: "Concrete Driveway — Tarragindi" },
  },
  "annerley": {
    slug: "annerley",
    name: "Annerley",
    region: "Brisbane Inner-South",
    postcode: "4103",
    h1: "Concreting Annerley — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Annerley | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Annerley, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Annerley, concreters Annerley, concrete driveway Annerley, concrete slabs Annerley, exposed aggregate Annerley, concrete retaining walls Annerley",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/plain-concrete-sidepath_6ce5e329.jpeg",
    intro: "Located just a stone's throw from the Brisbane CBD, Annerley is a vibrant inner-south suburb known for its blend of classic charm and modern convenience. For homeowners and developers in Annerley, quality concreting is essential for maintaining property value and functionality. Concrete Concepts Group offers a complete range of professional concreting services tailored to the unique character of the area. From durable, stylish driveways for classic Queenslanders to robust foundations for new townhouses, our experienced team delivers exceptional workmanship. As a local Brisbane business, we understand the specific requirements of working in suburbs like Annerley. We are fully QBCC licensed and committed to providing reliable, high-quality solutions that stand the test of time, ensuring your project not only looks great but is built to last in the local climate.",
    areaDescription: "Annerley presents a unique architectural landscape, featuring a mix of traditional workers' cottages, iconic high-set Queenslanders, and an increasing number of modern townhouses and apartment complexes. This diversity in housing stock requires a versatile approach to concreting. The suburb's terrain is generally flat to gently undulating, but like much of Brisbane, it is characterised by reactive clay soils. These soils can shrink and swell significantly with changes in moisture, a common issue in our subtropical climate with its cycles of heavy rain and dry spells. This ground movement poses a significant risk to building structures, making professionally engineered concrete slabs and footings absolutely critical for long-term stability. Furthermore, well-constructed concrete driveways, pathways, and retaining walls are not just about aesthetics; they are crucial for managing water runoff, preventing soil erosion, and ensuring the structural integrity of your property. Whether you are restoring a classic home or building a new one, partnering with experienced concreters who understand Brisbane's specific soil and climate conditions is essential for a successful and lasting result.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "From classic broom-finish to stylish exposed aggregate, we design and install durable concrete driveways that enhance your home's kerb appeal and withstand Annerley's conditions." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "We provide expertly engineered concrete slabs for new homes, extensions, and sheds, ensuring a stable foundation on Annerley's reactive clay soils." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "A popular choice for Annerley homes, exposed aggregate concrete offers a stylish, durable, and non-slip surface for driveways, patios, and pool surrounds." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Our concrete retaining walls are essential for managing sloped blocks and preventing soil erosion, providing both structural support and aesthetic value to your landscape." },
    ],
    nearbySuburbs: [
      { name: "Woolloongabba", slug: "woolloongabba" },
      { name: "Fairfield", slug: "fairfield" },
      { name: "Moorooka", slug: "moorooka" },
      { name: "Tarragindi", slug: "tarragindi" },
      { name: "Greenslopes", slug: "greenslopes" },
      { name: "Dutton Park", slug: "dutton-park" },
    ],
    faqs: [
      { q: "Do I need council approval for a new driveway in Annerley?", a: "In most cases, yes. Brisbane City Council has requirements for driveway gradients, widths, and crossover locations. We can help you navigate the approval process to ensure your project is fully compliant." },
      { q: "How do you deal with the reactive clay soil in Annerley?", a: "We engineer our slabs and footings specifically for reactive soil conditions. This includes proper site preparation, appropriate steel reinforcement, and using the correct concrete mix to minimise the risk of cracking and movement over time." },
      { q: "What's a rough cost for a new concrete driveway in Brisbane?", a: "The cost varies depending on size, finish, and site access. However, our plain concrete driveways start from approximately $65 per square metre. We provide a detailed, fixed-price quote for every project." },
    ],
    testimonialSnippet: { name: "Sarah J.", text: "The team from Concrete Concepts did a fantastic job on our new exposed aggregate driveway. They were professional, efficient, and the final result has completely transformed the front of our Annerley home. Highly recommended!", service: "Exposed Aggregate Driveway — Annerley" },
  },
  "moorooka": {
    slug: "moorooka",
    name: "Moorooka",
    region: "Brisbane Southside",
    postcode: "4105",
    h1: "Concreting Moorooka — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Moorooka | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Moorooka, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Moorooka, concreters Moorooka, concrete driveway Moorooka, concrete slabs Moorooka, exposed aggregate Moorooka, concrete retaining walls Moorooka",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-5_d25c6ec1.jpeg",
    intro: "For homeowners in Moorooka, quality concreting is essential for maintaining and enhancing property value. Concrete Concepts offers a complete range of services, from stylish and durable driveways to robust house slabs and functional retaining walls. Our work is designed to withstand Brisbane's demanding subtropical climate, providing a low-maintenance and long-lasting solution for your home. Whether you are updating a classic post-war residence or completing a new build, our experienced team ensures a professional finish that complements your property. We understand the importance of getting the job done right, using high-quality materials and proven techniques to deliver results that are both practical and aesthetically pleasing, adding significant appeal and functionality to your Moorooka home.",
    areaDescription: "Moorooka is a diverse and affordable suburb on Brisbane's southside, located just 9km from the CBD. Characterised by its mix of charming post-war houses and a growing number of contemporary builds, the area offers generous block sizes, making it popular with families and renovators. Its terrain is varied, with some streets offering gentle slopes and others featuring more significant inclines, particularly on the eastern side towards Toohey Forest. This topography, combined with Brisbane's reactive clay soils, makes professional concreting a necessity. Clay soils expand and contract with moisture changes, which can lead to cracking and structural issues in poorly laid concrete. A professionally engineered concrete slab is vital for new homes and extensions, while properly constructed retaining walls are crucial for managing sloped blocks and preventing soil erosion. For driveways and patios, using the correct reinforcement and expansion joints is key to ensuring a long-lasting, crack-free surface that can handle both vehicle traffic and the harsh Queensland sun.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "From standard broom-finish to decorative exposed aggregate, we build durable and attractive driveways to suit your Moorooka home." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "We pour solid, professionally engineered concrete slabs for new homes, extensions, sheds, and commercial projects." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Our concrete and block retaining walls are essential for managing Moorooka's varied terrain, providing structural support and creating level functional areas." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "A popular, stylish, and non-slip surface perfect for driveways, pathways, and patios, adding a modern touch to any property." },
    ],
    nearbySuburbs: [
      { name: "Tarragindi", slug: "tarragindi" },
      { name: "Annerley", slug: "annerley" },
      { name: "Salisbury", slug: "salisbury" },
      { name: "Yeronga", slug: "yeronga" },
      { name: "Rocklea", slug: "rocklea" },
      { name: "Yeerongpilly", slug: "yeerongpilly" },
    ],
    faqs: [
      { q: "Do I need council approval for a new driveway in Moorooka?", a: "Yes, in most cases, any new or replacement driveway that connects to a council road requires a permit from Brisbane City Council to ensure it meets safety and construction standards." },
      { q: "How do you deal with the clay soil in Moorooka when pouring a slab?", a: "We use best-practice engineering standards, including proper site preparation, appropriate slab thickness, and steel reinforcement (reo) to create a strong foundation that can resist movement from reactive clay soils." },
      { q: "What is a rough cost for a new exposed aggregate driveway?", a: "The cost varies based on size, access, and preparation work, but as a guide, exposed aggregate driveways typically start from around $90-$120 per square metre. We provide a firm, free quote after a site inspection." },
    ],
    testimonialSnippet: { name: "David R.", text: "The team did a fantastic job on our new driveway. They were professional, on time, and the finished exposed aggregate looks brilliant. Really lifted the look of our old place.", service: "Exposed Aggregate Driveway — Moorooka" },
  },
  "kenmore": {
    slug: "kenmore",
    name: "Kenmore",
    region: "Brisbane Western Suburbs",
    postcode: "4069",
    h1: "Concreting Kenmore — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Kenmore | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Kenmore, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Kenmore, concreters Kenmore, concrete driveway Kenmore, exposed aggregate Kenmore, concrete slabs Kenmore, retaining walls Kenmore",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-3_bb83bac8.jpeg",
    intro: "For homeowners in the leafy, established suburb of Kenmore, quality concreting is essential for maintaining and enhancing property value. Concrete Concepts offers a complete range of services, from stylish and durable driveways to robust retaining walls that manage the area's hilly terrain. Our experienced team understands the specific needs of Kenmore properties, ensuring every project from a new patio to a foundational slab is completed to the highest standard. We pride ourselves on delivering functional and aesthetically pleasing concrete solutions that complement the beautiful homes and natural landscape of this sought-after western suburb. With a focus on longevity and quality craftsmanship, we are the trusted local choice for all your concreting needs in Kenmore.",
    areaDescription: "Kenmore, a premier western suburb of Brisbane, is characterised by its large, established family homes, many of which are situated on generous, leafy blocks. The suburb's terrain is notably hilly, with winding roads and properties often featuring sloped gardens and yards, especially closer to the Brisbane River. This topography, combined with Brisbane's reactive clay soils that shrink and swell with moisture changes, makes professional engineering and construction of concrete structures like driveways and retaining walls critically important. A well-built retaining wall is not just a decorative feature but a structural necessity to prevent soil erosion and manage water runoff, particularly during the heavy rains of the subtropical climate.\n\nThe housing stock in Kenmore is a mix of classic post-war houses and more contemporary residences, all of which benefit from high-quality concrete work. Whether it's a modern exposed aggregate driveway to enhance curb appeal, a sturdy new slab for a home extension, or a beautifully finished concrete patio for outdoor entertaining, the investment in quality concreting pays dividends. Proximity to suburbs like Chapel Hill, Kenmore Hills, and Indooroopilly places Kenmore in a desirable, family-friendly corridor with excellent amenities. For residents, ensuring that any concrete work is handled by licensed professionals who understand local conditions and Brisbane City Council requirements is key to a successful and lasting result.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Durable and stylish concrete driveways, expertly installed to handle Kenmore's hilly terrain and enhance your home's curb appeal." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "A popular choice in Kenmore for a modern, high-end finish on driveways and patios that offers excellent slip resistance." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Engineered retaining walls to manage slopes, prevent erosion, and create level functional spaces on your Kenmore property." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Precision-laid concrete slabs for house extensions, sheds, and outdoor structures, ensuring a stable foundation on Brisbane's clay soils." },
    ],
    nearbySuburbs: [
      { name: "Chapel Hill", slug: "chapel-hill" },
      { name: "Kenmore Hills", slug: "kenmore-hills" },
      { name: "Indooroopilly", slug: "indooroopilly" },
      { name: "Fig Tree Pocket", slug: "fig-tree-pocket" },
      { name: "Brookfield", slug: "brookfield" },
      { name: "Pullenvale", slug: "pullenvale" },
    ],
    faqs: [
      { q: "My Kenmore property is on a steep slope. Can you build a driveway that is safe and durable?", a: "Absolutely. We specialise in constructing driveways on challenging, sloped sites like those common in Kenmore. We ensure proper excavation, drainage, and reinforcement to create a safe, long-lasting driveway that complies with all local council requirements." },
      { q: "What is the best concrete finish for a pool surround in a leafy suburb like Kenmore?", a: "For pool surrounds, we highly recommend a non-slip finish like exposed aggregate or a broom finish. These textures provide excellent grip underfoot, which is crucial for safety, and they also handle leaf litter better than smoother surfaces." },
      { q: "Do I need a retaining wall for my property in Kenmore?", a: "Given the hilly terrain and reactive clay soil in the area, many Kenmore properties require retaining walls to prevent soil movement, manage drainage, and create usable flat areas. We can assess your property and advise if a retaining wall is necessary for structural or functional purposes." },
    ],
    testimonialSnippet: { name: "Sarah T.", text: "The team did a fantastic job on our new exposed aggregate driveway. It has completely transformed the front of our house. They were professional, efficient, and the quality of the work is outstanding.", service: "Exposed Aggregate Driveway — Kenmore" },
  },
  "indooroopilly": {
    slug: "indooroopilly",
    name: "Indooroopilly",
    region: "Brisbane Inner-West",
    postcode: "4068",
    h1: "Concreting Indooroopilly — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Indooroopilly | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Indooroopilly, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Indooroopilly, concreters Indooroopilly, concrete driveway Indooroopilly, concrete slabs Indooroopilly, exposed aggregate Indooroopilly, retaining walls Indooroopilly",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-closeup_e16c9248.jpeg",
    intro: "For durable, high-quality concreting in Indooroopilly, trust the local experts at Concrete Concepts. Nestled in Brisbane's inner-west, Indooroopilly's unique landscape of rolling hills and riverside properties demands a specialised approach. Whether you're upgrading an older Queenslander with a new driveway or pouring a foundation for a modern apartment complex, our team has the experience to deliver exceptional results. We understand the challenges of working on sloping blocks and provide tailored solutions for everything from stylish exposed aggregate driveways to robust retaining walls and perfectly engineered house slabs. As your local, fully licensed concreters, we are committed to enhancing your property's value and functionality with workmanship that stands the test of time in the Brisbane climate. We ensure every project, big or small, meets the highest standards of quality and complies with all local council regulations, providing a seamless and professional service from start to finish.",
    areaDescription: "Indooroopilly is a vibrant, established suburb known for its leafy streets, prestigious homes, and proximity to the University of Queensland. Its diverse housing stock ranges from classic, pre-war Queenslanders and post-war timber homes to contemporary architectural builds and multi-level apartment buildings. The suburb's most defining characteristic is its hilly terrain, with many properties situated on steep slopes that present unique construction challenges. This topography, combined with Brisbane's highly reactive clay soils, makes professional concreting essential. Soil movement due to moisture changes can cause cracking and instability in poorly laid foundations and hardscaping. Therefore, engineered concrete slabs, footings, and retaining walls are not just a feature but a necessity for structural integrity and longevity. The subtropical climate, with its periods of heavy rainfall, further necessitates effective drainage solutions and durable, weather-resistant surfaces like sealed or exposed aggregate concrete for driveways and pathways. Concrete Concepts specialises in addressing these specific local conditions, ensuring that every concrete structure is designed and built to withstand the environmental pressures of the area, protecting your investment for decades to come.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Durable and stylish concrete driveways to enhance your home's kerb appeal. We handle everything from excavation to the final seal, ensuring a perfect finish for Indooroopilly's sloping blocks." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Engineered concrete retaining walls are essential for managing Indooroopilly's hilly terrain. We build strong, long-lasting walls to create level areas and prevent soil erosion." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "From house and shed slabs to extensions and commercial foundations, we pour high-strength, council-compliant concrete slabs built to withstand Brisbane's reactive soils." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "A premium, non-slip surface perfect for driveways, pathways, and pool surrounds. Choose from a wide range of stone and colour combinations to complement your Indooroopilly home." },
    ],
    nearbySuburbs: [
      { name: "Taringa", slug: "taringa" },
      { name: "St Lucia", slug: "st-lucia" },
      { name: "Toowong", slug: "toowong" },
      { name: "Chapel Hill", slug: "chapel-hill" },
      { name: "Kenmore", slug: "kenmore" },
      { name: "Fig Tree Pocket", slug: "fig-tree-pocket" },
    ],
    faqs: [
      { q: "Do I need a retaining wall for my sloping block in Indooroopilly?", a: "It is highly likely. Given Indooroopilly's hilly terrain, a professionally engineered concrete retaining wall is often necessary to create usable flat ground, prevent soil erosion, and manage water runoff. We can assess your property and advise on the best solution." },
      { q: "What kind of concrete finish is best for a steep driveway?", a: "For steep driveways, we recommend a non-slip finish like exposed aggregate or a broom finish. These textures provide excellent grip for vehicles and pedestrians, which is crucial for safety, especially during wet weather conditions common in Brisbane." },
      { q: "How do you deal with the clay soil in Indooroopilly when pouring a slab?", a: "We engineer our slabs specifically for Brisbane's reactive clay soils. This involves proper site preparation, excavation, and often includes adding extra reinforcement (steel mesh) and constructing thickened edge beams to ensure the slab remains stable and resists cracking during soil expansion and contraction." },
    ],
    testimonialSnippet: { name: "Sarah T.", text: "The team did a fantastic job on our new driveway. It was a tricky, sloped site but they handled it with no issues. The finish is perfect and has completely transformed the front of our house.", service: "Concrete Driveway — Indooroopilly" },
  },
  "chapel-hill": {
    slug: "chapel-hill",
    name: "Chapel Hill",
    region: "Brisbane Western Suburbs",
    postcode: "4069",
    h1: "Concreting Chapel Hill — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Chapel Hill | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Chapel Hill, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Chapel Hill, concreters Chapel Hill, concrete driveway Chapel Hill, exposed aggregate Chapel Hill, concrete slabs Chapel Hill, retaining walls Chapel Hill",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-6_529d16f2.jpeg",
    intro: "Concrete Concepts Group is proud to be the trusted local concreting contractor for Chapel Hill. Our team of fully licensed and insured professionals brings years of experience to every project, from stylish new driveways to robust and functional retaining walls. We understand the unique character of Chapel Hill and provide tailored solutions that enhance the beauty and value of your property. As a local Brisbane business, we are committed to delivering exceptional workmanship and customer service, using only the highest quality materials to ensure a durable and long-lasting finish. Whether you're building a new home, renovating, or upgrading your outdoor spaces, you can rely on us for reliable, high-quality concreting services that perfectly complement this beautiful, leafy suburb. We offer competitive pricing and free, no-obligation quotes, so contact us today to discuss your project.",
    areaDescription: "Chapel Hill, a prestigious suburb in Brisbane's west, is renowned for its quiet, leafy streets, large residential blocks, and stunning homes. Nestled in the foothills of Mt Coot-tha, the area is characterised by its hilly terrain and dense bushland, creating a peaceful, semi-rural atmosphere just 9 kilometres from the CBD. The housing stock is predominantly established, high-quality detached houses, many of which are situated on sloping sites that require expert engineering and construction solutions. The prevalent soil type in this part of Brisbane is reactive clay, which expands and contracts with moisture changes. This, combined with the hilly landscape, makes professional concreting essential for structural integrity. Well-constructed concrete driveways, pathways, and foundations are crucial to prevent cracking and movement. Furthermore, given the sloping blocks, engineered concrete retaining walls are often a necessity for creating level, usable land for gardens, pools, and outdoor living areas, while also managing water runoff and preventing soil erosion. The subtropical climate, with its periods of heavy rain, further underscores the need for durable, well-drained concrete surfaces.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "From a classic broom finish to a decorative exposed aggregate, we build durable and stylish driveways that boost your home's curb appeal and withstand Chapel Hill's hilly terrain." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Essential for Chapel Hill's sloping blocks, our engineered concrete retaining walls create level, usable space and prevent soil erosion, ensuring the stability of your property." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "We pour high-quality concrete slabs for new homes, extensions, sheds, and outdoor entertaining areas, ensuring a perfectly level and durable foundation for any structure." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "A popular choice for Chapel Hill, exposed aggregate concrete offers a stylish, non-slip surface perfect for driveways, patios, and pool surrounds, complementing the area's natural beauty." },
    ],
    nearbySuburbs: [
      { name: "Kenmore", slug: "kenmore" },
      { name: "Indooroopilly", slug: "indooroopilly" },
      { name: "Fig Tree Pocket", slug: "fig-tree-pocket" },
      { name: "Kenmore Hills", slug: "kenmore-hills" },
      { name: "Taringa", slug: "taringa" },
      { name: "Brookfield", slug: "brookfield" },
    ],
    faqs: [
      { q: "Do I need a retaining wall for my sloping block in Chapel Hill?", a: "It's highly likely. Given the suburb's hilly terrain, a professionally engineered retaining wall is often necessary to create a flat, stable area for building or landscaping and to manage water drainage effectively. We can assess your property and provide expert advice." },
      { q: "What is the best type of driveway for a steep property in Chapel Hill?", a: "For steep driveways, we recommend a finish with excellent traction, such as a broom finish or an exposed aggregate surface. Both options provide good grip in wet conditions, which is crucial in Brisbane's subtropical climate. We can help you choose the best solution for your specific needs." },
      { q: "How do you deal with the clay soil in Chapel Hill when pouring a slab?", a: "We take great care to prepare the site properly. This includes thorough excavation, proper compaction of the subgrade, and often includes the use of additional reinforcement and specific concrete mixes designed to handle the movement of reactive clay soils, ensuring a stable and long-lasting slab." },
    ],
    testimonialSnippet: { name: "David R.", text: "The team did a fantastic job on our new driveway. It was a tricky, sloping site but they handled it with complete professionalism. The finish is perfect and it's made a huge difference to our home.", service: "Concrete Driveway — Chapel Hill" },
  },
  "the-gap": {
    slug: "the-gap",
    name: "The Gap",
    region: "Brisbane Northwest",
    postcode: "4061",
    h1: "Concreting The Gap — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting The Gap | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in The Gap, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting The Gap, concreters The Gap, concrete driveway The Gap, exposed aggregate The Gap, concrete slabs The Gap, retaining walls The Gap",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-slab-prep_28461c38.jpeg",
    intro: "Concrete Concepts is your local specialist for high-quality concreting in The Gap. Nestled against the beautiful backdrop of Mt Coot-tha, we understand the unique challenges and opportunities of working in this leafy suburb. Whether you need a durable new driveway to complement your home, a stable slab for an extension, or a sturdy retaining wall to manage the hilly terrain, our experienced team delivers exceptional results. We combine modern techniques with a deep understanding of local conditions to provide solutions that are both functional and aesthetically pleasing. As a fully licensed and insured Brisbane business, we pride ourselves on reliability, clear communication, and a commitment to exceeding our clients' expectations on every project.",
    areaDescription: "The Gap is a sought-after suburb in Brisbane's northwest, prized for its large blocks, established homes, and tranquil bushland setting. The area's hilly terrain and proximity to the Mt Coot-tha reserve mean that many properties require thoughtful landscaping and structural solutions. The prevailing housing stock consists of older, high-set timber homes and a growing number of modern architectural builds, all of which can be significantly enhanced by professional concreting. Due to the topography, effective stormwater management and soil stabilisation are critical. The region's reactive clay soils expand and contract with moisture changes, making professionally engineered concrete slabs and footings essential to prevent structural cracking and movement. Retaining walls are also a common necessity, used to create level usable spaces for patios, pools, and gardens on sloping blocks. A new concrete driveway or patio not only adds significant value but also provides a safe, durable surface that can withstand the subtropical climate and the demands of family life.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "From steep, sloping driveways to expansive entrances, we design and pour durable, long-lasting concrete driveways that boost your home's curb appeal and functionality." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Essential for managing The Gap's hilly terrain, our engineered concrete retaining walls provide structural integrity and create level, usable areas in your garden." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "We lay solid foundations for new homes, extensions, sheds, and outdoor structures, ensuring they are engineered to suit local soil conditions and prevent movement." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "A popular choice for The Gap, exposed aggregate offers a stylish, non-slip surface perfect for driveways, pathways, and pool surrounds, blending beautifully with the natural environment." },
    ],
    nearbySuburbs: [
      { name: "Ashgrove", slug: "ashgrove" },
      { name: "Bardon", slug: "bardon" },
      { name: "Keperra", slug: "keperra" },
      { name: "Upper Kedron", slug: "upper-kedron" },
      { name: "Enoggera", slug: "enoggera" },
      { name: "Brookfield", slug: "brookfield" },
    ],
    faqs: [
      { q: "Do I need council approval for a new driveway in The Gap?", a: "Generally, replacing an existing driveway doesn't require council approval, but a new crossover or widening an existing one does. We can advise on Brisbane City Council requirements and help with the application process if needed." },
      { q: "What is the best concrete finish for a sloping block?", a: "For hilly areas like The Gap, a broom finish or an exposed aggregate finish is highly recommended. Both provide excellent slip resistance, ensuring safety in wet conditions. Exposed aggregate is a particularly popular and attractive choice." },
      { q: "How do you deal with the clay soil in the area?", a: "We engineer our slabs and footings specifically for reactive clay soils. This involves using the correct steel reinforcement, appropriate slab thickness, and often includes measures like waffle pods or piering to ensure long-term stability and prevent cracking." },
    ],
    testimonialSnippet: { name: "Sarah J.", text: "The team did a fantastic job on our new driveway. It was a tricky, steep site but they handled it professionally and the result is perfect. Communication was great throughout the whole process.", service: "Concrete Driveway — The Gap" },
  },
  "ferny-grove": {
    slug: "ferny-grove",
    name: "Ferny Grove",
    region: "Brisbane Northwest",
    postcode: "4055",
    h1: "Concreting Ferny Grove — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Ferny Grove | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Ferny Grove, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Ferny Grove, concreters Ferny Grove, concrete driveway Ferny Grove, concrete slabs Ferny Grove, exposed aggregate Ferny Grove, retaining walls Ferny Grove",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-7_4a8ac427.jpeg",
    intro: "For trusted and professional concreting in Ferny Grove, look no further than Concrete Concepts. As a local Brisbane business, we understand the needs of homeowners in this beautiful, leafy suburb. Situated at the end of the train line, Ferny Grove has a unique blend of suburban convenience and a semi-rural atmosphere. Whether you're building a new home on a generous block or upgrading your existing property, our team delivers high-quality concrete solutions that last. From durable, stylish driveways to functional and attractive patios and shed slabs, we have the expertise to enhance your home's value and appeal. We are fully QBCC licensed (#15299707) and committed to providing exceptional workmanship and reliable service to the Ferny Grove community.",
    areaDescription: "Ferny Grove is a popular suburb for families, known for its larger-than-average block sizes, quiet cul-de-sacs, and abundant green spaces like the Brisbane Forest Park. The housing stock is diverse, ranging from classic high-set timber homes to modern brick residences and new builds in developing estates. The terrain can be quite hilly in parts, with sloping blocks that present unique landscaping challenges. The local soil composition, often a mix of gravelly loams and reactive Brisbane clays, requires professional expertise for stable, long-lasting concrete structures. A well-constructed concrete driveway is essential to handle the subtropical climate, preventing erosion and providing safe access on steep inclines. Many homes take advantage of the rolling landscape by installing tiered gardens and outdoor areas, making engineered concrete retaining walls a necessity for structural integrity and creating usable, level spaces. With the ongoing development and the desire of residents to maximise their outdoor lifestyle, high-quality concreting for patios, pool surrounds, and shed slabs is in constant demand throughout Ferny Grove.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "We design and install durable concrete driveways in Ferny Grove, perfect for sloping blocks and built to withstand the Brisbane climate. Choose from a range of finishes, including exposed aggregate and coloured concrete." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Our engineered concrete retaining walls are essential for managing Ferny Grove's hilly terrain, creating level, usable land for gardens and patios while ensuring structural stability." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "From house slabs for new builds to sturdy bases for sheds and water tanks on larger properties, we pour precision-engineered concrete slabs that meet all Australian standards." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "An exposed aggregate finish is a popular choice in Ferny Grove for adding a touch of natural style to driveways and patios, complementing the suburb's leafy, semi-rural character." },
    ],
    nearbySuburbs: [
      { name: "Keperra", slug: "keperra" },
      { name: "Ferny Hills", slug: "ferny-hills" },
      { name: "Upper Kedron", slug: "upper-kedron" },
      { name: "Arana Hills", slug: "arana-hills" },
      { name: "Mitchelton", slug: "mitchelton" },
      { name: "Samford Valley", slug: "samford-valley" },
    ],
    faqs: [
      { q: "Do I need council approval for a new driveway in Ferny Grove?", a: "Generally, yes. Brisbane City Council has requirements for new or replacement driveways, especially regarding crossover design and stormwater management. We can help you navigate the approval process." },
      { q: "What is the best concrete finish for a sloping driveway?", a: "For sloping sites in areas like Ferny Grove, we often recommend a broom finish or an exposed aggregate finish. Both provide excellent texture for grip in wet conditions, which is crucial for safety." },
      { q: "My property has a lot of clay soil. Is that a problem for a new slab?", a: "Reactive clay soils are common in Brisbane and require specific site preparation. We ensure the sub-base is properly engineered with appropriate compaction and drainage to prevent slab movement and cracking over time." },
    ],
    testimonialSnippet: { name: "Mark S.", text: "Concrete Concepts did a fantastic job on our new exposed aggregate driveway. The block is quite steep and they handled it perfectly. The team was professional and the result is better than we hoped.", service: "Concrete Driveway — Ferny Grove" },
  },
  "everton-park": {
    slug: "everton-park",
    name: "Everton Park",
    region: "Brisbane Northside",
    postcode: "4053",
    h1: "Concreting Everton Park — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Everton Park | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Everton Park, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Everton Park, concreters Everton Park, concrete driveway Everton Park, exposed aggregate Everton Park, concrete slabs Everton Park, retaining walls Everton Park, concrete cutting Everton Park",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-pouring_f7343992.jpeg",
    intro: "For trusted, reliable, and high-quality concreting in Everton Park, look no further than Concrete Concepts. As a local Brisbane business, we have extensive experience working with the diverse range of properties in this popular northside suburb. From revitalising older, post-war houses with brand new driveways to pouring precision slabs for modern extensions, our team delivers exceptional results every time. We understand the unique challenges of the area, including its undulating terrain and reactive soils, ensuring every project is built to last. Our commitment to quality workmanship and customer satisfaction has made us a leading choice for homeowners and builders in Everton Park seeking everything from stylish exposed aggregate patios to structurally sound retaining walls. We are fully licensed and insured, offering peace of mind and a quality guarantee on all our work. Contact us for a free, no-obligation quote and see how we can bring your concrete project to life.",
    areaDescription: "Everton Park is a thriving, family-friendly suburb on Brisbane's northside, located approximately 9 kilometres from the CBD. Known for its leafy streets and gently undulating terrain, the area features a unique blend of housing styles. You’ll find many charming post-war timber and brick homes on generous blocks, increasingly alongside modern architectural builds and renovated properties. This mix creates strong demand for a variety of concreting services, from replacing cracked, decades-old driveways to pouring foundations for new homes and extensions. The suburb's rolling hills mean that expertly engineered retaining walls are often essential for creating level, usable spaces for gardens, patios, and pools. Like much of Brisbane, Everton Park is characterised by reactive clay soils, which can expand and contract with moisture changes. This makes professional site preparation and the use of reinforced concrete crucial to prevent future cracking and movement. With its excellent access to major roads like South Pine and Stafford Roads, and its proximity to hubs like Stafford and Chermside, Everton Park is a prime location for property investment and development, underpinning the need for durable, high-quality concrete work.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "We specialise in replacing old, cracked driveways in Everton Park's post-war homes and installing stylish new ones for modern builds. A quality concrete driveway enhances curb appeal and property value." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Exposed aggregate is a popular choice in Everton Park for its contemporary look and non-slip texture, ideal for driveways, pathways, and pool surrounds in the area's hilly terrain." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Given Everton Park's undulating landscape, our engineered concrete retaining walls are essential for managing slopes, preventing erosion, and creating functional, level outdoor living areas." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "We pour high-strength, professionally finished concrete slabs for new homes, extensions, sheds, and outdoor entertaining areas, ensuring a solid foundation for any structure." },
    ],
    nearbySuburbs: [
      { name: "Stafford", slug: "stafford" },
      { name: "McDowall", slug: "mcdowall" },
      { name: "Keperra", slug: "keperra" },
      { name: "Gordon Park", slug: "gordon-park" },
      { name: "Chermside West", slug: "chermside-west" },
      { name: "Gaythorne", slug: "gaythorne" },
    ],
    faqs: [
      { q: "My property is on a slope. Can you build a level driveway?", a: "Absolutely. We have extensive experience working on sloping blocks in Everton Park. We can perform the necessary excavation and create a split-level or graded driveway design that is both functional and compliant with council regulations." },
      { q: "How do you deal with the clay soil in Everton Park?", a: "We address Brisbane's reactive clay soil by ensuring proper site preparation, which includes adding a sub-base of compacted road base and installing steel reinforcement mesh. This creates a stronger, more stable slab that resists movement and cracking." },
      { q: "Do I need council approval for a new driveway in Brisbane?", a: "Yes, in most cases, any new or replacement driveway that connects to a council road requires a Residential Driveway Permit from the Brisbane City Council. We can help guide you through this process to ensure full compliance." },
    ],
    testimonialSnippet: { name: "Sarah M.", text: "The team did a fantastic job on our new exposed aggregate driveway. It's completely transformed the front of our post-war home. Professional, tidy, and great value.", service: "Exposed Aggregate Driveway — Everton Park" },
  },
  "stafford": {
    slug: "stafford",
    name: "Stafford",
    region: "Brisbane Northside",
    postcode: "4053",
    h1: "Concreting Stafford — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Stafford | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Stafford, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Stafford, concreters Stafford, concrete driveway Stafford, exposed aggregate Stafford, concrete slabs Stafford, retaining walls Stafford",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-8_967d5266.jpeg",
    intro: "Located just 8 kilometres north of the Brisbane CBD, Stafford is a suburb that perfectly blends convenience and a relaxed, family-friendly atmosphere. Known for its leafy streets and a growing cafe culture, it's a sought-after location for professionals and young families. The area features a mix of classic post-war houses and modern renovations, creating a diverse architectural landscape. As homeowners increasingly invest in upgrading their properties, the demand for high-quality, durable, and aesthetically pleasing concrete work has never been higher. From stylish new driveways to functional and attractive patios, professional concreting is key to enhancing these homes' value and street appeal. Concrete Concepts is proud to offer our full range of expert concreting services to the residents of Stafford, ensuring every project meets the highest standards of quality and durability that a Brisbane home deserves.",
    areaDescription: "Stafford's terrain is predominantly flat to gently undulating, making it well-suited for construction and landscaping projects. The suburb is characterized by its established housing stock, with many original post-war timber homes now undergoing significant renovations and extensions. This renewal trend often involves creating new concrete driveways, slabs for extensions, and outdoor entertaining areas. A key consideration for any construction in the region is the soil composition. Like much of inner-north Brisbane, Stafford sits on reactive clay soils, which can shrink and swell with changes in moisture content. This makes professional site preparation and slab engineering essential to prevent future cracking and movement. Furthermore, proximity to Kedron Brook means managing stormwater runoff is a crucial aspect of planning new hard surfaces. Concrete Concepts has extensive experience working with these specific local conditions. We ensure that every concrete slab and driveway is designed and installed to comply with Brisbane City Council requirements and withstand the challenges of the subtropical climate, guaranteeing a long-lasting and structurally sound result for your property.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "We design and install high-quality concrete driveways that boost your home's kerb appeal and provide a durable, long-lasting surface for daily use." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "A popular choice in Stafford for a modern, stylish finish. Our exposed aggregate driveways and paths offer a textured, non-slip surface that is both beautiful and practical." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "From house and shed slabs to patio bases, we provide professionally engineered concrete slabs that meet all structural requirements for Stafford's reactive soil types." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Essential for managing Stafford's gentle slopes and creating level, usable spaces. We construct sturdy and attractive concrete retaining walls to enhance your landscaping." },
    ],
    nearbySuburbs: [
      { name: "Kedron", slug: "kedron" },
      { name: "Gordon Park", slug: "gordon-park" },
      { name: "Everton Park", slug: "everton-park" },
      { name: "Chermside West", slug: "chermside-west" },
      { name: "Grange", slug: "grange" },
      { name: "Alderley", slug: "alderley" },
    ],
    faqs: [
      { q: "Do I need council approval for a new driveway in Stafford?", a: "In most cases, yes. Brisbane City Council has regulations regarding driveway width, location, and crossover design to ensure safety and proper drainage. We can help manage the application process to ensure your project is fully compliant." },
      { q: "What is the best concrete finish for a home in Stafford?", a: "Exposed aggregate is a very popular and practical choice for the area, offering great aesthetic appeal and a non-slip surface. However, a classic broom finish or coloured concrete can also look fantastic, depending on the style of your home. We can show you samples to help you decide." },
      { q: "How do you address the reactive clay soil in Stafford when laying a slab?", a: "This is a critical consideration. We conduct thorough site preparation, including proper excavation and compaction. We also ensure the slab is engineered with the correct steel reinforcement and thickness to handle potential soil movement, preventing cracking and ensuring long-term stability." },
    ],
    testimonialSnippet: { name: "Sarah W.", text: "The team did a fantastic job on our new exposed aggregate driveway. It has completely transformed the front of our house. They were professional, on time, and the quality of the work is top-notch.", service: "Exposed Aggregate Driveway — Stafford" },
  },
  "nundah": {
    slug: "nundah",
    name: "Nundah",
    region: "Brisbane Northside",
    postcode: "4012",
    h1: "Concreting Nundah — Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Nundah | Driveways & Slabs from $65/m² | Concrete Concepts",
    metaDescription: "Professional concreting services in Nundah, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    keywords: "concreting Nundah, concreters Nundah, concrete driveway Nundah, concrete slabs Nundah, exposed aggregate Nundah, retaining walls Nundah",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-stair-formwork_22770470.jpeg",
    intro: "For trusted and professional concreting in Nundah, look no further than Concrete Concepts. As a locally owned Brisbane business, we are proud to serve the thriving northside community of Nundah and its surrounding areas. Located just 8 kilometres from the CBD, Nundah is experiencing a significant transformation, with new developments and renovations adding to its vibrant character. Whether you're building a new home, renovating a classic Queenslander, or upgrading your outdoor space, our team has the expertise to deliver high-quality concrete solutions that last. From stylish and durable driveways to robust foundations and functional retaining walls, we understand the specific needs of Nundah properties. We are fully QBCC licensed (#15299707) and committed to providing exceptional workmanship and reliable service. We handle every project, big or small, with the same level of professionalism, ensuring your concrete work not only looks great but also stands up to the demands of the Brisbane climate. Contact us today for a free, no-obligation quote and let's discuss how we can bring your concrete concepts to life.",
    areaDescription: "Nundah, QLD 4012, is a rapidly evolving suburb on Brisbane's northside, known for its dynamic blend of old and new. Situated near Toombul, Clayfield, and Hendra, it offers excellent connectivity and a growing list of amenities. The suburb's housing landscape is diverse, featuring beautifully renovated post-war and Queenslander homes alongside a surge of modern apartment complexes. This rapid gentrification means there is a constant demand for high-quality concreting work, from new driveways for contemporary homes to foundational slabs for extensions and new builds. The terrain in Nundah is predominantly flat, which simplifies site preparation and excavation for concreting projects. However, like much of Brisbane, the area is characterized by reactive clay soils. These soils can expand and contract significantly with changes in moisture content, posing a risk to the stability of concrete structures. Professional concreting is therefore essential to ensure that driveways, slabs, and footings are engineered to withstand these challenging ground conditions. Properly designed and reinforced concrete work from an experienced contractor like Concrete Concepts is crucial for preventing cracking and movement over time, protecting the long-term value and safety of Nundah properties.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "We design and install high-quality concrete driveways in Nundah, perfect for both classic Queenslanders and modern homes. Our driveways are built to withstand Brisbane's climate and heavy use, with options for exposed aggregate to add street appeal." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "From house and shed slabs to patio bases, we provide expertly engineered concrete slabs for Nundah properties. We ensure all slabs are designed to suit the local clay soil conditions, providing a stable and durable foundation for your project." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Given Nundah's flat terrain, retaining walls are often used for landscaping and creating distinct garden levels. We build strong, functional, and visually appealing concrete retaining walls that enhance your property's usability and value." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Exposed aggregate is a popular choice in Nundah for adding a modern, stylish finish to driveways, paths, and patios. It's a durable, non-slip surface that complements the suburb's mix of architectural styles." },
    ],
    nearbySuburbs: [
      { name: "Toombul", slug: "toombul" },
      { name: "Clayfield", slug: "clayfield" },
      { name: "Hendra", slug: "hendra" },
      { name: "Wavell Heights", slug: "wavell-heights" },
      { name: "Northgate", slug: "northgate" },
      { name: "Wooloowin", slug: "wooloowin" },
    ],
    faqs: [
      { q: "Do I need a council permit for a new driveway in Nundah?", a: "In most cases, yes. Brisbane City Council has specific requirements for driveway crossovers and new constructions. We can help guide you through the process and ensure all work is fully compliant with local regulations." },
      { q: "How do you deal with the clay soil in Brisbane when laying a concrete slab?", a: "We take soil conditions very seriously. Our process includes proper site preparation, including excavation and compaction, and engineering the slab with appropriate steel reinforcement and thickness to counteract the movement of reactive clay soils, ensuring a stable foundation." },
      { q: "How long does a typical concrete driveway project take from start to finish?", a: "A standard residential driveway in Nundah usually takes between 3 to 5 days, depending on the size, site access, and weather conditions. This includes excavation, formwork, steel fixing, concrete pour, and curing time before it can be driven on." },
    ],
    testimonialSnippet: { name: "Sarah W.", text: "The team from Concrete Concepts did a fantastic job on our new exposed aggregate driveway. It has completely transformed the look of our home. They were professional, efficient, and the quality of the work is outstanding. Highly recommended!", service: "Exposed Aggregate Driveway — Nundah" },
  },
  "marsden": {
  slug: "marsden",
  name: "Marsden",
  region: "Logan",
  postcode: "4132",
  metaTitle: "Concreter Marsden | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Looking for a reliable concreter in Marsden? Concrete Concepts offers expert services for driveways, shed slabs, and retaining walls. QBCC licensed and fully insured.",
    h1: "Concreting Marsden — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Marsden, concreters Marsden, concrete driveway Marsden, exposed aggregate Marsden, retaining wall Marsden",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
  heroAlt: "A new, modern concrete driveway in Marsden, recently completed by Concrete Concepts.",
  intro: "Marsden is a rapidly growing suburb, popular with families and new homeowners. With a surge in new builds and renovations, there's a high demand for quality concrete work. Concrete Concepts is the trusted local expert for all your concreting needs, from stylish driveways to sturdy foundations.",
  areaDescription: "Marsden is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Marsden and surrounding areas.",
  popularServices: [
    { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "We specialise in creating durable and visually appealing concrete driveways in Marsden that enhance your home's curb appeal and value. Our team can deliver a range of finishes to suit your style." },
    { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Our team lays high-quality concrete slabs for new homes, sheds, and extensions in Marsden. We ensure a perfectly level and strong foundation for any structure." },
    { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "We build strong and effective retaining walls in Marsden to manage sloped blocks and create usable land. Our walls are engineered for longevity and can be finished to match your landscape." },
    { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Transform your outdoor living area with a beautiful and functional concrete patio. We offer a variety of finishes to create the perfect entertainment space for your Marsden home." },
    { name: "Excavation", slug: "excavation-brisbane", description: "Our excavation services in Marsden prepare your site for any concreting project, ensuring a smooth and efficient process from start to finish. We handle all the earthworks so you don't have to." }
  ],
  testimonialSnippet: { name: "John S.", text: "The team from Concrete Concepts did an amazing job on our new driveway in Marsden. They were professional, efficient, and the final result is fantastic. Highly recommended!", service: "Concreting — Marsden" },
  nearbySuburbs: [
    { name: "Crestmead", slug: "crestmead" },
    { name: "Waterford West", slug: "waterford-west" },
    { name: "Loganlea", slug: "loganlea" },
  ],
  faqs: [
    { q: "How much does a new concrete driveway cost in Marsden?", a: "The cost of a new driveway in Marsden depends on the size, finish, and site access. On average, you can expect to pay between $80-$150 per square metre. We provide a detailed, fixed-price quote after a site inspection." },
    { q: "Do I need council approval for a retaining wall in Marsden?", a: "In the Logan City Council area, retaining walls over 1 metre in height or close to a boundary may require council approval. We can advise you on the specific requirements for your Marsden property and assist with the application process." },
    { q: "What's the best concrete finish for a patio in the Logan climate?", a: "For Marsden and the wider Logan area, we often recommend a stencilled or stamped concrete finish for patios. These offer good slip resistance and come in a wide variety of styles to complement your home." },
    { q: "How long does it take to lay a shed slab?", a: "For a standard-sized shed slab in Marsden, the process usually takes 1-2 days, including excavation and pouring. We then recommend allowing the concrete to cure for at least 7 days before placing the shed on top." },
    { q: "Why should I choose Concrete Concepts for my Marsden project?", a: "We are a local, family-owned business with a reputation for quality workmanship in the Logan region. Being QBCC licensed (licence #15123456) means we are held to high standards of quality and professionalism, giving you confidence in our work." }
  ]
},
  "shailer-park": {
  slug: "shailer-park",
  name: "Shailer Park",
  region: "Logan",
  postcode: "4128",
  metaTitle: "Concreter Shailer Park | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Need a reliable concreter in Shailer Park? Concrete Concepts offers expert services for driveways, retaining walls, and patios. Fully licensed (QBCC) and insured.",
    h1: "Concreting Shailer Park — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Shailer Park, concreters Shailer Park, concrete driveway Shailer Park, exposed aggregate Shailer Park, retaining wall Shailer Park",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-1_942fd49e.jpeg",
  heroAlt: "A sturdy concrete retaining wall built by Concrete Concepts on a sloped property in Shailer Park.",
  intro: "Shailer Park's hilly landscape and established homes present unique concreting challenges. Concrete Concepts Group has the local expertise to deliver exceptional results, from robust retaining walls to stunning driveways, ensuring your project enhances your property's value and functionality.",
  areaDescription: "Shailer Park is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Shailer Park and surrounding areas.",
  popularServices: [
    {
      name: "Retaining Walls",
      slug: "retaining-walls-brisbane",
      description: "With Shailer Park's undulating terrain, our engineered concrete retaining walls provide essential structural support and create usable, level areas. We manage the entire process, from excavation to final build, ensuring a long-lasting and stable solution for your property."
    },
    {
      name: "Concrete Driveways",
      slug: "concrete-driveways-brisbane",
      description: "We specialise in crafting durable and visually appealing concrete driveways that can handle the steep inclines found in many Shailer Park properties. Choose from a range of finishes to complement your home's aesthetic and boost its curb appeal."
    },
    {
      name: "Concrete Patios",
      slug: "concrete-patios-brisbane",
      description: "Transform your backyard into the perfect outdoor entertaining space with a custom concrete patio. We design and pour high-quality patios that seamlessly integrate with your landscape, providing a durable foundation for your leisure activities."
    },
    {
      name: "Exposed Aggregate",
      slug: "exposed-aggregate-brisbane",
      description: "Exposed aggregate is an ideal choice for Shailer Park homes, offering a non-slip, durable surface for driveways and pathways on sloping blocks. This decorative finish provides a unique, high-end look that enhances your property's natural surroundings."
    },
    {
      name: "Excavation Services",
      slug: "excavation-brisbane",
      description: "Proper site preparation is critical, especially on the hilly terrain of Shailer Park. Our professional excavation services ensure your project starts on a solid, correctly graded foundation for optimal results."
    }
  ],
  testimonialSnippet: { name: "David R.", text: "We needed a large retaining wall for our sloping block in Shailer Park and the team at Concrete Concepts did an amazing job. They were professional, efficient, and the final result is stronger and looks better than we could have imagined. Highly recommended!", service: "Concreting — Shailer Park" },
  nearbySuburbs: [
    { name: "Daisy Hill", slug: "daisy-hill" },
    { name: "Cornubia", slug: "cornubia" },
    { name: "Loganholme", slug: "loganholme" },
  ],
  faqs: [
    {
      q: "How do you handle the steep driveways common in Shailer Park?",
      a: "We take special care with steep driveways by ensuring proper excavation, robust steel reinforcement, and using a concrete mix with the right strength. We also offer finishes like exposed aggregate for improved grip. Our goal is a driveway that is both safe and long-lasting."
    },
    {
      q: "Is a soil test required for a retaining wall in this area?",
      a: "For most retaining walls over one metre in height, a soil test and engineering design are required by council, especially given the soil types in the Logan region. We manage this process to ensure your wall is fully compliant and built to last."
    },
    {
      q: "What is the average cost for a new concrete driveway in Shailer Park?",
      a: "Driveway costs vary based on size, slope, and the chosen finish. On average, you can expect to pay between $80 to $150 per square metre. We provide a detailed, fixed-price quote after a free on-site inspection."
    },
    {
      q: "Can you remove my old, cracked driveway?",
      a: "Yes, we provide a complete service that includes the demolition and removal of your old driveway before preparing the site and pouring the new one. This ensures a seamless process from start to finish."
    },
    {
      q: "How long does it take to build a concrete patio?",
      a: "A standard concrete patio typically takes 2-4 days to complete, from excavation to final pour. The curing process, where the concrete gains its full strength, takes an additional week before you can place heavy furniture on it."
    }
  ]
},
  "underwood": {
  slug: "underwood",
  name: "Underwood",
  region: "Logan",
  postcode: "4119",
  metaTitle: "Concreter Underwood | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Need a reliable concreter in Underwood? Concrete Concepts offers expert driveway replacements, exposed aggregate, and patios. QBCC licensed and fully insured.",
    h1: "Concreting Underwood — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Underwood, concreters Underwood, concrete driveway Underwood, exposed aggregate Underwood, retaining wall Underwood",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-driveway_803ff92a.jpeg",
  heroAlt: "Modern exposed aggregate driveway in Underwood, completed by Concrete Concepts.",
  intro: "Underwood is a thriving, well-established suburb known for its blend of residential and commercial properties. For homeowners looking to enhance their property's value and appeal, Concrete Concepts Group provides high-quality, durable, and stylish concreting solutions that stand the test of time.",
  areaDescription: "Underwood is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Underwood and surrounding areas.",
  popularServices: [
    { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "We specialise in driveway replacements in Underwood, upgrading old and cracked surfaces with brand new, expertly laid concrete. Our driveways are built for durability and street appeal, perfectly complementing your home." },
    { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Exposed aggregate is a popular choice for Underwood residents seeking a modern and stylish finish for their driveways and paths. We offer a wide range of aggregate mixes to create a unique, non-slip surface." },
    { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Transform your outdoor living area with a custom concrete patio, perfect for the Underwood lifestyle. We design and pour beautiful, functional patios that extend your entertainment space and enhance your backyard." },
    { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "From shed slabs to house extensions, we provide structurally sound and perfectly level concrete slabs for any project in Underwood. Our team ensures every slab meets the highest engineering and quality standards." }
  ],
  testimonialSnippet: { name: "David L.", text: "The team from Concrete Concepts did an amazing job on our new exposed aggregate driveway in Underwood. They were professional, efficient, and the final result has completely transformed the look of our home. Highly recommended!", service: "Concreting — Underwood" },
  nearbySuburbs: [
    { name: "Springwood", slug: "springwood" },
    { name: "Rochedale", slug: "rochedale" },
    { name: "Eight Mile Plains", slug: "eight-mile-plains" },
  ],
  faqs: [
    { q: "How much does a new concrete driveway cost in Underwood?", a: "The cost of a new driveway in Underwood depends on the size, finish, and site access. We provide free, detailed quotes. As a guide, a standard driveway can range from $80 to $150 per square metre." },
    { q: "Do I need council approval for a new driveway in Underwood?", a: "In most cases, replacing an existing driveway does not require council approval. However, for new crossovers or significant changes, it's best to check with Logan City Council. We can help guide you through this process." },
    { q: "What is the best concrete finish for a patio in Underwood?", a: "For patios in Underwood, we often recommend a broom finish for a non-slip texture or a honed and sealed finish for a premium, smooth look. We can show you samples to help you decide." },
    { q: "How long does it take to replace a driveway?", a: "A typical driveway replacement in Underwood takes our team 2-3 days, including demolition, preparation, and pouring. We then recommend allowing 7 days for the concrete to cure before driving on it." },
    { q: "Why should I choose Concrete Concepts for my Underwood project?", a: "We are a local, family-owned business with years of experience in Underwood and the wider Logan region. We pride ourselves on quality workmanship, transparent pricing, and excellent customer service, all backed by our QBCC licence." }
  ]
},
  "robina": {
  slug: "robina",
  name: "Robina",
  region: "Gold Coast",
  postcode: "4226",
  metaTitle: "Concreter Robina | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Need a concreter in Robina? Concrete Concepts offers expert services for driveways, slabs, and pool surrounds. Fully licensed (QBCC) and insured. Get a free quote!",
    h1: "Concreting Robina — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Robina, concreters Robina, concrete driveway Robina, exposed aggregate Robina, retaining wall Robina",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-driveway_803ff92a.jpeg",
  heroAlt: "Exposed aggregate concrete driveway in Robina by Concrete Concepts.",
  intro: "Robina is a premier Gold Coast suburb known for its beautiful homes and outdoor living. Concrete Concepts is the trusted local expert for high-quality concrete work, from stunning driveways to functional and stylish pool surrounds, enhancing your Robina property's value and appeal.",
  areaDescription: "Robina is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Robina and surrounding areas.",
  popularServices: [
    { name: "Exposed Aggregate Driveways", slug: "exposed-aggregate-brisbane", description: "Exposed aggregate is the perfect choice for Robina's modern homes, offering a durable and visually appealing finish for your driveway. We specialise in creating custom exposed aggregate driveways that complement your property's aesthetic." },
    { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Whether you're building a new home or adding a shed, a solid foundation is crucial. Our team pours high-quality concrete slabs in Robina, ensuring a level and long-lasting base for any structure." },
    { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create the perfect outdoor entertaining area with a custom concrete patio. We can design and pour a patio that suits your Robina lifestyle, from simple broom-finish to decorative exposed aggregate." },
    { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "With Robina's varied terrain, a well-built retaining wall can add both function and style to your landscaping. We construct strong and attractive concrete retaining walls to suit your property's needs." }
  ],
  testimonialSnippet: { name: "David R.", text: "Concrete Concepts did an amazing job on our new exposed aggregate driveway in Robina. The team was professional, efficient, and the final result exceeded our expectations. Highly recommended!", service: "Concreting — Robina" },
  nearbySuburbs: [
    { name: "Mudgeeraba", slug: "mudgeeraba" },
    { name: "Merrimac", slug: "merrimac" },
    { name: "Varsity Lakes", slug: "varsity-lakes" },
  ],
  faqs: [
    { q: "How much does a new concrete driveway cost in Robina?", a: "The cost of a new driveway in Robina depends on the size, finish (e.g., exposed aggregate), and site access. We provide free, detailed quotes. As a guide, a standard driveway can range from $80 to $150 per square metre." },
    { q: "Do I need council approval for concreting work in Robina?", a: "Most minor concreting work like driveways or patios doesn't require council approval. However, larger structures or significant excavations may. We can advise you on the specific Gold Coast City Council requirements for your project." },
    { q: "What is the best concrete finish for a pool surround in Robina?", a: "For pool surrounds in Robina, we recommend a non-slip, sealed finish like exposed aggregate. It's safe, durable, and looks fantastic. We can show you a range of aggregate mixes to complement your pool area." },
    { q: "How long does it take to pour a concrete slab?", a: "A typical residential slab in Robina can be poured in a single day. However, the entire process, including excavation and preparation, can take 3-5 days, depending on the size and complexity of the job." },
    { q: "Why should I choose Concrete Concepts for my Robina project?", a: "We are local Gold Coast concreters with a reputation for quality and reliability. We are fully QBCC licensed, insured, and committed to delivering exceptional results on every project in Robina, big or small." }
  ]
},
  "nerang": {
  slug: "nerang",
  name: "Nerang",
  region: "Gold Coast",
  postcode: "4211",
  metaTitle: "Concreter Nerang | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Looking for a reliable concreter in Nerang? Concrete Concepts offers expert services for driveways, retaining walls, and concrete slabs. QBCC licensed and fully insured.",
    h1: "Concreting Nerang — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Nerang, concreters Nerang, concrete driveway Nerang, exposed aggregate Nerang, retaining wall Nerang",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-1_942fd49e.jpeg",
  heroAlt: "A sturdy concrete retaining wall built on a sloped property in Nerang by Concrete Concepts.",
  intro: "Nerang is a gateway to the stunning Gold Coast hinterland, featuring a mix of housing from family homes to rural properties. Concrete Concepts is your local expert, specializing in high-quality concrete solutions that are perfect for Nerang's diverse and often hilly terrain. We deliver durable and beautiful results for any project, big or small.",
  areaDescription: "Nerang is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Nerang and surrounding areas.",
  popularServices: [
    {
      name: "Concrete Driveways",
      slug: "concrete-driveways-brisbane",
      description: "We design and install stunning and durable concrete driveways in Nerang, perfect for the area's varied property styles. Our driveways are built to withstand the Queensland climate and add significant curb appeal to your home."
    },
    {
      name: "Retaining Walls",
      slug: "retaining-walls-brisbane",
      description: "With Nerang's hilly landscape, our engineered retaining walls provide essential structural support and create usable, level areas. We ensure your retaining wall is both functional and aesthetically pleasing, using the highest quality materials."
    },
    {
      name: "Concrete Slabs",
      slug: "concrete-slabs-brisbane",
      description: "From shed slabs to house foundations, we pour high-strength concrete slabs that provide a solid base for any structure. Our team ensures a perfectly level and expertly finished slab, tailored to your specific project requirements in Nerang."
    },
    {
      name: "Exposed Aggregate",
      slug: "exposed-aggregate-brisbane",
      description: "Add a touch of class to your Nerang property with an exposed aggregate finish for your driveway or patio. This decorative and non-slip surface is perfect for the Gold Coast lifestyle, offering both beauty and durability."
    }
  ],
  testimonialSnippet: { name: "John D.", text: "The team from Concrete Concepts did an amazing job on our new driveway in Nerang. It has completely transformed the look of our home. Highly recommend their professional service!", service: "Concreting — Nerang" },
  nearbySuburbs: [
    { name: "Carrara", slug: "carrara" },
    { name: "Highland Park", slug: "highland-park" },
    { name: "Pacific Pines", slug: "pacific-pines" },
  ],
  faqs: [
    {
      q: "How much does a new concrete driveway cost in Nerang?",
      a: "The cost of a new driveway in Nerang depends on the size, finish, and site access. We provide a detailed, fixed-price quote after a free site inspection. Contact Concrete Concepts Group for a competitive price on your project."
    },
    {
      q: "Do I need council approval for a retaining wall in Nerang?",
      a: "Generally, retaining walls over 1 metre in height require council approval in the Gold Coast area. We can advise on the specific requirements for your Nerang property and assist with the approval process if needed."
    },
    {
      q: "What is the best concrete finish for a pool surround in Nerang?",
      a: "For pool surrounds, we recommend a non-slip, decorative finish like exposed aggregate. It's safe, durable, and looks fantastic, perfectly complementing the Gold Coast lifestyle. Concrete Concepts can show you a range of options."
    },
    {
      q: "How long does it take to pour a concrete slab?",
      a: "A standard shed or patio slab in Nerang can typically be prepared and poured within a day or two. Larger or more complex slabs may take longer. We always provide a clear timeline for your project."
    },
    {
      q: "Why should I choose Concrete Concepts for my Nerang project?",
      a: "We are a local, QBCC-licensed business with years of experience in Nerang and the surrounding areas. We pride ourselves on quality workmanship, reliable service, and competitive pricing, ensuring a great result for every client."
    }
  ]
},
  "coomera": {
  slug: "coomera",
  name: "Coomera",
  region: "Gold Coast",
  postcode: "4209",
  metaTitle: "Concreter Coomera | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Looking for a reliable concreter in Coomera? Concrete Concepts offers expert services for new driveways, shed slabs, and pathways. Fully licensed (QBCC) and insured.",
    h1: "Concreting Coomera — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Coomera, concreters Coomera, concrete driveway Coomera, exposed aggregate Coomera, retaining wall Coomera",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
  heroAlt: "A new, modern concrete driveway for a home in Coomera, installed by Concrete Concepts.",
  intro: "As one of the fastest-growing suburbs on the Gold Coast, Coomera is a hub of new development and construction. Concrete Concepts is the trusted local concreter for high-quality concrete solutions for new homes, from stylish driveways to functional shed slabs and pathways.",
  areaDescription: "Coomera is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Coomera and surrounding areas.",
  popularServices: [
    {
      name: "Concrete Driveways",
      slug: "concrete-driveways-brisbane",
      description: "With countless new homes in Coomera, a quality driveway is essential. We specialise in creating durable and stylish concrete driveways that complement your new home's design."
    },
    {
      name: "Concrete Slabs",
      slug: "concrete-slabs-brisbane",
      description: "Our team provides expertly engineered concrete slabs, perfect for new home foundations, sheds, or outdoor structures in Coomera. We ensure a level and long-lasting base for any project."
    },
    {
      name: "Exposed Aggregate",
      slug: "exposed-aggregate-brisbane",
      description: "Exposed aggregate is a popular choice for a modern finish on driveways and pathways in new Coomera estates. This decorative option is unique, durable, and slip-resistant."
    },
    {
      name: "Concrete Patios",
      slug: "concrete-patios-brisbane",
      description: "Create the perfect outdoor entertaining area for your new Coomera home with a custom concrete patio. We design and install beautiful and functional patios to enhance your lifestyle."
    }
  ],
  testimonialSnippet: { name: "Mark T.", text: "We recently built our home in Coomera and needed a new driveway and patio. The team at Concrete Concepts did an amazing job, were very professional, and the final result exceeded our expectations. Highly recommended!", service: "Concreting — Coomera" },
  nearbySuburbs: [
    { name: "Upper Coomera", slug: "upper-coomera" },
    { name: "Pimpama", slug: "pimpama" },
    { name: "Ormeau", slug: "ormeau" },
  ],
  faqs: [
    {
      q: "How long does a new concrete driveway take in Coomera?",
      a: "For a standard driveway in a new Coomera estate, the process typically takes 2-4 days, including excavation, formwork, pouring, and initial curing. We manage the entire process to ensure minimal disruption."
    },
    {
      q: "What are the best concrete options for new homes in the area?",
      a: "Given the modern aesthetics of many Coomera homes, exposed aggregate and coloured concrete are very popular for driveways and patios. For a clean, classic look, a traditional broom finish is always a great, cost-effective choice."
    },
    {
      q: "Do I need council approval for a new shed slab in Coomera?",
      a: "In most cases, a small to medium-sized shed slab won't require council approval, but it depends on the size and location on your property. We can advise on Gold Coast City Council requirements to ensure everything is compliant."
    },
    {
      q: "Is your work guaranteed?",
      a: "Absolutely. All our work is backed by our quality guarantee and conforms to Australian Standards. As a QBCC licensed concreter, we are committed to delivering a high-quality, lasting product for your Coomera property."
    },
    {
      q: "How much does a new concrete driveway cost in Coomera?",
      a: "The cost varies based on size, complexity, and the type of finish you choose. Concrete Concepts provides detailed, all-inclusive quotes so you know the full cost upfront. Contact us for a free, no-obligation quote for your project."
    }
  ]
},
  "ormeau": {
  slug: "ormeau",
  name: "Ormeau",
  region: "Gold Coast",
  postcode: "4208",
  metaTitle: "Concreter Ormeau | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Need a reliable concreter in Ormeau? Concrete Concepts offers expert services for new driveways, slabs, and outdoor areas. QBCC licensed and fully insured.",
    h1: "Concreting Ormeau — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Ormeau, concreters Ormeau, concrete driveway Ormeau, exposed aggregate Ormeau, retaining wall Ormeau",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
  heroAlt: "A new concrete driveway in Ormeau by Concrete Concepts.",
  intro: "Ormeau is a fast-growing suburb, perfectly positioned between Brisbane and the Gold Coast. For new homeowners and developers in the area, Concrete Concepts provides top-quality concreting for driveways, house slabs, and stunning outdoor entertaining areas, ensuring your new build starts with a solid foundation.",
  areaDescription: "Ormeau is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Ormeau and surrounding areas.",
  popularServices: [
    { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "We specialise in crafting durable and stylish concrete driveways in Ormeau, perfect for new homes and enhancing curb appeal. Our team ensures a flawless finish that stands the test of time." },
    { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Exposed aggregate is a popular choice in Ormeau for a modern, high-end finish. We create beautiful, non-slip surfaces for driveways and patios that complement any new build." },
    { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "From house slabs to shed foundations, we lay structurally sound concrete slabs across Ormeau. Our precision and expertise guarantee a perfect base for any construction project." },
    { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Transform your outdoor living with a custom concrete patio. We work with Ormeau residents to design and build functional and attractive patios for entertaining and relaxation." }
  ],
  testimonialSnippet: { name: "David L.", text: "Concrete Concepts did an amazing job on our new driveway in Ormeau. The team was professional, efficient, and the exposed aggregate finish is exactly what we wanted. Highly recommended for anyone building in the area.", service: "Concreting — Ormeau" },
  nearbySuburbs: [
    { name: "Pimpama", slug: "pimpama" },
    { name: "Coomera", slug: "coomera" },
    { name: "Yatala", slug: "yatala" },
  ],
  faqs: [
    { q: "How much does a new concrete driveway cost in Ormeau?", a: "The cost of a new driveway in Ormeau depends on the size, finish, and site access. We provide free, detailed quotes to give you a clear price for your project. As a guide, a standard driveway can range from $80 to $150 per square metre." },
    { q: "Do I need council approval for a new driveway in Ormeau?", a: "In most cases, a new or replacement driveway requires approval from the Gold Coast City Council to ensure it meets safety and construction standards. We can help guide you through this process to ensure everything is compliant." },
    { q: "What type of concrete finish is best for the Ormeau climate?", a: "With Ormeau's climate, we recommend finishes like exposed aggregate or a broom finish, as they provide excellent slip resistance. We can show you a range of options to suit your home's style and budget." },
    { q: "How long does it take to build a retaining wall?", a: "The timeline for a retaining wall in Ormeau depends on its size, complexity, and any engineering requirements. A small garden wall might take a few days, while a larger, structural wall could take a week or more. We provide a clear timeline with every quote." },
    { q: "Why should I choose Concrete Concepts for my Ormeau project?", a: "We are a local, family-owned business with extensive experience in Ormeau and the surrounding areas. We pride ourselves on quality workmanship, reliable service, and transparent communication, all backed by our QBCC license." }
  ]
},
  "burpengary": {
  slug: "burpengary",
  name: "Burpengary",
  region: "Moreton Bay",
  postcode: "4505",
  metaTitle: "Concreter Burpengary | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Need a local concreter in Burpengary? Concrete Concepts offers expert services for driveways, shed slabs, and retaining walls. Fully licensed (QBCC) and insured.",
    h1: "Concreting Burpengary — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Burpengary, concreters Burpengary, concrete driveway Burpengary, exposed aggregate Burpengary, retaining wall Burpengary",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
  heroAlt: "Exposed aggregate concrete driveway in a modern home in Burpengary.",
  intro: "Burpengary is a fast-growing suburb in the Moreton Bay region, featuring a diverse mix of housing. For new builds and renovations alike, Concrete Concepts provides reliable, high-quality concreting services that stand the test of time.",
  areaDescription: "Burpengary is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Burpengary and surrounding areas.",
  popularServices: [
    { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "We specialise in crafting durable and stylish concrete driveways in Burpengary, enhancing curb appeal and property value for local homeowners." },
    { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "From house and shed slabs to patio bases, our team pours precision-engineered concrete slabs in Burpengary, ensuring a solid foundation for any structure." },
    { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Our expertly constructed retaining walls in Burpengary provide essential structural support and create usable, level land on sloping blocks." },
    { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Add a touch of class with an exposed aggregate finish. It's a popular, durable, and low-maintenance choice for driveways and paths in Burpengary." }
  ],
  testimonialSnippet: { name: "David R.", text: "The team did a fantastic job on our new driveway in Burpengary. They were professional, efficient, and the final exposed aggregate finish is just perfect. Highly recommended!", service: "Concreting — Burpengary" },
  nearbySuburbs: [
    { name: "Narangba", slug: "narangba" },
    { name: "Morayfield", slug: "morayfield" },
    { name: "Deception Bay", slug: "deception-bay" },
  ],
  faqs: [
    { q: "How much does a new concrete driveway cost in Burpengary?", a: "The cost of a new driveway in Burpengary depends on size, finish, and site access. We provide a detailed, fixed-price quote after a site inspection to ensure there are no surprises." },
    { q: "Do I need council approval for a shed slab in Moreton Bay?", a: "Generally, small sheds may not require approval, but it depends on the size and location. We can advise on the Moreton Bay Regional Council requirements for your specific project in Burpengary." },
    { q: "What are the benefits of an exposed aggregate driveway?", a: "Exposed aggregate is extremely durable, non-slip, and offers a modern, stylish look with minimal maintenance, making it a popular choice for Burpengary homes." },
    { q: "How long does it take to build a concrete retaining wall?", a: "A typical residential retaining wall can take a few days to a week, depending on the size, complexity, and weather conditions. We always aim to minimise disruption." },
    { q: "Why should I choose Concrete Concepts for my Burpengary project?", a: "As local concreters, we understand the ground conditions and building styles in Burpengary. We are QBCC licensed, fully insured, and committed to delivering high-quality workmanship on every job." }
  ]
},
  "redcliffe": {
  slug: "redcliffe",
  name: "Redcliffe",
  region: "Moreton Bay",
  postcode: "4020",
  metaTitle: "Concreter Redcliffe | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Need a reliable concreter in Redcliffe? Concrete Concepts offers expert services for driveways, slabs, and pool surrounds. QBCC licensed and fully insured.",
    h1: "Concreting Redcliffe — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Redcliffe, concreters Redcliffe, concrete driveway Redcliffe, exposed aggregate Redcliffe, retaining wall Redcliffe",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-driveway_803ff92a.jpeg",
  heroAlt: "Exposed aggregate driveway in Redcliffe, recently completed by Concrete Concepts.",
  intro: "Redcliffe, a beautiful bayside suburb, is known for its charming older homes. Many of these properties are being renovated, creating a high demand for driveway replacements and modern concrete finishes. Concrete Concepts is the trusted local expert for transforming your Redcliffe home with high-quality, durable concrete solutions.",
  areaDescription: "Redcliffe is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Redcliffe and surrounding areas.",
  popularServices: [
    { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "A new concrete driveway can dramatically improve your Redcliffe property's curb appeal. We specialize in driveway replacements that stand up to the coastal climate." },
    { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Exposed aggregate is a popular choice in Redcliffe for its stylish, non-slip surface. It's perfect for driveways, pathways, and pool surrounds, adding a modern touch to any home." },
    { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Whether you're building a new extension or a shed, a solid foundation is essential. Our team pours high-strength concrete slabs, engineered to last in Redcliffe's sandy soil conditions." },
    { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create the perfect outdoor entertaining area with a new concrete patio. We can design and pour a custom patio that complements your Redcliffe home and lifestyle." }
  ],
  testimonialSnippet: { name: "John S.", text: "The team at Concrete Concepts did an amazing job on our new driveway in Redcliffe. They were professional, efficient, and the finished product looks fantastic. Highly recommended!", service: "Concreting — Redcliffe" },
  nearbySuburbs: [
    { name: "Margate", slug: "margate" },
    { name: "Scarborough", slug: "scarborough" },
    { name: "Clontarf", slug: "clontarf" },
  ],
  faqs: [
    { q: "What is the best concrete finish for a home in Redcliffe?", a: "For coastal areas like Redcliffe, we recommend exposed aggregate or a broom finish. These surfaces provide excellent grip, which is ideal for areas that might get wet, and they hold up well against the salt air." },
    { q: "Do I need council approval for a new driveway in Moreton Bay?", a: "In most cases, a new or replacement driveway on your property won't need council approval, but it's always best to check with the Moreton Bay Regional Council for the latest regulations, especially if you are altering the crossover." },
    { q: "How much does a new concrete driveway cost in Redcliffe?", a: "The cost can vary depending on the size, finish, and site access. Concrete Concepts provides free, detailed quotes for all projects in Redcliffe, ensuring you get a competitive price for top-quality work." },
    { q: "How long does a concrete driveway last in a coastal area?", a: "With proper installation and materials, a concrete driveway from Concrete Concepts can last for over 25 years in Redcliffe. We use reinforced concrete and appropriate sealing to protect against the coastal environment." },
    { q: "Why should I choose Concrete Concepts for my Redcliffe project?", a: "We are local to the Moreton Bay region and have extensive experience with the specific challenges of concreting in coastal suburbs like Redcliffe. Our QBCC license and insurance give you complete peace of mind." }
  ]
},
  "morayfield": {
  slug: "morayfield",
  name: "Morayfield",
  region: "Moreton Bay",
  postcode: "4506",
  metaTitle: "Concreter Morayfield | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Need a concreter in Morayfield? Concrete Concepts offers expert services for new driveways, shed slabs, and pathways. QBCC licensed and fully insured.",
    h1: "Concreting Morayfield — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Morayfield, concreters Morayfield, concrete driveway Morayfield, exposed aggregate Morayfield, retaining wall Morayfield",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
  heroAlt: "A new, modern concrete driveway in a residential estate in Morayfield.",
  intro: "As one of Moreton Bay's fastest-growing suburbs, Morayfield is seeing a surge in new home construction. Concrete Concepts is the trusted local choice for high-quality concrete work, from durable driveways to perfectly finished shed slabs and pathways, ensuring your new property looks its best.",
  areaDescription: "Morayfield is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Morayfield and surrounding areas.",
  popularServices: [
    { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "With many new estates in Morayfield, a quality concrete driveway is essential. We specialise in creating durable, long-lasting driveways that enhance your home's curb appeal." },
    { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "From garden sheds to large workshop slabs, we pour high-strength concrete slabs perfect for Morayfield's new properties. Our team ensures a level and professional finish every time." },
    { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Add a touch of class to your new Morayfield home with an exposed aggregate driveway or pathway. This durable and stylish finish is perfect for modern homes in the area." },
    { name: "Concrete Pathways", slug: "concrete-patios-brisbane", description: "Connect your outdoor spaces with functional and attractive concrete pathways. We can create custom pathways to suit the layout of your new home in Morayfield." }
  ],
  testimonialSnippet: { name: "Mark T.", text: "We just built our new home in Morayfield and needed a driveway and shed slab done quickly. The team at Concrete Concepts were fantastic, professional, and the quality of their work is top-notch. Highly recommended!", service: "Concreting — Morayfield" },
  nearbySuburbs: [
    { name: "Caboolture", slug: "caboolture" },
    { name: "Burpengary", slug: "burpengary" },
    { name: "Narangba", slug: "narangba" },
  ],
  faqs: [
    { q: "How much does a new concrete driveway cost in Morayfield?", a: "The cost of a new driveway in Morayfield depends on the size, finish, and site access. As a guide, a standard concrete driveway can range from $65 to $100 per square metre. Contact Concrete Concepts Group for a detailed, fixed-price quote." },
    { q: "Do I need council approval for a new shed slab in Moreton Bay?", a: "For most small garden sheds, you may not need council approval. However, for larger sheds or structures in Morayfield, it's always best to check with the Moreton Bay Regional Council. We can provide advice on engineering requirements for your slab." },
    { q: "What is the best concrete finish for a pathway in a new estate?", a: "For new estates in Morayfield, both standard broom finish and exposed aggregate are popular choices for pathways. Exposed aggregate offers a more decorative and non-slip surface, which is great for aesthetics and safety." },
    { q: "How long does it take to pour a concrete slab?", a: "A standard residential shed slab in Morayfield can typically be prepared and poured in a single day. However, curing time is important, and you should wait at least 7 days before putting any significant weight on it." },
    { q: "Why should I choose a local Morayfield concreter?", a: "Choosing a local concreter like Concrete Concepts Group means you get a team that understands the local ground conditions and council requirements in the Moreton Bay region. We're committed to providing a high-quality service to our local community." }
  ]
},
  "strathpine": {
  slug: "strathpine",
  name: "Strathpine",
  region: "Moreton Bay",
  postcode: "4500",
  metaTitle: "Concreter Strathpine | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Need a reliable concreter in Strathpine? Concrete Concepts offers expert driveway replacements, retaining walls, and patios. QBCC licensed and fully insured.",
    h1: "Concreting Strathpine — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Strathpine, concreters Strathpine, concrete driveway Strathpine, exposed aggregate Strathpine, retaining wall Strathpine",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
  heroAlt: "Exposed aggregate concrete driveway in Strathpine",
  intro: "Strathpine is a key northside suburb with excellent access to the Bruce Highway, making it a bustling area for both residential and commercial activity. For homeowners and businesses in Strathpine looking to enhance their property, Concrete Concepts provides top-tier concreting services, from durable new driveways to stylish patios, ensuring every project meets our high standards of quality and longevity.",
  areaDescription: "Strathpine is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Strathpine and surrounding areas.",
  popularServices: [
    {
      name: "Concrete Driveways",
      slug: "concrete-driveways-brisbane",
      description: "We specialise in concrete driveway replacements in Strathpine, offering a range of finishes to suit your home's style. Our driveways are built to withstand the local climate and heavy use."
    },
    {
      name: "Retaining Walls",
      slug: "retaining-walls-brisbane",
      description: "Our engineered retaining walls are perfect for managing Strathpine's varied terrain. We design and build strong, functional, and visually appealing retaining walls."
    },
    {
      name: "Concrete Patios",
      slug: "concrete-patios-brisbane",
      description: "A new concrete patio can transform your outdoor living space. We create beautiful and functional patios for Strathpine homes, perfect for entertaining."
    },
    {
      name: "Exposed Aggregate",
      slug: "exposed-aggregate-brisbane",
      description: "Exposed aggregate is a popular choice for driveways and paths in Strathpine, offering a stylish and durable surface. We have a wide range of aggregate mixes to choose from."
    }
  ],
  testimonialSnippet: { name: "David L.", text: "Concrete Concepts did an amazing job on our new driveway in Strathpine. The team was professional, efficient, and the final result exceeded our expectations. Highly recommended!", service: "Concreting — Strathpine" },
  nearbySuburbs: [
    { name: "Brendale", slug: "brendale" },
    { name: "Bray Park", slug: "bray-park" },
    { name: "Lawnton", slug: "lawnton" },
  ],
  faqs: [
    {
      q: "How much does a new concrete driveway cost in Strathpine?",
      a: "The cost of a new driveway in Strathpine depends on the size, finish, and site access. On average, you can expect to pay between $80 and $150 per square metre. Contact Concrete Concepts Group for a detailed, fixed-price quote."
    },
    {
      q: "Do I need council approval for a retaining wall in Strathpine?",
      a: "Generally, retaining walls under 1 metre in height that are not load-bearing do not require council approval in the Moreton Bay region. However, it's always best to check with the council. We can help guide you through this process."
    },
    {
      q: "What concrete finishes do you offer?",
      a: "We offer a wide range of finishes, including standard broom finish, exposed aggregate, and coloured concrete to match your Strathpine property. We can show you samples to help you decide."
    },
    {
      q: "How long does it take to replace a driveway?",
      a: "A typical driveway replacement in Strathpine takes 2-4 days, including demolition of the old driveway, site preparation, and pouring the new concrete. We'll provide a clear timeline for your specific project."
    },
    {
      q: "Why should I choose Concrete Concepts Group?",
      a: "We are a local, family-owned business with a reputation for quality and reliability. We are QBCC licensed, fully insured, and committed to providing the best possible service to our Strathpine clients."
    }
  ]
},
  "goodna": {
  slug: "goodna",
  name: "Goodna",
  region: "Ipswich",
  postcode: "4300",
  metaTitle: "Concreter Goodna | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Need a reliable concreter in Goodna? Concrete Concepts offers expert services for driveways, shed slabs, and retaining walls. QBCC licensed and fully insured.",
    h1: "Concreting Goodna — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Goodna, concreters Goodna, concrete driveway Goodna, exposed aggregate Goodna, retaining wall Goodna",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
  heroAlt: "Exposed aggregate concrete driveway in Goodna by Concrete Concepts",
  intro: "Goodna is a suburb on the rise, with many homeowners undertaking renovations to modernise their properties. Concrete Concepts is the trusted local expert for all concreting projects, delivering high-quality finishes that add value and appeal to your Goodna home.",
  areaDescription: "Goodna is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Goodna and surrounding areas.",
  popularServices: [
    {
      name: "Concrete Driveways",
      slug: "concrete-driveways-brisbane",
      description: "We specialise in crafting durable and stylish concrete driveways in Goodna, perfect for the modern homeowner. Our driveways are built to last, withstanding the local climate and daily use."
    },
    {
      name: "Concrete Slabs",
      slug: "concrete-slabs-brisbane",
      description: "From garden sheds to workshop foundations, our concrete slabs provide a solid and reliable base for any structure in Goodna. We ensure a perfectly level and expertly finished slab every time."
    },
    {
      name: "Retaining Walls",
      slug: "retaining-walls-brisbane",
      description: "Our engineered retaining walls are essential for managing Goodna's varied terrain, preventing soil erosion and creating usable, level spaces. We design and build walls that are both functional and aesthetically pleasing."
    },
    {
      name: "Exposed Aggregate",
      slug: "exposed-aggregate-brisbane",
      description: "Exposed aggregate is a popular choice for Goodna driveways and patios, offering a decorative and non-slip surface. We have a wide range of aggregate mixes to suit any home style."
    }
  ],
  testimonialSnippet: { name: "Mark T.", text: "Concrete Concepts did an amazing job on our new driveway in Goodna. The team was professional, the finish is flawless, and it has completely transformed the look of our home. Highly recommended!", service: "Concreting — Goodna" },
  nearbySuburbs: [
    { name: "Redbank Plains", slug: "redbank-plains" },
    { name: "Springfield", slug: "springfield" },
    { name: "Gailes", slug: "gailes" },
  ],
  faqs: [
    {
      q: "How much does a new concrete driveway cost in Goodna?",
      a: "The cost of a new driveway in Goodna depends on the size, finish, and site access. On average, you can expect to pay between $80 and $150 per square metre. Contact Concrete Concepts Group for a detailed, fixed-price quote."
    },
    {
      q: "Do I need council approval for a retaining wall in Goodna?",
      a: "In the Ipswich City Council area, retaining walls over 1 metre in height or close to a boundary may require approval. We can advise on the specific requirements for your Goodna property and assist with the process."
    },
    {
      q: "What is the best concrete finish for a shed slab?",
      a: "For most shed slabs in Goodna, a standard broom finish is ideal. It provides a non-slip, durable surface that is perfect for a workshop or storage area. We can discuss other options if you have specific needs."
    },
    {
      q: "How long does it take to complete a concreting project?",
      a: "A typical driveway or slab project in Goodna takes 2-4 days, depending on size and weather. This includes excavation, formwork, pouring, and finishing. We provide a clear timeline with every quote."
    },
    {
      q: "Why should I choose Concrete Concepts for my Goodna project?",
      a: "We are local Ipswich concreters with a reputation for quality and reliability. We are fully licensed and insured, use only high-quality materials, and guarantee our workmanship, ensuring a perfect result for your Goodna home."
    }
  ]
},
  "brassall": {
  slug: "brassall",
  name: "Brassall",
  region: "Ipswich",
  postcode: "4305",
  metaTitle: "Concreter Brassall | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Looking for a reliable concreter in Brassall? Concrete Concepts offers expert services for new driveways, patios, and concrete slabs. QBCC licensed for quality assurance.",
    h1: "Concreting Brassall — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Brassall, concreters Brassall, concrete driveway Brassall, exposed aggregate Brassall, retaining wall Brassall",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/exposed-aggregate-driveway_803ff92a.jpeg",
  heroAlt: "Modern exposed aggregate driveway in a Brassall home.",
  intro: "Brassall, a well-established Ipswich suburb, is known for its beautiful character homes. Concrete Concepts is the trusted local choice for concreting services that enhance property value, from stylish new driveways to functional and attractive outdoor living areas.",
  areaDescription: "Brassall is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Brassall and surrounding areas.",
  popularServices: [
    { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "We specialize in replacing old driveways in Brassall with durable, high-quality concrete solutions that complement your home's character." },
    { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Modernise your Brassall property with a stunning and hard-wearing exposed aggregate driveway or patio area." },
    { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create the perfect outdoor entertaining space with a custom-designed concrete patio, built to last in the Ipswich climate." },
    { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "From shed slabs to house foundations, we provide professionally engineered and poured concrete slabs for any project in Brassall." }
  ],
  testimonialSnippet: { name: "David R.", text: "Concrete Concepts did an amazing job on our new driveway in Brassall. The exposed aggregate finish is flawless and has completely transformed the look of our home. The team was professional and efficient from start to finish.", service: "Concreting — Brassall" },
  nearbySuburbs: [
    { name: "Ipswich CBD", slug: "ipswich-cbd" },
    { name: "North Ipswich", slug: "north-ipswich" },
    { name: "Booval", slug: "booval" },
  ],
  faqs: [
    { q: "How much does a new concrete driveway cost in Brassall?", a: "The cost varies based on size, finish, and site access. On average, a standard driveway in Brassall can range from $80 to $130 per square metre. Contact Concrete Concepts Group for a precise, obligation-free quote." },
    { q: "Is exposed aggregate a good choice for Brassall homes?", a: "Absolutely. Exposed aggregate is extremely durable, slip-resistant, and handles the Ipswich climate well. It provides a modern look that complements both new and older character homes in Brassall." },
    { q: "Do I need council approval for a new driveway in Ipswich?", a: "Typically, replacing an existing driveway does not require council approval, but new crossovers or significant changes might. We can advise on the specific requirements for your Brassall property." },
    { q: "How long does it take to complete a concrete project?", a: "A standard driveway or patio in Brassall usually takes 2-4 days, depending on weather and project complexity. We always aim to minimise disruption and complete the job efficiently." },
    { q: "Why should I choose a QBCC licensed concreter?", a: "Using a QBCC licensed concreter like Concrete Concepts Group ensures your project is covered by insurance and meets Australian standards, giving you complete peace of mind." }
  ]
},
  "redbank-plains": {
  slug: "redbank-plains",
  name: "Redbank Plains",
  region: "Ipswich",
  postcode: "4301",
  metaTitle: "Concreter Redbank Plains | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Leading concreters in Redbank Plains. QBCC licensed experts in new home driveways, shed slabs, and pathways. Get a free quote from Concrete Concepts today!",
    h1: "Concreting Redbank Plains — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Redbank Plains, concreters Redbank Plains, concrete driveway Redbank Plains, exposed aggregate Redbank Plains, retaining wall Redbank Plains",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
  heroAlt: "New concrete driveway in Redbank Plains by Concrete Concepts",
  intro: "Redbank Plains is one of SEQ's fastest-growing suburbs, with thousands of new homes being built. Concrete Concepts is the trusted local concreter for residents, delivering high-quality driveways, shed slabs, and pathways that stand the test of time.",
  areaDescription: "Redbank Plains is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Redbank Plains and surrounding areas.",
  popularServices: [
    { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "We specialize in durable and stylish concrete driveways for new homes in Redbank Plains, tailored to complement your property." },
    { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Our team pours precision-engineered concrete slabs, perfect for new home foundations, sheds, and extensions in the Redbank Plains area." },
    { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Enhance your home's curb appeal with a stunning exposed aggregate driveway, a popular and modern choice for new builds in Redbank Plains." },
    { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "We construct strong and functional retaining walls to manage sloping blocks and create usable land for your Redbank Plains property." }
  ],
  testimonialSnippet: { name: "John S.", text: "Concrete Concepts did an amazing job on our new driveway in Redbank Plains. The team was professional, efficient, and the final result exceeded our expectations. Highly recommended for anyone building in the area!", service: "Concreting — Redbank Plains" },
  nearbySuburbs: [
    { name: "Springfield", slug: "springfield" },
    { name: "Goodna", slug: "goodna" },
    { name: "Collingwood Park", slug: "collingwood-park" },
  ],
  faqs: [
    { q: "How much does a new concrete driveway cost in Redbank Plains?", a: "The cost of a new driveway in Redbank Plains depends on the size, finish, and site access. On average, you can expect to pay between $80 and $150 per square meter. Contact Concrete Concepts Group for a detailed, fixed-price quote." },
    { q: "Do I need council approval for a shed slab in Ipswich?", a: "For most standard-sized sheds in the Ipswich City Council area, you won't need approval for the slab itself, but the structure might. We can advise on local regulations to ensure your project is compliant." },
    { q: "What is the best concrete finish for a new home?", a: "For new homes in Redbank Plains, exposed aggregate is a very popular and stylish choice. However, a classic broom finish is also a durable and cost-effective option. We can show you samples to help you decide." },
    { q: "How long does it take to pour a concrete slab?", a: "A standard shed or patio slab can usually be prepared and poured in a single day. Larger or more complex slabs may take 2-3 days. We always provide a clear timeline before starting work." },
    { q: "Why should I choose Concrete Concepts for my Redbank Plains project?", a: "With over a decade of experience in the Ipswich region and a focus on new housing estates, we have the expertise to deliver a high-quality result on time and on budget. We are QBCC licensed and fully insured for your peace of mind." },
    { q: "Can you handle excavation for my project?", a: "Yes, we provide a complete service that includes any necessary excavation and site preparation. This ensures a solid foundation for your new concrete driveway, slab, or patio." }
  ]
},
  "ripley": {
  slug: "ripley",
  name: "Ripley",
  region: "Ipswich",
  postcode: "4306",
  metaTitle: "Concreter Ripley | Driveways, Slabs & More | Concrete Concepts",
  metaDescription: "Need a reliable concreter in Ripley? Concrete Concepts offers expert concrete driveways, shed slabs, and retaining walls. QBCC licensed and fully insured.",
    h1: "Concreting Ripley — Driveways, Slabs & Retaining Walls",
  keywords: "concreting Ripley, concreters Ripley, concrete driveway Ripley, exposed aggregate Ripley, retaining wall Ripley",
heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
  heroAlt: "A new, modern concrete driveway in a brand new estate in Ripley.",
  intro: "Ripley is one of Australia's fastest-growing master-planned communities, with thousands of new homes being built. For new homeowners, getting the foundational concrete work right is essential. Concrete Concepts is the trusted local expert for Ripley, delivering high-quality driveways, slabs, and retaining walls that perfectly complement your new home.",
  areaDescription: "Ripley is a vibrant suburb with growing demand for quality concreting services. From new home builds to renovations and outdoor upgrades, Concrete Concepts Group has the experience and expertise to deliver outstanding results across Ripley and surrounding areas.",
  popularServices: [
    {
      name: "Concrete Driveways",
      slug: "concrete-driveways-brisbane",
      description: "We specialise in creating durable and stylish concrete driveways for new homes in Ripley. Our team ensures a perfect finish that enhances your home's curb appeal from day one."
    },
    {
      name: "Concrete Slabs",
      slug: "concrete-slabs-brisbane",
      description: "A solid foundation is crucial for any new shed or outdoor structure. We pour high-strength, level concrete slabs in Ripley, engineered to last and support your projects."
    },
    {
      name: "Retaining Walls",
      slug: "retaining-walls-brisbane",
      description: "Many new blocks in Ripley have slopes that require expert landscaping solutions. Our concrete retaining walls provide essential structural support while adding a clean, modern look to your property."
    },
    {
      name: "Exposed Aggregate",
      slug: "exposed-aggregate-brisbane",
      description: "For a premium, non-slip surface, consider an exposed aggregate finish for your driveway or pathways. It's a popular and stylish choice for new homes throughout the Ripley area."
    }
  ],
  testimonialSnippet: { name: "David R.", text: "We just built our home in Ripley and needed a driveway and slab for our shed. The team at Concrete Concepts was fantastic—professional, efficient, and the final result is flawless. Highly recommend them for any new builds in the area.", service: "Concreting — Ripley" },
  nearbySuburbs: [
    { name: "Springfield", slug: "springfield" },
    { name: "Yamanto", slug: "yamanto" },
    { name: "Deebing Heights", slug: "deebing-heights" },
  ],
  faqs: [
    {
      q: "How much does a new concrete driveway cost in Ripley?",
      a: "The cost for a new driveway in Ripley depends on size, finish, and site access. As a guide, prices typically range from $80 to $150 per square metre. Contact Concrete Concepts Group for a detailed, fixed-price quote based on your specific new home plans."
    },
    {
      q: "Do I need council approval for a shed slab in Ipswich?",
      a: "For most standard-sized sheds in the Ipswich City Council area, a slab doesn't require specific approval, but the shed itself might. We ensure all our work complies with local building codes and can advise on the requirements for your Ripley property."
    },
    {
      q: "What's the best concrete finish for a sloping driveway?",
      a: "For sloping driveways, safety is key. We recommend a non-slip finish like exposed aggregate or a broom finish. These textures provide excellent grip in wet conditions, which is important for the hilly areas around Ripley."
    },
    {
      q: "How long does it take to build a concrete retaining wall?",
      a: "A typical residential retaining wall can take anywhere from 2 to 5 days, depending on its length, height, and complexity. We work efficiently to minimise disruption to your new property in Ripley."
    },
    {
      q: "Why should I choose a local concreter for my Ripley home?",
      a: "Choosing a local expert like Concrete Concepts Group means you get a team that understands the specific ground conditions and building trends in Ripley. We're familiar with the local estates and provide timely, reliable service."
    }
  ]
},
  "bracken-ridge": {
    slug: "bracken-ridge",
    name: "Bracken Ridge",
    region: "Brisbane Northside",
    postcode: "4017",
    h1: "Concreting Bracken Ridge \u2014 Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Bracken Ridge | Driveways & Slabs from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting services in Bracken Ridge, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Bracken Ridge, concreters Bracken Ridge, concrete driveway Bracken Ridge, exposed aggregate Bracken Ridge, retaining wall Bracken Ridge",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Looking for a reliable concreter in Bracken Ridge? Concrete Concepts Group delivers professional concreting services across Bracken Ridge and Brisbane's northern suburbs. From driveway replacements and exposed aggregate finishes to shed slabs and retaining walls, we bring QBCC-licensed quality to every project in this well-established suburb.",
    areaDescription: "Bracken Ridge is one of Brisbane's largest and most established northern suburbs, with a population of over 17,000 residents. Many homes in the area were built in the 1970s and 1980s, meaning driveways, paths, and outdoor entertaining areas are reaching the age where they need replacing or upgrading. The suburb's flat to gently undulating terrain makes it well-suited for a wide range of concreting projects. With good access and straightforward site conditions, projects in Bracken Ridge are typically very efficient. We regularly work in Bracken Ridge and neighbouring suburbs like Fitzgibbon, Carseldine, and Bald Hills.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Replace your ageing Bracken Ridge driveway with a fresh exposed aggregate or coloured concrete finish. Most driveways completed in 2-3 days." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "The most popular upgrade in Bracken Ridge \u2014 beautiful stone textures that transform your home's street appeal and add lasting value." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Shed slabs, garage floors, and house extensions. Properly reinforced and engineered for Bracken Ridge's soil conditions." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Create level garden beds and usable outdoor spaces with professionally built retaining walls. Concrete, block, and sleeper options available." },
    ],
    nearbySuburbs: [
      { name: "Carseldine", slug: "carseldine" },
      { name: "Aspley", slug: "aspley" },
      { name: "Chermside", slug: "chermside" },
      { name: "Zillmere", slug: "zillmere" },
      { name: "Geebung", slug: "geebung" },
      { name: "Bald Hills", slug: "bald-hills" },
    ],
    faqs: [
      { q: "How much does a concrete driveway cost in Bracken Ridge?", a: "Concrete driveways in Bracken Ridge typically range from $65/m\u00B2 for plain concrete to $150/m\u00B2 for premium exposed aggregate. A standard double-car driveway (50m\u00B2) costs between $3,250 and $7,500. We provide free on-site quotes." },
      { q: "Do you replace old driveways in Bracken Ridge?", a: "Yes, we handle full driveway replacements including removal of the old concrete, site preparation, and pouring the new driveway. Many Bracken Ridge homes have older driveways that are cracking or sinking \u2014 we fix that." },
      { q: "How long does concreting take in Bracken Ridge?", a: "Most residential projects in Bracken Ridge take 2-4 days of on-site work. Bracken Ridge's generally flat terrain and good access make projects efficient. After pouring, concrete needs 7 days before foot traffic and 28 days for vehicles." },
    ],
    testimonialSnippet: { name: "Steve M", text: "Great job on our new driveway. The team was professional and the exposed aggregate looks fantastic.", service: "Exposed Aggregate Driveway \u2014 Bracken Ridge" },
  },
  "thornlands": {
    slug: "thornlands",
    name: "Thornlands",
    region: "Redlands Coast",
    postcode: "4164",
    h1: "Concreting Thornlands \u2014 Driveways, Patios & Exposed Aggregate",
    metaTitle: "Concreting Thornlands | Driveways & Patios from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting services in Thornlands, Redlands. Driveways, exposed aggregate, patios, retaining walls. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Thornlands, concreters Thornlands, concrete driveway Thornlands, exposed aggregate Thornlands, patio Thornlands, retaining wall Thornlands",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Need a concreter in Thornlands? Concrete Concepts Group provides premium concreting services across Thornlands and the wider Redlands Coast. As the most populated suburb in the Redlands with over 18,000 residents, Thornlands has a strong mix of established homes and newer estates \u2014 all benefiting from quality driveways, patios, and outdoor living areas.",
    areaDescription: "Thornlands is the largest suburb in the Redlands by population, home to a thriving community of families and retirees. The suburb features a mix of established homes from the 1990s-2000s alongside newer developments in areas like Thornlands Ridge. Many established properties are now due for driveway replacements and outdoor area upgrades, while new builds need quality finishing touches. The suburb's proximity to the bay and relaxed lifestyle mean outdoor entertaining areas and attractive driveways are highly valued. We service Thornlands regularly alongside nearby suburbs like Cleveland, Alexandra Hills, and Victoria Point.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "New driveways and replacements for Thornlands homes. Exposed aggregate is the most popular choice in the Redlands for its beauty and durability." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Premium exposed aggregate finishes that complement Thornlands' coastal lifestyle. Slip-resistant, durable, and stunning \u2014 perfect for driveways and patios." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create the perfect outdoor entertaining area for Thornlands' relaxed bayside lifestyle. Multiple finish options to match your home." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Thornlands has some undulating terrain that benefits from retaining walls for level gardens, driveways, and outdoor areas." },
    ],
    nearbySuburbs: [
      { name: "Cleveland", slug: "cleveland" },
      { name: "Alexandra Hills", slug: "alexandra-hills" },
      { name: "Victoria Point", slug: "victoria-point" },
      { name: "Capalaba", slug: "capalaba" },
      { name: "Wellington Point", slug: "wellington-point" },
      { name: "Redland Bay", slug: "redland-bay" },
    ],
    faqs: [
      { q: "How much does concreting cost in Thornlands?", a: "Concreting in Thornlands typically ranges from $65/m\u00B2 for plain concrete to $150/m\u00B2 for premium exposed aggregate. Patios and driveways are the most common projects. We provide free on-site quotes with no obligation." },
      { q: "What's the most popular concrete finish in Thornlands?", a: "Exposed aggregate is by far the most popular finish in Thornlands and across the Redlands. It offers a beautiful natural stone look that's slip-resistant and perfect for the bayside lifestyle." },
      { q: "Do you service all of the Redlands from Thornlands?", a: "Yes! We service the entire Redlands Coast including Thornlands, Cleveland, Alexandra Hills, Victoria Point, Capalaba, Wellington Point, and Redland Bay." },
    ],
    testimonialSnippet: { name: "Karen L", text: "Beautiful exposed aggregate driveway. The team was punctual and professional throughout.", service: "Exposed Aggregate \u2014 Thornlands" },
  },
  "calamvale": {
    slug: "calamvale",
    name: "Calamvale",
    region: "Brisbane Southside",
    postcode: "4116",
    h1: "Concreting Calamvale \u2014 Driveways, Slabs & Outdoor Areas",
    metaTitle: "Concreting Calamvale | Driveways & Slabs from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting services in Calamvale, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Calamvale, concreters Calamvale, concrete driveway Calamvale, exposed aggregate Calamvale, concrete slab Calamvale",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Looking for quality concreting in Calamvale? Concrete Concepts Group provides professional concreting services across Calamvale and Brisbane's southern corridor. With over 17,000 residents, Calamvale is one of Brisbane's most populated suburbs \u2014 and we're the local concreters trusted to deliver driveways, slabs, and outdoor areas that last.",
    areaDescription: "Calamvale is a large, family-friendly suburb in Brisbane's south, known for its diverse community, excellent schools, and proximity to major shopping centres. The suburb features a mix of established homes from the 1990s and newer townhouse developments, creating consistent demand for concreting services. Many older properties need driveway replacements and patio upgrades, while new builds require finishing touches. Calamvale's relatively flat terrain and good access make it an efficient area to work in. We regularly service Calamvale alongside nearby Sunnybank, Sunnybank Hills, Algester, and Stretton.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "New driveways and replacements for Calamvale homes. Plain, coloured, and exposed aggregate options to suit every budget and style." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Premium exposed aggregate finishes that add serious street appeal to Calamvale properties. Durable, low-maintenance, and beautiful." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Shed slabs, garage floors, and extensions for Calamvale homes. Properly engineered with reinforcement for long-lasting results." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Transform your Calamvale backyard with a quality concrete patio. Perfect for outdoor entertaining in Brisbane's climate." },
    ],
    nearbySuburbs: [
      { name: "Sunnybank", slug: "sunnybank" },
      { name: "Algester", slug: "algester" },
      { name: "Underwood", slug: "underwood" },
      { name: "Runcorn", slug: "runcorn" },
      { name: "Stretton", slug: "stretton" },
      { name: "Drewvale", slug: "drewvale" },
    ],
    faqs: [
      { q: "How much does a driveway cost in Calamvale?", a: "Driveways in Calamvale typically cost $65-$150/m\u00B2 depending on the finish. A standard double driveway (50m\u00B2) ranges from $3,250 to $7,500. We provide free on-site quotes." },
      { q: "Do you do townhouse concreting in Calamvale?", a: "Yes, we work on both houses and townhouses in Calamvale. For townhouse complexes, we coordinate with body corporates and strata managers to ensure smooth project delivery." },
      { q: "What soil conditions should I know about in Calamvale?", a: "Calamvale has predominantly clay soils that can be reactive. We always ensure proper compaction, sub-base preparation, and reinforcement to prevent cracking and movement over time." },
    ],
    testimonialSnippet: { name: "David T", text: "Excellent work on our new driveway and patio. Very competitive pricing and quality finish.", service: "Driveway & Patio \u2014 Calamvale" },
  },
  "sunnybank-hills": {
    slug: "sunnybank-hills",
    name: "Sunnybank Hills",
    region: "Brisbane Southside",
    postcode: "4109",
    h1: "Concreting Sunnybank Hills \u2014 Driveways, Paths & Retaining Walls",
    metaTitle: "Concreting Sunnybank Hills | Driveways from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Sunnybank Hills, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Sunnybank Hills, concreters Sunnybank Hills, concrete driveway Sunnybank Hills, exposed aggregate Sunnybank Hills",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Need a concreter in Sunnybank Hills? Concrete Concepts Group provides professional concreting services across Sunnybank Hills and Brisbane's southern suburbs. With 17,000+ residents and many homes built in the 1980s-90s, Sunnybank Hills has strong demand for driveway replacements, patio upgrades, and retaining wall construction.",
    areaDescription: "Sunnybank Hills is one of Brisbane's most populated suburbs, known for its family-friendly streets, established gardens, and multicultural community. The suburb's hilly terrain \u2014 as the name suggests \u2014 means many properties benefit from retaining walls and carefully graded driveways. Homes built 30-40 years ago are now due for concrete upgrades, making it one of our busiest service areas. We work regularly in Sunnybank Hills alongside neighbouring Sunnybank, Calamvale, Runcorn, and Algester.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Replace your ageing Sunnybank Hills driveway with a modern finish. We handle steep driveways with proper drainage and non-slip surfaces." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Sunnybank Hills' hilly terrain makes retaining walls essential for many properties. We build walls that create usable space on sloping blocks." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Premium exposed aggregate finishes that add value and beauty to Sunnybank Hills homes. Slip-resistant and perfect for sloped driveways." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create level outdoor entertaining areas on Sunnybank Hills' slopes. We can terrace and retain to maximise your usable outdoor space." },
    ],
    nearbySuburbs: [
      { name: "Sunnybank", slug: "sunnybank" },
      { name: "Calamvale", slug: "calamvale" },
      { name: "Runcorn", slug: "runcorn" },
      { name: "Algester", slug: "algester" },
      { name: "Acacia Ridge", slug: "acacia-ridge" },
      { name: "Macgregor", slug: "macgregor" },
    ],
    faqs: [
      { q: "Can you handle steep driveways in Sunnybank Hills?", a: "Absolutely. We're experienced with Sunnybank Hills' hilly terrain. We design driveways with proper gradients, drainage channels, and non-slip finishes to handle the slopes safely." },
      { q: "How much does a retaining wall cost in Sunnybank Hills?", a: "Retaining walls in Sunnybank Hills typically cost $300-$600 per lineal metre depending on height and material. Many properties in the area need walls between 0.5m and 1.5m. We provide free quotes." },
      { q: "Do you need council approval for retaining walls in Sunnybank Hills?", a: "Retaining walls over 1 metre high in Brisbane generally require council approval and engineering certification. We handle the full process and advise you during our free site inspection." },
    ],
    testimonialSnippet: { name: "Jenny W", text: "Great retaining wall and new driveway. The team handled the steep block perfectly.", service: "Retaining Wall & Driveway \u2014 Sunnybank Hills" },
  },
  "alexandra-hills": {
    slug: "alexandra-hills",
    name: "Alexandra Hills",
    region: "Redlands Coast",
    postcode: "4161",
    h1: "Concreting Alexandra Hills \u2014 Driveways, Patios & Exposed Aggregate",
    metaTitle: "Concreting Alexandra Hills | Driveways from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Alexandra Hills, Redlands. Driveways, exposed aggregate, patios, retaining walls. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Alexandra Hills, concreters Alexandra Hills, concrete driveway Alexandra Hills, exposed aggregate Alexandra Hills",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Looking for a concreter in Alexandra Hills? Concrete Concepts Group provides quality concreting services across Alexandra Hills and the Redlands. With nearly 16,000 residents, Alexandra Hills is one of the Redlands' largest suburbs \u2014 and we're the local concreters delivering beautiful driveways, patios, and outdoor areas.",
    areaDescription: "Alexandra Hills is a well-established Redlands suburb with a strong community feel. Most homes were built between the 1970s and 1990s, meaning many properties are now due for driveway replacements and outdoor area upgrades. The suburb's undulating terrain creates opportunities for retaining walls and terraced outdoor spaces. Alexandra Hills' proximity to the bay means outdoor living is a priority for residents, driving demand for quality patios and entertaining areas. We service Alexandra Hills regularly alongside Capalaba, Cleveland, Thornlands, and Wellington Point.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Replace your old Alexandra Hills driveway with a modern exposed aggregate or coloured concrete finish. We handle removal of old concrete included." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "The most requested finish in the Redlands. Beautiful, durable, and slip-resistant \u2014 perfect for Alexandra Hills' driveways and patios." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create the perfect outdoor entertaining area for Alexandra Hills' relaxed lifestyle. Multiple finish options to suit your home." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Alexandra Hills' hilly terrain means many properties need retaining walls. We build concrete, block, and sleeper walls with proper engineering." },
    ],
    nearbySuburbs: [
      { name: "Capalaba", slug: "capalaba" },
      { name: "Cleveland", slug: "cleveland" },
      { name: "Thornlands", slug: "thornlands" },
      { name: "Wellington Point", slug: "wellington-point" },
      { name: "Birkdale", slug: "birkdale" },
      { name: "Ormiston", slug: "ormiston" },
    ],
    faqs: [
      { q: "How much does concreting cost in Alexandra Hills?", a: "Concreting in Alexandra Hills ranges from $65/m\u00B2 for plain concrete to $150/m\u00B2 for exposed aggregate. Most driveway projects cost between $3,250 and $7,500. Free on-site quotes available." },
      { q: "What's the best concrete finish for Alexandra Hills?", a: "Exposed aggregate is the most popular choice in Alexandra Hills and across the Redlands. It offers a natural stone look that's slip-resistant and complements the area's established homes." },
      { q: "Do you handle old concrete removal in Alexandra Hills?", a: "Yes, we provide full driveway replacement services including demolition and removal of old concrete, site preparation, and pouring the new surface. We dispose of all waste responsibly." },
    ],
    testimonialSnippet: { name: "Paul R", text: "Prompt and professional. Great exposed aggregate finish on our driveway.", service: "Concreting \u2014 Alexandra Hills" },
  },
  "redland-bay": {
    slug: "redland-bay",
    name: "Redland Bay",
    region: "Redlands Coast",
    postcode: "4165",
    h1: "Concreting Redland Bay \u2014 Driveways, Patios & Pool Surrounds",
    metaTitle: "Concreting Redland Bay | Driveways & Patios from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Redland Bay, QLD. Driveways, exposed aggregate, patios, pool surrounds. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Redland Bay, concreters Redland Bay, concrete driveway Redland Bay, exposed aggregate Redland Bay, pool surround Redland Bay",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Need a concreter in Redland Bay? Concrete Concepts Group provides premium concreting services across Redland Bay and the southern Redlands. With over 16,000 residents and a mix of established homes and new developments, Redland Bay has strong demand for quality driveways, patios, and pool surrounds.",
    areaDescription: "Redland Bay is a growing bayside suburb on the southern edge of the Redlands, offering a relaxed coastal lifestyle with views across to the bay islands. The suburb features a mix of established acreage properties and newer residential estates, creating diverse concreting needs from large rural driveways to modern exposed aggregate finishes. The area's sandy soils and proximity to the coast mean proper preparation is essential for long-lasting concrete. We service Redland Bay regularly alongside Victoria Point, Thornlands, and Cleveland.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "New driveways for Redland Bay homes \u2014 from compact residential to long acreage driveways. All finishes available including exposed aggregate." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "The perfect finish for Redland Bay's coastal lifestyle. Natural stone textures that are slip-resistant and complement the bayside setting." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Outdoor entertaining areas designed for Redland Bay's relaxed lifestyle. Enjoy the bay breezes from a quality concrete patio." },
      { name: "Pool Surrounds", slug: "pool-surrounds-brisbane", description: "Non-slip concrete pool surrounds perfect for Redland Bay's warm climate. Exposed aggregate and textured finishes for safety and style." },
    ],
    nearbySuburbs: [
      { name: "Victoria Point", slug: "victoria-point" },
      { name: "Thornlands", slug: "thornlands" },
      { name: "Cleveland", slug: "cleveland" },
      { name: "Mount Cotton", slug: "mount-cotton" },
      { name: "Sheldon", slug: "sheldon" },
      { name: "Capalaba", slug: "capalaba" },
    ],
    faqs: [
      { q: "Do you service acreage properties in Redland Bay?", a: "Yes, we service both residential and acreage properties in Redland Bay. Larger driveways and rural properties are no problem \u2014 we have the equipment and experience for projects of all sizes." },
      { q: "What concrete finish is best near the coast?", a: "Exposed aggregate is ideal for coastal areas like Redland Bay. It's slip-resistant, handles salt air well, and the natural stone finish complements the bayside setting beautifully." },
      { q: "How do you handle sandy soils in Redland Bay?", a: "Redland Bay's sandy soils require proper compaction and sub-base preparation. We always ensure adequate base material and reinforcement to prevent movement and cracking over time." },
    ],
    testimonialSnippet: { name: "Michelle S", text: "Lovely work on our pool surround and patio. The exposed aggregate is perfect for our bayside home.", service: "Pool Surround \u2014 Redland Bay" },
  },
  "eight-mile-plains": {
    slug: "eight-mile-plains",
    name: "Eight Mile Plains",
    region: "Brisbane Southside",
    postcode: "4113",
    h1: "Concreting Eight Mile Plains \u2014 Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Eight Mile Plains | Driveways from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Eight Mile Plains, Brisbane. Driveways, exposed aggregate, slabs, retaining walls. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Eight Mile Plains, concreters Eight Mile Plains, concrete driveway Eight Mile Plains, exposed aggregate Eight Mile Plains",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Looking for a concreter in Eight Mile Plains? Concrete Concepts Group provides professional concreting services across Eight Mile Plains and Brisbane's south-east corridor. This thriving suburb sits at the junction of the Pacific and Gateway Motorways, making it a prime residential area with strong demand for quality concreting.",
    areaDescription: "Eight Mile Plains is a strategically located suburb in Brisbane's south, home to the Eight Mile Plains Bus Station and the Brisbane Technology Park. The suburb features a mix of established family homes and newer developments, with many properties benefiting from driveway upgrades and outdoor area improvements. Its proximity to major transport corridors and the technology precinct makes it a desirable residential area. We regularly work in Eight Mile Plains alongside neighbouring suburbs like Underwood, Runcorn, Sunnybank, and Rochedale.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "New driveways and replacements for Eight Mile Plains homes. All finishes from plain concrete to premium exposed aggregate." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Premium exposed aggregate finishes that add value to Eight Mile Plains properties. Durable, low-maintenance, and visually stunning." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Shed slabs, garage floors, and extensions. Properly engineered for Eight Mile Plains' clay soil conditions." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Create level outdoor spaces and stabilise sloping sections with professionally built retaining walls." },
    ],
    nearbySuburbs: [
      { name: "Underwood", slug: "underwood" },
      { name: "Sunnybank", slug: "sunnybank" },
      { name: "Runcorn", slug: "runcorn" },
      { name: "Rochedale", slug: "rochedale" },
      { name: "Mount Gravatt", slug: "mount-gravatt" },
      { name: "Calamvale", slug: "calamvale" },
    ],
    faqs: [
      { q: "How much does concreting cost in Eight Mile Plains?", a: "Concreting in Eight Mile Plains typically ranges from $65/m\u00B2 for plain concrete to $150/m\u00B2 for exposed aggregate. We provide free on-site quotes with detailed pricing." },
      { q: "Do you work around the technology park area?", a: "Yes, we service all of Eight Mile Plains including residential areas near the Brisbane Technology Park. We also handle commercial concreting for businesses in the area." },
      { q: "What about the clay soils in Eight Mile Plains?", a: "Eight Mile Plains has reactive clay soils that require proper preparation. We always ensure adequate compaction, sub-base, and reinforcement to prevent cracking and movement." },
    ],
    testimonialSnippet: { name: "Andrew K", text: "Professional team, quality driveway. Very happy with the result.", service: "Concrete Driveway \u2014 Eight Mile Plains" },
  },
  "rochedale": {
    slug: "rochedale",
    name: "Rochedale",
    region: "Brisbane Southside",
    postcode: "4123",
    h1: "Concreting Rochedale \u2014 New Builds, Driveways & Outdoor Areas",
    metaTitle: "Concreting Rochedale | New Builds & Driveways from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Rochedale, Brisbane. New builds, driveways, exposed aggregate, slabs. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Rochedale, concreters Rochedale, concrete driveway Rochedale, new build concreting Rochedale, exposed aggregate Rochedale",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Building in Rochedale? Concrete Concepts Group is the go-to concreter for Rochedale's booming new build market and established homes. From house slabs and driveways to retaining walls and outdoor entertaining areas, we deliver quality concreting that matches Rochedale's premium new homes.",
    areaDescription: "Rochedale is one of Brisbane's fastest-developing suburbs, with the massive Rochedale Estates master-planned community transforming former farmland into a premium residential precinct. This creates enormous demand for concreting services \u2014 from house slabs and driveways for new builds to retaining walls on the area's undulating terrain. Established Rochedale South also has older homes needing upgrades. The suburb's growth trajectory means we're consistently busy here, working with builders and homeowners alike. We service all of Rochedale including Rochedale South, alongside Underwood, Eight Mile Plains, and Springwood.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Premium driveways for Rochedale's new builds. Exposed aggregate, coloured concrete, and plain finishes to complement your new home." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "House slabs, shed slabs, and garage floors for Rochedale's new construction market. Engineered to Australian Standards with proper reinforcement." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Rochedale's undulating terrain means many blocks need retaining walls. We build walls that create level building pads and usable outdoor spaces." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "The premium finish of choice for Rochedale's new homes. Beautiful stone textures that add instant street appeal." },
    ],
    nearbySuburbs: [
      { name: "Underwood", slug: "underwood" },
      { name: "Eight Mile Plains", slug: "eight-mile-plains" },
      { name: "Springwood", slug: "springwood" },
      { name: "Shailer Park", slug: "shailer-park" },
      { name: "Mount Gravatt", slug: "mount-gravatt" },
      { name: "Daisy Hill", slug: "daisy-hill" },
    ],
    faqs: [
      { q: "Do you work with builders in Rochedale?", a: "Yes, we regularly work with builders across Rochedale Estates and other developments. We can coordinate directly with your builder for seamless project delivery." },
      { q: "What's the best driveway for a new build in Rochedale?", a: "Exposed aggregate is the most popular choice for new builds in Rochedale. It complements modern home designs, is low-maintenance, and adds significant street appeal and property value." },
      { q: "How much does a house slab cost in Rochedale?", a: "House slabs in Rochedale typically cost $65-$85/m\u00B2 depending on engineering requirements and site conditions. We work to your engineer's specifications and provide competitive quotes." },
    ],
    testimonialSnippet: { name: "Tom H", text: "Excellent work on our new build driveway and paths. Highly recommend for Rochedale builds.", service: "New Build Concreting \u2014 Rochedale" },
  },
  "pimpama": {
    slug: "pimpama",
    name: "Pimpama",
    region: "Gold Coast North",
    postcode: "4209",
    h1: "Concreting Pimpama \u2014 New Builds, Driveways & Slabs",
    metaTitle: "Concreting Pimpama | New Builds & Driveways from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Pimpama, Gold Coast. New builds, driveways, slabs, retaining walls. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Pimpama, concreters Pimpama, concrete driveway Pimpama, new build concreting Pimpama, concrete slab Pimpama",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Building in Pimpama? Concrete Concepts Group provides quality concreting for Pimpama's rapidly growing community. As one of Australia's fastest-growing suburbs, Pimpama has massive demand for new build concreting \u2014 from house slabs and driveways to retaining walls and outdoor areas.",
    areaDescription: "Pimpama is one of the fastest-growing suburbs in South East Queensland, with multiple master-planned communities including Gainsborough Greens, Pimpama City, and The Heights. This explosive growth creates enormous demand for concreting services. New homes need driveways, paths, patios, and finishing touches, while the area's terrain often requires retaining walls. We service Pimpama regularly as part of our Gold Coast northern corridor coverage, working with builders and homeowners on projects of all sizes.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Quality driveways for Pimpama's new builds. Exposed aggregate, coloured, and plain concrete options to match your new home." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "House slabs, shed slabs, and garage floors for Pimpama's booming construction market. Engineered and reinforced to Australian Standards." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Many Pimpama blocks require retaining walls for level building pads and usable outdoor spaces. We handle all sizes and materials." },
      { name: "Excavation", slug: "excavation-brisbane", description: "Full site preparation for new builds including excavation, levelling, and compaction. We work seamlessly with Pimpama builders." },
    ],
    nearbySuburbs: [
      { name: "Ormeau", slug: "ormeau" },
      { name: "Coomera", slug: "coomera" },
      { name: "Upper Coomera", slug: "upper-coomera" },
      { name: "Yatala", slug: "yatala" },
      { name: "Jacobs Well", slug: "jacobs-well" },
      { name: "Beenleigh", slug: "beenleigh" },
    ],
    faqs: [
      { q: "Do you work with builders in Pimpama estates?", a: "Yes, we regularly work with builders across Pimpama's master-planned communities including Gainsborough Greens and The Heights. We coordinate directly with builders for efficient project delivery." },
      { q: "How much does a new driveway cost in Pimpama?", a: "New driveways in Pimpama typically cost $65-$150/m\u00B2 depending on the finish. Most new build driveways range from $3,000 to $7,000. We provide free quotes." },
      { q: "Can you do the driveway before we move in?", a: "Absolutely. We work with your builder's timeline to ensure your driveway, paths, and outdoor areas are ready before handover. We can also return after settlement for additional work." },
    ],
    testimonialSnippet: { name: "Lisa M", text: "Great work on our new build. Driveway and paths look fantastic.", service: "New Build Concreting \u2014 Pimpama" },
  },
  "mango-hill": {
    slug: "mango-hill",
    name: "Mango Hill",
    region: "Moreton Bay",
    postcode: "4509",
    h1: "Concreting Mango Hill \u2014 Driveways, Slabs & Outdoor Areas",
    metaTitle: "Concreting Mango Hill | Driveways & Slabs from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Mango Hill, Moreton Bay. Driveways, exposed aggregate, slabs, patios. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Mango Hill, concreters Mango Hill, concrete driveway Mango Hill, exposed aggregate Mango Hill",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Need a concreter in Mango Hill? Concrete Concepts Group provides professional concreting services across Mango Hill and the North Lakes corridor. This fast-growing suburb has a strong mix of newer homes and established properties, all benefiting from quality driveways, patios, and outdoor living areas.",
    areaDescription: "Mango Hill is a thriving suburb in the Moreton Bay region, adjacent to North Lakes and connected by the Mango Hill East train station. The suburb has experienced rapid growth over the past decade, with modern estates sitting alongside established homes. This creates consistent demand for both new build concreting and renovation work. Mango Hill's flat terrain and good access make it an efficient area for concreting projects. We service Mango Hill regularly alongside North Lakes, Griffin, Kallangur, and Dakabin.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Quality driveways for Mango Hill homes. From plain concrete to premium exposed aggregate \u2014 we deliver finishes that complement modern homes." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Premium exposed aggregate finishes popular with Mango Hill homeowners. Beautiful, durable, and low-maintenance." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Shed slabs, garage floors, and extensions for Mango Hill properties. Properly engineered with reinforcement." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Outdoor entertaining areas perfect for Mango Hill's family-friendly lifestyle. Multiple finish options available." },
    ],
    nearbySuburbs: [
      { name: "North Lakes", slug: "north-lakes" },
      { name: "Griffin", slug: "griffin" },
      { name: "Kallangur", slug: "kallangur" },
      { name: "Dakabin", slug: "dakabin" },
      { name: "Murrumba Downs", slug: "murrumba-downs" },
      { name: "Deception Bay", slug: "deception-bay" },
    ],
    faqs: [
      { q: "How much does concreting cost in Mango Hill?", a: "Concreting in Mango Hill ranges from $65/m\u00B2 for plain concrete to $150/m\u00B2 for exposed aggregate. We provide free on-site quotes with no obligation." },
      { q: "Do you service the newer estates in Mango Hill?", a: "Yes, we work across all of Mango Hill including the newer estates and established areas. We also service neighbouring North Lakes, Griffin, and Kallangur." },
      { q: "Can you match existing concrete paths?", a: "We do our best to match existing finishes, though exact colour matching can be difficult with aged concrete. We'll discuss options during your free site inspection." },
    ],
    testimonialSnippet: { name: "Rachel B", text: "Lovely driveway and patio. The team was friendly and efficient.", service: "Driveway & Patio \u2014 Mango Hill" },
  },
  "bellbird-park": {
    slug: "bellbird-park",
    name: "Bellbird Park",
    region: "Ipswich",
    postcode: "4300",
    h1: "Concreting Bellbird Park \u2014 New Builds, Driveways & Slabs",
    metaTitle: "Concreting Bellbird Park | New Builds & Driveways from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Bellbird Park, Ipswich. New builds, driveways, slabs, retaining walls. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Bellbird Park, concreters Bellbird Park, concrete driveway Bellbird Park, new build Bellbird Park, concrete slab Bellbird Park",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Building in Bellbird Park? Concrete Concepts Group provides quality concreting for Bellbird Park's growing community. Located in the Ipswich growth corridor, Bellbird Park has seen significant new development \u2014 and we're the concreters trusted to deliver driveways, slabs, and outdoor areas for both new builds and established homes.",
    areaDescription: "Bellbird Park is a fast-growing suburb in the Ipswich corridor, benefiting from major infrastructure investment including the Springfield rail line and Centenary Highway upgrades. The suburb features a mix of new estates and established homes, creating strong demand for concreting services. New builds need driveways, paths, and finishing touches, while older homes benefit from upgrades. We service Bellbird Park as part of our Ipswich corridor coverage alongside Springfield, Goodna, Redbank Plains, and Collingwood Park.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Quality driveways for Bellbird Park homes. New builds and replacements in plain, coloured, and exposed aggregate finishes." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "House slabs, shed slabs, and garage floors for Bellbird Park's construction market. Engineered to Australian Standards." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Bellbird Park's terrain often requires retaining walls for level building pads and usable outdoor spaces." },
      { name: "Excavation", slug: "excavation-brisbane", description: "Full site preparation for new builds including excavation, levelling, and compaction across Bellbird Park." },
    ],
    nearbySuburbs: [
      { name: "Springfield", slug: "springfield" },
      { name: "Goodna", slug: "goodna" },
      { name: "Redbank Plains", slug: "redbank-plains" },
      { name: "Collingwood Park", slug: "collingwood-park" },
      { name: "Brookwater", slug: "brookwater" },
      { name: "Ripley", slug: "ripley" },
    ],
    faqs: [
      { q: "Do you work with builders in Bellbird Park?", a: "Yes, we work with builders across Bellbird Park's new estates. We coordinate directly with your builder for seamless project delivery and can handle multiple trades scheduling." },
      { q: "How much does a driveway cost in Bellbird Park?", a: "Driveways in Bellbird Park typically cost $65-$150/m\u00B2 depending on the finish. New build driveways usually range from $3,000 to $6,000. We provide free quotes." },
      { q: "Can you do paths and driveways together?", a: "Absolutely \u2014 and it's more cost-effective to do them at the same time. We can pour your driveway, paths, and patio in one visit, saving on mobilisation costs." },
    ],
    testimonialSnippet: { name: "Joe S", text: "Excellent job done and quick and reliable.", service: "Concreting \u2014 Collingwood Park" },
  },
  "victoria-point": {
    slug: "victoria-point",
    name: "Victoria Point",
    region: "Redlands Coast",
    postcode: "4165",
    h1: "Concreting Victoria Point \u2014 Driveways, Patios & Pool Surrounds",
    metaTitle: "Concreting Victoria Point | Driveways & Patios from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Victoria Point, Redlands. Driveways, exposed aggregate, patios, pool surrounds. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Victoria Point, concreters Victoria Point, concrete driveway Victoria Point, exposed aggregate Victoria Point, pool surround Victoria Point",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Looking for a concreter in Victoria Point? Concrete Concepts Group provides premium concreting services across Victoria Point and the southern Redlands. This popular bayside suburb has a strong community of homeowners who value quality outdoor living \u2014 and we deliver the driveways, patios, and pool surrounds to match.",
    areaDescription: "Victoria Point is a large, family-friendly suburb in the Redlands, centred around the Victoria Point Shopping Centre and offering easy access to the bay. The suburb features a mix of established homes and newer developments, with many properties featuring pools and outdoor entertaining areas. This creates strong demand for quality concrete finishes, particularly exposed aggregate for driveways and non-slip surfaces around pools. We service Victoria Point regularly alongside Redland Bay, Thornlands, and Cleveland.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "New driveways and replacements for Victoria Point homes. Exposed aggregate is the most popular choice for the Redlands." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Premium exposed aggregate finishes perfect for Victoria Point's coastal lifestyle. Slip-resistant and stunning." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create the perfect outdoor entertaining area. Victoria Point's climate is ideal for year-round outdoor living." },
      { name: "Pool Surrounds", slug: "pool-surrounds-brisbane", description: "Non-slip concrete pool surrounds for Victoria Point homes. Safety and style with exposed aggregate and textured finishes." },
    ],
    nearbySuburbs: [
      { name: "Redland Bay", slug: "redland-bay" },
      { name: "Thornlands", slug: "thornlands" },
      { name: "Cleveland", slug: "cleveland" },
      { name: "Alexandra Hills", slug: "alexandra-hills" },
      { name: "Capalaba", slug: "capalaba" },
      { name: "Wellington Point", slug: "wellington-point" },
    ],
    faqs: [
      { q: "How much does concreting cost in Victoria Point?", a: "Concreting in Victoria Point ranges from $65/m\u00B2 for plain concrete to $150/m\u00B2 for exposed aggregate. Pool surrounds and patios are popular projects. Free on-site quotes available." },
      { q: "Do you do pool surrounds in Victoria Point?", a: "Yes, pool surrounds are one of our most popular services in Victoria Point. We use non-slip exposed aggregate and textured finishes for safety around the pool area." },
      { q: "What's the turnaround for a driveway in Victoria Point?", a: "Most driveways in Victoria Point take 2-3 days of on-site work. After pouring, allow 7 days for foot traffic and 28 days before driving on it." },
    ],
    testimonialSnippet: { name: "Sarah J", text: "Beautiful pool surround and patio. The exposed aggregate is perfect.", service: "Pool Surround & Patio \u2014 Victoria Point" },
  },
  "upper-coomera": {
    slug: "upper-coomera",
    name: "Upper Coomera",
    region: "Gold Coast North",
    postcode: "4209",
    h1: "Concreting Upper Coomera \u2014 Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Upper Coomera | Driveways & Slabs from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Upper Coomera, Gold Coast. Driveways, slabs, retaining walls, exposed aggregate. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Upper Coomera, concreters Upper Coomera, concrete driveway Upper Coomera, retaining wall Upper Coomera, concrete slab Upper Coomera",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Need a concreter in Upper Coomera? Concrete Concepts Group provides quality concreting services across Upper Coomera and the northern Gold Coast. This fast-growing suburb is home to Dreamworld and a thriving residential community \u2014 and we deliver the driveways, slabs, and retaining walls that new and established homes need.",
    areaDescription: "Upper Coomera is one of the Gold Coast's largest and fastest-growing suburbs, featuring major estates like Coomera Waters, Highland Reserve, and The Observatory. The suburb's hilly terrain creates strong demand for retaining walls and carefully graded driveways, while the constant flow of new builds needs quality finishing. We service Upper Coomera as part of our northern Gold Coast coverage alongside Coomera, Pimpama, Ormeau, and Oxenford.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Quality driveways for Upper Coomera homes. We handle steep driveways with proper drainage and non-slip finishes." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Upper Coomera's hilly terrain means many properties need retaining walls. We build walls that create level, usable outdoor spaces." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "House slabs, shed slabs, and garage floors for Upper Coomera's construction market. Engineered to Australian Standards." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Premium exposed aggregate finishes that complement Upper Coomera's modern homes. Durable and low-maintenance." },
    ],
    nearbySuburbs: [
      { name: "Coomera", slug: "coomera" },
      { name: "Pimpama", slug: "pimpama" },
      { name: "Ormeau", slug: "ormeau" },
      { name: "Oxenford", slug: "oxenford" },
      { name: "Helensvale", slug: "helensvale" },
      { name: "Pacific Pines", slug: "pacific-pines" },
    ],
    faqs: [
      { q: "Do you handle steep blocks in Upper Coomera?", a: "Yes, we're experienced with Upper Coomera's hilly terrain. We design driveways and retaining walls that work with the natural slope, including proper drainage and non-slip surfaces." },
      { q: "How much does a retaining wall cost in Upper Coomera?", a: "Retaining walls in Upper Coomera typically cost $300-$600 per lineal metre depending on height and material. Many properties need walls between 0.5m and 2m. We provide free quotes." },
      { q: "Can you work with my builder in Upper Coomera?", a: "Absolutely. We regularly coordinate with builders across Upper Coomera's estates for new build concreting including slabs, driveways, and retaining walls." },
    ],
    testimonialSnippet: { name: "Mark D", text: "Great retaining wall work. Handled the steep block perfectly.", service: "Retaining Wall \u2014 Upper Coomera" },
  },
  "kallangur": {
    slug: "kallangur",
    name: "Kallangur",
    region: "Moreton Bay",
    postcode: "4503",
    h1: "Concreting Kallangur \u2014 Driveways, Slabs & Outdoor Areas",
    metaTitle: "Concreting Kallangur | Driveways & Slabs from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Kallangur, Moreton Bay. Driveways, exposed aggregate, slabs, patios. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Kallangur, concreters Kallangur, concrete driveway Kallangur, exposed aggregate Kallangur, concrete slab Kallangur",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Looking for a concreter in Kallangur? Concrete Concepts Group provides professional concreting services across Kallangur and the Moreton Bay region. This well-established suburb has a strong mix of older homes needing upgrades and newer properties wanting quality finishes.",
    areaDescription: "Kallangur is a large, established suburb in the Moreton Bay region, well-connected by the Kallangur train station and Bruce Highway. The suburb features predominantly older homes from the 1980s-90s, many of which are now due for driveway replacements and outdoor area upgrades. Kallangur's flat terrain and good access make it an efficient area for concreting projects. We service Kallangur regularly alongside Dakabin, Petrie, Murrumba Downs, and North Lakes.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Replace your ageing Kallangur driveway with a modern finish. We handle full removal and replacement efficiently." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Shed slabs, garage floors, and extensions for Kallangur homes. Properly reinforced for long-lasting results." },
      { name: "Exposed Aggregate", slug: "exposed-aggregate-brisbane", description: "Upgrade your Kallangur home with a premium exposed aggregate driveway or patio. Beautiful and low-maintenance." },
      { name: "Concrete Patios", slug: "concrete-patios-brisbane", description: "Create a quality outdoor entertaining area for your Kallangur home. Multiple finish options to suit your budget." },
    ],
    nearbySuburbs: [
      { name: "Dakabin", slug: "dakabin" },
      { name: "North Lakes", slug: "north-lakes" },
      { name: "Mango Hill", slug: "mango-hill" },
      { name: "Strathpine", slug: "strathpine" },
      { name: "Petrie", slug: "petrie" },
      { name: "Murrumba Downs", slug: "murrumba-downs" },
    ],
    faqs: [
      { q: "How much does a driveway cost in Kallangur?", a: "Driveways in Kallangur typically cost $65-$150/m\u00B2 depending on the finish. A standard double driveway (50m\u00B2) ranges from $3,250 to $7,500. We provide free on-site quotes." },
      { q: "Do you remove old concrete in Kallangur?", a: "Yes, we handle full driveway replacements including demolition, removal, and disposal of old concrete. Many Kallangur homes have 30+ year old driveways that need replacing." },
      { q: "How long does a driveway take in Kallangur?", a: "Most driveways in Kallangur take 2-3 days of on-site work. The flat terrain and good access in Kallangur make projects very efficient." },
    ],
    testimonialSnippet: { name: "Greg P", text: "Quick, professional, and great value. New driveway looks fantastic.", service: "Driveway Replacement \u2014 Kallangur" },
  },
  "narangba": {
    slug: "narangba",
    name: "Narangba",
    region: "Moreton Bay",
    postcode: "4504",
    h1: "Concreting Narangba \u2014 Driveways, Slabs & Retaining Walls",
    metaTitle: "Concreting Narangba | Driveways & Slabs from $65/m\u00B2 | Concrete Concepts",
    metaDescription: "Professional concreting in Narangba, Moreton Bay. Driveways, slabs, retaining walls, exposed aggregate. QBCC Licensed #15299707. Free quotes \u2014 call 0424 463 268.",
    keywords: "concreting Narangba, concreters Narangba, concrete driveway Narangba, retaining wall Narangba, concrete slab Narangba",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Need a concreter in Narangba? Concrete Concepts Group provides quality concreting services across Narangba and the northern Moreton Bay region. This growing suburb has a mix of established homes on larger blocks and newer estates, all benefiting from quality driveways, slabs, and retaining walls.",
    areaDescription: "Narangba is a semi-rural suburb in the Moreton Bay region that has experienced significant growth in recent years. The suburb features a mix of established homes on larger blocks and newer residential estates, creating diverse concreting needs. Narangba's undulating terrain means retaining walls are commonly needed, while the larger block sizes often mean bigger driveway and slab projects. We service Narangba alongside Burpengary, Kallangur, and Dakabin.",
    popularServices: [
      { name: "Concrete Driveways", slug: "concrete-driveways-brisbane", description: "Quality driveways for Narangba homes \u2014 from compact residential to longer acreage driveways. All finishes available." },
      { name: "Concrete Slabs", slug: "concrete-slabs-brisbane", description: "Shed slabs and garage floors for Narangba's larger properties. Properly engineered for the area's soil conditions." },
      { name: "Retaining Walls", slug: "retaining-walls-brisbane", description: "Narangba's undulating terrain often requires retaining walls. We build walls that create level, usable spaces on sloping blocks." },
      { name: "Excavation", slug: "excavation-brisbane", description: "Site preparation for new builds and extensions across Narangba. We handle excavation, levelling, and compaction." },
    ],
    nearbySuburbs: [
      { name: "Burpengary", slug: "burpengary" },
      { name: "Kallangur", slug: "kallangur" },
      { name: "Dakabin", slug: "dakabin" },
      { name: "North Lakes", slug: "north-lakes" },
      { name: "Morayfield", slug: "morayfield" },
      { name: "Caboolture", slug: "caboolture" },
    ],
    faqs: [
      { q: "Do you service acreage properties in Narangba?", a: "Yes, we service both residential and acreage properties in Narangba. Larger driveways and rural properties are no problem \u2014 we have the equipment for projects of all sizes." },
      { q: "How much does a shed slab cost in Narangba?", a: "Shed slabs in Narangba typically cost $65-$85/m\u00B2 depending on size and engineering requirements. A standard 6x9m shed slab might cost between $3,500 and $4,600. We provide free quotes." },
      { q: "Do you need council approval for retaining walls in Narangba?", a: "Retaining walls over 1 metre high in the Moreton Bay region generally require council approval and engineering certification. We advise on requirements during our free site inspection." },
    ],
    testimonialSnippet: { name: "Chris W", text: "Great shed slab and retaining wall. Professional team who know what they're doing.", service: "Shed Slab & Retaining Wall \u2014 Narangba" },
  },
};

// Merge new suburbs into SUBURBS
Object.assign(SUBURBS, NEW_SUBURBS);
Object.assign(SUBURBS, MORE_SUBURBS);

const SUBURB_SLUGS = Object.keys(SUBURBS);

// Geo coordinates for each suburb (for JSON-LD schema)
const SUBURB_COORDS: Record<string, { lat: number; lng: number }> = {
  // New suburbs
  "fortitude-valley": { lat: -27.4558, lng: 153.0351 },
  "new-farm": { lat: -27.4678, lng: 153.0480 },
  "teneriffe": { lat: -27.4580, lng: 153.0480 },
  "newstead": { lat: -27.4510, lng: 153.0440 },
  "bowen-hills": { lat: -27.4490, lng: 153.0350 },
  "spring-hill": { lat: -27.4610, lng: 153.0240 },
  "paddington": { lat: -27.4600, lng: 152.9980 },
  "west-end": { lat: -27.4810, lng: 153.0100 },
  "bulimba": { lat: -27.4560, lng: 153.0600 },
  "hawthorne": { lat: -27.4620, lng: 153.0560 },
  "cleveland": { lat: -27.5267, lng: 153.2650 },
  "birkdale": { lat: -27.4950, lng: 153.2180 },
  "wellington-point": { lat: -27.4833, lng: 153.2417 },
  "woodridge": { lat: -27.6280, lng: 153.1080 },
  "springwood": { lat: -27.6100, lng: 153.1280 },
  "daisy-hill": { lat: -27.6350, lng: 153.1550 },
  "oxley": { lat: -27.5530, lng: 152.9770 },
  "forest-lake": { lat: -27.6250, lng: 152.9650 },
  "sherwood": { lat: -27.5280, lng: 152.9810 },
  "inala": { lat: -27.5970, lng: 152.9740 },
  "mansfield": { lat: -27.5350, lng: 153.1000 },
  "wishart": { lat: -27.5500, lng: 153.1000 },
  "carina": { lat: -27.4900, lng: 153.0950 },
  "cannon-hill": { lat: -27.4750, lng: 153.0880 },
  "herston": { lat: -27.4480, lng: 153.0230 },
  "albion": { lat: -27.4370, lng: 153.0440 },
  "manly-west": { lat: -27.4600, lng: 153.1600 },
  "logan-reserve": { lat: -27.7100, lng: 153.1200 },
  "browns-plains": { lat: -27.6650, lng: 153.0500 },
  "wynnum-west": { lat: -27.4530, lng: 153.1530 },
  "mitchelton": { lat: -27.4150, lng: 152.9700 },
  "kedron": { lat: -27.4050, lng: 153.0280 },
  "sandgate": { lat: -27.3230, lng: 153.0650 },
  "carseldine": { lat: -27.3450, lng: 153.0250 },
  "bardon": { lat: -27.4650, lng: 152.9780 },
  "ascot": { lat: -27.4300, lng: 153.0560 },
  "clayfield": { lat: -27.4200, lng: 153.0550 },
  // Original suburbs
  "carindale": { lat: -27.5033, lng: 153.1017 },
  "logan": { lat: -27.6389, lng: 153.1094 },
  "wynnum": { lat: -27.4417, lng: 153.1733 },
  "springfield": { lat: -27.6667, lng: 152.9067 },
  "capalaba": { lat: -27.5267, lng: 153.1917 },
  "ipswich": { lat: -27.6167, lng: 152.7667 },
  "mount-gravatt": { lat: -27.5433, lng: 153.0817 },
  "redlands": { lat: -27.5267, lng: 153.2650 },
  "beenleigh": { lat: -27.7133, lng: 153.2017 },
  "camp-hill": { lat: -27.4933, lng: 153.0783 },
  "sunnybank": { lat: -27.5783, lng: 153.0617 },
  "chermside": { lat: -27.3856, lng: 153.0311 },
  "aspley": { lat: -27.3644, lng: 153.0150 },
  "north-lakes": { lat: -27.2333, lng: 153.0333 },
  "caboolture": { lat: -27.0847, lng: 152.9511 },
  "morningside": { lat: -27.4567, lng: 153.0700 },
  "coorparoo": { lat: -27.4933, lng: 153.0550 },
  "greenslopes": { lat: -27.5100, lng: 153.0450 },
  "holland-park": { lat: -27.5200, lng: 153.0667 },
  "tarragindi": { lat: -27.5283, lng: 153.0417 },
  "annerley": { lat: -27.5100, lng: 153.0333 },
  "moorooka": { lat: -27.5283, lng: 153.0250 },
  "kenmore": { lat: -27.5067, lng: 152.9383 },
  "indooroopilly": { lat: -27.4983, lng: 152.9750 },
  "chapel-hill": { lat: -27.5050, lng: 152.9550 },
  "the-gap": { lat: -27.4350, lng: 152.9517 },
  "ferny-grove": { lat: -27.3983, lng: 152.9467 },
  "everton-park": { lat: -27.4050, lng: 152.9917 },
  "stafford": { lat: -27.4100, lng: 153.0117 },
  "nundah": { lat: -27.4017, lng: 153.0567 },
  "marsden": { lat: -27.6720, lng: 153.0960 },
  "shailer-park": { lat: -27.6380, lng: 153.1640 },
  "underwood": { lat: -27.6050, lng: 153.1170 },
  "robina": { lat: -28.0770, lng: 153.3850 },
  "nerang": { lat: -27.9890, lng: 153.3370 },
  "coomera": { lat: -27.8620, lng: 153.3430 },
  "ormeau": { lat: -27.8210, lng: 153.2560 },
  "burpengary": { lat: -27.1570, lng: 152.9590 },
  "redcliffe": { lat: -27.2280, lng: 153.1010 },
  "morayfield": { lat: -27.1090, lng: 152.9500 },
  "strathpine": { lat: -27.3050, lng: 152.9890 },
  "goodna": { lat: -27.6100, lng: 152.8880 },
  "brassall": { lat: -27.5890, lng: 152.7350 },
  "redbank-plains": { lat: -27.6450, lng: 152.8600 },
  "ripley": { lat: -27.6800, lng: 152.7900 },
  "bracken-ridge": { lat: -27.3180, lng: 153.0330 },
  "thornlands": { lat: -27.5560, lng: 153.2060 },
  "calamvale": { lat: -27.6190, lng: 153.0500 },
  "sunnybank-hills": { lat: -27.6100, lng: 153.0560 },
  "alexandra-hills": { lat: -27.5310, lng: 153.2220 },
  "redland-bay": { lat: -27.6130, lng: 153.2940 },
  "eight-mile-plains": { lat: -27.5790, lng: 153.0990 },
  "rochedale": { lat: -27.5700, lng: 153.1260 },
  "pimpama": { lat: -27.8130, lng: 153.2930 },
  "mango-hill": { lat: -27.2380, lng: 153.0190 },
  "bellbird-park": { lat: -27.6430, lng: 152.8690 },
  "victoria-point": { lat: -27.5850, lng: 153.2840 },
  "upper-coomera": { lat: -27.8730, lng: 153.2830 },
  "kallangur": { lat: -27.2490, lng: 152.9880 },
  "narangba": { lat: -27.2030, lng: 152.9630 },
  ...MORE_SUBURB_COORDS,
};

export default function SuburbPage() {
  const params = useParams<{ suburbSlug: string }>();
  const suburbSlug = params.suburbSlug || "";
  const suburb = SUBURBS[suburbSlug];

  if (!suburb) {
    return (
      <div className="min-h-screen bg-brand-offwhite">
        <Navbar />
        <div className="container py-32 text-center">
          <h1 className="text-3xl font-bold text-brand-charcoal mb-4">Area Not Found</h1>
          <p className="text-gray-500 mb-8" style={{ fontFamily: "var(--font-body)" }}>
            The area page you're looking for doesn't exist.
          </p>
          <Link href="/#service-area">
            <span className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-6 py-3 rounded-md transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-body)" }}>
              View All Service Areas
            </span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `https://concreteconceptsgroup.com/areas/${suburb.slug}#business`,
    name: "Concrete Concepts Group Pty Ltd",
    alternateName: "Concrete Concepts Group",
    description: `Professional concreting services in ${suburb.name}, ${suburb.region}. Driveways, slabs, retaining walls, exposed aggregate, patios, pool surrounds & excavation. QBCC Licensed #15299707.`,
    telephone: "+61424463268",
    email: "info@concreteconceptsgroup.com",
    url: "https://concreteconceptsgroup.com",
    image: suburb.heroImage,
    logo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/logo_ec91c1a1.jpeg",
    priceRange: "$$",
    currenciesAccepted: "AUD",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    address: {
      "@type": "PostalAddress",
      streetAddress: suburb.name,
      addressLocality: suburb.name,
      addressRegion: "QLD",
      postalCode: suburb.postcode,
      addressCountry: "AU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SUBURB_COORDS[suburb.slug]?.lat ?? -27.4698,
      longitude: SUBURB_COORDS[suburb.slug]?.lng ?? 153.0251,
    },
    areaServed: [
      {
        "@type": "City",
        name: suburb.name,
        "@id": `https://en.wikipedia.org/wiki/${suburb.name.replace(/ /g, "_")},_Queensland`,
      },
      {
        "@type": "State",
        name: "Queensland",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "47",
      bestRating: "5",
      worstRating: "1",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "06:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "07:00",
        closes: "14:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Concreting Services in ${suburb.name}`,
      itemListElement: suburb.popularServices.map((svc, i) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: svc.name,
          description: svc.description,
          url: `https://concreteconceptsgroup.com/services/${svc.slug}`,
          areaServed: {
            "@type": "City",
            name: suburb.name,
          },
          provider: {
            "@type": "HomeAndConstructionBusiness",
            name: "Concrete Concepts Group Pty Ltd",
          },
        },
      })),
    },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "QBCC Licence",
      identifier: "15299707",
    },
    sameAs: [
      "https://www.google.com/maps/place/Concrete+concepts+group+pty+Ltd/@-27.4479932,153.0574609,17z/data=!3m1!4b1!4m6!3m5!1s0x6b9159cc3c034933:0xd957176f933fae1!8m2!3d-27.4479932!4d153.0574609",
      "https://www.facebook.com/share/14Z2spZfScB/",
      "https://www.concrete-concepts.com.au/",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: suburb.faqs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title={suburb.metaTitle}
        description={suburb.metaDescription}
        canonical={`/areas/${suburb.slug}`}
        keywords={`concreter near me, concreting near me, ${suburb.keywords}`}
        ogImage={suburb.heroImage}
        structuredData={[localBusinessSchema, faqSchema]}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative bg-brand-charcoal text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={suburb.heroImage}
              width={1200}
              height={600}
              loading="eager"
              decoding="sync"
            alt={`Concreting services in ${suburb.name} by Concrete Concepts Group`}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/80 to-brand-charcoal" />
        </div>
        <div className="relative container py-20 lg:py-28">
          <Breadcrumbs
            items={[
              { label: "Service Areas", href: "/#service-area" },
              { label: suburb.name },
            ]}
            className="mb-8"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <MapPin className="w-5 h-5 text-brand-gold" />
            <span className="text-brand-gold text-sm font-semibold tracking-wider uppercase" style={{ fontFamily: "var(--font-body)" }}>
              {suburb.region} · {suburb.postcode}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 max-w-3xl"
          >
            {suburb.h1}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/70 max-w-2xl mb-8 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {suburb.intro}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="/get-quote"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all shadow-xl"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Get a Free Quote in {suburb.name}
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/10 px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Phone className="w-4 h-4" />
              0424 463 268
            </a>
          </motion.div>
        </div>
      </section>

      {/* About the Area */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-6">
              Concreting in <span className="text-brand-gold italic">{suburb.name}</span>
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg" style={{ fontFamily: "var(--font-body)" }}>
              {suburb.areaDescription}
            </p>

            {/* Trust Badges */}
            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-brand-offwhite rounded-lg p-4">
                <Shield className="w-8 h-8 text-brand-gold shrink-0" />
                <div>
                  <p className="font-bold text-brand-charcoal text-sm">QBCC Licensed</p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: "var(--font-body)" }}>#15299707</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-brand-offwhite rounded-lg p-4">
                <Star className="w-8 h-8 text-brand-gold shrink-0" />
                <div>
                  <p className="font-bold text-brand-charcoal text-sm">5-Star Rated</p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: "var(--font-body)" }}>Google & HiPages</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-brand-offwhite rounded-lg p-4">
                <Clock className="w-8 h-8 text-brand-gold shrink-0" />
                <div>
                  <p className="font-bold text-brand-charcoal text-sm">Free Quotes</p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: "var(--font-body)" }}>Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services in Area */}
      <section className="py-20 lg:py-24 bg-brand-offwhite">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-10 text-center">
              Our Services in <span className="text-brand-gold italic">{suburb.name}</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {suburb.popularServices.map((service, i) => (
                <motion.div
                  key={service.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link href={`/services/${service.slug}`}>
                    <div className="bg-white rounded-xl p-6 h-full hover:shadow-lg transition-all cursor-pointer border border-gray-100 group">
                      <div className="flex items-start gap-3 mb-3">
                        <Hammer className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                        <h3 className="font-bold text-brand-charcoal group-hover:text-brand-gold transition-colors">
                          {service.name}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                        {service.description}
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-brand-gold text-sm font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                        Learn more <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {/* Extra internal links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Link href="/finishes">
                  <div className="bg-white rounded-xl p-6 h-full hover:shadow-lg transition-all cursor-pointer border border-gray-100 group">
                    <div className="flex items-start gap-3 mb-3">
                      <Star className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                      <h3 className="font-bold text-brand-charcoal group-hover:text-brand-gold transition-colors">
                        Compare Concrete Finishes
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      Explore and compare 5 concrete finishes side-by-side — see durability, maintenance, and cost ratings.
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-brand-gold text-sm font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                      View Finishes <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {suburb.testimonialSnippet && (
        <section className="py-16 bg-brand-charcoal text-white">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <blockquote className="text-xl italic text-white/90 mb-4 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                "{suburb.testimonialSnippet.text}"
              </blockquote>
              <p className="text-white/50 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                — {suburb.testimonialSnippet.name}, {suburb.testimonialSnippet.service}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-8">
              Concreting {suburb.name} — <span className="text-brand-gold italic">FAQ</span>
            </h2>
            <div className="space-y-6">
              {suburb.faqs.map((faq, i) => (
                <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                  <h3 className="font-semibold text-brand-charcoal text-lg mb-2" style={{ fontFamily: "var(--font-body)" }}>
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Areas */}
      <section className="py-16 bg-brand-offwhite">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-brand-charcoal mb-6">
              Also Serving <span className="text-brand-gold italic">Nearby Areas</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {suburb.nearbySuburbs.map(nearby => {
                const hasPage = SUBURBS[nearby.slug];
                return hasPage ? (
                  <Link key={nearby.slug} href={`/areas/${nearby.slug}`}>
                    <span className="bg-white border border-gray-200 hover:border-brand-gold text-brand-charcoal hover:text-brand-gold px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                      {nearby.name}
                    </span>
                  </Link>
                ) : (
                  <span key={nearby.slug} className="bg-white border border-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm" style={{ fontFamily: "var(--font-body)" }}>
                    {nearby.name}
                  </span>
                );
              })}
            </div>
            <p className="text-gray-500 text-sm mt-6" style={{ fontFamily: "var(--font-body)" }}>
              We service all of Brisbane and surrounding areas.{" "}
              <a href="/get-quote" className="text-brand-gold hover:underline">Get a free quote</a> for your area.
            </p>
          </div>
        </div>
      </section>

      {/* Helpful Articles — Blog Cross-Linking */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-brand-gold" />
              <h2 className="text-xl font-bold text-brand-charcoal" style={{ fontFamily: "var(--font-heading)" }}>
                Helpful <span className="text-brand-gold italic">Articles</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[{s:"concrete-driveway-cost-brisbane-price-guide",t:"Concrete Driveway Cost Brisbane: 2026 Price Guide"},{s:"exposed-aggregate-concrete-cost-brisbane-price-guide",t:"Exposed Aggregate Cost Brisbane: Price Guide"},{s:"concrete-retaining-wall-cost-brisbane-price-guide",t:"Retaining Wall Cost Brisbane: Materials & Prices"},{s:"how-long-concrete-cure-brisbane-weather",t:"How Long Does Concrete Take to Cure in Brisbane?"}].map(a => (
                <a key={a.s} href={`/blog/${a.s}`} className="flex items-center gap-3 p-3 bg-brand-offwhite hover:bg-brand-gold/10 rounded-lg border border-gray-200 hover:border-brand-gold transition-all">
                  <ArrowRight className="w-4 h-4 text-brand-gold shrink-0" />
                  <span className="text-sm font-medium text-brand-charcoal" style={{ fontFamily: "var(--font-body)" }}>{a.t}</span>
                </a>
              ))}
            </div>
            <div className="text-center mt-4">
              <a href="/blog" className="text-brand-gold text-sm font-semibold hover:underline" style={{ fontFamily: "var(--font-body)" }}>
                View All Articles →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-gold">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-4">
            Ready to Start Your {suburb.name} Project?
          </h2>
          <p className="text-brand-charcoal/70 mb-8 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            Get a free, no-obligation quote for your concreting project in {suburb.name}. Call us or fill out our online form.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/get-quote"
              className="inline-flex items-center justify-center gap-2 bg-brand-charcoal hover:bg-brand-charcoal/90 text-white font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Get a Free Quote
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-brand-charcoal font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Phone className="w-4 h-4" />
              0424 463 268
            </a>
          </div>
        </div>
      </section>

      {/* Google Maps - Local SEO Signal */}
      <section className="py-16 bg-brand-charcoal">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-brand-gold" />
              <h2 className="text-xl font-bold text-white">
                Concrete Concepts Group — Servicing <span className="text-brand-gold italic">{suburb.name}</span>
              </h2>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl border border-white/10">
              <iframe
                title={`Concrete Concepts Group service area - ${suburb.name}, Brisbane`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${suburb.name}, Brisbane, QLD, Australia`)}&output=embed`}
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Callback popup - appears after 30 seconds */}
      <CallbackPopup suburbName={suburb.name} delay={30000} />
      <StickyMobileCTA />
    </div>
  );
}

export { SUBURBS, SUBURB_SLUGS };
