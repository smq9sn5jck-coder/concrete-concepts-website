/*
  Privacy Policy — Concrete Concepts Group Pty Ltd
  Required for Google Ads lead form compliance and Australian Privacy Act 1988
*/
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { trackPhoneCallClick } from "@/components/ConversionTracking";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy | Concrete Concepts Group"
        description="Privacy Policy for Concrete Concepts Group Pty Ltd. Learn how we collect, use, and protect your personal information."
        canonical="/privacy"
        structuredData={[{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://concreteconceptsgroup.com" },
            { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": "https://concreteconceptsgroup.com/privacy" }
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm mb-10" style={{ fontFamily: "var(--font-body)" }}>
            Last updated: 23 March 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8" style={{ fontFamily: "var(--font-body)" }}>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. About This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Concrete Concepts Group Pty Ltd (ABN 61 695 485 593) ("we", "us", "our") is committed to protecting
                the privacy of your personal information. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you visit our website concreteconceptsgroup.com, submit a quote
                request, or otherwise interact with our services. This policy complies with the Australian Privacy
                Act 1988 (Cth) and the Australian Privacy Principles (APPs).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may collect the following types of personal information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Contact details:</strong> name, phone number, email address, and property address when you request a quote or contact us.</li>
                <li><strong className="text-foreground">Project information:</strong> details about your concreting project, including service type, photos you upload, and any notes you provide.</li>
                <li><strong className="text-foreground">Usage data:</strong> information about how you interact with our website, including pages visited, time spent, browser type, device type, and IP address.</li>
                <li><strong className="text-foreground">Marketing data:</strong> how you found us (e.g. Google Ads, organic search, referral), UTM parameters, and ad click identifiers.</li>
                <li><strong className="text-foreground">Communication records:</strong> records of emails, phone calls, and messages exchanged between you and our team.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Collect Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We collect personal information directly from you when you fill out a quote request form, use our
                cost calculator, download our concreting guide, submit a referral, contact us by phone or email,
                or interact with our Google Ads lead forms. We also collect information automatically through
                cookies, Google Analytics, Google Ads conversion tracking, and Meta (Facebook) Pixel when you
                browse our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use your personal information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>To respond to your quote request and provide an estimate for your project.</li>
                <li>To contact you about your enquiry, arrange site visits, and provide our concreting services.</li>
                <li>To send you follow-up communications related to your enquiry (e.g. project updates, estimate documents).</li>
                <li>To improve our website, services, and advertising effectiveness.</li>
                <li>To comply with legal obligations and resolve disputes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Google Ads &amp; Analytics</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use Google Ads conversion tracking and remarketing tags to measure the effectiveness of our
                advertising and show relevant ads to people who have visited our website. We also use Google Ads
                enhanced conversions, which sends hashed (encrypted) contact information to Google to improve
                conversion measurement accuracy. Google may use cookies and similar technologies to collect and
                process data. You can opt out of personalised advertising by visiting{" "}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
                  Google Ads Settings
                </a>{" "}
                or by installing the{" "}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
                  Google Analytics Opt-out Browser Add-on
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Meta (Facebook) Pixel</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the Meta Pixel to track conversions from Facebook and Instagram ads, build targeted
                audiences for future ads, and remarket to people who have already interacted with our website.
                Meta may use this data in accordance with its own{" "}
                <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
                  Data Policy
                </a>. You can manage your ad preferences through your{" "}
                <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
                  Facebook Ad Preferences
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Disclosure of Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may share your personal information with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Our employees and contractors who need access to provide our concreting services.</li>
                <li>Third-party service providers who assist with email delivery (Resend), website hosting, and cloud storage.</li>
                <li>Google and Meta for advertising measurement and optimisation purposes (as described above).</li>
                <li>Government authorities or regulators if required by law.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We take reasonable steps to protect your personal information from misuse, interference, loss,
                unauthorised access, modification, or disclosure. Our website uses HTTPS encryption for all data
                transmission. Personal data is stored in secure, access-controlled databases. However, no method
                of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information only for as long as necessary to fulfil the purposes for which
                it was collected, including to satisfy legal, accounting, or reporting requirements. Quote request
                data is retained for up to 3 years to support warranty obligations and business records. You may
                request deletion of your data at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Under the Australian Privacy Act, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access the personal information we hold about you.</li>
                <li>Request correction of any inaccurate or outdated information.</li>
                <li>Request deletion of your personal information (subject to legal obligations).</li>
                <li>Opt out of marketing communications at any time.</li>
                <li>Lodge a complaint with the Office of the Australian Information Commissioner (OAIC) if you believe your privacy has been breached.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website uses cookies and similar technologies to enhance your browsing experience, remember
                your preferences, and collect usage analytics. You can control cookie settings through your browser
                preferences. Disabling cookies may affect the functionality of some features on our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">12. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal
                requirements. The updated version will be posted on this page with a revised "Last updated" date.
                We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">13. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
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
