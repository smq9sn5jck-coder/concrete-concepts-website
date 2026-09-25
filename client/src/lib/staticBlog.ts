import {
  STATIC_PUBLISHED_BLOG_BY_SLUG,
  STATIC_PUBLISHED_BLOG_POSTS,
} from "@/generated/blogContent";

export function getStaticPublishedBlogPost(slug: string) {
  return STATIC_PUBLISHED_BLOG_BY_SLUG[slug];
}

export function listStaticPublishedBlogPosts(category?: string) {
  if (!category) return STATIC_PUBLISHED_BLOG_POSTS;
  return STATIC_PUBLISHED_BLOG_POSTS.filter(post => post.category === category);
}
