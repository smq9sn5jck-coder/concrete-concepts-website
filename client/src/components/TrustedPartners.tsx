/*
  Trusted Partners Section
  Dark charcoal background with gold accents — matches the brand palette.
  Features partner cards with logo, name, specialty, and contact info.
*/
import { motion } from "framer-motion";
import { Handshake, Phone, Mail, ExternalLink } from "lucide-react";

interface Partner {
  name: string;
  specialty: string;
  description: string;
  contactName: string;
  phone: string;
  email: string;
  website?: string;
}

const partners: Partner[] = [
  {
    name: "Grime Away Exterior Cleaning",
    specialty: "Pressure Washing & Exterior Cleaning",
    description:
      "Professional exterior cleaning services including high-pressure washing, soft washing, driveway cleaning, and building wash-downs. The perfect partner to keep your new concrete looking pristine.",
    contactName: "Josh Ward",
    phone: "0421 875 405",
    email: "josh@grimeawayexteriorcleaning.com",
  },
];

export default function TrustedPartners() {
  return (
    <section className="py-20 md:py-28 bg-brand-charcoal relative overflow-hidden">
      {/* Subtle gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-60" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Handshake className="w-6 h-6 text-brand-gold" />
            <span
              className="text-brand-gold uppercase tracking-[0.2em] text-sm font-semibold"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Our Network
            </span>
            <Handshake className="w-6 h-6 text-brand-gold" />
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Trusted <span className="text-brand-gold italic">Partners</span>
          </h2>
          <p
            className="text-brand-silver-light/80 max-w-2xl mx-auto text-lg"
            style={{ fontFamily: "var(--font-body)" }}
          >
            We work alongside the best in the business to deliver complete
            solutions for your project.
          </p>
        </motion.div>

        {/* Partner Cards */}
        <div className="max-w-3xl mx-auto">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <div className="relative rounded-2xl border border-brand-gold/20 bg-gradient-to-br from-brand-charcoal-light/60 to-brand-charcoal overflow-hidden transition-all duration-500 hover:border-brand-gold/50 hover:shadow-2xl hover:shadow-brand-gold/10">
                {/* Gold accent corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-bl-[80px] transition-all duration-500 group-hover:bg-brand-gold/10" />

                <div className="p-8 md:p-10">
                  {/* Partner Header */}
                  <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                    {/* Logo placeholder with initials */}
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 border border-brand-gold/30 flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:from-brand-gold/30 group-hover:to-brand-gold/10">
                      <span
                        className="text-brand-gold text-2xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        GA
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3
                        className="text-2xl md:text-3xl text-white mb-1 transition-colors duration-300 group-hover:text-brand-gold"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {partner.name}
                      </h3>
                      <span
                        className="inline-block text-sm text-brand-gold uppercase tracking-[0.15em] font-semibold"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {partner.specialty}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    className="text-brand-silver-light/70 leading-relaxed mb-8 text-base"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {partner.description}
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent mb-6" />

                  {/* Contact Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                    <span
                      className="text-white font-semibold text-sm"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {partner.contactName}
                    </span>

                    <div className="flex flex-wrap items-center gap-4">
                      <a
                        href={`tel:${partner.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-2 text-brand-silver-light/70 hover:text-brand-gold transition-colors duration-300 text-sm"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <Phone className="w-4 h-4" />
                        <span>{partner.phone}</span>
                      </a>

                      <a
                        href={`mailto:${partner.email}`}
                        className="flex items-center gap-2 text-brand-silver-light/70 hover:text-brand-gold transition-colors duration-300 text-sm"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <Mail className="w-4 h-4" />
                        <span>{partner.email}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-brand-silver/50 text-sm mt-10"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Interested in partnering with us?{" "}
          <a
            href="/get-quote"
            className="text-brand-gold hover:text-brand-gold-light transition-colors duration-300 underline underline-offset-4"
          >
            Get in touch
          </a>
        </motion.p>
      </div>
    </section>
  );
}
