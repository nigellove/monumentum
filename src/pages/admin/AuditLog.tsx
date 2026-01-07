import { useEffect, useState } from 'react';
import { RefreshCw, Shield, User, FileText } from 'lucide-react';
import { adminApi } from '../../lib/admin/adminApi';

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

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getAuditLogs(50);
      setLogs(data);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'block': return 'bg-red-100 text-red-800';
      case 'unblock': return 'bg-green-100 text-green-800';
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'update': return 'bg-amber-100 text-amber-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'pause': return 'bg-orange-100 text-orange-800';
      case 'resume': return 'bg-green-100 text-green-800';
      case 'cancel': return 'bg-red-100 text-red-800';
      case 'change_tier': return 'bg-purple-100 text-purple-800';
      case 'bulk_approve': return 'bg-green-100 text-green-800';
      case 'bulk_reject': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'user': return User;
      case 'subscription': return Shield;
      case 'campaign': return FileText;
      case 'prospect': return User;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-900">Audit Trail</h1>
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-600">Loading audit logs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-900">Audit Trail</h1>
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={loadLogs}
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
          <h1 className="text-3xl font-bold text-slate-900">Audit Trail</h1>
          <p className="text-slate-600 mt-1">Track all admin actions and system changes</p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            No audit logs found
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {logs.map((log) => {
              const ResourceIcon = getResourceIcon(log.resource_type);
              return (
                <div key={log.id} className="p-6 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <ResourceIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="text-sm text-slate-600">
                          {log.resource_type}
                        </span>
                        {log.resource_id && (
                          <span className="text-xs text-slate-500 font-mono">
                            {log.resource_id.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-900 mb-1">
                        <span className="font-medium">{log.admin_email}</span>
                        {log.metadata?.target_email && (
                          <span className="text-slate-600">
                            {' '}→ {log.metadata.target_email}
                          </span>
                        )}
                      </p>
                      {log.metadata?.action_detail && (
                        <p className="text-sm text-slate-600 mb-2">
                          {log.metadata.action_detail}
                        </p>
                      )}
                      {log.metadata?.user_count && (
                        <p className="text-xs text-slate-500">
                          {log.metadata.user_count} users
                        </p>
                      )}
                      {log.metadata?.prospect_count && (
                        <p className="text-xs text-slate-500">
                          {log.metadata.prospect_count} prospects affected
                        </p>
                      )}
                      {log.changes && (
                        <details className="mt-2">
                          <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                            View changes
                          </summary>
                          <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
