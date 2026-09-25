import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function projectPath(relativePath: string) {
  return resolve(__dirname, "..", relativePath);
}

function source(relativePath: string) {
  const path = projectPath(relativePath);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

const home = source("client/src/pages/Home.tsx");
const hero = source("client/src/components/HeroSection.tsx");
const callback = source("client/src/components/MiniQuoteForm.tsx");
const decision = source("client/src/components/ContactDecisionPanel.tsx");
const serviceArea = source("client/src/components/ServiceAreaGrid.tsx");
const planning = source("client/src/components/ProjectPlanningBanner.tsx");
const wizard = source("client/src/components/quote/ComprehensiveQuoteWizard.tsx");
const indexHtml = source("client/index.html");
const worker = source("client/public/_worker.js");
const seoManifest = source("client/public/seo-manifest.js");
const trustBar = source("client/src/components/TrustBar.tsx");
const about = source("client/src/components/AboutSection.tsx");
const processSection = source("client/src/components/ProcessSection.tsx");
const reasons = source("client/src/components/WhyChooseUs.tsx");
const services = source("client/src/components/ServicesSection.tsx");
const faq = source("client/src/components/FAQSection.tsx");
const gallery = source("client/src/components/ProjectGallery.tsx");
const beforeAfter = source("client/src/components/BeforeAfterSection.tsx");
const footer = source("client/src/components/Footer.tsx");
const getQuote = source("client/src/pages/GetQuote.tsx");
const seoHead = source("client/src/components/SEOHead.tsx");

const homepageSources = [
  home,
  hero,
  callback,
  decision,
  serviceArea,
  planning,
  trustBar,
  about,
  processSection,
  reasons,
  services,
  faq,
  gallery,
  beforeAfter,
  footer,
].join("\n");

describe("Release 1 homepage funnel consolidation", () => {
  it("replaces the lower-page quote form and unreliable homepage widgets", () => {
    expect(existsSync(projectPath("client/src/components/ContactDecisionPanel.tsx"))).toBe(true);
    expect(existsSync(projectPath("client/src/components/ServiceAreaGrid.tsx"))).toBe(true);
    expect(existsSync(projectPath("client/src/components/ProjectPlanningBanner.tsx"))).toBe(true);

    expect(home).toContain('import ContactDecisionPanel from "@/components/ContactDecisionPanel"');
    expect(home).toContain('import ServiceAreaGrid from "@/components/ServiceAreaGrid"');
    expect(home).toContain('import ProjectPlanningBanner from "@/components/ProjectPlanningBanner"');
    expect(home).not.toContain('import ContactSection from "@/components/ContactSection"');
    expect(home).not.toContain('import SocialProofNotification from "@/components/SocialProofNotification"');
    expect(home).not.toContain('import ServiceAreaMap from "@/components/ServiceAreaMap"');
    expect(home).not.toContain('import SeasonalBanner from "@/components/SeasonalBanner"');
    expect(home).not.toContain('import TestimonialsSection from "@/components/TestimonialsSection"');
  });

  it("keeps the homepage outside the primary quote-conversion path", () => {
    expect(homepageSources).not.toContain("trackQuoteConversion");
    expect(decision).not.toMatch(/trpc\.quote|submitFormFallback|\/api\/quote-submit|type=["']file["']/);
    expect(decision).toContain('href="/get-quote"');
    expect(decision).toContain("Start detailed quote");
    expect(decision).toContain("Request a callback");

    const conversionCalls = wizard.match(/trackQuoteConversion\(/g) ?? [];
    expect(conversionCalls).toHaveLength(2);
  });

  it("keeps callback requests isolated and removes response-time promises", () => {
    expect(callback).toContain("trpc.callback.submit.useMutation");
    expect(callback).toContain("submitCallbackFallback");
    expect(callback).toContain("trackCallbackConversion(");
    expect(callback).not.toContain("trackQuoteConversion");
    expect(callback).toContain("Want to discuss your project?");
    expect(callback).toContain("We received your callback request");
    expect(callback).not.toMatch(/within 24 hours|60 seconds/i);
  });

  it("uses only factual evergreen homepage messaging", () => {
    expect(hero).toContain("Free on-site quotes · QBCC licence 15299707 · Brisbane & South East Queensland");
    expect(hero).not.toContain("getUrgencyText");
    expect(hero).not.toContain("QuoteCounter");
    expect(hero).not.toContain("trpc.quote.monthlyCount");
    expect(planning).toContain("Planning a driveway, slab or outdoor concrete project?");
    expect(planning).toContain("Add your site details and photos for a more useful first review.");

    expect(homepageSources).not.toMatch(
      /Bookings Almost Full|FILLING FAST|FALLBACK_ACTIVITY|500\+ Projects Completed|4\.9(?:\/5|-Star)|200\+|100% Client Satisfaction|within (?:24|48) hours|On Time, Every Time|no surprise delays|Written Warranty on All Work|zero subcontractor headaches|every job|every project|we can do it|highest standard|real photos from real jobs|fully insured|public liability|no hidden costs|best in the business|licensed and insured|insurance documentation/i
    );
    expect(about).not.toContain("AnimatedCounter");
    expect(trustBar).toContain("Five guided steps");
    expect(processSection).toContain("Detailed project request");
    expect(reasons).toContain("Site-specific planning");
  });

  it("uses a static linked service-area grid rather than the Maps proxy", () => {
    expect(serviceArea).toContain('href="/areas"');
    expect(serviceArea).toContain("Brisbane");
    expect(serviceArea).toContain("Logan");
    expect(serviceArea).toContain("Ipswich");
    expect(serviceArea).toContain("Moreton Bay");
    expect(serviceArea).not.toMatch(/MapView|google\.maps|@\/components\/Map|makeRequest/);
  });

  it("emits no unaudited aggregate rating or review structured data", () => {
    expect(home).not.toContain("aggregateRating");
    expect(home).not.toMatch(/\breview\s*:/);
    expect(indexHtml).not.toContain('"aggregateRating"');
    expect(indexHtml).not.toContain('"review"');
  });

  it("keeps preview and immutable hosts out of the search index", () => {
    expect(indexHtml).toContain('<meta name="robots" content="noindex, nofollow"');
    expect(home).toContain("isCustomerWebsiteHost");
    expect(home).not.toContain("CUSTOMER_HOSTS.has");
    expect(home).toContain("noindex={noindex}");
    expect(worker).toContain("CUSTOMER_WEBSITE_HOSTS");
    expect(worker).toContain('headers.set("X-Robots-Tag", "noindex, nofollow")');
    expect(seoManifest).toContain("robotsOverride");
    expect(seoHead).toContain("isCustomerWebsiteHost");
    expect(seoHead).toContain("effectiveNoindex");
  });

  it("preserves the approved hero media and prefill handoff", () => {
    expect(hero).toContain("MOBILE_HERO_POSTER");
    expect(hero).toContain("HERO_VIDEO_WEBM");
    expect(hero).toContain("HERO_VIDEO_MP4");
    expect(hero).toContain("saveQuoteDraft(");
    expect(hero).toContain('window.location.assign("/get-quote")');
    expect(hero).not.toMatch(/trpc\.quote\.submit|submitFormFallback|\/api\/quote-submit/);
  });

  it("uses factual trust badges on the unchanged five-step quote route", () => {
    expect(getQuote).not.toMatch(/4\.9 Google rating|Response within 24 hours/i);
    expect(getQuote).toContain("Five guided steps");
    expect(getQuote).toContain("Optional site photos");
    expect(getQuote).toContain("<ComprehensiveQuoteWizard />");
  });
});
