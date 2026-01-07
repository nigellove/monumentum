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

    const { user_id, action, new_product_id, product_id } = await req.json();

    if (!user_id || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get current user product(s)
    const { data: userProduct, error: productError } = await supabase
      .from('user_products')
      .select('*')
      .eq('user_id', user_id)
      .eq('product_id', product_id || '')
      .maybeSingle();

    if (productError && productError.code !== 'PGRST116') {
      return new Response(JSON.stringify({ error: 'Database error', details: productError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!userProduct && action !== 'cancel') {
      return new Response(JSON.stringify({ error: 'User product not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const before = userProduct ? { ...userProduct } : null;
    let after: any = null;
    let actionDetail = '';

    // Handle different actions
    switch (action) {
      case 'pause':
        after = { ...userProduct, status: 'paused' };
        await supabase
          .from('user_products')
          .update({ status: 'paused' })
          .eq('user_id', user_id)
          .eq('product_id', product_id);
        actionDetail = `Paused product: ${userProduct.product_name}`;
        break;

      case 'resume':
        after = { ...userProduct, status: 'active' };
        await supabase
          .from('user_products')
          .update({ status: 'active' })
          .eq('user_id', user_id)
          .eq('product_id', product_id);
        actionDetail = `Resumed product: ${userProduct.product_name}`;
        break;

      case 'cancel':
        after = { ...userProduct, status: 'canceled' };
        await supabase
          .from('user_products')
          .update({ status: 'canceled' })
          .eq('user_id', user_id)
          .eq('product_id', product_id);
        actionDetail = `Canceled product: ${userProduct?.product_name || 'unknown'}`;
        break;

      case 'change_product':
        if (!new_product_id) {
          return new Response(JSON.stringify({ error: 'new_product_id is required for change_product action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        after = { ...userProduct, product_id: new_product_id };
        await supabase
          .from('user_products')
          .update({ product_id: new_product_id })
          .eq('user_id', user_id)
          .eq('product_id', product_id);
        actionDetail = `Changed product from ${userProduct.product_id} to ${new_product_id}`;
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
      action: action,
      resource_type: 'user_product',
      resource_id: userProduct?.id || null,
      changes: { before, after },
      metadata: {
        user_id: user_id,
        product_id: product_id,
        action_detail: actionDetail
      }
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error managing subscription:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
