import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Max-Age': '86400'
};

interface SendEmailRequest {
  prospect_id: string;
  campaign_id: string;
  user_id: string;
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { prospect_id, campaign_id, user_id }: SendEmailRequest = await req.json();

    // Validate required fields
    if (!prospect_id || !campaign_id || !user_id) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: prospect_id, campaign_id, user_id'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch prospect data
    const { data: prospect, error: prospectError } = await supabase
      .from('outbound_prospects')
      .select('*')
      .eq('id', prospect_id)
      .eq('user_id', user_id)
      .single();

    if (prospectError || !prospect) {
      return new Response(JSON.stringify({
        error: 'Prospect not found',
        details: prospectError?.message
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch campaign data (for sender name and reply-to)
    const { data: campaign, error: campaignError } = await supabase
      .from('outbound_campaigns')
      .select('sender_name, reply_to_email, email_signature, customer_id')
      .eq('id', campaign_id)
      .eq('user_id', user_id)
      .single();

    if (campaignError || !campaign) {
      return new Response(JSON.stringify({
        error: 'Campaign not found',
        details: campaignError?.message
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // CRITICAL: Verify tenant isolation - campaign and prospect must have same customer_id
    if (campaign.customer_id !== prospect.customer_id) {
      console.error('Tenant isolation violation detected:', {
        campaign_customer_id: campaign.customer_id,
        prospect_customer_id: prospect.customer_id,
        user_id: user_id
      });
      return new Response(JSON.stringify({
        error: 'Access denied: Tenant isolation violation'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check daily usage limits (Basic: 50, Pro: 200, Enterprise: Unlimited)
    const today = new Date().toISOString().split('T')[0];
    const { count: emailsSentToday } = await supabase
      .from('outbound_email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .gte('sent_at', `${today}T00:00:00Z`)
      .eq('status', 'sent');

    // Get user's subscription tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    const tier = subscription?.tier || 'basic';
    const dailyLimit = tier === 'basic' ? 50 : tier === 'pro' ? 200 : 999999;

    if ((emailsSentToday || 0) >= dailyLimit) {
      return new Response(JSON.stringify({
        error: 'Daily email limit reached',
        limit: dailyLimit,
        sent: emailsSentToday
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Build email content
    const emailBody = campaign.email_signature
      ? `${prospect.draft_message}\n\n${campaign.email_signature}`
      : prospect.draft_message;

    const emailHtml = emailBody
      .split('\n')
      .map(line => line.trim() ? `<p style="margin:0 0 1em 0; line-height:1.6;">${line}</p>` : '<br>')
      .join('');

    // Send via AWS SES
    const awsAccessKey = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1';

    if (!awsAccessKey || !awsSecretKey) {
      throw new Error('AWS credentials not configured');
    }

    const { SESClient, SendEmailCommand } = await import('npm:@aws-sdk/client-ses@3.682.0');
    const sesClient = new SESClient({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey
      }
    });

    // Generate tracking pixel for open tracking
    const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email-open?prospect_id=${prospect_id}`;

    // SaaS Email Model:
    // From: "Sender Name" via Monumentum <sales@monumentum.com>
    // Reply-To: user's actual email (so replies go directly to them)
    const emailParams = {
      Source: `"${campaign.sender_name}" via Monumentum <sales@monumentum.com>`,
      Destination: {
        ToAddresses: [prospect.prospect_email]
      },
      ReplyToAddresses: [campaign.reply_to_email],
      Message: {
        Subject: {
          Data: prospect.draft_subject,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: emailBody,
            Charset: 'UTF-8'
          },
          Html: {
            Data: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color:#333; background-color:#ffffff;">
  <div style="max-width:600px; margin:0 auto; padding:20px;">
    ${emailHtml}
  </div>
  <img src="${trackingPixelUrl}" width="1" height="1" style="display:block;" alt="" />
</body>
</html>`,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const sendResult = await sesClient.send(new SendEmailCommand(emailParams));

    // Log the email send
    await supabase.from('outbound_email_logs').insert({
      prospect_id: prospect_id,
      campaign_id: campaign_id,
      user_id: user_id,
      customer_id: prospect.customer_id,
      subject: prospect.draft_subject,
      message_id: sendResult.MessageId,
      status: 'sent',
      sent_at: new Date().toISOString()
    });

    // Update prospect status
    await supabase
      .from('outbound_prospects')
      .update({
        email_status: 'sent',
        last_contacted_at: new Date().toISOString()
      })
      .eq('id', prospect_id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      message_id: sendResult.MessageId,
      emails_sent_today: (emailsSentToday || 0) + 1,
      daily_limit: dailyLimit
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error sending outbound email:', error);

    // Log failed attempt
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const body = await req.clone().json().catch(() => ({}));

      await supabase.from('outbound_email_logs').insert({
        prospect_id: body.prospect_id || null,
        campaign_id: body.campaign_id || null,
        user_id: body.user_id || null,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        sent_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(JSON.stringify({
      error: 'Failed to send email',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
