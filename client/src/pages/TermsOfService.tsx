/*
  Terms of Service — Concrete Concepts Group Pty Ltd
*/
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { trackPhoneCallClick } from "@/components/ConversionTracking";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Terms of Service | Concrete Concepts Group"
        description="Terms of Service for Concrete Concepts Group Pty Ltd. Read our terms and conditions for using our website and services."
        canonical="/terms"
        structuredData={[{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://concreteconceptsgroup.com" },
            { "@type": "ListItem", "position": 2, "name": "Terms of Service", "item": "https://concreteconceptsgroup.com/terms" }
          ]
        }]}
      />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <h1
            className="text-3xl md:text-4xl font-bold text-foreground mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm mb-10" style={{ fontFamily: "var(--font-body)" }}>
            Last updated: 23 March 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8" style={{ fontFamily: "var(--font-body)" }}>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the website concreteconceptsgroup.com ("the Website"), you accept and agree
                to be bound by these Terms of Service. If you do not agree to these terms, please do not use the
                Website. Concrete Concepts Group Pty Ltd (ABN 61 695 485 593, QBCC Licence 15299707) ("we", "us",
                "our") reserves the right to modify these terms at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Concrete Concepts Group provides residential and commercial concreting services across Brisbane
                and surrounding areas, including but not limited to concrete driveways, slabs, retaining walls,
                patios, exposed aggregate, and excavation. All services are subject to a separate written quote
                or contract agreed upon between you and Concrete Concepts Group prior to commencement of work.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Quotes &amp; Estimates</h2>
              <p className="text-muted-foreground leading-relaxed">
                Quotes and estimates provided through this Website, including the online cost calculator, are
                indicative only and do not constitute a binding offer. Final pricing is subject to an on-site
                assessment and will be confirmed in a formal written quote. Quotes are valid for 30 days from
                the date of issue unless otherwise stated. Prices are in Australian dollars and include GST
                unless specified otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Website Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                When using this Website, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate and truthful information when submitting forms or contacting us.</li>
                <li>Not use the Website for any unlawful purpose or in violation of any applicable laws.</li>
                <li>Not attempt to interfere with the proper functioning of the Website.</li>
                <li>Not reproduce, duplicate, or copy any content from the Website without our written permission.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on this Website, including text, images, logos, project photographs, blog articles,
                guides, and design elements, is the property of Concrete Concepts Group Pty Ltd or its licensors
                and is protected by Australian copyright law. You may not reproduce, distribute, or use any content
                from this Website without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Project Photos &amp; Testimonials</h2>
              <p className="text-muted-foreground leading-relaxed">
                Project photographs displayed on this Website are of actual work completed by Concrete Concepts
                Group. Results may vary depending on site conditions, materials, and project specifications.
                Testimonials and reviews displayed on this Website are from genuine customers and are sourced
                from Google Reviews and HiPages. We do not alter or fabricate reviews.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Concrete Concepts Group Pty Ltd shall not be liable for
                any indirect, incidental, special, or consequential damages arising from your use of this Website.
                The information on this Website is provided "as is" without warranties of any kind, either express
                or implied. We do not warrant that the Website will be uninterrupted, error-free, or free of
                viruses or other harmful components.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                This Website may contain links to third-party websites, including Google, Facebook, and review
                platforms. We are not responsible for the content, privacy practices, or terms of any third-party
                websites. Accessing third-party links is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Referral Program</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our referral program is subject to its own terms as described on the referral page. Referral
                rewards are issued at the sole discretion of Concrete Concepts Group and are subject to the
                referred project being completed and paid in full.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service are governed by and construed in accordance with the laws of Queensland,
                Australia. Any disputes arising from these terms or your use of the Website shall be subject to
                the exclusive jurisdiction of the courts of Queensland.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-5 rounded-lg bg-card border border-border">
                <p className="text-foreground font-semibold mb-2">Concrete Concepts Group Pty Ltd</p>
                <p className="text-muted-foreground">ABN: 61 695 485 593</p>
                <p className="text-muted-foreground">QBCC Licence: 15299707</p>
                <p className="text-muted-foreground mt-2">
                  Email:{" "}
                  <a href="mailto:info@concreteconceptsgroup.com" className="text-brand-gold hover:underline">
                    info@concreteconceptsgroup.com
                  </a>
                </p>
                <p className="text-muted-foreground">
                  Phone:{" "}
                  <a href="tel:0424463268" onClick={() => trackPhoneCallClick()} className="text-brand-gold hover:underline">
                    0424 463 268
                  </a>
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
