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

function normalizeEnquiry(input) {
  const enquiry = {
    name: cleanText(input?.name, 100),
    businessName: cleanText(input?.businessName, 160),
    email: cleanText(input?.email, 254),
    phone: cleanText(input?.phone, 24),
    businessType: cleanText(input?.businessType, 120),
    website: cleanText(input?.website, 500),
    growthProblem: cleanText(input?.growthProblem, 160),
    notes: cleanText(input?.notes, 4000),
    company: cleanText(input?.company, 120),
    requestId: cleanText(input?.requestId, 128),
    attribution: cleanAttribution(input?.attribution),
  };

  if (
    !enquiry.name ||
    !enquiry.businessName ||
    !enquiry.email ||
    !enquiry.phone ||
    !enquiry.businessType ||
    !enquiry.growthProblem
  ) {
    return { error: "Please complete all required fields." };
  }

  if (!EMAIL_PATTERN.test(enquiry.email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!normalizeAustralianPhone(enquiry.phone)) {
    return { error: "Please enter a valid Australian phone number." };
  }

  return { enquiry };
}

function detailRow(label, value, shaded = false) {
  return `<tr${shaded ? ' style="background:#f5f5f5;"' : ""}><td style="font-weight:bold;width:160px;">${escapeHtml(label)}</td><td>${escapeHtml(value || "Not provided")}</td></tr>`;
}

function buildEmailHtml(enquiry) {
  const notes = escapeHtml(
    enquiry.notes || "No additional details provided"
  ).replaceAll("\n", "<br>");

  return `
    <h2 style="color:#171717;margin-bottom:8px;">New CGS Growth Enquiry</h2>
    <p style="margin-top:0;color:#6b7280;">Construction Growth Systems</p>
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse;border-color:#ddd;width:100%;max-width:680px;">
      ${detailRow("Name", enquiry.name, true)}
      ${detailRow("Business", enquiry.businessName)}
      ${detailRow("Email", enquiry.email, true)}
      ${detailRow("Phone", enquiry.phone)}
      ${detailRow("Business Type", enquiry.businessType, true)}
      ${detailRow("Current Website", enquiry.website)}
      ${detailRow("Main Growth Problem", enquiry.growthProblem, true)}
      <tr><td style="font-weight:bold;">Additional Notes</td><td>${notes}</td></tr>
    </table>
    ${attributionRows(enquiry.attribution)}
    <p style="margin-top:20px;color:#666;font-size:12px;">This CGS enquiry was captured from concreteconceptsgroup.com.</p>
  `;
}

export async function onRequest(context) {
  const { request, env = {} } = context;
  const baseError = validateBaseRequest(request, env);
  if (baseError) return baseError;

  try {
    const input = await request.json();
    const normalized = normalizeEnquiry(input);
    if (normalized.error) {
      return jsonResponse({ success: false, error: normalized.error }, 400);
    }

    const enquiry = normalized.enquiry;
    const requestId = makeRequestId(enquiry.requestId);

    if (enquiry.company) {
      return jsonResponse({ success: true, channel: "email", requestId });
    }

    await sendResendEmail({
      apiKey: env.RESEND_API_KEY,
      requestId,
      namespace: "cgs-growth-lead",
      subject: `New CGS Growth Enquiry: ${enquiry.businessName} (${enquiry.growthProblem})`,
      html: buildEmailHtml(enquiry),
      replyTo: enquiry.email,
    });

    return jsonResponse({ success: true, channel: "email", requestId });
  } catch (error) {
    console.error("CGS enquiry delivery failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse(
      { success: false, error: "Failed to process CGS enquiry" },
      502
    );
  }
}
