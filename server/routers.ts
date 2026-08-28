import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { sendQuoteNotificationEmail, sendCustomerConfirmationEmail } from "./email";
import { makeRequest, PlaceDetailsResult, PlacesSearchResult } from "./_core/map";
import { z } from "zod";
import { getDb } from "./db";
import {
  getAllQuoteRequests,
  getQuoteRequestById,
  updateQuoteStatus,
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  getBlogPostsByCategory,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "./db";
import { quoteRequests, blogPosts, followUpEmails, callbackRequests, quoteLineItems, socialPosts, abandonedQuotes, customerSurveys, scheduledBlogPosts, jobTimelineEvents } from "../drizzle/schema";
import { sendCallbackNotificationEmail } from "./callbackEmail";
import { generateQuotePdf, generateCustomQuotePdf } from "./quotePdf";
import { storagePut } from "./storage";
import { sendQuotePdfEmail } from "./quotePdfEmail";
import { sendDay1WhatToExpect, sendDay3FollowUp, sendDay7FollowUp, sendReviewRequest } from "./followUpEmails";
import { isTwilioConfigured, sendNewQuoteSms, sendCallbackSms, sendDay3SmsFollowUp, sendDay7SmsFollowUp, sendReviewRequestSms } from "./smsFollowUp";
import { and, eq, ne, lt, gte, isNull, asc, desc, lte } from "drizzle-orm";
import { isMetaConfigured, isInstagramConfigured, postToFacebook, postToInstagram, postToBothPlatforms, generateHashtags } from "./metaApi";
import { sendAbandonedQuoteEmail } from "./abandonedQuoteEmail";
import { sendSurveyEmail } from "./surveyEmail";
import { addSubscription, removeSubscription, loadSubscriptionsFromDb, sendQuotePushNotification, sendCallbackPushNotification, isPushConfigured } from "./pushNotification";
import { pushSubscriptions as pushSubscriptionsTable } from "../drizzle/schema";
import crypto from "crypto";
import { analysePropertyPhoto, generateVisualisation, FINISH_PROMPTS, FINISH_TYPES, runQA, type JobBrief } from "./visualiser";
import { generateTimelapse } from "./timelapse";
import { getGoogleAdsDashboard, isWindsorConfigured } from "./googleAds";
import { TRPCError } from "@trpc/server";
import {
  assessSubmissionSignals,
  classifyServiceArea,
  createLeadFingerprint,
  SubmissionRateLimiter,
  validateAustralianPhone,
} from "@shared/leadValidation";
import { comprehensiveQuoteSchema, toLegacyQuoteFields } from "@shared/quoteBrief";

// Static fallback reviews (from Google Business Profile, manually curated)
// Used when Google Maps API quota is exhausted or unavailable
const STATIC_GOOGLE_REVIEWS = {
  reviews: [
    {
      authorName: "Myresh M",
      rating: 5,
      text: "Fantastic work from Jarrad and his team! Professional, efficient and delivered a high quality exposed aggregate finish. Very happy with the result and highly recommend!!",
      time: Math.floor(new Date("2025-08-04").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Sheeba",
      rating: 5,
      text: "Highly recommend Jarrod and his boys team for their exceptional professional work.",
      time: Math.floor(new Date("2025-05-02").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Kailash S",
      rating: 5,
      text: "Highly professional, respected our requirement, on time and completed the work to our entire satisfaction. Happy to recommend Jarred.",
      time: Math.floor(new Date("2025-05-24").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Joe S",
      rating: 5,
      text: "Excellent job done and quick and reliable.",
      time: Math.floor(new Date("2025-06-02").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Darren C",
      rating: 5,
      text: "Jarrad and his team did an amazing job on our driveway. From start to finish, the communication was excellent and the quality of work was outstanding. Would highly recommend to anyone needing concrete work done.",
      time: Math.floor(new Date("2025-07-15").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Sarah T",
      rating: 5,
      text: "We had our patio and pool surround done by Concrete Concepts. The exposed aggregate finish looks incredible. Jarrad was very professional and kept us informed throughout the entire process. Highly recommend!",
      time: Math.floor(new Date("2025-06-20").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Michael B",
      rating: 5,
      text: "Great team, great work. Had a large slab poured for our shed and the boys were efficient and professional. Price was fair and the finish was perfect. Thanks Jarrad!",
      time: Math.floor(new Date("2025-07-28").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Lisa W",
      rating: 5,
      text: "Jarrod and his team replaced our old cracked driveway with a beautiful exposed aggregate finish. They were punctual, tidy and the result exceeded our expectations. Five stars!",
      time: Math.floor(new Date("2025-08-10").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Chris P",
      rating: 5,
      text: "Had retaining walls and a new slab done. The team was professional from quote to completion. Very happy with the quality and would use again.",
      time: Math.floor(new Date("2025-04-18").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Amanda R",
      rating: 5,
      text: "Concrete Concepts did our entire backyard — patio, paths and retaining wall. Jarrad was easy to deal with, gave honest advice and delivered exactly what was promised. Couldn't be happier!",
      time: Math.floor(new Date("2025-03-22").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Tom H",
      rating: 5,
      text: "Top quality work on our crossover and driveway. The team was friendly, hardworking and left the site spotless. Would recommend to anyone in Brisbane.",
      time: Math.floor(new Date("2025-09-01").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Priya N",
      rating: 5,
      text: "We got quotes from 5 different concreters and Jarrad was the most professional and fairly priced. The finished product is stunning — our neighbours keep complimenting it!",
      time: Math.floor(new Date("2025-08-25").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Steve K",
      rating: 5,
      text: "Jarrad and the boys did a great job on our shed slab and side paths. On time, on budget and excellent communication throughout. Highly recommend Concrete Concepts.",
      time: Math.floor(new Date("2025-07-05").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Rachel M",
      rating: 5,
      text: "Amazing transformation of our outdoor area. The coloured concrete patio looks fantastic and the team were a pleasure to deal with. Thank you!",
      time: Math.floor(new Date("2025-06-30").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "David L",
      rating: 5,
      text: "Had a large commercial slab done for our warehouse extension. Concrete Concepts handled it professionally from start to finish. Great value for money.",
      time: Math.floor(new Date("2025-05-15").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Jenny F",
      rating: 5,
      text: "Jarrad quoted our job quickly and started within the week. The exposed aggregate driveway looks beautiful. Very happy we chose Concrete Concepts!",
      time: Math.floor(new Date("2025-09-10").getTime() / 1000),
      source: "Google" as const,
    },
    {
      authorName: "Mark D",
      rating: 5,
      text: "Second time using Concrete Concepts — first for our driveway, now for the pool surround. Consistently excellent work. Wouldn't go anywhere else.",
      time: Math.floor(new Date("2025-09-20").getTime() / 1000),
      source: "Google" as const,
    },
  ],
  rating: 4.9,
  totalReviews: 17,
};

// Cache for Google Reviews to reduce API calls (1 hour TTL)
// Initialized with static reviews so the site always has reviews to show
let googleReviewsCache: { data: { reviews: any[]; rating: number; totalReviews: number } | null; timestamp: number } = { data: STATIC_GOOGLE_REVIEWS, timestamp: 0 };

const quoteSubmissionLimiter = new SubmissionRateLimiter({ windowMs: 2 * 60_000, maxAttempts: 1 });
const quoteAddressLimiter = new SubmissionRateLimiter({ windowMs: 10 * 60_000, maxAttempts: 8 });
const callbackSubmissionLimiter = new SubmissionRateLimiter({ windowMs: 2 * 60_000, maxAttempts: 1 });
const callbackAddressLimiter = new SubmissionRateLimiter({ windowMs: 10 * 60_000, maxAttempts: 8 });
const guideSubmissionLimiter = new SubmissionRateLimiter({ windowMs: 10 * 60_000, maxAttempts: 1 });
const guideAddressLimiter = new SubmissionRateLimiter({ windowMs: 10 * 60_000, maxAttempts: 8 });

const quoteInputSchema = z.object({
  formType: z.enum(["hero_quick_quote"]).optional(),
  name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().min(1, "Phone is required").max(30),
  email: z.string().trim().email("Valid email is required").max(254),
  suburb: z.string().trim().min(2, "Suburb is required").max(120),
  service: z.string().trim().min(1, "Service is required").max(120),
  details: z.string().trim().max(5000).optional(),
  photoUrls: z.array(z.string()).optional(),
  website: z.string().max(200).optional(),
  formStartedAt: z.number().int().positive().optional(),
  // Lead source tracking
  leadSource: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  gclid: z.string().optional(),
  fbclid: z.string().optional(),
  referrer: z.string().optional(),
  landingPage: z.string().optional(),
  abVariant: z.string().optional(),
  jobBrief: comprehensiveQuoteSchema.optional(),
});

const blogPostInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  coverImage: z.string().optional(),
  published: z.number().default(1),
  authorName: z.string().default("Concrete Concepts Group"),
  readTimeMinutes: z.number().default(5),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

/**
 * Process follow-up emails for quotes that haven't received them yet.
 * Checks for Day 3 and Day 7 follow-ups based on quote creation date.
 * Should be called periodically (e.g., daily via admin or cron).
 */
async function processFollowUpEmails(retries = 2): Promise<{ processed: number; sent: number }> {
  let db;
  try {
    db = await getDb();
  } catch (err: any) {
    if (retries > 0 && (err?.cause?.code === 'ECONNRESET' || err?.message?.includes('ECONNRESET'))) {
      console.log(`[FollowUp] DB connection reset, retrying (${retries} left)...`);
      await new Promise(r => setTimeout(r, 2000));
      return processFollowUpEmails(retries - 1);
    }
    throw err;
  }
  if (!db) return { processed: 0, sent: 0 };

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 1 * 86400000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  // Get all quotes that are still "new" (not contacted/quoted/won/lost)
  const pendingQuotes = await db.select().from(quoteRequests)
    .where(eq(quoteRequests.status, "new"));

  let sent = 0;

  for (const quote of pendingQuotes) {
    const createdAt = new Date(quote.createdAt);
    const recipient = {
      name: quote.name,
      email: quote.email,
      service: quote.service,
      suburb: quote.suburb,
    };

    // Skip follow-up emails for placeholder/invalid email addresses
    if (!quote.email || quote.email.includes("placeholder") || quote.email.includes("not-provided@")) {
      continue;
    }

    // Check if Day 1 "What to Expect" email is due
    if (createdAt <= oneDayAgo) {
      const existingDay1 = await db.select().from(followUpEmails)
        .where(and(
          eq(followUpEmails.quoteRequestId, quote.id),
          eq(followUpEmails.emailType, "day1_confirmation")
        ))
        .limit(1);

      if (existingDay1.length === 0) {
        const ok = await sendDay1WhatToExpect(recipient);
        await db.insert(followUpEmails).values({
          quoteRequestId: quote.id,
          emailType: "day1_confirmation",
          status: ok ? "sent" : "failed",
        });
        if (ok) sent++;
      }
    }

    // Check if Day 3 follow-up is due
    if (createdAt <= threeDaysAgo) {
      const existing = await db.select().from(followUpEmails)
        .where(and(
          eq(followUpEmails.quoteRequestId, quote.id),
          eq(followUpEmails.emailType, "day3_followup")
        ))
        .limit(1);

      if (existing.length === 0) {
        const ok = await sendDay3FollowUp(recipient);
        await db.insert(followUpEmails).values({
          quoteRequestId: quote.id,
          emailType: "day3_followup",
          status: ok ? "sent" : "failed",
        });
        if (ok) sent++;

        // Also send Day 3 SMS if Twilio is configured
        if (isTwilioConfigured()) {
          try {
            await sendDay3SmsFollowUp({
              name: quote.name,
              phone: quote.phone,
              service: quote.service,
            });
          } catch (_e) { /* SMS is best-effort */ }
        }
      }
    }

    // Check if Day 7 follow-up is due
    if (createdAt <= sevenDaysAgo) {
      const existing = await db.select().from(followUpEmails)
        .where(and(
          eq(followUpEmails.quoteRequestId, quote.id),
          eq(followUpEmails.emailType, "day7_final")
        ))
        .limit(1);

      if (existing.length === 0) {
        const ok = await sendDay7FollowUp(recipient);
        await db.insert(followUpEmails).values({
          quoteRequestId: quote.id,
          emailType: "day7_final",
          status: ok ? "sent" : "failed",
        });
        if (ok) sent++;

        // Also send Day 7 SMS if Twilio is configured
        if (isTwilioConfigured()) {
          try {
            await sendDay7SmsFollowUp({
              name: quote.name,
              phone: quote.phone,
              service: quote.service,
            });
          } catch (_e) { /* SMS is best-effort */ }
        }
      }
    }
  }

  console.log(`[FollowUp] Processed ${pendingQuotes.length} quotes, sent ${sent} emails`);
  return { processed: pendingQuotes.length, sent };
}

// Auto-run follow-up email processing every 6 hours
setInterval(() => {
  processFollowUpEmails().catch(err => console.error("[FollowUp] Cron error:", err));
}, 6 * 60 * 60 * 1000);

// Run once on server start after a short delay
setTimeout(() => {
  processFollowUpEmails().catch(err => console.error("[FollowUp] Initial run error:", err));
}, 30000);

// Load push subscriptions from database on server start
setTimeout(async () => {
  try {
    const db = await getDb();
    if (db) {
      const subs = await db.select().from(pushSubscriptionsTable);
      await loadSubscriptionsFromDb(subs.map(s => ({
        endpoint: s.endpoint,
        p256dh: s.p256dh,
        auth: s.auth,
      })));
    }
  } catch (err) {
    console.error("[Push] Failed to load subscriptions from DB:", err);
  }
}, 5000);

/**
 * Process abandoned quote follow-ups.
 * Sends recovery emails to visitors who started but didn't complete the quote form.
 * Targets abandoned quotes that are 2+ hours old and haven't received a follow-up yet.
 */
async function processAbandonedQuoteFollowUps(retries = 2): Promise<{ processed: number; sent: number }> {
  const db = await getDb();
  if (!db) return { processed: 0, sent: 0 };

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  let pending;
  try {
    // Find abandoned quotes that are 2+ hours old, not yet followed up, and not converted
    pending = await db.select().from(abandonedQuotes)
    .where(
      and(
        eq(abandonedQuotes.followUpSent, 0),
        eq(abandonedQuotes.converted, 0),
        lte(abandonedQuotes.createdAt, twoHoursAgo)
      )
    )
    .limit(50);
  } catch (err: any) {
    if (retries > 0 && (err?.cause?.code === 'ECONNRESET' || err?.message?.includes('ECONNRESET'))) {
      console.log(`[AbandonedQuote] DB connection reset, retrying (${retries} left)...`);
      await new Promise(r => setTimeout(r, 2000));
      return processAbandonedQuoteFollowUps(retries - 1);
    }
    throw err;
  }

  let sent = 0;
  for (const aq of pending) {
    // Check if this email has already submitted a full quote (don't send recovery email)
    const fullQuotes = await db.select({ id: quoteRequests.id }).from(quoteRequests)
      .where(eq(quoteRequests.email, aq.email))
      .limit(1);
    if (fullQuotes.length > 0) {
      // Mark as converted
      await db.update(abandonedQuotes)
        .set({ converted: 1, convertedAt: new Date() })
        .where(eq(abandonedQuotes.id, aq.id));
      continue;
    }

    const success = await sendAbandonedQuoteEmail({
      email: aq.email,
      name: aq.name,
      service: aq.service,
      suburb: aq.suburb,
    });

    await db.update(abandonedQuotes)
      .set({
        followUpSent: 1,
        followUpSentAt: new Date(),
      })
      .where(eq(abandonedQuotes.id, aq.id));

    if (success) sent++;
  }

  console.log(`[AbandonedQuote] Processed ${pending.length} abandoned quotes, sent ${sent} recovery emails`);
  return { processed: pending.length, sent };
}

// Auto-run abandoned quote follow-ups every hour
setInterval(() => {
  processAbandonedQuoteFollowUps().catch(err => console.error("[AbandonedQuote] Cron error:", err));
}, 60 * 60 * 1000);

/**
 * Process scheduled blog posts.
 * Publishes blog posts whose scheduled time has passed.
 */
async function processScheduledBlogPosts(retries = 2): Promise<{ processed: number; published: number }> {
  const db = await getDb();
  if (!db) return { processed: 0, published: 0 };

  let pending;
  try {
    const now = new Date();
    pending = await db.select().from(scheduledBlogPosts)
      .where(
        and(
          eq(scheduledBlogPosts.published, 0),
          lte(scheduledBlogPosts.scheduledPublishAt, now)
        )
      );
  } catch (err: any) {
    if (retries > 0 && (err?.cause?.code === 'ECONNRESET' || err?.message?.includes('ECONNRESET'))) {
      console.log(`[BlogSchedule] DB connection reset, retrying (${retries} left)...`);
      await new Promise(r => setTimeout(r, 2000));
      return processScheduledBlogPosts(retries - 1);
    }
    throw err;
  }

  let published = 0;
  for (const scheduled of pending) {
    try {
      await updateBlogPost(scheduled.blogPostId, { published: 1 });
      await db.update(scheduledBlogPosts)
        .set({ published: 1, publishedAt: new Date() })
        .where(eq(scheduledBlogPosts.id, scheduled.id));
      published++;
    } catch (err) {
      console.error(`[BlogSchedule] Failed to publish post ${scheduled.blogPostId}:`, err);
    }
  }

  console.log(`[BlogSchedule] Processed ${pending.length} scheduled posts, published ${published}`);
  return { processed: pending.length, published };
}

// Auto-run blog scheduling every 15 minutes
setInterval(() => {
  processScheduledBlogPosts().catch(err => console.error("[BlogSchedule] Cron error:", err));
}, 15 * 60 * 1000);

// Auto-check and send weekly digest every hour
import { checkAndSendDigest } from "./weeklyDigest";
setInterval(() => {
  checkAndSendDigest().catch(err => console.error("[Digest] Cron error:", err));
}, 60 * 60 * 1000);
// Also check on startup after 30s delay
setTimeout(() => {
  checkAndSendDigest().catch(err => console.error("[Digest] Startup check error:", err));
}, 30000);

export const appRouter = router({
  system: systemRouter,

  visualiser: router({
    // V4: Claude QA — returns structured job brief
    qa: publicProcedure
      .input(z.object({
        imageUrl: z.string().url(),
        mask: z.string(), // base64 PNG mask (white = work area)
        finish: z.enum(["exposed-aggregate", "broom-finish", "plain", "charcoal-oxide", "cove-finish", "honed", "saw-cut", "border-colour"]),
        preserveGrassStrips: z.boolean().default(true),
        preserveStructures: z.boolean().default(true),
        customerNotes: z.string().optional(),
        stoneMix: z.string().optional(), // e.g. "warm-blend", "charcoal-granite", etc.
        borderConfig: z.object({
          enabled: z.boolean(),
          colour: z.string().optional(), // e.g. "charcoal", "dark-grey", "terracotta"
          width: z.string().optional(), // e.g. "200mm", "300mm"
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Build enhanced customer notes with stone mix and border info
          let enhancedNotes = input.customerNotes || "";
          if (input.stoneMix) {
            enhancedNotes += ` Stone mix colour: ${input.stoneMix}.`;
          }
          if (input.borderConfig?.enabled) {
            enhancedNotes += ` Add a ${input.borderConfig.width || '200mm'} contrasting ${input.borderConfig.colour || 'charcoal'} coloured border strip around the perimeter of the concrete.`;
          }
          const brief = await runQA(
            input.imageUrl,
            input.mask,
            input.finish,
            input.preserveGrassStrips,
            input.preserveStructures,
            enhancedNotes
          );
          return { success: true, brief };
        } catch (err: any) {
          console.error("[Visualiser V4] QA failed:", err.message);
          return { success: false, brief: null, error: err.message || "QA analysis failed" };
        }
      }),

    // V4: Generate — FLUX Fill inpainting with mask + stone mix + border
    generate: publicProcedure
      .input(z.object({
        imageUrl: z.string().url(),
        mask: z.string(), // base64 PNG mask
        finish: z.enum(["exposed-aggregate", "broom-finish", "plain", "charcoal-oxide", "cove-finish", "honed", "saw-cut", "border-colour"]),
        generationPrompt: z.string().optional(),
        customerNotes: z.string().optional(),
        stoneMix: z.string().optional(),
        borderConfig: z.object({
          enabled: z.boolean(),
          colour: z.string().optional(),
          width: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Build enhanced customer notes with stone mix and border info
          let enhancedNotes = input.customerNotes || "";
          if (input.stoneMix) {
            enhancedNotes += ` Stone mix colour: ${input.stoneMix}.`;
          }
          if (input.borderConfig?.enabled) {
            enhancedNotes += ` Add a ${input.borderConfig.width || '200mm'} contrasting ${input.borderConfig.colour || 'charcoal'} coloured border strip around the perimeter of the concrete.`;
          }
          const result = await generateVisualisation(
            input.imageUrl,
            input.mask,
            input.finish,
            input.generationPrompt,
            enhancedNotes
          );
          return { success: true, generatedUrl: result.url };
        } catch (err: any) {
          console.error("[Visualiser V4] Generation failed:", err.message);
          return { success: false, generatedUrl: "", error: err.message || "Generation failed" };
        }
      }),

    // V4: Timelapse — Generate construction stage keyframes
    timelapse: publicProcedure
      .input(z.object({
        imageUrl: z.string().url(),
        mask: z.string(), // base64 PNG mask (white = work area)
        finish: z.enum(["exposed-aggregate", "broom-finish", "plain", "charcoal-oxide", "cove-finish", "honed", "saw-cut", "border-colour"]),
        customerNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await generateTimelapse(
            input.imageUrl,
            input.mask,
            input.finish,
            input.customerNotes
          );
          return { success: true, stages: result.stages };
        } catch (err: any) {
          console.error("[Visualiser V4] Timelapse failed:", err.message);
          return { success: false, stages: [], error: err.message || "Timelapse generation failed" };
        }
      }),

    // V3: List all available finishes
    finishes: publicProcedure.query(() => {
      return Object.entries(FINISH_TYPES).map(([key, val]) => ({
        id: key,
        name: val.name,
        description: val.description,
      }));
    }),

    // Legacy analyse endpoint (kept for backward compat)
    analyse: publicProcedure
      .input(z.object({
        imageUrl: z.string().url(),
        finish: z.enum(["exposed-aggregate", "broom-finish", "plain", "charcoal-oxide", "cove-finish", "honed", "saw-cut", "border-colour"]),
      }))
      .mutation(async ({ input }) => {
        const analysis = await analysePropertyPhoto(input.imageUrl, input.finish);
        return { success: true, ...analysis };
      }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  quote: router({
    submit: publicProcedure
      .input(quoteInputSchema)
      .mutation(async ({ input, ctx }) => {
        if (input.jobBrief) {
          const compatibleFields = toLegacyQuoteFields(input.jobBrief);
          input.name = compatibleFields.name;
          input.phone = compatibleFields.phone;
          input.email = compatibleFields.email;
          input.suburb = compatibleFields.suburb;
          input.service = compatibleFields.service;
          input.details = compatibleFields.details;
          input.photoUrls = compatibleFields.photoUrls;
        }

        const phoneValidation = validateAustralianPhone(input.phone);
        if (!phoneValidation.valid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: phoneValidation.error });
        }

        if (input.formType === "hero_quick_quote") {
          if (phoneValidation.kind !== "mobile") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Enter an Australian mobile number beginning with 04 so we can confirm the quote request.",
            });
          }
          if (/placeholder|not-provided|via-quick-form/i.test(input.email)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Enter your email address so we can send and verify your quote details.",
            });
          }
          if (/^(general enquiry|quick quote|not specified)$/i.test(input.service)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Select the concrete service you need.",
            });
          }
          if (!input.details || input.details.trim().length < 10 || /follow up for full details/i.test(input.details)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Add a short project description so we can assess the job before calling.",
            });
          }
        }

        const serviceArea = classifyServiceArea(input.suburb);
        if (!serviceArea.canSubmit) {
          throw new TRPCError({ code: "BAD_REQUEST", message: serviceArea.message });
        }

        const submissionSignals = assessSubmissionSignals({
          honeypot: input.website,
          startedAt: input.formStartedAt,
        });
        if (!submissionSignals.allowed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "We couldn't submit that request. Please check the form and try again.",
          });
        }

        const forwardedAddress = ctx.req.headers["x-forwarded-for"];
        const address = Array.isArray(forwardedAddress)
          ? forwardedAddress[0]
          : forwardedAddress?.split(",")[0]?.trim() || ctx.req.ip || "unknown";
        const leadFingerprint = createLeadFingerprint({
          phone: phoneValidation.normalized,
          email: input.email,
          location: serviceArea.normalized,
        });
        const addressFingerprint = createLeadFingerprint({ address });

        if (!quoteSubmissionLimiter.attempt(leadFingerprint).allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "We've already received this enquiry. Please wait a moment before trying again.",
          });
        }
        if (!quoteAddressLimiter.attempt(addressFingerprint).allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests were received. Please wait a few minutes and try again.",
          });
        }

        input.phone = phoneValidation.normalized;
        input.suburb = serviceArea.normalized;
        const internalDetails = serviceArea.status === "service_area_review"
          ? `[SERVICE AREA REVIEW]\n${input.details || "No additional details provided"}`
          : input.details ?? "";

        // Generate status token for customer tracking portal
        const statusToken = crypto.randomBytes(32).toString("hex");

        // Save to database
        try {
          const db = await getDb();
          if (db) {
            await db.insert(quoteRequests).values({
              name: input.name,
              phone: input.phone,
              email: input.email,
              suburb: input.suburb,
              service: input.service,
              details: internalDetails,
              photoUrls: input.photoUrls ? JSON.stringify(input.photoUrls) : null,
              leadSource: input.leadSource ?? null,
              utmSource: input.utmSource ?? null,
              utmMedium: input.utmMedium ?? null,
              utmCampaign: input.utmCampaign ?? null,
              utmTerm: input.utmTerm ?? null,
              utmContent: input.utmContent ?? null,
              gclid: input.gclid ?? null,
              fbclid: input.fbclid ?? null,
              referrer: input.referrer ?? null,
              landingPage: input.landingPage ?? null,
              statusToken,
            });
          }
        } catch (err) {
          console.error("[Quote] Failed to save to database:", err);
        }

        // Send notification to owner via Manus notification service
        const notificationContent = [
          `**New Quote Request**`,
          ``,
          `**Name:** ${input.name}`,
          `**Phone:** ${input.phone}`,
          `**Email:** ${input.email}`,
          `**Suburb:** ${input.suburb}`,
          `**Service Area:** ${serviceArea.status === "service_area_review" ? "Review required" : "Within advertised area"}`,
          `**Service:** ${input.service}`,
          `**Details:** ${input.details || "No additional details provided"}`,
          `**Lead Source:** ${input.leadSource || "Unknown"}`,
          input.utmCampaign ? `**Campaign:** ${input.utmCampaign}` : "",
          input.gclid ? `**Google Click ID:** ${input.gclid}` : "",
          ``,
          `---`,
          `Reply to: ${input.email}`,
          `Call: ${input.phone}`,
        ].join("\n");

        try {
          await notifyOwner({
            title: `📋 New Quote: ${input.name} — ${input.service} (${input.suburb})`,
            content: notificationContent,
          });
        } catch (err) {
          console.error("[Quote] Failed to send notification:", err);
        }

        // Send email notification via Resend
        try {
          await sendQuoteNotificationEmail({
            name: input.name,
            phone: input.phone,
            email: input.email,
            suburb: input.suburb,
            service: input.service,
            details: input.details,
            photoUrls: input.photoUrls,
            leadSource: input.leadSource,
            utmCampaign: input.utmCampaign,
            serviceAreaStatus: serviceArea.status === "service_area_review" ? "service_area_review" : "in_area",
            jobBrief: input.jobBrief,
          });
        } catch (err) {
          console.error("[Quote] Failed to send email notification:", err);
        }

        // Send push notification to owner's devices
        try {
          await sendQuotePushNotification({
            name: input.name,
            service: input.service,
            suburb: input.suburb,
            phone: input.phone,
          });
        } catch (err) {
          console.error("[Quote] Failed to send push notification:", err);
        }

        // Send auto-reply confirmation email to customer
        try {
          await sendCustomerConfirmationEmail({
            name: input.name,
            phone: input.phone,
            email: input.email,
            suburb: input.suburb,
            service: input.service,
            details: input.details,
            photoUrls: input.photoUrls,
            statusToken,
            jobBrief: input.jobBrief,
          });
        } catch (err) {
          console.error("[Quote] Failed to send customer confirmation email:", err);
        }

        // Generate branded PDF estimate and save to S3 for admin review
        // (NOT auto-emailed to customer — admin can review/edit and send manually)
        try {
          // Get the quote ID from the database for the reference number
          let quoteId: number | undefined;
          try {
            const db = await getDb();
            if (db) {
              const allQuotes = await db.select({ id: quoteRequests.id }).from(quoteRequests);
              if (allQuotes.length > 0) {
                quoteId = Math.max(...allQuotes.map(q => q.id));
              }
            }
          } catch (_e) { /* ignore */ }

          const quoteRef = quoteId
            ? `CCG-${String(quoteId).padStart(4, "0")}`
            : `CCG-${Date.now().toString(36).toUpperCase()}`;

          const pdfBuffer = generateQuotePdf({
            name: input.name,
            phone: input.phone,
            email: input.email,
            suburb: input.suburb,
            service: input.service,
            details: input.details,
            quoteId,
          });

          // Upload PDF to S3 for admin to review/download
          const fileKey = `quotes/${quoteRef}-${Date.now()}.pdf`;
          const { url: pdfUrl } = await storagePut(fileKey, pdfBuffer, "application/pdf");

          // Save PDF URL and reference to the quote record
          if (quoteId) {
            const db = await getDb();
            if (db) {
              await db.update(quoteRequests)
                .set({ pdfUrl, pdfRef: quoteRef })
                .where(eq(quoteRequests.id, quoteId));
            }
          }

          console.log(`[Quote] PDF estimate generated and saved to S3: ${quoteRef}`);
        } catch (err) {
          console.error("[Quote] Failed to generate/save PDF estimate:", err);
        }

        // Send SMS notification to business owner (if Twilio configured)
        if (isTwilioConfigured()) {
          try {
            await sendNewQuoteSms({
              name: input.name,
              phone: input.phone,
              service: input.service,
              suburb: input.suburb,
            });
          } catch (err) {
            console.error("[Quote] Failed to send SMS notification:", err);
          }
        }

        // Forward to CCG Lead Engine for scoring & SMS follow-up (fire-and-forget)
        fetch("https://ccgvoiceleads-nnuduqrr.manus.space/api/webhooks/form-submission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: input.name,
            phone: input.phone,
            email: input.email,
            suburb: input.suburb,
            serviceRequired: input.service,
            projectDetails: input.details || "",
            serviceAreaStatus: serviceArea.status,
            leadSource: input.leadSource || "website_form",
            utmSource: input.utmSource || null,
            utmMedium: input.utmMedium || null,
            utmCampaign: input.utmCampaign || null,
            utmTerm: input.utmTerm || null,
            utmContent: input.utmContent || null,
            gclid: input.gclid || null,
            fbclid: input.fbclid || null,
            referrer: input.referrer || null,
            landingPage: input.landingPage || null,
          }),
        }).catch((err) => {
          console.error("[Quote] CCG Lead Engine webhook failed:", err);
        });

        return {
          success: true,
          message: "Quote request submitted successfully!",
          serviceAreaStatus: serviceArea.status,
        };
      }),

    // Admin: list all quote requests
    list: adminProcedure.query(async () => {
      const quotes = await getAllQuoteRequests();
      return quotes;
    }),

    // Admin: get a single quote request by ID
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const quote = await getQuoteRequestById(input.id);
        return quote ?? null;
      }),

    // Admin: update quote status, notes, quoted amount
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "quoted", "won", "lost"]).optional(),
        notes: z.string().optional(),
        quotedAmount: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;

        // Get current status before update for timeline logging
        const currentQuote = await getQuoteRequestById(id);
        const previousStatus = currentQuote?.status || "new";

        await updateQuoteStatus(id, data);

        // Track response time: set contactedAt on first status change from "new"
        if (data.status && data.status !== "new" && previousStatus === "new") {
          try {
            const db = await getDb();
            if (db) {
              await db.update(quoteRequests)
                .set({ contactedAt: new Date() })
                .where(eq(quoteRequests.id, id));
            }
          } catch (_e) { /* best effort */ }
        }

        // Track completedAt when status changes to "won"
        if (data.status === "won") {
          try {
            const db = await getDb();
            if (db) {
              await db.update(quoteRequests)
                .set({ completedAt: new Date() })
                .where(eq(quoteRequests.id, id));
            }
          } catch (_e) { /* best effort */ }
        }

        // Log timeline event for status changes
        if (data.status && data.status !== previousStatus) {
          try {
            const db = await getDb();
            if (db) {
              await db.insert(jobTimelineEvents).values({
                quoteRequestId: id,
                eventType: "status_change",
                fromStatus: previousStatus,
                toStatus: data.status,
                description: `Status changed from ${previousStatus} to ${data.status}`,
                source: "website_admin",
              });
            }
          } catch (_e) { /* best effort */ }
        }

        // Log timeline event for notes
        if (data.notes && data.notes !== currentQuote?.notes) {
          try {
            const db = await getDb();
            if (db) {
              await db.insert(jobTimelineEvents).values({
                quoteRequestId: id,
                eventType: "note_added",
                description: data.notes,
                source: "website_admin",
              });
            }
          } catch (_e) { /* best effort */ }
        }

        // If status changed to "won", auto-send review request email
        if (data.status === "won") {
          try {
            const quote = await getQuoteRequestById(id);
            if (quote) {
              // Check if review request was already sent
              const db = await getDb();
              if (db) {
                const existing = await db.select().from(followUpEmails)
                  .where(and(
                    eq(followUpEmails.quoteRequestId, id),
                    eq(followUpEmails.emailType, "review_request")
                  ))
                  .limit(1);
                
                if (existing.length === 0) {
                  const sent = await sendReviewRequest({
                    name: quote.name,
                    email: quote.email,
                    service: quote.service,
                    suburb: quote.suburb,
                  });
                  await db.insert(followUpEmails).values({
                    quoteRequestId: id,
                    emailType: "review_request",
                    status: sent ? "sent" : "failed",
                  });

                  // Also send review request SMS if Twilio configured
                  if (isTwilioConfigured()) {
                    try {
                      await sendReviewRequestSms({
                        name: quote.name,
                        phone: quote.phone,
                        service: quote.service,
                      });
                    } catch (_e) { /* SMS is best-effort */ }
                  }
                }
              }
            }
          } catch (err) {
            console.error("[Quote] Failed to send review request:", err);
          }
        }

        return { success: true };
      }),

    // Admin: manually trigger follow-up emails processing
    processFollowUps: adminProcedure.mutation(async () => {
      return processFollowUpEmails();
    }),

    // Admin: send the PDF estimate to customer via email
    sendPdf: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const quote = await getQuoteRequestById(input.id);
        if (!quote) throw new Error("Quote not found");
        if (!quote.pdfUrl || !quote.pdfRef) throw new Error("No PDF generated for this quote. Regenerate first.");

        // Download the PDF from S3
        const pdfResponse = await fetch(quote.pdfUrl);
        if (!pdfResponse.ok) throw new Error("Failed to download PDF from storage");
        const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

        // Send to customer
        const sent = await sendQuotePdfEmail({
          name: quote.name,
          email: quote.email,
          service: quote.service,
          suburb: quote.suburb,
          pdfBuffer,
          quoteRef: quote.pdfRef,
        });

        if (!sent) throw new Error("Failed to send email");

        // Mark as sent in database
        const db = await getDb();
        if (db) {
          await db.update(quoteRequests)
            .set({ pdfSentAt: new Date() })
            .where(eq(quoteRequests.id, input.id));
        }

        return { success: true, message: `PDF estimate sent to ${quote.email}` };
      }),

    // Admin: regenerate the PDF estimate (e.g., after editing quote details)
    regeneratePdf: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const quote = await getQuoteRequestById(input.id);
        if (!quote) throw new Error("Quote not found");

        const quoteRef = `CCG-${String(quote.id).padStart(4, "0")}`;

        const pdfBuffer = generateQuotePdf({
          name: quote.name,
          phone: quote.phone,
          email: quote.email,
          suburb: quote.suburb,
          service: quote.service,
          details: quote.details ?? undefined,
          quoteId: quote.id,
        });

        // Upload new PDF to S3
        const fileKey = `quotes/${quoteRef}-${Date.now()}.pdf`;
        const { url: pdfUrl } = await storagePut(fileKey, pdfBuffer, "application/pdf");

        // Update database
        const db = await getDb();
        if (db) {
          await db.update(quoteRequests)
            .set({ pdfUrl, pdfRef: quoteRef, pdfSentAt: null })
            .where(eq(quoteRequests.id, input.id));
        }        return { success: true, pdfUrl, pdfRef: quoteRef };
      }),

    // ===== QUOTE BUILDER ENDPOINTS =====

    // Admin: get line items for a quote
    getLineItems: adminProcedure
      .input(z.object({ quoteRequestId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(quoteLineItems)
          .where(eq(quoteLineItems.quoteRequestId, input.quoteRequestId))
          .orderBy(asc(quoteLineItems.sortOrder));
      }),

    // Admin: save all line items for a quote (replace existing)
    saveLineItems: adminProcedure
      .input(z.object({
        quoteRequestId: z.number(),
        items: z.array(z.object({
          description: z.string().min(1),
          quantity: z.number().min(0),
          unit: z.string().min(1),
          rate: z.number().min(0),
          amount: z.number().min(0),
        })),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Delete existing line items
        await db.delete(quoteLineItems)
          .where(eq(quoteLineItems.quoteRequestId, input.quoteRequestId));

        // Insert new line items
        if (input.items.length > 0) {
          await db.insert(quoteLineItems).values(
            input.items.map((item, i) => ({
              quoteRequestId: input.quoteRequestId,
              sortOrder: i,
              description: item.description,
              quantity: String(item.quantity),
              unit: item.unit,
              rate: String(item.rate),
              amount: String(item.amount),
            }))
          );
        }

        // Update the quoted amount on the quote request
        const total = input.items.reduce((sum, item) => sum + item.amount, 0);
        await db.update(quoteRequests)
          .set({ quotedAmount: total.toFixed(2) })
          .where(eq(quoteRequests.id, input.quoteRequestId));

        return { success: true, total };
      }),

    // Admin: save quote builder settings (terms, notes, validity, GST)
    saveQuoteSettings: adminProcedure
      .input(z.object({
        id: z.number(),
        customTerms: z.string().optional(),
        customNotes: z.string().optional(),
        validityDays: z.number().min(1).max(365).optional(),
        gstIncluded: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        await db.update(quoteRequests)
          .set({
            customTerms: data.customTerms ?? null,
            customNotes: data.customNotes ?? null,
            validityDays: data.validityDays ?? 30,
            gstIncluded: data.gstIncluded === false ? 0 : 1,
          })
          .where(eq(quoteRequests.id, id));

        return { success: true };
      }),

    // Admin: generate custom PDF from line items and send/save
    generateCustomPdf: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const quote = await getQuoteRequestById(input.id);
        if (!quote) throw new Error("Quote not found");

        // Get line items
        const items = await db.select().from(quoteLineItems)
          .where(eq(quoteLineItems.quoteRequestId, input.id))
          .orderBy(asc(quoteLineItems.sortOrder));

        if (items.length === 0) throw new Error("No line items found. Add items before generating PDF.");

        const quoteRef = `CCG-${String(quote.id).padStart(4, "0")}`;

        const pdfBuffer = generateCustomQuotePdf({
          name: quote.name,
          phone: quote.phone,
          email: quote.email,
          suburb: quote.suburb,
          service: quote.service,
          details: quote.details ?? undefined,
          quoteId: quote.id,
          lineItems: items.map(item => ({
            description: item.description,
            quantity: Number(item.quantity),
            unit: item.unit,
            rate: Number(item.rate),
            amount: Number(item.amount),
          })),
          customTerms: quote.customTerms ?? undefined,
          customNotes: quote.customNotes ?? undefined,
          validityDays: quote.validityDays ?? 30,
          gstIncluded: quote.gstIncluded === 1,
        });

        // Upload PDF to S3
        const fileKey = `quotes/${quoteRef}-custom-${Date.now()}.pdf`;
        const { url: pdfUrl } = await storagePut(fileKey, pdfBuffer, "application/pdf");

        // Update database
        await db.update(quoteRequests)
          .set({ pdfUrl, pdfRef: quoteRef, pdfSentAt: null, status: "quoted" })
          .where(eq(quoteRequests.id, input.id));

        return { success: true, pdfUrl, pdfRef: quoteRef };
      }),

    // Public: get monthly quote count for social proof counter
    monthlyCount: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { count: 47, month: new Date().toLocaleString('en-AU', { month: 'long' }) };
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const results = await db
        .select({ id: quoteRequests.id })
        .from(quoteRequests)
        .where(gte(quoteRequests.createdAt, startOfMonth));
      // Show at least 12 for social proof even if low volume
      const count = Math.max(results.length, 12);
      return { count, month: now.toLocaleString('en-AU', { month: 'long' }) };
    }),

    // Public: get recent quote activity for social proof (anonymised - suburb + service only)
    recentActivity: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const results = await db
        .select({
          suburb: quoteRequests.suburb,
          service: quoteRequests.service,
          createdAt: quoteRequests.createdAt,
        })
        .from(quoteRequests)
        .where(
          and(
            ne(quoteRequests.suburb, "TBD"),
            ne(quoteRequests.suburb, ""),
          )
        )
        .orderBy(desc(quoteRequests.createdAt))
        .limit(10);
      return results.map((r: { suburb: string; service: string; createdAt: Date | null }) => ({
        suburb: r.suburb,
        service: r.service,
        createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
      }));
    }),
  }),

  googleReviews: router({
    // Public: fetch Google reviews for Concrete Concepts Group
    // Uses hardcoded Place ID to avoid text search returning wrong business
    get: publicProcedure.query(async () => {
      // Cache reviews for 1 hour to reduce API calls
      const CACHE_TTL = 60 * 60 * 1000; // 1 hour
      const now = Date.now();
      if (
        googleReviewsCache.data &&
        now - googleReviewsCache.timestamp < CACHE_TTL
      ) {
        return googleReviewsCache.data;
      }

      try {
        // Hardcoded Place ID for Concrete Concepts Group Pty Ltd
        // Previously used text search which intermittently returned wrong business
        const PLACE_ID = "ChIJM0kDPMxZkWsR4foz-XZxlQ0";

        // Fetch place details with reviews directly using known Place ID
        const detailsResult = await makeRequest<PlaceDetailsResult>(
          "/maps/api/place/details/json",
          {
            place_id: PLACE_ID,
            fields: "name,rating,user_ratings_total,reviews",
          }
        );

        const place = detailsResult?.result;
        if (!place) {
          console.error("[GoogleReviews] No place data returned for Place ID");
          if (googleReviewsCache.data) return googleReviewsCache.data;
          return { reviews: [], rating: 0, totalReviews: 0 };
        }
        const reviews = (place.reviews || [])
          .filter((r) => {
            // Exclude reviews from "marcus" per business owner request
            const name = (r.author_name || "").toLowerCase();
            return !name.includes("marcus");
          })
          .map((r) => ({
            authorName: r.author_name,
            rating: r.rating,
            text: r.text,
            time: r.time,
            source: "Google" as const,
          }));

        const result = {
          reviews,
          rating: place.rating || 0,
          totalReviews: place.user_ratings_total || 0,
        };

        // Update cache
        googleReviewsCache = { data: result, timestamp: now };

        return result;
      } catch (err) {
        console.error("[GoogleReviews] Failed to fetch:", err);
        // Return cached data if available, even if stale
        if (googleReviewsCache.data) {
          console.log("[GoogleReviews] Returning stale cache");
          return googleReviewsCache.data;
        }
        return { reviews: [], rating: 0, totalReviews: 0 };
      }
    }),
  }),

  analytics: router({
    // Admin: get quote analytics (stats by service, suburb, time)
    quoteStats: adminProcedure.query(async () => {
      const quotes = await getAllQuoteRequests();
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const monthAgo = new Date(now.getTime() - 30 * 86400000);

      // Quotes by time period
      const today = quotes.filter(q => new Date(q.createdAt) >= todayStart).length;
      const thisWeek = quotes.filter(q => new Date(q.createdAt) >= weekAgo).length;
      const thisMonth = quotes.filter(q => new Date(q.createdAt) >= monthAgo).length;
      const total = quotes.length;

      // Quotes by service
      const byService: Record<string, number> = {};
      quotes.forEach(q => { byService[q.service] = (byService[q.service] || 0) + 1; });
      const serviceStats = Object.entries(byService)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // Quotes by suburb
      const bySuburb: Record<string, number> = {};
      quotes.forEach(q => { bySuburb[q.suburb] = (bySuburb[q.suburb] || 0) + 1; });
      const suburbStats = Object.entries(bySuburb)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Quotes over last 30 days (daily)
      const dailyStats: { date: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const dateStr = d.toISOString().split('T')[0];
        const count = quotes.filter(q => {
          const qd = new Date(q.createdAt);
          return qd.toISOString().split('T')[0] === dateStr;
        }).length;
        dailyStats.push({ date: dateStr, count });
      }

      // Quotes over last 12 months (monthly)
      const monthlyStats: { month: string; count: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const count = quotes.filter(q => {
          const qd = new Date(q.createdAt);
          return qd >= monthStart && qd <= monthEnd;
        }).length;
        monthlyStats.push({ month: monthStr, count });
      }

      // Average response needed (quotes per day this month)
      const avgPerDay = thisMonth > 0 ? (thisMonth / 30).toFixed(1) : '0';

      return {
        summary: { total, today, thisWeek, thisMonth, avgPerDay },
        serviceStats,
        suburbStats,
        dailyStats,
        monthlyStats,
      };
    }),

    // Admin: Google Ads ROI report — attribution by campaign/source/gclid
    adsRoi: adminProcedure
      .input(z.object({
        dateFrom: z.string().optional(), // ISO date string
        dateTo: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { campaigns: [], sources: [], funnel: { total: 0, contacted: 0, quoted: 0, won: 0, lost: 0, conversionRate: 0, winRate: 0 }, gclids: [], callbacks: { total: 0, called: 0, completed: 0, conversionRate: 0 }, topLandingPages: [], monthlyTrend: [] };

        const now = new Date();
        const dateFrom = input?.dateFrom ? new Date(input.dateFrom) : new Date(now.getTime() - 90 * 86400000);
        const dateTo = input?.dateTo ? new Date(input.dateTo + "T23:59:59") : now;

        // Fetch all quotes and callbacks in date range
        const allQuotes = await db.select().from(quoteRequests)
          .where(and(
            gte(quoteRequests.createdAt, dateFrom),
            lte(quoteRequests.createdAt, dateTo)
          ))
          .orderBy(desc(quoteRequests.createdAt));

        const allCallbacks = await db.select().from(callbackRequests)
          .where(and(
            gte(callbackRequests.createdAt, dateFrom),
            lte(callbackRequests.createdAt, dateTo)
          ))
          .orderBy(desc(callbackRequests.createdAt));

        // ── Campaign Performance ──
        const campaignMap: Record<string, { leads: number; contacted: number; quoted: number; won: number; lost: number; revenue: number; callbacks: number }> = {};
        for (const q of allQuotes) {
          const campaign = q.utmCampaign || "(no campaign)";
          if (!campaignMap[campaign]) campaignMap[campaign] = { leads: 0, contacted: 0, quoted: 0, won: 0, lost: 0, revenue: 0, callbacks: 0 };
          campaignMap[campaign].leads++;
          if (q.status === "contacted" || q.status === "quoted" || q.status === "won") campaignMap[campaign].contacted++;
          if (q.status === "quoted" || q.status === "won") campaignMap[campaign].quoted++;
          if (q.status === "won") { campaignMap[campaign].won++; campaignMap[campaign].revenue += parseFloat(q.quotedAmount || "0"); }
          if (q.status === "lost") campaignMap[campaign].lost++;
        }
        for (const cb of allCallbacks) {
          const campaign = cb.utmCampaign || "(no campaign)";
          if (!campaignMap[campaign]) campaignMap[campaign] = { leads: 0, contacted: 0, quoted: 0, won: 0, lost: 0, revenue: 0, callbacks: 0 };
          campaignMap[campaign].callbacks++;
          campaignMap[campaign].leads++;
          if (cb.status === "called" || cb.status === "completed") campaignMap[campaign].contacted++;
          if (cb.status === "completed") campaignMap[campaign].won++;
        }
        const campaigns = Object.entries(campaignMap)
          .map(([name, data]) => ({
            name,
            ...data,
            winRate: data.leads > 0 ? Math.round((data.won / data.leads) * 100) : 0,
          }))
          .sort((a, b) => b.leads - a.leads);

        // ── Source / Medium Breakdown ──
        const sourceMap: Record<string, { leads: number; won: number; revenue: number; callbacks: number }> = {};
        for (const q of allQuotes) {
          const src = q.utmSource ? `${q.utmSource} / ${q.utmMedium || "(none)"}` : (q.leadSource || "Direct");
          if (!sourceMap[src]) sourceMap[src] = { leads: 0, won: 0, revenue: 0, callbacks: 0 };
          sourceMap[src].leads++;
          if (q.status === "won") { sourceMap[src].won++; sourceMap[src].revenue += parseFloat(q.quotedAmount || "0"); }
        }
        for (const cb of allCallbacks) {
          const src = cb.utmSource ? `${cb.utmSource} / ${cb.utmMedium || "(none)"}` : (cb.leadSource || "Direct");
          if (!sourceMap[src]) sourceMap[src] = { leads: 0, won: 0, revenue: 0, callbacks: 0 };
          sourceMap[src].callbacks++;
          sourceMap[src].leads++;
          if (cb.status === "completed") { sourceMap[src].won++; }
        }
        const sources = Object.entries(sourceMap)
          .map(([name, data]) => ({
            name,
            ...data,
            winRate: data.leads > 0 ? Math.round((data.won / data.leads) * 100) : 0,
          }))
          .sort((a, b) => b.leads - a.leads);

        // ── Overall Funnel ──
        const totalQuotes = allQuotes.length;
        const contacted = allQuotes.filter(q => ["contacted", "quoted", "won"].includes(q.status)).length;
        const quoted = allQuotes.filter(q => ["quoted", "won"].includes(q.status)).length;
        const won = allQuotes.filter(q => q.status === "won").length;
        const lost = allQuotes.filter(q => q.status === "lost").length;
        const totalRevenue = allQuotes.filter(q => q.status === "won").reduce((sum, q) => sum + parseFloat(q.quotedAmount || "0"), 0);
        const funnel = {
          total: totalQuotes + allCallbacks.length,
          quotes: totalQuotes,
          callbacks: allCallbacks.length,
          contacted,
          quoted,
          won,
          lost,
          revenue: totalRevenue,
          conversionRate: totalQuotes > 0 ? Math.round((won / totalQuotes) * 100) : 0,
          winRate: (quoted + lost) > 0 ? Math.round((won / (quoted + lost)) * 100) : 0,
        };

        // ── GCLID Attribution (Google Ads click-level) ──
        const gclidQuotes = allQuotes.filter(q => q.gclid);
        const gclidCallbacks = allCallbacks.filter(cb => cb.gclid);
        const gclidMap: Record<string, { type: string; name: string; phone: string; email: string; service: string; suburb: string; status: string; campaign: string; createdAt: Date; quotedAmount: string; gclid: string }[]> = {};
        for (const q of gclidQuotes) {
          const gclid = q.gclid!;
          if (!gclidMap[gclid]) gclidMap[gclid] = [];
          gclidMap[gclid].push({ type: "quote", name: q.name, phone: q.phone, email: q.email, service: q.service, suburb: q.suburb, status: q.status, campaign: q.utmCampaign || "", createdAt: q.createdAt, quotedAmount: q.quotedAmount || "0", gclid });
        }
        for (const cb of gclidCallbacks) {
          const gclid = cb.gclid!;
          if (!gclidMap[gclid]) gclidMap[gclid] = [];
          gclidMap[gclid].push({ type: "callback", name: cb.name, phone: cb.phone, email: "", service: "Callback", suburb: "", status: cb.status, campaign: cb.utmCampaign || "", createdAt: cb.createdAt, quotedAmount: "0", gclid });
        }
        const gclids = Object.entries(gclidMap)
          .map(([gclid, entries]) => ({
            gclid,
            entries,
            totalLeads: entries.length,
            hasWon: entries.some(e => e.status === "won" || e.status === "completed"),
          }))
          .sort((a, b) => new Date(b.entries[0].createdAt).getTime() - new Date(a.entries[0].createdAt).getTime());

        // ── FBCLID Attribution (Meta Ads click-level) ──
        const fbclidCount = allQuotes.filter(q => q.fbclid).length + allCallbacks.filter(cb => cb.fbclid).length;

        // ── Callback Stats ──
        const cbTotal = allCallbacks.length;
        const cbCalled = allCallbacks.filter(cb => ["called", "completed"].includes(cb.status)).length;
        const cbCompleted = allCallbacks.filter(cb => cb.status === "completed").length;
        const callbackStats = {
          total: cbTotal,
          called: cbCalled,
          completed: cbCompleted,
          conversionRate: cbTotal > 0 ? Math.round((cbCompleted / cbTotal) * 100) : 0,
        };

        // ── Top Landing Pages ──
        const lpMap: Record<string, { leads: number; won: number }> = {};
        for (const q of allQuotes) {
          const lp = q.landingPage || "(unknown)";
          if (!lpMap[lp]) lpMap[lp] = { leads: 0, won: 0 };
          lpMap[lp].leads++;
          if (q.status === "won") lpMap[lp].won++;
        }
        for (const cb of allCallbacks) {
          const lp = cb.landingPage || "(unknown)";
          if (!lpMap[lp]) lpMap[lp] = { leads: 0, won: 0 };
          lpMap[lp].leads++;
          if (cb.status === "completed") lpMap[lp].won++;
        }
        const topLandingPages = Object.entries(lpMap)
          .map(([page, data]) => ({ page, ...data, winRate: data.leads > 0 ? Math.round((data.won / data.leads) * 100) : 0 }))
          .sort((a, b) => b.leads - a.leads)
          .slice(0, 15);

        // ── Monthly Trend by Source ──
        const monthlyTrend: { month: string; google: number; facebook: number; organic: number; direct: number; other: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthStr = d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
          const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
          const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
          const monthQuotes = allQuotes.filter(q => { const qd = new Date(q.createdAt); return qd >= monthStart && qd <= monthEnd; });
          const monthCallbacks = allCallbacks.filter(cb => { const cd = new Date(cb.createdAt); return cd >= monthStart && cd <= monthEnd; });
          const all = [...monthQuotes.map(q => q.utmSource || q.leadSource || ""), ...monthCallbacks.map(cb => cb.utmSource || cb.leadSource || "")];
          monthlyTrend.push({
            month: monthStr,
            google: all.filter(s => s.toLowerCase().includes("google")).length,
            facebook: all.filter(s => s.toLowerCase().includes("facebook") || s.toLowerCase().includes("instagram") || s.toLowerCase().includes("meta")).length,
            organic: all.filter(s => s.toLowerCase().includes("organic")).length,
            direct: all.filter(s => s.toLowerCase() === "direct" || s === "").length,
            other: all.filter(s => !s.toLowerCase().includes("google") && !s.toLowerCase().includes("facebook") && !s.toLowerCase().includes("instagram") && !s.toLowerCase().includes("meta") && !s.toLowerCase().includes("organic") && s.toLowerCase() !== "direct" && s !== "").length,
          });
        }

        return {
          campaigns,
          sources,
          funnel,
          gclids,
          fbclidCount,
          callbackStats,
          topLandingPages,
          monthlyTrend,
          dateRange: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
        };
      }),

    // Admin: Offline conversion export — CSV data for Google Ads Smart Bidding upload
    offlineConversions: adminProcedure
      .input(z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        statusFilter: z.enum(["won", "quoted", "contacted", "all"]).default("won"),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { conversions: [], summary: { total: 0, withGclid: 0, withFbclid: 0, totalValue: 0 } };

        const now = new Date();
        const dateFrom = input?.dateFrom ? new Date(input.dateFrom) : new Date(now.getTime() - 90 * 86400000);
        const dateTo = input?.dateTo ? new Date(input.dateTo + "T23:59:59") : now;
        const statusFilter = input?.statusFilter || "won";

        // Build where conditions
        const conditions = [
          gte(quoteRequests.createdAt, dateFrom),
          lte(quoteRequests.createdAt, dateTo),
        ];
        if (statusFilter !== "all") {
          conditions.push(eq(quoteRequests.status, statusFilter as any));
        }

        const quotes = await db.select().from(quoteRequests)
          .where(and(...conditions))
          .orderBy(desc(quoteRequests.createdAt));

        // Also get won/completed callbacks
        const cbConditions = [
          gte(callbackRequests.createdAt, dateFrom),
          lte(callbackRequests.createdAt, dateTo),
        ];
        if (statusFilter === "won" || statusFilter === "all") {
          // For callbacks, "completed" is equivalent to "won"
        }
        const callbacks = await db.select().from(callbackRequests)
          .where(and(...cbConditions))
          .orderBy(desc(callbackRequests.createdAt));

        const filteredCallbacks = statusFilter === "all"
          ? callbacks
          : statusFilter === "won"
          ? callbacks.filter(cb => cb.status === "completed")
          : statusFilter === "contacted"
          ? callbacks.filter(cb => ["called", "completed"].includes(cb.status))
          : [];

        // Build conversion rows
        type ConversionRow = {
          id: number;
          type: string;
          name: string;
          email: string;
          phone: string;
          service: string;
          status: string;
          gclid: string | null;
          gbraid: string | null;
          wbraid: string | null;
          fbclid: string | null;
          conversionTime: string; // ISO format
          conversionValue: number;
          conversionCurrency: string;
          campaign: string;
          source: string;
          medium: string;
        };

        const conversions: ConversionRow[] = [];

        for (const q of quotes) {
          // Parse gclid — might contain gbraid or wbraid
          let gclid = q.gclid;
          let gbraid: string | null = null;
          let wbraid: string | null = null;
          if (gclid && gclid.startsWith("gbraid_")) { gbraid = gclid.replace("gbraid_", ""); gclid = null; }
          if (gclid && gclid.startsWith("wbraid_")) { wbraid = gclid.replace("wbraid_", ""); gclid = null; }

          conversions.push({
            id: q.id,
            type: "Quote",
            name: q.name,
            email: q.email,
            phone: q.phone,
            service: q.service,
            status: q.status,
            gclid: gclid,
            gbraid,
            wbraid,
            fbclid: q.fbclid,
            conversionTime: q.updatedAt.toISOString().replace("T", " ").replace(/\.\d+Z$/, "+10:00"),
            conversionValue: parseFloat(q.quotedAmount || "0"),
            conversionCurrency: "AUD",
            campaign: q.utmCampaign || "",
            source: q.utmSource || "",
            medium: q.utmMedium || "",
          });
        }

        for (const cb of filteredCallbacks) {
          let gclid = cb.gclid;
          let gbraid: string | null = null;
          let wbraid: string | null = null;
          if (gclid && gclid.startsWith("gbraid_")) { gbraid = gclid.replace("gbraid_", ""); gclid = null; }
          if (gclid && gclid.startsWith("wbraid_")) { wbraid = gclid.replace("wbraid_", ""); gclid = null; }

          conversions.push({
            id: cb.id,
            type: "Callback",
            name: cb.name,
            email: "",
            phone: cb.phone,
            service: "Callback Request",
            status: cb.status,
            gclid: gclid,
            gbraid,
            wbraid,
            fbclid: cb.fbclid,
            conversionTime: cb.updatedAt.toISOString().replace("T", " ").replace(/\.\d+Z$/, "+10:00"),
            conversionValue: 0,
            conversionCurrency: "AUD",
            campaign: cb.utmCampaign || "",
            source: cb.utmSource || "",
            medium: cb.utmMedium || "",
          });
        }

        const withGclid = conversions.filter(c => c.gclid || c.gbraid || c.wbraid).length;
        const withFbclid = conversions.filter(c => c.fbclid).length;
        const totalValue = conversions.reduce((sum, c) => sum + c.conversionValue, 0);

        return {
          conversions,
          summary: {
            total: conversions.length,
            withGclid,
            withFbclid,
            totalValue,
          },
        };
      }),

    // Admin: CRUD for ad spend tracking
    listAdSpend: adminProcedure
      .input(z.object({
        platform: z.enum(["google_ads", "meta_ads", "other"]).optional(),
        monthFrom: z.string().optional(), // YYYY-MM
        monthTo: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const { adSpend } = await import("../drizzle/schema");
        const conditions = [];
        if (input?.platform) conditions.push(eq(adSpend.platform, input.platform));
        if (input?.monthFrom) conditions.push(gte(adSpend.month, input.monthFrom));
        if (input?.monthTo) conditions.push(lte(adSpend.month, input.monthTo));
        const rows = conditions.length > 0
          ? await db.select().from(adSpend).where(and(...conditions)).orderBy(desc(adSpend.month))
          : await db.select().from(adSpend).orderBy(desc(adSpend.month));
        return rows;
      }),

    upsertAdSpend: adminProcedure
      .input(z.object({
        id: z.number().optional(), // if provided, update; otherwise insert
        platform: z.enum(["google_ads", "meta_ads", "other"]),
        campaignName: z.string().min(1),
        month: z.string().regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM format"),
        spend: z.string().min(1),
        impressions: z.number().optional(),
        clicks: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        const { adSpend } = await import("../drizzle/schema");
        if (input.id) {
          await db.update(adSpend).set({
            platform: input.platform,
            campaignName: input.campaignName,
            month: input.month,
            spend: input.spend,
            impressions: input.impressions ?? null,
            clicks: input.clicks ?? null,
            notes: input.notes ?? null,
          }).where(eq(adSpend.id, input.id));
        } else {
          await db.insert(adSpend).values({
            platform: input.platform,
            campaignName: input.campaignName,
            month: input.month,
            spend: input.spend,
            impressions: input.impressions ?? null,
            clicks: input.clicks ?? null,
            notes: input.notes ?? null,
          });
        }
        return { success: true };
      }),

    deleteAdSpend: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        const { adSpend } = await import("../drizzle/schema");
        await db.delete(adSpend).where(eq(adSpend.id, input.id));
        return { success: true };
      }),

    // Admin: ROI with ad spend — enriches campaign data with cost-per-lead and ROAS
    campaignRoi: adminProcedure
      .input(z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const { adSpend } = await import("../drizzle/schema");

        const now = new Date();
        const dateFrom = input?.dateFrom ? new Date(input.dateFrom) : new Date(now.getTime() - 90 * 86400000);
        const dateTo = input?.dateTo ? new Date(input.dateTo + "T23:59:59") : now;

        // Determine months in range
        const monthsInRange: string[] = [];
        const startMonth = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1);
        const endMonth = new Date(dateTo.getFullYear(), dateTo.getMonth(), 1);
        let cursor = new Date(startMonth);
        while (cursor <= endMonth) {
          monthsInRange.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
          cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        }

        // Get all ad spend in range
        const allSpend = monthsInRange.length > 0
          ? await db.select().from(adSpend).where(and(
              gte(adSpend.month, monthsInRange[0]),
              lte(adSpend.month, monthsInRange[monthsInRange.length - 1])
            ))
          : [];

        // Get quotes in range
        const allQuotes = await db.select().from(quoteRequests).where(and(
          gte(quoteRequests.createdAt, dateFrom),
          lte(quoteRequests.createdAt, dateTo)
        ));

        const allCallbacks = await db.select().from(callbackRequests).where(and(
          gte(callbackRequests.createdAt, dateFrom),
          lte(callbackRequests.createdAt, dateTo)
        ));

        // Aggregate spend by campaign
        const spendByCampaign: Record<string, { spend: number; impressions: number; clicks: number; platform: string }> = {};
        for (const s of allSpend) {
          const key = s.campaignName;
          if (!spendByCampaign[key]) spendByCampaign[key] = { spend: 0, impressions: 0, clicks: 0, platform: s.platform };
          spendByCampaign[key].spend += parseFloat(s.spend);
          spendByCampaign[key].impressions += s.impressions || 0;
          spendByCampaign[key].clicks += s.clicks || 0;
        }

        // Aggregate leads by campaign
        const leadsByCampaign: Record<string, { leads: number; won: number; revenue: number }> = {};
        for (const q of allQuotes) {
          const campaign = q.utmCampaign || "(no campaign)";
          if (!leadsByCampaign[campaign]) leadsByCampaign[campaign] = { leads: 0, won: 0, revenue: 0 };
          leadsByCampaign[campaign].leads++;
          if (q.status === "won") {
            leadsByCampaign[campaign].won++;
            leadsByCampaign[campaign].revenue += parseFloat(q.quotedAmount || "0");
          }
        }
        for (const cb of allCallbacks) {
          const campaign = cb.utmCampaign || "(no campaign)";
          if (!leadsByCampaign[campaign]) leadsByCampaign[campaign] = { leads: 0, won: 0, revenue: 0 };
          leadsByCampaign[campaign].leads++;
          if (cb.status === "completed") leadsByCampaign[campaign].won++;
        }

        // Merge into ROI rows
        const allCampaigns = new Set([...Object.keys(spendByCampaign), ...Object.keys(leadsByCampaign)]);
        const result = Array.from(allCampaigns).map(campaign => {
          const spend = spendByCampaign[campaign] || { spend: 0, impressions: 0, clicks: 0, platform: "" };
          const leads = leadsByCampaign[campaign] || { leads: 0, won: 0, revenue: 0 };
          const costPerLead = leads.leads > 0 ? spend.spend / leads.leads : 0;
          const costPerAcquisition = leads.won > 0 ? spend.spend / leads.won : 0;
          const roas = spend.spend > 0 ? leads.revenue / spend.spend : 0;
          const ctr = spend.impressions > 0 ? (spend.clicks / spend.impressions) * 100 : 0;
          const costPerClick = spend.clicks > 0 ? spend.spend / spend.clicks : 0;
          return {
            campaign,
            platform: spend.platform,
            spend: spend.spend,
            impressions: spend.impressions,
            clicks: spend.clicks,
            ctr: Math.round(ctr * 100) / 100,
            costPerClick: Math.round(costPerClick * 100) / 100,
            leads: leads.leads,
            won: leads.won,
            revenue: leads.revenue,
            costPerLead: Math.round(costPerLead * 100) / 100,
            costPerAcquisition: Math.round(costPerAcquisition * 100) / 100,
            roas: Math.round(roas * 100) / 100,
            winRate: leads.leads > 0 ? Math.round((leads.won / leads.leads) * 100) : 0,
          };
        }).sort((a, b) => b.leads - a.leads);

        // Totals
        const totalSpend = result.reduce((s, r) => s + r.spend, 0);
        const totalLeads = result.reduce((s, r) => s + r.leads, 0);
        const totalWon = result.reduce((s, r) => s + r.won, 0);
        const totalRevenue = result.reduce((s, r) => s + r.revenue, 0);

        return {
          campaigns: result,
          totals: {
            spend: totalSpend,
            leads: totalLeads,
            won: totalWon,
            revenue: totalRevenue,
            costPerLead: totalLeads > 0 ? Math.round((totalSpend / totalLeads) * 100) / 100 : 0,
            roas: totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) / 100 : 0,
          },
        };
      }),

    // Admin: Digest settings CRUD
    getDigestSettings: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return null;
      const { digestSettings } = await import("../drizzle/schema");
      const rows = await db.select().from(digestSettings).limit(1);
      return rows[0] || null;
    }),

    upsertDigestSettings: adminProcedure
      .input(z.object({
        enabled: z.boolean(),
        recipientEmail: z.string().email(),
        frequency: z.enum(["weekly", "monthly"]).default("weekly"),
        dayOfWeek: z.number().min(0).max(6).default(1),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        const { digestSettings } = await import("../drizzle/schema");
        const existing = await db.select().from(digestSettings).limit(1);
        if (existing.length > 0) {
          await db.update(digestSettings).set({
            enabled: input.enabled ? 1 : 0,
            recipientEmail: input.recipientEmail,
            frequency: input.frequency,
            dayOfWeek: input.dayOfWeek,
          }).where(eq(digestSettings.id, existing[0].id));
        } else {
          await db.insert(digestSettings).values({
            enabled: input.enabled ? 1 : 0,
            recipientEmail: input.recipientEmail,
            frequency: input.frequency,
            dayOfWeek: input.dayOfWeek,
          });
        }
        return { success: true };
      }),

    // Admin: Send test digest email now
    sendDigestNow: adminProcedure.mutation(async () => {
      const { sendWeeklyDigest } = await import("./weeklyDigest");
      return sendWeeklyDigest();
    }),

    // Admin: Manually trigger Google Ads weekly report email
    sendGoogleAdsReport: adminProcedure.mutation(async () => {
      const { sendGoogleAdsWeeklyReport } = await import("./googleAdsReport");
      return sendGoogleAdsWeeklyReport();
    }),

    // Admin: Live Google Ads dashboard data via Windsor.ai
    googleAds: adminProcedure
      .input(z.object({
        datePreset: z.enum(["last_7d", "last_14d", "last_30d", "last_90d"]).default("last_30d"),
      }).optional())
      .query(async ({ input }) => {
        if (!isWindsorConfigured()) {
          return { configured: false as const };
        }
        try {
          const data = await getGoogleAdsDashboard(input?.datePreset ?? "last_30d");
          return { configured: true as const, ...data };
        } catch (error: any) {
          console.error("[GoogleAds] Windsor API error:", error.message);
          return { configured: true as const, error: error.message };
        }
      }),
  }),

  blog: router({
    // Public: list all published blog posts
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        if (input?.category) {
          return getBlogPostsByCategory(input.category);
        }
        return getAllBlogPosts(true);
      }),

    // Public: get a single blog post by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await getBlogPostBySlug(input.slug);
        if (!post || post.published !== 1) return null;
        return post;
      }),

    // Admin: list all blog posts (including unpublished)
    adminList: adminProcedure.query(async () => {
      return getAllBlogPosts(false);
    }),

    // Admin: get a single blog post by ID
    adminGetById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getBlogPostById(input.id) ?? null;
      }),

    // Admin: create a new blog post
    create: adminProcedure
      .input(blogPostInputSchema)
      .mutation(async ({ input }) => {
        await createBlogPost({
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          content: input.content,
          category: input.category,
          coverImage: input.coverImage ?? null,
          published: input.published,
          authorName: input.authorName,
          readTimeMinutes: input.readTimeMinutes,
          metaTitle: input.metaTitle ?? null,
          metaDescription: input.metaDescription ?? null,
        });
        return { success: true };
      }),

    // Admin: update a blog post
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: blogPostInputSchema.partial(),
      }))
      .mutation(async ({ input }) => {
        await updateBlogPost(input.id, input.data);
        return { success: true };
      }),

    // Admin: delete a blog post
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBlogPost(input.id);
        return { success: true };
      }),
  }),

  guide: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().trim().min(2, "Name is required").max(100),
        email: z.string().trim().email("Valid email is required").max(254),
        phone: z.string().trim().max(30).optional(),
        website: z.string().max(200).optional(),
        formStartedAt: z.number().int().positive().optional(),
        leadSource: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        utmTerm: z.string().optional(),
        utmContent: z.string().optional(),
        gclid: z.string().optional(),
        fbclid: z.string().optional(),
        referrer: z.string().optional(),
        landingPage: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        let normalizedPhone = "";
        if (input.phone) {
          const phoneValidation = validateAustralianPhone(input.phone);
          if (!phoneValidation.valid) {
            throw new TRPCError({ code: "BAD_REQUEST", message: phoneValidation.error });
          }
          normalizedPhone = phoneValidation.normalized;
        }

        const signals = assessSubmissionSignals({
          honeypot: input.website,
          startedAt: input.formStartedAt,
        });
        if (!signals.allowed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "We couldn't submit that request. Please check the form and try again.",
          });
        }

        const forwardedAddress = ctx.req.headers["x-forwarded-for"];
        const address = Array.isArray(forwardedAddress)
          ? forwardedAddress[0]
          : forwardedAddress?.split(",")[0]?.trim() || ctx.req.ip || "unknown";
        const guideFingerprint = createLeadFingerprint({ email: input.email });
        const addressFingerprint = createLeadFingerprint({ address });

        if (!guideSubmissionLimiter.attempt(guideFingerprint).allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "We've already received this guide request. Please check your email or try again later.",
          });
        }
        if (!guideAddressLimiter.attempt(addressFingerprint).allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests were received. Please wait a few minutes and try again.",
          });
        }

        try {
          const db = await getDb();
          if (db) {
            await db.insert(quoteRequests).values({
              name: input.name,
              phone: normalizedPhone || "Not provided",
              email: input.email,
              suburb: "Not specified",
              service: "Homeowner Guide Download",
              details: "Downloaded the Homeowner's Guide to Concreting PDF.",
              leadSource: input.leadSource ?? "guide-download",
              utmSource: input.utmSource ?? null,
              utmMedium: input.utmMedium ?? null,
              utmCampaign: input.utmCampaign ?? null,
              utmTerm: input.utmTerm ?? null,
              utmContent: input.utmContent ?? null,
              gclid: input.gclid ?? null,
              fbclid: input.fbclid ?? null,
              referrer: input.referrer ?? null,
              landingPage: input.landingPage ?? null,
            });
          }
        } catch (err) {
          console.error("[Guide] Failed to save guide lead:", err);
        }

        try {
          await notifyOwner({
            title: `Guide Download: ${input.name}`,
            content: [
              "**Homeowner Guide Download**",
              "",
              `**Name:** ${input.name}`,
              `**Email:** ${input.email}`,
              `**Phone:** ${normalizedPhone || "Not provided"}`,
              `**Source:** ${input.leadSource || "guide-download"}`,
            ].join("\n"),
          });
        } catch (err) {
          console.error("[Guide] Failed to notify owner:", err);
        }

        return { success: true, phone: normalizedPhone || null };
      }),
  }),

  callback: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().trim().min(2, "Name is required").max(100),
        phone: z.string().trim().min(1, "Phone is required").max(30),
        suburb: z.string().trim().max(120).optional(),
        page: z.string().optional(),
        website: z.string().max(200).optional(),
        formStartedAt: z.number().int().positive().optional(),
        leadSource: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        utmTerm: z.string().optional(),
        utmContent: z.string().optional(),
        gclid: z.string().optional(),
        fbclid: z.string().optional(),
        referrer: z.string().optional(),
        landingPage: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const phoneValidation = validateAustralianPhone(input.phone);
        if (!phoneValidation.valid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: phoneValidation.error });
        }

        const serviceArea = classifyServiceArea(input.suburb || "Not specified");
        if (!serviceArea.canSubmit) {
          throw new TRPCError({ code: "BAD_REQUEST", message: serviceArea.message });
        }

        const signals = assessSubmissionSignals({
          honeypot: input.website,
          startedAt: input.formStartedAt,
        });
        if (!signals.allowed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "We couldn't submit that request. Please check the form and try again.",
          });
        }

        const forwardedAddress = ctx.req.headers["x-forwarded-for"];
        const address = Array.isArray(forwardedAddress)
          ? forwardedAddress[0]
          : forwardedAddress?.split(",")[0]?.trim() || ctx.req.ip || "unknown";
        const callbackFingerprint = createLeadFingerprint({
          phone: phoneValidation.normalized,
          location: serviceArea.normalized,
          address: input.name,
        });
        const addressFingerprint = createLeadFingerprint({ address });

        if (!callbackSubmissionLimiter.attempt(callbackFingerprint).allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "We've already received this callback request. Please wait a moment before trying again.",
          });
        }
        if (!callbackAddressLimiter.attempt(addressFingerprint).allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests were received. Please wait a few minutes and try again.",
          });
        }

        input.phone = phoneValidation.normalized;
        input.suburb = serviceArea.normalized;

        // Save to database
        try {
          const db = await getDb();
          if (db) {
            await db.insert(callbackRequests).values({
              name: input.name,
              phone: input.phone,
              page: input.page ?? null,
              leadSource: input.leadSource ?? "callback_widget",
              utmSource: input.utmSource ?? null,
              utmMedium: input.utmMedium ?? null,
              utmCampaign: input.utmCampaign ?? null,
              utmTerm: input.utmTerm ?? null,
              utmContent: input.utmContent ?? null,
              gclid: input.gclid ?? null,
              fbclid: input.fbclid ?? null,
              referrer: input.referrer ?? null,
              landingPage: input.landingPage ?? null,
            });
          }
        } catch (err) {
          console.error("[Callback] Failed to save to database:", err);
        }

        // Send instant notification to owner
        try {
          await notifyOwner({
            title: `\u260E\uFE0F URGENT CALLBACK: ${input.name} wants a call back NOW!`,
            content: [
              `**CALLBACK REQUEST — CALL IMMEDIATELY**`,
              ``,
              `**Name:** ${input.name}`,
              `**Phone:** ${input.phone}`,
              `**Suburb:** ${input.suburb}`,
              `**Service Area:** ${serviceArea.status === "service_area_review" ? "Review required" : "Within advertised area"}`,
              `**Page:** ${input.page || "Homepage"}`,
              ``,
              `This person requested a callback via the "Call Me Back in 60 Seconds" widget.`,
              `Call them back ASAP to win the job!`,
            ].join("\n"),
          });
        } catch (err) {
          console.error("[Callback] Failed to send notification:", err);
        }

        // Send email notification to business owner
        try {
          await sendCallbackNotificationEmail({
            name: input.name,
            phone: input.phone,
            page: input.page,
          });
        } catch (err) {
          console.error("[Callback] Failed to send email:", err);
        }

        // Send push notification to owner's devices
        try {
          await sendCallbackPushNotification({
            name: input.name,
            phone: input.phone,
          });
        } catch (err) {
          console.error("[Callback] Failed to send push notification:", err);
        }

        // Send SMS to business owner (if Twilio configured)
        if (isTwilioConfigured()) {
          try {
            await sendCallbackSms({
              name: input.name,
              phone: input.phone,
            });
          } catch (err) {
            console.error("[Callback] Failed to send SMS:", err);
          }
        }

        // Forward to CCG Lead Engine for scoring & SMS follow-up (fire-and-forget)
        fetch("https://ccgvoiceleads-nnuduqrr.manus.space/api/webhooks/form-submission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: input.name,
            phone: input.phone,
            email: "",
            suburb: input.suburb,
            serviceRequired: "Callback Request",
            projectDetails: `Callback requested from: ${input.page || "Homepage"}`,
            leadSource: input.leadSource || "callback_widget",
            utmSource: input.utmSource || null,
            utmMedium: input.utmMedium || null,
            utmCampaign: input.utmCampaign || null,
            utmTerm: input.utmTerm || null,
            utmContent: input.utmContent || null,
            gclid: input.gclid || null,
            fbclid: input.fbclid || null,
            referrer: input.referrer || null,
            landingPage: input.landingPage || null,
          }),
        }).catch((err) => {
          console.error("[Callback] CCG Lead Engine webhook failed:", err);
        });

        return {
          success: true,
          message: "Callback request submitted!",
          serviceAreaStatus: serviceArea.status,
        };
      }),

    // Admin: list all callback requests
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(callbackRequests).orderBy(callbackRequests.createdAt);
    }),

    // Admin: update callback status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "called", "no_answer", "completed"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.update(callbackRequests)
          .set({
            status: input.status,
            notes: input.notes ?? undefined,
          })
          .where(eq(callbackRequests.id, input.id));
        return { success: true };
      }),
  }),
  chat: router({
    send: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const systemPrompt = `You are a helpful assistant for Concrete Concepts Group, a QBCC-licensed concreting company in Brisbane, Australia (License #15299707). Your job is to answer questions about concreting services, provide helpful information, and encourage visitors to request a free quote.

Key business details:
- Phone: 0424 463 268
- Email: info@concreteconceptsgroup.com
- Service area: Brisbane, Logan, Gold Coast, Moreton Bay, Ipswich, and all of South East Queensland
- Hours: Mon-Fri 6am-5pm, Sat 7am-2pm
- QBCC License: #15299707
- Google Rating: 4.9 stars

Services offered:
- Concrete driveways (plain, coloured, exposed aggregate) from $75/m\u00b2
- Concrete slabs (house, shed, garage, granny flat) from $70/m\u00b2
- Retaining walls (concrete block, poured) from $250/m
- Exposed aggregate (driveways, patios, pool surrounds) from $110/m\u00b2
- Concrete patios and entertaining areas from $75/m\u00b2
- Excavation and site preparation from $50/m\u00b3
- Pool surrounds (slip-resistant finishes) from $75/m\u00b2
- Crossover permits and vehicle crossings from $2,500
- Shed slabs and garage slabs from $70/m\u00b2
- Stairs, steps, pathways, formwork, concrete removal, grinding, sealing, pumping

Guidelines:
- Be friendly, professional, and knowledgeable about concreting in Brisbane
- Always recommend getting a free quote for accurate pricing
- If asked about pricing, give general ranges but caveat with "prices vary based on site conditions, access, and finish type"
- If asked about topics outside concreting, politely redirect
- Keep responses concise (2-4 paragraphs max)
- Use Australian English spelling
- Never make up information about the business
- If someone seems ready to proceed, encourage them to call 0424 463 268 or visit /get-quote`;

        const llmMessages = [
          { role: "system" as const, content: systemPrompt },
          ...input.messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        try {
          const response = await invokeLLM({ messages: llmMessages });
          const content = response.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Please try again or call us on 0424 463 268.";
          return { reply: content };
        } catch (err) {
          console.error("[Chat] LLM error:", err);
          return { reply: "I'm having trouble right now. For immediate help, please call us on 0424 463 268 or email info@concreteconceptsgroup.com." };
        }
      }),
  }),

  social: router({
    // Admin: check if Meta API is configured
    status: adminProcedure.query(() => {
      return {
        facebookConfigured: isMetaConfigured(),
        instagramConfigured: isInstagramConfigured(),
      };
    }),

    // Admin: list all social posts
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(socialPosts).orderBy(desc(socialPosts.createdAt));
    }),

    // Admin: create a new social post (draft or schedule)
    create: adminProcedure
      .input(z.object({
        caption: z.string().min(1, "Caption is required"),
        imageUrl: z.string().optional(),
        platforms: z.string().default("facebook,instagram"),
        postType: z.enum(["blog_share", "project_photo", "testimonial", "promotion", "custom"]).default("custom"),
        blogPostId: z.number().optional(),
        scheduledAt: z.string().optional(), // ISO date string
        publishNow: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const status = input.publishNow ? "publishing" : input.scheduledAt ? "scheduled" : "draft";

        const [inserted] = await db.insert(socialPosts).values({
          caption: input.caption,
          imageUrl: input.imageUrl ?? null,
          platforms: input.platforms,
          postType: input.postType,
          blogPostId: input.blogPostId ?? null,
          status,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        });

        const postId = inserted.insertId;

        // If publishNow, post immediately
        if (input.publishNow) {
          const platforms = input.platforms.split(",").map(p => p.trim());
          let fbPostId: string | null = null;
          let igPostId: string | null = null;
          let errorMessage: string | null = null;
          let hasSuccess = false;

          if (platforms.includes("facebook")) {
            const fbResult = await postToFacebook({
              message: input.caption,
              imageUrl: input.imageUrl,
            });
            if (fbResult.success) {
              fbPostId = fbResult.postId || null;
              hasSuccess = true;
            } else {
              errorMessage = `FB: ${fbResult.error}`;
            }
          }

          if (platforms.includes("instagram") && input.imageUrl) {
            const igResult = await postToInstagram({
              caption: input.caption,
              imageUrl: input.imageUrl,
            });
            if (igResult.success) {
              igPostId = igResult.postId || null;
              hasSuccess = true;
            } else {
              const igError = `IG: ${igResult.error}`;
              errorMessage = errorMessage ? `${errorMessage}; ${igError}` : igError;
            }
          }

          await db.update(socialPosts)
            .set({
              status: hasSuccess ? "published" : "failed",
              publishedAt: hasSuccess ? new Date() : null,
              fbPostId,
              igPostId,
              errorMessage,
            })
            .where(eq(socialPosts.id, Number(postId)));

          return { success: hasSuccess, postId: Number(postId), fbPostId, igPostId, errorMessage };
        }

        return { success: true, postId: Number(postId), status };
      }),

    // Admin: update a draft/scheduled post
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        caption: z.string().optional(),
        imageUrl: z.string().optional(),
        platforms: z.string().optional(),
        scheduledAt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...data } = input;
        await db.update(socialPosts)
          .set({
            ...(data.caption !== undefined && { caption: data.caption }),
            ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
            ...(data.platforms !== undefined && { platforms: data.platforms }),
            ...(data.scheduledAt !== undefined && { scheduledAt: new Date(data.scheduledAt) }),
          })
          .where(eq(socialPosts.id, id));
        return { success: true };
      }),

    // Admin: delete a post
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(socialPosts).where(eq(socialPosts.id, input.id));
        return { success: true };
      }),

    // Admin: generate AI caption for a post
    generateCaption: adminProcedure
      .input(z.object({
        postType: z.enum(["blog_share", "project_photo", "testimonial", "promotion", "custom"]),
        context: z.string().optional(), // blog title, project details, etc.
        service: z.string().optional(),
        suburb: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");

        const prompts: Record<string, string> = {
          blog_share: `Write a short, engaging Facebook/Instagram caption (2-3 sentences) to share this blog article: "${input.context}". Include a call-to-action to read more. Use Australian English. Keep it professional but friendly. Do NOT include hashtags — they will be added separately.`,
          project_photo: `Write a short, proud Facebook/Instagram caption (2-3 sentences) for a completed concreting project photo. Details: ${input.context || "concrete project in Brisbane"}. Mention the service type and suburb if provided. Use Australian English. Do NOT include hashtags.`,
          testimonial: `Write a short Facebook/Instagram caption (2-3 sentences) sharing a customer testimonial. Context: ${input.context || "happy customer review"}. Express gratitude. Use Australian English. Do NOT include hashtags.`,
          promotion: `Write a short, compelling Facebook/Instagram caption (2-3 sentences) for a promotion/offer from Concrete Concepts Group, a Brisbane concreting company. Details: ${input.context || "seasonal promotion"}. Include urgency. Use Australian English. Do NOT include hashtags.`,
          custom: `Write a short, engaging Facebook/Instagram caption (2-3 sentences) for Concrete Concepts Group, a Brisbane concreting company. Context: ${input.context || "general update"}. Use Australian English. Do NOT include hashtags.`,
        };

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a social media copywriter for Concrete Concepts Group, a QBCC-licensed concreting company in Brisbane. Write concise, engaging captions. Use Australian English. Never use emojis excessively — one or two max." },
            { role: "user", content: prompts[input.postType] || prompts.custom },
          ],
        });

        const rawContent = response.choices?.[0]?.message?.content || "";
        const caption = typeof rawContent === "string" ? rawContent : "";
        const hashtags = generateHashtags(input.service, input.suburb);

        return { caption: `${caption.trim()}\n\n${hashtags}` };
      }),

    // Admin: generate hashtags
    getHashtags: adminProcedure
      .input(z.object({
        service: z.string().optional(),
        suburb: z.string().optional(),
      }))
      .query(({ input }) => {
        return { hashtags: generateHashtags(input.service, input.suburb) };
      }),
  }),

  // Abandoned quote follow-up system
  abandonedQuote: router({
    // Public: save partial form data for follow-up
    save: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        phone: z.string().optional(),
        suburb: z.string().optional(),
        service: z.string().optional(),
        page: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) return { success: false };

          // Check if this email already has a recent abandoned quote (within 24h)
          const existing = await db.select().from(abandonedQuotes)
            .where(eq(abandonedQuotes.email, input.email))
            .orderBy(desc(abandonedQuotes.createdAt))
            .limit(1);

          if (existing.length > 0) {
            const lastCreated = new Date(existing[0].createdAt);
            const hoursSince = (Date.now() - lastCreated.getTime()) / (1000 * 60 * 60);
            if (hoursSince < 24) {
              // Update existing record with new data
              await db.update(abandonedQuotes)
                .set({
                  name: input.name ?? existing[0].name,
                  phone: input.phone ?? existing[0].phone,
                  suburb: input.suburb ?? existing[0].suburb,
                  service: input.service ?? existing[0].service,
                  page: input.page ?? existing[0].page,
                })
                .where(eq(abandonedQuotes.id, existing[0].id));
              return { success: true, updated: true };
            }
          }

          // Create new abandoned quote record
          await db.insert(abandonedQuotes).values({
            email: input.email,
            name: input.name ?? null,
            phone: input.phone ?? null,
            suburb: input.suburb ?? null,
            service: input.service ?? null,
            page: input.page ?? null,
          });

          return { success: true };
        } catch (err) {
          console.error("[AbandonedQuote] Failed to save:", err);
          return { success: false };
        }
      }),

    // Admin: list abandoned quotes
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(abandonedQuotes).orderBy(desc(abandonedQuotes.createdAt)).limit(100);
    }),

    // Admin: manually trigger abandoned quote follow-ups
    processFollowUps: adminProcedure.mutation(async () => {
      return processAbandonedQuoteFollowUps();
    }),
  }),

  // Customer satisfaction survey system
  survey: router({
    // Public: get survey by token
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const results = await db.select().from(customerSurveys)
          .where(eq(customerSurveys.token, input.token))
          .limit(1);
        if (results.length === 0) return null;
        const survey = results[0];
        // Don't expose internal fields
        return {
          id: survey.id,
          customerName: survey.customerName,
          status: survey.status,
          overallRating: survey.overallRating,
          qualityRating: survey.qualityRating,
          communicationRating: survey.communicationRating,
          timelinessRating: survey.timelinessRating,
          feedback: survey.feedback,
          wouldRecommend: survey.wouldRecommend,
        };
      }),

    // Public: submit survey response
    submit: publicProcedure
      .input(z.object({
        token: z.string(),
        overallRating: z.number().min(1).max(5),
        qualityRating: z.number().min(1).max(5).optional(),
        communicationRating: z.number().min(1).max(5).optional(),
        timelinessRating: z.number().min(1).max(5).optional(),
        feedback: z.string().optional(),
        wouldRecommend: z.number().min(0).max(1).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        const results = await db.select().from(customerSurveys)
          .where(eq(customerSurveys.token, input.token))
          .limit(1);
        if (results.length === 0) return { success: false, message: "Survey not found" };
        if (results[0].status === "completed") return { success: false, message: "Survey already completed" };

        await db.update(customerSurveys)
          .set({
            overallRating: input.overallRating,
            qualityRating: input.qualityRating ?? null,
            communicationRating: input.communicationRating ?? null,
            timelinessRating: input.timelinessRating ?? null,
            feedback: input.feedback ?? null,
            wouldRecommend: input.wouldRecommend ?? null,
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(customerSurveys.token, input.token));

        // Notify owner of survey response
        const survey = results[0];
        try {
          await notifyOwner({
            title: `\u2B50 Survey Response: ${survey.customerName} rated ${input.overallRating}/5`,
            content: [
              `**Customer Survey Response**`,
              ``,
              `**Customer:** ${survey.customerName}`,
              `**Overall Rating:** ${"\u2B50".repeat(input.overallRating)} (${input.overallRating}/5)`,
              input.qualityRating ? `**Quality:** ${input.qualityRating}/5` : "",
              input.communicationRating ? `**Communication:** ${input.communicationRating}/5` : "",
              input.timelinessRating ? `**Timeliness:** ${input.timelinessRating}/5` : "",
              input.feedback ? `**Feedback:** ${input.feedback}` : "",
              input.wouldRecommend !== undefined ? `**Would Recommend:** ${input.wouldRecommend === 1 ? "Yes" : "No"}` : "",
            ].filter(Boolean).join("\n"),
          });
        } catch (_e) { /* best effort */ }

        // If rating >= 4, suggest Google review (return flag to frontend)
        return {
          success: true,
          showGoogleReview: input.overallRating >= 4,
        };
      }),

    // Public: track Google review click
    trackGoogleReviewClick: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.update(customerSurveys)
          .set({ googleReviewClicked: 1 })
          .where(eq(customerSurveys.token, input.token));
        return { success: true };
      }),

    // Admin: create a survey for a completed job
    create: adminProcedure
      .input(z.object({
        quoteRequestId: z.number(),
        customerName: z.string(),
        customerEmail: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        const token = crypto.randomBytes(32).toString("hex");

        await db.insert(customerSurveys).values({
          quoteRequestId: input.quoteRequestId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          token,
          status: "pending",
        });

        return { success: true, token };
      }),

    // Admin: send survey email
    sendEmail: adminProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        const results = await db.select().from(customerSurveys)
          .where(eq(customerSurveys.token, input.token))
          .limit(1);
        if (results.length === 0) return { success: false, message: "Survey not found" };

        const survey = results[0];
        const sent = await sendSurveyEmail({
          email: survey.customerEmail,
          name: survey.customerName,
          token: survey.token,
        });

        if (sent) {
          await db.update(customerSurveys)
            .set({ status: "sent", sentAt: new Date() })
            .where(eq(customerSurveys.id, survey.id));
        }

        return { success: sent };
      }),

    // Admin: list all surveys
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(customerSurveys).orderBy(desc(customerSurveys.createdAt)).limit(100);
    }),
  }),

  // Blog scheduling system
  blogSchedule: router({
    // Admin: schedule a blog post for future publishing
    schedule: adminProcedure
      .input(z.object({
        blogPostId: z.number(),
        scheduledPublishAt: z.string(), // ISO date string
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        // Ensure the blog post exists and is unpublished
        const post = await getBlogPostById(input.blogPostId);
        if (!post) return { success: false, message: "Blog post not found" };

        // Set the post to unpublished (draft) until scheduled time
        await updateBlogPost(input.blogPostId, { published: 0 });

        await db.insert(scheduledBlogPosts).values({
          blogPostId: input.blogPostId,
          scheduledPublishAt: new Date(input.scheduledPublishAt),
        });

        return { success: true };
      }),

    // Admin: list scheduled posts
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const scheduled = await db.select().from(scheduledBlogPosts)
        .where(eq(scheduledBlogPosts.published, 0))
        .orderBy(asc(scheduledBlogPosts.scheduledPublishAt));

      // Enrich with blog post titles
      const enriched = await Promise.all(
        scheduled.map(async (s) => {
          const post = await getBlogPostById(s.blogPostId);
          return {
            ...s,
            blogPostTitle: post?.title ?? "Unknown",
            blogPostSlug: post?.slug ?? "",
          };
        })
      );
      return enriched;
    }),

    // Admin: cancel a scheduled post
    cancel: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.delete(scheduledBlogPosts).where(eq(scheduledBlogPosts.id, input.id));
        return { success: true };
      }),

    // Admin: manually trigger scheduled post publishing
    processScheduled: adminProcedure.mutation(async () => {
      return processScheduledBlogPosts();
    }),
  }),

  // Push notifications — subscribe/unsubscribe and send test
  push: router({
    // Subscribe to push notifications
    subscribe: publicProcedure
      .input(z.object({
        endpoint: z.string().min(1),
        p256dh: z.string().min(1),
        auth: z.string().min(1),
        label: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Add to in-memory store
        addSubscription({
          endpoint: input.endpoint,
          keys: {
            p256dh: input.p256dh,
            auth: input.auth,
          },
        });

        // Persist to database
        try {
          const db = await getDb();
          if (db) {
            // Check if already exists
            const existing = await db.select().from(pushSubscriptionsTable)
              .where(eq(pushSubscriptionsTable.endpoint, input.endpoint))
              .limit(1);

            if (existing.length === 0) {
              await db.insert(pushSubscriptionsTable).values({
                endpoint: input.endpoint,
                p256dh: input.p256dh,
                auth: input.auth,
                label: input.label ?? null,
              });
            } else {
              // Update keys in case they changed
              await db.update(pushSubscriptionsTable)
                .set({ p256dh: input.p256dh, auth: input.auth })
                .where(eq(pushSubscriptionsTable.endpoint, input.endpoint));
            }
          }
        } catch (err) {
          console.error("[Push] Failed to persist subscription:", err);
        }

        return { success: true };
      }),

    // Unsubscribe from push notifications
    unsubscribe: publicProcedure
      .input(z.object({ endpoint: z.string().min(1) }))
      .mutation(async ({ input }) => {
        removeSubscription(input.endpoint);

        // Remove from database
        try {
          const db = await getDb();
          if (db) {
            await db.delete(pushSubscriptionsTable)
              .where(eq(pushSubscriptionsTable.endpoint, input.endpoint));
          }
        } catch (err) {
          console.error("[Push] Failed to remove subscription from DB:", err);
        }

        return { success: true };
      }),

    // Get push notification status
    status: publicProcedure.query(() => {
      return {
        configured: isPushConfigured(),
        vapidPublicKey: process.env.VITE_VAPID_PUBLIC_KEY || "",
      };
    }),

    // Admin: send a test push notification
    test: adminProcedure.mutation(async () => {
      const { sendPushNotification } = await import("./pushNotification");
      const result = await sendPushNotification({
        title: "Test Notification",
        body: "Push notifications are working! You'll receive alerts for new quote requests.",
        icon: "/icon-192.png",
        tag: "test-notification",
        url: "/admin/quotes",
      });
      return result;
    }),
  }),

  // Geolocation — auto-detect visitor's suburb via IP
  geo: router({
    detect: publicProcedure.query(async ({ ctx }) => {
      try {
        // Get client IP from request headers (forwarded by proxy)
        const forwarded = ctx.req?.headers["x-forwarded-for"];
        const ip = typeof forwarded === "string"
          ? forwarded.split(",")[0].trim()
          : ctx.req?.socket?.remoteAddress || "";

        // Use ip-api.com (free, no key needed, 45 req/min)
        const response = await fetch(
          `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,zip,lat,lon`
        );
        const data = await response.json() as {
          status: string;
          country?: string;
          countryCode?: string;
          regionName?: string;
          city?: string;
          zip?: string;
          lat?: number;
          lon?: number;
        };

        if (data.status !== "success") {
          return { detected: false, suburb: "", region: "", country: "" };
        }

        return {
          detected: true,
          suburb: data.city || "",
          region: data.regionName || "",
          country: data.countryCode || "",
          postcode: data.zip || "",
        };
      } catch {
        return { detected: false, suburb: "", region: "", country: "" };
      }
    }),
  }),

  // Customer status portal — public lookup by token or phone
  status: router({
    // Public: lookup quote status by unique token (from email link)
    byToken: publicProcedure
      .input(z.object({ token: z.string().min(1) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [quote] = await db.select({
          id: quoteRequests.id,
          name: quoteRequests.name,
          service: quoteRequests.service,
          suburb: quoteRequests.suburb,
          status: quoteRequests.status,
          quotedAmount: quoteRequests.quotedAmount,
          pdfUrl: quoteRequests.pdfUrl,
          pdfRef: quoteRequests.pdfRef,
          scheduledDate: quoteRequests.scheduledDate,
          contactedAt: quoteRequests.contactedAt,
          completedAt: quoteRequests.completedAt,
          createdAt: quoteRequests.createdAt,
        }).from(quoteRequests)
          .where(eq(quoteRequests.statusToken, input.token))
          .limit(1);
        if (!quote) return null;

        // Get timeline events
        const events = await db.select().from(jobTimelineEvents)
          .where(eq(jobTimelineEvents.quoteRequestId, quote.id))
          .orderBy(asc(jobTimelineEvents.createdAt));

        // Filter events for customer view (no internal notes)
        const customerEvents = events
          .filter(e => e.eventType !== "note_added" || e.source === "customer")
          .map(e => ({
            id: e.id,
            eventType: e.eventType,
            toStatus: e.toStatus,
            description: e.source === "customer" ? e.description : getCustomerFriendlyDescription(e.eventType, e.toStatus),
            createdAt: e.createdAt,
          }));

        return { ...quote, timeline: customerEvents };
      }),

    // Public: lookup quotes by phone
    lookupByPhone: publicProcedure
      .input(z.object({ phone: z.string().min(6) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const { sql } = await import("drizzle-orm");
        // Normalize: strip non-digit chars for comparison
        const digits = input.phone.replace(/\D/g, "");
        // Match last 8 digits to handle different formats (0424463268 vs +61424463268 vs 0424 463 268)
        const last8 = digits.slice(-8);
        if (last8.length < 8) return [];

        const allQuotes = await db.select({
          id: quoteRequests.id,
          name: quoteRequests.name,
          phone: quoteRequests.phone,
          service: quoteRequests.service,
          suburb: quoteRequests.suburb,
          status: quoteRequests.status,
          statusToken: quoteRequests.statusToken,
          quotedAmount: quoteRequests.quotedAmount,
          scheduledDate: quoteRequests.scheduledDate,
          createdAt: quoteRequests.createdAt,
        }).from(quoteRequests)
          .orderBy(desc(quoteRequests.createdAt));

        // Filter by last 8 digits of phone
        return allQuotes
          .filter(q => q.phone.replace(/\D/g, "").slice(-8) === last8)
          .map(q => ({
            id: q.id,
            name: q.name,
            service: q.service,
            suburb: q.suburb,
            status: q.status,
            statusToken: q.statusToken,
            quotedAmount: q.quotedAmount,
            scheduledDate: q.scheduledDate,
            createdAt: q.createdAt,
          }));
      }),

    // Admin: get timeline events for a quote
    timeline: adminProcedure
      .input(z.object({ quoteId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(jobTimelineEvents)
          .where(eq(jobTimelineEvents.quoteRequestId, input.quoteId))
          .orderBy(asc(jobTimelineEvents.createdAt));
      }),

    // Admin: get average response time stats
    responseTimeStats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { avgMinutes: 0, medianMinutes: 0, totalTracked: 0 };

      const quotes = await db.select({
        createdAt: quoteRequests.createdAt,
        contactedAt: quoteRequests.contactedAt,
      }).from(quoteRequests)
        .where(and(
          ne(quoteRequests.status, "new"),
          // Only count quotes that have contactedAt set
        ));

      const responseTimes = quotes
        .filter(q => q.contactedAt)
        .map(q => (q.contactedAt!.getTime() - q.createdAt.getTime()) / 60000); // minutes

      if (responseTimes.length === 0) return { avgMinutes: 0, medianMinutes: 0, totalTracked: 0 };

      const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const sorted = [...responseTimes].sort((a, b) => a - b);
      const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

      return {
        avgMinutes: Math.round(avg),
        medianMinutes: Math.round(median),
        totalTracked: responseTimes.length,
      };
    }),
  }),
  // Heartbeat cron management
  heartbeat: router({
    list: adminProcedure.query(async ({ ctx }) => {
      const { listHeartbeatJobs } = await import("./_core/heartbeat");
      const sessionToken = require("cookie").parse(ctx.req.headers.cookie ?? "")["app_session_id"] ?? "";
      return listHeartbeatJobs(sessionToken);
    }),
    createKeepAlive: adminProcedure.mutation(async ({ ctx }) => {
      const { createHeartbeatJob } = await import("./_core/heartbeat");
      const { parse: parseCookie } = await import("cookie");
      const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")["app_session_id"] ?? "";
      return createHeartbeatJob({
        name: "ccg-keep-alive",
        cron: "0 */5 * * * *", // Every 5 minutes
        path: "/api/scheduled/keep-alive",
        description: "Ping Cloudflare Pages every 5 min to prevent cold starts",
      }, sessionToken);
    }),
  }),
});

// Helper: customer-friendly descriptions for timeline events
function getCustomerFriendlyDescription(eventType: string, toStatus: string | null): string {
  if (eventType === "status_change") {
    switch (toStatus) {
      case "contacted": return "Our team has reviewed your enquiry and will be in touch shortly.";
      case "quoted": return "Your quote has been prepared and sent to you.";
      case "won": return "Great news! Your project has been confirmed and scheduled.";
      case "lost": return "This enquiry has been closed.";
      default: return "Your enquiry status has been updated.";
    }
  }
  if (eventType === "quote_sent") return "Your detailed quote has been emailed to you.";
  if (eventType === "scheduled") return "Your project has been scheduled.";
  if (eventType === "job_started") return "Work has begun on your project!";
  if (eventType === "job_completed") return "Your project is complete. We hope you love the result!";
  if (eventType === "payment_received") return "Payment received. Thank you!";
  return "Your enquiry has been updated.";
}

export type AppRouter = typeof appRouter;
