import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

// 1x1 transparent GIF pixel (base64 encoded)
const TRACKING_PIXEL = Uint8Array.from(
  atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
  c => c.charCodeAt(0)
);

Deno.serve(async (req) => {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const prospect_id = url.searchParams.get('prospect_id');

    if (!prospect_id) {
      // Return pixel anyway (don't break email rendering)
      return new Response(TRACKING_PIXEL, {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // Track the open asynchronously (don't block pixel response)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update email log with open timestamp (only if not already opened)
    supabase
      .from('outbound_email_logs')
      .update({ opened_at: new Date().toISOString() })
      .eq('prospect_id', prospect_id)
      .is('opened_at', null)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to track email open:', error);
        }
      });

    // Update prospect engagement
    supabase
      .from('outbound_prospects')
      .update({ engagement_level: 'opened' })
      .eq('id', prospect_id)
      .eq('engagement_level', 'sent')
      .then(({ error }) => {
        if (error) {
          console.error('Failed to update prospect engagement:', error);
        }
      });

    // Return tracking pixel immediately
    return new Response(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error in tracking pixel:', error);

    // Always return pixel (don't break email rendering)
    return new Response(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
});
