// Deno/Supabase Edge Stripe Webhook with secure signature verification

import { createClient } from "npm:@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const N8N_WEBHOOK_URL = "https://neuroiq.app.n8n.cloud/webhook/provision";

// --- Stripe signature verification for Edge ---
async function verifyStripeSignature(body: string, sigHeader: string, secret: string): Promise<boolean> {
  if (!sigHeader) return false;
  // Stripe header format: t=timestamp,v1=signature
  const parts = sigHeader.split(',').reduce((acc, item) => {
    const [k, v] = item.split('=');
    acc[k] = v;
    return acc;
  }, {} as Record<string, string>);
  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;

  const encoder = new TextEncoder();
  const signedPayload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );
  const expected = Array.from(new Uint8Array(signatureBytes)).map(b => b.toString(16).padStart(2, '0')).join('');
  // Use timing-safe comparison
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// --- Main handler ---
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const sigHeader = req.headers.get("stripe-signature") ?? "";
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

    // Verify Stripe signature
    const valid = await verifyStripeSignature(body, sigHeader, webhookSecret);
    if (!valid) {
      return new Response(
        JSON.stringify({ error: "Invalid Stripe signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const event = JSON.parse(body);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      if (!email) {
        return new Response(
          JSON.stringify({ error: "No email found" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Look up user by email in Supabase Auth
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
      if (userError) {
        return new Response(
          JSON.stringify({ error: "User lookup failed", details: userError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const user = users.find((u: any) => u.email === email);
      if (!user) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const productId = user.user_metadata?.productId ?? "inbound_sales_agent";
      const businessNameDefault = email.split("@")[0].replace(/[._-]/g, " ");
      // Call n8n provision webhook
      const n8nPayload = {
        event: "checkout.completed",
        userId: user.id,
        email: email,
        productId: productId,
        business_name: businessNameDefault,
        business_description: "",
        business_address: "",
        business_email: email,
        platform: "html",
        platform_instructions: "Add the script to your website before the closing </body> tag",
        platform_guide_url: "https://monumentum.ai/docs/installation",
        stripeCustomerId: customerId,
        stripeSessionId: session.id,
        subscriptionId: subscriptionId,
        status: "trialing",
      };
      try {
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(n8nPayload),
        });
        // Don't fail webhook if n8n fails
      } catch (err) {
        // Don't fail webhook if n8n fails
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Webhook error", details: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});