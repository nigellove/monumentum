import { supabase } from './supabase';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface OutboundCampaign {
  id: string;
  user_id: string;
  customer_id: string;
  campaign_name: string;
  target_product: string | null;
  target_icp: Record<string, any>;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface OutboundProspect {
  id: string;
  user_id: string;
  customer_id: string;
  campaign_id: string | null;

  // Prospect info
  prospect_name: string | null;
  prospect_email: string | null;
  prospect_title: string | null;
  prospect_linkedin_url: string | null;

  // Company info
  company_name: string | null;
  company_size: number | null;
  company_industry: string | null;
  company_website: string | null;
  company_location: string | null;

  // Enrichment
  enrichment_data: Record<string, any>;
  enrichment_provider: string | null;
  enrichment_confidence: number | null;

  // AI-generated content
  channel: 'email' | 'linkedin' | 'phone' | null;
  draft_subject: string | null;
  draft_message: string | null;
  personalization_notes: string | null;
  matched_product: string | null;
  match_score: number | null;

  // Review workflow
  review_status: ProspectStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  edited_message: string | null;
  edited_subject: string | null;
  rejection_reason: string | null;

  // Tracking
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  replied_at: string | null;
  reply_content: string | null;
  bounced_at: string | null;
  bounce_reason: string | null;
  unsubscribed_at: string | null;

  // Follow-up
  follow_up_count: number;
  last_follow_up_at: string | null;
  next_follow_up_at: string | null;

  created_at: string;
  updated_at: string;
}

export type ProspectStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'sent'
  | 'opened'
  | 'clicked'
  | 'replied'
  | 'bounced'
  | 'unsubscribed';

export interface OutboundUsage {
  id: string;
  user_id: string;
  customer_id: string;
  month_year: string;
  prospects_processed: number;
  enrichment_credits_used: number;
  emails_sent: number;
  linkedin_messages_sent: number;
  phone_calls_made: number;
  emails_opened: number;
  emails_clicked: number;
  emails_replied: number;
  emails_bounced: number;
  created_at: string;
  updated_at: string;
}

export interface OutboundSequence {
  id: string;
  user_id: string;
  customer_id: string;
  campaign_id: string | null;
  sequence_name: string;
  description: string | null;
  steps: SequenceStep[];
  active: boolean;
  auto_advance: boolean;
  created_at: string;
  updated_at: string;
}

export interface SequenceStep {
  day: number;
  channel: 'email' | 'linkedin' | 'phone';
  subject_template?: string;
  message_template: string;
}

export interface UsageLimits {
  limit_type: string;
  current_usage: number;
  limit: number;
  remaining: number;
  percentage_used: number;
  is_over_limit: boolean;
}

// ============================================================================
// CAMPAIGN FUNCTIONS
// ============================================================================

export async function getCampaigns() {
  const { data, error } = await supabase
    .from('outbound_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as OutboundCampaign[];
}

export async function getCampaign(id: string) {
  const { data, error } = await supabase
    .from('outbound_campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as OutboundCampaign;
}

export async function createCampaign(campaign: Partial<OutboundCampaign>) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  // Get customer_id from business_profiles
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('customer_id')
    .eq('user_id', user.user.id)
    .single();

  if (!profile?.customer_id) {
    throw new Error('No customer profile found');
  }

  const { data, error } = await supabase
    .from('outbound_campaigns')
    .insert({
      ...campaign,
      user_id: user.user.id,
      customer_id: profile.customer_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as OutboundCampaign;
}

export async function updateCampaign(
  id: string,
  updates: Partial<OutboundCampaign>
) {
  const { data, error} = await supabase
    .from('outbound_campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as OutboundCampaign;
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase
    .from('outbound_campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// PROSPECT FUNCTIONS
// ============================================================================

export async function getProspects(filters?: {
  campaign_id?: string;
  review_status?: ProspectStatus;
  channel?: 'email' | 'linkedin' | 'phone';
  matched_product?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('outbound_prospects')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.campaign_id) {
    query = query.eq('campaign_id', filters.campaign_id);
  }

  if (filters?.review_status) {
    query = query.eq('review_status', filters.review_status);
  }

  if (filters?.channel) {
    query = query.eq('channel', filters.channel);
  }

  if (filters?.matched_product) {
    query = query.eq('matched_product', filters.matched_product);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as OutboundProspect[];
}

export async function getProspect(id: string) {
  const { data, error } = await supabase
    .from('outbound_prospects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as OutboundProspect;
}

export async function approveProspect(
  id: string,
  editedMessage?: string,
  editedSubject?: string
) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const updates: Partial<OutboundProspect> = {
    review_status: 'approved',
    reviewed_by: user.user.id,
    reviewed_at: new Date().toISOString(),
  };

  if (editedMessage) {
    updates.edited_message = editedMessage;
  }

  if (editedSubject) {
    updates.edited_subject = editedSubject;
  }

  const { data, error } = await supabase
    .from('outbound_prospects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as OutboundProspect;
}

export async function rejectProspect(id: string, reason: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('outbound_prospects')
    .update({
      review_status: 'rejected',
      reviewed_by: user.user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as OutboundProspect;
}

export async function bulkApproveProspects(ids: string[]) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('outbound_prospects')
    .update({
      review_status: 'approved',
      reviewed_by: user.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .in('id', ids)
    .select();

  if (error) throw error;
  return data as OutboundProspect[];
}

export async function updateProspectStatus(
  id: string,
  status: ProspectStatus,
  trackingData?: Record<string, any>
) {
  const { error } = await supabase.rpc('update_prospect_status', {
    p_prospect_id: id,
    p_new_status: status,
    p_tracking_data: trackingData || {},
  });

  if (error) throw error;
}

export async function deleteProspect(id: string) {
  const { error } = await supabase
    .from('outbound_prospects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// USAGE FUNCTIONS
// ============================================================================

export async function getCurrentUsage() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  // Get business profile to find customer_id
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('customer_id')
    .eq('user_id', user.user.id)
    .single();

  if (!profile?.customer_id) {
    throw new Error('No customer profile found');
  }

  const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM

  const { data, error } = await supabase
    .from('outbound_usage')
    .select('*')
    .eq('customer_id', profile.customer_id)
    .eq('month_year', monthYear)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is OK
    throw error;
  }

  return (data as OutboundUsage) || {
    prospects_processed: 0,
    enrichment_credits_used: 0,
    emails_sent: 0,
    linkedin_messages_sent: 0,
    phone_calls_made: 0,
    emails_opened: 0,
    emails_clicked: 0,
    emails_replied: 0,
    emails_bounced: 0,
  };
}

export async function checkUsageLimits(
  limitType: 'prospects' | 'enrichment' | 'emails' | 'linkedin'
) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('customer_id')
    .eq('user_id', user.user.id)
    .single();

  if (!profile?.customer_id) {
    throw new Error('No customer profile found');
  }

  const { data, error } = await supabase.rpc('check_outbound_limits', {
    p_customer_id: profile.customer_id,
    p_limit_type: limitType,
  });

  if (error) throw error;
  return data as UsageLimits;
}

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

export async function getProspectStats(campaignId?: string) {
  let query = supabase.from('outbound_prospects').select('review_status');

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Count by status
  const stats = data.reduce(
    (acc, prospect) => {
      acc[prospect.review_status] = (acc[prospect.review_status] || 0) + 1;
      return acc;
    },
    {} as Record<ProspectStatus, number>
  );

  return {
    total: data.length,
    pending_review: stats.pending_review || 0,
    approved: stats.approved || 0,
    rejected: stats.rejected || 0,
    sent: stats.sent || 0,
    opened: stats.opened || 0,
    clicked: stats.clicked || 0,
    replied: stats.replied || 0,
    bounced: stats.bounced || 0,
    unsubscribed: stats.unsubscribed || 0,
    open_rate:
      stats.sent > 0 ? ((stats.opened || 0) / stats.sent) * 100 : 0,
    click_rate:
      stats.opened > 0 ? ((stats.clicked || 0) / stats.opened) * 100 : 0,
    reply_rate:
      stats.sent > 0 ? ((stats.replied || 0) / stats.sent) * 100 : 0,
  };
}

export async function getCampaignPerformance() {
  const campaigns = await getCampaigns();

  const performance = await Promise.all(
    campaigns.map(async (campaign) => {
      const stats = await getProspectStats(campaign.id);
      return {
        campaign_id: campaign.id,
        campaign_name: campaign.campaign_name,
        ...stats,
      };
    })
  );

  return performance;
}
