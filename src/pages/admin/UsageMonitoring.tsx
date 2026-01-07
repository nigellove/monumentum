import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCw, Mail, Users, TrendingUp, Database } from 'lucide-react';
import { adminApi } from '../../lib/admin/adminApi';

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

export default function UsageMonitoring() {
  const [stats, setStats] = useState<UsageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUsageStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading usage stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load usage stats');
    } finally {
      setLoading(false);
    }
  }

  // Calculate totals
  const totals = stats.reduce((acc, stat) => ({
    emails_sent: acc.emails_sent + stat.emails_sent,
    emails_opened: acc.emails_opened + stat.emails_opened,
    emails_clicked: acc.emails_clicked + stat.emails_clicked,
    emails_replied: acc.emails_replied + stat.emails_replied,
    prospects_generated: acc.prospects_generated + stat.prospects_generated,
    prospects_approved: acc.prospects_approved + stat.prospects_approved,
  }), {
    emails_sent: 0,
    emails_opened: 0,
    emails_clicked: 0,
    emails_replied: 0,
    prospects_generated: 0,
    prospects_approved: 0,
  });

  const openRate = totals.emails_sent > 0 ? ((totals.emails_opened / totals.emails_sent) * 100).toFixed(1) : '0';
  const clickRate = totals.emails_sent > 0 ? ((totals.emails_clicked / totals.emails_sent) * 100).toFixed(1) : '0';
  const replyRate = totals.emails_sent > 0 ? ((totals.emails_replied / totals.emails_sent) * 100).toFixed(1) : '0';
  const approvalRate = totals.prospects_generated > 0 ? ((totals.prospects_approved / totals.prospects_generated) * 100).toFixed(1) : '0';

  // Prepare chart data
  const emailChartData = stats.map(stat => ({
    date: new Date(stat.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sent: stat.emails_sent,
    opened: stat.emails_opened,
    clicked: stat.emails_clicked,
    replied: stat.emails_replied,
  })).reverse();

  const prospectChartData = stats.map(stat => ({
    date: new Date(stat.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    generated: stat.prospects_generated,
    approved: stat.prospects_approved,
  })).reverse();

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-900">Usage Monitoring</h1>
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-600">Loading usage stats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-900">Usage Monitoring</h1>
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={loadStats}
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Usage Monitoring</h1>
          <p className="text-slate-600 mt-1">Track platform usage and resource consumption</p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Emails Sent</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totals.emails_sent.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">{openRate}% open rate</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Prospects Generated</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totals.prospects_generated.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">{approvalRate}% approved</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Click Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{clickRate}%</p>
              <p className="text-xs text-slate-500 mt-1">{totals.emails_clicked.toLocaleString()} clicks</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Reply Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{replyRate}%</p>
              <p className="text-xs text-slate-500 mt-1">{totals.emails_replied.toLocaleString()} replies</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Database className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Email Activity</h2>
          {emailChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emailChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} name="Sent" />
                <Line type="monotone" dataKey="opened" stroke="#10b981" strokeWidth={2} name="Opened" />
                <Line type="monotone" dataKey="clicked" stroke="#8b5cf6" strokeWidth={2} name="Clicked" />
                <Line type="monotone" dataKey="replied" stroke="#f59e0b" strokeWidth={2} name="Replied" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500">
              No email data available
            </div>
          )}
        </div>

        {/* Prospect Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Prospect Activity</h2>
          {prospectChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prospectChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="generated" fill="#3b82f6" name="Generated" />
                <Bar dataKey="approved" fill="#10b981" name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500">
              No prospect data available
            </div>
          )}
        </div>
      </div>

      {stats.length === 0 && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800">
            No usage data available yet. Data will appear once users start using the platform.
          </p>
        </div>
      )}
    </div>
  );
}
