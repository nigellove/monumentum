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

    const { user_id, updates } = await req.json();

    if (!user_id || !updates) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get current user data
    const { data: targetUser, error: getUserError } = await supabase.auth.admin.getUserById(user_id);

    if (getUserError || !targetUser.user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const before = {
      email: targetUser.user.email,
      user_metadata: targetUser.user.user_metadata
    };

    // Update auth user if email or metadata changed
    if (updates.email || updates.user_metadata) {
      const authUpdates: any = {};
      if (updates.email) authUpdates.email = updates.email;
      if (updates.user_metadata) {
        authUpdates.user_metadata = {
          ...targetUser.user.user_metadata,
          ...updates.user_metadata
        };
      }

      await supabase.auth.admin.updateUserById(user_id, authUpdates);
    }

    // Update business profile if business fields changed
    if (updates.business_name || updates.business_email) {
      const { error: profileError } = await supabase
        .from('business_profiles')
        .update({
          ...(updates.business_name && { business_name: updates.business_name }),
          ...(updates.business_email && { business_email: updates.business_email })
        })
        .eq('user_id', user_id);

      if (profileError) {
        console.error('Error updating business profile:', profileError);
      }
    }

    const after = {
      email: updates.email || targetUser.user.email,
      user_metadata: updates.user_metadata
        ? { ...targetUser.user.user_metadata, ...updates.user_metadata }
        : targetUser.user.user_metadata
    };

    // Log audit entry
    await supabase.from('admin_audit_log').insert({
      admin_user_id: admin.id,
      admin_email: admin.email || 'unknown',
      action: 'update',
      resource_type: 'user',
      resource_id: user_id,
      changes: { before, after },
      metadata: {
        target_email: targetUser.user.email,
        updated_fields: Object.keys(updates)
      }
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
