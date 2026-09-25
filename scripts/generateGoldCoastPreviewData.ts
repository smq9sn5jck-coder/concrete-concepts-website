import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  GOLD_COAST_COVERAGE_GROUPS,
  GOLD_COAST_EXISTING_LOCALITIES,
  GOLD_COAST_OFFICIAL_RESOURCES,
  GOLD_COAST_REVIEW_PATHS,
  GOLD_COAST_SERVICE_PAGES,
  GOLD_COAST_UPGRADE_LOCALITIES,
} from "../shared/goldCoastContent";
import { buildLocalityStructuredData } from "../shared/localityStructuredData";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string | null;
  published: number;
  authorName: string;
  readTimeMinutes: number;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
};

const root = resolve(import.meta.dirname, "..");
const publicDirectory = resolve(root, "client/public");
const clientGeneratedDirectory = resolve(root, "client/src/generated");
const blogSnapshotPath = resolve(root, "content/published-blog-posts.json");

const previewEnabled = process.env.VITE_GOLD_COAST_PREVIEW === "true";
const publishedEnabled = process.env.VITE_GOLD_COAST_PUBLISHED === "true";

function serialize(value: unknown) {
  return JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");
}

function articleStructuredData(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage || undefined,
    datePublished: new Date(post.publishedAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      "@type": "Organization",
      name: post.authorName,
      url: "https://concreteconceptsgroup.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Concrete Concepts Group Pty Ltd",
      url: "https://concreteconceptsgroup.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://concreteconceptsgroup.com/blog/${post.slug}`,
    },
  };
}

const rawBlogPosts = JSON.parse(await readFile(blogSnapshotPath, "utf8")) as BlogPost[];
const blogPosts = rawBlogPosts
  .filter(post => post.published === 1)
  .map(post => ({
    ...post,
    publishedAt: new Date(post.publishedAt).toISOString(),
    updatedAt: new Date(post.updatedAt).toISOString(),
    createdAt: new Date(post.createdAt).toISOString(),
  }));
const blogSummaries = blogPosts.map(({ content: _content, metaTitle, metaDescription, published, createdAt, ...post }) => post);

const goldCoastStructuredData = Object.fromEntries(
  GOLD_COAST_UPGRADE_LOCALITIES.map(record => [record.slug, buildLocalityStructuredData(record)]),
);

await mkdir(publicDirectory, { recursive: true });
await mkdir(clientGeneratedDirectory, { recursive: true });

await writeFile(
  resolve(publicDirectory, "gold-coast-content.js"),
  `// GENERATED FILE — run pnpm gold-coast:generate. Do not edit by hand.\nexport const GENERATED_GOLD_COAST_PREVIEW_ENABLED = ${previewEnabled};\nexport const GENERATED_GOLD_COAST_PUBLISHED_ENABLED = ${publishedEnabled};\nexport const GENERATED_GOLD_COAST_OFFICIAL_RESOURCES = ${serialize(GOLD_COAST_OFFICIAL_RESOURCES)};\nexport const GENERATED_GOLD_COAST_EXISTING_LOCALITIES = ${serialize(GOLD_COAST_EXISTING_LOCALITIES)};\nexport const GENERATED_GOLD_COAST_COVERAGE_GROUPS = ${serialize(GOLD_COAST_COVERAGE_GROUPS)};\nexport const GENERATED_GOLD_COAST_SERVICE_PAGES = ${serialize(GOLD_COAST_SERVICE_PAGES)};\nexport const GENERATED_GOLD_COAST_UPGRADE_LOCALITIES = ${serialize(GOLD_COAST_UPGRADE_LOCALITIES)};\nexport const GENERATED_GOLD_COAST_REVIEW_PATHS = ${serialize(GOLD_COAST_REVIEW_PATHS)};\nexport const GENERATED_GOLD_COAST_UPGRADE_BY_SLUG = Object.fromEntries(GENERATED_GOLD_COAST_UPGRADE_LOCALITIES.map(record => [record.slug, record]));\nexport const GENERATED_GOLD_COAST_SERVICE_BY_SLUG = Object.fromEntries(GENERATED_GOLD_COAST_SERVICE_PAGES.map(page => [page.slug, page]));\nexport const GENERATED_GOLD_COAST_STRUCTURED_DATA_BY_SLUG = ${serialize(goldCoastStructuredData)};\n\nexport function getGoldCoastRouteAccess(path, customerHost) {\n  if (!GENERATED_GOLD_COAST_REVIEW_PATHS.includes(path)) return \"not-found\";\n  if (path === \"/gold-coast-review\") return !customerHost && GENERATED_GOLD_COAST_PREVIEW_ENABLED ? \"preview\" : \"not-found\";\n  if (customerHost) return GENERATED_GOLD_COAST_PUBLISHED_ENABLED ? \"public\" : \"not-found\";\n  return GENERATED_GOLD_COAST_PREVIEW_ENABLED ? \"preview\" : \"not-found\";\n}\n\nexport function getGoldCoastLocalityUpgradeAccess(slug, customerHost) {\n  if (!GENERATED_GOLD_COAST_UPGRADE_BY_SLUG[slug]) return \"not-found\";\n  if (customerHost) return GENERATED_GOLD_COAST_PUBLISHED_ENABLED ? \"public\" : \"legacy\";\n  return GENERATED_GOLD_COAST_PREVIEW_ENABLED ? \"preview\" : \"legacy\";\n}\n`,
  "utf8",
);

await writeFile(
  resolve(clientGeneratedDirectory, "goldCoastConfig.ts"),
  `// GENERATED FILE — run pnpm gold-coast:generate. Do not edit by hand.\nexport const GOLD_COAST_PREVIEW_ENABLED = ${previewEnabled};\nexport const GOLD_COAST_PUBLISHED_ENABLED = ${publishedEnabled};\n`,
  "utf8",
);

await writeFile(
  resolve(publicDirectory, "blog-content.js"),
  `// GENERATED FILE — run pnpm gold-coast:generate. Do not edit by hand.\nexport const GENERATED_PUBLISHED_BLOG_POSTS = ${serialize(blogPosts)};\nexport const GENERATED_PUBLISHED_BLOG_POST_SUMMARIES = ${serialize(blogSummaries)};\nexport const GENERATED_PUBLISHED_BLOG_BY_SLUG = Object.fromEntries(GENERATED_PUBLISHED_BLOG_POSTS.map(post => [post.slug, post]));\nexport const GENERATED_BLOG_STRUCTURED_DATA_BY_SLUG = ${serialize(Object.fromEntries(blogPosts.map(post => [post.slug, articleStructuredData(post)])))};\n`,
  "utf8",
);

await writeFile(
  resolve(clientGeneratedDirectory, "blogContent.ts"),
  `// GENERATED FILE — run pnpm gold-coast:generate. Do not edit by hand.\nexport interface StaticBlogPost {\n  id: number; title: string; slug: string; excerpt: string; content: string; category: string;\n  coverImage: string | null; published: number; authorName: string; readTimeMinutes: number;\n  metaTitle: string | null; metaDescription: string | null; publishedAt: string; updatedAt: string; createdAt: string;\n}\nexport const STATIC_PUBLISHED_BLOG_POSTS: StaticBlogPost[] = ${serialize(blogPosts)};\nexport const STATIC_PUBLISHED_BLOG_BY_SLUG = Object.fromEntries(STATIC_PUBLISHED_BLOG_POSTS.map(post => [post.slug, post])) as Record<string, StaticBlogPost>;\n`,
  "utf8",
);

console.log(`Generated Gold Coast flags (${previewEnabled ? "preview" : "default"}), ${blogPosts.length} published blog records.`);
