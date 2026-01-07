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

    const { prospect_ids, action, updates } = await req.json();

    if (!prospect_ids || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Ensure prospect_ids is an array
    const ids = Array.isArray(prospect_ids) ? prospect_ids : [prospect_ids];

    if (ids.length === 0) {
      return new Response(JSON.stringify({ error: 'No prospect IDs provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get current prospects
    const { data: prospects, error: prospectsError } = await supabase
      .from('outbound_prospects')
      .select('*')
      .in('id', ids);

    if (prospectsError || !prospects || prospects.length === 0) {
      return new Response(JSON.stringify({ error: 'Prospects not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const before = prospects.map(p => ({ ...p }));
    let after: any = null;
    let actionDetail = '';
    let auditAction = action;

    // Handle different actions
    switch (action) {
      case 'bulk_approve':
        after = prospects.map(p => ({ ...p, review_status: 'approved' }));
        await supabase
          .from('outbound_prospects')
          .update({ review_status: 'approved', reviewed_at: new Date().toISOString() })
          .in('id', ids);
        actionDetail = `Bulk approved ${ids.length} prospect(s)`;
        break;

      case 'bulk_reject':
        after = prospects.map(p => ({ ...p, review_status: 'rejected' }));
        await supabase
          .from('outbound_prospects')
          .update({ review_status: 'rejected', reviewed_at: new Date().toISOString() })
          .in('id', ids);
        actionDetail = `Bulk rejected ${ids.length} prospect(s)`;
        break;

      case 'delete':
        await supabase
          .from('outbound_prospects')
          .delete()
          .in('id', ids);
        after = null;
        actionDetail = `Deleted ${ids.length} prospect(s)`;
        break;

      case 'update':
        if (!updates) {
          return new Response(JSON.stringify({ error: 'updates is required for update action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        after = prospects.map(p => ({ ...p, ...updates }));
        await supabase
          .from('outbound_prospects')
          .update(updates)
          .in('id', ids);
        actionDetail = `Updated ${ids.length} prospect(s)`;
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Log audit entry for each prospect (or bulk entry)
    if (ids.length === 1) {
      // Single prospect action
      await supabase.from('admin_audit_log').insert({
        admin_user_id: admin.id,
        admin_email: admin.email || 'unknown',
        action: auditAction,
        resource_type: 'prospect',
        resource_id: ids[0],
        changes: { before: before[0], after: after ? after[0] : null },
        metadata: {
          prospect_email: prospects[0].prospect_email,
          prospect_name: prospects[0].prospect_name,
          campaign_id: prospects[0].campaign_id,
          action_detail: actionDetail
        }
      });
    } else {
      // Bulk action
      await supabase.from('admin_audit_log').insert({
        admin_user_id: admin.id,
        admin_email: admin.email || 'unknown',
        action: auditAction,
        resource_type: 'prospect',
        resource_id: null, // Bulk action
        changes: { before, after },
        metadata: {
          prospect_count: ids.length,
          prospect_ids: ids,
          action_detail: actionDetail
        }
      });
    }

    return new Response(JSON.stringify({ success: true, affected_count: ids.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error managing prospects:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
