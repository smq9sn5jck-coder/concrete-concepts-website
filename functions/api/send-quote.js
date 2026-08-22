const PRODUCTION_ORIGINS = new Set([
  "https://concreteconceptsgroup.com",
  "https://www.concreteconceptsgroup.com",
]);

const MAX_BODY_BYTES = 32 * 1024;
const PHONE_PATTERN = /^[+()\d\s-]{8,24}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (PRODUCTION_ORIGINS.has(origin)) return true;

  try {
    const url = new URL(origin);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".concrete-concepts-group.pages.dev")
    );
  } catch {
    return false;
  }
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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
  };

  if (!lead.name || !lead.phone || !lead.service || !lead.suburb) {
    return { error: "Please complete all required fields." };
  }
  if (!PHONE_PATTERN.test(lead.phone)) {
    return { error: "Please enter a valid phone number." };
  }
  if (lead.email && !EMAIL_PATTERN.test(lead.email)) {
    return { error: "Please enter a valid email address." };
  }

  return { lead };
}

function makeRequestId(candidate) {
  if (/^[A-Za-z0-9_-]{8,128}$/.test(candidate || "")) return candidate;
  return crypto.randomUUID();
}

function buildEmailHtml(lead) {
  const details = escapeHtml(lead.message || "No additional details provided").replaceAll("\n", "<br>");
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
    <p style="margin-top:20px;color:#666;font-size:12px;">This lead was captured from concreteconceptsgroup.com</p>
  `;
}

async function sendResendEmail(apiKey, lead, requestId) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `legacy-lead/${requestId}`,
    },
    body: JSON.stringify({
      from: "noreply@concreteconceptsgroup.com",
      to: "info@concreteconceptsgroup.com",
      subject: `New Quote: ${lead.service} - ${lead.suburb} (${lead.name})`,
      html: buildEmailHtml(lead),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend delivery failed with status ${response.status}`);
  }
}

export async function onRequest(context) {
  const { request, env = {} } = context;

  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  if (!isAllowedOrigin(request.headers.get("Origin"))) {
    return jsonResponse({ success: false, error: "Origin not allowed" }, 403);
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse({ success: false, error: "Content-Type must be application/json" }, 415);
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ success: false, error: "Request body is too large" }, 413);
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse({ success: false, error: "Lead delivery is temporarily unavailable" }, 503);
  }

  try {
    const input = await request.json();
    const normalized = normalizeLead(input);
    if (normalized.error) {
      return jsonResponse({ success: false, error: normalized.error }, 400);
    }

    const lead = normalized.lead;
    const requestId = makeRequestId(lead.requestId);

    // Honeypot submissions are acknowledged without sending external email.
    if (lead.company) {
      return jsonResponse({ success: true, channel: "email", requestId });
    }

    await sendResendEmail(env.RESEND_API_KEY, lead, requestId);
    return jsonResponse({ success: true, channel: "email", requestId });
  } catch (error) {
    console.error("Lead delivery failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse({ success: false, error: "Failed to process quote request" }, 502);
  }
}
