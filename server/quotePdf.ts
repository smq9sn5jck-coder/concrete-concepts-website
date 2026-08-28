/*
  Automated Quote PDF Generation
  Generates branded PDF estimates for Concrete Concepts Group
  Uses jsPDF for server-side PDF creation
  Pricing based on the calculator data (mid-to-high Brisbane rates)
*/

import { jsPDF } from "jspdf";

// Brisbane pricing data (matches CostCalculator.tsx)
const FINISH_PRICING: Record<string, { name: string; lowPerM2: number; highPerM2: number }> = {
  "Plain Concrete": { name: "Plain Concrete", lowPerM2: 75, highPerM2: 95 },
  "Coloured Concrete": { name: "Coloured Concrete", lowPerM2: 85, highPerM2: 120 },
  "Exposed Aggregate": { name: "Exposed Aggregate", lowPerM2: 110, highPerM2: 160 },
  "Stencilled / Stamped": { name: "Stencilled / Stamped", lowPerM2: 100, highPerM2: 150 },
  "Covercrete / Resurfacing": { name: "Covercrete / Resurfacing", lowPerM2: 80, highPerM2: 130 },
};

// Service-to-finish mapping for rough estimates
const SERVICE_FINISH_MAP: Record<string, string> = {
  "Concrete Slab / Foundation": "Plain Concrete",
  "Driveway": "Plain Concrete",
  "Pathway / Footpath": "Plain Concrete",
  "Patio / Entertaining Area": "Exposed Aggregate",
  "Pool Surround": "Exposed Aggregate",
  "Retaining Wall": "Plain Concrete",
  "Stairs / Steps": "Plain Concrete",
  "Exposed Aggregate": "Exposed Aggregate",
  "Coloured Concrete": "Coloured Concrete",
  "Covercrete": "Covercrete / Resurfacing",
  "Excavation": "Plain Concrete",
  "Formwork": "Plain Concrete",
  "Concrete Removal": "Plain Concrete",
  "Grinding / Cutting": "Plain Concrete",
  "Sealing": "Plain Concrete",
  "Reinforcement": "Plain Concrete",
  "Pumping": "Plain Concrete",
  "Commercial Project": "Plain Concrete",
  "Other": "Plain Concrete",
};

// Typical project sizes in m² for rough estimates
const SERVICE_TYPICAL_SIZE: Record<string, { low: number; high: number }> = {
  "Concrete Slab / Foundation": { low: 30, high: 100 },
  "Driveway": { low: 40, high: 80 },
  "Pathway / Footpath": { low: 10, high: 30 },
  "Patio / Entertaining Area": { low: 20, high: 60 },
  "Pool Surround": { low: 15, high: 40 },
  "Retaining Wall": { low: 5, high: 20 },
  "Stairs / Steps": { low: 3, high: 10 },
  "Exposed Aggregate": { low: 20, high: 80 },
  "Coloured Concrete": { low: 20, high: 80 },
  "Covercrete": { low: 15, high: 60 },
  "Excavation": { low: 20, high: 80 },
  "Formwork": { low: 20, high: 80 },
  "Concrete Removal": { low: 10, high: 50 },
  "Grinding / Cutting": { low: 10, high: 50 },
  "Sealing": { low: 20, high: 80 },
  "Reinforcement": { low: 20, high: 80 },
  "Pumping": { low: 20, high: 80 },
  "Commercial Project": { low: 50, high: 200 },
  "Other": { low: 20, high: 60 },
};

interface QuotePdfData {
  name: string;
  phone: string;
  email: string;
  suburb: string;
  service: string;
  details?: string;
  quoteId?: number;
}

/**
 * Generate a branded PDF quote estimate
 * Returns the PDF as a Buffer
 */
export function generateQuotePdf(data: QuotePdfData): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // Colors
  const gold = [212, 168, 67] as [number, number, number]; // #D4A843
  const charcoal = [26, 26, 26] as [number, number, number]; // #1a1a1a
  const darkGrey = [51, 51, 51] as [number, number, number];
  const medGrey = [119, 119, 119] as [number, number, number];
  const lightGrey = [245, 245, 240] as [number, number, number];
  const white = [255, 255, 255] as [number, number, number];

  // ===== HEADER BAR =====
  doc.setFillColor(...charcoal);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...gold);
  doc.text("CONCRETE CONCEPTS", margin, 20);

  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text("GROUP PTY LTD", margin, 27);

  // Quote reference
  const quoteRef = data.quoteId
    ? `CCG-${String(data.quoteId).padStart(4, "0")}`
    : `CCG-${Date.now().toString(36).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text(`Ref: ${quoteRef}`, pageWidth - margin, 18, { align: "right" });
  doc.text(dateStr, pageWidth - margin, 24, { align: "right" });

  // Gold accent line
  doc.setFillColor(...gold);
  doc.rect(0, 45, pageWidth, 2, "F");

  y = 58;

  // ===== ESTIMATE TITLE =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...charcoal);
  doc.text("Preliminary Cost Estimate", margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...medGrey);
  doc.text("This is an indicative estimate only. Final pricing requires an on-site inspection.", margin, y);
  y += 12;

  // ===== CLIENT DETAILS BOX =====
  doc.setFillColor(...lightGrey);
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...charcoal);
  doc.text("Prepared For", margin + 8, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...darkGrey);
  doc.text(`${data.name}`, margin + 8, y + 18);
  doc.text(`${data.phone}  |  ${data.email}`, margin + 8, y + 25);
  doc.text(`Location: ${data.suburb}, QLD`, margin + 8, y + 32);

  y += 48;

  // ===== PROJECT DETAILS =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...charcoal);
  doc.text("Project Details", margin, y);
  y += 2;

  // Gold underline
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 40, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...darkGrey);
  doc.text(`Service Type: ${data.service}`, margin, y);
  y += 7;

  if (data.details) {
    doc.text("Additional Details:", margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(...medGrey);
    // Word wrap details
    const detailLines = doc.splitTextToSize(data.details, contentWidth - 5);
    doc.text(detailLines, margin + 2, y);
    y += detailLines.length * 5 + 4;
  }

  y += 6;

  // ===== PRICING ESTIMATE =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...charcoal);
  doc.text("Estimated Pricing", margin, y);
  y += 2;
  doc.setDrawColor(...gold);
  doc.line(margin, y, margin + 45, y);
  y += 8;

  // Get pricing data
  const finishKey = SERVICE_FINISH_MAP[data.service] || "Plain Concrete";
  const pricing = FINISH_PRICING[finishKey] || FINISH_PRICING["Plain Concrete"];
  const typicalSize = SERVICE_TYPICAL_SIZE[data.service] || { low: 20, high: 60 };

  // Table header
  doc.setFillColor(...charcoal);
  doc.rect(margin, y, contentWidth, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...white);
  doc.text("Description", margin + 4, y + 6);
  doc.text("Rate (per m\u00B2)", margin + 90, y + 6);
  doc.text("Est. Range", margin + 135, y + 6);
  y += 9;

  // Table rows
  const rows = [
    {
      desc: `${pricing.name} — ${data.service}`,
      rate: `$${pricing.lowPerM2} – $${pricing.highPerM2}`,
      range: `$${(pricing.lowPerM2 * typicalSize.low).toLocaleString()} – $${(pricing.highPerM2 * typicalSize.high).toLocaleString()}`,
    },
  ];

  // Add excavation if relevant
  if (["Driveway", "Concrete Slab / Foundation", "Patio / Entertaining Area", "Pool Surround"].includes(data.service)) {
    rows.push({
      desc: "Excavation & Site Prep (if required)",
      rate: "$18 – $28",
      range: `$${(18 * typicalSize.low).toLocaleString()} – $${(28 * typicalSize.high).toLocaleString()}`,
    });
  }

  rows.forEach((row, i) => {
    const rowY = y + i * 10;
    if (i % 2 === 0) {
      doc.setFillColor(...lightGrey);
      doc.rect(margin, rowY, contentWidth, 10, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...darkGrey);
    doc.text(row.desc, margin + 4, rowY + 7);
    doc.text(row.rate, margin + 90, rowY + 7);
    doc.setFont("helvetica", "bold");
    doc.text(row.range, margin + 135, rowY + 7);
  });

  y += rows.length * 10 + 4;

  // Total estimate box
  const totalLow = rows.reduce((sum, _row, i) => {
    if (i === 0) return pricing.lowPerM2 * typicalSize.low;
    return sum + 18 * typicalSize.low;
  }, 0);
  const totalHigh = rows.reduce((sum, _row, i) => {
    if (i === 0) return pricing.highPerM2 * typicalSize.high;
    return sum + 28 * typicalSize.high;
  }, 0);

  doc.setFillColor(...gold);
  doc.rect(margin + contentWidth / 2, y, contentWidth / 2, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...charcoal);
  doc.text("Estimated Total:", margin + contentWidth / 2 + 4, y + 9);
  doc.text(
    `$${totalLow.toLocaleString()} – $${totalHigh.toLocaleString()}`,
    margin + contentWidth - 4,
    y + 9,
    { align: "right" }
  );
  y += 20;

  // Typical size note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...medGrey);
  doc.text(
    `* Based on typical ${data.service.toLowerCase()} size of ${typicalSize.low}–${typicalSize.high} m\u00B2. Actual pricing depends on site conditions.`,
    margin,
    y
  );
  y += 12;

  // ===== WHAT'S INCLUDED =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...charcoal);
  doc.text("What's Included", margin, y);
  y += 2;
  doc.setDrawColor(...gold);
  doc.line(margin, y, margin + 40, y);
  y += 8;

  const inclusions = [
    "Free on-site inspection and detailed quote",
    "All materials, labour, and equipment",
    "Formwork, reinforcement, and concrete supply",
    "Professional finish to your specification",
    "Site clean-up on completion",
    "QBCC warranty on all workmanship",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkGrey);
  inclusions.forEach((item) => {
    doc.setFillColor(...gold);
    doc.circle(margin + 2, y - 1.2, 1.2, "F");
    doc.text(item, margin + 7, y);
    y += 6;
  });

  y += 6;

  // ===== NEXT STEPS =====
  doc.setFillColor(...lightGrey);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...charcoal);
  doc.text("Next Steps", margin + 8, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkGrey);
  doc.text("1. We'll call you within 24 hours to discuss your project", margin + 8, y + 18);
  doc.text("2. Free on-site inspection at a time that suits you", margin + 8, y + 24);

  y += 40;

  // ===== FOOTER =====
  const footerY = 270;
  doc.setFillColor(...charcoal);
  doc.rect(0, footerY, pageWidth, 30, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...gold);
  doc.text("Concrete Concepts Group Pty Ltd", margin, footerY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("QBCC Licence #15299707  |  ABN: 61 695 485 593  |  Fully Insured", margin, footerY + 14);
  doc.text("0424 463 268  |  info@concreteconceptsgroup.com  |  concreteconceptsgroup.com", margin, footerY + 20);

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "This estimate is indicative only and subject to change after site inspection. Valid for 30 days from date of issue.",
    margin,
    footerY + 26
  );

  // Return as Buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

/* ===== Custom Quote PDF with editable line items ===== */

export interface CustomLineItem {
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface CustomQuotePdfData {
  name: string;
  phone: string;
  email: string;
  suburb: string;
  service: string;
  details?: string;
  quoteId?: number;
  lineItems: CustomLineItem[];
  customTerms?: string;
  customNotes?: string;
  validityDays?: number;
  gstIncluded?: boolean;
}

/**
 * Generate a branded PDF with custom line items (admin-edited quote)
 * Returns the PDF as a Buffer
 */
export function generateCustomQuotePdf(data: CustomQuotePdfData): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // Colors
  const gold = [212, 168, 67] as [number, number, number];
  const charcoal = [26, 26, 26] as [number, number, number];
  const darkGrey = [51, 51, 51] as [number, number, number];
  const medGrey = [119, 119, 119] as [number, number, number];
  const lightGrey = [245, 245, 240] as [number, number, number];
  const white = [255, 255, 255] as [number, number, number];

  const validityDays = data.validityDays ?? 30;
  const gstIncluded = data.gstIncluded ?? true;

  // ===== HEADER BAR =====
  doc.setFillColor(...charcoal);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...gold);
  doc.text("CONCRETE CONCEPTS", margin, 20);

  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text("GROUP PTY LTD", margin, 27);

  // Quote reference
  const quoteRef = data.quoteId
    ? `CCG-${String(data.quoteId).padStart(4, "0")}`
    : `CCG-${Date.now().toString(36).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text(`Ref: ${quoteRef}`, pageWidth - margin, 18, { align: "right" });
  doc.text(dateStr, pageWidth - margin, 24, { align: "right" });

  // Gold accent line
  doc.setFillColor(...gold);
  doc.rect(0, 45, pageWidth, 2, "F");

  y = 58;

  // ===== QUOTE TITLE =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...charcoal);
  doc.text("Quotation", margin, y);
  y += 12;

  // ===== CLIENT DETAILS BOX =====
  doc.setFillColor(...lightGrey);
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...charcoal);
  doc.text("Prepared For", margin + 8, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...darkGrey);
  doc.text(`${data.name}`, margin + 8, y + 18);
  doc.text(`${data.phone}  |  ${data.email}`, margin + 8, y + 25);
  doc.text(`Location: ${data.suburb}, QLD`, margin + 8, y + 32);

  y += 48;

  // ===== PROJECT DETAILS =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...charcoal);
  doc.text("Project Details", margin, y);
  y += 2;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 40, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...darkGrey);
  doc.text(`Service Type: ${data.service}`, margin, y);
  y += 7;

  if (data.details) {
    doc.text("Additional Details:", margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(...medGrey);
    const detailLines = doc.splitTextToSize(data.details, contentWidth - 5);
    doc.text(detailLines, margin + 2, y);
    y += detailLines.length * 5 + 4;
  }

  y += 6;

  // ===== LINE ITEMS TABLE =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...charcoal);
  doc.text("Pricing Breakdown", margin, y);
  y += 2;
  doc.setDrawColor(...gold);
  doc.line(margin, y, margin + 50, y);
  y += 8;

  // Table header
  const colDesc = margin + 4;
  const colQty = margin + 85;
  const colUnit = margin + 102;
  const colRate = margin + 122;
  const colAmount = margin + contentWidth - 4;

  doc.setFillColor(...charcoal);
  doc.rect(margin, y, contentWidth, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...white);
  doc.text("Description", colDesc, y + 6);
  doc.text("Qty", colQty, y + 6);
  doc.text("Unit", colUnit, y + 6);
  doc.text("Rate", colRate, y + 6);
  doc.text("Amount", colAmount, y + 6, { align: "right" });
  y += 9;

  // Table rows
  let subtotal = 0;
  data.lineItems.forEach((item, i) => {
    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    const rowH = 10;
    if (i % 2 === 0) {
      doc.setFillColor(...lightGrey);
      doc.rect(margin, y, contentWidth, rowH, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...darkGrey);

    // Truncate long descriptions
    const descText = item.description.length > 45
      ? item.description.substring(0, 42) + "..."
      : item.description;
    doc.text(descText, colDesc, y + 7);
    doc.text(String(item.quantity), colQty, y + 7);
    doc.text(item.unit, colUnit, y + 7);
    doc.text(`$${item.rate.toFixed(2)}`, colRate, y + 7);
    doc.setFont("helvetica", "bold");
    doc.text(`$${item.amount.toFixed(2)}`, colAmount, y + 7, { align: "right" });

    subtotal += item.amount;
    y += rowH;
  });

  y += 2;

  // Subtotal / GST / Total
  const boxX = margin + contentWidth / 2;
  const boxW = contentWidth / 2;

  if (gstIncluded) {
    const gstAmount = subtotal / 11; // GST is 1/11 of total when included
    const exGst = subtotal - gstAmount;

    // Subtotal ex GST
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...darkGrey);
    doc.text("Subtotal (ex GST):", boxX + 4, y + 6);
    doc.text(`$${exGst.toFixed(2)}`, boxX + boxW - 4, y + 6, { align: "right" });
    y += 8;

    // GST
    doc.text("GST (10%):", boxX + 4, y + 6);
    doc.text(`$${gstAmount.toFixed(2)}`, boxX + boxW - 4, y + 6, { align: "right" });
    y += 8;
  }

  // Total
  doc.setFillColor(...gold);
  doc.rect(boxX, y, boxW, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...charcoal);
  doc.text(gstIncluded ? "Total (inc GST):" : "Total:", boxX + 4, y + 9);
  doc.text(`$${subtotal.toFixed(2)}`, boxX + boxW - 4, y + 9, { align: "right" });
  y += 22;

  // ===== CUSTOM NOTES =====
  if (data.customNotes) {
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...charcoal);
    doc.text("Notes", margin, y);
    y += 2;
    doc.setDrawColor(...gold);
    doc.line(margin, y, margin + 20, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...darkGrey);
    const noteLines = doc.splitTextToSize(data.customNotes, contentWidth - 5);
    doc.text(noteLines, margin + 2, y);
    y += noteLines.length * 5 + 6;
  }

  // ===== WHAT'S INCLUDED =====
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...charcoal);
  doc.text("What's Included", margin, y);
  y += 2;
  doc.setDrawColor(...gold);
  doc.line(margin, y, margin + 40, y);
  y += 8;

  const inclusions = [
    "All materials, labour, and equipment",
    "Formwork, reinforcement, and concrete supply",
    "Professional finish to your specification",
    "Site clean-up on completion",
    "QBCC warranty on all workmanship",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkGrey);
  inclusions.forEach((item) => {
    doc.setFillColor(...gold);
    doc.circle(margin + 2, y - 1.2, 1.2, "F");
    doc.text(item, margin + 7, y);
    y += 6;
  });

  y += 6;

  // ===== TERMS & CONDITIONS =====
  if (y > 230) { doc.addPage(); y = 20; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...charcoal);
  doc.text("Terms & Conditions", margin, y);
  y += 2;
  doc.setDrawColor(...gold);
  doc.line(margin, y, margin + 50, y);
  y += 7;

  const defaultTerms = [
    `This quote is valid for ${validityDays} days from the date of issue.`,
    "A 30% deposit is required upon acceptance to secure your booking.",
    "Balance due upon completion and your satisfaction.",
    "Work is covered under QBCC warranty and our quality guarantee.",
    "Any variations to scope will be quoted separately before proceeding.",
  ];

  const termsToUse = data.customTerms
    ? data.customTerms.split("\n").filter(t => t.trim())
    : defaultTerms;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...medGrey);
  termsToUse.forEach((term, i) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.text(`${i + 1}. ${term}`, margin + 2, y);
    y += 5;
  });

  // ===== FOOTER =====
  const footerY = 270;
  doc.setFillColor(...charcoal);
  doc.rect(0, footerY, pageWidth, 30, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...gold);
  doc.text("Concrete Concepts Group Pty Ltd", margin, footerY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("QBCC Licence #15299707  |  ABN: 61 695 485 593  |  Fully Insured", margin, footerY + 14);
  doc.text("0424 463 268  |  info@concreteconceptsgroup.com  |  concreteconceptsgroup.com", margin, footerY + 20);

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `This quotation is valid for ${validityDays} days from the date of issue. Prices ${gstIncluded ? "include" : "exclude"} GST.`,
    margin,
    footerY + 26
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
