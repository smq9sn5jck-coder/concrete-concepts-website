/*
  DESIGN: Refined Craft — Concrete Concepts Group brand
  FAQ: Accordion-style Q&A with gold accents, warm off-white background
  SEO-optimized with structured data (JSON-LD FAQPage schema)
*/
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How much does a concrete driveway cost in Brisbane?",
    answer:
      "Driveway pricing depends on dimensions, concrete thickness, reinforcement, finish, access, slope, drainage, pumping and any demolition or excavation. Use the detailed quote form to provide the site information CCG needs to assess the project and prepare a written scope.",
  },
  {
    question: "What types of concrete finishes do you offer?",
    answer:
      "Depending on the project, options may include plain broom or trowel finishes, exposed aggregate, coloured concrete and other decorative treatments. CCG will confirm which finishes are suitable for the intended use, access, slope and maintenance requirements.",
  },
  {
    question: "How long does a concrete project take from start to finish?",
    answer:
      "The programme depends on project size, access, preparation, reinforcement, weather, concrete supply and the selected finish. CCG confirms the proposed work sequence during quoting and provides project-specific curing and use guidance after the pour.",
  },
  {
    question: "Do I need council approval for concreting work?",
    answer:
      "Approval requirements vary by council, property and scope. Crossovers, stormwater changes, boundary work, easements and heritage controls can require additional checks. Property owners should confirm requirements with the relevant council or qualified certifier; CCG can identify project details that may need clarification.",
  },
  {
    question: "What licence and project documents can I review?",
    answer:
      "Concrete Concepts Group operates under QBCC licence 15299707. Before accepting a quote, customers can ask the team for the proposed written scope, contract details and current licence information relevant to the project.",
  },
  {
    question: "What areas do you service?",
    answer:
      "CCG reviews projects across Brisbane and selected South East Queensland areas, including parts of Logan, Ipswich, Moreton Bay, Redlands and the Gold Coast. Enter the project suburb or postcode in the detailed quote so the team can confirm coverage and access suitability.",
  },
  {
    question: "How do I maintain my new concrete?",
    answer:
      "Maintenance depends on the concrete mix, finish, exposure and any sealer used. Follow the project-specific curing and aftercare information supplied for the finished surface, and ask before using pressure washing, chemicals, vehicles or resealing products.",
  },
  {
    question: "Can you remove and replace my old concrete?",
    answer:
      "Removal of existing concrete, material disposal, sub-base preparation and replacement can be assessed as part of the project scope where site access and conditions are suitable. Include photos and access notes so CCG can review what equipment and preparation may be required.",
  },
  {
    question: "What is the difference between exposed aggregate and plain concrete?",
    answer:
      "Plain concrete commonly uses a broom or trowel finish. Exposed aggregate reveals the selected stones within the mix to create a more textured decorative surface. Mix, finish, slope, intended use and maintenance should all be considered when comparing options.",
  },
  {
    question: "Do you offer free quotes?",
    answer:
      "You can request a free initial quote review through the five-step form or call 0424 463 268. If a site visit is required, CCG will arrange it subject to location and scheduling before preparing the applicable written scope and price.",
  },
];

function FAQAccordionItem({ item, isOpen, onToggle, index }: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-brand-charcoal/10 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 sm:py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className="text-base sm:text-lg font-semibold text-brand-charcoal pr-4 group-hover:text-brand-gold-dark transition-colors duration-200"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {item.question}
        </span>
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
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
          isOpen ? "max-h-[500px] opacity-100 pb-5 sm:pb-6" : "max-h-0 opacity-0"
        }`}
      >
        <p
          className="text-brand-charcoal/70 leading-relaxed pr-12"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {item.answer}
        </p>
      </div>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Split FAQs into two columns for desktop
  const midpoint = Math.ceil(faqs.length / 2);
  const leftColumn = faqs.slice(0, midpoint);
  const rightColumn = faqs.slice(midpoint);

  return (
    <section id="faq" className="py-24 lg:py-32 bg-brand-offwhite relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      }} />

      <div className="container relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 lg:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-px bg-brand-gold" />
            <span
              className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Common Questions
            </span>
            <div className="w-10 h-px bg-brand-gold" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-charcoal leading-tight mb-4">
            Frequently Asked{" "}
            <span className="text-brand-gold italic">Questions</span>
          </h2>

          <p
            className="text-brand-charcoal/60 text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Everything you need to know about our concreting services.
            Can't find the answer you're looking for? Get in touch with our team.
          </p>
        </motion.div>

        {/* FAQ Accordion — Two columns on desktop */}
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-x-12 gap-y-0">
            {/* Left Column */}
            <div className="bg-white rounded-xl shadow-sm border border-brand-charcoal/5 px-6 sm:px-8 divide-y-0">
              {leftColumn.map((item, index) => (
                <FAQAccordionItem
                  key={index}
                  item={item}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                  index={index}
                />
              ))}
            </div>

            {/* Right Column */}
            <div className="bg-white rounded-xl shadow-sm border border-brand-charcoal/5 px-6 sm:px-8 divide-y-0 mt-4 lg:mt-0">
              {rightColumn.map((item, index) => {
                const actualIndex = index + midpoint;
                return (
                  <FAQAccordionItem
                    key={actualIndex}
                    item={item}
                    isOpen={openIndex === actualIndex}
                    onToggle={() => handleToggle(actualIndex)}
                    index={index}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA below FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-14"
        >
          <p
            className="text-brand-charcoal/60 mb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Still have questions? We'd love to hear from you.
          </p>
          <a
            href="/get-quote"
            className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Contact Us
          </a>
        </motion.div>
      </div>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
