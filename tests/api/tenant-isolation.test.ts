/**
 * Critical API Tests: Tenant Isolation
 * Tests the send-outbound-email Edge Function for:
 * - Cross-tenant data access prevention
 * - customer_id validation between campaign and prospect
 * - Proper 403 error responses
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { generateTestId } from '../setup';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

describe('Tenant Isolation API', () => {
  let userA: { id: string; email: string; customerId: string; token: string; campaignId: string; prospectId: string };
  let userB: { id: string; email: string; customerId: string; token: string; campaignId: string; prospectId: string };

  beforeAll(async () => {
    // Create User A
    const emailA = `test_a_${generateTestId('email')}@example.com`;
    const { data: authDataA } = await supabase.auth.admin.createUser({
      email: emailA,
      password: 'TestPassword123!',
      email_confirm: true
    });

    const customerIdA = generateTestId('customer_a');

    await supabase.from('business_profiles').insert({
      user_id: authDataA!.user.id,
      customer_id: customerIdA,
      business_name: 'Test Business A',
      business_email: emailA
    });

    await supabase.from('user_products').insert({
      user_id: authDataA!.user.id,
      customer_id: customerIdA,
      product_id: 'outbound_sales_pro',
      product_name: 'Outbound Sales Agent - Pro',
      status: 'active'
    });

    const { data: sessionA } = await supabase.auth.signInWithPassword({
      email: emailA,
      password: 'TestPassword123!'
    });

    const { data: campaignA } = await supabase
      .from('outbound_campaigns')
      .insert({
        user_id: authDataA!.user.id,
        customer_id: customerIdA,
        campaign_name: 'Campaign A',
        sender_name: 'Sender A',
        reply_to_email: emailA,
        status: 'active'
      })
      .select()
      .single();

    const { data: prospectA } = await supabase
      .from('outbound_prospects')
      .insert({
        user_id: authDataA!.user.id,
        customer_id: customerIdA,
        campaign_id: campaignA.id,
        prospect_email: 'prospect_a@example.com',
        prospect_name: 'Prospect A',
        company: 'Company A',
        draft_subject: 'Subject A',
        draft_message: 'Message A',
        review_status: 'approved'
      })
      .select()
      .single();

    userA = {
      id: authDataA!.user.id,
      email: emailA,
      customerId: customerIdA,
      token: sessionA.session?.access_token || '',
      campaignId: campaignA.id,
      prospectId: prospectA.id
    };

    // Create User B (different customer)
    const emailB = `test_b_${generateTestId('email')}@example.com`;
    const { data: authDataB } = await supabase.auth.admin.createUser({
      email: emailB,
      password: 'TestPassword123!',
      email_confirm: true
    });

    const customerIdB = generateTestId('customer_b');

    await supabase.from('business_profiles').insert({
      user_id: authDataB!.user.id,
      customer_id: customerIdB,
      business_name: 'Test Business B',
      business_email: emailB
    });

    await supabase.from('user_products').insert({
      user_id: authDataB!.user.id,
      customer_id: customerIdB,
      product_id: 'outbound_sales_pro',
      product_name: 'Outbound Sales Agent - Pro',
      status: 'active'
    });

    const { data: sessionB } = await supabase.auth.signInWithPassword({
      email: emailB,
      password: 'TestPassword123!'
    });

    const { data: campaignB } = await supabase
      .from('outbound_campaigns')
      .insert({
        user_id: authDataB!.user.id,
        customer_id: customerIdB,
        campaign_name: 'Campaign B',
        sender_name: 'Sender B',
        reply_to_email: emailB,
        status: 'active'
      })
      .select()
      .single();

    const { data: prospectB } = await supabase
      .from('outbound_prospects')
      .insert({
        user_id: authDataB!.user.id,
        customer_id: customerIdB,
        campaign_id: campaignB.id,
        prospect_email: 'prospect_b@example.com',
        prospect_name: 'Prospect B',
        company: 'Company B',
        draft_subject: 'Subject B',
        draft_message: 'Message B',
        review_status: 'approved'
      })
      .select()
      .single();

    userB = {
      id: authDataB!.user.id,
      email: emailB,
      customerId: customerIdB,
      token: sessionB.session?.access_token || '',
      campaignId: campaignB.id,
      prospectId: prospectB.id
    };
  });

  afterAll(async () => {
    // Cleanup User A
    if (userA) {
      await supabase.from('outbound_email_logs').delete().eq('user_id', userA.id);
      await supabase.from('outbound_prospects').delete().eq('user_id', userA.id);
      await supabase.from('outbound_campaigns').delete().eq('user_id', userA.id);
      await supabase.from('user_products').delete().eq('user_id', userA.id);
      await supabase.from('business_profiles').delete().eq('user_id', userA.id);
      await supabase.auth.admin.deleteUser(userA.id);
    }

    // Cleanup User B
    if (userB) {
      await supabase.from('outbound_email_logs').delete().eq('user_id', userB.id);
      await supabase.from('outbound_prospects').delete().eq('user_id', userB.id);
      await supabase.from('outbound_campaigns').delete().eq('user_id', userB.id);
      await supabase.from('user_products').delete().eq('user_id', userB.id);
      await supabase.from('business_profiles').delete().eq('user_id', userB.id);
      await supabase.auth.admin.deleteUser(userB.id);
    }
  });

  it('should block User A from accessing User B prospect', async () => {
    // User A tries to send email to User B's prospect
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-outbound-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userA.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prospect_id: userB.prospectId, // User B's prospect
          campaign_id: userA.campaignId, // User A's campaign
          user_id: userA.id
        })
      }
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain('Tenant isolation violation');
  });

  it('should block User B from accessing User A campaign', async () => {
    // User B tries to send email using User A's campaign
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-outbound-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userB.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prospect_id: userB.prospectId, // User B's prospect
          campaign_id: userA.campaignId, // User A's campaign (MISMATCH!)
          user_id: userB.id
        })
      }
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain('Tenant isolation violation');
  });

  it('should allow same-tenant access', async () => {
    // User A accesses their own data (should work or fail for other reasons, not tenant isolation)
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-outbound-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userA.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prospect_id: userA.prospectId,
          campaign_id: userA.campaignId,
          user_id: userA.id
        })
      }
    );

    // Should NOT get tenant isolation error
    const data = await response.json();
    expect(data.error).not.toContain('Tenant isolation violation');
  });

  it('should prevent prospect with mismatched customer_id', async () => {
    // Manually create a prospect with User A's user_id but User B's customer_id (data corruption scenario)
    const { data: badProspect } = await supabase
      .from('outbound_prospects')
      .insert({
        user_id: userA.id,
        customer_id: userB.customerId, // WRONG customer_id!
        campaign_id: userA.campaignId,
        prospect_email: 'bad@example.com',
        prospect_name: 'Bad Prospect',
        company: 'Bad Company',
        draft_subject: 'Bad Subject',
        draft_message: 'Bad Message',
        review_status: 'approved'
      })
      .select()
      .single();

    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-outbound-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userA.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prospect_id: badProspect!.id,
          campaign_id: userA.campaignId,
          user_id: userA.id
        })
      }
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain('Tenant isolation violation');

    // Cleanup
    await supabase.from('outbound_prospects').delete().eq('id', badProspect!.id);
  });
});
