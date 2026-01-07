import { supabase } from '../supabase';

/**
 * Admin API client for making authenticated admin requests
 */

interface PlatformStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  emailsSent30d: number;
}

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: any;
  customer_id?: string;
  business_name?: string;
  subscription?: any;
}

interface UsageStats {
  period_start: string;
  period_end: string;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  emails_replied: number;
  prospects_generated: number;
  prospects_approved: number;
}

interface AuditLogEntry {
  id: string;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  changes: any;
  metadata: any;
  created_at: string;
}

/**
 * Get platform-wide statistics
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-platform-stats`,
    {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch platform stats');
  }

  return response.json();
}

/**
 * Get all users with their profiles and subscriptions
 */
export async function getUsers(): Promise<AdminUser[]> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users-list`,
    {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

/**
 * Block or unblock a user
 */
export async function blockUser(userId: string, action: 'block' | 'unblock'): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-block`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId, action })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to ' + action + ' user');
  }
}

/**
 * Update a user's profile
 */
export async function updateUser(userId: string, updates: any): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-update`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId, updates })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update user');
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-delete`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
}

/**
 * Manage subscription (pause, resume, cancel, change tier)
 */
export async function manageSubscription(
  userId: string,
  action: 'pause' | 'resume' | 'cancel' | 'change_tier',
  newTier?: string
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-subscription-manage`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId, action, new_tier: newTier })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to ${action} subscription`);
  }
}

/**
 * Pause a user's subscription
 */
export async function pauseSubscription(userId: string): Promise<void> {
  return manageSubscription(userId, 'pause');
}

/**
 * Resume a user's subscription
 */
export async function resumeSubscription(userId: string): Promise<void> {
  return manageSubscription(userId, 'resume');
}

/**
 * Cancel a user's subscription
 */
export async function cancelSubscription(userId: string): Promise<void> {
  return manageSubscription(userId, 'cancel');
}

/**
 * Change a user's subscription tier
 */
export async function changeSubscriptionTier(userId: string, newTier: string): Promise<void> {
  return manageSubscription(userId, 'change_tier', newTier);
}

/**
 * Manage campaign (pause, resume, delete, update)
 */
export async function manageCampaign(
  campaignId: string,
  action: 'pause' | 'resume' | 'delete' | 'update',
  updates?: any
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-campaign-manage`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ campaign_id: campaignId, action, updates })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to ${action} campaign`);
  }
}

/**
 * Manage prospects (bulk approve/reject, delete, update)
 */
export async function manageProspects(
  prospectIds: string | string[],
  action: 'bulk_approve' | 'bulk_reject' | 'delete' | 'update',
  updates?: any
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-prospect-manage`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prospect_ids: prospectIds, action, updates })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to ${action} prospect(s)`);
  }
}

/**
 * Get usage statistics
 */
export async function getUsageStats(): Promise<UsageStats[]> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-usage-stats`,
    {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch usage stats');
  }

  return response.json();
}

/**
 * Get audit log entries
 */
export async function getAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export const adminApi = {
  getPlatformStats,
  getUsers,
  blockUser,
  updateUser,
  deleteUser,
  manageSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  changeSubscriptionTier,
  manageCampaign,
  manageProspects,
  getUsageStats,
  getAuditLogs
};
