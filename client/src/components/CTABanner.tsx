/*
  DESIGN: Refined Craft — Concrete Concepts Group brand
  CTA Banner: Full-width gold accent section driving to quote form
  Real project photo background with overlay
*/
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

const BG_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/project-pouring_f7343992.jpeg";

export default function CTABanner() {

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={BG_IMAGE}
          alt="Concrete Concepts Group team pouring concrete on a residential project in Brisbane"
          width={1200}
          height={600}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-brand-gold/90" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-charcoal leading-tight mb-5">
            Let&apos;s Build Something
            <br />
            <span className="italic">Together</span>
          </h2>
          <p
            className="text-brand-charcoal/70 text-lg mb-8 max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Whether it&apos;s a new driveway, a commercial slab, or a backyard 
            transformation — get in touch for a free, no-obligation quote.
          </p>
          <Link href="/get-quote">
            <Button
              size="lg"
              className="bg-brand-charcoal hover:bg-brand-charcoal-light text-white font-bold px-10 py-6 text-base tracking-wide uppercase shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex items-center gap-2 mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Get Your Free Quote
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
