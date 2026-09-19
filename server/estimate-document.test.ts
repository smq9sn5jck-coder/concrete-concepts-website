import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { QUOTE_BRAND } from "../shared/estimator/brand";
import { generateCustomQuotePdf, generateQuotePdf } from "./quotePdf";

const lead = {
  name: "CCG Test Lead",
  phone: "0424 463 268",
  email: "test@example.com",
  suburb: "Eight Mile Plains",
  service: "Driveway",
  details: "Test-only driveway enquiry.",
  quoteId: 83,
};

describe("estimate document policy", () => {
  it("blocks the retired generic-rate PDF generator", () => {
    expect(() => generateQuotePdf(lead)).toThrow(/retired/i);
  });

  it("keeps the separately owner-built formal quote path available", () => {
    const pdf = generateCustomQuotePdf({
      ...lead,
      lineItems: [
        { description: "Approved concrete works", quantity: 1, unit: "item", rate: 22_000, amount: 22_000 },
      ],
      gstIncluded: true,
    });

    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(1_000);
  });

  it("ships the first approved CCG logo unchanged", () => {
    const logo = readFileSync(resolve("client/public/ccg-logo-gold.png"));
    const checksum = createHash("sha256").update(logo).digest("hex");

    expect(checksum).toBe(QUOTE_BRAND.logoSha256);
  });

  it("removes legacy calculator rate tables and stores owner-built quote provenance", () => {
    const pdfSource = readFileSync(resolve("server/quotePdf.ts"), "utf8");
    const routerSource = readFileSync(resolve("server/routers.ts"), "utf8");

    expect(pdfSource).not.toMatch(/FINISH_PRICING|SERVICE_FINISH_MAP|SERVICE_TYPICAL_SIZE|lowPerM2|highPerM2/);
    expect(routerSource).not.toContain("generateQuotePdf({");
    expect(routerSource).toContain("CCG-QB-");
    expect(routerSource).toContain("assertQuotePdfSendAllowed(quote.pdfRef)");
  });
});
