import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Tag, ChevronLeft, Phone } from "lucide-react";
import { useState, useMemo } from "react";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import GuideCtaBanner from "@/components/GuideCtaBanner";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { trackPhoneCallClick } from "@/components/ConversionTracking";

const CATEGORIES = [
  "All",
  "Tips & Guides",
  "Project Showcase",
  "Industry News",
  "Brisbane Living",
];

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: posts, isLoading } = trpc.blog.list.useQuery(
    activeCategory === "All" ? undefined : { category: activeCategory }
  );

  const featuredPost = useMemo(() => {
    if (!posts || posts.length === 0) return null;
    return posts[0];
  }, [posts]);

  const remainingPosts = useMemo(() => {
    if (!posts || posts.length <= 1) return [];
    return posts.slice(1);
  }, [posts]);

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title="Concrete Insights Blog | Tips, Guides & Brisbane Concreting News | Concrete Concepts"
        description="Expert concreting tips, project showcases, and Brisbane building industry insights from Concrete Concepts Group. Learn about driveways, exposed aggregate, slabs, and more."
        canonical="/blog"
        keywords="concreting tips Brisbane, concrete driveway guide, exposed aggregate tips, Brisbane building trends, concrete maintenance, QBCC concreting"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Concrete Concepts Group Blog",
          description: "Expert concreting tips, project showcases, and Brisbane building industry insights",
          url: "https://concreteconceptsgroup.com/blog",
          publisher: {
            "@type": "Organization",
            name: "Concrete Concepts Group",
            url: "https://concreteconceptsgroup.com",
          },
          ...(posts && posts.length > 0 ? {
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: posts.length,
              itemListElement: posts.slice(0, 10).map((post, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `https://concreteconceptsgroup.com/blog/${post.slug}`,
                name: post.title,
              })),
            },
          } : {}),
        }}
      />
      {/* Header */}
      <header className="bg-brand-charcoal text-white">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="flex items-center gap-2 text-white/70 hover:text-brand-gold transition-colors cursor-pointer text-sm"
                style={{ fontFamily: "var(--font-body)" }}>
                <ChevronLeft className="w-4 h-4" />
                Back to Home
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="tel:0424463268"
                onClick={() => trackPhoneCallClick()}
                className="hidden sm:flex items-center gap-1.5 text-white/70 hover:text-brand-gold transition-colors text-sm"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Phone className="w-3.5 h-3.5" />
                0424 463 268
              </a>
              <Link href="/get-quote">
                <span className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-5 py-2 rounded-md text-sm tracking-wide uppercase transition-all cursor-pointer"
                  style={{ fontFamily: "var(--font-body)" }}>
                  Get a Free Quote
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-brand-charcoal text-white pb-16 pt-8">
        <div className="container">
          <Breadcrumbs
            items={[{ label: "Blog" }]}
            className="mb-6"
          />
        </div>
        <div className="container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Concrete <span className="text-brand-gold">Insights</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Expert tips, project showcases, and industry insights from Brisbane's trusted concreting professionals.
          </motion.p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container">
          <div className="flex items-center gap-1 overflow-x-auto py-3 -mx-1 px-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-brand-charcoal text-white shadow-sm"
                    : "text-gray-500 hover:text-brand-charcoal hover:bg-gray-100"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              No articles yet
            </h3>
            <p className="text-gray-400" style={{ fontFamily: "var(--font-body)" }}>
              {activeCategory !== "All"
                ? `No articles found in "${activeCategory}". Try a different category.`
                : "Blog posts are coming soon. Check back later!"}
            </p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && activeCategory === "All" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <Link href={`/blog/${featuredPost.slug}`}>
                  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer">
                    <div className="grid md:grid-cols-2 gap-0">
                      {featuredPost.coverImage && (
                        <div className="relative h-64 md:h-full overflow-hidden">
                          <img
                            src={featuredPost.coverImage}
                            alt={featuredPost.title}
                            width={800}
                            height={450}
                            loading="eager"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-brand-gold text-brand-charcoal text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
                              style={{ fontFamily: "var(--font-body)" }}>
                              Featured
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="p-8 md:p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-brand-gold text-xs font-semibold uppercase tracking-wider"
                            style={{ fontFamily: "var(--font-body)" }}>
                            {featuredPost.category}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="flex items-center gap-1 text-gray-400 text-xs"
                            style={{ fontFamily: "var(--font-body)" }}>
                            <Clock className="w-3 h-3" />
                            {featuredPost.readTimeMinutes} min read
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-brand-charcoal mb-3 group-hover:text-brand-gold transition-colors"
                          style={{ fontFamily: "var(--font-heading)" }}>
                          {featuredPost.title}
                        </h2>
                        <p className="text-gray-500 leading-relaxed mb-6"
                          style={{ fontFamily: "var(--font-body)" }}>
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-gray-400 text-sm"
                            style={{ fontFamily: "var(--font-body)" }}>
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(featuredPost.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1.5 text-brand-gold font-semibold text-sm group-hover:gap-3 transition-all"
                            style={{ fontFamily: "var(--font-body)" }}>
                            Read Article
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Post Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(activeCategory === "All" ? remainingPosts : posts).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <article className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer h-full flex flex-col">
                      {post.coverImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            width={400}
                            height={225}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-brand-gold text-xs font-semibold uppercase tracking-wider"
                            style={{ fontFamily: "var(--font-body)" }}>
                            {post.category}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="flex items-center gap-1 text-gray-400 text-xs"
                            style={{ fontFamily: "var(--font-body)" }}>
                            <Clock className="w-3 h-3" />
                            {post.readTimeMinutes} min
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-brand-charcoal mb-2 group-hover:text-brand-gold transition-colors line-clamp-2"
                          style={{ fontFamily: "var(--font-heading)" }}>
                          {post.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3 flex-1"
                          style={{ fontFamily: "var(--font-body)" }}>
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <span className="text-gray-400 text-xs"
                            style={{ fontFamily: "var(--font-body)" }}>
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1 text-brand-gold font-semibold text-xs group-hover:gap-2 transition-all"
                            style={{ fontFamily: "var(--font-body)" }}>
                            Read
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* CTA Section */}
      <section className="bg-brand-charcoal py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to Start Your <span className="text-brand-gold">Concrete Project</span>?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            Get a free, no-obligation quote from our experienced team. We service Brisbane and all surrounding areas.
          </p>
          <Link href="/get-quote">
            <span className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-8 py-3.5 rounded-md text-sm tracking-wide uppercase transition-all cursor-pointer shadow-lg shadow-brand-gold/20 hover:shadow-xl hover:shadow-brand-gold/30"
              style={{ fontFamily: "var(--font-body)" }}>
              Get a Free Quote
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* Free Guide CTA */}
      <GuideCtaBanner variant="section" />

      {/* Footer */}
      <footer className="bg-[#1a1a1a] py-8">
        <div className="container flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/25 text-xs" style={{ fontFamily: "var(--font-body)" }}>
            &copy; {new Date().getFullYear()} Concrete Concepts Group Pty Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/">
              <span className="text-white/25 hover:text-brand-gold text-xs transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-body)" }}>
                Home
              </span>
            </Link>
            <Link href="/blog">
              <span className="text-brand-gold text-xs cursor-pointer"
                style={{ fontFamily: "var(--font-body)" }}>
                Blog
              </span>
            </Link>
          </div>
        </div>
      </footer>
      <StickyMobileCTA />
    </div>
  );
}
