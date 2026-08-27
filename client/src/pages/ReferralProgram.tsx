import {
  ArrowLeft,
  BadgeDollarSign,
  CheckCircle2,
  ClipboardCheck,
  Hammer,
  Handshake,
  PhoneCall,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ReferralForm from "@/components/ReferralForm";
import { usePageMetadata } from "@/lib/page-metadata";

const PROJECTS = [
  "Driveways and crossovers",
  "House and shed slabs",
  "Patios and entertaining areas",
  "Exposed aggregate concrete",
  "Pool surrounds",
  "Paths, stairs and footpaths",
  "Retaining walls",
  "Excavation and preparation",
];

const STEPS = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Send the referral",
    description:
      "Provide your details and the customer’s name, phone number, suburb and project type.",
  },
  {
    number: "02",
    icon: PhoneCall,
    title: "We quote the job",
    description:
      "Concrete Concepts contacts the customer, inspects the project and provides the quote.",
  },
  {
    number: "03",
    icon: BadgeDollarSign,
    title: "You receive $100",
    description:
      "After the referred job is completed and paid in full, we arrange your $100 reward.",
  },
];

export default function ReferralProgram() {
  usePageMetadata({
    title: "$100 Concreting Referral Program | Concrete Concepts",
    description:
      "Refer a Brisbane or SEQ concreting job to Concrete Concepts and receive $100 after the eligible job is completed and paid.",
    canonicalUrl: "https://concreteconceptsgroup.com/trade-referral-program",
  });

  return (
    <div className="min-h-screen bg-bone text-charcoal">
      <Navbar />

      <main>
        <section
          className="relative overflow-hidden pb-20 pt-28 text-bone sm:pb-24 sm:pt-32"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, rgba(201,164,77,0.18), transparent 32%), linear-gradient(135deg, #091e30 0%, #0F2A44 68%, #173c5d 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />
          <div className="container relative grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <a
                href="/"
                className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-bone/70 transition hover:text-gold"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Concrete Concepts
              </a>
              <div className="mb-5 inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-gold">
                <Handshake className="h-4 w-4" /> Open to private, builder and
                trade referrals
              </div>
              <h1
                className="max-w-4xl text-4xl font-bold leading-[1.04] sm:text-5xl lg:text-7xl"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Refer a concreting job.
                <span className="mt-2 block text-gold">Receive $100.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-bone/75 sm:text-lg">
                Know someone planning a driveway, slab, patio, retaining wall or
                other concrete project in Brisbane or South East Queensland?
                Send us the opportunity and we’ll reward a successful referral.
              </p>
              <a
                href="#refer-a-job"
                className="btn-gold mt-8 inline-flex px-7 py-4 text-base"
              >
                Refer a job now
              </a>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              <div className="absolute -inset-4 rotate-3 border border-gold/25" />
              <div className="relative border border-gold/40 bg-white/[0.06] p-7 backdrop-blur-sm sm:p-9">
                <p className="mono-stamp text-xs uppercase tracking-[0.22em] text-gold">
                  Referral reward
                </p>
                <div
                  className="mt-3 text-[6rem] font-black leading-none text-bone sm:text-[7.5rem]"
                  style={{ fontFamily: "Oswald, sans-serif" }}
                >
                  $100
                </div>
                <p className="mt-4 border-t border-white/15 pt-5 text-sm leading-relaxed text-bone/70">
                  Payable after the referred job is completed and the customer
                  invoice is paid in full, subject to the referral terms.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-semibold text-bone/75">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold" /> No sign-up
                    fee
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold" /> Simple form
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold" /> Direct
                    contact
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold" /> Tracked
                    reference
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-18 sm:py-22">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <p className="mono-stamp text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
                How it works
              </p>
              <h2
                className="mt-3 text-3xl font-bold text-navy sm:text-4xl"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Three straightforward steps
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {STEPS.map(step => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.number}
                    className="group relative overflow-hidden border border-bone-dark bg-bone/50 p-6 transition duration-200 hover:-translate-y-1 hover:border-gold/60 hover:shadow-xl"
                  >
                    <span
                      className="absolute right-4 top-1 text-6xl font-black text-navy/[0.05]"
                      style={{ fontFamily: "Oswald, sans-serif" }}
                    >
                      {step.number}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center bg-navy text-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3
                      className="mt-5 text-xl font-bold text-navy"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/65">
                      {step.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-bone py-18 sm:py-22">
          <div className="container grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <div>
              <p className="mono-stamp text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
                Suitable work
              </p>
              <h2
                className="mt-3 text-3xl font-bold text-navy sm:text-4xl"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                The type of jobs we want to hear about
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-charcoal/70">
                We service Brisbane and surrounding South East Queensland areas.
                If the customer is unsure about the exact finish or scope, send
                the referral anyway and we can talk it through with them.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {PROJECTS.map(project => (
                  <div
                    key={project}
                    className="flex items-center gap-3 border-l-2 border-gold bg-white px-4 py-3 text-sm font-semibold text-navy shadow-sm"
                  >
                    <Hammer className="h-4 w-4 shrink-0 text-gold-dark" />
                    {project}
                  </div>
                ))}
              </div>
            </div>

            <div
              id="refer-a-job"
              className="scroll-mt-24 border-t-4 border-gold bg-white p-5 shadow-2xl sm:p-8"
            >
              <div className="mb-7">
                <p className="mono-stamp text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
                  Referral form
                </p>
                <h2
                  className="mt-2 text-3xl font-bold text-navy"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  Refer a job
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/65">
                  Please confirm the customer has agreed to be contacted before
                  supplying their details.
                </p>
              </div>
              <ReferralForm />
            </div>
          </div>
        </section>

        <section className="bg-white py-18 sm:py-22">
          <div className="container grid gap-8 lg:grid-cols-2">
            <div className="border border-bone-dark p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-gold-dark" />
                <h2
                  className="text-2xl font-bold text-navy"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  Referral terms
                </h2>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-relaxed text-charcoal/70">
                <p>
                  The reward applies to new eligible opportunities not already
                  known to Concrete Concepts. If the same opportunity is
                  referred more than once, the earliest valid submission is
                  normally treated as the qualifying referral.
                </p>
                <p>
                  The $100 reward becomes payable only after the referred work
                  is accepted, completed and paid in full. Concrete Concepts
                  retains discretion over job acceptance, eligibility and
                  payment.
                </p>
              </div>
            </div>

            <div className="border border-bone-dark p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <UserRoundCheck className="h-8 w-8 text-gold-dark" />
                <h2
                  className="text-2xl font-bold text-navy"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  Customer privacy
                </h2>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-relaxed text-charcoal/70">
                <p>
                  Only provide a customer’s name and phone number after they
                  have agreed for Concrete Concepts to contact them about the
                  proposed work.
                </p>
                <p>
                  The supplied information will be used to assess and respond to
                  the referred project and to administer the referral program.
                  Payment details are never requested through this public form.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
