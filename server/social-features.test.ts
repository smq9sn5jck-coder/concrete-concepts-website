import { describe, it, expect } from "vitest";
import { isMetaConfigured, isInstagramConfigured, generateHashtags } from "./metaApi";

describe("Meta API Integration", () => {
  describe("Configuration checks", () => {
    it("isMetaConfigured returns false when env vars not set", () => {
      // In test environment, these env vars are not set
      expect(isMetaConfigured()).toBe(false);
    });

    it("isInstagramConfigured returns false when env vars not set", () => {
      expect(isInstagramConfigured()).toBe(false);
    });
  });

  describe("Hashtag generation", () => {
    it("generates base hashtags without service or suburb", () => {
      const hashtags = generateHashtags();
      expect(hashtags).toContain("#ConcreteConceptsGroup");
      expect(hashtags).toContain("#BrisbaneConcreter");
      expect(hashtags).toContain("#ConcreteBrisbane");
      expect(hashtags).toContain("#SEQConcreting");
      expect(hashtags).toContain("#QBCCLicensed");
    });

    it("adds driveway hashtags for driveway service", () => {
      const hashtags = generateHashtags("Concrete Driveway", undefined);
      expect(hashtags).toContain("#ConcreteDriveway");
      expect(hashtags).toContain("#DrivewayBrisbane");
    });

    it("adds slab hashtags for slab service", () => {
      const hashtags = generateHashtags("House Slab", undefined);
      expect(hashtags).toContain("#ConcreteSlab");
      expect(hashtags).toContain("#HouseSlab");
    });

    it("adds retaining wall hashtags", () => {
      const hashtags = generateHashtags("Retaining Wall", undefined);
      expect(hashtags).toContain("#RetainingWall");
      expect(hashtags).toContain("#RetainingWallBrisbane");
    });

    it("adds pool hashtags", () => {
      const hashtags = generateHashtags("Pool Surround", undefined);
      expect(hashtags).toContain("#PoolSurround");
      expect(hashtags).toContain("#PoolDeck");
    });

    it("adds exposed aggregate hashtags", () => {
      const hashtags = generateHashtags("Exposed Aggregate", undefined);
      expect(hashtags).toContain("#ExposedAggregate");
      expect(hashtags).toContain("#DecorativeConcrete");
    });

    it("adds suburb-specific hashtags", () => {
      const hashtags = generateHashtags(undefined, "Pimpama");
      expect(hashtags).toContain("#Pimpama");
      expect(hashtags).toContain("#ConcreterPimpama");
    });

    it("handles suburb with spaces", () => {
      const hashtags = generateHashtags(undefined, "Upper Coomera");
      expect(hashtags).toContain("#UpperCoomera");
      expect(hashtags).toContain("#ConcreterUpperCoomera");
    });

    it("combines service and suburb hashtags", () => {
      const hashtags = generateHashtags("Concrete Driveway", "Rochedale");
      expect(hashtags).toContain("#ConcreteDriveway");
      expect(hashtags).toContain("#Rochedale");
      expect(hashtags).toContain("#ConcreterRochedale");
      expect(hashtags).toContain("#ConcreteConceptsGroup");
    });
  });
});

describe("Social Posts Schema", () => {
  it("social_posts table exists in schema", async () => {
    const { socialPosts } = await import("../drizzle/schema");
    expect(socialPosts).toBeDefined();
    // Check key columns exist
    expect(socialPosts.id).toBeDefined();
    expect(socialPosts.caption).toBeDefined();
    expect(socialPosts.imageUrl).toBeDefined();
    expect(socialPosts.platforms).toBeDefined();
    expect(socialPosts.status).toBeDefined();
    expect(socialPosts.scheduledAt).toBeDefined();
    expect(socialPosts.publishedAt).toBeDefined();
    expect(socialPosts.fbPostId).toBeDefined();
    expect(socialPosts.igPostId).toBeDefined();
    expect(socialPosts.errorMessage).toBeDefined();
    expect(socialPosts.postType).toBeDefined();
    expect(socialPosts.blogPostId).toBeDefined();
    expect(socialPosts.createdAt).toBeDefined();
    expect(socialPosts.updatedAt).toBeDefined();
  });
});

describe("WhyChooseUs Component", () => {
  it("WhyChooseUs component file exists", async () => {
    const fs = await import("fs");
    const exists = fs.existsSync("client/src/components/WhyChooseUs.tsx");
    expect(exists).toBe(true);
  });

  it("WhyChooseUs is imported in Home.tsx", async () => {
    const fs = await import("fs");
    const homeContent = fs.readFileSync("client/src/pages/Home.tsx", "utf-8");
    expect(homeContent).toContain("WhyChooseUs");
  });
});

describe("OG Social Sharing Image", () => {
  it("SEOHead manages og:image dynamically per page with CDN URL", async () => {
    const fs = await import("fs");
    const seoHead = fs.readFileSync("client/src/components/SEOHead.tsx", "utf-8");
    // og:image is now managed by SEOHead component per page, not hardcoded in index.html
    expect(seoHead).toContain('og:image');
    expect(seoHead).toContain("og-social-share");
  });

  it("SEOHead has default OG image", async () => {
    const fs = await import("fs");
    const seoHead = fs.readFileSync("client/src/components/SEOHead.tsx", "utf-8");
    expect(seoHead).toContain("og-social-share");
  });

  it("OG image dimensions are specified", async () => {
    const fs = await import("fs");
    const html = fs.readFileSync("client/index.html", "utf-8");
    expect(html).toContain('property="og:image:width"');
    expect(html).toContain('property="og:image:height"');
    expect(html).toContain("1200");
    expect(html).toContain("630");
  });
});

describe("Social Media Admin Panel", () => {
  it("SocialMediaPanel component file exists", async () => {
    const fs = await import("fs");
    const exists = fs.existsSync("client/src/components/SocialMediaPanel.tsx");
    expect(exists).toBe(true);
  });

  it("AdminDashboard has Social tab", async () => {
    const fs = await import("fs");
    const admin = fs.readFileSync("client/src/pages/AdminDashboard.tsx", "utf-8");
    expect(admin).toContain("social");
    expect(admin).toContain("Social Media");
    expect(admin).toContain("SocialMediaPanel");
  });

  it("Meta API module exports all required functions", async () => {
    const metaApi = await import("./metaApi");
    expect(typeof metaApi.isMetaConfigured).toBe("function");
    expect(typeof metaApi.isInstagramConfigured).toBe("function");
    expect(typeof metaApi.postToFacebook).toBe("function");
    expect(typeof metaApi.postToInstagram).toBe("function");
    expect(typeof metaApi.postToBothPlatforms).toBe("function");
    expect(typeof metaApi.generateHashtags).toBe("function");
  });
});
