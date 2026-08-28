/**
 * Abandoned Quote Follow-Up Email
 * Sends a recovery email to visitors who started but didn't complete the quote form.
 * Triggered ~2 hours after partial form submission.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "Concrete Concepts Group <info@concreteconceptsgroup.com>";

interface AbandonedQuoteEmailData {
  email: string;
  name?: string | null;
  service?: string | null;
  suburb?: string | null;
}

/**
 * Send a friendly follow-up email to someone who started but didn't finish the quote form
 */
export async function sendAbandonedQuoteEmail(data: AbandonedQuoteEmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("[AbandonedQuote] RESEND_API_KEY is not set");
    return false;
  }

  const firstName = data.name?.split(" ")[0] || "there";
  const serviceText = data.service ? ` for your ${data.service.toLowerCase()} project` : "";
  const suburbText = data.suburb ? ` in ${data.suburb}` : "";

  const subject = data.name
    ? `${firstName}, still need a concrete quote${suburbText}?`
    : `Still looking for a concrete quote${suburbText}?`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ef; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2D2D2D 0%, #1a1a1a 100%); padding: 32px 40px; border-radius: 12px 12px 0 0; text-align: center;">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/ccg-full-navbar_2520906a.png" alt="Concrete Concepts Group" width="120" style="height: auto;" />
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-left: 1px solid #e8e4dc; border-right: 1px solid #e8e4dc;">
              <h1 style="margin: 0 0 16px; font-size: 24px; color: #2D2D2D; font-weight: 700;">
                Hi ${firstName} 👋
              </h1>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #555555;">
                We noticed you started a quote request${serviceText}${suburbText} but didn't get a chance to finish. No worries — we know life gets busy!
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #555555;">
                We'd love to help you with your project. Here's what you'll get with a free quote from Concrete Concepts Group:
              </p>
              
              <!-- Benefits -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #D4A843; font-size: 18px; margin-right: 8px;">✓</span>
                    <span style="color: #2D2D2D; font-size: 15px;">Free on-site assessment & detailed written quote</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #D4A843; font-size: 18px; margin-right: 8px;">✓</span>
                    <span style="color: #2D2D2D; font-size: 15px;">Response within 24 hours — often same day</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #D4A843; font-size: 18px; margin-right: 8px;">✓</span>
                    <span style="color: #2D2D2D; font-size: 15px;">QBCC Licensed & fully insured team</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #D4A843; font-size: 18px; margin-right: 8px;">✓</span>
                    <span style="color: #2D2D2D; font-size: 15px;">No obligation — completely free</span>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="https://concreteconceptsgroup.com/get-quote" style="display: inline-block; background-color: #D4A843; color: #2D2D2D; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                      COMPLETE YOUR QUOTE REQUEST →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #555555;">
                Or if you'd prefer to chat, give us a call on <a href="tel:0424463268" style="color: #D4A843; text-decoration: none; font-weight: 600;">0424 463 268</a> — we're available Mon–Sat, 6am–5pm.
              </p>
              
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #555555;">
                Looking forward to helping with your project!
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px; border-top: 1px solid #e8e4dc; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 15px; color: #2D2D2D; font-weight: 600;">The Concrete Concepts Group Team</p>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #888888;">Brisbane & Surrounding Areas</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2D2D2D; padding: 24px 40px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #888888;">
                Concrete Concepts Group Pty Ltd | Brisbane, QLD
              </p>
              <p style="margin: 0; font-size: 11px; color: #666666;">
                You're receiving this because you started a quote request on our website.
                <br />If you've already found a contractor, no worries — you won't hear from us again.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AbandonedQuote] Email send failed: ${response.status} ${errorText}`);
      return false;
    }

    console.log(`[AbandonedQuote] Recovery email sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error("[AbandonedQuote] Email send error:", error);
    return false;
  }
}
