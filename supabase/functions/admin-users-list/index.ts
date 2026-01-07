import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    if (req.method !== 'GET') {
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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    if (user.user_metadata?.is_admin !== true) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get all business profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('business_profiles')
      .select('user_id, customer_id, business_name, business_email, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // Get all user products (subscriptions)
    const { data: userProducts } = await supabase
      .from('user_products')
      .select('user_id, id, product_id, product_name, status, stripe_subscription_id, trial_ends_at');

    // Create product map
    const productMap = new Map();
    (userProducts || []).forEach(product => {
      productMap.set(product.user_id, product);
    });

    // Get auth user data for each profile
    const usersWithAuth = await Promise.all(
      (profiles || []).map(async (profile) => {
        try {
          const { data: authData } = await supabase.auth.admin.getUserById(profile.user_id);

          return {
            id: profile.user_id,
            email: authData.user?.email || 'N/A',
            created_at: authData.user?.created_at || profile.created_at,
            user_metadata: authData.user?.user_metadata || {},
            customer_id: profile.customer_id,
            business_name: profile.business_name,
            business_email: profile.business_email,
            subscription: productMap.get(profile.user_id) || null,
            blocked: authData.user?.user_metadata?.blocked || false
          };
        } catch (err) {
          console.error('Error fetching auth data for user:', profile.user_id, err);
          return {
            id: profile.user_id,
            email: 'Error loading',
            created_at: profile.created_at,
            user_metadata: {},
            customer_id: profile.customer_id,
            business_name: profile.business_name,
            business_email: profile.business_email,
            subscription: productMap.get(profile.user_id) || null,
            blocked: false
          };
        }
      })
    );

    // Log audit entry for viewing user list
    await supabase.from('admin_audit_log').insert({
      admin_user_id: user.id,
      admin_email: user.email || 'unknown',
      action: 'view',
      resource_type: 'user',
      resource_id: null,
      changes: null,
      metadata: {
        user_count: usersWithAuth.length,
        action_detail: 'Viewed user list'
      }
    });

    return new Response(JSON.stringify(usersWithAuth), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching users list:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
