import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const email = url.searchParams.get('email');

    if (!userId && !email) {
      return new Response(
        JSON.stringify({ error: "user_id or email parameter is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let targetUserId = userId;

    if (email && !userId) {
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData.users.find(u => u.email === email);
      if (user) {
        targetUserId = user.id;
      } else {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const [businessResult, productsResult, userResult] = await Promise.all([
      supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle(),
      supabase
        .from("user_products")
        .select("*")
        .eq("user_id", targetUserId),
      supabase.auth.admin.getUserById(targetUserId!)
    ]);

    const responseData = {
      user_id: targetUserId,
      email: userResult.data.user?.email,
      business_profile: businessResult.data || null,
      products: productsResult.data || [],
      active_products: (productsResult.data || []).filter(p => p.status === 'active'),
    };

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});