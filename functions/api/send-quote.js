import {
  EMAIL_PATTERN,
  attributionRows,
  cleanAttribution,
  cleanText,
  escapeHtml,
  jsonResponse,
  makeRequestId,
  normalizeAustralianPhone,
  sendResendEmail,
  validateBaseRequest,
} from "./_lead-utils.js";

function normalizeLead(input) {
  const lead = {
    name: cleanText(input?.name, 100),
    email: cleanText(input?.email, 254),
    phone: cleanText(input?.phone, 24),
    service: cleanText(input?.service, 120),
    suburb: cleanText(input?.suburb, 120),
    message: cleanText(input?.message, 4000),
    company: cleanText(input?.company, 120),
    requestId: cleanText(input?.requestId, 128),
    attribution: cleanAttribution(input?.attribution),
  };

  if (!lead.name || !lead.phone || !lead.service || !lead.suburb) {
    return { error: "Please complete all required fields." };
  }
  if (!normalizeAustralianPhone(lead.phone)) {
    return { error: "Please enter a valid phone number." };
  }
  if (lead.email && !EMAIL_PATTERN.test(lead.email)) {
    return { error: "Please enter a valid email address." };
  }

  return { lead };
}

function buildEmailHtml(lead) {
  const details = escapeHtml(
    lead.message || "No additional details provided"
  ).replaceAll("\n", "<br>");
  const email = lead.email
    ? `<a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>`
    : "Not provided";

  return `
    <h2 style="color:#1a1a1a;margin-bottom:20px;">New Quote Request</h2>
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse;border-color:#ddd;width:100%;max-width:600px;">
      <tr style="background:#f5f5f5;"><td style="font-weight:bold;width:120px;">Name</td><td>${escapeHtml(lead.name)}</td></tr>
      <tr><td style="font-weight:bold;">Phone</td><td><a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a></td></tr>
      <tr style="background:#f5f5f5;"><td style="font-weight:bold;">Email</td><td>${email}</td></tr>
      <tr><td style="font-weight:bold;">Service</td><td>${escapeHtml(lead.service)}</td></tr>
      <tr style="background:#f5f5f5;"><td style="font-weight:bold;">Suburb</td><td>${escapeHtml(lead.suburb)}</td></tr>
      <tr><td style="font-weight:bold;">Details</td><td>${details}</td></tr>
    </table>
    ${attributionRows(lead.attribution)}
    <p style="margin-top:20px;color:#666;font-size:12px;">This lead was captured from concreteconceptsgroup.com</p>
  `;
}

export async function onRequest(context) {
  const { request, env = {} } = context;
  const baseError = validateBaseRequest(request, env);
  if (baseError) return baseError;

  try {
    const input = await request.json();
    const normalized = normalizeLead(input);
    if (normalized.error) {
      return jsonResponse({ success: false, error: normalized.error }, 400);
    }

    const lead = normalized.lead;
    const requestId = makeRequestId(lead.requestId);

    if (lead.company) {
      return jsonResponse({ success: true, channel: "email", requestId });
    }

    await sendResendEmail({
      apiKey: env.RESEND_API_KEY,
      requestId,
      namespace: "quote-lead",
      subject: `New Quote: ${lead.service} - ${lead.suburb} (${lead.name})`,
      html: buildEmailHtml(lead),
      replyTo: lead.email || undefined,
    });

    return jsonResponse({ success: true, channel: "email", requestId });
  } catch (error) {
    console.error("Lead delivery failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse(
      { success: false, error: "Failed to process quote request" },
      502
    );
  }
}
