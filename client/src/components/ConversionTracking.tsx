/*
  Conversion Tracking Utilities
  Google Ads (AW-18007005419): conversions, enhanced conversions, remarketing, dynamic params
  Meta Pixel (Facebook/Instagram): Lead, Contact, ViewContent, PageView events

  All conversion labels are centralized in lib/googleAdsConfig.ts and configurable
  via VITE_GADS_LABEL_* environment variables.
*/

import { GOOGLE_ADS_ID, CONVERSION_LABELS } from "@/lib/googleAdsConfig";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

// ─── Google Ads Enhanced Conversions ─────────────────────────────────────────
// Sends hashed first-party data (email, phone) alongside conversion events
// so Google can match conversions to ad clicks more accurately.

interface EnhancedConversionData {
  email?: string;
  phone?: string;
  name?: string;
}

function waitForGtag(callback: () => void) {
  if (typeof window === "undefined") return;
  if (window.gtag) { callback(); return; }
  // Retry for up to 10 seconds after page load
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (window.gtag) { clearInterval(interval); callback(); }
    if (attempts > 20) clearInterval(interval);
  }, 500);
}

function pushEnhancedConversionData(data: EnhancedConversionData) {
  if (typeof window === "undefined" || !window.gtag) return;

  const enhancedData: Record<string, string> = {};
  if (data.email) enhancedData.email = data.email.trim().toLowerCase();
  if (data.phone) {
    // Normalize AU phone: strip spaces, add +61 prefix
    let phone = data.phone.replace(/[\s\-()]/g, "");
    if (phone.startsWith("0")) phone = "+61" + phone.slice(1);
    enhancedData.phone_number = phone;
  }
  if (data.name) {
    const parts = data.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      enhancedData.first_name = parts[0];
      enhancedData.last_name = parts.slice(1).join(" ");
    } else {
      enhancedData.first_name = parts[0];
    }
  }
  enhancedData.country = "AU";

  // Push enhanced conversion data to the data layer
  window.gtag("set", "user_data", enhancedData);
}

// ─── Google Ads Remarketing / Dynamic Parameters ─────────────────────────────

interface RemarketingParams {
  serviceType?: string;
  pageCategory?: "homepage" | "service" | "suburb" | "calculator" | "blog" | "gallery" | "reviews" | "landing_page" | "contact" | "guide" | "referral" | "projects";
  suburb?: string;
  value?: number;
}

export function trackRemarketingEvent(params: RemarketingParams) {
  waitForGtag(() => {
    window.gtag!("event", "remarketing_view", {
      send_to: GOOGLE_ADS_ID,
      dynx_itemid: params.serviceType || undefined,
      dynx_pagetype: params.pageCategory || "other",
      dynx_totalvalue: params.value || undefined,
      custom_suburb: params.suburb || undefined,
    });
  });
}

// ─── Conversion Events ───────────────────────────────────────────────────────

/**
 * Fire Google Ads + Meta Pixel conversion when a quote form is submitted.
 * Includes enhanced conversion data for better attribution.
 * Average quote value for a concreter: $3,000–$8,000. We use $5,000 as default.
 */
export function trackQuoteConversion(userData?: EnhancedConversionData, value?: number) {
  const conversionValue = value || 5000;

  // Enhanced conversions — push user data before firing
  if (userData) {
    pushEnhancedConversionData(userData);
  }

  waitForGtag(() => {
    window.gtag!("event", "conversion", {
      send_to: CONVERSION_LABELS.QUOTE_SUBMISSION,
      value: conversionValue,
      currency: "AUD",
      transaction_id: `QR-${Date.now()}`,
    });
    console.log("[Tracking] Google Ads quote conversion fired (enhanced)");
  });

  // Meta Pixel — Lead event with value
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", {
      content_name: "Quote Request",
      content_category: "Concreting Services",
      currency: "AUD",
      value: conversionValue,
    });
    console.log("[Tracking] Meta Pixel Lead event fired");
  }
}

/**
 * Track phone call clicks as conversions.
 * Average phone enquiry value: $3,000 (slightly lower than form — less qualified).
 */
export function trackPhoneCallClick() {
  waitForGtag(() => {
    window.gtag!("event", "conversion", {
      send_to: CONVERSION_LABELS.PHONE_CALL,
      value: 3000,
      currency: "AUD",
    });
    console.log("[Tracking] Google Ads phone call conversion fired");
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Contact", {
      content_name: "Phone Call Click",
    });
  }
}

/**
 * Track WhatsApp clicks as conversions
 */
export function trackWhatsAppClick() {
  waitForGtag(() => {
    window.gtag!("event", "conversion", {
      send_to: CONVERSION_LABELS.WHATSAPP,
      value: 2000,
      currency: "AUD",
    });
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Contact", {
      content_name: "WhatsApp Click",
    });
  }
}

/** Track SMS composer opens as a secondary contact-intent event. */
export function trackTextMessageClick() {
  waitForGtag(() => {
    window.gtag!("event", "conversion", {
      send_to: CONVERSION_LABELS.SMS,
      value: 1,
      currency: "AUD",
    });
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Contact", {
      content_name: "SMS Click",
    });
  }
}

/** Track delivered visualiser leads separately from complete quote submissions. */
export function trackVisualiserLeadConversion(userData?: EnhancedConversionData) {
  if (userData) pushEnhancedConversionData(userData);

  waitForGtag(() => {
    window.gtag!("event", "conversion", {
      send_to: CONVERSION_LABELS.VISUALISER,
      value: 1,
      currency: "AUD",
      transaction_id: `VL-${Date.now()}`,
    });
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Contact", {
      content_name: "AI Visualiser Lead",
    });
  }
}

/**
 * Track calculator usage — high-intent engagement signal
 */
export function trackCalculatorUse(serviceType?: string, estimatedValue?: number) {
  waitForGtag(() => {
    window.gtag!("event", "calculator_use", {
      event_category: "engagement",
      event_label: serviceType || "Cost Calculator",
      value: estimatedValue || 0,
    });
  });

  // Meta Pixel — ViewContent for calculator (shows intent)
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: "Cost Calculator",
      content_category: serviceType || "General",
      currency: "AUD",
      value: estimatedValue || 0,
    });
  }
}

/**
 * Track callback request as conversion ("Call Me Back" widget)
 */
export function trackCallbackConversion(userData?: EnhancedConversionData) {
  if (userData) {
    pushEnhancedConversionData(userData);
  }

  waitForGtag(() => {
    window.gtag!("event", "conversion", {
      send_to: CONVERSION_LABELS.CALLBACK,
      value: 4000,
      currency: "AUD",
    });
    console.log("[Tracking] Google Ads callback conversion fired (enhanced)");
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Contact", {
      content_name: "Callback Request",
    });
  }
}

/**
 * Track page view for specific landing pages
 */
export function trackLandingPageView(pageName: string) {
  waitForGtag(() => {
    window.gtag!("event", "landing_page_view", {
      page_title: pageName,
      page_location: window.location.href,
      send_to: GOOGLE_ADS_ID,
    });
  });

  // Meta Pixel — ViewContent for landing pages
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: pageName,
      content_category: "Landing Page",
    });
  }
}

/**
 * Track email link clicks
 */
export function trackEmailClick() {
  waitForGtag(() => {
    window.gtag!("event", "email_click", {
      event_category: "engagement",
      event_label: "Email Link Click",
    });
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Contact", {
      content_name: "Email Click",
    });
  }
}

/**
 * Track service page views for remarketing audiences
 */
export function trackServicePageView(serviceName: string) {
  waitForGtag(() => {
    window.gtag!("event", "view_item", {
      send_to: GOOGLE_ADS_ID,
      items: [{
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        category: "Concreting Services",
      }],
    });
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: serviceName,
      content_category: "Concreting Services",
      content_type: "service",
    });
  }
}

/**
 * Track blog post views for content engagement remarketing
 */
export function trackBlogPostView(postTitle: string, category: string) {
  waitForGtag(() => {
    window.gtag!("event", "view_item", {
      send_to: GOOGLE_ADS_ID,
      items: [{
        name: postTitle,
        category: category,
      }],
    });
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: postTitle,
      content_category: category,
      content_type: "blog_post",
    });
  }
}

/**
 * Track social sharing actions
 */
export function trackSocialShare(platform: string, contentType: string, contentName: string) {
  waitForGtag(() => {
    window.gtag!("event", "share", {
      method: platform,
      content_type: contentType,
      item_id: contentName,
    });
  });
}

/**
 * Track gallery/portfolio views — high intent signal
 */
export function trackGalleryView(projectName?: string) {
  waitForGtag(() => {
    window.gtag!("event", "view_item_list", {
      send_to: GOOGLE_ADS_ID,
      item_list_name: "Project Gallery",
      items: projectName ? [{ name: projectName }] : [],
    });
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: projectName || "Project Gallery",
      content_category: "Portfolio",
    });
  }
}

/**
 * Track guide download as a conversion — lead magnet capture.
 * Lower value than quote ($500) since it's top-of-funnel, but still a qualified lead.
 */
export function trackGuideDownload(userData?: EnhancedConversionData) {
  if (userData) {
    pushEnhancedConversionData(userData);
  }

  waitForGtag(() => {
    window.gtag!("event", "conversion", {
      send_to: CONVERSION_LABELS.GUIDE_DOWNLOAD,
      value: 500,
      currency: "AUD",
      transaction_id: `GD-${Date.now()}`,
    });
    console.log("[Tracking] Google Ads guide download conversion fired");
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", {
      content_name: "Homeowners Guide Download",
      content_category: "Lead Magnet",
      currency: "AUD",
      value: 500,
    });
    console.log("[Tracking] Meta Pixel guide download Lead event fired");
  }
}

/**
 * Track guide page view for remarketing audiences
 */
export function trackGuidePageView() {
  trackRemarketingEvent({
    pageCategory: "guide",
    serviceType: "homeowners_guide",
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: "Homeowners Guide to Concreting",
      content_category: "Lead Magnet",
    });
  }
}

/**
 * Track suburb page views for geo-targeted remarketing
 */
export function trackSuburbPageView(suburbName: string) {
  trackRemarketingEvent({
    pageCategory: "suburb",
    suburb: suburbName,
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: `Concreting ${suburbName}`,
      content_category: "Service Area",
    });
  }
}

/**
 * Track referral form submission
 */
export function trackReferralSubmission(userData?: EnhancedConversionData) {
  if (userData) {
    pushEnhancedConversionData(userData);
  }

  waitForGtag(() => {
    window.gtag!("event", "referral_submission", {
      event_category: "referral_program",
      event_label: "delivered_referral",
    });
    console.log("[Tracking] Referral analytics event fired");
  });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", {
      content_name: "Referral Submission",
      content_category: "Referral Program",
      currency: "AUD",
      value: 250,
    });
  }
}
