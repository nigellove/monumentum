import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Max-Age': '86400'
};

function sanitizeInput(input: string): string {
  return input.replace(/[<>"']/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '').trim().slice(0, 1000);
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateFormData(data: any) {
  const errors = [];
  if (!data.name || data.name.length < 1) {
    errors.push('Name is required');
  }
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const rawData = await req.json();
    const formData = {
      name: sanitizeInput(rawData.name || ''),
      email: sanitizeInput(rawData.email || ''),
      company: sanitizeInput(rawData.company || ''),
      product: sanitizeInput(rawData.product || ''),
      message: sanitizeInput(rawData.message || '')
    };

    const validation = validateFormData(formData);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.errors
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Save to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: submission, error: dbError } = await supabase.from('contact_submissions').insert({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      product: formData.product,
      message: formData.message,
      status: 'new'
    }).select().single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Send emails via SES
    const awsAccessKey = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION');
    const fromEmail = Deno.env.get('AWS_SES_FROM_EMAIL');

    if (awsAccessKey && awsSecretKey && awsRegion && fromEmail) {
      try {
        const { SESClient, SendEmailCommand } = await import('npm:@aws-sdk/client-ses@3.682.0');
        const sesClient = new SESClient({
          region: awsRegion,
          credentials: {
            accessKeyId: awsAccessKey,
            secretAccessKey: awsSecretKey
          }
        });

        // Thank you email to user
        const autoReplyHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monumentum Follow-up</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color:#F7F9FC;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F7F9FC">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="650" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.08); max-width:650px;">
          <tr>
            <td align="center" style="padding:50px 40px 40px 40px; background:linear-gradient(135deg, #0f172a 0%, #475569 100%); border-radius:12px 12px 0 0;">
              <h1 style="margin:0; color:#ffffff; font-size:36px; font-weight:700;">MONUMENTUM</h1>
              <p style="margin:10px 0 0 0; color:rgba(255,255,255,0.95); font-size:18px; letter-spacing:0.5px;">AI-Native Sales & Service Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 30px 40px; color:#333; font-size:17px; line-height:1.7;">
              <p style="margin:0 0 20px 0;">Hi <strong>${formData.name}</strong>,</p>
              <p style="margin:0 0 20px 0;">Thanks for reaching out! We received your message and will get back to you shortly.</p>
              <p style="margin:0;">We're excited to discuss how Monumentum can help transform your customer engagement.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 35px 40px;">
              <div style="padding:30px; background:#F0F9FF; border-left:4px solid #14b8a6; border-radius:8px;">
                <h3 style="margin:0 0 15px 0; color:#0f766e; font-size:20px; font-weight:600;">What We Do</h3>
                <p style="margin:0; color:#0f766e; font-size:15px; line-height:1.7;">Monumentum provides AI agents that automate sales lead capture and customer service. Get started with a 30 day free trial with our robust solution, that seamlessly integrates with your existing systems.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 50px 40px;">
              <div style="padding:30px; background:#f0fdfa; border-radius:8px; text-align:center;">
                <p style="margin:0; color:#1e293b; font-size:16px; font-weight:600;">Thanks for your interest!</p>
                <p style="margin:10px 0 0 0; color:#1e293b; font-size:15px; line-height:1.6;">One of our team members will reach out to discuss how we can help.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:30px 40px; font-size:13px; color:#999; background:#FAFBFC;">
              <p style="margin:0 0 8px 0;"><strong style="color:#666;">Monumentum, Inc.</strong></p>
              <p style="margin:0 0 8px 0;">AI-Native Sales & Service Platform</p>
              <p style="margin:0;"><a href="mailto:info@monumentum.ai" style="color:#14b8a6; text-decoration:none;">info@monumentum.ai</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const autoReplyParams = {
  Source: "Monumentum Team <contact@monumentum.ai>",
  Destination: {
    ToAddresses: [formData.email],
    CcAddresses: ['info@monumentum.ai']
  },
  Message: {
    Subject: {
      Data: 'Thank you for contacting Monumentum',
      Charset: 'UTF-8'
    },
    Body: {
      Html: {
        Data: autoReplyHtml,
        Charset: 'UTF-8'
      }
    }
  }
};

        await sesClient.send(new SendEmailCommand(autoReplyParams));
      } catch (emailError) {
        console.error('Email sending failed (non-critical):', emailError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Form submitted successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return new Response(JSON.stringify({
      error: 'Failed to submit form',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});