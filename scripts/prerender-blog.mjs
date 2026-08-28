/**
 * Pre-render blog posts as static JSON files for Cloudflare Pages deployment.
 * Fetches all published blog posts from the database and writes them as:
 * - dist/public/blog-data/posts.json (list of all posts with metadata)
 * - dist/public/blog-data/{slug}.json (individual post with full content)
 * - dist/public/blog-data/categories.json (list of categories)
 * 
 * Also generates static HTML pages for SEO crawlers at:
 * - dist/public/blog/{slug}.html (full HTML with meta tags and content)
 */
import mysql from 'mysql2/promise';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Parse the MySQL connection string
const url = new URL(DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: true }
});

console.log('Connected to database');

// Fetch all published blog posts
const [posts] = await connection.execute(
  'SELECT id, title, slug, excerpt, content, category, coverImage, authorName, readTimeMinutes, metaTitle, metaDescription, publishedAt, updatedAt FROM blog_posts WHERE published = 1 ORDER BY publishedAt DESC'
);

console.log(`Found ${posts.length} published blog posts`);

const distDir = join(process.cwd(), 'dist', 'public');
const blogDataDir = join(distDir, 'blog-data');
const blogHtmlDir = join(distDir, 'blog');

mkdirSync(blogDataDir, { recursive: true });
mkdirSync(blogHtmlDir, { recursive: true });

// Write posts list (without full content for smaller payload)
const postsList = posts.map(p => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  excerpt: p.excerpt,
  category: p.category,
  coverImage: p.coverImage,
  authorName: p.authorName,
  readTimeMinutes: p.readTimeMinutes,
  publishedAt: p.publishedAt,
  updatedAt: p.updatedAt
}));

writeFileSync(join(blogDataDir, 'posts.json'), JSON.stringify(postsList));
console.log(`Written posts.json (${postsList.length} posts)`);

// Write categories
const categories = [...new Set(posts.map(p => p.category))].sort();
writeFileSync(join(blogDataDir, 'categories.json'), JSON.stringify(categories));
console.log(`Written categories.json (${categories.length} categories)`);

// Write individual post JSON files
for (const post of posts) {
  writeFileSync(join(blogDataDir, `${post.slug}.json`), JSON.stringify(post));
}
console.log(`Written ${posts.length} individual post JSON files`);

// Generate static HTML pages for SEO
const baseUrl = 'https://concreteconceptsgroup.com';
const template = (post) => `<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.metaTitle || post.title} | Concrete Concepts Group</title>
  <meta name="description" content="${(post.metaDescription || post.excerpt).replace(/"/g, '&quot;')}" />
  <link rel="canonical" href="${baseUrl}/blog/${post.slug}" />
  <meta property="og:title" content="${post.metaTitle || post.title}" />
  <meta property="og:description" content="${(post.metaDescription || post.excerpt).replace(/"/g, '&quot;')}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${baseUrl}/blog/${post.slug}" />
  ${post.coverImage ? `<meta property="og:image" content="${post.coverImage}" />` : ''}
  <meta property="og:locale" content="en_AU" />
  <meta property="og:site_name" content="Concrete Concepts Group" />
  <meta property="article:published_time" content="${new Date(post.publishedAt).toISOString()}" />
  <meta property="article:modified_time" content="${new Date(post.updatedAt).toISOString()}" />
  <meta property="article:section" content="${post.category}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${post.metaTitle || post.title}" />
  <meta name="twitter:description" content="${(post.metaDescription || post.excerpt).replace(/"/g, '&quot;')}" />
  ${post.coverImage ? `<meta name="twitter:image" content="${post.coverImage}" />` : ''}
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${post.title.replace(/"/g, '\\"')}",
    "description": "${(post.metaDescription || post.excerpt).replace(/"/g, '\\"')}",
    "author": {"@type": "Organization", "name": "${post.authorName}"},
    "publisher": {"@type": "Organization", "name": "Concrete Concepts Group", "logo": {"@type": "ImageObject", "url": "${baseUrl}/logo.png"}},
    "datePublished": "${new Date(post.publishedAt).toISOString()}",
    "dateModified": "${new Date(post.updatedAt).toISOString()}",
    ${post.coverImage ? `"image": "${post.coverImage}",` : ''}
    "mainEntityOfPage": {"@type": "WebPage", "@id": "${baseUrl}/blog/${post.slug}"}
  }
  </script>
  <meta http-equiv="refresh" content="0;url=${baseUrl}/blog/${post.slug}">
</head>
<body>
  <article>
    <h1>${post.title}</h1>
    <p><strong>By ${post.authorName}</strong> | ${post.readTimeMinutes} min read | ${post.category}</p>
    <p>${post.excerpt}</p>
    <div>${post.content}</div>
  </article>
  <p><a href="${baseUrl}/blog">Back to all articles</a></p>
</body>
</html>`;

for (const post of posts) {
  writeFileSync(join(blogHtmlDir, `${post.slug}.html`), template(post));
}
console.log(`Written ${posts.length} static HTML blog pages for SEO`);

// Update sitemap with blog posts
const sitemapPath = join(distDir, 'sitemap.xml');
if (existsSync(sitemapPath)) {
  let sitemap = readFileSync(sitemapPath, 'utf-8');
  
  // Generate blog post URLs
  const blogUrls = posts.map(post => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');
  
  // Insert before closing </urlset>
  sitemap = sitemap.replace('</urlset>', `${blogUrls}\n</urlset>`);
  writeFileSync(sitemapPath, sitemap);
  console.log(`Updated sitemap.xml with ${posts.length} blog post URLs`);
}

await connection.end();
console.log('Done! Blog posts pre-rendered for Cloudflare Pages.');
