import webpush from "web-push";

// VAPID keys for push notification authentication
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = "mailto:info@concreteconceptsgroup.com";

// Configure web-push with VAPID credentials
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// In-memory store for push subscriptions
// In production, these would be stored in the database
let pushSubscriptions: webpush.PushSubscription[] = [];

/**
 * Check if push notifications are configured
 */
export function isPushConfigured(): boolean {
  return !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

/**
 * Get the VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

/**
 * Add a push subscription
 */
export function addSubscription(subscription: webpush.PushSubscription): void {
  // Avoid duplicates by checking endpoint
  const exists = pushSubscriptions.some(
    (sub) => sub.endpoint === subscription.endpoint
  );
  if (!exists) {
    pushSubscriptions.push(subscription);
    console.log(
      `[Push] Subscription added. Total: ${pushSubscriptions.length}`
    );
  }
}

/**
 * Remove a push subscription by endpoint
 */
export function removeSubscription(endpoint: string): void {
  pushSubscriptions = pushSubscriptions.filter(
    (sub) => sub.endpoint !== endpoint
  );
  console.log(
    `[Push] Subscription removed. Total: ${pushSubscriptions.length}`
  );
}

/**
 * Get all active subscriptions
 */
export function getSubscriptions(): webpush.PushSubscription[] {
  return pushSubscriptions;
}

/**
 * Load subscriptions from database (call on server start)
 */
export async function loadSubscriptionsFromDb(
  dbSubscriptions: Array<{
    endpoint: string;
    p256dh: string;
    auth: string;
  }>
): Promise<void> {
  pushSubscriptions = dbSubscriptions.map((sub) => ({
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  }));
  console.log(
    `[Push] Loaded ${pushSubscriptions.length} subscriptions from database`
  );
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
}

/**
 * Send push notification to all subscribed devices
 */
export async function sendPushNotification(
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!isPushConfigured()) {
    console.warn("[Push] VAPID keys not configured, skipping push");
    return { sent: 0, failed: 0 };
  }

  if (pushSubscriptions.length === 0) {
    console.log("[Push] No subscriptions to send to");
    return { sent: 0, failed: 0 };
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    tag: payload.tag || "ccg-notification",
    url: payload.url || "/",
    data: payload.data || {},
  });

  let sent = 0;
  let failed = 0;
  const failedEndpoints: string[] = [];

  await Promise.allSettled(
    pushSubscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, notificationPayload);
        sent++;
      } catch (error: any) {
        failed++;
        // If subscription is expired or invalid (410 Gone, 404 Not Found), remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          failedEndpoints.push(subscription.endpoint);
        }
        console.warn(
          `[Push] Failed to send to ${subscription.endpoint.slice(0, 50)}...:`,
          error.statusCode || error.message
        );
      }
    })
  );

  // Clean up expired subscriptions
  if (failedEndpoints.length > 0) {
    pushSubscriptions = pushSubscriptions.filter(
      (sub) => !failedEndpoints.includes(sub.endpoint)
    );
    console.log(
      `[Push] Cleaned up ${failedEndpoints.length} expired subscriptions`
    );
  }

  console.log(`[Push] Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed };
}

/**
 * Send a push notification for a new quote request
 */
export async function sendQuotePushNotification(quote: {
  name: string;
  service: string;
  suburb: string;
  phone: string;
}): Promise<void> {
  await sendPushNotification({
    title: `New Quote: ${quote.name}`,
    body: `${quote.service} in ${quote.suburb}\nCall: ${quote.phone}`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `quote-${Date.now()}`,
    url: "/admin/quotes",
    data: {
      type: "new_quote",
      name: quote.name,
      service: quote.service,
      suburb: quote.suburb,
      phone: quote.phone,
    },
  });
}

/**
 * Send a push notification for a new callback request
 */
export async function sendCallbackPushNotification(callback: {
  name: string;
  phone: string;
  preferredTime?: string;
}): Promise<void> {
  const timeInfo = callback.preferredTime
    ? ` — Preferred: ${callback.preferredTime}`
    : "";
  await sendPushNotification({
    title: `Callback Request: ${callback.name}`,
    body: `Call ${callback.phone}${timeInfo}`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `callback-${Date.now()}`,
    url: "/admin/quotes",
    data: {
      type: "callback_request",
      name: callback.name,
      phone: callback.phone,
    },
  });
}
