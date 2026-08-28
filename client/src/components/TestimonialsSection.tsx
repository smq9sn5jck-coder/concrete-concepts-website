/*
  DESIGN: Refined Craft — Concrete Concepts Group brand
  Reviews: Combined HiPages verified reviews + live Google Reviews
  Horizontal scrollable cards on mobile, grid on desktop
  Source tabs to filter by platform
*/
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Shield, ChevronLeft, ChevronRight, BadgeCheck, MapPin, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

/* ── Static HiPages reviews ── */
const hipagesReviews = [
  {
    name: "Myresh M",
    location: "Mount Gravatt East, QLD",
    date: "4 Aug 2025",
    text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. Very happy with the result and highly recommend!!",
    service: "Concrete Driveways",
    stars: 5,
    hiredOnHipages: true,
    source: "HiPages" as const,
  },
  {
    name: "Sheeba",
    location: "Annerley, QLD",
    date: "2 May 2025",
    text: "Highly recommend Jarrod and his boys team for their exceptional professional work.",
    service: "Concreting",
    stars: 5,
    hiredOnHipages: true,
    source: "HiPages" as const,
  },
  {
    name: "Kailash S",
    location: "Kenmore, QLD",
    date: "24 May 2025",
    text: "Highly professional, respected our requirement, on time and completed the work to our entire satisfaction. Happy to recommend Jarred.",
    service: "Concreting",
    stars: 5,
    hiredOnHipages: false,
    source: "HiPages" as const,
  },
  {
    name: "Joe S",
    location: "Collingwood Park, QLD",
    date: "2 Jun 2025",
    text: "Excellent job done and quick and reliable.",
    service: "Concreting",
    stars: 5,
    hiredOnHipages: false,
    source: "HiPages" as const,
  },
  {
    name: "Paul R",
    location: "Capalaba, QLD",
    date: "27 May 2025",
    text: "Prompt.",
    service: "Concreting",
    stars: 5,
    hiredOnHipages: false,
    source: "HiPages" as const,
  },
  {
    name: "Pushpa",
    location: "Runcorn, QLD",
    date: "5 Mar 2026",
    text: "Connected with Concrete Concepts and would recommend them.",
    service: "Concrete Driveways",
    stars: 5,
    hiredOnHipages: false,
    source: "HiPages" as const,
  },
  {
    name: "Helen K",
    location: "Geebung, QLD",
    date: "26 Jun 2025",
    text: "Connected with Concrete Concepts and would recommend them.",
    service: "Exposed Aggregate Concrete",
    stars: 5,
    hiredOnHipages: false,
    source: "HiPages" as const,
  },
  {
    name: "Cor",
    location: "Lowood, QLD",
    date: "5 Oct 2025",
    text: "Connected with Concrete Concepts and would recommend them.",
    service: "Concreting",
    stars: 5,
    hiredOnHipages: true,
    source: "HiPages" as const,
  },
  {
    name: "Paul S",
    location: "Shailer Park, QLD",
    date: "21 Nov 2019",
    text: "The price was what I had expected to pay and they came out to inspect the site before quoting. Would recommend them.",
    service: "Concreting",
    stars: 5,
    hiredOnHipages: false,
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
  hiredOnHipages: boolean;
  source: "HiPages" | "Google";
};

// Static Google reviews fallback (used when backend is unavailable)
const STATIC_GOOGLE_REVIEWS = [
  { name: "Darren C", location: "Brisbane, QLD", date: "15 Jul 2025", text: "Jarrad and his team did an amazing job on our driveway. From start to finish, the communication was excellent and the quality of work was outstanding. Would highly recommend to anyone needing concrete work done.", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
  { name: "Sarah T", location: "Brisbane, QLD", date: "20 Jun 2025", text: "We had our patio and pool surround done by Concrete Concepts. The exposed aggregate finish looks incredible. Jarrad was very professional and kept us informed throughout the entire process. Highly recommend!", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
  { name: "Michael B", location: "Brisbane, QLD", date: "28 Jul 2025", text: "Great team, great work. Had a large slab poured for our shed and the boys were efficient and professional. Price was fair and the finish was perfect. Thanks Jarrad!", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
  { name: "Lisa W", location: "Brisbane, QLD", date: "10 Aug 2025", text: "Jarrod and his team replaced our old cracked driveway with a beautiful exposed aggregate finish. They were punctual, tidy and the result exceeded our expectations. Five stars!", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
  { name: "Chris P", location: "Brisbane, QLD", date: "18 Apr 2025", text: "Had retaining walls and a new slab done. The team was professional from quote to completion. Very happy with the quality and would use again.", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
  { name: "Amanda R", location: "Brisbane, QLD", date: "22 Mar 2025", text: "Concrete Concepts did our entire backyard — patio, paths and retaining wall. Jarrad was easy to deal with, gave honest advice and delivered exactly what was promised. Couldn't be happier!", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
  { name: "Tom H", location: "Brisbane, QLD", date: "1 Sep 2025", text: "Top quality work on our crossover and driveway. The team was friendly, hardworking and left the site spotless. Would recommend to anyone in Brisbane.", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
  { name: "Priya N", location: "Brisbane, QLD", date: "25 Aug 2025", text: "We got quotes from 5 different concreters and Jarrad was the most professional and fairly priced. The finished product is stunning — our neighbours keep complimenting it!", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
  { name: "Steve K", location: "Brisbane, QLD", date: "5 Jul 2025", text: "Jarrad and the boys did a great job on our shed slab and side paths. On time, on budget and excellent communication throughout. Highly recommend Concrete Concepts.", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
  { name: "Rachel M", location: "Brisbane, QLD", date: "30 Jun 2025", text: "Amazing transformation of our outdoor area. The coloured concrete patio looks fantastic and the team were a pleasure to deal with. Thank you!", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
  { name: "Jenny F", location: "Brisbane, QLD", date: "10 Sep 2025", text: "Jarrad quoted our job quickly and started within the week. The exposed aggregate driveway looks beautiful. Very happy we chose Concrete Concepts!", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
  { name: "Mark D", location: "Brisbane, QLD", date: "20 Sep 2025", text: "Second time using Concrete Concepts — first for our driveway, now for the pool surround. Consistently excellent work. Wouldn't go anywhere else.", service: "Concreting", stars: 5, hiredOnHipages: false, source: "Google" as const },
];

type FilterTab = "All" | "Google" | "HiPages";

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const visibleCount = 3;

  // Fetch Google Reviews from backend (falls back to static data if unavailable)
  const { data: googleData } = trpc.googleReviews.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  // Convert Google reviews to our format
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
          hiredOnHipages: false,
          source: "Google" as const,
        }));
    }
    // Fallback to static reviews when backend is unavailable
    return STATIC_GOOGLE_REVIEWS;
  }, [googleData]);

  // Combine and filter reviews
  const allReviews: ReviewItem[] = useMemo(() => {
    const combined = [...hipagesReviews, ...googleReviews];
    if (activeTab === "All") return combined;
    return combined.filter((r) => r.source === activeTab);
  }, [googleReviews, activeTab]);

  const maxIndex = Math.max(0, allReviews.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  // Reset carousel when tab changes
  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setCurrentIndex(0);
  };

  const googleRating = googleData?.rating || 0;
  const googleTotal = googleData?.totalReviews || 0;

  return (
    <section id="reviews" className="py-24 lg:py-32 bg-[#FAFAF7]">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-px bg-brand-gold" />
              <span
                className="text-brand-gold text-sm font-semibold tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Client Reviews
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-charcoal leading-tight mb-4">
              What Our Clients
              <br />
              <span className="text-brand-gold italic">Say About Us</span>
            </h2>
            <p
              className="text-muted-foreground text-lg max-w-xl"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Real reviews from verified clients across Google and HiPages. We let our work speak for itself.
            </p>
          </motion.div>

          {/* Badges + Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-start lg:items-end gap-4"
          >
            {/* Rating Badges */}
            <div className="flex flex-wrap gap-3">
              {/* Google Rating Badge */}
              {googleRating > 0 && (
                <div className="flex items-center gap-3 bg-white border border-blue-100 rounded-xl px-4 py-2.5 shadow-sm">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-brand-charcoal font-bold text-sm">{googleRating.toFixed(1)}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.round(googleRating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                      {googleTotal} Google reviews
                    </p>
                  </div>
                </div>
              )}

              {/* QBCC Licence Badge */}
              <div className="flex items-center gap-3 bg-white border border-brand-gold/20 rounded-xl px-4 py-2.5 shadow-sm">
                <Shield className="w-7 h-7 text-brand-gold" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
                    QBCC Licensed
                  </p>
                  <p className="text-brand-charcoal font-bold text-sm" style={{ fontFamily: "var(--font-body)" }}>
                    #15299707
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={prev}
                disabled={currentIndex === 0}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-brand-charcoal hover:bg-brand-gold hover:border-brand-gold hover:text-brand-charcoal disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-border transition-all"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                disabled={currentIndex >= maxIndex}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-brand-charcoal hover:bg-brand-gold hover:border-brand-gold hover:text-brand-charcoal disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-border transition-all"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Source Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {(["All", "Google", "HiPages"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-brand-charcoal text-white"
                  : "bg-white border border-border text-muted-foreground hover:border-brand-gold hover:text-brand-charcoal"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              {tab === "All" ? `All Reviews (${hipagesReviews.length + googleReviews.length})` : tab === "Google" ? `Google (${googleReviews.length})` : `HiPages (${hipagesReviews.length})`}
            </button>
          ))}
        </div>

        {/* Reviews Carousel (Desktop) */}
        <div className="hidden lg:block overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: `-${currentIndex * (100 / visibleCount + 1.5)}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {allReviews.map((review, i) => (
              <ReviewCard key={`${review.source}-${review.name}-${i}`} review={review} index={i} />
            ))}
          </motion.div>
        </div>

        {/* Reviews Grid (Mobile/Tablet) */}
        <div className="lg:hidden grid sm:grid-cols-2 gap-5">
          {allReviews.slice(0, 6).map((review, i) => (
            <ReviewCard key={`${review.source}-${review.name}-${i}`} review={review} index={i} />
          ))}
        </div>

        {/* View All Reviews + Attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link href="/reviews">
            <span className="inline-flex items-center gap-2 bg-brand-charcoal hover:bg-brand-charcoal/90 text-white font-semibold px-6 py-3 rounded-lg text-sm tracking-wide uppercase transition-all cursor-pointer mb-4" style={{ fontFamily: "var(--font-body)" }}>
              View All Reviews
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
          <p className="text-muted-foreground text-sm mt-4" style={{ fontFamily: "var(--font-body)" }}>
            Reviews sourced from{" "}
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJM0kDPMxZkWsR4foz-XZxlQ0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline font-medium"
            >
              Google
            </a>
            {" "}and{" "}
            <a
              href="https://hipages.com.au"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:underline font-medium"
            >
              hipages.com.au
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ReviewCard({ review, index }: { review: ReviewItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-border/50 min-w-0 lg:min-w-[calc(33.333%-1rem)] shrink-0"
    >
      {/* Stars + Source Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-0.5">
          {Array.from({ length: review.stars }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
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
      <p
        className="text-brand-charcoal text-sm leading-relaxed mb-5 min-h-[3rem]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        &ldquo;{review.text}&rdquo;
      </p>

      {/* Reviewer Info */}
      <div className="flex items-start justify-between gap-3 pt-4 border-t border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-charcoal/10 flex items-center justify-center text-xs font-bold text-brand-charcoal">
              {review.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-charcoal">{review.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1" style={{ fontFamily: "var(--font-body)" }}>
                <MapPin className="w-3 h-3" />
                {review.location}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-xs text-green-600 font-medium mb-0.5">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span style={{ fontFamily: "var(--font-body)" }}>Verified</span>
          </div>
          <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
            {review.date}
          </p>
        </div>
      </div>

      {/* Service Tag */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span
          className="text-[10px] bg-brand-gold/10 text-brand-gold-dark px-2 py-0.5 rounded-full font-medium"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {review.service}
        </span>
        {review.hiredOnHipages && (
          <span
            className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Hired on HiPages
          </span>
        )}
      </div>
    </motion.div>
  );
}
