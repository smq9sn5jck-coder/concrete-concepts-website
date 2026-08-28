import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import ComprehensiveQuoteWizard from "@/components/quote/ComprehensiveQuoteWizard";
import { Shield, Star, Phone } from "lucide-react";
import { trackPhoneCallClick } from "@/components/ConversionTracking";

export default function GetQuote() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title="Get a Free Concrete Quote | Brisbane & SEQ | Concrete Concepts"
        description="Send Concrete Concepts Group your job address, measurements, site details and optional photos for a complete Brisbane concreting quote assessment."
        canonical="/get-quote"
        keywords="free concrete quote Brisbane, concreting quote, concrete driveway quote, exposed aggregate quote Brisbane"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://concreteconceptsgroup.com" },
              { "@type": "ListItem", position: 2, name: "Get a Free Quote", item: "https://concreteconceptsgroup.com/get-quote" },
            ],
          },
        ]}
      />
      <Navbar />

      <section className="bg-brand-charcoal py-10 md:py-14">
        <div className="container max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-yellow">Detailed project enquiry</p>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Get Your <span className="italic text-brand-yellow">Free Quote</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Tell us what you need, where the job is and anything important about access. Measurements and photos help, but they are not compulsory.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-300">
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-brand-yellow" />QBCC Licensed</span>
            <span className="flex items-center gap-2"><Star className="h-4 w-4 text-brand-yellow" />4.9 Google rating</span>
            <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-yellow" />Response within 24 hours</span>
          </div>
        </div>
      </section>

      <main className="py-8 md:py-12">
        <div className="container">
          <ComprehensiveQuoteWizard />
        </div>
      </main>

      <footer className="border-t border-white/10 bg-brand-charcoal py-8 text-center text-sm text-slate-300">
        <div className="container flex max-w-3xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="font-bold text-white">Concrete Concepts Group Pty Ltd</p>
            <p className="mt-1">QBCC Licensed #15299707 · Brisbane & South East Queensland</p>
          </div>
          <a
            href="tel:0424463268"
            onClick={() => trackPhoneCallClick()}
            className="inline-flex items-center gap-2 font-bold text-brand-yellow hover:underline"
          >
            <Phone className="h-4 w-4" />
            0424 463 268
          </a>
        </div>
      </footer>
    </div>
  );
}
