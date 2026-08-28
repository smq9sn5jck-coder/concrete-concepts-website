/**
 * Customer Satisfaction Survey Email
 * Sends a survey link to customers 7 days after project completion.
 * Happy customers (4-5 stars) are routed to leave a Google review.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "Concrete Concepts Group <info@concreteconceptsgroup.com>";
const SITE_URL = "https://concreteconceptsgroup.com";

interface SurveyEmailData {
  email: string;
  name: string;
  token: string;
}

/**
 * Send a customer satisfaction survey email
 */
export async function sendSurveyEmail(data: SurveyEmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("[Survey] RESEND_API_KEY is not set");
    return false;
  }

  const firstName = data.name.split(" ")[0] || "there";
  const surveyUrl = `${SITE_URL}/survey/${data.token}`;

  const subject = `${firstName}, how did we go? Quick 30-second feedback`;

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
                Hi ${firstName}! 👋
              </h1>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #555555;">
                Thank you for choosing Concrete Concepts Group for your recent project. We hope you're happy with the results!
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #555555;">
                We'd love to hear your feedback — it only takes about 30 seconds and helps us continue to improve.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${surveyUrl}" style="display: inline-block; background-color: #D4A843; color: #2D2D2D; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                      SHARE YOUR FEEDBACK →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #555555;">
                Your honest feedback helps us deliver even better results for future customers. Whether it's a quick star rating or a few words, we genuinely appreciate it.
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
                You're receiving this because we recently completed a project for you.
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
      console.error(`[Survey] Email send failed: ${response.status} ${errorText}`);
      return false;
    }

    console.log(`[Survey] Survey email sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error("[Survey] Email send error:", error);
    return false;
  }
}
