/*
  DESIGN: Foreman's Blueprint — FAQ
  Bone-dark background, accordion, Fraunces questions, Inter answers
*/
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "How much does a concrete driveway cost in Brisbane?",
    a: "A standard plain broom concrete driveway in Brisbane typically costs between $80–$120 per square metre, depending on thickness, reinforcement, and access. Exposed aggregate finishes range from $110–$160/m². We provide free, itemised quotes so you know exactly what you're paying for.",
  },
  {
    q: "Are you QBCC licensed?",
    a: "Yes. Concrete Concepts Group holds QBCC Licence #15299707. This is a legal requirement for all structural concrete work in Queensland and means you're protected under the Queensland Home Warranty Scheme for eligible residential work.",
  },
  {
    q: "How long does concrete take to cure?",
    a: "Concrete reaches 70% of its design strength within 7 days and full strength at 28 days. We recommend keeping foot traffic off for 24–48 hours and vehicles off for at least 7 days. We'll give you specific advice based on the mix and weather conditions on your pour day.",
  },
  {
    q: "Do you do small jobs or just big ones?",
    a: "We do both. From a single footpath panel to a full house slab or commercial project — Jarrad will assess every job on its merits and give you an honest quote. We don't turn away small jobs.",
  },
  {
    q: "What areas do you service?",
    a: "We're based in Brisbane and cover all of South East Queensland — Ipswich, Logan, Moreton Bay, Redlands, Gold Coast, Sunshine Coast, and everywhere in between. If you're unsure, just call us on 0424 463 268.",
  },
  {
    q: "Can I see examples of your work before I commit?",
    a: "Absolutely. Check our gallery above for real project photos, or call Jarrad directly — he's happy to walk you through past jobs similar to yours. We can also provide references from previous clients in your area.",
  },
  {
    q: "Do you handle the excavation as well?",
    a: "Yes. We have our own excavation equipment and handle the full scope — site prep, excavation, formwork, pour, and finishing. You deal with one crew and one invoice.",
  },
  {
    q: "What's the process for getting a quote?",
    a: "Fill in the form below or call 0424 463 268. Jarrad will get back to you within a few hours to discuss your project. For most residential jobs we can provide a quote over the phone or via a quick site visit — no obligation.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-bone-dark py-20 md:py-28">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <p className="section-stamp mb-3">07 / Common Questions</p>
          <h2
            className="text-navy mb-10"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="border border-bone rounded-sm overflow-hidden"
                style={{ background: open === i ? "#fff" : "#F2EFE9" }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span
                    className="text-navy font-semibold text-base"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    {faq.q}
                  </span>
                  {open === i
                    ? <Minus className="w-4 h-4 text-gold flex-shrink-0" />
                    : <Plus className="w-4 h-4 text-gold flex-shrink-0" />
                  }
                </button>
                {open === i && (
                  <div className="px-5 pb-5 text-charcoal/75 text-sm leading-relaxed border-t border-bone">
                    <div className="pt-4">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
