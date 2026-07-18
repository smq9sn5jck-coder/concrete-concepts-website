/**
 * Cloudflare Worker Function
 * Multi-channel lead capture: Resend Email + Jotform + SMS
 * Endpoint: POST /api/send-quote
 */

export async function onRequest(context) {
  const { request } = context;

  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { name, email, phone, service, suburb, message } = body;

    // Validate required fields
    if (!name || !phone || !service || !suburb) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get API keys from environment
    const RESEND_API_KEY = context.env.RESEND_API_KEY;
    const JOTFORM_API_KEY = "d16496444df6c6fa6af42c4e361892f6";
    const JOTFORM_FORM_ID = "261984004033855";

    // Run all channels in parallel - never lose a lead
    const results = await Promise.allSettled([
      // Channel 1: Send email via Resend API
      sendResendEmail(RESEND_API_KEY, { name, email, phone, service, suburb, message }),
      // Channel 2: Submit to Jotform for backup
      submitToJotform(JOTFORM_API_KEY, JOTFORM_FORM_ID, { name, email, phone, service, suburb, message }),
    ]);

    // Log results for debugging
    const emailResult = results[0];
    const jotformResult = results[1];

    console.log("Email:", emailResult.status, emailResult.value || emailResult.reason);
    console.log("Jotform:", jotformResult.status, jotformResult.value || jotformResult.reason);

    // As long as at least one channel succeeded, return success
    const anySuccess = results.some(r => r.status === "fulfilled" && r.value?.success);

    if (anySuccess) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Quote request sent successfully",
          channels: {
            email: emailResult.status === "fulfilled" ? "sent" : "failed",
            jotform: jotformResult.status === "fulfilled" ? "logged" : "failed",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // All channels failed
    return new Response(
      JSON.stringify({ error: "Failed to process quote request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing quote request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Channel 1: Send formatted email via Resend API
 */
async function sendResendEmail(apiKey, { name, email, phone, service, suburb, message }) {
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const htmlBody = `
    <h2 style="color:#1a1a1a;margin-bottom:20px;">New Quote Request</h2>
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse;border-color:#ddd;width:100%;max-width:600px;">
      <tr style="background:#f5f5f5;"><td style="font-weight:bold;width:120px;">Name</td><td>${name}</td></tr>
      <tr><td style="font-weight:bold;">Phone</td><td><a href="tel:${phone}">${phone}</a></td></tr>
      <tr style="background:#f5f5f5;"><td style="font-weight:bold;">Email</td><td>${email ? `<a href="mailto:${email}">${email}</a>` : "Not provided"}</td></tr>
      <tr><td style="font-weight:bold;">Service</td><td>${service}</td></tr>
      <tr style="background:#f5f5f5;"><td style="font-weight:bold;">Suburb</td><td>${suburb}</td></tr>
      <tr><td style="font-weight:bold;">Details</td><td>${(message || "No additional details provided").replace(/\n/g, "<br>")}</td></tr>
    </table>
    <p style="margin-top:20px;color:#666;font-size:12px;">This lead was captured from concreteconceptsgroup.com</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "noreply@concreteconceptsgroup.com",
      to: "info@concreteconceptsgroup.com",
      subject: `New Quote: ${service} - ${suburb} (${name})`,
      html: htmlBody,
    }),
  });

  const data = await response.json();
  return { success: response.ok, data };
}

/**
 * Channel 2: Submit to Jotform for backup logging
 */
async function submitToJotform(apiKey, formId, { name, email, phone, service, suburb, message }) {
  const params = new URLSearchParams();
  params.append("submission[1]", name);
  params.append("submission[2]", phone);
  params.append("submission[3]", email || "Not provided");
  params.append("submission[4]", service);
  params.append("submission[5]", suburb);
  params.append("submission[6]", message || "No additional details");

  const response = await fetch(
    `https://api.jotform.com/form/${formId}/submissions?apiKey=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );

  const data = await response.json();
  return { success: data.responseCode === 200, data };
}
