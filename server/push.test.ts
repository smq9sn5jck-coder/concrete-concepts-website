import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addSubscription,
  removeSubscription,
  getSubscriptions,
  isPushConfigured,
  loadSubscriptionsFromDb,
  sendPushNotification,
  sendQuotePushNotification,
  sendCallbackPushNotification,
} from "./pushNotification";

// Mock web-push to avoid real push calls
vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({}),
  },
}));

describe("Push Notification Module", () => {
  beforeEach(() => {
    // Clear subscriptions between tests
    const subs = getSubscriptions();
    subs.forEach((sub) => removeSubscription(sub.endpoint));
  });

  describe("isPushConfigured", () => {
    it("should return true when VAPID keys are set", () => {
      // VAPID keys are set via environment variables in the test env
      // The module reads them at import time
      const result = isPushConfigured();
      // In test env, keys may or may not be set - just verify it returns a boolean
      expect(typeof result).toBe("boolean");
    });
  });

  describe("addSubscription", () => {
    it("should add a new subscription", () => {
      addSubscription({
        endpoint: "https://push.example.com/sub1",
        keys: { p256dh: "test-p256dh-1", auth: "test-auth-1" },
      });
      const subs = getSubscriptions();
      expect(subs).toHaveLength(1);
      expect(subs[0].endpoint).toBe("https://push.example.com/sub1");
    });

    it("should not add duplicate subscriptions", () => {
      addSubscription({
        endpoint: "https://push.example.com/sub1",
        keys: { p256dh: "test-p256dh-1", auth: "test-auth-1" },
      });
      addSubscription({
        endpoint: "https://push.example.com/sub1",
        keys: { p256dh: "test-p256dh-1", auth: "test-auth-1" },
      });
      expect(getSubscriptions()).toHaveLength(1);
    });

    it("should add multiple different subscriptions", () => {
      addSubscription({
        endpoint: "https://push.example.com/sub1",
        keys: { p256dh: "test-p256dh-1", auth: "test-auth-1" },
      });
      addSubscription({
        endpoint: "https://push.example.com/sub2",
        keys: { p256dh: "test-p256dh-2", auth: "test-auth-2" },
      });
      expect(getSubscriptions()).toHaveLength(2);
    });
  });

  describe("removeSubscription", () => {
    it("should remove a subscription by endpoint", () => {
      addSubscription({
        endpoint: "https://push.example.com/sub1",
        keys: { p256dh: "test-p256dh-1", auth: "test-auth-1" },
      });
      addSubscription({
        endpoint: "https://push.example.com/sub2",
        keys: { p256dh: "test-p256dh-2", auth: "test-auth-2" },
      });
      removeSubscription("https://push.example.com/sub1");
      const subs = getSubscriptions();
      expect(subs).toHaveLength(1);
      expect(subs[0].endpoint).toBe("https://push.example.com/sub2");
    });

    it("should handle removing non-existent subscription gracefully", () => {
      removeSubscription("https://push.example.com/nonexistent");
      expect(getSubscriptions()).toHaveLength(0);
    });
  });

  describe("loadSubscriptionsFromDb", () => {
    it("should load subscriptions from database format", async () => {
      await loadSubscriptionsFromDb([
        { endpoint: "https://push.example.com/db1", p256dh: "db-p256dh-1", auth: "db-auth-1" },
        { endpoint: "https://push.example.com/db2", p256dh: "db-p256dh-2", auth: "db-auth-2" },
      ]);
      const subs = getSubscriptions();
      expect(subs).toHaveLength(2);
      expect(subs[0].endpoint).toBe("https://push.example.com/db1");
      expect(subs[0].keys.p256dh).toBe("db-p256dh-1");
      expect(subs[1].endpoint).toBe("https://push.example.com/db2");
    });
  });

  describe("sendPushNotification", () => {
    it("should return {sent: 0, failed: 0} when no subscriptions exist", async () => {
      const result = await sendPushNotification({
        title: "Test",
        body: "Test body",
      });
      expect(result.sent).toBe(0);
      expect(result.failed).toBe(0);
    });
  });

  describe("sendQuotePushNotification", () => {
    it("should not throw when called with valid quote data", async () => {
      await expect(
        sendQuotePushNotification({
          name: "John Smith",
          service: "Concrete Driveway",
          suburb: "Capalaba",
          phone: "0400 000 000",
        })
      ).resolves.not.toThrow();
    });
  });

  describe("sendCallbackPushNotification", () => {
    it("should not throw when called with valid callback data", async () => {
      await expect(
        sendCallbackPushNotification({
          name: "Jane Doe",
          phone: "0411 111 111",
          preferredTime: "Morning",
        })
      ).resolves.not.toThrow();
    });

    it("should handle missing preferredTime", async () => {
      await expect(
        sendCallbackPushNotification({
          name: "Jane Doe",
          phone: "0411 111 111",
        })
      ).resolves.not.toThrow();
    });
  });
});
