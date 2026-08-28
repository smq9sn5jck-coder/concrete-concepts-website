import { describe, it, expect } from "vitest";
import fs from "fs";

describe("301 Redirect: concreteconcepts.org → concreteconceptsgroup.com", () => {
  it("server entry has redirect middleware for concreteconcepts.org", () => {
    const serverCode = fs.readFileSync("server/_core/index.ts", "utf-8");
    expect(serverCode).toContain("concreteconcepts.org");
    expect(serverCode).toContain("www.concreteconcepts.org");
    expect(serverCode).toContain("concreteconceptsgroup.com");
    expect(serverCode).toContain("301");
  });

  it("redirect middleware is placed before body parser and routes", () => {
    const serverCode = fs.readFileSync("server/_core/index.ts", "utf-8");
    // Find the actual middleware usage (app.use with redirect), not import references
    const redirectIndex = serverCode.indexOf("// 301 redirect");
    const bodyParserIndex = serverCode.indexOf("express.json");
    const oauthIndex = serverCode.indexOf("registerOAuthRoutes(app)");
    const trpcIndex = serverCode.indexOf("/api/trpc");

    // Redirect must come before all other middleware
    expect(redirectIndex).toBeGreaterThan(-1);
    expect(redirectIndex).toBeLessThan(bodyParserIndex);
    expect(redirectIndex).toBeLessThan(oauthIndex);
    expect(redirectIndex).toBeLessThan(trpcIndex);
  });

  it("redirect preserves the original URL path", () => {
    const serverCode = fs.readFileSync("server/_core/index.ts", "utf-8");
    // Should use req.originalUrl to preserve the full path + query string
    expect(serverCode).toContain("req.originalUrl");
    expect(serverCode).toContain("https://concreteconceptsgroup.com${req.originalUrl}");
  });

  it("redirect uses raw Host header to work behind proxy", () => {
    const serverCode = fs.readFileSync("server/_core/index.ts", "utf-8");
    // Extract the redirect middleware block
    const redirectBlock = serverCode.substring(
      serverCode.indexOf("// 301 redirect"),
      serverCode.indexOf("// 301 redirects: Consolidate")
    );
    // Should use x-forwarded-host or req.headers.host (not req.hostname which may be rewritten by proxy)
    expect(redirectBlock).toContain("x-forwarded-host");
    expect(redirectBlock).toContain("req.headers.host");
    // Should only match concreteconcepts.org variants
    expect(redirectBlock).toContain('"concreteconcepts.org"');
    expect(redirectBlock).toContain('"www.concreteconcepts.org"');
    // Should call next() for non-matching hosts
    expect(redirectBlock).toContain("next()");
  });

  it("trust proxy is enabled for correct header forwarding", () => {
    const serverCode = fs.readFileSync("server/_core/index.ts", "utf-8");
    expect(serverCode).toContain('"trust proxy"');
  });
});
