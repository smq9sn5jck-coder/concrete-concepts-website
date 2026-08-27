import {
  EMAIL_PATTERN,
  attributionRows,
  cleanAttribution,
  cleanText,
  escapeHtml,
  jsonResponse,
  makePublicReference,
  makeRequestId,
  normalizeAustralianPhone,
  sendResendEmail,
  validateBaseRequest,
} from "./_lead-utils.js";

const REFERRER_TYPES = new Set(["private", "builder", "trade"]);

function normalizeReferral(input) {
  const referral = {
    referrerType: cleanText(input?.referrerType, 30),
    referrerName: cleanText(input?.referrerName, 100),
    referrerBusiness: cleanText(input?.referrerBusiness, 160),
    referrerPhone: cleanText(input?.referrerPhone, 24),
    referrerEmail: cleanText(input?.referrerEmail, 254),
    customerName: cleanText(input?.customerName, 100),
    customerPhone: cleanText(input?.customerPhone, 24),
    suburb: cleanText(input?.suburb, 120),
    projectType: cleanText(input?.projectType, 120),
    notes: cleanText(input?.notes, 4000),
    consentConfirmed: input?.consentConfirmed === true,
    company: cleanText(input?.company, 120),
    requestId: cleanText(input?.requestId, 128),
    attribution: cleanAttribution(input?.attribution),
  };

  if (!REFERRER_TYPES.has(referral.referrerType)) {
    return { error: "Please select who is making the referral." };
  }

  if (!referral.referrerName || !referral.referrerPhone) {
    return { error: "Please provide your name and phone number." };
  }

  if (
    (referral.referrerType === "builder" ||
      referral.referrerType === "trade") &&
    !referral.referrerBusiness
  ) {
    return { error: "Please provide your business name." };
  }

  if (!normalizeAustralianPhone(referral.referrerPhone)) {
    return { error: "Please enter a valid referrer phone number." };
  }

  if (referral.referrerEmail && !EMAIL_PATTERN.test(referral.referrerEmail)) {
    return { error: "Please enter a valid referrer email address." };
  }

  if (!referral.customerName || !referral.customerPhone) {
    return { error: "Please provide the customer name and phone number." };
  }

  if (!normalizeAustralianPhone(referral.customerPhone)) {
    return { error: "Please enter a valid customer phone number." };
  }

  if (!referral.suburb || !referral.projectType) {
    return { error: "Please provide the project suburb and type." };
  }

  if (!referral.consentConfirmed) {
    return {
      error: "Please confirm the customer has agreed to be contacted.",
    };
  }

  return { referral };
}

function referrerTypeLabel(type) {
  if (type === "builder") return "Builder";
  if (type === "trade") return "Trade Business";
  return "Private Individual";
}

function detailRow(label, value, shaded = false) {
  return `<tr${shaded ? ' style="background:#f5f5f5;"' : ""}><td style="font-weight:bold;width:160px;">${escapeHtml(label)}</td><td>${escapeHtml(value || "Not provided")}</td></tr>`;
}

function buildEmailHtml(referral, reference) {
  const notes = escapeHtml(
    referral.notes || "No additional details provided"
  ).replaceAll("\n", "<br>");

  return `
    <h2 style="color:#0f2a44;margin-bottom:8px;">New $100 Referral</h2>
    <p style="margin-top:0;color:#6b7280;">Reference: <strong>${escapeHtml(reference)}</strong></p>
    <h3 style="color:#1a1a1a;margin:24px 0 10px;">Referrer</h3>
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse;border-color:#ddd;width:100%;max-width:680px;">
      ${detailRow("Referrer Type", referrerTypeLabel(referral.referrerType), true)}
      ${detailRow("Name", referral.referrerName)}
      ${detailRow("Business", referral.referrerBusiness, true)}
      ${detailRow("Phone", referral.referrerPhone)}
      ${detailRow("Email", referral.referrerEmail, true)}
    </table>
    <h3 style="color:#1a1a1a;margin:24px 0 10px;">Referred Customer</h3>
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse;border-color:#ddd;width:100%;max-width:680px;">
      ${detailRow("Customer Name", referral.customerName, true)}
      ${detailRow("Customer Phone", referral.customerPhone)}
      ${detailRow("Project Suburb", referral.suburb, true)}
      ${detailRow("Project Type", referral.projectType)}
      <tr style="background:#f5f5f5;"><td style="font-weight:bold;">Project Notes</td><td>${notes}</td></tr>
      ${detailRow("Contact Permission", "Confirmed", false)}
    </table>
    <p style="margin-top:20px;padding:12px;background:#fff8e7;border-left:4px solid #d6a84b;color:#333;max-width:656px;">The $100 reward becomes payable only after the referred job is completed and paid in full, subject to program eligibility.</p>
    ${attributionRows(referral.attribution)}
    <p style="margin-top:20px;color:#666;font-size:12px;">This referral was captured from concreteconceptsgroup.com.</p>
  `;
}

export async function onRequest(context) {
  const { request, env = {} } = context;
  const baseError = validateBaseRequest(request, env);
  if (baseError) return baseError;

  try {
    const input = await request.json();
    const normalized = normalizeReferral(input);
    if (normalized.error) {
      return jsonResponse({ success: false, error: normalized.error }, 400);
    }

    const referral = normalized.referral;
    const requestId = makeRequestId(referral.requestId);
    const reference = makePublicReference("CCG-REF");

    if (referral.company) {
      return jsonResponse({
        success: true,
        channel: "email",
        requestId,
        reference,
      });
    }

    await sendResendEmail({
      apiKey: env.RESEND_API_KEY,
      requestId,
      namespace: "referral-lead",
      subject: `New $100 Referral: ${referral.projectType} - ${referral.suburb} (${referral.customerName})`,
      html: buildEmailHtml(referral, reference),
      replyTo: referral.referrerEmail || undefined,
    });

    return jsonResponse({
      success: true,
      channel: "email",
      requestId,
      reference,
    });
  } catch (error) {
    console.error("Referral delivery failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse(
      { success: false, error: "Failed to process referral" },
      502
    );
  }
}
