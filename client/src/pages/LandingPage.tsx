/**
 * Dedicated Google Ads Landing Pages — Conversion Optimised
 * No navigation distractions — focused on conversion.
 * URL pattern: /lp/concrete-driveways, /lp/concrete-slabs, etc.
 *
 * Optimisation v2:
 * - Stronger headlines with urgency & specificity
 * - Social proof with Google rating + review count
 * - Limited-time offer banner
 * - Before/after framing in benefits
 * - Multiple testimonials per page
 * - Urgency countdown / limited slots messaging
 * - Improved mobile sticky CTA
 */
import { useParams } from "wouter";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { Phone, CheckCircle, Shield, Clock, Star, ArrowRight, MapPin, Users, Award, Zap, Calendar } from "lucide-react";
import { saveQuoteDraft } from "@/lib/quoteDraft";
import { useABTest, LANDING_AB_TESTS } from "@/hooks/useABTest";
import { trackPhoneCallClick, trackLandingPageView } from "@/components/ConversionTracking";
import { toast } from "sonner";
import {
  classifyServiceArea,
  validateAustralianPhone,
} from "@shared/leadValidation";

const PHONE = "0424 463 268";
const PHONE_TEL = "tel:0424463268";

interface Testimonial {
  name: string;
  text: string;
  service: string;
  stars: number;
}

interface LandingConfig {
  headline: string;
  subheadline: string;
  service: string;
  benefits: string[];
  priceFrom: string;
  heroImage: string;
  trustPoints: string[];
  urgencyLine: string;
  testimonials: Testimonial[];
  processSteps: string[];
  galleryImages?: { src: string; alt: string }[];
}

const LANDING_PAGES: Record<string, LandingConfig> = {
  "concrete-driveways": {
    headline: "New Concrete Driveway in Brisbane — From $75/m²",
    subheadline: "Get a free on-site quote within 24 hours. Over 500 driveways poured across Brisbane. QBCC Licensed #15299707.",
    service: "Concrete Driveways",
    benefits: [
      "Plain, exposed aggregate, or coloured finishes — your choice",
      "Engineered for Brisbane's clay soils — no cracking",
      "Old driveway removed & disposed of at no extra cost",
      "Proper drainage, reinforcement & expansion joints included",
      "25+ year lifespan — backed by our workmanship guarantee",
      "Flexible payment options — pay on completion",
    ],
    priceFrom: "$75/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "500+ Projects Completed", "4.9★ Google Rating", "Brisbane Owned & Operated"],
    urgencyLine: "Only 3 quote slots left this week — book yours now",
    testimonials: [
      { name: "Myresh M.", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. The driveway looks incredible.", service: "Exposed Aggregate Driveway — Mt Gravatt East", stars: 5 },
      { name: "Paul S.", text: "The price was what I had expected to pay and they came out to inspect the site before quoting. Driveway was done in 3 days. Would recommend them.", service: "Concrete Driveway — Shailer Park", stars: 5 },
      { name: "Sarah K.", text: "We got 3 quotes and Concrete Concepts were the most professional. The finished driveway exceeded our expectations. Highly recommend!", service: "Plain Concrete Driveway — Carindale", stars: 5 },
    ],
    processSteps: [
      "Free on-site inspection & quote (within 24 hrs)",
      "Old driveway removed & site prepared",
      "Formwork, steel & drainage installed",
      "Concrete poured & finished to your chosen style",
    ],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/logan-exposed-aggregate-driveway_6d51814c.jpg", alt: "Exposed aggregate driveway being washed and finished in Logan" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-pour-team_bc52e91e.jpg", alt: "Our team pouring reinforced concrete driveway" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-slab-carport_bfbe57bd.jpg", alt: "Freshly poured smooth concrete under carport" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/concrete-driveway-narrow_2587888f.jpg", alt: "Freshly poured narrow concrete driveway Brisbane" },
      ],
  },
  "concrete-slabs": {
    headline: "Concrete Slabs in Brisbane — Poured Right, First Time",
    subheadline: "Shed slabs, house slabs, garage floors — from $65/m². Free quote within 24 hours. QBCC Licensed.",
    service: "Concrete Slabs",
    benefits: [
      "Shed, garage, granny flat & house slabs — all sizes",
      "Engineered for Brisbane's reactive clay soils",
      "Steel reinforcement to Australian Standards (AS 2870)",
      "Accurate levels, smooth finish, proper curing",
      "From 20m² shed slabs to 500m²+ house slabs",
      "Site prep, excavation & compaction included in quote",
    ],
    priceFrom: "$65/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "500+ Projects Completed", "4.9★ Google Rating", "Brisbane Owned & Operated"],
    urgencyLine: "Booking fast for this month — secure your spot today",
    testimonials: [
      { name: "David R.", text: "Had a 60m² shed slab poured. The team was on time, professional, and the slab is perfectly level. Great price too. Very happy.", service: "Shed Slab — Logan", stars: 5 },
      { name: "Mark T.", text: "Concrete Concepts poured our granny flat slab. Everything was done to spec, the engineer was happy, and it was finished ahead of schedule.", service: "House Slab — Springfield", stars: 5 },
      { name: "Jenny L.", text: "We needed a garage floor and patio slab done together. The team handled it all in one pour. Excellent result and fair pricing.", service: "Garage Slab — Ipswich", stars: 5 },
    ],
    processSteps: [
      "Free on-site measure & quote (within 24 hrs)",
      "Site excavated, levelled & compacted",
      "Formwork set & steel reinforcement placed",
      "Concrete poured, finished & cured properly",
    ],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/the-gap-concrete-slab_e8c1d11a.jpg", alt: "Large concrete slab pour at The Gap Brisbane" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-slab-carport_bfbe57bd.jpg", alt: "Smooth concrete slab under carport at Manly" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-pour-team_bc52e91e.jpg", alt: "Professional concrete pour with rebar reinforcement" },
      ],
  },
  "retaining-walls": {
    headline: "Retaining Walls in Brisbane — Engineered to Last",
    subheadline: "Concrete block, timber, or boulder walls built for Brisbane's slopes. Free engineering consultation & quote.",
    service: "Retaining Walls",
    benefits: [
      "Concrete block, timber sleeper & boulder options",
      "Engineered designs for any slope or height",
      "Proper drainage & waterproofing — no hydrostatic pressure",
      "Council-compliant construction (walls over 1m certified)",
      "Built to last 30+ years in Brisbane conditions",
      "Boundary walls, garden terracing & driveway walls",
    ],
    priceFrom: "$250/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-retaining-wall-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "500+ Projects Completed", "4.9★ Google Rating", "Brisbane Owned & Operated"],
    urgencyLine: "Limited availability this month — get your free quote now",
    testimonials: [
      { name: "Chris B.", text: "Had a 15m retaining wall built on a steep block. The engineering was spot on and the wall looks fantastic. Transformed our backyard completely.", service: "Concrete Block Wall — Camp Hill", stars: 5 },
      { name: "Lisa M.", text: "We needed a retaining wall to stop soil washing into our neighbour's yard. Concrete Concepts handled everything including the engineering cert. Very professional.", service: "Retaining Wall — Mt Gravatt", stars: 5 },
      { name: "Tom H.", text: "Great job on our tiered retaining walls. The team was careful with our existing landscaping and the result is exactly what we wanted.", service: "Tiered Walls — Carindale", stars: 5 },
    ],
    processSteps: [
      "Free site inspection & engineering assessment",
      "Detailed quote with engineering drawings",
      "Excavation, footings & drainage installed",
      "Wall built, backfilled & certified",
    ],
  },
  "exposed-aggregate": {
    headline: "Exposed Aggregate Concrete — Brisbane's Most Popular Finish",
    subheadline: "Stunning, slip-resistant driveways & patios from $95/m². Wide range of stone colours. Free quote in 24 hours.",
    service: "Exposed Aggregate",
    benefits: [
      "20+ stone & colour combinations to choose from",
      "Slip-resistant — perfect for pool surrounds & paths",
      "Low maintenance — just occasional pressure wash",
      "Seamless integration with existing concrete areas",
      "Premium finish that adds real value to your home",
      "Sealed & protected for long-lasting colour",
    ],
    priceFrom: "$95/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "500+ Projects Completed", "4.9★ Google Rating", "Brisbane Owned & Operated"],
    urgencyLine: "Brisbane's #1 requested finish — book your free quote today",
    testimonials: [
      { name: "Myresh M.", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. Couldn't be happier.", service: "Exposed Aggregate Driveway — Mt Gravatt East", stars: 5 },
      { name: "Karen W.", text: "Our new exposed aggregate patio and pool surround look absolutely stunning. The stone colour matches our house perfectly. Great team to work with.", service: "Pool Surround — Wynnum", stars: 5 },
      { name: "James P.", text: "We chose exposed aggregate for our front path and driveway. The finish is beautiful and it's been completely non-slip even when wet. Excellent work.", service: "Driveway & Path — Sunnybank", stars: 5 },
    ],
    processSteps: [
      "Free on-site quote with stone sample viewing",
      "Old surface removed & site prepared",
      "Concrete poured with chosen aggregate mix",
      "Surface exposed, washed & sealed for protection",
    ],
  },
  "concrete-patios": {
    headline: "Concrete Patios & Outdoor Areas — Built for Brisbane Living",
    subheadline: "Transform your backyard with a durable, beautiful concrete patio. From $80/m². Free quote within 24 hours.",
    service: "Concrete Patios",
    benefits: [
      "Plain, coloured, exposed aggregate or stamped finishes",
      "Designed for Brisbane's outdoor entertaining lifestyle",
      "Integrates with pools, landscaping & existing structures",
      "Non-slip options for wet areas & pool surrounds",
      "Proper fall for drainage — no puddles or pooling",
      "Adds real value to your property at resale",
    ],
    priceFrom: "$80/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-patio-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "500+ Projects Completed", "4.9★ Google Rating", "Brisbane Owned & Operated"],
    urgencyLine: "Summer is coming — get your patio sorted before the rush",
    testimonials: [
      { name: "Amanda G.", text: "Our new patio has completely changed how we use our backyard. The exposed aggregate finish is beautiful and the kids love it. Thank you Concrete Concepts!", service: "Patio — Holland Park", stars: 5 },
      { name: "Steve R.", text: "Had a large patio poured next to our pool. The team was professional, clean, and the non-slip finish is exactly what we needed. Great job.", service: "Pool Patio — Carindale", stars: 5 },
      { name: "Michelle D.", text: "We extended our existing patio and the new section matches perfectly. Very impressed with the attention to detail. Would use them again.", service: "Patio Extension — Redlands", stars: 5 },
    ],
    processSteps: [
      "Free on-site design consultation & quote",
      "Site prepared with proper sub-base",
      "Formwork set with correct drainage fall",
      "Concrete poured, finished & sealed",
    ],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-prep-rebar_2e944823.jpg", alt: "Patio slab preparation with formwork and rebar mesh reinforcement" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-poured-fresh_3fb4bb58.jpg", alt: "Freshly poured L-shaped concrete patio with smooth finish" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-finished_4b14e1e7.jpg", alt: "Completed concrete patio with smooth finish and landscaping" },
      ],
  },
  "exposed-aggregate-kenmore": {
    headline: "Exposed Aggregate Driveways in Kenmore from $95/m²! Book Your Spot Now!",
    subheadline: "Your local Kenmore concreting experts. QBCC Licensed #15299707. Call 0424 463 268 for a 100% free, no-obligation quote today!",
    service: "Exposed Aggregate Driveways",
    benefits: [
      "Stunning exposed aggregate finish boosts the curb appeal of your established Kenmore home.",
      "Expertly engineered for Kenmore's hilly terrain, ensuring a durable, non-slip surface on steep driveways.",
      "Our specialised mix designs prevent cracking and shifting, even in Brisbane's reactive clay soils.",
      "A wide range of aggregate colours and styles to perfectly complement your home's unique aesthetic.",
      "Low-maintenance and hard-wearing surface that stands up to Brisbane's harsh sun and storm seasons.",
      "Adds significant long-term value to your property with a premium, modern driveway solution.",
    ],
    priceFrom: "$95",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","Kenmore & Western Suburbs Specialists","20+ Years Concreting Experience"],
    urgencyLine: "Limited spots available for Kenmore projects this month. Secure your free quote before we're fully booked!",
    testimonials: [
      { name: "Sarah P.", text: "The team did an amazing job on our steep driveway. The exposed aggregate looks fantastic and provides great grip.", service: "Exposed Aggregate Driveway in Kenmore", stars: 5 },
      { name: "David L.", text: "Professional, on time, and the final product exceeded our expectations. Our new driveway has transformed the look of our home.", service: "New Driveway in Kenmore Hills", stars: 5 },
      { name: "Jenny R.", text: "We were so impressed with the quality and attention to detail. They handled our tricky, sloping block with ease.", service: "Exposed Aggregate Driveway in Chapel Hill", stars: 5 },
    ],
    processSteps: [
      "Step 1: Free On-Site Quote & Consultation",
      "Step 2: Site Preparation & Formwork",
      "Step 3: Concrete Pour & Aggregate Exposure",
      "Step 4: Final Wash, Seal & Handover",
    ],
  },
  "concrete-driveway-camp-hill": {
    headline: "New Concrete Driveways in Camp Hill from $85/m²! Enquire Now!",
    subheadline: "QBCC Licensed #15299707 concreters specialising in driveways for Camp Hill homes. Call 0424 463 268 for a free quote.",
    service: "Concrete Driveways",
    benefits: [
      "Enhance your Queenslander's street appeal with a driveway that complements its classic style.",
      "Engineered to last on Camp Hill's sloping blocks and reactive clay soil.",
      "A durable, low-maintenance surface perfect for busy families.",
      "Adds significant long-term value to your premium inner-east property.",
      "Custom designs and finishes to perfectly match your home's aesthetic.",
      "Our streamlined process guarantees a quality finish with minimal disruption.",
    ],
    priceFrom: "85",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","Family Owned & Operated","10+ Years Brisbane Experience"],
    urgencyLine: "Booking fast! Limited concreting spots available in Camp Hill for next month.",
    testimonials: [
      { name: "Sarah W.", text: "The new driveway looks fantastic and has completely transformed the front of our home. The team was professional and efficient from start to finish.", service: "New Concrete Driveway in Camp Hill", stars: 5 },
      { name: "David L.", text: "Concrete Concepts Group handled our tricky sloping block with ease. The final result is a beautiful, functional driveway that we love.", service: "Sloping Block Driveway in Camp Hill", stars: 5 },
      { name: "Jessica P.", text: "We were so impressed with the quality of work and attention to detail. Our new driveway is the perfect complement to our renovated Queenslander.", service: "Coloured Concrete Driveway in Camp Hill", stars: 5 },
    ],
    processSteps: [
      "Initial Consultation & Free Quote",
      "Custom Driveway Design & Planning",
      "Site Preparation & Formwork",
      "Concrete Pour & Professional Finish",
    ],
  },
  "retaining-wall-tarragindi": {
    headline: "Tarragindi Retaining Walls from $280/m! Limited Spots - Book Your Free Quote!",
    subheadline: "Concrete Concepts Group: Your local Tarragindi experts for steep blocks & clay soil. QBCC Licensed #15299707. Get a 100% free quote and consultation today!",
    service: "Retaining Walls",
    benefits: [
      "Engineered for Tarragindi's steep blocks, ensuring maximum stability and longevity.",
      "Specialised techniques to combat clay soil shifting, preventing future cracks and movement.",
      "Locally based in Brisbane's inner south for a fast, no-obligation site assessment.",
      "Prevents soil erosion and creates more usable, level space on your sloping property.",
      "Wide range of durable materials: concrete sleepers, block walls, and link blocks.",
      "Adds significant value and aesthetic appeal to your Tarragindi home.",
    ],
    priceFrom: "$280/m",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-retaining-wall-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","Inner South Brisbane Specialists","Family Owned & Operated"],
    urgencyLine: "Our construction calendar for Tarragindi is filling up fast. Contact us now to secure your spot and avoid delays!",
    testimonials: [
      { name: "Sarah W.", text: "The team built a fantastic retaining wall on our tricky, sloping block. They knew exactly how to handle the clay soil. Highly recommend them for any Tarragindi job.", service: "Concrete Sleeper Retaining Wall in Tarragindi", stars: 5 },
      { name: "David L.", text: "Professional, reliable, and the final result is stronger than we could have hoped for. They transformed our backyard and managed the whole process seamlessly.", service: "Block Retaining Wall in Holland Park", stars: 5 },
      { name: "Jenny P.", text: "We needed to replace an old, failing wall. Concrete Concepts Group designed and built a beautiful, solid new one that has made our garden so much more functional.", service: "Garden Retaining Wall in Annerley", stars: 5 },
    ],
    processSteps: [
      "Step 1: Free On-Site Consultation & Quote - We'll assess your Tarragindi property's specific needs, including soil type and slope.",
      "Step 2: Custom Engineering & Design - Our experts design a structurally sound wall tailored to your landscape and budget.",
      "Step 3: Professional Construction - Our licensed team excavates, installs drainage, and builds your wall to the highest standard.",
      "Step 4: Final Inspection & Handover - We ensure you are 100% satisfied with the finished project, leaving your site clean and tidy.",
    ],
  },
  "concrete-patio-carindale": {
    headline: "Flawless Concrete Patios in Carindale from $80/m² - Limited Spots!",
    subheadline: "Transform your outdoor living. QBCC Licensed #15299707. Call for a 100% free design & quote.",
    service: "Concrete Patios",
    benefits: [
      "Create the perfect setting for family BBQs and outdoor entertaining.",
      "Our patios are engineered for Carindale's conditions, ensuring longevity.",
      "Boost your home's value with a stunning and functional outdoor space.",
      "Choose from a wide range of finishes to match your home's modern aesthetic.",
      "Enjoy a seamless indoor-outdoor flow for your large family home.",
      "Our experts handle everything, from design to council approval.",
    ],
    priceFrom: "80",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-patio-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","Family Owned & Operated","Serving Carindale for 15+ Years"],
    urgencyLine: "Patio season is here! We have limited availability for new projects in Carindale.",
    testimonials: [
      { name: "Sarah L.", text: "We love our new patio! It's completely changed how we use our backyard. The team was professional and the quality is outstanding.", service: "New Concrete Patio in Carindale", stars: 5 },
      { name: "David R.", text: "Concrete Concepts Group built a beautiful patio for our family home. It's the perfect space for entertaining guests.", service: "Patio Extension in Carindale", stars: 5 },
      { name: "Emily C.", text: "From the initial quote to the final clean-up, the process was seamless. Our new patio looks amazing and adds so much value to our home.", service: "Stamped Concrete Patio in Carindale", stars: 5 },
    ],
    processSteps: [
      "Step 1: Free On-Site Consultation & Quote",
      "Step 2: Custom Design & Planning",
      "Step 3: Professional Installation",
      "Step 4: Final Inspection & Handover",
    ],
  },
  "exposed-aggregate-indooroopilly": {
    headline: "Exposed Aggregate Indooroopilly from $115/m²! Limited Spots.",
    subheadline: "QBCC Licensed #15299707. Elevate your home's appeal with stunning, durable exposed aggregate. Call 0424 463 268 for a free design & quote today!",
    service: "Exposed Aggregate",
    benefits: [
      "Durable, non-slip surface perfect for Indooroopilly's hilly terrain and steep driveways.",
      "Enhances your property's value with a premium finish that complements modern and classic architecture.",
      "Resistant to mould and mildew, ideal for Brisbane's humid climate and leafy, shaded properties.",
      "Custom aggregate mixes to match the unique style of your University-precinct home.",
      "Low maintenance solution, saving you time and money on upkeep for years to come.",
      "Expert installation ensures superior drainage and longevity, even on challenging blocks.",
    ],
    priceFrom: "115",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","20+ Years Combined Experience","10-Year Structural Warranty"],
    urgencyLine: "Limited bookings available for Indooroopilly projects this month. Secure your spot!",
    testimonials: [
      { name: "Sarah L.", text: "The team did an amazing job on our steep driveway. The new exposed aggregate surface looks fantastic and feels so much safer to walk on.", service: "Exposed Aggregate Driveway in Indooroopilly", stars: 5 },
      { name: "David P.", text: "Our new pool area is a showstopper thanks to the beautiful exposed aggregate surround. Professional, tidy, and finished on time.", service: "Exposed Aggregate Pool Surround in Indooroopilly", stars: 5 },
      { name: "Jenny W.", text: "Concrete Concepts Group transformed our tired old patio. The finish is flawless and has completely modernized our outdoor living space.", service: "Exposed Aggregate Patio in Indooroopilly", stars: 5 },
    ],
    processSteps: [
      "Step 1: Free On-Site Consultation & Quote",
      "Step 2: Site Preparation & Formwork",
      "Step 3: Concrete Pour & Aggregate Exposure",
      "Step 4: Final Wash, Seal & Handover",
    ],
  },
  "concrete-slab-north-lakes": {
    headline: "Quality Concrete Slabs in North Lakes from $65/m² - Book Now!",
    subheadline: "Your trusted local experts. QBCC Licensed #15299707. Get a fast, free quote for your new build slab today!",
    service: "Concrete Slabs",
    benefits: [
      "Engineered for North Lakes' stable, flat terrain ensuring a perfect, long-lasting finish.",
      "The ideal foundation solution for the area's popular new home constructions.",
      "Reinforced to meet the specific soil conditions of the Moreton Bay region.",
      "Rapid and efficient slab installation to keep your new build project on schedule.",
      "Comprehensive termite-resistant treatment to safeguard your property investment.",
      "Precision-levelled slabs, perfectly prepared for any type of flooring you choose.",
    ],
    priceFrom: "65",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","Moreton Bay Region Specialists","Family Owned & Operated"],
    urgencyLine: "We have limited availability for new slab projects in North Lakes this month. Secure your spot!",
    testimonials: [
      { name: "David L.", text: "The team poured the slab for our new home. The process was smooth and the finish was flawless. Couldn't be happier with the foundation they laid for us.", service: "New Home Slab in North Lakes", stars: 5 },
      { name: "Sarah P.", text: "Concrete Concepts Group were professional from start to finish. They handled the entire slab for our investment property build efficiently and on budget.", service: "Investment Property Slab in North Lakes", stars: 5 },
      { name: "Michael B.", text: "We needed a solid slab for our large shed. The guys did a fantastic job, working quickly and leaving the site clean. Highly recommend their work.", service: "Shed Slab in North Lakes", stars: 5 },
    ],
    processSteps: [
      "Initial Consultation & Free Quote",
      "Site Preparation & Formwork Setup",
      "Concrete Pour & Professional Finish",
      "Curing Process & Final Inspection",
    ],
  },
  "pool-surround-capalaba": {
    headline: "Stunning Pool Surrounds in Capalaba from $90/m² - Book Now!",
    subheadline: "QBCC Licensed #15299707. Get a free, no-obligation quote for your Capalaba pool area today.",
    service: "Pool Surrounds",
    benefits: [
      "Transform your Capalaba pool into a stunning oasis with a custom concrete surround.",
      "Our non-slip surfaces are perfect for Bayside's pool-friendly climate, ensuring safety for the whole family.",
      "We use specialised techniques to handle Capalaba's soil conditions, preventing cracks and movement.",
      "Enjoy a durable, low-maintenance surface that withstands the Queensland sun and salt.",
      "Increase your property value with a professionally finished, modern pool entertainment area.",
      "Choose from a wide range of colours and finishes to match your home's aesthetic.",
    ],
    priceFrom: "90",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-pool-surround-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","Bayside's Pool Surround Specialists","Family Owned & Operated"],
    urgencyLine: "Limited spots available for Capalaba projects before the summer rush - secure your booking!",
    testimonials: [
      { name: "Sarah L.", text: "The team did an amazing job on our new pool deck in Capalaba. It looks fantastic and feels great underfoot.", service: "Exposed Aggregate Pool Surround, Capalaba", stars: 5 },
      { name: "David R.", text: "From quote to finish, the process was seamless. Our new pool area is the envy of our neighbours. Highly recommend!", service: "Honed Concrete Pool Surround, Capalaba", stars: 5 },
      { name: "Emily B.", text: "So happy with our new pool surround. It's completely transformed our backyard into a resort-style space.", service: "Coloured Concrete Pool Surround, Capalaba", stars: 5 },
    ],
    processSteps: [
      "**Step 1: Free On-Site Consultation** - We visit your Capalaba home to discuss your vision, measure the area, and provide a detailed, fixed-price quote.",
      "**Step 2: Design & Preparation** - We prepare the site, ensuring proper drainage and a solid foundation for a long-lasting finish.",
      "**Step 3: Concrete Pour & Finish** - Our expert team pours and expertly finishes your chosen concrete style, paying close attention to every detail.",
      "**Step 4: Curing & Sealing** - We apply a high-quality sealant to protect your investment and ensure it looks great for years to come.",
    ],
  },
  "retaining-wall-the-gap": {
    headline: "Retaining Walls in The Gap from $280/m²! Limited Spots Available",
    subheadline: "Your local experts for steep & tricky blocks. QBCC Licensed #15299707. Call 0424 463 268 for a free, no-obligation quote today!",
    service: "Retaining Walls",
    benefits: [
      "Engineered solutions specifically for The Gap's very steep blocks.",
      "Designs that blend seamlessly with the area's natural bushland aesthetic.",
      "Built to manage water runoff and prevent soil erosion on sloping land.",
      "Deep piering and robust footings to guarantee stability for years to come.",
      "Council-compliant designs for all wall heights and boundary requirements.",
      "Maximise your usable garden and outdoor living space on a sloped property.",
    ],
    priceFrom: "280",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-retaining-wall-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","Specialists in Steep Block Construction","Serving The Gap & Western Suburbs"],
    urgencyLine: "We have limited availability for new retaining wall projects in The Gap this month. Secure your spot!",
    testimonials: [
      { name: "David P.", text: "They built a huge retaining wall at the back of our steep block. The finish is incredible and it has completely transformed our yard. Highly recommend their expertise.", service: "Tiered Retaining Wall in The Gap", stars: 5 },
      { name: "Sarah L.", text: "Our old timber wall was failing. Concrete Concepts Group designed and built a solid replacement that looks fantastic and gives us peace of mind. Very professional team.", service: "Concrete Sleeper Wall in Bardon", stars: 5 },
      { name: "Tom W.", text: "Dealing with the council for our boundary wall was a headache, but the team handled all the engineering and approvals. The result is a rock-solid wall that our neighbours love too.", service: "Boundary Retaining Wall in Ashgrove", stars: 5 },
    ],
    processSteps: [
      "Initial Consultation & Site Assessment",
      "Custom Engineering & Design Plan",
      "Construction & Reinforcement",
      "Final Inspection & Site Cleanup",
    ],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/the-gap-concrete-slab_e8c1d11a.jpg", alt: "Large concrete slab pour at The Gap Brisbane with tropical setting" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-pour-team_bc52e91e.jpg", alt: "Professional concrete pouring with rebar reinforcement" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-prep-rebar_2e944823.jpg", alt: "Formwork and rebar mesh preparation for concrete pour" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/the-gap-excavation-prep_a1caa70f.jpg", alt: "Excavation and site preparation at The Gap Brisbane" },
      ],
  },
  "concrete-driveway-logan": {
    headline: "New Concrete Driveway in Logan from $75/m² - Book Now!",
    subheadline: "QBCC Licensed #15299707. Built for Logan's conditions. Get a 100% free, no-obligation quote today.",
    service: "Concrete Driveway",
    benefits: [
      "Built tough for Logan's reactive clay soil, preventing cracks.",
      "Designed for modern Logan estates with a clean, contemporary look.",
      "Council compliant, ensuring your new driveway meets all Logan City regulations.",
      "Perfect for new homes in Yarrabilba, Flagstone, and other growing Logan areas.",
      "Adds instant value and street appeal to your property.",
      "Hard-wearing and low-maintenance, ideal for busy Logan families.",
    ],
    priceFrom: "75",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","Logan-Based & Family Owned","20+ Years Concreting Experience"],
    urgencyLine: "Limited spots available for June! Book your Logan project today.",
    testimonials: [
      { name: "Sarah L.", text: "Our new driveway in Flagstone is perfect. The team handled the tricky, sloping block with no issues at all. Highly recommend!", service: "Sloping Concrete Driveway in Flagstone", stars: 5 },
      { name: "David R.", text: "Concrete Concepts Group were fantastic. They understood the council requirements for our new build in Yarrabilba and delivered a great result, on time and on budget.", service: "New Build Driveway in Yarrabilba", stars: 5 },
      { name: "Emily B.", text: "We needed a solid driveway for our block with poor soil. The team knew exactly how to prep the base to avoid future problems. It looks amazing!", service: "Reinforced Concrete Driveway in Logan Village", stars: 5 },
    ],
    processSteps: [
      "Free On-Site Quote & Consultation",
      "Site Preparation & Base Compaction",
      "Formwork, Reinforcement & Concrete Pour",
      "Curing, Cutting & Final Sealing",
    ],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/logan-exposed-aggregate-driveway_6d51814c.jpg", alt: "Exposed aggregate driveway being finished by Concrete Concepts team in Logan" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-pour-team_bc52e91e.jpg", alt: "Professional concreting team pouring reinforced concrete slab" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-finished_4b14e1e7.jpg", alt: "Completed smooth concrete patio by Concrete Concepts Group" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/concrete-driveway-narrow_2587888f.jpg", alt: "Freshly poured narrow concrete driveway Brisbane" },
      ],
  },
  "exposed-aggregate-patio-coorparoo": {
    headline: "Exposed Aggregate Patios in Coorparoo from $95/m² - Book Now!",
    subheadline: "Your local Coorparoo concreting specialists. QBCC Licensed #15299707. Get a free, no-obligation quote today!",
    service: "Exposed Aggregate Patio",
    benefits: [
      "Enhance your Queenslander with a stunning, non-slip exposed aggregate patio.",
      "Perfect for Coorparoo's hilly terrain and clay-based soils.",
      "Our modern finishes complement both classic and renovated homes in the area.",
      "Durable and low-maintenance, ideal for Brisbane's weather conditions.",
      "Adds significant value and street appeal to your Coorparoo property.",
      "Custom designs to match your home's unique character and landscape.",
    ],
    priceFrom: "95",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","Coorparoo Local Specialist","Family Owned & Operated"],
    urgencyLine: "Limited spots available for Coorparoo projects this month. Call 0424 463 268 to secure your spot!",
    testimonials: [
      { name: "Sarah L.", text: "The team did an amazing job on our new patio. It completely transformed our backyard and complements our Queenslander perfectly.", service: "Exposed Aggregate Patio in Coorparoo", stars: 5 },
      { name: "David P.", text: "From quote to completion, the process was seamless. The new exposed aggregate looks fantastic and handles the slope of our block beautifully.", service: "Exposed Aggregate Patio in Coorparoo", stars: 5 },
      { name: "Jenny H.", text: "We are so happy with our new entertaining area. Concrete Concepts Group were professional, tidy, and delivered a high-quality finish.", service: "Exposed Aggregate Patio in Coorparoo", stars: 5 },
    ],
    processSteps: [
      "Initial Consultation & Free Quote",
      "Custom Design & Site Preparation",
      "Concrete Pour & Exposure",
      "Final Wash, Seal & Handover",
    ],
  },
  "concrete-slab-ipswich": {
    headline: "Concrete Slabs in Ipswich from $68/m²! Limited Spots - Book Now!",
    subheadline: "QBCC Licensed #15299707. Built for Ipswich's new homes. Get your free, no-obligation quote today!",
    service: "Concrete Slabs",
    benefits: [
      "Engineered for Ipswich's reactive clay soil conditions, ensuring long-term stability.",
      "Perfectly level, strong foundations for new homes in the Western Corridor.",
      "Waffle pod and conventional slab options to suit your specific block and budget.",
      "Termite-resistant treatments available to protect your biggest investment.",
      "Fast, efficient pours to keep your new housing development project on schedule.",
      "Fully compliant with Ipswich City Council regulations for a hassle-free build.",
    ],
    priceFrom: "$68",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","Serving the Ipswich Growth Corridor","20+ Years Concreting Experience"],
    urgencyLine: "Our schedule for Ipswich is filling fast. Lock in your project start date today!",
    testimonials: [
      { name: "David H.", text: "The team poured a perfect slab for our new build in Ripley. They were professional, on time, and handled the tricky soil conditions without a fuss. Highly recommend.", service: "New Home Slab in Ripley", stars: 5 },
      { name: "Sarah P.", text: "Concrete Concepts Group delivered a quality foundation for our granny flat. Their communication was excellent and the site was left spotless.", service: "Granny Flat Slab in Raceview", stars: 5 },
      { name: "Tom W.", text: "We needed a solid shed slab and these guys were fantastic. Great price and the finished product is exactly what we wanted. Cheers!", service: "Shed Foundation in Brassall", stars: 5 },
    ],
    processSteps: [
      "Site Assessment & Free Quote",
      "Detailed Earthworks & Preparation",
      "Formwork, Reinforcement & Pour",
      "Curing & Final Site Cleanup",
    ],
  },
  "driveway-redcliffe": {
    headline: "Driveways in Redcliffe from $85/m²! Limited Spots - Book Now!",
    subheadline: "QBCC Licensed #15299707. Built for coastal conditions. Get your free, no-obligation quote and design consultation today!",
    service: "Driveway",
    benefits: [
      "Resists salt spray and coastal air, preventing corrosion and surface damage.",
      "Engineered for sandy or unstable soil common on the Redcliffe peninsula.",
      "High-strength concrete mix to withstand the harsh Moreton Bay climate.",
      "Proper drainage solutions to handle heavy rainfall and protect your property.",
      "Choice of finishes to complement your coastal home's aesthetic.",
      "Increases your property's value and curb appeal in the competitive Redcliffe market.",
    ],
    priceFrom: "85",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707","4.9★ Google Rating","Redcliffe Peninsula Specialists","20+ Years Local Experience"],
    urgencyLine: "Availability is limited as we book out fast in the Redcliffe area. Secure your spot today!",
    testimonials: [
      { name: "Sarah P.", text: "Our new driveway looks fantastic and handles the seaside conditions perfectly. The team was professional and efficient from start to finish.", service: "New Concrete Driveway in Clontarf", stars: 5 },
      { name: "David L.", text: "Concrete Concepts Group replaced our old, cracked driveway. The new one is built to last and has really improved our home's look.", service: "Driveway Replacement in Margate", stars: 5 },
      { name: "Jenny H.", text: "We needed a durable driveway for our boat trailer. The team recommended the perfect solution for our Redcliffe home.", service: "Heavy-Duty Driveway in Woody Point", stars: 5 },
    ],
    processSteps: [
      "1. Free Quote & Site Assessment",
      "2. Custom Design & Plan",
      "3. Professional Installation",
      "4. Final Inspection & Handover",
    ],
  },

  // ── Service + Suburb Combo Pages (Topic Cluster SEO) ──

  "concrete-driveway-morningside": {
    headline: "Concrete Driveways in Morningside — From $80/m²",
    subheadline: "QBCC Licensed #15299707. Morningside's trusted local concreters. Free on-site quote within 24 hours.",
    service: "Concrete Driveways",
    benefits: [
      "Engineered for Morningside's clay-heavy soil — proper sub-base preparation prevents cracking",
      "Exposed aggregate, coloured, or plain finishes to match your Queenslander or modern home",
      "Old driveway demolished and disposed of — included in your quote",
      "Council crossover permits handled for you if connecting to Wynnum Road or side streets",
      "Steel reinforcement and expansion joints for 30+ year lifespan",
      "Flexible payment — pay on completion, no deposit required",
    ],
    priceFrom: "$80/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Morningside Local Specialists", "500+ Brisbane Driveways Completed"],
    urgencyLine: "Only 2 Morningside quote slots left this week — book yours now",
    testimonials: [
      { name: "Myresh M.", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. The driveway looks incredible.", service: "Exposed Aggregate Driveway — Morningside", stars: 5 },
      { name: "Paul S.", text: "The price was what I had expected to pay and they came out to inspect the site before quoting. Driveway was done in 3 days.", service: "Concrete Driveway — Morningside", stars: 5 },
      { name: "Sarah K.", text: "We got 3 quotes and Concrete Concepts were the most professional. The finished driveway exceeded our expectations.", service: "Plain Concrete Driveway — Morningside", stars: 5 },
    ],
    processSteps: [
      "Free on-site inspection & quote (within 24 hrs)",
      "Old driveway removed & site prepared",
      "Formwork, steel & drainage installed",
      "Concrete poured & finished to your chosen style",
    ],
  },

  "exposed-aggregate-greenslopes": {
    headline: "Exposed Aggregate in Greenslopes — From $100/m²",
    subheadline: "QBCC Licensed #15299707. Premium exposed aggregate finishes for Greenslopes homes. Free quote within 24 hours.",
    service: "Exposed Aggregate",
    benefits: [
      "Premium stone blends — Canberra, Goulburn, and custom colours available",
      "Slip-resistant finish perfect for Greenslopes' hilly driveways and paths",
      "Proper drainage engineering for sloped blocks — prevents water pooling",
      "Coloured concrete borders and feature strips for a designer look",
      "Initial sealer application included — protects your investment from day one",
      "30+ year lifespan with minimal maintenance — just reseal every 3-5 years",
    ],
    priceFrom: "$100/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Greenslopes Area Specialists", "Brisbane's #1 Exposed Aggregate Team"],
    urgencyLine: "Limited availability in Greenslopes this month — secure your free quote today",
    testimonials: [
      { name: "Myresh M.", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. The driveway looks incredible.", service: "Exposed Aggregate Driveway — Greenslopes", stars: 5 },
      { name: "Lisa R.", text: "The exposed aggregate patio has completely transformed our outdoor entertaining area. Beautiful finish and great value.", service: "Exposed Aggregate Patio — Greenslopes", stars: 5 },
      { name: "Tom W.", text: "We chose the premium stone blend and it looks stunning. The team managed the steep driveway perfectly.", service: "Exposed Aggregate Driveway — Greenslopes", stars: 5 },
    ],
    processSteps: [
      "Free on-site inspection & stone selection consultation",
      "Site prepared — excavation & formwork",
      "Concrete poured with your chosen stone blend",
      "Aggregate exposed, washed & sealed to perfection",
    ],
  },

  "retaining-wall-sunnybank": {
    headline: "Concrete Retaining Walls in Sunnybank — From $350/m",
    subheadline: "QBCC Licensed #15299707. Engineered retaining walls for Sunnybank's sloped blocks. Free structural assessment & quote.",
    service: "Retaining Walls",
    benefits: [
      "Engineered for Sunnybank's reactive clay soils — built to last decades",
      "Full council approval handling for walls over 1 metre",
      "Proper ag-pipe drainage behind every wall — prevents hydrostatic pressure",
      "Besser block, poured concrete, or sleeper options to suit your budget",
      "Structural engineering certification included for walls requiring it",
      "Tiered and stepped designs available for multi-level gardens",
    ],
    priceFrom: "$350/m",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-retaining-wall-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Sunnybank Retaining Wall Experts", "Engineer-Certified Builds"],
    urgencyLine: "Sunnybank slots filling fast — get your free structural assessment this week",
    testimonials: [
      { name: "James C.", text: "The retaining wall has completely transformed our backyard. The team handled the council approvals and engineering — we didn't have to worry about a thing.", service: "Retaining Wall — Sunnybank", stars: 5 },
      { name: "Michelle T.", text: "Our sloped block was unusable before. Now we have a beautiful tiered garden with solid retaining walls. Excellent workmanship.", service: "Tiered Retaining Walls — Sunnybank Hills", stars: 5 },
      { name: "Kevin B.", text: "Professional from start to finish. The drainage behind the wall was done properly and we've had no issues even after heavy rain.", service: "Boundary Retaining Wall — Sunnybank", stars: 5 },
    ],
    processSteps: [
      "Free on-site structural assessment & quote",
      "Engineering design & council approvals (if required)",
      "Excavation, footings & drainage installed",
      "Wall built, backfilled & finished",
    ],
  },

  "concrete-patio-nundah": {
    headline: "Concrete Patios in Nundah — From $70/m²",
    subheadline: "QBCC Licensed #15299707. Transform your Nundah backyard into an outdoor entertaining area. Free quote within 24 hours.",
    service: "Concrete Patios",
    benefits: [
      "Exposed aggregate, coloured, or plain finishes to match your home's style",
      "Proper fall and drainage to protect your Nundah property from pooling water",
      "Seamless integration with existing structures — decks, pergolas, and fences",
      "Non-slip finishes for safe outdoor entertaining year-round",
      "Step-downs and level changes handled — perfect for Nundah's varied block levels",
      "Adds genuine value to your property in Nundah's competitive market",
    ],
    priceFrom: "$70/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-patio-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Nundah Local Specialists", "500+ Patios & Entertaining Areas"],
    urgencyLine: "Only 3 Nundah area quote slots available this week",
    testimonials: [
      { name: "Anna M.", text: "Our new patio has completely changed how we use our backyard. The exposed aggregate finish looks beautiful and is easy to keep clean.", service: "Exposed Aggregate Patio — Nundah", stars: 5 },
      { name: "Chris D.", text: "The team integrated the new patio perfectly with our existing deck. Seamless finish and great attention to detail.", service: "Concrete Patio Extension — Nundah", stars: 5 },
      { name: "Rachel S.", text: "We love our new outdoor entertaining area. The coloured concrete matches our house perfectly. Highly recommend Concrete Concepts.", service: "Coloured Concrete Patio — Nundah", stars: 5 },
    ],
    processSteps: [
      "Free on-site design consultation & quote",
      "Site prepared — excavation & levelling",
      "Formwork, reinforcement & drainage installed",
      "Concrete poured, finished & sealed",
    ],
  },

  "concrete-slab-moorooka": {
    headline: "Concrete Slabs in Moorooka — From $65/m²",
    subheadline: "QBCC Licensed #15299707. Shed slabs, garage floors & house slabs for Moorooka properties. Free quote within 24 hours.",
    service: "Concrete Slabs",
    benefits: [
      "Shed slabs, garage floors, granny flat slabs & house extensions",
      "Engineered for Moorooka's clay soils — proper compaction and sub-base preparation",
      "Thickened edge and waffle pod options for structural requirements",
      "Plumbing and electrical conduit cast-ins coordinated with your other trades",
      "Steel mesh or rebar reinforcement — specified to suit your slab's load requirements",
      "Level, smooth finish ready for your shed, garage, or building",
    ],
    priceFrom: "$65/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Moorooka Area Specialists", "500+ Slabs Poured Across Brisbane"],
    urgencyLine: "Moorooka availability limited — book your free quote before we're booked out",
    testimonials: [
      { name: "Steve R.", text: "The shed slab was poured perfectly level and the team worked around our existing landscaping. Very professional.", service: "Shed Slab — Moorooka", stars: 5 },
      { name: "Karen L.", text: "We needed a garage slab that could handle heavy vehicles. The team recommended the right thickness and reinforcement. Excellent result.", service: "Garage Slab — Moorooka", stars: 5 },
      { name: "Daniel P.", text: "The granny flat slab was done on time and on budget. All the plumbing was cast in correctly. Smooth process from quote to completion.", service: "Granny Flat Slab — Moorooka", stars: 5 },
    ],
    processSteps: [
      "Free on-site measurement & quote",
      "Site excavated & compacted to spec",
      "Formwork, reinforcement & services installed",
      "Concrete poured, finished & cured",
    ],
  },

  // ── Springfield, Carindale, Logan, Capalaba Combo Pages ──

  "concrete-driveway-springfield": {
    headline: "Concrete Driveways in Springfield — From $80/m²",
    subheadline: "QBCC Licensed #15299707. Springfield's trusted local concreters for new builds and replacements. Free on-site quote within 24 hours.",
    service: "Concrete Driveways",
    benefits: [
      "New estate specialists — we work with builders across Springfield Lakes, Spring Mountain & Brookwater",
      "Exposed aggregate, coloured, or plain finishes to match your new home's style",
      "Proper sub-base preparation for Springfield's expansive clay soils — prevents cracking",
      "Council crossover permits handled for connections to Springfield Parkway and local streets",
      "Steel reinforcement and expansion joints for a 30+ year lifespan",
      "Flexible payment — pay on completion, no deposit required",
    ],
    priceFrom: "$80/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Springfield & Greater Ipswich Specialists", "500+ Brisbane Driveways Completed"],
    urgencyLine: "Springfield slots filling fast — only 3 quote spots left this week",
    testimonials: [
      { name: "Myresh M.", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. The driveway looks incredible.", service: "Exposed Aggregate Driveway — Springfield Lakes", stars: 5 },
      { name: "Paul S.", text: "The price was what I had expected to pay and they came out to inspect the site before quoting. Driveway was done in 3 days.", service: "Concrete Driveway — Spring Mountain", stars: 5 },
      { name: "Lisa T.", text: "We built a new home in Springfield and needed a driveway that matched the modern look. The team delivered exactly what we wanted.", service: "Coloured Concrete Driveway — Springfield", stars: 5 },
    ],
    processSteps: [
      "Free on-site inspection & quote (within 24 hrs)",
      "Old surface removed or new site prepared",
      "Formwork, steel reinforcement & drainage installed",
      "Concrete poured & finished to your chosen style",
    ],
  },

  "exposed-aggregate-carindale": {
    headline: "Exposed Aggregate in Carindale — From $100/m²",
    subheadline: "QBCC Licensed #15299707. Premium exposed aggregate driveways, patios & pool surrounds for Carindale homes. Free quote within 24 hours.",
    service: "Exposed Aggregate",
    benefits: [
      "Premium stone blends — Canberra, Goulburn, and custom colours to suit your Carindale home",
      "Slip-resistant finish perfect for pool surrounds and entertaining areas",
      "Proper drainage engineering to protect your property from Brisbane's heavy rainfall",
      "Coloured concrete borders and feature strips for a designer look",
      "Initial sealer application included — protects your investment from day one",
      "30+ year lifespan with minimal maintenance — just reseal every 3-5 years",
    ],
    priceFrom: "$100/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Carindale & Eastern Suburbs Specialists", "Brisbane's #1 Exposed Aggregate Team"],
    urgencyLine: "Limited Carindale availability this month — secure your free quote today",
    testimonials: [
      { name: "Myresh M.", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. The driveway looks incredible.", service: "Exposed Aggregate Driveway — Carindale", stars: 5 },
      { name: "Rachel B.", text: "The exposed aggregate patio has completely transformed our outdoor entertaining area. Beautiful finish and great value for money.", service: "Exposed Aggregate Patio — Carindale", stars: 5 },
      { name: "Andrew M.", text: "We chose the premium stone blend for our pool surround and it looks stunning. Non-slip and easy to maintain.", service: "Exposed Aggregate Pool Surround — Carindale", stars: 5 },
    ],
    processSteps: [
      "Free on-site inspection & stone selection consultation",
      "Site prepared — excavation & formwork",
      "Concrete poured with your chosen stone blend",
      "Aggregate exposed, washed & sealed to perfection",
    ],
  },

  "retaining-wall-logan": {
    headline: "Concrete Retaining Walls in Logan — From $350/m",
    subheadline: "QBCC Licensed #15299707. Engineered retaining walls for Logan's sloped and flood-prone blocks. Free structural assessment & quote.",
    service: "Retaining Walls",
    benefits: [
      "Engineered for Logan's reactive clay and flood-prone soils — built to last decades",
      "Full Logan City Council approval handling for walls over 1 metre",
      "Proper ag-pipe drainage behind every wall — prevents hydrostatic pressure and water damage",
      "Besser block, poured concrete, or sleeper options to suit your budget and style",
      "Structural engineering certification included for walls requiring it",
      "Tiered and stepped designs available for multi-level yards across Shailer Park, Springwood & Daisy Hill",
    ],
    priceFrom: "$350/m",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-retaining-wall-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Logan & Surrounds Specialists", "Engineer-Certified Builds"],
    urgencyLine: "Logan area slots filling fast — get your free structural assessment this week",
    testimonials: [
      { name: "Paul S.", text: "The price was what I had expected to pay and they came out to inspect the site before quoting. The retaining wall is solid and well-built.", service: "Retaining Wall — Shailer Park", stars: 5 },
      { name: "James W.", text: "Our sloped block in Springwood was unusable before. Now we have a beautiful tiered garden with solid retaining walls. Excellent workmanship.", service: "Tiered Retaining Walls — Springwood", stars: 5 },
      { name: "Sandra H.", text: "Professional from start to finish. The drainage behind the wall was done properly and we've had no issues even after heavy rain in Logan.", service: "Boundary Retaining Wall — Daisy Hill", stars: 5 },
    ],
    processSteps: [
      "Free on-site structural assessment & quote",
      "Engineering design & council approvals (if required)",
      "Excavation, footings & drainage installed",
      "Wall built, backfilled & finished",
    ],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/logan-exposed-aggregate-driveway_6d51814c.jpg", alt: "Exposed aggregate concrete work by Concrete Concepts in Logan" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-pour-team_bc52e91e.jpg", alt: "Concrete Concepts team working on reinforced concrete project" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-prep-rebar_2e944823.jpg", alt: "Professional formwork and rebar preparation for concrete pour" },
      ],
  },

  "concrete-slab-capalaba": {
    headline: "Concrete Slabs in Capalaba — From $65/m²",
    subheadline: "QBCC Licensed #15299707. Shed slabs, garage floors & granny flat slabs for Capalaba and Redlands properties. Free quote within 24 hours.",
    service: "Concrete Slabs",
    benefits: [
      "Shed slabs, garage floors, granny flat slabs & house extensions",
      "Engineered for Capalaba's clay and sandy soils — proper compaction and sub-base preparation",
      "Thickened edge and waffle pod options for structural requirements",
      "Plumbing and electrical conduit cast-ins coordinated with your other trades",
      "Steel mesh or rebar reinforcement — specified to suit your slab's load requirements",
      "Level, smooth finish ready for your shed, garage, or building",
    ],
    priceFrom: "$65/m²",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Capalaba & Redlands Specialists", "500+ Slabs Poured Across Brisbane"],
    urgencyLine: "Capalaba availability limited — book your free quote before we're booked out",
    testimonials: [
      { name: "Mark T.", text: "The shed slab was poured perfectly level and the team worked around our existing landscaping. Very professional and tidy.", service: "Shed Slab — Capalaba", stars: 5 },
      { name: "Jenny R.", text: "We needed a garage slab that could handle our caravan. The team recommended the right thickness and reinforcement. Excellent result.", service: "Garage Slab — Birkdale", stars: 5 },
      { name: "Chris L.", text: "The granny flat slab was done on time and on budget. All the plumbing was cast in correctly. Smooth process from quote to completion.", service: "Granny Flat Slab — Capalaba", stars: 5 },
    ],
    processSteps: [
      "Free on-site measurement & quote",
      "Site excavated & compacted to spec",
      "Formwork, reinforcement & services installed",
      "Concrete poured, finished & cured",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // NEW LANDING PAGES — Generated batch (30 service×suburb combos)
  // ═══════════════════════════════════════════════════════════════

  "concrete-driveway-bulimba": {
      headline: "Quality Concrete Driveways in Bulimba from $75/m²",
      subheadline: "Your trusted local concreters, QBCC Licensed #15299707. Call 0424 463 268 for a free quote.",
      service: "Concrete Driveways",
      benefits: ["Built to last on Bulimba's unique riverside soil conditions.", "Enhance your home's value in a suburb with a $2.2M median house price.", "Perfectly complements the premium, professional aesthetic of the area.", "Seamless integration with the prestigious Oxford Street and ferry precinct lifestyle.", "Council-compliant designs for a smooth and hassle-free installation.", "A durable, stylish entrance that reflects the village feel of your neighbourhood."],
      priceFrom: "$75/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Family Owned & Operated", "Serving Brisbane for 15+ Years"],
      urgencyLine: "Limited spots available for projects in Bulimba this month. Call 0424 463 268 to secure your booking!",
      testimonials: [
        { name: "David & Sarah Jones", text: "Concrete Concepts Group did an amazing job on our new driveway. It perfectly matches the modern look of our home.", service: "Concrete Driveway in Bulimba", stars: 5 },
        { name: "Michael Chen", text: "From quote to completion, the team was professional and efficient. Our new driveway has completely transformed our property's curb appeal.", service: "Driveway Replacement in Bulimba", stars: 5 },
        { name: "Emily Williams", text: "We were so impressed with the quality and finish of our driveway. It's the perfect addition to our Bulimba home.", service: "New Concrete Driveway in Bulimba", stars: 5 },
      ],
      processSteps: ["Initial Consultation & Free Quote", "Site Preparation & Excavation", "Formwork & Reinforcement", "Concrete Pour & Professional Finish"],
    },

  "concrete-driveway-paddington": {
      headline: "Expert Concrete Driveways in Paddington from $75/m²",
      subheadline: "Your fully licensed (QBCC #15299707) and insured concrete driveway specialists, enhancing Paddington's heritage homes.",
      service: "Concrete Driveways",
      benefits: ["Engineered for Paddington's steep, sloping blocks", "Designs that complement heritage cottages and modern homes", "Reinforced for durability on challenging terrain", "Enhance your property's value, which averages $1.9M in Paddington", "Solutions that respect local character and council requirements", "Improve street appeal with a finish that matches Paddington's cafe culture lifestyle"],
      priceFrom: "$75/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Paddington Steep Site Specialists", "Free On-Site Quotes"],
      urgencyLine: "Booking fast in the Paddington area! Call 0424 463 268 to secure your project timeline.",
      testimonials: [
        {
          name: "Liam Wilson",
          text: "The team did an amazing job on our steep driveway. It looks fantastic and really suits our Paddington cottage. Highly recommend Concrete Concepts.",
          service: "Concrete Driveway in Paddington",
          stars: 5
        },
        {
          name: "Chloe Campbell",
          text: "We needed a new driveway that could handle the tricky access to our property. The result is flawless and adds so much value. Professional from start to finish.",
          service: "Driveway Replacement in Paddington",
          stars: 5
        },
        {
          name: "Oliver Davies",
          text: "Our new driveway has completely transformed the front of our home. It perfectly complements the heritage feel of the area. Great communication and workmanship.",
          service: "Heritage Driveway in Paddington",
          stars: 5
        }
      ],
      processSteps: ["Initial consultation to assess your Paddington property's unique requirements", "Detailed quote and design proposal tailored to your home's aesthetic", "Professional excavation and base preparation for long-lasting stability", "Expert concrete pour, finishing, and site clean-up"]
    },

  "concrete-driveway-wynnum": {
      headline: "Quality Concrete Driveways in Wynnum from $75/m²",
      subheadline: "Brisbane's #1 concreting team. QBCC Licensed #15299707. Call 0424 463 268 for a free quote.",
      service: "Concrete Driveways",
      benefits: ["Built to withstand coastal conditions and salty bay breezes", "Enhance your bayside property's value, complementing Wynnum's $1.4M median homes", "A durable, family-friendly surface perfect for growing families in the Wynnum area", "Driveways designed to resist the shifting, sandy soils common in waterfront suburbs", "Seamlessly integrates with the relaxed, waterfront lifestyle of the Wynnum Esplanade", "Expert advice on council crossovers and approvals for Bayside properties"],
      priceFrom: "$75/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "20+ Years Concreting Experience", "Family Owned & Operated"],
      urgencyLine: "Book your free Wynnum quote today! Call 0424 463 268 before spots fill up.",
      testimonials: [
        { name: "David & Sarah W.", text: "Our new driveway looks fantastic. The team from Concrete Concepts was professional and efficient. Highly recommend them for any work in Wynnum.", service: "Concrete Driveway in Wynnum", stars: 5 },
        { name: "Michael B.", text: "So happy with the result. Our home's curb appeal has skyrocketed. They handled the whole process smoothly, perfect for our bayside property.", service: "New Driveway in Wynnum", stars: 5 },
        { name: "Jessica P.", text: "From quote to completion, the service was top-notch. They understood the coastal requirements and delivered a beautiful, durable driveway.", service: "Driveway Replacement in Wynnum", stars: 5 },
      ],
      processSteps: ["1. Free On-Site Quote & Consultation", "2. Detailed Site Preparation & Excavation", "3. Professional Concrete Pour & Finish", "4. Final Curing & Quality Inspection"],
    },

  "concrete-driveway-ascot": {
      headline: "Prestige Concrete Driveways in Ascot from $75/m²",
      subheadline: "Elevate your grand Ascot home with a flawless concrete driveway. QBCC Licensed #15299707.",
      service: "Concrete Driveways",
      benefits: ["Engineered to complement Ascot's multi-million dollar homes and grand aesthetics", "Designed for the area's unique terrain, ensuring a durable, long-lasting surface", "Seamlessly integrates with the wide, leafy streetscapes of your prestigious suburb", "Enhances curb appeal and property value around landmarks like Ascot Racecourse", "Brisbane City Council compliant, guaranteeing a smooth, regulation-perfect project", "A statement of quality that reflects the elite character of your neighbourhood"],
      priceFrom: "$75/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Serving Brisbane's Most Prestigious Suburbs", "Family Owned & Operated"],
      urgencyLine: "Booking fast in Ascot for projects this season. Call 0424 463 268 for a priority quote!",
      testimonials: [
        { name: "Michael & Jessica", text: "The new driveway is simply stunning and perfectly suits our home's character. The team's attention to detail was second to none.", service: "Concrete Driveway in Ascot", stars: 5 },
        { name: "Dr. Evans", text: "A truly professional service from start to finish. They understood the high standards required for a property like ours in Ascot. Impressive work.", service: "Driveway Replacement in Ascot", stars: 5 },
        { name: "Sophia L.", text: "Our driveway is now a feature, not just a utility. It has completely transformed the entrance to our home near Eagle Farm.", service: "New Concrete Driveway in Ascot", stars: 5 },
      ],
      processSteps: ["On-site consultation at your Ascot property to align with your vision", "A detailed, fixed-price proposal with full transparency", "Meticulous site excavation and base preparation for ultimate stability", "Expert concrete pouring and finishing for a flawless, enduring result"]
    },

  "concrete-driveway-holland-park": {
      headline: "Expert Concrete Driveways in Holland Park from $75/m²",
      subheadline: "Upgrade your home's curb appeal with a durable, stylish driveway from Concrete Concepts Group, your trusted local experts. QBCC Licensed #15299707.",
      service: "Concrete Driveways",
      benefits: [
        "Adds significant value to your property in the sought-after $1.3M Holland Park market.",
        "Perfectly complements the blend of post-war and newly renovated homes in the area.",
        "Engineered to handle local soil conditions, preventing cracks and subsidence.",
        "Improves street appeal for established, family-oriented neighbourhoods.",
        "Expertly managed projects with minimal disruption for homes near the Logan Road corridor.",
        "Local knowledge of Brisbane City Council requirements for a smooth, compliant installation."
      ],
      priceFrom: "$75/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "20+ Years Local Experience", "Free, Detailed Quotes"],
      urgencyLine: "Limited spots available for Holland Park projects this month. Book your free quote now!",
      testimonials: [
        {
          name: "David & Sarah M.",
          text: "The team did a fantastic job on our new driveway. It completely transformed the front of our house. Professional, on time, and great value.",
          service: "Concrete Driveway in Holland Park",
          stars: 5
        },
        {
          name: "Liam P.",
          text: "Our old cracked driveway was an eyesore. Concrete Concepts Group replaced it with a beautiful new one that suits our renovated home perfectly. Highly recommend.",
          service: "Driveway Replacement in Holland Park",
          stars: 5
        },
        {
          name: "Jessica T.",
          text: "From the initial quote to the final clean-up, the service was exceptional. We're so happy with the result and the quality of the workmanship.",
          service: "New Driveway in Holland Park",
          stars: 5
        }
      ],
      processSteps: ["Initial Consultation & Free Quote", "Site Preparation & Excavation", "Formwork & Reinforcement Setup", "Concrete Pour & Professional Finish"]
    },

  "exposed-aggregate-hawthorne": {
      headline: "Premium Exposed Aggregate in Hawthorne from $100/m²",
      subheadline: "Flawless, durable finishes for Hawthorne's exclusive homes. QBCC Licensed #15299707.",
      service: "Exposed Aggregate",
      benefits: ["Boost your home's value with a finish that complements Hawthorne's premium riverside aesthetic.", "Expertise in managing challenging soil conditions common in riverside suburbs for a lasting investment.", "A sophisticated, non-slip surface perfect for driveways and paths near the ferry terminal.", "Designs that reflect the upscale character of the Hawthorne Garage dining precinct.", "Seamless project coordination that respects the peace and prestige of the Hawthorne village lifestyle.", "We handle all council crossover applications and ensure full compliance with Brisbane City Council regulations."],
      priceFrom: "$100/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "100% Locally Owned & Operated", "Free, No-Obligation Quotes"],
      urgencyLine: "Limited bookings available for Hawthorne projects this season. Call 0424 463 268 to secure your spot!",
      testimonials: [
        { name: "Liam & Chloe", text: "The team did an incredible job on our new driveway. The exposed aggregate finish is stunning and completely elevates our home's street appeal.", service: "Exposed Aggregate Driveway in Hawthorne", stars: 5 },
        { name: "Oliver Harris", text: "Professional, punctual, and the quality of work is second to none. Our pool area looks like a resort now. Highly recommend Concrete Concepts.", service: "Pool Surrounds in Hawthorne", stars: 5 },
        { name: "Isabella Martin", text: "From the initial quote to the final clean-up, the process was seamless. They understood the look we wanted for our character home perfectly.", service: "Exposed Aggregate Patio in Hawthorne", stars: 5 }
      ],
      processSteps: ["Initial on-site consultation & free quote", "Detailed site preparation and excavation", "Professional concrete pour and aggregate exposure", "Final high-pressure clean and sealing"]
    },

  "exposed-aggregate-clayfield": {
      headline: "Prestige Exposed Aggregate in Clayfield from $100/m²",
      subheadline: "Transform your property with a stunning, durable finish from Concrete Concepts Group, your fully QBCC Licensed (#15299707) specialists.",
      service: "Exposed Aggregate",
      benefits: ["Enhances the prestige character of your Clayfield home, complementing its tree-lined streets and established gardens.", "A durable, non-slip surface perfect for driveways and paths, handling Clayfield's rolling terrain with ease.", "Built to last, our aggregate mixes are designed to withstand Brisbane's climate and the specific soil conditions in the 4011 postcode.", "Adds significant value to your property, aligning with the high-end real estate market in the Ascot and Hamilton precinct.", "Low maintenance solution for busy established families, freeing up your weekends to enjoy local cafes and parks.", "Fully compliant with Brisbane City Council standards for heritage and character homes."],
      priceFrom: "$100/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Brisbane Family Owned & Operated", "100% Obligation-Free Quotes"],
      urgencyLine: "Booking fast in the inner-north! Secure your project start date in Clayfield today.",
      testimonials: [
        { name: "David & Sarah Mitchell", text: "The team did an incredible job on our new driveway. The exposed aggregate finish is flawless and has completely lifted the look of our home. Professional, tidy, and on time.", service: "Exposed Aggregate Driveway in Clayfield", stars: 5 },
        { name: "Liam O'Connell", text: "From quote to completion, the service was exceptional. Our new pool area looks like a resort. Couldn't be happier with the quality and the team's attention to detail.", service: "Pool Surrounds in Clayfield", stars: 5 },
        { name: "Jessica Chen", text: "We were impressed with the professionalism of Concrete Concepts. They understood the aesthetic we wanted for our character home and delivered a beautiful, high-quality patio.", service: "Exposed Aggregate Patio in Clayfield", stars: 5 },
      ],
      processSteps: ["Initial on-site consultation and detailed, fixed-price quote.", "Thorough site preparation, excavation, and precision formwork.", "Expert concrete pour and professional aggregate exposure.", "Final clean, quality inspection, and protective sealing application."]
    },

  "exposed-aggregate-norman-park": {    headline: "Premium Exposed Aggregate in Norman Park from $100/m²",    subheadline: "Transform your property with a stunning, durable finish. QBCC Licensed #15299707.",    service: "Exposed Aggregate",    benefits: ["A modern, non-slip surface ideal for Norman Park's hilly terrain and beautiful family homes.", "Perfectly complements renovated Queenslanders, adding significant value and street appeal.", "Engineered to withstand local soil conditions, especially near Norman Creek, ensuring longevity.", "A premium finish that reflects the prestige of a suburb with a $1.5M median house price.", "We manage all Brisbane City Council requirements for a hassle-free project from start to finish.", "Our efficient process minimises disruption to your lifestyle in this quiet, family-oriented area."],    priceFrom: "$100/m²",    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Family Owned & Operated", "100% Brisbane Locals"],    urgencyLine: "Quality bookings for Norman Park are filling fast. Call 0424 463 268 for a free quote!",    testimonials: [      { name: "Mark & Sarah", text: "The team did an amazing job on our new driveway. It completely changed the look of our Queenslander. Professional, on time, and the finish is flawless.", service: "Exposed Aggregate Driveway in Norman Park", stars: 5 },      { name: "Ben Carter", text: "Our old, cracked patio is now a stunning exposed aggregate area. Concrete Concepts were fantastic to deal with and their attention to detail was second to none.", service: "Exposed Aggregate Patio in Norman Park", stars: 5 },      { name: "Jessica Lee", text: "We couldn't be happier with our new pool surrounds. The aggregate is beautiful and safe for the kids. Highly recommend their services to anyone in Norman Park.", service: "Pool Surrounds in Norman Park", stars: 5 },    ],    processSteps: ["Initial on-site consultation and detailed, fixed-price quote.", "Thorough site preparation, excavation, and formwork setup.", "Professional concrete pour with your chosen aggregate mix.", "High-pressure wash to expose the stone and application of a protective sealant."],  },

  "exposed-aggregate-manly": {
      headline: "Premium Exposed Aggregate in Manly from $100/m²",
      subheadline: "Transform your Bayside home with stunning, durable surfaces from Concrete Concepts Group, your fully QBCC Licensed (#15299707) specialists.",
      service: "Exposed Aggregate",
      benefits: ["Engineered to withstand coastal salt spray and the constant bay breezes of Manly.", "The perfect non-slip, stylish finish for pool surrounds, embracing the local pool culture.", "Enhances your outdoor lifestyle and complements the prestigious $1.6M median local property values.", "A durable, low-maintenance solution ideal for homes near Manly Harbour and the boat ramp.", "Adds significant value and street appeal to your high-end Bayside residence.", "Custom aggregate mixes to match the unique aesthetic of your waterfront property."],
      priceFrom: "$100/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Local Bayside & Manly Specialists", "Free, No-Obligation Quotes"],
      urgencyLine: "Book your free on-site quote today to secure your project before the summer rush!",
      testimonials: [
        { name: "Liam & Sophie T.", text: "The new exposed aggregate around our pool is just fantastic. It looks incredible and feels great underfoot. The team was professional and respected our property near the harbour.", service: "Pool Surround in Manly", stars: 5 },
        { name: "Mark R.", text: "Our new driveway has completely lifted the look of our home. It handles the waterfront conditions perfectly. Couldn't be happier with the quality and service.", service: "Exposed Aggregate Driveway in Manly", stars: 5 },
        { name: "Jessica B.", text: "We love our new patio. It's the ideal surface for our outdoor lifestyle, and the finish is flawless. Concrete Concepts Group were a pleasure to deal with.", service: "Exposed Aggregate Patio in Manly", stars: 5 },
      ],
      processSteps: ["Initial on-site consultation and detailed, fixed-price quote.", "Thorough site preparation, excavation, and precision formwork setup.", "Professional concrete pour and careful exposure of the aggregate stone.", "High-pressure clean, application of a durable sealant, and final site cleanup."],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-slab-carport_bfbe57bd.jpg", alt: "Freshly poured concrete slab under carport in Manly Brisbane" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-pour-team_bc52e91e.jpg", alt: "Concrete Concepts team pouring concrete at Manly with rebar mesh" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/logan-exposed-aggregate-driveway_6d51814c.jpg", alt: "Exposed aggregate concrete finish being washed by our team" },
      ],
    },

  "exposed-aggregate-seven-hills": {
      headline: "Exposed Aggregate in Seven Hills from $100/m²",
      subheadline: "Transform your home with stunning, durable exposed aggregate. QBCC Licensed #15299707.",
      service: "Exposed Aggregate",
      benefits: [
        "Built to last on Seven Hills' unique hilly terrain",
        "Adds modern appeal to renovated character homes",
        "Perfect for steep or challenging driveways",
        "Enhances property value in the $1.4M median suburb",
        "Family-friendly, non-slip surface ideal for kids",
        "Council-compliant solutions for Brisbane's inner-east"
      ],
      priceFrom: "$100/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Family Owned & Operated", "Free, No-Obligation Quotes"],
      urgencyLine: "Limited spots available for Seven Hills projects this month. Call 0424 463 268 to secure your booking!",
      testimonials: [
        { name: "David & Sarah", text: "The team did an amazing job on our new driveway. It completely changed the look of our home. Highly recommend them for any work in Seven Hills.", service: "Exposed Aggregate Driveway in Seven Hills", stars: 5 },
        { name: "Michael Chen", text: "Professional, on time, and the final product is flawless. Our new patio looks fantastic. Thanks, Concrete Concepts!", service: "Exposed Aggregate Patio in Seven Hills", stars: 5 },
        { name: "Jessica Harris", text: "We were impressed with their attention to detail, especially working with the slope of our block. The finish is perfect.", service: "Exposed Aggregate Pathway in Seven Hills", stars: 5 }
      ],
      processSteps: ["Initial Consultation & Free Quote", "Custom Design & Site Preparation", "Expert Installation & Finishing", "Final Walkthrough & Quality Guarantee"]
    },

  "retaining-wall-paddington": {
      headline: "Expert Retaining Walls in Paddington from $350/m",
      subheadline: "QBCC Licensed #15299707, Concrete Concepts Group are your local specialists for challenging hillside blocks in Paddington.",
      service: "Retaining Walls",
      benefits: ["Engineered for Paddington's steep, challenging terrain.", "Solutions that protect and enhance heritage homes on hillsides.", "Expertise in navigating difficult access and tight blocks near Red Hill.", "Designs that complement the prestigious character of your $1.9M median suburb.", "Prevents soil erosion and creates usable, level space on your property.", "Council-compliant designs for peace of mind."],
      priceFrom: "$350/m",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-retaining-wall-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Family Owned & Operated", "20+ Years Experience"],
      urgencyLine: "Limited spots available for pre-winter construction. Call 0424 463 268 to secure your free quote!",
      testimonials: [
        { name: "Liam & Chloe", text: "The team built a stunning retaining wall that completely transformed our steep Paddington backyard. Professional from start to finish.", service: "Retaining Wall in Paddington", stars: 5 },
        { name: "Isabelle M.", text: "Our heritage home needed a sensitive solution for a failing wall. Concrete Concepts delivered a robust and beautiful wall that looks perfect. Highly recommend for Paddington properties.", service: "Heritage Retaining Wall in Paddington", stars: 5 },
        { name: "Ben Fletcher", text: "Access was a nightmare on our block, but they handled the excavation and construction for our new retaining wall flawlessly. Great problem solvers.", service: "Excavation & Retaining Wall in Paddington", stars: 5 }
      ],
      processSteps: ["Initial on-site consultation and detailed quote.", "Custom engineering and design to suit your block.", "Professional excavation and site preparation.", "Construction, waterproofing, and final site clean-up."]
    },

  "retaining-wall-bulimba": {
      headline: "Expert Retaining Walls in Bulimba from $350/m",
      subheadline: "Built to Last by Concrete Concepts Group, Your Fully QBCC Licensed (#15299707) Specialists.",
      service: "Retaining Walls",
      benefits: [
        "Engineered for Bulimba's hilly terrain and riverside soil conditions.",
        "Create beautiful, functional tiered gardens for your sloping block.",
        "Maximise usable space for your premium riverfront property.",
        "Designs that complement the prestigious character of the Oxford Street precinct.",
        "Brisbane City Council compliant, ensuring a smooth approval process.",
        "Prevent soil erosion and protect your valuable landscaping investment."
      ],
      priceFrom: "$350/m",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-retaining-wall-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Family Owned & Operated", "10+ Years Experience"],
      urgencyLine: "Limited spots available for projects in Bulimba this quarter. Call 0424 463 268 to secure your free quote!",
      testimonials: [
        { name: "Chloe & Tom W.", text: "The team built a stunning retaining wall for our tiered garden. It's completely transformed our backyard.", service: "Retaining Wall in Bulimba", stars: 5 },
        { name: "David M.", text: "Our property on the hill was a challenge, but Concrete Concepts handled the excavation and wall construction flawlessly. Highly recommend.", service: "Structural Retaining Wall in Bulimba", stars: 5 },
        { name: "Isabelle H.", text: "Professional, on time, and the final result exceeded our expectations. Our new wall looks fantastic and is incredibly solid.", service: "Garden Retaining Wall in Bulimba", stars: 5 }
      ],
      processSteps: [
        "Initial on-site consultation and free, detailed quote.",
        "Custom design and structural engineering for your specific needs.",
        "Professional excavation and site preparation.",
        "Construction, finishing, and complete site clean-up."
      ]
    },

  "retaining-wall-holland-park": {
      headline: "Expert Retaining Walls in Holland Park from $350/m",
      subheadline: "Transform your sloped Holland Park property with a structurally sound retaining wall. Fully insured & QBCC Licensed #15299707.",
      service: "Retaining Walls",
      benefits: ["Engineered for Holland Park’s sloped blocks to prevent soil erosion", "Create beautiful, level outdoor areas perfect for post-war home renovations", "Designs that meet Brisbane City Council standards and enhance your property's $1.3M median value", "Maximise usable space on your block for gardens, patios, or play areas", "Built to last using high-quality materials suited to local soil conditions", "Increase street appeal and functionality for your established Holland Park home"],
      priceFrom: "$350/m",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-retaining-wall-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "10+ Years Local Experience", "Free, Detailed Quotes"],
      urgencyLine: "Limited spots available for construction before the next wet season. Secure your free quote now!",
      testimonials: [
        {
          name: "Liam & Chloe",
          text: "Concrete Concepts Group built a fantastic retaining wall for our place. It's made our steep backyard so much more usable and looks incredible. Highly recommend them.",
          service: "Retaining Wall in Holland Park",
          stars: 5
        },
        {
          name: "Mark P.",
          text: "Professional service from start to finish. The new retaining wall has fixed our drainage issues and added serious value to our property. Couldn't be happier.",
          service: "Structural Retaining Wall in Holland Park",
          stars: 5
        },
        {
          name: "Jessica T.",
          text: "We needed to level our yard for the kids to play safely. The team designed and built the perfect wall that blends seamlessly with our garden. Fantastic job!",
          service: "Garden Retaining Wall in Holland Park",
          stars: 5
        }
      ],
      processSteps: ["Initial on-site consultation & free quote", "Custom design & engineering approval", "Professional construction & site management", "Final inspection & quality assurance"]
    },

  "retaining-wall-chandler": {
      headline: "Expert Retaining Walls in Chandler from $350/m",
      subheadline: "Built to last on acreage properties. QBCC Licensed #15299707.",
      service: "Retaining Walls",
      benefits: ["Engineered for Chandler's steep and sloping blocks", "Designs that complement resort-style homes & bushland settings", "Create more usable land for tennis courts, pools, or gardens", "Prevent soil erosion and manage water runoff effectively", "Enhance the value and stability of your $2.4M+ property", "Fully compliant with all Brisbane City Council requirements"],
      priceFrom: "$350/m",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-retaining-wall-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Chandler Acreage Specialists", "Free, No-Obligation Quotes"],
      urgencyLine: "Protect your valuable landscape. Book your free Chandler on-site assessment today!",
      testimonials: [
        { name: "David and Sarah Jenkins", text: "The team built a huge retaining wall on our sloping block. It looks incredible and has given us so much more usable space. True professionals.", service: "Retaining Wall in Chandler", stars: 5 },
        { name: "Michael Chen", text: "Our old timber wall was failing. Concrete Concepts Group replaced it with a solid, engineered wall that can handle the runoff. Very happy.", service: "Acreage Retaining Wall in Chandler", stars: 5 },
        { name: "Olivia Porter", text: "We needed a stylish wall for our new pool area. The finish is flawless and it perfectly matches our home's modern aesthetic. Highly recommend.", service: "Garden Retaining Wall in Chandler", stars: 5 },
      ],
      processSteps: ["Initial on-site consultation & soil assessment", "Detailed engineering design & quote submission", "Council approval management & certification", "Construction, backfill, and site clean-up"],
    },

  "concrete-slab-wynnum": {
      headline: "Expert Concrete Slabs in Wynnum from $65/m²",
      subheadline: "Rock-solid foundations for homes, sheds, and granny flats in Wynnum. QBCC Licensed #15299707.",
      service: "Concrete Slabs",
      benefits: [
        "Engineered for Wynnum's coastal climate, resisting salt and moisture.",
        "Perfectly level and durable foundations for new builds, sheds, and garages.",
        "Ideal for granny flats and home extensions to accommodate growing families.",
        "Increase your property value with a professionally installed, high-quality slab.",
        "We handle all council requirements for new slab constructions in the Bayside.",
        "Local expertise in Wynnum's soil conditions for a long-lasting build."
      ],
      priceFrom: "$65/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Family Owned & Operated", "15+ Years Bayside Experience"],
      urgencyLine: "New development applications in Wynnum are surging! Call 0424 463 268 to secure your project schedule.",
      testimonials: [
        { name: "Liam Wilson", text: "The team poured a perfect slab for our new garage. On time, professional, and a great price. Highly recommend them for any work in Wynnum.", service: "Garage Slab in Wynnum", stars: 5 },
        { name: "Chloe Davis", text: "We needed a solid foundation for our granny flat, and Concrete Concepts delivered. The finish was excellent, and they left the site spotless.", service: "Granny Flat Slab in Wynnum", stars: 5 },
        { name: "Ben Taylor", text: "From quote to completion, the process was seamless. Our new shed slab is exactly what we wanted. Great local Bayside business.", service: "Shed Foundation in Wynnum", stars: 5 }
      ],
      processSteps: ["On-Site Consultation & Free Quote", "Site Preparation & Earthworks", "Formwork & Steel Reinforcement", "Professional Pour & Curing"]
    },

  "concrete-slab-annerley": {
      headline: "Quality Concrete Slabs in Annerley from $65/m²",
      subheadline: "Rock-solid foundations for your Annerley home or granny flat. QBCC Licensed #15299707.",
      service: "Concrete Slabs",
      benefits: ["Engineered for Annerley's mix of classic homes and new granny flats.", "Perfectly level and compliant slabs for high-value property renovations.", "Reinforced to suit the soil conditions of Brisbane's inner-south.", "Solutions designed to add value to the $1.1M median Annerley property.", "Fast, efficient work to minimise disruption for young families and hospital workers.", "Council-compliant foundations for extensions, sheds, and secondary dwellings."],
      priceFrom: "$65/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "20+ Years Experience", "Family Owned & Operated"],
      urgencyLine: "With the granny flat boom in Annerley, our schedule is filling fast. Call 0424 463 268 to secure your project start date!",
      testimonials: [
        { name: "Liam & Sarah", text: "The team poured a perfect slab for our extension. They were professional, clean, and worked around our young family's schedule.", service: "Concrete Slab in Annerley", stars: 5 },
        { name: "Ben Carter", text: "Needed a solid foundation for my new granny flat and Concrete Concepts delivered. Great communication and a top-quality finish.", service: "Granny Flat Slab in Annerley", stars: 5 },
        { name: "Chloe F.", text: "Their attention to detail was impressive. The slab for our renovation project was flawless and passed inspection with no issues.", service: "House Slab in Annerley", stars: 5 },
      ],
      processSteps: ["Site Assessment & Free Quote", "Detailed Earthworks & Preparation", "Steel Reinforcement & Formwork", "Precision Concrete Pour & Finish"]
    },

  "concrete-slab-mt-gravatt": {
      headline: "Quality Concrete Slabs in Mt Gravatt from $65/m²",
      subheadline: "Your trusted local concreters for solid foundations in Mt Gravatt. QBCC Licensed #15299707.",
      service: "Concrete Slabs",
      benefits: ["Engineered for Mt Gravatt's established family homes, enhancing property value.", "Perfectly level and strong foundations for new garages, sheds, and home extensions.", "Compliant with all Brisbane City Council regulations for builds near Griffith University.", "Designed to suit the specific soil conditions and rolling terrain of the Mt Gravatt area.", "Precision-poured using high-strength concrete for maximum durability and longevity.", "Local expertise ensures a smooth process from excavation to the final finish."],
      priceFrom: "$65/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Family Owned & Operated", "Free, No-Obligation Quotes"],
      urgencyLine: "Secure your project schedule in Mt Gravatt! Limited spots available for the next 4 weeks.",
      testimonials: [
        {
          name: "David Wilson",
          text: "Concrete Concepts Group poured the slab for our new shed. The team was professional, efficient, and the finish was absolutely perfect. Highly recommend their work.",
          service: "Shed Slab in Mt Gravatt",
          stars: 5
        },
        {
          name: "Sarah Chen",
          text: "We needed a solid foundation for our home extension. The crew was fantastic and worked cleanly and quickly. The slab is flawless and passed inspection with no issues.",
          service: "House Slab in Mt Gravatt",
          stars: 5
        },
        {
          name: "Michael O'Connor",
          text: "From the initial quote to the final pour, the communication was excellent. They delivered a high-quality garage slab on time and on budget. Great local business.",
          service: "Garage Slab in Mt Gravatt",
          stars: 5
        }
      ],
      processSteps: ["Initial Consultation & Free Quote", "Site Preparation & Formwork", "Concrete Pour & Professional Finish", "Curing & Final Site Clean-up"]
    },

  "concrete-slab-chandler": {
      headline: "Premium Concrete Slabs in Chandler from $65/m²",
      subheadline: "Rock-solid foundations for acreage properties. Fully insured & QBCC Licensed #15299707.",
      service: "Concrete Slabs",
      benefits: [
        "Engineered for large acreage blocks and heavy machinery.",
        "Perfect for large workshop, shed, and machinery storage slabs.",
        "Stable foundations designed for Chandler's unique soil conditions.",
        "Solutions for horse properties, including stable floors and wash bays.",
        "Council-compliant designs for all residential and rural structures.",
        "Built to last, enhancing your property's functionality and value."
      ],
      priceFrom: "$65/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Chandler Acreage Specialists", "Family Owned & Operated"],
      urgencyLine: "Acreage project schedule filling fast for 2026. Call us for a free site inspection!",
      testimonials: [
        {
          name: "David Smith",
          text: "The team poured a massive slab for our new shed. It's perfectly level and handles the tractor with no issues. Great work.",
          service: "Workshop Slab in Chandler",
          stars: 5
        },
        {
          name: "Sarah Jones",
          text: "We needed a solid base for our horse stables. Concrete Concepts Group delivered exactly what we needed, on time and on budget.",
          service: "Stable Slab in Chandler",
          stars: 5
        },
        {
          name: "Michael Williams",
          text: "Our new machinery shed slab is flawless. The finish is excellent and the team was professional from start to finish. Highly recommend.",
          service: "Shed Foundation in Chandler",
          stars: 5
        }
      ],
      processSteps: ["Site Assessment & Free Quote", "Earthworks & Preparation", "Formwork & Steel Reinforcement", "Concrete Pour & Finish"]
    },

  "concrete-patio-bulimba": {
      headline: "Stunning Concrete Patios in Bulimba from $85/m²",
      subheadline: "Upgrade your riverside home's outdoor entertaining area. QBCC Licensed #15299707.",
      service: "Concrete Patios",
      benefits: ["Designed to complement Bulimba's premium outdoor entertaining culture", "Perfect for family BBQs while enjoying cool river breezes", "Adds lasting value to your riverside property", "Engineered to suit local soil conditions and Brisbane's climate", "Create the perfect alfresco space for relaxing before a stroll to Oxford Street", "Seamless finish that enhances your home's luxury aesthetic"],
      priceFrom: "$85/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Bulimba's Outdoor Living Experts", "100% Obligation-Free Quotes"],
      urgencyLine: "Booking fast for the current season! Call 0424 463 268 to secure your project timeline.",
      testimonials: [
        { name: "Jessica and Mark T.", text: "The new patio has completely transformed our backyard. The quality of work is exceptional and it's now our favourite place to relax.", service: "Concrete Patio in Bulimba", stars: 5 },
        { name: "David Chen", text: "Professional, punctual, and the final result exceeded our expectations. Our outdoor area looks like it's straight out of a magazine.", service: "Patio Extension in Bulimba", stars: 5 },
        { name: "Sophie R.", text: "We couldn't be happier with our beautiful new patio. It's perfect for entertaining and has added so much value to our home.", service: "Alfresco Patio in Bulimba", stars: 5 },
      ],
      processSteps: ["Initial consultation & free design quote", "Custom patio design and material selection", "Professional excavation and base preparation", "Concrete pour, finish, and final sealing"],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-finished_4b14e1e7.jpg", alt: "Completed smooth concrete patio by Concrete Concepts Group" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-poured-fresh_3fb4bb58.jpg", alt: "Freshly poured concrete patio slab with professional finish" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-prep-rebar_2e944823.jpg", alt: "Professional formwork and rebar preparation for patio slab" },
      ],
    },

  "concrete-patio-hawthorne": {
      headline: "Premium Concrete Patios in Hawthorne from $85/m²",
      subheadline: "Transform your outdoor living space with a bespoke concrete patio. QBCC Licensed #15299707.",
      service: "Concrete Patios",
      benefits: ["Enhance your premium Hawthorne property's value and appeal", "Designed for Hawthorne’s riverside, outdoor-focused lifestyle", "Custom finishes to complement the suburb's sophisticated character", "Perfect for entertaining after a visit to the Hawthorne Garage precinct", "Engineered for durability on local soil conditions", "Fully compliant with all Brisbane City Council requirements"],
      priceFrom: "$85/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Family Owned & Operated", "10-Year Structural Warranty"],
      urgencyLine: "Booking fast in your area! Call 0424 463 268 to secure your free on-site quote.",
      testimonials: [
        { name: "Sarah & Tom W.", text: "Concrete Concepts Group created the most beautiful patio for our Hawthorne home. The quality is exceptional and it's completely transformed our backyard.", service: "Concrete Patio in Hawthorne", stars: 5 },
        { name: "David M.", text: "The team was professional, on time, and the final result exceeded our expectations. Our new patio is perfect for entertaining guests.", service: "Patio Installation in Hawthorne", stars: 5 },
        { name: "Jessica L.", text: "From quote to completion, the process was seamless. We love our new patio and couldn't recommend them highly enough for work in the Hawthorne area.", service: "New Patio in Hawthorne", stars: 5 }
      ],
      processSteps: ["Initial Consultation & Free Quote", "Custom Design & Material Selection", "Site Preparation & Formwork", "Concrete Pour & Professional Finish"],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-poured-fresh_3fb4bb58.jpg", alt: "Freshly poured L-shaped concrete patio slab" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-finished_4b14e1e7.jpg", alt: "Completed concrete patio with smooth finish" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-prep-rebar_2e944823.jpg", alt: "Patio preparation with formwork and reinforcement mesh" },
      ],
    },

  "concrete-patio-manly": {
      headline: "Expert Concrete Patios in Manly From $85/m²",
      subheadline: "Create your dream outdoor entertaining area with a stunning, durable concrete patio. QBCC Licensed #15299707.",
      service: "Concrete Patios",
      benefits: ["Designed to withstand Manly's salty bay breezes and coastal climate", "Perfect for creating seamless, modern outdoor living and entertaining decks", "Enhances your waterfront lifestyle and complements high-value Bayside properties", "An ideal, hard-wearing solution for stunning pool areas and surrounds", "Built on Bayside soil with engineering to match local ground conditions", "Adds significant long-term value and appeal to your home"],
      priceFrom: "$85/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Family Owned & Operated", "Free, No-Obligation Quotes"],
      urgencyLine: "Limited spots available for pre-winter projects in Manly. Enquire today!",
      testimonials: [
        { name: "Liam & Chloe", text: "Our new patio is the centrepiece of our backyard. The team understood the Bayside lifestyle we wanted and delivered a perfect space for entertaining.", service: "Concrete Patio in Manly", stars: 5 },
        { name: "Ben Carter", text: "Professional, reliable, and the quality is second to none. Our patio looks fantastic and has really opened up our outdoor area by the bay.", service: "Patio Extension in Manly", stars: 5 },
        { name: "Sophie Wilson", text: "We needed a durable surface for our pool area that could handle the salt and sun. The finished patio is beautiful and practical. Highly recommended for Manly homes.", service: "Pool Patio in Manly", stars: 5 }
      ],
      processSteps: ["Initial consultation to discuss your vision and Manly property requirements", "Detailed quote and custom design proposal", "Site preparation and professional installation", "Final walkthrough and quality assurance check"],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-slab-carport_bfbe57bd.jpg", alt: "Smooth concrete slab poured at Manly bayside property" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-pour-team_bc52e91e.jpg", alt: "Our team pouring reinforced concrete at Manly Brisbane" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-finished_4b14e1e7.jpg", alt: "Completed concrete patio with smooth finish" },
      ],
    },

  "concrete-patio-balmoral": {
      headline: "Quality Concrete Patios in Balmoral from $85/m²",
      subheadline: "Transform your outdoor living space with a stunning new patio. Fully insured and QBCC Licensed #15299707.",
      service: "Concrete Patios",
      benefits: ["Enhance your Queenslander's classic charm with a modern, durable concrete patio", "Designs tailored for outdoor entertaining in Balmoral's family-friendly neighbourhoods", "Add significant value to your $1.5M+ property with a premium outdoor feature", "Expert solutions for properties on Balmoral's leafy, sometimes sloping, streets", "Seamlessly integrate your new patio with existing garden and pool areas", "Built to last, handling everything from family BBQs to quiet morning coffees"],
      priceFrom: "$85/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "20+ Years Combined Experience", "Free, No-Obligation Quotes"],
      urgencyLine: "Call 0424 463 268 now to book your free on-site quote in Balmoral!",
      testimonials: [
        { name: "Jessica M.", text: "Our new patio is the highlight of our backyard. The team from Concrete Concepts was professional, tidy, and delivered an amazing result for our Balmoral home.", service: "Concrete Patio in Balmoral", stars: 5 },
        { name: "Ben & Laura T.", text: "We couldn't be happier with the patio CCG installed. It's perfect for entertaining and has completely transformed our outdoor space. Great communication throughout the project.", service: "Patio & Walkway in Balmoral", stars: 5 },
        { name: "Michael S.", text: "A fantastic job from start to finish. They understood the look we wanted for our Queenslander renovation in Balmoral and executed it perfectly. Highly recommended.", service: "Custom Patio in Balmoral", stars: 5 }
      ],
      processSteps: ["Initial on-site consultation and free, detailed quote", "Custom patio design to suit your home and lifestyle", "Professional and efficient construction by our licensed team", "Final inspection and quality assurance walkthrough"],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-finished_4b14e1e7.jpg", alt: "Completed small concrete patio with rock retaining wall" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/patio-slab-poured-fresh_3fb4bb58.jpg", alt: "Freshly poured concrete patio with smooth finish" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-slab-carport_bfbe57bd.jpg", alt: "Professional concrete slab work by Concrete Concepts" },
      ],
    },

  "pool-surround-bulimba": {
      headline: "Resort-Style Pool Surrounds in Bulimba from $90/m²",
      subheadline: "Transform your riverside property's pool area into a stunning, safe, and low-maintenance oasis. Fully QBCC Licensed #15299707.",
      service: "Pool Surrounds",
      benefits: [
        "Boost the value of your premium Bulimba home with a flawless, high-end pool deck.",
        "Engineered for safety with certified non-slip surfaces, perfect for families.",
        "Create the ultimate resort-style backyard entertainment area for Bulimba's riverside lifestyle.",
        "Durable, salt-resistant concrete solutions designed to withstand the Brisbane climate.",
        "Custom finishes to perfectly match your home's modern or classic architectural style.",
        "Guaranteed compliance with all Brisbane City Council and local building codes for your peace of mind."
      ],
      priceFrom: "$90/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-pool-surround-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "20+ Years Experience", "Family Owned & Operated"],
      urgencyLine: "Pool season is here! Enquire now to secure your pre-summer installation date in Bulimba.",
      testimonials: [
        {
          name: "Sarah & Tom W.",
          text: "Our new pool surround is simply stunning. The team was professional, and the finish is exactly the resort-look we wanted for our Bulimba home.",
          service: "Pool Surround in Bulimba",
          stars: 5
        },
        {
          name: "Michael P.",
          text: "Safety was our biggest concern with the kids. Concrete Concepts delivered a beautiful, non-slip surface that gives us total peace of mind. Highly recommend.",
          service: "Exposed Aggregate Pool Surround in Bulimba",
          stars: 5
        },
        {
          name: "Jessica N.",
          text: "From quote to completion, the process was seamless. They understood the high-end look we were after and absolutely nailed it. Our backyard has been transformed.",
          service: "Honed Concrete Pool Deck in Bulimba",
          stars: 5
        }
      ],
      processSteps: ["Initial on-site consultation & quote in Bulimba", "Custom design & material selection", "Professional excavation & preparation", "Expert concrete pour & finishing"]
    },

  "pool-surround-ascot": {
      headline: "Luxury Pool Surrounds in Ascot from $90/m²",
      subheadline: "Premium pool surrounds for Ascot's finest properties. QBCC Licensed #15299707. Call 0424 463 268 for a free design consultation.",
      service: "Pool Surrounds",
      benefits: ["Resort-style finishes that complement Ascot's grand homes and luxury gardens", "Non-slip, salt-resistant surfaces engineered for Queensland's pool-friendly climate", "Custom aggregate and colour options to match your property's premium aesthetic", "Proper drainage engineering to protect your investment from Brisbane's heavy rainfall", "Enhance your property value in a suburb with a $2.6M median house price", "Expert installation around existing pools — minimal disruption to your lifestyle"],
      priceFrom: "$90/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-pool-surround-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Ascot & Hamilton Pool Specialists", "Premium Finishes Guaranteed"],
      urgencyLine: "Limited availability for Ascot pool projects this season — secure your consultation today",
      testimonials: [
        { name: "Victoria M.", text: "The pool surround has completely transformed our backyard into a resort. The exposed aggregate finish is stunning and safe for the kids.", service: "Exposed Aggregate Pool Surround in Ascot", stars: 5 },
        { name: "James H.", text: "Professional from start to finish. They worked around our existing landscaping and the result exceeded our expectations. Worth every cent.", service: "Luxury Pool Deck in Ascot", stars: 5 },
        { name: "Catherine W.", text: "We chose the premium stone blend and it looks incredible. Non-slip, easy to maintain, and perfectly complements our home.", service: "Pool Surround Renovation in Ascot", stars: 5 },
      ],
      processSteps: ["Free on-site design consultation & stone selection", "Site preparation & drainage engineering", "Concrete poured with your chosen premium finish", "Sealed, cured & ready to enjoy"],
    },

  "pool-surround-manly": {
      headline: "Expert Pool Surrounds in Manly from $90/m²",
      subheadline: "Transform your Bayside oasis with a stunning, salt-resistant pool deck. QBCC Licensed #15299707.",
      service: "Pool Surrounds",
      benefits: ["Engineered to withstand Manly's salty bay breezes for long-lasting quality", "Create a safe, non-slip surface perfect for family fun and poolside safety", "Enhance your outdoor living and embrace the relaxed Bayside lifestyle", "Perfectly complements Manly's strong pool culture and prestigious homes", "Boost your property's value in the competitive $1.6M median market", "Hassle-free installation tailored to Manly's unique coastal environment"],
      priceFrom: "$90/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-pool-surround-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "20+ Years Local Experience", "Family Owned & Operated"],
      urgencyLine: "Ready for summer? Book your free Manly onsite quote today!",
      testimonials: [
        { name: "David & Sarah W.", text: "Our new pool area is just stunning. The team from Concrete Concepts understood the Bayside look we wanted and delivered a beautiful, salt-resistant finish. Highly recommend!", service: "Pool Surrounds in Manly", stars: 5 },
        { name: "Michael B.", text: "Professional, on time, and the quality is second to none. Our Manly home's outdoor space has been completely transformed. The kids love the new non-slip surface.", service: "Pool Deck Resurfacing in Manly", stars: 5 },
        { name: "Jessica P.", text: "From the initial quote to the final clean-up, the process was seamless. They created the perfect pool surround to match our bay lifestyle. It's both beautiful and practical.", service: "New Pool Surround in Manly", stars: 5 },
      ],
      processSteps: ["1. Free Onsite Consultation & Quote in Manly", "2. Custom Design & Salt-Resistant Material Selection", "3. Professional, Efficient Installation & Site Management", "4. Final Handover & Quality Guarantee"],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-slab-carport_bfbe57bd.jpg", alt: "Professional concrete work at Manly Brisbane bayside" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-pour-team_bc52e91e.jpg", alt: "Concrete Concepts team working on Manly project" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/logan-exposed-aggregate-driveway_6d51814c.jpg", alt: "Exposed aggregate finish — perfect for pool surrounds" },
      ],
    },

  "pool-surround-chandler": {
      headline: "Luxury Pool Surrounds in Chandler from $90/m²",
      subheadline: "Transform your Chandler oasis with stunning, durable concrete pool surrounds from Concrete Concepts Group, your fully QBCC Licensed (#15299707) specialists.",
      service: "Pool Surrounds",
      benefits: ["Designs that complement Chandler's luxury acreage and resort-style living.", "Engineered for the specific soil conditions of large Chandler properties.", "Seamless integration with your existing tennis court and outdoor entertainment areas.", "Enhance your property's $2.4M median value with a premium finish.", "Brisbane City Council compliant designs for a hassle-free installation.", "Durable, low-maintenance surfaces perfect for the Queensland lifestyle."],
      priceFrom: "$90/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-pool-surround-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Family Owned & Operated", "Serving Chandler & Surrounds"],
      urgencyLine: "Limited spots available for pre-summer installation. Call 0424 463 268 for a free quote today!",
      testimonials: [
        { name: "David & Sarah Jones", text: "Our new pool area is the envy of our friends. The team from Concrete Concepts delivered a flawless finish that perfectly matches our Chandler home's aesthetic.", service: "Pool Surround in Chandler", stars: 5 },
        { name: "Michael Chen", text: "From the initial quote to the final clean-up, the professionalism was outstanding. Our resort-style pool in Chandler finally has the surround it deserves.", service: "Exposed Aggregate Pool Surround in Chandler", stars: 5 },
        { name: "Emily Williams", text: "We needed a durable and stylish solution for the area around our tennis court and pool. Concrete Concepts provided a beautiful, non-slip surface that has transformed our outdoor living space.", service: "Pool & Tennis Court Surround in Chandler", stars: 5 },
      ],
      processSteps: ["Initial on-site consultation & detailed quote.", "Custom design to match your home's luxury style.", "Expert excavation, formwork, and steel reinforcement.", "Professional concrete pour, finish, and site clean-up."],
    },

  "excavation-logan": {
      headline: "Expert Excavation in Logan from $80/hr",
      subheadline: "Site clearing and land levelling for new builds across the Logan growth corridor. QBCC Licensed #15299707.",
      service: "Excavation",
      benefits: ["Precision site cuts for new homes in Yarrabilba and Flagstone.", "Bulk earthworks specialists for Logan’s varied soil profiles.", "Land levelling perfectly suited for the Park Ridge development boom.", "Efficiently navigate Logan City Council site requirements.", "Equipped for large-scale clearing in the expanding growth corridor.", "Foundation prep that accounts for Logan's mix of clay and reactive soils."],
      priceFrom: "$80/hr",
      heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/excavator-work-1_99a98a3d.jpg",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Logan Growth Corridor Specialists", "Free, No-Obligation Quotes"],
      urgencyLine: "Booking fast for Yarrabilba & Flagstone projects! Call 0424 463 268 to secure your spot.",
      testimonials: [
        { name: "Mark & Sarah H.", text: "The team cleared our sloping block in Yarrabilba perfectly. Their operators are true professionals and made the whole process stress-free.", service: "Site Clearing in Logan", stars: 5 },
        { name: "David Chen", text: "We needed a level pad for our new build in Flagstone. Concrete Concepts Group were fast, efficient, and their quote was spot on. Highly recommend.", service: "Land Levelling in Logan", stars: 5 },
        { name: "Jessica P.", text: "Getting our Park Ridge property ready for construction was a huge job. Their excavation work was top-notch and set us up for a smooth build.", service: "Bulk Excavation in Logan", stars: 5 }
      ],
      processSteps: ["Initial Site Assessment & Free Quote", "Detailed Earthworks & Clearing Plan", "Precision Excavation & Levelling", "Final Site Tidy & Handover"],
      galleryImages: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/logan-exposed-aggregate-driveway_6d51814c.jpg", alt: "Finished exposed aggregate driveway in Logan by Concrete Concepts" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/manly-concrete-pour-team_bc52e91e.jpg", alt: "Concrete Concepts crew pouring concrete with rebar reinforcement" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/the-gap-concrete-slab_e8c1d11a.jpg", alt: "Large concrete slab pour at The Gap Brisbane" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/the-gap-excavation-prep_a1caa70f.jpg", alt: "Mini excavator site preparation for concrete slab Brisbane" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/commercial-slab-pour_264779c3.jpg", alt: "Large commercial concrete slab pour Brisbane" },
      ],
    },

  "excavation-north-lakes": {
      headline: "Expert Excavation in North Lakes from $80/hr",
      subheadline: "Your trusted local experts for site preparation and land clearing in North Lakes' new developments. Fully insured and QBCC Licensed #15299707.",
      service: "Excavation",
      benefits: ["Specialists in site cuts for new homes in North Lakes' booming developments.", "Efficient land clearing perfect for the flat terrain of the Moreton Bay region.", "Expert navigation of Moreton Bay City Council regulations for seamless project approval.", "Precision excavation that respects the local environment and community aesthetic.", "Foundation prep for properties in the $750K median price range, ensuring long-term stability.", "Fast, reliable service to keep your North Lakes building project on schedule and on budget."],
      priceFrom: "$80/hr",
      heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/excavator-work-1_99a98a3d.jpg",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Moreton Bay Region Specialists", "Over 15 Years Experience"],
      urgencyLine: "North Lakes is developing fast! Lock in your excavation quote today to avoid delays.",
      testimonials: [
        { name: "Liam & Chloe", text: "The Concrete Concepts team did a fantastic job with the site cut for our new build. They were professional, efficient, and knew exactly what they were doing.", service: "Site Cut in North Lakes", stars: 5 },
        { name: "Barry Jones", text: "Needed some land cleared for a new shed. The guys were in and out in a day, left the place tidy. Couldn't be happier with the service.", service: "Land Clearing in North Lakes", stars: 5 },
        { name: "Sarah Chen", text: "Their attention to detail during the excavation was impressive. They worked carefully around existing structures and delivered a perfect result for our foundation.", service: "Excavation in North Lakes", stars: 5 },
      ],
      processSteps: ["Initial site assessment and free quote.", "Detailed planning and council approvals.", "Precision excavation and site clearing.", "Final inspection and site handover."],
    },

  "crossover-springfield": {
      headline: "Expert Council Crossovers in Springfield from $70/m²",
      subheadline: "Built to strict BCC standards for new estates. QBCC Licensed #15299707.",
      service: "Crossovers",
      benefits: ["Navigate Springfield's new estate requirements with ease—we handle all BCC council crossover applications.", "Engineered for the specific soil conditions of the Springfield corridor, ensuring long-term stability.", "Perfectly match the modern aesthetic of your new build in Springfield Central or surrounding estates.", "Add lasting value to your property with a professionally constructed, fully compliant vehicle crossover.", "Seamless integration with existing kerb and channel, maintaining the high standard of your streetscape.", "Fast, efficient service to keep your new home build on schedule without costly council delays."],
      priceFrom: "$70/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Springfield Council Crossover Specialists", "10+ Years Local Experience"],
      urgencyLine: "Council requirements are always updating. Lock in your compliant crossover at today's price!",
      testimonials: [
        { name: "Liam & Chloe", text: "Concrete Concepts made the crossover for our new build in Springfield Lakes so simple. They handled the council side and the finish is flawless.", service: "Council Crossover in Springfield Lakes", stars: 5 },
        { name: "Ben Mitchell", text: "The team was professional and efficient. Our new crossover looks fantastic and passed the council inspection first go. A huge relief.", service: "New Build Crossover in Augustine Heights", stars: 5 },
        { name: "Sarah Jenkins", text: "We needed a crossover for our corner block in Springfield Central. The guys at Concrete Concepts knew the exact BCC specs and got it done fast. Highly recommend.", service: "Vehicle Crossover in Springfield Central", stars: 5 }
      ],
      processSteps: ["Initial on-site consultation & free quote in Springfield.", "We manage the full BCC council application and approval process.", "Precise excavation and formwork preparation to council specification.", "Pouring high-strength 32MPa concrete for a durable, compliant finish."]
    },

  "crossover-ipswich": {
      headline: "Council-Compliant Crossovers in Ipswich from $70/m²",
      subheadline: "Expertly constructed crossovers for new builds in Ripley Valley and Redbank Plains. QBCC Licensed #15299707.",
      service: "Crossovers",
      benefits: ["Built to strict Ipswich City Council specifications for guaranteed compliance", "Perfect for new homes in the Ripley Valley and Redbank Plains growth areas", "Engineered for the specific soil conditions of the Ipswich growth corridor", "Adds significant street appeal and value to your new property investment", "Durable construction designed to handle daily vehicle access for decades", "Seamless integration with your new driveway and property landscaping"],
      priceFrom: "$70/m²",
      heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
      trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Ipswich Council Crossover Specialists", "Fully Insured & Workmanship Guaranteed"],
      urgencyLine: "Booking fast! Secure your crossover construction for your new Ipswich build today.",
      testimonials: [
        {
          name: "Liam & Chloe",
          text: "Concrete Concepts handled our crossover in Redbank Plains perfectly. They knew the council rules and made the whole process stress-free for our new build.",
          service: "Crossover in Ipswich",
          stars: 5
        },
        {
          name: "Mark T.",
          text: "The team did a fantastic job on our Ripley Valley property. The crossover looks great and passed the council inspection first go. Highly recommend.",
          service: "Crossover in Ipswich",
          stars: 5
        },
        {
          name: "Brenda S.",
          text: "Professional, on time, and the quality of work is top-notch. They made getting our crossover sorted in Ipswich so easy.",
          service: "Crossover in Ipswich",
          stars: 5
        }
      ],
      processSteps: ["Site assessment and council compliance check", "Detailed, fixed-price quote and timeline", "Professional excavation and formwork setup", "Council-approved concrete pour and finish"]
    },
  "concrete-driveway-pimpama": {
    headline: "New Concrete Driveway in Pimpama from $75/m²",
    subheadline: "Purpose-built for Pimpama's new estates. QBCC Licensed #15299707. Free quotes — call 0424 463 268.",
    service: "Concrete Driveway",
    benefits: [
      "Engineered for Pimpama's sandy clay soils — proper base prep prevents future cracking.",
      "Designed to complement modern estate homes in Gainsborough Greens, Pimpama City, and Ormeau Ridge.",
      "Council-compliant crossovers and driveways meeting Gold Coast City Council standards.",
      "Fast turnaround for new builds — we coordinate with your builder's timeline.",
      "Choose from plain, coloured, or exposed aggregate finishes to match your new home.",
      "Hard-wearing surface built to handle Queensland's heat and heavy rain.",
    ],
    priceFrom: "75",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Family Owned & Operated", "Pimpama Projects Completed"],
    urgencyLine: "Pimpama bookings filling fast — secure your spot today!",
    testimonials: [
      { name: "Jake & Mel", text: "Just moved into our new build in Gainsborough Greens and needed a driveway ASAP. Concrete Concepts were quick, professional, and the result is perfect.", service: "New Build Driveway in Pimpama", stars: 5 },
      { name: "Chris T.", text: "Great price for a quality driveway. They understood the soil conditions in Pimpama and prepped the base properly. Very happy with the result.", service: "Concrete Driveway in Pimpama", stars: 5 },
      { name: "Rachel S.", text: "We compared three quotes and Concrete Concepts offered the best value. The driveway looks amazing and was done in two days. Highly recommend!", service: "Coloured Concrete Driveway in Pimpama", stars: 5 },
    ],
    processSteps: ["Free on-site quote at your Pimpama property", "Site preparation and base compaction for local soil", "Formwork, reinforcement and concrete pour", "Finishing, curing and protective sealing"],
  },

  "concrete-driveway-upper-coomera": {
    headline: "Concrete Driveways Upper Coomera — From $75/m²",
    subheadline: "Built for Upper Coomera's growing estates. QBCC Licensed #15299707. Free no-obligation quotes.",
    service: "Concrete Driveway",
    benefits: [
      "Specialist in Upper Coomera's new estate driveways — Coomera Springs, The Surrounds, Highland Reserve.",
      "Engineered base preparation for the area's variable soil conditions.",
      "Seamless coordination with builders for new home driveway installations.",
      "Wide range of finishes — plain, coloured, stencilled, or exposed aggregate.",
      "Council-compliant crossovers meeting Gold Coast City Council requirements.",
      "Built to withstand heavy use and Queensland's extreme weather conditions.",
    ],
    priceFrom: "75",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Gold Coast & Brisbane Coverage", "500+ Projects Completed"],
    urgencyLine: "Upper Coomera slots are limited this month — book your free quote now!",
    testimonials: [
      { name: "Matt & Lisa", text: "Fantastic driveway for our new home in Coomera Springs. The team were professional from quote to completion. Would use again without hesitation.", service: "New Build Driveway in Upper Coomera", stars: 5 },
      { name: "Steve H.", text: "Needed a wide driveway for our dual-cab and boat trailer. Concrete Concepts designed it perfectly and the finish is top quality.", service: "Wide Concrete Driveway in Upper Coomera", stars: 5 },
      { name: "Tanya M.", text: "Quick, clean, and affordable. Our coloured concrete driveway looks incredible and really lifts the whole front of the house.", service: "Coloured Driveway in Upper Coomera", stars: 5 },
    ],
    processSteps: ["Free on-site consultation at your Upper Coomera property", "Professional excavation and base preparation", "Formwork, steel reinforcement and concrete pour", "Finishing, control joints, curing and sealing"],
  },

  "concrete-driveway-rochedale": {
    headline: "Premium Concrete Driveways in Rochedale from $80/m²",
    subheadline: "Quality driveways for Rochedale's premium estates. QBCC Licensed #15299707. Free quotes.",
    service: "Concrete Driveway",
    benefits: [
      "Premium finishes to match Rochedale Estates' high-end homes and streetscapes.",
      "Engineered for Rochedale's clay soils — deep base preparation prevents movement.",
      "Exposed aggregate and decorative options that complement modern architectural designs.",
      "Steep driveway specialists — many Rochedale blocks have significant slope.",
      "Brisbane City Council compliant with all required permits handled.",
      "Adds significant value to properties in one of Brisbane's fastest-growing suburbs.",
    ],
    priceFrom: "80",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Premium Finish Specialists", "Rochedale Projects Completed"],
    urgencyLine: "Rochedale bookings are in high demand — call today for a free quote!",
    testimonials: [
      { name: "Andrew & Kate", text: "Our steep driveway in Rochedale Estates was a challenge but Concrete Concepts handled it perfectly. The exposed aggregate finish is stunning.", service: "Steep Driveway in Rochedale", stars: 5 },
      { name: "Simon P.", text: "Premium quality work at a fair price. The driveway matches our new home beautifully. Professional team from start to finish.", service: "Exposed Aggregate Driveway in Rochedale", stars: 5 },
      { name: "Jenny L.", text: "We're so happy with our new driveway. It completely transformed the front of our home. The team were punctual, tidy, and very skilled.", service: "Concrete Driveway in Rochedale", stars: 5 },
    ],
    processSteps: ["Free on-site assessment of your Rochedale property", "Detailed quote with finish options and engineering specs", "Professional excavation, formwork and reinforced pour", "Premium finishing, curing and protective sealing"],
  },

  "concrete-driveway-mango-hill": {
    headline: "Concrete Driveways Mango Hill — From $75/m²",
    subheadline: "Trusted concreters for Mango Hill and North Lakes estates. QBCC Licensed #15299707.",
    service: "Concrete Driveway",
    benefits: [
      "Experienced in Mango Hill's estate requirements — Capestone, Mango Hill Rise, and surrounds.",
      "Proper base preparation for the area's reactive soils prevents long-term cracking.",
      "Fast completion times — most driveways finished in 2-3 days.",
      "Wide range of colours and finishes to complement your home's design.",
      "Moreton Bay Regional Council compliant crossovers and driveways.",
      "Competitive pricing with no hidden costs — fixed-price quotes guaranteed.",
    ],
    priceFrom: "75",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Moreton Bay Specialists", "Family Owned & Operated"],
    urgencyLine: "Mango Hill spots filling fast — get your free quote before they're gone!",
    testimonials: [
      { name: "Paul & Amy", text: "Replaced our old driveway in Capestone. The new coloured concrete looks fantastic and the team were great to deal with.", service: "Driveway Replacement in Mango Hill", stars: 5 },
      { name: "Daniel K.", text: "Quick and professional. Our new build driveway was done in two days and looks perfect. Great communication throughout.", service: "New Build Driveway in Mango Hill", stars: 5 },
      { name: "Samantha R.", text: "Best quote we received and the quality exceeded our expectations. The driveway and path look amazing. Highly recommend!", service: "Driveway & Path in Mango Hill", stars: 5 },
    ],
    processSteps: ["Free on-site quote at your Mango Hill property", "Site prep and base compaction for local conditions", "Formwork, reinforcement and concrete pour", "Finishing, control joints and protective sealing"],
  },

  "concrete-driveway-thornlands": {
    headline: "Concrete Driveways Thornlands — From $75/m²",
    subheadline: "Quality driveways for Thornlands and the Redlands. QBCC Licensed #15299707. Free quotes.",
    service: "Concrete Driveway",
    benefits: [
      "Experienced in Thornlands' established and new-build properties alike.",
      "Engineered for Redlands soil conditions — proper drainage and base prep included.",
      "Choose from plain, coloured, exposed aggregate, or stencilled finishes.",
      "Driveway replacements for older Thornlands homes — remove and replace in 3-4 days.",
      "Redland City Council compliant with all crossover requirements handled.",
      "Competitive Redlands pricing with fixed-price, no-surprise quotes.",
    ],
    priceFrom: "75",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Redlands Specialists", "100% Brisbane Locals"],
    urgencyLine: "Thornlands bookings are filling up — secure your free quote today!",
    testimonials: [
      { name: "Greg & Sue", text: "Our old cracked driveway in Thornlands has been completely transformed. The exposed aggregate finish is beautiful. Excellent service.", service: "Driveway Replacement in Thornlands", stars: 5 },
      { name: "Mark W.", text: "Professional team who delivered exactly what they promised. The driveway and crossover look great and were done on time.", service: "Driveway & Crossover in Thornlands", stars: 5 },
      { name: "Karen P.", text: "We love our new driveway! It's made such a difference to our home's street appeal. Fair price and quality workmanship.", service: "Coloured Concrete Driveway in Thornlands", stars: 5 },
    ],
    processSteps: ["Free on-site quote at your Thornlands property", "Old driveway removal and site preparation", "Formwork, reinforcement and concrete pour", "Finishing, curing and protective sealing"],
  },

  "exposed-aggregate-pimpama": {
    headline: "Exposed Aggregate Pimpama — Premium Finish from $100/m²",
    subheadline: "Stunning stone finishes for Pimpama's modern homes. QBCC Licensed #15299707.",
    service: "Exposed Aggregate",
    benefits: [
      "The most popular upgrade in Pimpama's new estates — beautiful natural stone textures.",
      "Non-slip surface perfect for pool areas, driveways, and outdoor entertaining.",
      "Multiple stone colour options to complement your home's exterior palette.",
      "UV-stable and heat-resistant — stays cool underfoot in Queensland's summer.",
      "Low maintenance — just occasional pressure washing keeps it looking new.",
      "Adds premium value to your Pimpama property with lasting street appeal.",
    ],
    priceFrom: "100",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Exposed Aggregate Specialists", "Pimpama Projects Completed"],
    urgencyLine: "Premium aggregate bookings for Pimpama are limited — call now!",
    testimonials: [
      { name: "Nicole & James", text: "The exposed aggregate driveway and path at our Gainsborough Greens home look incredible. It's the best-looking driveway in our street!", service: "Exposed Aggregate Driveway in Pimpama", stars: 5 },
      { name: "Tony R.", text: "We chose exposed aggregate for our pool area and couldn't be happier. Non-slip, beautiful, and the team were fantastic.", service: "Exposed Aggregate Pool Surround in Pimpama", stars: 5 },
      { name: "Laura B.", text: "From quote to completion, the process was seamless. The aggregate finish on our patio is stunning. Highly recommend for anyone in Pimpama.", service: "Exposed Aggregate Patio in Pimpama", stars: 5 },
    ],
    processSteps: ["Free on-site consultation with stone colour selection", "Site preparation and formwork setup", "Concrete pour with premium aggregate mix", "High-pressure wash to expose stone and protective sealing"],
  },

  "exposed-aggregate-upper-coomera": {
    headline: "Exposed Aggregate Upper Coomera — From $100/m²",
    subheadline: "Premium stone finishes for Upper Coomera homes. QBCC Licensed #15299707. Free quotes.",
    service: "Exposed Aggregate",
    benefits: [
      "Transform your Upper Coomera home with a premium exposed aggregate finish.",
      "Perfect for driveways, pool surrounds, patios, and entertaining areas.",
      "Multiple stone blends — warm earth tones, coastal greys, or classic charcoal.",
      "Non-slip surface rated for pool areas and wet conditions.",
      "Engineered for Upper Coomera's soil and climate conditions.",
      "The most requested upgrade in Upper Coomera's growing estates.",
    ],
    priceFrom: "100",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Gold Coast Coverage", "Premium Finish Experts"],
    urgencyLine: "Upper Coomera aggregate bookings filling fast — get your free quote!",
    testimonials: [
      { name: "Ben & Sarah", text: "Our exposed aggregate driveway in The Surrounds is the talk of the neighbourhood. Absolutely love the warm stone tones.", service: "Exposed Aggregate Driveway in Upper Coomera", stars: 5 },
      { name: "Michael D.", text: "Had the pool area and back patio done in exposed aggregate. Looks amazing and feels great underfoot. Professional job all round.", service: "Pool & Patio Aggregate in Upper Coomera", stars: 5 },
      { name: "Kylie F.", text: "The team were punctual, clean, and the result speaks for itself. Our front entrance and driveway look like a display home now.", service: "Driveway & Entrance in Upper Coomera", stars: 5 },
    ],
    processSteps: ["Free consultation with aggregate colour samples", "Professional site preparation and formwork", "Concrete pour with selected aggregate blend", "Wash, expose stone and apply protective sealant"],
  },

  "exposed-aggregate-rochedale": {
    headline: "Exposed Aggregate Rochedale — Premium Finish from $110/m²",
    subheadline: "High-end aggregate finishes for Rochedale's premium homes. QBCC Licensed #15299707.",
    service: "Exposed Aggregate",
    benefits: [
      "Premium aggregate blends to match Rochedale Estates' high-end architectural styles.",
      "Steep driveway specialists — exposed aggregate provides excellent grip on slopes.",
      "Custom colour matching to complement your home's facade and landscaping.",
      "Perfect for the large outdoor entertaining areas common in Rochedale homes.",
      "UV-stable finish that maintains its beauty in Brisbane's harsh sun.",
      "Adds significant value to properties in one of Brisbane's most sought-after suburbs.",
    ],
    priceFrom: "110",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Premium Aggregate Specialists", "Rochedale Experts"],
    urgencyLine: "Premium Rochedale bookings are in high demand — call today!",
    testimonials: [
      { name: "David & Michelle", text: "The exposed aggregate on our steep Rochedale driveway is both beautiful and practical. The grip is excellent in wet weather. Outstanding work.", service: "Steep Aggregate Driveway in Rochedale", stars: 5 },
      { name: "Richard K.", text: "We wanted a premium look for our new Rochedale home. The charcoal aggregate blend is exactly what we envisioned. Five-star service.", service: "Premium Aggregate in Rochedale", stars: 5 },
      { name: "Amanda T.", text: "Our outdoor entertaining area in exposed aggregate is stunning. It ties the whole backyard together perfectly. Couldn't be happier.", service: "Aggregate Patio in Rochedale", stars: 5 },
    ],
    processSteps: ["On-site consultation with premium colour selection", "Detailed engineering assessment for slope and drainage", "Professional pour with premium aggregate blend", "Expert wash, stone exposure and multi-coat sealing"],
  },

  "concrete-slab-pimpama": {
    headline: "Concrete Slabs Pimpama — Shed & House Slabs from $65/m²",
    subheadline: "Engineered slabs for Pimpama's new builds. QBCC Licensed #15299707. Free quotes.",
    service: "Concrete Slab",
    benefits: [
      "Shed slabs, garage floors, and house extensions for Pimpama's growing estates.",
      "Engineered to meet structural requirements for Pimpama's soil conditions.",
      "Fast turnaround — most shed slabs completed in 1-2 days.",
      "Coordination with builders and shed companies for seamless installation.",
      "All sizes from small garden sheds to large workshops and granny flats.",
      "Properly reinforced with steel mesh and rebar for long-term durability.",
    ],
    priceFrom: "65",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Slab Specialists", "Pimpama Projects Completed"],
    urgencyLine: "Pimpama slab bookings filling fast — get your free quote today!",
    testimonials: [
      { name: "Brett M.", text: "Needed a shed slab for my new Pimpama property. Concrete Concepts were the most competitive quote and the slab is perfect. Level, smooth, and done in a day.", service: "Shed Slab in Pimpama", stars: 5 },
      { name: "Jason & Tina", text: "Had a granny flat slab poured at our Gainsborough Greens home. The team were professional and the slab was ready ahead of schedule.", service: "Granny Flat Slab in Pimpama", stars: 5 },
      { name: "Craig D.", text: "Large workshop slab done to spec. The team handled the engineering requirements and council paperwork. Couldn't ask for more.", service: "Workshop Slab in Pimpama", stars: 5 },
    ],
    processSteps: ["Free on-site measure and quote", "Excavation and base preparation", "Formwork, steel reinforcement and concrete pour", "Finishing, curing and handover"],
  },

  "concrete-slab-upper-coomera": {
    headline: "Concrete Slabs Upper Coomera — From $65/m²",
    subheadline: "Shed slabs, garage floors & extensions. QBCC Licensed #15299707. Free quotes.",
    service: "Concrete Slab",
    benefits: [
      "Purpose-built slabs for Upper Coomera's new homes — sheds, garages, and extensions.",
      "Engineered for local soil conditions with proper compaction and drainage.",
      "Fast completion — most residential slabs done in 1-2 days.",
      "We coordinate with shed companies and builders for seamless project flow.",
      "All sizes from 3x3m garden sheds to 12x9m workshops.",
      "Properly reinforced to Australian Standards with engineer certification available.",
    ],
    priceFrom: "65",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Gold Coast Coverage", "500+ Slabs Poured"],
    urgencyLine: "Upper Coomera slab spots are limited — book your free quote now!",
    testimonials: [
      { name: "Nathan B.", text: "Great shed slab at a fair price. The team were on time, professional, and the finish is perfect. My shed company said it was the best slab they'd seen.", service: "Shed Slab in Upper Coomera", stars: 5 },
      { name: "Peter & Jane", text: "Had a large garage slab poured for our Upper Coomera home. Excellent communication and the result is spot on. Highly recommend.", service: "Garage Slab in Upper Coomera", stars: 5 },
      { name: "Wayne T.", text: "Needed a slab for a granny flat extension. Concrete Concepts handled everything including the engineering. Smooth process from start to finish.", service: "Extension Slab in Upper Coomera", stars: 5 },
    ],
    processSteps: ["Free on-site measure and detailed quote", "Excavation, compaction and drainage setup", "Formwork, steel reinforcement and pour", "Finishing, control joints and curing"],
  },

  "concrete-slab-narangba": {
    headline: "Concrete Slabs Narangba — Shed & Workshop Slabs from $65/m²",
    subheadline: "Acreage and residential slabs for Narangba. QBCC Licensed #15299707.",
    service: "Concrete Slab",
    benefits: [
      "Specialist in Narangba's acreage and residential slab requirements.",
      "Large workshop and machinery shed slabs for rural-residential properties.",
      "Engineered for Moreton Bay's soil conditions with proper site preparation.",
      "Granny flat and extension slabs with council compliance handled.",
      "Fast turnaround — we understand Narangba homeowners want things done efficiently.",
      "Competitive pricing for the Moreton Bay region with no hidden costs.",
    ],
    priceFrom: "65",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Moreton Bay Specialists", "Acreage Property Experts"],
    urgencyLine: "Narangba slab bookings filling up — get your free quote today!",
    testimonials: [
      { name: "Dave R.", text: "Large workshop slab on our acreage in Narangba. The team handled the bigger site with ease. Level, smooth, and exactly what we needed.", service: "Workshop Slab in Narangba", stars: 5 },
      { name: "Scott & Michelle", text: "Shed slab done quickly and professionally. They worked around our existing landscaping and left the site clean. Great job.", service: "Shed Slab in Narangba", stars: 5 },
      { name: "Linda K.", text: "Granny flat slab with all the engineering sorted. Concrete Concepts made the whole process easy. Very happy with the result.", service: "Granny Flat Slab in Narangba", stars: 5 },
    ],
    processSteps: ["Free on-site measure and quote for your Narangba property", "Site clearing, excavation and base compaction", "Formwork, reinforcement and engineered pour", "Finishing, curing and final inspection"],
  },

  "concrete-slab-bellbird-park": {
    headline: "Concrete Slabs Bellbird Park — From $65/m²",
    subheadline: "Shed slabs and house extensions for Bellbird Park. QBCC Licensed #15299707.",
    service: "Concrete Slab",
    benefits: [
      "Shed, garage, and extension slabs for Bellbird Park's growing community.",
      "Engineered for Ipswich region soil conditions — reactive clay specialists.",
      "New build slab coordination with builders and shed companies.",
      "All sizes from small garden sheds to large double garages and workshops.",
      "Ipswich City Council compliant with all requirements handled.",
      "Competitive Ipswich pricing with fixed-price, no-surprise quotes.",
    ],
    priceFrom: "65",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-slab-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Ipswich Region Specialists", "Family Owned & Operated"],
    urgencyLine: "Bellbird Park slab spots limited — book your free quote now!",
    testimonials: [
      { name: "Tom & Sarah", text: "Needed a shed slab for our new Bellbird Park home. Concrete Concepts were the best price and the quality was excellent. Done in one day.", service: "Shed Slab in Bellbird Park", stars: 5 },
      { name: "Gary H.", text: "Workshop slab on reactive clay soil. The team knew exactly how to prep the site for Ipswich conditions. Rock solid result.", service: "Workshop Slab in Bellbird Park", stars: 5 },
      { name: "Emma J.", text: "Extension slab for our granny flat. Professional, on time, and the slab is perfectly level. Would recommend to anyone in Bellbird Park.", service: "Extension Slab in Bellbird Park", stars: 5 },
    ],
    processSteps: ["Free on-site measure and quote", "Excavation and reactive soil preparation", "Formwork, steel reinforcement and pour", "Finishing, control joints and curing"],
  },

  "retaining-wall-rochedale": {
    headline: "Retaining Walls Rochedale — Engineered Solutions from $180/m²",
    subheadline: "Expert retaining walls for Rochedale's sloping blocks. QBCC Licensed #15299707.",
    service: "Retaining Wall",
    benefits: [
      "Specialist in Rochedale's hilly terrain — engineered retaining solutions for steep blocks.",
      "Create usable flat areas for gardens, pools, and outdoor entertaining on sloping land.",
      "Concrete, besser block, and timber options to suit your design and budget.",
      "Structural engineering certification included for walls over 1 metre.",
      "Brisbane City Council compliant with all permit requirements handled.",
      "Protect your Rochedale investment — proper retaining prevents erosion and land movement.",
    ],
    priceFrom: "180",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-retaining-wall-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Structural Engineering Included", "Rochedale Slope Specialists"],
    urgencyLine: "Rochedale retaining wall bookings in high demand — call today!",
    testimonials: [
      { name: "James & Helen", text: "Our steep Rochedale block needed serious retaining work. Concrete Concepts engineered a solution that created a beautiful flat backyard. Incredible transformation.", service: "Engineered Retaining Wall in Rochedale", stars: 5 },
      { name: "Peter S.", text: "Two-tier retaining wall system that turned our unusable slope into a terraced garden. Professional engineering and beautiful finish.", service: "Tiered Retaining Walls in Rochedale", stars: 5 },
      { name: "Diana L.", text: "The retaining wall along our boundary is both functional and attractive. It's solved our drainage issues and looks great. Excellent work.", service: "Boundary Retaining Wall in Rochedale", stars: 5 },
    ],
    processSteps: ["Free on-site assessment and engineering consultation", "Structural design and council approval (if required)", "Excavation, footings and wall construction", "Drainage installation, backfill and landscaping prep"],
  },

  "retaining-wall-narangba": {
    headline: "Retaining Walls Narangba — From $150/m²",
    subheadline: "Engineered retaining walls for Narangba properties. QBCC Licensed #15299707.",
    service: "Retaining Wall",
    benefits: [
      "Expert retaining solutions for Narangba's undulating terrain and acreage blocks.",
      "Create level areas for sheds, pools, and outdoor living on sloping land.",
      "Concrete, besser block, and treated timber options available.",
      "Engineering certification included for walls requiring structural approval.",
      "Moreton Bay Regional Council compliant with all permit requirements.",
      "Proper drainage systems to manage water flow and protect your property.",
    ],
    priceFrom: "150",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-retaining-wall-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Moreton Bay Specialists", "Engineering Included"],
    urgencyLine: "Narangba retaining wall spots filling — book your free quote!",
    testimonials: [
      { name: "Rob & Karen", text: "Needed a large retaining wall on our acreage to create a flat pad for our new shed. Concrete Concepts handled the engineering and build perfectly.", service: "Retaining Wall for Shed Pad in Narangba", stars: 5 },
      { name: "Steve M.", text: "Two retaining walls to terrace our sloping backyard. The result is amazing — we now have usable outdoor space we never had before.", service: "Terraced Retaining Walls in Narangba", stars: 5 },
      { name: "Julie T.", text: "Professional from start to finish. The retaining wall solved our erosion problem and looks great. Fair price and quality work.", service: "Erosion Control Retaining Wall in Narangba", stars: 5 },
    ],
    processSteps: ["Free on-site assessment of your Narangba property", "Engineering design and council liaison", "Excavation, footings and wall construction", "Drainage, backfill and site restoration"],
  },

  "concrete-driveway-narangba": {
    headline: "Concrete Driveways Narangba — From $75/m²",
    subheadline: "Quality driveways for Narangba homes and acreage. QBCC Licensed #15299707.",
    service: "Concrete Driveway",
    benefits: [
      "Driveways for Narangba's residential and acreage properties — any size, any access.",
      "Long driveway specialists — acreage properties often need 50m+ of driveway.",
      "Engineered for Moreton Bay's soil conditions with proper base preparation.",
      "Choose from plain, coloured, or exposed aggregate finishes.",
      "Heavy-duty options for properties with trucks, trailers, and machinery.",
      "Moreton Bay Regional Council compliant crossovers and driveways.",
    ],
    priceFrom: "75",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Acreage Driveway Experts", "Moreton Bay Specialists"],
    urgencyLine: "Narangba driveway bookings filling up — call for your free quote!",
    testimonials: [
      { name: "Mark & Donna", text: "Long driveway on our acreage done beautifully. The team handled the 60-metre run with ease. Looks fantastic and is built to last.", service: "Acreage Driveway in Narangba", stars: 5 },
      { name: "Chris B.", text: "Replaced our old cracked driveway with coloured concrete. The difference is incredible. Professional team and great value.", service: "Driveway Replacement in Narangba", stars: 5 },
      { name: "Angela S.", text: "Needed a heavy-duty driveway for our horse float and truck. Concrete Concepts built it extra thick and reinforced. Perfect.", service: "Heavy-Duty Driveway in Narangba", stars: 5 },
    ],
    processSteps: ["Free on-site measure and quote", "Site preparation and base compaction", "Formwork, reinforcement and concrete pour", "Finishing, control joints and sealing"],
  },

  "concrete-driveway-kallangur": {
    headline: "Concrete Driveways Kallangur — From $75/m²",
    subheadline: "Trusted concreters for Kallangur and surrounds. QBCC Licensed #15299707. Free quotes.",
    service: "Concrete Driveway",
    benefits: [
      "Driveway replacements and new builds for Kallangur's established and new homes.",
      "Proper base preparation for Moreton Bay's reactive soil conditions.",
      "Wide range of finishes — plain, coloured, exposed aggregate, and stencilled.",
      "Fast turnaround — most Kallangur driveways completed in 2-3 days.",
      "Moreton Bay Regional Council compliant crossovers included.",
      "Competitive pricing with fixed-price, no-surprise quotes.",
    ],
    priceFrom: "75",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Moreton Bay Coverage", "Family Owned & Operated"],
    urgencyLine: "Kallangur driveway spots limited this month — book now!",
    testimonials: [
      { name: "John & Mary", text: "Our 30-year-old driveway in Kallangur was crumbling. The new coloured concrete driveway looks amazing. Great team, great price.", service: "Driveway Replacement in Kallangur", stars: 5 },
      { name: "Shane P.", text: "New driveway and crossover done quickly and professionally. The team were clean, punctual, and the result is excellent.", service: "Driveway & Crossover in Kallangur", stars: 5 },
      { name: "Lisa M.", text: "We chose exposed aggregate for our Kallangur home and it looks incredible. The neighbours are all asking who did it!", service: "Exposed Aggregate Driveway in Kallangur", stars: 5 },
    ],
    processSteps: ["Free on-site quote at your Kallangur property", "Old driveway removal and site preparation", "Formwork, reinforcement and concrete pour", "Finishing, curing and protective sealing"],
  },

  "concrete-driveway-bracken-ridge": {
    headline: "Concrete Driveways Bracken Ridge — From $75/m²",
    subheadline: "Driveway replacements and upgrades for Bracken Ridge. QBCC Licensed #15299707.",
    service: "Concrete Driveway",
    benefits: [
      "Specialists in replacing ageing Bracken Ridge driveways — most homes are 30-40 years old.",
      "Full remove-and-replace service including old concrete disposal.",
      "Upgrade from plain to exposed aggregate or coloured concrete for instant street appeal.",
      "Proper base preparation for Brisbane's clay soils prevents future cracking.",
      "Brisbane City Council compliant crossovers and driveways.",
      "Transform your home's first impression with a quality new driveway.",
    ],
    priceFrom: "75",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-driveway-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Brisbane Northside Experts", "500+ Driveways Completed"],
    urgencyLine: "Bracken Ridge driveway bookings filling fast — get your free quote!",
    testimonials: [
      { name: "Tony & Jan", text: "Our old 1980s driveway was an eyesore. The new exposed aggregate driveway has completely transformed our Bracken Ridge home. Love it!", service: "Driveway Upgrade in Bracken Ridge", stars: 5 },
      { name: "Michael R.", text: "Quick, clean, and professional. They removed the old driveway and had the new one poured in three days. Excellent result.", service: "Driveway Replacement in Bracken Ridge", stars: 5 },
      { name: "Sandra K.", text: "Best money we've spent on our home. The coloured concrete driveway and path look fantastic. Highly recommend Concrete Concepts.", service: "Driveway & Path in Bracken Ridge", stars: 5 },
    ],
    processSteps: ["Free on-site assessment and quote", "Old driveway demolition and removal", "Base preparation, formwork and reinforced pour", "Finishing, control joints and protective sealing"],
  },

  "exposed-aggregate-thornlands": {
    headline: "Exposed Aggregate Thornlands — Premium Finish from $100/m²",
    subheadline: "Beautiful stone finishes for Thornlands homes. QBCC Licensed #15299707. Free quotes.",
    service: "Exposed Aggregate",
    benefits: [
      "The most popular driveway upgrade in the Redlands — natural stone beauty.",
      "Perfect for Thornlands' family homes — non-slip, durable, and low maintenance.",
      "Multiple stone colour options from coastal whites to warm earth tones.",
      "Ideal for driveways, pool areas, patios, and entertaining spaces.",
      "UV-stable finish that won't fade in Queensland's harsh sun.",
      "Adds premium value and street appeal to your Thornlands property.",
    ],
    priceFrom: "100",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-exposed-aggregate-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Redlands Specialists", "Exposed Aggregate Experts"],
    urgencyLine: "Thornlands aggregate bookings limited — secure your spot today!",
    testimonials: [
      { name: "Phil & Wendy", text: "The exposed aggregate driveway at our Thornlands home is stunning. We chose a warm earth tone that perfectly complements our brick home.", service: "Exposed Aggregate Driveway in Thornlands", stars: 5 },
      { name: "Darren S.", text: "Had the pool surround and patio done in matching aggregate. It looks like a resort! The team were professional and the finish is flawless.", service: "Pool & Patio Aggregate in Thornlands", stars: 5 },
      { name: "Catherine M.", text: "We upgraded from plain concrete to exposed aggregate and the difference is night and day. Our Thornlands home looks brand new.", service: "Aggregate Upgrade in Thornlands", stars: 5 },
    ],
    processSteps: ["Free consultation with stone colour selection at your home", "Site preparation and formwork setup", "Concrete pour with premium aggregate blend", "High-pressure wash and protective sealing"],
  },

  "concrete-patio-pimpama": {
    headline: "Concrete Patios Pimpama — Outdoor Living from $75/m²",
    subheadline: "Create your perfect outdoor space in Pimpama. QBCC Licensed #15299707.",
    service: "Concrete Patio",
    benefits: [
      "Design the perfect outdoor entertaining area for your Pimpama home.",
      "Plain, coloured, or exposed aggregate finishes to suit your style.",
      "Extend your living space — Pimpama's climate is perfect for outdoor entertaining.",
      "Non-slip surfaces ideal for pool areas and family-friendly spaces.",
      "Integrate with your existing landscaping and outdoor kitchen plans.",
      "Built to last with proper reinforcement and drainage for Queensland conditions.",
    ],
    priceFrom: "75",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-patio-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Outdoor Living Specialists", "Pimpama Projects Completed"],
    urgencyLine: "Pimpama patio bookings filling fast — call for your free quote!",
    testimonials: [
      { name: "Adam & Kelly", text: "Our new patio in Gainsborough Greens is perfect for entertaining. The exposed aggregate finish looks amazing and is easy to keep clean.", service: "Exposed Aggregate Patio in Pimpama", stars: 5 },
      { name: "Ryan D.", text: "Extended our back patio to create a proper outdoor living area. The team were great and the coloured concrete matches our home perfectly.", service: "Patio Extension in Pimpama", stars: 5 },
      { name: "Melissa B.", text: "We now have the outdoor entertaining space we always wanted. The patio is beautiful, level, and drains perfectly. Highly recommend.", service: "Outdoor Entertaining Area in Pimpama", stars: 5 },
    ],
    processSteps: ["Free on-site design consultation", "Site preparation and drainage planning", "Formwork, reinforcement and concrete pour", "Finishing with your chosen surface treatment and sealing"],
  },

  "pool-surround-upper-coomera": {
    headline: "Pool Surrounds Upper Coomera — Non-Slip from $100/m²",
    subheadline: "Safe, beautiful pool surrounds for Upper Coomera homes. QBCC Licensed #15299707.",
    service: "Pool Surround",
    benefits: [
      "Non-slip exposed aggregate — the safest and most popular pool surround option.",
      "Cool underfoot even in Upper Coomera's hot summers — stays comfortable.",
      "Multiple stone colours to complement your pool and outdoor design.",
      "Seamless integration with existing patios, driveways, and landscaping.",
      "Built to handle pool chemicals, chlorine splash, and constant water exposure.",
      "Transform your pool area into a resort-style outdoor living space.",
    ],
    priceFrom: "100",
    heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-pool-surround-hero.webp",
    trustPoints: ["QBCC Licensed #15299707", "4.9★ Google Rating", "Pool Surround Specialists", "Non-Slip Safety Rated"],
    urgencyLine: "Get your pool area ready for summer — book your Upper Coomera quote now!",
    testimonials: [
      { name: "Craig & Lisa", text: "The pool surround in exposed aggregate is beautiful and safe for the kids. It doesn't get hot like tiles and looks amazing. Best decision we made.", service: "Exposed Aggregate Pool Surround in Upper Coomera", stars: 5 },
      { name: "Ian W.", text: "Had the entire pool area and connecting patio done. It looks like a five-star resort. The team were professional and the finish is perfect.", service: "Pool Area & Patio in Upper Coomera", stars: 5 },
      { name: "Natalie F.", text: "We love our new pool surround. The non-slip surface gives us peace of mind with young kids, and it looks incredible.", service: "Pool Surround in Upper Coomera", stars: 5 },
    ],
    processSteps: ["Free on-site consultation and colour selection", "Careful preparation around existing pool", "Concrete pour with non-slip aggregate blend", "Wash, expose stone and apply pool-grade sealant"],
  },


};

// Default fallback for unknown landing pages
const DEFAULT_CONFIG: LandingConfig = {
  headline: "Brisbane's Trusted Concreting Specialists — Free Quote Today",
  subheadline: "Driveways, slabs, patios & retaining walls from $65/m². QBCC Licensed #15299707. Over 500 projects completed.",
  service: "Concreting",
  benefits: [
    "Driveways, slabs, patios, and retaining walls — full service",
    "Exposed aggregate and decorative finishes available",
    "QBCC Licensed #15299707 — fully insured",
    "Free on-site quotes within 24 hours",
    "Engineered for Brisbane's clay soils",
    "Flexible payment options — pay on completion",
  ],
  priceFrom: "$65/m²",
  heroImage: "https://manus-storage.oss-cn-shanghai.aliyuncs.com/user-uploads/virjgqfqpv/1741408411-concrete-hero.webp",
  trustPoints: ["QBCC Licensed #15299707", "500+ Projects Completed", "4.9★ Google Rating", "Brisbane Owned & Operated"],
  urgencyLine: "Limited spots available this week — get your free quote now",
  testimonials: [
    { name: "Myresh M.", text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish.", service: "Driveway — Mt Gravatt East", stars: 5 },
    { name: "Paul S.", text: "The price was what I had expected to pay and they came out to inspect the site before quoting. Would recommend them.", service: "Concreting — Shailer Park", stars: 5 },
  ],
  processSteps: [
    "Free on-site inspection & quote",
    "Site prepared & old concrete removed",
    "Concrete poured to your specifications",
    "Finished, sealed & ready to enjoy",
  ],
};

export default function LandingPage() {
  const params = useParams<{ slug: string }>();
  const config = LANDING_PAGES[params.slug ?? ""] ?? DEFAULT_CONFIG;
  const slug = params.slug ?? "";
  const abVariant = useABTest(`lp_${slug}`);
  const abTest = LANDING_AB_TESTS[slug];
  const activeVariant = abTest ? abTest[abVariant] : null;

  // Track landing page view for remarketing
  useEffect(() => {
    trackLandingPageView(config.service);
  }, [config.service]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    suburb: "",
    details: "",
  });

  const serviceId = (() => {
    const value = config.service.toLowerCase();
    if (value.includes("driveway")) return "driveway";
    if (value.includes("slab")) return "slab";
    if (value.includes("patio")) return "patio";
    if (value.includes("pool")) return "pool-surround";
    if (value.includes("retaining")) return "retaining-wall";
    if (value.includes("path") || value.includes("footpath")) return "pathway";
    if (value.includes("exposed")) return "exposed-aggregate";
    if (value.includes("stair") || value.includes("step")) return "stairs";
    if (value.includes("excavat")) return "excavation";
    if (value.includes("crossover")) return "crossover";
    if (value.includes("commercial")) return "commercial";
    return "other";
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim().length < 2) {
      toast.error("Please enter your name.");
      return;
    }
    const phoneValidation = validateAustralianPhone(formData.phone);
    if (!phoneValidation.valid || phoneValidation.kind !== "mobile") {
      toast.error("Enter an Australian mobile number beginning with 04.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }
    const serviceArea = classifyServiceArea(formData.suburb);
    if (!serviceArea.canSubmit) {
      toast.error(serviceArea.message);
      return;
    }
    saveQuoteDraft({
      name: formData.name.trim(),
      mobile: phoneValidation.normalized,
      email: formData.email.trim(),
      suburb: serviceArea.normalized,
      services: [serviceId],
      finish: serviceId === "exposed-aggregate" ? "exposed" : "not_sure",
      description: formData.details.trim(),
    });
    window.location.assign("/get-quote");
  };

  const handleCallClick = () => {
    trackPhoneCallClick();
    window.location.href = PHONE_TEL;
  };

  return (
    <>
    <SEOHead
      title={`${config.headline} | Concrete Concepts Group Brisbane`}
      description={`${config.service} by Concrete Concepts Group. QBCC Licensed, 4.9★ Google Reviews. Free on-site quotes within 48 hours. Serving Brisbane & surrounds.`}
      canonical={`/lp/${slug}`}
      noindex={true}
    />
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Urgency Banner */}
      <div className="bg-[#c8a55c] text-[#1a1a1a] py-2 px-4 text-center">
        <p className="text-sm font-bold flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          {config.urgencyLine}
          <Zap className="w-4 h-4" />
        </p>
      </div>

      {/* Minimal top bar — no full nav */}
      <div className="bg-[#111] border-b border-[#333] py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-[#c8a55c] font-bold text-lg tracking-wide">CONCRETE CONCEPTS</span>
          <Button
            onClick={handleCallClick}
            variant="outline"
            className="border-[#c8a55c] text-[#c8a55c] hover:bg-[#c8a55c] hover:text-[#1a1a1a] font-semibold"
          >
            <Phone className="w-4 h-4 mr-2" />
            {PHONE}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          {/* Left: Copy */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#c8a55c]" />
              <span className="text-[#c8a55c] font-semibold text-sm uppercase tracking-wider">QBCC Licensed & Insured</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              {activeVariant ? activeVariant.headline : config.headline}
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              {config.subheadline}
            </p>

            {/* Trust points */}
            <div className="flex flex-wrap gap-2 mb-8">
              {config.trustPoints.map((point) => (
                <span key={point} className="bg-[#222] border border-[#333] text-gray-300 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#c8a55c]" />
                  {point}
                </span>
              ))}
            </div>

            {/* Google Rating Badge */}
            <div className="bg-[#222] border border-[#333] rounded-lg p-4 mb-6 inline-flex items-center gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-[#c8a55c] text-[#c8a55c]" />
                  ))}
                </div>
                <p className="text-white font-bold text-lg">4.9 / 5.0</p>
                <p className="text-gray-400 text-xs">Based on Google Reviews</p>
              </div>
              <div className="border-l border-[#444] pl-4">
                <p className="text-gray-400 text-sm">Starting from</p>
                <p className="text-3xl font-bold text-[#c8a55c]">{config.priceFrom}</p>
              </div>
            </div>

            {/* How It Works — desktop only */}
            <div className="hidden md:block">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#c8a55c]" />
                How It Works
              </h3>
              <div className="space-y-3">
                {config.processSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="bg-[#c8a55c] text-[#1a1a1a] font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gray-300 pt-0.5">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Quote Form */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-2xl md:sticky md:top-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">{activeVariant ? activeVariant.formTitle : "Get Your Free Quote"}</h2>
              <p className="text-gray-500 mt-1">We respond within 24 hours — no obligation</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name *"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a55c] focus:border-transparent outline-none text-[#1a1a1a]"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  autoComplete="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a55c] focus:border-transparent outline-none text-[#1a1a1a]"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address *"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a55c] focus:border-transparent outline-none text-[#1a1a1a]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Suburb *"
                  required
                  value={formData.suburb}
                  onChange={(e) => setFormData(prev => ({ ...prev, suburb: e.target.value }))}
                  autoComplete="postal-code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a55c] focus:border-transparent outline-none text-[#1a1a1a]"
                />
                {formData.suburb && classifyServiceArea(formData.suburb).status === "service_area_review" && (
                  <p className="text-xs text-amber-700 mt-1.5">
                    You can continue — our team will confirm availability for this Queensland location.
                  </p>
                )}
              </div>
              <div>
                <textarea
                  placeholder="Tell us about your project (optional)"
                  rows={3}
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a55c] focus:border-transparent outline-none resize-none text-[#1a1a1a]"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#c8a55c] hover:bg-[#b8953c] text-[#1a1a1a] font-bold text-lg py-6 rounded-lg"
              >
                Continue to My Detailed Quote →
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 24hr response</span>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> No obligation</span>
            </div>

            {/* Micro-conversion: call option */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <p className="text-gray-400 text-xs mb-2">Prefer to talk? Call us directly:</p>
              <button
                onClick={handleCallClick}
                className="text-[#c8a55c] font-bold text-lg hover:underline flex items-center justify-center gap-2 mx-auto"
              >
                <Phone className="w-4 h-4" />
                {PHONE}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-[#111]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-3">
            What You Get With Concrete Concepts
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            Every project includes professional site preparation, quality materials, and a workmanship guarantee.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {config.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-[#c8a55c] mt-0.5 shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — mobile only */}
      <section className="py-12 px-4 md:hidden">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-8">How It Works</h3>
          <div className="space-y-4">
            {config.processSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 bg-[#222] border border-[#333] rounded-lg p-4">
                <span className="bg-[#c8a55c] text-[#1a1a1a] font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">
                  {i + 1}
                </span>
                <span className="text-gray-300 pt-1">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof — Multiple Testimonials */}
      <section className="py-16 px-4 bg-[#111]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 fill-[#c8a55c] text-[#c8a55c]" />
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">What Our Customers Say</h2>
            <p className="text-gray-400">4.9 out of 5 stars on Google — real reviews from real Brisbane homeowners</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {config.testimonials.map((t, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#c8a55c] text-[#c8a55c]" />
                  ))}
                </div>
                <p className="text-gray-300 italic mb-4 text-sm leading-relaxed">"{t.text}"</p>
                <div className="border-t border-[#333] pt-3">
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Gallery — real photos */}
      {config.galleryImages && config.galleryImages.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-3">Our Recent Work</h2>
            <p className="text-gray-400 text-center mb-10">Real projects by Concrete Concepts Group — not stock photos</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {config.galleryImages.map((img, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl border border-[#333] aspect-[4/3]">
                  <img
                    src={img.src}
                      width={400}
                      height={300}
                      decoding="async"
                    alt={img.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">
            Why Brisbane Homeowners Choose Us
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-[#222] border border-[#333] rounded-xl p-6">
              <Shield className="w-10 h-10 text-[#c8a55c] mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">QBCC Licensed</h3>
              <p className="text-gray-400 text-sm">#15299707 — fully compliant</p>
            </div>
            <div className="bg-[#222] border border-[#333] rounded-xl p-6">
              <Users className="w-10 h-10 text-[#c8a55c] mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">500+ Projects</h3>
              <p className="text-gray-400 text-sm">Across Brisbane & SEQ</p>
            </div>
            <div className="bg-[#222] border border-[#333] rounded-xl p-6">
              <Award className="w-10 h-10 text-[#c8a55c] mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">4.9★ Google</h3>
              <p className="text-gray-400 text-sm">Verified customer reviews</p>
            </div>
            <div className="bg-[#222] border border-[#333] rounded-xl p-6">
              <MapPin className="w-10 h-10 text-[#c8a55c] mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">Brisbane Local</h3>
              <p className="text-gray-400 text-sm">Owned & operated locally</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 px-4 bg-[#c8a55c]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">
            Ready to Start Your {config.service} Project?
          </h2>
          <p className="text-[#1a1a1a]/80 text-lg mb-6">
            Call now for a free, no-obligation quote. We service all of Brisbane & surrounding areas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleCallClick}
              className="bg-[#1a1a1a] hover:bg-[#333] text-white font-bold text-xl px-10 py-6"
            >
              <Phone className="w-6 h-6 mr-3" />
              Call {PHONE} Now
            </Button>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              variant="outline"
              className="border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white font-bold text-xl px-10 py-6"
            >
              Get Free Quote Online
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-[#1a1a1a] border-t border-[#333] p-3 flex gap-2 z-50">
        <Button
          onClick={handleCallClick}
          className="flex-1 bg-[#c8a55c] hover:bg-[#b8953c] text-[#1a1a1a] font-bold py-3"
        >
          <Phone className="w-4 h-4 mr-2" />
          Call Now
        </Button>
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          variant="outline"
          className="flex-1 border-[#c8a55c] text-[#c8a55c] hover:bg-[#c8a55c] hover:text-[#1a1a1a] font-bold py-3"
        >
          Get Free Quote
        </Button>
      </div>

      {/* Bottom padding for mobile sticky CTA */}
      <div className="h-16 md:hidden" />
    </div>
    </>
  );
}
