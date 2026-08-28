/**
 * Tracking Audit Tests
 * Verifies that all pages with tel: links have trackPhoneCallClick,
 * all conversion events pass enhanced data, and abandoned quote tracking
 * is present on key forms.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const CLIENT_SRC = path.resolve(__dirname, "../client/src");

// Helper: read a component file
function readComponent(filePath: string): string {
  const fullPath = path.resolve(CLIENT_SRC, filePath);
  return fs.readFileSync(fullPath, "utf-8");
}

// Helper: find all .tsx files recursively
function findTsxFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTsxFiles(fullPath));
    } else if (entry.name.endsWith(".tsx")) {
      results.push(fullPath);
    }
  }
  return results;
}

describe("Phone Call Tracking Coverage", () => {
  it("every file with tel: links must import trackPhoneCallClick", () => {
    const allTsx = findTsxFiles(CLIENT_SRC);
    const filesWithTel = allTsx.filter((f) => {
      const content = fs.readFileSync(f, "utf-8");
      return content.includes('href="tel:');
    });

    const missing: string[] = [];
    for (const f of filesWithTel) {
      const content = fs.readFileSync(f, "utf-8");
      if (!content.includes("trackPhoneCallClick")) {
        missing.push(path.relative(CLIENT_SRC, f));
      }
    }

    expect(missing).toEqual([]);
  });

  it("every tel: link element must have onClick trackPhoneCallClick", () => {
    const allTsx = findTsxFiles(CLIENT_SRC);
    const filesWithTel = allTsx.filter((f) => {
      const content = fs.readFileSync(f, "utf-8");
      return content.includes('href="tel:');
    });

    const issues: string[] = [];
    for (const f of filesWithTel) {
      const content = fs.readFileSync(f, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('href="tel:')) {
          // Check if onClick is on the same line or within 3 lines before/after
          const context = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 4)).join("\n");
          if (!context.includes("trackPhoneCallClick")) {
            issues.push(`${path.relative(CLIENT_SRC, f)}:${i + 1}`);
          }
        }
      }
    }

    expect(issues).toEqual([]);
  });

  const pagesWithPhoneLinks = [
    "pages/ServicePage.tsx",
    "pages/SuburbPage.tsx",
    "pages/ReviewsPage.tsx",
    "pages/ServiceAreasPage.tsx",
    "pages/CostCalculator.tsx",
    "pages/BeforeAfterGallery.tsx",
    "pages/ProjectsPage.tsx",
    "components/quote/ComprehensiveQuoteWizard.tsx",
    "pages/ReferralPage.tsx",
    "pages/GuidePage.tsx",
    "pages/PrivacyPolicy.tsx",
    "pages/TermsOfService.tsx",
    "pages/FAQPage.tsx",
    "components/ContactSection.tsx",
    "components/HeroSection.tsx",
    "components/Footer.tsx",
  ];

  for (const page of pagesWithPhoneLinks) {
    it(`${page} has trackPhoneCallClick imported`, () => {
      const content = readComponent(page);
      expect(content).toContain("trackPhoneCallClick");
    });
  }
});

describe("Enhanced Conversion Data", () => {
  it("ContactSection passes enhanced data to trackQuoteConversion", () => {
    const content = readComponent("components/ContactSection.tsx");
    // Should pass email, phone, name
    expect(content).toMatch(/trackQuoteConversion\(\s*\{[^}]*email:/);
    expect(content).toMatch(/trackQuoteConversion\(\s*\{[^}]*phone:/);
    expect(content).toMatch(/trackQuoteConversion\(\s*\{[^}]*name:/);
  });

  it("HeroSection hands prospects into the detailed wizard without recording a completed conversion", () => {
    const content = readComponent("components/HeroSection.tsx");
    expect(content).toContain("saveQuoteDraft");
    expect(content).toContain('/get-quote');
    expect(content).not.toContain("trackQuoteConversion");
  });

  it("ComprehensiveQuoteWizard passes enhanced data to trackQuoteConversion", () => {
    const content = readComponent("components/quote/ComprehensiveQuoteWizard.tsx");
    expect(content).toMatch(/trackQuoteConversion\(\s*\{[^}]*email:/);
    expect(content).toMatch(/trackQuoteConversion\(\s*\{[^}]*phone:/);
    expect(content).toMatch(/trackQuoteConversion\(\s*\{[^}]*name:/);
  });

  it("LandingPage hands paid prospects into the detailed wizard without recording a completed conversion", () => {
    const content = readComponent("pages/LandingPage.tsx");
    expect(content).toContain("saveQuoteDraft");
    expect(content).toContain('/get-quote');
    expect(content).not.toContain("trackQuoteConversion");
  });

  it("BlogQuoteCTA passes enhanced data to trackQuoteConversion", () => {
    const content = readComponent("components/BlogQuoteCTA.tsx");
    // Should pass name and phone (no email field in this form)
    expect(content).toMatch(/trackQuoteConversion\(\s*\{[^}]*name:/);
    expect(content).toMatch(/trackQuoteConversion\(\s*\{[^}]*phone:/);
  });

  it("CallbackWidget passes enhanced data to trackCallbackConversion", () => {
    const content = readComponent("components/CallbackWidget.tsx");
    expect(content).toMatch(/trackCallbackConversion\(\s*\{[^}]*name:/);
    expect(content).toMatch(/trackCallbackConversion\(\s*\{[^}]*phone:/);
  });

  it("ReferralPage passes enhanced data to trackReferralSubmission", () => {
    const content = readComponent("pages/ReferralPage.tsx");
    expect(content).toMatch(/trackReferralSubmission\(\s*\{/);
  });

  it("GuidePage passes enhanced data to trackGuideDownload", () => {
    const content = readComponent("pages/GuidePage.tsx");
    expect(content).toMatch(/trackGuideDownload\(\s*\{/);
  });
});

describe("Calculator Tracking", () => {
  it("CostCalculator imports and calls trackCalculatorUse", () => {
    const content = readComponent("pages/CostCalculator.tsx");
    expect(content).toContain("trackCalculatorUse");
    // Should pass service type and estimated value
    expect(content).toMatch(/trackCalculatorUse\(/);
  });
});

describe("Abandoned Quote Tracking", () => {
  it("ContactSection has abandoned quote tracking on email blur", () => {
    const content = readComponent("components/ContactSection.tsx");
    expect(content).toContain("abandonedQuote");
    expect(content).toContain("handleEmailBlur");
    expect(content).toContain("onBlur={handleEmailBlur}");
  });

  it("HeroSection does not capture or track personal contact details before the detailed quote", () => {
    const content = readComponent("components/HeroSection.tsx");
    expect(content).not.toContain('type="tel"');
    expect(content).not.toContain('type="email"');
    expect(content).not.toContain("abandonedQuote");
  });
});

describe("Google Ads Configuration", () => {
  it("gtag.js is loaded in index.html", () => {
    const indexHtml = fs.readFileSync(
      path.resolve(__dirname, "../client/index.html"),
      "utf-8"
    );
    expect(indexHtml).toContain("googletagmanager.com/gtag/js");
    expect(indexHtml).toContain("AW-18007005419");
  });

  it("enhanced conversions are enabled in gtag config", () => {
    const indexHtml = fs.readFileSync(
      path.resolve(__dirname, "../client/index.html"),
      "utf-8"
    );
    expect(indexHtml).toContain("allow_enhanced_conversions");
  });

  it("conversion labels are configurable via env vars", () => {
    const config = readComponent("lib/googleAdsConfig.ts");
    expect(config).toContain("VITE_GADS_LABEL_QUOTE");
    expect(config).toContain("VITE_GADS_LABEL_PHONE");
    expect(config).toContain("VITE_GADS_LABEL_CALLBACK");
    expect(config).toContain("VITE_GADS_LABEL_GUIDE");
    expect(config).toContain("VITE_GADS_LABEL_REFERRAL");
  });

  it("ConversionTracking normalizes AU phone numbers for enhanced conversions", () => {
    const tracking = readComponent("components/ConversionTracking.tsx");
    // Should convert 0xxx to +61xxx
    expect(tracking).toContain("+61");
    expect(tracking).toContain("phone_number");
  });

  it("ConversionTracking splits names into first_name and last_name", () => {
    const tracking = readComponent("components/ConversionTracking.tsx");
    expect(tracking).toContain("first_name");
    expect(tracking).toContain("last_name");
  });
});

describe("Meta Pixel Integration", () => {
  it("Meta Pixel script is loaded in index.html", () => {
    const indexHtml = fs.readFileSync(
      path.resolve(__dirname, "../client/index.html"),
      "utf-8"
    );
    expect(indexHtml).toContain("connect.facebook.net");
  });

  it("MetaPixelInit component is rendered in App.tsx", () => {
    const app = readComponent("App.tsx");
    expect(app).toContain("MetaPixelInit");
  });

  it("ConversionTracking fires Meta Pixel events alongside Google Ads", () => {
    const tracking = readComponent("components/ConversionTracking.tsx");
    // Quote conversion should fire Meta Pixel Lead event
    expect(tracking).toContain('fbq("track", "Lead"');
    // Phone call should fire Meta Pixel Contact event
    expect(tracking).toContain('fbq("track", "Contact"');
  });
});
