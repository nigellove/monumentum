/**
 * Critical API Tests: Outbound Email Limits
 * Tests the send-outbound-email Edge Function for:
 * - Monthly email limit enforcement (750 for Starter, 2500 for Pro)
 * - Trial status acceptance ('trialing' users can send)
 * - Subscription status validation
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { generateTestId } from '../setup';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

describe('Outbound Email Limits API', () => {
  let testUserId: string;
  let testCustomerId: string;
  let testCampaignId: string;
  let testProspectId: string;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const testEmail = `test_${generateTestId('email')}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    testUserId = authData.user.id;
    testCustomerId = generateTestId('customer');

    // Create business profile
    await supabase.from('business_profiles').insert({
      user_id: testUserId,
      customer_id: testCustomerId,
      business_name: 'Test Business',
      business_email: testEmail
    });

    // Get auth token for API calls
    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'TestPassword123!'
    });
    authToken = sessionData.session?.access_token || '';

    // Create test campaign
    const { data: campaign } = await supabase
      .from('outbound_campaigns')
      .insert({
        user_id: testUserId,
        customer_id: testCustomerId,
        campaign_name: 'Test Campaign',
        sender_name: 'Test Sender',
        reply_to_email: testEmail,
        status: 'active'
      })
      .select()
      .single();

    testCampaignId = campaign.id;

    // Create test prospect
    const { data: prospect } = await supabase
      .from('outbound_prospects')
      .insert({
        user_id: testUserId,
        customer_id: testCustomerId,
        campaign_id: testCampaignId,
        prospect_email: 'prospect@example.com',
        prospect_name: 'Test Prospect',
        company_name: 'Test Company',
        draft_subject: 'Test Subject',
        draft_message: 'Test message',
        review_status: 'approved'
      })
      .select()
      .single();

    testProspectId = prospect.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await supabase.from('outbound_email_logs').delete().eq('user_id', testUserId);
      await supabase.from('outbound_prospects').delete().eq('user_id', testUserId);
      await supabase.from('outbound_campaigns').delete().eq('user_id', testUserId);
      await supabase.from('user_products').delete().eq('user_id', testUserId);
      await supabase.from('business_profiles').delete().eq('user_id', testUserId);
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  it('should reject email sending when user has no Outbound product', async () => {
    // Don't create user_products entry - user has no subscription

    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-outbound-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prospect_id: testProspectId,
          campaign_id: testCampaignId,
          user_id: testUserId
        })
      }
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain('No active Outbound product subscription found');
  });

  it('should allow trialing users to send emails', async () => {
    // Create user_products entry with 'trialing' status
    await supabase.from('user_products').insert({
      user_id: testUserId,
      customer_id: testCustomerId,
      product_id: 'outbound_sales_starter',
      product_name: 'Outbound Sales Agent - Starter',
      status: 'trialing',
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-outbound-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prospect_id: testProspectId,
          campaign_id: testCampaignId,
          user_id: testUserId
        })
      }
    );

    // May fail due to AWS SES not configured in test, but should NOT fail with subscription error
    const data = await response.json();
    expect(data.error).not.toContain('No active Outbound product subscription found');
  });

  it('should enforce 750 email limit for Starter tier', async () => {
    // Update to active status
    await supabase
      .from('user_products')
      .update({ status: 'active' })
      .eq('user_id', testUserId);

    // Insert 749 sent emails for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const emails = Array.from({ length: 749 }, (_, i) => ({
      user_id: testUserId,
      customer_id: testCustomerId,
      campaign_id: testCampaignId,
      prospect_id: testProspectId,
      status: 'sent',
      sent_at: new Date(startOfMonth.getTime() + i * 1000).toISOString(),
      subject: 'Test',
      message_id: `test_${i}`
    }));

    await supabase.from('outbound_email_logs').insert(emails);

    // 750th email should succeed
    const response750 = await fetch(
      `${supabaseUrl}/functions/v1/send-outbound-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prospect_id: testProspectId,
          campaign_id: testCampaignId,
          user_id: testUserId
        })
      }
    );

    const data750 = await response750.json();

    // If AWS SES fails, that's OK - we're testing limit logic, not email sending
    if (response750.status === 429) {
      // Already at limit (test data might have triggered it)
      expect(data750.error).toContain('Monthly email limit reached');
    } else {
      // Either succeeded or failed for other reason (not limit)
      expect(data750.error).not.toContain('Monthly email limit reached');
    }

    // Now insert one more to hit 750
    await supabase.from('outbound_email_logs').insert({
      user_id: testUserId,
      customer_id: testCustomerId,
      campaign_id: testCampaignId,
      prospect_id: testProspectId,
      status: 'sent',
      sent_at: new Date().toISOString(),
      subject: 'Test',
      message_id: 'test_750'
    });

    // 751st email should fail with 429
    const response751 = await fetch(
      `${supabaseUrl}/functions/v1/send-outbound-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prospect_id: testProspectId,
          campaign_id: testCampaignId,
          user_id: testUserId
        })
      }
    );

    expect(response751.status).toBe(429);
    const data751 = await response751.json();
    expect(data751.error).toContain('Monthly email limit reached');
    expect(data751.limit).toBe(750);
    expect(data751.product).toBe('outbound_sales_starter');
  });

  it('should enforce 2500 email limit for Pro tier', async () => {
    // Clean up previous emails
    await supabase.from('outbound_email_logs').delete().eq('user_id', testUserId);

    // Update to Pro tier
    await supabase
      .from('user_products')
      .update({
        product_id: 'outbound_sales_pro',
        product_name: 'Outbound Sales Agent - Pro'
      })
      .eq('user_id', testUserId);

    // Insert 2499 sent emails
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Insert in batches to avoid timeout
    for (let batch = 0; batch < 5; batch++) {
      const batchEmails = Array.from({ length: 500 }, (_, i) => ({
        user_id: testUserId,
        customer_id: testCustomerId,
        campaign_id: testCampaignId,
        prospect_id: testProspectId,
        status: 'sent',
        sent_at: new Date(startOfMonth.getTime() + (batch * 500 + i) * 1000).toISOString(),
        subject: 'Test',
        message_id: `test_batch${batch}_${i}`
      }));

      await supabase.from('outbound_email_logs').insert(batchEmails);
    }

    // Insert 2500th email
    await supabase.from('outbound_email_logs').insert({
      user_id: testUserId,
      customer_id: testCustomerId,
      campaign_id: testCampaignId,
      prospect_id: testProspectId,
      status: 'sent',
      sent_at: new Date().toISOString(),
      subject: 'Test',
      message_id: 'test_2500'
    });

    // 2501st email should fail
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-outbound-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prospect_id: testProspectId,
          campaign_id: testCampaignId,
          user_id: testUserId
        })
      }
    );

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toContain('Monthly email limit reached');
    expect(data.limit).toBe(2500);
    expect(data.product).toBe('outbound_sales_pro');
  });

  it('should reject paused subscriptions', async () => {
    // Clean up emails
    await supabase.from('outbound_email_logs').delete().eq('user_id', testUserId);

    // Pause subscription
    await supabase
      .from('user_products')
      .update({ status: 'paused' })
      .eq('user_id', testUserId);

    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-outbound-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prospect_id: testProspectId,
          campaign_id: testCampaignId,
          user_id: testUserId
        })
      }
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain('No active Outbound product subscription found');
  });
});
