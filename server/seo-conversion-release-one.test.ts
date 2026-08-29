import { readFileSync } from "fs";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { afterEach, describe, expect, it, vi } from "vitest";

function readFile(relativePath: string): string {
  return readFileSync(resolve(__dirname, "..", relativePath), "utf-8");
}

describe("Release 1 lead classification", () => {
  const callbacks = [
    "client/src/components/MiniQuoteForm.tsx",
    "client/src/components/BlogQuoteCTA.tsx",
    "client/src/components/CallbackPopup.tsx",
  ];

  for (const file of callbacks) {
    it(`${file.split("/").pop()} submits through callback and never fires the quote label`, () => {
      const source = readFile(file);
      expect(source).toContain("trpc.callback.submit.useMutation");
      expect(source).toContain("trackCallbackConversion(");
      expect(source).not.toContain("trackQuoteConversion");
    });
  }

  it("keeps only complete quote forms on the primary quote conversion", () => {
    expect(readFile("client/src/components/quote/ComprehensiveQuoteWizard.tsx")).toContain("trackQuoteConversion(");
    expect(readFile("client/src/components/ContactSection.tsx")).toContain("trackQuoteConversion(");
  });

  it("uses a distinct secondary visualiser lead event", () => {
    const source = readFile("client/src/pages/Visualiser.tsx");
    expect(source).toContain("trackVisualiserLeadConversion(");
    expect(source).not.toContain("trackQuoteConversion");
  });

  it("keeps referral tracking non-biddable when no verified Ads action exists", () => {
    const tracking = readFile("client/src/components/ConversionTracking.tsx");
    const config = readFile("client/src/lib/googleAdsConfig.ts");
    const referral = tracking.match(/export function trackReferralSubmission[\s\S]*?\n}/)?.[0] ?? "";
    expect(referral).toContain('window.gtag!("event", "referral_submission"');
    expect(referral).not.toContain("CONVERSION_LABELS.REFERRAL");
    expect(referral).not.toContain('"event", "conversion"');
    expect(config).not.toContain("REFERRAL:");
  });

  it("delivers callback-only payloads through a dedicated Cloudflare handler", () => {
    const worker = readFile("client/public/_worker.js");
    const callbackRoute = worker.match(/\/\/ Route: Callback request[\s\S]*?\/\/ Legacy:/)?.[0] ?? "";
    expect(worker).toContain("async function handleCallbackSubmit");
    expect(callbackRoute).toContain("handleCallbackSubmit");
    expect(callbackRoute).not.toContain("handleQuoteSubmit");
  });
});

describe("Release 1 mobile message tracking", () => {
  const config = readFile("client/src/lib/googleAdsConfig.ts");
  const tracking = readFile("client/src/components/ConversionTracking.tsx");
  const sticky = readFile("client/src/components/StickyMobileCTA.tsx");

  it("uses the five verified secondary Google Ads labels and no placeholder suffixes", () => {
    expect(config).toContain("NL8kCPSE_ekcEOuxtIpD");
    expect(config).toContain("weRUCPeE_ekcEOuxtIpD");
    expect(config).toContain("26ZACIWn9OkcEOuxtIpD");
    expect(config).toContain("MyywCIin9OkcEOuxtIpD");
    expect(config).toContain("nv9wCKed_ekcEOuxtIpD");
    expect(config).not.toContain('"whatsapp_click"');
    expect(config).not.toContain('"sms_click"');
    expect(config).not.toContain('"callback_request"');
    expect(config).not.toContain('"guide_download"');
    expect(config).not.toContain('"visualiser_lead"');
  });

  it("tracks SMS and visualiser intent separately from submitted quotes", () => {
    expect(tracking).toContain("export function trackTextMessageClick");
    expect(tracking).toContain("CONVERSION_LABELS.SMS");
    expect(tracking).toContain("export function trackVisualiserLeadConversion");
    expect(tracking).toContain("CONVERSION_LABELS.VISUALISER");
  });

  it("offers Call, Text, WhatsApp and Quote on mobile", () => {
    expect(sticky).toContain('href="sms:0424463268');
    expect(sticky).toContain("trackTextMessageClick(");
    expect(sticky).toContain("Call");
    expect(sticky).toContain("Text");
    expect(sticky).toContain("WhatsApp");
    expect(sticky).toContain("Free Quote");
  });
});

describe("Release 1 guide delivery", () => {
  const worker = readFile("client/public/_worker.js");
  const guide = readFile("client/src/pages/GuidePage.tsx");

  it("provides Cloudflare guide routes backed by a dedicated handler", () => {
    expect(worker).toContain("async function handleGuideSubmit");
    expect(worker).toContain('path === "/api/trpc/guide.submit"');
    expect(worker).toContain('path === "/api/guide-submit"');
  });

  it("fires guide conversion only inside confirmed success handling", () => {
    const successBlock = guide.match(/onSuccess:[\s\S]*?onError:/)?.[0] ?? "";
    const submitBlock = guide.match(/const handleSubmit[\s\S]*?return \(/)?.[0] ?? "";
    expect(successBlock).toContain("trackGuideDownload(");
    expect(submitBlock).not.toContain("trackGuideDownload(");
  });
});

describe("Release 1 Worker lead delivery runtime", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("delivers an email-free callback through owner email, backup and Jotform without quote semantics", async () => {
    const requests: Array<{ url: string; body: string }> = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(input), body: String(init?.body ?? "") });
      return new Response('{"ok":true}', { status: 200, headers: { "Content-Type": "application/json" } });
    }));

    const workerUrl = `${pathToFileURL(resolve(__dirname, "../client/public/_worker.js")).href}?callback=${Date.now()}`;
    const { default: edgeWorker } = await import(workerUrl);
    const response = await edgeWorker.fetch(new Request("https://concreteconceptsgroup.com/api/callback-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.21" },
      body: JSON.stringify({
        name: "Runtime Callback",
        phone: "0424 111 222",
        suburb: "Morningside",
        leadSource: "release-one-runtime-test",
        page: "Runtime test",
        website: "",
        formStartedAt: Date.now() - 5_000,
      }),
    }), {
      RESEND_API_KEY: "test-resend-key",
      MANUS_BACKEND_URL: "https://backup.example.test",
      JOTFORM_FORM_ID: "test-jotform-id",
    }, { waitUntil: (_promise: Promise<unknown>) => undefined });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result).toMatchObject({
      success: true,
      message: "Callback request submitted",
      channels: { email: "sent", sheets: "logged", jotform: "logged" },
    });
    expect(requests.some(request => request.url.includes("api.resend.com") && request.body.includes("Callback Request"))).toBe(true);
    expect(requests.some(request => request.url.includes("/api/webhooks/lead-capture") && request.body.includes('"service":"Callback Request"'))).toBe(true);
    expect(requests.some(request => request.url.includes("submit.jotform.com") && request.body.includes("Callback+Request"))).toBe(true);
  });

  it("delivers the guide to owner, customer and backup before returning success", async () => {
    const requests: Array<{ url: string; body: string }> = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(input), body: String(init?.body ?? "") });
      return new Response('{"ok":true}', { status: 200, headers: { "Content-Type": "application/json" } });
    }));

    const workerUrl = `${pathToFileURL(resolve(__dirname, "../client/public/_worker.js")).href}?guide=${Date.now()}`;
    const { default: edgeWorker } = await import(workerUrl);
    const response = await edgeWorker.fetch(new Request("https://concreteconceptsgroup.com/api/guide-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Runtime Guide",
        email: "runtime-guide@example.com",
        phone: "",
        leadSource: "release-one-runtime-test",
        website: "",
        formStartedAt: Date.now() - 5_000,
      }),
    }), {
      RESEND_API_KEY: "test-resend-key",
      MANUS_BACKEND_URL: "https://backup.example.test",
    }, { waitUntil: (_promise: Promise<unknown>) => undefined });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result).toMatchObject({
      success: true,
      message: "Guide request submitted",
      channels: { email: "sent", customer: "sent", sheets: "logged" },
    });
    expect(requests.filter(request => request.url.includes("api.resend.com"))).toHaveLength(2);
    expect(requests.some(request => request.body.includes('"to":["info@concreteconceptsgroup.com"]'))).toBe(true);
    expect(requests.some(request => request.body.includes('"to":["runtime-guide@example.com"]'))).toBe(true);
    expect(requests.some(request => request.url.includes("/api/webhooks/lead-capture") && request.body.includes('"service":"Homeowner Guide Download"'))).toBe(true);
  });
});

describe("Release 1 technical SEO", () => {
  const sitemap = readFile("client/public/sitemap.xml");
  const indexHtml = readFile("client/index.html");
  const worker = readFile("client/public/_worker.js");

  it("submits only the 202 indexable routes and excludes paid noindex pages", async () => {
    const moduleUrl = `${pathToFileURL(resolve(__dirname, "../client/public/seo-manifest.js")).href}?test=${Date.now()}`;
    const { filterPublicSitemap } = await import(moduleUrl);
    const publicSitemap = filterPublicSitemap(sitemap);
    expect((publicSitemap.match(/<url>/g) || []).length).toBe(202);
    expect(publicSitemap).not.toContain("/lp/");
  });

  it("executes edge metadata with the production canonical origin", async () => {
    const moduleUrl = `${pathToFileURL(resolve(__dirname, "../client/public/seo-manifest.js")).href}?origin=${Date.now()}`;
    const { getSeoMetadata } = await import(moduleUrl);
    expect(getSeoMetadata("/get-quote").canonical).toBe("https://concreteconceptsgroup.com/get-quote");
    expect(getSeoMetadata("/areas/carindale").canonical).toBe("https://concreteconceptsgroup.com/areas/carindale");
  });

  it("removes self-controlled review schema from the LocalBusiness shell", () => {
    expect(indexHtml).not.toContain('"aggregateRating"');
    expect(indexHtml).not.toContain('"review":');
  });

  it("rewrites route metadata at the Cloudflare edge and noindexes paid landing pages", () => {
    expect(worker).toContain("applySeoMetadata");
    expect(worker).toContain("seo-manifest.json");
    expect(worker).toContain("X-Robots-Tag");
    expect(worker).toContain('path.startsWith("/lp/")');
  });

  it("applies SEO and sitemap rewrites through the actual Worker GET path", async () => {
    const workerUrl = `${pathToFileURL(resolve(__dirname, "../client/public/_worker.js")).href}?runtime=${Date.now()}`;
    const originalCaches = (globalThis as typeof globalThis & { caches?: unknown }).caches;
    (globalThis as typeof globalThis & { caches: unknown }).caches = {
      default: {
        match: async () => undefined,
        put: async () => undefined,
      },
    };

    try {
      const { default: edgeWorker } = await import(workerUrl);
      const indexHtml = readFile("client/index.html");
      const sitemapXml = readFile("client/public/sitemap.xml");
      const env = {
        ASSETS: {
          fetch: async (request: Request) => request.url.endsWith("/sitemap.xml")
            ? new Response(sitemapXml, { headers: { "Content-Type": "application/xml" } })
            : new Response(indexHtml, { headers: { "Content-Type": "text/html" } }),
        },
      };
      const ctx = { waitUntil: (_promise: Promise<unknown>) => undefined };

      const areaResponse = await edgeWorker.fetch(new Request("https://concreteconceptsgroup.com/areas/carindale"), env, ctx);
      const areaHtml = await areaResponse.text();
      expect(areaHtml).toContain("<title>Concreting Carindale | Local Concrete Quotes from CCG</title>");
      expect(areaHtml).toContain('<link rel="canonical" href="https://concreteconceptsgroup.com/areas/carindale">');

      const paidResponse = await edgeWorker.fetch(new Request("https://concreteconceptsgroup.com/lp/concrete-driveway-ascot"), env, ctx);
      expect(paidResponse.headers.get("X-Robots-Tag")).toBe("noindex, follow");

      const sitemapResponse = await edgeWorker.fetch(new Request("https://concreteconceptsgroup.com/sitemap.xml"), env, ctx);
      const publicSitemap = await sitemapResponse.text();
      const extractUrls = (xml: string) => Array.from(
        xml.matchAll(/<url>[\s\S]*?<loc>(https:\/\/concreteconceptsgroup\.com\/[^<]*)<\/loc>[\s\S]*?<\/url>/g),
        match => match[1]
      );
      const originalUrls = extractUrls(sitemapXml);
      const publicUrls = extractUrls(publicSitemap);
      const removedUrls = originalUrls.filter(url => !publicUrls.includes(url));
      expect(publicUrls).toHaveLength(202);
      expect(removedUrls).toHaveLength(76);
      expect(removedUrls.every(url => url.includes("/lp/"))).toBe(true);
      expect(publicSitemap).toContain("/services/concrete-driveways-brisbane");
      expect(publicSitemap).toContain("/areas/carindale");
      expect(publicSitemap).not.toContain("/lp/");
    } finally {
      (globalThis as typeof globalThis & { caches?: unknown }).caches = originalCaches;
    }
  });

  it("ships an edge SEO manifest for core, service, suburb and blog routes", () => {
    const manifest = readFile("client/public/seo-manifest.json");
    expect(manifest).toContain('"/get-quote"');
    expect(manifest).toContain('"/services/concrete-driveways-brisbane"');
    expect(manifest).toContain('"/areas/carindale"');
    expect(manifest).toContain('"/blog/');
  });

  it("does not ship fabricated paid-page testimonial records", () => {
    const landing = readFile("client/src/pages/LandingPage.tsx");
    expect(landing).not.toMatch(/testimonials:\s*\[/);
  });
});
