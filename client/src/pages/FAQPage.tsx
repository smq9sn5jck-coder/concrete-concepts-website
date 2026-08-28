/*
  Dedicated FAQ Page — Concrete Concepts Group
  Comprehensive FAQs organized by category with FAQPage JSON-LD schema markup
  Targets long-tail keywords: "concrete driveway questions brisbane", "concreting FAQ", etc.
*/
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";
import { ChevronDown, Phone, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { trackPhoneCallClick } from "@/components/ConversionTracking";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: string;
  faqs: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    title: "Pricing & Quotes",
    icon: "💰",
    faqs: [
      {
        question: "How much does a concrete driveway cost in Brisbane?",
        answer:
          "Concrete driveway costs in Brisbane typically range from $65 to $150 per square metre for standard finishes, and $100 to $200+ per square metre for exposed aggregate or decorative finishes. A standard two-car driveway (40–50m²) usually costs between $3,500 and $8,000 depending on the finish, site access, slope, and whether demolition of an existing surface is required. We provide free, detailed quotes so you know exactly what to expect.",
      },
      {
        question: "How much does a concrete slab cost in Brisbane?",
        answer:
          "Concrete slab costs in Brisbane range from $75 to $120 per square metre for a standard 100mm slab, depending on size, thickness, reinforcement, and site preparation required. A typical garage slab (36m²) costs $3,000–$5,000, while a house slab (100m²+) can range from $8,000 to $15,000+. Factors like soil type, slope, plumbing penetrations, and edge beams all affect the final price.",
      },
      {
        question: "Do you offer free quotes?",
        answer:
          "Yes, we offer completely free, no-obligation quotes for all concreting work. Simply fill out our online quote form or call us on 0424 463 268, and we'll arrange a convenient time to visit your property. During the site visit, we measure up, assess conditions, and provide a detailed written quote — usually within 24 to 48 hours.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept bank transfer (EFT), credit card, and cash. For larger projects, we offer progress payment schedules — typically a deposit to secure your booking, a progress payment at the halfway point, and the balance on completion. All payment terms are clearly outlined in your written quote before any work begins.",
      },
      {
        question: "Are there any hidden costs I should know about?",
        answer:
          "No. Our quotes are comprehensive and include all labour, materials, site preparation, and clean-up. If we discover unexpected issues during the project (such as poor soil conditions or hidden services), we'll discuss any additional costs with you before proceeding. We believe in transparent pricing with no surprises.",
      },
    ],
  },
  {
    title: "Concrete Types & Finishes",
    icon: "🎨",
    faqs: [
      {
        question: "What types of concrete finishes do you offer?",
        answer:
          "We offer a full range of finishes: plain (broom or steel-trowel) finish, exposed aggregate with various stone blends, honed and polished concrete, coloured concrete using oxide pigments, and stamped or stencilled patterns. Each has different durability, slip-resistance, and maintenance characteristics. We're happy to show you samples during your free quote visit.",
      },
      {
        question: "What is exposed aggregate concrete?",
        answer:
          "Exposed aggregate is a decorative concrete finish where the top layer of cement paste is washed away before it fully sets, revealing the natural stones within the mix. It creates a textured, slip-resistant surface that's both attractive and durable. You can choose from a wide range of stone colours and blends to match your home's style. It's one of the most popular finishes for Brisbane driveways and outdoor areas.",
      },
      {
        question: "What is the difference between exposed aggregate and plain concrete?",
        answer:
          "Plain concrete has a smooth or broom-finished surface and costs $65–$100/m². Exposed aggregate reveals decorative stones for a textured look and costs $100–$180/m². Exposed aggregate offers better slip resistance, hides minor imperfections, requires less frequent sealing, and significantly boosts your property's street appeal. For driveways, exposed aggregate is the most popular choice in Brisbane.",
      },
      {
        question: "Can I choose the colour of my concrete?",
        answer:
          "Absolutely. We offer a wide range of colour options through oxide pigments that are mixed into the concrete before pouring. Popular colours in Brisbane include charcoal, sandstone, terracotta, and various grey tones. For exposed aggregate, the stone blend itself determines the colour palette. We can also apply coloured sealers for additional toning. We'll bring colour charts and samples to your quote visit.",
      },
      {
        question: "What concrete finish is best for pool surrounds?",
        answer:
          "For pool surrounds, we recommend exposed aggregate or honed concrete with a non-slip finish. These surfaces provide excellent grip when wet, stay cooler underfoot than dark-coloured options, and are resistant to pool chemicals. We also ensure proper drainage falls away from the pool. Salt-resistant sealers are applied to protect against chlorine and salt damage.",
      },
    ],
  },
  {
    title: "Project Timeline & Process",
    icon: "⏱️",
    faqs: [
      {
        question: "How long does a concrete project take from start to finish?",
        answer:
          "Most residential projects take 2 to 5 days of on-site work, depending on size and complexity. A standard driveway is typically 2–3 days, while larger projects like house slabs may take 4–5 days. After pouring, concrete needs at least 7 days of curing before light foot traffic and 28 days before vehicles can drive on it. We provide a clear timeline during the quoting process.",
      },
      {
        question: "How long does concrete take to cure in Brisbane's climate?",
        answer:
          "In Brisbane's subtropical climate, concrete reaches about 70% of its strength within 7 days and full strength at 28 days. Light foot traffic is usually safe after 24–48 hours. Vehicles should stay off for at least 7 days (14 days for heavy vehicles). Brisbane's warm temperatures actually help curing, but we take extra precautions in summer heat to prevent rapid moisture loss, including curing compounds and wet curing methods.",
      },
      {
        question: "What is your process from quote to completion?",
        answer:
          "Our process is straightforward: (1) Free site visit and detailed quote within 24–48 hours, (2) Booking confirmation with a deposit, (3) Site preparation including excavation, formwork, and sub-base compaction, (4) Steel reinforcement installation, (5) Concrete pour and finishing, (6) Curing period with aftercare instructions, (7) Final inspection and handover. We keep you informed at every stage.",
      },
      {
        question: "Can you work in wet weather?",
        answer:
          "Light rain before or after the pour is generally fine, but we avoid pouring concrete during heavy rain as it can weaken the surface and cause finishing issues. Brisbane's weather can be unpredictable, so we monitor forecasts closely and will reschedule if conditions aren't suitable. Any weather delays are communicated promptly, and we always prioritise quality over speed.",
      },
      {
        question: "Do I need to be home during the work?",
        answer:
          "You don't need to be home for the entire project, but we do recommend being available at the start of each day to discuss any questions. We'll need access to water and power on site. Many of our clients continue their normal routine while we work — we're respectful of your property and always leave the site clean and tidy at the end of each day.",
      },
    ],
  },
  {
    title: "Permits & Regulations",
    icon: "📋",
    faqs: [
      {
        question: "Do I need council approval for concreting work in Brisbane?",
        answer:
          "Most standard residential concreting (driveways, patios, paths) does not require council approval in Brisbane. However, you may need permits for: crossover (vehicle crossing) work connecting to the street, changes to stormwater drainage, work near property boundaries, retaining walls over 1 metre high, or work on heritage-listed properties. We advise on permit requirements during our site inspection.",
      },
      {
        question: "What is a driveway crossover and do I need a permit?",
        answer:
          "A driveway crossover is the section of driveway that crosses the council footpath and connects your property to the road. In Brisbane, you need a Brisbane City Council (BCC) permit for any new crossover or modification to an existing one. The permit costs approximately $200–$500 and takes 2–4 weeks to process. We can handle the permit application on your behalf as part of our service.",
      },
      {
        question: "Are you licensed and insured?",
        answer:
          "Yes. Concrete Concepts Group is fully licensed under the Queensland Building and Construction Commission (QBCC), meaning we meet strict financial and technical standards. We carry comprehensive public liability insurance and workers' compensation coverage. This protects you, your property, and our team on every job. We're happy to provide our licence and insurance details on request.",
      },
      {
        question: "Do retaining walls need engineering approval?",
        answer:
          "In Queensland, retaining walls over 1 metre in height generally require engineering design and may need building approval from your local council. Walls near boundaries, supporting structures, or on sloping sites may have additional requirements regardless of height. We work with qualified structural engineers and can manage the entire approval process for you.",
      },
    ],
  },
  {
    title: "Maintenance & Aftercare",
    icon: "🔧",
    faqs: [
      {
        question: "How do I maintain my new concrete?",
        answer:
          "Concrete is low-maintenance, but a little care extends its life significantly. We recommend: sealing every 2–3 years to protect against staining and UV damage, regular sweeping to remove debris, occasional pressure washing (low pressure for exposed aggregate), prompt clean-up of oil or chemical spills, and avoiding harsh chemicals. We provide detailed aftercare instructions with every completed project.",
      },
      {
        question: "How often should I seal my concrete?",
        answer:
          "We recommend resealing every 2 to 3 years for driveways and high-traffic areas, and every 3 to 5 years for patios and low-traffic surfaces. In Brisbane's climate, UV exposure and heavy rain are the main factors that break down sealers. Signs it's time to reseal include water no longer beading on the surface, fading colour, or a chalky appearance. We offer resealing services and can set up a maintenance schedule for you.",
      },
      {
        question: "Will my concrete crack?",
        answer:
          "All concrete has the potential to develop minor hairline cracks over time — this is a natural characteristic of the material. However, we minimise cracking through proper sub-base preparation, steel reinforcement, control joints (planned weak points that guide any cracking), correct concrete mix design, and proper curing techniques. Structural cracking is extremely rare when concrete is installed correctly by licensed professionals.",
      },
      {
        question: "Can cracked concrete be repaired?",
        answer:
          "Yes, depending on the type and severity. Hairline cracks can be sealed with flexible crack fillers. Wider structural cracks may require epoxy injection or grinding and resurfacing. If the concrete has significant settlement or heaving, partial or full replacement may be the best long-term solution. We offer free assessments of existing concrete to recommend the most cost-effective repair approach.",
      },
      {
        question: "Can you remove and replace my old concrete?",
        answer:
          "Yes, we handle the full process from demolition through to the new pour and finish. Our team uses professional equipment to break up and remove old slabs, prepare the sub-base, and install new concrete to current standards. We also handle responsible disposal of old materials. If your existing concrete is cracked, sinking, or outdated, a full replacement is often the best long-term investment.",
      },
    ],
  },
  {
    title: "Service Areas & Availability",
    icon: "📍",
    faqs: [
      {
        question: "What areas do you service in Brisbane?",
        answer:
          "We service all of Brisbane and surrounding areas across South East Queensland — including Ipswich, Logan, Moreton Bay, Redlands, the Gold Coast, Sunshine Coast, Caboolture, Springfield, and more. From inner-city suburbs like Paddington and New Farm to outer areas like North Lakes and Redland Bay, we're happy to come to you. Check our service areas page for a full list of suburbs we cover.",
      },
      {
        question: "How far in advance do I need to book?",
        answer:
          "Our typical lead time is 2 to 4 weeks from quote acceptance to project start, though this varies with seasonal demand. Spring and autumn are our busiest periods. For urgent projects, we do our best to accommodate shorter timeframes. We recommend getting your quote early so you can secure a spot in our schedule that works for you.",
      },
      {
        question: "Do you do commercial concreting work?",
        answer:
          "Our primary focus is residential concreting — driveways, patios, paths, slabs, pool surrounds, and retaining walls. However, we do take on select commercial projects such as car parks, warehouse slabs, and commercial pathways. Contact us with your project details and we'll let you know if it's something we can help with.",
      },
      {
        question: "Can I see examples of your previous work?",
        answer:
          "Absolutely! Visit our Projects page to see photos of completed driveways, patios, slabs, and more across Brisbane. We also have a before-and-after gallery showing transformations. You can also find us on Google and HiPages where past clients have left reviews and photos of our work. During your quote visit, we can show you completed projects in your local area.",
      },
    ],
  },
];

// Flatten all FAQs for schema markup
const allFaqs = faqCategories.flatMap((cat) => cat.faqs);

// Build JSON-LD FAQPage schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

// BreadcrumbList schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://concreteconceptsgroup.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "FAQ",
      item: "https://concreteconceptsgroup.com/faq",
    },
  ],
};

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-brand-charcoal/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 sm:py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className="text-base sm:text-lg font-semibold text-brand-charcoal pr-4 group-hover:text-brand-gold-dark transition-colors duration-200"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {item.question}
        </span>
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? "bg-brand-gold text-brand-charcoal rotate-180"
              : "bg-brand-charcoal/5 text-brand-charcoal/50 group-hover:bg-brand-gold/20 group-hover:text-brand-gold-dark"
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[600px] opacity-100 pb-5" : "max-h-0 opacity-0"
        }`}
      >
        <p
          className="text-brand-charcoal/70 leading-relaxed pr-10"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {item.answer}
        </p>
      </div>
    </div>
  );
}

function FAQCategorySection({
  category,
  openIndices,
  onToggle,
  startIndex,
}: {
  category: FAQCategory;
  openIndices: Set<number>;
  onToggle: (index: number) => void;
  startIndex: number;
}) {
  return (
    <div className="mb-10">
      <h2
        className="text-xl sm:text-2xl font-bold text-brand-charcoal mb-4 flex items-center gap-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <span className="text-2xl">{category.icon}</span>
        {category.title}
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-brand-charcoal/5 px-5 sm:px-7">
        {category.faqs.map((faq, i) => {
          const globalIndex = startIndex + i;
          return (
            <FAQAccordionItem
              key={globalIndex}
              item={faq}
              isOpen={openIndices.has(globalIndex)}
              onToggle={() => onToggle(globalIndex)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0]));

  const handleToggle = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  let runningIndex = 0;

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title="Frequently Asked Questions | Concrete Concepts Group Brisbane"
        description="Get answers to common questions about concrete driveways, slabs, exposed aggregate, retaining walls, costs, timelines, and maintenance in Brisbane. QBCC licensed concreting experts."
        canonical="/faq"
        keywords="concrete FAQ Brisbane, concreting questions, concrete driveway cost Brisbane, exposed aggregate FAQ, concrete maintenance Brisbane, QBCC licensed concreter"
        structuredData={[faqSchema, breadcrumbSchema]}
      />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-px bg-brand-gold" />
              <span
                className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Your Questions Answered
              </span>
              <div className="w-10 h-px bg-brand-gold" />
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-charcoal leading-tight mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Frequently Asked{" "}
              <span className="text-brand-gold italic">Questions</span>
            </h1>
            <p
              className="text-brand-charcoal/60 text-lg max-w-2xl mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Everything you need to know about our Brisbane concreting services.
              Browse by category or{" "}
              <a href="#contact-cta" className="text-brand-gold hover:text-brand-gold-dark underline">
                contact us
              </a>{" "}
              if you can't find your answer.
            </p>
          </div>

          {/* Quick Jump Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {faqCategories.map((cat, i) => (
              <a
                key={i}
                href={`#faq-cat-${i}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-brand-charcoal/10 text-sm font-medium text-brand-charcoal hover:border-brand-gold hover:text-brand-gold-dark transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <span>{cat.icon}</span>
                {cat.title}
              </a>
            ))}
          </div>

          {/* FAQ Categories */}
          {faqCategories.map((category, catIndex) => {
            const sectionStartIndex = runningIndex;
            runningIndex += category.faqs.length;
            return (
              <div key={catIndex} id={`faq-cat-${catIndex}`}>
                <FAQCategorySection
                  category={category}
                  openIndices={openIndices}
                  onToggle={handleToggle}
                  startIndex={sectionStartIndex}
                />
              </div>
            );
          })}

          {/* Contact CTA */}
          <div
            id="contact-cta"
            className="mt-14 bg-brand-charcoal rounded-2xl p-8 sm:p-10 text-center"
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Still Have Questions?
            </h2>
            <p
              className="text-white/70 text-lg mb-6 max-w-xl mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Our team is here to help. Get in touch for a free, no-obligation
              chat about your concreting project.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
                className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Phone className="w-5 h-5" />
                Call 0424 463 268
              </a>
              <Link
                href="/get-quote"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 border border-white/20 w-full sm:w-auto justify-center"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <MessageSquare className="w-5 h-5" />
                Request a Free Quote
              </Link>
            </div>
          </div>

          {/* Related Resources */}
          <div className="mt-14">
            <h2
              className="text-xl font-bold text-brand-charcoal mb-5"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Helpful Resources
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/calculator"
                className="bg-white rounded-xl p-5 border border-brand-charcoal/5 hover:border-brand-gold/30 hover:shadow-md transition-all group"
              >
                <span className="text-2xl mb-2 block">🧮</span>
                <h3
                  className="font-semibold text-brand-charcoal group-hover:text-brand-gold-dark transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Cost Calculator
                </h3>
                <p className="text-sm text-brand-charcoal/60 mt-1" style={{ fontFamily: "var(--font-body)" }}>
                  Get an instant estimate for your project
                </p>
              </Link>
              <Link
                href="/blog"
                className="bg-white rounded-xl p-5 border border-brand-charcoal/5 hover:border-brand-gold/30 hover:shadow-md transition-all group"
              >
                <span className="text-2xl mb-2 block">📚</span>
                <h3
                  className="font-semibold text-brand-charcoal group-hover:text-brand-gold-dark transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Blog & Guides
                </h3>
                <p className="text-sm text-brand-charcoal/60 mt-1" style={{ fontFamily: "var(--font-body)" }}>
                  In-depth articles on concrete care and costs
                </p>
              </Link>
              <Link
                href="/projects"
                className="bg-white rounded-xl p-5 border border-brand-charcoal/5 hover:border-brand-gold/30 hover:shadow-md transition-all group"
              >
                <span className="text-2xl mb-2 block">📸</span>
                <h3
                  className="font-semibold text-brand-charcoal group-hover:text-brand-gold-dark transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Our Projects
                </h3>
                <p className="text-sm text-brand-charcoal/60 mt-1" style={{ fontFamily: "var(--font-body)" }}>
                  Browse photos of completed work
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
