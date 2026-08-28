/**
 * Email notification helper using Resend API
 * Sends email notifications when new quote requests are submitted,
 * and auto-reply confirmation emails to customers.
 */

import {
  formatQuoteBriefHtml,
  formatQuoteBriefText,
  type ComprehensiveQuote,
} from "@shared/quoteBrief";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_API_URL = "https://api.resend.com/emails";

// Notification recipient — quote alerts go here
const NOTIFICATION_EMAIL = "info@concreteconceptsgroup.com";

// Sender — using verified concreteconceptsgroup.com domain
const FROM_EMAIL = "Concrete Concepts Group <info@concreteconceptsgroup.com>";

interface QuoteEmailData {
  name: string;
  phone: string;
  email: string;
  suburb: string;
  service: string;
  details?: string;
  photoUrls?: string[];
  leadSource?: string;
  utmCampaign?: string;
  statusToken?: string;
  serviceAreaStatus?: "in_area" | "service_area_review";
  jobBrief?: ComprehensiveQuote;
}

/**
 * Send notification email to business owner when a new quote is submitted
 */
export async function sendQuoteNotificationEmail(data: QuoteEmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY is not set");
    return false;
  }

  const subject = `New Quote Request: ${data.name} — ${data.service} (${data.suburb})`;

  const photoSection = data.photoUrls && data.photoUrls.length > 0
    ? `
      <tr>
        <td style="padding: 10px 0; color: #D4A843; font-weight: bold; vertical-align: top;">Photos:</td>
        <td style="padding: 10px 0; color: #ffffff;">
          ${data.photoUrls.map((url, i) => `<a href="${url}" style="color: #D4A843; text-decoration: underline;" target="_blank">Photo ${i + 1}</a>`).join(" &nbsp; ")}
          <div style="margin-top: 8px;">
            ${data.photoUrls.map(url => `<img src="${url}" style="max-width: 200px; max-height: 150px; border-radius: 4px; margin: 4px 4px 4px 0;" />`).join("")}
          </div>
        </td>
      </tr>`
    : "";

  const serviceAreaSection = data.serviceAreaStatus === "service_area_review"
    ? `
          <tr>
            <td style="padding: 10px 0; color: #D4A843; font-weight: bold; vertical-align: top;">Area:</td>
            <td style="padding: 10px 0; color: #ffcc66; font-weight: bold;">Service area review required</td>
          </tr>`
    : "";

  const structuredBriefSection = data.jobBrief
    ? `<div style="margin-top:24px;padding-top:20px;border-top:1px solid #333;">${formatQuoteBriefHtml(data.jobBrief)}</div>`
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #D4A843; padding: 20px 30px;">
        <h1 style="margin: 0; font-size: 22px; color: #1a1a1a;">New Quote Request</h1>
      </div>
      <div style="padding: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #D4A843; font-weight: bold; width: 100px; vertical-align: top;">Name:</td>
            <td style="padding: 10px 0; color: #ffffff;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #D4A843; font-weight: bold; vertical-align: top;">Phone:</td>
            <td style="padding: 10px 0; color: #ffffff;">
              <a href="tel:${data.phone.replace(/\s/g, "")}" style="color: #ffffff; text-decoration: none;">${data.phone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #D4A843; font-weight: bold; vertical-align: top;">Email:</td>
            <td style="padding: 10px 0; color: #ffffff;">
              <a href="mailto:${data.email}" style="color: #ffffff; text-decoration: none;">${data.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #D4A843; font-weight: bold; vertical-align: top;">Suburb:</td>
            <td style="padding: 10px 0; color: #ffffff;">${data.suburb}</td>
          </tr>
          ${serviceAreaSection}
          <tr>
            <td style="padding: 10px 0; color: #D4A843; font-weight: bold; vertical-align: top;">Service:</td>
            <td style="padding: 10px 0; color: #ffffff;">${data.service}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #D4A843; font-weight: bold; vertical-align: top;">Details:</td>
            <td style="padding: 10px 0; color: #ffffff;">${data.details || "No additional details provided"}</td>
          </tr>
          ${photoSection}
          <tr>
            <td style="padding: 10px 0; color: #D4A843; font-weight: bold; vertical-align: top;">Source:</td>
            <td style="padding: 10px 0; color: #ffffff;">${data.leadSource || "Unknown"}${data.utmCampaign ? ` (Campaign: ${data.utmCampaign})` : ""}</td>
          </tr>
        </table>
        ${structuredBriefSection}
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="margin: 0; color: #999; font-size: 13px;">
            This notification was sent from your Concrete Concepts Group website.
          </p>
        </div>
      </div>
    </div>
  `;

  const photoText = data.photoUrls && data.photoUrls.length > 0
    ? `Photos: ${data.photoUrls.join(", ")}`
    : "";

  const text = data.jobBrief ? [
    `New Quote Request`,
    ``,
    formatQuoteBriefText(data.jobBrief),
    ``,
    data.serviceAreaStatus === "service_area_review" ? "Service Area: REVIEW REQUIRED" : "Service Area: Within advertised area",
    `Lead Source: ${data.leadSource || "Unknown"}`,
    data.utmCampaign ? `Campaign: ${data.utmCampaign}` : "",
  ].filter(Boolean).join("\n") : [
    `New Quote Request`,
    ``,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    `Suburb: ${data.suburb}`,
    data.serviceAreaStatus === "service_area_review" ? "Service Area: REVIEW REQUIRED" : "",
    `Service: ${data.service}`,
    `Details: ${data.details || "No additional details provided"}`,
    `Lead Source: ${data.leadSource || "Unknown"}`,
    data.utmCampaign ? `Campaign: ${data.utmCampaign}` : "",
    photoText,
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [NOTIFICATION_EMAIL],
        subject,
        html,
        text,
        reply_to: data.email,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[Email] Resend API error:", response.status, errorBody);
      return false;
    }

    const result = await response.json();
    console.log("[Email] Notification sent successfully, id:", result.id);
    return true;
  } catch (err) {
    console.error("[Email] Failed to send notification:", err);
    return false;
  }
}

/**
 * Send auto-reply confirmation email to the customer who submitted a quote
 * Note: Until a custom domain is verified in Resend, this can only send to
 * the verified account email. Once verified, it will send to the customer.
 */
export async function sendCustomerConfirmationEmail(data: QuoteEmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY is not set");
    return false;
  }

  const subject = `Thanks for your enquiry, ${data.name}! — Concrete Concepts Group`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333333; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5;">
      <div style="background-color: #1a1a1a; padding: 24px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #D4A843; letter-spacing: 1px;">CONCRETE CONCEPTS</h1>
        <p style="margin: 4px 0 0; font-size: 12px; color: #999; letter-spacing: 2px;">GROUP PTY LTD</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #1a1a1a;">Thanks for reaching out, ${data.name}!</h2>
        <p style="margin: 0 0 16px; line-height: 1.6; color: #555;">
          We've received your quote request for <strong>${data.service}</strong> in <strong>${data.suburb}</strong> 
          and one of our team will be in touch within <strong>24 hours</strong> to discuss your project.
        </p>
        
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #1a1a1a;">Your Quote Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Service:</td>
              <td style="padding: 6px 0; color: #333; font-size: 14px; font-weight: 600;">${data.service}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Location:</td>
              <td style="padding: 6px 0; color: #333; font-size: 14px; font-weight: 600;">${data.suburb}</td>
            </tr>
            ${data.details ? `
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px; vertical-align: top;">Details:</td>
              <td style="padding: 6px 0; color: #333; font-size: 14px;">${data.details}</td>
            </tr>` : ""}
          </table>
        </div>

        <p style="margin: 0 0 16px; line-height: 1.6; color: #555;">
          In the meantime, feel free to give us a call or send a WhatsApp message if you have any questions:
        </p>

        ${data.statusToken ? `
        <div style="background-color: #f0f7ff; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; border: 1px solid #d0e3f7;">
          <p style="margin: 0 0 12px; font-size: 15px; color: #333; font-weight: 600;">Track Your Quote Status</p>
          <p style="margin: 0 0 16px; font-size: 13px; color: #666; line-height: 1.5;">Check the progress of your quote anytime using the link below:</p>
          <a href="https://concreteconceptsgroup.com/my-quote?token=${data.statusToken}" style="display: inline-block; background-color: #1a1a1a; color: #D4A843; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            Track My Quote &rarr;
          </a>
        </div>
        ` : ""}

        <div style="text-align: center; margin: 24px 0;">
          <a href="tel:0424463268" style="display: inline-block; background-color: #D4A843; color: #1a1a1a; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 15px;">
            Call 0424 463 268
          </a>
        </div>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0 0 4px; font-size: 14px; color: #333; font-weight: 600;">Concrete Concepts Group Pty Ltd</p>
          <p style="margin: 0 0 2px; font-size: 13px; color: #888;">QBCC Licensed #15299707</p>
          <p style="margin: 0 0 2px; font-size: 13px; color: #888;">Brisbane & South East Queensland</p>
          <p style="margin: 0; font-size: 13px; color: #888;">
            <a href="https://concreteconceptsgroup.com" style="color: #D4A843; text-decoration: none;">concreteconceptsgroup.com</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const text = [
    `Thanks for reaching out, ${data.name}!`,
    ``,
    `We've received your quote request for ${data.service} in ${data.suburb} and one of our team will be in touch within 24 hours to discuss your project.`,
    ``,
    `Your Quote Summary:`,
    `- Service: ${data.service}`,
    `- Location: ${data.suburb}`,
    data.details ? `- Details: ${data.details}` : "",
    ``,
    data.statusToken ? `Track your quote status: https://concreteconceptsgroup.com/my-quote?token=${data.statusToken}` : "",
    ``,
    `Feel free to call us: 0424 463 268`,
    ``,
    `Concrete Concepts Group Pty Ltd`,
    `QBCC Licensed #15299707`,
    `concreteconceptsgroup.com`,
  ].filter(Boolean).join("\n");

  try {
    // Send auto-reply confirmation to the customer's email
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
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      // Don't fail the quote submission if auto-reply fails (e.g. unverified domain)
      console.warn("[Email] Auto-reply failed (may need domain verification):", response.status, errorBody);
      return false;
    }

    const result = await response.json();
    console.log("[Email] Customer confirmation sent successfully, id:", result.id);
    return true;
  } catch (err) {
    console.error("[Email] Failed to send customer confirmation:", err);
    return false;
  }
}
