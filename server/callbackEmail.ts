/*
  Callback Email Notification
  Sends urgent email to business owner when someone requests a callback
  via the "Call Me Back in 60 Seconds" widget.
*/

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_API_URL = "https://api.resend.com/emails";
const NOTIFICATION_EMAIL = "info@concreteconceptsgroup.com";
const FROM_EMAIL = "Concrete Concepts Group <info@concreteconceptsgroup.com>";

interface CallbackEmailData {
  name: string;
  phone: string;
  page?: string;
}

/**
 * Send urgent callback notification email to business owner
 */
export async function sendCallbackNotificationEmail(data: CallbackEmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("[CallbackEmail] RESEND_API_KEY is not set");
    return false;
  }

  const subject = `URGENT: ${data.name} wants a callback NOW! — Call ${data.phone}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 20px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; color: #ffffff;">&#9742; CALLBACK REQUEST</h1>
        <p style="margin: 6px 0 0; font-size: 14px; color: #fecaca;">Call them back within 60 seconds!</p>
      </div>
      <div style="padding: 30px;">
        <div style="background: #262626; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #D4A843; font-weight: bold; width: 80px;">Name:</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 18px; font-weight: bold;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #D4A843; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;">
                <a href="tel:${data.phone.replace(/\s/g, "")}" style="color: #ffffff; text-decoration: none; font-size: 20px; font-weight: bold;">${data.phone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #D4A843; font-weight: bold;">Page:</td>
              <td style="padding: 8px 0; color: #999;">${data.page || "Homepage"}</td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="tel:${data.phone.replace(/\s/g, "")}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px;">
            &#9742; Call ${data.name} Now
          </a>
        </div>
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #333;">
          <p style="margin: 0; color: #666; font-size: 12px; text-align: center;">
            This callback was requested via the "Call Me Back in 60 Seconds" widget on your website.
            <br>Speed wins jobs — first to call gets the work!
          </p>
        </div>
      </div>
    </div>
  `;

  const text = [
    `URGENT CALLBACK REQUEST`,
    ``,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Page: ${data.page || "Homepage"}`,
    ``,
    `Call them back within 60 seconds!`,
    `Speed wins jobs — first to call gets the work!`,
  ].join("\n");

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [NOTIFICATION_EMAIL],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[CallbackEmail] Resend API error:", response.status, errorBody);
      return false;
    }

    const result = await response.json();
    console.log("[CallbackEmail] Urgent callback notification sent, id:", result.id);
    return true;
  } catch (err) {
    console.error("[CallbackEmail] Failed to send notification:", err);
    return false;
  }
}
