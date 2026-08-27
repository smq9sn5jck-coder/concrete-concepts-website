export const PRODUCTION_ORIGINS = new Set([
  "https://concreteconceptsgroup.com",
  "https://www.concreteconceptsgroup.com",
]);

export const MAX_BODY_BYTES = 32 * 1024;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export function isAllowedOrigin(origin) {
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

export function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeAustralianPhone(value) {
  const digits = cleanText(value, 24).replace(/\D/g, "");
  const international = digits.startsWith("61")
    ? digits
    : digits.startsWith("0")
      ? `61${digits.slice(1)}`
      : "";

  if (!/^61[23478]\d{8}$/.test(international)) return null;
  if (/^(\d)\1+$/.test(international.slice(2))) return null;
  return `+${international}`;
}

export function makeRequestId(candidate) {
  if (/^[A-Za-z0-9_-]{8,128}$/.test(candidate || "")) return candidate;
  return crypto.randomUUID();
}

export function makePublicReference(prefix) {
  const value = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 6)
    .toUpperCase();
  return `${prefix}-${value}`;
}

export function cleanAttribution(input) {
  return {
    utmSource: cleanText(input?.utmSource, 200),
    utmMedium: cleanText(input?.utmMedium, 200),
    utmCampaign: cleanText(input?.utmCampaign, 200),
    utmContent: cleanText(input?.utmContent, 200),
    utmTerm: cleanText(input?.utmTerm, 200),
    gclid: cleanText(input?.gclid, 300),
    landingPage: cleanText(input?.landingPage, 2000),
    referringUrl: cleanText(input?.referringUrl, 2000),
    capturedAt: cleanText(input?.capturedAt, 100),
  };
}

export function attributionRows(attribution) {
  const rows = [
    ["UTM Source", attribution.utmSource],
    ["UTM Medium", attribution.utmMedium],
    ["UTM Campaign", attribution.utmCampaign],
    ["UTM Content", attribution.utmContent],
    ["UTM Term", attribution.utmTerm],
    ["Google Click ID", attribution.gclid],
    ["Landing Page", attribution.landingPage],
    ["Referring URL", attribution.referringUrl],
    ["Captured At", attribution.capturedAt],
  ].filter(([, value]) => value);

  if (rows.length === 0) return "";

  return `
    <h3 style="color:#1a1a1a;margin:24px 0 10px;">Lead Attribution</h3>
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse;border-color:#ddd;width:100%;max-width:680px;">
      ${rows
        .map(
          ([label, value], index) =>
            `<tr${index % 2 === 0 ? ' style="background:#f5f5f5;"' : ""}><td style="font-weight:bold;width:150px;">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`
        )
        .join("")}
    </table>`;
}

export async function sendResendEmail({
  apiKey,
  requestId,
  namespace,
  subject,
  html,
  replyTo,
}) {
  const body = {
    from: "noreply@concreteconceptsgroup.com",
    to: "info@concreteconceptsgroup.com",
    subject,
    html,
  };

  if (replyTo) body.reply_to = replyTo;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `${namespace}/${requestId}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Resend delivery failed with status ${response.status}`);
  }
}

export function validateBaseRequest(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  if (!isAllowedOrigin(request.headers.get("Origin"))) {
    return jsonResponse({ success: false, error: "Origin not allowed" }, 403);
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse(
      { success: false, error: "Content-Type must be application/json" },
      415
    );
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse(
      { success: false, error: "Request body is too large" },
      413
    );
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse(
      { success: false, error: "Lead delivery is temporarily unavailable" },
      503
    );
  }

  return null;
}
