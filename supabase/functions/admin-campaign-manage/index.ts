import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Max-Age': '86400'
};

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

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: admin }, error: adminError } = await supabase.auth.getUser(token);

    if (adminError || !admin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    if (admin.user_metadata?.is_admin !== true) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { campaign_id, action, updates } = await req.json();

    if (!campaign_id || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get current campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('outbound_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const before = { ...campaign };
    let after: any = null;
    let actionDetail = '';
    let auditAction = action;

    // Handle different actions
    switch (action) {
      case 'pause':
        after = { ...campaign, status: 'paused' };
        await supabase
          .from('outbound_campaigns')
          .update({ status: 'paused', updated_at: new Date().toISOString() })
          .eq('id', campaign_id);
        actionDetail = `Paused campaign: ${campaign.campaign_name}`;
        break;

      case 'resume':
        after = { ...campaign, status: 'active' };
        await supabase
          .from('outbound_campaigns')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', campaign_id);
        actionDetail = `Resumed campaign: ${campaign.campaign_name}`;
        break;

      case 'delete':
        await supabase
          .from('outbound_campaigns')
          .delete()
          .eq('id', campaign_id);
        after = null;
        actionDetail = `Deleted campaign: ${campaign.campaign_name}`;
        break;

      case 'update':
        if (!updates) {
          return new Response(JSON.stringify({ error: 'updates is required for update action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        after = { ...campaign, ...updates };
        await supabase
          .from('outbound_campaigns')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', campaign_id);
        actionDetail = `Updated campaign: ${campaign.campaign_name}`;
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Log audit entry
    await supabase.from('admin_audit_log').insert({
      admin_user_id: admin.id,
      admin_email: admin.email || 'unknown',
      action: auditAction,
      resource_type: 'campaign',
      resource_id: campaign_id,
      changes: { before, after },
      metadata: {
        campaign_name: campaign.campaign_name,
        user_id: campaign.user_id,
        action_detail: actionDetail
      }
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error managing campaign:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
