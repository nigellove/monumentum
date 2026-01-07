import { Shield, Ban, Play, Trash2, MoreVertical, Pause, TrendingUp } from 'lucide-react';
import { useState } from 'react';

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

interface UserTableProps {
  users: User[];
  loading: boolean;
  onBlock: (userId: string, currentBlocked: boolean) => void;
  onDelete: (userId: string) => void;
  onPauseSubscription: (userId: string) => void;
  onResumeSubscription: (userId: string) => void;
  onCancelSubscription: (userId: string) => void;
  onChangeTier: (userId: string, newTier: string) => void;
  onRefresh: () => void;
}

export default function UserTable({
  users,
  loading,
  onBlock,
  onDelete,
  onPauseSubscription,
  onResumeSubscription,
  onCancelSubscription,
  onChangeTier,
  onRefresh
}: UserTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <p className="text-center text-slate-600">No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-slate-900">{user.email}</div>
                    <div className="text-sm text-slate-500">{user.customer_id}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-slate-900">
                      {user.business_name || 'N/A'}
                    </div>
                    {user.business_email && (
                      <div className="text-sm text-slate-500">{user.business_email}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.subscription ? (
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.subscription.tier === 'enterprise'
                          ? 'bg-purple-100 text-purple-800'
                          : user.subscription.tier === 'pro'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {user.subscription.tier}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">
                        {user.subscription.status}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">No subscription</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {user.blocked ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Ban className="w-3 h-3 mr-1" />
                      Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                      Actions
                    </button>

                    {openMenuId === user.id && (
                      <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          {/* User Actions */}
                          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                            User
                          </div>
                          <button
                            onClick={() => {
                              onBlock(user.id, user.blocked);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                          >
                            {user.blocked ? (
                              <>
                                <Play className="w-4 h-4" />
                                Unblock User
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4" />
                                Block User
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete user ${user.email}? This cannot be undone.`)) {
                                onDelete(user.id);
                              }
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete User
                          </button>

                          {/* Subscription Actions */}
                          {user.subscription && (
                            <>
                              <div className="border-t border-slate-200 my-1"></div>
                              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                                Subscription
                              </div>
                              {user.subscription.status === 'active' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Pause subscription for ${user.email}?`)) {
                                      onPauseSubscription(user.id);
                                    }
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                                >
                                  <Pause className="w-4 h-4" />
                                  Pause Subscription
                                </button>
                              )}
                              {user.subscription.status === 'paused' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Resume subscription for ${user.email}?`)) {
                                      onResumeSubscription(user.id);
                                    }
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                                >
                                  <Play className="w-4 h-4" />
                                  Resume Subscription
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm(`Cancel subscription for ${user.email}?`)) {
                                    onCancelSubscription(user.id);
                                  }
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Ban className="w-4 h-4" />
                                Cancel Subscription
                              </button>

                              <div className="border-t border-slate-200 my-1"></div>
                              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                                Change Tier
                              </div>
                              {['basic', 'pro', 'enterprise'].filter(tier => tier !== user.subscription?.tier).map(tier => (
                                <button
                                  key={tier}
                                  onClick={() => {
                                    if (confirm(`Change ${user.email} to ${tier} tier?`)) {
                                      onChangeTier(user.id, tier);
                                    }
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                                >
                                  <TrendingUp className="w-4 h-4" />
                                  Change to {tier}
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
