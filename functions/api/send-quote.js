/**
 * Cloudflare Worker Function
 * Sends quote request emails via Resend API
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

    // Get Resend API key from environment
    const RESEND_API_KEY = context.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Format email content
    const emailContent = `
New Quote Request

Name: ${name}
Phone: ${phone}
Email: ${email || "Not provided"}
Service: ${service}
Suburb: ${suburb}

Project Details:
${message || "No additional details provided"}

---
This email was sent from your website contact form.
    `.trim();

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "noreply@concreteconceptsgroup.com",
        to: "info@concreteconceptsgroup.com",
        subject: `New Quote Request — ${service} — ${suburb}`,
        text: emailContent,
        html: `
          <h2>New Quote Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email || "Not provided"}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Suburb:</strong> ${suburb}</p>
          <h3>Project Details:</h3>
          <p>${(message || "No additional details provided").replace(/\n/g, "<br>")}</p>
          <hr>
          <p><small>This email was sent from your website contact form.</small></p>
        `,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Quote request sent successfully",
        emailId: resendData.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing quote request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
