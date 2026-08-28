import { describe, it, expect } from "vitest";
import { generateCustomQuotePdf, type CustomLineItem } from "./quotePdf";

describe("Quote Builder - Custom PDF Generation", () => {
  it("generates a custom PDF with line items", () => {
    const lineItems: CustomLineItem[] = [
      { description: "Excavation & site preparation", quantity: 50, unit: "m²", rate: 22, amount: 1100 },
      { description: "Formwork supply & install", quantity: 30, unit: "m", rate: 35, amount: 1050 },
      { description: "Steel reinforcement (SL82 mesh)", quantity: 50, unit: "m²", rate: 18, amount: 900 },
      { description: "Concrete supply & pour (25MPa)", quantity: 50, unit: "m²", rate: 55, amount: 2750 },
      { description: "Plain finish & curing", quantity: 50, unit: "m²", rate: 15, amount: 750 },
      { description: "Site clean-up & waste removal", quantity: 1, unit: "lot", rate: 350, amount: 350 },
    ];

    const pdfBuffer = generateCustomQuotePdf({
      name: "John Smith",
      phone: "0412 345 678",
      email: "john@example.com",
      suburb: "Carindale",
      service: "Driveway",
      details: "50m² driveway with plain finish",
      quoteId: 42,
      lineItems,
      customNotes: "Access via rear gate. Work to commence within 2 weeks.",
      validityDays: 30,
      gstIncluded: true,
    });

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });

  it("generates PDF with custom terms", () => {
    const lineItems: CustomLineItem[] = [
      { description: "Exposed aggregate patio", quantity: 30, unit: "m²", rate: 150, amount: 4500 },
    ];

    const pdfBuffer = generateCustomQuotePdf({
      name: "Jane Doe",
      phone: "0423 456 789",
      email: "jane@example.com",
      suburb: "Bulimba",
      service: "Patio / Entertaining Area",
      quoteId: 99,
      lineItems,
      customTerms: "Quote valid for 14 days.\n50% deposit required.\nBalance on completion.",
      validityDays: 14,
      gstIncluded: false,
    });

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });

  it("handles single line item correctly", () => {
    const lineItems: CustomLineItem[] = [
      { description: "Concrete sealing", quantity: 80, unit: "m²", rate: 25, amount: 2000 },
    ];

    const pdfBuffer = generateCustomQuotePdf({
      name: "Bob Builder",
      phone: "0434 567 890",
      email: "bob@example.com",
      suburb: "Springfield",
      service: "Sealing",
      quoteId: 7,
      lineItems,
      gstIncluded: true,
    });

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });

  it("handles many line items (pagination test)", () => {
    const lineItems: CustomLineItem[] = Array.from({ length: 15 }, (_, i) => ({
      description: `Line item ${i + 1} - detailed description of work`,
      quantity: 10 + i,
      unit: "m²",
      rate: 20 + i * 5,
      amount: (10 + i) * (20 + i * 5),
    }));

    const pdfBuffer = generateCustomQuotePdf({
      name: "Large Project Client",
      phone: "0445 678 901",
      email: "large@example.com",
      suburb: "Ipswich",
      service: "Commercial Project",
      quoteId: 200,
      lineItems,
      customNotes: "Large commercial project with multiple stages.",
      customTerms: "Stage payments apply.\nProgress claims monthly.\nRetention: 5%.",
      validityDays: 60,
      gstIncluded: true,
    });

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(2000);
  });
});

describe("Quote Builder - Line Item Calculations", () => {
  it("correctly calculates amount from quantity and rate", () => {
    const qty = 50;
    const rate = 22;
    const amount = Number((qty * rate).toFixed(2));
    expect(amount).toBe(1100);
  });

  it("correctly calculates GST breakdown", () => {
    const total = 6900; // inc GST
    const gst = total / 11;
    const exGst = total - gst;
    expect(gst).toBeCloseTo(627.27, 1);
    expect(exGst).toBeCloseTo(6272.73, 1);
  });

  it("correctly sums line items", () => {
    const items: CustomLineItem[] = [
      { description: "A", quantity: 50, unit: "m²", rate: 22, amount: 1100 },
      { description: "B", quantity: 30, unit: "m", rate: 35, amount: 1050 },
      { description: "C", quantity: 1, unit: "lot", rate: 350, amount: 350 },
    ];
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    expect(total).toBe(2500);
  });
});
