import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import ServiceAreaGrid from "@/components/ServiceAreaGrid";
import ProcessSection from "@/components/ProcessSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import ProjectGallery from "@/components/ProjectGallery";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import ContactDecisionPanel from "@/components/ContactDecisionPanel";
import FAQSection from "@/components/FAQSection";
import PaymentPlans from "@/components/PaymentPlans";
import CTABanner from "@/components/CTABanner";
import ProjectPlanningBanner from "@/components/ProjectPlanningBanner";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
// ExitIntentPopup removed per owner preference
import StickyMobileCTA from "@/components/StickyMobileCTA";
import TrustBar from "@/components/TrustBar";
import GuideCtaBanner from "@/components/GuideCtaBanner";
import MiniQuoteForm from "@/components/MiniQuoteForm";
import DeferredSection from "@/components/DeferredSection";
import { useGodModeTracking } from "@/components/GodModeTracking";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://concreteconceptsgroup.com/#business",
  name: "Concrete Concepts Group Pty Ltd",
  alternateName: "Concrete Concepts Group",
  description:
    "Professional concreting services across Brisbane and South East Queensland. Driveways, slabs, patios, retaining walls, exposed aggregate, and excavation. QBCC Licensed #15299707.",
  url: "https://concreteconceptsgroup.com",
  telephone: "+61424463268",
  email: "info@concreteconceptsgroup.com",
  image:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-hero_a3bbd489.png",
  logo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-hero_a3bbd489.png",
  priceRange: "$$",
  currenciesAccepted: "AUD",
  paymentAccepted: "Cash, Credit Card, Bank Transfer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Brisbane",
    addressRegion: "QLD",
    postalCode: "4000",
    addressCountry: "AU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -27.4698,
    longitude: 153.0251,
  },
  areaServed: [
    { "@type": "State", name: "South East Queensland" },
    { "@type": "City", name: "Brisbane" },
    { "@type": "City", name: "Ipswich" },
    { "@type": "City", name: "Logan" },
    { "@type": "City", name: "Moreton Bay" },
    { "@type": "City", name: "Redland City" },
    { "@type": "City", name: "Gold Coast" },
    { "@type": "City", name: "Sunshine Coast" },
    { "@type": "City", name: "Caboolture" },
    { "@type": "City", name: "Beenleigh" },
    { "@type": "City", name: "Springfield" },
  ],
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "QBCC Licence",
    identifier: "15299707",
    recognizedBy: {
      "@type": "Organization",
      name: "Queensland Building and Construction Commission",
    },
  },
  sameAs: [
    "https://www.google.com/maps/place/Concrete+concepts+group+pty+Ltd/@-27.4479932,153.0574609,17z/data=!3m1!4b1!4m6!3m5!1s0x6b9159cc3c034933:0xd957176f933fae1!8m2!3d-27.4479932!4d153.0574609",
    "https://www.facebook.com/share/14Z2spZfScB/",
    "https://www.concrete-concepts.com.au/",
  ],
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
  makesOffer: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Concrete Driveways",
        description: "Professional concrete driveway installation and replacement in Brisbane. Exposed aggregate, coloured, and plain finishes.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Concrete Slabs",
        description: "House slabs, shed slabs, garage floors, and commercial foundations across Brisbane and SEQ.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Exposed Aggregate",
        description: "Premium exposed aggregate concrete finishes for driveways, patios, and pool surrounds in Brisbane.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Retaining Walls",
        description: "Concrete, sleeper, and block retaining wall construction for sloping blocks in Brisbane.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Concrete Patios",
        description: "Outdoor entertaining areas and concrete patios designed for Brisbane's outdoor lifestyle.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Excavation",
        description: "Professional excavation and site preparation services for residential and commercial projects in Brisbane.",
      },
    },
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Concrete Concepts Group",
  url: "https://concreteconceptsgroup.com",
  description:
    "Professional concreting services in Brisbane. Driveways, slabs, patios, retaining walls, exposed aggregate. QBCC Licensed.",
  publisher: {
    "@type": "Organization",
    name: "Concrete Concepts Group Pty Ltd",
    url: "https://concreteconceptsgroup.com",
  },
};

const CUSTOMER_HOSTS = new Set([
  "concreteconceptsgroup.com",
  "www.concreteconceptsgroup.com",
]);

export default function Home() {
  useGodModeTracking();
  const noindex = typeof window === "undefined" || !CUSTOMER_HOSTS.has(window.location.hostname);

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Concreter Brisbane | Concrete Concepts Group"
        description="Brisbane's trusted concreter — driveways, slabs, exposed aggregate & retaining walls. QBCC Licensed #15299707. Free on-site quotes. Call 0424 463 268."
        canonical="/"
        keywords="concreter brisbane, concrete driveway brisbane, exposed aggregate brisbane, retaining wall brisbane, concrete slab brisbane, concreting brisbane, concreter near me"
        structuredData={[localBusinessSchema, websiteSchema]}
        noindex={noindex}
      />
      <Navbar />
      <HeroSection />
      <TrustBar />
      <DeferredSection><ServicesSection /></DeferredSection>
      <DeferredSection><MiniQuoteForm /></DeferredSection>
      <DeferredSection><AboutSection /></DeferredSection>
      <DeferredSection><ServiceAreaGrid /></DeferredSection>
      <DeferredSection><ProcessSection /></DeferredSection>
      <DeferredSection><WhyChooseUs /></DeferredSection>
      <DeferredSection><ProjectGallery /></DeferredSection>
      <DeferredSection><BeforeAfterSection /></DeferredSection>
      <DeferredSection><ProjectPlanningBanner /></DeferredSection>
      <DeferredSection><GuideCtaBanner variant="section" /></DeferredSection>
      <DeferredSection><FAQSection /></DeferredSection>
      <DeferredSection><PaymentPlans /></DeferredSection>
      <DeferredSection><ContactDecisionPanel /></DeferredSection>
      <DeferredSection><CTABanner /></DeferredSection>
      <DeferredSection><Footer /></DeferredSection>
      {/* ExitIntentPopup removed per owner preference */}
      <StickyMobileCTA />
    </div>
  );
}
