/*
  Quote PDF Email
  Sends the auto-generated branded PDF estimate to the customer
  within minutes of their quote submission.
*/

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "Concrete Concepts Group <info@concreteconceptsgroup.com>";

interface QuotePdfEmailData {
  name: string;
  email: string;
  service: string;
  suburb: string;
  pdfBuffer: Buffer;
  quoteRef: string;
}

/**
 * Send the auto-generated quote PDF to the customer
 */
export async function sendQuotePdfEmail(data: QuotePdfEmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("[QuotePDF] RESEND_API_KEY is not set");
    return false;
  }

  const subject = `Your ${data.service} Estimate — Concrete Concepts Group (${data.quoteRef})`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333333; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5;">
      <div style="background-color: #1a1a1a; padding: 24px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #D4A843; letter-spacing: 1px;">CONCRETE CONCEPTS</h1>
        <p style="margin: 4px 0 0; font-size: 12px; color: #999; letter-spacing: 2px;">GROUP PTY LTD</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #1a1a1a;">
          Here's your preliminary estimate, ${data.name}!
        </h2>
        <p style="margin: 0 0 16px; line-height: 1.6; color: #555;">
          Thanks for your interest in our <strong>${data.service.toLowerCase()}</strong> services in <strong>${data.suburb}</strong>.
          We've attached a preliminary cost estimate to give you an idea of pricing.
        </p>
        
        <div style="background: linear-gradient(135deg, #f9f7f2 0%, #f5f5f0 100%); border-left: 4px solid #D4A843; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a; font-weight: bold;">
            &#128196; Your Estimate PDF is Attached
          </p>
          <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.5;">
            Reference: <strong>${data.quoteRef}</strong><br>
            This is an indicative estimate. We'll provide an accurate quote after a free on-site inspection.
          </p>
        </div>

        <p style="margin: 20px 0 16px; line-height: 1.6; color: #555;">
          <strong>What happens next?</strong>
        </p>
        <ol style="margin: 0 0 20px; padding-left: 20px; color: #555; line-height: 1.8;">
          <li>One of our team will call you within <strong>24 hours</strong></li>
          <li>We'll arrange a <strong>free on-site inspection</strong> at your convenience</li>
          <li>You'll receive a <strong>detailed, fixed-price quote</strong> — no surprises</li>
        </ol>

        <p style="margin: 0 0 16px; line-height: 1.6; color: #555;">
          Want to speed things up? Give us a call now:
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="tel:0424463268" style="display: inline-block; background-color: #D4A843; color: #1a1a1a; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 15px;">
            Call 0424 463 268
          </a>
        </div>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0 0 4px; font-size: 14px; color: #333; font-weight: 600;">Concrete Concepts Group Pty Ltd</p>
          <p style="margin: 0 0 2px; font-size: 13px; color: #888;">QBCC Licensed #15299707 | Fully Insured</p>
          <p style="margin: 0 0 2px; font-size: 13px; color: #888;">Brisbane & South East Queensland</p>
          <p style="margin: 0; font-size: 13px; color: #888;">
            <a href="https://concreteconceptsgroup.com" style="color: #D4A843; text-decoration: none;">concreteconceptsgroup.com</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const text = [
    `Here's your preliminary estimate, ${data.name}!`,
    ``,
    `Thanks for your interest in our ${data.service.toLowerCase()} services in ${data.suburb}.`,
    `We've attached a preliminary cost estimate (Reference: ${data.quoteRef}).`,
    ``,
    `What happens next:`,
    `1. One of our team will call you within 24 hours`,
    `2. We'll arrange a free on-site inspection`,
    `3. You'll receive a detailed, fixed-price quote`,
    ``,
    `Call us: 0424 463 268`,
    ``,
    `Concrete Concepts Group Pty Ltd`,
    `QBCC Licensed #15299707`,
    `concreteconceptsgroup.com`,
  ].join("\n");

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [data.email],
        subject,
        html,
        text,
        attachments: [
          {
            filename: `Concrete-Concepts-Estimate-${data.quoteRef}.pdf`,
            content: data.pdfBuffer.toString("base64"),
            type: "application/pdf",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[QuotePDF] Resend API error:", response.status, errorBody);
      return false;
    }

    const result = await response.json();
    console.log("[QuotePDF] Quote PDF email sent successfully, id:", result.id);
    return true;
  } catch (err) {
    console.error("[QuotePDF] Failed to send quote PDF email:", err);
    return false;
  }
}
