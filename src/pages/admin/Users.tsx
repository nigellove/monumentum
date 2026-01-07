import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import UserTable from '../../components/admin/UserTable';
import { adminApi } from '../../lib/admin/adminApi';

interface User {
  id: string;
  email: string;
  created_at: string;
  customer_id: string;
  business_name: string | null;
  business_email: string | null;
  subscription: {
    tier: string;
    status: string;
    current_period_end: string;
  } | null;
  blocked: boolean;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleBlockUser(userId: string, currentBlocked: boolean) {
    const action = currentBlocked ? 'unblock' : 'block';
    try {
      await adminApi.blockUser(userId, action);
      await loadUsers();
    } catch (err) {
      console.error('Error blocking/unblocking user:', err);
      alert('Failed to ' + action + ' user. Please try again.');
    }
  }

  async function handleDeleteUser(userId: string) {
    try {
      await adminApi.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. Please try again.');
    }
  }

  async function handlePauseSubscription(userId: string) {
    try {
      await adminApi.pauseSubscription(userId);
      await loadUsers();
    } catch (err) {
      console.error('Error pausing subscription:', err);
      alert('Failed to pause subscription. Please try again.');
    }
  }

  async function handleResumeSubscription(userId: string) {
    try {
      await adminApi.resumeSubscription(userId);
      await loadUsers();
    } catch (err) {
      console.error('Error resuming subscription:', err);
      alert('Failed to resume subscription. Please try again.');
    }
  }

  async function handleCancelSubscription(userId: string) {
    try {
      await adminApi.cancelSubscription(userId);
      await loadUsers();
    } catch (err) {
      console.error('Error canceling subscription:', err);
      alert('Failed to cancel subscription. Please try again.');
    }
  }

  async function handleChangeTier(userId: string, newTier: string) {
    try {
      await adminApi.changeSubscriptionTier(userId, newTier);
      await loadUsers();
    } catch (err) {
      console.error('Error changing tier:', err);
      alert('Failed to change tier. Please try again.');
    }
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={loadUsers}
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
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">View and manage user accounts</p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <UserTable
        users={users}
        loading={loading}
        onBlock={handleBlockUser}
        onDelete={handleDeleteUser}
        onPauseSubscription={handlePauseSubscription}
        onResumeSubscription={handleResumeSubscription}
        onCancelSubscription={handleCancelSubscription}
        onChangeTier={handleChangeTier}
        onRefresh={loadUsers}
      />
    </div>
  );
}
