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

    // Get platform statistics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [usersResult, activeProductsResult, revenueResult, emailsResult] = await Promise.all([
      // Total users
      supabase
        .from('business_profiles')
        .select('*', { count: 'exact', head: true }),

      // Active subscriptions (from user_products)
      supabase
        .from('user_products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),

      // Revenue calculation (get active products with product_id)
      supabase
        .from('user_products')
        .select('product_id')
        .eq('status', 'active'),

      // Emails sent in last 30 days
      supabase
        .from('outbound_email_logs')
        .select('*', { count: 'exact', head: true })
        .gte('sent_at', thirtyDaysAgo.toISOString())
        .eq('status', 'sent')
    ]);

    // Calculate monthly revenue from product_id
    const productPricing: Record<string, number> = {
      inbound_sales_agent: 9.99,
      customer_service_agent: 12.99,
      integrated_agent: 15.99,
      outbound_sales_starter: 39.99,
      outbound_sales_pro: 59.99,
      outbound_sales_enterprise: 0 // Custom pricing
    };

    const monthlyRevenue = (revenueResult.data || []).reduce((sum, product) => {
      return sum + (productPricing[product.product_id] || 0);
    }, 0);

    const stats = {
      totalUsers: usersResult.count || 0,
      activeSubscriptions: activeProductsResult.count || 0,
      monthlyRevenue,
      emailsSent30d: emailsResult.count || 0
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
