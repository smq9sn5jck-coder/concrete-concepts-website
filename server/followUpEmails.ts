/*
  Follow-Up Email Sequence
  Day 3: "Any questions?" check-in
  Day 7: Final follow-up with urgency
  Review Request: Sent when job is marked as "won"
*/

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "Concrete Concepts Group <info@concreteconceptsgroup.com>";
const PHONE = "0424 463 268";
const WEBSITE = "https://concreteconceptsgroup.com";

interface FollowUpRecipient {
  name: string;
  email: string;
  service: string;
  suburb: string;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[FollowUp] No RESEND_API_KEY, skipping email");
    return false;
  }
  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[FollowUp] Resend API error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[FollowUp] Email send error:", err);
    return false;
  }
}

/**
 * Day 1 Follow-Up: "What to Expect" process guide
 * Sent ~24 hours after quote submission to educate and build trust
 */
export async function sendDay1WhatToExpect(recipient: FollowUpRecipient): Promise<boolean> {
  const subject = `${recipient.name}, here's what happens next with your ${recipient.service.toLowerCase()} project`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#1a1a1a;padding:30px;text-align:center;">
      <h1 style="color:#c8a55c;margin:0;font-size:24px;">Concrete Concepts Group</h1>
    </div>
    <div style="padding:30px;">
      <h2 style="color:#1a1a1a;margin:0 0 15px;">Hi ${recipient.name},</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 15px;">
        Thanks again for your interest in our <strong>${recipient.service.toLowerCase()}</strong> services in <strong>${recipient.suburb}</strong>.
        We wanted to give you a quick overview of how our process works so you know exactly what to expect.
      </p>
      <h3 style="color:#1a1a1a;margin:20px 0 10px;font-size:16px;">Our 4-Step Process</h3>
      <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;vertical-align:top;width:40px;">
            <div style="background:#c8a55c;color:#1a1a1a;width:32px;height:32px;border-radius:50%;text-align:center;line-height:32px;font-weight:bold;">1</div>
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;">
            <strong style="color:#1a1a1a;">Free Site Visit</strong><br>
            <span style="color:#555;font-size:14px;">We'll visit your property to assess the site, take measurements, and discuss your vision. Usually within 2-3 business days of your enquiry.</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;vertical-align:top;">
            <div style="background:#c8a55c;color:#1a1a1a;width:32px;height:32px;border-radius:50%;text-align:center;line-height:32px;font-weight:bold;">2</div>
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;">
            <strong style="color:#1a1a1a;">Detailed Quote</strong><br>
            <span style="color:#555;font-size:14px;">You'll receive a clear, itemised quote with no hidden costs. We'll explain every line item so you can make an informed decision.</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;vertical-align:top;">
            <div style="background:#c8a55c;color:#1a1a1a;width:32px;height:32px;border-radius:50%;text-align:center;line-height:32px;font-weight:bold;">3</div>
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;">
            <strong style="color:#1a1a1a;">Scheduling</strong><br>
            <span style="color:#555;font-size:14px;">Once you approve the quote, we'll lock in a start date that works for you. Most projects begin within 1-3 weeks depending on the season.</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;vertical-align:top;">
            <div style="background:#c8a55c;color:#1a1a1a;width:32px;height:32px;border-radius:50%;text-align:center;line-height:32px;font-weight:bold;">4</div>
          </td>
          <td style="padding:12px;">
            <strong style="color:#1a1a1a;">Pour Day &amp; Completion</strong><br>
            <span style="color:#555;font-size:14px;">Our team handles everything from excavation to finishing. We clean up after ourselves and walk you through aftercare instructions.</span>
          </td>
        </tr>
      </table>
      <div style="background:#f9f7f2;border-left:4px solid #c8a55c;padding:15px;margin:0 0 20px;">
        <p style="color:#555;margin:0;font-size:14px;">
          <strong style="color:#1a1a1a;">Quick Tip:</strong> If you have any photos of the area or inspiration images, 
          send them through to us — it helps us give you the most accurate quote possible.
        </p>
      </div>
      <div style="text-align:center;margin:25px 0;">
        <a href="${WEBSITE}/get-quote" style="display:inline-block;background:#c8a55c;color:#1a1a1a;padding:14px 30px;text-decoration:none;font-weight:bold;border-radius:6px;font-size:16px;">
          Update Your Quote Details
        </a>
      </div>
      <p style="color:#555;line-height:1.6;margin:0 0 15px;">
        Got questions in the meantime? Just reply to this email or call Jarrod directly on 
        <a href="tel:0424463268" style="color:#c8a55c;font-weight:bold;">${PHONE}</a>.
      </p>
      <p style="color:#555;line-height:1.6;margin:20px 0 0;">
        Chat soon,<br><strong>Jarrod &amp; the Concrete Concepts Team</strong><br>
        <span style="color:#999;">QBCC Licensed #15299707</span>
      </p>
    </div>
    <div style="background:#f5f5f0;padding:20px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#999;font-size:12px;margin:0;">
        Concrete Concepts Group Pty Ltd | Brisbane, QLD<br>
        <a href="${WEBSITE}" style="color:#c8a55c;">concreteconceptsgroup.com</a> | ${PHONE}<br><br>
        <span style="font-size:11px;">Happy with our service? <a href="https://search.google.com/local/writereview?placeid=ChIJM0kDPMxZkWoR4a8_k28XlQk" style="color:#c8a55c;">Leave us a Google review</a></span>
      </p>
    </div>
  </div>
</body>
</html>`;
  const ok = await sendEmail(recipient.email, subject, html);
  if (ok) console.log(`[FollowUp] Day 1 "What to Expect" email sent to ${recipient.email}`);
  return ok;
}

/**
 * Day 3 Follow-Up: "Any questions?" check-in
 */
export async function sendDay3FollowUp(recipient: FollowUpRecipient): Promise<boolean> {
  const subject = `${recipient.name}, still thinking about your ${recipient.service.toLowerCase()} project?`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#1a1a1a;padding:30px;text-align:center;">
      <h1 style="color:#c8a55c;margin:0;font-size:24px;">Concrete Concepts Group</h1>
    </div>
    <div style="padding:30px;">
      <h2 style="color:#1a1a1a;margin:0 0 15px;">Hi ${recipient.name},</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 15px;">
        Just checking in on your <strong>${recipient.service.toLowerCase()}</strong> project in <strong>${recipient.suburb}</strong>. 
        We received your quote request a few days ago and wanted to make sure you have everything you need.
      </p>
      <p style="color:#555;line-height:1.6;margin:0 0 15px;"><strong>Do you have any questions?</strong> We're happy to:</p>
      <ul style="color:#555;line-height:1.8;margin:0 0 20px;padding-left:20px;">
        <li>Discuss your project requirements in more detail</li>
        <li>Provide a more accurate estimate based on site specifics</li>
        <li>Arrange a free on-site inspection at a time that suits you</li>
        <li>Show you examples of similar projects we've completed</li>
      </ul>
      <div style="text-align:center;margin:25px 0;">
        <a href="tel:0424463268" style="display:inline-block;background:#c8a55c;color:#1a1a1a;padding:14px 30px;text-decoration:none;font-weight:bold;border-radius:6px;font-size:16px;">
          Call Us: ${PHONE}
        </a>
      </div>
      <p style="color:#555;line-height:1.6;margin:0 0 15px;">Or simply reply to this email — we typically respond within a few hours.</p>
      <p style="color:#555;line-height:1.6;margin:20px 0 0;">
        Cheers,<br><strong>Jarrod &amp; the Concrete Concepts Team</strong><br>
        <span style="color:#999;">QBCC Licensed #15299707</span>
      </p>
    </div>
    <div style="background:#f5f5f0;padding:20px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#999;font-size:12px;margin:0;">
        Concrete Concepts Group Pty Ltd | Brisbane, QLD<br>
        <a href="${WEBSITE}" style="color:#c8a55c;">concreteconceptsgroup.com</a> | ${PHONE}<br><br>
        <span style="font-size:11px;">Happy with our service? <a href="https://search.google.com/local/writereview?placeid=ChIJM0kDPMxZkWoR4a8_k28XlQk" style="color:#c8a55c;">Leave us a Google review</a></span>
      </p>
    </div>
  </div>
</body>
</html>`;

  const ok = await sendEmail(recipient.email, subject, html);
  if (ok) console.log(`[FollowUp] Day 3 email sent to ${recipient.email}`);
  return ok;
}

/**
 * Day 7 Follow-Up: Final follow-up with urgency
 */
export async function sendDay7FollowUp(recipient: FollowUpRecipient): Promise<boolean> {
  const subject = `Last chance for a free quote on your ${recipient.service.toLowerCase()} — ${recipient.name}`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#1a1a1a;padding:30px;text-align:center;">
      <h1 style="color:#c8a55c;margin:0;font-size:24px;">Concrete Concepts Group</h1>
    </div>
    <div style="padding:30px;">
      <h2 style="color:#1a1a1a;margin:0 0 15px;">Hi ${recipient.name},</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 15px;">
        We wanted to reach out one last time about your <strong>${recipient.service.toLowerCase()}</strong> project in <strong>${recipient.suburb}</strong>.
      </p>
      <p style="color:#555;line-height:1.6;margin:0 0 15px;">
        We understand that choosing the right concreter is a big decision. Here's why Brisbane homeowners trust us:
      </p>
      <div style="background:#f9f7f2;border-left:4px solid #c8a55c;padding:15px;margin:20px 0;">
        <p style="color:#1a1a1a;margin:0 0 8px;font-weight:bold;">Why Concrete Concepts?</p>
        <ul style="color:#555;line-height:1.8;margin:0;padding-left:20px;">
          <li><strong>QBCC Licensed</strong> — Licence #15299707</li>
          <li><strong>Fully Insured</strong> — Public liability coverage</li>
          <li><strong>Free On-Site Quotes</strong> — No obligation, within 24 hours</li>
          <li><strong>Quality Guarantee</strong> — We stand behind every pour</li>
          <li><strong>Flexible Payment Options</strong> — Available for larger projects</li>
        </ul>
      </div>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        If you've already found someone for the job, no worries at all! But if you're still looking, we'd love the chance to earn your business.
      </p>
      <div style="text-align:center;margin:25px 0;">
        <a href="${WEBSITE}/get-quote" style="display:inline-block;background:#c8a55c;color:#1a1a1a;padding:14px 30px;text-decoration:none;font-weight:bold;border-radius:6px;font-size:16px;">
          Get Your Free Quote
        </a>
      </div>
      <p style="color:#555;line-height:1.6;margin:20px 0 0;">
        Cheers,<br><strong>Jarrod &amp; the Concrete Concepts Team</strong><br>
        <span style="color:#999;">QBCC Licensed #15299707</span>
      </p>
    </div>
    <div style="background:#f5f5f0;padding:20px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#999;font-size:12px;margin:0;">
        Concrete Concepts Group Pty Ltd | Brisbane, QLD<br>
        <a href="${WEBSITE}" style="color:#c8a55c;">concreteconceptsgroup.com</a> | ${PHONE}<br><br>
        <span style="font-size:11px;">You're receiving this because you requested a quote. This is our final follow-up.</span><br>
        <span style="font-size:11px;">Already a customer? <a href="https://search.google.com/local/writereview?placeid=ChIJM0kDPMxZkWoR4a8_k28XlQk" style="color:#c8a55c;">Leave us a Google review</a></span>
      </p>
    </div>
  </div>
</body>
</html>`;

  const ok = await sendEmail(recipient.email, subject, html);
  if (ok) console.log(`[FollowUp] Day 7 email sent to ${recipient.email}`);
  return ok;
}

/**
 * Review Request: Sent when job is marked as "won" in admin
 */
export async function sendReviewRequest(recipient: FollowUpRecipient): Promise<boolean> {
  const googleReviewUrl = `https://search.google.com/local/writereview?placeid=ChIJM0kDPMxZkWoR4a8_k28XlQk`;
  const subject = `How was your experience with Concrete Concepts, ${recipient.name}?`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#1a1a1a;padding:30px;text-align:center;">
      <h1 style="color:#c8a55c;margin:0;font-size:24px;">Concrete Concepts Group</h1>
    </div>
    <div style="padding:30px;">
      <h2 style="color:#1a1a1a;margin:0 0 15px;">Hi ${recipient.name},</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 15px;">
        Thank you for choosing Concrete Concepts Group for your <strong>${recipient.service.toLowerCase()}</strong> project in <strong>${recipient.suburb}</strong>. 
        We hope you're happy with the result!
      </p>
      <p style="color:#555;line-height:1.6;margin:0 0 15px;">
        If you have 30 seconds, we'd really appreciate a quick Google review. It helps other Brisbane homeowners find quality concreters and means the world to our small team.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${googleReviewUrl}" style="display:inline-block;background:#c8a55c;color:#1a1a1a;padding:16px 35px;text-decoration:none;font-weight:bold;border-radius:6px;font-size:18px;">
          ⭐ Leave a Google Review
        </a>
      </div>
      <p style="color:#555;line-height:1.6;margin:0 0 15px;"><strong>Not sure what to write?</strong> Here are some ideas:</p>
      <ul style="color:#555;line-height:1.8;margin:0 0 20px;padding-left:20px;">
        <li>What type of project did we complete?</li>
        <li>How was the communication and professionalism?</li>
        <li>Are you happy with the finished result?</li>
        <li>Would you recommend us to others?</li>
      </ul>
      <p style="color:#555;line-height:1.6;margin:0 0 15px;">
        If there's anything about your project you'd like us to address, please call us on <a href="tel:0424463268" style="color:#c8a55c;font-weight:bold;">${PHONE}</a>.
      </p>
      <p style="color:#555;line-height:1.6;margin:20px 0 0;">
        Thanks again,<br><strong>Jarrod &amp; the Concrete Concepts Team</strong><br>
        <span style="color:#999;">QBCC Licensed #15299707</span>
      </p>
    </div>
    <div style="background:#f5f5f0;padding:20px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#999;font-size:12px;margin:0;">
        Concrete Concepts Group Pty Ltd | Brisbane, QLD<br>
        <a href="${WEBSITE}" style="color:#c8a55c;">concreteconceptsgroup.com</a> | ${PHONE}
      </p>
    </div>
  </div>
</body>
</html>`;

  const ok = await sendEmail(recipient.email, subject, html);
  if (ok) console.log(`[FollowUp] Review request email sent to ${recipient.email}`);
  return ok;
}
