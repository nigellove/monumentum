// supabase/functions/agent/index.ts
// Multi-agent gateway for Monumentum / NeuroIQ
// Routes homepage + 3 customer agents to the correct n8n workflows.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",           // allow all embed domains
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

// Map agentType -> n8n webhook URL
const AGENT_MAP: Record<string, string> = {
  // 1) Your own homepage lead gen agent (React ChatWidget.tsx)
  homepage: "https://neuroiq.app.n8n.cloud/webhook/Monumentum-Lead-Gen-Homepage",

  // 2) Inbound Sales Agent (IB-Sales-Agent.js)
  sales: "https://neuroiq.app.n8n.cloud/webhook/Monumentum-IB-Sales",

  // 3) Customer Service Agent (Cust-Svc-Agent.js)
  service: "https://neuroiq.app.n8n.cloud/webhook/Monumentum-Svc-Agent",

  // 4) Integrated Agent (Integ-Agent.js)
  integrated: "https://neuroiq.app.n8n.cloud/webhook/Monumentum-Int-Agent",
};

serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: true, message: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: true, message: "Invalid JSON body" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Expect agentType in the payload. If missing, default to "homepage"
    const agentType =
      (body as any).agentType && typeof (body as any).agentType === "string"
        ? (body as any).agentType
        : "homepage";

    const targetUrl = AGENT_MAP[agentType];

    if (!targetUrl) {
      return new Response(
        JSON.stringify({
          error: true,
          message: `Unknown agentType: ${agentType}`,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Forward full body as-is to the appropriate n8n webhook
    const n8nRes = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const rawText = await n8nRes.text();
    let data: unknown;

    try {
      data = JSON.parse(rawText);
    } catch {
      // If n8n returns non-JSON, wrap it
      data = { raw: rawText };
    }

    return new Response(JSON.stringify(data), {
      status: n8nRes.ok ? 200 : n8nRes.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("Agent gateway error:", err);

    return new Response(
      JSON.stringify({
        error: true,
        message: "Agent gateway error",
        details: err?.message ?? String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
