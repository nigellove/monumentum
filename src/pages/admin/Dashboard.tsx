import { useEffect, useState } from 'react';
import { Users, CheckCircle, DollarSign, Mail, Activity, Clock } from 'lucide-react';
import { adminApi } from '../../lib/admin/adminApi';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  emailsSent30d: number;
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

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);
      const [statsData, auditData] = await Promise.all([
        adminApi.getPlatformStats(),
        adminApi.getAuditLogs(10) // Get last 10 activities
      ]);
      setStats(statsData);
      setRecentActivity(auditData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600">Loading platform statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Platform Health</h1>
        <p className="text-slate-600 mt-1">Overview of key platform metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Subscriptions</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats?.activeSubscriptions || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ${stats?.monthlyRevenue || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Emails Sent (30d) */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Emails Sent (30d)</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats?.emailsSent30d || 0}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Mail className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
          </div>
          <a
            href="/admin/audit"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </a>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No recent activity to display
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div className="flex-shrink-0 mt-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      activity.action === 'block' ? 'bg-red-100 text-red-800' :
                      activity.action === 'unblock' ? 'bg-green-100 text-green-800' :
                      activity.action === 'view' ? 'bg-blue-100 text-blue-800' :
                      activity.action === 'delete' ? 'bg-red-100 text-red-800' :
                      activity.action === 'pause' ? 'bg-orange-100 text-orange-800' :
                      activity.action === 'resume' ? 'bg-green-100 text-green-800' :
                      activity.action === 'cancel' ? 'bg-red-100 text-red-800' :
                      activity.action === 'change_tier' ? 'bg-purple-100 text-purple-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {activity.action}
                    </span>
                    <span className="text-xs text-slate-500">{activity.resource_type}</span>
                  </div>
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">{activity.admin_email}</span>
                    {activity.metadata?.action_detail && (
                      <span className="text-slate-600"> - {activity.metadata.action_detail}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
