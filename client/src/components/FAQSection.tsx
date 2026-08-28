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
      "Concrete driveway costs in Brisbane typically range from $65 to $150 per square metre, depending on the finish you choose. Standard grey concrete is the most affordable, while exposed aggregate and decorative finishes sit at the higher end. Factors like site access, slope, drainage requirements, and demolition of existing surfaces also affect the final price. We provide free, no-obligation quotes so you know exactly what to expect before any work begins.",
  },
  {
    question: "What types of concrete finishes do you offer?",
    answer:
      "We offer a full range of concrete finishes to suit every style and budget. Our most popular options include plain (broom or steel-trowel) finish, exposed aggregate with a variety of stone blends, honed and polished concrete, coloured concrete using oxide pigments, and stamped or stencilled patterns. Each finish has different durability, slip-resistance, and maintenance characteristics — we're happy to walk you through samples and help you choose the best option for your project.",
  },
  {
    question: "How long does a concrete project take from start to finish?",
    answer:
      "Most residential projects — driveways, patios, and paths — take between 2 to 5 days of on-site work, depending on size and complexity. After pouring, concrete needs at least 7 days of curing before light foot traffic and 28 days before vehicles can drive on it. We'll give you a clear timeline during the quoting process so you can plan accordingly. Weather can occasionally cause short delays, but we always keep you informed.",
  },
  {
    question: "Do I need council approval for concreting work?",
    answer:
      "In most cases, standard residential concreting (driveways, patios, paths) does not require council approval in Brisbane. However, if your project involves changes to stormwater drainage, building near boundaries, or work on a heritage-listed property, you may need permits. Crossover (vehicle crossing) work connecting your driveway to the street typically requires council approval. We can advise you on what's needed during our initial site inspection.",
  },
  {
    question: "Are you licensed and insured?",
    answer:
      "Absolutely. Concrete Concepts Group is fully licensed under the Queensland Building and Construction Commission (QBCC), which means we meet strict financial and technical standards. We also carry comprehensive public liability insurance and workers' compensation coverage. This protects you, your property, and our team on every job. We're happy to provide our licence and insurance details on request.",
  },
  {
    question: "What areas do you service?",
    answer:
      "We service Brisbane and all surrounding areas across South East Queensland — including Ipswich, Logan, Moreton Bay, Redlands, the Gold Coast, Sunshine Coast, Caboolture, Springfield, and more. Whether you're in the inner suburbs or further out, we're happy to come to you for a free quote. If you're unsure whether your area is covered, just give us a call or submit an enquiry through our website.",
  },
  {
    question: "How do I maintain my new concrete?",
    answer:
      "Concrete is low-maintenance, but a little care goes a long way. We recommend sealing your concrete every 2 to 3 years to protect against staining, moisture, and UV damage. Regular sweeping and occasional pressure washing will keep it looking fresh. Avoid using harsh chemicals or de-icing salts. For exposed aggregate, a quality penetrating sealer will enhance the stone colour and provide long-lasting protection. We provide aftercare instructions with every completed project.",
  },
  {
    question: "Can you remove and replace my old concrete?",
    answer:
      "Yes, we handle the full process from demolition of your existing concrete through to the new pour and finish. Our team uses professional equipment to break up and remove old slabs, prepare the sub-base, and install new concrete to current standards. We also handle responsible disposal of old materials. If your existing concrete is cracked, sinking, or just outdated, a full replacement is often the best long-term investment.",
  },
  {
    question: "What is the difference between exposed aggregate and plain concrete?",
    answer:
      "Plain concrete has a smooth or broom-finished surface and is the most cost-effective option. Exposed aggregate reveals the natural stones within the concrete mix by washing away the top layer before it fully sets, creating a textured, decorative surface. Exposed aggregate offers better slip resistance, hides minor imperfections, and comes in a wide range of stone colours and blends. It costs more than plain concrete but adds significant visual appeal and value to your property.",
  },
  {
    question: "Do you offer free quotes?",
    answer:
      "Yes! We offer completely free, no-obligation quotes for all concreting work. Simply fill out our online quote form or give us a call, and we'll arrange a convenient time to visit your property. During the site visit, we'll discuss your requirements, measure up, assess site conditions, and provide a detailed written quote — usually within 24 to 48 hours. There's no pressure and no hidden costs.",
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
