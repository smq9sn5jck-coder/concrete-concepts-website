const RESEND_API_URL = "https://api.resend.com/emails";

export const QUOTE_EMAIL_FROM = "Concrete Concepts <info@concreteconceptsgroup.com>";
export const quotePdfEmailBrand = Object.freeze({ gold: "#C9A44D", navy: "#0F2A44" });

interface QuotePdfEmailData {
  name: string;
  email: string;
  service: string;
  suburb: string;
  pdfBuffer: Buffer;
  quoteRef: string;
}

export function assertQuotePdfSendAllowed(quoteRef: string) {
  if (/^CCG-\d{4,}$/i.test(quoteRef)) {
    throw new Error("Legacy generic-rate PDF references cannot be sent to customers.");
  }
  if (!/^CCG-QB-[A-Z0-9-]+$/i.test(quoteRef)) {
    throw new Error("Only an owner-built formal quote can be sent to a customer.");
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendQuotePdfEmail(data: QuotePdfEmailData): Promise<boolean> {
  assertQuotePdfSendAllowed(data.quoteRef);
  const apiKey = process.env.RESEND_API_KEY ?? "";
  if (!apiKey) {
    console.error("[QuotePDF] RESEND_API_KEY is not set");
    return false;
  }

  const name = escapeHtml(data.name);
  const service = escapeHtml(data.service);
  const suburb = escapeHtml(data.suburb);
  const quoteRef = escapeHtml(data.quoteRef);
  const subject = `Your ${data.service} quotation — Concrete Concepts (${data.quoteRef})`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#2A323A;border:1px solid #d9e0e6;border-radius:8px;overflow:hidden;">
      <div style="background:${quotePdfEmailBrand.navy};padding:24px 30px;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:${quotePdfEmailBrand.gold};letter-spacing:1px;">CONCRETE CONCEPTS</h1>
        <p style="margin:5px 0 0;font-size:11px;color:#d2dae2;letter-spacing:2px;">GROUP PTY LTD</p>
      </div>
      <div style="padding:30px;">
        <h2 style="margin:0 0 16px;font-size:20px;color:${quotePdfEmailBrand.navy};">Your formal quotation is ready, ${name}</h2>
        <p style="margin:0 0 16px;line-height:1.6;color:#4c5965;">Your owner-reviewed quotation for the ${service} project in ${suburb} is attached.</p>
        <div style="background:#f7f9fb;border-left:4px solid ${quotePdfEmailBrand.gold};border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
          <p style="margin:0 0 8px;font-size:14px;color:${quotePdfEmailBrand.navy};font-weight:bold;">Formal quotation attached</p>
          <p style="margin:0;font-size:13px;color:#5e6973;line-height:1.5;">Reference: <strong>${quoteRef}</strong><br>Review the scope, inclusions, exclusions, assumptions, payment schedule and validity period before acceptance.</p>
        </div>
        <p style="margin:20px 0 12px;line-height:1.6;color:#4c5965;"><strong>Questions about the scope?</strong> Contact us before accepting so we can clarify or revise the quotation.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="tel:0424463268" style="display:inline-block;background:${quotePdfEmailBrand.gold};color:${quotePdfEmailBrand.navy};text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:bold;font-size:15px;">Call 0424 463 268</a>
        </div>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e7eb;">
          <p style="margin:0 0 4px;font-size:14px;color:${quotePdfEmailBrand.navy};font-weight:600;">Concrete Concepts Group Pty Ltd</p>
          <p style="margin:0 0 2px;font-size:13px;color:#687581;">QBCC Licence #15299707 | Fully Insured</p>
          <p style="margin:0 0 2px;font-size:13px;color:#687581;">Brisbane &amp; South East Queensland</p>
          <p style="margin:0;font-size:13px;"><a href="https://concreteconceptsgroup.com" style="color:${quotePdfEmailBrand.gold};text-decoration:none;">concreteconceptsgroup.com</a></p>
        </div>
      </div>
    </div>`;

  const text = [
    `Your formal quotation is ready, ${data.name}`,
    "",
    `Your owner-reviewed quotation for the ${data.service} project in ${data.suburb} is attached.`,
    `Reference: ${data.quoteRef}`,
    "",
    "Review the scope, inclusions, exclusions, assumptions, payment schedule and validity period before acceptance.",
    "Questions? Call 0424 463 268.",
    "",
    "Concrete Concepts Group Pty Ltd",
    "QBCC Licence #15299707",
    "concreteconceptsgroup.com",
  ].join("\n");

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: QUOTE_EMAIL_FROM,
        to: [data.email],
        subject,
        html,
        text,
        attachments: [
          {
            filename: `Concrete-Concepts-Quotation-${data.quoteRef}.pdf`,
            content: data.pdfBuffer.toString("base64"),
            type: "application/pdf",
          },
        ],
      }),
    });
    if (!response.ok) {
      console.error("[QuotePDF] Resend API error:", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[QuotePDF] Failed to send quote PDF email:", error);
    return false;
  }
}
