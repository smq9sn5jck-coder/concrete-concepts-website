/*
  SMS Follow-Up Integration
  Sends SMS follow-ups via Twilio on Day 3 and Day 7 after quote submission.
  Also sends instant SMS notification to business owner on new quote/callback.
  
  SETUP REQUIRED:
  1. Create a Twilio account at https://www.twilio.com
  2. Get a Twilio phone number (Australian number recommended)
  3. Set environment variables:
     - TWILIO_ACCOUNT_SID
     - TWILIO_AUTH_TOKEN
     - TWILIO_PHONE_NUMBER (e.g., +61412345678)
  
  The system will automatically fall back to email-only if Twilio is not configured.
*/

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? "";
const BUSINESS_PHONE = "+61424463268"; // Jarrod's number

/**
 * Check if Twilio is configured and ready to send SMS
 */
export function isTwilioConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

/**
 * Format Australian phone number to E.164 format
 * e.g., "0424 463 268" -> "+61424463268"
 */
function formatPhoneE164(phone: string): string {
  // Remove all spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-()]/g, "");
  
  // If starts with 0, replace with +61
  if (cleaned.startsWith("0")) {
    cleaned = "+61" + cleaned.substring(1);
  }
  
  // If doesn't start with +, add +61
  if (!cleaned.startsWith("+")) {
    cleaned = "+61" + cleaned;
  }
  
  return cleaned;
}

/**
 * Send SMS via Twilio API
 */
async function sendSms(to: string, body: string): Promise<boolean> {
  if (!isTwilioConfigured()) {
    console.log("[SMS] Twilio not configured, skipping SMS");
    return false;
  }

  const toFormatted = formatPhoneE164(to);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: toFormatted,
        From: TWILIO_PHONE_NUMBER,
        Body: body,
      }).toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[SMS] Twilio API error:", response.status, errorBody);
      return false;
    }

    const result = await response.json();
    console.log("[SMS] Message sent successfully, SID:", result.sid);
    return true;
  } catch (err) {
    console.error("[SMS] Failed to send SMS:", err);
    return false;
  }
}

/**
 * Send instant SMS notification to business owner about new quote
 */
export async function sendNewQuoteSms(data: {
  name: string;
  phone: string;
  service: string;
  suburb: string;
}): Promise<boolean> {
  const body = [
    `NEW QUOTE REQUEST`,
    `${data.name} — ${data.service}`,
    `${data.suburb}`,
    `Call: ${data.phone}`,
    ``,
    `Reply ASAP — first to quote wins!`,
  ].join("\n");

  return sendSms(BUSINESS_PHONE, body);
}

/**
 * Send instant SMS notification about callback request
 */
export async function sendCallbackSms(data: {
  name: string;
  phone: string;
}): Promise<boolean> {
  const body = [
    `URGENT CALLBACK`,
    `${data.name} wants a call back NOW!`,
    `Call: ${data.phone}`,
    ``,
    `Call within 60 seconds!`,
  ].join("\n");

  return sendSms(BUSINESS_PHONE, body);
}

/**
 * Day 3 SMS Follow-Up to customer
 */
export async function sendDay3SmsFollowUp(data: {
  name: string;
  phone: string;
  service: string;
}): Promise<boolean> {
  const body = [
    `Hi ${data.name}, it's Jarrod from Concrete Concepts Group.`,
    ``,
    `Just checking in on your ${data.service.toLowerCase()} project.`,
    `Any questions? Happy to chat or arrange a free on-site inspection.`,
    ``,
    `Call us: 0424 463 268`,
    `concreteconceptsgroup.com`,
  ].join("\n");

  return sendSms(data.phone, body);
}

/**
 * Day 7 SMS Follow-Up to customer (final)
 */
export async function sendDay7SmsFollowUp(data: {
  name: string;
  phone: string;
  service: string;
}): Promise<boolean> {
  const body = [
    `Hi ${data.name}, last follow-up from Concrete Concepts Group.`,
    ``,
    `Still thinking about your ${data.service.toLowerCase()}?`,
    `We'd love to help — QBCC licensed, fully insured, free quotes.`,
    ``,
    `Call: 0424 463 268 or reply to this text.`,
  ].join("\n");

  return sendSms(data.phone, body);
}

/**
 * Review request SMS after job completion
 */
export async function sendReviewRequestSms(data: {
  name: string;
  phone: string;
  service: string;
}): Promise<boolean> {
  const body = [
    `Hi ${data.name}! Thanks for choosing Concrete Concepts for your ${data.service.toLowerCase()}.`,
    ``,
    `If you're happy with the result, we'd really appreciate a quick Google review:`,
    `https://search.google.com/local/writereview?placeid=ChIJM0kDPMxZkWoR4a8_k28XlQk`,
    ``,
    `Thanks! — Jarrod & the team`,
  ].join("\n");

  return sendSms(data.phone, body);
}
