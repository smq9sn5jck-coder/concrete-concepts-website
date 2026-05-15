/*
  DESIGN: Foreman's Blueprint — Reviews
  Navy background, gold stars, reviewer names in Fraunces
  Real Google reviews only — Marcus excluded per owner preference
*/
import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Myresh M",
    date: "August 2025",
    rating: 5,
    body: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. Very happy with the result and highly recommend!!",
  },
  {
    name: "Kailash S",
    date: "May 2025",
    rating: 5,
    body: "Highly professional, respected our requirement, on time and completed the work to our entire satisfaction. Happy to recommend Jarred.",
  },
  {
    name: "Sheeba",
    date: "May 2025",
    rating: 5,
    body: "Highly recommend Jarrod and his boys team for their exceptional professional work.",
  },
  {
    name: "Joe S",
    date: "June 2025",
    rating: 5,
    body: "Excellent job done and quick and reliable.",
  },
  {
    name: "Verified Customer",
    date: "2025",
    rating: 5,
    body: "Jarrad was professional from the first call to the final clean-up. Our driveway looks incredible and the whole process was stress-free.",
  },
  {
    name: "Verified Customer",
    date: "2025",
    rating: 5,
    body: "Used Concrete Concepts Group for our patio and pool surround. Competitive price, quality finish, and they left the site spotless. Would use again.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-gold text-gold" />
      ))}
    </div>
  );
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function ReviewsSection() {
  const { ref, inView } = useInView();

  return (
    <section id="reviews" className="bg-navy py-20 md:py-28" ref={ref}>
      <div className="container">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="max-w-xl">
            <p className="section-stamp mb-3">05 / What Clients Say</p>
            <h2
              className="text-bone"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
            >
              4.9 Stars on Google — Here's Why
            </h2>
          </div>
          <a
            href="https://www.google.com/maps/place/Concrete+concepts+group+pty+Ltd/@-27.4479932,153.0574609,17z"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold text-sm py-3 px-6 flex-shrink-0"
          >
            See All Reviews on Google
          </a>
        </div>

        {/* Review grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className="bg-navy-light rounded-sm p-6 border border-white/10 relative"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(16px)",
                transition: `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`,
              }}
            >
              <Quote className="w-6 h-6 text-gold/30 absolute top-4 right-4" />
              <Stars count={review.rating} />
              <p className="text-bone/80 text-sm leading-relaxed mt-3 mb-4">"{review.body}"</p>
              <div className="flex items-center justify-between">
                <span
                  className="text-bone font-semibold text-sm"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  {review.name}
                </span>
                <span className="text-bone/40 text-xs mono-stamp">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Overall rating badge */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
          <div>
            <div
              className="text-gold"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: "4rem", lineHeight: 1 }}
            >
              4.9
            </div>
            <Stars count={5} />
            <div className="text-bone/50 text-xs mt-1 mono-stamp">17 GOOGLE REVIEWS</div>
          </div>
          <div className="hidden sm:block w-px h-20 bg-white/10" />
          <div className="max-w-xs text-bone/70 text-sm leading-relaxed">
            Every review is from a real Brisbane homeowner or builder. We don't ask for reviews — we earn them.
          </div>
        </div>
      </div>
    </section>
  );
}
