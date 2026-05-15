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

export default function Home() {
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
