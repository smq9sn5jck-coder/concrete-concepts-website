import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ── Quote Request Queries ──

import { quoteRequests } from "../drizzle/schema";
import { desc } from "drizzle-orm";

export async function getAllQuoteRequests() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quotes: database not available");
    return [];
  }
  return db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
}

export async function getQuoteRequestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateQuoteStatus(id: number, data: { status?: "new" | "contacted" | "quoted" | "won" | "lost"; notes?: string; quotedAmount?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quoteRequests).set(data).where(eq(quoteRequests.id, id));
}

// ── Blog Post Queries ──

import { blogPosts, InsertBlogPost } from "../drizzle/schema";
import { and } from "drizzle-orm";

export async function getAllBlogPosts(publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (publishedOnly) {
    return db.select().from(blogPosts).where(eq(blogPosts.published, 1)).orderBy(desc(blogPosts.publishedAt));
  }
  return db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBlogPostsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts)
    .where(and(eq(blogPosts.category, category), eq(blogPosts.published, 1)))
    .orderBy(desc(blogPosts.publishedAt));
}

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(blogPosts).values(post);
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}
