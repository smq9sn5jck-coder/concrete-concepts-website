/*
  Referral Program Page
  Encourages past customers to refer friends/family for a reward
  Includes a simple referral form that submits via the quote system
*/
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLeadSource } from "@/hooks/useLeadSource";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackReferralSubmission, trackRemarketingEvent, trackPhoneCallClick } from "@/components/ConversionTracking";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { useEffect } from "react";
import {
  assessSubmissionSignals,
  classifyServiceArea,
  validateAustralianPhone,
} from "@shared/leadValidation";
import {
  Gift,
  Users,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Star,
  Phone,
  Mail,
} from "lucide-react";

const REWARD_AMOUNT = "$250";

const STEPS = [
  {
    icon: Users,
    title: "Refer a Friend",
    description:
      "Fill out the form below with your friend's details and your name. It takes less than 60 seconds.",
  },
  {
    icon: Phone,
    title: "We Reach Out",
    description:
      "Our team contacts your referral to discuss their project and provide a free, no-obligation quote.",
  },
  {
    icon: CheckCircle2,
    title: "They Book a Job",
    description:
      "Once your referral signs a contract and the project is completed, you earn your reward.",
  },
  {
    icon: Gift,
    title: `Get ${REWARD_AMOUNT} Cash`,
    description: `You receive ${REWARD_AMOUNT} cash or a gift card of your choice. It's our way of saying thanks!`,
  },
];

const FAQS = [
  {
    q: "Is there a limit to how many people I can refer?",
    a: "No limit! Refer as many people as you like. Each successful referral earns you the reward.",
  },
  {
    q: "When do I receive my reward?",
    a: "Within 7 days of the referred project being completed and paid in full.",
  },
  {
    q: "Does the person I refer get a discount?",
    a: "Yes! Your referral also receives a $100 discount on their project as a thank-you for choosing us.",
  },
  {
    q: "Do I need to be a past customer to refer someone?",
    a: "While we appreciate referrals from past customers most, anyone can refer a friend. The reward is paid once the project is completed.",
  },
  {
    q: "What types of projects qualify?",
    a: "Any concreting project over $2,000 qualifies — driveways, slabs, patios, retaining walls, pool surrounds, and more.",
  },
];

export default function ReferralPage() {
  const leadSource = useLeadSource();
  const [submitted, setSubmitted] = useState(false);
  const [website, setWebsite] = useState("");
  const formStartedAt = useRef(Date.now());
  const [formData, setFormData] = useState({
    referrerName: "",
    referrerPhone: "",
    referrerEmail: "",
    friendName: "",
    friendPhone: "",
    friendEmail: "",
    friendSuburb: "",
    projectDetails: "",
  });

  const submitQuote = trpc.quote.submit.useMutation({
    onSuccess: (result) => {
      trackReferralSubmission({ name: formData.referrerName, email: formData.referrerEmail, phone: formData.referrerPhone });
      setSubmitted(true);
      toast.success("Referral submitted! We'll be in touch soon.");
      if (result.serviceAreaStatus === "service_area_review") {
        toast.info("We'll confirm service availability for your friend's location.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again or call us.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.referrerName ||
      !formData.friendName ||
      !formData.friendPhone ||
      !formData.friendSuburb
    ) {
      toast.error("Please fill in the required fields.");
      return;
    }

    const friendPhone = validateAustralianPhone(formData.friendPhone);
    if (!friendPhone.valid) {
      toast.error(`Friend's phone: ${friendPhone.error}`);
      return;
    }
    if (formData.referrerPhone) {
      const referrerPhone = validateAustralianPhone(formData.referrerPhone);
      if (!referrerPhone.valid) {
        toast.error(`Your phone: ${referrerPhone.error}`);
        return;
      }
    }
    const serviceArea = classifyServiceArea(formData.friendSuburb);
    if (!serviceArea.canSubmit) {
      toast.error(serviceArea.message);
      return;
    }
    const signals = assessSubmissionSignals({ honeypot: website, startedAt: formStartedAt.current });
    if (!signals.allowed) {
      toast.error("Please check the form and try again.");
      return;
    }

    const details = [
      `REFERRAL from ${formData.referrerName}`,
      formData.referrerPhone
        ? `Referrer phone: ${formData.referrerPhone}`
        : "",
      formData.referrerEmail
        ? `Referrer email: ${formData.referrerEmail}`
        : "",
      `---`,
      formData.projectDetails
        ? `Project details: ${formData.projectDetails}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    submitQuote.mutate({
      name: formData.friendName,
      phone: friendPhone.normalized,
      email: formData.friendEmail || "referral@concreteconceptsgroup.com",
      suburb: serviceArea.normalized,
      service: "Referral",
      details,
      website,
      formStartedAt: formStartedAt.current,
      leadSource: leadSource.leadSource || "referral-page",
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

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Refer a Friend & Earn $250 | Concrete Concepts Group"
        description={`Know someone who needs concreting? Refer them to Concrete Concepts Group and earn ${REWARD_AMOUNT} cash when their project is completed. No limit on referrals.`}
        canonical="/referral"
        structuredData={[{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://concreteconceptsgroup.com" },
            { "@type": "ListItem", "position": 2, "name": "Refer a Friend", "item": "https://concreteconceptsgroup.com/referral" }
          ]
        }]}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-brand-charcoal py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #c8a55c 1px, transparent 1px), radial-gradient(circle at 80% 50%, #c8a55c 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-yellow/20 text-brand-yellow px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Gift className="w-4 h-4" />
            Referral Program
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Refer a Friend, Earn{" "}
            <span className="text-brand-yellow">{REWARD_AMOUNT} Cash</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Know someone who needs a new driveway, patio, or slab? Send them our
            way and we'll reward you with {REWARD_AMOUNT} when their project is
            completed.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#referral-form"
              className="inline-flex items-center gap-2 bg-brand-yellow text-brand-charcoal px-8 py-4 rounded-lg font-bold text-lg hover:bg-brand-yellow/90 transition-colors"
            >
              Refer Someone Now
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg hover:border-brand-yellow hover:text-brand-yellow transition-colors"
            >
              <Phone className="w-5 h-5" />
              0424 463 268
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="container">
          <h2
            className="text-3xl md:text-4xl font-bold text-center text-brand-charcoal mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            How It Works
          </h2>
          <p className="text-gray-600 text-center max-w-xl mx-auto mb-12">
            Four simple steps to earn {REWARD_AMOUNT}. No catches, no fine
            print.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                  <step.icon className="w-8 h-8 text-brand-yellow" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-charcoal text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3
                  className="text-lg font-bold text-brand-charcoal mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reward Highlight */}
      <section className="py-12 bg-brand-yellow">
        <div className="container text-center">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-brand-charcoal" />
              <div className="text-left">
                <p className="text-2xl font-bold text-brand-charcoal">
                  {REWARD_AMOUNT}
                </p>
                <p className="text-sm text-brand-charcoal/70">
                  Per successful referral
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-brand-charcoal" />
              <div className="text-left">
                <p className="text-2xl font-bold text-brand-charcoal">$100</p>
                <p className="text-sm text-brand-charcoal/70">
                  Discount for your friend
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-brand-charcoal" />
              <div className="text-left">
                <p className="text-2xl font-bold text-brand-charcoal">
                  Unlimited
                </p>
                <p className="text-sm text-brand-charcoal/70">
                  No cap on referrals
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Form */}
      <section id="referral-form" className="py-16 md:py-24">
        <div className="container max-w-2xl">
          <h2
            className="text-3xl md:text-4xl font-bold text-center text-brand-charcoal mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Submit Your Referral
          </h2>
          <p className="text-gray-600 text-center mb-10">
            Fill in the details below and we'll take care of the rest.
          </p>

          {submitted ? (
            <div className="text-center py-16 bg-green-50 rounded-2xl border border-green-200">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3
                className="text-2xl font-bold text-brand-charcoal mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Referral Submitted!
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Thanks for the referral! We'll reach out to your friend within
                24 hours. You'll receive your {REWARD_AMOUNT} reward once their
                project is completed.
              </p>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    referrerName: "",
                    referrerPhone: "",
                    referrerEmail: "",
                    friendName: "",
                    friendPhone: "",
                    friendEmail: "",
                    friendSuburb: "",
                    projectDetails: "",
                  });
                  setWebsite("");
                  formStartedAt.current = Date.now();
                }}
                variant="outline"
              >
                Refer Another Friend
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Your Details */}
              <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                <h3
                  className="text-lg font-bold text-brand-charcoal mb-4 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <Users className="w-5 h-5 text-brand-yellow" />
                  Your Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Your Name *
                    </label>
                    <Input
                      value={formData.referrerName}
                      onChange={(e) =>
                        update("referrerName", e.target.value)
                      }
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Your Phone
                    </label>
                    <Input
                      value={formData.referrerPhone}
                      onChange={(e) =>
                        update("referrerPhone", e.target.value)
                      }
                      placeholder="04XX XXX XXX"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Your Email
                    </label>
                    <Input
                      type="email"
                      value={formData.referrerEmail}
                      onChange={(e) =>
                        update("referrerEmail", e.target.value)
                      }
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Friend's Details */}
              <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                <h3
                  className="text-lg font-bold text-brand-charcoal mb-4 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <Gift className="w-5 h-5 text-brand-yellow" />
                  Friend's Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Friend's Name *
                    </label>
                    <Input
                      value={formData.friendName}
                      onChange={(e) =>
                        update("friendName", e.target.value)
                      }
                      placeholder="Their full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Friend's Phone *
                    </label>
                    <Input
                      type="tel"
                      value={formData.friendPhone}
                      onChange={(e) =>
                        update("friendPhone", e.target.value)
                      }
                      placeholder="04XX XXX XXX"
                      autoComplete="tel"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Friend's Email
                    </label>
                    <Input
                      type="email"
                      value={formData.friendEmail}
                      onChange={(e) =>
                        update("friendEmail", e.target.value)
                      }
                      placeholder="friend@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Friend's Suburb or Postcode *
                    </label>
                    <Input
                      value={formData.friendSuburb}
                      onChange={(e) =>
                        update("friendSuburb", e.target.value)
                      }
                      placeholder="e.g. Camp Hill"
                      autoComplete="postal-code"
                      required
                    />
                    {formData.friendSuburb && classifyServiceArea(formData.friendSuburb).status === "service_area_review" && (
                      <p className="text-xs text-amber-700 mt-1">
                        You can continue — we&apos;ll confirm availability for this Queensland location.
                      </p>
                    )}
                  </div>
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

              {/* Project Details */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  What does your friend need? (optional)
                </label>
                <Textarea
                  value={formData.projectDetails}
                  onChange={(e) =>
                    update("projectDetails", e.target.value)
                  }
                  placeholder="e.g. New driveway, about 50m², exposed aggregate finish..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-brand-yellow text-brand-charcoal hover:bg-brand-yellow/90 font-bold text-lg py-6"
                disabled={submitQuote.isPending}
              >
                {submitQuote.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Submit Referral
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By submitting, you confirm your friend is expecting our call.
                We'll mention your name when we reach out.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="container max-w-3xl">
          <h2
            className="text-3xl md:text-4xl font-bold text-center text-brand-charcoal mb-12"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden group"
              >
                <summary className="px-6 py-4 cursor-pointer font-semibold text-brand-charcoal hover:text-brand-yellow transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90 flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-charcoal text-center">
        <div className="container">
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to Earn{" "}
            <span className="text-brand-yellow">{REWARD_AMOUNT}</span>?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            It only takes a minute to submit a referral. No limit on how many
            you can send — the more you refer, the more you earn.
          </p>
          <a
            href="#referral-form"
            className="inline-flex items-center gap-2 bg-brand-yellow text-brand-charcoal px-8 py-4 rounded-lg font-bold text-lg hover:bg-brand-yellow/90 transition-colors"
          >
            <Gift className="w-5 h-5" />
            Refer a Friend Now
          </a>
        </div>
      </section>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
