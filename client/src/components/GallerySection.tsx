/*
  DESIGN: Foreman's Blueprint — Gallery
  Bone background, irregular brick-pattern grid (mix of 1-col and 2-col spans)
  Real project photos only — no stock imagery
*/
import { useEffect, useRef, useState } from "react";
import { ZoomIn } from "lucide-react";

const PHOTOS = [
  { src: "/manus-storage/exposed-aggregate-driveway-wash_89f1b54e_0b5b9d19.jpg", alt: "Exposed aggregate driveway wash Brisbane", wide: true },
  { src: "/manus-storage/project-pouring_f7343992_3758b291.jpeg", alt: "Concrete pour Brisbane", wide: false },
  { src: "/manus-storage/project-troweling_06ff9a7c_26ccba97.jpeg", alt: "Concrete troweling finish", wide: false },
  { src: "/manus-storage/patio-slab-prep-rebar_2e944823_a611e149.jpg", alt: "Patio slab rebar preparation", wide: false },
  { src: "/manus-storage/patio-slab-poured-fresh_3fb4bb58_4b00f859.jpg", alt: "Fresh concrete patio pour", wide: false },
  { src: "/manus-storage/project-retaining-wall-2_710ff4d5_2b1e5764.jpeg", alt: "Retaining wall construction Brisbane", wide: true },
  { src: "/manus-storage/the-gap-concrete-slab_e8c1d11a_02f30860.jpg", alt: "The Gap concrete slab Brisbane", wide: false },
  { src: "/manus-storage/commercial-slab-pour_264779c3_3330fd42.jpg", alt: "Commercial concrete slab pour", wide: false },
  { src: "/manus-storage/pool-concrete-3_6085efa5_580063df.jpg", alt: "Pool surround concrete Brisbane", wide: false },
  { src: "/manus-storage/honed-polished_18761be0_323c0b72.jpg", alt: "Honed polished concrete finish", wide: false },
  { src: "/manus-storage/new-gallery-3_e9b3c7b9_f2f3a44b.jpeg", alt: "Concrete project Brisbane", wide: false },
  { src: "/manus-storage/new-gallery-4_c54657e7_e972561c.jpeg", alt: "Concrete project Brisbane", wide: true },
  { src: "/manus-storage/new-gallery-5_d25c6ec1_5db4c49a.jpeg", alt: "Concrete project Brisbane", wide: false },
  { src: "/manus-storage/new-gallery-6_529d16f2_b1a91f6c.jpeg", alt: "Concrete project Brisbane", wide: false },
  { src: "/manus-storage/new-gallery-7_4a8ac427_0aefde51.jpeg", alt: "Concrete project Brisbane", wide: false },
  { src: "/manus-storage/new-gallery-8_967d5266_d7aa7180.jpeg", alt: "Concrete project Brisbane", wide: false },
  { src: "/manus-storage/logan-exposed-aggregate-driveway_6d51814c_788381af.jpg", alt: "Logan exposed aggregate driveway", wide: true },
  { src: "/manus-storage/project-stair-formwork_22770470_00aa9841.jpeg", alt: "Stair formwork concrete Brisbane", wide: false },
];

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

export default function GallerySection() {
  const { ref, inView } = useInView();
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section id="gallery" className="bg-bone-dark py-20 md:py-28" ref={ref}>
      <div className="container">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <p className="section-stamp mb-3">04 / Our Work</p>
          <h2
            className="text-navy mb-4"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
          >
            Real Projects, Real Results
          </h2>
          <p className="text-charcoal/70">
            Every photo is from an actual Concrete Concepts Group job in Brisbane and surrounding areas. No renders, no stock photos.
          </p>
        </div>

        {/* Masonry-style grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {PHOTOS.map((photo, i) => (
            <div
              key={photo.src}
              className={`relative overflow-hidden rounded-sm group cursor-pointer break-inside-avoid mb-3 ${photo.wide ? "col-span-2" : ""}`}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(16px)",
                transition: `opacity 0.4s ease ${Math.min(i * 0.04, 0.5)}s, transform 0.4s ease ${Math.min(i * 0.04, 0.5)}s`,
              }}
              onClick={() => setLightbox(photo.src)}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA below gallery */}
        <div className="mt-12 text-center">
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}
            className="btn-gold text-base py-4 px-10 inline-flex"
          >
            Get a Free Quote for Your Project
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Project photo"
            className="max-w-full max-h-full object-contain rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-light"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}
