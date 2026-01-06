#!/bin/bash

# Test Email Sending via Monumentum Edge Function
# This sends a test email to nigel@monumentum.ai

echo "🚀 Sending test email via AWS SES..."

curl -X POST https://nkwmfqbuhvtloihbrwef.supabase.co/functions/v1/send-outbound-email \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rd21mcWJ1aHZ0bG9paGJyd2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjEwOTQsImV4cCI6MjA3NTU5NzA5NH0.v6c3ULVYGOC96mcFOWxjE7P4Xvqrmq0i0G3KtKTWGcw" \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_id": "cccccccc-5555-6666-7777-888888888888",
    "campaign_id": "bbbbbbbb-1111-2222-3333-444444444444",
    "user_id": "3cc701a5-eee4-44ed-926e-7d9cc956f223"
  }' | json_pp

echo ""
echo "✅ Request sent!"
echo "📧 Check your email at: nigel@monumentum.ai"
echo "📊 Check email logs in Supabase:"
echo "   https://supabase.com/dashboard/project/nkwmfqbuhvtloihbrwef/editor"
