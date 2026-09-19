import { int, decimal, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Quote requests table
export const quoteRequests = mysqlTable("quote_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  suburb: varchar("suburb", { length: 255 }).notNull(),
  service: varchar("service", { length: 255 }).notNull(),
  details: text("details"),
  photoUrls: text("photoUrls"),
  leadSource: varchar("leadSource", { length: 100 }),
  utmSource: varchar("utmSource", { length: 255 }),
  utmMedium: varchar("utmMedium", { length: 255 }),
  utmCampaign: varchar("utmCampaign", { length: 255 }),
  utmTerm: varchar("utmTerm", { length: 255 }),
  utmContent: varchar("utmContent", { length: 255 }),
  gclid: varchar("gclid", { length: 255 }),
  fbclid: varchar("fbclid", { length: 255 }),
  referrer: varchar("referrer", { length: 500 }),
  landingPage: varchar("landingPage", { length: 500 }),
  status: mysqlEnum("status", ["new", "contacted", "quoted", "won", "lost"]).default("new").notNull(),
  notes: text("notes"),
  quotedAmount: varchar("quotedAmount", { length: 50 }),
  pdfUrl: text("pdfUrl"),
  pdfRef: varchar("pdfRef", { length: 50 }),
  pdfSentAt: timestamp("pdfSentAt"),
  // Custom quote builder fields
  customTerms: text("customTerms"),
  validityDays: int("validityDays").default(30),
  customNotes: text("customNotes"),
  gstIncluded: int("gstIncluded").default(1),
  // Status portal & scheduling fields
  statusToken: varchar("statusToken", { length: 64 }).unique(),
  scheduledDate: timestamp("scheduledDate"),
  contactedAt: timestamp("contactedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = typeof quoteRequests.$inferInsert;

// Job timeline events — full audit trail of status changes, notes, and updates
export const jobTimelineEvents = mysqlTable("job_timeline_events", {
  id: int("id").autoincrement().primaryKey(),
  quoteRequestId: int("quoteRequestId").notNull(),
  eventType: mysqlEnum("eventType", [
    "status_change", "note_added", "quote_sent", "scheduled", 
    "job_started", "job_completed", "payment_received", "webhook_update"
  ]).notNull(),
  fromStatus: varchar("fromStatus", { length: 50 }),
  toStatus: varchar("toStatus", { length: 50 }),
  description: text("description"),
  metadata: text("metadata"), // JSON string for extra data
  source: mysqlEnum("source", ["website_admin", "ccg_app", "system", "customer"]).default("website_admin").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobTimelineEvent = typeof jobTimelineEvents.$inferSelect;
export type InsertJobTimelineEvent = typeof jobTimelineEvents.$inferInsert;

// Quote line items table — editable line items for custom quotes
export const quoteLineItems = mysqlTable("quote_line_items", {
  id: int("id").autoincrement().primaryKey(),
  quoteRequestId: int("quoteRequestId").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1").notNull(),
  unit: varchar("unit", { length: 50 }).default("item").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).default("0").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type InsertQuoteLineItem = typeof quoteLineItems.$inferInsert;

// Follow-up email tracking table
export const followUpEmails = mysqlTable("follow_up_emails", {
  id: int("id").autoincrement().primaryKey(),
  quoteRequestId: int("quoteRequestId").notNull(),
  emailType: mysqlEnum("emailType", ["day1_confirmation", "day3_followup", "day7_final", "review_request"]).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["sent", "failed"]).default("sent").notNull(),
});

export type FollowUpEmail = typeof followUpEmails.$inferSelect;
export type InsertFollowUpEmail = typeof followUpEmails.$inferInsert;

// Blog posts table
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  coverImage: text("coverImage"),
  published: int("published").default(1).notNull(),
  authorName: varchar("authorName", { length: 255 }).default("Concrete Concepts Group").notNull(),
  readTimeMinutes: int("readTimeMinutes").default(5).notNull(),
  metaTitle: varchar("metaTitle", { length: 500 }),
  metaDescription: varchar("metaDescription", { length: 500 }),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// Callback requests table — "Call Me Back in 60 Seconds" widget
export const callbackRequests = mysqlTable("callback_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  page: varchar("page", { length: 500 }),
  leadSource: varchar("leadSource", { length: 100 }),
  utmSource: varchar("utmSource", { length: 255 }),
  utmMedium: varchar("utmMedium", { length: 255 }),
  utmCampaign: varchar("utmCampaign", { length: 255 }),
  utmTerm: varchar("utmTerm", { length: 255 }),
  utmContent: varchar("utmContent", { length: 255 }),
  gclid: varchar("gclid", { length: 255 }),
  fbclid: varchar("fbclid", { length: 255 }),
  referrer: varchar("referrer", { length: 500 }),
  landingPage: varchar("landingPage", { length: 500 }),
  status: mysqlEnum("status", ["pending", "called", "no_answer", "completed"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CallbackRequest = typeof callbackRequests.$inferSelect;
export type InsertCallbackRequest = typeof callbackRequests.$inferInsert;

// Social media posts table — Facebook & Instagram posting
export const socialPosts = mysqlTable("social_posts", {
  id: int("id").autoincrement().primaryKey(),
  caption: text("caption").notNull(),
  imageUrl: text("imageUrl"),
  platforms: varchar("platforms", { length: 100 }).default("facebook,instagram").notNull(), // comma-separated: facebook,instagram
  status: mysqlEnum("status", ["draft", "scheduled", "publishing", "published", "failed"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  fbPostId: varchar("fbPostId", { length: 255 }),
  igPostId: varchar("igPostId", { length: 255 }),
  errorMessage: text("errorMessage"),
  postType: mysqlEnum("postType", ["blog_share", "project_photo", "testimonial", "promotion", "custom"]).default("custom").notNull(),
  blogPostId: int("blogPostId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;

// Abandoned quote follow-ups — tracks partial form submissions for recovery emails
export const abandonedQuotes = mysqlTable("abandoned_quotes", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  suburb: varchar("suburb", { length: 255 }),
  service: varchar("service", { length: 255 }),
  page: varchar("page", { length: 500 }),
  followUpSent: int("followUpSent").default(0).notNull(),
  followUpSentAt: timestamp("followUpSentAt"),
  converted: int("converted").default(0).notNull(),
  convertedAt: timestamp("convertedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AbandonedQuote = typeof abandonedQuotes.$inferSelect;
export type InsertAbandonedQuote = typeof abandonedQuotes.$inferInsert;

// Customer satisfaction surveys — auto-sent post-project completion
export const customerSurveys = mysqlTable("customer_surveys", {
  id: int("id").autoincrement().primaryKey(),
  quoteRequestId: int("quoteRequestId").notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  overallRating: int("overallRating"), // 1-5 stars
  qualityRating: int("qualityRating"), // 1-5 stars
  communicationRating: int("communicationRating"), // 1-5 stars
  timelinessRating: int("timelinessRating"), // 1-5 stars
  feedback: text("feedback"),
  wouldRecommend: int("wouldRecommend"), // 1 = yes, 0 = no
  googleReviewClicked: int("googleReviewClicked").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "completed", "expired"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  completedAt: timestamp("completedAt"),
  token: varchar("token", { length: 64 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerSurvey = typeof customerSurveys.$inferSelect;
export type InsertCustomerSurvey = typeof customerSurveys.$inferInsert;

// Scheduled blog posts — for the blog scheduling system
export const scheduledBlogPosts = mysqlTable("scheduled_blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  blogPostId: int("blogPostId").notNull(),
  scheduledPublishAt: timestamp("scheduledPublishAt").notNull(),
  published: int("published").default(0).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledBlogPost = typeof scheduledBlogPosts.$inferSelect;
export type InsertScheduledBlogPost = typeof scheduledBlogPosts.$inferInsert;

// Push notification subscriptions — for Web Push API
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  label: varchar("label", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// Ad spend tracking — monthly spend per campaign/platform for ROI calculations
export const adSpend = mysqlTable("ad_spend", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["google_ads", "meta_ads", "other"]).notNull(),
  campaignName: varchar("campaignName", { length: 255 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  spend: decimal("spend", { precision: 10, scale: 2 }).notNull(),
  impressions: int("impressions"),
  clicks: int("clicks"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdSpend = typeof adSpend.$inferSelect;
export type InsertAdSpend = typeof adSpend.$inferInsert;

// Digest settings — configuration for automated email reports
export const digestSettings = mysqlTable("digest_settings", {
  id: int("id").autoincrement().primaryKey(),
  enabled: int("enabled").default(1).notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  frequency: mysqlEnum("frequency", ["weekly", "monthly"]).default("weekly").notNull(),
  dayOfWeek: int("dayOfWeek").default(1).notNull(), // 0=Sun, 1=Mon, ...6=Sat
  lastSentAt: timestamp("lastSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DigestSettings = typeof digestSettings.$inferSelect;
export type InsertDigestSettings = typeof digestSettings.$inferInsert;
