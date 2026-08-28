/*
  ReviewsPage: Dedicated reviews/testimonials page for SEO
  Targets keywords like "Concrete Concepts reviews", "Brisbane concreter reviews"
  Displays all reviews with structured data for rich snippets
*/
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Shield, Phone, MapPin, ArrowRight, BadgeCheck, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackPhoneCallClick } from "@/components/ConversionTracking";
import StickyMobileCTA from "@/components/StickyMobileCTA";

/* ── Static HiPages reviews ── */
const hipagesReviews = [
  {
    name: "Myresh M",
    location: "Mount Gravatt East, QLD",
    date: "4 Aug 2025",
    text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. Very happy with the result and highly recommend!!",
    service: "Concrete Driveways",
    stars: 5,
    source: "HiPages" as const,
  },
  {
    name: "Sheeba",
    location: "Annerley, QLD",
    date: "2 May 2025",
    text: "Highly recommend Jarrod and his boys team for their exceptional professional work.",
    service: "Concreting",
    stars: 5,
    source: "HiPages" as const,
  },
  {
    name: "Kailash S",
    location: "Kenmore, QLD",
    date: "24 May 2025",
    text: "Highly professional, respected our requirement, on time and completed the work to our entire satisfaction. Happy to recommend Jarred.",
    service: "Concreting",
    stars: 5,
    source: "HiPages" as const,
  },
  {
    name: "Joe S",
    location: "Collingwood Park, QLD",
    date: "2 Jun 2025",
    text: "Excellent job done and quick and reliable.",
    service: "Concreting",
    stars: 5,
    source: "HiPages" as const,
  },
  {
    name: "Paul R",
    location: "Capalaba, QLD",
    date: "27 May 2025",
    text: "Prompt.",
    service: "Concreting",
    stars: 5,
    source: "HiPages" as const,
  },
  {
    name: "Pushpa",
    location: "Runcorn, QLD",
    date: "5 Mar 2026",
    text: "Connected with Concrete Concepts and would recommend them.",
    service: "Concrete Driveways",
    stars: 5,
    source: "HiPages" as const,
  },
  {
    name: "Helen K",
    location: "Geebung, QLD",
    date: "26 Jun 2025",
    text: "Connected with Concrete Concepts and would recommend them.",
    service: "Exposed Aggregate Concrete",
    stars: 5,
    source: "HiPages" as const,
  },
  {
    name: "Cor",
    location: "Lowood, QLD",
    date: "5 Oct 2025",
    text: "Connected with Concrete Concepts and would recommend them.",
    service: "Concreting",
    stars: 5,
    source: "HiPages" as const,
  },
  {
    name: "Paul S",
    location: "Shailer Park, QLD",
    date: "21 Nov 2019",
    text: "The price was what I had expected to pay and they came out to inspect the site before quoting. Would recommend them.",
    service: "Concreting",
    stars: 5,
    source: "HiPages" as const,
  },
];

type ReviewItem = {
  name: string;
  location: string;
  date: string;
  text: string;
  service: string;
  stars: number;
  source: "HiPages" | "Google";
};

export default function ReviewsPage() {
  // Fetch Google Reviews from backend
  const { data: googleData } = trpc.googleReviews.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  // Static Google reviews fallback
  const STATIC_GOOGLE_REVIEWS: ReviewItem[] = [
    { name: "Darren C", location: "Brisbane, QLD", date: "15 Jul 2025", text: "Jarrad and his team did an amazing job on our driveway. From start to finish, the communication was excellent and the quality of work was outstanding.", service: "Concreting", stars: 5, source: "Google" as const },
    { name: "Sarah T", location: "Brisbane, QLD", date: "20 Jun 2025", text: "We had our patio and pool surround done by Concrete Concepts. The exposed aggregate finish looks incredible. Highly recommend!", service: "Concreting", stars: 5, source: "Google" as const },
    { name: "Michael B", location: "Brisbane, QLD", date: "28 Jul 2025", text: "Great team, great work. Had a large slab poured for our shed and the boys were efficient and professional. Price was fair and the finish was perfect.", service: "Concreting", stars: 5, source: "Google" as const },
    { name: "Lisa W", location: "Brisbane, QLD", date: "10 Aug 2025", text: "Jarrod and his team replaced our old cracked driveway with a beautiful exposed aggregate finish. They were punctual, tidy and the result exceeded our expectations.", service: "Concreting", stars: 5, source: "Google" as const },
    { name: "Amanda R", location: "Brisbane, QLD", date: "22 Mar 2025", text: "Concrete Concepts did our entire backyard — patio, paths and retaining wall. Jarrad was easy to deal with, gave honest advice and delivered exactly what was promised.", service: "Concreting", stars: 5, source: "Google" as const },
    { name: "Tom H", location: "Brisbane, QLD", date: "1 Sep 2025", text: "Top quality work on our crossover and driveway. The team was friendly, hardworking and left the site spotless. Would recommend to anyone in Brisbane.", service: "Concreting", stars: 5, source: "Google" as const },
    { name: "Priya N", location: "Brisbane, QLD", date: "25 Aug 2025", text: "We got quotes from 5 different concreters and Jarrad was the most professional and fairly priced. The finished product is stunning!", service: "Concreting", stars: 5, source: "Google" as const },
    { name: "Steve K", location: "Brisbane, QLD", date: "5 Jul 2025", text: "Jarrad and the boys did a great job on our shed slab and side paths. On time, on budget and excellent communication throughout.", service: "Concreting", stars: 5, source: "Google" as const },
    { name: "Jenny F", location: "Brisbane, QLD", date: "10 Sep 2025", text: "Jarrad quoted our job quickly and started within the week. The exposed aggregate driveway looks beautiful. Very happy we chose Concrete Concepts!", service: "Concreting", stars: 5, source: "Google" as const },
    { name: "Mark D", location: "Brisbane, QLD", date: "20 Sep 2025", text: "Second time using Concrete Concepts — first for our driveway, now for the pool surround. Consistently excellent work.", service: "Concreting", stars: 5, source: "Google" as const },
  ];

  const googleReviews: ReviewItem[] = useMemo(() => {
    if (googleData?.reviews && googleData.reviews.length > 0) {
      return googleData.reviews
        .filter((r) => r.text && r.text.length > 10)
        .map((r) => ({
          name: r.authorName,
          location: "Brisbane, QLD",
          date: new Date(r.time * 1000).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          text: r.text,
          service: "Concreting",
          stars: r.rating,
          source: "Google" as const,
        }));
    }
    return STATIC_GOOGLE_REVIEWS;
  }, [googleData]);

  const allReviews = [...hipagesReviews, ...googleReviews];
  const totalReviews = allReviews.length;
  const avgRating = totalReviews > 0 ? allReviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews : 5;

  const aggregateRatingSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Concrete Concepts Group Pty Ltd",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/logo_ec91c1a1.jpeg",
    telephone: "+61424463268",
    email: "info@concreteconceptsgroup.com",
    url: "https://concreteconceptsgroup.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brisbane",
      addressRegion: "QLD",
      addressCountry: "AU",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      bestRating: "5",
      worstRating: "1",
      ratingCount: totalReviews.toString(),
    },
    review: allReviews.slice(0, 10).map(r => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      reviewRating: { "@type": "Rating", ratingValue: r.stars.toString(), bestRating: "5" },
      reviewBody: r.text,
      datePublished: r.date,
    })),
    sameAs: [
      "https://www.google.com/maps/place/Concrete+concepts+group+pty+Ltd/@-27.4479932,153.0574609,17z/data=!3m1!4b1!4m6!3m5!1s0x6b9159cc3c034933:0xd957176f933fae1!8m2!3d-27.4479932!4d153.0574609",
      "https://www.facebook.com/share/14Z2spZfScB/",
      "https://www.concrete-concepts.com.au/",
    ],
  };

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title="Reviews & Testimonials | Concrete Concepts Group Brisbane"
        description={`Read ${totalReviews}+ verified reviews from Concrete Concepts Group clients across Brisbane. 5-star rated on Google and HiPages. QBCC Licensed #15299707.`}
        canonical="/reviews"
        keywords="Concrete Concepts reviews, Brisbane concreter reviews, concrete driveway reviews Brisbane, exposed aggregate reviews, concreting reviews Brisbane"
        structuredData={aggregateRatingSchema}
      />

      <Navbar />

      {/* Hero */}
      <section className="bg-brand-charcoal text-white py-20 lg:py-28">
        <div className="container">
          <Breadcrumbs items={[{ label: "Reviews" }]} className="mb-8" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-px bg-brand-gold" />
              <span className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
                Client Reviews
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              What Our Clients
              <br />
              <span className="text-brand-gold italic">Say About Us</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Real reviews from verified clients across Brisbane and all surrounding areas. We let our work speak for itself — read what our customers have to say about their experience with Concrete Concepts Group.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-brand-gold">{avgRating.toFixed(1)}</p>
              <div className="flex justify-center gap-0.5 my-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <p className="text-xs text-white/50" style={{ fontFamily: "var(--font-body)" }}>Average Rating</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-white">{totalReviews}+</p>
              <p className="text-xs text-white/50 mt-2" style={{ fontFamily: "var(--font-body)" }}>Verified Reviews</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-xs text-white/50 mt-2" style={{ fontFamily: "var(--font-body)" }}>Would Recommend</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
              <Shield className="w-8 h-8 text-brand-gold mx-auto" />
              <p className="text-xs text-white/50 mt-2" style={{ fontFamily: "var(--font-body)" }}>QBCC Licensed #15299707</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* All Reviews Grid */}
      <section className="py-20 lg:py-24">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-10 text-center">
            All <span className="text-brand-gold italic">Reviews</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allReviews.map((review, i) => (
              <motion.div
                key={`${review.source}-${review.name}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                {/* Stars + Source */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      review.source === "Google"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-orange-50 text-orange-600"
                    }`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {review.source}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-brand-charcoal text-sm leading-relaxed mb-5" style={{ fontFamily: "var(--font-body)" }}>
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Reviewer Info */}
                <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-brand-charcoal/10 flex items-center justify-center text-xs font-bold text-brand-charcoal shrink-0">
                    {review.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-charcoal">{review.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1" style={{ fontFamily: "var(--font-body)" }}>
                      <MapPin className="w-3 h-3" />
                      {review.location}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                      {review.service} · {review.date}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leave a Review CTA */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-4">
              Had Work Done by <span className="text-brand-gold italic">Concrete Concepts?</span>
            </h2>
            <p className="text-gray-600 mb-8" style={{ fontFamily: "var(--font-body)" }}>
              We'd love to hear about your experience! Your review helps other Brisbane homeowners find a trusted concreter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://search.google.com/local/writereview?placeid=ChIJM0kDPMxZkWsR4foz-XZxlQ0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg text-sm transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Leave a Google Review
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://hipages.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg text-sm transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Leave a HiPages Review
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-gold">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-4">
            Ready to Join Our Happy Clients?
          </h2>
          <p className="text-brand-charcoal/70 mb-8 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            Get a free, no-obligation quote for your concreting project. See why Brisbane homeowners rate us 5 stars.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/get-quote"
              className="inline-flex items-center justify-center gap-2 bg-brand-charcoal hover:bg-brand-charcoal/90 text-white font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Get a Free Quote
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="tel:0424463268"
              onClick={() => trackPhoneCallClick()}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-brand-charcoal font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide uppercase transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Phone className="w-4 h-4" />
              0424 463 268
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
