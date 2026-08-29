import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { useLeadSource } from "@/hooks/useLeadSource";
import { submitGuideFallback } from "@/lib/formFallback";
import { trackGuideDownload, trackGuidePageView, trackPhoneCallClick } from "@/components/ConversionTracking";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { assessSubmissionSignals, validateAustralianPhone } from "@shared/leadValidation";
import {
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";

const PDF_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/homeowners-guide-to-concreting_0d96d3e2.pdf";

const CHAPTERS = [
  {
    number: 1,
    title: "Understanding Your Concreting Options",
    description:
      "Compare all finish types (plain, exposed aggregate, coloured, stamped, polished) with pricing and durability ratings.",
  },
  {
    number: 2,
    title: "Planning Your Project",
    description:
      "Step-by-step planning from measuring your area to checking council requirements and getting quotes.",
  },
  {
    number: 3,
    title: "Understanding Costs",
    description:
      "Detailed Brisbane pricing tables by project size, plus hidden costs to watch for.",
  },
  {
    number: 4,
    title: "The Concreting Process",
    description:
      "Day-by-day breakdown of what happens during site prep, the pour, and curing.",
  },
  {
    number: 5,
    title: "Brisbane-Specific Considerations",
    description:
      "Weather timing, soil types by suburb, and QBCC licensing requirements.",
  },
  {
    number: 6,
    title: "Maintaining Your Concrete",
    description:
      "Cleaning, sealing schedules, crack management, and stain prevention tips.",
  },
  {
    number: 7,
    title: "Common Mistakes to Avoid",
    description:
      "The 5 most expensive mistakes homeowners make and how to avoid them.",
  },
  {
    number: 8,
    title: "Pre-Project Checklist",
    description:
      "Printable checklist covering everything from getting quotes to post-pour care.",
  },
];

export default function GuidePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [website, setWebsite] = useState("");
  const formStartedAt = useRef(Date.now());

  // Track guide page view on mount
  useEffect(() => {
    trackGuidePageView();
  }, []);

  const leadSource = useLeadSource();
  const submitGuide = trpc.guide.submit.useMutation({
    onSuccess: () => {
      trackGuideDownload({
        email: email.trim(),
        phone: phone.trim() || undefined,
        name: name.trim(),
      });
      setSubmitted(true);
    },
    onError: async (mutationError) => {
      console.warn("[Guide] Lead capture unavailable:", mutationError.message);
      try {
        const result = await submitGuideFallback({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          source: "guide-download",
          website,
          formStartedAt: formStartedAt.current,
        });
        if (result.success) {
          trackGuideDownload({
            email: email.trim(),
            phone: phone.trim() || undefined,
            name: name.trim(),
          });
          setSubmitted(true);
          return;
        }
        setError("We couldn't confirm delivery. Please call 0424 463 268 and we'll send the guide.");
      } catch (fallbackError) {
        setError(fallbackError instanceof Error ? fallbackError.message : "We couldn't confirm delivery. Please call 0424 463 268.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (phone.trim()) {
      const phoneValidation = validateAustralianPhone(phone);
      if (!phoneValidation.valid) {
        setError(phoneValidation.error);
        return;
      }
    }
    const signals = assessSubmissionSignals({ honeypot: website, startedAt: formStartedAt.current });
    if (!signals.allowed) {
      setError("Please check the form and try again.");
      return;
    }

    // Submit through the email-first guide endpoint; phone remains optional.
    submitGuide.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      website,
      formStartedAt: formStartedAt.current,
      leadSource: "guide-download",
      utmSource: leadSource.utmSource || undefined,
      utmMedium: leadSource.utmMedium || undefined,
      utmCampaign: leadSource.utmCampaign || undefined,
      utmTerm: leadSource.utmTerm || undefined,
      utmContent: leadSource.utmContent || undefined,
      gclid: leadSource.gclid || undefined,
      fbclid: leadSource.fbclid || undefined,
      referrer: leadSource.referrer || undefined,
      landingPage: leadSource.landingPage || undefined,
    });
  };

  const handleDownload = () => {
    window.open(PDF_URL, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Free Homeowner's Guide to Concreting | Concrete Concepts Group"
        description="Download our free 13-page guide covering everything Brisbane homeowners need to know about concreting — finishes, costs, planning, council requirements, and maintenance."
        canonical="/guide"
        structuredData={[{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://concreteconceptsgroup.com" },
            { "@type": "ListItem", "position": 2, "name": "Free Homeowner's Guide", "item": "https://concreteconceptsgroup.com/guide" }
          ]
        }]}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAwdjYwTTAgMzBoNjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <BookOpen className="w-4 h-4" />
                Free Download — 13 Pages
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                The Brisbane Homeowner's
                <span className="text-amber-400 block mt-1">
                  Complete Guide to Concreting
                </span>
              </h1>
              <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
                Everything you need to know before starting a concreting project
                — from choosing the right finish and understanding costs, to
                council requirements and avoiding costly mistakes. Written by
                Brisbane's trusted concreters.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "Pricing tables by project size",
                  "Finish comparison guide",
                  "Council permit checklist",
                  "Brisbane soil & weather tips",
                  "Common mistakes to avoid",
                  "Pre-project checklist",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form or Success */}
            <div>
              {!submitted ? (
                <Card className="bg-white text-zinc-900 shadow-2xl border-0">
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-amber-600" />
                      </div>
                      <h2 className="text-xl font-bold text-zinc-900">
                        Get Your Free Guide
                      </h2>
                      <p className="text-sm text-zinc-500 mt-1">
                        Enter your details below for instant access
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-zinc-700 mb-1 block">
                          Your Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <Input
                            type="text"
                            placeholder="John Smith"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 bg-zinc-50 border-zinc-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-zinc-700 mb-1 block">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-zinc-50 border-zinc-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-zinc-700 mb-1 block">
                          Phone (optional)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <Input
                            type="tel"
                            placeholder="0400 000 000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            autoComplete="tel"
                            className="pl-10 bg-zinc-50 border-zinc-200"
                          />
                        </div>
                      </div>

                      <input
                        type="text"
                        name="website"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
                      />

                      {error && (
                        <p className="text-sm text-red-600 font-medium">
                          {error}
                        </p>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 text-lg"
                        disabled={submitGuide.isPending}
                      >
                        {submitGuide.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <Download className="w-5 h-5 mr-2" />
                        )}
                        {submitGuide.isPending
                          ? "Processing..."
                          : "Download Free Guide"}
                      </Button>

                      <p className="text-xs text-zinc-400 text-center">
                        We respect your privacy. No spam, ever.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white text-zinc-900 shadow-2xl border-0">
                  <CardContent className="p-6 md:p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">
                      Your Guide Is Ready!
                    </h2>
                    <p className="text-zinc-500 mb-6">
                      Click below to download your free copy of The Brisbane
                      Homeowner's Complete Guide to Concreting.
                    </p>
                    <Button
                      onClick={handleDownload}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 px-8 text-lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download PDF (13 Pages)
                    </Button>
                    <div className="mt-8 pt-6 border-t border-zinc-200">
                      <p className="text-sm text-zinc-500 mb-3">
                        Ready to start your project?
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                          href="/get-quote"
                          className="inline-flex items-center justify-center px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
                        >
                          Get a Free Quote
                        </a>
                        <a
                          href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
                          className="inline-flex items-center justify-center px-6 py-3 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          0424 463 268
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* What's Inside Section */}
      <section className="py-16 md:py-24 bg-zinc-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
              What's Inside the Guide
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              8 chapters covering every aspect of residential concreting in
              Brisbane — from choosing finishes to post-pour maintenance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CHAPTERS.map((chapter) => (
              <Card
                key={chapter.number}
                className="bg-white border-zinc-200 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-amber-700 font-bold text-sm">
                      {chapter.number}
                    </span>
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-2">
                    {chapter.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {chapter.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
              Written by Brisbane's Trusted Concreters
            </h2>
            <p className="text-zinc-600 leading-relaxed mb-8">
              This guide is based on real-world experience from hundreds of
              residential concreting projects across South-East Queensland.
              Concrete Concepts Group Pty Ltd is QBCC licensed (#15371652) and
              maintains a 4.9-star Google rating. We wrote this guide to help
              Brisbane homeowners make informed decisions — whether they hire us
              or not.
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-amber-500">500+</div>
                <div className="text-sm text-zinc-500 mt-1">
                  Projects Completed
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-500">4.9★</div>
                <div className="text-sm text-zinc-500 mt-1">Google Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-500">QBCC</div>
                <div className="text-sm text-zinc-500 mt-1">
                  Licensed & Insured
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
