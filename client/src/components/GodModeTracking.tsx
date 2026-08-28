/*
  GOD MODE TRACKING
  Tracks every meaningful user interaction to understand WHY visitors aren't converting.
  
  Events tracked:
  1. Form Interactions: field_focus, field_complete, form_start, form_abandon
  2. Scroll Depth: scroll_25, scroll_50, scroll_75, scroll_100
  3. CTA Clicks: cta_click with button text + location
  4. Engagement Time: engaged_time at 15s, 30s, 60s, 120s, 300s
  5. Section Visibility: which sections users actually see
  
  All events fire to both Google Ads (gtag) and Meta Pixel (fbq).
*/

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _godModeInitialized?: boolean;
  }
}

// ─── Form Interaction Tracking ──────────────────────────────────────────────

let formStartTracked = false;

export function trackFormFieldFocus(fieldName: string, formName: string) {
  if (!formStartTracked) {
    formStartTracked = true;
    fireEvent("form_start", {
      form_name: formName,
      first_field: fieldName,
    });
  }
  fireEvent("field_focus", {
    form_name: formName,
    field_name: fieldName,
  });
}

export function trackFormFieldComplete(fieldName: string, formName: string) {
  fireEvent("field_complete", {
    form_name: formName,
    field_name: fieldName,
  });
}

export function trackFormAbandon(formName: string, fieldsCompleted: string[], lastField: string) {
  fireEvent("form_abandon", {
    form_name: formName,
    fields_completed: fieldsCompleted.join(","),
    last_field: lastField,
    fields_count: fieldsCompleted.length,
  });
}

// ─── CTA Click Tracking ────────────────────────────────────────────────────

export function trackCTAClick(buttonText: string, location: string, destination?: string) {
  fireEvent("cta_click", {
    button_text: buttonText,
    cta_location: location,
    destination: destination || "same_page",
  });
}

// ─── Scroll Depth Tracking (auto-initialized) ──────────────────────────────

function initScrollTracking() {
  const thresholds = [25, 50, 75, 100];
  const fired = new Set<number>();

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    for (const threshold of thresholds) {
      if (scrollPercent >= threshold && !fired.has(threshold)) {
        fired.add(threshold);
        fireEvent(`scroll_depth`, {
          percent: threshold,
          page: window.location.pathname,
        });
      }
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}

// ─── Engagement Time Tracking ───────────────────────────────────────────────

function initEngagementTracking() {
  const milestones = [15, 30, 60, 120, 300]; // seconds
  const fired = new Set<number>();
  let totalTime = 0;
  let isActive = true;
  let interval: ReturnType<typeof setInterval>;

  const handleVisibility = () => {
    isActive = document.visibilityState === "visible";
  };

  document.addEventListener("visibilitychange", handleVisibility);

  interval = setInterval(() => {
    if (!isActive) return;
    totalTime++;
    for (const milestone of milestones) {
      if (totalTime >= milestone && !fired.has(milestone)) {
        fired.add(milestone);
        fireEvent("engaged_time", {
          seconds: milestone,
          page: window.location.pathname,
        });
      }
    }
  }, 1000);

  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}

// ─── Section Visibility Tracking ────────────────────────────────────────────

function initSectionTracking() {
  const sections = [
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "work", label: "Our Work Gallery" },
    { id: "transformations", label: "Before & After" },
    { id: "reviews", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Contact Form" },
  ];

  const seen = new Set<string>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !seen.has(entry.target.id)) {
          seen.add(entry.target.id);
          const section = sections.find((s) => s.id === entry.target.id);
          if (section) {
            fireEvent("section_view", {
              section_name: section.label,
              section_id: section.id,
              page: window.location.pathname,
            });
          }
        }
      }
    },
    { threshold: 0.3 }
  );

  // Observe after a short delay to let the page render
  setTimeout(() => {
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
  }, 1000);

  return () => observer.disconnect();
}

// ─── Core Event Dispatcher ──────────────────────────────────────────────────

function fireEvent(eventName: string, params: Record<string, unknown>) {
  // Google Ads / GA4
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      event_category: "god_mode",
      ...params,
    });
  }

  // Meta Pixel — custom events
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, params);
  }

  // Console log for debugging (remove in production if needed)
  if (process.env.NODE_ENV === "development") {
    console.log(`[GodMode] ${eventName}`, params);
  }
}

// ─── React Hook: Initialize All Tracking ────────────────────────────────────

export function useGodModeTracking() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || window._godModeInitialized) return;
    initialized.current = true;
    window._godModeInitialized = true;

    const cleanupScroll = initScrollTracking();
    const cleanupEngagement = initEngagementTracking();
    const cleanupSections = initSectionTracking();

    // Track page load
    fireEvent("page_load", {
      page: window.location.pathname,
      referrer: document.referrer || "direct",
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      device_type: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
    });

    return () => {
      cleanupScroll();
      cleanupEngagement();
      cleanupSections();
    };
  }, []);
}

// ─── Form Abandon Detection Hook ────────────────────────────────────────────

export function useFormAbandonDetection(
  formName: string,
  formData: Record<string, string>,
  isSubmitted: boolean
) {
  const lastFieldRef = useRef("");
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Track which fields have been filled
    const filledFields = Object.entries(formData)
      .filter(([, v]) => v.trim().length > 0)
      .map(([k]) => k);
    
    if (filledFields.length > 0) {
      hasStartedRef.current = true;
      lastFieldRef.current = filledFields[filledFields.length - 1];
    }
  }, [formData]);

  useEffect(() => {
    // On unmount or page leave, if form was started but not submitted, track abandon
    const handleBeforeUnload = () => {
      if (hasStartedRef.current && !isSubmitted) {
        const filledFields = Object.entries(formData)
          .filter(([, v]) => v.trim().length > 0)
          .map(([k]) => k);
        trackFormAbandon(formName, filledFields, lastFieldRef.current);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Also fire on component unmount (SPA navigation)
      if (hasStartedRef.current && !isSubmitted) {
        const filledFields = Object.entries(formData)
          .filter(([, v]) => v.trim().length > 0)
          .map(([k]) => k);
        trackFormAbandon(formName, filledFields, lastFieldRef.current);
      }
    };
  }, [formName, isSubmitted]); // eslint-disable-line react-hooks/exhaustive-deps
}
