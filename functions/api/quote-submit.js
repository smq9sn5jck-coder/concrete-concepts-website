// Cloudflare Pages Function: handles POST /api/quote-submit
// Sends notification email to business + auto-reply to customer via Resend API

const RESEND_API_URL = "https://api.resend.com/emails";
const NOTIFICATION_EMAIL = "info@concreteconceptsgroup.com";
const FROM_EMAIL = "Concrete Concepts Group <info@concreteconceptsgroup.com>";

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const data = await request.json();

    // Validate required fields
    if (
      !data.name || !data.phone || !data.email || !data.suburb || !data.service ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(data.submissionId || ""))
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!env.LEAD_BACKUP_DB?.prepare) {
      return new Response(
        JSON.stringify({ success: false, error: "Persistent quote storage is unavailable" }),
        { status: 503, headers: corsHeaders }
      );
    }

    const quoteId = `quote_${data.submissionId}`;
    const transactionId = `CCG-Q-${data.submissionId}`;
    const existing = await env.LEAD_BACKUP_DB
      .prepare("SELECT id FROM lead_backups WHERE id = ? AND lead_type = 'quote' LIMIT 1")
      .bind(quoteId)
      .first();
    if (existing?.id === quoteId) {
      return new Response(
        JSON.stringify({ success: true, quoteId, transactionId, duplicate: true, message: "Quote request already received" }),
        { status: 200, headers: corsHeaders }
      );
    }

    const persisted = await env.LEAD_BACKUP_DB.prepare(`
      INSERT INTO lead_backups (
        id, lead_type, created_at, name, phone, email, service, suburb,
        details, lead_source, photo_urls_json, job_brief_json
      ) VALUES (?, 'quote', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `).bind(
      quoteId,
      new Date().toISOString(),
      String(data.name),
      String(data.phone),
      String(data.email),
      String(data.service),
      String(data.suburb),
      String(data.details || ""),
      String(data.leadSource || "Direct"),
      JSON.stringify(Array.isArray(data.photoUrls) ? data.photoUrls : []),
      data.jobBrief ? JSON.stringify(data.jobBrief) : null,
    ).run();

    const changes = Number(persisted?.meta?.changes);
    if (persisted?.success !== true || (changes !== 1 && changes !== 0)) {
      return new Response(
        JSON.stringify({ success: false, error: "Persistent quote storage failed" }),
        { status: 503, headers: corsHeaders }
      );
    }
    if (changes === 0) {
      return new Response(
        JSON.stringify({ success: true, quoteId, transactionId, duplicate: true, message: "Quote request already received" }),
        { status: 200, headers: corsHeaders }
      );
    }

    const RESEND_API_KEY = env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 1. Send notification email to business
    const notificationHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #D4A843; margin: 0; font-size: 20px;">New Quote Request</h1>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px; width: 120px;">Name:</td>
              <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Phone:</td>
              <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                <a href="tel:${data.phone}" style="color: #D4A843; text-decoration: none;">${data.phone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Email:</td>
              <td style="padding: 8px 0; color: #333; font-size: 14px;">
                <a href="mailto:${data.email}" style="color: #D4A843; text-decoration: none;">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Suburb:</td>
              <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${data.suburb}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Service:</td>
              <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${data.service}</td>
            </tr>
            ${data.details ? `
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px; vertical-align: top;">Details:</td>
              <td style="padding: 8px 0; color: #333; font-size: 14px;">${data.details}</td>
            </tr>` : ""}
          </table>
          ${data.leadSource ? `<p style="margin: 16px 0 0; font-size: 12px; color: #aaa;">Source: ${data.leadSource}</p>` : ""}
          ${data.landingPage ? `<p style="margin: 4px 0 0; font-size: 12px; color: #aaa;">Landing: ${data.landingPage}</p>` : ""}
        </div>
      </div>
    `;

    const notificationResult = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [NOTIFICATION_EMAIL],
        subject: `New Quote: ${data.service} - ${data.suburb} (${data.name})`,
        html: notificationHtml,
      }),
    });

    if (!notificationResult.ok) {
      const errBody = await notificationResult.text();
      console.error("Notification email failed:", notificationResult.status, errBody);
    }

    // 2. Send auto-reply confirmation to customer
    const confirmationHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #D4A843; margin: 0; font-size: 22px;">Thanks, ${data.name}!</h1>
          <p style="color: #ccc; margin: 8px 0 0; font-size: 14px;">We've received your quote request</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
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

    const confirmResult = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [data.email],
        subject: `Thanks ${data.name} - We've received your quote request`,
        html: confirmationHtml,
      }),
    });

    if (!confirmResult.ok) {
      console.error("Confirmation email failed:", confirmResult.status);
    }

    return new Response(
      JSON.stringify({ success: true, quoteId, transactionId, duplicate: false, message: "Quote submitted successfully" }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Quote submission error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
