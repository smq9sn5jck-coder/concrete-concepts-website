/**
 * Cloudflare Pages Function — handles tRPC-compatible form submissions
 * Routes: quote.submit, callback.submit
 * Forwards to CCG Lead Engine webhook and emails info@concreteconceptsgroup.com via Resend
 */

export async function onRequest(context) {
  const { request, env } = context;

  // Only handle POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body = await request.json();
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/trpc/', '');

    // Handle tRPC batch format
    if (path === 'quote.submit' || path === 'callback.submit') {
      const input = body['0']?.json || body;
      const isCallback = path === 'callback.submit';

      // Forward to CCG Lead Engine webhook
      const webhookPayload = {
        type: isCallback ? 'callback' : 'quote',
        name: input.name || '',
        email: input.email || '',
        phone: input.phone || '',
        message: input.message || input.notes || '',
        service: input.service || input.serviceType || '',
        suburb: input.suburb || '',
        source: input.source || 'website',
        utmSource: input.utmSource || '',
        utmMedium: input.utmMedium || '',
        utmCampaign: input.utmCampaign || '',
        utmContent: input.utmContent || '',
        gclid: input.gclid || '',
        fbclid: input.fbclid || '',
        landingPage: input.landingPage || '',
        referrer: input.referrer || '',
        timestamp: new Date().toISOString(),
      };

      // Send webhook (non-blocking)
      const webhookUrl = 'https://hook.us2.make.com/placeholder'; // CCG Lead Engine webhook
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      }).catch(() => {});

      // Send email notification via Resend
      const RESEND_API_KEY = env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        const emailSubject = isCallback
          ? `New Callback Request: ${input.name} - ${input.phone}`
          : `New Quote Request: ${input.name} - ${input.service || 'General'}`;

        const emailHtml = `
          <h2>${isCallback ? 'Callback Request' : 'Quote Request'}</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${input.name || '-'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${input.phone || '-'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${input.email || '-'}</td></tr>
            ${input.service ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Service</td><td style="padding:8px;border:1px solid #ddd">${input.service}</td></tr>` : ''}
            ${input.suburb ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Suburb</td><td style="padding:8px;border:1px solid #ddd">${input.suburb}</td></tr>` : ''}
            ${input.message ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Message</td><td style="padding:8px;border:1px solid #ddd">${input.message}</td></tr>` : ''}
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Source</td><td style="padding:8px;border:1px solid #ddd">${input.utmSource || input.source || 'Direct'} / ${input.utmMedium || '-'}</td></tr>
            ${input.gclid ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">GCLID</td><td style="padding:8px;border:1px solid #ddd">${input.gclid}</td></tr>` : ''}
            ${input.landingPage ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Landing Page</td><td style="padding:8px;border:1px solid #ddd">${input.landingPage}</td></tr>` : ''}
          </table>
          <p style="color:#666;font-size:12px;margin-top:16px">Submitted at ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' })} AEST</p>
        `;

        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Concrete Concepts Group <leads@concreteconceptsgroup.com>',
            to: ['info@concreteconceptsgroup.com'],
            subject: emailSubject,
            html: emailHtml,
          }),
        }).catch(() => {});
      }

      // Return tRPC-compatible success response
      return new Response(
        JSON.stringify([{ result: { data: { json: { success: true, message: 'Request submitted successfully' } } } }]),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Unknown route
    return new Response(
      JSON.stringify([{ result: { data: { json: { success: false, message: 'Unknown endpoint' } } } }]),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify([{ result: { data: { json: { success: false, message: 'Server error' } } } }]),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
