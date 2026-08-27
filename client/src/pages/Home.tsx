/*
  DESIGN: Foreman's Blueprint — Home Page
  Assembles all sections in order with proper spacing
  Mobile bottom bar always visible
*/
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import GallerySection from "@/components/GallerySection";
import ReviewsSection from "@/components/ReviewsSection";
import ServiceAreasSection from "@/components/ServiceAreasSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { usePageMetadata } from "@/lib/page-metadata";

export default function Home() {
  usePageMetadata({
    title: "Concrete Concepts Group | Brisbane Concreting Specialists",
    description:
      "Brisbane's trusted concreting specialists for driveways, slabs, patios, exposed aggregate, retaining walls and excavation. QBCC Licensed #15299707.",
    canonicalUrl: "https://concreteconceptsgroup.com/",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <WhyChooseUs />
        <GallerySection />
        <ReviewsSection />
        <ServiceAreasSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
      <MobileBar />
      {/* Bottom padding on mobile so content isn't hidden behind sticky bar */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
