// supabase/functions/cancel-subscription/index.ts
import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import Stripe from "npm:stripe@16";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { immediate = false } = await req.json().catch(() => ({ immediate: false }));

    // Find Stripe customer record
    const { data: sc, error: scError } = await supabase
      .from("stripe_customers")
      .select("customer_id")
      .eq("user_id", user.id)
      .single();

    if (scError || !sc?.customer_id) {
      return new Response(JSON.stringify({ error: "No Stripe customer found" }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Retrieve active subscription
    const subs = await stripe.subscriptions.list({
      customer: sc.customer_id,
      status: "active",
      limit: 1,
    });

    if (subs.data.length === 0) {
      return new Response(JSON.stringify({ message: "No active subscription" }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const subscription = subs.data[0];

    // Cancel strategy
    const result = immediate
      ? await stripe.subscriptions.cancel(subscription.id)
      : await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });

    // Update database
    await supabase
      .from("stripe_subscriptions")
      .update({
        subscription_id: result.id,
        price_id: result.items?.data?.[0]?.price?.id ?? null,
        current_period_start: result.current_period_start ?? null,
        current_period_end: result.current_period_end ?? null,
        cancel_at_period_end: result.cancel_at_period_end ?? false,
        status: result.status ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("customer_id", sc.customer_id);

    if (immediate) {
      await supabase
        .from("user_products")
        .update({ status: "cancelled", expires_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({ success: true, subscription: result }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (e) {
    console.error("Error in cancel-subscription:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});