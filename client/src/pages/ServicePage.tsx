/*
  ServicePage: Dedicated landing pages for each key service
  SEO-optimized with 1500+ words, pricing tables, comparison charts, structured data
  URL pattern: /services/:serviceSlug
*/
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Shield, Phone, Star, MapPin, DollarSign, Clock, Ruler, HelpCircle, BookOpen, Quote } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { trackPhoneCallClick } from "@/components/ConversionTracking";
import { trpc } from "@/lib/trpc";

// Topic cluster mapping: service page slug → related blog post slugs
const SERVICE_TO_BLOG_MAP: Record<string, string[]> = {
  "concrete-driveways-brisbane": [
    "concrete-driveway-cost-brisbane-price-guide",
    "concrete-driveway-vs-pavers-cost-comparison-brisbane",
    "concrete-vs-asphalt-driveway-brisbane",
    "best-concrete-finishes-brisbane-driveways",
    "how-to-maintain-concrete-driveway-brisbane",
    "signs-concrete-driveway-needs-replacing",
    "concrete-driveways-outdoor-areas-boost-property-value",
  ],
  "exposed-aggregate-brisbane": [
    "exposed-aggregate-concrete-cost-brisbane-price-guide",
    "exposed-aggregate-vs-plain-concrete-brisbane",
    "exposed-aggregate-colours-stone-blend-guide",
    "best-concrete-finishes-brisbane-driveways",
    "coloured-concrete-options-brisbane-homes",
  ],
  "retaining-walls-brisbane": [
    "concrete-retaining-wall-cost-brisbane-price-guide",
    "retaining-wall-guide-brisbane-types-costs-council",
    "council-approval-retaining-walls-queensland",
    "concrete-sloping-blocks-brisbane-solutions",
  ],
  "concrete-slabs-brisbane": [
    "concrete-slab-thickness-australian-standards",
    "concrete-slab-preparation-most-important-part",
    "how-long-concrete-cure-brisbane-weather",
    "pouring-concrete-rain-wet-weather-brisbane",
  ],
  "concrete-patios-brisbane": [
    "concrete-patio-cost-brisbane-guide",
    "decorative-concrete-ideas-brisbane-outdoor",
    "brisbane-outdoor-living-concrete-trends-2026",
    "stencilled-concrete-vs-stamped-concrete",
  ],
  "excavation-brisbane": [
    "excavation-cost-brisbane-price-guide",
    "concrete-slab-preparation-most-important-part",
  ],
  "crossover-permits-brisbane": [
    "concrete-crossover-permits-brisbane",
  ],
  "pool-surrounds-brisbane": [
    "pool-surrounds-brisbane-concrete-vs-pavers-vs-tiles",
    "decorative-concrete-ideas-brisbane-outdoor",
  ],
  "shed-slabs-brisbane": [
    "concrete-shed-slabs-brisbane-guide",
    "concrete-slab-thickness-australian-standards",
  ],
};

interface PricingRow {
  type: string;
  range: string;
  est50: string;
  notes: string;
}

interface ComparisonRow {
  feature: string;
  values: string[];
}

interface ServiceData {
  slug: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  heroImage: string;
  intro: string;
  detailedContent: string[];
  benefits: string[];
  process: { step: string; description: string }[];
  pricingIntro: string;
  pricingTable: PricingRow[];
  pricingNotes: string;
  comparison?: { headers: string[]; rows: ComparisonRow[] };
  faqs: { q: string; a: string }[];
  relatedServices: string[];
  suburbs: string[];
  ctaText: string;
}

// Service-specific reviews — shown on each service page for targeted social proof
const SERVICE_REVIEWS: Record<string, { name: string; location: string; text: string; source: string }[]> = {
  "concrete-driveways-brisbane": [
    { name: "Myresh M", location: "Mount Gravatt East", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. Very happy with the result and highly recommend!!", source: "HiPages" },
    { name: "Darren C", location: "Brisbane", text: "Jarrad and his team did an amazing job on our driveway. From start to finish, the communication was excellent and the quality of work was outstanding.", source: "Google" },
    { name: "Lisa W", location: "Brisbane", text: "Jarrod and his team replaced our old cracked driveway with a beautiful exposed aggregate finish. They were punctual, tidy and the result exceeded our expectations.", source: "Google" },
  ],
  "exposed-aggregate-brisbane": [
    { name: "Myresh M", location: "Mount Gravatt East", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. Very happy with the result and highly recommend!!", source: "HiPages" },
    { name: "Helen K", location: "Geebung", text: "Connected with Concrete Concepts and would recommend them.", source: "HiPages" },
    { name: "Jenny F", location: "Brisbane", text: "Jarrad quoted our job quickly and started within the week. The exposed aggregate driveway looks beautiful. Very happy we chose Concrete Concepts!", source: "Google" },
  ],
  "retaining-walls-brisbane": [
    { name: "Amanda R", location: "Brisbane", text: "Concrete Concepts did our entire backyard — patio, paths and retaining wall. Jarrad was easy to deal with, gave honest advice and delivered exactly what was promised.", source: "Google" },
    { name: "Kailash S", location: "Kenmore", text: "Highly professional, respected our requirement, on time and completed the work to our entire satisfaction. Happy to recommend Jarred.", source: "HiPages" },
    { name: "Priya N", location: "Brisbane", text: "We got quotes from 5 different concreters and Jarrad was the most professional and fairly priced. The finished product is stunning!", source: "Google" },
  ],
  "concrete-slabs-brisbane": [
    { name: "Michael B", location: "Brisbane", text: "Great team, great work. Had a large slab poured for our shed and the boys were efficient and professional. Price was fair and the finish was perfect.", source: "Google" },
    { name: "Steve K", location: "Brisbane", text: "Jarrad and the boys did a great job on our shed slab and side paths. On time, on budget and excellent communication throughout.", source: "Google" },
    { name: "Joe S", location: "Collingwood Park", text: "Excellent job done and quick and reliable.", source: "HiPages" },
  ],
  "concrete-patios-brisbane": [
    { name: "Sarah T", location: "Brisbane", text: "We had our patio and pool surround done by Concrete Concepts. The exposed aggregate finish looks incredible. Highly recommend!", source: "Google" },
    { name: "Amanda R", location: "Brisbane", text: "Concrete Concepts did our entire backyard — patio, paths and retaining wall. Jarrad was easy to deal with, gave honest advice and delivered exactly what was promised.", source: "Google" },
    { name: "Sheeba", location: "Annerley", text: "Highly recommend Jarrod and his boys team for their exceptional professional work.", source: "HiPages" },
  ],
  "excavation-brisbane": [
    { name: "Joe S", location: "Collingwood Park", text: "Excellent job done and quick and reliable.", source: "HiPages" },
    { name: "Kailash S", location: "Kenmore", text: "Highly professional, respected our requirement, on time and completed the work to our entire satisfaction. Happy to recommend Jarred.", source: "HiPages" },
    { name: "Tom H", location: "Brisbane", text: "Top quality work on our crossover and driveway. The team was friendly, hardworking and left the site spotless. Would recommend to anyone in Brisbane.", source: "Google" },
  ],
  "crossover-permits-brisbane": [
    { name: "Tom H", location: "Brisbane", text: "Top quality work on our crossover and driveway. The team was friendly, hardworking and left the site spotless. Would recommend to anyone in Brisbane.", source: "Google" },
    { name: "Darren C", location: "Brisbane", text: "Jarrad and his team did an amazing job on our driveway. From start to finish, the communication was excellent and the quality of work was outstanding.", source: "Google" },
    { name: "Paul S", location: "Shailer Park", text: "The price was what I had expected to pay and they came out to inspect the site before quoting. Would recommend them.", source: "HiPages" },
  ],
  "pool-surrounds-brisbane": [
    { name: "Sarah T", location: "Brisbane", text: "We had our patio and pool surround done by Concrete Concepts. The exposed aggregate finish looks incredible. Highly recommend!", source: "Google" },
    { name: "Mark D", location: "Brisbane", text: "Second time using Concrete Concepts — first for our driveway, now for the pool surround. Consistently excellent work.", source: "Google" },
    { name: "Priya N", location: "Brisbane", text: "We got quotes from 5 different concreters and Jarrad was the most professional and fairly priced. The finished product is stunning!", source: "Google" },
  ],
  "shed-slabs-brisbane": [
    { name: "Michael B", location: "Brisbane", text: "Great team, great work. Had a large slab poured for our shed and the boys were efficient and professional. Price was fair and the finish was perfect.", source: "Google" },
    { name: "Steve K", location: "Brisbane", text: "Jarrad and the boys did a great job on our shed slab and side paths. On time, on budget and excellent communication throughout.", source: "Google" },
    { name: "Paul S", location: "Shailer Park", text: "The price was what I had expected to pay and they came out to inspect the site before quoting. Would recommend them.", source: "HiPages" },
  ],
};

const SERVICES: Record<string, ServiceData> = {
  "concrete-driveways-brisbane": {
    slug: "concrete-driveways-brisbane",
    title: "Concrete Driveways Brisbane",
    h1: "Concrete Driveways Brisbane — Expert Installation & Replacement",
    metaTitle: "Concrete Driveways Brisbane | From $75/m² | Free Quotes | Concrete Concepts",
    metaDescription: "Professional concrete driveway installation in Brisbane. Exposed aggregate, coloured & plain concrete driveways from $75/m². QBCC Licensed #15299707. Free quotes within 24hrs. Call 0424 463 268.",
    keywords: "concrete driveway near me, concrete driveway Brisbane, exposed aggregate driveway Brisbane, concrete driveway cost Brisbane, driveway concreter Brisbane, new driveway Brisbane, driveway replacement Brisbane, coloured concrete driveway Brisbane",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
    intro: "Your driveway is the first thing visitors see when they arrive at your property. At Concrete Concepts Group, we specialise in designing and installing premium concrete driveways across Brisbane and all surrounding areas. Whether you're after a sleek exposed aggregate finish, a bold coloured concrete statement, or a clean plain concrete driveway, our QBCC licensed team delivers outstanding results every time.",
    detailedContent: [
      "A well-built concrete driveway does more than just provide a surface to park on — it sets the tone for your entire property. In Brisbane's competitive real estate market, kerb appeal matters, and a quality driveway can add $10,000 to $30,000 to your property's value. At Concrete Concepts Group, we've poured hundreds of driveways across Brisbane's southside, northside, and western suburbs, and we understand exactly what it takes to build a driveway that looks stunning and lasts for decades.",
      "Brisbane's subtropical climate presents unique challenges for concrete driveways. Summer temperatures regularly exceed 35°C, which can cause rapid moisture loss during curing and lead to surface cracking if not managed correctly. Heavy rainfall events — especially during storm season — require proper drainage engineering to prevent water pooling and erosion around your driveway edges. Our team factors all of these Queensland-specific conditions into every project, from concrete mix design to joint spacing and curing methods.",
      "When it comes to choosing a finish for your Brisbane driveway, you have several excellent options. Plain concrete (also called standard grey) is the most affordable and provides a clean, modern look that suits contemporary homes. Coloured concrete uses oxide pigments mixed into the concrete to create rich, permanent colours — popular choices in Brisbane include charcoal, sandstone, and terracotta. Exposed aggregate reveals the natural stones within the mix, creating a textured, decorative surface that's slip-resistant and hides minor imperfections. Stencilled or stamped concrete replicates the look of pavers, brick, or natural stone at a fraction of the cost.",
      "One of the most common questions we receive is whether to repair or replace an existing driveway. As a general rule, if your driveway has widespread cracking, significant settlement, or is more than 25 years old, replacement is usually the better investment. Surface-level damage like minor cracks or discolouration can often be addressed with resurfacing or covercrete overlay. During our free site inspection, we'll assess your existing driveway and give you honest advice on the most cost-effective approach.",
    ],
    benefits: [
      "Exposed aggregate, coloured, stencilled, and plain concrete options",
      "Durable finishes engineered for Queensland's harsh climate",
      "Professional formwork and SL72/SL82 steel reinforcement",
      "Free on-site quotes with transparent, all-inclusive pricing",
      "QBCC Licensed (#15299707) with full public liability insurance",
      "Old concrete removal and disposal included in quotes",
      "Custom designs to complement your home's architecture",
      "Proper drainage and slope engineering for Brisbane conditions",
      "25MPa minimum concrete strength for residential driveways",
      "Curing compound applied to prevent surface cracking",
    ],
    process: [
      { step: "Free Site Inspection & Quote", description: "We visit your property, measure up, discuss finishes and colours, assess drainage requirements, and provide a detailed written quote within 24-48 hours. No obligation, no pressure." },
      { step: "Preparation & Excavation", description: "We remove old concrete if needed (included in quote), excavate to the correct depth (typically 150-200mm), compact the sub-base with a plate compactor, and install timber or steel formwork and SL72/SL82 reinforcement mesh." },
      { step: "Concrete Pour & Finishing", description: "Fresh 25MPa concrete is poured via pump or direct pour, vibrated to remove air pockets, screeded level, and finished to your chosen style — whether exposed aggregate, coloured, stencilled, or plain." },
      { step: "Curing & Handover", description: "We apply curing compound to ensure proper hydration, cut control joints to prevent random cracking, and provide detailed aftercare instructions. Light foot traffic after 24hrs, vehicles after 7 days minimum." },
    ],
    pricingIntro: "Concrete driveway costs in Brisbane depend on the finish type, area size, site preparation requirements, and access. Below are current Brisbane rates based on our recent projects:",
    pricingTable: [
      { type: "Plain Concrete", range: "$75 – $95/m²", est50: "$3,750 – $4,750", notes: "Standard grey, broom or trowel finish" },
      { type: "Coloured Concrete", range: "$85 – $120/m²", est50: "$4,250 – $6,000", notes: "Oxide pigments, range of earth tones" },
      { type: "Exposed Aggregate", range: "$110 – $160/m²", est50: "$5,500 – $8,000", notes: "Premium stone blends, sealed" },
      { type: "Stencilled / Stamped", range: "$100 – $150/m²", est50: "$5,000 – $7,500", notes: "Pattern replicating pavers/stone" },
      { type: "Covercrete Overlay", range: "$80 – $130/m²", est50: "$4,000 – $6,500", notes: "Resurfacing existing concrete" },
    ],
    pricingNotes: "All prices include GST, formwork, reinforcement, concrete supply, finishing, and curing. Excavation and old concrete removal quoted separately based on site conditions. Minimum project size applies.",
    comparison: {
      headers: ["Feature", "Concrete Driveway", "Paver Driveway", "Asphalt Driveway"],
      rows: [
        { feature: "Cost per m²", values: ["$75 – $160", "$120 – $200+", "$50 – $80"] },
        { feature: "Lifespan", values: ["30+ years", "20-25 years", "15-20 years"] },
        { feature: "Maintenance", values: ["Very low — seal every 3-5 years", "Medium — re-sand, re-level", "High — reseal every 2-3 years"] },
        { feature: "Appearance", values: ["Wide range of finishes", "Classic look, many patterns", "Basic black/grey only"] },
        { feature: "Durability", values: ["Excellent — handles heavy vehicles", "Good — can shift/settle", "Fair — softens in heat"] },
        { feature: "Installation time", values: ["2-4 days", "3-7 days", "1-2 days"] },
        { feature: "Property value", values: ["High impact", "High impact", "Low impact"] },
      ],
    },
    faqs: [
      { q: "How much does a concrete driveway cost in Brisbane?", a: "Concrete driveway costs in Brisbane typically range from $75 to $160 per square metre depending on the finish. A standard single-car driveway (35-40m²) costs approximately $2,600 to $6,400, while a double driveway (55-70m²) ranges from $4,100 to $11,200. Plain concrete is the most affordable, while exposed aggregate and decorative finishes are at the higher end. Our quotes are fully inclusive — no hidden costs." },
      { q: "How long does it take to install a new concrete driveway?", a: "Most residential driveways take 2-4 days of on-site work, depending on size and complexity. This includes excavation (day 1), formwork and reinforcement (day 1-2), pouring and finishing (day 2-3), and cleanup (day 3-4). After pouring, concrete needs 24 hours before foot traffic, 7 days before light vehicles, and 28 days before heavy vehicles." },
      { q: "Can you replace my existing driveway?", a: "Yes! We handle the full process — demolition of old concrete using a hydraulic breaker, excavation, sub-base preparation, and installation of your new driveway. Old materials are loaded and taken to approved disposal facilities. The cost of removal is typically $22-$35 per square metre depending on thickness." },
      { q: "What concrete strength do you use for driveways?", a: "We use a minimum of 25MPa concrete for residential driveways, which is the Australian Standard requirement. For driveways that will carry heavy vehicles (trucks, caravans, boats), we upgrade to 32MPa or 40MPa. The concrete is reinforced with SL72 or SL82 steel mesh for additional strength." },
      { q: "Do I need council approval for a new driveway in Brisbane?", a: "In most cases, replacing an existing driveway doesn't require council approval. However, if you're creating a new crossover (vehicle crossing from the road to your property), you'll need a crossover permit from Brisbane City Council. We can advise you during our site inspection." },
      { q: "How do I maintain my concrete driveway?", a: "Concrete driveways are very low maintenance. We recommend sealing every 3-5 years (especially exposed aggregate), regular sweeping to remove debris, and occasional pressure washing. Avoid using harsh chemicals or de-icing salts. If you notice any cracks, address them early to prevent water ingress." },
      { q: "Concrete vs pavers — which is better for a driveway?", a: "Both have advantages. Concrete driveways are more cost-effective ($75-$160/m² vs $120-$200+/m² for pavers), require less maintenance, and don't shift or settle over time. Pavers offer easy individual replacement if damaged. For most Brisbane homeowners, concrete provides better value and longevity. See our comparison table above for a detailed breakdown." },
    ],
    relatedServices: ["exposed-aggregate-brisbane", "concrete-slabs-brisbane", "concrete-patios-brisbane"],
    suburbs: ["Carindale", "Mount Gravatt", "Sunnybank", "Mansfield", "Wishart", "Holland Park", "Camp Hill", "Coorparoo", "Greenslopes", "Annerley", "Logan", "Springfield", "Ipswich"],
    ctaText: "Ready for a new driveway? Get your free quote today.",
  },
  "exposed-aggregate-brisbane": {
    slug: "exposed-aggregate-brisbane",
    title: "Exposed Aggregate Brisbane",
    h1: "Exposed Aggregate Concrete Brisbane — Premium Stone Finishes",
    metaTitle: "Exposed Aggregate Brisbane | Premium Stone Finishes | From $110/m² | Concrete Concepts",
    metaDescription: "Beautiful exposed aggregate concrete in Brisbane. Wide range of stone blends for driveways, patios, pool surrounds. QBCC Licensed. From $110/m². Free quotes. Call 0424 463 268.",
    keywords: "exposed aggregate near me, exposed aggregate Brisbane, exposed aggregate concrete Brisbane, exposed aggregate driveway Brisbane, exposed aggregate patio Brisbane, decorative concrete Brisbane, exposed aggregate cost Brisbane, exposed aggregate pool surround Brisbane",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-exposed-agg_3890c724.jpeg",
    intro: "Exposed aggregate is Brisbane's most popular decorative concrete finish, and for good reason. It combines natural beauty with exceptional durability, slip resistance, and low maintenance. At Concrete Concepts Group, we offer a wide range of stone blends and colours to create stunning driveways, patios, pool surrounds, and pathways that enhance your property's value and kerb appeal.",
    detailedContent: [
      "Exposed aggregate concrete has become the finish of choice for Brisbane homeowners who want something more than standard grey concrete but don't want the ongoing maintenance of pavers. The technique involves pouring concrete with a specially selected stone mix, then washing away the top cement layer at precisely the right time to reveal the beautiful natural stones beneath. The result is a textured, decorative surface that's both visually striking and incredibly practical.",
      "The key to a great exposed aggregate finish is the stone selection. In Brisbane, the most popular blends include Canberra Mix (warm gold and brown tones), Goulburn Mix (grey and charcoal tones), and Balmoral Mix (multi-coloured natural stones). We bring physical samples to every consultation so you can see and feel the options against your home's colour scheme. The stone blend you choose will dramatically affect the final look, so we take time to help you make the right decision.",
      "One of the biggest advantages of exposed aggregate in Brisbane's climate is its superior slip resistance. The exposed stones create a naturally textured surface that provides excellent grip, even when wet — making it the ideal choice for pool surrounds, outdoor entertaining areas, and driveways that get regular rainfall. This is a significant safety advantage over smooth-finished concrete or polished surfaces.",
      "Maintenance is minimal but important. We recommend applying a penetrating sealer within 28 days of pouring and resealing every 2-3 years. This protects the surface from staining, enhances the stone colours, and extends the life of your concrete. Between seals, regular sweeping and occasional pressure washing will keep your exposed aggregate looking fresh for decades.",
    ],
    benefits: [
      "Wide selection of natural stone blends and colour combinations",
      "Superior slip resistance — ideal for pool surrounds and wet areas",
      "Extremely durable and long-lasting in Queensland's harsh climate",
      "Low maintenance — just seal every 2-3 years",
      "Hides minor surface imperfections better than plain concrete",
      "Adds significant value and visual appeal to your property",
      "Custom blends to match your home's colour scheme",
      "QBCC Licensed with a proven track record across Brisbane",
      "Heat-reflective properties — stays cooler than dark surfaces",
      "Environmentally friendly — uses natural stone aggregates",
    ],
    process: [
      { step: "Design Consultation", description: "We bring stone samples to your property so you can see and feel the options. We'll help you choose the perfect blend for your project and provide a detailed written quote." },
      { step: "Site Preparation", description: "Excavation, compaction, formwork installation, and steel reinforcement are completed to ensure a solid foundation. Proper drainage is installed where needed." },
      { step: "Pour & Expose", description: "Concrete is poured with your chosen aggregate mix, levelled, and floated. At precisely the right time (usually 4-8 hours depending on conditions), the surface is washed with a retarder and pressure washer to reveal the stones." },
      { step: "Seal & Protect", description: "After 28 days of curing, a high-quality penetrating sealer is applied to enhance stone colour, protect against staining, and ensure long-lasting beauty. We provide a sealer maintenance schedule." },
    ],
    pricingIntro: "Exposed aggregate pricing in Brisbane varies based on the stone blend, project size, and site conditions. Here are current rates from our recent projects:",
    pricingTable: [
      { type: "Standard Blend", range: "$110 – $130/m²", est50: "$5,500 – $6,500", notes: "Popular Canberra or Goulburn mix" },
      { type: "Premium Blend", range: "$130 – $150/m²", est50: "$6,500 – $7,500", notes: "Multi-colour or custom stone mix" },
      { type: "Designer Blend", range: "$150 – $170/m²", est50: "$7,500 – $8,500", notes: "Rare stones, specialty finishes" },
      { type: "Exposed + Coloured Border", range: "$120 – $160/m²", est50: "$6,000 – $8,000", notes: "Two-tone with coloured concrete border" },
    ],
    pricingNotes: "All prices include GST, formwork, reinforcement, concrete with aggregate, finishing, initial sealer application, and cleanup. Excavation quoted separately. Minimum 15m² project size.",
    comparison: {
      headers: ["Feature", "Exposed Aggregate", "Plain Concrete", "Pavers"],
      rows: [
        { feature: "Cost per m²", values: ["$110 – $170", "$75 – $95", "$120 – $200+"] },
        { feature: "Slip resistance", values: ["Excellent", "Good (broom finish)", "Good"] },
        { feature: "Maintenance", values: ["Seal every 2-3 years", "Seal every 3-5 years", "Re-sand, re-level regularly"] },
        { feature: "Kerb appeal", values: ["High — premium look", "Moderate — clean look", "High — classic look"] },
        { feature: "Heat retention", values: ["Low — light stones reflect", "Medium", "High — dark pavers absorb"] },
        { feature: "Lifespan", values: ["30+ years", "30+ years", "20-25 years"] },
      ],
    },
    faqs: [
      { q: "What is exposed aggregate concrete?", a: "Exposed aggregate concrete reveals the natural stones within the concrete mix by washing away the top cement layer before it fully sets. This creates a textured, decorative surface with excellent slip resistance and visual appeal. The technique has been used for decades and is now the most popular decorative concrete finish in Brisbane." },
      { q: "How much does exposed aggregate cost in Brisbane?", a: "Exposed aggregate typically costs between $110 to $170 per square metre in Brisbane, depending on the stone blend, project size, and site conditions. A standard driveway (50m²) would cost approximately $5,500 to $8,500. We provide free, detailed quotes for every project with no hidden costs." },
      { q: "How do I maintain exposed aggregate?", a: "Exposed aggregate is low maintenance. Apply a penetrating sealer within 28 days of pouring and reseal every 2-3 years. Between seals, sweep regularly and pressure wash occasionally (use a fan nozzle, not a turbo nozzle). Avoid harsh chemicals and acidic cleaners. With proper care, exposed aggregate will look beautiful for 30+ years." },
      { q: "Can exposed aggregate be used around pools?", a: "Absolutely — exposed aggregate is one of the best choices for pool surrounds. The textured surface provides excellent slip resistance when wet, it stays cooler than dark-coloured surfaces, and it's resistant to pool chemicals. We use specific stone blends that complement pool environments." },
      { q: "What stone blends are available?", a: "We offer a wide range of stone blends including Canberra Mix (warm gold/brown), Goulburn Mix (grey/charcoal), Balmoral Mix (multi-colour), and several premium designer blends. We bring physical samples to every consultation so you can see the options against your home." },
      { q: "How long before I can walk/drive on exposed aggregate?", a: "Light foot traffic is safe after 24-48 hours. Vehicles should wait a minimum of 7 days, ideally 14 days. The concrete reaches full strength at 28 days, which is when we apply the initial sealer. We provide detailed aftercare instructions with every project." },
    ],
    relatedServices: ["concrete-driveways-brisbane", "concrete-patios-brisbane", "concrete-slabs-brisbane"],
    suburbs: ["Paddington", "Red Hill", "Ashgrove", "Bardon", "The Gap", "Ferny Grove", "Mitchelton", "Everton Park", "Stafford", "Chermside", "Aspley", "North Lakes"],
    ctaText: "Want to see exposed aggregate samples? Book a free consultation.",
  },
  "retaining-walls-brisbane": {
    slug: "retaining-walls-brisbane",
    title: "Retaining Walls Brisbane",
    h1: "Retaining Walls Brisbane — Structural & Decorative Solutions",
    metaTitle: "Retaining Walls Brisbane | Concrete & Sleeper Walls | From $300/lm | Concrete Concepts",
    metaDescription: "Expert retaining wall construction in Brisbane. Concrete, sleeper & block walls. Engineered designs for sloping blocks. QBCC Licensed #15299707. Free quotes. Call 0424 463 268.",
    keywords: "retaining wall near me, retaining walls Brisbane, concrete retaining wall Brisbane, retaining wall builder Brisbane, sleeper retaining wall Brisbane, retaining wall cost Brisbane, block retaining wall Brisbane, retaining wall engineer Brisbane",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-retaining-wall-1_942fd49e.jpeg",
    intro: "Brisbane's hilly terrain means retaining walls are essential for many properties. Whether you need to manage a sloping block, create usable outdoor space, or prevent soil erosion, Concrete Concepts Group builds strong, engineered retaining walls that stand the test of time. We work with concrete, timber sleepers, and block systems to deliver the right solution for your property and budget.",
    detailedContent: [
      "Retaining walls are one of the most critical structural elements on Brisbane properties. With the city's undulating terrain — particularly in suburbs like Kenmore, Chapel Hill, Paddington, and the western corridor — a properly engineered retaining wall is often the difference between a usable backyard and a wasted hillside. At Concrete Concepts Group, we've built retaining walls across every type of Brisbane terrain, from gentle slopes to steep hillside properties.",
      "The type of retaining wall you need depends on several factors: the height of the wall, the soil type, the load it needs to support (is there a driveway or structure above?), and your aesthetic preferences. Poured concrete retaining walls are the strongest option and ideal for walls over 1 metre. Concrete block walls (such as Boral or Adbri blocks) offer a great balance of strength and appearance. Timber sleeper walls suit garden terracing and lower-height applications.",
      "In Brisbane, any retaining wall over 1 metre in height requires building approval from Brisbane City Council and must be designed by a registered structural engineer. Walls near property boundaries, easements, or stormwater infrastructure may have additional requirements regardless of height. We handle the entire process — from engineering design through to council certification — so you don't have to navigate the bureaucracy yourself.",
      "Drainage is the single most important factor in retaining wall longevity. Hydrostatic pressure (water building up behind the wall) is the number one cause of retaining wall failure in Brisbane. Every wall we build includes agricultural drainage pipe (ag pipe) at the base, gravel drainage blanket behind the wall, and weep holes to allow water to escape. This is non-negotiable — even on walls that 'seem dry'. Brisbane's storm events can saturate soil rapidly, and without proper drainage, even the strongest wall will eventually fail.",
    ],
    benefits: [
      "Concrete, sleeper, and block retaining wall options",
      "Engineered designs for walls over 1 metre in height",
      "Proper ag pipe drainage systems to prevent hydrostatic pressure",
      "Ideal for sloping blocks and hillside properties",
      "Creates usable flat areas for gardens, patios, and driveways",
      "Prevents soil erosion and protects property foundations",
      "QBCC Licensed with structural engineering partnerships",
      "Full excavation, formwork, and site preparation included",
      "Council approval assistance for walls requiring permits",
      "Retaining wall and driveway/slab packages available",
    ],
    process: [
      { step: "Site Assessment & Engineering", description: "We assess your terrain, soil conditions, drainage, and load requirements. For walls over 1m, we arrange structural engineering design and council approval. You receive a detailed quote with engineering drawings." },
      { step: "Excavation & Footings", description: "The site is excavated to the engineer's specifications. Reinforced concrete footings are poured to provide a solid foundation for the wall. Drainage infrastructure is installed at this stage." },
      { step: "Wall Construction", description: "Your retaining wall is built using your chosen material — poured concrete, concrete blocks, or timber sleepers — with steel reinforcement as specified by the engineer. Each course is checked for level and alignment." },
      { step: "Drainage, Backfill & Certification", description: "Agricultural drainage pipe and gravel blanket are installed behind the wall. The area is backfilled and compacted in layers. For engineered walls, a final inspection and Form 15 certification is provided." },
    ],
    pricingIntro: "Retaining wall costs vary significantly based on height, length, material, engineering requirements, and site access. Here are indicative Brisbane rates:",
    pricingTable: [
      { type: "Timber Sleeper (under 1m)", range: "$200 – $350/lm", est50: "N/A", notes: "Garden terracing, low walls" },
      { type: "Concrete Block (under 1m)", range: "$300 – $450/lm", est50: "N/A", notes: "Structural, no engineering needed" },
      { type: "Concrete Block (1-2m)", range: "$450 – $700/lm", est50: "N/A", notes: "Engineered, council approved" },
      { type: "Poured Concrete (1-2m)", range: "$500 – $800/lm", est50: "N/A", notes: "Maximum strength, engineered" },
      { type: "Poured Concrete (2m+)", range: "$800 – $1,200+/lm", est50: "N/A", notes: "Heavy-duty, full engineering" },
    ],
    pricingNotes: "Prices are per lineal metre and include materials, labour, drainage, and backfill. Engineering fees ($1,500-$3,500) and council application fees ($500-$1,000) are additional for walls requiring approval. Excavation quoted separately.",
    faqs: [
      { q: "Do I need council approval for a retaining wall in Brisbane?", a: "In Brisbane, retaining walls over 1 metre in height generally require building approval and structural engineering certification. Walls under 1 metre typically don't need approval, but there are exceptions — walls near boundaries (within 1.5m), near easements, or supporting structures may still require approval regardless of height. We advise on requirements during our free site inspection." },
      { q: "How much does a retaining wall cost in Brisbane?", a: "Retaining wall costs depend on height, length, material, and site conditions. Timber sleeper walls start from $200/lm, concrete block walls from $300/lm, and poured concrete walls from $500/lm. A typical 10-metre concrete block wall at 1.2m height would cost approximately $4,500-$7,000 including engineering. We provide free, detailed quotes." },
      { q: "What type of retaining wall is best?", a: "It depends on your situation. Poured concrete walls are the strongest and best for high walls or heavy loads. Concrete block walls offer great strength with a clean appearance. Timber sleeper walls suit garden terracing and lower heights. We'll recommend the best option during our site assessment based on your specific requirements and budget." },
      { q: "How long does a retaining wall last?", a: "A properly built and drained concrete retaining wall will last 50+ years. Concrete block walls typically last 40-50 years. Timber sleeper walls have a shorter lifespan of 15-25 years depending on the timber type and treatment. The key to longevity is proper drainage — this is why we never cut corners on ag pipe and gravel installation." },
      { q: "Can you build a retaining wall on a boundary?", a: "Yes, but walls on or near boundaries have specific requirements under the Queensland Building Act. You may need a boundary agreement with your neighbour, and the wall must comply with setback requirements. We handle boundary wall projects regularly and can guide you through the process." },
      { q: "What causes retaining walls to fail?", a: "The number one cause is poor drainage. When water builds up behind a retaining wall (hydrostatic pressure), it can exert enormous force — up to 1,000kg per square metre on a 2m wall. Other causes include inadequate footings, insufficient reinforcement, and poor compaction of backfill. Every wall we build addresses all of these factors." },
    ],
    relatedServices: ["concrete-slabs-brisbane", "concrete-driveways-brisbane", "excavation-brisbane"],
    suburbs: ["Kenmore", "Chapel Hill", "Indooroopilly", "Fig Tree Pocket", "Pullenvale", "Brookfield", "Moggill", "Bellbowrie", "Jindalee", "Mount Ommaney", "Ipswich", "Springfield"],
    ctaText: "Need a retaining wall? Get a free site assessment and quote.",
  },
  "concrete-slabs-brisbane": {
    slug: "concrete-slabs-brisbane",
    title: "Concrete Slabs Brisbane",
    h1: "Concrete Slabs & Foundations Brisbane — Residential & Commercial",
    metaTitle: "Concrete Slabs Brisbane | House Slabs & Shed Slabs | From $75/m² | Concrete Concepts",
    metaDescription: "Professional concrete slab installation in Brisbane. House slabs, shed slabs, garage floors & commercial foundations from $75/m². QBCC Licensed. Free quotes. Call 0424 463 268.",
    keywords: "concrete slab near me, concrete slab Brisbane, house slab Brisbane, shed slab Brisbane, concrete foundation Brisbane, slab concreter Brisbane, garage slab Brisbane, concrete slab cost Brisbane",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-finished-slab_74e9f7cd.jpeg",
    intro: "A quality concrete slab is the foundation of every great build. At Concrete Concepts Group, we pour residential and commercial slabs across Brisbane and all surrounding areas — from house pads and shed floors to garage slabs and commercial foundations. Every slab is engineered, reinforced, and finished to Australian standards, giving you a rock-solid base that will last for decades.",
    detailedContent: [
      "The concrete slab is arguably the most important element of any building project. It's the foundation that everything else sits on, and getting it wrong can lead to costly structural problems down the track. At Concrete Concepts Group, we take slab work seriously — every slab we pour is designed to meet or exceed Australian Standard AS 2870 (Residential Slabs and Footings), with proper engineering, reinforcement, and quality control throughout the process.",
      "Brisbane's reactive clay soils present particular challenges for slab construction. Many suburbs — especially in the western corridor (Springfield, Forest Lake, Ipswich) and southern suburbs (Logan, Beenleigh) — have highly reactive soils that expand and contract with moisture changes. This movement can crack poorly designed slabs and damage the structures above them. Our slabs are engineered specifically for your site's soil classification (from Class A to Class H2), with appropriate beam depths, reinforcement, and moisture management.",
      "We pour several types of slabs depending on the application. Raft slabs (also called waffle pod slabs) are the most common for residential construction — they use polystyrene void formers to create a stiffened raft that sits on the ground surface. Strip footings with suspended slabs are used on sloping sites or where greater ground clearance is needed. Post-tensioned slabs use steel cables tensioned after pouring to create extremely strong, thin slabs ideal for commercial applications.",
      "For shed slabs and garage floors, the requirements are different from house slabs. A typical shed slab is 100mm thick with SL72 mesh reinforcement and 20MPa concrete — sufficient for storage and light workshop use. If you're parking heavy vehicles or installing a hoist, we upgrade to 150mm thickness, SL82 mesh, and 32MPa concrete. Every shed slab we pour includes proper edge beams, a vapour barrier, and control joints to prevent cracking.",
    ],
    benefits: [
      "House slabs, shed slabs, garage floors, and commercial foundations",
      "Engineered to Australian Standards (AS 2870) for your soil type",
      "Steel reinforcement mesh (SL72/SL82) and bar for maximum strength",
      "Level, smooth finishes ready for building or flooring",
      "Full excavation, compaction, and site preparation included",
      "Concrete pumping available for difficult access sites",
      "QBCC Licensed (#15299707) with full insurance",
      "Coordination with builders, plumbers, and other trades",
      "Vapour barrier and moisture management included",
      "Control joints cut to prevent random cracking",
    ],
    process: [
      { step: "Engineering & Planning", description: "We work with structural engineers to design your slab based on soil classification, building loads, and site conditions. You receive engineering drawings and a detailed quote before any work begins." },
      { step: "Excavation & Preparation", description: "The site is excavated to engineering specifications, levelled, and compacted. Vapour barrier is installed, followed by formwork, edge beams, and steel reinforcement mesh positioned on bar chairs at the correct height." },
      { step: "Concrete Pour", description: "Concrete is poured using a pump or direct pour (depending on access), vibrated to remove air pockets, screeded to level, and finished to a smooth surface. We coordinate timing with concrete suppliers to ensure continuous pours." },
      { step: "Curing & Inspection", description: "Curing compound is applied immediately after finishing. Control joints are cut within 24 hours. The slab is inspected against engineering specifications, and you receive Form 15 certification for building approval." },
    ],
    pricingIntro: "Concrete slab costs depend on size, thickness, reinforcement, soil conditions, and engineering requirements. Here are current Brisbane rates:",
    pricingTable: [
      { type: "Shed Slab (100mm)", range: "$75 – $100/m²", est50: "$3,750 – $5,000", notes: "Standard shed/garage floor" },
      { type: "Shed Slab (150mm heavy-duty)", range: "$95 – $130/m²", est50: "$4,750 – $6,500", notes: "Workshop, heavy vehicles" },
      { type: "House Slab (raft/waffle pod)", range: "$100 – $160/m²", est50: "N/A", notes: "Engineered, Class A-H2 soils" },
      { type: "Commercial Slab", range: "$120 – $200/m²", est50: "N/A", notes: "Heavy-duty, post-tensioned options" },
    ],
    pricingNotes: "All prices include GST, concrete supply, reinforcement, formwork, finishing, and curing. Engineering fees ($2,000-$5,000 for house slabs) are additional. Excavation and site preparation quoted based on conditions.",
    faqs: [
      { q: "How much does a concrete slab cost in Brisbane?", a: "Concrete slab costs depend on type and size. Shed slabs start from $75/m² (100mm thick), heavy-duty slabs from $95/m², and house slabs from $100/m². A 50m² shed slab typically costs $3,750-$5,000, while a 100m² house slab ranges from $10,000-$16,000 plus engineering. We provide free, detailed quotes." },
      { q: "How thick should a concrete slab be?", a: "Standard shed/garage slabs are 100mm thick. Heavy-duty slabs (workshops, heavy vehicles) should be 150mm. House slabs are designed by engineers based on soil classification — typically 100-150mm with deeper edge beams (300-600mm). Your engineer specifies the correct thickness for your project." },
      { q: "How long does a concrete slab take to cure?", a: "Concrete reaches approximately 70% strength at 7 days and full design strength at 28 days. Light foot traffic is safe after 24-48 hours. Building work can typically begin after 7 days. The slab should not be loaded with heavy materials or equipment for at least 14 days." },
      { q: "Do I need engineering for a shed slab?", a: "Simple shed slabs under 10m x 10m on stable soil generally don't require engineering. However, if your site has reactive soils, a slope, or the shed will be used as a workshop with heavy equipment, engineering is recommended. House slabs always require engineering. We'll advise during our site inspection." },
      { q: "What is a waffle pod slab?", a: "A waffle pod (or raft) slab uses polystyrene void formers arranged in a grid pattern, with reinforced concrete beams between them. This creates a stiffened raft that distributes loads evenly and resists soil movement. It's the most common house slab type in Brisbane and is suitable for most soil classifications." },
      { q: "Can you pour a slab on a sloping site?", a: "Yes! Sloping sites may require a suspended slab on strip footings, a cut-and-fill approach, or a split-level design. These are more complex and costly than flat-site slabs, but we have extensive experience with Brisbane's hilly terrain. Engineering design is essential for sloping sites." },
    ],
    relatedServices: ["concrete-driveways-brisbane", "retaining-walls-brisbane", "excavation-brisbane"],
    suburbs: ["Springfield", "Forest Lake", "Darra", "Oxley", "Inala", "Richlands", "Durack", "Goodna", "Redbank Plains", "Marsden", "Logan", "Beenleigh"],
    ctaText: "Need a slab quote? Call us for a free site inspection.",
  },
  "concrete-patios-brisbane": {
    slug: "concrete-patios-brisbane",
    title: "Concrete Patios Brisbane",
    h1: "Concrete Patios & Entertaining Areas Brisbane",
    metaTitle: "Concrete Patios Brisbane | Outdoor Entertaining Areas | From $75/m² | Concrete Concepts",
    metaDescription: "Transform your backyard with a premium concrete patio in Brisbane. Exposed aggregate, coloured & plain finishes from $75/m². Perfect for outdoor entertaining. Free quotes. Call 0424 463 268.",
    keywords: "concrete patio near me, concrete patio Brisbane, outdoor entertaining area Brisbane, concrete patio cost Brisbane, backyard concrete Brisbane, patio concreter Brisbane, alfresco concrete Brisbane, outdoor living Brisbane",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-4_c54657e7.jpeg",
    intro: "Brisbane's outdoor lifestyle deserves a premium entertaining space. At Concrete Concepts Group, we design and build stunning concrete patios and outdoor entertaining areas that extend your living space and add value to your home. From exposed aggregate alfresco areas to sleek coloured concrete patios, we create spaces that are perfect for Queensland's year-round outdoor living.",
    detailedContent: [
      "Queenslanders spend more time outdoors than almost any other Australians, and a well-designed patio or entertaining area is essential for making the most of Brisbane's 283 sunny days per year. A concrete patio doesn't just add usable space to your home — it creates a seamless transition between indoor and outdoor living that's become a must-have for modern Brisbane properties.",
      "When designing your patio, we consider how you'll use the space. Will it be a BBQ and dining area? A relaxation zone with outdoor furniture? A play area for kids? Each use case influences the size, shape, finish, and drainage design. We also consider the relationship between your patio and the house — level transitions, door thresholds, and how the patio connects to existing paths and garden areas.",
      "The finish you choose for your patio should balance aesthetics, safety, and practicality. Exposed aggregate is the most popular choice for Brisbane patios because it's slip-resistant, heat-reflective, and visually stunning. Coloured concrete offers a clean, modern look with a wide range of colour options. Broom-finished plain concrete is the most cost-effective option and provides good slip resistance. For covered patios, a smooth trowel finish can work well since rain exposure is minimal.",
      "Drainage is critical for outdoor concrete areas. Brisbane receives an average of 1,149mm of rainfall annually, with intense summer storms that can dump 50-100mm in a single event. Every patio we build has a minimum 1:100 fall (10mm per metre) away from the house, with surface drainage channels where needed. This prevents water pooling on the patio and protects your home's foundations from water damage.",
    ],
    benefits: [
      "Exposed aggregate, coloured, and plain concrete finishes",
      "Designed for Brisbane's outdoor lifestyle and climate",
      "Non-slip finishes for safety around pool areas and wet zones",
      "Integrated drainage with minimum 1:100 fall from house",
      "Custom shapes and designs to suit your backyard",
      "Seamless connection between indoor and outdoor spaces",
      "Low maintenance and extremely durable — 30+ year lifespan",
      "Adds significant value to your property (10-15% ROI)",
      "Step-down designs for split-level backyards",
      "Fire pit and outdoor kitchen integration available",
    ],
    process: [
      { step: "Design & Quote", description: "We visit your property, discuss your vision for the space, take measurements, and provide a detailed quote with finish options, layout recommendations, and drainage design. We bring stone samples for exposed aggregate options." },
      { step: "Preparation", description: "The area is excavated to the correct depth, compacted, and prepared with proper formwork, reinforcement (SL72 mesh), and drainage provisions. We ensure correct falls away from the house." },
      { step: "Pour & Finish", description: "Concrete is poured and finished to your chosen style. We take extra care with edges, expansion joints, and surface texture. For exposed aggregate, timing of the wash is critical and we monitor conditions closely." },
      { step: "Seal & Enjoy", description: "A quality penetrating sealer is applied to protect and enhance the finish. We provide aftercare instructions and a maintenance schedule. Your new patio is ready for entertaining!" },
    ],
    pricingIntro: "Concrete patio costs in Brisbane depend on the finish, size, site preparation, and access. Here are current rates:",
    pricingTable: [
      { type: "Plain Concrete (broom finish)", range: "$75 – $95/m²", est50: "$2,250 – $2,850 (30m²)", notes: "Cost-effective, good grip" },
      { type: "Coloured Concrete", range: "$85 – $120/m²", est50: "$2,550 – $3,600 (30m²)", notes: "Wide colour range" },
      { type: "Exposed Aggregate", range: "$110 – $160/m²", est50: "$3,300 – $4,800 (30m²)", notes: "Most popular for patios" },
      { type: "Stencilled / Stamped", range: "$100 – $150/m²", est50: "$3,000 – $4,500 (30m²)", notes: "Paver/stone look" },
    ],
    pricingNotes: "All prices include GST, formwork, reinforcement, concrete, finishing, sealer, and cleanup. Excavation and old surface removal quoted separately. Typical patio size is 20-40m².",
    faqs: [
      { q: "How much does a concrete patio cost in Brisbane?", a: "Concrete patio costs range from $75 to $160 per square metre depending on the finish. A typical 30m² patio costs between $2,250 and $4,800. Exposed aggregate is the most popular choice at $110-$160/m². We provide free, detailed quotes for every project." },
      { q: "What finish is best for an outdoor patio?", a: "Exposed aggregate is the most popular choice for Brisbane patios due to its slip resistance, durability, heat-reflective properties, and visual appeal. Broom-finished concrete is also excellent for outdoor areas and is the most affordable option. For covered patios, coloured concrete with a smooth finish works beautifully." },
      { q: "Can you build a patio around my pool?", a: "Absolutely! We specialise in pool surrounds with non-slip finishes. Exposed aggregate is particularly popular for pool areas due to its excellent grip when wet and its ability to stay cooler than dark surfaces. We ensure proper drainage away from the pool and comply with all safety requirements." },
      { q: "How long does it take to build a patio?", a: "Most residential patios take 2-3 days — one day for preparation and formwork, one day for pouring and finishing, and a final day for cleanup and sealer application (after curing). The patio can be walked on after 24-48 hours but should be sealed after 28 days." },
      { q: "Will a patio add value to my home?", a: "Yes! A quality outdoor entertaining area is one of the highest-ROI home improvements in Brisbane. Real estate agents consistently report that well-designed patios add 10-15% to property value and are a top priority for Brisbane buyers. A $5,000 patio investment can add $15,000-$30,000 in perceived value." },
      { q: "Can you match my patio to my existing driveway?", a: "Yes — if your driveway is exposed aggregate, we can use the same or complementary stone blend for your patio. If your driveway is coloured concrete, we can match the oxide colour. Consistent finishes across your property create a cohesive, premium look." },
    ],
    relatedServices: ["exposed-aggregate-brisbane", "concrete-driveways-brisbane", "concrete-slabs-brisbane"],
    suburbs: ["Capalaba", "Cleveland", "Redland Bay", "Victoria Point", "Thornlands", "Alexandra Hills", "Birkdale", "Wellington Point", "Wynnum", "Manly West"],
    ctaText: "Ready to transform your backyard? Get a free patio quote.",
  },
  "excavation-brisbane": {
    slug: "excavation-brisbane",
    title: "Excavation Brisbane",
    h1: "Excavation & Site Preparation Brisbane — Residential & Commercial",
    metaTitle: "Excavation Brisbane | Site Prep & Earthworks | Concrete Concepts",
    metaDescription: "Professional excavation and site preparation in Brisbane. Residential & commercial earthworks, trenching, site clearing. Own machinery. QBCC Licensed. Free quotes. Call 0424 463 268.",
    keywords: "excavation near me, excavation Brisbane, site preparation Brisbane, earthworks Brisbane, excavation services Brisbane, trenching Brisbane, site clearing Brisbane, bobcat hire Brisbane, excavator hire Brisbane",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-gallery-5_d25c6ec1.jpeg",
    intro: "Every great concrete project starts with proper site preparation. At Concrete Concepts Group, we provide full excavation and earthworks services across Brisbane — from small residential digs to large commercial site preparation. With our own machinery and experienced operators, we handle site clearing, trenching, levelling, and soil removal efficiently and safely.",
    detailedContent: [
      "Excavation is the unglamorous but essential first step of any concreting project. The quality of your finished concrete — whether it's a driveway, slab, patio, or retaining wall — depends entirely on the quality of the ground preparation beneath it. Poorly compacted sub-base, inadequate depth, or leftover organic material can lead to settlement, cracking, and costly repairs. At Concrete Concepts Group, we don't cut corners on excavation because we know it's the foundation of everything we build.",
      "We operate our own fleet of machinery including mini excavators (1.7T and 3.5T), skid steer loaders (bobcats), plate compactors, and tipper trucks. Owning our equipment means we're not dependent on subcontractor availability — we can schedule your excavation to fit your project timeline without delays. For tight access sites (narrow side yards, rear yards with limited gate access), our 1.7T mini excavator can fit through openings as narrow as 900mm.",
      "Brisbane's soil conditions vary dramatically across the city. The eastern suburbs (Wynnum, Manly, Capalaba) tend to have sandy soils that are easy to excavate but may require additional compaction. The western suburbs (Kenmore, Chapel Hill, Ipswich) often have heavy clay soils that are harder to dig but provide a more stable base. The northern suburbs (Chermside, Aspley, North Lakes) can have fill material from previous development that needs to be removed and replaced with certified fill.",
      "Every excavation project includes a Dial Before You Dig (DBYD) check to identify underground services — water, sewer, gas, electricity, and telecommunications. Hitting an underground service can be dangerous and expensive, so we always obtain service plans before breaking ground. We also check for asbestos-containing materials in older properties, particularly when demolishing existing concrete structures built before 1990.",
    ],
    benefits: [
      "Own machinery — mini excavators, bobcats, compactors, tippers",
      "No subcontractor delays — we control the schedule",
      "Residential and commercial excavation services",
      "Tight access excavation (900mm minimum opening)",
      "Site clearing, levelling, and compaction",
      "Trenching for footings, drainage, and services",
      "Soil removal and responsible waste disposal with tip dockets",
      "Dial Before You Dig (DBYD) checks on every project",
      "Seamless integration with our concreting services",
      "QBCC Licensed with full insurance and WorkCover",
    ],
    process: [
      { step: "Site Assessment & DBYD", description: "We assess your site, obtain Dial Before You Dig plans to identify underground services, and plan the excavation to minimise disruption. You receive a detailed quote including disposal costs." },
      { step: "Excavation", description: "Using the right machinery for your site (mini excavator for tight access, larger machines for open sites), we excavate to the required depth and dimensions with precision. Spoil is loaded directly onto tippers for removal." },
      { step: "Levelling & Compaction", description: "The excavated area is levelled using a laser level for accuracy, then compacted in layers using a plate compactor or roller. Compaction testing is available for engineered projects." },
      { step: "Waste Removal & Cleanup", description: "All excavated material is removed from site and taken to approved disposal facilities. Tip dockets are provided for your records. The site is left clean, level, and ready for the next stage of your project." },
    ],
    pricingIntro: "Excavation costs depend on volume, soil type, access, and disposal requirements. Here are indicative Brisbane rates:",
    pricingTable: [
      { type: "Driveway excavation", range: "$18 – $30/m²", est50: "$900 – $1,500 (50m²)", notes: "150-200mm depth, standard access" },
      { type: "Slab site preparation", range: "$15 – $25/m²", est50: "$1,500 – $2,500 (100m²)", notes: "Level site, standard soil" },
      { type: "Old concrete removal", range: "$22 – $35/m²", est50: "$1,100 – $1,750 (50m²)", notes: "Includes demolition & disposal" },
      { type: "Retaining wall trench", range: "$50 – $100/lm", est50: "N/A", notes: "Depth depends on wall height" },
      { type: "Tight access surcharge", range: "+15 – 25%", est50: "N/A", notes: "Mini excavator required" },
    ],
    pricingNotes: "All prices include GST, machinery, operator, and standard disposal. Contaminated soil, rock, or asbestos-containing material incur additional disposal fees. Minimum half-day hire applies.",
    faqs: [
      { q: "How much does excavation cost in Brisbane?", a: "Excavation costs depend on volume, soil type, access, and disposal. Driveway excavation typically costs $18-$30/m², slab preparation $15-$25/m², and old concrete removal $22-$35/m². A typical residential excavation job ranges from $500 to $3,000. We provide free, detailed quotes." },
      { q: "Do you handle soil disposal?", a: "Yes, we handle all soil removal and disposal as part of our excavation service. Clean fill goes to approved fill sites, and contaminated material goes to licensed disposal facilities. We provide tip dockets for your records and can arrange compaction certificates if needed." },
      { q: "Can you excavate in tight access areas?", a: "Yes! Our 1.7T mini excavator can fit through openings as narrow as 900mm, making it ideal for narrow side yards, rear yards with limited gate access, and steep terrain. For very tight spaces, we can also hand-dig with our team." },
      { q: "Do you check for underground services?", a: "Absolutely — every excavation project includes a Dial Before You Dig (DBYD) check to identify water, sewer, gas, electricity, and telecommunications services. We also physically pot-hole (hand-dig) near identified services to confirm their exact location before using machinery." },
      { q: "Can you remove old concrete?", a: "Yes, we demolish and remove old concrete as part of our excavation service. We use hydraulic breakers on our excavators to break up existing concrete, then load it onto tippers for disposal at approved recycling facilities. Cost is typically $22-$35/m² depending on thickness." },
      { q: "Do you provide compaction testing?", a: "Yes, for engineered projects (house slabs, commercial foundations), we can arrange independent compaction testing to verify that the sub-base meets engineering specifications. This is typically required for building approval and provides documented proof of proper preparation." },
    ],
    relatedServices: ["concrete-slabs-brisbane", "retaining-walls-brisbane", "concrete-driveways-brisbane"],
    suburbs: ["Ipswich", "Brassall", "Booval", "Bundamba", "Riverview", "Karalee", "Bellbird Park", "Collingwood Park", "Redbank", "Raceview", "Springfield", "Logan"],
    ctaText: "Need excavation? Get a free site assessment and quote.",
  },

  "crossover-permits-brisbane": {
    slug: "crossover-permits-brisbane",
    title: "Crossover Permits & Vehicle Crossings Brisbane",
    h1: "Crossover Permits & Vehicle Crossings Brisbane — Council-Approved Installation",
    metaTitle: "Crossover Permits Brisbane | Council-Approved Vehicle Crossings | Concrete Concepts",
    metaDescription: "Need a new vehicle crossover in Brisbane? We handle the full process — council permit application, demolition, construction, and inspection. QBCC Licensed #15299707. Free quotes. Call 0424 463 268.",
    keywords: "crossover near me, crossover permit Brisbane, vehicle crossing Brisbane, driveway crossover Brisbane, council crossover application, new crossover Brisbane, BCC crossover permit, concrete crossover Brisbane",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/new-concrete-driveway_963e8b9e.png",
    intro: "Installing a new vehicle crossover (the section of driveway between the road and your property boundary) requires a council permit in Brisbane. At Concrete Concepts Group, we handle the entire process — from lodging the crossover application with Brisbane City Council to constructing the crossing to council specifications and arranging the final inspection. No stress, no paperwork headaches.",
    detailedContent: [
      "A vehicle crossover (also called a vehicle crossing or driveway crossing) is the section of concrete that connects the road to your property boundary. In Brisbane, any new crossover or modification to an existing one requires approval from Brisbane City Council (BCC) under the Transport Operations (Road Use Management) Act.",
      "The permit process involves submitting a Vehicle Crossing Application to BCC, which includes a site plan showing the proposed crossover location, dimensions, and proximity to services (stormwater, power poles, trees). BCC typically processes applications within 10-15 business days. The permit fee is approximately $200-$400 depending on the crossover type.",
      "Once approved, the crossover must be constructed to BCC's Standard Drawing SD-1102 specifications. This includes minimum concrete thickness of 125mm, SL72 mesh reinforcement, 20MPa minimum concrete strength, and specific kerb ramp geometry. We build every crossover to these exact specifications so it passes the council inspection first time.",
      "After construction, BCC conducts a compliance inspection to verify the crossover meets all requirements. If you're replacing an existing crossover, the old one must be demolished and the kerb and channel reinstated where it's no longer needed. We handle all demolition, disposal, and reinstatement as part of our service.",
    ],
    benefits: [
      "Full permit application service — we handle all council paperwork",
      "Built to BCC Standard Drawing SD-1102 specifications",
      "Council inspection arranged and managed by us",
      "Old crossover demolition and kerb reinstatement included",
      "QBCC Licensed (#15299707) and fully insured",
      "Typically completed within 2-3 days of construction",
      "Compliant with all Brisbane City Council requirements",
      "Free on-site assessment and quote",
    ],
    process: [
      { step: "Site Assessment", description: "We inspect your property, measure the proposed crossover location, and check for underground services, trees, and council setback requirements." },
      { step: "Permit Application", description: "We prepare and lodge the Vehicle Crossing Application with Brisbane City Council on your behalf, including all required plans and documentation." },
      { step: "Permit Approval", description: "BCC reviews the application (typically 10-15 business days). We follow up and notify you once approved." },
      { step: "Construction", description: "We demolish any existing crossover, prepare the sub-base, and pour the new crossover to BCC specifications. Typically 2-3 days on-site." },
      { step: "Council Inspection", description: "We arrange the BCC compliance inspection. Once passed, your new crossover is officially approved for use." },
    ],
    pricingIntro: "Crossover costs depend on width, length, and whether an existing crossover needs demolition. Here are typical Brisbane prices:",
    pricingTable: [
      { type: "Single Crossover (3m wide)", range: "$2,500 – $4,000", est50: "N/A", notes: "Standard residential crossing" },
      { type: "Double Crossover (5-6m wide)", range: "$4,000 – $6,500", est50: "N/A", notes: "For double garages or wider access" },
      { type: "Old Crossover Removal", range: "$800 – $1,500", est50: "N/A", notes: "Includes kerb reinstatement" },
      { type: "Council Permit Fee", range: "$200 – $400", est50: "N/A", notes: "Paid to BCC, varies by type" },
    ],
    pricingNotes: "All prices include GST, permit application service, construction to council specs, and post-construction inspection coordination. Prices may vary based on site conditions, access difficulty, and crossover length.",
    faqs: [
      { q: "Do I need a permit for a new driveway crossover in Brisbane?", a: "Yes. Brisbane City Council requires a Vehicle Crossing Permit for any new crossover or modification to an existing one. This applies even if you're just widening your current crossover. The permit ensures the crossing meets safety and drainage standards. We handle the entire application process for you." },
      { q: "How long does it take to get a crossover permit from BCC?", a: "Brisbane City Council typically processes Vehicle Crossing Applications within 10-15 business days. Complex applications (near trees, services, or intersections) may take longer. We follow up with council regularly and notify you as soon as the permit is approved." },
      { q: "How much does a crossover permit cost in Brisbane?", a: "The BCC permit fee is approximately $200-$400 depending on the crossover type and width. This is a council fee paid directly to BCC. Our service fee for preparing and lodging the application is included in our overall quote." },
      { q: "Can I build a crossover myself?", a: "While you can apply for the permit yourself, the construction must meet BCC's Standard Drawing SD-1102 specifications. This requires specific concrete thickness (125mm minimum), reinforcement (SL72 mesh), and kerb ramp geometry. Using a licensed concreter ensures compliance and avoids costly rework if the council inspection fails." },
      { q: "What if my crossover application is rejected?", a: "Rejections are uncommon when applications are prepared correctly. Common reasons include proximity to intersections, conflict with street trees, or drainage issues. If your application is rejected, we'll work with council to find an alternative solution or modify the design to meet requirements." },
    ],
    relatedServices: ["concrete-driveways-brisbane", "excavation-brisbane", "concrete-slabs-brisbane"],
    suburbs: ["Brisbane CBD", "Carindale", "Mount Gravatt", "Sunnybank", "Camp Hill", "Coorparoo", "Indooroopilly", "Kenmore", "The Gap", "Stafford", "Nundah", "Wynnum"],
    ctaText: "Need a new crossover? We handle the permit and construction — call for a free quote.",
  },
  "pool-surrounds-brisbane": {
    slug: "pool-surrounds-brisbane",
    title: "Concrete Pool Surrounds Brisbane",
    h1: "Concrete Pool Surrounds Brisbane — Slip-Resistant & Stylish Finishes",
    metaTitle: "Pool Surrounds Brisbane | Exposed Aggregate & Concrete | From $110/m² | Concrete Concepts",
    metaDescription: "Professional concrete pool surrounds in Brisbane. Exposed aggregate, coloured & plain concrete with slip-resistant finishes. QBCC Licensed #15299707. Free quotes. Call 0424 463 268.",
    keywords: "pool surround near me, pool surround Brisbane, concrete pool surround, exposed aggregate pool surround Brisbane, pool paving Brisbane, pool area concrete, slip resistant pool surround, pool deck Brisbane",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/pool-surround-1_adcdb251.jpg",
    intro: "Your pool surround needs to look great, feel comfortable underfoot, and — most importantly — be safe when wet. At Concrete Concepts Group, we specialise in slip-resistant concrete pool surrounds that combine safety with style. Whether you prefer the natural beauty of exposed aggregate, the warmth of coloured concrete, or the clean look of a honed finish, we'll create a pool area you'll love.",
    detailedContent: [
      "Concrete is the most popular choice for pool surrounds in Brisbane for good reason — it's durable, versatile, and can be finished in dozens of styles. Unlike pavers that shift and allow weed growth, or timber decking that splinters and requires constant maintenance, concrete pool surrounds are seamless, low-maintenance, and last 30+ years.",
      "Safety is paramount around pools. All our pool surrounds are finished with slip-resistant textures that meet Australian Standard AS 4586 for wet pendulum slip resistance. Exposed aggregate is naturally slip-resistant due to the textured stone surface, while broom-finished and honed concrete can achieve excellent grip ratings. We test every finish to ensure it meets safety requirements.",
      "Brisbane's subtropical climate means your pool surround needs to handle intense UV, heavy rain, and pool chemicals. We use salt-resistant concrete mixes and apply penetrating sealers that protect against chlorine, salt water, and UV degradation. This means your pool surround will look great for years without fading, staining, or deteriorating.",
      "We work around your existing pool shell, coping, and landscaping to create a seamless transition from your home to the pool area. Whether you need a complete new surround or want to extend your existing pool area into an entertaining space, we'll design a solution that maximises your outdoor living.",
    ],
    benefits: [
      "Slip-resistant finishes meeting AS 4586 safety standards",
      "Salt and chlorine resistant concrete mixes",
      "UV-stable colours that won't fade in Brisbane sun",
      "Seamless finish — no weeds, no shifting, no trip hazards",
      "30+ year lifespan with minimal maintenance",
      "Cool-touch options for barefoot comfort in summer",
      "Wide range of colours and stone blends to match your home",
      "QBCC Licensed (#15299707) and fully insured",
    ],
    process: [
      { step: "Design Consultation", description: "We visit your property, assess the pool area, discuss your preferred finish and colour, and provide a detailed quote." },
      { step: "Site Preparation", description: "We prepare the sub-base around your pool, ensuring proper drainage falls away from the pool and house. Any existing pavers or concrete are removed." },
      { step: "Formwork & Reinforcement", description: "We set formwork to your pool coping level and lay SL72 mesh reinforcement. Expansion joints are placed at the pool edge and house connection." },
      { step: "Pour & Finish", description: "We pour the concrete and apply your chosen finish — exposed aggregate, broom, coloured, or honed. Slip-resistance is tested before we leave." },
      { step: "Seal & Cure", description: "After curing, we apply a penetrating sealer that protects against salt, chlorine, and UV. Your pool surround is ready for use in 7 days." },
    ],
    pricingIntro: "Pool surround costs depend on the finish type, area size, and site conditions. Here are typical Brisbane prices:",
    pricingTable: [
      { type: "Plain Concrete (broom finish)", range: "$75 – $95/m²", est50: "$2,600 – $3,300", notes: "Slip-resistant broom texture" },
      { type: "Coloured Concrete", range: "$85 – $120/m²", est50: "$3,000 – $4,200", notes: "Oxide-tinted, multiple colours" },
      { type: "Exposed Aggregate", range: "$110 – $160/m²", est50: "$3,850 – $5,600", notes: "Premium stone, naturally slip-resistant" },
      { type: "Honed Concrete", range: "$100 – $140/m²", est50: "$3,500 – $4,900", notes: "Smooth polished look" },
    ],
    pricingNotes: "All prices include GST, formwork, reinforcement, concrete supply, finishing, sealing, and curing. Prices based on a typical 35m² pool surround. Old paver/concrete removal quoted separately.",
    comparison: {
      headers: ["Feature", "Concrete", "Pavers", "Timber Decking", "Tiles"],
      rows: [
        { feature: "Cost per m²", values: ["$75 – $160", "$120 – $200+", "$150 – $300+", "$100 – $250+"] },
        { feature: "Slip Resistance", values: ["Excellent (textured)", "Good (textured pavers)", "Poor when wet", "Variable"] },
        { feature: "Maintenance", values: ["Very low", "Medium (re-sand)", "High (oil, sand, stain)", "Medium (grout repair)"] },
        { feature: "Lifespan", values: ["30+ years", "20-25 years", "10-15 years", "15-20 years"] },
        { feature: "Weed Growth", values: ["None (seamless)", "Common in joints", "None", "Possible in grout"] },
        { feature: "Heat Retention", values: ["Moderate", "High", "Low", "High"] },
        { feature: "Salt/Chlorine Resistance", values: ["Excellent (sealed)", "Good", "Poor", "Good (porcelain)"] },
      ],
    },
    faqs: [
      { q: "What is the best concrete finish for a pool surround?", a: "Exposed aggregate is the most popular choice for Brisbane pool surrounds because it's naturally slip-resistant, looks premium, and handles pool chemicals well. For a more budget-friendly option, broom-finished plain or coloured concrete provides excellent grip at a lower cost. We can show you samples of each finish during your free consultation." },
      { q: "Is concrete around a pool slippery when wet?", a: "Not when finished correctly. All our pool surrounds are finished with slip-resistant textures that meet Australian Standard AS 4586. Exposed aggregate is naturally textured, while broom-finished concrete has grooves that channel water away. We test every surface to ensure it meets safety requirements before handover." },
      { q: "How long does a concrete pool surround last?", a: "A properly installed and sealed concrete pool surround will last 30+ years in Brisbane's climate. We use salt-resistant concrete mixes and penetrating sealers that protect against chlorine, salt water, and UV. Re-sealing every 3-5 years will keep it looking like new." },
      { q: "Can you pour concrete around an existing pool?", a: "Absolutely. We work around your existing pool shell and coping to create a seamless surround. We can also extend the concrete area to create an entertaining space, BBQ area, or connect to your house. Expansion joints are placed at the pool edge to allow for independent movement." },
      { q: "How much does a concrete pool surround cost in Brisbane?", a: "A typical pool surround (35m²) costs between $2,600 and $5,600 depending on the finish. Plain concrete with a broom finish is the most affordable at $75-$95/m², while exposed aggregate ranges from $110-$160/m². Our quotes include everything — formwork, reinforcement, concrete, finishing, and sealing." },
    ],
    relatedServices: ["exposed-aggregate-brisbane", "concrete-patios-brisbane", "concrete-driveways-brisbane"],
    suburbs: ["Wynnum", "Manly West", "Carindale", "Camp Hill", "Sunnybank", "Mount Gravatt", "Indooroopilly", "Kenmore", "Robina", "Coomera", "North Lakes"],
    ctaText: "Ready for a stunning pool surround? Get your free quote today.",
  },
  "shed-slabs-brisbane": {
    slug: "shed-slabs-brisbane",
    title: "Shed Slabs & Garage Slabs Brisbane",
    h1: "Shed Slabs & Garage Slabs Brisbane — Engineered for Your Build",
    metaTitle: "Shed Slabs Brisbane | Garage Slabs & Foundations | From $75/m² | Concrete Concepts",
    metaDescription: "Professional shed slab and garage slab installation in Brisbane. Engineered to your shed manufacturer's specs. QBCC Licensed #15299707. Free quotes. Call 0424 463 268.",
    keywords: "shed slab near me, shed slab Brisbane, garage slab Brisbane, shed concrete slab, shed base Brisbane, shed foundation Brisbane, concrete slab for shed, granny flat slab Brisbane",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/concrete-slab-1_56311043.jpg",
    intro: "Whether you're building a backyard shed, a double garage, a workshop, or a granny flat, it all starts with a solid concrete slab. At Concrete Concepts Group, we pour shed slabs and garage slabs engineered to your exact specifications — matching your shed manufacturer's requirements, your engineer's design, and Brisbane City Council's building codes.",
    detailedContent: [
      "A shed slab is more than just a flat piece of concrete — it's the foundation that your entire structure sits on. Getting it wrong means cracked floors, misaligned walls, and costly repairs. We work directly with your shed manufacturer or builder to ensure the slab dimensions, bolt-down locations, edge beam depths, and concrete strength all match their specifications exactly.",
      "Brisbane's reactive clay soils present unique challenges for shed slabs. Soil movement can cause cracking and heaving if the slab isn't designed correctly. We follow Australian Standard AS 2870 for residential slabs and work with structural engineers when required to ensure your slab is designed for your specific site conditions — including soil reactivity class, drainage, and load requirements.",
      "For sheds over 10m², Brisbane City Council typically requires a building approval. This includes an engineer-designed slab with specific edge beam depths, reinforcement, and concrete strength. We can pour to your engineer's design or connect you with a structural engineer who specialises in shed and garage slabs. For smaller sheds, a standard 100mm slab with SL72 mesh is usually sufficient.",
      "We handle everything from site excavation and compaction to formwork, reinforcement, bolt-cage installation, and the final pour. Our slabs are power-floated for a smooth, level finish that's ready for your shed builder to start. We also install any required plumbing penetrations, electrical conduit, and termite barriers as part of the slab preparation.",
    ],
    benefits: [
      "Poured to your shed manufacturer's exact specifications",
      "Engineered for Brisbane's reactive clay soils",
      "Bolt-down cages positioned to millimetre accuracy",
      "Power-float finish for a smooth, level surface",
      "Plumbing and electrical penetrations included",
      "Termite barrier installation available",
      "QBCC Licensed (#15299707) and fully insured",
      "Free on-site assessment and quote",
    ],
    process: [
      { step: "Site Assessment", description: "We inspect your site, check soil conditions, confirm access for concrete trucks, and review your shed manufacturer's slab specifications." },
      { step: "Engineering Review", description: "We review the engineer's slab design (or arrange one if needed), confirm dimensions, edge beam depths, reinforcement, and bolt-down locations." },
      { step: "Excavation & Preparation", description: "We excavate to the required depth, compact the sub-base, install termite barriers if required, and lay any plumbing or electrical conduit." },
      { step: "Formwork & Reinforcement", description: "We set formwork to exact dimensions, install steel reinforcement (mesh and/or rebar), and position bolt-down cages to your shed manufacturer's template." },
      { step: "Pour & Finish", description: "We pour the concrete, vibrate to remove air pockets, screed to level, and power-float for a smooth finish. Bolt cages are checked for alignment before the concrete sets." },
    ],
    pricingIntro: "Shed slab costs depend on size, soil conditions, and engineering requirements. Here are typical Brisbane prices:",
    pricingTable: [
      { type: "Small Shed Slab (up to 20m²)", range: "$85 – $110/m²", est50: "N/A", notes: "100mm thick, SL72 mesh" },
      { type: "Standard Garage Slab (30-50m²)", range: "$75 – $100/m²", est50: "$2,600 – $5,000", notes: "100-125mm, SL82 mesh" },
      { type: "Large Shed/Workshop (50-100m²)", range: "$70 – $95/m²", est50: "$3,500 – $4,750", notes: "Engineered design, edge beams" },
      { type: "Granny Flat Slab (40-60m²)", range: "$80 – $110/m²", est50: "$4,000 – $5,500", notes: "Full engineering, plumbing included" },
    ],
    pricingNotes: "All prices include GST, excavation (standard depth), formwork, reinforcement, concrete supply, bolt cages, power-float finish, and curing. Deep excavation, rock removal, or difficult access may incur additional costs.",
    faqs: [
      { q: "How thick should a shed slab be?", a: "For a standard garden shed, 100mm of 20MPa concrete with SL72 mesh is typically sufficient. For garages and larger sheds, 100-125mm of 25MPa concrete with SL82 mesh is recommended. Sheds designed for heavy equipment or vehicles may require 150mm+ with additional reinforcement. Your shed manufacturer's specifications will dictate the exact requirements." },
      { q: "Do I need an engineer for a shed slab?", a: "For sheds over 10m² that require building approval, Brisbane City Council typically requires an engineer-designed slab. The engineer will specify the slab thickness, edge beam depths, reinforcement, and concrete strength based on your soil conditions and the shed loads. For small garden sheds under 10m², a standard slab design is usually sufficient." },
      { q: "How much does a shed slab cost in Brisbane?", a: "Shed slab costs in Brisbane range from $70 to $110 per square metre depending on size and complexity. A standard single garage slab (36m²) costs approximately $2,700 to $3,600, while a large workshop slab (80m²) ranges from $5,600 to $7,600. Our quotes include excavation, formwork, reinforcement, concrete, bolt cages, and power-float finishing." },
      { q: "Can you install bolt-down cages for my shed?", a: "Yes — bolt-down cage installation is included in our shed slab service. We position the cages to your shed manufacturer's template with millimetre accuracy. The cages are secured to the reinforcement mesh before pouring and checked for alignment during the pour. This ensures your shed frame bolts down perfectly." },
      { q: "How long before I can build on the slab?", a: "Concrete reaches sufficient strength for shed construction after 7 days. Full design strength (28 days) is reached after 4 weeks, but most shed builders are comfortable starting at 7 days. We'll advise your builder on the appropriate timing based on the concrete strength and weather conditions." },
    ],
    relatedServices: ["concrete-slabs-brisbane", "excavation-brisbane", "retaining-walls-brisbane"],
    suburbs: ["Logan", "Springfield", "Ipswich", "North Lakes", "Caboolture", "Carindale", "Mount Gravatt", "Sunnybank", "Kenmore", "The Gap", "Ferny Grove", "Stafford"],
    ctaText: "Need a shed slab? Get your free quote — we'll match your manufacturer's specs exactly.",
  },
};

const SERVICE_SLUGS = Object.keys(SERVICES);

function getServiceTitle(slug: string): string {
  return SERVICES[slug]?.title || slug;
}

export default function ServicePage() {
  const params = useParams<{ serviceSlug: string }>();
  const serviceSlug = params.serviceSlug || "";
  const service = SERVICES[serviceSlug];

  // Fetch blog posts for topic cluster interlinking
  const relatedBlogSlugs = SERVICE_TO_BLOG_MAP[serviceSlug] || [];
  const { data: allBlogPosts } = trpc.blog.list.useQuery(undefined, {
    enabled: relatedBlogSlugs.length > 0,
  });
  const relatedBlogPosts = (allBlogPosts || []).filter(p => relatedBlogSlugs.includes(p.slug)).slice(0, 4);

  if (!service) {
    return (
      <div className="min-h-screen bg-brand-offwhite">
        <Navbar />
        <div className="container py-32 text-center">
          <h1 className="text-3xl font-bold text-brand-charcoal mb-4">Service Not Found</h1>
          <p className="text-gray-500 mb-8" style={{ fontFamily: "var(--font-body)" }}>
            The service page you're looking for doesn't exist.
          </p>
          <Link href="/#services">
            <span className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-6 py-3 rounded-md transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-body)" }}>
              View All Services
            </span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.intro,
    provider: {
      "@type": "LocalBusiness",
      name: "Concrete Concepts Group Pty Ltd",
      telephone: "+61424463268",
      email: "info@concreteconceptsgroup.com",
      address: {
        "@type": "PostalAddress",
        addressRegion: "QLD",
        addressCountry: "AU",
      },
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "QBCC Licence",
        recognizedBy: {
          "@type": "Organization",
          name: "Queensland Building and Construction Commission",
        },
      },
      sameAs: [
        "https://www.google.com/maps/place/Concrete+concepts+group+pty+Ltd/@-27.4479932,153.0574609,17z/data=!3m1!4b1!4m6!3m5!1s0x6b9159cc3c034933:0xd957176f933fae1!8m2!3d-27.4479932!4d153.0574609",
        "https://www.facebook.com/share/14Z2spZfScB/",
      ],
    },
    areaServed: service.suburbs.map(suburb => ({
      "@type": "City",
      name: `${suburb}, Brisbane, QLD`,
    })),
    image: service.heroImage,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "AUD",
      lowPrice: service.pricingTable[0]?.range.match(/\$(\d+)/)?.[1] || "75",
      highPrice: service.pricingTable[service.pricingTable.length - 1]?.range.match(/\$\d+\s*[–-]\s*\$(\d+)/)?.[1] || "200",
      offerCount: service.pricingTable.length,
      availability: "https://schema.org/InStock",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map(faq => ({
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
        title={service.metaTitle}
        description={service.metaDescription}
        canonical={`/services/${service.slug}`}
        keywords={service.keywords}
        ogImage={service.heroImage}
        structuredData={[serviceSchema, faqSchema]}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative bg-brand-charcoal text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={service.heroImage}
            alt={`${service.title} by Concrete Concepts Group in Brisbane`}
            width={1200}
            height={600}
            className="w-full h-full object-cover opacity-20"
            loading="eager"
            decoding="sync"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/80 to-brand-charcoal" />
        </div>
        <div className="relative container py-20 lg:py-28">
          <Breadcrumbs
            items={[
              { label: "Services", href: "/#services" },
              { label: service.title },
            ]}
            className="mb-8"
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 max-w-3xl"
          >
            {service.h1}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-white/70 max-w-2xl mb-8 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {service.intro}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="/get-quote"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all shadow-xl"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Get a Free Quote
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

      {/* Detailed Content */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto prose prose-lg" style={{ fontFamily: "var(--font-body)" }}>
            {service.detailedContent.map((paragraph, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-6">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-24 bg-brand-offwhite">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-8">
              Why Choose Concrete Concepts for{" "}
              <span className="text-brand-gold italic">{service.title}</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {service.benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-10">
              Our <span className="text-brand-gold italic">Process</span>
            </h2>
            <div className="space-y-6">
              {service.process.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex gap-5"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center text-brand-charcoal font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-charcoal text-lg mb-1">{step.step}</h3>
                    <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-20 lg:py-24 bg-brand-charcoal text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-brand-gold" />
              <h2 className="text-2xl sm:text-3xl font-bold">
                {service.title} <span className="text-brand-gold italic">Pricing</span>
              </h2>
            </div>
            <p className="text-white/60 mb-8 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              {service.pricingIntro}
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-brand-gold font-semibold" style={{ fontFamily: "var(--font-body)" }}>Type</th>
                    <th className="text-left py-3 px-4 text-brand-gold font-semibold" style={{ fontFamily: "var(--font-body)" }}>Price Range</th>
                    <th className="text-left py-3 px-4 text-brand-gold font-semibold" style={{ fontFamily: "var(--font-body)" }}>Estimate</th>
                    <th className="text-left py-3 px-4 text-brand-gold font-semibold" style={{ fontFamily: "var(--font-body)" }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {service.pricingTable.map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 px-4 text-white font-medium" style={{ fontFamily: "var(--font-body)" }}>{row.type}</td>
                      <td className="py-3 px-4 text-brand-gold font-semibold" style={{ fontFamily: "var(--font-body)" }}>{row.range}</td>
                      <td className="py-3 px-4 text-white/70" style={{ fontFamily: "var(--font-body)" }}>{row.est50}</td>
                      <td className="py-3 px-4 text-white/50" style={{ fontFamily: "var(--font-body)" }}>{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-white/40 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              {service.pricingNotes}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="tel:0424463268"
                onClick={() => trackPhoneCallClick()}
                className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Phone className="w-4 h-4" />
                Call for Exact Quote
              </a>
              <Link href="/calculator">
                <span className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/10 px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all cursor-pointer"
                  style={{ fontFamily: "var(--font-body)" }}>
                  <Ruler className="w-4 h-4" />
                  Use Cost Calculator
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      {service.comparison && (
        <section className="py-20 lg:py-24 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-8">
                How Does It <span className="text-brand-gold italic">Compare?</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-100">
                  <thead>
                    <tr className="bg-brand-charcoal text-white">
                      {service.comparison.headers.map((header, i) => (
                        <th key={i} className="text-left py-3 px-4 font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {service.comparison.rows.map((row, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        <td className="py-3 px-4 font-medium text-brand-charcoal" style={{ fontFamily: "var(--font-body)" }}>
                          {row.feature}
                        </td>
                        {row.values.map((val, j) => (
                          <td key={j} className="py-3 px-4 text-gray-600" style={{ fontFamily: "var(--font-body)" }}>
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="py-20 lg:py-24 bg-brand-offwhite">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <HelpCircle className="w-6 h-6 text-brand-gold" />
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal">
                Frequently Asked <span className="text-brand-gold italic">Questions</span>
              </h2>
            </div>
            <div className="space-y-6">
              {service.faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
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

      {/* Customer Reviews Snippet */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />)}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-brand-charcoal text-center mb-8" style={{ fontFamily: "var(--font-heading)" }}>
              What Our Clients <span className="text-brand-gold italic">Say</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {(SERVICE_REVIEWS[service.slug] || SERVICE_REVIEWS["concrete-driveways-brisbane"]).map((review, i) => (
                <div key={i} className="bg-brand-offwhite rounded-xl p-6 relative">
                  <Quote className="w-8 h-8 text-brand-gold/20 absolute top-4 right-4" />
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-body)" }}>
                    "{review.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-brand-charcoal text-sm" style={{ fontFamily: "var(--font-body)" }}>{review.name}</p>
                      <p className="text-gray-400 text-xs" style={{ fontFamily: "var(--font-body)" }}>{review.location}, QLD</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full" style={{ fontFamily: "var(--font-body)" }}>{review.source} Verified</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/reviews">
                <span className="inline-flex items-center gap-2 text-brand-gold font-semibold text-sm hover:gap-3 transition-all cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                  Read All Reviews
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-brand-gold">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-4">
            {service.ctaText}
          </h2>
          <p className="text-brand-charcoal/70 mb-8 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            QBCC Licensed #15299707 · Fully Insured · Free On-Site Quotes · Serving All of Brisbane & SEQ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
              className="inline-flex items-center justify-center gap-2 bg-brand-charcoal hover:bg-brand-charcoal/90 text-white font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Phone className="w-4 h-4" />
              0424 463 268
            </a>
            <a
              href="/get-quote"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-brand-charcoal font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Request a Quote Online
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-brand-charcoal text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <MapPin className="w-8 h-8 text-brand-gold mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              {service.title} — <span className="text-brand-gold italic">Areas We Service</span>
            </h2>
            <p className="text-white/60 mb-6" style={{ fontFamily: "var(--font-body)" }}>
              We provide {service.title.toLowerCase()} services across Brisbane and all surrounding areas, including:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {service.suburbs.map(suburb => (
                <span
                  key={suburb}
                  className="bg-white/10 text-white/80 px-3 py-1.5 rounded-full text-sm"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {suburb}
                </span>
              ))}
            </div>
            <Link href="/areas">
              <span className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-gold-dark text-sm font-semibold mt-6 cursor-pointer transition-colors" style={{ fontFamily: "var(--font-body)" }}>
                View All Service Areas <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Related Articles — Topic Cluster Interlinking */}
      {relatedBlogPosts.length > 0 && (
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-8">
                <BookOpen className="w-5 h-5 text-brand-gold" />
                <h2 className="text-2xl font-bold text-brand-charcoal text-center" style={{ fontFamily: "var(--font-heading)" }}>
                  Helpful <span className="text-brand-gold italic">Articles</span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedBlogPosts.map(post => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}>
                    <div className="group flex items-start gap-4 bg-brand-offwhite hover:bg-brand-gold/5 rounded-xl p-5 border border-gray-100 hover:border-brand-gold/30 transition-all cursor-pointer">
                      {post.coverImage && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                          <img src={post.coverImage} alt={post.title} width={64} height={64} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-brand-gold text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
                          {post.category}
                        </span>
                        <h3 className="text-sm font-bold text-brand-charcoal group-hover:text-brand-gold transition-colors mt-1 line-clamp-2" style={{ fontFamily: "var(--font-heading)" }}>
                          {post.title}
                        </h3>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-gold transition-colors shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6">
                <Link href="/blog">
                  <span className="inline-flex items-center gap-2 text-brand-gold font-semibold text-sm hover:gap-3 transition-all cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                    View All Articles
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related Services */}
      <section className="py-16 bg-brand-offwhite">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-brand-charcoal mb-6 text-center">
              Related <span className="text-brand-gold italic">Services</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {service.relatedServices
                .filter(slug => SERVICES[slug])
                .map(slug => (
                  <Link key={slug} href={`/services/${slug}`}>
                    <div className="bg-white rounded-lg p-5 text-center hover:shadow-lg transition-all cursor-pointer border border-gray-100 group">
                      <h3 className="font-semibold text-brand-charcoal group-hover:text-brand-gold transition-colors text-sm">
                        {getServiceTitle(slug)}
                      </h3>
                    </div>
                  </Link>
                ))}
              <Link href="/calculator">
                <div className="bg-white rounded-lg p-5 text-center hover:shadow-lg transition-all cursor-pointer border border-gray-100 group">
                  <h3 className="font-semibold text-brand-charcoal group-hover:text-brand-gold transition-colors text-sm">
                    Cost Calculator
                  </h3>
                </div>
              </Link>
              <Link href="/finishes">
                <div className="bg-white rounded-lg p-5 text-center hover:shadow-lg transition-all cursor-pointer border border-gray-100 group">
                  <h3 className="font-semibold text-brand-charcoal group-hover:text-brand-gold transition-colors text-sm">
                    Compare Finishes
                  </h3>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>QBCC Licensed #15299707</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Star className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>5-Star Google Rating</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>Free Quotes Within 24hrs</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>
                <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="hover:text-brand-gold transition-colors">0424 463 268</a>
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}

export { SERVICES, SERVICE_SLUGS };
