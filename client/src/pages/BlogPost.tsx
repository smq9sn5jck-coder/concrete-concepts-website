import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  User,
  ChevronLeft,
  Loader2,
  BookOpen,
  MapPin,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import SocialShare from "@/components/SocialShare";
import { trackBlogPostView } from "@/components/ConversionTracking";
import GuideCtaBanner from "@/components/GuideCtaBanner";
import BlogQuoteCTA from "@/components/BlogQuoteCTA";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { useEffect, useMemo } from "react";

// Topic cluster mapping: blog post slug → related service page slugs
const BLOG_TO_SERVICE_MAP: Record<string, { slug: string; title: string }[]> = {
  "concrete-driveway-cost-brisbane-price-guide": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "concrete-driveway-vs-pavers-cost-comparison-brisbane": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "concrete-vs-asphalt-driveway-brisbane": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "concrete-vs-pavers-brisbane-driveways": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "best-concrete-finishes-brisbane-driveways": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
    { slug: "exposed-aggregate-brisbane", title: "Exposed Aggregate Brisbane" },
  ],
  "how-to-maintain-concrete-driveway-brisbane": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "signs-concrete-driveway-needs-replacing": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "concrete-driveways-outdoor-areas-boost-property-value": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
  ],
  "exposed-aggregate-concrete-cost-brisbane-price-guide": [
    { slug: "exposed-aggregate-brisbane", title: "Exposed Aggregate Brisbane" },
  ],
  "exposed-aggregate-vs-plain-concrete-brisbane": [
    { slug: "exposed-aggregate-brisbane", title: "Exposed Aggregate Brisbane" },
  ],
  "exposed-aggregate-colours-stone-blend-guide": [
    { slug: "exposed-aggregate-brisbane", title: "Exposed Aggregate Brisbane" },
  ],
  "coloured-concrete-options-brisbane-homes": [
    { slug: "exposed-aggregate-brisbane", title: "Exposed Aggregate Brisbane" },
  ],
  "concrete-retaining-wall-cost-brisbane-price-guide": [
    { slug: "retaining-walls-brisbane", title: "Retaining Walls Brisbane" },
  ],
  "retaining-wall-guide-brisbane-types-costs-council": [
    { slug: "retaining-walls-brisbane", title: "Retaining Walls Brisbane" },
  ],
  "council-approval-retaining-walls-queensland": [
    { slug: "retaining-walls-brisbane", title: "Retaining Walls Brisbane" },
  ],
  "concrete-sloping-blocks-brisbane-solutions": [
    { slug: "retaining-walls-brisbane", title: "Retaining Walls Brisbane" },
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
  ],
  "concrete-slab-thickness-australian-standards": [
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
    { slug: "shed-slabs-brisbane", title: "Shed Slabs Brisbane" },
  ],
  "concrete-slab-preparation-most-important-part": [
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
    { slug: "excavation-brisbane", title: "Excavation Brisbane" },
  ],
  "how-long-concrete-cure-brisbane-weather": [
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
  ],
  "pouring-concrete-rain-wet-weather-brisbane": [
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
  ],
  "concrete-patio-cost-brisbane-guide": [
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
  ],
  "decorative-concrete-ideas-brisbane-outdoor": [
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
    { slug: "pool-surrounds-brisbane", title: "Pool Surrounds Brisbane" },
  ],
  "brisbane-outdoor-living-concrete-trends-2026": [
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
  ],
  "stencilled-concrete-vs-stamped-concrete": [
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
  ],
  "excavation-cost-brisbane-price-guide": [
    { slug: "excavation-brisbane", title: "Excavation Brisbane" },
  ],
  "concrete-crossover-permits-brisbane": [
    { slug: "crossover-permits-brisbane", title: "Crossover Permits Brisbane" },
  ],
  "pool-surrounds-brisbane-concrete-vs-pavers-vs-tiles": [
    { slug: "pool-surrounds-brisbane", title: "Pool Surrounds Brisbane" },
  ],
  "concrete-shed-slabs-brisbane-guide": [
    { slug: "shed-slabs-brisbane", title: "Shed Slabs Brisbane" },
  ],
  "concrete-garage-floor-coatings-finishes-cost": [
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
  ],
  "what-is-covercrete-concrete-overlay-guide": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
  ],
  "concrete-resurfacing-vs-replacement-brisbane": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "how-to-fix-cracked-concrete-brisbane": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
  ],
  "concrete-pathways-footpaths-brisbane-design": [
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
  ],
  "best-time-pour-concrete-brisbane-seasonal-guide": [
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
  ],
  "what-to-expect-concreting-job-brisbane": [
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "prepare-property-concreting-job-brisbane-checklist": [
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "choose-right-concreter-brisbane-questions": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "qbcc-licensing-matters-hiring-concreter-queensland": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "granny-flat-concrete-slab-cost-brisbane-price-guide": [
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
    { slug: "shed-slabs-brisbane", title: "Shed Slabs Brisbane" },
    { slug: "excavation-brisbane", title: "Excavation Brisbane" },
    { slug: "retaining-walls-brisbane", title: "Retaining Walls Brisbane" },
  ],
  "concrete-removal-cost-brisbane-price-guide": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
    { slug: "excavation-brisbane", title: "Excavation Brisbane" },
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
  ],
  "concrete-vs-timber-retaining-wall-brisbane": [
    { slug: "retaining-walls-brisbane", title: "Retaining Walls Brisbane" },
    { slug: "excavation-brisbane", title: "Excavation Brisbane" },
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
    { slug: "pool-surrounds-brisbane", title: "Pool Surrounds Brisbane" },
  ],
  "concrete-colour-chart-brisbane-oxide-guide": [
    { slug: "exposed-aggregate-brisbane", title: "Exposed Aggregate Brisbane" },
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
    { slug: "pool-surrounds-brisbane", title: "Pool Surrounds Brisbane" },
  ],
  "concrete-vs-gravel-driveway-brisbane-cost-comparison": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
    { slug: "excavation-brisbane", title: "Excavation Brisbane" },
  ],
  "concrete-steps-cost-brisbane-price-guide": [
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
    { slug: "retaining-walls-brisbane", title: "Retaining Walls Brisbane" },
    { slug: "pool-surrounds-brisbane", title: "Pool Surrounds Brisbane" },
  ],
  "concrete-garden-edging-kerbing-cost-brisbane": [
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "concrete-garage-floor-cost-brisbane-price-guide": [
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
    { slug: "shed-slabs-brisbane", title: "Shed Slabs Brisbane" },
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "concrete-carport-slab-cost-brisbane": [
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
    { slug: "shed-slabs-brisbane", title: "Shed Slabs Brisbane" },
    { slug: "excavation-brisbane", title: "Excavation Brisbane" },
  ],
  "concrete-cost-per-square-metre-brisbane-2026": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
    { slug: "exposed-aggregate-brisbane", title: "Exposed Aggregate Brisbane" },
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
    { slug: "retaining-walls-brisbane", title: "Retaining Walls Brisbane" },
  ],
  "concrete-driveway-extension-cost-brisbane": [
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
    { slug: "crossover-permits-brisbane", title: "Crossover Permits Brisbane" },
    { slug: "excavation-brisbane", title: "Excavation Brisbane" },
  ],
  "concrete-vs-timber-deck-brisbane-cost-comparison": [
    { slug: "concrete-patios-brisbane", title: "Concrete Patios Brisbane" },
    { slug: "exposed-aggregate-brisbane", title: "Exposed Aggregate Brisbane" },
    { slug: "concrete-driveways-brisbane", title: "Concrete Driveways Brisbane" },
  ],
  "concrete-block-vs-poured-retaining-wall-brisbane": [
    { slug: "retaining-walls-brisbane", title: "Retaining Walls Brisbane" },
    { slug: "excavation-brisbane", title: "Excavation Brisbane" },
    { slug: "concrete-slabs-brisbane", title: "Concrete Slabs Brisbane" },
  ],
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: post, isLoading, error } = trpc.blog.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Fetch other posts for "Related Posts" section — prioritise same category
  const { data: allPosts } = trpc.blog.list.useQuery(undefined);
  const relatedPosts = useMemo(() => {
    if (!allPosts || !post) return [];
    const others = allPosts.filter((p) => p.slug !== slug);
    // Same category first, then remaining posts, capped at 3
    const sameCategory = others.filter((p) => p.category === post.category);
    const differentCategory = others.filter((p) => p.category !== post.category);
    return [...sameCategory, ...differentCategory].slice(0, 3);
  }, [allPosts, post, slug]);

  // Extract FAQ pairs from blog content for FAQ schema markup
  // Looks for ## headings that are questions (contain "?") followed by paragraph content
  // MUST be above early returns to satisfy React hooks ordering rules
  const faqPairs = useMemo(() => {
    const content = post?.content;
    if (!content) return [];
    const faqs: { question: string; answer: string }[] = [];
    const lines = content.split("\n");
    let currentQuestion = "";
    let currentAnswer = "";
    for (const line of lines) {
      const headingMatch = line.match(/^#{1,3}\s+(.+\?.*$)/);
      if (headingMatch) {
        if (currentQuestion && currentAnswer.trim()) {
          faqs.push({ question: currentQuestion, answer: currentAnswer.trim() });
        }
        currentQuestion = headingMatch[1].replace(/\*+/g, "").trim();
        currentAnswer = "";
      } else if (currentQuestion && line.trim() && !line.startsWith("#") && !line.startsWith("|") && !line.startsWith("---")) {
        currentAnswer += (currentAnswer ? " " : "") + line.replace(/\*+/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
      } else if (currentQuestion && line.startsWith("#") && !line.match(/^#{1,3}\s+(.+\?)/)) {
        if (currentAnswer.trim()) {
          faqs.push({ question: currentQuestion, answer: currentAnswer.trim() });
        }
        currentQuestion = "";
        currentAnswer = "";
      }
    }
    if (currentQuestion && currentAnswer.trim()) {
      faqs.push({ question: currentQuestion, answer: currentAnswer.trim() });
    }
    return faqs;
  }, [post?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold mx-auto mb-3" />
          <p className="text-gray-500" style={{ fontFamily: "var(--font-body)" }}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-brand-charcoal mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Article Not Found
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontFamily: "var(--font-body)" }}>
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/blog">
            <span className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-6 py-2.5 rounded-md text-sm transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-body)" }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage || undefined,
    datePublished: new Date(post.publishedAt).toISOString(),
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.publishedAt).toISOString(),
    author: {
      "@type": "Organization",
      name: "Concrete Concepts Group Pty Ltd",
      url: "https://concreteconceptsgroup.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Concrete Concepts Group Pty Ltd",
      url: "https://concreteconceptsgroup.com",
      logo: {
        "@type": "ImageObject",
        url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-logo-hero-dark_3c260b83.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://concreteconceptsgroup.com/blog/${post.slug}`,
    },
  };

  // FAQ schema for Google "People Also Ask" rich snippets
  const faqSchema = faqPairs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqPairs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  // HowTo schema for step-by-step blog posts (gets rich snippets in Google)
  const howToSteps = useMemo(() => {
    const content = post?.content;
    if (!content) return [];
    const steps: { name: string; text: string }[] = [];
    const lines = content.split("\n");
    let currentStep = "";
    let currentText = "";
    for (const line of lines) {
      // Match patterns like "## Step 1: ...", "## 1. ...", "### Step 1 - ..."
      const stepMatch = line.match(/^#{2,3}\s+(?:Step\s*\d+[:\-\s]*|\d+\.\s*)(.+)$/i);
      if (stepMatch) {
        if (currentStep && currentText.trim()) {
          steps.push({ name: currentStep, text: currentText.trim() });
        }
        currentStep = stepMatch[1].replace(/\*+/g, "").trim();
        currentText = "";
      } else if (currentStep && line.trim() && !line.startsWith("#") && !line.startsWith("|") && !line.startsWith("---")) {
        currentText += (currentText ? " " : "") + line.replace(/\*+/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
      } else if (currentStep && line.startsWith("#") && !line.match(/^#{2,3}\s+(?:Step\s*\d+|\d+\.)/i)) {
        if (currentText.trim()) {
          steps.push({ name: currentStep, text: currentText.trim() });
        }
        currentStep = "";
        currentText = "";
      }
    }
    if (currentStep && currentText.trim()) {
      steps.push({ name: currentStep, text: currentText.trim() });
    }
    return steps.length >= 3 ? steps : []; // Only use if 3+ steps found
  }, [post?.content]);

  const howToSchema = howToSteps.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage || undefined,
    step: howToSteps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  } : null;

  // Combine all schemas
  const allSchemas = [articleSchema, faqSchema, howToSchema].filter(Boolean) as Record<string, unknown>[];

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SEOHead
        title={`${post.metaTitle || post.title} | Concrete Concepts Group`}
        description={post.metaDescription || post.excerpt}
        canonical={`/blog/${post.slug}`}
        ogType="article"
        ogImage={post.coverImage || undefined}
        keywords={`${post.category}, concreting Brisbane, concrete tips, ${post.title}`}
        structuredData={allSchemas.length > 1 ? allSchemas : articleSchema}
      />
      {/* Header */}
      <header className="bg-brand-charcoal text-white">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <Link href="/blog">
              <span className="flex items-center gap-2 text-white/70 hover:text-brand-gold transition-colors cursor-pointer text-sm"
                style={{ fontFamily: "var(--font-body)" }}>
                <ChevronLeft className="w-4 h-4" />
                All Articles
              </span>
            </Link>
            <Link href="/get-quote">
              <span className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-5 py-2 rounded-md text-sm tracking-wide uppercase transition-all cursor-pointer"
                style={{ fontFamily: "var(--font-body)" }}>
                Get a Free Quote
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Article Hero */}
      <section className="bg-brand-charcoal text-white pb-12 pt-4">
        <div className="container max-w-4xl mx-auto">
          <Breadcrumbs
            items={[
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
            className="mb-6"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-brand-gold text-xs font-semibold uppercase tracking-wider"
                style={{ fontFamily: "var(--font-body)" }}>
                {post.category}
              </span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span className="flex items-center gap-1.5 text-white/50 text-xs"
                style={{ fontFamily: "var(--font-body)" }}>
                <Clock className="w-3 h-3" />
                {post.readTimeMinutes} min read
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}>
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-white/50 text-sm"
              style={{ fontFamily: "var(--font-body)" }}>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {post.authorName}
              </span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.publishedAt)}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="container max-w-4xl mx-auto -mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl overflow-hidden shadow-2xl -mt-4"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={630}
              loading="eager"
              decoding="async"
              className="w-full h-64 md:h-96 object-cover"
            />
          </motion.div>
        </div>
      )}

      {/* Article Content */}
      <article className="container max-w-3xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-brand-charcoal
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-5
            prose-a:text-brand-gold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-brand-charcoal
            prose-ul:text-gray-600 prose-ol:text-gray-600
            prose-li:mb-2
            prose-blockquote:border-l-brand-gold prose-blockquote:bg-brand-gold/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            prose-img:rounded-xl prose-img:shadow-lg"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 style={{ fontFamily: "var(--font-heading)" }}>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 style={{ fontFamily: "var(--font-heading)" }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 style={{ fontFamily: "var(--font-heading)" }}>{children}</h3>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </motion.div>

        {/* Inline Quote CTA — captures leads mid-article */}
        <BlogQuoteCTA
          serviceContext={BLOG_TO_SERVICE_MAP[post.slug]?.[0]?.title}
          variant="mid-article"
        />

        {/* Social Sharing */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <SocialShare
            url={`/blog/${post.slug}`}
            title={post.title}
            description={post.excerpt}
            contentType="blog"
          />
        </div>

        {/* Author / CTA Card */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-brand-charcoal rounded-full flex items-center justify-center shrink-0">
              <span className="text-brand-gold font-bold text-xl" style={{ fontFamily: "var(--font-heading)" }}>CC</span>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h4 className="font-bold text-brand-charcoal text-lg mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                Concrete Concepts Group
              </h4>
              <p className="text-gray-500 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                QBCC Licensed (#15299707) concreting professionals serving Brisbane and all surrounding areas. 
                Over 100 projects completed with a 5-star reputation.
              </p>
            </div>
            <Link href="/get-quote">
              <span className="shrink-0 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold px-6 py-2.5 rounded-md text-sm tracking-wide uppercase transition-all cursor-pointer whitespace-nowrap"
                style={{ fontFamily: "var(--font-body)" }}>
                Get a Quote
              </span>
            </Link>
          </div>
        </div>

        {/* Related Service Pages — Topic Cluster Back-Links */}
        {BLOG_TO_SERVICE_MAP[post.slug] && BLOG_TO_SERVICE_MAP[post.slug].length > 0 && (
          <div className="mt-10 p-6 bg-brand-charcoal/5 rounded-xl border border-gray-200">
            <h3 className="flex items-center gap-2 text-base font-bold text-brand-charcoal mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              <BookOpen className="w-4 h-4 text-brand-gold" />
              Explore Our Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {BLOG_TO_SERVICE_MAP[post.slug].map(svc => (
                <Link key={svc.slug} href={`/services/${svc.slug}`}>
                  <span className="inline-flex items-center gap-1.5 bg-white hover:bg-brand-gold/10 text-brand-charcoal text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-brand-gold transition-all cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                    {svc.title}
                    <ArrowRight className="w-3 h-3 text-brand-gold" />
                  </span>
                </Link>
              ))}
              <Link href="/finishes">
                <span className="inline-flex items-center gap-1.5 bg-white hover:bg-brand-gold/10 text-brand-charcoal text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-brand-gold transition-all cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                  Compare Finishes
                  <ArrowRight className="w-3 h-3 text-brand-gold" />
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* Local Area Links — Suburb Cross-Linking for SEO */}
        <div className="mt-8 p-6 bg-brand-charcoal/5 rounded-xl border border-gray-200">
          <h3 className="flex items-center gap-2 text-base font-bold text-brand-charcoal mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            <MapPin className="w-4 h-4 text-brand-gold" />
            We Service These Brisbane Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {[{s:"carindale",n:"Carindale"},{s:"logan",n:"Logan"},{s:"wynnum",n:"Wynnum"},{s:"springfield",n:"Springfield"},{s:"chermside",n:"Chermside"},{s:"north-lakes",n:"North Lakes"},{s:"ipswich",n:"Ipswich"},{s:"redlands",n:"Redlands"},{s:"beenleigh",n:"Beenleigh"},{s:"camp-hill",n:"Camp Hill"},{s:"fortitude-valley",n:"Fortitude Valley"},{s:"bulimba",n:"Bulimba"},{s:"paddington",n:"Paddington"}].map(a => (
              <Link key={a.s} href={`/areas/${a.s}`}>
                <span className="inline-flex items-center gap-1.5 bg-white hover:bg-brand-gold/10 text-brand-charcoal text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-gold transition-all cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                  {a.n}
                </span>
              </Link>
            ))}
            <Link href="/areas">
              <span className="inline-flex items-center gap-1.5 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-charcoal text-sm font-semibold px-3 py-1.5 rounded-lg border border-brand-gold/30 transition-all cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                View All 97+ Areas <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>

        {/* Free Guide CTA */}
        <div className="mt-12">
          <GuideCtaBanner variant="inline" />
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gradient-to-b from-white to-gray-50 py-16 border-t border-gray-100">
          <div className="container">
            <div className="text-center mb-10">
              <span className="text-brand-gold text-xs font-semibold uppercase tracking-widest mb-2 block"
                style={{ fontFamily: "var(--font-body)" }}>
                Keep Reading
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-charcoal"
                style={{ fontFamily: "var(--font-heading)" }}>
                Related <span className="text-brand-gold">Articles</span>
              </h2>
              <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                More expert guides from our Brisbane concreting team
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {relatedPosts.map((relPost) => (
                <Link key={relPost.id} href={`/blog/${relPost.slug}`}>
                  <article className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-brand-gold/30 h-full flex flex-col">
                    {relPost.coverImage && (
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={relPost.coverImage}
                          alt={relPost.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-brand-gold/90 text-brand-charcoal text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                            style={{ fontFamily: "var(--font-body)" }}>
                            {relPost.category}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-base font-bold text-brand-charcoal group-hover:text-brand-gold transition-colors line-clamp-2 mb-2"
                        style={{ fontFamily: "var(--font-heading)" }}>
                        {relPost.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 flex-1"
                        style={{ fontFamily: "var(--font-body)" }}>
                        {relPost.excerpt}
                      </p>
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                        <span className="flex items-center gap-1 text-gray-400 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(relPost.publishedAt)}
                        </span>
                        {relPost.readTimeMinutes && (
                          <span className="flex items-center gap-1 text-gray-400 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                            <Clock className="w-3 h-3" />
                            {relPost.readTimeMinutes} min read
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/blog">
                <span className="inline-flex items-center gap-2 bg-brand-charcoal hover:bg-brand-navy text-white font-semibold text-sm px-6 py-3 rounded-lg hover:gap-3 transition-all cursor-pointer"
                  style={{ fontFamily: "var(--font-body)" }}>
                  View All Articles
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* End-of-Article Quote CTA — catches readers who scrolled all the way down */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
        <div className="container max-w-3xl">
          <BlogQuoteCTA
            serviceContext={BLOG_TO_SERVICE_MAP[post.slug]?.[0]?.title}
            variant="mid-article"
          />
        </div>
      </section>

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
              <span className="text-white/25 hover:text-brand-gold text-xs transition-colors cursor-pointer"
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
