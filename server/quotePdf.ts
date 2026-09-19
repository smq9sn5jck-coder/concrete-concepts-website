import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { jsPDF } from "jspdf";

export interface QuotePdfData {
  name: string;
  phone: string;
  email: string;
  suburb: string;
  service: string;
  details?: string;
  quoteId?: number;
}

export class LegacyQuotePdfBlockedError extends Error {
  constructor() {
    super("The generic-rate estimate PDF is retired. Use a validated estimator snapshot or an owner-built formal quote.");
    this.name = "LegacyQuotePdfBlockedError";
  }
}

/**
 * Retained as a fail-closed compatibility boundary for old call sites.
 * It must never calculate or render a customer price.
 */
export function generateQuotePdf(_data: QuotePdfData): never {
  throw new LegacyQuotePdfBlockedError();
}

export interface CustomLineItem {
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface CustomQuotePdfData extends QuotePdfData {
  lineItems: CustomLineItem[];
  customTerms?: string;
  customNotes?: string;
  validityDays?: number;
  gstIncluded?: boolean;
}

const GOLD = [201, 164, 77] as const;
const NAVY = [15, 42, 68] as const;
const DARK = [42, 50, 58] as const;
const MID = [100, 110, 120] as const;
const LIGHT = [245, 247, 249] as const;
const WHITE = [255, 255, 255] as const;
const INTERNAL_LINE_ITEM_PATTERN = /\b(supplier|cost price|labour markup|gross profit|margin|commission|method\s*[12]|profit per crew day)\b/i;

function approvedQuoteReference(quoteId?: number) {
  return quoteId
    ? `CCG-QB-${String(quoteId).padStart(4, "0")}`
    : `CCG-QB-${Date.now().toString(36).toUpperCase()}`;
}

function addApprovedLogo(doc: jsPDF) {
  const candidates = [
    resolve("client/public/ccg-logo-gold.png"),
    resolve("dist/public/ccg-logo-gold.png"),
  ];
  for (const path of candidates) {
    try {
      const dataUrl = `data:image/png;base64,${readFileSync(path).toString("base64")}`;
      doc.addImage(dataUrl, "PNG", 20, 6, 48, 23);
      return true;
    } catch {
      // Try the next deterministic deployment path.
    }
  }
  return false;
}

function validateOwnerBuiltQuote(data: CustomQuotePdfData) {
  if (data.lineItems.length === 0) throw new Error("At least one approved line item is required.");
  for (let index = 0; index < data.lineItems.length; index += 1) {
    const item = data.lineItems[index];
    if (!item.description.trim()) throw new Error(`Line item ${index + 1} requires a description.`);
    if (![item.quantity, item.rate, item.amount].every((value) => Number.isFinite(value) && value >= 0)) {
      throw new Error(`Line item ${index + 1} contains an invalid amount.`);
    }
    if (INTERNAL_LINE_ITEM_PATTERN.test(item.description)) {
      throw new Error(`Line item ${index + 1} contains internal pricing language.`);
    }
  }
}

function addFooter(doc: jsPDF, validityDays: number, gstIncluded: boolean) {
  const pageWidth = 210;
  const footerY = 270;
  doc.setFillColor(...NAVY);
  doc.rect(0, footerY, pageWidth, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text("Concrete Concepts Group Pty Ltd", 20, footerY + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(210, 218, 226);
  doc.text("QBCC Licence #15299707  |  ABN: 61 695 485 593  |  Fully Insured", 20, footerY + 14);
  doc.text("0424 463 268  |  info@concreteconceptsgroup.com  |  concreteconceptsgroup.com", 20, footerY + 20);
  doc.setFontSize(7);
  doc.setTextColor(155, 170, 185);
  doc.text(
    `Valid for ${validityDays} days. Prices ${gstIncluded ? "include" : "exclude"} GST. Scope changes require written approval.`,
    20,
    footerY + 26
  );
}

/** Generate a formal quote from line items explicitly prepared by an owner/admin. */
export function generateCustomQuotePdf(data: CustomQuotePdfData): Buffer {
  validateOwnerBuiltQuote(data);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const validityDays = data.validityDays ?? 30;
  const gstIncluded = data.gstIncluded ?? true;
  const quoteReference = approvedQuoteReference(data.quoteId);
  const date = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  let y = 0;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 45, "F");
  if (!addApprovedLogo(doc)) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...GOLD);
    doc.text("CONCRETE CONCEPTS", margin, 20);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text("FORMAL QUOTATION", pageWidth - margin, 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(210, 218, 226);
  doc.text(`Ref: ${quoteReference}`, pageWidth - margin, 21, { align: "right" });
  doc.text(date, pageWidth - margin, 27, { align: "right" });
  doc.setFillColor(...GOLD);
  doc.rect(0, 45, pageWidth, 2, "F");
  y = 58;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text("Quotation", margin, y);
  y += 11;

  doc.setFillColor(...LIGHT);
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("Prepared for", margin + 8, y + 10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(data.name, margin + 8, y + 18);
  doc.text(`${data.phone}  |  ${data.email}`, margin + 8, y + 25);
  doc.text(`Location: ${data.suburb}, QLD`, margin + 8, y + 32);
  y += 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text("Approved scope", margin, y);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(margin, y + 2, margin + 42, y + 2);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(`Service: ${data.service}`, margin, y);
  y += 7;
  if (data.details) {
    const lines = doc.splitTextToSize(data.details, contentWidth - 4);
    doc.setFontSize(9);
    doc.setTextColor(...MID);
    doc.text(lines, margin + 2, y);
    y += lines.length * 5 + 5;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text("Pricing breakdown", margin, y);
  doc.setDrawColor(...GOLD);
  doc.line(margin, y + 2, margin + 50, y + 2);
  y += 10;

  const columns = {
    description: margin + 4,
    quantity: margin + 86,
    unit: margin + 104,
    rate: margin + 124,
    amount: margin + contentWidth - 4,
  };
  const drawHeader = () => {
    doc.setFillColor(...NAVY);
    doc.rect(margin, y, contentWidth, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...WHITE);
    doc.text("Description", columns.description, y + 6);
    doc.text("Qty", columns.quantity, y + 6);
    doc.text("Unit", columns.unit, y + 6);
    doc.text("Rate", columns.rate, y + 6);
    doc.text("Amount", columns.amount, y + 6, { align: "right" });
    y += 9;
  };
  drawHeader();

  let total = 0;
  data.lineItems.forEach((item, index) => {
    if (y > 245) {
      addFooter(doc, validityDays, gstIncluded);
      doc.addPage();
      y = 20;
      drawHeader();
    }
    if (index % 2 === 0) {
      doc.setFillColor(...LIGHT);
      doc.rect(margin, y, contentWidth, 10, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    const description = item.description.length > 44 ? `${item.description.slice(0, 41)}...` : item.description;
    doc.text(description, columns.description, y + 7);
    doc.text(String(item.quantity), columns.quantity, y + 7);
    doc.text(item.unit, columns.unit, y + 7);
    doc.text(`$${item.rate.toFixed(2)}`, columns.rate, y + 7);
    doc.setFont("helvetica", "bold");
    doc.text(`$${item.amount.toFixed(2)}`, columns.amount, y + 7, { align: "right" });
    total += item.amount;
    y += 10;
  });
  y += 4;

  const totalsX = margin + contentWidth / 2;
  const totalsWidth = contentWidth / 2;
  if (gstIncluded) {
    const gst = total / 11;
    const excludingGst = total - gst;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text("Subtotal (ex GST):", totalsX + 4, y + 6);
    doc.text(`$${excludingGst.toFixed(2)}`, totalsX + totalsWidth - 4, y + 6, { align: "right" });
    y += 8;
    doc.text("GST:", totalsX + 4, y + 6);
    doc.text(`$${gst.toFixed(2)}`, totalsX + totalsWidth - 4, y + 6, { align: "right" });
    y += 8;
  }
  doc.setFillColor(...GOLD);
  doc.rect(totalsX, y, totalsWidth, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(gstIncluded ? "Total (inc GST):" : "Total:", totalsX + 4, y + 9);
  doc.text(`$${total.toFixed(2)}`, totalsX + totalsWidth - 4, y + 9, { align: "right" });
  y += 22;

  if (data.customNotes) {
    if (y > 230) {
      addFooter(doc, validityDays, gstIncluded);
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.text("Notes", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    const noteLines = doc.splitTextToSize(data.customNotes, contentWidth - 4);
    doc.text(noteLines, margin + 2, y);
    y += noteLines.length * 5 + 7;
  }

  if (y > 220) {
    addFooter(doc, validityDays, gstIncluded);
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("Terms and conditions", margin, y);
  y += 7;
  const defaultTerms = [
    `This quote is valid for ${validityDays} days from the date of issue.`,
    "A $500 QBCC deposit applies; the progress payment schedule is confirmed before acceptance.",
    "Any change to the approved scope is priced and agreed in writing before work proceeds.",
    "Work is subject to the stated site assumptions, exclusions and access conditions.",
    "Applicable statutory warranties and consumer rights remain in effect.",
  ];
  const terms = data.customTerms
    ? data.customTerms.split("\n").map((term) => term.trim()).filter(Boolean)
    : defaultTerms;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MID);
  terms.forEach((term, index) => {
    if (y > 258) {
      addFooter(doc, validityDays, gstIncluded);
      doc.addPage();
      y = 20;
    }
    const lines = doc.splitTextToSize(`${index + 1}. ${term}`, contentWidth - 4);
    doc.text(lines, margin + 2, y);
    y += lines.length * 4.5 + 1.5;
  });

  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
    doc.setPage(page);
    addFooter(doc, validityDays, gstIncluded);
  }
  return Buffer.from(doc.output("arraybuffer"));
}
